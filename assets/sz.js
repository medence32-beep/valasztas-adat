/* Névtelen látogatásszámláló a Voksmérőhöz (csak darabszámok, semmilyen személyes adat).
   Számlálók (abacus.jasoncameron.dev, névtér: voksmero.hu), napi kulcsok (budapesti dátum):
   pv-NAP oldalmegnyitás · uv-NAP egyedi látogató (eszközönként naponta 1) · uv-all új eszköz összesen
   pg-OLDAL-NAP oldalanként · src-FORRÁS-NAP honnan jött (google, facebook, egyeb, kozvetlen)
   app-NAP app-megnyitás · appu-NAP egyedi app-felhasználó · appi-all app első indítása (≈ telepítés)
   dl-NAP kattintás az APK letöltésére · sh-NAP megosztás gomb */
(function(){
"use strict";
try{
  if(navigator.webdriver)return;
  var ls=window.localStorage,ss=window.sessionStorage;
  if(ls.getItem("vm-nostat"))return;               /* a tulajdonos saját eszköze nem számít */
  var pg=(location.pathname.replace(/^\/+|\/+$/g,"").replace(/\.html$/,"")||"index").replace(/[^A-Za-z0-9_-]/g,"");
  if(/^stat-/.test(pg)||pg==="404")return;
  var day=new Date().toLocaleDateString("sv-SE",{timeZone:"Europe/Budapest"});
  var B="https://abacus.jasoncameron.dev/hit/voksmero.hu/";
  var hit=function(k){try{fetch(B+k,{mode:"cors",credentials:"omit",keepalive:true}).catch(function(){});}catch(e){}};
  var app=/ValasztasokApp/.test(navigator.userAgent);
  hit("pv-"+day);hit("pg-"+pg.slice(0,40)+"-"+day);
  if(ls.getItem("vm-uvd")!==day){ls.setItem("vm-uvd",day);hit("uv-"+day);if(!ls.getItem("vm-uv0")){ls.setItem("vm-uv0","1");hit("uv-all");}}
  if(!ss.getItem("vm-src")){ss.setItem("vm-src","1");
    var r="",h="";try{h=document.referrer?new URL(document.referrer).hostname:"";}catch(e){}
    if(app)r="app";else if(!h)r="kozvetlen";else if(/(^|\.)voksmero\.hu$/.test(h))r="";else if(/google\./.test(h))r="google";
    else if(/facebook\.|fb\.|messenger\./.test(h))r="facebook";else if(/bing\.|duckduckgo|yahoo|ecosia/.test(h))r="kereso";else r="egyeb";
    if(r)hit("src-"+r+"-"+day);}
  if(app){
    if(!ss.getItem("vm-app")){ss.setItem("vm-app","1");hit("app-"+day);}
    if(ls.getItem("vm-appd")!==day){ls.setItem("vm-appd",day);hit("appu-"+day);}
    if(!ls.getItem("vm-appi")){ls.setItem("vm-appi","1");hit("appi-all");}
  }
  document.addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest("a,button");if(!a)return;
    var href=a.getAttribute("href")||"";
    if(/Voksmero\.apk/.test(href))hit("dl-"+day);
    else if(/^(shfb|shcp|shr)$/.test(a.id||"")||/facebook\.com\/sharer|twitter\.com\/intent|x\.com\/intent/.test(href))hit("sh-"+day);},true);
}catch(e){}
})();
