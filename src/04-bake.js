// 사전 렌더링: 부호 거리 함수로 만든 3D 모델을 스프라이트 시트로 굽는다. Worker와 메인 스레드 양쪽에서 동작한다.
function bakeRuntime(){
 const TAU=Math.PI*2,KY=.72,LX=-.5,LY=-.46,LZ=.735;
 const W=[.93,.94,.91],GR=[.55,.59,.62],DK=[.12,.14,.17],GM=[.24,.28,.35],ST=[.47,.52,.6],HZ=[.96,.73,.14],CL=[.74,.38,.25],CD=[.36,.16,.13],CR=[.94,.81,.62],GD=[.86,.67,.24],PCB=[.07,.2,.16];
 const rgb=h=>[parseInt(h.slice(1,3),16)/255,parseInt(h.slice(3,5),16)/255,parseInt(h.slice(5,7),16)/255].map(v=>Math.pow(v,1.25));
 function B(){
  const L=[],pr=(t,x,y,z,a,b,c,d,e,rot,col,m)=>{L.push({t,x,y,z,a,b,c,d,e,rot:rot||0,cr:1,sr:0,c0:col[0],c1:col[1],c2:col[2],m:m||0,bx:0,by:0,bz:0,br:0})};
  return{L,
   S:(x,y,z,r,c,m)=>pr(0,x,y,z,r,0,0,0,0,0,c,m),
   C:(x,y,z,a,b,cc,r1,r2,c,m)=>pr(1,x,y,z,a,b,cc,r1,r2,0,c,m),
   X:(x,y,z,hx,hy,hz,rd,rot,c,m)=>pr(2,x,y,z,hx,hy,hz,rd,0,rot,c,m),
   E:(x,y,z,a,b,cc,c,m,rot)=>pr(3,x,y,z,a,b,cc,0,0,rot,c,m),
   Y:(x,y,z0,z1,r,c,m,rd)=>pr(4,x,y,z0,z1,r,0,rd||.8,0,0,c,m),
   R:(x,y,z,RR,r,c,m,ax,rot)=>pr(5,x,y,z,RR,r,ax?1:0,0,0,rot,c,m)};
 }
 const UN={};
 const sw=t=>Math.sin(t*TAU);
 // ---------- ChatGPT: 백자 자동인형 ----------
 UN.gpt_w=(m,T,f)=>{const b=Math.sin(f.t*TAU)*1.2,z=15+b;m.R(0,0,4,8,1.5,T,2);m.S(0,0,z,8,W,1);m.X(5.8,0,z+1,2.2,5.6,1.7,1,0,T,2);m.S(0,0,z+8,2.2,GR,1);m.C(1,-8,z-1,8,-5,z-6,1.4,1,GR,1);m.C(1,8,z-1,8,5,z-6,1.4,1,GR,1);if(f.carry)m.S(9,0,z-7,3,T,2)};
 UN.gpt_guard=(m,T,f)=>{const s=f.walk?sw(f.t)*5:0,a=f.atk;for(const q of[-1,1]){const l=s*q;m.C(0,q*4,16,l*.6+1,q*4.5,8,3.4,2.6,GR,1);m.C(l*.6+1,q*4.5,8,l,q*4.5,1.8,2.6,2.4,W,1);m.X(l+1.2,q*4.5,1.3,3.6,2,1.3,.6,0,GR,1)}m.E(0,0,23,6.3,7.6,9,W,1);m.X(5.4,0,23,1,3.2,5,.6,0,T,2);m.S(0,-9.4,29,4.4,T,1);m.S(0,9.4,29,4.4,T,1);m.S(.8,0,35,4,W,1);m.X(3.8,0,35.4,.8,3,1,.4,0,T,2);m.X(7,-12,21,1.3,6.2,12,1.2,0,W,1);m.X(8.2,-12,21,.5,1.5,8,.3,0,T,2);m.C(0,10,27,a?15:8,11,a?31:17,2,1.4,GR,1);m.S(a?17:9,11,a?34:15,4.6,T,2)};
 UN.gpt_arch=(m,T,f)=>{const s=f.walk?sw(f.t)*5:0;for(const q of[-1,1]){m.C(0,q*2.8,15,s*q,q*3.2,1.8,2,1.5,W,1)}m.C(0,0,15,0,0,28,4,5,W,1);m.E(.4,0,32,3.2,3,5.4,W,1);m.X(3,0,33,.6,2,.8,.3,0,T,2);m.C(0,-5.5,26,8,-2,24,1.3,1,GR,1);m.C(0,5.5,26,8,2,24,1.3,1,GR,1);m.R(9,0,24,12,1.3,T,2,1);if(f.atk)m.C(2,0,24,22,0,24,1.4,.5,T,2);m.S(-3,0,27,3,GR,1)};
 UN.gpt_tf=(m,T,f)=>{m.R(0,0,6,19,2.6,GR,1);m.R(0,0,12,14,1.4,T,2);m.C(0,0,9,0,0,31,8,13,GR,1);m.E(0,0,41,14,18,13,W,1);m.X(11.6,0,44,2.2,8.5,7,1.4,0,W,1);m.X(13.6,0,45,.8,5,3.2,.4,0,T,2);m.X(9,0,29,3,7,4,1.2,0,W,1);for(let i=0;i<3;i++){const a=i/3*TAU+1.05;m.X(Math.cos(a)*19,Math.sin(a)*19,12,7,1.7,8,1,a,W,1)}for(const q of[-1,1]){m.E(-1,q*22,52,9.5,9.5,8.5,W,1);m.X(-1,q*23,60,7,6,1.7,1,0,T,1);m.C(0,q*24,44,10,q*27,31,4.6,3.6,GR,1);m.C(10,q*27,31,32,q*26,33,5,3.4,W,1);m.R(26,q*26,33,5.4,1,T,2,1);m.S(33,q*26,33,3.8,T,2);m.X(-9,q*10,42,2.5,4,10,1.4,0,GR,1)}m.E(2.5,0,58,6.6,6.6,7.6,W,1);m.X(8.4,0,59,.8,4.6,1.5,.4,0,T,2);m.C(-2,0,63,-7,0,72,1.8,.8,GR,1);m.R(-7,0,58,17,1.3,T,2,1);for(let i=0;i<6;i++){const a=i/6*TAU;m.S(-7,Math.cos(a)*17,58+Math.sin(a)*17,2.1,W,1)}m.R(0,0,24,20,1.5,T,2)};
 UN.gpt_ship=(m,T,f)=>{const z=40+sw(f.t)*1.5;m.E(0,0,z,26,17,6,W,1);m.E(2,0,z+5,12,9,5.5,T,2);for(const q of[-1,1]){m.C(4,q*12,z,27,q*7,z-1,4,1.5,W,1);m.S(28,q*7,z-1,2.4,T,2);m.X(-18,q*12,z+3,8,1.3,7,.8,q*.5,GR,1)}m.X(-20,0,z+5,7,1.4,9,.8,0,W,1);m.S(-25,0,z,4,T,2)};
 // ---------- Gemini: 강철 공업 ----------
 UN.gem_w=(m,T,f)=>{const a=f.walk?sw(f.t)*2:0;for(const x of[-5.5,5.5])m.C(x,-9,4,x,9,4,4,4,DK);m.X(0,0,9,8,6.5,4.5,1,0,ST,1);m.X(-3,0,15,4,5,3,1,0,T,1);m.C(2,0,13,9,0,24+a,1.8,1.5,HZ,1);m.C(9,0,24+a,16,0,18+a,1.5,1.2,HZ,1);m.X(17,0,16+a,2,3,2,.5,0,GM);m.S(-3,0,20,1.8,[1,.3,.2],2)};
 UN.gem_text=(m,T,f)=>{const s=f.walk?sw(f.t)*5:0;for(const q of[-1,1]){m.C(0,q*4,14,s*q,q*4.3,3.5,2.8,2.4,GM,1);m.X(s*q+1.2,q*4.3,1.8,4,2.6,1.8,.5,0,ST,1)}m.X(0,0,20,4.8,6.6,6.4,1.2,0,T,1);m.X(-5.5,0,21,2,5,5,.8,0,GM,1);m.C(-6,-3,26,-7,-3,40,.6,.4,ST,1);m.X(1,0,31,4.5,5,3.6,1,0,ST,1);m.X(5.6,0,31,.5,3.8,2.3,.3,0,[.5,1,.95],2);m.C(1,7,24,3,8,18,1.8,1.5,GM,1);m.C(1,8,20,f.atk?21:16,8,20,1.5,1.1,DK,1);if(f.atk)m.S(23,8,20,3.4,[1,.85,.45],2)};
 UN.gem_vision=(m,T,f)=>{const s=f.walk?sw(f.t)*3:0;for(const a of[.6,2.2,4.1]){const ax=Math.cos(a)*17+Math.cos(a+1.5)*s,ay=Math.sin(a)*17;m.C(0,0,27,ax*.6,ay*.6,31,1.6,1.4,GM,1);m.C(ax*.6,ay*.6,31,ax,ay,1.5,1.4,1,ST,1)}m.X(-1,0,31,6,5,5,1.5,0,T,1);m.C(1,0,34,14,0,35,6.2,5.2,DK,1);m.R(14,0,35,5.6,1,ST,1,1);m.S(14.5,0,35,4.3,[1,.3,.3],2);m.C(-3,0,41,f.atk?30:27,0,41,1.2,.9,GM,1);m.X(-6,0,41,4,2,2,.6,0,ST,1)};
 UN.gem_audio=(m,T,f)=>{const dep=f.dep;for(const q of[-1,1]){m.X(0,q*13,6,20,4.8,6,2.4,0,DK);for(let i=-2;i<=2;i++)m.Y(i*7+(f.walk?f.t*7:0)-3.5,q*17.6,5.5,6.6,1.4,ST,1);m.X(-3,q*10,13,13,1,1.2,.4,0,HZ,1)}for(let i=-2;i<=2;i++)for(const q of[-1,1])m.C(i*7.2,q*9.6,6.4,i*7.2,q*17.8,6.4,4.7,4.7,ST,1);m.X(0,0,14,17,10.5,6,1.8,0,T,1);m.X(13,0,17,5,8,2.6,1.3,0,GM,1);m.X(-13,0,20,4,8,3,1,0,GM,1);for(const q of[-1,1]){m.Y(-14,q*5,22,25,2.2,DK,1);m.Y(-14,q*5,25,26,1.5,[1,.45,.2],2)}m.C(-6,8,26,-10,12,44,.6,.4,ST,1);m.Y(-2,0,20,27,8.5,GM,1);m.Y(-3,5,26,29,2.8,ST,1);const up=dep?12:0;m.C(-1,0,27,dep?16:24,0,28+up,5,dep?15:12,DK);m.R(dep?17:25,0,28+up,dep?15:12,1.7,HZ,1,1);m.S(dep?18.5:26.5,0,28+up,dep?8:6,T,2);if(dep)for(const q of[-1,1]){m.C(-10,q*13,8,-16,q*29,1.5,2.4,2,ST,1);m.C(10,q*13,8,16,q*29,1.5,2.4,2,ST,1);m.X(-16,q*29,1,3.5,3.5,1,.5,0,HZ,1);m.X(16,q*29,1,3.5,3.5,1,.5,0,HZ,1)}};
 UN.gem_drone=(m,T,f)=>{const z=34+sw(f.t)*1.5;m.X(0,0,z,8,7,4,1.8,0,T,1);for(const a of[-1,1])for(const b of[-1,1]){m.C(a*4,b*4,z+1,a*15,b*15,z+3,1.4,1.2,GM,1);m.Y(a*15,b*15,z+1,z+7,2,DK);m.R(a*15,b*15,z+7,9.5,.9,ST,1);m.E(a*15,b*15,z+7,8.5,8.5,.5,[.55,.65,.8],1)}m.S(4,0,z-6,4.2,DK,1);m.S(7.3,0,z-6.4,2.2,[1,.3,.3],2)};
 // ---------- Claude: 살아 있는 점토 ----------
 const legs=(m,n,len,z,col,t,r)=>{for(let i=0;i<n;i++){const a=(i+.5)/n*Math.PI-Math.PI/2;for(const q of[-1,1]){const ph=t+(i%2?.5:0)+(q>0?.5:0),lift=Math.max(0,sw(ph))*3,fx=Math.sin(a)*len+Math.cos(ph*TAU)*2.4,fy=q*Math.cos(a)*len;m.C(Math.sin(a)*4,q*4,z,fx*.72,fy*.72,z+5+lift,r,r*.8,col,0);m.C(fx*.72,fy*.72,z+5+lift,fx,fy,.8+lift,r*.8,r*.45,col,0)}}};
 UN.cla_w=(m,T,f)=>{legs(m,3,16,9,CD,f.walk?f.t:0,1.5);m.E(0,0,12,9,9.5,6.3,CL);m.E(-2,0,16,6,6.2,3.2,T,1);for(const q of[-1,1]){m.C(5,q*3,14,9,q*4.2,23,1,.9,CD);m.S(9.2,q*4.3,23.8,1.9,[1,.92,.55],2);m.C(7,q*7,10,15,q*5,8,1.6,1.2,CR,1)}};
 UN.cla_swarm=(m,T,f)=>{const h=f.walk?Math.abs(sw(f.t))*3.4:0;legs(m,2,12,6+h,CD,f.walk?f.t:0,1.1);m.E(-1,0,9.5+h,10.5,7.4,5,CL);m.Y(-2,0,13+h,15.6+h,3.8,[1,.8,.3],2);for(const q of[-1,1]){m.C(8,q*3.5,9+h,f.atk?20:17,q*(f.atk?6:2.6),7+h,1.5,.6,CR,1)}m.S(8.3,0,11.3+h,3,CD)};
 UN.cla_spine=(m,T,f)=>{legs(m,2,14,8,CD,f.walk?f.t:0,1.5);m.C(0,0,9,3,0,26,6,4,CL);m.E(4,0,31,9,8.5,7,T,1);m.E(11,0,31,3,4.5,3.8,[1,.8,.35],2);const n=5,ex=f.atk?1.35:1;for(let i=0;i<n;i++){const a=i/n*TAU+.5,dx=Math.cos(a),dy=Math.sin(a);m.C(3+dx*5,dy*6,35,3+dx*15*ex,dy*15*ex,48*ex-4,1.4,.5,CR,1);m.S(3+dx*15*ex,dy*15*ex,48*ex-3,1.6,[1,.78,.3],2)}};
 UN.cla_beast=(m,T,f)=>{legs(m,4,28,10,CD,f.walk?f.t:0,2.6);const seg=[[-25,14,15],[-13,20,20],[1,24,23],[15,21,20]];for(const [x,y,z] of seg){m.E(x,0,z,11.5,y,z-2,CL);m.E(x+6,0,z,2.2,y*.84,z-3.4,[.95,.55,.18],2)}m.E(24,0,18,11,14.5,12,CD);for(const q of[-1,1]){m.C(30,q*7,16,f.atk?47:43,q*(f.atk?11:15),f.atk?16:9,4.2,1.2,CR,1);m.S(33,q*6,23,2.3,[1,.9,.5],2)}};
 UN.cla_spore=(m,T,f)=>{const z=38+sw(f.t)*2.5;for(let i=0;i<7;i++){const a=i/7*TAU,R=11,wig=sw(f.t+i*.15)*3.6;m.C(Math.cos(a)*R,Math.sin(a)*R,z-3,Math.cos(a)*(R+3)+wig,Math.sin(a)*(R+3),z-14,1.5,1,CD);m.C(Math.cos(a)*(R+3)+wig,Math.sin(a)*(R+3),z-14,Math.cos(a)*(R+1)-wig,Math.sin(a)*(R+1),z-24,1,.5,CL)}m.E(0,0,z+3,15.5,15.5,10.5,T,1);m.E(0,0,z-3,16.5,16.5,3.2,CL);m.S(3,0,z+4,5,[1,.82,.38],2);m.S(9,-6,z+8,2,CR,1);m.S(8,7,z+7,2.4,CR,1)};
 // ---------- 확장 유닛 ----------
 UN.gpt_scout=(m,T,f)=>{const z=15+sw(f.t)*1.4;m.E(0,0,z,10,7.5,4,W,1);m.E(3,0,z+3.5,4.6,4,2.8,T,2);m.R(0,0,z-3,9,1.1,T,2);for(const q of[-1,1]){m.X(-7,q*8,z+1,4.5,1.1,3.2,.6,q*.5,GR,1);m.S(10,q*3,z,1.6,W,1)}m.C(-5,0,z+3,-9,0,z+13,.7,.4,GR,1);m.S(-9,0,z+13.5,1.4,T,2)};
 UN.gpt_heal=(m,T,f)=>{const z=sw(f.t)*1.3;m.C(0,0,4+z,0,0,24+z,9,4.6,W,1);m.E(.5,0,30+z,4.4,4.4,5.2,W,1);m.X(4.6,0,31+z,.6,2.8,1,.3,0,T,2);m.R(0,0,38+z,6.4,.9,T,2);for(const q of[-1,1]){m.S(0,q*7,24+z,3,GR,1);m.C(0,q*7.5,23+z,8,q*7,17+z,1.3,1,W,1)}m.C(10,6,3+z,10,6,34+z,.9,.7,GR,1);m.S(10,6,37+z,3.8,T,2);m.R(0,0,8+z,11,1,T,2)};
 UN.gpt_ram=(m,T,f)=>{const rock=f.walk?sw(f.t)*2:0;for(const q of[-1,1])for(const x of[-13,13]){m.C(x,q*12,6,x,q*18,6,6,6,GR,1)}m.X(0,0,13,20,12,6,3,0,W,1);m.X(-4,0,21,12,9,4,2.4,0,GR,1);m.C(-14+rock,0,24,18+rock,0,24,8.5,8,W,1);m.C(18+rock,0,24,37+rock,0,24,7.5,1.4,T,1);for(const x of[-8,2,12])m.R(x+rock,0,24,9,1.3,T,2,1);m.S(-16+rock,0,24,8,GR,1)};
 UN.gpt_trans=(m,T,f)=>{const z=44+sw(f.t)*1.4;m.C(-22,0,z,20,0,z,10,7,W,1);m.E(11,0,z+4,10,6,4,T,2);for(const q of[-1,1]){m.X(-4,q*17,z,14,8,1.6,.8,q*.15,W,1);m.Y(-4,q*24,z-5,z+3,6,GR,1);m.Y(-4,q*24,z-6,z-5,4.4,T,2);m.X(-24,q*8,z+6,6,1.1,7,.6,q*.4,GR,1)}m.X(0,0,z-9,12,7,2,1,0,GR,1);m.S(-26,0,z,4.5,T,2)};
 UN.gem_scout=(m,T,f)=>{const lean=f.walk?sw(f.t)*.6:0;for(const x of[-11,11]){m.R(x,0,7,6.6,1.9,DK,0,1,Math.PI/2);m.C(x,-1.2,7,x,1.2,7,2.4,2.4,ST,1)}m.C(-11,0,8,4,0,17,2,1.8,ST,1);m.C(11,0,8,6,0,20,1.5,1.3,GM,1);m.E(-1,0,17,9,4.5,4.5,T,1);m.E(-6,lean,23,3.6,3.8,5.4,GM,1);m.S(-3,lean,30,3.2,ST,1);m.X(-.3,lean,30.4,.5,2.2,1,.2,0,[.5,1,.95],2);m.C(-4,lean,25,6,lean,21,1,.9,GM,1);m.X(-13,0,16,4,4,2,.6,0,GM,1);for(const q of[-1,1])m.C(7,q*3,20,10,q*7,23,.7,.7,ST,1)};
 UN.gem_heal=(m,T,f)=>{const z=34+sw(f.t)*1.5;m.E(0,0,z,8,8,5,T,1);m.Y(0,0,z+4,z+9,2,DK);m.R(0,0,z+9,11,.9,ST,1);m.E(0,0,z+9,10,10,.4,[.55,.65,.8],1);for(const q of[-1,1]){m.C(2,q*6,z-3,9,q*8,z-10,1.2,1,HZ,1);m.S(9,q*8,z-11,1.8,[1,.8,.35],2)}m.X(-7,0,z,3,3.4,2.6,.8,0,GM,1);m.S(5,0,z+1,2.2,[.5,1,.95],2)};
 UN.gem_how=(m,T,f)=>{for(const q of[-1,1]){m.X(0,q*12,6,17,4.2,6,2.2,0,DK);for(let i=-2;i<=2;i++)m.C(i*6.3,q*9,6.2,i*6.3,q*16,6.2,4.2,4.2,ST,1)}m.X(-2,0,14,15,9.5,5.5,1.6,0,T,1);m.Y(-5,0,19,27,8,GM,1);m.C(-6,0,26,34,0,50,4,2.6,ST,1);m.R(34,0,50,3.2,1.2,HZ,1,1);m.C(-6,0,26,14,0,38,6,5,GM,1);m.X(-13,0,24,4,6,5,1,0,GM,1);for(const q of[-1,1])m.C(-16,q*8,10,-30,q*16,2,1.8,1.4,HZ,1)};
 UN.gem_trans=(m,T,f)=>{const z=46+sw(f.t)*1.4;m.C(-20,0,z,18,0,z,10,9,T,1);m.E(19,0,z+2,7,8,6,[.5,.95,1],2);m.X(0,0,z-9,16,7,2,1,0,GM,1);for(const x of[-22,22]){m.Y(x,0,z+6,z+14,3.4,DK);m.E(x,0,z+15,23,23,.5,[.55,.65,.8],1);m.R(x,0,z+15,23,.9,ST,1)}for(const q of[-1,1]){m.X(-26,q*11,z+2,5,1.2,6,.6,q*.4,GM,1);m.X(2,q*10.5,z-1,12,.6,4,.2,0,HZ,1)}};
 UN.cla_scout=(m,T,f)=>{legs(m,3,13,6,CD,f.walk?f.t:0,1);m.E(0,0,9,7,5,4,CL);m.E(-6,0,10,7,5.4,4.4,T,1);for(const q of[-1,1]){m.C(5,q*2,11,10,q*5,21,.7,.5,CD);m.S(10,q*5,22,1.7,[1,.92,.55],2);m.C(-11,q*2,10,-18,q*5,15,.6,.3,CR,1)}};
 UN.cla_heal=(m,T,f)=>{legs(m,2,13,7,CD,f.walk?f.t:0,1.4);m.E(0,0,16,11,11,11,CL);for(let i=0;i<6;i++){const a=i/6*TAU;m.E(Math.cos(a)*9,Math.sin(a)*9,20+((i%2)*4),3.6,3.6,4.6,[1,.76,.28],2)}m.S(0,0,29,6,[1,.86,.46],2);m.C(0,0,24,0,0,34,1.2,.6,CR,1)};
 UN.cla_acid=(m,T,f)=>{legs(m,3,20,8,CD,f.walk?f.t:0,1.8);m.E(-14,0,12,12,11,9,CL);m.E(1,0,14,11,12,10,CL);m.E(-6,0,28,12,12,11,[.62,.86,.2],2);m.E(13,0,14,8,9,8,CD);m.C(13,0,17,f.atk?32:27,0,f.atk?34:30,3.6,2.1,CL);m.S(f.atk?33:28,0,f.atk?35:31,2.6,[.72,1,.25],2);for(const q of[-1,1])m.S(16,q*5,19,1.8,[1,.9,.5],2)};
 UN.cla_carry=(m,T,f)=>{const z=46+sw(f.t)*2;m.E(0,0,z+5,23,17,12,CL);m.E(0,0,z+10,14,11,6,T,1);for(let i=0;i<6;i++){const a=i/6*TAU;m.E(Math.cos(a)*19,Math.sin(a)*14,z+3,3,3,3.4,[1,.8,.32],2);m.C(Math.cos(a)*17,Math.sin(a)*12,z-5,Math.cos(a)*16+sw(f.t+i*.2)*3,Math.sin(a)*11,z-22,1.3,.5,CD)}m.E(0,0,z-14,13,11,9,CD);m.E(0,0,z-12,7,6,5,[1,.74,.25],2)};
 // ---------- 건물 ----------
 const gptPlate=(m,hx,hy,T)=>{m.X(0,0,1.6,hx-2,hy-2,1.6,5,0,GR,1);m.X(0,0,3.6,hx-7,hy-7,.8,4,0,W,1)};
 const gemPlate=(m,hx,hy)=>{m.X(0,0,1.8,hx-1,hy-1,1.8,1,0,GM,1);const HD=[.55,.45,.14];for(const[x,y,w,h]of[[0,hy-2.4,hx-2,.6],[0,-hy+2.4,hx-2,.6],[hx-2.4,0,.6,hy-2],[-hx+2.4,0,.6,hy-2]])m.X(x,y,3.7,w,h,.3,.1,0,HD,1)};
 const claMound=(m,hx,hy,z)=>{m.E(0,0,2,hx*1.02,hy*1.02,z,CD)};
 // 신규 유닛의 2D 대체 모양은 비슷한 역할의 기존 모양을 쓴다
 for(const [a,b] of [['gpt_lance','gpt_arch'],['gpt_wing','gpt_scout'],['gpt_ark','gpt_ship'],['gem_aa','gem_scout'],['gem_mech','gem_text'],['gem_bomb','gem_drone'],['cla_leech','cla_spine'],['cla_brood','cla_acid'],['cla_wing','cla_spore']])UN[a]=(m,T,f)=>UN[b](m,T,f);
 const BM={};
 BM.gpt_hq=(m,T)=>{gptPlate(m,62,62,T);m.E(0,0,10,50,50,42,W,1);m.R(0,0,12,52,3,T,2);m.R(0,0,34,38,2.2,T,2);m.Y(0,0,48,60,16,W,1);m.E(0,0,62,17,17,14,T,2);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){m.C(a*44,b*44,3,a*44,b*44,44,5.5,2.2,W,1);m.S(a*44,b*44,47,4.4,T,2)}m.X(50,0,16,7,17,13,3,0,DK,1);m.X(55,0,16,1.5,13,10,.6,0,T,2)};
 BM.gpt_sup=(m,T)=>{gptPlate(m,30,30,T);for(const[x,y,h]of[[-9,-9,42],[10,-7,30],[-3,11,35]]){m.C(x,y,5,x,y,h,8,3.2,W,1);m.S(x,y,h+5,4.3,T,2);m.R(x,y,h*.55,7.5,1,T,2)}};
 BM.gpt_bar=(m,T)=>{gptPlate(m,46,46,T);m.X(-10,0,22,20,36,18,7,0,W,1);m.C(-10,0,40,-10,0,62,20,8,W,1);m.R(16,0,28,23,5,W,1,1);m.R(16,0,28,17,1.7,T,2,1);m.E(15,0,28,1.5,15,15,T,2);for(const q of[-1,1]){m.C(-30,q*30,4,-30,q*30,46,4.4,2.2,GR,1);m.S(-30,q*30,49,3.3,T,2)}};
 BM.gpt_tech=(m,T)=>{gptPlate(m,46,46,T);m.C(0,0,6,0,0,76,27,9,W,1);m.E(0,0,84,11,11,12,T,2);for(const[z,R]of[[28,33],[50,26],[70,18]])m.R(0,0,z,R,1.8,T,2);for(let i=0;i<3;i++){const a=i/3*TAU+.5;m.S(Math.cos(a)*33,Math.sin(a)*33,28,3.6,W,1);m.C(Math.cos(a)*32,Math.sin(a)*32,4,Math.cos(a)*22,Math.sin(a)*22,30,4,2,GR,1)}};
 BM.gpt_twr=(m,T)=>{gptPlate(m,30,30,T);m.C(0,0,5,0,0,28,13,6,W,1);m.R(0,0,31,14,1.7,T,2);m.S(0,0,42,10,T,2);m.R(0,0,42,14,1.2,W,1,1)};
 BM.gpt_ext=(m,T)=>{m.R(0,0,6,42,8,W,1);m.R(0,0,10,33,1.6,T,2);for(let i=0;i<4;i++){const a=i/4*TAU+.78;m.C(Math.cos(a)*40,Math.sin(a)*40,8,Math.cos(a)*7,Math.sin(a)*7,50,4,1.8,W,1)}m.C(0,0,8,0,0,50,6,4,T,2);m.E(0,0,53,12,12,8,W,1)};
 BM.gem_hq=(m,T)=>{gemPlate(m,63,63);m.X(-14,-8,28,38,44,24,3,0,GM,1);m.X(-14,-8,56,29,34,6,2,0,T,1);m.X(32,28,18,24,26,14,2,0,ST,1);for(const[x,y]of[[-36,-34],[-20,-34],[-4,-34]])m.Y(x,y,50,88,6,DK,1);for(const[x,y]of[[-36,-34],[-20,-34],[-4,-34]])m.Y(x,y,87,90,4.3,[1,.45,.2],2);m.Y(32,28,32,44,5,GM);m.E(32,28,52,19,19,7,ST,1);m.E(35,26,58,8,8,2.6,[.5,.95,1],2);for(let i=0;i<4;i++)m.X(-52+i*22,36,11,7,5,3,.6,0,[.45,1,.9],2);m.X(24,-14,22,15,17,20,2,0,GM,1);m.X(39.8,-14,22,.6,12,10,.2,0,[.5,.9,1],2)};
 BM.gem_sup=(m,T)=>{gemPlate(m,31,31);for(const[x,y,z,w]of[[-10,-9,11,13],[12,-9,11,13],[-10,14,11,13],[12,14,11,13],[-9,-8,30,12],[12,12,30,11]]){m.X(x,y,z,w,9,8,1,0,z>20?T:ST,1)}m.S(12,12,41,2.2,[1,.35,.2],2);m.S(-9,-8,41,2.2,[.4,1,.75],2)};
 BM.gem_bar=(m,T)=>{gemPlate(m,47,47);m.X(-8,0,24,34,40,21,2.5,0,GM,1);m.C(-8,-34,44,-8,34,44,20,20,T,1);m.X(27,0,18,1.5,26,15,.6,0,DK,1);m.X(36,0,3.7,12,26,.5,.2,0,[.55,.6,.65],1);for(let i=0;i<3;i++)m.X(26,-22+i*22,38,1.4,6,3.2,.4,0,[[.45,1,.6],[1,.75,.2],[.5,.8,1]][i],2);m.Y(-30,-30,44,66,5,DK,1)};
 BM.gem_tech=(m,T)=>{gemPlate(m,47,47);m.X(-6,4,20,32,34,17,3,0,GM,1);m.Y(-6,4,36,48,16,T,1);m.E(-6,4,55,24,24,17,ST,1);m.X(14,4,55,.8,10,4,.2,0,[.5,1,1],2);m.C(27,-27,4,27,-27,60,3,1.6,ST,1);m.C(27,-27,60,45,-27,70,1.7,1.2,ST,1);m.E(46,-27,70,2,11,11,HZ,1)};
 BM.gem_twr=(m,T)=>{gemPlate(m,31,31);m.Y(0,0,4,26,13,GM,1);m.X(0,0,31,12,10,7,2,0,T,1);for(const q of[-1,1])m.C(9,q*5,33,29,q*5,33,2.4,1.8,DK,1);m.X(-11,0,41,1,1,8,.3,0,ST,1);m.S(-11,0,50,2.2,[1,.3,.2],2)};
 BM.gem_ext=(m,T)=>{gemPlate(m,47,47);m.Y(0,0,4,14,28,GM,1);m.Y(0,0,14,17,23,[.45,1,.95],2);for(const q of[-1,1]){m.C(-30,q*27,4,0,q*5,60,3.2,2,ST,1);m.C(30,q*27,4,0,q*5,60,3.2,2,ST,1)}m.Y(0,0,17,60,9,T,1);m.X(0,0,62,16,11,5.2,1,0,HZ,1)};
 BM.cla_hq=(m,T)=>{m.Y(0,0,0,3,63,CD);claMound(m,62,62,44);m.E(-4,-2,26,47,46,50,CL);m.E(-2,-1,67,23,22,22,T,1);m.E(-1,-1,84,11,11,10,[1,.82,.36],2);for(let i=0;i<7;i++){const a=i/7*TAU+.3;m.E(Math.cos(a)*40,Math.sin(a)*40,32,6.5,6.5,21,[.97,.58,.16],2,a);m.E(Math.cos(a)*58,Math.sin(a)*58,14,10,10,15,CL)}};
 BM.cla_sup=(m,T)=>{claMound(m,30,30,12);m.E(0,0,20,21,21,26,CL);m.E(11,-9,10,13,12,15,CL);m.E(-11,9,12,11,12,17,CL);m.E(0,0,47,8,8,6,[1,.82,.36],2);m.E(4,4,28,16,16,16,T,1);for(let i=0;i<3;i++)m.R(0,0,10+i*12,21-i*2,1.3,CR,1)};
 BM.cla_bar=(m,T)=>{claMound(m,46,46,20);m.E(-10,0,30,32,38,38,CL);m.E(21,-22,20,18,15,20,CD);m.E(22,20,20,18,15,20,CD);m.E(19,0,20,20,18,20,T,1);m.E(36,0,20,3,13,14,[1,.84,.38],2);m.E(-12,0,68,14,14,10,CR,1);for(const[x,y]of[[-30,-29],[-34,24],[-14,36]])m.E(x,y,18,7,7,13,[.97,.58,.16],2)};
 BM.cla_tech=(m,T)=>{claMound(m,46,46,16);m.C(0,0,12,0,0,58,22,8,CL);const B=[[0,1],[2.1,1],[4.2,1]];for(const [a]of B){const dx=Math.cos(a),dy=Math.sin(a);m.C(0,0,44,dx*26,dy*26,66,6,3.4,CL);m.S(dx*28,dy*28,71,10,T,1);m.S(dx*30,dy*30,75,3.8,[1,.85,.4],2)}m.S(0,0,75,12,CR,1);m.S(2,-2,82,5,[1,.85,.4],2)};
 BM.cla_twr=(m,T)=>{claMound(m,30,30,10);m.C(0,0,6,0,0,27,14,8,CL);m.E(0,0,34,14,14,9,T,1);m.S(5,0,39,5,[1,.84,.38],2);for(let i=0;i<5;i++){const a=i/5*TAU;m.C(Math.cos(a)*11,Math.sin(a)*11,37,Math.cos(a)*23,Math.sin(a)*23,54,3,.7,CR,1)}};
 BM.cla_ext=(m,T)=>{claMound(m,46,46,12);for(let i=0;i<5;i++){const a=i/5*TAU+.2;m.C(Math.cos(a)*40,Math.sin(a)*40,8,Math.cos(a)*14,Math.sin(a)*14,26,7,5,CL)}m.E(0,0,30,22,22,20,T,1);m.E(0,0,46,10,10,8,[1,.83,.4],2);m.E(0,0,15,16,16,8,[.45,.95,1],2)};
 // ---------- 자원·장식 ----------
 const pcb=(m,sd)=>{const a=(i)=>Math.sin(sd*7.1+i*3.3);m.X(0,0,3,30,13.5,2.8,.6,0,DK,1);for(let i=0;i<3;i++){const x=-18+i*18,h=11+a(i)*4;m.X(x+a(i+3)*2,0,3+h,7,8.5,h,.8,a(i+6)*.2,PCB,1);m.X(x+a(i+3)*2,0,3+h*2+1,4.8,6,1.1,.4,a(i+6)*.2,[.55,1,.86],2);for(const q of[-1,1])m.X(x+a(i+3)*2,q*9,4+h*.7,5,.5,h*.6,.2,0,GD,1)}};
 BM.res_d=m=>{m.S(0,0,2,2,DK,1)};BM.dd_pylon=m=>{m.C(-30,0,2,26,0,12,1.3,1,GM,1)};BM.dd_dish=m=>{m.E(8,0,26,3,17,15,ST,1)};BM.dd_shard=m=>{m.E(0,0,2,6,5,3,PCB,1)};
 BM.res_c0=m=>pcb(m,1);BM.res_c1=m=>pcb(m,2);BM.res_c2=m=>pcb(m,3);
 BM.dd_rack=m=>{m.X(0,0,24,12,14,24,1.2,.3,GM,1);for(let i=0;i<6;i++)m.X(11.8*Math.cos(.3),11.8*Math.sin(.3),8+i*6.3,.8,10,2,.2,.3,i%2?[.45,1,.8]:[.2,.28,.36],i%2?2:1)};
 BM.dd_fan=m=>{m.X(0,0,3,13,20,3,1,.4,GM,1);m.X(0,0,20,2.6,20,17,1.2,.5,GM,1);m.X(2.8,0,20,.5,15,14,.3,.5,DK,1);m.S(3.4,0,20,3.6,ST,1);for(let i=0;i<7;i++){const a=i/7*TAU;m.X(3.2,Math.cos(a)*8,20+Math.sin(a)*8,.5,6.6,2.4,.3,a,ST,1)}m.X(3,16,33,.7,2,1.2,.2,0,[.9,.3,.15],2)};
 BM.dd_cable=m=>{for(let i=0;i<4;i++){m.R(i*5-7,i%2*6,2.5+i*2.4,13-i,2.2,[.2,.25,.3][i%3]?[.7,.42,.16]:DK,1)}};

 function bounds(L){let R=0,Z=0;for(const p of L){let cx,cy,cz,br;
  if(p.t===1){cx=(p.x+p.a)/2;cy=(p.y+p.b)/2;cz=(p.z+p.c)/2;br=Math.hypot(p.a-p.x,p.b-p.y,p.c-p.z)/2+Math.max(p.d,p.e)}
  else if(p.t===0){cx=p.x;cy=p.y;cz=p.z;br=p.a}
  else if(p.t===2){cx=p.x;cy=p.y;cz=p.z;br=Math.hypot(p.a,p.b,p.c)+p.d}
  else if(p.t===3){cx=p.x;cy=p.y;cz=p.z;br=Math.max(p.a,p.b,p.c)}
  else if(p.t===4){cx=p.x;cy=p.y;cz=(p.z+p.a)/2;br=Math.hypot((p.a-p.z)/2,p.b)}
  else{cx=p.x;cy=p.y;cz=p.z;br=p.a+p.b}
  p.bx=cx;p.by=cy;p.bz=cz;p.br=br;R=Math.max(R,Math.hypot(cx,cy)+br);Z=Math.max(Z,cz+br)}return[R,Z]}
 function rotated(L,th){const c=Math.cos(th),s=Math.sin(th);return L.map(p=>{const q=Object.assign({},p);const r=(x,y)=>[x*c-y*s,x*s+y*c];
  [q.x,q.y]=r(p.x,p.y);if(p.t===1)[q.a,q.b]=r(p.a,p.b);[q.bx,q.by]=r(p.bx,p.by);const rr=p.rot+th;q.rot=rr;q.cr=Math.cos(rr);q.sr=Math.sin(rr);return q})}
 function sd(p,x,y,z){
  switch(p.t){
   case 0:{const a=x-p.x,b=y-p.y,c=z-p.z;return Math.sqrt(a*a+b*b+c*c)-p.a}
   case 1:{const ax=p.a-p.x,ay=p.b-p.y,az=p.c-p.z,px=x-p.x,py=y-p.y,pz=z-p.z,l=ax*ax+ay*ay+az*az;let h=l>0?(px*ax+py*ay+pz*az)/l:0;h=h<0?0:h>1?1:h;const dx=px-ax*h,dy=py-ay*h,dz=pz-az*h;return Math.sqrt(dx*dx+dy*dy+dz*dz)-(p.d+(p.e-p.d)*h)}
   case 2:{const X=x-p.x,Y=y-p.y,lx=Math.abs(X*p.cr+Y*p.sr)-p.a+p.d,ly=Math.abs(-X*p.sr+Y*p.cr)-p.b+p.d,lz=Math.abs(z-p.z)-p.c+p.d;const a=lx>0?lx:0,b=ly>0?ly:0,c=lz>0?lz:0,m=Math.max(lx,ly,lz);return Math.sqrt(a*a+b*b+c*c)+(m<0?m:0)-p.d}
   case 3:{const X=x-p.x,Y=y-p.y,Z=z-p.z,lx=(X*p.cr+Y*p.sr),ly=(-X*p.sr+Y*p.cr);const k0=Math.sqrt((lx/p.a)**2+(ly/p.b)**2+(Z/p.c)**2),k1=Math.sqrt((lx/(p.a*p.a))**2+(ly/(p.b*p.b))**2+(Z/(p.c*p.c))**2);return k1===0?-Math.min(p.a,p.b,p.c):k0*(k0-1)/k1}
   case 4:{const X=x-p.x,Y=y-p.y,dr=Math.sqrt(X*X+Y*Y)-p.b,mid=(p.z+p.a)/2,dz=Math.abs(z-mid)-(p.a-p.z)/2,a=dr>0?dr:0,b=dz>0?dz:0;return Math.min(Math.max(dr,dz),0)+Math.sqrt(a*a+b*b)-(0)}
   default:{let X=x-p.x,Y=y-p.y,Z=z-p.z;if(p.c){const l=X*p.cr+Y*p.sr,w=-X*p.sr+Y*p.cr;X=Z;Y=w;Z=l}const q=Math.sqrt(X*X+Y*Y)-p.a;return Math.sqrt(q*q+Z*Z)-p.b}
  }
 }
 function field(list,x,y,z,k,out){
  let d=1e9,idx=-1;
  for(let i=0;i<list.length;i++){const v=sd(list[i],x,y,z);
   if(k>0&&d<1e8){const h=Math.max(k-Math.abs(d-v),0)/k,mix=h*h*k*.25;if(v<d){idx=i;d=v-mix}else d=d-mix}
   else if(v<d){d=v;idx=i}}
  if(out)out[0]=idx;return d;
 }
 function renderCell(buf,W2,cx0,cy0,cw,ch,ax,ay,S,L0,theta,team,smooth,opts){
  const L=rotated(L0,theta),[R,Z]=[opts.R,opts.Z],dz=Math.sqrt(1+KY*KY),ddy=-KY/dz,ddz=-1/dz;
  const pad=opts.noShadow?0:1,cs=[];
  const BLK=8,bw=Math.ceil(cw/BLK),bh=Math.ceil(ch/BLK),lists=new Array(bw*bh),shLists=new Array(bw*bh);
  for(let j=0;j<bh;j++)for(let i=0;i<bw;i++){const sx=((i+.5)*BLK-ax)/S,sy=((j+.5)*BLK-ay)/S,r=BLK*.72/S+smooth+1.5,l=[];
   const sl=[];const ldx=LX,ldy=LY-LZ*KY,ll=Math.hypot(ldx,ldy);
   for(const p of L){const qx=p.bx,qy=p.by-p.bz*KY,dd=Math.hypot(sx-qx,sy-qy);if(dd<p.br+r)l.push(p);const vx=qx-sx,vy=qy-sy,along=(vx*ldx+vy*ldy)/ll,perp=Math.abs(vx*ldy-vy*ldx)/ll;if(along>-p.br-r&&perp<p.br+r+smooth)sl.push(p)}lists[i+j*bw]=l;shLists[i+j*bw]=sl}
  const idxO=[0],mask=new Uint8Array(cw*ch);
  const shadowL=new Float32Array(cw*ch);
  const Zt=Z+3;
  for(let py=0;py<ch;py++)for(let px=0;px<cw;px++){
   const sx=(px+.5-ax)/S,sy=(py+.5-ay)/S,li=lists[(px>>3)+(py>>3)*bw];
   let hit=false,t=0,ox=sx,oy=sy+Zt*KY,oz=Zt,tEnd=Zt*dz,x=0,y=0,z=0;
   if(li.length){for(let s=0;s<36;s++){x=ox;y=oy+ddy*t;z=oz+ddz*t;const d=field(li,x,y,z,smooth,null);if(d<.12){hit=true;break}t+=d*.9;if(t>tEnd)break}}
   const O=((cy0+py)*W2+cx0+px)*4;
   if(hit){
    field(li,x,y,z,smooth,idxO);const P=li[idxO[0]];const e=.35;
    const d1=field(li,x+e,y-e,z-e,smooth,null),d2=field(li,x-e,y-e,z+e,smooth,null),d3=field(li,x-e,y+e,z-e,smooth,null),d4=field(li,x+e,y+e,z+e,smooth,null);
    let nx=d1-d2-d3+d4,ny=-d1-d2+d3+d4,nz=-d1+d2-d3+d4;const nl=Math.hypot(nx,ny,nz)||1;nx/=nl;ny/=nl;nz/=nl;
    let col=[P.c0,P.c1,P.c2];if(P.c0===team[0]&&P.c1===team[1]&&P.c2===team[2])col=team;
    let cr,cg,cb;
    if(P.m===2){const g=Math.max(0,nx*0+ny*-ddy+nz*-ddz)*.28+.86;cr=col[0]*g+.28*g;cg=col[1]*g+.24*g;cb=col[2]*g+.2*g;if(opts.emit){const E=opts.emit,o2=O;E[o2]=Math.min(255,cr*255);E[o2+1]=Math.min(255,cg*255);E[o2+2]=Math.min(255,cb*255);E[o2+3]=255}}
    else{
     let diff=nx*LX+ny*LY+nz*LZ;diff=Math.max(0,diff);
     let sh=1;if(diff>0){let ts=1.6;const sx2=x+nx*.6,sy2=y+ny*.6,sz2=z+nz*.6;for(let s=0;s<8;s++){const d=field(shLists[(px>>3)+(py>>3)*bw],sx2+LX*ts,sy2+LY*ts,sz2+LZ*ts,smooth,null);if(d<.05){sh=.15;break}sh=Math.min(sh,.15+7*d/ts);ts+=Math.max(1.2,d);if(ts>58)break}}
     const a1=field(li,x+nx*4,y+ny*4,z+nz*4,smooth,null),ao=Math.max(.34,Math.min(1,.42+a1/6.5));
     const sky=(.5+.5*nz);
     const rx=-2*(nx*LX+ny*LY+nz*LZ)*nx+LX,ry=-2*(nx*LX+ny*LY+nz*LZ)*ny+LY,rz=-2*(nx*LX+ny*LY+nz*LZ)*nz+LZ,vd=Math.max(0,rx*0+ry*ddy+rz*ddz);
     const spec=P.m===1?Math.pow(vd,22)*.72*sh:Math.pow(vd,8)*.1*sh,rim=Math.pow(1-Math.max(0,ny*-ddy+nz*-ddz),3)*.24;
     const lg=(diff*sh*1.2+(sky*.36+.1)*ao);
     cr=col[0]*lg+spec+rim*.55;cg=col[1]*lg+spec+rim*.65;cb=col[2]*lg+spec+rim*.8;
    }
    const g=v=>Math.round(255*Math.pow(Math.min(1,Math.max(0,v)),.82));
    buf[O]=g(cr);buf[O+1]=g(cg);buf[O+2]=g(cb);buf[O+3]=255;mask[px+py*cw]=1;
   }
  }
  if(pad){
   const sw2=Math.ceil(cw/2),sh2=Math.ceil(ch/2),sg=new Float32Array(sw2*sh2);
   const disc=(wx,wy,wz,r)=>{const gx=wx+.68*wz,gy=wy+.626*wz,cx=(gx*S+ax)/2,cy=(gy*S+ay)/2,rr=r*S/2,x0=Math.max(0,Math.floor(cx-rr)),x1=Math.min(sw2-1,Math.ceil(cx+rr)),y0=Math.max(0,Math.floor(cy-rr)),y1=Math.min(sh2-1,Math.ceil(cy+rr));for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const d=Math.hypot(x+.5-cx,y+.5-cy);if(d<=rr)sg[x+y*sw2]=1}};
   for(const p of L){
    if(p.t===0)disc(p.x,p.y,p.z,p.a);
    else if(p.t===1){const len=Math.hypot(p.a-p.x,p.b-p.y,p.c-p.z),n=Math.max(1,Math.ceil(len/Math.max(1.5,Math.min(p.d,p.e)*1.4)));for(let i=0;i<=n;i++){const h=i/n;disc(p.x+(p.a-p.x)*h,p.y+(p.b-p.y)*h,p.z+(p.c-p.z)*h,p.d+(p.e-p.d)*h)}}
    else if(p.t===2){const st=Math.max(2,Math.min(6,p.a,p.b)),nx=Math.ceil(p.a/st),ny=Math.ceil(p.b/st),nz=Math.max(1,Math.ceil(p.c/8));for(let i=-nx;i<=nx;i++)for(let j=-ny;j<=ny;j++)for(let k=-nz;k<=nz;k++){const lx=i/nx*(p.a-st*.55),ly=j/ny*(p.b-st*.55);disc(p.x+lx*p.cr-ly*p.sr,p.y+lx*p.sr+ly*p.cr,p.z+k/nz*p.c,st*.8)}}
    else if(p.t===3){const n=Math.ceil(p.c/Math.max(2,Math.min(p.a,p.b)*.5));for(let k=-n;k<=n;k++){const h=k/n,f=Math.sqrt(1-h*h*.85);disc(p.x,p.y,p.z+p.c*h,Math.max(p.a,p.b)*f*.92)}}
    else if(p.t===4){const n=Math.max(1,Math.ceil((p.a-p.z)/Math.max(3,p.b)));for(let i=0;i<=n;i++)disc(p.x,p.y,p.z+(p.a-p.z)*i/n,p.b)}
    else{const n=14;for(let i=0;i<n;i++){const a=i/n*TAU,c=Math.cos(a)*p.a,d=Math.sin(a)*p.a;if(p.c)disc(p.x-d*p.sr,p.y+d*p.cr,p.z+c,p.b*1.6);else disc(p.x+c,p.y+d,p.z,p.b*1.6)}}
   }
   for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){if(mask[x+y*cw])continue;let v=0;const X=x>>1,Y=y>>1;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const q=X+a,w=Y+b;if(q>=0&&w>=0&&q<sw2&&w<sh2)v+=sg[q+w*sw2]}v/=9;if(v>.01){const O=((cy0+y)*W2+cx0+x)*4;buf[O]=8;buf[O+1]=10;buf[O+2]=14;buf[O+3]=v*132}}
  }
  for(let y=1;y<ch-1;y++)for(let x=1;x<cw-1;x++){if(mask[x+y*cw])continue;if(mask[x-1+y*cw]|mask[x+1+y*cw]|mask[x+(y-1)*cw]|mask[x+(y+1)*cw]){const O=((cy0+y)*W2+cx0+x)*4;buf[O]=7;buf[O+1]=9;buf[O+2]=12;buf[O+3]=Math.max(buf[O+3],175)}}
 }
 for(const [a,b] of [['gpt_adv','gpt_tech'],['gpt_aura','gpt_sup'],['gem_adv','gem_tech'],['gem_aura','gem_sup'],['cla_adv','cla_tech'],['cla_aura','cla_sup']])BM[a]=(m,T)=>BM[b](m,T);
 const DIR=[0,Math.PI/4,Math.PI/2,-Math.PI/4,-Math.PI/2];
 const FR={gpt_w:[0,1,2],gpt_guard:0,gpt_arch:0,gpt_tf:[0,0],gpt_ship:[0,.5],gem_w:[0,.5],gem_text:0,gem_vision:0,gem_audio:'tank',gem_drone:[0,.25,.5,.75],cla_w:0,cla_swarm:0,cla_spine:0,cla_beast:0,cla_spore:[0,.3,.6],gpt_scout:[0,.5],gpt_heal:[0,.5],gpt_ram:[0,.5],gpt_trans:[0,.5],gem_scout:[0,.5],gem_heal:[0,.25,.5,.75],gem_how:[0,.5],gem_trans:[0,.25,.5,.75],cla_scout:0,cla_heal:0,cla_acid:0,cla_carry:[0,.4],gpt_lance:0,gpt_wing:[0,.5],gpt_ark:[0,.5],gem_aa:[0,.5],gem_mech:0,gem_bomb:[0,.5],cla_leech:0,cla_brood:0,cla_wing:[0,.3,.6]};
 function framesFor(key){
  const f=FR[key];
  if(f==='tank')return[{walk:1,t:0},{walk:1,t:.5},{dep:1}];
  if(f===0)return[{t:0},{walk:1,t:0},{walk:1,t:1/6},{walk:1,t:2/6},{walk:1,t:.5},{walk:1,t:4/6},{walk:1,t:5/6},{atk:1,t:0}];
  return f.map(t=>({t,walk:1}));
 }
 const SMOOTH={cla:2.4,gpt:.5,gem:0};
 function bakeUnit(key,hex,S){
  const team=rgb(hex),fac=key.slice(0,3),fr=framesFor(key),mod=(fx)=>{const m=B();UN[key](m,team,fx);return m.L};
  let R=0,Z=0;for(const fx of fr){const r=bounds(mod(fx));R=Math.max(R,r[0]);Z=Math.max(Z,r[1])}
  R+=3;Z+=3;
  const sh=Z*.72+4,cw=Math.ceil((2*R+sh+6)*S)+2,ch=Math.ceil((2*R+Z*KY+sh+4)*S)+2,ax=Math.ceil((R+3)*S),ay=Math.ceil((R+Z*KY+2)*S),W2=cw*fr.length,H2=ch*5,buf=new Uint8ClampedArray(W2*H2*4);
  fr.forEach((fx,fi)=>{const L=mod(fx);bounds(L);DIR.forEach((th,di)=>{renderCell(buf,W2,fi*cw,di*ch,cw,ch,ax,ay,S,L,th,team,SMOOTH[fac],{R,Z,bR:R+4,bZ:Z*.5,maxS:Z*1.6+20})})});
  // 초상화
  const PS=Math.min(4.2,62/Math.max(R*.9,Z*.68)),pw=Math.ceil(2*R*PS)+8,ph=Math.ceil((2*R+Z*KY)*PS)+8,pb=new Uint8ClampedArray(pw*ph*4),L=mod(fr[0]);bounds(L);
  renderCell(pb,pw,0,0,pw,ph,Math.round(pw/2),Math.round((R+Z*KY)*PS)+4,PS,L,Math.PI/4,team,SMOOTH[fac],{R,Z,noShadow:1,bR:R,bZ:Z/2,maxS:30});
  return{key,color:hex,kind:'u',S,W2,H2,cw,ch,ax,ay,n:fr.length,buf:buf.buffer,pw,ph,pb:pb.buffer};
 }
 function bloom(E,w,h,rad){
  const n=w*h,ch=[new Float32Array(n),new Float32Array(n),new Float32Array(n)];
  for(let i=0;i<n;i++)if(E[i*4+3]){for(let k=0;k<3;k++)ch[k][i]=E[i*4+k]}
  const out=ch.map(a=>a.slice());
  for(let pass=0;pass<2;pass++)for(const a of out){
   const t=new Float32Array(n);
   for(let y=0;y<h;y++){let s=0;for(let x=-rad;x<=rad;x++)s+=a[Math.max(0,Math.min(w-1,x))+y*w];for(let x=0;x<w;x++){t[x+y*w]=s/(2*rad+1);s+=a[Math.min(w-1,x+rad+1)+y*w]-a[Math.max(0,x-rad)+y*w]}}
   for(let x=0;x<w;x++){let s=0;for(let y=-rad;y<=rad;y++)s+=t[x+Math.max(0,Math.min(h-1,y))*w];for(let y=0;y<h;y++){a[x+y*w]=s/(2*rad+1);s+=t[x+Math.min(h-1,y+rad+1)*w]-t[x+Math.max(0,y-rad)*w]}}
  }
  for(let i=0;i<n;i++){const r=Math.max(ch[0][i],out[0][i]*1.9),g=Math.max(ch[1][i],out[1][i]*1.9),b=Math.max(ch[2][i],out[2][i]*1.9),a=Math.max(r,g,b);if(a<3){E[i*4+3]=0;continue}const q=255/a;E[i*4]=r*q;E[i*4+1]=g*q;E[i*4+2]=b*q;E[i*4+3]=Math.min(255,a)}
 }
 function bakeHero(key,hex){
  const team=rgb(hex),fac=key.slice(0,3),fr=framesFor(key),m=B();UN[key](m,team,fr[0]);const L=m.L,[R,Z]=bounds(L),PS=620/Math.max(2*R,2*R*.5+Z*KY+R),pw=Math.ceil((2*R+8)*PS),ph=Math.ceil((2*R+Z*KY+8)*PS),pb=new Uint8ClampedArray(pw*ph*4);
  renderCell(pb,pw,0,0,pw,ph,Math.round(pw/2),Math.round((R+Z*KY+4)*PS),PS,L,Math.PI/4,team,SMOOTH[fac],{R,Z,noShadow:1,bR:R,bZ:Z/2,maxS:30});
  const b1=new Uint8ClampedArray(4);
  return{key:'hero_'+key,color:hex,kind:'h',S:1,W2:1,H2:1,cw:1,ch:1,ax:0,ay:0,n:1,buf:b1.buffer,pw,ph,pb:pb.buffer,eb:null};
 }
 function bakeBld(key,hex,S){
  const team=hex?rgb(hex):[0,0,0],m=B();BM[key](m,team);const [R,Z]=bounds(m.L);const fac=key.slice(0,3),sh=Z*.72+6;
  const hw=Math.max(...m.L.map(p=>Math.abs(p.bx)+p.br))+3,hh=Math.max(...m.L.map(p=>Math.abs(p.by)+p.br))+3;
  const cw=Math.ceil((2*hw+sh+6)*S),ch=Math.ceil((2*hh+Z*KY+sh+6)*S),ax=Math.ceil((hw+3)*S),ay=Math.ceil((hh+Z*KY+3)*S),buf=new Uint8ClampedArray(cw*ch*4);
  const emit=hex?new Uint8ClampedArray(cw*ch*4):null;
  renderCell(buf,cw,0,0,cw,ch,ax,ay,S,m.L,0,team,SMOOTH[fac]||.3,{R:Math.max(hw,hh),Z,bR:Math.hypot(hw,hh)+4,bZ:Z*.5,maxS:Z*1.7+24,emit});
  if(emit)bloom(emit,cw,ch,Math.round(5*S));
  const PS=Math.min(1.5,72/Math.max(hw,hh)),pw=Math.ceil(2*hw*PS)+8,ph=Math.ceil((2*hh+Z*KY)*PS)+8,pb=new Uint8ClampedArray(pw*ph*4);
  renderCell(pb,pw,0,0,pw,ph,Math.ceil(hw*PS)+4,Math.ceil((hh+Z*KY)*PS)+4,PS,m.L,0,team,SMOOTH[fac]||.3,{R:hw,Z,noShadow:1,bR:hw,bZ:Z/2,maxS:30});
  return{key,color:hex,kind:'b',S,W2:cw,H2:ch,cw,ch,ax,ay,n:1,buf:buf.buffer,pw,ph,pb:pb.buffer,eb:emit?emit.buffer:null};
 }
 // ---------- 지형 ----------
 function bakeTerrain(terrain,level,MW,MH,TS,flat){
  const W3=MW*TS,H3=MH*TS,buf=new Uint8ClampedArray(W3*H3*4),hg=new Float32Array(MW*MH),typ=new Float32Array(MW*MH);
  for(let i=0;i<MW*MH;i++){hg[i]=terrain[i]?1.75:level[i]>0?level[i]:0;typ[i]=terrain[i]?1:0}
  const blurF=a=>{const o=new Float32Array(a.length);for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){let s=0,n=0;for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){const X=x+c,Y=y+b;if(X<0||Y<0||X>=MW||Y>=MH)continue;s+=a[X+Y*MW];n++}o[x+y*MW]=s/n}return o};
  const Hb=blurF(hg),H=new Float32Array(hg.length);for(let i=0;i<H.length;i++)H[i]=hg[i]*.62+Hb[i]*.38;const TY=blurF(typ),LV=blurF(level);
  const samp=(a,x,y)=>{x=Math.max(0,Math.min(MW-1.001,x-.5));y=Math.max(0,Math.min(MH-1.001,y-.5));const X=x|0,Y=y|0,fx=x-X,fy=y-Y,s=fx*fx*(3-2*fx),t=fy*fy*(3-2*fy),A=a[X+Y*MW],Bb=a[Math.min(MW-1,X+1)+Y*MW],C=a[X+Math.min(MH-1,Y+1)*MW],D=a[Math.min(MW-1,X+1)+Math.min(MH-1,Y+1)*MW];return A+(Bb-A)*s+(C-A)*t+(A-Bb-C+D)*s*t};
  const G=new Float32Array(4096);let sd2=1234;for(let i=0;i<4096;i++){sd2=(sd2*16807)%2147483647;G[i]=sd2/2147483647}
  const v=(x,y)=>{const X=Math.floor(x),Y=Math.floor(y),fx=x-X,fy=y-Y,s=fx*fx*(3-2*fx),t=fy*fy*(3-2*fy),g=(a,b)=>G[((a*131+b*2011)&4095+4096)&4095],A=g(X,Y),Bb=g(X+1,Y),C=g(X,Y+1),D=g(X+1,Y+1);return A+(Bb-A)*s+(C-A)*t+(A-Bb-C+D)*s*t};
  const fbm=(x,y)=>v(x,y)*.5+v(x*2.03,y*2.03)*.26+v(x*4.1,y*4.1)*.15+v(x*8.3,y*8.3)*.09;
  const mix=(a,b,t)=>a+(b-a)*t,sat=x=>x<0?0:x>1?1:x;
  for(let py=0;py<H3;py++)for(let px=0;px<W3;px++){
   const tx=px/TS,ty=py/TS,wx=(fbm(tx*.9,ty*.9)-.5)*.5,wy=(fbm(tx*.9+40,ty*.9+9)-.5)*.5,sx=tx+wx,sy=ty+wy,e=.14;
   const h=samp(H,sx,sy),hx=samp(H,sx+e,sy)-samp(H,sx-e,sy),hy=samp(H,sx,sy+e)-samp(H,sx,sy-e),rock=samp(TY,sx,sy),lvl=samp(LV,sx,sy);
   const detail=fbm(tx*3.2,ty*3.2),fine=v(tx*15,ty*15),slope=Math.hypot(hx,hy)/(2*e);
   let nx=-hx/(2*e),ny=-hy/(2*e);const nz=.72,nl=Math.hypot(nx,ny,nz);const dif=sat((nx*-.5+ny*-.46+nz*.735)/nl);
   let r=mix(.33,.45,detail),g=mix(.28,.38,detail),b=mix(.24,.29,detail);
   const soil=sat((fbm(tx*.5+5,ty*.5+8)-.5)*5);r=mix(r,.25,soil*.75);g=mix(g,.21,soil*.75);b=mix(b,.2,soil*.75);
   const plate=sat(lvl*1.4);
   if(plate>0){const gx=Math.abs(((tx%4)+4)%4-2),gy=Math.abs(((ty%4)+4)%4-2),seam=Math.min(gx,gy)<.04?.72:1;const pr=mix(.42,.5,detail)*seam,pg=mix(.42,.49,detail)*seam,pb2=mix(.45,.52,detail)*seam;r=mix(r,pr,plate);g=mix(g,pg,plate);b=mix(b,pb2,plate)}
   let lit=.5+dif*.72;
   const cast=samp(H,sx-.42,sy-.4)-h;if(cast>.2)lit*=1-sat((cast-.2)*1.05)*.62;
   const face=sat((slope-.48)*1.9);
   if(face>0){const st=fbm(tx*9,ty*.6+3),streak=mix(.13,.42,st);const south=sat(-ny/(Math.abs(ny)+Math.abs(nx)+.01))*.2;r=mix(r,streak+.03+south*.2,face);g=mix(g,streak*.85+south*.15,face);b=mix(b,streak*.82+south*.1,face);lit=mix(lit,.5+dif*.9,face)}
   if(rock>.35&&h>1.3){const t2=sat((rock-.35)*3)*sat(1-slope*1.4);const c=fbm(tx*2,ty*2);r=mix(r,.17+c*.12,t2);g=mix(g,.16+c*.1,t2);b=mix(b,.17+c*.1,t2);const vein=Math.abs(fbm(tx*1.7+3,ty*1.7)-.5);if(vein<.0065&&fine>.42){r=mix(r,.72,t2*.8);g=mix(g,.42,t2*.8);b=mix(b,.17,t2*.8)}}
   const crest=sat((slope-.22)*4)*(1-face)*sat((h-.62)*3);r+=crest*.2;g+=crest*.18;b+=crest*.15;
   const foot=sat((slope-.3)*2)*sat(.55-h)*1.2;lit*=1-Math.min(.55,foot);
   if(flat)lit=.9;
   const n2=.92+fine*.16;
   const O=(px+py*W3)*4,tn=x=>Math.round(255*Math.pow(sat(x),.96));buf[O]=tn(r*lit*n2);buf[O+1]=tn(g*lit*n2);buf[O+2]=tn(b*lit*n2);buf[O+3]=255;
  }
  return{w:W3,h:H3,buf:buf.buffer};
 }
 const bakeJob=j=>j.kind==='u'?bakeUnit(j.key,j.color,j.S):j.kind==='h'?bakeHero(j.key,j.color):bakeBld(j.key,j.color,j.S);
 return{bakeUnit,bakeBld,bakeHero,bakeJob,bakeTerrain,B,UN,BM,framesFor,rgb};
}
const BakeWorkerSrc=`const RT=(${bakeRuntime.toString()})();
onmessage=e=>{const m=e.data;
 if(m.t==='terrain'){const r=RT.bakeTerrain(new Uint8Array(m.terrain),new Float32Array(m.level),m.MW,m.MH,m.TS,m.flat);postMessage({t:'terrain',r},[r.buf]);return}
 for(const j of m.jobs){const r=RT.bakeJob(j);postMessage({t:'sheet',r},r.eb?[r.buf,r.pb,r.eb]:[r.buf,r.pb])}
 postMessage({t:'done',id:m.id})};`;
const Sprites={
 map:new Map(),port:new Map(),
 k(key,color){return key+'|'+(color||'')},
 add(r){
  const cv=document.createElement('canvas');cv.width=r.W2;cv.height=r.H2;cv.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(r.buf),r.W2,r.H2),0,0);
  const pc=document.createElement('canvas');pc.width=r.pw;pc.height=r.ph;pc.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(r.pb),r.pw,r.ph),0,0);
  let ec=null;if(r.eb){ec=document.createElement('canvas');ec.width=r.W2;ec.height=r.H2;ec.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(r.eb),r.W2,r.H2),0,0)}
  const o=Object.assign({},r,{cv,pc,ec});delete o.buf;delete o.pb;delete o.eb;this.map.set(this.k(r.key,r.color),o);
 },
 get(key,color){return this.map.get(this.k(key,color))},
 has(fac,color){return this.map.has(this.k(fac+'_hq',color))&&this.map.has(this.k(fac+'_w',color))&&this.pending[this.k(fac,color)]===0},
 pending:{},
 jobsFor(fac,color){
  const J=[];
  for(const k in UNIT)if(UNIT[k].fac===fac)J.push({kind:'u',key:k,color,S:UNIT[k].r>13?1.35:1.7});
  for(const k in BLD)if(BLD[k].fac===fac)J.push({kind:'b',key:k,color,S:1.3});
  if(color===FAC[fac].color)J.push({kind:'h',key:FAC[fac].show[2],color});
  return J;
 },
 spawn(){try{const u=URL.createObjectURL(new Blob([BakeWorkerSrc],{type:'text/javascript'}));return new Worker(u)}catch(e){return null}},
 bake(fac,color,onTick){
  const id=this.k(fac,color);if(this.pending[id]===0)return Promise.resolve();
  if(this.inflight&&this.inflight[id])return this.inflight[id];
  this.inflight=this.inflight||{};
  const jobs=this.jobsFor(fac,color);this.pending[id]=jobs.length;
  const n=Math.max(1,Math.min(3,Math.floor((navigator.hardwareConcurrency||4)/3))),chunks=Array.from({length:n},()=>[]);
  jobs.forEach((j,i)=>chunks[i%n].push(j));
  const p=Promise.all(chunks.map(list=>new Promise(res=>{
   const w=this.spawn();
   const fallback=rest=>{const RT=bakeRuntime();let i=0;const step=()=>{const end=performance.now()+24;while(i<rest.length&&performance.now()<end){const j=rest[i++],r=RT.bakeJob(j);this.add(r);onTick&&onTick()}if(i<rest.length)setTimeout(step,0);else res()};step()};
   if(!w){fallback(list);return}
   let got=0;w.onerror=()=>{w.terminate();fallback(list.slice(got))};
   w.onmessage=e=>{const m=e.data;if(m.t==='sheet'){got++;this.add(m.r);onTick&&onTick()}else if(m.t==='done'){w.terminate();res()}};
   w.postMessage({jobs:list,id});
  }))).then(()=>{this.pending[id]=0});
  this.inflight[id]=p;return p;
 },
 dbKey(){return'aisg-'+BakeWorkerSrc.length},
 openDB(){return new Promise((res,rej)=>{try{const q=indexedDB.open('aisg-sprites',1);q.onupgradeneeded=()=>q.result.createObjectStore('s');q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)}catch(e){rej(e)}})},
 async loadCache(expect){
  try{
   const db=await this.openDB(),key=this.dbKey(),rec=await new Promise((res,rej)=>{const q=db.transaction('s').objectStore('s').get(key);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});db.close();
   if(!rec||!rec.items||rec.items.length<expect)return false;
   for(const it of rec.items){
    const [a,b,em]=await Promise.all([createImageBitmap(it.sheet),createImageBitmap(it.port),it.emit?createImageBitmap(it.emit):null]);
    const cv=document.createElement('canvas');cv.width=it.m.W2;cv.height=it.m.H2;cv.getContext('2d').drawImage(a,0,0);const pc=document.createElement('canvas');pc.width=it.m.pw;pc.height=it.m.ph;pc.getContext('2d').drawImage(b,0,0);
    let ec=null;if(em){ec=document.createElement('canvas');ec.width=it.m.W2;ec.height=it.m.H2;ec.getContext('2d').drawImage(em,0,0)}
    this.map.set(this.k(it.m.key,it.m.color),Object.assign({},it.m,{cv,pc,ec}));
   }
   return true;
  }catch(e){return false}
 },
 async saveCache(){
  try{
   const items=[];for(const [,o] of this.map){if(o.color===ALT_COLOR)continue;const m={};for(const k of ['key','color','kind','S','W2','H2','cw','ch','ax','ay','n','pw','ph'])m[k]=o[k];const blob=c=>new Promise(r=>c.toBlob(r));items.push({m,sheet:await blob(o.cv),port:await blob(o.pc),emit:o.ec?await blob(o.ec):null})}
   const db=await this.openDB();await new Promise((res,rej)=>{const t=db.transaction('s','readwrite'),st=t.objectStore('s');st.clear();st.put({items},this.dbKey());t.oncomplete=res;t.onerror=()=>rej(t.error)});db.close();
  }catch(e){}
 },
 bakeCommon(onTick){
  const keys=['res_c0','res_c1','res_c2','dd_rack','dd_fan','dd_cable'],RT=bakeRuntime();
  return new Promise(res=>{let i=0;const step=()=>{if(i>=keys.length){res();return}const r=RT.bakeBld(keys[i++],null,1.2);this.add(r);onTick&&onTick();setTimeout(step,0)};step()});
 },
 terrainP:{},
 terrain(g){
  const flat=!!this.flat;if(this.terrainP[g.mapId])return this.terrainP[g.mapId];
  const TS=16,tt=g.terrain.slice().buffer,lv=new Float32Array(g.level).buffer;
  this.terrainP[g.mapId]=new Promise(res=>{
   const finish=r=>{const cv=document.createElement('canvas');cv.width=r.w;cv.height=r.h;cv.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(r.buf),r.w,r.h),0,0);res(cv)};
   const w=this.spawn();
   const fb=()=>{const RT=bakeRuntime();finish(RT.bakeTerrain(g.terrain,new Float32Array(g.level),MW,MH,TS,flat))};
   if(!w){fb();return}
   w.onerror=()=>{w.terminate();fb()};w.onmessage=e=>{w.terminate();finish(e.data.r)};
   w.postMessage({t:'terrain',terrain:tt,level:lv,MW,MH,TS,flat},[tt,lv]);
  });
  return this.terrainP[g.mapId];
 }
};
