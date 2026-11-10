// 온라인 대전: 게시 페이지의 room 기능 위에서 명령만 주고받는 락스텝 동기화
const NET_V='aisg10',TURN=6,DELAY=3,NET_CMDS=new Set(['cmdMove','cmdPatrol','cmdAttack','cmdHold','cmdStop','cmdGather','cmdRepair','cmdSkill','cmdBuild','train','research','cancelQ','cancelBuild','setMode','castAbility','propose','betray','concede','setRally']);
const NET_RET={train:'ok',research:'ok',castAbility:true,propose:'ok',cmdBuild:true};
// 자체 서버용 중계 연결: claude.ai room과 같은 방식(presence·peers)으로 동작한다
const WSRoom={
 url(){return (location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws'},
 probe(){return new Promise(res=>{let done=false;try{const w=new WebSocket(this.url());const end=v=>{if(done)return;done=true;try{w.close()}catch(e){}res(v)};w.onmessage=e=>{try{if(JSON.parse(e.data).t==='hello')end(true)}catch(x){}};w.onerror=()=>end(false);setTimeout(()=>end(false),3500)}catch(e){res(false)}})},
 join(name){
  return new Promise((resolve,reject)=>{
   const peers=new Map();let me=null,mine={},hs=[],errs=[],ws=null,open=false,closed=false,first=true,tries=0;
   const view=()=>[...peers].map(([id,pr])=>({peer:id,isMe:id===me,sameTab:id===me,kind:'viewer',guest:false,by:null,presence:pr,updatedAt:Date.now()}));
   const fire=(j,l,u)=>{const P=view(),f=ids=>P.filter(p=>ids.includes(p.peer)),left=l.map(id=>({peer:id,isMe:false,sameTab:false,kind:'viewer',presence:{}}));for(const h of hs)try{h({peers:P,joined:f(j),left,updated:f(u)})}catch(e){}};
   const room={name,
    presence(patch){for(const k in patch){if(patch[k]===null)delete mine[k];else mine[k]=patch[k]}const s=JSON.stringify(mine);if(s.length>4096)return Promise.reject({code:'invalid_argument'});if(me){peers.set(me,JSON.parse(s));setTimeout(()=>fire([],[],[me]),0)}if(open)ws.send(JSON.stringify({t:'pres',p:mine}));return Promise.resolve()},
    peers:view,onPeers(h,onErr){hs.push(h);if(onErr)errs.push(onErr);setTimeout(()=>{const P=view();h({peers:P,joined:P,left:[],updated:[]})},0);return()=>{hs=hs.filter(x=>x!==h)}},
    connected:()=>open,async leave(){closed=true;try{ws.send(JSON.stringify({t:'leave'}));ws.close()}catch(e){}}};
   const connect=()=>{ws=new WebSocket(this.url());
    ws.onopen=()=>ws.send(JSON.stringify({t:'join',room:name,peer:me}));
    ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(x){return}
     if(m.t==='joined'){me=m.peer;open=true;tries=0;const old=new Set(peers.keys());peers.clear();for(const p of m.peers)peers.set(p.peer,p.presence||{});peers.set(me,{...mine});if(Object.keys(mine).length)ws.send(JSON.stringify({t:'pres',p:mine}));const gone=[...old].filter(id=>!peers.has(id));fire([],gone,[...peers.keys()]);if(first){first=false;resolve(room)}}
     else if(m.t==='pres'){const n=!peers.has(m.peer);peers.set(m.peer,m.p||{});fire(n?[m.peer]:[],[],n?[]:[m.peer])}
     else if(m.t==='left'){if(peers.delete(m.peer))fire([],[m.peer],[])}
     else if(m.t==='error'&&first){first=false;reject(new Error(m.msg||'join'))}};
    ws.onclose=()=>{open=false;if(closed)return;if(first){first=false;reject(new Error('closed'));return}if(++tries<=20)setTimeout(connect,Math.min(4000,500*tries));else for(const f of errs)try{f()}catch(e){}};
   };
   connect();
  });
 }
};
const Net={
 base:null,avail:false,on:false,room:null,GRACE:25000,
 async init(){
  try{if(window.claude&&window.claude.use){const r=await window.claude.use('room');if(r){this.base=r;this.avail=true;$('bNet').hidden=false;return}}}catch(e){}
  // claude.ai 밖(자체 서버)에서는 같은 주소의 /ws 중계 서버를 쓴다
  if(!/^https?:$/.test(location.protocol))return;
  if(await WSRoom.probe()){this.base=WSRoom;this.avail=true;$('bNet').hidden=false}
 },
 close(){if(this.room){try{this.room.leave()}catch(e){}}this.room=null;this.on=false;if(this.unsub){this.unsub();this.unsub=null}},
 esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))},
 open(){$('net').hidden=false;$('netL').hidden=false;$('netR').hidden=true;$('netE').textContent='';$('netC').value=''},
 hide(){$('net').hidden=true;if(!this.on)this.close()},
 async make(){const c='abcdefghjkmnpqrstuvwxyz23456789';let code='';for(let i=0;i<4;i++)code+=c[Math.floor(Math.random()*c.length)];await this.enter(code,true)},
 async enter(code,host){
  code=String(code||'').trim().toLowerCase();if(!/^[a-z0-9]{3,8}$/.test(code)){$('netE').textContent='방 코드를 확인하십시오.';return}
  try{this.close();this.room=await this.base.join('aisg-'+code)}catch(e){$('netE').textContent='방에 들어갈 수 없습니다. 잠시 후 다시 시도하십시오.';return}
  this.code=code;this.isHost=!!host;this.launched=false;$('netL').hidden=true;$('netR').hidden=false;$('netCode').textContent=code.toUpperCase();
  this.room.presence({v:NET_V,fac:UI.setup.fac,host:host?1:0});
  this.unsub=this.room.onPeers(ch=>this.peers(ch),()=>{$('netE').textContent='연결이 끊어졌습니다.'});
  this.renderLobby();
 },
 setFac(){if(this.room&&!this.on)this.room.presence({fac:UI.setup.fac});},
 lobby(){return this.room?this.room.peers().filter(p=>p.kind==='viewer'&&p.presence&&p.presence.v===NET_V):[]},
 order(){const L=this.lobby().slice();L.sort((a,b)=>(b.presence.host?1:0)-(a.presence.host?1:0)||(a.peer<b.peer?-1:1));return L},
 renderLobby(){
  if(this.on||!this.room)return;const L=this.order(),w=$('netP');w.textContent='';
  L.forEach((p,i)=>{const d=document.createElement('div');d.className='npl';const f=FAC[p.presence.fac]?p.presence.fac:'gpt';d.style.color=FAC[f].color;d.textContent='플레이어 '+(i+1)+(p.sameTab?' (나)':'')+(p.presence.host?' · 방장':'')+' — '+FAC[f].name;w.appendChild(d)});
  const b=$('netGo');b.hidden=!this.isHost;b.disabled=L.length<2||L.length>3;$('netW').textContent=this.isHost?(L.length<2?'다른 플레이어를 기다리는 중입니다.':L.length>3?'최대 3명까지 참가할 수 있습니다.':'출진할 수 있습니다.'):'방장의 출진을 기다리는 중입니다.';
 },
 go(){if(!this.isHost)return;const L=this.order().slice(0,3);if(L.length<2)return;this.room.presence({go:{seed:((Date.now()&65535)+1),seats:L.map(p=>[p.peer,FAC[p.presence.fac]?p.presence.fac:'gpt']),map:UI.setup.map==='duel2'&&L.length===2?'duel2':undefined}})},
 peers(ch){
  const P=ch.peers;
  if(!this.on){const h=P.find(p=>p.presence&&p.presence.host&&p.presence.go);if(h&&!this.launched){this.launch(h.presence.go,P)}else this.renderLobby();return}
  for(const p of P){if(p.sameTab)continue;const s=this.seatOf[p.peer];if(s==null)continue;this.seen[s]=performance.now();const q=p.presence||{};if(typeof q.s==='number')this.sealed[s]=Math.max(this.sealed[s],q.s);if(typeof q.x==='number')this.exd[s]=q.x;if(Array.isArray(q.c))for(const it of q.c){if(Array.isArray(it)&&typeof it[0]==='number'&&it[0]>this.done&&Array.isArray(it[1]))this.inbox[s].set(it[0],it[1])}if(Array.isArray(q.h))this.checkHash(q.h)}
 },
 launch(go,P){
  const me=this.room.peers().find(p=>p.sameTab);if(!me)return;
  const seat=go.seats.findIndex(s=>s[0]===me.peer);if(seat<0){$('netW').textContent='이미 진행 중인 경기입니다.';return}
  this.launched=true;this.seatOf={};go.seats.forEach((s,i)=>{this.seatOf[s[0]]=i});
  const n=go.seats.length;this.n=n;this.sealed=new Array(n).fill(DELAY-1);this.exd=new Array(n).fill(-1);this.inbox=go.seats.map(()=>new Map());this.seen=new Array(n).fill(performance.now());this.done=-1;this.out=[];this.pending=[];this.acc=0;this.hist=new Map();this.alert=0;this.stall=0;this.left=new Set();
  ME=seat;
  const raw=new Game({players:go.seats.map(s=>({f:s[1],ai:false})),seed:go.seed|0,map:go.map==='duel2'&&go.seats.length===2?'duel2':undefined});
  this.raw=raw;UI.g=new Proxy(raw,{get:(t,k)=>{if(NET_CMDS.has(k))return (...a)=>{this.send(k,a);return NET_RET[k]};return t[k]}});
  this.on=true;$('net').hidden=true;
  const startIt=()=>{UI._launch(raw);if(raw.p.length===3)$('diplo').hidden=false;UI.say('온라인 대전이 시작되었습니다. 방 코드 '+this.code.toUpperCase())};
  if(!UI.use3D){(async()=>{for(const s of go.seats)for(const c of raw.p.filter(q=>q.fac===s[1]).map(q=>q.color))if(!Sprites.has(s[1],c))await Sprites.bake(s[1],c);startIt()})()}else startIt();
 },
 send(name,args){
  if(name==='castAbility'||name==='concede')args=[ME,...args.slice(1)];
  if(name==='propose'||name==='betray')args=[ME,args[1]];
  const enc=a=>{if(Array.isArray(a))return{u:a.map(x=>x.id)};if(a&&typeof a==='object')return a.id!=null?{e:a.id}:null;if(typeof a==='number')return Math.round(a*10)/10;return a===undefined?null:a};
  this.pending.push([name,...args.map(enc)]);
 },
 seal(T){
  const t2=T+DELAY;let size=2,cmds=[];while(this.pending.length){const c=this.pending[0],L=JSON.stringify(c).length+1;if(size+L>2600)break;cmds.push(c);size+=L;this.pending.shift()}
  this.sealed[ME]=t2;if(cmds.length)this.out.push([t2,cmds]);this.inbox[ME].set(t2,cmds);
  const low=Math.min(...this.exd.filter((_,i)=>i!==ME));this.out=this.out.filter(x=>x[0]>low);
  let c2=this.out;while(JSON.stringify(c2).length>3300&&c2.length>1)c2=c2.slice(1);
  this.room.presence({s:t2,x:this.done,c:c2,h:this.lastH||null}).catch(()=>{});
 },
 ready(T){if(T<DELAY)return true;for(let s=0;s<this.n;s++){if(s===ME||this.left.has(s))continue;if(this.sealed[s]<T)return false}return true},
 decode(a,seat,own){if(a&&typeof a==='object'){if(Array.isArray(a.u)){const r=[];for(const i of a.u){const x=this.raw.by.get(i);if(x&&!x.dead&&x.p===seat)r.push(x)}return r}if(a.e!=null){const x=this.raw.by.get(a.e);if(own&&(!x||x.p!==seat))return undefined;return x||undefined}return undefined}return a},
 exec(T){
  const g=this.raw;for(let s=0;s<this.n;s++){const L=this.inbox[s].get(T);this.inbox[s].delete(T);if(!Array.isArray(L))continue;for(const c of L){if(!Array.isArray(c)||!NET_CMDS.has(c[0]))continue;const name=c[0],own=['cmdBuild','train','research','cancelQ','cancelBuild','setMode'].includes(name);let bad=false;const args=c.slice(1).map((a,i)=>{const v=this.decode(a,s,own&&i===0);if(v===undefined)bad=true;return v});if(bad)continue;
    if((name==='train'&&!Object.prototype.hasOwnProperty.call(UNIT,args[1]))||(name==='cmdBuild'&&!Object.prototype.hasOwnProperty.call(BLD,args[1]))||(name==='setMode'&&!['inf','mech','air'].includes(args[1]))||(name==='research'&&!['atk','arm'].includes(args[1])))continue;
    if(name==='setRally'&&args[0].length===0)continue;
    if(name==='castAbility'||name==='concede'){args[0]=s}if(name==='propose'||name==='betray'){args[0]=s;if(!(args[1]>=0&&args[1]<this.n))continue}
    try{g[name](...args)}catch(e){console.warn('명령 실패',name)}}}
  this.done=T;
 },
 hash(){const g=this.raw;let h=g.tick|0;for(const u of g.units)h=(Math.imul(h,31)+u.id+Math.imul(u.x*8|0,7)+Math.imul(u.y*8|0,13)+Math.imul(u.hp*8|0,17))|0;for(const p of g.p)h=(Math.imul(h,31)+(p.c|0)+Math.imul(p.d|0,3))|0;return h},
 checkHash(h){const mine=this.hist.get(h[0]);if(mine==null)return;if(mine!==h[1])this.fail('양쪽의 경기 상태가 달라져 경기를 종료합니다. 서로 다른 종류의 브라우저를 사용하면 발생할 수 있습니다.')},
 fail(msg){if(this.failed)return;this.failed=true;UI.say(msg);$('netA').textContent=msg;$('netA').hidden=false;const g=this.raw;if(g.winner<0)g.winner=ME},
 gone(s){if(this.left.has(s))return;this.left.add(s);this.fail('플레이어의 연결이 끊어져 경기를 종료합니다.')},
 pump(dt){
  const g=this.raw;if(g.winner>=0){$('netA').hidden=true;return}
  this.acc=Math.min(this.acc+dt,.6);let n=0,wait=false;
  while(this.acc>=DT&&n<8){
   if(g.tick%TURN===0){const T=g.tick/TURN;if(T>this.done){if(!this.ready(T)){wait=true;break}this.exec(T);this.seal(T)}}
   g.step();this.acc-=DT;n++;
   if(g.tick%150===0){const v=this.hash();this.hist.set(g.tick,v);this.lastH=[g.tick,v];if(this.hist.size>20)this.hist.delete(this.hist.keys().next().value)}
  }
  this.stall=wait?this.stall+dt:0;const a=$('netA');if(this.stall>.8){a.textContent='상대를 기다리는 중입니다…';a.hidden=false}else if(!this.failed)a.hidden=true;
  const now=performance.now(),here=new Set(this.room.peers().map(p=>p.peer));let absent=false;
  for(const k in this.seatOf){const s=this.seatOf[k];if(s===ME||this.left.has(s))continue;if(here.has(k))this.seen[s]=now;else{absent=true;if(now-this.seen[s]>this.GRACE)this.gone(s)}}
  if(absent&&this.stall>.8)a.textContent='상대의 재접속을 기다리는 중입니다…';
  else if(this.room.connected&&!this.room.connected()&&this.stall>.8)a.textContent='연결을 복구하는 중입니다…';
 }
};

// 브라우저에 보관하는 전적
const Record={
 get(){try{return JSON.parse(localStorage.getItem('aisg-score')||'{"w":0,"l":0}')}catch(e){return{w:0,l:0}}},
 add(win){try{const r=this.get();if(win)r.w++;else r.l++;localStorage.setItem('aisg-score',JSON.stringify(r))}catch(e){}this.show()},
 show(){const r=this.get(),e=$('recS');if(e)e.textContent=(r.w+r.l)?'내 전적 '+r.w+'승 '+r.l+'패':''}
};

// 지난 경기 리플레이
const Replay={
 on:false,raw:null,i:0,
 enc(a){if(Array.isArray(a))return{u:a.map(x=>x.id)};if(a&&typeof a==='object')return a.id!=null?{e:a.id}:null;return a===undefined?null:a},
 wrap(raw,cfg){const rec={cfg,cmds:[]};UI.rec=rec;return new Proxy(raw,{get:(t,k)=>{if(NET_CMDS.has(k))return (...a)=>{rec.cmds.push([t.tick,k,a.map(x=>this.enc(x))]);return t[k](...a)};return t[k]}})},
 dec(a){if(a&&typeof a==='object'){if(Array.isArray(a.u)){const r=[];for(const i of a.u){const x=this.raw.by.get(i);if(x)r.push(x)}return r}if(a.e!=null)return this.raw.by.get(a.e)||null}return a===null?undefined:a},
 apply(){const r=this.rec.cmds,g=this.raw;while(this.i<r.length&&r[this.i][0]<=g.tick){const c=r[this.i++];try{g[c[1]](...c[2].map(x=>this.dec(x)))}catch(e){}}},
 start(){const rec=UI.rec;if(!rec)return;this.rec=rec;this.i=0;ME=0;const raw=new Game({...rec.cfg,observer:true});this.raw=raw;this.on=true;$('over').hidden=true;UI.g=new Proxy(raw,{get:(t,k)=>NET_CMDS.has(k)?()=>false:t[k]});UI._launch(raw);UI.say('리플레이를 재생합니다. 명령은 입력되지 않습니다.');$('bSpeed').hidden=false;$('repB').hidden=false},
 stop(){this.on=false;this.raw=null;$('repB').hidden=true},
 save(){try{const s=JSON.stringify({v:NET_V,rec:UI.rec});if(s.length<600000){localStorage.setItem('aisg-rep',s)}}catch(e){}this.refresh()},
 load(){try{const o=JSON.parse(localStorage.getItem('aisg-rep')||'null');if(o&&o.v===NET_V&&o.rec&&o.rec.cfg)return o.rec}catch(e){}return null},
 refresh(){const b=$('bRepL');if(b)b.hidden=!this.load()},
 startLast(){const r=this.load();if(!r)return;UI.rec=r;this.start()}
};

// 캠페인과 튜토리얼
const MISSIONS=[
 {name:'기초 훈련',brief:'일꾼 생산, 건설, 병력 운용을 익힙니다.',build(){const f=UI.setup.fac;return{f,riv:this.riv(f),ai:false}},riv:f=>({gpt:'gem',gem:'cla',cla:'gpt'})[f],
  init(g){const E=g.p[1],hq=g.blds.find(b=>b.p===1);hq.hp=Math.min(hq.hp,500);if(hq.sh!=null)hq.sh=0;for(const u of g.units.filter(u=>u.p===1)){u.dead=true}},
  steps:[{t:'본진을 클릭해 선택한 뒤 일꾼을 1기 더 생산하십시오. (Q 또는 카드 클릭)',ok:(g,C)=>C.workers>=6},
   {t:'일꾼을 선택하고 B로 건설 메뉴를 열어 토큰 증설 건물을 지으십시오.',ok:(g,C)=>C.built('sup')},
   {t:'전투 유닛을 생산하는 건물을 지으십시오.',ok:(g,C)=>C.built('bar')},
   {t:'전투 건물을 선택해 전투 유닛 4기를 생산하십시오.',ok:(g,C)=>C.army>=4},
   {t:'적 정찰대가 나타났습니다. 병력을 드래그로 선택하고 A를 누른 뒤 맵을 클릭해 격파하십시오.',enter(g,C){C.spawnNear(g,1,2,g.p[1].fac+'_scout')},ok:(g,C)=>C.enemy===0},
   {t:'적 본진을 공격해 파괴하면 훈련이 끝납니다.',ok:()=>false}]},
 {name:'방어선 사수',brief:'이미 건설된 거점에서 5분 동안 적의 파상 공세를 막아냅니다.',build(){const f=UI.setup.fac;return{f,riv:({gpt:'cla',gem:'cla',cla:'gem'})[f],ai:false}},
  init(g,C){const P=g.p[ME],h=P.home,f=P.fac;P.c=800;P.d=400;for(const [r,dx,dy] of[['sup',6,1],['sup',6,4],['bar',-4,-6],['tech',1,-7],['twr',7,-6],['twr',-7,3]])try{g.makeBld(P,f+'_'+r,h.x+dx,h.y+dy,true)}catch(e){}C.nextW=25;C.wave=0},
  tick(g,C){const t=g.tick/TPS;if(t>=C.nextW){C.nextW+=40;C.wave++;const E=g.p[1],f=E.fac,list=[...Array(3+C.wave*2)].map((_,i)=>i%4===3&&C.wave>3?f+({gpt:'_tf',gem:'_audio',cla:'_beast'})[f]:i%2?({gpt:'gpt_arch',gem:'gem_vision',cla:'cla_spine'})[f]:({gpt:'gpt_guard',gem:'gem_text',cla:'cla_swarm'})[f]);const H=E.home,x0=H.x*T,y0=H.y*T,u=list.map((k,i)=>camSpawn(g,E,k,x0+60+i*26,y0-80));const h=g.p[ME].home;g.cmdMove(u.filter(Boolean),h.x*T,h.y*T,true);UI.say('적 공세 제'+C.wave+'파가 접근합니다.')}if(t>=300)g.winner=ME},
  steps:[{t:'적의 공세를 5분 동안 막아내십시오. 남은 시간은 상단 시계로 확인합니다.',ok:()=>false}]},
 {name:'심장부 타격',brief:'병력만으로 포탑이 지키는 적 연구소를 6분 안에 파괴합니다.',build(){const f=UI.setup.fac;return{f,riv:({gpt:'gem',gem:'gpt',cla:'gem'})[f],ai:false}},
  init(g,C){const P=g.p[ME],E=g.p[1],f=P.fac,h=E.home;const kit={gpt:['gpt_guard','gpt_arch','gpt_tf'],gem:['gem_text','gem_vision','gem_audio'],cla:['cla_swarm','cla_spine','cla_beast']}[f],me=P.home;P.c=300;P.d=150;
   for(let i=0;i<16;i++)camSpawn(g,P,kit[i%8===7?2:i%2],me.x*T+110+(i%4)*42,me.y*T-120-(i>>2)*42);
   C.goal=g.makeBld(E,E.fac+'_tech',h.x+1,h.y+7,true);for(const [dx,dy] of[[5,6],[-4,6],[1,11],[6,2],[-5,10]])try{g.makeBld(E,E.fac+'_twr',h.x+dx,h.y+dy,true)}catch(e){}const gk={gpt:['gpt_guard','gpt_arch'],gem:['gem_text','gem_vision'],cla:['cla_swarm','cla_spine']}[E.fac];for(let i=0;i<8;i++)camSpawn(g,E,gk[i%2],(h.x+1+(i%6)*2)*T,(h.y+4+(i>>1))*T)},
  tick(g,C){if(g.tick/TPS>=360&&g.winner<0&&!C.goal.dead)g.winner=1;if(C.goal.dead)g.winner=ME},
  steps:[{t:'포탑을 돌파해 적 연구소를 6분 안에 파괴하십시오.',ok:()=>false}]},
 {name:'삼국 결전',brief:'어려움 난이도의 두 세력을 상대로 최후의 승자가 됩니다.',build(){const f=UI.setup.fac;return{f,three:1}},init(){},steps:[{t:'두 세력을 모두 무너뜨리십시오. 외교로 시간을 벌 수 있습니다.',ok:()=>false}]}
];
const camSpawn=(g,P,k,x,y)=>{const f=g.nearestFree(x,y),u=g.spawnUnit(P,k,null,f[0],f[1]);if(u){P.supUsed+=UNIT[k].sup*(UNIT[k].count?1/UNIT[k].count:1)}return u};
const Campaign={
 cleared(){try{return JSON.parse(localStorage.getItem('aisg-cmp')||'[]')}catch(e){return[]}},
 mark(i){try{const c=this.cleared();if(!c.includes(i)){c.push(i);localStorage.setItem('aisg-cmp',JSON.stringify(c))}}catch(e){}},
 open(){const w=$('cmpL'),c=this.cleared();w.textContent='';MISSIONS.forEach((m,i)=>{const b=document.createElement('button');b.className='cmi';const n=document.createElement('b');n.textContent=(i+1)+'. '+m.name+(c.includes(i)?'  ✓':'');const p=document.createElement('span');p.textContent=m.brief;b.append(n,p);b.onclick=()=>{$('cmp').hidden=true;this.start(i)};w.appendChild(b)});$('cmp').hidden=false},
 start(i){
  const m=MISSIONS[i],s=m.build();ME=0;Net.close();Replay.stop();UI.rec=null;
  const fs3=['gpt','gem','cla'].filter(f=>f!==s.f);
  const players=s.three?[{f:s.f,ai:false},...fs3.map(f=>({f,ai:true,d:'hard'}))]:[{f:s.f,ai:false},{f:s.riv,ai:false}];
  UI.g=new Game({players,seed:(Date.now()&65535)+1});UI._launch(UI.g);
  const C={i,m,step:0,spawnNear:(g,p,n,k)=>{const Q=g.p[p],me=g.p[ME].home,cx=(me.x*T+Q.home.x*T)/2,cy=(me.y*T+Q.home.y*T)/2;for(let j=0;j<n;j++)camSpawn(g,Q,k,me.x*T+(cx-me.x*T)*.4+j*24,me.y*T+(cy-me.y*T)*.4)}};
  UI.mis=C;UI.misI=i;UI.lastMis=true;if(m.init)m.init(UI.g,C);$('mis').hidden=false;$('hint').hidden=true;this.show()},
 show(){const C=UI.mis,S=C.m.steps[C.step],e=$('misT');e.textContent=S.t;$('misN').textContent=C.m.name+' · '+(C.step+1)+' / '+C.m.steps.length;},
 tick(){const C=UI.mis,g=UI.g;if(!C||g.tick%15!==0)return;
  C.workers=g.units.filter(u=>u.p===ME&&u.def.worker).length;C.army=g.units.filter(u=>u.p===ME&&!u.def.worker).length;C.enemy=g.units.filter(u=>u.p!==ME).length;C.built=r=>g.blds.some(b=>b.p===ME&&b.built&&b.def.role===r);
  if(C.m.tick)C.m.tick(g,C);const S=C.m.steps[C.step];if(!C.ent){C.ent=true;if(S.enter){S.enter(g,C);return}}if(S.ok(g,C)&&C.step<C.m.steps.length-1){C.step++;C.ent=false;this.show();AudioFX.play('ui')}
  if(g.winner===ME)this.mark(C.i)}
};
