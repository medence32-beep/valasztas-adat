/* Frissítésjelző: ha az assets/ver.json „v” értéke megváltozik, amíg az oldal nyitva van,
   alul megjelenik egy sáv „Frissítés” gombbal. Kényszerített frissítéshez a ver.json-ban emeld a „v”-t. */
(function(){"use strict";var V0=null;
function show(m){if(document.getElementById("vfr"))return;var d=document.createElement("div");d.id="vfr";d.setAttribute("role","status");
  d.style.cssText="position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:400;display:flex;align-items:center;gap:12px;max-width:calc(100% - 24px);padding:10px 10px 10px 16px;border-radius:999px;background:#0B1630;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.35);font:600 14px/1.3 system-ui,sans-serif";
  var s=document.createElement("span");s.textContent=m||"Frissült az oldal – töltsd újra a legújabb változatért.";
  var b=document.createElement("button");b.type="button";b.textContent="Frissítés";b.style.cssText="flex:none;border:0;border-radius:999px;padding:8px 14px;background:#F2B233;color:#14100a;font:800 14px system-ui,sans-serif;cursor:pointer";
  b.onclick=function(){location.reload();};d.appendChild(s);d.appendChild(b);document.body.appendChild(d);}
function chk(){fetch("assets/ver.json?"+Date.now(),{cache:"no-store"}).then(function(r){return r.json();}).then(function(j){if(V0===null){V0=j.v;return;}if(j.v!==V0)show(j.m);}).catch(function(){});}
chk();setInterval(function(){if(document.visibilityState==="visible")chk();},90000);
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible")chk();});
})();
