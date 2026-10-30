// Disposable in-memory PostgreSQL only; no production writes or email delivery.
import {mock} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {eventVisible,meetingEnd} from '../src/lib/event-display.ts';
const database=new PGlite();
const query=async(sql,args=[])=>{const r=await database.query(sql,args);return {...r,rowCount:r.rows.length||r.affectedRows||0}};
class Pool{query=query;async connect(){return {query,release(){}}}async end(){}}
const tenant=randomUUID(),other=randomUUID(),employee=randomUUID(),applicant=randomUUID();
let role='employer';
mock.module('../src/lib/employer-session.ts',{namedExports:{db:()=>new Pool(),currentEmployer:async()=>role==='employer'?tenant:null}});
mock.module('../src/lib/employee-auth.ts',{namedExports:{currentEmployee:async()=>role==='employee'?{id:employee,employer_id:tenant,department:'HR'}:null}});
mock.module('../src/lib/applicant-session.ts',{namedExports:{currentApplicant:async()=>role==='applicant'?applicant:null}});
mock.module('../src/lib/privacy-actor.ts',{namedExports:{privacyActor:async()=>role==='employer'?{id:tenant,role}:role==='employee'?{id:employee,employer:tenant,role}:null}});
mock.module('../src/lib/workflow-automation.ts',{namedExports:{enrollWorkflows:async()=>{}}});
mock.module('../src/lib/payslip-notifications.ts',{namedExports:{syncPayslipNotifications:async()=>{}}});
for(const match of readFileSync('scripts/migrate.mjs','utf8').matchAll(/"(\d{3}_[^"]+\.sql)"/g))await database.exec(readFileSync('database/'+match[1],'utf8'));
for(const [id,name]of [[tenant,'Test'],[other,'Other']])await query("INSERT INTO employer_accounts(id,company_name,company_email,admin_first_name,admin_last_name,phone,country,password_hash) VALUES($1,$2,$3,'Test','Owner','000','Nigeria','disposable')",[id,name,id+'@example.invalid']);
await query("INSERT INTO workforce_employees(id,employer_id,employee_number,first_name,last_name,email,job_title,department,location,employment_status,date_of_birth) VALUES($1,$2,'TEST','Demo','Person','staff@example.invalid','HR','HR','Office','active',((NOW() AT TIME ZONE 'Africa/Lagos')::date-INTERVAL '25 years'))",[employee,tenant]);
const ids={};
for(const [label,start,status,revoke,owner]of [
 ['future',"NOW()+INTERVAL '1 hour'",'scheduled',false,tenant],
 ['ongoing',"NOW()-INTERVAL '5 minutes'",'scheduled',false,tenant],
 ['past',"NOW()-INTERVAL '2 hours'",'scheduled',false,tenant],
 ['cancelled',"NOW()+INTERVAL '1 hour'",'cancelled',false,tenant],
 ['ended',"NOW()+INTERVAL '1 hour'",'ended',false,tenant],
 ['revoked',"NOW()+INTERVAL '1 hour'",'scheduled',true,tenant],
 ['foreign',"NOW()+INTERVAL '1 hour'",'scheduled',false,other]
]){
 const id=ids[label]=randomUUID();
 await query(`INSERT INTO meet_rooms(id,employer_id,title,starts_at,duration_minutes,status,revoked_at) VALUES($1,$2,$3,${start},60,$4,${revoke?'NOW()':'NULL'})`,[id,owner,label,status]);
 if(owner===tenant)await query('INSERT INTO meet_participants(employer_id,room_id,employee_id) VALUES($1,$2,$3)',[tenant,id,employee]);
 for(const actor of ['employer:'+tenant,'employee:'+employee])await query("INSERT INTO collaboration_notifications(employer_id,actor,event,title,body,href,source_key) VALUES($1,$2,'meeting',$3,'Invitation',$4,$5)",[owner,actor,label,'/employee/meet/'+id,label+actor]);
}
// Old notices with no expiry must still disappear, and future unrelated notices remain.
await query("INSERT INTO workflow_alerts(employer_id,alert_key,title,details,created_at) VALUES($1,'legacy-birthday','Birthday tomorrow','Old birthday',NOW()-INTERVAL '3 days'),($1,'keep','Review required','Still needs attention',NOW())",[tenant]);
await query("INSERT INTO employee_notifications(id,employer_id,employee_id,title,body,created_at) VALUES($1,$2,$3,'Happy birthday','Old birthday',NOW()-INTERVAL '3 days'),($4,$2,$3,'Keep this','Action remains due',NOW())",[randomUUID(),tenant,employee,randomUUID()]);
await query("INSERT INTO applicant_accounts(id,first_name,last_name,email,phone,password_hash) VALUES($1,'Demo','Applicant','applicant@example.invalid','000','disposable')",[applicant]);
for(const label of ['future','past']){
 const job=randomUUID();
 await query("INSERT INTO ats_jobs(id,employer_id,title,department,location,country,employment_type,description,status,expires_at) VALUES($1,$2,$3,'HR','Lagos','Nigeria','Full-time','Disposable fixture','published',NOW()+INTERVAL '1 day')",[job,tenant,label]);
 await query("INSERT INTO ats_applications(id,job_id,applicant_id,stage,cv_text,interview_room_id) VALUES($1,$2,$3,'interview','Disposable fixture',$4)",[randomUUID(),job,applicant,ids[label]]);
 await query("INSERT INTO workflow_alerts(employer_id,alert_key,title,details) VALUES($1,$2,'Job expires soon','Disposable reminder')",[tenant,'job-expiry:'+job+':fixture']);
 if(label==='past')await query("UPDATE ats_jobs SET status='closed' WHERE id=$1",[job]);
}
const meetings=await import('../src/app/api/meet/route.ts');
const notices=await import('../src/app/api/collaboration/notifications/route.ts');
const alerts=await import('../src/app/api/employer/alerts/route.ts');
const employeeNotices=await import('../src/app/api/employee/notifications/route.ts');
const attention=await import('../src/app/api/workspace/attention/route.ts');
const birthdays=await import('../src/app/api/hr/birthdays/route.ts');
const req=(query='')=>new Request('https://app.example.invalid/api/test'+query);
try{
 for(const current of ['employer','employee']){
  role=current;
  const active=await (await meetings.GET(req())).json();assert.deepEqual(active.meetings.map(m=>m.title).sort(),['future','ongoing']);
  const history=await (await meetings.GET(req('?history=1'))).json();assert.deepEqual(history.meetings.map(m=>m.title).sort(),['cancelled','ended','past','revoked']);
  let inbox=await (await notices.GET(req())).json();assert.deepEqual(inbox.records.map(n=>n.title).sort(),['future','ongoing']);assert.equal(inbox.unread,2);assert.ok(inbox.nextExpiry);assert.ok(inbox.records.every(n=>n.expires_at));
  assert.equal((await (await notices.GET(req('?history=1'))).json()).records.length,4);
  const widgets=await (await attention.GET()).json();assert.deepEqual(widgets.meetings.map(m=>m.title).sort(),['future','ongoing']);
 }
 role='employer';assert.deepEqual((await (await alerts.GET(req())).json()).notifications.map(n=>n.title).sort(),['Job expires soon','Review required']);
 assert.deepEqual((await (await alerts.GET(req('?history=1'))).json()).notifications.map(n=>n.title).sort(),['Birthday tomorrow','Job expires soon']);
 role='employee';assert.deepEqual((await (await employeeNotices.GET(req())).json()).notifications.map(n=>n.title),['Keep this']);
 assert.equal((await (await employeeNotices.GET(req('?history=1'))).json()).notifications[0].title,'Happy birthday');
 assert.deepEqual((await (await attention.GET()).json()).announcements.map(n=>n.title),['Keep this']);
 role='applicant';assert.deepEqual((await (await meetings.GET(req())).json()).meetings.map(m=>m.title),['future']);assert.deepEqual((await (await meetings.GET(req('?history=1'))).json()).meetings.map(m=>m.title),['past']);role='employee';
 // Meeting reschedules use the current meeting, not stale notification timestamps.
 await query("UPDATE collaboration_notifications SET expires_at=NOW()-INTERVAL '1 day' WHERE title='future'");
 assert.equal((await (await notices.GET(req())).json()).unread,2);
 await query("UPDATE meet_rooms SET status='cancelled' WHERE id=$1",[ids.future]);
 assert.equal((await (await notices.GET(req())).json()).unread,1);
 role='employer';await query('INSERT INTO birthday_notification_log(employer_id,employee_id,celebration_year) VALUES($1,$2,EXTRACT(YEAR FROM NOW())::int)',[tenant,employee]);
 let b=await (await birthdays.GET()).json();assert.equal(b.hrAlerts.length,1);assert.ok(b.hrAlerts[0].expires_at);
 await query("UPDATE birthday_notification_log SET notified_at=NOW()-INTERVAL '1 day'");
 b=await (await birthdays.GET()).json();assert.equal(b.hrAlerts.length,0);
 role='none';assert.equal((await meetings.GET(req())).status,401);assert.equal((await notices.GET(req())).status,401);
 const end=meetingEnd({starts_at:'2026-10-30T10:00:00Z',duration_minutes:60});assert.equal(eventVisible(end,Date.parse(end)-1),true);assert.equal(eventVisible(end,Date.parse(end)),false);assert.equal(eventVisible('invalid',Date.now()),false);assert.equal(eventVisible(null,Date.now()),true);
 console.log('PASS: expired birthday reminders, meeting lists/history, cancelled/revoked meetings, live rescheduling, unread counts, dashboard widgets, tenant isolation and exact expiry boundaries. No production writes.');
}finally{await database.close()}
