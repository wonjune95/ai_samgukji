const TAU=Math.PI*2;
function circ(c,x,y,r){c.beginPath();c.arc(x,y,r,0,TAU)}
function rrect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
const glowCache=new Map();
function glowOf(color){
 let g=glowCache.get(color);if(g)return g;
 g=document.createElement('canvas');g.width=g.height=64;const c=g.getContext('2d'),r=c.createRadialGradient(32,32,0,32,32,32);
 r.addColorStop(0,'#ffffff');r.addColorStop(.18,color);r.addColorStop(.55,color+'55');r.addColorStop(1,color+'00');c.fillStyle=r;c.fillRect(0,0,64,64);glowCache.set(color,g);return g;
}
function smokeOf(){if(smokeOf.c)return smokeOf.c;const g=document.createElement('canvas');g.width=g.height=64;const c=g.getContext('2d'),r=c.createRadialGradient(32,32,2,32,32,32);r.addColorStop(0,'rgba(60,58,58,.7)');r.addColorStop(.6,'rgba(45,44,46,.32)');r.addColorStop(1,'rgba(40,40,42,0)');c.fillStyle=r;c.fillRect(0,0,64,64);return smokeOf.c=g}
const iconCache=new Map();
function iconURL(key,color,size){
 if(typeof Studio!=='undefined'&&Studio.ready){const hero=key.startsWith('hero_');return Studio.shot(hero?key.slice(5):key,color,size||96,hero)}
 const id=key+color+(size||96);if(iconCache.has(id))return iconCache.get(id);
 const sp=Sprites.get(key,color);if(!sp)return'';
 if(!sp.box){const d=sp.pc.getContext('2d').getImageData(0,0,sp.pw,sp.ph).data;let x0=sp.pw,y0=sp.ph,x1=0,y1=0;for(let y=0;y<sp.ph;y++)for(let x=0;x<sp.pw;x++)if(d[(x+y*sp.pw)*4+3]>40){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}sp.box=[x0,y0,Math.max(1,x1-x0+1),Math.max(1,y1-y0+1)]}
 const s=size||96,cv=document.createElement('canvas');cv.width=cv.height=s;const c=cv.getContext('2d'),[bx,by,bw,bh]=sp.box,k=Math.min((s-6)/bw,(s-6)/bh);
 c.imageSmoothingQuality='high';c.drawImage(sp.pc,bx,by,bw,bh,(s-bw*k)/2,(s-bh*k)/2,bw*k,bh*k);
 const u=cv.toDataURL();iconCache.set(id,u);return u;
}
function terrainDetails(g,base){
 const bg=document.createElement('canvas');bg.width=MW*T;bg.height=MH*T;const c=bg.getContext('2d'),R=mulberry(421);
 c.imageSmoothingQuality='high';c.drawImage(base,0,0,MW*T,MH*T);
 // 땅에 드러난 구리 회로
 c.lineCap='round';
 for(let i=0;i<90;i++){
  let x=Math.floor(R()*MW)*T+16,y=Math.floor(R()*MH)*T+16;const tt=tileOf(x),tu=tileOf(y);if(g.terrain[idx(tt,tu)])continue;
  c.beginPath();c.moveTo(x,y);const n=2+R()*4|0;let dx=R()<.5?1:0;
  for(let k=0;k<n;k++){const L=(1+R()*3|0)*T*.55;if(dx)x+=L*(R()<.5?-1:1);else y+=L*(R()<.5?-1:1);c.lineTo(x,y);if(R()<.6){c.lineTo(x+T*.3*(R()<.5?-1:1),y+T*.3);}dx=1-dx}
  c.strokeStyle='rgba(20,14,10,.52)';c.lineWidth=3.2;c.stroke();c.strokeStyle='rgba(205,132,58,.5)';c.lineWidth=1.2;c.stroke();
  c.fillStyle='rgba(235,180,92,.72)';c.beginPath();c.arc(x,y,2.7,0,TAU);c.fill();
 }
 // 잔돌과 웨이퍼 조각
 for(let i=0;i<560;i++){const x=R()*MW*T,y=R()*MH*T;if(g.terrain[idx(tileOf(x),tileOf(y))])continue;const r2=1.2+R()*3.4;c.fillStyle='rgba(12,10,12,.34)';c.beginPath();c.ellipse(x+1.6,y+1.6,r2*1.2,r2*.8,0,0,TAU);c.fill();c.fillStyle=`rgba(${120+R()*60|0},${112+R()*50|0},${100+R()*44|0},.7)`;c.beginPath();c.ellipse(x,y,r2*1.1,r2*.75,R()*3,0,TAU);c.fill()}
 for(let i=0;i<34;i++){const x=R()*MW*T,y=R()*MH*T;if(g.terrain[idx(tileOf(x),tileOf(y))])continue;const r2=7+R()*9,gr=c.createLinearGradient(x-r2,y-r2,x+r2,y+r2);gr.addColorStop(0,'rgba(110,235,220,.5)');gr.addColorStop(.4,'rgba(190,160,255,.42)');gr.addColorStop(.75,'rgba(255,200,130,.42)');gr.addColorStop(1,'rgba(120,200,255,.5)');c.fillStyle=gr;c.beginPath();c.ellipse(x,y,r2,r2*.68,0,0,TAU);c.fill();c.strokeStyle='rgba(10,12,16,.55)';c.lineWidth=1.2;c.stroke()}
 // 금
 for(let i=0;i<70;i++){let x=R()*MW*T,y=R()*MH*T;if(g.terrain[idx(tileOf(x),tileOf(y))])continue;c.beginPath();c.moveTo(x,y);for(let k=0;k<6;k++){x+=R()*28-14;y+=R()*26-13;c.lineTo(x,y)}c.strokeStyle='rgba(16,12,10,.3)';c.lineWidth=1+R()*1.3;c.stroke()}
 // 경사로
 for(const r of g.ramps){const x0=r.x*T,y0=r.y*T,w=r.w*T,h=r.h*T,hz=r.axis==='x';c.save();c.fillStyle='rgba(165,158,150,.5)';c.fillRect(x0,y0,w,h);const L2=hz?w:h;for(let i=0;i<L2;i+=9){c.fillStyle=`rgba(20,20,24,${.14+.32*((r.dir>0?i:L2-i)/L2)})`;if(hz)c.fillRect(x0+i,y0,4,h);else c.fillRect(x0,y0+i,w,4)}c.fillStyle='rgba(235,190,60,.72)';if(hz){c.fillRect(x0,y0,w,3.5);c.fillRect(x0,y0+h-3.5,w,3.5)}else{c.fillRect(x0,y0,3.5,h);c.fillRect(x0+w-3.5,y0,3.5,h)}c.restore()}
 // 데이터 호수 둑
 for(const r of g.res){if(r.type!=='d')continue;c.save();c.translate(r.x,r.y);c.fillStyle='rgba(16,16,20,.58)';c.beginPath();c.ellipse(2,4,r.r*1.34,r.r*1.18,0,0,TAU);c.fill();for(let i=0;i<26;i++){const a=i/26*TAU,rx=Math.cos(a)*r.r*1.2,ry=Math.sin(a)*r.r*1.05;c.fillStyle=`rgba(${88+R()*50|0},${94+R()*46|0},${100+R()*48|0},1)`;c.beginPath();c.ellipse(rx,ry,5+R()*4,3.4+R()*3,a,0,TAU);c.fill();c.fillStyle='rgba(255,255,255,.2)';c.fillRect(rx-2,ry-2,3,1.2)}c.restore()}
 // 거점 기초
 for(const b of g.bases){const x=(b.x-2)*T,y=(b.y-2)*T;c.fillStyle='rgba(22,24,26,.36)';c.fillRect(x-6,y-6,4*T+12,4*T+12);c.strokeStyle='rgba(235,205,120,.34)';c.lineWidth=2;c.setLineDash([12,10]);c.strokeRect(x-4,y-4,4*T+8,4*T+8);c.setLineDash([])}
 // 장식물
 const dd=['dd_rack','dd_fan','dd_cable'];
 for(let i=0;i<46;i++){
  const tx=2+R()*(MW-4)|0,ty=2+R()*(MH-4)|0,bk=g.terrain[idx(tx,ty)];
  if(!bk)continue;let inner=1;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if(!g.terrain[idx(tx+a,ty+b)])inner=0;if(!inner&&R()<.8)continue;
  const sp=Sprites.get(dd[i%3],null);if(sp)c.drawImage(sp.cv,0,0,sp.cw,sp.ch,tx*T+16-sp.ax/sp.S,ty*T+16-sp.ay/sp.S,sp.cw/sp.S,sp.ch/sp.S);
 }
 return bg;
}
class Renderer{
 constructor(cv,mini){this.cv=cv;this.c=cv.getContext('2d');this.mini=mini;this.mc=mini.getContext('2d');this.cam={x:0,y:0,z:1};this.w=0;this.h=0;this.dpr=1;this.bg=null;this.base=null;this.fogC=document.createElement('canvas');this.fogC.width=MW;this.fogC.height=MH;this.fogX=this.fogC.getContext('2d');this.fogI=this.fogX.createImageData(MW,MH);this.fogV=-1;this.ctxCs={};this.miniBg=null}
 resize(){const r=this.cv.getBoundingClientRect();this.dpr=Math.min(1.5,window.devicePixelRatio||1);this.w=r.width;this.h=r.height;this.cv.width=Math.round(r.width*this.dpr);this.cv.height=Math.round(r.height*this.dpr)}
 attach(g,terrainCanvas){
  this.g=g;this.fogV=-1;this.ctxCs={};
  this.baseMap=this.baseMap||{};if(!this.baseMap[g.mapId])this.baseMap[g.mapId]=terrainDetails(g,terrainCanvas);this.base=this.baseMap[g.mapId];
  if(!this.bg){this.bg=document.createElement('canvas');this.bg.width=MW*T;this.bg.height=MH*T}
  const bc=this.bg.getContext('2d');bc.globalCompositeOperation='source-over';bc.drawImage(this.base,0,0);this.floors(g,bc);this.vig=null;
  const mb=document.createElement('canvas');mb.width=mb.height=160;mb.getContext('2d').drawImage(this.base,0,0,160,160);this.miniBg=mb;
 }
 floorTex(fac){
  this.ft=this.ft||{};if(this.ft[fac])return this.ft[fac];const t=document.createElement('canvas');t.width=t.height=96;const c=t.getContext('2d'),R=mulberry(fac.length*91+fac.charCodeAt(1));
  if(fac==='gpt'){c.fillStyle='#31504b';c.fillRect(0,0,96,96);for(let y=0;y<96;y+=48)for(let x=0;x<96;x+=48){const g=c.createLinearGradient(x,y,x+48,y+48);g.addColorStop(0,'#517670');g.addColorStop(1,'#335049');c.fillStyle=g;rrect(c,x+1.5,y+1.5,45,45,6);c.fill();c.strokeStyle='rgba(47,214,160,.42)';c.lineWidth=1;rrect(c,x+7,y+7,34,34,4);c.stroke()}c.fillStyle='rgba(47,214,160,.8)';for(const [x,y] of[[0,0],[48,0],[0,48],[48,48]]){c.beginPath();c.arc(x,y,2.1,0,TAU);c.fill()}}
  else if(fac==='gem'){c.fillStyle='#4a5461';c.fillRect(0,0,96,96);for(let y=0;y<96;y+=48)for(let x=0;x<96;x+=48){c.fillStyle=(x+y)%96?'#505b69':'#454f5c';c.fillRect(x+1,y+1,46,46);for(const[a,b]of[[5,5],[43,5],[5,43],[43,43]]){c.fillStyle='#262d36';c.beginPath();c.arc(x+a,y+b,1.8,0,TAU);c.fill();c.fillStyle='#8a97a6';c.fillRect(x+a-.7,y+b-.7,1.2,1.2)}c.strokeStyle='rgba(30,36,44,.55)';c.lineWidth=1.6;for(let k=0;k<4;k++){c.beginPath();c.moveTo(x+12+k*7,y+18);c.lineTo(x+16+k*7,y+24);c.lineTo(x+12+k*7,y+30);c.stroke()}}}
  else{c.fillStyle='#3c1e15';c.fillRect(0,0,96,96);for(let i=0;i<46;i++){const x=R()*96,y=R()*96,r=4+R()*9;for(const[a,b]of[[0,0],[96,0],[0,96],[-96,0],[0,-96]]){c.fillStyle=`rgba(${72+R()*30|0},${32+R()*16|0},${22+R()*12|0},.8)`;c.beginPath();c.arc(x+a,y+b,r,0,TAU);c.fill();c.strokeStyle='rgba(20,8,6,.5)';c.lineWidth=1;c.stroke()}}c.strokeStyle='rgba(255,150,60,.34)';c.lineWidth=1;for(let i=0;i<7;i++){let x=R()*96,y=R()*96;c.beginPath();c.moveTo(x,y);for(let k=0;k<3;k++){x+=R()*30-15;y+=R()*30-15;c.lineTo(x,y)}c.stroke()}}
  return this.ft[fac]=t;
 }
 floors(g,bc){
  const homes=g.bases.slice(0,g.p.length);
  g.p.forEach((p,pi)=>{
   const m=document.createElement('canvas');m.width=MW;m.height=MH;const mc=m.getContext('2d'),img=mc.createImageData(MW,MH);
   for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const i=idx(x,y);if(g.level[i]<.99||g.terrain[i])continue;let bi=0,bd=1e9;homes.forEach((h,k)=>{const d=hyp(h.x-x,h.y-y);if(d<bd){bd=d;bi=k}});if(bi===pi)img.data[i*4+3]=255}
   mc.putImageData(img,0,0);
   const t=document.createElement('canvas');t.width=t.height=1216;const c=t.getContext('2d');c.fillStyle=c.createPattern(this.floorTex(p.fac),'repeat');c.fillRect(0,0,1216,1216);c.globalCompositeOperation='destination-in';c.imageSmoothingEnabled=true;c.drawImage(m,0,0,1216,1216);
   bc.globalAlpha=.78;bc.drawImage(t,0,0,MW*T,MH*T);bc.globalAlpha=1;
  });
 }
 cloudTex(){
  if(this._cl)return this._cl;const t=document.createElement('canvas');t.width=t.height=720;const c=t.getContext('2d'),R=mulberry(55);
  for(let i=0;i<34;i++){const x=R()*720,y=R()*720,r=60+R()*130;for(const[a,b]of[[0,0],[720,0],[-720,0],[0,720],[0,-720],[720,720],[-720,-720],[720,-720],[-720,720]]){const g=c.createRadialGradient(x+a,y+b,r*.12,x+a,y+b,r);g.addColorStop(0,'rgba(0,4,12,.5)');g.addColorStop(1,'rgba(0,4,12,0)');c.fillStyle=g;c.fillRect(x+a-r,y+b-r,r*2,r*2)}}
  return this._cl=t;
 }
 vigTex(){
  if(this.vig&&this.vig.width===Math.round(this.w)&&this.vig.height===Math.round(this.h))return this.vig;
  const t=document.createElement('canvas');t.width=Math.round(this.w);t.height=Math.round(this.h);const c=t.getContext('2d'),g=c.createRadialGradient(t.width/2,t.height*.44,Math.min(t.width,t.height)*.4,t.width/2,t.height*.44,Math.max(t.width,t.height)*.78);g.addColorStop(0,'rgba(4,8,18,0)');g.addColorStop(1,'rgba(4,8,18,.5)');c.fillStyle=g;c.fillRect(0,0,t.width,t.height);return this.vig=t;
 }
 ring(c,x,y,rx,ry,col,t,w){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.strokeStyle='rgba(2,6,8,.65)';c.lineWidth=(w||2)+2;c.stroke();c.setLineDash([rx*.92,rx*.34]);c.lineDashOffset=-t*18;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.strokeStyle=col;c.lineWidth=w||2;c.stroke();c.setLineDash([]);c.lineDashOffset=0}
 toWorld(sx,sy){const z=this.cam.z;return[sx/z+this.cam.x,sy/z+this.cam.y]}
 clamp(hudH){const z=this.cam.z,vw=this.w/z,vh=(this.h-hudH)/z;this.cam.x=Math.max(-40,Math.min(MW*T-vw+40,this.cam.x));this.cam.y=Math.max(-70,Math.min(MH*T-vh+40,this.cam.y))}
 viewRect(m,s){const z=this.cam.z;m.strokeStyle='#fff';m.lineWidth=1;m.strokeRect(this.cam.x*s,this.cam.y*s,this.w/z*s,this.h/z*s)}
 project(x,y,h){const c=this.cam;return[(x-c.x)*c.z,(y-(h||0)*.7-c.y)*c.z]}
 drawFog(){const g=this.g;if(g.observer||this.fogV===g.visV)return;this.fogV=g.visV;const d=this.fogI.data,A=this._fa||(this._fa=new Float32Array(N));for(let i=0;i<N;i++){const v=g.vis[i];A[i]=v===2?0:v===1?150:255}for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){let s=0,w=0;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const X=x+a,Y=y+b;if(X<0||Y<0||X>=MW||Y>=MH)continue;const k=(a?1:2)*(b?1:2);s+=A[X+Y*MW]*k;w+=k}const j=(x+y*MW)*4;d[j]=4;d[j+1]=7;d[j+2]=12;d[j+3]=s/w}this.fogX.putImageData(this.fogI,0,0)}
 threadTex(){
  if(this._th)return this._th;const t=document.createElement('canvas');t.width=t.height=160;const c=t.getContext('2d'),R=mulberry(7);c.lineCap='round';
  for(let i=0;i<46;i++){let x=R()*160,y=R()*160;c.beginPath();c.moveTo(x,y);for(let k=0;k<4;k++){const nx=x+R()*60-30,ny=y+R()*60-30;c.quadraticCurveTo(x+R()*30-15,y+R()*30-15,nx,ny);x=nx;y=ny}c.strokeStyle=`rgba(255,${120+R()*50|0},70,${.1+R()*.2})`;c.lineWidth=.6+R()*1.3;c.stroke()}
  return this._th=t;
 }
 ctxLayer(p){
  let e=this.ctxCs[p.id];if(!e){const cv=document.createElement('canvas');cv.width=cv.height=1216;const m=document.createElement('canvas');m.width=MW;m.height=MH;e=this.ctxCs[p.id]={cv,c:cv.getContext('2d'),m,mc:m.getContext('2d'),v:-1,img:null}}
  if(e.v!==p.ctxV){e.v=p.ctxV;const grid=this.g.ctxOf(p),img=e.img||(e.img=e.mc.createImageData(MW,MH));for(let i=0;i<N;i++){img.data[i*4+3]=grid[i]?255:0}e.mc.putImageData(img,0,0);
   const c=e.c;c.globalCompositeOperation='source-over';c.clearRect(0,0,1216,1216);c.fillStyle='rgba(112,44,18,.26)';c.fillRect(0,0,1216,1216);c.fillStyle=c.createPattern(this.threadTex(),'repeat');c.fillRect(0,0,1216,1216);c.globalCompositeOperation='destination-in';c.imageSmoothingEnabled=true;c.drawImage(e.m,0,0,1216,1216);}
  return e.cv;
 }
 flushDecals(){
  const g=this.g;if(!g.decals.length)return;const c=this.bg.getContext('2d');
  for(const d of g.decals.splice(0)){
   c.save();c.translate(d.x,d.y);const r=d.r*(d.big?1.2:1.5);
   if(d.big){const gd=c.createRadialGradient(0,0,r*.2,0,0,r*1.1);gd.addColorStop(0,'rgba(10,8,8,.5)');gd.addColorStop(.7,'rgba(10,8,8,.3)');gd.addColorStop(1,'rgba(10,8,8,0)');c.fillStyle=gd;c.beginPath();c.ellipse(0,0,r*1.1,r*.9,0,0,TAU);c.fill()}
   if(d.fac==='cla'){c.fillStyle='rgba(120,44,16,.72)';for(let i=0;i<9;i++){const a=i*2.4+d.x,R2=r*(.2+(i%4)*.3);c.beginPath();c.arc(Math.cos(a)*R2,Math.sin(a)*R2*.8,1.5+(i%3)*r*.13,0,TAU);c.fill()}}
   else if(d.fac==='gem'){c.fillStyle='rgba(10,10,12,.55)';c.beginPath();c.ellipse(0,0,r,r*.74,0,0,TAU);c.fill();c.fillStyle='rgba(120,130,142,.8)';for(let i=0;i<7;i++){const a=i*1.9+d.y;c.fillRect(Math.cos(a)*r*.8,Math.sin(a)*r*.6,1.6+i%3*1.2,1.6+(i+1)%3)}}
   else{c.fillStyle='rgba(232,238,232,.82)';for(let i=0;i<9;i++){const a=i*2.2+d.x,R2=r*(.3+(i%3)*.32);c.beginPath();c.moveTo(Math.cos(a)*R2,Math.sin(a)*R2*.8);c.lineTo(Math.cos(a)*R2+3,Math.sin(a)*R2*.8+1);c.lineTo(Math.cos(a)*R2+.5,Math.sin(a)*R2*.8+3.2);c.fill()}}
   c.restore();
  }
 }
 frameOf(u,sp,t){
  const n=sp.n;
  if(u.def.skill==='deploy')return u.deployed?2:u.moving?((u.walk*2|0)%2):0;
  if(n===8){if(u.atkT>0)return 7;if(u.moving)return 1+((u.walk*3.2|0)%6);return 0}
  if(n===4)return (t*22+u.id|0)%4;
  return (t*5+u.id|0)%n;
 }
 draw(ui,now){
  const g=this.g,c=this.c,z=this.cam.z,t=now/1000;
  c.setTransform(this.dpr,0,0,this.dpr,0,0);c.fillStyle='#05080c';c.fillRect(0,0,this.w,this.h);
  c.save();c.scale(z,z);c.translate(-this.cam.x,-this.cam.y);c.imageSmoothingEnabled=true;
  this.flushDecals();
  c.drawImage(this.bg,0,0);
  const vx=this.cam.x-140,vy=this.cam.y-160,vw=this.w/z+280,vh=this.h/z+300,on=e=>e.x>vx&&e.y>vy&&e.x<vx+vw&&e.y<vy+vh;
  for(const p of g.p)if(p.fac==='cla')c.drawImage(this.ctxLayer(p),0,0,MW*T,MH*T);
  const sel=ui?ui.selSet:null,items=[];
  for(const r of g.res){if(!on(r)||!g.tileExp(r.x,r.y))continue;if(r.type==='d'){if(!r.ext||!r.ext.built)this.pool(c,r,t);}else items.push({y:r.y+8,k:0,e:r})}
  for(const b of g.blds){if(!on(b)||(b.p!==ME&&!g.observer&&!b.seen))continue;items.push({y:(b.ty+b.h)*T-6,k:1,e:b});if(sel&&sel.has(b.id)){this.ring(c,b.x,b.y+3,b.w*T*.62,b.h*T*.53,this.side(b.p),t,2.4)}}
  const list=g.units.filter(u=>on(u)&&(u.p===ME||g.observer||g.tileVis(u.x,u.y)));
  for(const u of list){if(sel&&sel.has(u.id))this.ring(c,u.x,u.y+2,u.r*1.22+5,(u.r*1.22+5)*.68,this.side(u.p),t,1.9);if(!u.air)items.push({y:u.y,k:2,e:u})}
  items.sort((a,b)=>a.y-b.y);
  for(const it of items){if(it.k===0)this.resNode(c,it.e);else if(it.k===1)this.bld(c,it.e,t,sel);else this.unit(c,it.e,t,sel)}
  for(const s of g.proj){if(on(s)&&g.tileVis(s.x,s.y))this.shot(c,s,t)}
  for(const u of list)if(u.air)this.unit(c,u,t,sel);
  for(const f of g.fx){if(on(f)&&g.tileVis(f.x,f.y))this.fx(c,f,t)}
  c.globalAlpha=1;c.globalCompositeOperation='source-over';
  { // 구름 그림자
   const off=(t*13)%720,oy=(t*6)%720;c.save();c.translate(off,oy);c.globalAlpha=.34;c.fillStyle=c.createPattern(this.cloudTex(),'repeat');c.fillRect(vx-off,vy-oy,vw,vh);c.restore();
   // 떠다니는 먼지
   c.globalCompositeOperation='lighter';const dust=glowOf('#ffe7b0');for(let i=0;i<46;i++){const px=vx+((i*197.3+t*(9+i%6))%vw),py=vy+((i*131.7+t*(4+i%5)+Math.sin(t*.7+i)*18)%vh);c.globalAlpha=.16+.14*Math.sin(t*1.3+i*2);c.drawImage(dust,px,py,5+i%4,5+i%4)}c.globalAlpha=1;c.globalCompositeOperation='source-over';
  }
  if(!g.observer){this.drawFog();c.imageSmoothingEnabled=true;c.drawImage(this.fogC,0,0,MW*T,MH*T)}
  if(ui)ui.drawWorld(c,t);
  c.restore();
  c.drawImage(this.vigTex(),0,0,this.w,this.h);
  if(ui)ui.drawScreen(c);
 }
 side(p){return p===0?'#7dff9a':(this.g.hostile(ME,p)?'#ff5a4e':'#ffd25e')}
 resNode(c,r){
  const sp=Sprites.get('res_c'+(r.id%3),null);if(!sp)return;const k=.62+.38*Math.min(1,r.amt/r.max);
  c.drawImage(sp.cv,0,0,sp.cw,sp.ch,r.x-sp.ax/sp.S*k,r.y-sp.ay/sp.S*k+1,sp.cw/sp.S*k,sp.ch/sp.S*k);
 }
 pool(c,r,t){
  c.save();c.beginPath();c.ellipse(r.x,r.y,r.r*1.05,r.r*.92,0,0,TAU);const g=c.createRadialGradient(r.x-6,r.y-6,4,r.x,r.y,r.r*1.05);g.addColorStop(0,'#3ff0ff');g.addColorStop(.55,'#0f6e8f');g.addColorStop(1,'#062a3a');c.fillStyle=g;c.fill();c.lineWidth=3;c.strokeStyle='rgba(8,18,24,.9)';c.stroke();c.clip();
  c.globalCompositeOperation='lighter';c.strokeStyle='rgba(120,240,255,.5)';c.lineWidth=1.4;for(let i=0;i<3;i++){const R=(t*12+i*12)%36;circ(c,r.x+Math.sin(i*2)*8,r.y+Math.cos(i*3)*6,R);c.globalAlpha=1-R/36;c.stroke()}c.globalAlpha=1;
  c.fillStyle='#d8ffff';for(let i=0;i<8;i++){const a=i*1.26+t*.4;c.fillRect(r.x+Math.cos(a)*20*Math.sin(i*2+t*.2)-1,r.y+Math.sin(a*1.4)*16-1,2,2)}c.restore();
 }
 bld(c,b,t,sel){
  const g=this.g,color=g.p[b.p].color,sp=Sprites.get(b.def.key,color);if(!sp)return;
  const dx=b.x-sp.ax/sp.S,dy=b.y-sp.ay/sp.S,W=sp.cw/sp.S,H=sp.ch/sp.S,fac=b.def.fac;
  if(b.built||fac==='gem'||fac==='gpt'){
   const pr=b.built?1:b.prog,baseY=(b.y+b.r+6-dy)/H,top=Math.max(0,(1-pr)*baseY);
   c.drawImage(sp.cv,0,top*sp.ch,sp.cw,sp.ch*(1-top),dx,dy+top*H,W,H*(1-top));
   if(!b.built){
    const y=dy+top*H;
    if(fac==='gpt'){c.globalCompositeOperation='lighter';c.fillStyle=color;c.globalAlpha=.75;c.fillRect(b.tx*T,y-2,b.w*T,3);c.globalAlpha=.8;c.drawImage(glowOf(color),b.x-40,y-34,80,68);c.globalCompositeOperation='source-over';c.globalAlpha=1}
    else{c.strokeStyle='#d9c27a';c.lineWidth=1.8;const L=b.tx*T+4,Rr=(b.tx+b.w)*T-4,B=(b.ty+b.h)*T-2;c.beginPath();for(let i=0;i<4;i++){const q=B-(i+1)*20*Math.max(.25,pr)*b.h/2;c.moveTo(L,q);c.lineTo(Rr,q);c.moveTo(L,B-i*20*b.h/2*Math.max(.25,pr));c.lineTo(Rr,q)}c.moveTo(L,B);c.lineTo(L,B-90*pr);c.moveTo(Rr,B);c.lineTo(Rr,B-90*pr);c.stroke();if((t*14|0)%3===0){c.globalCompositeOperation='lighter';c.drawImage(glowOf('#ffd070'),L+(t*90%(Rr-L))-10,y-8,20,20);c.globalCompositeOperation='source-over'}}
   }
  }else{const k=.42+.58*b.prog,pu=1+.03*Math.sin(t*5);c.drawImage(sp.cv,b.x-sp.ax/sp.S*k*pu,b.y-sp.ay/sp.S*k*pu,W*k*pu,H*k*pu)}
  if(!g.tileVis(b.x,b.y))return;
  if(b.built&&sp.ec){c.globalCompositeOperation='lighter';c.globalAlpha=.42+.3*Math.sin(t*1.8+b.id*1.7);c.drawImage(sp.ec,0,0,sp.cw,sp.ch,dx,dy,W,H);c.globalCompositeOperation='source-over';c.globalAlpha=1}
  if(b.flash>0){c.globalCompositeOperation='lighter';c.globalAlpha=.3;c.drawImage(sp.cv,0,0,sp.cw,sp.ch,dx,dy,W,H);c.globalCompositeOperation='source-over';c.globalAlpha=1}
  if(b.q.length&&b.built){c.globalCompositeOperation='lighter';c.globalAlpha=.45+.3*Math.sin(t*6);c.drawImage(glowOf(color),b.x-34,b.y-60,68,68);c.globalCompositeOperation='source-over';c.globalAlpha=1}
  if(b.def.fac==='gem'&&b.def.role==='hq'&&b.built){for(let i=0;i<3;i++){const k=(t*.35+i*.33)%1;c.globalAlpha=(1-k)*.42;c.drawImage(smokeOf(),b.x-58+i*16-14-k*8,b.y-120-k*70,30+k*30,30+k*30)}c.globalAlpha=1}
  const hf=b.hp/b.def.hp;
  if(b.built&&hf<.55){const n=hf<.3?3:1.6;for(let i=0;i<n;i++){const ox=Math.sin(b.id*3+i*2.2)*b.r*.6,oy=-Math.abs(Math.cos(b.id+i))*b.r*.7,fl=.65+.35*Math.sin(t*16+i);c.globalCompositeOperation='lighter';c.drawImage(glowOf('#ff7a20'),b.x+ox-18*fl,b.y+oy-24*fl,36*fl,48*fl);c.globalCompositeOperation='source-over';const k=(t*.5+i*.31)%1;c.globalAlpha=(1-k)*.6;c.drawImage(smokeOf(),b.x+ox-14-k*8,b.y+oy-30-k*60,28+k*24,28+k*24);c.globalAlpha=1}}
  if((sel&&sel.has(b.id))||g.tick-b.lastHit<90||!b.built)this.bar(c,b.x,b.ty*T-(b.def.role==='hq'?56:30),b.w*T*.76,b);
  if(sel&&sel.has(b.id)&&b.rally&&b.p===ME){c.strokeStyle='rgba(125,255,154,.62)';c.setLineDash([6,6]);c.lineDashOffset=-t*18;c.lineWidth=1.5;c.beginPath();c.moveTo(b.x,b.y);c.lineTo(b.rally.x,b.rally.y);c.stroke();c.setLineDash([]);circ(c,b.rally.x,b.rally.y,4);c.fillStyle='#7dff9a';c.fill()}
 }
 unit(c,u,t,sel){
  const g=this.g,color=g.p[u.p].color,sp=Sprites.get(u.def.key,color);if(!sp)return;
  const a=((u.face%TAU)+TAU)%TAU,sec=Math.round(a/(TAU/8))%8,map=[[0,0],[1,0],[2,0],[1,1],[0,1],[3,1],[4,0],[3,0]][sec],row=map[0],flip=map[1],fr=this.frameOf(u,sp,t),W=sp.cw/sp.S,H=sp.ch/sp.S;
  c.save();c.translate(Math.round(u.x*2)/2,Math.round(u.y*2)/2);c.scale(flip?-1.22:1.22,1.22);
  const age=(g.tick-(u.born||0))/TPS;if(age<.45)c.globalAlpha=Math.min(1,.15+age*2.2);else if(u.life>0)c.globalAlpha=.8;
  c.drawImage(sp.cv,fr*sp.cw,row*sp.ch,sp.cw,sp.ch,-sp.ax/sp.S,-sp.ay/sp.S,W,H);
  if(u.flash>0||u.boost>0){c.globalCompositeOperation='lighter';c.globalAlpha=u.flash>0?.4:.22;c.drawImage(sp.cv,fr*sp.cw,row*sp.ch,sp.cw,sp.ch,-sp.ax/sp.S,-sp.ay/sp.S,W,H);c.globalCompositeOperation='source-over';c.globalAlpha=1}
  c.restore();
  if(u.def.sh&&u.sh>0&&g.tick-u.lastHit<8){c.globalCompositeOperation='lighter';c.globalAlpha=.55;c.drawImage(glowOf(color),u.x-u.r*2.5,u.y-u.r*3.2-(u.air?34:0),u.r*5,u.r*5);c.globalCompositeOperation='source-over';c.globalAlpha=1}
  if(age<.5&&g.tick>30){const k=age/.5;c.globalCompositeOperation='lighter';c.globalAlpha=1-k;if(u.def.fac==='gpt'){const w2=u.r*(1.6-k);const gr=c.createLinearGradient(0,u.y-150,0,u.y);gr.addColorStop(0,color+'00');gr.addColorStop(1,color);c.fillStyle=gr;c.fillRect(u.x-w2,u.y-150,w2*2,150)}else if(u.def.fac==='gem'){for(let i=0;i<8;i++){const a=i*.8+u.id;c.drawImage(glowOf('#ffd070'),u.x+Math.cos(a)*u.r*2*k-4,u.y+Math.sin(a)*u.r*1.4*k-10,8,8)}}else c.drawImage(glowOf('#ff8a3d'),u.x-u.r*2.4,u.y-u.r*2.4,u.r*4.8,u.r*4.8);c.globalCompositeOperation='source-over';c.globalAlpha=1}
  if(u.o&&u.o.t==='gather'&&u.o.ph==='mine'){const r=g.by.get(u.o.id);if(r){const sx=u.x,sy=u.y-16,ex=r.x+Math.sin(t*3+u.id)*8,ey=r.y-6;c.globalCompositeOperation='lighter';c.lineCap='round';if(u.def.fac==='cla'){c.beginPath();c.moveTo(sx,sy);c.quadraticCurveTo((sx+ex)/2+Math.sin(t*9+u.id)*12,(sy+ey)/2-Math.cos(t*7)*10,ex,ey);c.strokeStyle='#ff9a4a';c.lineWidth=2.2;c.stroke()}else{c.beginPath();c.moveTo(sx,sy);c.lineTo(ex,ey);c.strokeStyle=u.def.fac==='gem'?'#ffb84a':color;c.lineWidth=3;c.globalAlpha=.55;c.stroke();c.strokeStyle='#fff';c.lineWidth=1;c.globalAlpha=1;c.stroke()}c.drawImage(glowOf(u.def.fac==='gem'?'#ffb84a':color),ex-11,ey-11,22,22);c.globalCompositeOperation='source-over'}}
  if(u.carry>0){const ch=u.carryType==='c'?'#7cffd8':'#6fdcff';c.globalCompositeOperation='lighter';c.drawImage(glowOf(ch),u.x-8,u.y-sp.ay/sp.S*.72-8,16,16);c.globalCompositeOperation='source-over'}
  if((sel&&sel.has(u.id))||g.tick-u.lastHit<90)this.bar(c,u.x,u.y-sp.ay/sp.S*1.22+2,Math.max(18,u.r*2.2),u);
 }
 bar(c,x,y,w,e){
  const hf=Math.max(0,e.hp/e.def.hp),n=Math.max(4,Math.min(16,Math.round(w/5))),gap=1,sw=(w-gap*(n-1))/n,hasSh=!!e.def.sh;
  c.fillStyle='#020405';c.fillRect(x-w/2-1,y-1,w+2,hasSh?8:5);
  const col=hf>.6?'#48e36a':hf>.3?'#ffc733':'#ff4a3d';
  for(let i=0;i<n;i++){c.fillStyle=(i+.001)/n<hf?col:'#22292c';c.fillRect(x-w/2+i*(sw+gap),y,sw,3)}
  if(hasSh){const sf=Math.max(0,e.sh/e.def.sh);for(let i=0;i<n;i++){c.fillStyle=(i+.001)/n<sf?'#62d4ff':'#1b2a33';c.fillRect(x-w/2+i*(sw+gap),y+4,sw,2)}}
 }
 shot(c,s,t){
  const yo=s.air?-30:-14,glow=glowOf(s.c);c.globalCompositeOperation='lighter';
  if(hyp(s.x-s.sx,s.y-s.sy)<70){c.globalAlpha=.9;c.drawImage(glowOf('#fff3c8'),s.sx-15,s.sy+yo-15,30,30);c.globalAlpha=1}
  if(s.kind==='beam'){c.beginPath();c.moveTo(s.sx,s.sy+yo);c.lineTo(s.x,s.y-14);c.strokeStyle=s.c;c.lineWidth=4.5;c.globalAlpha=.65;c.stroke();c.strokeStyle='#fff';c.lineWidth=1.5;c.globalAlpha=1;c.stroke();c.drawImage(glow,s.x-13,s.y-27,26,26)}
  else if(s.kind==='shell'){const d=hyp(s.tx-s.sx,s.ty-s.sy)||1,prog=Math.min(1,hyp(s.x-s.sx,s.y-s.sy)/d),ar=-Math.sin(prog*Math.PI)*Math.min(70,d*.35);c.drawImage(glow,s.x-11,s.y+ar-24,22,22);c.globalCompositeOperation='source-over';c.globalAlpha=.42;c.drawImage(smokeOf(),s.x-12,s.y+ar-20,24,24)}
  else if(s.kind==='spit'){c.drawImage(glow,s.x-9,s.y-22,18,18)}
  else{const a=Math.atan2(s.ty-s.y,s.tx-s.x);c.beginPath();c.moveTo(s.x,s.y-15);c.lineTo(s.x-Math.cos(a)*18,s.y-Math.sin(a)*18-15);c.strokeStyle=s.c;c.lineWidth=2.6;c.stroke();c.drawImage(glow,s.x-8,s.y-23,16,16)}
  c.globalCompositeOperation='source-over';c.globalAlpha=1;
 }
 fx(c,f,t){
  const k=f.t/f.d,a=1-k,add=()=>c.globalCompositeOperation='lighter',nor=()=>{c.globalCompositeOperation='source-over';c.globalAlpha=1};
  switch(f.k){
   case'ring':circ(c,f.x,f.y,f.r*(.4+.6*k));c.strokeStyle=f.c;c.globalAlpha=a;c.lineWidth=3;c.stroke();nor();break;
   case'die':{add();c.globalAlpha=a*.85;const s=f.r*(f.fac==='gem'?2.3:1.7)*(.5+k);c.drawImage(glowOf(f.fac==='gem'?'#ff9a2e':f.c),f.x-s,f.y-s-8,s*2,s*2);c.fillStyle=f.fac==='gpt'?'#fff':f.fac==='cla'?'#ffae55':'#ffd59c';for(let i=0;i<10;i++){const an=i*.63+f.x;c.fillRect(f.x+Math.cos(an)*f.r*k*2,f.y+Math.sin(an)*f.r*k*1.6-14*Math.sin(k*3),2.8,2.8)}nor();if(f.fac==='gem'&&f.big){c.globalAlpha=a*.7;c.drawImage(smokeOf(),f.x-30,f.y-44-k*20,60,60);nor()}break}
   case'blast':{for(let i=0;i<7;i++){const an=i*.9,s=f.r*(.4+.7*k)*(.8+.3*Math.sin(i*2)),px=f.x+Math.cos(an)*f.r*.52*k,py=f.y+Math.sin(an)*f.r*.44*k-20*k;add();c.globalAlpha=a;c.drawImage(glowOf(i%2?'#ffb040':'#ff5a1f'),px-s,py-s,s*2,s*2);nor();c.globalAlpha=a*.65;c.drawImage(smokeOf(),px-s*.9,py-s*1.2-k*30,s*1.8,s*1.8);nor()}circ(c,f.x,f.y,f.r*1.5*k);c.strokeStyle='#ffe5ba';c.globalAlpha=a*.9;c.lineWidth=4*a+1;c.stroke();nor();c.fillStyle='#ffe2b0';c.globalAlpha=a;for(let i=0;i<22;i++){const an=i*1.73;c.fillRect(f.x+Math.cos(an)*f.r*1.4*k,f.y+Math.sin(an)*f.r*1.1*k-60*Math.sin(k*3)*(i%3?.4:1),3,3)}nor();break}
   case'slash':{add();c.globalAlpha=a;c.drawImage(glowOf(f.c),f.x-14,f.y-26,28,28);nor();c.beginPath();c.arc(f.x,f.y-12,f.r,k*3,k*3+1.8);c.strokeStyle='#fff';c.globalAlpha=a;c.lineWidth=2.6;c.stroke();nor();break}
   case'spark':{add();c.globalAlpha=a;const s=14*(.4+k);c.drawImage(glowOf(f.c),f.x-s,f.y-s-12,s*2,s*2);nor();break}
   case'wave':{add();circ(c,f.x,f.y,f.r*k);c.strokeStyle=f.c;c.globalAlpha=a;c.lineWidth=7;c.stroke();circ(c,f.x,f.y,f.r);c.globalAlpha=a*.18;c.fillStyle=f.c;c.fill();nor();break}
   case'tele':{circ(c,f.x,f.y,f.r);c.strokeStyle='#ff4a3d';c.globalAlpha=.95;c.lineWidth=3;c.setLineDash([14,9]);c.lineDashOffset=f.t*90;c.stroke();c.setLineDash([]);circ(c,f.x,f.y,f.r*k);c.globalAlpha=.24;c.fillStyle='#ff4a3d';c.fill();nor();c.save();c.globalAlpha=.9;c.strokeStyle='#ff4a3d';c.lineWidth=2;c.beginPath();c.moveTo(f.x-14,f.y);c.lineTo(f.x+14,f.y);c.moveTo(f.x,f.y-14);c.lineTo(f.x,f.y+14);c.stroke();c.restore();break}
   case'move':{c.beginPath();c.ellipse(f.x,f.y,15*a+2,(15*a+2)*.66,0,0,TAU);c.strokeStyle=f.c;c.globalAlpha=a;c.lineWidth=2.4;c.stroke();nor();break}
  }
  nor();
 }
 drawMini(ui){
  const g=this.g,m=this.mc,s=160/(MW*T);
  m.imageSmoothingEnabled=true;m.drawImage(this.miniBg,0,0);
  for(const r of g.res){if(!g.tileExp(r.x,r.y))continue;m.fillStyle=r.type==='c'?'#7cffd8':'#46e2ff';m.fillRect(r.x*s-1,r.y*s-1,2,2)}
  for(const b of g.blds){if(b.p!==ME&&!g.observer&&!b.seen)continue;m.fillStyle=g.p[b.p].color;m.fillRect(b.tx*T*s,b.ty*T*s,Math.max(3,b.w*T*s),Math.max(3,b.h*T*s))}
  for(const u of g.units){if(u.p!==ME&&!g.observer&&!g.tileVis(u.x,u.y))continue;m.fillStyle=g.p[u.p].color;m.fillRect(u.x*s-1,u.y*s-1,2.6,2.6)}
  if(!g.observer){this.drawFog();m.drawImage(this.fogC,0,0,160,160)}
  if(ui)for(const a of ui.pings){const k=(performance.now()-a.t)/2200;if(k>1)continue;m.strokeStyle='#ff4a3d';m.lineWidth=2;m.beginPath();m.arc(a.x*s,a.y*s,14*(1-k)+3,0,TAU);m.stroke()}
  this.viewRect(m,s);
 }
}
