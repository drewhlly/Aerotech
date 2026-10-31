// Disposable localhost fixtures only. Never uses production sessions or provider credentials.
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import pg from 'pg';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:3100';
const fixture=JSON.parse(readFileSync('/tmp/phase2-fixture.json','utf8'));
const pool=new pg.Pool({connectionString:'postgres://test:test@127.0.0.1:55432/postgres'});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||chromium.executablePath(),headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const contexts=[];
async function context(role){const c=await browser.newContext({baseURL:origin});contexts.push(c);await c.addCookies([{name:`aerotech_${role}_session`,value:`phase2-test-${role}`,url:origin,httpOnly:true,sameSite:'Lax'}]);return c;}
try{
 const employee=await context('employee'),employer=await context('employer'),page=await employee.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/employee');
 assert.equal(await page.getByRole('link',{name:'Recruitment',exact:true}).count(),0);
 assert.equal(await page.getByRole('link',{name:'Salary payments',exact:true}).count(),0);
 assert.equal(await page.getByRole('link',{name:'My approvals',exact:true}).count(),0);
 for(const path of ['/employee/opportunities','/employee/opportunities/'+randomUUID(),'/employee/approvals','/employee/payroll/payments'])assert.equal((await employee.request.get(path)).status(),403,path);
 assert.equal((await employee.request.get('/api/employee/payroll/review')).status(),403);
 assert.equal((await employee.request.get('/api/employee/manager/leave')).status(),403);
 console.log('PASS ordinary employee has no recruitment, salary-payments or unassigned approval access');
 await pool.query("INSERT INTO payroll_stage_approvers(employer_id,employee_id,stage) VALUES($1,$2,'finance')",[fixture.employer,fixture.employee]);
 await pool.query('UPDATE workforce_employees SET manager_employee_id=$1 WHERE id=$2 AND employer_id=$3',[fixture.employee,fixture.nonmember,fixture.employer]);
 const request=randomUUID();
 await pool.query("INSERT INTO employee_requests(id,employer_id,employee_id,request_type,leave_category,start_date,end_date,details) VALUES($1,$2,$3,'leave','annual',CURRENT_DATE,CURRENT_DATE,'Disposable review fixture')",[request,fixture.employer,fixture.nonmember]);
 for(const width of [360,768,1280]){
  await page.setViewportSize({width,height:900});const r=await page.goto(origin+'/employee/approvals');assert.equal(r.status(),200);
  await page.getByRole('heading',{name:'Team leave requests',exact:true}).waitFor();
  await page.getByRole('heading',{name:'Payroll awaiting your review',exact:true}).waitFor();
  await page.getByText('No payroll runs are awaiting your approval.',{exact:true}).waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false,'approval page overflow '+width);
 }
 assert.equal(await page.getByRole('link',{name:'My approvals',exact:true}).count(),1);
 const section=page.locator('section').filter({has:page.getByRole('heading',{name:'Team leave requests',exact:true})});
 await section.getByRole('button',{name:'Approve',exact:true}).click();
 const dialog=page.getByRole('dialog');await dialog.getByLabel('Review note',{exact:true}).fill('Reviewed in isolated browser test');await dialog.getByRole('button',{name:'Confirm approval',exact:true}).click();
 await page.getByText('Leave decision recorded.',{exact:true}).waitFor();
 const decision=(await pool.query('SELECT status,reviewed_by_employee_id FROM employee_requests WHERE id=$1',[request])).rows[0];assert.equal(decision.status,'approved');assert.equal(decision.reviewed_by_employee_id,fixture.employee);
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();assert.deepEqual(axe.violations.filter(v=>['critical','serious'].includes(v.impact)).map(v=>v.id),[]);
 console.log('PASS assigned approvals, persisted leave decision, 360/768/1280 layouts and critical/serious axe checks');
 await pool.query("INSERT INTO employee_leave_balances(employer_id,employee_id,leave_year,annual_allowance_days) VALUES($1,$2,EXTRACT(YEAR FROM CURRENT_DATE)::int,20) ON CONFLICT(employer_id,employee_id,leave_year) DO UPDATE SET annual_allowance_days=20",[fixture.employer,fixture.employee]);
 const day=new Date();day.setUTCHours(0,0,0,0);while(day.getUTCDay()!==1)day.setUTCDate(day.getUTCDate()+1);
 const date=day.toISOString().slice(0,10),leave={category:'annual',startDate:date,endDate:date,details:'Disposable concurrent leave check'};
 const submissions=await Promise.all([employee.request.post('/api/leave',{data:leave,headers:{Origin:origin}}),employee.request.post('/api/leave',{data:leave,headers:{Origin:origin}})]);
 assert.deepEqual(submissions.map(r=>r.status()).sort(),[201,409]);
 const balance=await (await employee.request.get('/api/leave')).json();assert.equal(balance.balance.pending_days,1);assert.equal(balance.balance.available_days,19);
 await page.setViewportSize({width:360,height:900});await page.goto(origin+'/employee/leave');await page.getByText('Available to request',{exact:true}).waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);
 const hr=await employer.newPage();await hr.goto(origin+'/dashboard/employer/requests');await hr.getByRole('button',{name:'Reject',exact:true}).click();const review=hr.getByRole('dialog');await review.getByLabel('Decision note',{exact:true}).fill('Please choose alternative dates.');await review.getByRole('button',{name:'Confirm rejection',exact:true}).click();await hr.getByText('Decision recorded. The employee has been notified.',{exact:true}).waitFor();
 const notifications=(await pool.query("SELECT COUNT(*)::int AS n FROM employee_notifications WHERE employer_id=$1 AND employee_id=$2 AND source_key LIKE 'request-decision:%'",[fixture.employer,fixture.employee])).rows[0].n;assert.equal(notifications,1);
 assert.equal((await (await employee.request.get('/api/leave')).json()).balance.available_days,20);
 const requestAxe=await new AxeBuilder({page:hr}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();assert.deepEqual(requestAxe.violations.filter(v=>['critical','serious'].includes(v.impact)).map(v=>v.id),[]);
 await hr.close();console.log('PASS concurrent leave deduplication, pending balances, mobile leave view, HR decision and one employee notification');

 const receiver=await employer.newPage();await receiver.goto(origin+'/dashboard/employer/aerochat');await page.goto(origin+'/employee/aerochat');
 const text='Disposable browser delivery '+randomUUID();await page.getByLabel('Message your team',{exact:true}).fill(text);await page.getByRole('button',{name:'Send message',exact:true}).click();
 await page.getByText('Message sent.',{exact:true}).waitFor();await receiver.getByText(text,{exact:true}).waitFor({timeout:20000});
 const delivery=randomUUID();const first=await employee.request.post('/api/aerochat',{data:{body:'Disposable retry fixture',requestId:delivery},headers:{Origin:origin}}),second=await employee.request.post('/api/aerochat',{data:{body:'Disposable retry fixture',requestId:delivery},headers:{Origin:origin}});assert.equal(first.status(),201);assert.equal(second.status(),201);assert.equal((await first.json()).message.id,(await second.json()).message.id);
 assert.equal((await pool.query("SELECT COUNT(*)::int AS n FROM aerochat_messages WHERE employer_id=$1 AND body='Disposable retry fixture'",[fixture.employer])).rows[0].n,1);
 assert.deepEqual(errors,[],'browser runtime errors');console.log('PASS cross-portal company chat delivery, retry deduplication and browser runtime checks');
} finally {await Promise.all(contexts.map(c=>c.close()));await browser.close();await pool.end();}
