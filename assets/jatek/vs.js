/* 1v1 online párbaj a Voksmérő játékaihoz (napi szó, országrejtvény).
   Csak linkkel lehet csatlakozni, és egy meccsben pontosan két játékos van: az első kettő, aki megnyitja a linket.
   Valós idejű üzenetek: ntfy.sh (nyilvános, ingyenes értesítési szolgáltatás), meccsenként egy kitalálhatatlan nevű témával.
   Üzenetek: {t:"j",c} csatlakozás · {t:"r",c,n,v,s} az n. tipp eredménye (v = kód, s = eltelt másodperc).
   Személyes adat nincs: csak egy véletlen játékosazonosító, a tippek színei / közelsége és az idő kerül fel – a tippelt szó vagy ország nem. */
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
    else if(d.t==="r"&&+d.n>=1&&+d.n<=6){(c.rows[d.c]=c.rows[d.c]||{})[+d.n]={c:+d.v,t:+d.s||0};}
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
      done=true;clearTimeout(to);setTimeout(function(){un();},0);res(i===0?"a":i===1?"b":"full");});});}
function post(g,id,s,r,code,sec){send(g,id,{t:"r",c:cid(g,id,true),n:r,v:code,s:Math.max(0,Math.round(sec))});}
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
function idFromHash(){var m=/^#vs-([a-z0-9]{6,12})$/.exec(location.hash);return m?m[1]:null;}
function link(path,id){return "https://voksmero.hu/"+path+"#vs-"+id;}
window.VS={rid:rid,join:join,post:post,watch:watch,next:next,waitRematch:waitRematch,startTime:startTime,fmt:fmt,verdict:verdict,idFromHash:idFromHash,link:link,hash:hash};
})();
