/* Országlista és közös segédfüggvények a portál oldalaihoz */
(function(){
"use strict";
/* IMGFB: hibás (pl. elérhetetlen zászló) képek elrejtése minden oldalon */
document.addEventListener("error",function(e){var t=e.target;if(t&&t.tagName==="IMG"){t.style.visibility="hidden";var f=t.closest&&t.closest(".flag,.fl,.ff");if(f)f.classList.add("noimg");}},true);
var C={
  eu:"AD AL AT BA BE BG BY CH CY CZ DE DK EE ES FI FR GB GR HR HU IE IS IT LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS RU SE SI SK SM UA VA XK",
  as:"AE AF AM AZ BD BH BN BT CN GE ID IL IN IQ IR JO JP KG KH KP KR KW KZ LA LB LK MM MN MV MY NP OM PH PK PS QA SA SG SY TH TJ TL TM TR TW UZ VN YE",
  af:"AO BF BI BJ BW CD CF CG CI CM CV DJ DZ EG ER ET GA GH GM GN GQ GW KE KM LR LS LY MA MG ML MR MU MW MZ NA NE NG RW SC SD SL SN SO SS ST SZ TD TG TN TZ UG ZA ZM ZW",
  na:"AG BB BS BZ CA CR CU DM DO GD GT HN HT JM KN LC MX NI PA SV TT US VC",
  sa:"AR BO BR CL CO EC GY PE PY SR UY VE",
  oc:"AU FJ FM KI MH NR NZ PG PW SB TO TV VU WS"
};
var CONT={eu:"Európa",as:"Ázsia",af:"Afrika",na:"Észak- és Közép-Amerika",sa:"Dél-Amerika",oc:"Óceánia"};
/* elkészült oldalak */
var READY={
  US:{href:"egyesult-allamok",title:"Egyesült Államok",sub:"Félidős választás 2026: Kongresszus, eredmények, választási rendszer"},
  HU:{href:"magyarorszag",title:"Magyarország",sub:"Kutatások, 2026-os eredmények településenként, OEVK-térkép, szimulátor"},
  DE:{href:"nemetorszag",title:"Németország",sub:"Bundestag-választás 2025: eredmények és mandátumok"},
  AT:{href:"ausztria",title:"Ausztria",sub:"Nemzeti tanácsi választás 2024: eredmények és mandátumok"},
  SK:{href:"szlovakia",title:"Szlovákia",sub:"Parlamenti választás 2023 – a Szövetség eredményével"},
  CV:{href:"zold-foki-szigetek-valasztas",title:"Zöld-foki-szigetek",sub:"Elnökválasztás november 15-én – élő eredmények, részvétel, térkép"},ES:{href:"spanyolorszag",title:"Spanyolország",sub:"Előrehozott választás november 29-én – kutatások, esélyek, visszaszámlálás"},
  RO:{href:"romania",title:"Románia",sub:"Parlamenti választás 2024 – az RMDSZ eredményével"}
};
var FALLBACK={XK:"Koszovó",TW:"Tajvan",PS:"Palesztina",VA:"Vatikán",GB:"Egyesült Királyság",US:"Amerikai Egyesült Államok",HU:"Magyarország"};
var dnHu=null,dnEn=null;
try{dnHu=new Intl.DisplayNames(["hu"],{type:"region"});dnEn=new Intl.DisplayNames(["en"],{type:"region"});}catch(e){}
function nm(code){var n="";try{n=dnHu?dnHu.of(code):"";}catch(e){}if(!n||n===code)n=FALLBACK[code]||code;return n;}
function en(code){try{return dnEn?dnEn.of(code):"";}catch(e){return "";}}
var list=[];
Object.keys(C).forEach(function(k){C[k].split(" ").forEach(function(code){list.push({code:code,name:nm(code),en:en(code),cont:k,ready:READY[code]||null});});});
list.sort(function(a,b){return a.name.localeCompare(b.name,"hu");});
function norm(s){return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();}
function href(c){return c.ready?c.ready.href:"orszag?k="+c.code.toLowerCase();}
function flag(code,w){code=code.toLowerCase();w=w||80;return "https://flagcdn.com/w"+w+"/"+code+".png";}
function flagSrcset(code){code=code.toLowerCase();return "https://flagcdn.com/w80/"+code+".png 1x, https://flagcdn.com/w160/"+code+".png 2x";}
function search(q){q=norm(q);if(!q)return list.slice();return list.filter(function(c){var a=norm(c.name),b=norm(c.en);return a.indexOf(q)>=0||b.indexOf(q)>=0||c.code.toLowerCase()===q;})
  .sort(function(x,y){var ax=norm(x.name).indexOf(q)===0?0:1,ay=norm(y.name).indexOf(q)===0?0:1;return ax-ay||x.name.localeCompare(y.name,"hu");});}
/* téma */
try{var t=localStorage.getItem("ve-theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);}catch(e){}
function themeBtn(el){if(!el)return;el.addEventListener("click",function(){var cur=document.documentElement.getAttribute("data-theme")||(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");
  var nx=cur==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",nx);try{localStorage.setItem("ve-theme",nx);}catch(e){}});}
function reveal(){var els=document.querySelectorAll(".reveal");if(!("IntersectionObserver" in window)||matchMedia("(prefers-reduced-motion: reduce)").matches){els.forEach(function(e){e.classList.add("in");});return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px"});els.forEach(function(e){io.observe(e);});}
window.VALASZTAS={list:list,CONT:CONT,READY:READY,name:nm,norm:norm,href:href,flag:flag,flagSrcset:flagSrcset,search:search,themeBtn:themeBtn,reveal:reveal};
})();
