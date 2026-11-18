import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.APP_BASE_URL||'http://localhost:3010';
assert.equal(new URL(base).hostname,'localhost','Browser audit must run only against disposable localhost');
const groups={
 Insights:[['All insights','/insights'],['Recruitment','/insights/a-more-consistent-recruitment-journey'],['Attendance','/insights/attendance-that-earns-trust']],
 'About Us':[['About Aerotech','/about'],['Solutions','/solutions'],['Contact','/contact'],['Support','/support']]
};
const browser=await chromium.launch(process.env.QA_CHROME?{executablePath:process.env.QA_CHROME,args:['--no-sandbox','--disable-dev-shm-usage']}:{args:['--no-sandbox','--disable-dev-shm-usage']});
const errors=[];
try{
 for(const width of [360,768,1024,1440]){
  const context=await browser.newContext({baseURL:base,viewport:{width,height:900}});
  const page=await context.newPage();
  const visit=async(path='/')=>{await page.goto(path,{waitUntil:'domcontentloaded'});await page.locator('main').first().waitFor();await page.waitForTimeout(180)};
  const noOverflow=async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Horizontal overflow at '+width+' '+page.url());
  await visit();await noOverflow();
  assert.equal(await page.locator('header a[href="/pricing"], footer a[href="/pricing"]').count(),0,'Pricing link exposed on homepage');
  assert.equal(await page.getByText('Verified figure not published').count(),0);
  assert.equal(await page.getByText('Organisations served').count(),0);
  for(const role of ['employer','employee','applicant']){
   await visit('/auth/login?role='+role);
   await page.getByRole('heading',{name:role[0].toUpperCase()+role.slice(1)+' Portal',exact:true}).waitFor();
   assert.equal(await page.getByLabel('Email address').count(),1);
   assert.equal(await page.getByLabel('Password',{exact:true}).count(),1);
   assert.equal(await page.getByLabel('Remember me').count(),1);
   assert.equal(await page.getByRole('button',{name:'Show password'}).count(),1);
   assert.equal(await page.getByRole('link',{name:'Forgot password?'}).count(),1);
   await noOverflow();
  }
  await visit();
  if(width<1024){
   for(const [title,items] of Object.entries(groups)){
    for(const [label,href] of items){
     await page.getByRole('button',{name:'Open navigation'}).click();
     const panel=page.getByRole('navigation',{name:'Mobile navigation'});
     await panel.getByRole('button',{name:title,exact:true}).click();
     await panel.getByRole('link',{name:label,exact:true}).click();
     await page.waitForURL(url=>url.pathname===href,{timeout:15000});
     assert.equal(await page.getByRole('navigation',{name:'Mobile navigation'}).count(),0,'Mobile drawer remained open');
     await page.goBack({waitUntil:'domcontentloaded'});await page.waitForURL(url=>url.pathname==='/');
     assert.equal(await page.getByRole('navigation',{name:'Mobile navigation'}).count(),0,'Back restored an open drawer');
    }
   }
  }else{
   for(const [title,items] of Object.entries(groups)){
    for(const [label,href] of items){
     const toggle=page.getByRole('button',{name:title,exact:true});
     await toggle.click();
     assert.equal(await toggle.getAttribute('aria-expanded'),'true',title+' failed to open');
     await page.getByRole('link',{name:label,exact:true}).click();
     await page.waitForURL(url=>url.pathname===href,{timeout:15000});
     assert.equal(await page.getByRole('button',{name:title,exact:true}).getAttribute('aria-expanded'),'false',title+' stayed open after navigation');
     await page.goBack({waitUntil:'domcontentloaded'});await page.waitForURL(url=>url.pathname==='/');
     assert.equal(await page.getByRole('button',{name:title,exact:true}).getAttribute('aria-expanded'),'false','Browser back restored open dropdown');
    }
   }
   const insights=page.getByRole('button',{name:'Insights',exact:true});
   await insights.click();await page.keyboard.press('Escape');
   assert.equal(await insights.getAttribute('aria-expanded'),'false','Escape failed to close dropdown');
   assert.equal(await insights.evaluate(el=>document.activeElement===el),true,'Escape did not return focus');
   await insights.focus();await page.keyboard.press('ArrowDown');await page.waitForTimeout(80);
   assert.equal(await page.getByRole('link',{name:'All insights'}).evaluate(el=>document.activeElement===el),true,'ArrowDown failed to focus first link');
   await page.keyboard.press('Escape');
   await page.getByRole('button',{name:'Insights',exact:true}).click();
   await page.getByRole('button',{name:'About Us',exact:true}).click();
   assert.equal(await page.getByRole('button',{name:'Insights',exact:true}).getAttribute('aria-expanded'),'false','Opening About did not close Insights');
  }
  console.log('PASS public UI '+width+'px: login roles, dropdown links, browser back and no overflow');
  await context.close();
 }
}finally{await browser.close()}
if(errors.length){console.error(errors);process.exitCode=1}
