function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const idx=(x,y)=>x+y*MW, inB=(x,y)=>x>=0&&y>=0&&x<MW&&y<MH;
const tileOf=v=>Math.floor(v/T);
const hyp=Math.hypot;
const DIRS=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]];
const HW=26,HH=26,HCELL=96,HEAP_MAX=N*8,HEAP_K=new Float32Array(HEAP_MAX),HEAP_I=new Uint16Array(HEAP_MAX);

class Game{
 constructor(o){
  this.o=o;this.rng=mulberry(o.seed||7);this.tick=0;this.nid=1;
  this.blocked=new Uint8Array(N);this.units=[];this.blds=[];this.res=[];this.proj=[];this.fx=[];this.delayed=[];this.by=new Map();
  this.fields=new Map();this.navV=1;this.fieldBudget=0;this.hash=[];for(let i=0;i<HW*HH;i++)this.hash.push([]);
  const mk=(id,f,ai,diff)=>({id,fac:f,ai,diff,c:75,d:0,supUsed:0,supCap:0,atk:0,arm:0,out:false,abilCd:0,income:diff==='hard'?1.25:diff==='easy'?.85:1,color:FAC[f].color,ctx:null,ctxV:0,stats:{made:0,lost:0,killed:0,gathered:0},alive:true});
  const list=o.players||[{f:o.f0,ai:o.ai0,d:o.d0},{f:o.f1,ai:o.ai1,d:o.d1}];
  this.p=list.map((q,i)=>mk(i,q.f,!!q.ai,q.d||'normal'));
  this.p.forEach((q,i)=>{if(this.p.slice(0,i).some(x=>x.fac===q.fac))q.color=ALT_COLOR});
  this.mapId=o.map||(list.length===3?'three':'duel');
  const np=this.p.length;this.ally=this.p.map(()=>new Array(np).fill(0));this.allyOn=this.p.map(()=>new Array(np).fill(false));this.dipCd=new Array(np).fill(0);this.trust=new Array(np).fill(0);this.coalCd=0;this.notices=[];
  this.trend=[];this.decals=[];this.vis=new Uint8Array(N);this.visDirty=true;this.visV=0;this.winner=-1;this.events=[];
  this.observer=!!o.observer;
  this.genMap();this.setup();
  this.bots=[];
  this.p.forEach(p=>{if(p.ai)this.bots.push(new Bot(this,p.id,p.diff))});
  this.updateVis();
 }
 genMap(){
  if(this.mapId==='three'){this.genThree();return}
  const b=this.blocked,mir=(x,y)=>[MW-1-x,MH-1-y];
  const set=(x,y,v)=>{if(inB(x,y)){b[idx(x,y)]=v;const m=mir(x,y);b[idx(m[0],m[1])]=v}};
  const disk=(cx,cy,r,v)=>{for(let y=Math.floor(cy-r);y<=cy+r;y++)for(let x=Math.floor(cx-r);x<=cx+r;x++)if(hyp(x-cx,y-cy)<=r)set(x,y,v)};
  const line=(x0,y0,x1,y1,w)=>{const n=Math.ceil(hyp(x1-x0,y1-y0)*2);for(let i=0;i<=n;i++)disk(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,w,1)};
  const lv=new Float32Array(N);this.level=lv;
  if(this.mapId==='duel2'){
   // 협곡 회랑: 중앙 벽 때문에 정면과 남북 측면의 세 갈래로 나뉜다
   this.ramps=[{x:20,y:35,w:5,h:6,axis:'x',dir:1},{x:MW-25,y:MH-41,w:5,h:6,axis:'x',dir:-1}];
   line(0,26,20,26,1.3);line(20,26,20,34,1.3);line(20,42,20,51,1.3);line(0,51,20,51,1.3);
   line(37,18,37,25,1.5);disk(30,38,2.2,1);line(27,8,32,12,1.3);line(26,62,31,66,1.3);line(4,18,8,14,1.2);disk(46,8,2,1);
   for(let y=27;y<51;y++)for(let x=0;x<20;x++){lv[idx(x,y)]=1;lv[idx(MW-1-x,MH-1-y)]=1}
   for(let y=35;y<41;y++)for(let x=20;x<25;x++){const v=Math.max(0,1-(x-20)/4.5);lv[idx(x,y)]=v;lv[idx(MW-1-x,MH-1-y)]=v}
  }else{
   this.ramps=[{x:23,y:62,w:5,h:6,axis:'x',dir:1},{x:MW-28,y:MH-68,w:5,h:6,axis:'x',dir:-1}];
   // 본진 고지대: 벽으로 둘러싸고 경사로 하나만 낸다
   line(0,50,24,50,1.3);line(24,50,24,61,1.3);line(24,68,24,75,1.3);
   line(30,30,36,26,1.6);line(22,24,22,31,1.6);line(44,22,50,26,1.3);line(33,47,41,49,1.5);
   line(4,28,9,24,1.3);line(50,44,54,40,1.4);line(8,8,8,13,1);disk(38,38,2.6,1);
   for(let y=51;y<MH;y++)for(let x=0;x<24;x++){lv[idx(x,y)]=1;lv[idx(MW-1-x,MH-1-y)]=1}
   for(let y=62;y<68;y++)for(let x=23;x<28;x++){const v=Math.max(0,1-(x-23)/4.5);lv[idx(x,y)]=v;lv[idx(MW-1-x,MH-1-y)]=v}
  }
  const bases=this.mapId==='duel2'?[[10,38,8,8,2],[30,22,6,6,1],[30,56,6,6,1],[10,12,6,6,1]]:[[12,63,8,8,2],[34,66,6,6,1],[15,38,6,6,1],[15,15,6,6,1]];
  this.bases=[];
  for(const [x,y,clear,nodes,lakes] of bases){
   disk(x-.5,y-.5,clear+1,0);
   const a0=Math.atan2(y-38,x-38);
   const add=(px,py,side)=>{this.bases.push({x:side?MW-px:px,y:side?MH-py:py,main:nodes===8})};
   add(x,y,0);add(x,y,1);
   for(let i=0;i<nodes;i++){
    const a=a0+(i-(nodes-1)/2)*(nodes===8?.3:.36),r=clear+(i%2?1.8:.6)+(nodes===8?0:2);
    let px=Math.max(1,Math.min(MW-3,Math.round(x+Math.cos(a)*r))),py=Math.max(1,Math.min(MH-2,Math.round(y+Math.sin(a)*r)));
    this.addRes('c',px,py,2,1,1500);this.addRes('c',MW-px-2,MH-py-1,2,1,1500);
   }
   for(let i=0;i<lakes;i++){
    const a=a0+(lakes===1?(x===34?-1.85:1.85):(i?1.5:-1.5)),r=clear+2.5;
    let px=Math.max(1,Math.min(MW-4,Math.round(x+Math.cos(a)*r)-1)),py=Math.max(1,Math.min(MH-4,Math.round(y+Math.sin(a)*r)-1));
    this.addRes('d',px,py,3,3,3200);this.addRes('d',MW-px-3,MH-py-3,3,3,3200);
   }
  }
  this.terrain=b.slice();
  for(const r of this.res)this.stamp(r,1);
 }
 genThree(){
  const b=this.blocked,lv=new Float32Array(N);this.level=lv;this.bases=[];
  const mx=x=>MW-1-x;
  const stamp1=(x,y,v)=>{if(inB(x,y))b[idx(x,y)]=v};
  const disk=(cx,cy,r,v,mir)=>{for(let y=Math.floor(cy-r);y<=cy+r;y++)for(let x=Math.floor(cx-r);x<=cx+r;x++)if(hyp(x-cx,y-cy)<=r){stamp1(x,y,v);if(mir)stamp1(mx(x),y,v)}};
  const line=(x0,y0,x1,y1,w,mir)=>{const n=Math.ceil(hyp(x1-x0,y1-y0)*2);for(let i=0;i<=n;i++)disk(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,w,1,mir)};
  // 좌하·우하 고지대 (경사로는 북쪽)
  line(0,50,9,50,1.3,1);line(17,50,24,50,1.3,1);line(24,50,24,75,1.3,1);
  // 상단 중앙 고지대 (경사로는 남쪽)
  line(26,0,26,24,1.3,1);line(26,24,34,24,1.3,1);
  // 중앙 장애물
  disk(38,52,2.6,1,0);line(30,58,30,64,1.5,1);line(23,31,27,36,1.5,1);line(5,26,10,22,1.3,1);line(20,14,20,19,1.1,1);
  for(let y=51;y<MH;y++)for(let x=0;x<24;x++){lv[idx(x,y)]=1;lv[idx(mx(x),y)]=1}
  for(let y=0;y<24;y++)for(let x=27;x<49;x++)lv[idx(x,y)]=1;
  for(let y=46;y<52;y++)for(let x=10;x<17;x++){const v=Math.min(1,Math.max(0,(y-46)/4.5));lv[idx(x,y)]=v;lv[idx(mx(x),y)]=v}
  for(let y=23;y<29;y++)for(let x=35;x<41;x++)lv[idx(x,y)]=Math.min(1,Math.max(0,1-(y-23)/4.5));
  this.ramps=[{x:10,y:46,w:7,h:6,axis:'y',dir:1},{x:MW-17,y:46,w:7,h:6,axis:'y',dir:1},{x:35,y:23,w:6,h:6,axis:'y',dir:-1}];
  const place=(x,y,a0,clear,nodes,lakes,mir)=>{
   disk(x-.5,y-.5,clear+1,0,mir);this.bases.push({x,y,main:nodes===8});if(mir)this.bases.push({x:MW-x,y,main:nodes===8});
   for(let i=0;i<nodes;i++){const a=a0+(i-(nodes-1)/2)*(nodes===8?.3:.36),r=clear+(i%2?1.8:.6)+(nodes===8?0:2),px=Math.max(1,Math.min(MW-3,Math.round(x+Math.cos(a)*r))),py=Math.max(1,Math.min(MH-2,Math.round(y+Math.sin(a)*r)));this.addRes('c',px,py,2,1,1500);if(mir)this.addRes('c',MW-px-2,py,2,1,1500)}
   for(let i=0;i<lakes;i++){const a=a0+(lakes===1?1.85:(i?1.5:-1.5)),r=clear+2.5,px=Math.max(1,Math.min(MW-4,Math.round(x+Math.cos(a)*r)-1)),py=Math.max(1,Math.min(MH-4,Math.round(y+Math.sin(a)*r)-1));this.addRes('d',px,py,3,3,3200);if(mir)this.addRes('d',MW-px-3,py,3,3,3200)}
  };
  const A=Math.atan2(25,-26);
  place(12,63,A,8,8,2,true);place(38,12,-Math.PI/2,8,8,2,false);
  place(13,37,Math.PI+.2,6,6,1,true);place(38,36,Math.PI/2,6,6,1,false);
  place(38,66,Math.PI/2,6,6,1,false);place(12,13,Math.atan2(-1,-1),6,6,1,true);
  this.terrain=b.slice();for(const r of this.res)this.stamp(r,1);
 }
 hostile(a,b){return a!==b&&a>=0&&b>=0&&this.ally[a][b]<=this.tick}
 power(i){let s=0;for(const u of this.units)if(u.p===i&&!u.def.worker&&!u.summon)s+=(u.def.c+u.def.d*1.5)/(u.def.count||1);return s}
 setAlly(a,b,ticks){const v=ticks>0?this.tick+ticks:0;this.ally[a][b]=this.ally[b][a]=v;this.allyOn[a][b]=this.allyOn[b][a]=ticks>0}
 diplo(){
  const alive=this.p.filter(p=>!p.out),nm=i=>FAC[this.p[i].fac].name;
  for(let a=0;a<this.p.length;a++)for(let b=a+1;b<this.p.length;b++){
   if(this.allyOn[a][b]&&(this.ally[a][b]<=this.tick||alive.length<3)){this.setAlly(a,b,0);this.notices.push(nm(a)+'와(과) '+nm(b)+'의 동맹이 끝났습니다.')}}
  if(alive.length<3||this.tick<300*TPS||this.tick<this.coalCd)return;
  const ranked=alive.slice().sort((x,y)=>this.power(y.id)-this.power(x.id)),[s,a,b]=ranked,Ps=this.power(s.id);
  if(a.ai&&b.ai&&!this.ally[a.id][b.id]&&!this.ally[s.id][a.id]&&!this.ally[s.id][b.id]&&Ps>800&&Ps>1.4*this.power(a.id)){
   this.setAlly(a.id,b.id,150*TPS);this.coalCd=this.tick+240*TPS;this.notices.push(nm(a.id)+'와(과) '+nm(b.id)+'이(가) '+nm(s.id)+'에 맞서 동맹을 맺었습니다.');
  }
 }
 propose(a,b){
  if(this.p[b].out||this.ally[a][b]>this.tick)return'no';
  if(this.dipCd[b]>this.tick)return'wait';
  this.dipCd[b]=this.tick+45*TPS;
  const third=this.p.find(p=>p.id!==a&&p.id!==b&&!p.out);
  if(!third||this.tick<this.trust[b]||this.power(third.id)<this.power(b)*.75)return'no';
  this.setAlly(a,b,180*TPS);return'ok';
 }
 betray(a,b){if(this.ally[a][b]<=this.tick)return;this.setAlly(a,b,0);this.trust[b]=this.tick+300*TPS;this.notices.push(FAC[this.p[a].fac].name+'이(가) '+FAC[this.p[b].fac].name+'와(과)의 동맹을 파기했습니다.')}
 addRes(type,tx,ty,w,h,amt){
  for(const r of this.res)if(tx<r.tx+r.w+0&&tx+w>r.tx&&ty<r.ty+r.h&&ty+h>r.ty)return;
  const e={id:this.nid++,kind:'r',type,tx,ty,w,h,x:(tx+w/2)*T,y:(ty+h/2)*T,amt,max:amt,miners:0,p:-1,r:w*T/2};
  this.res.push(e);this.by.set(e.id,e);
 }
 stamp(e,v){for(let y=e.ty;y<e.ty+e.h;y++)for(let x=e.tx;x<e.tx+e.w;x++)if(inB(x,y))this.blocked[idx(x,y)]=v;this.navV++}
 setup(){
  const starts=this.bases.slice(0,this.p.length);for(let i=starts.length-1;i>0;i--){const j=Math.floor(this.rng()*(i+1));[starts[i],starts[j]]=[starts[j],starts[i]]}
  this.p.forEach((p,i)=>{
   const s=starts[i],hq=this.makeBld(p,p.fac+'_hq',s.x-2,s.y-2,true);
   p.home=s;
   const nodes=this.res.filter(r=>r.type==='c').sort((a,b)=>hyp(a.x-hq.x,a.y-hq.y)-hyp(b.x-hq.x,b.y-hq.y));
   for(let k=0;k<5;k++){
    const nd=nodes[k],an=Math.atan2(nd.y-hq.y,nd.x-hq.x),sp=this.nearestFree(hq.x+Math.cos(an)*(hq.r+26),hq.y+Math.sin(an)*(hq.r+26));
    const u=this.spawnUnit(p,FAC[p.fac].worker,null,sp[0],sp[1]);p.supUsed+=UNIT[FAC[p.fac].worker].sup;
    this.setOrder(u,{t:'gather',id:nd.id,ph:'go'});
   }
  });
 }
 // ---- 건물·유닛 생성 ----
 makeBld(p,key,tx,ty,done){
  const def=BLD[key],e={id:this.nid++,kind:'b',p:p.id,def,tx,ty,w:def.w,h:def.h,x:(tx+def.w/2)*T,y:(ty+def.h/2)*T,r:def.w*T/2,hp:done?def.hp:def.hp*.1,sh:done?def.sh:0,built:!!done,prog:done?1:0,q:[],rally:null,lastHit:-9999,cd:0,tgt:null,mode:def.modes?'inf':null,modeT:0,builderNeeded:def.fac==='gem'&&!done};
  this.blds.push(e);this.by.set(e.id,e);this.stamp(e,1);
  if(done&&def.sup)p.supCap+=def.sup;
  if(def.ctx)p.ctxV++;
  if(def.role==='ext'){const l=this.res.find(r=>r.type==='d'&&r.tx===tx&&r.ty===ty);if(l){l.ext=e;e.lake=l.id}}
  return e;
 }
 spawnUnit(p,key,from,px,py){
  const def=UNIT[key];let x=px,y=py;
  if(x==null){const s=this.spawnSpot(from,from.rally,def);x=s[0];y=s[1]}
  const e={id:this.nid++,kind:'u',p:p.id,def,x,y,r:def.r,hp:def.hp,sh:def.sh||0,face:p.id?2.4:-.8,o:null,tgt:null,cd:this.rng()*.3,carry:0,carryType:null,lastHit:-9999,wx:x,wy:y,wpT:0,wpKey:'',moving:false,air:!!def.air,lastX:x,lastY:y,stuck:0,walk:this.rng()*6,life:0,flash:0,born:this.tick};
  this.units.push(e);this.by.set(e.id,e);return e;
 }
 spawnSpot(b,rally,def){
  if(def.air)return[b.x,b.y+b.r+4];
  const tox=rally?rally.x:(this.p[b.p].id?b.x-200:b.x+200),toy=rally?rally.y:(this.p[b.p].id?b.y+200:b.y-200);
  let best=null,bd=1e12;
  for(let y=b.ty-2;y<=b.ty+b.h+1;y++)for(let x=b.tx-2;x<=b.tx+b.w+1;x++){
   if(!inB(x,y)||this.blocked[idx(x,y)])continue;
   const cx=(x+.5)*T,cy=(y+.5)*T,d=hyp(cx-tox,cy-toy);if(d<bd){bd=d;best=[cx,cy]}
  }
  return best||this.nearestFree(b.x,b.y);
 }
 nearestFree(px,py){
  const sx=Math.max(0,Math.min(MW-1,tileOf(px))),sy=Math.max(0,Math.min(MH-1,tileOf(py)));
  for(let r=0;r<40;r++){let best=null,bd=1e12;
   for(let y=sy-r;y<=sy+r;y++)for(let x=sx-r;x<=sx+r;x++){
    if(Math.max(Math.abs(x-sx),Math.abs(y-sy))!==r||!inB(x,y)||this.blocked[idx(x,y)])continue;
    const c=[(x+.5)*T,(y+.5)*T],d=hyp(c[0]-px,c[1]-py);if(d<bd){bd=d;best=c}}
   if(best)return best}
  return[px,py];
 }
 // ---- 길찾기 ----
 fieldFor(key,seeds){
  const f=this.fields.get(key);if(f&&f.v===this.navV)return f.d;
  if(this.fieldBudget<=0)return null;this.fieldBudget--;
  const d=new Float32Array(N).fill(Infinity),hk=HEAP_K,hi=HEAP_I,b=this.blocked;let n=0;
  const push=(k,i)=>{let c=n++;while(c>0){const p=(c-1)>>1;if(hk[p]<=k)break;hk[c]=hk[p];hi[c]=hi[p];c=p}hk[c]=k;hi[c]=i};
  for(const s of seeds){d[s]=0;push(0,s)}
  while(n>0){
   const k=hk[0],i=hi[0];n--;
   if(n>0){const lk=hk[n],li=hi[n];let c=0;for(;;){let m=2*c+1;if(m>=n)break;if(m+1<n&&hk[m+1]<hk[m])m++;if(hk[m]>=lk)break;hk[c]=hk[m];hi[c]=hi[m];c=m}hk[c]=lk;hi[c]=li}
   if(k>d[i])continue;
   const x=i%MW,y=(i-x)/MW;
   for(let q=0;q<8;q++){const D=DIRS[q],dx=D[0],dy=D[1],nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=MW||ny>=MH)continue;const m=nx+ny*MW;if(b[m])continue;
    if(dx&&dy){const a1=x+dx+y*MW,a2=x+(y+dy)*MW;if((b[a1]&&d[a1]!==0)||(b[a2]&&d[a2]!==0))continue}
    const nd=k+D[2];if(nd<d[m]-1e-4){d[m]=nd;if(n<HEAP_MAX)push(nd,m)}}
  }
  this.fields.set(key,{v:this.navV,d});
  if(this.fields.size>90){const first=this.fields.keys().next().value;this.fields.delete(first)}
  return d;
 }
 seedsOf(e){const s=[];for(let y=e.ty;y<e.ty+e.h;y++)for(let x=e.tx;x<e.tx+e.w;x++)if(inB(x,y))s.push(idx(x,y));return s}
 pointKey(px,py){let tx=tileOf(px),ty=tileOf(py);tx=Math.max(0,Math.min(MW-1,tx));ty=Math.max(0,Math.min(MH-1,ty));
  if(this.blocked[idx(tx,ty)]){const f=this.nearestFree(px,py);tx=tileOf(f[0]);ty=tileOf(f[1])}
  return{key:'p'+tx+','+ty,seeds:[idx(tx,ty)],cx:(tx+.5)*T,cy:(ty+.5)*T}}
 los(x0,y0,x1,y1){
  const dx=x1-x0,dy=y1-y0,d=hyp(dx,dy);if(d<4)return true;
  const n=Math.ceil(d/10),ux=dx/d,uy=dy/d,lim=d-14;
  for(let i=1;i<=n;i++){const s=Math.min(i*10,lim);if(s<0)break;
   for(const off of[0,7,-7]){const px=x0+ux*s-uy*off,py=y0+uy*s+ux*off;if(this.isBlock(px,py))return false}}
  return true;
 }
 isBlock(px,py){const x=tileOf(px),y=tileOf(py);return !inB(x,y)||this.blocked[idx(x,y)]===1}
 stepDir(u,dx,dy){
  const d=hyp(dx,dy);if(d<.5)return;
  let sp=u.def.spd*T;
  if(u.def.fac==='cla'&&!u.air&&this.onCtx(u))sp*=1.25;
  if(u.boost>0)sp*=u.def.skill==='charge'?1.8:1.5;
  const s=Math.min(d,sp*DT),nx=u.x+dx/d*s,ny=u.y+dy/d*s;
  if(u.air){u.x=Math.max(8,Math.min(MW*T-8,nx));u.y=Math.max(8,Math.min(MH*T-8,ny))}
  else{if(!this.isBlock(nx,u.y))u.x=nx;if(!this.isBlock(u.x,ny))u.y=ny}
  u.face=Math.atan2(dy,dx);u.moving=true;u.walk+=DT*(sp/40);
 }
 route(u,gx,gy,key,seeds){
  if(u.air){this.stepDir(u,gx-u.x,gy-u.y);return true}
  u.wpT--;
  if(u.wpT<=0||u.wpKey!==key||hyp(u.wx-u.x,u.wy-u.y)<5){
   u.wpT=9;u.wpKey=key;
   if(this.los(u.x,u.y,gx,gy)){u.wx=gx;u.wy=gy}
   else{
    const f=this.fieldFor(key,seeds);if(!f){u.wpT=1;return false}
    let x=tileOf(u.x),y=tileOf(u.y),wx=null,wy=null;
    for(let i=0;i<7;i++){
     let bx=-1,by=-1,bd=f[idx(x,y)];
     for(const [dx,dy] of DIRS){const nx=x+dx,ny=y+dy;if(!inB(nx,ny))continue;const v=f[idx(nx,ny)];if(v>=bd)continue;
      if(dx&&dy&&(this.blocked[idx(x+dx,y)]||this.blocked[idx(x,y+dy)]))continue;bd=v;bx=nx;by=ny}
     if(bx<0)break;x=bx;y=by;if(bd===0&&this.blocked[idx(x,y)])break;
     const cx=(x+.5)*T,cy=(y+.5)*T;
     if(i===0||this.los(u.x,u.y,cx,cy)){wx=cx;wy=cy}else break;
    }
    if(wx===null){u.wpT=6;return false}
    u.wx=wx;u.wy=wy;
   }
  }
  this.stepDir(u,u.wx-u.x,u.wy-u.y);return true;
 }
 routeEnt(u,e){
  if(e.kind==='u'){const k='p'+tileOf(e.x)+','+tileOf(e.y);return this.route(u,e.x,e.y,k,[idx(Math.max(0,Math.min(MW-1,tileOf(e.x))),Math.max(0,Math.min(MH-1,tileOf(e.y))))])}
  const p=this.closestOn(e,u.x,u.y);return this.route(u,p[0],p[1],'e'+e.id,e._seeds||(e._seeds=this.seedsOf(e)));
 }
 closestOn(e,x,y){const l=e.tx*T,r=(e.tx+e.w)*T,t=e.ty*T,b=(e.ty+e.h)*T;return[Math.max(l,Math.min(r,x)),Math.max(t,Math.min(b,y))]}
 edgeDist(u,e){
  if(e.kind==='u')return hyp(e.x-u.x,e.y-u.y)-e.r-u.r;
  const p=this.closestOn(e,u.x,u.y);return hyp(p[0]-u.x,p[1]-u.y)-u.r;
 }
 // ---- 명령 ----
 setOrder(u,o){
  const old=u.o;
  if(old){
   if(old.t==='gather'&&old.ph==='mine'){const r=this.by.get(old.id);if(r)r.miners=Math.max(0,r.miners-1)}
   if(old.t==='build'&&!old.done){const p=this.p[u.p],d=BLD[old.key];p.c+=d.c;p.d+=d.d}
  }
  u.o=o;u.wpT=0;u.moving=false;u.stuck=0;
  if(!o||o.t==='move'||o.t==='build'||o.t==='gather')u.tgt=null;
 }
 groupGoals(us,x,y){
  const n=us.length,sp=26,cols=Math.ceil(Math.sqrt(n)),slots=[];
  for(let i=0;i<n;i++){const c=i%cols,r=Math.floor(i/cols);slots.push([x+(c-(cols-1)/2)*sp,y+(r-(Math.ceil(n/cols)-1)/2)*sp])}
  const sorted=us.slice().sort((a,b)=>hyp(a.x-x,a.y-y)-hyp(b.x-x,b.y-y));
  return sorted.map((u,i)=>{let s=slots[i];if(this.isBlock(s[0],s[1])&&!u.air)s=[x,y];return[u,s]});
 }
 setRally(bs,x,y,res){for(const b of bs){b.rally=res?{x,y,res:res.id}:{x,y}}}
 cmdPatrol(us,x,y){const pk=this.pointKey(x,y);for(const u of us){if(!u.def.dmg||u.deployed||u.deployT>0)continue;const b=this.pointKey(u.x,u.y);u.oq=null;this.setOrder(u,{t:'patrol',x:pk.cx,y:pk.cy,key:pk.key,seeds:pk.seeds,ax:b.cx,ay:b.cy,akey:b.key,aseeds:b.seeds})}}
 cmdMove(us,x,y,atk,queue){
  us=us.filter(u=>!u.deployed&&!(u.deployT>0));if(!us.length)return;
  const pk=this.pointKey(x,y);
  for(const [u,s] of this.groupGoals(us,pk.cx,pk.cy)){const ord={t:atk?'amove':'move',x:s[0],y:s[1],key:pk.key,seeds:pk.seeds};
   if(queue&&(u.o||(u.oq&&u.oq.length))){(u.oq=u.oq||[]).push(ord)}else{u.oq=null;this.setOrder(u,ord)}}
 }
 cmdAttack(us,t){for(const u of us){if(!this.canHit(u,t))continue;u.oq=null;this.setOrder(u,{t:'attack',id:t.id});u.tgt=t}}
 cmdHold(us){for(const u of us)if(u.def.dmg){u.oq=null;this.setOrder(u,{t:'hold'})}}
 cmdStop(us){for(const u of us){u.oq=null;this.setOrder(u,null)}}
 cmdGather(us,r){for(const u of us){if(!u.def.worker)continue;u.oq=null;this.setOrder(u,{t:'gather',id:r.id,ph:u.carry>0&&u.carryType===r.type?'ret':'go'})}}
 cmdRepair(us,t){for(const u of us)if(u.def.worker&&u.def.fac==='gem'){u.oq=null;this.setOrder(u,{t:'repair',id:t.id})}}
 // 지원 건물: 반경 안 아군을 0.5초마다 회복한다
 doAura(b){const A=b.def.aura,R=A.r*T,amt=A.amt/2,pid=b.p;let hit=false;
  const fix=e=>{if(e.p!==pid||e.dead)return;const mech=e.kind==='b'||(e.def.tags&&e.def.tags.includes('mech'));if(A.kind==='mech'&&!mech)return;if(A.kind==='bio'&&e.kind!=='b'&&mech)return;
   if(A.kind==='shield'){if(e.def.sh&&e.sh<e.def.sh){e.sh=Math.min(e.def.sh,e.sh+amt);hit=true}}else if(e.hp<e.def.hp){e.hp=Math.min(e.def.hp,e.hp+amt);hit=true}};
  this.query(b.x,b.y,R,fix);for(const o of this.blds)if(o!==b&&o.built&&o.p===pid&&hyp(o.x-b.x,o.y-b.y)<R)fix(o);if(hit)b.auraT=.5}
 doHeal(u){
  const H=u.def.heal,R=H.r*T,amt=H.amt/2;let best=null,bs=1;
  const consider=e=>{if(e.p!==u.p||e.dead||e===u)return;if(hyp(e.x-u.x,e.y-u.y)>R+(e.r||0))return;if(H.kind==='mech'&&e.kind==='u'&&!e.def.tags.includes('mech'))return;const maxv=e.def.hp+(e.def.sh||0),q=(e.hp+(e.sh||0))/maxv;if(q<bs){bs=q;best=e}};
  this.query(u.x,u.y,R,consider);if(H.kind==='mech')for(const b of this.blds)if(b.built)consider(b);
  if(!best)return;
  if(H.kind==='shield'&&best.def.sh&&best.sh<best.def.sh)best.sh=Math.min(best.def.sh,best.sh+amt);else best.hp=Math.min(best.def.hp,best.hp+amt*(H.kind==='shield'?.5:1));
  u.healT=.45;u.healId=best.id;
 }
 rngOf(u){return u.deployed?11:(u.def.rng||0)}
 cmdSkill(us){
  for(const u of us){const sk=u.def.skill;if(!sk||u.skillCd>0)continue;
   if(sk==='overclock'){if(u.hp<=12)continue;u.hp-=10;u.boost=8;u.skillCd=SKILL.overclock.cd}
   else if(sk==='charge'){u.boost=5;u.skillCd=SKILL.charge.cd}
   else if(sk==='molt'){u.hp=Math.min(u.def.hp,u.hp+u.def.hp*.4);u.skillCd=SKILL.molt.cd}
   else if(sk==='cargo'){
    u.cargo=u.cargo||[];u.skillCd=SKILL.cargo.cd;
    if(u.cargo.length){u.cargo.forEach((c,i)=>{const a=i*1.1,f=this.nearestFree(u.x+Math.cos(a)*28,u.y+Math.sin(a)*28);c.x=f[0];c.y=f[1];c.stowed=false;c.o=null;c.tgt=null;this.units.push(c)});u.cargo=[]}
    else{let cap=8;const near=this.units.filter(x=>x.p===u.p&&!x.air&&!x.deployed&&hyp(x.x-u.x,x.y-u.y)<5*T).sort((a,b)=>hyp(a.x-u.x,a.y-u.y)-hyp(b.x-u.x,b.y-u.y));for(const x of near){if(x.def.sup>cap)continue;cap-=x.def.sup;x.stowed=true;x.oq=null;this.setOrder(x,null);u.cargo.push(x)}this.units=this.units.filter(x=>!x.stowed)}
   }
   else if(sk==='deploy'){u.deployTo=!u.deployed;u.deployT=1.2;u.skillCd=SKILL.deploy.cd;u.tgt=null;this.setOrder(u,null)}
   this.fx.push({k:'ring',x:u.x,y:u.y,r:u.r+12,t:0,d:.4,c:this.p[u.p].color});
  }
 }
 canPlace(pid,key,tx,ty){
  const d=BLD[key],p=this.p[pid];
  if(tx<0||ty<0||tx+d.w>MW||ty+d.h>MH)return false;
  if(d.role==='ext'){const l=this.res.find(r=>r.type==='d'&&r.tx===tx&&r.ty===ty&&r.amt>0);return !!l&&!l.ext}
  for(let y=ty;y<ty+d.h;y++)for(let x=tx;x<tx+d.w;x++)if(this.blocked[idx(x,y)])return false;
  if(d.role==='hq'){for(const r of this.res){if(r.amt<=0)continue;const dx=Math.max(tx-(r.tx+r.w),r.tx-(tx+d.w),0),dy=Math.max(ty-(r.ty+r.h),r.ty-(ty+d.h),0);if(Math.max(dx,dy)<3)return false}}
  else if(p.fac==='cla'){const c=this.ctxOf(p);for(let y=ty;y<ty+d.h;y++)for(let x=tx;x<tx+d.w;x++)if(!c[idx(x,y)])return false}
  return true;
 }
 hasBuilt(pid,role){return this.blds.some(b=>b.p===pid&&b.def.role===role&&b.built)}
 canAfford(p,c,d){return p.c>=c&&p.d>=d}
 reqMet(pid,def){return !def.req||this.hasBuilt(pid,def.req)}
 cmdBuild(u,key,tx,ty){
  const p=this.p[u.p],d=BLD[key];
  if(!this.canAfford(p,d.c,d.d)||!this.reqMet(u.p,d)||!this.canPlace(u.p,key,tx,ty))return false;
  p.c-=d.c;p.d-=d.d;u.oq=null;this.setOrder(u,{t:'build',key,tx,ty});return true;
 }
 train(b,key){
  const p=this.p[b.p],d=UNIT[key],sup=d.sup*(d.count||1);
  if(!b.built||b.q.length>=5)return 'queue';
  if(!(b.def.modes?Object.values(b.def.modes).some(l=>l.includes(key)):(b.def.trains||[]).includes(key)))return 'req';
  if(!this.reqMet(b.p,d))return 'req';
  if(d.mode&&b.mode!==d.mode)return 'mode';
  if(b.modeT>0)return 'mode';
  if(!this.canAfford(p,d.c,d.d))return 'res';
  if(p.supUsed+sup>Math.min(p.supCap,SUP_MAX))return 'sup';
  p.c-=d.c;p.d-=d.d;p.supUsed+=sup;b.q.push({kind:'u',key,t:0,dur:d.t});return 'ok';
 }
 research(b,line){
  line=line||'atk';const p=this.p[b.p],list=line==='arm'?ARMOR:RESEARCH,cur=line==='arm'?p.arm:p.atk,lvl=cur+(this.blds.some(o=>o.p===b.p&&o.q.some(q=>q.kind==='r'&&q.line===line))?1:0);
  if(lvl>=list.length||!b.built||b.q.length)return 'no';
  const r=list[lvl];if(!this.canAfford(p,r.c,r.d))return 'res';
  p.c-=r.c;p.d-=r.d;b.q.push({kind:'r',line,lvl,t:0,dur:r.t});return 'ok';
 }
 cancelQ(b,i){
  const it=b.q[i];if(!it)return;const p=this.p[b.p];
  if(it.kind==='u'){const d=UNIT[it.key];p.c+=d.c;p.d+=d.d;p.supUsed-=d.sup*(d.count||1)}
  else{const r=(it.line==='arm'?ARMOR:RESEARCH)[it.lvl];p.c+=r.c;p.d+=r.d}
  b.q.splice(i,1);
 }
 cancelBuild(b){
  if(b.built)return;const p=this.p[b.p];p.c+=Math.floor(b.def.c*.75);p.d+=Math.floor(b.def.d*.75);this.removeB(b,false);
 }
 setMode(b,m){if(!b.def.modes||b.q.length||b.mode===m||b.modeT>0||!b.built)return false;b.mode=m;b.modeT=5;return true}
 abilityReady(pid){const p=this.p[pid];return this.hasBuilt(pid,'tech')&&p.abilCd<=0&&p.d>=ABIL[p.fac].d}
 castAbility(pid,x,y){
  if(!this.abilityReady(pid))return false;
  const p=this.p[pid],a=ABIL[p.fac],R=a.r*T;p.d-=a.d;p.abilCd=a.cd;
  this.ev('ability',x,y,pid);
  if(p.fac==='gpt'){
   for(const e of [...this.units,...this.blds])if(e.p===pid&&e.def.sh&&hyp(e.x-x,e.y-y)<=R)e.sh=Math.min(e.def.sh,e.sh+120);
   this.fx.push({k:'wave',x,y,r:R,t:0,d:.9,c:p.color});
  }else if(p.fac==='gem'){
   this.fx.push({k:'tele',x,y,r:R,t:0,d:1.5,c:p.color});
   this.delayed.push({at:this.tick+45,fn:()=>{
    for(const e of [...this.units,...this.blds])if(this.hostile(pid,e.p)&&!e.dead&&hyp(e.x-x,e.y-y)<=R+e.r)this.hurt(e,e.kind==='b'?60:85,null,pid);
    this.fx.push({k:'blast',x,y,r:R,t:0,d:.6,c:'#fff'});this.ev('boom',x,y,pid);
   }});
  }else{
   for(let i=0;i<6;i++){const a2=i/6*6.283,s=this.nearestFree(x+Math.cos(a2)*40,y+Math.sin(a2)*40),u=this.spawnUnit(p,'cla_swarm',null,s[0],s[1]);u.life=18;u.summon=true;this.setOrder(u,null)}
   this.fx.push({k:'wave',x,y,r:R,t:0,d:.7,c:p.color});
  }
  return true;
 }
 ctxOf(p){
  if(p.ctx&&p.ctxBuilt===p.ctxV)return p.ctx;
  const c=p.ctx||new Uint8Array(N);c.fill(0);
  for(const b of this.blds){if(b.p!==p.id||!b.def.ctx)continue;const R=b.def.ctx*(b.built?1:Math.max(.4,b.prog)),cx=b.x/T,cy=b.y/T;
   for(let y=Math.floor(cy-R);y<=cy+R;y++)for(let x=Math.floor(cx-R);x<=cx+R;x++)if(inB(x,y)&&hyp(x+.5-cx,y+.5-cy)<=R)c[idx(x,y)]=1}
  p.ctx=c;p.ctxBuilt=p.ctxV;return c;
 }
 onCtx(u){const c=this.ctxOf(this.p[u.p]),x=tileOf(u.x),y=tileOf(u.y);return inB(x,y)&&c[idx(x,y)]===1}
 canHit(a,t){if(!a.def.dmg)return false;return t.air?!!a.def.hitsAir:!a.def.noGround}
 ev(type,x,y,p){this.events.push({type,x,y,p});if(this.events.length>60)this.events.shift()}
 // ---- 피해 ----
 hurt(t,amt,src,fromPid){
  if(t.dead)return;t.lastHit=this.tick;t.flash=.12;
  if(t.kind==='u'&&this.p[t.p].arm)amt=Math.max(.5,amt-this.p[t.p].arm);
  if(t.sh>0){const s=Math.min(t.sh,amt);t.sh-=s;amt-=s}
  t.hp-=amt;
  if(this.p[t.p]&&src&&!src.dead&&t.kind==='u'&&!t.tgt&&!t.def.worker&&t.def.dmg&&(!t.o||t.o.t==='amove')&&this.canHit(t,src))t.tgt=src;
  if(t.hp<=0)this.kill(t,fromPid);
 }
 kill(t,fromPid){
  t.dead=true;const p=this.p[t.p];
  if(fromPid!=null&&this.p[fromPid])this.p[fromPid].stats.killed++;p.stats.lost++;
  if(t.kind==='u'){
   if(t.o&&t.o.t==='gather'&&t.o.ph==='mine'){const r=this.by.get(t.o.id);if(r)r.miners=Math.max(0,r.miners-1)}
   if(t.o&&t.o.t==='build'&&!t.o.done){const d=BLD[t.o.key];p.c+=d.c;p.d+=d.d}
   if(!t.summon)p.supUsed-=t.def.sup;
   if(t.cargo)for(const c of t.cargo){c.dead=true;this.by.delete(c.id);p.supUsed-=c.def.sup;p.stats.lost++}
   this.fx.push({k:'die',x:t.x,y:t.y,r:t.r*2.4,t:0,d:.55,c:p.color,fac:t.def.fac,big:t.def.r>13,key:t.def.key,face:t.face,air:!!t.air});
   this.decals.push({x:t.x,y:t.y,r:t.r,fac:t.def.fac});
   this.ev('die',t.x,t.y,t.p);
  }else{this.removeB(t,true)}
 }
 removeB(b,boom){
  b.dead=true;const p=this.p[b.p];this.stamp(b,0);
  if(b.def.role==='ext'){const l=this.by.get(b.lake);if(l){l.ext=null;this.stamp(l,1)}}
  if(b.built&&b.def.sup)p.supCap-=b.def.sup;
  for(const q of b.q)if(q.kind==='u'){const d=UNIT[q.key];p.supUsed-=d.sup*(d.count||1)}
  if(b.def.ctx)p.ctxV++;
  if(boom){this.fx.push({k:'blast',x:b.x,y:b.y,r:b.r*1.7,t:0,d:1,c:p.color});this.decals.push({x:b.x,y:b.y,r:b.r*.95,fac:b.def.fac,big:1});this.ev('boom',b.x,b.y,b.p)}
 }
 fire(a,t){
  const d=a.def,p=this.p[a.p];let dmg=(a.deployed?46:d.dmg)*(1+.15*p.atk);
  if(d.bldMul&&t.kind==='b')dmg*=d.bldMul;
  if(d.bonus)for(const tag in d.bonus)if(t.def&&t.def.tags&&t.def.tags.includes(tag))dmg+=d.bonus[tag];
  if(!d.proj||d.rng<1.2){
   this.applyHit(a,t,dmg,d.splash,t.x,t.y);
   this.fx.push({k:'slash',x:t.x,y:t.y,r:12,t:0,d:.16,c:p.color});
  }else{
   const speed=d.proj==='beam'?1600:d.proj==='shell'?430:560;
   this.proj.push({x:a.x,y:a.y,sx:a.x,sy:a.y,tid:t.id,tx:t.x,ty:t.y,sp:speed,dmg,splash:a.deployed?1.9:d.splash,kind:d.proj,c:p.color,from:a.p,src:a.id,air:a.air||false});
  }
  if(a.kind==='u'){a.face=Math.atan2(t.y-a.y,t.x-a.x);a.atkT=.2}
  this.ev('shot',a.x,a.y,a.p);
 }
 applyHit(a,t,dmg,splash,x,y,from){
  const pid=a?a.p:from;
  if(t&&!t.dead)this.hurt(t,dmg,a,pid);
  if(splash){
   const R=splash*T;
   for(const e of [...this.units,...this.blds]){
    if(e.dead||!this.hostile(pid,e.p)||e===t||e.air)continue;const dd=hyp(e.x-x,e.y-y)-e.r;
    if(dd<=R)this.hurt(e,dmg*(dd<R*.5?.7:.4),a,pid);
   }
   this.fx.push({k:'ring',x,y,r:R,t:0,d:.3,c:'#ffe9c4'});
  }
 }
 // ---- 틱 ----
 rehash(){
  for(const c of this.hash)c.length=0;
  for(const u of this.units){const x=Math.max(0,Math.min(HW-1,Math.floor(u.x/HCELL))),y=Math.max(0,Math.min(HH-1,Math.floor(u.y/HCELL)));this.hash[x+y*HW].push(u)}
 }
 query(x,y,R,cb){
  const x0=Math.max(0,Math.floor((x-R)/HCELL)),x1=Math.min(HW-1,Math.floor((x+R)/HCELL)),y0=Math.max(0,Math.floor((y-R)/HCELL)),y1=Math.min(HH-1,Math.floor((y+R)/HCELL));
  for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++){const c=this.hash[cx+cy*HW];for(let i=0;i<c.length;i++)cb(c[i])}
 }
 acquire(u){
  const R=Math.max(u.def.sight*T*.92,this.rngOf(u)*T+24);
  let best=null,bs=1e12,pid=u.p;
  const consider=e=>{
   if(!this.hostile(pid,e.p)||e.dead||!this.canHit(u,e))return;
   const d=hyp(e.x-u.x,e.y-u.y)-(e.r||0);if(d>R)return;
   let s=d;if(e.kind==='b'){s+=e.def.dmg?90:260;if(!e.built)s+=30}else if(e.def.worker)s+=70;else if(!e.def.dmg)s+=100;
   if(s<bs){bs=s;best=e}};
  this.query(u.x,u.y,R,consider);
  for(const b of this.blds)consider(b);
  return best;
 }
 updUnit(u){
  const d=u.def,p=this.p[u.p];
  u.cd-=DT;u.moving=false;if(u.flash>0)u.flash-=DT;
  if(u.healT>0)u.healT-=DT;if(d.heal&&(this.tick+u.id)%15===0)this.doHeal(u);
  if(u.atkT>0)u.atkT-=DT;if(u.boost>0)u.boost-=DT;if(u.skillCd>0)u.skillCd-=DT;if(u.deployT>0){u.deployT-=DT;if(u.deployT<=0)u.deployed=u.deployTo;}
  if(u.life>0){u.life-=DT;if(u.life<=0){u.dead=true;this.fx.push({k:'puff',x:u.x,y:u.y,r:12,t:0,d:.3,c:p.color});return}}
  if(d.sh&&u.sh<d.sh&&this.tick-u.lastHit>6*TPS)u.sh=Math.min(d.sh,u.sh+4*DT);
  if(d.fac==='cla'&&u.hp<d.hp)u.hp=Math.min(d.hp,u.hp+(this.onCtx(u)?2.4:.7)*DT*(d.hp>300?2.2:1));
  if(!u.air&&this.isBlock(u.x,u.y)){const f=this.nearestFree(u.x,u.y);u.x=f[0];u.y=f[1]}
  if(!u.o&&u.oq&&u.oq.length){u.o=u.oq.shift();u.wpT=0;u.stuck=0}
  const o=u.o;
  if(u.tgt&&(u.tgt.dead||(u.tgt.kind==='r')||!this.hostile(u.p,u.tgt.p)))u.tgt=null;
  const canAuto=d.dmg&&!d.worker;
  if(canAuto&&(!o||o.t==='amove'||o.t==='hold'||o.t==='patrol')&&(this.tick+u.id)%8===0){
   const a=this.acquire(u);
   if(a&&(!u.tgt||(u.tgt.kind==='b'&&a.kind==='u')||hyp(u.tgt.x-u.x,u.tgt.y-u.y)>hyp(a.x-u.x,a.y-u.y)+60))u.tgt=a;
   if(!a&&u.tgt&&hyp(u.tgt.x-u.x,u.tgt.y-u.y)>d.sight*T*1.6)u.tgt=null;
  }
  if(!o){if(u.tgt)this.engage(u,u.tgt,true);return}
  switch(o.t){
   case'move':{
    const dd=hyp(o.x-u.x,o.y-u.y);if(dd<5){this.setOrder(u,null);break}
    this.route(u,o.x,o.y,o.key,o.seeds);this.stuckCheck(u,dd);break}
   case'amove':{
    if(u.tgt){this.engage(u,u.tgt,true);break}
    const dd=hyp(o.x-u.x,o.y-u.y);if(dd<8){this.setOrder(u,null);break}
    this.route(u,o.x,o.y,o.key,o.seeds);this.stuckCheck(u,dd);break}
   case'hold':if(u.tgt)this.engage(u,u.tgt,false);break;
   case'patrol':{
    if(u.tgt){this.engage(u,u.tgt,true);break}
    if(hyp(o.x-u.x,o.y-u.y)<16){[o.x,o.ax]=[o.ax,o.x];[o.y,o.ay]=[o.ay,o.y];[o.key,o.akey]=[o.akey,o.key];[o.seeds,o.aseeds]=[o.aseeds,o.seeds];u.wpT=0;break}
    this.route(u,o.x,o.y,o.key,o.seeds);break}
   case'attack':{
    const t=this.by.get(o.id);if(!t||t.dead||!this.hostile(u.p,t.p)){this.setOrder(u,null);break}
    u.tgt=t;this.engage(u,t,true);break}
   case'gather':this.gather(u,o,p);break;
   case'build':this.buildStep(u,o,p);break;
   case'construct':this.construct(u,o);break;
   case'repair':this.repair(u,o);break;
  }
 }
 stuckCheck(u,dd){
  if(this.tick%30===u.id%30){
   const m=hyp(u.x-u.lastX,u.y-u.lastY);u.lastX=u.x;u.lastY=u.y;
   if(m<8){u.stuck++;if(dd<3.5*T||u.stuck>=4)this.setOrder(u,null)}else u.stuck=0;
  }
 }
 engage(u,t,chase){
  if(u.deployT>0)return;
  const R=this.rngOf(u)*T,dd=this.edgeDist(u,t);
  if(dd<=R){u.face=Math.atan2(t.y-u.y,t.x-u.x);if(u.cd<=0){this.fire(u,t);u.cd=u.def.cd*(u.boost>0&&u.def.skill==='overclock'?.62:1)*(u.deployed?1.5:1)}}
  else if(chase&&!u.deployed)this.routeEnt(u,t);
  else u.tgt=null;
 }
 findRes(u,type,near){
  let best=null,bd=1e12,x=near?near.x:u.x,y=near?near.y:u.y;
  for(const r of this.res){if(r.amt<=0||r.type!==type)continue;if(type==='d'&&!(r.ext&&r.ext.built&&r.ext.p===u.p))continue;const d=hyp(r.x-x,r.y-y)+(r.miners>=(type==='c'?1:3)?48:0);if(d<bd){bd=d;best=r}}
  return best;
 }
 nearestRes(u,type){return this.findRes(u,type)}
 nearestHQ(u){let best=null,bd=1e12;for(const b of this.blds){if(b.p!==u.p||b.def.role!=='hq'||!b.built)continue;const d=hyp(b.x-u.x,b.y-u.y);if(d<bd){bd=d;best=b}}return best}
 gather(u,o,p){
  u.noCollide=true;
  if(o.ph==='ret'){
   const hq=this.nearestHQ(u);if(!hq){this.setOrder(u,null);return}
   if(this.edgeDist(u,hq)<10){
    const gain=Math.round(u.carry*p.income);if(u.carryType==='c')p.c+=gain;else p.d+=gain;p.stats.gathered+=gain;
    u.carry=0;u.carryType=null;o.ph='go';
   }else this.routeEnt(u,hq);
   return;
  }
  let r=this.by.get(o.id);
  if(o.ph==='go'){
   if(!r||r.amt<=0||r.dead){const type=r?r.type:'c';r=this.findRes(u,type);if(!r){this.setOrder(u,null);return}o.id=r.id}
   if(this.edgeDist(u,r)<10){
    const cap=r.type==='c'?1:3;
    if(r.miners<cap){r.miners++;o.ph='mine';o.timer=r.type==='c'?1.5:1.25}
    else{
     const alt=this.res.filter(a=>a.type===r.type&&a.amt>0&&a.miners<(a.type==='c'?1:3)&&hyp(a.x-r.x,a.y-r.y)<9*T).sort((a,b)=>hyp(a.x-u.x,a.y-u.y)-hyp(b.x-u.x,b.y-u.y))[0];
     if(alt)o.id=alt.id;
    }
   }else this.routeEnt(u,r);
   return;
  }
  if(o.ph==='mine'){
   u.face=Math.atan2(r?r.y-u.y:0,r?r.x-u.x:1);
   o.timer-=DT;
   if(o.timer<=0){
    if(r){r.miners=Math.max(0,r.miners-1);const take=Math.min(r.type==='c'?8:6,r.amt);r.amt-=take;u.carry=take;u.carryType=r.type;
     if(r.amt<=0&&!r.dead){r.dead=true;this.stamp(r,0)}}
    o.ph='ret';
   }
  }
 }
 buildStep(u,o,p){
  u.noCollide=true;
  const d=BLD[o.key],cx=(o.tx+d.w/2)*T,cy=(o.ty+d.h/2)*T,box={tx:o.tx,ty:o.ty,w:d.w,h:d.h,kind:'b',id:'site'+o.tx+'_'+o.ty};
  const p2=this.closestOn(box,u.x,u.y),dd=hyp(p2[0]-u.x,p2[1]-u.y);
  if(dd<26){
   if(!this.canPlace(u.p,o.key,o.tx,o.ty)){this.setOrder(u,null);if(!p.ai)this.ev('nope',u.x,u.y,u.p);return}
   o.done=true;
   const b=this.makeBld(p,o.key,o.tx,o.ty,false);
   if(p.fac==='gpt'){const res=this.findRes(u,'c');this.setOrder(u,res?{t:'gather',id:res.id,ph:u.carry>0?'ret':'go'}:null)}
   else if(p.fac==='gem'){this.setOrder(u,{t:'construct',id:b.id});}
   else{u.dead=true;p.supUsed-=u.def.sup}
   return;
  }
  this.route(u,cx,cy,'s'+o.tx+','+o.ty,this.seedsOf(box));
 }
 construct(u,o){
  u.noCollide=true;
  const b=this.by.get(o.id);if(!b||b.dead||b.built){this.finishWork(u);return}
  if(this.edgeDist(u,b)>20){this.routeEnt(u,b);return}
  this.progressB(b,DT/b.def.t);
 }
 repair(u,o){
  u.noCollide=true;
  const t=this.by.get(o.id);if(!t||t.dead){this.finishWork(u);return}
  if(t.kind==='b'&&!t.built){this.setOrder(u,{t:'construct',id:t.id});return}
  if(t.hp>=t.def.hp){this.finishWork(u);return}
  if(this.edgeDist(u,t)>20){this.routeEnt(u,t);return}
  t.hp=Math.min(t.def.hp,t.hp+t.def.hp/28*DT);
 }
 finishWork(u){const r=this.findRes(u,'c');this.setOrder(u,r?{t:'gather',id:r.id,ph:u.carry>0?'ret':'go'}:null)}
 progressB(b,dp){
  b.prog=Math.min(1,b.prog+dp);b.hp=Math.min(b.def.hp,b.hp+b.def.hp*.9*dp);
  if(b.def.ctx)b._c=(b._c||0)+dp,b._c>.1&&(b._c=0,this.p[b.p].ctxV++);
  if(b.prog>=1&&!b.built){b.built=true;const p=this.p[b.p];if(b.def.sup)p.supCap+=b.def.sup;b.sh=b.def.sh;if(b.def.ctx)p.ctxV++;this.ev('done',b.x,b.y,b.p)}
 }
 updBld(b){
  const d=b.def,p=this.p[b.p];
  if(b.flash>0)b.flash-=DT;
  if(!b.built){if(d.fac!=='gem')this.progressB(b,DT/d.t);return}
  if(d.sh&&b.sh<d.sh&&this.tick-b.lastHit>6*TPS)b.sh=Math.min(d.sh,b.sh+6*DT);
  if(d.fac==='cla'&&b.hp<d.hp)b.hp=Math.min(d.hp,b.hp+2.2*DT);
  if(d.aura&&this.tick%15===(b.id%15))this.doAura(b);
  if(b.modeT>0)b.modeT-=DT;
  if(b.q.length&&b.modeT<=0){
   const q=b.q[0];q.t+=DT;
   if(q.t>=q.dur){
    b.q.shift();
    if(q.kind==='r'){if(q.line==='arm')p.arm=q.lvl+1;else p.atk=q.lvl+1;this.ev('done',b.x,b.y,b.p)}
    else{const def=UNIT[q.key],n=def.count||1;
     for(let i=0;i<n;i++){
      const u=this.spawnUnit(p,q.key,b);p.stats.made++;
      if(def.worker&&(!b.rally||b.rally.res)){const r=b.rally&&b.rally.res?this.by.get(b.rally.res):this.findRes(u,'c');if(r&&!r.dead)this.setOrder(u,{t:'gather',id:r.id,ph:'go'})}
      else if(b.rally){this.cmdMove([u],b.rally.x+i*14,b.rally.y,false)}
     }
     this.ev('spawn',b.x,b.y,b.p);
    }
   }
  }
  if(d.dmg){
   b.cd-=DT;
   if((this.tick+b.id)%10===0)b.tgt=this.acquireBld(b);
   if(b.tgt&&(b.tgt.dead||!this.hostile(b.p,b.tgt.p)))b.tgt=null;
   if(b.tgt&&b.cd<=0){this.fire(b,b.tgt);b.cd=d.cd}
  }
 }
 acquireBld(b){let best=null,bd=1e12,R=b.def.rng*T+b.r;this.query(b.x,b.y,R+20,e=>{if(!this.hostile(b.p,e.p)||e.dead||!this.canHitB(b,e))return;const d=hyp(e.x-b.x,e.y-b.y);if(d<=R&&d<bd){bd=d;best=e}});return best}
 canHitB(b,e){return e.air?!!b.def.hitsAir:true}
 separate(){
  const U=this.units;
  for(let i=0;i<U.length;i++){const a=U[i];if(a.dead)continue;
   this.query(a.x,a.y,44,b=>{
    if(b.id<=a.id||b.dead||a.air!==b.air)return;
    if(a.noCollide||b.noCollide)return;
    const dx=b.x-a.x,dy=b.y-a.y,d=hyp(dx,dy)||.01,m=(a.r+b.r)*.92;if(d>=m)return;
    const push=(m-d)*.34,ux=dx/d,uy=dy/d;
    const aw=a.moving&&!b.moving?.3:1,bw=b.moving&&!a.moving?.3:1;
    const ax=a.x-ux*push*aw,ay=a.y-uy*push*aw,bx=b.x+ux*push*bw,by=b.y+uy*push*bw;
    if(a.air||!this.isBlock(ax,ay)){a.x=ax;a.y=ay}
    if(b.air||!this.isBlock(bx,by)){b.x=bx;b.y=by}
   });
  }
 }
 step(){
  if(this.winner>=0)return;
  this.tick++;this.fieldBudget=12;
  this.rehash();
  for(let i=0;i<this.delayed.length;i++){if(this.tick>=this.delayed[i].at){this.delayed[i].fn();this.delayed.splice(i--,1)}}
  for(const p of this.p)if(p.abilCd>0)p.abilCd-=DT;
  if(this.bots.length){const r=this.tick%this.bots.length;for(let i=0;i<this.bots.length;i++)this.bots[(i+r)%this.bots.length].step()}
  // 진영 간 선공 편향을 없애기 위해 틱마다 처리 순서를 뒤집는다
  {const n=this.units.length,rv=this.tick%2===1;for(let i=0;i<n;i++){const u=this.units[rv?n-1-i:i];u.noCollide=false;if(!u.dead)this.updUnit(u)}for(let i=n;i<this.units.length;i++)this.units[i].noCollide=false}
  for(const b of this.blds)if(!b.dead)this.updBld(b);
  this.updProj();
  this.separate();
  for(const f of this.fx)f.t+=DT;
  if(this.tick%3===0){this.fx=this.fx.filter(f=>f.t<f.d)}
  let need=false;
  for(const u of this.units)if(u.dead){this.by.delete(u.id);need=true}
  if(need)this.units=this.units.filter(u=>!u.dead);
  if(this.blds.some(b=>b.dead)){for(const b of this.blds)if(b.dead)this.by.delete(b.id);this.blds=this.blds.filter(b=>!b.dead)}
  if(this.res.some(r=>r.dead)){for(const r of this.res)if(r.dead)this.by.delete(r.id);this.res=this.res.filter(r=>!r.dead)}
  if(this.tick%6===0)this.updateVis();
  if(this.p.length===3&&this.tick%150===0)this.diplo();
  if(this.tick%300===0)this.trend.push(this.p.map(p=>[Math.round(this.power(p.id)),p.stats.gathered]));
  if(this.tick%30===0)this.checkEnd();
 }
 updProj(){
  for(let i=this.proj.length-1;i>=0;i--){
   const s=this.proj[i],t=this.by.get(s.tid);
   if(t&&!t.dead){s.tx=t.x;s.ty=t.y}
   const dx=s.tx-s.x,dy=s.ty-s.y,d=hyp(dx,dy),m=s.sp*DT;
   if(d<=m){this.proj.splice(i,1);const src=this.by.get(s.src);this.applyHit(src&&!src.dead?src:null,t,s.dmg,s.splash,s.tx,s.ty,s.from);this.fx.push({k:'spark',x:s.tx,y:s.ty,r:8,t:0,d:.14,c:s.c})}
   else{s.x+=dx/d*m;s.y+=dy/d*m}
  }
 }
 updateVis(){
  if(this.observer)return;
  const v=this.vis,pid=ME;
  for(let i=0;i<N;i++)if(v[i]===2)v[i]=1;
  const lv=this.level;
  const mark=(e,sight)=>{const cx=e.x/T,cy=e.y/T,R=sight,me=e.air?9:(lv[idx(Math.max(0,Math.min(MW-1,tileOf(e.x))),Math.max(0,Math.min(MH-1,tileOf(e.y))))]+.26);
   for(let y=Math.max(0,Math.floor(cy-R));y<=Math.min(MH-1,cy+R);y++)for(let x=Math.max(0,Math.floor(cx-R));x<=Math.min(MW-1,cx+R);x++)if(hyp(x+.5-cx,y+.5-cy)<=R&&lv[idx(x,y)]<=me)v[idx(x,y)]=2};
  for(const u of this.units)if(u.p===pid)mark(u,u.def.sight);
  for(const b of this.blds)if(b.p===pid)mark(b,b.def.sight||(b.def.w+7));
  for(const b of this.blds)if(b.p!==pid&&this.tileVis(b.x,b.y))b.seen=true;
  this.visV++;
 }
 tileVis(x,y){if(this.observer)return true;const tx=tileOf(x),ty=tileOf(y);return inB(tx,ty)&&this.vis[idx(tx,ty)]===2}
 tileExp(x,y){if(this.observer)return true;const tx=tileOf(x),ty=tileOf(y);return inB(tx,ty)&&this.vis[idx(tx,ty)]>=1}
 checkEnd(){
  for(const p of this.p){
   if(p.out||this.blds.some(b=>b.p===p.id))continue;
   p.out=true;for(const u of this.units)if(u.p===p.id){u.dead=true;this.fx.push({k:'die',x:u.x,y:u.y,r:u.r*2,t:0,d:.5,c:p.color,fac:u.def.fac})}
   this.notices.push(FAC[p.fac].name+' 진영이 멸망했습니다.');
  }
  const alive=this.p.filter(p=>!p.out);
  if(alive.length===1)this.winner=alive[0].id;
  else if(this.p[0].out&&!this.p[0].ai)this.winner=alive.slice().sort((a,b)=>this.power(b.id)-this.power(a.id))[0].id;
 }
 concede(pid){this.winner=this.p.find(p=>p.id!==pid&&!p.out).id}
}
