/* Travel Boston offline cache.
   Everything the game needs is saved on the device the first time it opens.
   With a signal it fetches fresh files (so updates show up); with no signal, or a slow one, it plays from the saved copy. */
const C='travelboston-v17';
const FILES=['./','index.html','three.min.js','core.js','world.js','aircraft.js','places.js','region.js','life.js','train.js','fly.js','model.js','tunnel.js','acela.js','subway.js','main.js',
 'manifest.webmanifest','baloo-600.woff2','baloo-800.woff2','icon-180.png','icon-192.png','icon-512.png','icon-maskable.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>Promise.all(FILES.map(f=>fetch(f,{cache:'reload'}).then(r=>{if(!r.ok)throw 0;return c.put(f,r);})))));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
const saved=req=>caches.match(req,{ignoreSearch:true}).then(m=>m||(req.mode==='navigate'?caches.match('index.html'):undefined));
self.addEventListener('fetch',e=>{const q=e.request;if(q.method!=='GET'||new URL(q.url).origin!==location.origin)return;
  e.respondWith(new Promise(done=>{let fin=false;const use=r=>{if(!fin&&r){fin=true;done(r);}};
    const t=setTimeout(()=>saved(q).then(use),2500);            /* slow signal: don't keep a toddler waiting */
    fetch(q).then(r=>{clearTimeout(t);if(r&&r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(q,cp));use(r);}else saved(q).then(m=>use(m||r));})
      .catch(()=>{clearTimeout(t);saved(q).then(m=>use(m||Response.error()));});}));});
self.addEventListener('message',e=>{if(e.data==='check')caches.open(C).then(c=>c.keys()).then(k=>e.source.postMessage({saved:k.length>=FILES.length}));});
