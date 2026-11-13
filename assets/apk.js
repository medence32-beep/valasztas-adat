/* Csak az Android-alkalmazásban: ha az értesítések ki vannak kapcsolva, egy sáv szól róla (bekapcsolás egy gombnyomással). */
(function(){
"use strict";
var B=window.AppBridge;if(!B||!B.ertesitesek)return;
function on(){try{return B.ertesitesek()==="on";}catch(e){return true;}}
var K="vm-ertsav";
function sav(){
  if(on()||document.getElementById("ertsav"))return;
  try{var t=+localStorage.getItem(K)||0;if(Date.now()-t<3*864e5)return;}catch(e){}
  var d=document.createElement("div");d.id="ertsav";
  d.innerHTML='<span>🔔 Az értesítések ki vannak kapcsolva – így nem kapsz hírt az eredményekről.</span><button type="button" class="ok">Bekapcsolom</button><button type="button" class="x" aria-label="Bezárás">×</button>';
  d.style.cssText="position:fixed;left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:9999;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:#16223D;color:#EEF2FA;border:1px solid #2A3A60;box-shadow:0 8px 24px rgba(0,0,0,.4);font:500 14px/1.35 Barlow,system-ui,sans-serif";
  var sp=d.querySelector("span");sp.style.flex="1";
  var ok=d.querySelector(".ok");ok.style.cssText="flex:none;border:0;border-radius:999px;padding:8px 14px;background:#F5B83D;color:#0B1222;font:700 14px Barlow,sans-serif";
  var x=d.querySelector(".x");x.style.cssText="flex:none;border:0;background:none;color:#9DABC8;font-size:22px;line-height:1;padding:0 4px";
  ok.onclick=function(){try{B.engedely();}catch(e){}};
  x.onclick=function(){try{localStorage.setItem(K,Date.now());}catch(e){}d.remove();};
  document.body.appendChild(d);
}
/* visszatéréskor (pl. a beállításokból) újra megnézzük */
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible"){var d=document.getElementById("ertsav");if(d&&on())d.remove();}});
setTimeout(sav,2500);
/* tartalék kézbesítés: amíg az app nyitva van, az oldal maga is megnézi az értesítéseket, és az appon át megjeleníti
   (ugyanazzal az azonosítóval, mint a háttér-ellenőrzés, így nem lesz belőle kettő) */
var SK="vm-ert-l";
function kor(){
  if(!B.ertesit||!on())return;
  fetch("ertesitesek.json?_="+Date.now(),{cache:"no-store"}).then(function(r){return r.ok?r.json():null;}).then(function(d){
    if(!d||!d.items)return;var l={};try{l=JSON.parse(localStorage.getItem(SK)||"{}");}catch(e){}
    var most=Date.now(),v=false,egy=false; /* egyszerre legfeljebb a legújabbat mutatjuk (a lista elején van) */
    d.items.forEach(function(it){if(!it.id||l[it.id])return;l[it.id]=most;v=true;
      if(!egy&&it.ts&&most-it.ts<6*3600e3){egy=true;try{B.ertesit("f:"+it.id,it.title||"Voksmérő",it.body||"",it.url||"https://voksmero.hu/");}catch(e){}}});
    for(var k in l)if(most-l[k]>30*864e5)delete l[k];
    if(v)try{localStorage.setItem(SK,JSON.stringify(l));}catch(e){}
  }).catch(function(){});
}
setTimeout(kor,3000);setInterval(function(){if(document.visibilityState==="visible")kor();},120000);
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible")setTimeout(kor,800);});
})();
