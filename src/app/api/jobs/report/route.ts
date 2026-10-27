import {NextResponse} from 'next/server';
import {createHash,randomUUID} from 'node:crypto';
import {db} from '@/lib/employer-session';
import {reportReasons} from '@/lib/job-policy';
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return NextResponse.json({error:'Invalid origin'},{status:403});
 let b;try{b=await req.json();if(typeof b.id!=='string'||! /^[0-9a-f-]{36}$/i.test(b.id)||!reportReasons.includes(b.reason)||typeof b.details!=='string'||b.details.length>1000)throw Error()}catch{return NextResponse.json({error:'Select a reason and valid job'},{status:400})}
 const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();if(!ip)return NextResponse.json({error:'Unable to verify report source. Please contact support.'},{status:400});
 const hash=createHash('sha256').update((process.env.REPORT_HASH_SECRET||process.env.CRON_SECRET||'job-reports')+ip).digest('hex');const p=db(),c=await p.connect();
 try{await c.query('BEGIN');const job=await c.query("SELECT id,title,employer_id FROM ats_jobs WHERE id=$1 AND status='published' FOR UPDATE",[b.id]);if(!job.rowCount)return NextResponse.json({error:'Job is no longer published'},{status:404});
 await c.query('SELECT pg_advisory_xact_lock(hashtext($1))',[hash]);const recent=await c.query("SELECT COUNT(*)::int AS n FROM job_reports WHERE reporter_hash=$1 AND created_at>NOW()-INTERVAL '1 day'",[hash]);if(recent.rows[0].n>=3)return NextResponse.json({error:'Report limit reached. Please contact support.'},{status:429});
 await c.query('INSERT INTO job_reports(id,job_id,reporter_hash,reason,details) VALUES($1,$2,$3,$4,$5) ON CONFLICT(job_id,reporter_hash) DO NOTHING',[randomUUID(),b.id,hash,b.reason,b.details]);
 const tally=await c.query('SELECT COUNT(*)::int AS n FROM job_reports WHERE job_id=$1',[b.id]);const cfg=await c.query('SELECT report_threshold FROM platform_job_settings WHERE id=TRUE');
 if(tally.rows[0].n>=(cfg.rows[0]?.report_threshold||5)){await c.query("UPDATE ats_jobs SET status='draft' WHERE id=$1",[b.id]);await c.query("INSERT INTO platform_alerts(id,source_key,title,details) VALUES($1,$2,'Job automatically unpublished',$3) ON CONFLICT(source_key) DO NOTHING",[randomUUID(),'reported-job:'+b.id,job.rows[0].title+' was automatically unpublished after '+tally.rows[0].n+' distinct reports. Reference: '+b.id]);}
 await c.query('COMMIT');return NextResponse.json({ok:true,message:'Report recorded. Thank you for helping protect applicants.'});
 }catch{return NextResponse.json({error:'Unable to record report'},{status:503})}finally{await c.query('ROLLBACK').catch(()=>{});c.release();await p.end()}
}
