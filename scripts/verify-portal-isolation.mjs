import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {randomBytes,randomUUID,createHash} from 'node:crypto';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import pg from 'pg';
import {linkAllowed,workspaceHomes} from '../src/lib/portal-policy.ts';
const base=process.env.APP_BASE_URL||'http://localhost:3010',out='/tmp/aerotech-portal-audit';
assert.equal(new URL(base).hostname,'localhost');assert.ok(process.env.DATABASE_URL?.includes('localhost'));
await mkdir(out,{recursive:true});const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});
const browser=await chromium.launch(process.env.QA_CHROME?{executablePath:process.env.QA_CHROME,args:['--no-sandbox','--disable-dev-shm-usage']}:{});
const contexts=[],checks=[],issues=[];
async function session(role,id){const c=await browser.newContext({baseURL:base});contexts.push(c);const token=randomBytes(32).toString('hex');await pool.query(`INSERT INTO ${role==='admin'?'support':role}_sessions(token_hash,${role==='admin'?'agent':role}_id,expires_at) VALUES($1,$2,NOW()+INTERVAL '1 hour')`,[createHash('sha256').update(token).digest('hex'),id]);await c.addCookies([{name:'aerotech_'+(role==='admin'?'support':role)+'_session',value:token,url:base,httpOnly:true,sameSite:'Lax'}]);return c}
try{
 const company=(await pool.query("SELECT id FROM employer_accounts WHERE company_email='owner-fixture@example.invalid'")).rows[0].id;
 const employee=(await pool.query('SELECT id FROM workforce_employees WHERE employer_id=$1 ORDER BY created_at LIMIT 1',[company])).rows[0].id;
 const applicant=(await pool.query('SELECT id FROM applicant_accounts LIMIT 1')).rows[0].id;
 const admin=(await pool.query('SELECT id FROM support_agents WHERE is_super_admin=TRUE LIMIT 1')).rows[0]?.id;
 assert.ok(admin,'Seeded disposable admin required');
 const ids={employer:company,employee,applicant,admin};
 for(const role of Object.keys(ids)){
  const c=await session(role,ids[role]),page=await c.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const home=workspaceHomes[role];
  for(const other of Object.keys(ids).filter(r=>r!==role)){const r=await c.request.get(workspaceHomes[other],{maxRedirects:0});assert.equal(r.status(),403,role+' typed '+other+' URL')}
  if(role!=='admin')for(const method of ['get','post']){const r=await c.request[method]('/api/vacancy-approvals',{data:method==='post'?{id:randomUUID(),decision:'approved',note:'Denied request'}:undefined,headers:{Origin:base}});assert.equal(r.status(),403,role+' approval '+method)}
  else assert.equal((await c.request.get('/api/vacancy-approvals')).status(),200);
  const routes=[home,home+'/support',...(role==='employer'?[home+'/billing/plans',home+'/employees',home+'/recruitment']:role==='employee'?[home+'/profile',home+'/attendance']:role==='applicant'?[home+'/opportunities',home+'/applications']:[home+'/vacancy-approvals',home+'/support-cases'])];
  for(const width of [360,768,1280,1920])for(const path of routes){
   await page.setViewportSize({width,height:1000});const r=await page.goto(path,{waitUntil:'networkidle'});assert.equal(r.status(),200,path);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,path+' overflow '+width);
   const links=await page.locator('a[href]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
   for(const href of links){if(href.startsWith('mailto:')||href.startsWith('tel:')||href.startsWith('/api/'))continue;assert.ok(linkAllowed(role,href),path+' escapes to '+href);if(path.endsWith('/support')&&!href.startsWith('#'))assert.equal(href,home,'Support has only one dashboard exit')}
   assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/);
   if(!path.endsWith('/support')){assert.equal(await page.getByRole('link',{name:'Aerotech home'}).getAttribute('href'),home);if(width===360){const open=page.getByRole('button',{name:'Open navigation',exact:true});await open.click();await page.getByRole('navigation',{name:'Workspace navigation'}).waitFor();await page.keyboard.press('Escape');assert.equal(await open.getAttribute('aria-expanded'),'false')}}
   if(role==='employee')assert.equal(await page.getByRole('link',{name:/vacancy approvals/i}).count(),0);
   if(width===1280){const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();const significant=axe.violations.filter(v=>v.impact==='critical'||v.impact==='serious');if(significant.length)issues.push({path,role,violations:significant.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});await page.screenshot({path:out+'/'+role+'-'+path.replace(/\W/g,'_')+'.png',fullPage:true})}
   checks.push({role,path,width,status:r.status(),links:links.length});
  }
  assert.deepEqual(errors,[],role+' runtime errors');
 }
 // Ticket creation stays on the same self-contained page and is scoped to its requester.
 const employeeContext=contexts[1],ticketPage=await employeeContext.newPage();await ticketPage.goto('/employee/support');await ticketPage.getByLabel('Subject',{exact:true}).fill('Disposable isolation ticket');await ticketPage.getByLabel('How can we help?',{exact:true}).fill('Local test only: verify ticket creation and confirmation.');await ticketPage.getByRole('button',{name:'Open ticket',exact:true}).click();await ticketPage.getByRole('status').filter({hasText:'Saved. You can follow replies here.'}).waitFor();await ticketPage.getByRole('heading',{name:'Disposable isolation ticket · open'}).waitFor();assert.equal(new URL(ticketPage.url()).pathname,'/employee/support');
 // Account-scoped counters are durable; do not exercise with a real user account.
 const anonymous=await browser.newContext({baseURL:base});contexts.push(anonymous);const email='rate-'+randomUUID()+'@example.invalid';for(let i=0;i<11;i++){const r=await anonymous.request.post('/api/auth/login/employer',{data:{email,password:randomBytes(16).toString('hex')},headers:{Origin:base}});assert.equal(r.status(),i<10?401:429)}
 await writeFile(out+'/isolation.json',JSON.stringify({checks,issues},null,2));assert.deepEqual(issues,[],'Critical/serious axe violations');console.log('PASS portal guards, API RBAC, links, logos, support isolation, 360–1920 layouts, tickets, noindex and auth throttling: '+checks.length+' route-width checks');
}finally{await Promise.all(contexts.map(c=>c.close()));await browser.close();await pool.end()}
