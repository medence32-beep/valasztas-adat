/* Választások – offline gyorsítótár.
   Oldalak és élő adatok: mindig a hálózatról, gyorsítótár csak tartaléknak (offline).
   Statikus fájlok: azonnal a gyorsítótárból, közben a háttérben frissül. */
const V="v52",CORE="core-"+V,RT="rt-"+V;
const PRE=["./","index.html","eredmenyek","spanyol-valasztas","spanyol-szimulator","spanyol-valasztas.html","spanyol-szimulator.html","eredmenyek.html","magyarorszag.html","szimulator.html","orszag.html","spanyolorszag.html","nemetorszag.html","ausztria.html","szlovakia.html","romania.html","egyesult-allamok.html","valasztasi-rendszer.html","naptar.html","404.html",
  "assets/portal.css?v=15","assets/orszagok.js?v=10","assets/fastzoom.js?v=1","assets/anim.js?v=3","assets/terkep-anim.js?v=4","assets/app.js?v=9","assets/app/icon-192.png?v=3","manifest.webmanifest"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CORE).then(c=>Promise.all(PRE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CORE&&k!==RT).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
const LIVE=/\/(data|status|countylive|countyres|ertesitesek)\.json$/;
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
  if(u.origin!==location.origin)return; /* külső (AP, GitHub, betűk): nem nyúlunk hozzá */
  const isPage=r.mode==="navigate"||/\.html$/.test(u.pathname)||u.pathname.endsWith("/");
  if(isPage||LIVE.test(u.pathname)){
    const key=u.origin+u.pathname;
    e.respondWith((isPage?fetch(r.url,{cache:"no-cache",credentials:"same-origin"}).then(res=>res.redirected?Response.redirect(res.url,302):res):fetch(r)).then(res=>{if(res.type==="opaqueredirect"||res.status===302)return res;if(res.ok){const cp=res.clone();caches.open(RT).then(c=>c.put(key,cp));}return res;})
      .catch(()=>caches.match(key,{ignoreSearch:true}).then(m=>m||(isPage?caches.match("index.html"):Response.error()))));return;}
  e.respondWith(caches.match(r).then(m=>{const net=fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(RT).then(c=>c.put(r,cp));}return res;}).catch(()=>m);return m||net;}));});
