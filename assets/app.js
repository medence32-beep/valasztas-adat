/* Telefonos alkalmazás (PWA): service worker regisztrálása és telepítési ajánló. */
(function(){
  "use strict";
  var root=new URL("./",document.baseURI);
  if("serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="127.0.0.1"||location.hostname==="localhost")){
    addEventListener("load",function(){navigator.serviceWorker.register(new URL("sw.js",root).href,{scope:root.pathname}).catch(function(){});});}

  function centerNav(){document.querySelectorAll(".nav,.pnav").forEach(function(n){var a=n.querySelector("a.on");if(a&&n.scrollWidth>n.clientWidth)n.scrollLeft=Math.max(0,a.offsetLeft-n.offsetLeft-n.clientWidth/2+a.offsetWidth/2);});}
  function topClock(){var t=document.querySelector("header.top #theme");if(!t||document.querySelector(".tclk"))return;var c=document.createElement("span");c.className="tclk";c.setAttribute("aria-label","Budapesti idő");t.parentNode.insertBefore(c,t);
    var f;try{f=new Intl.DateTimeFormat("hu-HU",{timeZone:"Europe/Budapest",hour:"2-digit",minute:"2-digit",second:"2-digit"});}catch(e){f=null;}
    var tick=function(){c.innerHTML=(f?f.format(new Date()):new Date().toLocaleTimeString("hu-HU"))+"<span> Budapest</span>";};tick();setInterval(tick,1000);}
  function boot(){centerNav();topClock();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
  var UA0=navigator.userAgent||"";
  if(/ValasztasokApp/.test(UA0)){document.documentElement.classList.add("is-app","in-apk");return;}
  var standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
  if(standalone){document.documentElement.classList.add("is-app");return;}
  var ua=navigator.userAgent||"",ios=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);
  var iosSafari=ios&&/Safari/.test(ua)&&!/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  var mobile=matchMedia("(max-width: 820px)").matches||/Android|iPhone|iPad/.test(ua);
  var KEY="hu_app_dismiss";
  function dismissed(){try{var t=+localStorage.getItem(KEY)||0;return Date.now()-t<14*864e5;}catch(e){return false;}}
  function setDismissed(){try{localStorage.setItem(KEY,String(Date.now()));}catch(e){}}

  var css=".appc{position:fixed;left:max(12px,env(safe-area-inset-left));right:max(12px,env(safe-area-inset-right));bottom:calc(12px + env(safe-area-inset-bottom));z-index:200;max-width:440px;margin:0 auto;display:flex;gap:12px;align-items:center;padding:12px 12px 12px 14px;border-radius:18px;background:var(--card,#101828);color:var(--ink,#EEF2FA);border:1px solid var(--line2,rgba(255,255,255,.14));box-shadow:0 18px 50px -12px rgba(0,0,0,.55);font:500 14px/1.4 Barlow,system-ui,sans-serif;transform:translateY(140%);transition:transform .45s cubic-bezier(.2,.8,.2,1)}"+
    ".appc.on{transform:none}.appc img{width:44px;height:44px;border-radius:11px;flex:none}.appc .t{flex:1;min-width:0}.appc b{display:block;font-weight:700;font-size:15px}.appc small{color:var(--ink2,#A9B6CF);font-size:12.5px}"+
    ".appc .go{border:0;border-radius:999px;padding:9px 14px;font:700 13.5px Barlow,system-ui,sans-serif;background:linear-gradient(135deg,#5FA8FF,#7B5CFF);color:#fff;cursor:pointer;white-space:nowrap}"+
    ".appc .x{border:0;background:transparent;color:var(--ink3,#7F8BA3);font-size:22px;line-height:1;padding:4px 6px;cursor:pointer;align-self:flex-start}"+
    ".appc .sh{display:inline-block;vertical-align:-3px;width:16px;height:16px}"+
    "@media (max-width:440px){.appc{flex-wrap:wrap;gap:10px}.appc .t{flex:1 1 calc(100% - 100px)}.appc .go{order:3;flex:1 1 100%;justify-content:center;padding:11px}}"+
    ".app-link{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line2,rgba(255,255,255,.14));background:transparent;color:inherit;border-radius:999px;padding:7px 13px;font:700 13px Barlow,system-ui,sans-serif;cursor:pointer}.app-link[hidden]{display:none}";
  var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
  var ICON=new URL("assets/app/icon-192.png?v=3",root).href;
  var SHARE='<svg class="sh" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
  var APK="https://github.com/medence32-beep/valasztas-adat/releases/latest/download/Voksmero.apk";
  var android=/Android/i.test(ua),deferred=null,card=null;
  var DL='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/></svg>';
  function show(mode){if(card)return;card=document.createElement("div");card.className="appc";card.setAttribute("role","dialog");card.setAttribute("aria-label","Alkalmazás");
    var txt=mode==="ios"?'Koppints a '+SHARE+' Megosztás gombra, majd a <b style="display:inline;font-size:inherit">Főképernyőhöz adás</b> lehetőségre.':mode==="apk"?'Élő eredmények és szimulátor – töltsd le az Android-alkalmazást.':'Élő eredmények és szimulátor egy koppintásra.';
    card.innerHTML='<img src="'+ICON+'" alt=""><div class="t"><b>Voksmérő alkalmazás</b><small>'+txt+'</small></div>'+
      (mode==="ios"?'':mode==="apk"?'<a class="go" href="'+APK+'" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px">'+DL+'Letöltés</a>':'<button class="go" type="button">Telepítés</button>')+'<button class="x" type="button" aria-label="Bezárás">×</button>';
    document.body.appendChild(card);requestAnimationFrame(function(){requestAnimationFrame(function(){card.classList.add("on");});});
    card.querySelector(".x").onclick=function(){setDismissed();hide();};
    var g=card.querySelector("button.go");if(g)g.onclick=install;var l=card.querySelector("a.go");if(l)l.onclick=function(){setDismissed();setTimeout(function(){hide();showHelp();},300);};}
  function hide(){if(!card)return;var c=card;card=null;c.classList.remove("on");setTimeout(function(){c.remove();},500);}
  /* rövid súgó a letöltés után: hogyan kell telepíteni az APK-t */
  function showHelp(){if(card)return;card=document.createElement("div");card.className="appc";card.setAttribute("role","dialog");
    card.innerHTML='<img src="'+ICON+'" alt=""><div class="t"><b>Telepítés</b><small>Ha a letöltés kész, nyisd meg a <b style="display:inline;font-size:inherit">Voksmero.apk</b> fájlt, és ha a telefon kéri, engedélyezd az „ismeretlen forrásból” való telepítést.</small></div><button class="x" type="button" aria-label="Bezárás">×</button>';
    document.body.appendChild(card);requestAnimationFrame(function(){requestAnimationFrame(function(){card.classList.add("on");});});card.querySelector(".x").onclick=hide;setTimeout(hide,15000);}
  function install(){if(android){location.href=APK;showHelp();return;}if(!deferred){if(iosSafari){setDismissed();show("ios");}return;}deferred.prompt();deferred.userChoice.then(function(){deferred=null;hide();});}
  addEventListener("beforeinstallprompt",function(e){e.preventDefault();deferred=e;});
  addEventListener("appinstalled",function(){deferred=null;hide();});
  if(android&&!dismissed())setTimeout(function(){show("apk");},2500);
  else if(iosSafari&&!dismissed())setTimeout(function(){show("ios");},3000);
  /* állandó gomb a láblécben */
  function addLink(){var f=document.querySelector("footer");if(!f||f.querySelector("[data-app-link]"))return;var w=document.createElement("div");w.style.cssText="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px";
    if(ios){var b=document.createElement("button");b.type="button";b.className="app-link";b.setAttribute("data-app-link","");
      b.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/></svg>Hozzáadás a főképernyőhöz';
      b.onclick=function(){hide();setTimeout(function(){show("ios");},50);};w.appendChild(b);}
    else{var a=document.createElement("a");a.className="app-link";a.setAttribute("data-app-link","");a.href=APK;a.style.textDecoration="none";
      a.innerHTML=DL+'Android-alkalmazás letöltése (APK)';a.onclick=function(){if(android)setTimeout(showHelp,300);};w.appendChild(a);}
    (f.querySelector(".wrap")||f).appendChild(w);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",addLink);else addLink();
  window.APP={install:install};
})();
