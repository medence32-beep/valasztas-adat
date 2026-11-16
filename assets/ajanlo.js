/* „Nézz körül” blokk minden oldal alján (a lábléc előtt): következő választás + három másik oldal, a főoldali kártyák stílusában. */
(function(){
"use strict";
var pg=(location.pathname.replace(/^\/+|\/+$/g,"").replace(/\.html$/,"")||"index");
if(/^(index|stat-|bohoc|404)/.test(pg)||document.getElementById("fedezd"))return;
var L=[
 ["napi-szo","Napi játék","Napi szó","linear-gradient(140deg,#1C3320,#2E6B3A 55%,#A8840F)","szavak"],
 ["napi-rejtveny","Napi játék","Melyik ország ez?","linear-gradient(120deg,#0B2A3C,#14506A 50%,#1B7F86)","vilag"],
 ["telepulesem","Kereső","Hogy szavazott a településed?","linear-gradient(150deg,#16231C,#24402E 55%,#5A3A12)","magyar"],
 ["usa-terkep","Térképrajzoló","Rajzold meg a saját térképed","linear-gradient(140deg,#0B1B45,#13285C 55%,#3A1020)","usa"],
 ["spanyol-tippjatek","Tippjáték","Tippeld meg a spanyol választást","linear-gradient(150deg,#3A0A0E,#7E1218 55%,#B07A00)","spanyol"],
 ["magyar-valasztasok-tortenete","Idővonal","A magyar választások 1990–2026","linear-gradient(120deg,#1B1F5E,#3A2A8C 45%,#7B3FA0)","foto"],
 ["spanyol-szimulator","Szimulátor","Spanyol választási szimulátor","linear-gradient(120deg,#4A0B10,#9E141A 55%,#C78B00)","parl"],
 ["szimulator","Szimulátor","Magyar választási szimulátor","linear-gradient(120deg,#16231C,#1D3326 50%,#3B1416)","magyar"]
].filter(function(x){return x[0]!==pg;});
var day=Math.floor(Date.now()/864e5),k0=day%L.length,pick=L.slice(k0).concat(L.slice(0,k0)).slice(0,4);
var css=".fdz{max-width:1240px;margin:34px auto 0;padding:0 max(18px,env(safe-area-inset-right,0px)) 10px max(18px,env(safe-area-inset-left,0px))}"+
".fdz h2{font:800 19px var(--f-display);text-transform:uppercase;letter-spacing:.02em;margin:0 0 12px}"+
".fdz .g{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.fdz .g>a:nth-child(5){display:none}@media(max-width:900px){.fdz .g{grid-template-columns:repeat(2,minmax(0,1fr))}.fdz .g>a:nth-child(5){display:flex}.fdz .g>a.nx{grid-column:1/-1;min-height:0}.fdz .g>a{min-height:104px}}"+
".fdz .g>a{isolation:isolate;position:relative;display:flex;flex-direction:column;min-height:120px;padding:14px 16px;border-radius:16px;text-decoration:none;color:#fff;overflow:hidden;transition:transform .25s,box-shadow .25s}"+
".fdz .g>a:hover{transform:translateY(-3px);box-shadow:var(--shadow)}"+
".fdz .bg{position:absolute;z-index:-1;pointer-events:none;background-repeat:no-repeat}"+".fdz .b-vilag{inset:0;background-image:url(assets/hatter/vilag.svg);background-size:220% auto;background-position:62% 40%;opacity:.13}"+".fdz .b-szavak{right:-28px;top:-30px;width:170px;height:170px;background-image:url(assets/hatter/szavak.svg);background-size:contain;opacity:.17;transform:rotate(-8deg)}"+".fdz .b-magyar{right:-22px;bottom:-8px;width:88%;height:88%;background-image:url(assets/hatter/magyar.svg);background-size:contain;background-position:right bottom;opacity:.14}"+".fdz .b-usa{right:-20px;bottom:-6px;width:88%;height:85%;background-image:url(assets/hatter/usa.svg);background-size:contain;background-position:right bottom;opacity:.14}"+".fdz .b-spanyol{right:-10px;bottom:-14px;width:58%;height:96%;background-image:url(assets/hatter/spanyol.svg);background-size:contain;background-position:right bottom;opacity:.15}"+".fdz .b-parl{right:-6px;bottom:-4px;width:74%;aspect-ratio:480/250;background-image:url(assets/hatter/parlament.svg);background-size:contain;opacity:.22}"+".fdz .b-foto{right:0;top:0;bottom:0;width:62%;background-image:url(assets/hatter/gyurcsany.webp);background-size:cover;background-position:center 20%;opacity:.5;-webkit-mask-image:linear-gradient(90deg,transparent,#000 55%);mask-image:linear-gradient(90deg,transparent,#000 55%)}"+".fdz .crd{position:absolute;left:16px;bottom:9px;font:600 8.5px var(--f-body);opacity:.5}"+".fdz .nx .bg{right:0;top:0;bottom:0;width:58%;background-size:cover;background-position:center;opacity:.13;-webkit-mask-image:linear-gradient(90deg,transparent,#000 70%);mask-image:linear-gradient(90deg,transparent,#000 70%)}"+".fdz .g small{font:700 10.5px var(--f-body);letter-spacing:.12em;text-transform:uppercase;opacity:.75}"+
".fdz .g b{display:block;margin-top:6px;font:800 19px/1.08 var(--f-display);text-transform:uppercase;letter-spacing:.01em;max-width:15ch}"+
".fdz .g i{margin-top:auto;align-self:flex-end;font-style:normal;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.14);font-weight:700;transition:transform .25s}.fdz .g>a:hover i{transform:translateX(3px)}"+
".fdz .g>a.nx{background:var(--card);color:var(--ink);border:1px solid var(--line)}.fdz .nx small{color:var(--ink2);opacity:1}"+
".fdz .nx .r{display:flex;align-items:center;gap:10px;margin-top:8px}.fdz .nx .r>span{min-width:0}.fdz .nx img{width:36px;height:24px;border-radius:4px;object-fit:cover;flex:none}"+
".fdz .nx b{margin:0;font-size:18px;max-width:none}.fdz .nx .s{display:block;font:600 12.5px var(--f-body);color:var(--ink2);margin-top:2px}"+
".fdz .nx .d{margin-top:auto;padding-top:8px;display:flex;align-items:baseline;gap:5px;font:900 30px/1 var(--f-display);color:var(--acc);font-variant-numeric:tabular-nums}.fdz .nx .d span{font:700 12px var(--f-body);color:var(--ink2)}";
var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});};
var s=document.createElement("section");s.className="fdz";s.id="fedezd";
s.innerHTML='<h2>Nézz körül</h2><div class="g"><a class="nx" id="fdzn" href="naptar"><small>Következő választás</small><span class="r"><span><b>Naptár</b><span class="s">Közelgő választások a világban</span></span></span><span class="d"></span></a>'+
 pick.map(function(x){return '<a href="'+x[0]+'" style="background:'+x[3]+'"><span class="bg b-'+x[4]+'" aria-hidden="true"></span>'+(x[4]==="foto"?'<span class="crd">Fotó: kremlin.ru · CC BY 4.0 · módosítva</span>':'')+'<small>'+esc(x[1])+'</small><b>'+esc(x[2])+'</b><i>→</i></a>';}).join("")+'</div>';
var f=document.querySelector("footer");if(f)f.parentNode.insertBefore(s,f);else document.body.appendChild(s);
fetch("assets/data/naptar.json").then(function(r){return r.json();}).then(function(d){
  var td=new Date().toLocaleDateString("sv-SE",{timeZone:"Europe/Budapest"});var n=(d.v||[]).filter(function(x){return x.d>=td;}).sort(function(a,b){return a.d<b.d?-1:1;})[0];if(!n)return;
  var days=Math.round((Date.parse(n.d+"T00:00:00Z")-Date.parse(td+"T00:00:00Z"))/864e5);var V=window.VALASZTAS,nm=V&&V.name?V.name(n.k):n.k;
  var href=V&&V.READY&&V.READY[n.k]?V.READY[n.k].href:"naptar";var e=document.getElementById("fdzn");
  var dt=new Date(n.d+"T12:00:00").toLocaleDateString("hu-HU",{month:"long",day:"numeric"});var t=String(n.t||"választás").replace(/\s*\(.*\)\s*$/,"");t=t.charAt(0).toLowerCase()+t.slice(1);
  e.href=href;e.innerHTML='<span class="bg" aria-hidden="true" style="background-image:url(https://flagcdn.com/w640/'+n.k.toLowerCase()+'.png)"></span><small>Következő választás</small><span class="r"><img src="https://flagcdn.com/w80/'+n.k.toLowerCase()+'.png" alt=""><span><b>'+esc(nm)+'</b><span class="s">'+esc(dt)+' · '+esc(t)+'</span></span></span><span class="d">'+(days===0?'Ma':days+'<span>nap múlva</span>')+'</span>';
}).catch(function(){});
})();
