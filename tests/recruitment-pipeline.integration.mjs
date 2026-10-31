// Disposable PostgreSQL only. No live accounts, emails, hiring or provider requests.
import {mock} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
const database=new PGlite();
const query=async(sql,args=[])=>{const result=await database.query(sql,args);return {...result,rowCount:result.rows.length||result.affectedRows||0}};
class Pool{query=query;async connect(){return {query,release(){}}}async end(){}}
const tenant=randomUUID(),other=randomUUID(),job=randomUUID(),draft=randomUUID(),foreignJob=randomUUID();
let role='employer',company=tenant;
mock.module('../src/lib/employer-session.ts',{namedExports:{db:()=>new Pool(),currentEmployer:async()=>role==='employer'?company:null}});
mock.module('../src/lib/applicant-session.ts',{namedExports:{currentApplicant:async()=>null}});
for(const match of readFileSync('scripts/migrate.mjs','utf8').matchAll(/"(\d{3}_[^"]+\.sql)"/g))await database.exec(readFileSync('database/'+match[1],'utf8'));
for(const [id,name]of [[tenant,'Disposable company'],[other,'Foreign company']]){
 await query("INSERT INTO employer_accounts(id,company_name,company_email,admin_first_name,admin_last_name,phone,country,password_hash) VALUES($1,$2,$3,'Test','Owner','000','Nigeria','disposable')",[id,name,id+'@example.invalid']);
 await query("INSERT INTO company_subscriptions(employer_id,plan,status,currency,paid_until,reference) VALUES($1,'business','active','NGN',NOW()+INTERVAL '1 year',$2)",[id,id]);
}
for(const [id,owner,status,title]of [[job,tenant,'published','Software Engineer'],[draft,tenant,'draft','Designer'],[foreignJob,other,'published','Foreign role']])await query("INSERT INTO ats_jobs(id,employer_id,title,department,location,country,employment_type,description,requirements,status,expires_at,questions) VALUES($1,$2,$3,'Technology','Lagos','Nigeria','Full-time','Build reliable software for workforce teams. Collaborate on testing and secure delivery.','Software engineering experience',$4,NOW()+INTERVAL '30 days','[]')",[id,owner,title,status]);
const applications=[];
for(let i=0;i<45;i++){
 const person=randomUUID(),id=randomUUID(),stage=i<25?'screening':i<30?'shortlisted':i<34?'interview':i<38?'offer':i<41?'hired':'rejected';
 await query("INSERT INTO applicant_accounts(id,first_name,last_name,email,phone,password_hash) VALUES($1,$2,'Candidate',$3,'000','disposable')",[person,'Person '+String(i).padStart(2,'0'),'candidate'+i+'@example.invalid']);
 await query("INSERT INTO ats_applications(id,job_id,applicant_id,stage,cv_text,assessment_score,created_at) VALUES($1,$2,$3,$4,'CV uploaded: fixture.pdf',80,NOW()-$5::int*INTERVAL '1 minute')",[id,job,person,stage,i]);applications.push({id,stage});
 await query("INSERT INTO ats_events(id,application_id,stage,message) VALUES($1,$2,$3,'Disposable event')",[randomUUID(),id,stage]);
}
const ats=await import('../src/app/api/ats/route.ts');
const get=async(params='')=>{const response=await ats.GET(new Request('https://app.example.invalid/api/ats?view=employer&candidate_limit=20'+params));assert.equal(response.status,200);return response.json()};
const post=body=>ats.POST(new Request('https://app.example.invalid/api/ats',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));
try{
 let page=await get();assert.equal(page.applications.length,20);assert.equal(page.pagination.total,38);assert.equal(page.summary.jobs.active,1);assert.equal(page.summary.jobs.drafts,1);assert.equal(page.summary.review,25);assert.equal(page.summary.stages.rejected,4);assert.equal(page.applications[0].first_name,'Person 00');assert.ok(page.applications.every(a=>!['hired','rejected'].includes(a.stage)));assert.equal('answers' in page.applications[0],false);assert.equal('questions' in page.applications[0],false);
 const next=await get('&candidate_offset=20');assert.equal(next.applications.length,18);assert.equal(next.applications.some(a=>page.applications.some(b=>a.id===b.id)),false);
 assert.equal((await get('&candidate_stage=history')).pagination.total,7);
 assert.equal((await get('&candidate_stage=offer')).pagination.total,4);
 assert.equal((await get('&candidate_q=Person%2004')).pagination.total,1);
 assert.equal((await get('&candidate_job='+draft)).pagination.total,0);
 assert.equal((await(await ats.GET(new Request('https://app.example.invalid/api/ats?view=employer&candidate_limit=999'))).json()).pagination.limit,50);
 const id=applications[0].id;
 assert.equal((await post({action:'update',id,stage:'shortlisted',checks_passed:true,expected_stage:'screening'})).status,200);
 assert.equal((await get()).summary.review,24);
 assert.equal((await post({action:'update',id,stage:'offer',expected_stage:'screening'})).status,409);
 assert.equal((await post({action:'update',id,stage:'interview',expected_stage:'shortlisted',interview_at:new Date(Date.now()+3600000).toISOString()})).status,200);
 page=await get('&candidate_id='+id);assert.equal(page.applications.length,1);const candidate=page.applications[0];assert.ok(candidate.interview_room_id);assert.equal(candidate.interview_active,true);assert.equal(page.summary.interviews,1);
 assert.equal((await post({action:'update',id,stage:'interview',expected_stage:'interview',interview_complete:true,feedback:'Verified technical skills in the interview.'})).status,200);
 assert.ok((await get('&candidate_id='+id)).applications[0].interview_completed_at);
 assert.equal((await query('SELECT status FROM meet_rooms WHERE id=$1',[candidate.interview_room_id])).rows[0].status,'ended');
 assert.equal((await post({action:'update',id,stage:'interview',expected_stage:'interview',interview_at:new Date(Date.now()-86400000).toISOString()})).status,400);
 assert.equal((await post({action:'update',id,stage:'interview',expected_stage:'interview',interview_at:new Date(Date.now()+7200000).toISOString()})).status,200);
 const rescheduled=(await get('&candidate_id='+id)).applications[0];assert.notEqual(rescheduled.interview_room_id,candidate.interview_room_id);assert.equal(rescheduled.interview_completed_at,null);assert.equal(rescheduled.interview_active,true);
 assert.equal((await post({action:'update',id,stage:'offer',expected_stage:'interview',feedback:'Offer recorded for the agreed role.'})).status,200);
 assert.equal((await post({action:'update',id,stage:'hired',expected_stage:'offer'})).status,200);
 assert.equal((await query("SELECT COUNT(*)::int AS n FROM collaboration_jobs WHERE kind='employee_activation'")).rows[0].n,1,'Hiring queues one activation delivery');
 const employee=(await query('SELECT employee_id FROM ats_applications WHERE id=$1',[id])).rows[0].employee_id;assert.ok(employee);
 assert.equal((await post({action:'update',id,stage:'hired',expected_stage:'offer'})).status,409);assert.equal((await query('SELECT COUNT(*)::int AS n FROM workforce_employees')).rows[0].n,1);
 company=other;assert.equal((await get('&candidate_id='+id)).pagination.total,0);assert.equal((await post({action:'update',id,stage:'rejected'})).status,404);role='employee';assert.equal((await ats.GET(new Request('https://app.example.invalid/api/ats?view=employer&candidate_limit=20'))).status,401);
 console.log('PASS recruitment: bounded pagination, search, job/stage filters, accurate summaries, minimal payload, employer checks, private interview creation, recorded feedback, hire creation, stale-update denial and tenant isolation. Production writes: 0.');
}finally{await database.close()}
