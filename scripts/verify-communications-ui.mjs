// Uses only disposable localhost accounts created by phase2-test-db.mjs.
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:3100';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||chromium.executablePath(),headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const failures=[];
try{
 const publicContext=await browser.newContext({baseURL:origin});const page=await publicContext.newPage();page.on('pageerror',e=>failures.push(e.message));
 for(const width of [360,768,1440]){
  await page.setViewportSize({width,height:1000});await page.goto('/');
  for(const [name,heading] of [['Applicants','Your next chapter starts here.'],['Employees','Your workday. In one place.'],['Employers','Bring your people together.']]){
   await page.getByRole('button',{name,exact:true}).click();await page.getByRole('heading',{name:heading,exact:true}).waitFor();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'landing overflow '+width+' '+name);
  }
 }
 const publicAxe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();assert.deepEqual(publicAxe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
 await page.screenshot({path:'/tmp/aerotech-landing-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/aerotech-landing-mobile.png',fullPage:true});
 for(const role of ['applicant','employee','employer']){
  const c=await browser.newContext({baseURL:origin});await c.addCookies([{name:'aerotech_'+role+'_session',value:'phase2-test-'+role,url:origin,httpOnly:true,sameSite:'Lax'}]);const p=await c.newPage();p.on('pageerror',e=>failures.push(e.message));const home=role==='employer'?'/dashboard/employer':'/'+role;
  for(const width of [360,1440]){
   await p.setViewportSize({width,height:900});await p.goto(home);
   await p.getByRole('button',{name:role+' account menu'}).click();assert.equal(await p.getByRole('button',{name:role+' account menu'}).getAttribute('aria-expanded'),'true');
   await p.locator('#workspace-account-panel').getByRole('link',{name:'Account & profile',exact:true}).click();await p.waitForURL(home+(role==='employer'?'/account':'/profile'));assert.equal(await p.getByRole('button',{name:role+' account menu'}).getAttribute('aria-expanded'),'false');
   await p.getByRole('button',{name:role+' account menu'}).click();await p.locator('#workspace-account-panel').getByRole('link',{name:'Email preferences',exact:true}).click();await p.getByRole('heading',{name:'Email preferences',exact:true}).waitFor();await p.getByRole('button',{name:'Save preferences',exact:true}).waitFor();
   await p.getByLabel('Aerotech newsletter',{exact:true}).check();await p.getByRole('button',{name:'Save preferences',exact:true}).click();await p.getByRole('status').filter({hasText:'Your email preferences have been saved.'}).waitFor();
   await p.reload();await p.getByRole('button',{name:'Save preferences',exact:true}).waitFor();assert.equal(await p.getByLabel('Aerotech newsletter',{exact:true}).isChecked(),true);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'preferences overflow '+role+' '+width);
   if(width===360){await p.getByRole('button',{name:'Open navigation',exact:true}).click();await p.locator('aside').getByRole('link',{name:'Account & profile',exact:true}).click();await p.waitForURL(home+(role==='employer'?'/account':'/profile'));}
  }
  await p.goto(home+'/email-preferences');await p.getByRole('button',{name:'Save preferences'}).waitFor();const axe=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa']).analyze();assert.deepEqual(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],role+' accessibility');
  await p.screenshot({path:'/tmp/aerotech-'+role+'-workspace.png',fullPage:true});await c.close();
 }
 const c=await browser.newContext({baseURL:origin});await c.addCookies([{name:'aerotech_support_session',value:'phase2-test-admin',url:origin,httpOnly:true,sameSite:'Lax'}]);const admin=await c.newPage();await admin.goto('/admin/communications');await admin.getByRole('heading',{name:'Communications',exact:true}).waitFor();assert.equal(await admin.getByRole('button',{name:'Schedule email',exact:true}).isEnabled(),true);assert.equal((await c.request.get('/api/communications/announcements')).status(),200);
 assert.deepEqual(failures,[]);console.log('PASS: manual landing slides at 360/768/1440, account menus and bottom profile links, persisted preferences across 3 portals at mobile/desktop, admin console, no horizontal overflow, WCAG A/AA axe checks and no browser errors.');
}finally{await browser.close()}
