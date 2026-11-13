/* Közös, könnyű animációk minden oldalra: belépő hős, görgetésre beúszó kártyák,
   felpörgő számok, finom hover- és kattintásvisszajelzés. Csak opacity/transform, egyszer fut. */
(function(){
  "use strict";
  var RM=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  var css=[
    "@keyframes anHero{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}",
    "@keyframes anLine{from{transform:scaleX(0)}to{transform:scaleX(1)}}",
    "@keyframes anPop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.08);opacity:1}100%{transform:scale(1)}}",
    "@keyframes anGlow{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,currentColor 0%,transparent)}50%{box-shadow:0 0 0 6px color-mix(in srgb,currentColor 14%,transparent)}}",
    "html.an .hero .wrap>:not(div),html.an .hero .wrap>div:not(.globe)>*{animation:anHero .8s cubic-bezier(.2,.8,.2,1) both}",
    "html.an .hero .wrap>:not(div):nth-child(2),html.an .hero .wrap>div:not(.globe)>*:nth-child(2){animation-delay:.08s}html.an .hero .wrap>:not(div):nth-child(3),html.an .hero .wrap>div:not(.globe)>*:nth-child(3){animation-delay:.16s}html.an .hero .wrap>:not(div):nth-child(4),html.an .hero .wrap>div:not(.globe)>*:nth-child(4){animation-delay:.24s}html.an .hero .wrap>:not(div):nth-child(5),html.an .hero .wrap>div:not(.globe)>*:nth-child(5){animation-delay:.32s}html.an .hero .wrap>:not(div):nth-child(n+6),html.an .hero .wrap>div:not(.globe)>*:nth-child(n+6){animation-delay:.4s}",
    "html.an .hero .globe{animation:anPop 1.1s .15s cubic-bezier(.2,.8,.2,1) both}",
    "html.an .kicker::before{transform-origin:left;animation:anLine .9s .2s cubic-bezier(.2,.8,.2,1) both}",
    "html.an .an-rv{opacity:0;transform:translateY(22px) scale(.985);transition:opacity .65s ease,transform .75s cubic-bezier(.2,.8,.2,1)!important}",
    "html.an .an-rv.an-in{opacity:1;transform:none}",
    "html.an .an-hv{transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s ease,border-color .25s ease}",
    "html.an .an-hv:hover{transform:translateY(-3px);box-shadow:0 14px 30px -14px rgba(0,0,0,.45)}",
    "html.an .btn:not([disabled]):active,html.an .ib:active,html.an .act button:active,html.an #presets button:active,html.an .seg button:active,html.an .cta a:active,html.an .ibtn:active{transform:scale(.96)}",
    "html.an .nav a{position:relative}",
    "html.an .nav a::after{content:'';position:absolute;left:14px;right:14px;bottom:3px;height:2px;border-radius:2px;background:currentColor;transform:scaleX(0);transform-origin:center;transition:transform .3s cubic-bezier(.2,.8,.2,1);opacity:.6}",
    "html.an .nav a:not(.on):hover::after{transform:scaleX(1)}",
    "html.an .an-pop{animation:anPop .55s cubic-bezier(.2,.8,.2,1) both}",
    "html.an .lv:not(.done),html.an .live-dot{animation:anGlow 2.4s ease-in-out infinite}",
    "@keyframes anSlide{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}",
    "html.an #feed>li:first-child{animation:anSlide .5s cubic-bezier(.2,.8,.2,1) both}",
    "html.an #banner.on{animation:anHero .7s cubic-bezier(.2,.8,.2,1) both}",
    "@keyframes anFade{from{opacity:0}to{opacity:1}}",
    "html.an body{animation:anFade .4s ease both}"
  ].join("\n");
  if(RM)return;
  document.documentElement.classList.add("an");
  var st=document.createElement("style");st.id="anim-css";st.textContent=css;document.head.appendChild(st);

  /* --- görgetésre beúszás --- */
  var SEL=".card,.qrace,.mode,.tile,.ccard,.stat,.feat,.step,.mc,.fcard,.pcard,.stats>*,.grid>*,.cgrid>*";
  var SKIP=".fbi,.sec-fold,dialog,.dd,.tip,#tip,.ctl,.pbar,.top,header,nav,.prow,table,.mtw,.lbar";
  var io=("IntersectionObserver" in window)?new IntersectionObserver(function(ents){
    var vis=ents.filter(function(e){return e.isIntersecting;});
    vis.sort(function(a,b){return a.boundingClientRect.top-b.boundingClientRect.top||a.boundingClientRect.left-b.boundingClientRect.left;});
    vis.forEach(function(e,i){var el=e.target;io.unobserve(el);
      el.style.transitionDelay=Math.min(i,7)*70+"ms";
      requestAnimationFrame(function(){el.classList.add("an-in");});
      var done=function(){el.classList.remove("an-rv","an-in");el.style.transitionDelay="";};
      setTimeout(done,1400+Math.min(i,7)*70);
      countUp(el);});
  },{rootMargin:"0px 0px -6% 0px",threshold:0.06}):null;
  var seen=new WeakSet();
  function scan(root){if(!io)return;
    (root||document).querySelectorAll(SEL).forEach(function(el){
      if(seen.has(el))return;seen.add(el);
      if(el.closest(SKIP))return;
      /* ne animáljunk egymásba ágyazott kártyákat kétszer */
      var p=el.parentElement&&el.parentElement.closest(".an-rv");if(p)return;
      el.classList.add("an-rv");io.observe(el);});
    (root||document).querySelectorAll("a.card,a.tile,a.ccard,.mode,a.fcard,a.pcard,.tiles a,.cgrid a").forEach(function(el){if(!el.closest(SKIP))el.classList.add("an-hv");});}

  /* --- felpörgő számok (csak ha közben az oldal nem írja át) --- */
  var NUMRE=/^\s*([+\-−]?)(\d{1,3}(?:[  ]\d{3})*|\d+)(?:([,.])(\d+))?\s*(%|\s?mandátum|\s?hely)?\s*$/;
  function countUp(root){var n=0;
    root.querySelectorAll("b,strong,.big,.num,.n,.v,.val,.hn,em").forEach(function(el){
      if(n>=24||el.children.length||el.closest("table,input,select,.tr,.lbar,.stk,.dd,.tip"))return;
      var t=el.textContent;if(t.length>14)return;var m=NUMRE.exec(t);if(!m)return;
      var raw=parseFloat(m[2].replace(/[  ]/g,"")+(m[4]?"."+m[4]:""));if(!(raw>=2))return;n++;
      var dec=m[4]?m[4].length:0,sep=m[3]||",",grp=/[  ]/.test(m[2])||raw>=10000,suf=m[5]||"",sg=m[1]||"";
      var fmt=function(v){var s=v.toFixed(dec).split(".");var i=s[0];if(grp)i=i.replace(/\B(?=(\d{3})+(?!\d))/g," ");return sg+i+(dec?sep+s[1]:"")+suf;};
      var last=fmt(0),t0=performance.now(),D=900+Math.min(600,raw/50);el.textContent=last;
      (function step(now){if(el.textContent!==last)return;var k=Math.min(1,(now-t0)/D),e=1-Math.pow(1-k,3);
        if(k>=1){el.textContent=t;return;}last=fmt(raw*e);el.textContent=last;requestAnimationFrame(step);})(t0);});}

  /* --- új, dinamikusan megjelenő tartalom (pl. találatok, térképek) --- */
  /* csak akkor néz körül, ha nem térképen / ábrán belül változott valami (ott több ezer elem frissül) */
  function relevant(ms){for(var i=0;i<ms.length;i++){var t=ms[i].target;if(t.nodeType!==1)t=t.parentNode;
      if(!t||!t.closest)continue;if(t.closest("svg,#feed,#ptb,.tip,#tip,#det,#detail,#ctb,#stb,#lbars,#ost,#mlg"))continue;
      var add=ms[i].addedNodes;for(var j=0;j<add.length;j++){var n=add[j];if(n.nodeType===1&&n.tagName!=="svg"&&!(n.closest&&n.closest("svg")))return true;}}
    return false;}
  var pend=0;var mo=new MutationObserver(function(ms){if(pend||!relevant(ms))return;pend=setTimeout(function(){pend=0;scan();},700);});
  /* telefonon (könnyített mód) nincs görgetésre beúszás és DOM-figyelés: kevesebb munka görgetés közben */
  var LITE=document.documentElement.classList.contains("lite");
  function start(){if(LITE)return;scan();mo.observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
  window.ANIM={scan:scan,pop:function(el){if(!el)return;el.classList.remove("an-pop");void el.offsetWidth;el.classList.add("an-pop");}};
})();
