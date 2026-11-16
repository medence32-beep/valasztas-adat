/* 1v1 online párbaj a Voksmérő játékaihoz (napi szó, országrejtvény).
   Csak linkkel lehet csatlakozni, és egy meccsben pontosan két játékos van.
   Tárolás: abacus.jasoncameron.dev (névtér: voksmero.hu), csak egyszer írható kulcsokkal:
   vs<játék>-<id>-a / -b   = a két hely (az első két megnyitó foglalja le)
   vs<játék>-<id>-<hely>-<n> = az n. tipp eredménye: (kód+1)*100000 + eltelt másodperc
   Személyes adat nincs: csak a tippek színei / közelsége és az idő kerül fel, a tippelt szó vagy ország nem. */
(function(){
"use strict";
var H="https://abacus.jasoncameron.dev/",NS="voksmero.hu";
function ls(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}}
function lss(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function rid(){var a=new Uint32Array(2);(window.crypto||{}).getRandomValues?crypto.getRandomValues(a):(a[0]=Math.random()*4e9,a[1]=Math.random()*4e9);
  return (a[0].toString(36)+a[1].toString(36)).replace(/[^a-z0-9]/g,"").slice(0,9).padEnd(7,"x");}
function key(g,id,s,r){return "vs"+g+"-"+id+"-"+s+(r!=null?"-"+r:"");}
function create(k,v){return fetch(H+"create/"+NS+"/"+k+"?initializer="+v,{credentials:"omit"}).then(function(r){
  if(!r.ok)return r.status>=500?null:false;return r.json().then(function(j){return !!j&&j.value!=null;});}).catch(function(){return null;});}
function get(k){return fetch(H+"get/"+NS+"/"+k,{credentials:"omit",cache:"no-store"}).then(function(r){
  if(r.status===404)return null;if(!r.ok)return undefined;return r.json().then(function(j){return j&&j.value!=null?j.value:null;});}).catch(function(){return undefined;});}
function hash(s){var h=2166136261;for(var i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0;}
/* helyfoglalás: "a" | "b" | "full" | "err" */
function join(g,id){var L=ls("vm-vs",{}),me=L[g+id];if(me)return Promise.resolve(me);
  function save(s){L=ls("vm-vs",{});L[g+id]=s;var ks=Object.keys(L);if(ks.length>60)delete L[ks[0]];lss("vm-vs",L);return s;}
  return create(key(g,id,"a"),1).then(function(ok){if(ok)return save("a");if(ok===null)return "err";
    return create(key(g,id,"b"),1).then(function(ok2){if(ok2)return save("b");return ok2===null?"err":"full";});});}
function post(g,id,s,r,code,sec){var v=(code+1)*100000+Math.max(0,Math.min(99999,Math.round(sec)));
  var tries=0;(function go(){create(key(g,id,s,r),v).then(function(ok){if(ok===null&&tries++<4)setTimeout(go,1500);});})();}
function dec(v){return {c:Math.floor(v/100000)-1,t:v%100000};}
/* ellenfél figyelése: onJoin(), onRow(n,{c,t}) */
function watch(g,id,opp,onJoin,onRow){var rows=0,joined=false,stop=false;
  function tick(){if(stop)return;
    if(!joined){get(key(g,id,opp)).then(function(v){if(stop)return;if(v){joined=true;onJoin();tick();}else setTimeout(tick,2000);});return;}
    if(rows>=6)return;
    get(key(g,id,opp,rows+1)).then(function(v){if(stop)return;if(v){rows++;onRow(rows,dec(v));setTimeout(tick,150);}else setTimeout(tick,2000);});}
  tick();return function(){stop=true;};}
/* visszavágó: determinisztikus következő azonosító, hogy mindkét játékos ugyanoda kerüljön */
function next(id){return ("r"+hash(id+"|vv").toString(36)+hash("vv|"+id).toString(36)).slice(0,9);}
function waitRematch(g,id,cb){var stop=false,n=next(id);(function t(){if(stop)return;get(key(g,n,"a")).then(function(v){if(stop)return;if(v){var L=ls("vm-vs",{});if(L[g+n]!=="a")cb();}else setTimeout(t,3000);});})();return function(){stop=true;};}
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
