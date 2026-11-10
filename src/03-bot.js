class Bot{
 constructor(g,pid,diff){
  this.g=g;this.pid=pid;this.diff=diff;this.state='build';this.wave=0;this.next=0;
  this.cfg={easy:{base:10,grow:3,minT:540,workers:12,delay:2.2,prod:.03,maxBar:1},normal:{base:20,grow:6,minT:420,workers:30,delay:1,prod:1,maxBar:6},hard:{base:28,grow:10,minT:300,workers:36,delay:.9,prod:1,maxBar:6}}[diff]||{};
  this.rush=[];this.startArmy=0;this.fac=g.p[pid].fac;
 }
 role(r){return this.fac+'_'+r}
 step(){
  const g=this.g;
  if((g.tick+this.pid*7)%15!==0)return;
  const pid=this.pid,p=g.p[pid],t=g.tick/TPS;
  const us=g.units.filter(u=>u.p===pid),bs=g.blds.filter(b=>b.p===pid);
  if(!bs.length||g.p[pid].out)return;
  const workers=us.filter(u=>u.def.worker),scouts=us.filter(u=>u.def.key===this.fac+'_scout'),carriers=us.filter(u=>u.def.skill==='cargo'),army=us.filter(u=>!u.def.worker&&!u.dropJob&&u.def.skill!=='cargo'&&u.def.key!==this.fac+'_scout');
  const has=r=>bs.some(b=>b.def.role===r&&b.built),count=r=>bs.filter(b=>b.def.role===r).length+workers.filter(w=>w.o&&w.o.t==='build'&&BLD[w.o.key].role===r).length;
  const hqs=bs.filter(b=>b.def.role==='hq'&&b.built),advs=bs.filter(b=>b.def.role==='adv'&&b.built),bars=bs.filter(b=>b.def.role==='bar'&&b.built),techs=bs.filter(b=>b.def.role==='tech'&&b.built);
  this.ctx={p,t,us,bs,workers,army,has,count,hqs,bars,techs,scouts,carriers,advs};

  // 일꾼 생산과 배치
  const wantW=Math.min(this.cfg.workers,18+(hqs.length-1)*9);
  const queuedW=hqs.reduce((a,h)=>a+h.q.filter(q=>q.kind==='u').length,0);
  for(const h of hqs){if(workers.length+queuedW<wantW&&h.q.length<1)g.train(h,FAC[this.fac].worker)}
  for(const w of workers){if(!w.o){const r=g.findRes(w,'c');if(r)g.cmdGather([w],r)}}
  const exts=bs.filter(b=>b.def.role==='ext'&&b.built).length;
  const wantData=!bars.length?0:Math.min(exts*3,p.d>p.c+150?2:p.d>400?3:(has('tech')?5:3));
  const onData=workers.filter(w=>w.o&&w.o.t==='gather'&&(w.carryType==='d'||(g.by.get(w.o.id)||{}).type==='d'));
  if(onData.length>wantData+1){const w=onData.find(x=>x.carry===0);if(w){const r=g.findRes(w,'c');if(r)g.cmdGather([w],r)}}
  if(onData.length<wantData){
   const c=workers.filter(w=>w.o&&w.o.t==='gather'&&!onData.includes(w)&&w.carry===0);
   if(c[0]){const r=g.findRes(c[0],'d');if(r)g.cmdGather([c[0]],r)}
  }
  // 건설자를 잃은 Gemini 건물을 다시 맡긴다
  if(this.fac==='gem')for(const b of bs){if(b.built||workers.some(w=>w.o&&(w.o.t==='construct'||w.o.t==='repair')&&w.o.id===b.id))continue;
   const w=this.pickWorker([b.tx,b.ty]);if(w)g.cmdRepair([w],b)}
  // 토큰
  const incSup=bs.filter(b=>!b.built&&b.def.sup).length+workers.filter(w=>w.o&&w.o.t==='build'&&BLD[w.o.key].sup).length;
  const margin=t<180?3:t<420?7:12;
  if(p.supUsed+margin>=Math.min(p.supCap,SUP_MAX)&&p.supCap<SUP_MAX&&incSup<(t<300?1:2))this.tryBuild('sup');
  // 건설 순서
  const delay=this.cfg.delay;
  if(count('bar')<1&&workers.length>=(this.diff==='hard'?8:9))this.tryBuild('bar');
  else if(count('ext')<1&&has('bar'))this.buildExt();
  else if(count('ext')<2&&has('tech')&&t>170*delay)this.buildExt();
  else if(count('tech')<1&&has('bar')&&t>95*delay)this.tryBuild('tech');
  else if(count('adv')<1&&has('tech')&&t>190*delay)this.tryBuild('adv');
  else if(count('aura')<1&&has('bar')&&t>250*delay&&p.c>160)this.tryBuild('aura');
  else if(count('bar')<Math.min(2,this.cfg.maxBar)&&t>150*delay)this.tryBuild('bar');
  else if(count('twr')<1&&t>190*delay)this.tryBuild('twr');
  else if(count('bar')<Math.min(3,this.cfg.maxBar)&&t>300*delay)this.tryBuild('bar');
  else if(hqs.length<2&&t>250*delay&&count('hq')<2)this.expand();
  else if(hqs.length<3&&t>640*delay&&count('hq')<3)this.expand();
  else if(count('bar')<Math.min(4,this.cfg.maxBar)&&t>480*delay)this.tryBuild('bar');
  if(p.c>520&&count('bar')<Math.min(6,this.cfg.maxBar)&&bs.filter(x=>!x.built&&x.def.role==='bar').length+workers.filter(w=>w.o&&w.o.t==='build'&&BLD[w.o.key].role==='bar').length<1)this.tryBuild('bar');
  // 연구
  for(const b of techs){if(b.q.length||t<=200*delay)continue;if(g.research(b,'atk')!=='ok'&&t>320*delay)g.research(b,'arm')}
  // 생산
  this.scout();
  this.drop();
  this.produce(bars);
  this.command();
  this.skills();
  this.useAbility();
  // 신규 거점으로 일꾼 이동
  for(const h of hqs){
   if(h!==hqs[0]&&!h._staffed){h._staffed=true;
    const list=workers.filter(w=>w.o&&w.o.t==='gather').slice(0,8),r=g.findRes(h,'c');
    if(r)for(const w of list){const nr=g.findRes(h,'c');g.cmdGather([w],nr||r)}}
  }
 }
 // 정찰: 어려움·보통 난이도에서 정찰 유닛으로 적 본진과 빈 거점을 순회한다
 scout(){
  const g=this.g,{t,scouts,bars}=this.ctx;if(this.diff==='easy'||t<75)return;
  const k=this.fac+'_scout';this.scoutMade=this.scoutMade||0;
  if(!scouts.length&&this.scoutMade<2&&bars.length){const b=bars.find(x=>!x.q.length&&(!UNIT[k].mode||x.mode===UNIT[k].mode));if(b&&g.train(b,k)==='ok')this.scoutMade++}
  const pts=[...g.p.filter(q=>!q.out&&g.hostile(this.pid,q.id)).map(q=>q.home),...g.bases];
  for(const s of scouts){if(s.o||!pts.length)continue;s.scoutI=(s.scoutI||0)+1;const q=pts[s.scoutI%pts.length];g.cmdMove([s],q.x*T+16,q.y*T+16,false)}
 }
 // 수송 견제: 지상 병력을 태워 맵 가장자리로 돌아 일꾼 지대에 내린다
 drop(){
  const g=this.g,{t,carriers,bars,army,has,bs}=this.ctx,pid=this.pid;if(this.diff==='easy'||t<230||!has('tech'))return;
  const tk={gpt:'gpt_trans',gem:'gem_trans',cla:'cla_carry'}[this.fac];this.transMade=this.transMade||0;
  const tr=carriers[0];
  if(!tr){this.dropS=0;for(const u of g.units)if(u.p===pid&&u.dropJob)u.dropJob=false;if(this.transMade<3){const b=bars.find(x=>!x.q.length&&(!UNIT[tk].mode||x.mode===UNIT[tk].mode));if(b&&g.train(b,tk)==='ok')this.transMade++}return}
  const crew=g.units.filter(u=>u.p===pid&&u.dropJob),home=bs.find(b=>b.def.role==='hq')||bs[0];
  if(!this.dropS){
   if(t<(this.nextDrop||0))return;
   const pool=army.filter(u=>!u.air&&!u.tgt&&u.def.sup<=3&&u.def.dmg>0&&!u.deployed&&hyp(u.x-home.x,u.y-home.y)<22*T).sort((a,b)=>hyp(a.x-home.x,a.y-home.y)-hyp(b.x-home.x,b.y-home.y));
   let cap=8;const pick=[];for(const u of pool){if(u.def.sup<=cap&&pick.length<6){cap-=u.def.sup;pick.push(u)}}
   if(pick.length<2)return;for(const u of pick)u.dropJob=true;const cx=pick[0].x,cy=pick[0].y;g.cmdMove([tr,...pick],cx,cy,false);this.dropS=1;this.dropT=t;return;
  }
  if(this.dropS===1){
   if(!crew.length){this.dropS=0;return}
   if(crew.every(u=>hyp(u.x-tr.x,u.y-tr.y)<4.5*T)||t-this.dropT>25){if(!(tr.skillCd>0)){g.cmdSkill([tr]);this.dropS=2;this.dropT=t}}
   return;
  }
  if(this.dropS===2){
   const q=this.pickTarget();if(q<0)return;this.dropQ=q;
   const eb=g.blds.filter(b=>b.p===q);if(!eb.length)return;const h=eb.find(b=>b.def.role==='hq')||eb[0];this.dropX=h.x;this.dropY=h.y;
   const edge=h.x<MW*T/2?2*T:(MW-2)*T,sx=edge,sy=tr.y*.25+h.y*.75;g.cmdMove([tr],sx,sy,false);g.cmdMove([tr],h.x+(MW*T/2-h.x)*.05,h.y,false,true);this.dropS=3;return;
  }
  if(this.dropS===3){
   if(!tr.cargo||!tr.cargo.length){this.dropS=0;return}
   const near=hyp(tr.x-this.dropX,tr.y-this.dropY)<6.5*T;
   if((near||tr.hp<tr.def.hp*.45||!tr.o)&&!(tr.skillCd>0)){const list=tr.cargo.slice();g.cmdSkill([tr]);for(const c of list)c.dropJob=false;g.cmdMove(list,this.dropX,this.dropY,true);g.cmdMove([tr],home.x,home.y,false);this.dropS=0;this.nextDrop=t+150}
  }
 }
 produce(bars){
  const g=this.g,{p}=this.ctx,hasTech=this.ctx.has('tech'),hasAdv=this.ctx.has('adv');
  let ea=0,ev2=0;for(const u of g.units){if(!g.hostile(this.pid,u.p)||u.def.worker)continue;const v=u.def.c+u.def.d*1.5;ev2+=v;if(u.air)ev2,ea+=v}
  const antiAir=ev2>0&&ea/ev2>.32;
  bars.forEach((b,i)=>{
   if(b.q.length>=1||g.rng()>this.cfg.prod)return;
   let order;
   if(this.fac==='gpt')order=hasAdv?['gpt_tf','gpt_lance','gpt_arch','gpt_guard']:hasTech?['gpt_lance','gpt_arch','gpt_guard']:['gpt_guard'];
   if(this.fac==='cla')order=hasAdv?['cla_beast','cla_spore','cla_spine','cla_swarm']:hasTech?['cla_acid','cla_spine','cla_swarm']:['cla_swarm'];
   if(this.fac==='gem'){
    let want=hasTech?['mech','inf',hasAdv?'air':'mech'][i%3]:'inf';if(antiAir&&want==='mech')want='inf';
    if(b.mode!==want){g.setMode(b,want);return}
    order=want==='mech'?['gem_audio']:want==='air'?['gem_drone']:hasTech?['gem_vision','gem_text']:['gem_text'];
   }
   if(hasTech)for(const [k,cap] of ({gpt:[['gpt_ram',3],['gpt_heal',3]],gem:[['gem_how',3],['gem_heal',3]],cla:[['cla_acid',4],['cla_heal',3]]})[this.fac]){if(UNIT[k].mode&&UNIT[k].mode!==b.mode)continue;if(this.ctx.army.filter(u=>u.def.key===k).length<cap&&g.rng()<.28)order=[k,...order]}
   if(antiAir){const f=order.filter(k=>!UNIT[k].noAir);if(f.length)order=f}
   // 조합이 치우치지 않도록 무작위로 시작 위치를 돌린다
   const r=Math.floor(g.rng()*order.length);
   const seq=g.rng()<.55?order:order.slice(r).concat(order.slice(0,r));
   for(const k of seq){if(g.train(b,k)==='ok')break}
  });
  for(const b of this.ctx.advs){
   if(b.q.length>=1||g.rng()>this.cfg.prod)continue;const A={gpt:[['gpt_ship','gpt_ark'],'gpt_wing'],gem:[['gem_mech','gem_bomb'],'gem_aa'],cla:[['cla_brood','cla_wing'],'cla_leech']}[this.fac];
   const ea2=g.units.filter(u=>u.air&&g.hostile(this.pid,u.p)).length;let order=A[0].slice();if(antiAir||ea2>3)order=[A[1],...order];if(g.rng()<.5)order.reverse();
   for(const k of order){if(g.train(b,k)==='ok')break}
  }
 }
 skills(){
  const g=this.g,{army}=this.ctx,pid=this.pid,skilled=army.filter(u=>u.def.skill);if(!skilled.length)return;
  const near=(u,R)=>{let f=false;g.query(u.x,u.y,R,e=>{if(g.hostile(pid,e.p)&&!e.dead&&!e.air)f=true});if(!f)for(const b of g.blds)if(g.hostile(pid,b.p)&&hyp(b.x-u.x,b.y-u.y)<R){f=true;break}return f};
  for(const u of skilled){const sk=u.def.skill;
   if(sk==='deploy'){if(u.deployT>0)continue;const n=near(u,9.5*T);if(!u.deployed&&n&&u.skillCd<=0)g.cmdSkill([u]);else if(u.deployed&&!near(u,12*T)&&u.skillCd<=0)g.cmdSkill([u])}
   else if(u.skillCd<=0&&u.tgt&&!u.tgt.dead){if(sk==='molt'){if(u.hp<u.def.hp*.5)g.cmdSkill([u])}else if(u.hp>u.def.hp*.5)g.cmdSkill([u])}
  }
 }
 supplyOf(list){return list.reduce((a,u)=>a+u.def.sup,0)}
 pickTarget(){
  const g=this.g,c=g.p.filter(q=>!q.out&&g.hostile(this.pid,q.id));if(!c.length)return -1;
  const score=q=>g.power(q.id)*(.85+g.rng()*.3)+1;c.map(q=>[q,score(q)]).sort((a,b)=>a[1]-b[1]);return c.map(q=>[q,score(q)]).sort((a,b)=>a[1]-b[1])[0][0].id;
 }
 harass(all,t){
  const g=this.g,pid=this.pid;
  for(const u of all)if(u.harass&&(u.hp<u.def.hp*.4||(!u.o&&!u.tgt)))u.harass=false;
  if(this.diff==='easy'||t<300||g.tick%1350>=15)return;
  const air=all.filter(u=>u.air&&!u.harass).slice(0,4);if(air.length<2)return;
  let best=null,bd=1e12;for(const w of g.units){if(!w.def.worker||!g.hostile(pid,w.p))continue;const d=hyp(w.x-air[0].x,w.y-air[0].y);if(d<bd){bd=d;best=w}}
  if(best){for(const u of air)u.harass=true;g.cmdMove(air,best.x,best.y,true)}
 }
 command(){
  const g=this.g,{bs,t}=this.ctx,pid=this.pid,all=this.ctx.army;
  if(!all.length)return;
  this.harass(all,t);
  const army=all.filter(u=>!u.harass);if(!army.length)return;
  const enemies=g.units.filter(u=>g.hostile(pid,u.p)),eb=g.blds.filter(b=>g.hostile(pid,b.p));
  let threat=null,bd=1e12;
  for(const e of enemies){if(e.def.worker)continue;for(const b of bs){const d=hyp(e.x-b.x,e.y-b.y);if(d<14*T&&d<bd){bd=d;threat=e}}}
  const home=bs.find(b=>b.def.role==='hq')||bs[0];
  const sup=this.supplyOf(army),need=this.cfg.base+this.cfg.grow*this.wave;
  if(this.state!=='attack'){
   if(threat){this.order(army.filter(u=>!u.tgt&&(!u.o||u.o.t!=='attack')),threat.x,threat.y,true)}
   else{const fx=home.x+(MW*T/2-home.x)*.28,fy=home.y+(MH*T/2-home.y)*.28;if(g.tick%90<15)this.order(army.filter(u=>!u.o&&hyp(u.x-fx,u.y-fy)>8*T),fx,fy,true)}
   if(sup>=need&&t>this.cfg.minT){const q=this.pickTarget();if(q>=0){this.state='attack';this.wave++;this.startArmy=sup;this.targetP=q}}
  }
  if(this.state==='attack'){
   if(sup<Math.max(6,this.startArmy*.28)){this.state='build';this.order(army,home.x,home.y,false);return}
   if(g.tick%60<15){
    const cx=army.reduce((a,u)=>a+u.x,0)/army.length,cy=army.reduce((a,u)=>a+u.y,0)/army.length;
    const val=u=>(u.def.c+u.def.d*1.5)/(u.def.count||1);
    let le=0;for(const e of enemies)if(!e.def.worker&&hyp(e.x-cx,e.y-cy)<15*T)le+=val(e);
    const lo=army.reduce((a,u)=>a+(hyp(u.x-cx,u.y-cy)<15*T?val(u):0),0);
    if(le>lo*1.8&&this.diff!=='easy'){this.state='build';this.wave=Math.max(0,this.wave-1);this.order(army,home.x,home.y,false);return}
    if(this.targetP==null||this.targetP<0||g.p[this.targetP].out||!g.hostile(pid,this.targetP))this.targetP=this.pickTarget();
    let list=eb.filter(b=>b.p===this.targetP);if(!list.length)list=eb;
    let target=null,md=1e12;for(const b of list){const d=hyp(b.x-cx,b.y-cy);if(d<md){md=d;target=b}}
    if(target)this.order(army.filter(u=>!u.tgt||u.tgt.dead),target.x,target.y,true);
   }
  }
 }
 order(list,x,y,atk){if(list.length)this.g.cmdMove(list,x,y,atk)}
 useAbility(){
  const g=this.g,{army}=this.ctx,pid=this.pid;
  if(!g.abilityReady(pid)||!army.length)return;
  if(this.diff==='easy'&&g.rng()<.7)return;
  const fighting=army.filter(u=>u.tgt&&!u.tgt.dead);if(fighting.length<4)return;
  const cx=fighting.reduce((a,u)=>a+u.x,0)/fighting.length,cy=fighting.reduce((a,u)=>a+u.y,0)/fighting.length;
  if(this.fac==='gpt'){const low=fighting.filter(u=>u.def.sh&&u.sh<u.def.sh*.4);if(low.length>=4)g.castAbility(pid,cx,cy);return}
  let best=null,bn=0;
  for(const e of g.units){if(!g.hostile(pid,e.p)||e.air||hyp(e.x-cx,e.y-cy)>10*T)continue;let n=0;for(const f of g.units)if(g.hostile(pid,f.p)&&hyp(f.x-e.x,f.y-e.y)<3*T)n++;if(n>bn){bn=n;best=e}}
  if(best&&bn>=3)g.castAbility(pid,best.x,best.y);
 }
 tryBuild(role){
  const g=this.g,{p,workers}=this.ctx,key=this.role(role),d=BLD[key];
  if(!g.canAfford(p,d.c,d.d)||!g.reqMet(this.pid,d))return false;
  const home=this.ctx.bs.find(b=>b.def.role==='hq')||this.ctx.bs[0];
  const spot=this.findSpot(key,home);if(!spot)return false;
  const w=this.pickWorker(spot);if(!w)return false;
  return g.cmdBuild(w,key,spot[0],spot[1]);
 }
 buildExt(){
  const g=this.g,{p}=this.ctx,key=this.role('ext'),d=BLD[key];if(!g.canAfford(p,d.c,d.d))return false;
  const home=g.p[this.pid].home;let best=null,bd=1e9;
  for(const r of g.res){if(r.type!=='d'||r.ext||r.amt<=0)continue;if(!this.ctx.hqs.some(h=>hyp(r.x-h.x,r.y-h.y)<14*T))continue;const dd=hyp(r.x/T-home.x,r.y/T-home.y);if(dd<bd){bd=dd;best=r}}
  if(!best)return false;const w=this.pickWorker([best.tx,best.ty]);return w?g.cmdBuild(w,key,best.tx,best.ty):false;
 }
 pickWorker(spot){
  const free=this.ctx.workers.filter(w=>!w.o||(w.o.t==='gather'&&w.o.ph!=='mine'&&w.carry===0));
  const list=free.length?free:this.ctx.workers.filter(w=>!w.o||w.o.t==='gather');
  let best=null,bd=1e12;for(const w of list){const d=hyp(w.x-spot[0]*T,w.y-spot[1]*T);if(d<bd){bd=d;best=w}}return best;
 }
 findSpot(key,home){
  const g=this.g,d=BLD[key],hx=Math.floor(home.x/T),hy=Math.floor(home.y/T);
  const toC=Math.atan2(MH/2-hy,MW/2-hx);
  let best=null,bs=1e12;
  for(let r=4;r<17;r+=1)for(let a=0;a<24;a++){
   const an=toC+(a%2?1:-1)*Math.ceil(a/2)*.26,tx=Math.round(hx+Math.cos(an)*r-d.w/2),ty=Math.round(hy+Math.sin(an)*r-d.h/2);
   if(!this.spotOK(key,tx,ty))continue;
   const s=r+Math.abs(Math.ceil(a/2))*.25;if(s<bs){bs=s;best=[tx,ty]}
  }
  if(best)return best;
  // 본진이 가득 차면 격자 전체에서 여유 조건을 낮춰 다시 찾는다
  for(const h of this.ctx.hqs.length?this.ctx.hqs:[home]){const cx=Math.floor(h.x/T),cy=Math.floor(h.y/T);for(let y=cy-24;y<=cy+24;y++)for(let x=cx-24;x<=cx+24;x++){if(!g.canPlace(this.pid,key,x,y)||!this.spotLoose(key,x,y))continue;const s=hyp(x+d.w/2-cx,y+d.h/2-cy);if(s<bs){bs=s;best=[x,y]}}}
  return best;
 }
 spotOK(key,tx,ty){
  const g=this.g,d=BLD[key];
  if(!g.canPlace(this.pid,key,tx,ty))return false;
  for(const r of g.ramps){const dx=Math.max(tx-(r.x+r.w),r.x-(tx+d.w),0),dy=Math.max(ty-(r.y+r.h),r.y-(ty+d.h),0);if(Math.max(dx,dy)<5)return false}
  for(let y=ty-1;y<ty+d.h+1;y++)for(let x=tx-1;x<tx+d.w+1;x++){if(!inB(x,y)||g.blocked[idx(x,y)])return false}
  for(const r of g.res){if(r.amt<=0)continue;const dx=Math.max(tx-(r.tx+r.w),r.tx-(tx+d.w),0),dy=Math.max(ty-(r.ty+r.h),r.ty-(ty+d.h),0);if(Math.max(dx,dy)<3)return false}
  return true;
 }
 spotLoose(key,tx,ty){
  const g=this.g,d=BLD[key];
  for(const r of g.ramps){const dx=Math.max(tx-(r.x+r.w),r.x-(tx+d.w),0),dy=Math.max(ty-(r.y+r.h),r.y-(ty+d.h),0);if(Math.max(dx,dy)<3)return false}
  for(const r of g.res){if(r.amt<=0)continue;const dx=Math.max(tx-(r.tx+r.w),r.tx-(tx+d.w),0),dy=Math.max(ty-(r.ty+r.h),r.ty-(ty+d.h),0);if(Math.max(dx,dy)<2)return false}
  return true;
 }
 expand(){
  const g=this.g,{p,bs}=this.ctx,key=this.role('hq'),d=BLD[key];
  if(!g.canAfford(p,d.c,d.d))return false;
  const home=g.p[this.pid].home;
  const free=g.bases.filter(s=>!g.blds.some(b=>hyp(b.x/T-s.x,b.y/T-s.y)<7)).filter(s=>!g.units.some(u=>u.p!==this.pid&&!u.def.worker&&hyp(u.x/T-s.x,u.y/T-s.y)<10));
  free.sort((a,b)=>hyp(a.x-home.x,a.y-home.y)-hyp(b.x-home.x,b.y-home.y));
  for(const s of free){const tx=s.x-2,ty=s.y-2;if(g.canPlace(this.pid,key,tx,ty)){const w=this.pickWorker([tx,ty]);if(w)return g.cmdBuild(w,key,tx,ty)}}
  return false;
 }
}
function headless(f0,f1,seed,d0,d1,maxSec,map){
 const g=new Game({f0,f1,ai0:true,ai1:true,d0:d0||'normal',d1:d1||'normal',seed,observer:true,map});
 const lim=(maxSec||1800)*TPS;while(g.winner<0&&g.tick<lim)g.step();
 return{winner:g.winner,sec:Math.round(g.tick/TPS),f0,f1,stats:g.p.map(p=>({...p.stats,c:p.c|0,d:p.d|0,atk:p.atk})),u:[g.units.filter(u=>u.p===0).length,g.units.filter(u=>u.p===1).length],b:[g.blds.filter(b=>b.p===0).length,g.blds.filter(b=>b.p===1).length]};
}

function headless3(fs,seed,diff,maxSec){
 const g=new Game({players:fs.map(f=>({f,ai:true,d:diff||'normal'})),seed,observer:true});
 const lim=(maxSec||2400)*TPS;let coal=0;while(g.winner<0&&g.tick<lim){g.step();coal+=g.notices.filter(n=>n.includes('맞서')).length;g.notices.length=0}
 return{winner:g.winner,sec:Math.round(g.tick/TPS),fs,coal};
}
