const C='speleogis-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(clients.claim()));
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||r.headers.has('range'))return; // PMTiles/FGB Range-Requests direkt durchreichen
  e.respondWith(fetch(r).then(res=>{
    if(res.ok){const c=res.clone();caches.open(C).then(x=>x.put(r,c))}
    return res;
  }).catch(()=>caches.match(r)));
});
