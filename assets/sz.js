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
  /* az alkalmazás telepítései: eszközönként egyszer bejegyzi a telefon típusát, az Android-verziót és a dátumot
     (sorszám: dvn; szöveg: dvs-N-0, dvs-N-1, … számmá kódolva, 9 karakterenként) – személyes adat nélkül */
  if(/ValasztasokApp/.test(navigator.userAgent)&&!ls.getItem("vm-dev"))(function(){
    var u=navigator.userAgent,m=u.match(/Android ([\d.]+); ([^;)]+?)(?: Build\/[^;)]*)?[;)]/);
    var d=new Date().toLocaleDateString("sv-SE",{timeZone:"Europe/Budapest"}).slice(2).replace(/-/g,"");
    var A="~ 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-_.|*/";
    var s=((m?m[2]:"ISMERETLEN")+"|"+(m?m[1]:"")+"|"+d+(ls.getItem("vm-nostat")?"|*":"")).toUpperCase().split("").filter(function(c){return A.indexOf(c)>0;}).join("").slice(0,45);
    var H="https://abacus.jasoncameron.dev/";
    fetch(H+"hit/voksmero.hu/dvn",{credentials:"omit"}).then(function(r){return r.json();}).then(function(j){var n=j.value;if(!n)return;
      var ps=[];for(var k=0;k*9<s.length;k++){var c=s.substr(k*9,9),v=0;for(var i=c.length-1;i>=0;i--)v=v*A.length+A.indexOf(c[i]);
        ps.push(fetch(H+"create/voksmero.hu/dvs-"+n+"-"+k+"?initializer="+v,{credentials:"omit"}));}
      return Promise.all(ps).then(function(){ls.setItem("vm-dev",String(n));});}).catch(function(){});
  })();
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
