import type {Pool,PoolClient} from 'pg';
type Connection=Pool|PoolClient;
// No retroactive campaigns: job alerts begin at explicit opt-in and only cover live recent jobs.
export async function enqueueCommunications(p:Connection) {
 await p.query(`INSERT INTO communication_deliveries(id,role,account_id,event_key,category,job_id,subject,body)
 SELECT gen_random_uuid(),'applicant',a.id,'job:'||j.id,'job',j.id,
 'New role: '||j.title||' at '||e.company_name,
 e.company_name||' has published '||j.title||E'\nLocation: '||j.location||E'\n\nSign in to review the job and apply: https://aerotechhr.app/applicant/opportunities/'||j.id
 FROM communication_preferences p JOIN applicant_accounts a ON a.id=p.account_id AND p.role='applicant'
 JOIN ats_jobs j ON j.status='published' AND j.published_at>=p.job_alerts_since AND j.published_at>NOW()-INTERVAL '7 days' AND j.expires_at>NOW() AND (j.deadline IS NULL OR j.deadline>NOW())
 JOIN employer_accounts e ON e.id=j.employer_id
 WHERE p.job_alerts AND (cardinality(p.company_ids)=0 OR j.employer_id=ANY(p.company_ids))
 AND NOT EXISTS(SELECT 1 FROM communication_deliveries d WHERE d.role='applicant' AND d.account_id=a.id AND d.event_key='job:'||j.id)
 ORDER BY j.published_at,a.id LIMIT 500 ON CONFLICT DO NOTHING`);
 await p.query(`WITH accounts AS (
 SELECT 'employer' AS role,id,created_at FROM employer_accounts UNION ALL
 SELECT 'applicant',id,created_at FROM applicant_accounts UNION ALL
 SELECT 'employee',id,created_at FROM workforce_employees WHERE employment_status IN ('active','probation','on_leave'))
 INSERT INTO communication_deliveries(id,role,account_id,event_key,category,announcement_id,subject,body)
 SELECT gen_random_uuid(),a.role,a.id,'announcement:'||n.id,
 CASE WHEN n.kind IN ('maintenance','upgrade') THEN 'service' WHEN n.kind='newsletter' THEN 'newsletter' ELSE 'product' END,
 n.id,n.title,n.body||CASE WHEN n.starts_at IS NOT NULL THEN E'\n\nScheduled start (UTC): '||to_char(n.starts_at AT TIME ZONE 'UTC','YYYY-MM-DD HH24:MI') ELSE '' END
 FROM platform_announcements n JOIN accounts a ON (n.audience='all' OR n.audience=a.role) AND a.created_at<=n.created_at
 LEFT JOIN communication_preferences p ON p.role=a.role AND p.account_id=a.id
 WHERE n.cancelled_at IS NULL AND n.scheduled_for<=NOW() AND n.scheduled_for>NOW()-INTERVAL '7 days'
 AND (n.starts_at IS NULL OR n.starts_at>NOW())
 AND ((n.kind IN ('maintenance','upgrade') AND a.role='employer') OR (n.kind='newsletter' AND p.newsletter) OR (n.kind='experience' AND p.product_updates))
 AND NOT EXISTS(SELECT 1 FROM communication_deliveries d WHERE d.role=a.role AND d.account_id=a.id AND d.event_key='announcement:'||n.id)
 ORDER BY n.scheduled_for,a.id LIMIT 500 ON CONFLICT DO NOTHING`);
}
export async function sendCommunication(to:string,subject:string,body:string,key:string,unsubscribe?:string) {
 const apiKey=process.env.RESEND_API_KEY,from=process.env.INVITATION_FROM_EMAIL;
 if(!apiKey||!from)throw Error('Email sender unavailable');
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({from,to:[to],subject,text:body+'\n\nAerotech Team'+(unsubscribe?'\n\nStop optional Aerotech emails: '+unsubscribe:''),...(unsubscribe?{headers:{'List-Unsubscribe':`<${unsubscribe.replace('/email-preferences?','/api/communications/unsubscribe?')}>`,'List-Unsubscribe-Post':'List-Unsubscribe=One-Click'}}:{})}),signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw Error('Email provider rejected message');
 const result=await response.json();if(typeof result.id!=='string')throw Error('Email provider did not acknowledge message');return result.id as string;
}
export async function runCommunicationJobs(p:Pool) {
 // Serialize fanout and dispatch across overlapping cron requests. Bound each run to 35 seconds.
 const c=await p.connect();let locked=false;
 try {
  locked=(await c.query("SELECT pg_try_advisory_lock(hashtext('aerotech-communications')) AS locked")).rows[0].locked;
  if(!locked)return {processed:0,failed:0,skipped:true};
  await enqueueCommunications(c);
  if(!process.env.RESEND_API_KEY||!process.env.INVITATION_FROM_EMAIL)return {processed:0,failed:0,configured:false};
  // A provider idempotency key lasts 24h. Stop ambiguous retries before that window expires.
  await c.query("UPDATE communication_deliveries SET status='failed' WHERE status IN ('pending','sending') AND attempts>0 AND (created_at<NOW()-INTERVAL '23 hours' OR attempts>=6)");
  const due=await c.query("SELECT * FROM communication_deliveries WHERE status IN ('pending','sending') AND next_attempt_at<=NOW() ORDER BY created_at LIMIT 20");
  let processed=0,failed=0;const deadline=Date.now()+35000;
  for(const d of due.rows) {
   if(Date.now()>deadline)break;
   const recipients=await c.query(`SELECT email FROM (SELECT 'applicant' AS role,id,email FROM applicant_accounts UNION ALL SELECT 'employer',id,company_email FROM employer_accounts UNION ALL SELECT 'employee',id,email FROM workforce_employees WHERE employment_status IN ('active','probation','on_leave')) a WHERE role=$1 AND id=$2`,[d.role,d.account_id]);
   const prefs=(await c.query('SELECT * FROM communication_preferences WHERE role=$1 AND account_id=$2',[d.role,d.account_id])).rows[0];
   let eligible=!!recipients.rows[0]?.email;
   if(d.category!=='service')eligible=eligible&&!!prefs?.[d.category==='job'?'job_alerts':d.category==='newsletter'?'newsletter':'product_updates'];
   if(d.job_id){const job=(await c.query("SELECT employer_id FROM ats_jobs WHERE id=$1 AND status='published' AND expires_at>NOW() AND (deadline IS NULL OR deadline>NOW())",[d.job_id])).rows[0];eligible=eligible&&!!job&&(!prefs?.company_ids.length||prefs.company_ids.includes(job.employer_id));}
   if(d.announcement_id){const a=(await c.query('SELECT cancelled_at,starts_at FROM platform_announcements WHERE id=$1',[d.announcement_id])).rows[0];eligible=eligible&&!!a&&!a.cancelled_at&&(!a.starts_at||new Date(a.starts_at).getTime()>Date.now());}
   if(!eligible){await c.query("UPDATE communication_deliveries SET status='cancelled' WHERE id=$1",[d.id]);continue;}
   await c.query("UPDATE communication_deliveries SET status='sending',attempts=attempts+1,next_attempt_at=NOW()+INTERVAL '15 minutes' WHERE id=$1",[d.id]);
   try {
    const unsubscribe=d.category!=='service'?'https://aerotechhr.app/email-preferences?token='+prefs.unsubscribe_token:undefined;
    const id=await sendCommunication(recipients.rows[0].email,d.subject,d.body,'aerotech-communications-'+d.id,unsubscribe);
    await c.query("UPDATE communication_deliveries SET status='accepted',accepted_at=NOW(),provider_id=$2 WHERE id=$1",[d.id,id]);processed++;
   }catch{failed++;await c.query("UPDATE communication_deliveries SET status='pending' WHERE id=$1",[d.id]);}
  }
  return {processed,failed,configured:true};
 }finally{if(locked)await c.query("SELECT pg_advisory_unlock(hashtext('aerotech-communications'))").catch(()=>{});c.release();}
}
