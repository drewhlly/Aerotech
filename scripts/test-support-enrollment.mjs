import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
import os from 'node:os';
const deps=process.env.SUPPORT_TEST_DEPENDENCIES;
if(!deps)throw Error('Set SUPPORT_TEST_DEPENDENCIES to a temporary npm project containing @electric-sql/pglite and pglite-server. Never use a production database.');
const load=createRequire(path.resolve(deps,'package.json'));
const {PGlite}=await import(pathToFileURL(load.resolve('@electric-sql/pglite')).href);
const {createServer}=await import(pathToFileURL(load.resolve('pglite-server')).href);
import {spawn} from 'node:child_process';
import {randomUUID,randomBytes,scryptSync,createHash} from 'node:crypto';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {encryptTotp,totp} from '../src/lib/support-security.ts';
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

 await company('owner@example.invalid');
 const enable=spawn('node',['scripts/enable-support-enrollment.mjs'],{cwd:root,env:{...env,SUPPORT_INITIAL_AGENT_EMAIL:'owner@example.invalid'},stdio:['ignore',log,log]});assert.equal(await new Promise(r=>enable.on('exit',r)),0);console.log('PASS existing approved owner account snapshotted');
 const original='Test-only-long-password-1234',staffPassword='New-private-support-password-5678';
 let r=await call('/api/support-console/enroll',{body:{action:'begin',email:'other@example.invalid',password:original,staffPassword}});assert.equal(r.status,401);console.log('PASS arbitrary email cannot enroll as support');
 r=await call('/api/support-console/enroll',{body:{action:'begin',email:'owner@example.invalid',password:'wrong',staffPassword}});assert.equal(r.status,401);
 r=await call('/api/support-console/enroll',{origin:'https://other.invalid',body:{action:'begin',email:'owner@example.invalid',password:original,staffPassword}});assert.equal(r.status,403);console.log('PASS current account password and same-origin request required');
 r=await call('/api/support-console/enroll',{body:{action:'begin',email:'owner@example.invalid',password:original,staffPassword}});assert.equal(r.status,200);const setup=await r.json();const enrollment=r.headers.getSetCookie().find(c=>c.startsWith('aerotech_support_enrollment=')).split(';')[0];assert.match(setup.secret,/^[A-Z2-7]{32}$/);assert.ok(setup.uri.startsWith('otpauth://totp/'));assert.equal((await db.query('SELECT * FROM support_agents')).rows.length,0);console.log('PASS authenticator setup creates pending enrollment, not a staff role');
 const pending=(await db.query('SELECT * FROM support_pending_enrollments')).rows[0];assert.ok(!pending.totp_encrypted.includes(setup.secret));assert.ok(pending.totp_encrypted.startsWith('pw.'));
 r=await call('/api/support-console/enroll',{cookie:enrollment,body:{action:'confirm',password:staffPassword,code:'bad'}});assert.equal(r.status,401);assert.equal((await db.query('SELECT * FROM support_agents')).rows.length,0);console.log('PASS invalid authenticator code cannot activate staff');
 r=await call('/api/support-console/enroll',{cookie:enrollment,body:{action:'confirm',password:staffPassword,code:totp(setup.secret,Math.floor(Date.now()/30000))}});assert.equal(r.status,200);const staff=r.headers.getSetCookie().find(c=>c.startsWith('aerotech_support_session=')).split(';')[0];
 assert.equal((await db.query('SELECT * FROM support_agents')).rows.length,1);assert.ok((await db.query('SELECT used_at FROM support_enrollment_approvals')).rows[0].used_at);console.log('PASS MFA confirmation atomically creates one staff account and consumes approval');
 r=await call('/api/support-console/tickets',{cookie:staff});assert.equal(r.status,200);
 r=await call('/api/support-console/enroll',{cookie:enrollment,body:{action:'confirm',password:staffPassword,code:totp(setup.secret,Math.floor(Date.now()/30000))}});assert.equal(r.status,401);
 r=await call('/api/support-console/enroll',{body:{action:'begin',email:'owner@example.invalid',password:original,staffPassword}});assert.equal(r.status,401);console.log('PASS consumed approval and enrollment cookie cannot be replayed');
 r=await call('/api/support-console/login',{body:{email:'owner@example.invalid',password:staffPassword,code:totp(setup.secret,Math.floor(Date.now()/30000)+1)}});assert.equal(r.status,200);console.log('PASS staff can sign in with password-bound encrypted MFA without server master key');
 r=await call('/api/employees',{cookie:staff,body:{firstName:'No',lastName:'Access'}});assert.equal(r.status,401);assert.equal((await db.query('SELECT * FROM support_grants')).rows.length,0);console.log('PASS enrollment grants no customer access or employer write privileges');
 console.log('RESULT: owner enrollment passed without production credentials or accounts.');

}finally{app.kill();server.close();await db.close();}
