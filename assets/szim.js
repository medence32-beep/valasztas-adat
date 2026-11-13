/* Választási szimulátor – modell és mandátumszámítás (Magyarország, 2026-os alapadatok) */
(function(root){
"use strict";
const PROF=["T","F","M","D","K"];             /* 2026-os profilok: Tisza, Fidesz, Mi Hazánk, DK, MKKP */
const PI={T:0,F:1,M:2,D:3,K:4};
const lg=p=>Math.log(p/(1-p)),sg=x=>1/(1+Math.exp(-x));
const cl=(p,a,b)=>p<a?a:p>b?b:p;
/* determinisztikus véletlen (mulberry32) + normális eloszlás */
function rng(seed){let a=seed>>>0;const r=()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
  r.n=()=>{let u=0,v=0;while(!u)u=r();while(!v)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};return r;}

/* ---------- alapadatok előkészítése ---------- */
function prepare(D){
  const U=D.u.map(u=>{const lv=u[10]+u[11]+u[12]+u[13]+u[14]||1,v=u[3]||1;
    return {oi:u[0],vp:u[1],sz:u[2],v:u[3],lv:lv,c:[u[4]/v,u[5]/v,u[6]/v,u[7]/v,u[8]/v,u[9]/v],l:[u[10]/lv,u[11]/lv,u[12]/lv,u[13]/lv,u[14]/lv],
      to:cl(u[2]/(u[1]||1),.2,.97),vr:u[3]/(u[2]||1),lr:lv/(u[2]||1),svp:u[15],bp:u[16],n:u[17],k:u[18]};});
  let W=0,WL=0,vp=0,sz=0;const C=[0,0,0,0,0,0],L=[0,0,0,0,0];
  U.forEach(u=>{W+=u.v;WL+=u.lv;vp+=u.vp;sz+=u.sz;u.c.forEach((x,i)=>C[i]+=x*u.v);u.l.forEach((x,i)=>L[i]+=x*u.lv);});
  const M=D.mail;let MT=0;PROF.forEach(p=>MT+=M[p]);
  /* bal–jobb helyzet településrészenként (2026-os listás arányokból), majd szavazóval súlyozott rangsor 0..1 */
  const POS=[5.5,8,9.5,2.5,3.5];
  U.forEach(u=>{let a=0,b=0;u.l.forEach((x,i)=>{a+=x*POS[i];b+=x;});u.x=b>0?a/b:6;});
  const ord=U.map((u,i)=>i).sort((a,b)=>U[a].x-U[b].x);let cum=0;const tv=U.reduce((s,u)=>s+u.vp,0)||1;
  ord.forEach(i=>{const u=U[i];u.r=(cum+u.vp/2)/tv;cum+=u.vp;});
  return {U:U,ids:D.ids,no:D.ids.length,pop:D.pop||{},mjv:D.mjv||[],cs:D.cs||{},C:C.map(x=>x/W),L:L.map(x=>x/WL),turn:sz/vp,vp:vp,mail:M,mailT:MT,nat:D.nat,el:D.el};
}

/* ---------- arányok illesztése: logit + egyenletes elmozdulás keveréke ---------- */
/* base[j][u]: kiinduló arány, T[j]: országos cél, w[u]: súly, nz[j][u]: logit-zaj */
function fit(base,T,w,nz,al){
  const J=base.length,N=w.length;let Wt=0;for(let u=0;u<N;u++)Wt+=w[u];
  const B=base.map(b=>{let s=0;for(let u=0;u<N;u++)s+=b[u]*w[u];return s/Wt;});
  const d=T.map((t,j)=>t>0?lg(cl(t,1e-5,.999))-lg(cl(B[j],1e-5,.999)):0);
  const S=base.map(()=>new Float64Array(N)),LB=base.map(b=>Float64Array.from(b,x=>lg(cl(x,1e-4,.995))));
  for(let it=0;it<40;it++){
    const sh=B.map((b,j)=>sg(lg(cl(b,1e-5,.999))+d[j])-b);
    for(let u=0;u<N;u++){let tot=0;
      for(let j=0;j<J;j++){if(!(T[j]>0)){S[j][u]=0;continue;}const z=nz?nz[j][u]:0;
        const x=al*sg(LB[j][u]+d[j]+z)+(1-al)*Math.max(4e-4,(base[j][u]+sh[j])*Math.exp(z));S[j][u]=x;tot+=x;}
      if(tot>0)for(let j=0;j<J;j++)S[j][u]/=tot;}
    let err=0;
    for(let j=0;j<J;j++){if(!(T[j]>0))continue;let s=0;for(let u=0;u<N;u++)s+=S[j][u]*w[u];const n=s/Wt;
      const e=lg(cl(T[j],1e-5,.999))-lg(cl(n,1e-5,.999));d[j]+=e*0.9;err=Math.max(err,Math.abs(n-T[j]));}
    if(err<2e-6)break;}
  return S;
}

/* ---------- egy teljes forgatókönyv kiszámítása ---------- */
/* P: [{id,name,color,pct,prof:'T'|'F'|'M'|'D'|'K'|'U',type:'p'|'s2'|'s3',cand:true}], o: {turn, mail, unc, seed, nat} */
function run(G,P,o){
  const R=rng(o.seed||1),U=G.U,N=U.length,no=G.no;
  /* pártok + egyéb */
  const ps=P.map(p=>Object.assign({},p));let sum=ps.reduce((s,p)=>s+Math.max(0,+p.pct||0),0);
  const oth={id:"_o",name:"Egyéb pártok",color:"var(--p-oth)",pct:Math.max(0,100-sum),prof:"O",type:"x",cand:true,oth:true};
  if(sum>100)ps.forEach(p=>p.pct=p.pct*100/sum);ps.push(oth);
  const J=ps.length,T=ps.map(p=>Math.max(0,+p.pct||0)/100);
  /* zaj */
  const lvl=+o.unc||0,so=0.09*lvl,su=0.14*lvl;let nz=null;
  if(lvl>0){const zo=ps.map(()=>Float64Array.from({length:no},()=>R.n()*so));
    nz=ps.map((p,j)=>Float64Array.from({length:N},(_,u)=>zo[j][U[u].oi]+R.n()*su));}
  /* listás alap */
  const prof=p=>p.prof in PI?PI[p.prof]:-1;
  /* új párt: a bal–jobb irányultsága szerint ott erős, ahol a választók hasonló helyen állnak */
  const aff=p=>{const t=(Math.max(-10,Math.min(10,+p.ide||0))+10)/20;return U.map(u=>Math.exp(-Math.pow(u.r-t,2)/(2*0.2*0.2))+0.12);};
  const AF=ps.map(p=>!p.oth&&(p.prof==="I"||p.prof==="U"||p.geo==="i")?aff(p):null);
  const bL=ps.map((p,j)=>{const k=prof(p);return Float64Array.from(U,(u,i)=>AF[j]?0.05*AF[j][i]:k>=0?u.l[k]:(p.oth?0.004:G.L.reduce((a,b)=>a+b,0)/5));});
  /* kijelölt erős települések / vármegyék: az esélyhányados megszorzása */
  const BF=[1,2.5,6,15],boost=(arr,j)=>{const p=ps[j];if(!p.st||!p.st.length)return;const f=BF[p.sb||2]||2.8,set=new Set(p.st);
    U.forEach((u,i)=>{if(set.has(u.k)||set.has("m:"+String(u.k).slice(0,2))){const x=Math.min(.98,arr[i]);arr[i]=x*f/(1-x+x*f);}});};
  bL.forEach((a,j)=>boost(a,j));
  const wL=Float64Array.from(U,u=>u.lv);
  const SL=fit(bL,T,wL,nz,0.5);
  /* egyéni alap: a 2026-os jelölt/lista arány megtartásával */
  const cr=ps.map(p=>{const k=prof(p);return k>=0&&G.L[k]>0?G.C[k]/G.L[k]:1;});
  /* az „egyéb” jelöltek aránya akkora, mintha mindenki indulna; aki nem indít egyéni jelöltet, annak szavazói arányosan a többi jelöltre szavaznak */
  const oj=J-1,full=ps.reduce((a,p,j)=>a+(p.oth?0:T[j]*cr[j]),0),oc=0;/* egyéb (kis pártos, független) jelölt nem indul */
  let TC=ps.map((p,j)=>p.oth||p.cand===false?0:T[j]*cr[j]);const cs=TC.reduce((a,b)=>a+b,0);
  if(cs>0)TC=TC.map(x=>x*(1-oc)/cs);TC[oj]=0;
  const bC=ps.map((p,j)=>{const k=prof(p);return Float64Array.from(U,(u,i)=>p.oth?Math.max(.002,u.c[5]):AF[j]?0.05*AF[j][i]:k>=0?u.c[k]:0.05);});
  bC.forEach((a,j)=>boost(a,j));
  const wC=Float64Array.from(U,u=>u.v);
  const SC=fit(bC,TC,wC,nz,0.5);
  /* részvétel */
  const tgt=cl((+o.turn||G.turn*100)/100,.2,.97);let tau=0;
  for(let it=0;it<30;it++){let s=0;for(const u of U)s+=u.vp*sg(lg(u.to)+tau);const e=s/G.vp;tau+=(lg(tgt)-lg(e));if(Math.abs(e-tgt)<1e-7)break;}
  /* településrészenkénti szavazatok */
  const UV=U.map((u,i)=>{const vo=u.vp*sg(lg(u.to)+tau),cv=vo*u.vr,lv=vo*u.lr;
    return {vo:vo,c:ps.map((p,j)=>cv*SC[j][i]),l:ps.map((p,j)=>lv*SL[j][i])};});
  /* levélszavazatok */
  const M=Math.max(0,+o.mail||0),mr=ps.map((p,j)=>{if(p.oth)return 0.004*T[j];const k=prof(p);return k>=0?(G.mail[PROF[k]]/G.mailT)*(T[j]/Math.max(1e-4,G.L[k])):0.25*T[j];});
  const ms=mr.reduce((a,b)=>a+b,0)||1;const mail=mr.map(x=>M*x/ms);
  const nf=tgt/G.turn,nat={tot:G.nat.tot*nf,de:G.nat.de*nf};
  return {ps:ps,UV:UV,mail:mail,nat:nat,turn:tgt,seed:o.seed,natOn:o.nat!==false};
}

/* ---------- mandátumszámítás ---------- */
/* oc[o][j]: egyéni szavazatok körzetenként; lst[j]: listás szavazatok (hazai+levél); res: run() eredménye */
function seats(res,oc,lst,full){
  const ps=res.ps,J=ps.length;const ev=new Array(J).fill(0),tor=new Array(J).fill(0),win=[];
  for(let o=0;o<oc.length;o++){const c=oc[o];if(!c){win.push(-1);continue;}
    /* az „egyéb” jelöltek közül a legerősebb kb. a szavazataik 60%-át kapja */
    const cv=c.map((v,j)=>ps[j].oth?v*0.6:v);let a=-1,b=-1;
    for(let j=0;j<J;j++){if(a<0||cv[j]>cv[a]){b=a;a=j;}else if(b<0||cv[j]>cv[b])b=j;}
    if(!(cv[a]>0)){win.push(-1);continue;}
    win.push(a);ev[a]++;
    for(let j=0;j<J;j++){if(ps[j].oth)continue;if(j===a)tor[j]+=Math.max(0,cv[a]-(b>=0?cv[b]:0)-1);else tor[j]+=c[j];}}
  const natTot=res.natOn&&full?res.nat.tot:0;
  const all=lst.reduce((s,x)=>s+x,0)+(full?res.nat.tot:0);
  const thr=ps.map(p=>p.type==="s3"?.15:p.type==="s2"?.10:.05);
  const q=ps.map((p,j)=>!p.oth&&all>0&&lst[j]>=thr[j]*all);
  const V=ps.map((p,j)=>q[j]?lst[j]+tor[j]:0);
  let nseat=0;
  if(res.natOn&&full){const quota=(V.reduce((a,b)=>a+b,0)+res.nat.tot)/93/4;if(res.nat.de>=quota)nseat=1;}
  const ls=new Array(J).fill(0),K=93-nseat;
  if(V.some(x=>x>0))for(let s=0;s<K;s++){let m=-1;for(let j=0;j<J;j++)if(V[j]>0&&(m<0||V[j]/(ls[j]+1)>V[m]/(ls[m]+1)))m=j;ls[m]++;}
  return {ev:ev,ls:ls,tot:ev.map((x,j)=>x+ls[j]),tor:tor,q:q,win:win,nat:nseat,thr:thr,all:all};
}
/* végeredmény egy futtatásból */
function final(G,res){const no=G.no,J=res.ps.length;const oc=Array.from({length:no},()=>new Array(J).fill(0)),lst=new Array(J).fill(0);
  res.UV.forEach((x,i)=>{const o=G.U[i].oi;for(let j=0;j<J;j++){oc[o][j]+=x.c[j];lst[j]+=x.l[j];}});
  const lf=lst.map((x,j)=>x+res.mail[j]);return {oc:oc,lst:lst,lf:lf,s:seats(res,oc,lf,true)};}

/* ---------- választási éjszaka: szavazókörök beérkezése ---------- */
function night(G,res){
  const R=rng((res.seed||1)*7919+13),U=G.U,J=res.ps.length,ch=[];
  U.forEach((u,i)=>{const n=Math.max(1,Math.round(u.vp/720));
    const base=u.bp?128:u.svp<1000?40:u.svp<5000?52:u.svp<20000?70:u.svp<60000?92:112;
    const fr=[];let fs=0;for(let k=0;k<n;k++){const f=0.6+R()*0.8;fr.push(f);fs+=f;}
    /* pártonként kicsit eltérő arány szavazókörönként, összegük pontosan a településrész eredménye */
    const wc=[],wl=[];for(let j=0;j<J;j++){const a=[],b=[];let sa=0,sb=0;
      for(let k=0;k<n;k++){const e=Math.exp(R.n()*(n>1?0.07:0));a.push(fr[k]*e);b.push(fr[k]*e);sa+=a[k];sb+=b[k];}
      wc.push(a.map(x=>x/sa));wl.push(b.map(x=>x/sb));}
    for(let k=0;k<n;k++){const t=Math.min(330,base*Math.exp(R.n()*0.32)*(0.85+0.3*R())+6);
      ch.push({t:t,u:i,o:u.oi,vo:res.UV[i].vo*fr[k]/fs,c:wc.map((a,j)=>res.UV[i].c[j]*a[k]),l:wl.map((a,j)=>res.UV[i].l[j]*a[k])});}});
  ch.sort((a,b)=>a.t-b.t);
  const exp=new Float64Array(G.no);U.forEach((u,i)=>{const x=res.UV[i];exp[u.oi]+=x.c.reduce((a,b)=>a+b,0);});
  const cnt=new Int32Array(G.no);ch.forEach(c=>cnt[c.o]++);
  return {ch:ch,end:ch.length?ch[ch.length-1].t:0,exp:exp,cnt:cnt};
}

/* EP-választás: egy országos lista, 21 hely, D'Hondt, 5%-os küszöb */
function seatsEP(res,lst,n){const ps=res.ps,all=lst.reduce((a,b)=>a+b,0);const q=ps.map((p,j)=>!p.oth&&all>0&&lst[j]>=0.05*all);
  const ls=new Array(ps.length).fill(0);if(q.some(x=>x))for(let s=0;s<(n||21);s++){let m=-1;for(let j=0;j<ps.length;j++)if(q[j]&&(m<0||lst[j]/(ls[j]+1)>lst[m]/(ls[m]+1)))m=j;ls[m]++;}
  return {ev:new Array(ps.length).fill(0),ls:ls,tot:ls.slice(),tor:new Array(ps.length).fill(0),q:q,win:[],nat:0,thr:ps.map(()=>.05),all:all};}
/* önkormányzati: polgármesterek (településenként relatív többség), főpolgármester, vármegyei közgyűlések (D'Hondt, 5/10/15%) */
function local(G,res,uc,ul,done){const ps=res.ps,J=ps.length,U=G.U,MJ=new Set(G.mjv);
  const byK={};U.forEach((u,i)=>{(byK[u.k]||(byK[u.k]=[])).push(i);});
  const may=new Array(J).fill(0),mayL=new Array(J).fill(0),win={};let fin=0;const bp=new Float64Array(J),cty={};
  Object.keys(byK).forEach(k=>{const us=byK[k],c=new Float64Array(J);let any=false,full=true;
    us.forEach(i=>{const a=uc[i];for(let j=0;j<J;j++)c[j]+=a[j];if(done[i]>0)any=true;if(!(done[i]>=1))full=false;});
    if(k.slice(0,2)==="01")for(let j=0;j<J;j++)bp[j]+=c[j];
    else if(!MJ.has(k)){const m=k.slice(0,2),L=cty[m]||(cty[m]=new Float64Array(J));us.forEach(i=>{const a=ul[i];for(let j=0;j<J;j++)L[j]+=a[j];});}
    if(!any)return;let w=0;for(let j=1;j<J;j++)if(c[j]>c[w])w=j;win[k]={w:w,f:full};if(full){may[w]++;fin++;}else mayL[w]++;});
  let fo=0;for(let j=1;j<J;j++)if(bp[j]>bp[fo])fo=j;
  const thr=ps.map(p=>p.type==="s3"?.15:p.type==="s2"?.10:.05),cs={},tot=new Array(J).fill(0);
  Object.keys(cty).forEach(m=>{const L=cty[m],all=L.reduce((a,b)=>a+b,0),n=G.cs[m]||15,ls=new Array(J).fill(0);
    const q=ps.map((p,j)=>!p.oth&&all>0&&L[j]>=thr[j]*all);
    if(q.some(x=>x))for(let s=0;s<n;s++){let b=-1;for(let j=0;j<J;j++)if(q[j]&&(b<0||L[j]/(ls[j]+1)>L[b]/(ls[b]+1)))b=j;ls[b]++;}
    ls.forEach((x,j)=>tot[j]+=x);cs[m]={n:n,ls:ls,v:Array.from(L),q:q};});
  return {may:may,mayL:mayL,win:win,fin:fin,nk:Object.keys(byK).length,bp:Array.from(bp),fo:fo,cs:cs,tot:tot,thr:thr};}
root.SZIM={PROF:PROF,rng:rng,prepare:prepare,run:run,seats:seats,seatsEP:seatsEP,local:local,final:final,night:night};
})(typeof window!=="undefined"?window:globalThis);
