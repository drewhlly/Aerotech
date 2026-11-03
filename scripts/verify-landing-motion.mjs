// Public UI only, on disposable localhost. No account or provider actions.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.env.APP_BASE_URL||'http://localhost:3010';
assert.equal(new URL(base).hostname,'localhost');
const browser=await chromium.launch();
const headings=['Your next chapter starts here.','Your workday. In one place.','Bring your people together.'];
try{
 const context=await browser.newContext({baseURL:base,reducedMotion:'no-preference'}),page=await context.newPage();
 await page.clock.install();await page.goto('/');
 const carousel=page.getByRole('region',{name:'Discover your Aerotech workspace'});
 await page.getByRole('button',{name:'Pause automatic slides',exact:true}).waitFor();
 const current=()=>carousel.locator('h1').innerText();
 const unfocus=async()=>{await page.mouse.move(0,0);await page.evaluate(()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur()})};
 assert.equal(await current(),headings[0]);
 await page.clock.runFor(7000);assert.equal(await current(),headings[1],'slides advance automatically');
 await page.getByRole('button',{name:'Pause automatic slides',exact:true}).click();await unfocus();await page.clock.runFor(14000);assert.equal(await current(),headings[1],'explicit pause');
 await page.getByRole('button',{name:'Resume automatic slides',exact:true}).click();await unfocus();await page.clock.runFor(7000);assert.equal(await current(),headings[2],'resume');
 await carousel.hover();await page.clock.runFor(14000);assert.equal(await current(),headings[2],'hover pauses');
 await page.mouse.move(0,0);await page.clock.runFor(7000);assert.equal(await current(),headings[0],'rotation wraps');
 await carousel.getByRole('link',{name:'Find your next role'}).focus();await page.clock.runFor(14000);assert.equal(await current(),headings[0],'keyboard focus pauses');
 await unfocus();await page.clock.runFor(7000);assert.equal(await current(),headings[1]);
 await page.getByRole('button',{name:'Employers',exact:true}).click();await unfocus();await page.clock.runFor(14000);assert.equal(await current(),headings[2],'manual navigation stays selected');
 for(const width of [360,768,1280]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'carousel overflow at '+width)}
 const reduced=await browser.newContext({baseURL:base,reducedMotion:'reduce'}),quiet=await reduced.newPage();
 await quiet.clock.install();await quiet.goto('/');await quiet.getByText('Motion reduced',{exact:true}).waitFor();await quiet.clock.runFor(14000);assert.equal(await quiet.locator('#workspace-slide h1').innerText(),headings[0]);
 assert.equal(await quiet.locator('#workspace-slide').evaluate(e=>getComputedStyle(e).animationName),'none');
 await quiet.getByRole('button',{name:'Employees',exact:true}).click();assert.equal(await quiet.locator('#workspace-slide h1').innerText(),headings[1]);
 await context.close();await reduced.close();
 console.log('PASS automatic landing rotation, wrap, pause/resume, hover, keyboard focus, manual controls, reduced motion and responsive widths');
}finally{await browser.close()}
