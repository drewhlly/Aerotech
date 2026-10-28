/* Only public connection guidance is cached. Never cache HR pages, API responses or credentials. */
const CACHE='aerotech-public-offline-v1';
const OFFLINE='/offline.html';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([OFFLINE])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('aerotech-public-offline-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||event.request.mode!=='navigate'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith(fetch(event.request).catch(async()=>{const fallback=await caches.match(OFFLINE);return fallback||new Response('Aerotech requires an internet connection.',{status:503,headers:{'Content-Type':'text/plain'}})}));
});
