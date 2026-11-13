/* Térkép-animációk (az USA 2026 térkép mintájára), közös minden térképhez.
   MapAnim.intro(elemek, {svg})  – a területek balról jobbra „beugranak” (akkor, amikor a térkép láthatóvá válik)
   MapAnim.flash(path, szín)     – egy terület felvillan, amikor új eredmény/győztes érkezik
   MapAnim.ping(svg, x, y, r)    – kör alakú hullám egy pontból
   MapAnim.seats(svg)            – a patkó székei egymás után beugranak
   A „csökkentett mozgás” rendszerbeállítást tiszteletben tartja. */
(function(){
"use strict";
if(window.MapAnim)return;
const RM=matchMedia("(prefers-reduced-motion: reduce)");
const APP=/ValasztasokApp/.test(navigator.userAgent); /* az Android-alkalmazásban kevesebb animáció */
const css=`
.ma-wait{opacity:0}
.ma-in{animation:ma-pop .75s cubic-bezier(.2,.8,.2,1) both;animation-delay:var(--d,0s);transform-box:fill-box;transform-origin:center}
@keyframes ma-pop{from{opacity:0;transform:scale(.9)}}
.ma-fill{transition:fill .55s ease,fill-opacity .55s ease,opacity .4s ease,filter .2s}
.ma-hov{cursor:pointer}.ma-hov:hover{filter:brightness(1.18)}
.ma-flash{pointer-events:none;stroke:var(--ink,#fff);stroke-width:2px;vector-effect:non-scaling-stroke;stroke-linejoin:round;transform-box:fill-box;transform-origin:center;animation:ma-flash 1.5s ease-out forwards}
@keyframes ma-flash{0%{opacity:.95;transform:scale(1.07);stroke-opacity:1}100%{opacity:0;transform:scale(1);stroke-opacity:0}}
.ma-ping{fill:none;stroke:var(--gold,#F5B83D);stroke-width:2px;vector-effect:non-scaling-stroke;pointer-events:none;transform-box:fill-box;transform-origin:center;animation:ma-ping 1.5s ease-out forwards}
@keyframes ma-ping{from{transform:scale(.25);opacity:1}to{transform:scale(3.4);opacity:0}}
.ma-sel{filter:drop-shadow(0 0 5px var(--gold,#F5B83D));animation:ma-selp 1.6s ease-in-out infinite}
@keyframes ma-selp{0%,100%{stroke-width:2.4px}50%{stroke-width:3.6px}}
.ma-seat{animation:ma-seat .55s cubic-bezier(.2,.9,.3,1.2) both;animation-delay:calc(var(--i,0) * 4ms);transform-box:fill-box;transform-origin:center}
@keyframes ma-seat{from{transform:scale(0);opacity:0}}
.ma-seatf circle{transition:fill .5s ease;transition-delay:calc(var(--i,0) * 1.5ms)}
.lite .ma-fill,.lite .ma-seatf circle{transition:none!important} /* telefonon nincs színátúszás: folyamatos újrarajzolást okozott */
@media (prefers-reduced-motion:reduce){.ma-wait{opacity:1}.ma-in,.ma-flash,.ma-ping,.ma-seat,.ma-sel{animation:none!important}.ma-fill,.ma-seatf circle{transition:none!important}}`;
const st=document.createElement("style");st.id="ma-css";st.textContent=css;document.head.appendChild(st);
const NS="http://www.w3.org/2000/svg";
function onVisible(el,fn){if(!("IntersectionObserver" in window)){fn();return;}
  const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();fn();}},{threshold:.12});io.observe(el);}
/* a területek bal–jobb (és kicsit fent–lent) sorrendben ugranak be, mint az USA-térképen */
function intro(els,o){o=o||{};els=Array.from(els||[]);if(!els.length)return;
  if(RM.matches||els.length>(o.max||(APP?400:2500))){return;}
  const svg=o.svg||els[0].ownerSVGElement;const vb=svg&&svg.viewBox&&svg.viewBox.baseVal;let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;
  const bb=els.map(e=>{let b;try{b=e.getBBox();}catch(_){b=null;}if(b&&b.width+b.height>0){const cx=b.x+b.width/2,cy=b.y+b.height/2;x0=Math.min(x0,cx);x1=Math.max(x1,cx);y0=Math.min(y0,cy);y1=Math.max(y1,cy);return [cx,cy];}return null;});
  if(vb&&vb.width&&!isFinite(x0)){x0=vb.x;x1=vb.x+vb.width;y0=vb.y;y1=vb.y+vb.height;}
  const sx=(x1-x0)||1,sy=(y1-y0)||1,spread=o.spread==null?.7:o.spread;
  els.forEach((e,i)=>{const c=bb[i];const d=c?((c[0]-x0)/sx*spread+(c[1]-y0)/sy*spread*.25):0;e.style.setProperty("--d",d.toFixed(2)+"s");e.classList.add("ma-wait");});
  const go=()=>{els.forEach(e=>{e.classList.remove("ma-wait");e.classList.add("ma-in");});
    const t=(spread*1.25+.8)*1000;setTimeout(()=>els.forEach(e=>e.classList.remove("ma-in")),t);};
  if(o.now||!svg)go();else onVisible(svg,go);}
const lastF=new WeakMap();
function flash(p,color,layer){if(RM.matches||!p||!p.getAttribute)return;const now=performance.now();if(now-(lastF.get(p)||0)<1400)return;lastF.set(p,now);
  const d=p.getAttribute("d");if(!d)return;const f=document.createElementNS(NS,"path");f.setAttribute("d",d);f.setAttribute("class","ma-flash");
  const tr=p.getAttribute("transform");if(tr)f.setAttribute("transform",tr);
  f.style.fill=color||getComputedStyle(p).fill;(layer||p.parentNode).appendChild(f);setTimeout(()=>f.remove(),1600);}
function ping(svgOrLayer,x,y,r){if(RM.matches||!svgOrLayer)return;const c=document.createElementNS(NS,"circle");c.setAttribute("cx",x);c.setAttribute("cy",y);c.setAttribute("r",r||9);c.setAttribute("class","ma-ping");
  svgOrLayer.appendChild(c);setTimeout(()=>c.remove(),1600);}
function seats(svg,o){if(!svg)return;o=o||{};const cs=Array.from(svg.querySelectorAll("circle"));svg.classList.add("ma-seatf");
  cs.forEach((c,i)=>c.style.setProperty("--i",i));if(RM.matches||o.noPop)return;
  const go=()=>{cs.forEach(c=>{c.classList.remove("ma-seat");void c.getBBox;c.classList.add("ma-seat");});setTimeout(()=>cs.forEach(c=>c.classList.remove("ma-seat")),cs.length*4+700);};
  if(o.now)go();else onVisible(svg,go);}
/* eredménypanel: a tartalom alulról beúszik, a sávok balról „kinőnek” (csak a most látható elemekre, egyszer) */
function panel(el,o){if(!el||RM.matches||!el.animate)return;o=o||{};const kids=Array.from(el.children).filter(c=>c.offsetParent!==null||c.getClientRects().length);
  kids.slice(0,14).forEach((c,i)=>c.animate([{opacity:0,transform:"translateY(8px)"},{opacity:1,transform:"none"}],{duration:450,delay:i*45,easing:"ease",fill:"backwards"}));
  el.querySelectorAll(o.bars||'em[style*="width"],i[style*="width"]').forEach((b,i)=>{if(i>40)return;b.style.transformOrigin="left center";
    b.animate([{transform:"scaleX(0)"},{transform:"scaleX(1)"}],{duration:800,delay:150+Math.min(i,12)*40,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"});});}
window.MapAnim={intro:intro,flash:flash,ping:ping,seats:seats,panel:panel,reduced:()=>RM.matches,onVisible:onVisible};
})();
