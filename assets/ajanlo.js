/* „Fedezd fel” blokk minden oldal alján (a lábléc előtt): játékok és felfedező oldalak + visszaszámlálás a következő választásig. */
(function(){
"use strict";
var pg=(location.pathname.replace(/^\/+|\/+$/g,"").replace(/\.html$/,"")||"index");
if(/^(index|stat-|bohoc|404)/.test(pg)||document.getElementById("fedezd"))return;
var L=[
 ["napi-rejtveny","🧩","Napi országrejtvény","Melyik ország ez? Hat tipped van – minden nap új feladvány."],
 ["telepulesem","🏘️","Hogy szavazott a településed?","Részvétel, eredmény és rangsor településenként (2026)."],
 ["usa-terkep","🗺️","Rajzold meg a térképed","Színezd ki az amerikai államokat 270 elektorig."],
 ["spanyol-tippjatek","🎯","Tippeld meg a spanyol választást","Választás estéjén kiderül, mennyire voltál pontos."],
 ["magyar-valasztasok-tortenete","⏳","Választások 1990–2026","Interaktív idővonal mind a tíz magyar választással."],
 ["spanyol-szimulator","🎛️","Spanyol szimulátor","Állítsd be a pártokat, és nézd, hány mandátum jön ki."],
 ["szimulator","🇭🇺","Magyar szimulátor","Mi lett volna, ha…? Számold újra a parlamentet."]
].filter(function(x){return x[0]!==pg;});
var day=Math.floor(Date.now()/864e5),k0=day%L.length;var pick=L.slice(k0).concat(L.slice(0,k0)).slice(0,4);
var css=".fdz{max-width:1240px;margin:34px auto 0;padding:0 max(18px,env(safe-area-inset-right,0px)) 10px max(18px,env(safe-area-inset-left,0px))}"+
".fdz h2{font:900 clamp(28px,3.6vw,40px)/1 var(--f-display);text-transform:uppercase;margin:6px 0 16px}"+
".fdz .g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 28px;border-top:1px solid var(--line2)}@media(max-width:760px){.fdz .g{grid-template-columns:1fr}}"+
".fdz .g a{display:grid;grid-template-columns:40px minmax(0,1fr);gap:2px 12px;align-items:baseline;padding:14px 2px;border-bottom:1px solid var(--line2);text-decoration:none;color:var(--ink);transition:padding .2s,background .2s}"+
".fdz .g a:hover{padding-left:8px;background:color-mix(in srgb,var(--acc) 6%,transparent)}.fdz .g a i{font:700 12px var(--f-mono,monospace);font-style:normal;color:var(--ink3);grid-row:span 2}.fdz .g a b{display:block;font:800 18px/1.15 var(--f-display);text-transform:uppercase}.fdz .g a small{display:block;color:var(--ink2);font-size:13.5px;line-height:1.4}"+
".fdz .nx{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;margin-top:12px;padding:12px 16px;border-radius:16px;background:linear-gradient(90deg,color-mix(in srgb,var(--acc) 14%,var(--card)),var(--card));border:1px solid var(--line)}"+
".fdz .nx img{width:34px;height:23px;border-radius:4px;object-fit:cover}.fdz .nx b{font:800 16px var(--f-display)}.fdz .nx .d{margin-left:auto;font:900 26px var(--f-display);color:var(--acc);font-variant-numeric:tabular-nums}.fdz .nx .d small{font:700 12px var(--f-body);color:var(--ink2);margin-left:4px}";
var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});};
var s=document.createElement("section");s.className="fdz";s.id="fedezd";
s.innerHTML='<span class="kicker">Játssz és fedezd fel</span><h2>Ezt is nézd meg</h2><div class="g">'+pick.map(function(x,i){return '<a href="'+x[0]+'"><i>0'+(i+1)+'</i><b>'+esc(x[2])+'</b><small>'+esc(x[3])+'</small></a>';}).join("")+'</div><div class="nx" id="fdzn" hidden></div>';
var f=document.querySelector("footer");if(f)f.parentNode.insertBefore(s,f);else document.body.appendChild(s);
fetch("assets/data/naptar.json").then(function(r){return r.json();}).then(function(d){
  var td=new Date().toLocaleDateString("sv-SE",{timeZone:"Europe/Budapest"});var n=(d.v||[]).filter(function(x){return x.d>=td;}).sort(function(a,b){return a.d<b.d?-1:1;})[0];if(!n)return;
  var days=Math.round((Date.parse(n.d+"T00:00:00Z")-Date.parse(td+"T00:00:00Z"))/864e5);var V=window.VALASZTAS,nm=V&&V.name?V.name(n.k):n.k;
  var href=V&&V.READY&&V.READY[n.k]?V.READY[n.k].href:"naptar";var e=document.getElementById("fdzn");
  e.innerHTML='<img src="https://flagcdn.com/w80/'+n.k.toLowerCase()+'.png" alt=""><span><small style="color:var(--ink2);font-size:12px;display:block">Következő választás</small><b>'+esc(nm)+' – '+esc(n.t)+'</b></span><a href="'+href+'" style="padding:0;border:0;background:none;display:inline;color:var(--acc);font-weight:700">Részletek →</a><span class="d">'+(days===0?'Ma!':days+'<small>nap múlva</small>')+'</span>';e.hidden=false;
}).catch(function(){});
})();
