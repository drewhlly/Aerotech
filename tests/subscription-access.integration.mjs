import {mock} from 'node:test';
import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
const database=new PGlite();
const query=async(sql,params=[])=>{const r=await database.query(sql,params);return {...r,rowCount:r.rows.length||r.affectedRows||0}};
class Pool{query=query;async end(){}}
let jar={},path='/api/employees';
mock.module('pg',{namedExports:{Pool,types:{setTypeParser(){}}}});
mock.module('next/headers.js',{namedExports:{cookies:async()=>({get:key=>jar[key]?{value:jar[key]}:undefined}),headers:async()=>new Headers({'x-aerotech-service-path':path})}});
process.env.DATABASE_URL='postgres://isolated-subscription-access-fixtures';
globalThis.fetch=()=>{throw Error('No provider requests are permitted in this test')};
await database.exec(`CREATE TABLE employer_accounts(id UUID PRIMARY KEY,subscription_required BOOLEAN);
CREATE TABLE employer_sessions(token_hash TEXT,employer_id UUID,expires_at TIMESTAMPTZ);
CREATE TABLE company_subscriptions(employer_id UUID PRIMARY KEY,plan TEXT,status TEXT,paid_until TIMESTAMPTZ,reference TEXT);
CREATE TABLE workforce_employees(id UUID PRIMARY KEY,employer_id UUID,first_name TEXT,last_name TEXT,email TEXT,department TEXT,manager_employee_id UUID,employment_status TEXT);
CREATE TABLE employee_sessions(token_hash TEXT,employee_id UUID,expires_at TIMESTAMPTZ);
CREATE TABLE applicant_sessions(token_hash TEXT,applicant_id UUID,expires_at TIMESTAMPTZ);
CREATE TABLE payroll_stage_approvers(employer_id UUID,employee_id UUID,stage TEXT);`);
const company=randomUUID(),foreign=randomUUID(),employee=randomUUID(),applicant=randomUUID();
const hash=value=>createHash('sha256').update(value).digest('hex');
await query('INSERT INTO employer_accounts VALUES($1,FALSE),($2,TRUE)',[company,foreign]);
await query("INSERT INTO employer_sessions VALUES($1,$2,NOW()+INTERVAL '1 day')",[hash('employer'),company]);
await query("INSERT INTO workforce_employees VALUES($1,$2,'Test','Staff','staff@example.invalid','Operations',NULL,'active')",[employee,company]);
await query("INSERT INTO employee_sessions VALUES($1,$2,NOW()+INTERVAL '1 day')",[hash('employee'),employee]);
await query("INSERT INTO applicant_sessions VALUES($1,$2,NOW()+INTERVAL '1 day')",[hash('applicant'),applicant]);
await query("INSERT INTO payroll_stage_approvers VALUES($1,$2,'ceo')",[company,employee]);
const {employerHasPaidAccess}=await import('../src/lib/employer-payment-guard.ts');
const request={cookies:{get:key=>jar[key]?{value:jar[key]}:undefined}};
const {currentEmployer}=await import('../src/lib/employer-session.ts');
const {currentEmployee}=await import('../src/lib/employee-auth.ts');
const {currentApplicant}=await import('../src/lib/applicant-session.ts');
const {employeeRequestCanApprove}=await import('../src/lib/employee-approval-access.ts');
const people=await import('../src/app/api/employees/route.ts');
const workspace=await import('../src/app/api/employee/workspace/route.ts');
const attention=await import('../src/app/api/workspace/attention/route.ts');
async function assertBlocked(label){
 jar={aerotech_employer_session:'employer'};path='/api/employees';
 assert.equal(await currentEmployer(),null,label+' employer guard');
 assert.equal(await employerHasPaidAccess(request),false,label+' navigation guard');
 assert.equal(await currentEmployer(false),company,label+' billing/support identity');
 assert.equal((await people.GET()).status,401,label+' direct employer API');
 assert.equal((await attention.GET()).status,401,label+' employer attention API');
 jar={aerotech_employee_session:'employee'};
 assert.equal(await currentEmployee(),null,label+' employee guard');
 assert.equal((await currentEmployee(false)).id,employee,label+' privacy/support identity');
 assert.equal((await workspace.GET()).status,401,label+' direct employee API');
 assert.equal((await attention.GET()).status,401,label+' employee attention API');
 assert.equal(await employeeRequestCanApprove('employee'),false,label+' approval route');
 jar={aerotech_applicant_session:'applicant'};
 assert.equal(await currentApplicant(),applicant,label+' free applicant identity');
 console.log('PASS '+label);
}
try{
 await assertBlocked('Missing subscription blocks legacy employer and employee services');
 await query("INSERT INTO company_subscriptions VALUES($1,'business','active',NOW()+INTERVAL '1 day')",[foreign]);
 await assertBlocked('Another tenant subscription cannot sponsor access');
 for(const [status,term] of [['expired',"NOW()+INTERVAL '1 day'"],['active',"NOW()-INTERVAL '1 second'"],['active','NOW()'],['active','NULL']]){
  await query(`INSERT INTO company_subscriptions VALUES($1,'business',$2,${term}) ON CONFLICT(employer_id) DO UPDATE SET status=EXCLUDED.status,paid_until=EXCLUDED.paid_until`,[company,status]);
  await assertBlocked('Inactive or expired company: '+status+' / '+term);
 }

 // Exercise real guards and every interactive payout route with demo identities.
 for(const [reference,expiry] of [['private-demo-'+foreign,"NOW()+INTERVAL '1 day'"],['','NULL']]){
  await query(`UPDATE company_subscriptions SET status='demo',reference=$2,paid_until=${expiry} WHERE employer_id=$1`,[company,reference]);
  await assertBlocked('Invalid or foreign demo');
 }
 await query("UPDATE company_subscriptions SET status='demo',reference=$2,paid_until=NOW()-INTERVAL '1 day',plan='business' WHERE employer_id=$1",[company,'private-demo-'+company]);
 jar={aerotech_employer_session:'employer'};path='/api/employees';
 assert.equal(await currentEmployer(),company,'demo remains accessible after former trial expiry');
 assert.equal(await employerHasPaidAccess(request),true,'demo navigation avoids checkout after former trial expiry');
 jar={aerotech_employee_session:'employee'};path='/api/employee/workspace';
 assert.equal((await currentEmployee()).id,employee,'own employer demo sponsors employee');
 assert.equal(await employeeRequestCanApprove('employee'),true,'demo review access');
 assert.equal(await employeeRequestCanApprove('employee',true),false,'demo cannot access CEO payment page');
 await query("UPDATE company_subscriptions SET status='expired' WHERE employer_id=$1",[company]);
 await assertBlocked('Revoked demo');
 await query("UPDATE company_subscriptions SET status='demo' WHERE employer_id=$1",[company]);
 await query("UPDATE company_subscriptions SET paid_until=NULL WHERE employer_id=$1",[company]);
 jar={aerotech_employer_session:'employer'};path='/api/employees';
 assert.equal(await currentEmployer(),company,'demo does not require a paid term');
 assert.equal(await employerHasPaidAccess(request),true,'demo without paid term avoids checkout');
 jar={aerotech_employee_session:'employee'};
 assert.equal((await currentEmployee()).id,employee,'demo without paid term sponsors employee');
 const payoutRoutes=[['','GET'],['connection','GET'],['connection','POST'],['recipients','GET'],
  ['recipients','POST'],['prepare','POST'],['release','POST'],['finalize','POST'],['reconcile','POST']];
 for(const [suffix,method] of payoutRoutes){
  const api=await import('../src/app/api/payroll/payments/'+(suffix?suffix+'/':'')+'route.ts');
  path='/api/payroll/payments'+(suffix?'/'+suffix:'');
  for(const role of ['employer','employee']){
   jar={['aerotech_'+role+'_session']:role};
   const response=await api[method](new Request('https://local.test'+path,{method,
    headers:{origin:'https://local.test',host:'local.test','content-type':'application/json'},
    ...(method==='POST'?{body:JSON.stringify({})}:{})}));
   assert.equal(response.status,401,role+' demo blocked at '+method+' '+path);
  }
 }
 console.log('PASS tenant-bound demo services and all interactive payout entry points denied without provider requests');
 await query("UPDATE company_subscriptions SET status='active',paid_until=NOW()+INTERVAL '1 day',plan='business' WHERE employer_id=$1",[company]);
 jar={aerotech_employer_session:'employer'};assert.equal(await currentEmployer(),company,'paid legacy employer');
 jar={aerotech_employee_session:'employee'};assert.equal((await currentEmployee()).id,employee,'company sponsors employee without employee payment');assert.equal((await currentEmployee(true,false)).id,employee,'paid company retains employee payment eligibility');
 assert.equal(await employeeRequestCanApprove('employee'),true);
 jar={aerotech_employer_session:'employer'};await query("UPDATE company_subscriptions SET plan='basic' WHERE employer_id=$1",[company]);path='/api/payroll/run';assert.equal(await currentEmployer(),null,'Basic cannot access payroll');path='/api/employees';assert.equal(await currentEmployer(),company,'Basic retains People');
 jar={aerotech_employee_session:'employee'};await query("UPDATE workforce_employees SET employment_status='terminated' WHERE id=$1",[employee]);assert.equal(await currentEmployee(),null);assert.equal(await currentEmployee(false),null);assert.equal(await employeeRequestCanApprove('employee'),false);
 await query("UPDATE workforce_employees SET employment_status='active' WHERE id=$1",[employee]);await query("UPDATE employee_sessions SET expires_at=NOW()-INTERVAL '1 second'");assert.equal(await currentEmployee(false),null);
 jar={aerotech_employer_session:'employer'};await query("UPDATE employer_sessions SET expires_at=NOW()-INTERVAL '1 second'");assert.equal(await currentEmployer(false),null);
 console.log('PASS active sponsored access, plan restrictions, terminated staff and expired sessions; no payments or external requests');
}finally{await database.close()}
