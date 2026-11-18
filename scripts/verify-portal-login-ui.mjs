// Disposable local accounts only. Never reads a production DATABASE_URL.
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
import {scryptSync,randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
import {setTimeout as delay} from 'node:timers/promises';
import pg from 'pg';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const children=[];let browser;
const output='/tmp/aerotech-login-verification';await mkdir(output,{recursive:true});
const base='http://127.0.0.1:3188',password='Synthetic-login-2026!';
const users={applicant:'candidate@example.test',employee:'test1@example.test',employer:'company@example.test'};
const homes={applicant:'/applicant',employee:'/employee',employer:'/dashboard/employer'};
const results=[];
function start(args,env={}){const c=spawn(process.execPath,args,{env:{...process.env,...env},stdio:['ignore','pipe','pipe']});children.push(c);let log='';c.stdout.on('data',d=>{log+=d});c.stderr.on('data',d=>{log+=d});c.logs=()=>log;return c}
try{
 const db=start(['scripts/phase2-test-db.mjs']);
 for(let i=0;i<120&&!db.logs().includes('Isolated socket ready');i++){if(db.exitCode!==null)throw Error(db.logs());await delay(500)}
 assert.ok(db.logs().includes('Isolated socket ready'),'Fixture database ready');
 const pool=new pg.Pool({connectionString:'postgres://test:test@127.0.0.1:55432/postgres',max:1});
 const salt=randomBytes(16).toString('hex'),hash='scrypt:'+salt+':'+scryptSync(password,salt,64).toString('hex');
 await pool.query('UPDATE employer_accounts SET password_hash=$1 WHERE company_email=$2',[hash,users.employer]);
 await pool.query('UPDATE applicant_accounts SET password_hash=$1 WHERE email=$2',[hash,users.applicant]);
 await pool.query('UPDATE employee_credentials SET password_hash=$1',[hash]);await pool.end();
 const server=start(['--require','./scripts/pglite-pool-preload.cjs','node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3188'],{DATABASE_URL:'postgres://test:test@127.0.0.1:55432/postgres',DOCUMENT_ENCRYPTION_KEY:'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='});
 let ready=false;for(let i=0;i<120;i++){try{if((await fetch(base+'/auth/login')).ok){ready=true;break}}catch{}if(server.exitCode!==null)throw Error(server.logs());await delay(500)}assert.ok(ready,'Local server ready');
 // Verify authentication against the real local handlers even if browser launch is unavailable.
 for(const [role,email] of Object.entries(users)){
  const response=await fetch(base+'/api/auth/login/'+role,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
  assert.equal(response.status,200,role+' real login succeeds');
  assert.ok(response.headers.get('set-cookie')?.includes('aerotech_'+role+'_session='));
  assert.match(response.headers.get('set-cookie'),/HttpOnly/i);assert.match(response.headers.get('set-cookie'),/SameSite=lax/i);
  results.push({role,realApiLogin:'passed',httpOnlyCookie:true});
  const rejected=await fetch(base+'/api/auth/login/'+role,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:'incorrect'})});assert.equal(rejected.status,401);
 }
 for(const [account,email] of Object.entries(users)){for(const portal of Object.keys(users).filter(r=>r!==account)){const r=await fetch(base+'/api/auth/login/'+portal,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});assert.equal(r.status,401,account+' cannot use '+portal);results.push({account,portal,realApiCrossPortal:'denied'})}}
 await writeFile(output+'/api-results.json',JSON.stringify(results,null,2));console.log('Real API checks passed for all three roles and six cross-portal attempts.');
 if(process.argv.includes('--api-only')){console.log('Browser viewport and UI interaction checks not run (--api-only).');}else{
 browser=await chromium.launch({executablePath:process.env.CI ? undefined : (process.env.PLAYWRIGHT_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined)),headless:true,args:['--no-sandbox']});
 for(const role of Object.keys(users)){
  const ctx=await browser.newContext();const page=await ctx.newPage();
  for(const width of [360,768,1024,1440]){
   await page.setViewportSize({width,height:1000});await page.goto(base+'/auth/login?role='+role);await page.getByRole('heading',{name:role[0].toUpperCase()+role.slice(1)+' Login',exact:true}).waitFor();
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow '+role+' '+width);
   assert.equal(await page.locator('.portal-auth-panel').isVisible(),width>=1024);
   assert.equal(await page.locator('[autocomplete="username"]').count(),1);assert.equal(await page.locator('[autocomplete="current-password"]').count(),1);
   assert.equal(await page.locator('a[href^="/auth/signup/"]').count(),role==='employee'?0:1);
   const axe=await new AxeBuilder({page}).include('.portal-auth').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(axe.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)})),[],role+' accessibility '+width);
   await page.screenshot({path:output+'/'+role+'-'+width+'.png',fullPage:true});results.push({role,width,overflow:false,axeViolations:0});
  }
  await page.getByRole('button',{name:'Sign In',exact:true}).click();await page.getByText('Enter your email address.',{exact:true}).waitFor();assert.equal(await page.locator('#login-email').evaluate(e=>document.activeElement===e),true);
  await page.getByLabel('Email address',{exact:true}).fill(users[role]);await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Show password'}).click();assert.equal(await page.locator('#login-password').getAttribute('type'),'text');await page.getByRole('button',{name:'Hide password'}).click();
  await page.getByLabel('Remember me',{exact:true}).check();
  await page.locator('#login-password').press('Enter');await page.waitForURL(base+homes[role],{timeout:30000});
  const cookies=await ctx.cookies();const cookie=cookies.find(c=>c.name==='aerotech_'+role+'_session');assert.ok(cookie?.httpOnly,'HttpOnly role session');assert.equal(await page.evaluate(()=>Object.keys(localStorage).filter(k=>/token|password|session/i.test(k)).length),0);
  // A signed-in visitor is intentionally redirected away from login. Clear only fixture cookies, retaining localStorage to verify remembered email.
  await ctx.clearCookies();await page.goto(base+'/auth/login?role='+role);await page.waitForFunction(expected=>document.querySelector('#login-email')?.value===expected,users[role]);assert.equal(await page.getByLabel('Email address',{exact:true}).inputValue(),users[role]);
  await ctx.close();results.push({role,realLogin:'passed',redirect:homes[role],rememberEmail:'passed'});
 }
 // Real APIs, not intercepted: each account must fail against the other two portals.
 for(const [account,email] of Object.entries(users)){for(const portal of Object.keys(users).filter(r=>r!==account)){const context=await browser.newContext();const r=await context.request.post(base+'/api/auth/login/'+portal,{data:{email,password}});assert.equal(r.status(),401,account+' cannot use '+portal);await context.close();results.push({account,portal,crossPortal:'denied'})}}
 // UI-only response cases. These intercepted responses do not establish backend behavior.
 for(const role of Object.keys(users)){
  const ctx=await browser.newContext();const page=await ctx.newPage();await page.goto(base+'/auth/login?role='+role);await page.getByLabel('Email address',{exact:true}).fill('invalid@example.test');await page.getByLabel('Password',{exact:true}).fill('bad-password');
  for(const status of [401,423,429,503]){await page.route('**/api/auth/login/'+role,r=>r.fulfill({status,contentType:'application/json',body:JSON.stringify({error:'Sensitive provider detail'})}));await page.getByRole('button',{name:'Sign In',exact:true}).click();await page.getByRole('alert').waitFor();assert.ok(!(await page.getByRole('alert').innerText()).includes('Sensitive provider detail'));assert.ok(await page.getByRole('button',{name:'Sign In',exact:true}).isEnabled());await page.unroute('**/api/auth/login/'+role)}
  let release;await page.route('**/api/auth/login/'+role,async r=>{await new Promise(resolve=>{release=resolve});await r.fulfill({status:401,contentType:'application/json',body:'{}'})});
  await page.getByRole('button',{name:'Sign In',exact:true}).click();await page.getByRole('button',{name:'Signing in…',exact:true}).waitFor();assert.equal(await page.locator('#login-email').isEnabled(),false);release();await page.getByRole('alert').waitFor();await page.unroute('**/api/auth/login/'+role);
  await page.route('**/api/auth/login/'+role,r=>r.abort());await page.getByRole('button',{name:'Sign In',exact:true}).click();await page.getByText('Unable to connect. Please try again.',{exact:true}).waitFor();await ctx.close();results.push({role,uiErrorCases:'401/423/429/503/network passed'});
 }
 }
 await writeFile(output+'/results.json',JSON.stringify(results,null,2));console.log(JSON.stringify({passed:true,checks:results.length,output},null,2));
}catch(e){console.error(e);for(const c of children)console.error(c.logs().slice(-3500));process.exitCode=1}finally{await browser?.close();for(const c of children)c.kill('SIGTERM')}
