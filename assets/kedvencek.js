/* Követett versenyek (kedvencek) és értesítések.
   Azonosítók: "s:GA" szenátus, "g:GA" kormányzó, "h:GA-5" képviselőházi körzet. */
(function(){
  "use strict";
  var KEY="hu_fav",KS="hu_fav_seen",KN="hu_fav_notif";
  function get(k,d){try{var v=JSON.parse(localStorage.getItem(k)||"null");return v==null?d:v;}catch(e){return d;}}
  function put(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  var L=get(KEY,[]);if(!Array.isArray(L))L=[];
  function has(id){return L.some(function(x){return x.id===id;});}
  function save(){put(KEY,L);appSync();document.dispatchEvent(new CustomEvent("favchange"));}
  var APP=!!(window.AppBridge&&window.AppBridge.setFavs);
  function appSync(){if(!APP)return;try{var s=get(KS,{});window.AppBridge.setFavs(JSON.stringify(L.map(function(f){return {id:f.id,t:f.t,b:s[f.id]||""};})));}catch(e){}}
  function toggle(id,label){if(has(id))L=L.filter(function(x){return x.id!==id;});else{L.push({id:id,t:label});seenNow(id);}save();sync();paint();
    toast(has(id)?"Követed: "+label+(canNotify()&&notifOn()?" – szólunk, ha eldől.":""):"Már nem követed: "+label);}
  var ST=["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
  var STAR='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.7l5.9-.9z"/></svg>';
  window.FAVB=function(id,label,txt){var on=has(id);return '<button type="button" class="favb'+(on?' on':'')+'" data-fav="'+id+'" data-fl="'+String(label).replace(/"/g,"&quot;")+'" aria-pressed="'+on+'" title="'+(on?'Követés vége':'Követés – szólunk, ha eldől')+'">'+STAR+(txt?'<span>'+(on?'Követed':'Követés')+'</span>':'')+'</button>';};
  function sync(){document.querySelectorAll("[data-fav]").forEach(function(b){var on=has(b.dataset.fav);b.classList.toggle("on",on);b.setAttribute("aria-pressed",on);b.title=on?"Követés vége":"Követés – szólunk, ha eldől";var s=b.querySelector("span");if(s)s.textContent=on?"Követed":"Követés";});}
  document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-fav]");if(!b)return;e.preventDefault();e.stopPropagation();toggle(b.dataset.fav,b.dataset.fl||b.dataset.fav);},true);

  var css=".favb{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line2,rgba(127,127,127,.35));background:transparent;color:var(--ink3,#8a94a8);border-radius:999px;padding:4px 8px;font:700 12px Barlow,system-ui,sans-serif;cursor:pointer;vertical-align:middle;line-height:1}"+
    ".favb svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;stroke-linejoin:round}.favb:hover{color:#F5B83D;border-color:#F5B83D}"+
    ".favb.on{color:#F5B83D;border-color:color-mix(in srgb,#F5B83D 55%,transparent);background:color-mix(in srgb,#F5B83D 12%,transparent)}.favb.on svg{fill:currentColor}"+
    ".favp{margin:18px 0}.favp .fh{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}"+
    ".favp h3{margin:0;font:800 13px Barlow Condensed,Barlow,system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:var(--ink3,#8a94a8);display:flex;align-items:center;gap:8px}.favp h3 svg{width:16px;height:16px;fill:#F5B83D}"+
    ".favp .fg{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr));gap:10px}"+
    ".favc{position:relative;display:block;padding:12px 14px;border-radius:14px;background:var(--card,#111a2e);border:1px solid var(--line,rgba(127,127,127,.25));text-decoration:none;color:inherit;border-left:4px solid var(--c,#8a94a8)}"+
    ".favc b{display:block;font:700 15px Barlow,system-ui,sans-serif;padding-right:30px}.favc small{display:block;color:var(--ink2,#a9b6cf);font:500 13px Barlow,system-ui,sans-serif;margin-top:3px}"+
    ".favc .favb{position:absolute;right:8px;top:8px;padding:4px}"+
    ".favc .bar{height:5px;border-radius:3px;background:var(--bg2,rgba(127,127,127,.2));margin-top:8px;overflow:hidden}.favc .bar i{display:block;height:100%;background:var(--c,#8a94a8)}"+
    ".favn{border:1px solid var(--line2,rgba(127,127,127,.35));background:transparent;color:inherit;border-radius:999px;padding:6px 12px;font:700 12.5px Barlow,system-ui,sans-serif;cursor:pointer}.favn.on{border-color:#43CF8C;color:#43CF8C}"+
    ".favt{position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom));transform:translate(-50%,20px);opacity:0;z-index:300;background:var(--ink,#EEF2FA);color:var(--bg,#070C18);padding:11px 16px;border-radius:12px;font:600 14px Barlow,system-ui,sans-serif;box-shadow:0 14px 34px -10px rgba(0,0,0,.5);transition:opacity .25s,transform .25s;max-width:calc(100vw - 32px);pointer-events:none}.favt.on{opacity:1;transform:translate(-50%,0)}"+
    ".favempty{color:var(--ink3,#8a94a8);font-size:13.5px}";
  var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
  var tT=0;function toast(m){var t=document.getElementById("favt");if(!t){t=document.createElement("div");t.id="favt";t.className="favt";t.setAttribute("role","status");document.body.appendChild(t);}t.textContent=m;t.classList.add("on");clearTimeout(tT);tT=setTimeout(function(){t.classList.remove("on");},3200);}

  /* --- adatok --- */
  var D=null;
  function race(id){if(!D)return null;var p=id.slice(0,2),k=id.slice(2);return p==="s:"?(D.senate||{})[k]:p==="g:"?(D.governor||{})[k]:(D.house||{})[k];}
  function callOf(r){var c=r&&r.call;return c==="D"||c==="R"||c==="I"?c:null;}
  var PN={D:"Demokrata",R:"Republikánus",I:"Független"},PC={D:"#2F6FE4",R:"#E2463F",I:"#8E5BD9"};
  function hashOf(id){var p=id.slice(0,2),k=id.slice(2);if(p==="h:"){var m=/^([A-Z]{2})-(\d+)$/.exec(k);return m?"#"+m[1]+"-house-k"+m[2]:"";}return "#"+k+"-"+(p==="s:"?"sen":"gov");}
  function seenNow(id){var s=get(KS,{});var r=race(id);s[id]=callOf(r)||"";put(KS,s);}
  function canNotify(){return APP||"Notification" in window;}
  function notifOn(){if(APP){try{return window.AppBridge.ertesitesek()==="on";}catch(e){return false;}}return get(KN,false)&&canNotify()&&Notification.permission==="granted";}
  function check(){if(!D||!L.length)return;var s=get(KS,{}),ch=false;
    L.forEach(function(f){var c=callOf(race(f.id))||"";if(s[f.id]===undefined){s[f.id]=c;ch=true;return;}
      if(c&&s[f.id]!==c){var msg=f.t+": "+PN[c]+" győzelem (AP)";toast("✓ Eldőlt – "+msg);
        if(APP&&notifOn()){try{window.AppBridge.ertesit("c:"+f.id+":"+c,"Eldőlt egy követett verseny",msg,"https://voksmero.hu/eredmenyek"+hashOf(f.id));}catch(e){}}
        else if(notifOn()){try{var n=new Notification("Eldőlt egy követett verseny",{body:msg,icon:"assets/app/icon-192.png?v=3",tag:f.id});n.onclick=function(){window.focus();location.href="eredmenyek"+hashOf(f.id);};}catch(e){}}
        s[f.id]=c;ch=true;}});
    if(ch)put(KS,s);}
  function paint(){var box=document.getElementById("favpanel");if(!box)return;
    if(!L.length){box.innerHTML=box.dataset.empty?'<div class="favp"><div class="fh"><h3>'+STAR+'Követett versenyek</h3></div><p class="favempty">'+box.dataset.empty+'</p></div>':"";return;}
    box.innerHTML='<div class="favp"><div class="fh"><h3>'+STAR+'Követett versenyek</h3>'+(canNotify()?'<button type="button" class="favn'+(notifOn()?' on':'')+'" id="favn">'+(notifOn()?'🔔 Értesítések bekapcsolva':'🔔 Értesítést kérek, ha eldől')+'</button>':'')+'</div><div class="fg">'+
      L.map(function(f){var r=race(f.id),c=callOf(r),lead=r&&r.lead,col=PC[c||lead]||"#8a94a8",rep=r?(r.pi!=null?r.pi:r.rep):null;
        var txt=!r?"Nincs adat":c?"✓ "+PN[c]+" győzelem":lead?"Vezet: "+(PN[lead]||lead)+(r.margin!=null?" +"+String(r.margin).replace(".",",")+" pont":""):"Még nincs eredmény";
        return '<a class="favc" style="--c:'+col+'" href="eredmenyek'+hashOf(f.id)+'"><b>'+f.t+'</b><small>'+txt+(rep!=null?" · "+String(rep).replace(".",",")+"% feldolgozva":"")+'</small><div class="bar"><i style="width:'+(rep||0)+'%"></i></div>'+window.FAVB(f.id,f.t)+'</a>';}).join("")+'</div></div>';
    var nb=document.getElementById("favn");if(nb)nb.onclick=function(){if(APP){if(notifOn()){toast("Az értesítéseket a telefon beállításaiban kapcsolhatod ki.");return;}try{window.AppBridge.engedely();}catch(e){}setTimeout(paint,3000);return;}if(notifOn()){put(KN,false);paint();toast("Értesítések kikapcsolva");return;}
      Notification.requestPermission().then(function(p){put(KN,p==="granted");paint();toast(p==="granted"?"Szólunk, ha egy követett verseny eldől (amíg az oldal nyitva van).":"Az értesítéseket a böngésző nem engedélyezte.");});};}
  function load(){var urls=["https://raw.githubusercontent.com/medence32-beep/valasztas-adat/main/data.json","data.json"];var i=0;
    (function next(){if(i>=urls.length)return;var u=urls[i++];fetch(u+"?_="+Date.now(),{cache:"no-store"}).then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){D=j;check();paint();}).catch(next);})();}
  function start(){appSync();paint();if(L.length||document.getElementById("favpanel")){load();setInterval(load,90000);}sync();}
  document.addEventListener("favchange",function(){if(!D)load();});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
  window.FAV={has:has,toggle:toggle,list:function(){return L.slice();},sync:sync};
})();
