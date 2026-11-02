// Disposable PostgreSQL and mocked provider only. No real recipients or production writes.
import {mock} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {parseAnnouncement,parsePreferences} from '../src/lib/communication-policy.ts';
import {enqueueCommunications,runCommunicationJobs} from '../src/lib/communication-worker.ts';
const database=new PGlite();
const query=async(sql,args=[])=>{const r=await database.query(sql,args);return {...r,rowCount:r.rows.length||r.affectedRows||0}};
class Pool{query=query;async connect(){return {query,release(){}}}async end(){}}
const employer=randomUUID(),other=randomUUID(),applicant=randomUUID(),unsubscribed=randomUUID(),employee=randomUUID(),admin=randomUUID();
let actor={role:'applicant',id:applicant},isAdmin=false;
mock.module('../src/lib/employer-session.ts',{namedExports:{db:()=>new Pool()}});
mock.module('../src/lib/privacy-actor.ts',{namedExports:{privacyActor:async()=>actor}});
mock.module('../src/lib/super-admin.ts',{namedExports:{superAdmin:async()=>isAdmin?{id:admin}:null}});
for(const m of readFileSync('scripts/migrate.mjs','utf8').matchAll(/"(\d{3}_[^"]+\.sql)"/g))await database.exec(readFileSync('database/'+m[1],'utf8'));
for(const id of [employer,other])await query("INSERT INTO employer_accounts(id,company_name,company_email,admin_first_name,admin_last_name,phone,country,password_hash) VALUES($1,'Test Company',$2,'Test','Owner','000','Nigeria','test')",[id,id+'@example.invalid']);
for(const id of [applicant,unsubscribed])await query("INSERT INTO applicant_accounts(id,first_name,last_name,email,phone,password_hash) VALUES($1,'Test','Applicant',$2,'000','test')",[id,id+'@example.invalid']);
await query("INSERT INTO workforce_employees(id,employer_id,employee_number,first_name,last_name,email,job_title,department,location,employment_status) VALUES($1,$2,'TEST','Test','Staff','staff@example.invalid','HR','HR','Lagos','active')",[employee,employer]);
await query("INSERT INTO support_agents(id,email,display_name,password_hash,totp_encrypted,is_super_admin) VALUES($1,'admin@example.invalid','Test Admin','test','fixture',TRUE)",[admin]);
const prefs=await import('../src/app/api/communications/preferences/route.ts');
const announcements=await import('../src/app/api/communications/announcements/route.ts');
const unsubscribe=await import('../src/app/api/communications/unsubscribe/route.ts');
const req=(b,method='PUT',url='https://example.invalid/api/communications/preferences')=>new Request(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
try{
 assert.equal((await (await prefs.GET()).json()).preferences.newsletter,false);
 actor=null;assert.equal((await prefs.GET()).status,401);assert.equal((await prefs.PUT(req({}))).status,401);actor={role:'applicant',id:applicant};
 assert.throws(()=>parsePreferences({job_alerts:'true'},'applicant'));
 assert.throws(()=>parseAnnouncement({kind:'maintenance',audience:'employer',title:'Test notice',body:'A maintenance message for testing.',scheduled_for:new Date(Date.now()+3600000).toISOString(),starts_at:new Date(Date.now()+7200000).toISOString()}));
 assert.equal((await prefs.PUT(req({job_alerts:true,newsletter:true,product_updates:true,company_ids:[employer],account_id:unsubscribed}))).status,200);
 assert.equal((await query('SELECT COUNT(*)::int AS n FROM communication_preferences WHERE account_id=$1',[unsubscribed])).rows[0].n,0);
 await query("UPDATE communication_preferences SET job_alerts_since=NOW()-INTERVAL '1 day'");
 const jobs={};for(const label of ['live','other','expired','old']){const id=jobs[label]=randomUUID();await query("INSERT INTO ats_jobs(id,employer_id,title,department,location,country,employment_type,description,status,published_at,expires_at) VALUES($1,$2,$3,'HR','Lagos','Nigeria','Full-time','Test role','published',NOW(),NOW()+INTERVAL '1 day')",[id,label==='other'?other:employer,label]);}
 await query("UPDATE ats_jobs SET expires_at=NOW()-INTERVAL '1 hour' WHERE id=$1",[jobs.expired]);await query("UPDATE ats_jobs SET published_at=NOW()-INTERVAL '3 days' WHERE id=$1",[jobs.old]);
 await enqueueCommunications(new Pool());await enqueueCommunications(new Pool());
 assert.deepEqual((await query('SELECT job_id FROM communication_deliveries')).rows.map(r=>r.job_id),[jobs.live]);
 assert.equal((await announcements.GET()).status,403);assert.equal((await announcements.POST(req({},'POST'))).status,403);isAdmin=true;
 const notice=await announcements.POST(req({kind:'maintenance',audience:'employer',title:'Maintenance notice',body:'Maintenance is planned. Please save your work before the scheduled time.',scheduled_for:new Date(Date.now()+3600000).toISOString(),starts_at:new Date(Date.now()+172800000).toISOString()},'POST'));assert.equal(notice.status,201);const noticeId=(await notice.json()).id;
 await query("UPDATE platform_announcements SET scheduled_for=NOW()-INTERVAL '1 minute' WHERE id=$1",[noticeId]);
 await enqueueCommunications(new Pool());assert.equal((await query("SELECT COUNT(*)::int AS n FROM communication_deliveries WHERE category='service'")).rows[0].n,2);
 // Unsubscribe before dispatch cancels the queued job; essential notices remain eligible.
 const token=(await query('SELECT unsubscribe_token FROM communication_preferences WHERE account_id=$1',[applicant])).rows[0].unsubscribe_token;
 assert.equal((await unsubscribe.POST(new Request('https://example.invalid/api/communications/unsubscribe?token='+token,{method:'POST'}))).status,200);
 const sent=[];const originalFetch=globalThis.fetch;globalThis.fetch=async(url,init)=>{sent.push({url,...JSON.parse(init.body),key:init.headers['Idempotency-Key']});return Response.json({id:'provider-test-'+sent.length})};
 process.env.RESEND_API_KEY='mock';process.env.INVITATION_FROM_EMAIL='test@example.invalid';
 const result=await runCommunicationJobs(new Pool());assert.equal(result.processed,2);assert.equal(result.failed,0);assert.equal(sent.length,2);assert.ok(sent.every(r=>!r.headers));assert.equal((await query('SELECT status FROM communication_deliveries WHERE job_id=$1',[jobs.live])).rows[0].status,'cancelled');
 assert.equal((await runCommunicationJobs(new Pool())).processed,0);
 // Newsletter remains opted-in only and includes a signed-in-independent unsubscribe path.
 actor={role:'applicant',id:applicant};await prefs.PUT(req({job_alerts:false,newsletter:true,product_updates:false,company_ids:[]}));
 const news=await announcements.POST(req({kind:'newsletter',audience:'all',title:'Aerotech newsletter',body:'A useful newsletter for the people who opted in to receive it.',scheduled_for:new Date(Date.now()+3600000).toISOString()},'POST'));const newsId=(await news.json()).id;await query("UPDATE platform_announcements SET scheduled_for=NOW()-INTERVAL '1 minute' WHERE id=$1",[newsId]);
 await enqueueCommunications(new Pool());assert.equal((await query('SELECT COUNT(*)::int AS n FROM communication_deliveries WHERE announcement_id=$1',[newsId])).rows[0].n,1);
 globalThis.fetch=async()=>{throw Error('mock provider timeout')};assert.equal((await runCommunicationJobs(new Pool())).failed,1);
 const delivery=(await query('SELECT id FROM communication_deliveries WHERE announcement_id=$1',[newsId])).rows[0];await query('UPDATE communication_deliveries SET next_attempt_at=NOW() WHERE id=$1',[delivery.id]);
 globalThis.fetch=async(url,init)=>{sent.push({url,...JSON.parse(init.body),key:init.headers['Idempotency-Key']});return Response.json({id:'retry-provider-id'})};assert.equal((await runCommunicationJobs(new Pool())).processed,1);assert.equal(sent.at(-1).key,'aerotech-communications-'+delivery.id);assert.ok(sent.at(-1).text.includes('/email-preferences?token='));assert.equal(sent.at(-1).headers['List-Unsubscribe-Post'],'List-Unsubscribe=One-Click');
 globalThis.fetch=originalFetch;
 console.log('PASS: consent, company filtering, no backfill, duplicate prevention, role isolation, 24h notice validation, essential notices, unsubscribe suppression, retry and provider acknowledgement.');
}finally{await database.close()}
