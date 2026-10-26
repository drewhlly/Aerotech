import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';
const deps=process.env.SUPPORT_TEST_DEPENDENCIES;
if(!deps)throw Error('Set SUPPORT_TEST_DEPENDENCIES to a temporary npm project containing @electric-sql/pglite and pglite-server. Never use a production database.');
const load=createRequire(path.resolve(deps,'package.json'));
const {PGlite}=await import(pathToFileURL(load.resolve('@electric-sql/pglite')).href);
const {createServer}=await import(pathToFileURL(load.resolve('pglite-server')).href);
import { spawn } from 'node:child_process';
import { randomUUID, randomBytes, scryptSync } from 'node:crypto';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { encryptTotp, totp } from '../src/lib/support-security.ts';
const root=fileURLToPath(new URL('../',import.meta.url));
const db=new PGlite();await db.waitReady;const server=createServer(db,{logLevel:0});await new Promise(r=>server.listen(55439,'127.0.0.1',r));
process.env.SUPPORT_MFA_ENCRYPTION_KEY=randomBytes(32).toString('hex');
const env={...process.env,DATABASE_URL:'postgresql://postgres@127.0.0.1:55439/postgres',APP_BASE_URL:'http://localhost:3005'};
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'aerotech-support-test-'));
const log=fs.openSync(path.join(scratch,'server.log'),'w');
const migration=spawn('node',['scripts/migrate.mjs'],{cwd:root,env,stdio:['ignore',log,log]});assert.equal(await new Promise(r=>migration.on('exit',r)),0,'migrations');console.log('PASS isolated migrations including support tables and immutable audit trigger');
const app=spawn('node',['node_modules/next/dist/bin/next','dev','-H','127.0.0.1','-p','3005'],{cwd:root,env,stdio:['ignore',log,log]});
const base='http://localhost:3005';
async function call(path,{cookie='',body,origin=base}={}){return fetch(base+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',Origin:origin,...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{}),redirect:'manual'});}
async function company(email){const r=await call('/api/auth/signup/employer',{body:{companyName:email,companyEmail:email,firstName:'Test',lastName:'Admin',phone:'08000000000',country:'Nigeria',password:'Test-only-long-password-1234'}});assert.equal(r.status,201);return {cookie:r.headers.get('set-cookie').split(';')[0],id:(await r.json()).employerId};}
try{
 for(let i=0;i<60;i++){try{if((await fetch(base+'/support-console/login')).ok)break;}catch{}await new Promise(r=>setTimeout(r,1000));}
 const a=await company('company-a@example.invalid'),b=await company('company-b@example.invalid');
 const agentId=randomUUID(),secret='GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ',salt=randomBytes(16).toString('hex'),password='Private-staff-password-fixture';
 await db.query('INSERT INTO support_agents(id,email,display_name,password_hash,totp_encrypted) VALUES($1,$2,$3,$4,$5)',[agentId,'staff@example.invalid','Test Support',`scrypt:${salt}:${scryptSync(password,salt,64).toString('hex')}`,encryptTotp(secret)]);
 let r=await call('/api/support-console/tickets',{cookie:a.cookie});assert.equal(r.status,401);console.log('PASS company sessions cannot enter support console');
 r=await call('/api/support/tickets',{cookie:a.cookie,body:{title:'Employee import issue',description:'Imported records need checking.'},origin:'https://other.invalid'});assert.equal(r.status,403);console.log('PASS cross-origin consent/ticket mutations rejected');
 r=await call('/api/support/tickets',{cookie:a.cookie,body:{title:'Employee import issue',description:'Imported records need checking.'}});assert.equal(r.status,201);const id=(await r.json()).id;
 r=await call('/api/support/tickets/'+id,{cookie:b.cookie});assert.equal(r.status,404);
 r=await call('/api/support/tickets/'+id,{cookie:b.cookie,body:{action:'grant',scopes:['workforce'],minutes:15}});assert.equal(r.status,404);console.log('PASS another company cannot view or approve this ticket');
 r=await call('/api/support-console/login',{body:{email:'staff@example.invalid',password,code:'invalid'}});assert.equal(r.status,401);
 r=await call('/api/support-console/login',{body:{email:'staff@example.invalid',password,code:totp(secret,Math.floor(Date.now()/30000))}});assert.equal(r.status,200);const staff=r.headers.get('set-cookie').split(';')[0];
 r=await call('/api/support-console/login',{body:{email:'staff@example.invalid',password,code:totp(secret,Math.floor(Date.now()/30000))}});assert.equal(r.status,401);console.log('PASS staff password plus TOTP required and used code rejected');
 r=await call('/api/support-console/tickets',{cookie:staff});assert.equal(r.status,200);assert.equal((await r.json()).tickets.length,1);
 r=await call('/api/support-console/tickets/'+id,{cookie:staff});assert.equal(r.status,200);
 r=await call('/api/support-console/tickets/'+id+'/diagnostics?scope=workforce',{cookie:staff});assert.equal(r.status,403);console.log('PASS no diagnostic data before company approval');
 for(const body of [{action:'grant',scopes:['workforce'],minutes:120},{action:'grant',scopes:['bank'],minutes:30}]){r=await call('/api/support/tickets/'+id,{cookie:a.cookie,body});assert.equal(r.status,400);}
 r=await call('/api/support/tickets/'+id,{cookie:a.cookie,body:{action:'grant',scopes:['workforce'],minutes:15}});assert.equal(r.status,200);
 for(const employer of [a.id,b.id,b.id])await db.query("INSERT INTO workforce_employees(id,employer_id,first_name,last_name,email,job_title,department) VALUES($1,$2,'Private','Person',$3,'Test','Test')",[randomUUID(),employer,randomUUID()+'@example.invalid']);
 r=await call('/api/support-console/tickets/'+id+'/diagnostics?scope=workforce',{cookie:staff});assert.equal(r.status,200);const diagnostic=await r.json();assert.equal(diagnostic.data.employee_records,1);assert.equal(diagnostic.readOnly,true);assert.ok(!JSON.stringify(diagnostic).includes('Private'));console.log('PASS approved diagnostics contain only the chosen company counts and no employee PII');
 r=await call('/api/support-console/tickets/'+id+'/diagnostics?scope=payroll',{cookie:staff});assert.equal(r.status,403);console.log('PASS unapproved scope rejected');
 r=await call('/api/support-console/tickets/'+id,{cookie:staff,body:{action:'grant',scopes:['payroll'],minutes:60}});assert.equal(r.status,400);
 r=await call('/api/employees',{cookie:staff,body:{firstName:'No',lastName:'Access'}});assert.equal(r.status,401);console.log('PASS staff cannot self-approve or use employer write APIs');
 await db.exec("UPDATE support_grants SET approved_at=NOW()-INTERVAL '2 minutes',expires_at=NOW()-INTERVAL '1 minute'");
 r=await call('/api/support-console/tickets/'+id+'/diagnostics?scope=workforce',{cookie:staff});assert.equal(r.status,403);console.log('PASS expired access rejected at request time');
 r=await call('/api/support/tickets/'+id,{cookie:a.cookie,body:{action:'grant',scopes:['workforce'],minutes:30}});assert.equal(r.status,200);
 r=await call('/api/support/tickets/'+id,{cookie:a.cookie,body:{action:'revoke'}});assert.equal(r.status,200);
 r=await call('/api/support-console/tickets/'+id+'/diagnostics?scope=workforce',{cookie:staff});assert.equal(r.status,403);console.log('PASS immediate company revocation blocks new diagnostic requests');
 r=await call('/api/support/tickets/'+id,{cookie:a.cookie,body:{action:'grant',scopes:['workforce'],minutes:30}});assert.equal(r.status,200);
 r=await call('/api/support-console/tickets/'+id,{cookie:staff,body:{action:'close',summary:'Checked scoped import counts; company to correct the source file.'}});assert.equal(r.status,200);
 r=await call('/api/support/tickets/'+id,{cookie:a.cookie});assert.equal(r.status,200);const details=await r.json();assert.equal(details.ticket.status,'closed');assert.ok(details.ticket.resolution.includes('company'));assert.ok(details.events.some(e=>e.action==='diagnostics_viewed'));assert.ok(details.events.some(e=>e.action==='diagnostics_denied'));assert.ok(details.events.some(e=>e.action==='ticket_closed'&&e.actor_name==='Test Support'));assert.equal(details.grants.filter(g=>g.active).length,0);console.log('PASS company can see staff actions and resolution; closure ends access');
 await assert.rejects(db.exec("UPDATE support_audit SET action='tampered'"));await assert.rejects(db.exec('DELETE FROM support_audit'));console.log('PASS database refuses editing or deleting audit records');
 await db.query('UPDATE support_agents SET disabled=TRUE WHERE id=$1',[agentId]);r=await call('/api/support-console/tickets',{cookie:staff});assert.equal(r.status,401);console.log('PASS disabling staff invalidates existing sessions immediately');
 console.log('RESULT: support HTTP/API/database isolation checks passed; no production staff or customer records used.');
}finally{app.kill();server.close();await db.close();}
