/* 1v1 online párbaj a Voksmérő játékaihoz (napi szó, országrejtvény).
   Csak linkkel lehet csatlakozni, és egy meccsben pontosan két játékos van: az első kettő, aki megnyitja a linket.
   Valós idejű üzenetek: ntfy.sh (nyilvános, ingyenes értesítési szolgáltatás), meccsenként egy kitalálhatatlan nevű témával.
   Üzenetek: {t:"j",c} csatlakozás · {t:"r",c,n,v,s} az n. tipp eredménye (v = kód, s = eltelt másodperc).
   Személyes adat nincs: csak egy véletlen játékosazonosító, a tippek eredménye, maga a tipp (kódolva) és az idő kerül fel.
   Rejtett tulajdonosi nézet: a #kk feliratra 7-szer koppintva, GitHub-kulccsal (a tár tulajdonosa) bekapcsolható. */
(function(){
"use strict";
var NT="https://ntfy.sh/";
function ls(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}}
function lss(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function rnd(n){var a=new Uint32Array(2);if(window.crypto&&crypto.getRandomValues)crypto.getRandomValues(a);else{a[0]=Math.random()*4e9;a[1]=Math.random()*4e9;}
  return (a[0].toString(36)+a[1].toString(36)).replace(/[^a-z0-9]/g,"").slice(0,n).padEnd(n,"x");}
function rid(){return rnd(9);}
function hash(s){var h=2166136261;for(var i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;}
function topic(g,id){return "voksmero-vs"+g+"-"+id;}
function cid(g,id,create){var C=ls("vm-vs-c",{}),k=g+id;if(!C[k]&&create){C[k]=rnd(10);var ks=Object.keys(C);if(ks.length>80)delete C[ks[0]];lss("vm-vs-c",C);}return C[k]||null;}
function send(g,id,msg,tries){tries=tries||0;return fetch(NT+topic(g,id),{method:"POST",body:JSON.stringify(msg),credentials:"omit"}).then(function(r){if(!r.ok)throw 0;return true;})
  .catch(function(){if(tries<5)return new Promise(function(res){setTimeout(function(){res(send(g,id,msg,tries+1));},1200*(tries+1));});return false;});}
/* meccsenként egy élő kapcsolat: az eddigi üzenetek visszajátszása + az újak azonnal */
var CONN={};
function conn(g,id){var k=g+"|"+id;if(CONN[k])return CONN[k];
  var c={players:[],rows:{},seen:{},subs:[],es:null,open:false};
  function emit(){c.subs.forEach(function(f){try{f();}catch(e){}});}
  function onMsg(m){if(!m||m.event!=="message"||c.seen[m.id])return;c.seen[m.id]=1;var d;try{d=JSON.parse(m.message);}catch(e){return;}
    if(!d||typeof d.c!=="string")return;
    if(d.t==="j"){if(c.players.indexOf(d.c)<0)c.players.push(d.c);}
    else if(d.t==="r"&&+d.n>=1&&+d.n<=6){(c.rows[d.c]=c.rows[d.c]||{})[+d.n]={c:+d.v,t:+d.s||0,w:dk(d.w)};}
    emit();}
  try{c.es=new EventSource(NT+topic(g,id)+"/sse?since=all");
    c.es.onopen=function(){c.open=true;emit();};
    c.es.onmessage=function(e){try{onMsg(JSON.parse(e.data));}catch(_){}};
    c.es.onerror=function(){c.open=false;emit();};}catch(e){}
  c.sub=function(f){c.subs.push(f);f();return function(){c.subs=c.subs.filter(function(x){return x!==f;});};};
  c.close=function(){try{c.es.close();}catch(e){}delete CONN[k];};
  CONN[k]=c;return c;}
/* helyfoglalás: "a" | "b" | "full" | "err" */
function join(g,id){var me=cid(g,id,true),c=conn(g,id),sent=false;
  return new Promise(function(res){var done=false,un;
    var to=setTimeout(function(){if(done)return;done=true;if(un)un();res("err");},15000);
    un=c.sub(function(){if(done)return;
      if(c.open&&!sent){sent=true;send(g,id,{t:"j",c:me}).then(function(ok){if(!ok&&!done){done=true;clearTimeout(to);if(un)un();res("err");}});}
      var i=c.players.indexOf(me);if(i<0){if(c.players.length>=2&&sent){/* a mi csatlakozásunk még úton lehet – megvárjuk */}return;}
      done=true;clearTimeout(to);setTimeout(function(){un();},0);if(i<2)reg(g,id,i);res(i===0?"a":i===1?"b":"full");});});}
function reg(g,id,i){try{fetch(NT+"voksmero-vs"+g+"-lista",{method:"POST",body:JSON.stringify({id:id,p:i+1}),credentials:"omit"}).catch(function(){});}catch(e){}}
/* tulajdonosi meccslista: az elmúlt 12 óra meccsei. cb([{id,t,p}]) – p = csatlakozott játékosok száma */
function list(g,cb){var M={},es=null;try{es=new EventSource(NT+"voksmero-vs"+g+"-lista/sse?since=12h");es.onmessage=function(e){try{var m=JSON.parse(e.data),d=JSON.parse(m.message);if(!d||!/^[a-z0-9]{6,12}$/.test(d.id))return;var o=M[d.id]||(M[d.id]={id:d.id,t:m.time*1000,p:0});o.p=Math.max(o.p,+d.p||0);o.t=Math.min(o.t,m.time*1000);cb(Object.keys(M).map(function(k){return M[k];}).sort(function(a,b){return b.t-a.t;}));}catch(_){}};}catch(e){}cb([]);return function(){try{es.close();}catch(e){}};}
function ek(x){try{return btoa(unescape(encodeURIComponent(String(x)))).split("").reverse().join("");}catch(e){return "";}}
function dk(x){try{return x?decodeURIComponent(escape(atob(String(x).split("").reverse().join("")))):"";}catch(e){return "";}}
function post(g,id,s,r,code,sec,w){send(g,id,{t:"r",c:cid(g,id,true),n:r,v:code,s:Math.max(0,Math.round(sec)),w:ek(w||"")});}
/* ---- rejtett tulajdonosi nézet ---- */
var OWN="medence32-beep";
function spy(){try{return localStorage.getItem("vm-spy")==="1"&&!!localStorage.getItem("vm-gh");}catch(e){return false;}}
function tokOk(t){return fetch("https://api.github.com/user",{headers:{Authorization:"Bearer "+t,Accept:"application/vnd.github+json"},cache:"no-store"})
  .then(function(r){return r.ok?r.json():null;}).then(function(j){return !!j&&String(j.login||"").toLowerCase()===OWN;}).catch(function(){return null;});}
function tst(m){if(window.J&&J.toast)J.toast(m);}
function spySet(on,cb){try{on?localStorage.setItem("vm-spy","1"):localStorage.removeItem("vm-spy");}catch(e){}tst(on?"Tulajdonosi nézet bekapcsolva":"Tulajdonosi nézet kikapcsolva");if(cb)cb();}
function spyForm(cb){var o=document.createElement("div");o.style.cssText="position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.55);display:grid;place-items:center;padding:16px";
  o.innerHTML='<form style="background:var(--card);color:var(--ink);border:1px solid var(--line2);border-radius:16px;padding:18px;width:min(100%,360px);display:grid;gap:10px"><b style="font:800 16px var(--f-display);text-transform:uppercase">Kód</b><input type="password" autocomplete="off" style="font:600 15px var(--f-body);padding:11px 12px;border-radius:10px;border:1px solid var(--line2);background:var(--bg2);color:var(--ink)"><div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="jb">Mégse</button><button type="submit" class="jb p">OK</button></div><small style="color:var(--ink2);min-height:1.2em"></small></form>';
  document.body.appendChild(o);var f=o.querySelector("form"),i=o.querySelector("input"),m=o.querySelector("small");i.focus();
  o.querySelector('button[type=button]').onclick=function(){o.remove();};o.addEventListener("click",function(e){if(e.target===o)o.remove();});
  f.onsubmit=function(e){e.preventDefault();var t=i.value.trim();if(!t)return;m.textContent="Ellenőrzés…";
    tokOk(t).then(function(ok){if(ok){try{localStorage.setItem("vm-gh",t);}catch(_){}o.remove();spySet(true,cb);}else m.textContent=ok===null?"Nincs kapcsolat, próbáld újra.":"Hibás kód.";});};}
function spyArm(el,cb){if(!el)return;var n=0,t0=0;el.addEventListener("click",function(){var now=Date.now();if(now-t0>2500)n=0;t0=now;if(++n<7)return;n=0;
    if(spy()){spySet(false,cb);return;}var t=null;try{t=localStorage.getItem("vm-gh");}catch(e){}
    if(t)tokOk(t).then(function(ok){if(ok)spySet(true,cb);else spyForm(cb);});else spyForm(cb);});
  if(spy()){var t=localStorage.getItem("vm-gh");tokOk(t).then(function(ok){if(ok===false){try{localStorage.removeItem("vm-spy");}catch(e){}if(cb)cb();}});}}
/* ellenfél figyelése: onJoin(), onRow(n,{c,t}) */
function watch(g,id,opp,onJoin,onRow){var c=conn(g,id),me=cid(g,id,true),joined=false,got=0;
  var un=c.sub(function(){var o=c.players.filter(function(p,i){return i<2&&p!==me;})[0];if(!o)return;
    if(!joined){joined=true;onJoin();}var R=c.rows[o]||{};while(R[got+1]){got++;onRow(got,R[got]);}});
  return function(){un();c.close();};}
/* visszavágó: determinisztikus következő azonosító, hogy mindkét játékos ugyanoda kerüljön */
function next(id){return ("r"+hash(id+"|vv").toString(36)+hash("vv|"+id).toString(36)).slice(0,9);}
function waitRematch(g,id,cb){var n=next(id),c=conn(g,n),fired=false;
  var un=c.sub(function(){if(fired)return;var me=cid(g,n,false);if(c.players.some(function(p){return p!==me;})){fired=true;cb();}});
  return function(){un();c.close();};}
function startTime(g,id,set){var T=ls("vm-vs-t",{});if(set&&!T[g+id]){T[g+id]=Date.now();var ks=Object.keys(T);if(ks.length>60)delete T[ks[0]];lss("vm-vs-t",T);}return T[g+id]||0;}
function fmt(s){s=Math.max(0,Math.floor(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");}
/* eredmény: rows = [{c,t}], win = kód, ami a telitalálatot jelenti. 1 = én nyertem, -1 = ellenfél, 0 = döntetlen, null = még nincs vége */
function verdict(me,op,win,best){function st(R){var s=R.length&&R[R.length-1].c===win;return {d:s||R.length>=6,s:s,n:R.length,t:R.length?R[R.length-1].t:0,b:best?Math.max.apply(null,R.map(function(x){return x.c;}).concat(0)):0};}
  var a=st(me),b=st(op);
  if(a.s&&!b.s&&b.n>=a.n)return 1;
  if(b.s&&!a.s&&a.n>=b.n)return -1;
  if(!a.d||!b.d)return null;
  if(a.s!==b.s)return a.s?1:-1;
  if(a.s){if(a.n!==b.n)return a.n<b.n?1:-1;if(a.t!==b.t)return a.t<b.t?1:-1;return 0;}
  if(best&&a.b!==b.b)return a.b>b.b?1:-1;return 0;}
/* nézői mód: csatlakozás nélkül figyeli a meccs két játékosát. cb(sorok:[[{c,t,w}],[...]], játékosszám, kapcsolódva) */
function spec(g,id,cb){var c=conn(g,id);var un=c.sub(function(){var P=c.players.slice(0,2);cb(P.map(function(p){var R=c.rows[p]||{},o=[];for(var n=1;n<=6&&R[n];n++)o.push(R[n]);return o;}),P.length,c.open);});return function(){un();c.close();};}
function nezFromHash(){var m=/^#nez-([a-z0-9]{6,12})$/.exec(location.hash);return m?m[1]:null;}
function nezLink(path,id){return "https://voksmero.hu/"+path+"#nez-"+id;}
function idFromHash(){var m=/^#vs-([a-z0-9]{6,12})$/.exec(location.hash);return m?m[1]:null;}
function link(path,id){return "https://voksmero.hu/"+path+"#vs-"+id;}
window.VS={spy:spy,spyArm:spyArm,rid:rid,join:join,post:post,watch:watch,next:next,waitRematch:waitRematch,startTime:startTime,fmt:fmt,verdict:verdict,idFromHash:idFromHash,link:link,hash:hash,spec:spec,nezFromHash:nezFromHash,nezLink:nezLink,list:list};
})();
