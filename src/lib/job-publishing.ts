import type {PoolClient,Pool} from 'pg';
import {randomUUID} from 'node:crypto';
import {screenJob,JobPolicyError} from './job-policy';
export async function publishJob(c:PoolClient,employer:string,id:string,input:Record<string,unknown>){
 const v=screenJob(input);
 await c.query('SELECT id FROM employer_accounts WHERE id=$1 FOR UPDATE',[employer]);
 const cfg=(await c.query('SELECT posts_per_day,report_threshold FROM platform_job_settings WHERE id=TRUE')).rows[0];
 const reports=await c.query('SELECT COUNT(*)::int AS n FROM job_reports WHERE job_id=$1',[id]);if(reports.rows[0].n>=(cfg?.report_threshold||5))throw new JobPolicyError('This posting was removed after reports. Contact support to resolve the reported issue before republishing.');
 const count=await c.query("SELECT COUNT(*)::int AS n FROM job_publication_events WHERE employer_id=$1 AND created_at>NOW()-INTERVAL '1 day'",[employer]);
 if(count.rows[0].n>=(cfg?.posts_per_day||10))throw new JobPolicyError('Daily publication limit reached; try again tomorrow');
 const duplicate=await c.query("SELECT id FROM ats_jobs WHERE employer_id=$1 AND fingerprint=$2 AND id<>$3 AND status IN ('published','draft')",[employer,v.fingerprint,id]);if(duplicate.rowCount)throw new JobPolicyError('This role has already been posted');
 await c.query(`UPDATE ats_jobs SET status='published',published_at=NOW(),expiry_days=$3,expires_at=NOW()+($3||' days')::interval,deadline=$4,fingerprint=$5,salary_min=$6,salary_max=$7,currency=$8,remote=$9 WHERE id=$1 AND employer_id=$2`,[id,employer,v.days,v.deadline,v.fingerprint,v.min,v.max,v.currency,v.remote]);
 await c.query('INSERT INTO job_publication_events(id,employer_id,job_id) VALUES($1,$2,$3)',[randomUUID(),employer,id]);
}
export async function expireJobs(p:Pool|PoolClient){
 await p.query("UPDATE ats_jobs SET status=CASE WHEN deadline<=NOW() THEN 'closed' ELSE 'expired' END WHERE status='published' AND (expires_at<=NOW() OR deadline<=NOW())");
 await p.query(`INSERT INTO workflow_alerts(employer_id,alert_key,title,details) SELECT employer_id,'job-expiry:'||id||':'||expires_at,'Job expires soon',title||' expires on '||expires_at FROM ats_jobs WHERE status='published' AND LEAST(expires_at,COALESCE(deadline,expires_at))<=NOW()+INTERVAL '3 days' ON CONFLICT DO NOTHING`);
}
