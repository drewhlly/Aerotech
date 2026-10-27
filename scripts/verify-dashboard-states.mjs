import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {randomBytes,createHash} from 'node:crypto';
import pg from 'pg';
import {chromium} from 'playwright';
const base=process.env.APP_BASE_URL||'http://localhost:3010',out='/tmp/aerotech-public-audit';
assert.equal(new URL(base).hostname,'localhost');assert.ok(process.env.DATABASE_URL?.includes('localhost'));
await mkdir(out,{recursive:true});
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});
const company=(await pool.query("SELECT id FROM employer_accounts WHERE company_email='owner-fixture@example.invalid'")).rows[0].id;
const token=randomBytes(32).toString('hex');
await pool.query("INSERT INTO employer_sessions(token_hash,employer_id,expires_at) VALUES($1,$2,NOW()+INTERVAL '1 hour')",[createHash('sha256').update(token).digest('hex'),company]);
const browser=await chromium.launch(process.env.QA_CHROME?{executablePath:process.env.QA_CHROME,args:['--no-sandbox','--disable-dev-shm-usage']}: {}),context=await browser.newContext({baseURL:base});
await context.addCookies([{name:'aerotech_employer_session',value:token,url:base,httpOnly:true,sameSite:'Lax'}]);
const page=await context.newPage();
const routes=['/dashboard/employer/recruitment','/dashboard/employer/employees','/dashboard/employer/training','/dashboard/employer/hr/attendance','/dashboard/employer/payroll','/dashboard/employer/compliance','/dashboard/employer/hr/assets','/dashboard/employer/hr/tasks','/dashboard/employer/hr/disciplinary','/dashboard/employer/hr/goals','/dashboard/employer/hr/lifecycle/documents','/dashboard/employer/reports','/dashboard/employer/requests','/dashboard/employer/onboarding','/dashboard/employer/performance','/dashboard/employer/payroll/pay','/dashboard/employer/notifications','/dashboard/employer/exits'];
const results=[];
try{
 for(const path of routes){
  const row={route:path,role:'employer',loading:null,error:null,empty:null,api:[]},responses=new Map();
  const capture=async response=>{if(response.url().startsWith(base+'/api/')&&response.request().method()==='GET'&&response.ok()){try{responses.set(response.url(),await response.json())}catch{}}};
  page.on('response',capture);await page.goto(path,{waitUntil:'networkidle'});page.off('response',capture);
  row.api=[...responses.keys()].map(url=>url.slice(base.length));
  if(!responses.size){results.push(row);continue}
  let held=false,release;const gate=new Promise(resolve=>release=resolve);
  await page.route('**/api/**',async route=>{if(route.request().method()!=='GET'){await route.continue();return}held=true;await gate;const data=responses.get(route.request().url());if(data)await route.fulfill({json:data});else await route.continue()});
  await page.reload({waitUntil:'domcontentloaded'});
  for(let i=0;i<30&&!held;i++)await new Promise(resolve=>setTimeout(resolve,50));
  row.loading=await page.getByText(/loading|please wait|fetching/i).count()>0;
  release();await page.waitForLoadState('networkidle');await page.unroute('**/api/**');
  await page.route('**/api/**',route=>route.request().method()==='GET'?route.fulfill({status:503,json:{error:'Audit simulated data outage'}}):route.continue());
  await page.reload({waitUntil:'networkidle'});
  row.error=await page.getByText(/Audit simulated data outage|unable|unavailable|could not|failed|try again/i).count()>0;
  await page.unroute('**/api/**');
  const empty=data=>Array.isArray(data)?[]:data&&typeof data==='object'?Object.fromEntries(Object.entries(data).map(([key,value])=>[key,empty(value)])):data;
  await page.route('**/api/**',async route=>{const data=responses.get(route.request().url());if(route.request().method()==='GET'&&data)await route.fulfill({json:empty(data)});else await route.continue()});
  await page.reload({waitUntil:'networkidle'});
  row.empty=await page.getByText(/no .*(yet|record|found|available|request|active|staff|pending)|nothing|not recorded|not assigned|create your first|no vacancies|no open/i).count()>0;
  await page.unroute('**/api/**');results.push(row);console.log('DASHBOARD STATE '+JSON.stringify(row));
 }
 await page.goto('/dashboard/employer/hr/assets',{waitUntil:'networkidle'});
 await page.getByRole('combobox').first().selectOption({index:1});
 await page.getByLabel('Asset name',{exact:true}).fill('Disposable audit asset');
 await page.getByRole('button',{name:'Save record',exact:true}).click();
 await page.getByText('Disposable audit asset',{exact:true}).waitFor();
 results.push({route:'/dashboard/employer/hr/assets',role:'employer',success:await page.getByRole('status').filter({hasText:/saved|success|created/i}).count()>0});
 await page.goto('/dashboard/employer/reports',{waitUntil:'networkidle'});
 const exportButton=page.getByRole('button',{name:'Download CSV',exact:true}).first();
 if(await exportButton.isEnabled()){const [download]=await Promise.all([page.waitForEvent('download'),exportButton.click()]);assert.ok(download.suggestedFilename().endsWith('.csv'));console.log('PASS CSV export')}
 await writeFile(out+'/dashboard-states.json',JSON.stringify(results,null,2));
 console.log('DASHBOARD STATE SUMMARY '+JSON.stringify(results));
 assert.deepEqual(results.filter(row=>row.loading===false||row.error===false||row.success===false),[],'Dashboard loading, error and confirmation states');
}finally{await context.close();await browser.close();await pool.end()}
