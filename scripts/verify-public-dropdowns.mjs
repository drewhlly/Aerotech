// Read-only public navigation regression checks. No production credentials.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.env.APP_BASE_URL||'http://127.0.0.1:3189';
const browser=await chromium.launch({headless:true,args:['--no-sandbox'],...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{})});
const groups={
 'Insights':['All insights','Recruitment','Attendance'],
 'About Us':['About Aerotech','Solutions','Contact','Support'],
};
try{
 for(const width of [360,768,1024,1440]){
  const context=await browser.newContext({viewport:{width,height:900},baseURL:base});
  const page=await context.newPage();
  await page.goto('/');
  assert.equal(await page.getByText('Verified figure not published').count(),0);
  assert.equal(await page.locator('.marketing-stats').count(),0);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'overflow at '+width);
  if(width>=1024){
   const nav=page.getByRole('navigation',{name:'Public navigation'});
   const insights=nav.getByRole('button',{name:'Insights'}),about=nav.getByRole('button',{name:'About Us'});
   await insights.click();assert.equal(await insights.getAttribute('aria-expanded'),'true');
   await about.click();assert.equal(await insights.getAttribute('aria-expanded'),'false');assert.equal(await about.getAttribute('aria-expanded'),'true');
   await page.keyboard.press('Escape');assert.equal(await about.getAttribute('aria-expanded'),'false');assert.equal(await about.evaluate(e=>document.activeElement===e),true);
   await insights.click();await page.getByRole('main').click({position:{x:10,y:10}});assert.equal(await insights.getAttribute('aria-expanded'),'false');
   await insights.focus();await page.keyboard.press('ArrowDown');assert.equal(await insights.getAttribute('aria-expanded'),'true');assert.equal(await page.locator('.marketing-dropdown[data-open="true"] a').first().evaluate(e=>document.activeElement===e),true);
   await page.keyboard.press('ArrowDown');await page.keyboard.press('Escape');assert.equal(await insights.getAttribute('aria-expanded'),'false');
   for(const [group,items] of Object.entries(groups)){
    for(const item of items){
     await nav.getByRole('button',{name:group}).click();
     const href=await page.locator('.marketing-dropdown[data-open="true"] a').filter({hasText:item}).first().getAttribute('href');
     await page.locator('.marketing-dropdown[data-open="true"] a').getByText(item,{exact:true}).click();
     await page.waitForURL(url=>url.pathname===new URL(href,base).pathname);
     await page.goBack();await page.waitForURL(base+'/');
     assert.equal(await nav.getByRole('button',{name:group}).getAttribute('aria-expanded'),'false','desktop close/back '+group+'/'+item);
    }
   }
  }else{
   for(const [group,items] of Object.entries(groups)){
    for(const item of items){
     await page.getByRole('button',{name:'Open navigation'}).click();
     const drawer=page.getByRole('navigation',{name:'Mobile navigation'});
     await drawer.getByRole('button',{name:group}).click();
     const link=drawer.getByRole('link',{name:item,exact:true});
     const href=await link.getAttribute('href');await link.click();
     await page.waitForURL(url=>url.pathname===new URL(href,base).pathname);
     assert.equal(await drawer.count(),0,'mobile drawer closes after selection');
     await page.goBack();await page.waitForURL(base+'/');
     assert.equal(await page.getByRole('navigation',{name:'Mobile navigation'}).count(),0,'mobile back keeps menu closed');
    }
   }
  }
  await context.close();console.log('PASS public dropdown navigation at '+width+'px');
 }
}finally{await browser.close()}
