// Isolated SQL and provider simulator. Never connects to a real database or bank.
import {mock} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {bankFingerprint} from '../src/lib/payout-security.ts';
const database=new PGlite();
const query=async(sql,args=[])=>{const r=await database.query(sql,args);return {...r,rowCount:r.rows.length||r.affectedRows||0}};
class Pool{query=query;async connect(){return {query,release(){}}}async end(){}}
const company=randomUUID(),run=randomUUID(),person=randomUUID(),staff=[randomUUID(),randomUUID(),randomUUID()];
let actor='employer',balance=10000000,transfers=0,providerUncertain=false,providerDomain='test';
mock.module('../src/lib/employer-session.ts',{namedExports:{db:()=>new Pool(),currentEmployer:async()=>actor==='employer'?company:null}});
mock.module('../src/lib/employee-auth.ts',{namedExports:{currentEmployee:async()=>['ceo','hr'].includes(actor)?{id:actor==='ceo'?staff[2]:staff[0],employer_id:company}:null}});
process.env.PAYOUT_ENCRYPTION_KEY='a'.repeat(64);
const fixtureKey='sk_test_disposablefixture';
globalThis.fetch=async(url,options)=>{
 assert.equal(options.headers.Authorization,'Bearer '+fixtureKey,'Only disposable provider keys are accepted');
 const path=new URL(url).pathname;let data;
 if(path==='/balance')data=[{currency:'NGN',balance}];
 else if(path==='/transfer'){transfers++;const b=JSON.parse(options.body);assert.equal(b.amount,10000000);assert.equal(b.recipient,'RCP_fixture');if(providerUncertain)throw Error('Simulated provider timeout');data={...b,currency:'NGN',domain:'test',status:'pending',transfer_code:'TRF_fixture'};}
 else if(path.startsWith('/transfer/verify/'))data={reference:decodeURIComponent(path.split('/').at(-1)),currency:'NGN',domain:providerDomain,amount:10000000,recipient:'RCP_fixture',status:'success',transfer_code:'TRF_fixture'};
 else throw Error('Unexpected provider request blocked');
 return Response.json({status:true,data});
};
for(const match of readFileSync('scripts/migrate.mjs','utf8').matchAll(/"(\d{3}_[^"]+\.sql)"/g))await database.exec(readFileSync('database/'+match[1],'utf8'));
await query("INSERT INTO employer_accounts(id,company_name,company_email,admin_first_name,admin_last_name,phone,country,password_hash) VALUES($1,'Disposable company','owner@example.invalid','Test','Owner','000','Nigeria','test-only')",[company]);
for(const [i,id] of staff.entries()){
 await query("INSERT INTO workforce_employees(id,employer_id,employee_number,first_name,last_name,email,job_title,department,location,employment_status) VALUES($1,$2,$3,'Test','Approver',$4,'Approver','Finance','Head office','active')",[id,company,'TEST-'+i,'staff'+i+'@example.invalid']);
 await query('INSERT INTO payroll_stage_approvers(employer_id,stage,employee_id) VALUES($1,$2,$3)',[company,['hr','finance','ceo'][i],id]);
}
await query('INSERT INTO payroll_employees(id,employer_id,workforce_employee_id,full_name,monthly_gross_ngn) VALUES($1,$2,$3,$4,100000)',[person,company,staff[0],'Test Employee']);
await query('INSERT INTO employee_private_profiles(employee_id,employer_id,details) VALUES($1,$2,$3)',[staff[0],company,JSON.stringify({banking:{accountNumber:'0000000000'}})]);
await query('INSERT INTO payroll_transfer_recipients(employer_id,payroll_employee_id,recipient_code,bank_code,account_fingerprint) VALUES($1,$2,$3,$4,$5)',[company,person,'RCP_fixture','000',bankFingerprint('000','0000000000')]);
await query("INSERT INTO payroll_runs(id,employer_id,payroll_month,status,gross_total,deduction_total,net_total) VALUES($1,$2,'2026-10-01','approved',100000,0,100000)",[run,company]);
await query('INSERT INTO payroll_run_items(id,run_id,employee_id,gross,pension,other_deductions,net) VALUES($1,$2,$3,100000,0,0,100000)',[randomUUID(),run,person]);
for(const [i,stage]of ['hr','finance','ceo'].entries())await query("INSERT INTO payroll_stage_reviews(id,employer_id,run_id,stage,reviewer_employee_id,decision) VALUES($1,$2,$3,$4,$5,'approved')",[randomUUID(),company,run,stage,staff[i]]);
const connection=await import('../src/app/api/payroll/payments/connection/route.ts');
const preparation=await import('../src/app/api/payroll/payments/prepare/route.ts');
const release=await import('../src/app/api/payroll/payments/release/route.ts');
const reconcile=await import('../src/app/api/payroll/payments/reconcile/route.ts');
const request=(body,origin='https://app.example.invalid')=>new Request('https://app.example.invalid/api/payroll/payments',{method:'POST',headers:{Origin:origin,Host:'app.example.invalid','Content-Type':'application/json'},body:JSON.stringify(body)});
try{
 assert.equal((await connection.POST(request({key:fixtureKey,confirmOwnership:false}))).status,400);
 assert.equal((await connection.POST(request({key:fixtureKey,confirmOwnership:true}))).status,200);
 const setup=await (await connection.GET()).json();assert.equal(setup.mode,'test');assert.equal(setup.readiness.readyForTest,true);assert.equal(setup.readiness.readyForLiveReview,false);assert.equal(JSON.stringify(setup).includes(fixtureKey),false);
 assert.equal((await preparation.POST(request({runId:run},'https://foreign.example.invalid'))).status,403);
 assert.equal((await preparation.POST(request({runId:run}))).status,201);
 assert.equal((await release.POST(request({runId:run,confirmTotalKobo:10000000}))).status,401);actor='hr';assert.equal((await release.POST(request({runId:run,confirmTotalKobo:10000000}))).status,403);assert.equal(transfers,0);actor='ceo';const payload={runId:run,confirmTotalKobo:10000000};
 assert.equal((await release.POST(request({...payload,confirmTotalKobo:1}))).status,409);assert.equal(transfers,0);
 balance=0;assert.equal((await release.POST(request(payload))).status,422);assert.equal(transfers,0);balance=20000000;
 await query("UPDATE employee_private_profiles SET details=$1 WHERE employee_id=$2",[JSON.stringify({banking:{accountNumber:'1111111111'}}),staff[0]]);assert.equal((await release.POST(request(payload))).status,409);assert.equal(transfers,0);
 await query('UPDATE employee_private_profiles SET details=$1 WHERE employee_id=$2',[JSON.stringify({banking:{accountNumber:'0000000000'}}),staff[0]]);
 providerUncertain=true;const uncertain=await (await release.POST(request(payload))).json();assert.equal(uncertain.awaitingConfirmation,1);assert.equal(transfers,1);
 const repeat=await (await release.POST(request(payload))).json();assert.equal(repeat.submitted,0);assert.equal(transfers,1);
 providerDomain='live';assert.equal((await (await reconcile.POST(request({runId:run}))).json()).unconfirmed,1);assert.equal((await query('SELECT status FROM payroll_transfer_intents WHERE payroll_run_id=$1',[run])).rows[0].status,'pending');providerDomain='test';assert.equal((await reconcile.POST(request({runId:run}))).status,200);assert.equal((await query('SELECT status FROM payroll_transfer_intents WHERE payroll_run_id=$1',[run])).rows[0].status,'success');assert.equal(transfers,1);
 console.log('PASS isolated payout connection, test/live distinction, exact totals, funding, changed-bank denial, uncertain submission, retry safety and final reconciliation. Real transfers: 0.');
}finally{await database.close()}
