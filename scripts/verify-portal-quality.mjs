import assert from 'node:assert/strict';
import {randomBytes,createHash} from 'node:crypto';
import {mkdir,mkdtemp,writeFile} from 'node:fs/promises';
import pg from 'pg';
import {chromium} from 'playwright';
import lighthouse from 'lighthouse';
const base=process.env.APP_BASE_URL||'http://localhost:3010',out='/tmp/aerotech-portal-audit';
assert.equal(new URL(base).hostname,'localhost');assert.ok(process.env.DATABASE_URL?.includes('localhost'));
await mkdir(out,{recursive:true});
const p=new pg.Pool({connectionString:process.env.DATABASE_URL}),scores=[];
try{
 const company=(await p.query("SELECT id FROM employer_accounts WHERE company_email='owner-fixture@example.invalid'")).rows[0].id;
 const employee=(await p.query("SELECT id FROM workforce_employees WHERE employer_id=$1 AND email='hr-fixture@example.invalid'",[company])).rows[0].id;
 const applicant=(await p.query("SELECT id FROM applicant_accounts WHERE email='candidate-fixture@example.invalid'")).rows[0].id;
 const admin=(await p.query('SELECT id FROM support_agents WHERE is_super_admin=TRUE LIMIT 1')).rows[0].id;
 for(const [role,id,path] of [['employer',company,'/dashboard/employer'],['employee',employee,'/employee'],['applicant',applicant,'/applicant'],['admin',admin,'/admin']]){
  const token=randomBytes(32).toString('hex'),table=role==='admin'?'support':role,owner=role==='admin'?'agent':role;
  await p.query(`INSERT INTO ${table}_sessions(token_hash,${owner}_id,expires_at) VALUES($1,$2,NOW()+INTERVAL '1 hour')`,[createHash('sha256').update(token).digest('hex'),id]);
  // Lighthouse uses Chrome's default context. A fresh persistent context shares only
  // this disposable localhost identity; no production browser state is imported.
  const profile=await mkdtemp('/tmp/aerotech-quality-'+role+'-');
  const browser=await chromium.launchPersistentContext(profile,{headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--remote-debugging-port=9223']});
  try{
   await browser.addCookies([{name:'aerotech_'+table+'_session',value:token,url:base,httpOnly:true,sameSite:'Lax'}]);
   const page=await browser.newPage();await page.goto(base+path);assert.equal(new URL(page.url()).pathname,path);await page.locator('meta[name="robots"][content*="noindex"]').waitFor({state:'attached'});
   const result=await lighthouse(base+path,{port:9223,disableStorageReset:true,output:'json',onlyCategories:['performance','accessibility','best-practices'],logLevel:'error'});
   assert.equal(new URL(result.lhr.finalDisplayedUrl).pathname,path,'Lighthouse must measure the signed-in portal, not its sign-in page');
   const metrics=Object.fromEntries(Object.entries(result.lhr.categories).map(([key,v])=>[key,Math.round(v.score*100)]));
   scores.push({role,path,...metrics});await writeFile(out+'/lighthouse-'+role+'.json',result.report);console.log('PORTAL LIGHTHOUSE '+JSON.stringify({role,path,...metrics}));
  }finally{await browser.close();await p.query(`DELETE FROM ${table}_sessions WHERE token_hash=$1`,[createHash('sha256').update(token).digest('hex')])}
 }
 await writeFile(out+'/lighthouse-scores.json',JSON.stringify(scores,null,2));
 assert.deepEqual(scores.filter(row=>Object.entries(row).some(([key,value])=>!['role','path'].includes(key)&&value<90)),[],'Signed-in performance, accessibility and best-practices must score at least 90. SEO indexability is intentionally disabled for private portals.');
}finally{await p.end()}
