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
  /* Az alkalmazás telepítései és megnyitásai (személyes adat nélkül; az IP-cím sehol nincs eltárolva, csak a becsült város).
     Telepítés: eszközönként egyszer – dvn2 = sorszám, dw-N-k = „TÍPUS|ANDROID|ÉÉHHNN|VÁROS|ORSZÁG|*” 9 karakterenként számmá kódolva.
     Megnyitás: app-munkamenetenként egyszer – lgn = sorszám, lg-I-0 = ((eszköz*2^27 + perc 2026 óta)*2 + más-város-e),
     lg-I-1… = „VÁROS|ORSZÁG”, ha a város eltér a telepítéskoritól. */
  if(/ValasztasokApp/.test(navigator.userAgent))(function(){
    var H="https://abacus.jasoncameron.dev/",A="~ 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-_.|*/";
    var tisz=function(x){return String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().split("").filter(function(c){return A.indexOf(c)>0&&c!=="|";}).join("");};
    var J=function(u){return fetch(H+u,{credentials:"omit"}).then(function(r){return r.json();});};
    var ir=function(pre,s,k0){k0=k0||0;var ps=[];for(var k=0;k*9<s.length;k++){var c=s.substr(k*9,9),v=0;for(var i=c.length-1;i>=0;i--)v=v*A.length+A.indexOf(c[i]);
      ps.push(fetch(H+"create/voksmero.hu/"+pre+(k+k0)+"?initializer="+v,{credentials:"omit"}));}return Promise.all(ps);};
    var reg=ls.getItem("vm-dev2"),uj=!ss.getItem("vm-lg");
    if(reg&&!uj)return;
    var hely=new Promise(function(res){var t=setTimeout(function(){res(null);},5000);
      fetch("https://get.geojs.io/v1/ip/geo.json",{credentials:"omit"}).then(function(r){return r.json();}).then(function(g){clearTimeout(t);res(g);}).catch(function(){clearTimeout(t);res(null);});});
    hely.then(function(g){
      var city=tisz(g&&g.city).slice(0,22),cc=tisz(g&&g.country_code).slice(0,2),hol=city+"|"+cc;
      var elso=reg?Promise.resolve(+reg):J("hit/voksmero.hu/dvn2").then(function(j){var n=j.value;if(!n)throw 0;
        var u=navigator.userAgent,m=u.match(/Android ([\d.]+); ([^;)]+?)(?: Build\/[^;)]*)?[;)]/);
        var d=new Date().toLocaleDateString("sv-SE",{timeZone:"Europe/Budapest"}).slice(2).replace(/-/g,"");
        var s=[tisz(m?m[2]:"ISMERETLEN").slice(0,24),tisz(m?m[1]:""),d,city,cc,ls.getItem("vm-nostat")?"*":""].join("|").replace(/\|+$/,"");
        return ir("dw-"+n+"-",s).then(function(){ls.setItem("vm-dev2",String(n));ls.setItem("vm-devh",hol);return n;});});
      return elso.then(function(n){if(!uj)return;ss.setItem("vm-lg","1");
        var perc=Math.floor((Date.now()-Date.UTC(2026,0,1))/6e4),mas=hol!==(ls.getItem("vm-devh")||hol)?1:0;
        return J("hit/voksmero.hu/lgn").then(function(j){var i=j.value;if(!i)return;
          var p=[fetch(H+"create/voksmero.hu/lg-"+i+"-0?initializer="+((n*134217728+perc)*2+mas),{credentials:"omit"})];
          return Promise.all(p).then(function(){if(mas)return ir("lg-"+i+"-",hol,1);});});});
    }).catch(function(){});
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
