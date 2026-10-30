import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';
export async function verifyRecruitmentUI(context,jobId,applicationId){
 for(const viewport of [{width:360,height:844},{width:1280,height:900}]){
  const page=await context.newPage();await page.setViewportSize(viewport);await page.goto('/dashboard/employer/recruitment/candidates?job='+jobId);
  await page.getByRole('heading',{name:'Candidate pipeline',exact:true}).first().waitFor();
  await page.getByLabel('Search candidates',{exact:true}).fill('candidate-fixture@example.invalid');
  await page.getByRole('button',{name:'Review candidate',exact:true}).first().waitFor();
  assert.equal(await page.getByLabel('Role',{exact:true}).inputValue(),jobId);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  await page.getByRole('button',{name:'Review candidate',exact:true}).first().click();
  const dialog=page.getByRole('dialog',{name:'Test Applicant',exact:true});await dialog.waitFor();
  assert.equal(await dialog.getByRole('button',{name:'Pass checks & shortlist',exact:true}).isDisabled(),true);
  assert.ok((await dialog.getByRole('link',{name:'Download CV',exact:true}).getAttribute('href')).startsWith('/api/workforce-documents?role=employer&'));
  const result=await new AxeBuilder({page}).include('main').analyze();assert.deepEqual(result.violations.filter(v=>['critical','serious'].includes(v.impact)).map(v=>v.id),[]);
  if(viewport.width===1280){
   await dialog.getByRole('checkbox').first().check();await dialog.getByRole('button',{name:'Pass checks & shortlist',exact:true}).click();await dialog.waitFor({state:'hidden'});
   await page.getByRole('button',{name:'Schedule interview',exact:true}).first().click();await dialog.waitFor();
   await dialog.getByLabel('Interview time (your local timezone)',{exact:true}).fill(new Date(Date.now()+3600000).toISOString().slice(0,16));
   await dialog.getByRole('button',{name:'Schedule interview',exact:true}).click();await dialog.waitFor({state:'hidden'});
   const data=await(await context.request.get('/api/ats?view=employer')).json(),candidate=data.applications.find(a=>a.id===applicationId);
   assert.equal(candidate.stage,'interview');assert.ok(candidate.interview_room_id);
  }else{await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'})}
  await page.evaluate(()=>{document.documentElement.dataset.theme='dark'});
  const dark=await new AxeBuilder({page}).include('main').analyze();assert.deepEqual(dark.violations.filter(v=>['critical','serious'].includes(v.impact)).map(v=>v.id),[]);
  await page.evaluate(()=>{document.documentElement.dataset.theme='light'});
  await page.close();
 }
 console.log('PASS modern recruitment: mobile/desktop filtered pipeline, isolated CV access, guarded employer checks, automatic shortlist, interview room creation, panels close after save and no serious/critical axe findings.');
}
