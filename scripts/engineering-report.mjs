import {writeFileSync} from 'node:fs';
export function shouldSend(enabled,critical=false){return enabled==='true'||critical;}
export function recipientAllowed(value){return value==='drewhlly@gmail.com';}
export function safeRefs(items,repo){return items.map(x=>`- https://github.com/${repo}/${x.pull_request?'pull':'issues'}/${Number(x.number)}`).join('\n')||'- None';}
async function main(){
 const env=process.env,repo=env.GITHUB_REPOSITORY;
 if(repo!=='drewhlly/Aerotech')throw Error('Unexpected report repository');
 const critical=env.REPORT_CRITICAL==='true';
 if(!shouldSend(env.REPORTS_ENABLED,critical)){console.log('Report suppressed by REPORTS_ENABLED');return;}
 if(!recipientAllowed(env.REPORT_RECIPIENT)||!env.RESEND_API_KEY||!env.REPORT_FROM_EMAIL)throw Error('Report configuration incomplete or recipient not allowed');
 async function gh(path){
  const r=await fetch('https://api.github.com/repos/'+repo+path,{headers:{Authorization:'Bearer '+env.GH_TOKEN,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(20000)});
  if(!r.ok)return {unverified:true,status:r.status};return r.json();
 }
 const prs=await gh('/pulls?state=open&per_page=100'),issues=await gh('/issues?state=open&per_page=100'),runs=await gh('/actions/runs?branch=main&per_page=20'),alerts=await gh('/dependabot/alerts?state=open&per_page=100');
 const needs=Array.isArray(prs)?prs.filter(x=>x.labels.some(l=>l.name==='needs-approval')):[];
 const severity={critical:0,high:0,medium:0,low:0,unclassified:0};
 if(Array.isArray(issues))for(const x of issues.filter(x=>!x.pull_request)){const k=Object.keys(severity).find(k=>x.labels.some(l=>l.name.toLowerCase()===k));severity[k||'unclassified']++;}
 const summary=[critical?'Aerotech Critical alert':'Aerotech daily engineering report',new Date().toISOString(),
 'Overall: activation incomplete; consult docs/ISSUES.md and LAUNCH_READINESS.md.',
 'Deployments: Cloudflare and Vercel live status not verified by this report. GitHub deployment status is not business acceptance.',
 'Merged in last 24 hours: '+(Array.isArray(prs)?'See repository merged PR search; not independently collected.':'Not verified.'),
 'Awaiting approval:',safeRefs(needs.map(x=>({...x,pull_request:true})),repo),
 'Issues by severity: '+JSON.stringify(severity),
 'Dependency findings: '+(Array.isArray(alerts)?alerts.length:'Not verified (permissions).'),
 'Security findings: not verified; a missing API response is not a clean scan.',
 'Recent main workflow evidence:',...(runs.workflow_runs||[]).slice(0,10).map(x=>`- ${x.html_url} : ${x.conclusion||x.status}`),
 'Payroll: existing statutory examples are executed by CI; full-year/joiner/leaver coverage and accountant review remain unverified.',
 'Module health: attendance, meetings, demo centre and feedback form need signed-in acceptance; not verified by a green build.',
 'Top actions: restore backup verification; verify branch protection and secrets; complete payroll and portal acceptance.'
 ].join('\n');
 writeFileSync('engineering-report.txt',summary+'\n');
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'aerotech-report-'+env.GITHUB_RUN_ID+'-'+(env.GITHUB_RUN_ATTEMPT||'1')},body:JSON.stringify({from:env.REPORT_FROM_EMAIL,to:[env.REPORT_RECIPIENT],subject:critical?'Aerotech Critical engineering alert':'Aerotech daily engineering report',text:summary}),signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error('Report send rejected (HTTP '+response.status+')');
 const {id}=await response.json();if(typeof id!=='string'||!/^[-a-zA-Z0-9]+$/.test(id))throw Error('Report send response invalid');
 console.log('Report accepted; delivery is not yet confirmed.');
 const delivery=await fetch('https://api.resend.com/emails/'+id,{headers:{Authorization:'Bearer '+env.RESEND_API_KEY},signal:AbortSignal.timeout(20000)});
 let state='not verified';if(delivery.ok){const d=await delivery.json();if(['sent','delivered','bounced','complained','delivery_delayed'].includes(d.last_event))state=d.last_event;}
 writeFileSync('engineering-delivery.json',JSON.stringify({accepted:true,delivery:state}));
 console.log(state==='delivered'?'Provider reports delivered (inbox/spam placement unverified).':'Delivery not confirmed; inspect the Resend dashboard.');
}
if(import.meta.url===`file://${process.argv[1]}`)main().catch(()=>{console.error('Engineering report failed. Inspect configuration and provider status; secret response bodies are suppressed.');process.exitCode=1;});
