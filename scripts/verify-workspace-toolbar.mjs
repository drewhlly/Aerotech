import assert from 'node:assert/strict';
import {linkAllowed} from '../src/lib/portal-policy.ts';
/** Uses only the disposable signed-in CI context supplied by verify-signed-in. */
export async function verifyWorkspaceToolbar(context,role,home){
 for(const viewport of [{width:320,height:800},{width:360,height:800},{width:768,height:900},{width:1280,height:900}]){
  const page=await context.newPage();await page.setViewportSize(viewport);await page.goto(home);
  const header=page.locator('header.workspace-topbar');await header.waitFor();
  await page.getByRole('button',{name:'Search workspace, Control or Command K',exact:true}).waitFor();
  const geometry=await header.evaluate(element=>({width:window.innerWidth,right:element.getBoundingClientRect().right,overflow:document.documentElement.scrollWidth>window.innerWidth+1,targets:[...element.querySelectorAll('button,a')].filter(e=>e.getClientRects().length).map(e=>({label:e.getAttribute('aria-label')||e.textContent,rect:e.getBoundingClientRect().toJSON()}))}));
  assert.equal(geometry.overflow,false,role+' header must not overflow at '+viewport.width);
  for(const target of geometry.targets){assert.ok(target.rect.height>=44-1,`${role} ${target.label} needs a 44px target`);assert.ok(target.rect.right<=geometry.width+1,`${role} ${target.label} is clipped`)}
  await page.keyboard.press('Control+k');
  const dialog=page.getByRole('dialog',{name:'Search your workspace',exact:true});await dialog.waitFor();
  const input=dialog.getByRole('searchbox',{name:'Search',exact:true});await input.waitFor();
  await page.waitForFunction(()=>document.activeElement?.id==='workspace-command-input');
  await input.fill('Privacy');
  const privacy=dialog.getByRole('link',{name:'Privacy settings',exact:true});await privacy.waitFor();assert.equal(linkAllowed(role,await privacy.getAttribute('href')),true);
  for(const href of await dialog.getByRole('link').evaluateAll(elements=>elements.map(e=>e.getAttribute('href'))))assert.equal(linkAllowed(role,href),true);
  await dialog.getByRole('button',{name:'Clear search',exact:true}).click();assert.equal(await input.inputValue(),'');
  await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
  await page.getByRole('button',{name:'Use dark mode',exact:true}).click();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await page.getByRole('button',{name:'Use light mode',exact:true}).click();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  await page.getByRole('button',{name:role+' account menu',exact:true}).click();await page.locator('.workspace-account-menu').waitFor();
  for(const href of await page.locator('.workspace-account-menu a').evaluateAll(elements=>elements.map(e=>e.getAttribute('href'))))assert.equal(linkAllowed(role,href),true);
  await page.keyboard.press('Escape');await page.locator('.workspace-account-menu').waitFor({state:'hidden'});
  await page.close();
 }
 console.log('PASS '+role+' toolbar: mobile/tablet/desktop layout, touch targets, focused keyboard search, clear, Escape, theme controls and isolated account links');
}
