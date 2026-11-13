/* Gyors nagyítás/húzás SVG-térképekhez.
   Mozgás közben a térkép csak „képként” (CSS-transzformációval, a videokártyán) mozog,
   és csak a mozdulat végén rajzolódik újra élesen (viewBox). Így több ezer alakzatnál sem akad meg. */
(function(){
  "use strict";
  var st=document.createElement("style");
  st.textContent="svg.fz{will-change:transform}svg.fz *{pointer-events:none!important}svg.fz text,svg.fz .lbl,svg.fz .ttl{visibility:hidden}";
  document.head.appendChild(st);
  window.FastZoom=function(svg,opt){
    opt=opt||{};var C=null,P=null,t=0,raf=0,t0=0,par=null,parOv="";
    var DELAY=opt.delay||170,MAXHOLD=opt.maxHold||900;
    function read(){var b=svg.viewBox.baseVal;return [b.x,b.y,b.width,b.height];}
    function apply(){raf=0;if(!P||!C)return;
      var W=svg.clientWidth||svg.getBoundingClientRect().width,H=svg.clientHeight||svg.getBoundingClientRect().height;if(!W||!H)return;
      var k=Math.min(W/C[2],H/C[3]),k2=Math.min(W/P[2],H/P[3]),s=k2/k;
      var ox=(W-C[2]*k)/2,oy=(H-C[3]*k)/2,ox2=(W-P[2]*k2)/2,oy2=(H-P[3]*k2)/2;
      var tx=ox2-s*ox+k2*(C[0]-P[0]),ty=oy2-s*oy+k2*(C[1]-P[1]);
      svg.style.transform="translate("+tx.toFixed(2)+"px,"+ty.toFixed(2)+"px) scale("+s.toFixed(5)+")";}
    function commit(){clearTimeout(t);t=0;if(raf){cancelAnimationFrame(raf);raf=0;}if(!P)return;var v=P;P=null;C=null;
      svg.setAttribute("viewBox",v.map(function(n){return n.toFixed(2);}).join(" "));svg.style.transform="";svg.classList.remove("fz");
      if(par){par.style.overflow=parOv;par=null;}
      if(opt.onCommit)try{opt.onCommit(v);}catch(e){}}
    function set(v,now){
      if(now||opt.off||matchMedia("(prefers-reduced-motion: reduce)").matches&&!C){P=v.slice();commit();return;}
      var tm=performance.now();
      if(!C){C=read();t0=tm;svg.style.transformOrigin="0 0";svg.classList.add("fz");
        par=svg.parentElement;if(par&&getComputedStyle(par).overflow==="visible"){parOv=par.style.overflow;par.style.overflow="hidden";}else par=null;}
      P=v.slice();if(!raf)raf=requestAnimationFrame(apply);
      clearTimeout(t);
      if(tm-t0>MAXHOLD){commit();return;}   /* hosszú, folyamatos mozgásnál időnként élesít */
      t=setTimeout(commit,DELAY);}
    return {get:function(){return P?P.slice():read();},set:set,commit:commit,busy:function(){return !!P;}};
  };
})();
