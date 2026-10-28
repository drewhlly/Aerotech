import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.env.APP_BASE_URL||'http://localhost:3014';
assert.equal(new URL(base).hostname,'localhost','Use a disposable local server');
const browser=await chromium.launch(process.env.PWA_CHROME?{executablePath:process.env.PWA_CHROME,args:['--no-sandbox','--disable-dev-shm-usage']}:{});
const context=await browser.newContext({baseURL:base});
try{
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/install');await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();
 assert.equal(await page.title(),'Install Aerotech | Aerotech');
 const manifest=await (await context.request.get('/manifest.webmanifest')).json();assert.equal(manifest.display,'standalone');assert.equal(manifest.start_url,'/');assert.equal(manifest.scope,'/');
 for(const icon of manifest.icons){const r=await context.request.get(icon.src);assert.equal(r.status(),200);const png=await r.body();const size=Number(icon.sizes.split('x')[0]);assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size)}
 const sw=await context.request.get('/sw.js');assert.match(sw.headers()['cache-control'],/no-store/);
 for(const width of [360,768,1024,1280]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await page.getByRole('heading',{name:'iPhone or iPad',exact:true}).count(),1)}
 // Exercise the user gesture and dismissal path without installing software on the runner.
 await page.evaluate(()=>{const e=new Event('beforeinstallprompt');Object.assign(e,{prompt:async()=>{},userChoice:Promise.resolve({outcome:'dismissed'})});window.dispatchEvent(e)});
 await page.getByRole('button',{name:'Install Aerotech',exact:true}).click();await page.getByRole('status').filter({hasText:'Installation cancelled'}).waitFor();
 await page.evaluate(()=>{const e=new Event('beforeinstallprompt');Object.assign(e,{prompt:async()=>{},userChoice:Promise.resolve({outcome:'accepted'})});window.dispatchEvent(e)});
 await page.getByRole('button',{name:'Install Aerotech',exact:true}).click();await page.getByRole('status').filter({hasText:'Installation requested'}).waitFor();
 await page.evaluate(()=>window.dispatchEvent(new Event('appinstalled')));await page.getByRole('status').filter({hasText:'already open in app mode'}).waitFor();
 await context.setOffline(true);await page.goto('/dashboard/employer/payroll');await page.getByRole('heading',{name:'You’re offline',exact:true}).waitFor();
 await context.setOffline(false);await page.goto('/install');await page.getByRole('heading',{name:'Take your workspace with you',exact:true}).waitFor();
 const cached=await page.evaluate(async()=>{const keys=await caches.keys();return (await Promise.all(keys.map(async key=>(await (await caches.open(key)).keys()).map(r=>new URL(r.url).pathname)))).flat()});assert.deepEqual(cached,['/offline.html']);assert.deepEqual(errors,[]);
 console.log('PASS PWA manifest, square PNG icons, worker headers, install/dismiss states, 4 widths, offline navigation, reconnect and private-data cache exclusion');
}finally{await context.close();await browser.close()}
