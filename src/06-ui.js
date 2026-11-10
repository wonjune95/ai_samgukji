const $=id=>document.getElementById(id);
const AudioFX={
 ctx:null,on:true,last:{},
 init(){if(this.ctx)return;try{this.ctx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){this.ctx=null}},
 play(kind){
  if(!this.on||!this.ctx)return;const now=this.ctx.currentTime;const gap={shot:.09,die:.1,boom:.18,ui:.03,done:.3,alert:3,ability:.3,spawn:.3,voice:.05}[kind]||.1;
  if(now-(this.last[kind]||0)<gap)return;this.last[kind]=now;
  const a=this.ctx,o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);
  const S={shot:['square',620,180,.05,.022],die:['sawtooth',240,60,.14,.05],boom:['sawtooth',110,28,.5,.15],ui:['triangle',720,720,.05,.05],done:['triangle',520,900,.2,.08],alert:['square',440,330,.32,.06],ability:['sine',300,1100,.5,.12],spawn:['sine',380,620,.1,.04]}[kind];
  if(!S)return;o.type=S[0];o.frequency.setValueAtTime(S[1],now);o.frequency.exponentialRampToValueAtTime(S[2],now+S[3]);g.gain.setValueAtTime(S[4],now);g.gain.exponentialRampToValueAtTime(.0008,now+S[3]);o.start(now);o.stop(now+S[3]+.02);
 },
 voice(fac){
  if(!this.on||!this.ctx)return;const now=this.ctx.currentTime;if(now-(this.last.vc||0)<.35)return;this.last.vc=now;
  const a=this.ctx,base={gpt:520,gem:170,cla:330}[fac],type={gpt:'sine',gem:'square',cla:'sawtooth'}[fac];
  for(let i=0;i<4;i++){const o=a.createOscillator(),g=a.createGain(),f=a.createBiquadFilter(),t=now+i*.075;f.type='bandpass';f.frequency.value=base*3;f.Q.value=2;o.type=type;o.frequency.value=base*(1+Math.sin(i*2.4+now)*.22);o.connect(f);f.connect(g);g.connect(a.destination);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.05,t+.015);g.gain.exponentialRampToValueAtTime(.0005,t+.07);o.start(t);o.stop(t+.08)}
 },
 musicOn:true,mt:0,
 musicTick(fac){
  if(!this.ctx||!this.musicOn)return;const a=this.ctx,now=a.currentTime;if(this.mt>now+.3)return;if(this.mt<now)this.mt=now+.05;
  const sc={gpt:[0,2,7,9,12,14],gem:[0,3,5,7,10,12],cla:[0,1,5,7,8,12]}[fac]||[0,3,7,10],root={gpt:110,gem:82.4,cla:98}[fac]||98,bar=this.bar=(this.bar||0)+1,t=this.mt,beat=.46;
  const note=(freq,at,len,vol,type,cut)=>{const o=a.createOscillator(),g=a.createGain(),f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=cut;o.type=type;o.frequency.value=freq;o.connect(f);f.connect(g);g.connect(a.destination);g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(vol,at+.04);g.gain.exponentialRampToValueAtTime(.0005,at+len);o.start(at);o.stop(at+len+.05)};
  const prog=[0,0,3,2][(bar>>2)%4],r=root*Math.pow(2,sc[prog%sc.length]/12);
  note(r/2,t,beat*1.7,.05,'sawtooth',420);note(r/2,t+beat*2,beat*1.6,.04,'sawtooth',380);
  for(let i=0;i<4;i++){if(((bar*7+i*3)%5)<3)note(root*2*Math.pow(2,sc[(bar+i*2+prog)%sc.length]/12),t+i*beat,beat*.9,.016,fac==='gem'?'square':'triangle',1700)}
  this.mt+=beat*4;
 }
};

const EMB={
 gpt:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="5"><circle cx="32" cy="32" r="26"/><path d="M32 14a18 18 0 1 0 15 28" stroke-linecap="round"/><circle cx="33" cy="32" r="6.5" fill="currentColor" stroke="none"/></svg>',
 gem:'<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"><path d="M32 4l24 14v28L32 60 8 46V18z"/><path d="M20 28l12-9 12 9M20 40l12-9 12 9"/></svg>',
 cla:'<svg viewBox="0 0 64 64" fill="currentColor"><ellipse cx="24" cy="24" rx="16" ry="14" opacity=".95"/><ellipse cx="42" cy="30" rx="14" ry="16" opacity=".7"/><ellipse cx="26" cy="45" rx="17" ry="12" opacity=".5"/></svg>'
};
const ICO={attack:'<path d="M5 19L18 6M14 5h5v5M5 14l5 5M3 21l3-3"/>',stop:'<rect x="6" y="6" width="12" height="12" rx="1.5"/>',hold:'<path d="M12 3l8 3v6c0 5-3.6 8-8 9-4.4-1-8-4-8-9V6z"/>',patrol:'<path d="M4 9h13l-3-3M20 15H7l3 3"/>',build:'<path d="M14 5l5 5-3 3-5-5zM11 8L4 15l2 3 3 2 7-7"/>',back:'<path d="M10 6l-6 6 6 6M4 12h16"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',inf:'<circle cx="12" cy="6" r="3"/><path d="M12 9v7M7 12h10M12 16l-4 5M12 16l4 5"/>',gear:'<circle cx="12" cy="12" r="3.4"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',wing:'<path d="M3 14c6-9 12-9 18-9-1 4-3 8-7 9 1 3-1 5-4 5-1-3-4-5-7-5z"/>',up:'<path d="M12 21V6M6 11l6-6 6 6"/>',arm:'<path d="M12 3l8 3v6c0 5-3.6 8-8 9-4.4-1-8-4-8-9V6z"/><path d="M12 16V9M9 11l3-3 3 3"/>',bolt:'<path d="M13 2L5 14h6l-1 8 9-13h-6z"/>',target:'<circle cx="12" cy="12" r="7"/><path d="M12 2v6M12 16v6M2 12h6M16 12h6"/>',wave:'<path d="M3 12c3-6 6-6 9 0s6 6 9 0"/>',heart:'<path d="M12 20S4 14.5 4 9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 5.5-8 11-8 11z"/>'};
const icoSvg=n=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'+(ICO[n]||'')+'</svg>';
const LABEL_ICO={'공격':'attack','정지':'stop','사수':'hold','순찰':'patrol','건설':'build','이전':'back','취소':'x','보병':'inf','기계':'gear','항공':'wing','오버클럭':'bolt','돌격 프로토콜':'wave','탈피 재생':'heart','정밀 모드':'target','탑승·하차':'up'};
const icoFor=b=>LABEL_ICO[b.label]||(/가중치/.test(b.label||'')?'up':/장갑/.test(b.label||'')?'arm':'');

const UI={
 g:null,r:null,sel:[],selSet:new Set(),mode:null,groups:{},pings:[],box:null,mouse:{x:300,y:300,in:false},speed:1,paused:false,playing:false,setup:{fac:'cla',opp:'random',dif:'normal',mode:'three',map:'duel'},
 acc:0,lastT:0,hudK:'',cardK:'',lastAlert:0,alertPos:null,sayT:0,hintDone:{},evI:0,keys:{},tap:null,attractT:0,
 hudH(){return this.playing?parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hud-h'))||176:0},
 init(){
  try{if(webglOK()){this.r=new Renderer3D($('view'),$('mini'),$('gl'));this.use3D=true;Studio.init(this.r);Sprites.flat=true}}catch(e){this.use3D=false;this.r=null}
  if(!this.r){this.r=new Renderer($('view'),$('mini'));$('gl').hidden=true}
  addEventListener('resize',()=>{this.r.resize()});this.r.resize();
  this.buildTitle();this.bindInput();
  requestAnimationFrame(t=>this.frame(t));
  this.boot();
 },
 async boot(){
  const tmp=new Game({f0:'gpt',f1:'cla',ai0:true,ai1:true,seed:1,observer:true});
  let done=0;const facs=['gpt','gem','cla'];const total=facs.reduce((n,f)=>n+Sprites.jobsFor(f,FAC[f].color).length,0)+8;
  const tmp3=new Game({players:facs.map(f=>({f,ai:true})),seed:1,observer:true});
  const tick=()=>{done++;$('loadB').style.width=Math.min(100,done/total*100)+'%'};
  let tc,tc3;
  if(this.use3D){for(const f of facs)Sprites.pending[Sprites.k(f,FAC[f].color)]=0;[tc,tc3]=await Promise.all([Sprites.terrain(tmp),Sprites.terrain(tmp3)]);done=total-1;tick()}
  else{
   const expect=facs.reduce((n,f)=>n+Sprites.jobsFor(f,FAC[f].color).length,0)+6,cached=await Sprites.loadCache(expect);
   if(cached){for(const f of facs)Sprites.pending[Sprites.k(f,FAC[f].color)]=0;done=total-1;tick();tc=await Sprites.terrain(tmp);tc3=await Sprites.terrain(tmp3)}
   else{[tc,tc3]=await Promise.all([Sprites.terrain(tmp).then(c=>{tick();return c}),Sprites.terrain(tmp3).then(c=>{tick();return c}),Sprites.bakeCommon(tick),...facs.map(f=>Sprites.bake(f,FAC[f].color,tick))]);Sprites.saveCache()}
  }
  if(this.use3D){await Pack.load();const n=await Models.restore(this.r);$('glbW').hidden=false;$('glbS').textContent=n?n+'개 적용 중':'';
   $('glb').onchange=async e=>{let ok=0,bad=[];for(const f of e.target.files){const key=f.name.replace(/\.glb$/i,'');if(!UNIT[key]&&!BLD[key]){bad.push(f.name);continue}try{const buf=await f.arrayBuffer();await Models.install(key,buf,this.r);await Models.save(key,buf);ok++}catch(x){bad.push(f.name)}}e.target.value='';$('glbS').textContent=(ok?ok+'개 적용 완료':'')+(bad.length?' · 실패: '+bad.join(', ')+' (파일명은 gem_audio.glb 형식)':'');facs.forEach(f=>{const c=FAC[f].color;$('h-'+f).src=iconURL('hero_'+FAC[f].show[2],c,440);FAC[f].show.forEach((k,i)=>{$('l-'+f+'-'+i).src=iconURL(k,c,120)})})};
   $('glbX').onclick=async()=>{await Models.clear();$('glbS').textContent='다음 접속부터 기본 모델을 사용합니다.'}}
  const tmp4=new Game({f0:'gpt',f1:'cla',ai0:true,ai1:true,seed:1,observer:true,map:'duel2'});const tc4=await Sprites.terrain(tmp4);
  this.terrainC={duel:tc,three:tc3,duel2:tc4};this.ready=true;
  $('load').hidden=true;$('go').disabled=false;$('go').textContent='출진';
  for(const f of facs){const c=FAC[f].color;$('h-'+f).src=iconURL('hero_'+FAC[f].show[2],c,440);FAC[f].show.forEach((k,i)=>{$('l-'+f+'-'+i).src=iconURL(k,c,120)})}
  this.startAttract();Replay.fromLink();
 },
 buildTitle(){
  const fw=$('facs');
  for(const k of ['gpt','gem','cla']){
   const f=FAC[k],b=document.createElement('button');b.className='fac';b.type='button';b.id='f-'+k;b.setAttribute('role','radio');b.style.setProperty('--fc',f.color);
   b.innerHTML=`<div class="art"><span class="emb">${EMB[k]}</span><img class="hero" id="h-${k}" alt=""></div><div class="ftext"><b>${EMB[k]}${f.name}</b><em>${f.motto}</em><p>${f.brief}</p><div class="lineup">${f.show.map((u,i)=>`<figure><img id="l-${k}-${i}" alt="">${UNIT[u].name}</figure>`).join('')}</div></div>`;
   b.onclick=()=>{this.setup.fac=k;Net.setFac();this.refreshTitle();AudioFX.init();AudioFX.play('ui')};fw.appendChild(b);
  }
  const seg=(host,items,key)=>{for(const [v,l] of items){const b=document.createElement('button');b.type='button';b.id=key+'-'+v;b.setAttribute('role','radio');b.textContent=l;b.dataset.v=v;b.onclick=()=>{this.setup[key]=v;this.refreshTitle();AudioFX.init();AudioFX.play('ui')};host.appendChild(b)}};
  seg($('mode'),[['three','삼국 대전'],['duel','1대1']],'mode');
  seg($('opp'),[['random','무작위'],['gpt','ChatGPT'],['gem','Gemini'],['cla','Claude']],'opp');
  seg($('map'),[['duel','고지대 전선'],['duel2','협곡 회랑']],'map');
  seg($('dif'),[['easy','쉬움'],['normal','보통'],['hard','어려움']],'dif');
  this.refreshTitle();
  $('go').onclick=()=>this.start();$('bAgain').onclick=()=>{if(this.misI!=null&&this.lastMis)Campaign.start(this.misI);else this.start()};$('bCmp').onclick=()=>Campaign.open();$('bRep').onclick=()=>Replay.start();$('bRepL').onclick=()=>Replay.startLast();Record.show();Replay.refresh();$('repB').onclick=()=>{Replay.stop();this.toTitle()};$('cmpX').onclick=()=>{$('cmp').hidden=true};$('bNet').onclick=()=>Net.open();$('netX').onclick=()=>Net.closeBtn();$('netMk').onclick=()=>Net.make();$('netJ').onclick=()=>Net.enter($('netC').value,false);$('netGo').onclick=()=>Net.go();$('netQ').onclick=()=>Net.quickMatch();$('netPub').onclick=()=>{Net.saveNick();Net.make({pub:true})};$('bRank').onclick=()=>Rank.open();$('rankX').onclick=()=>{$('rank').hidden=true};$('bShare').onclick=()=>Replay.share();Net.init();
  $('bHome').onclick=()=>{this.lastMis=false;this.toTitle()};$('bQuit').onclick=()=>this.toTitle();
  $('bResume').onclick=()=>this.setPause(false);
  $('bGiveup').onclick=()=>{this.setPause(false);this.g.concede(ME)};
  $('bMenu').onclick=()=>{if(this.g.winner<0)this.setPause(!this.paused)};
  $('bSpeed').onclick=()=>{this.speed=Replay.on?(this.speed===1?2:this.speed===2?4:1):(this.speed===1?1.5:this.speed===1.5?2:1);$('bSpeed').textContent='×'+this.speed};
  $('bSound').onclick=()=>{AudioFX.on=!AudioFX.on;$('bSound').setAttribute('aria-pressed',AudioFX.on)};
  $('bMusic').onclick=()=>{AudioFX.musicOn=!AudioFX.musicOn;$('bMusic').setAttribute('aria-pressed',AudioFX.musicOn)};
  $('bIdle').onclick=()=>this.selectIdle();$('bArmy').onclick=()=>this.selectArmy();
  $('abil').onclick=()=>this.beginAbility();
  $('bGfx').onclick=()=>{const q=this.r.q==='high'?'low':'high';this.r.autoQ=false;this.r.setQuality(q);$('bGfx').textContent='그래픽 '+(q==='high'?'높음':'낮음')};
 },
 refreshTitle(){
  for(const k of ['gpt','gem','cla'])$('f-'+k).setAttribute('aria-checked',this.setup.fac===k);
  for(const b of $('mode').children)b.setAttribute('aria-checked',b.dataset.v===this.setup.mode);
  $('oppW').hidden=this.setup.mode==='three';$('mapW').hidden=this.setup.mode==='three';for(const b of $('map').children)b.setAttribute('aria-checked',b.dataset.v===this.setup.map);
  for(const b of $('opp').children)b.setAttribute('aria-checked',b.dataset.v===this.setup.opp);
  for(const b of $('dif').children)b.setAttribute('aria-checked',b.dataset.v===this.setup.dif);
 },
 startAttract(){
  const ks=['gpt','gem','cla'],a=ks[Math.floor(Math.random()*3)];let b=ks[Math.floor(Math.random()*3)];if(b===a)b=ks[(ks.indexOf(a)+1)%3];
  ME=0;Net.close();this.g=new Game({players:ks.map(f=>({f,ai:true,d:'hard'})),seed:Date.now()&65535,observer:true});
  for(let i=0;i<30*285&&this.g.winner<0;i++)this.g.step();
  this.g.events.length=0;this.r.attach(this.g,this.terrainC[this.g.mapId]);this.r.cam.z=this.r.w<820?.6:1.05;this.playing=false;this.attractFocus();if(this.camGoal){this.r.cam.x=this.camGoal[0];this.r.cam.y=this.camGoal[1];this.r.clamp(0)}
 },
 attractFocus(){
  const g=this.g;let best=null;for(const u of g.units){if(u.tgt&&!u.def.worker){best=u;break}}
  if(!best)best=g.units.find(u=>!u.def.worker)||g.blds[0]||null;
  if(best){this.camGoal=[best.x-this.r.w/2/this.r.cam.z,best.y-this.r.h*.3/this.r.cam.z]}
 },
 async start(){
  AudioFX.init();
  const three=this.setup.mode==='three',me=this.setup.fac;
  let o=this.setup.opp;if(o==='random')o=['gpt','gem','cla'][Math.floor(Math.random()*3)];
  if(!this.use3D&&!three&&o===me&&!Sprites.has(o,ALT_COLOR)){const b=$('go'),t=b.textContent;b.disabled=true;b.textContent='도색 중';await Sprites.bake(o,ALT_COLOR);b.disabled=false;b.textContent=t}
  const rivals=three?['gpt','gem','cla'].filter(f=>f!==me):[o];
  ME=0;Replay.stop();const cfg={players:[{f:me,ai:false},...rivals.map(f=>({f,ai:true,d:this.setup.dif}))],seed:(Date.now()&65535)+1,map:!three&&this.setup.map==='duel2'?'duel2':undefined};const raw0=new Game(cfg);this.g=Replay.wrap(raw0,cfg);
  this._launch(raw0);
 },
 _launch(raw){
  const three=raw.p.length===3;this.mis=null;$('mis').hidden=true;
  this.r.attach(raw,this.terrainC[raw.mapId]);this.diploK='';this.groupK='';$('diplo').hidden=!three;$('groups').hidden=true;this.playing=true;this.paused=false;this.sel=[];this.selSet=new Set();this.mode=null;this.menu=null;this.groups={};this.pings=[];this.evI=0;this.hudK='';this.cardK='';this.hintDone={};$('bSpeed').hidden=Net.on;$('bAgain').hidden=Net.on;
  document.body.dataset.fac=raw.p[ME].fac;this.skinConsole(raw.p[ME].fac);
  this.r.cam.z=this.r.w<820?.85:1.2;if(this.use3D){$('bGfx').hidden=false;$('bGfx').textContent='그래픽 '+(this.r.q==='high'?'높음':'낮음')}const h=this.g.p[ME].home;this.center(h.x*T,h.y*T);
  $('title').hidden=true;$('top').hidden=false;$('hud').hidden=false;$('over').hidden=true;$('pause').hidden=true;$('hint').hidden=false;
  const hq=this.g.blds.find(b=>b.p===ME);this.setSel([hq]);
  this.acc=0;this.speed=1;$('bSpeed').textContent='×1';this.overDone=false;this.say('출진했습니다. 일꾼은 자동으로 컴퓨트를 채취합니다.');
  const sp=$('splash');sp.hidden=true;void sp.offsetWidth;sp.innerHTML=`<small>${three?'삼국 대전 개막':'일기토 개막'}</small><div class="vs">${this.g.p.map((q,i)=>(i?'<span class="x">대</span>':'')+`<span class="n" style="--nc:${q.color}">${EMB[q.fac]}${FAC[q.fac].name}</span>`).join('')}</div>`;sp.hidden=false;clearTimeout(this.splT);this.splT=setTimeout(()=>{sp.hidden=true},2800);
 },
 skinConsole(f){
  const cv=document.createElement('canvas');cv.width=1600;cv.height=220;const c=cv.getContext('2d'),R=mulberry(f.length*77);
  if(f==='gem'){c.fillStyle='#39434f';c.fillRect(0,0,1600,220);for(let x=0;x<1600;x+=160){c.fillStyle=R()<.5?'#444f5c':'#343e4a';c.fillRect(x+1,10,158,210);for(const y of[18,212])for(const X of[x+9,x+151]){c.fillStyle='#1b222a';c.beginPath();c.arc(X,y,3.4,0,7);c.fill();c.fillStyle='#7c8896';c.beginPath();c.arc(X-.6,y-.6,1.7,0,7);c.fill()}}for(let x=-20;x<1600;x+=28){c.fillStyle='#e9b528';c.beginPath();c.moveTo(x,0);c.lineTo(x+14,0);c.lineTo(x+4,10);c.lineTo(x-10,10);c.fill()}}
  else if(f==='gpt'){const g=c.createLinearGradient(0,0,0,220);g.addColorStop(0,'#9fb4ae');g.addColorStop(1,'#5f7570');c.fillStyle=g;c.fillRect(0,0,1600,220);c.strokeStyle='rgba(47,214,160,.75)';c.lineWidth=2;for(let x=0;x<1600;x+=200){c.beginPath();c.arc(x+100,-20,110,0,Math.PI);c.stroke()}c.strokeStyle='rgba(40,60,60,.25)';c.lineWidth=1;for(let i=0;i<60;i++){let x=R()*1600,y=R()*220;c.beginPath();c.moveTo(x,y);for(let k=0;k<4;k++){x+=R()*44-22;y+=R()*24-12;c.lineTo(x,y)}c.stroke()}}
  else{c.fillStyle='#3a1a12';c.fillRect(0,0,1600,220);for(let i=0;i<340;i++){const x=R()*1600,y=R()*220,r=6+R()*26;c.fillStyle=`rgba(${70+R()*70|0},${28+R()*22|0},${18+R()*14|0},.46)`;c.beginPath();c.arc(x,y,r,0,7);c.fill()}c.lineCap='round';for(let i=0;i<42;i++){let x=R()*1600,y=R()*220;c.beginPath();c.moveTo(x,y);for(let k=0;k<5;k++){const nx=x+R()*90-45,ny=y+R()*44-22;c.quadraticCurveTo(x+R()*50-25,y+R()*30-15,nx,ny);x=nx;y=ny}c.strokeStyle=`rgba(255,${130+R()*60|0},50,${.3+R()*.5})`;c.lineWidth=1+R()*2.6;c.stroke()}}
  document.documentElement.style.setProperty('--console',`url(${cv.toDataURL('image/jpeg',.86)})`);
  const col=FAC[f].color,mk=dr=>{const k=document.createElement('canvas');k.width=k.height=32;dr(k.getContext('2d'));return k.toDataURL()};
  const arrow=mk(c=>{c.beginPath();c.moveTo(3,2);c.lineTo(3,24);c.lineTo(9,18);c.lineTo(13,28);c.lineTo(18,26);c.lineTo(14,16);c.lineTo(22,16);c.closePath();c.fillStyle=col;c.fill();c.strokeStyle='#04070b';c.lineWidth=2;c.stroke();c.fillStyle='rgba(255,255,255,.72)';c.beginPath();c.moveTo(5.5,7);c.lineTo(5.5,15);c.lineTo(10,12);c.fill()});
  const tgt=mk(c=>{c.strokeStyle='#04070b';c.lineWidth=4;c.beginPath();c.arc(16,16,9,0,7);c.moveTo(16,1);c.lineTo(16,9);c.moveTo(16,23);c.lineTo(16,31);c.moveTo(1,16);c.lineTo(9,16);c.moveTo(23,16);c.lineTo(31,16);c.stroke();c.strokeStyle='#ff5a4e';c.lineWidth=2;c.stroke()});
  document.documentElement.style.setProperty('--cur-arrow',`url(${arrow}) 3 2,default`);document.documentElement.style.setProperty('--cur-target',`url(${tgt}) 16 16,crosshair`);
 },
 toTitle(){Replay.stop();$('over').hidden=true;$('pause').hidden=true;$('top').hidden=true;$('hud').hidden=true;$('hint').hidden=true;$('say').hidden=true;$('tip').hidden=true;$('splash').hidden=true;$('diplo').hidden=true;$('groups').hidden=true;$('title').hidden=false;this.paused=false;this.mode=null;this.sel=[];this.selSet=new Set();this.startAttract()},
 setPause(v){this.paused=v;$('pause').hidden=!v;},
 center(wx,wy){const z=this.r.cam.z;this.r.cam.x=wx-this.r.w/2/z;this.r.cam.y=wy-(this.r.h-this.hudH())/2/z;this.r.clamp(this.hudH())},
 say(m){const e=$('say');e.textContent=m;e.hidden=false;this.sayT=performance.now()+3200},
 frame(now){
  requestAnimationFrame(t=>this.frame(t));
  if(this.hold)return;
  const rawDt=(now-this.lastT)/1000||0,dt=Math.min(.1,rawDt);this.lastT=now;
  const g=this.g;if(!g)return;
  if(this.playing){
   if(Net.on)Net.pump(Math.min(.5,rawDt));else if(!this.paused&&g.winner<0){this.acc+=dt*this.speed;let n=0;while(this.acc>=DT&&n<8){if(Replay.on)Replay.apply();g.step();this.acc-=DT;n++}if(this.mis)Campaign.tick()}
   this.panCam(dt);this.drainEvents();
   if(!this.paused&&g.winner<0)AudioFX.musicTick(g.p[ME].fac);
  }else{
   this.acc+=dt;let n=0;while(this.acc>=DT&&n<4){g.step();this.acc-=DT;n++}
   if(g.winner>=0&&(this.attractT+=dt)>4){this.attractT=0;this.startAttract();return}
   if(g.tick%150===0)this.attractFocus();
   if(this.camGoal){const c=this.r.cam;c.x+=(this.camGoal[0]-c.x)*dt*.7;c.y+=(this.camGoal[1]-c.y)*dt*.7;this.r.clamp(0)}
  }
  this.r.draw(this.playing?this:null,now);
  if(this.playing){
   if((this.fN=(this.fN||0)+1)%4===0)this.hud();
   if((this.miniN=(this.miniN||0)+1)%6===0)this.r.drawMini(this);
   if(g.winner>=0&&!this.overDone)this.gameOver();
  }
  if(!$('say').hidden&&now>this.sayT)$('say').hidden=true;
 },
 panCam(dt){
  if(this.paused)return;const c=this.r.cam,sp=900*dt/c.z;let dx=0,dy=0;
  if(this.keys.ArrowLeft)dx=-1;if(this.keys.ArrowRight)dx=1;if(this.keys.ArrowUp)dy=-1;if(this.keys.ArrowDown)dy=1;
  const m=this.mouse;
  if(m.in&&m.type==='mouse'&&!this.box&&!this.drag){const e=8;if(m.x<e)dx=-1;if(m.x>this.r.w-e)dx=1;if(m.y<e)dy=-1;if(m.y>this.r.h-e)dy=1}
  c.x+=dx*sp;c.y+=dy*sp;this.r.clamp(this.hudH());
 },
 drainEvents(){
  const g=this.g,list=g.events;
  while(g.notices.length){const n=g.notices.shift();this.say(n);AudioFX.play('alert')}
  while(list.length){const e=list.shift();
   if(e.type==='nope'){this.say('그 위치에는 건설할 수 없습니다.')}
   else if(e.type==='done'&&e.p===ME){AudioFX.play('done');this.say('완료했습니다.')}
   else{if(g.tileVis(e.x,e.y)&&this.onScreen(e.x,e.y)&&e.type!=='spawn')AudioFX.play(e.type)}
  }
  for(const e of [...g.units,...g.blds]){
   if(e.p===ME&&g.tick-e.lastHit===1&&!this.onScreen(e.x,e.y)&&performance.now()-this.lastAlert>6000){
    this.lastAlert=performance.now();this.alertPos=[e.x,e.y];this.pings.push({x:e.x,y:e.y,t:performance.now()});this.say('공격받고 있습니다. Space로 이동합니다.');AudioFX.play('alert');break}
  }
  if(this.pings.length>6)this.pings.shift();
  this.sel=this.sel.filter(e=>!e.dead&&!e.stowed);this.selSet=new Set(this.sel.map(e=>e.id));
 },
 onScreen(x,y){const c=this.r.cam,z=c.z;return x>c.x&&y>c.y&&x<c.x+this.r.w/z&&y<c.y+(this.r.h-this.hudH())/z},
 setSel(list,add){
  if(add){const ids=new Set(this.sel.map(e=>e.id));for(const e of list)if(!ids.has(e.id))this.sel.push(e)}else this.sel=list.slice();
  this.sel=this.sel.slice(0,36);this.selSet=new Set(this.sel.map(e=>e.id));this.hudK='';this.cardK='';this.menu=null;
 },
 pick(wx,wy){
  const g=this.g,r=this.r,z=r.cam.z,q=r.project(wx,wy,0);let best=null,bd=1e9;
  const ok=e=>e.p===ME||g.observer||(e.kind==='b'?e.seen:g.tileVis(e.x,e.y));
  for(const u of g.units){if(!ok(u))continue;const hs=u.air?46:Math.max(14,u.r*1.5);let m=1e9;for(const h of [0,hs*.5,hs]){const p=r.project(u.x,u.y,h);m=Math.min(m,hyp(p[0]-q[0],p[1]-q[1]))}const d=m-(u.r*1.25+8)*z;if(d<0&&d<bd){bd=d;best=u}}
  if(best)return best;
  for(const b of g.blds){if(!ok(b))continue;if(wx>=b.tx*T&&wx<=(b.tx+b.w)*T&&wy>=b.ty*T&&wy<=(b.ty+b.h)*T)return b;if(r.is3D){const p=r.project(b.x,b.y,b.def.role==='hq'?60:38);if(hyp(p[0]-q[0],p[1]-q[1])<b.r*.88*z)return b}}
  for(const n of g.res){if(!g.tileExp(n.x,n.y))continue;if(wx>=n.tx*T-3&&wx<=(n.tx+n.w)*T+3&&wy>=n.ty*T-12&&wy<=(n.ty+n.h)*T+3)return n}
  return null;
 },
 myUnits(){return this.sel.filter(e=>e.kind==='u'&&e.p===ME)},
 myBlds(){return this.sel.filter(e=>e.kind==='b'&&e.p===ME)},
 smart(wx,wy){
  const g=this.g,us=this.myUnits(),bs=this.myBlds(),t=this.pick(wx,wy);
  if(us.length){
   if(t&&t.kind==='b'&&t.p===ME&&t.def.role==='ext'&&t.built&&us.every(u=>u.def.worker)){const l=g.by.get(t.lake);if(l){g.cmdGather(us,l);this.ack('go');return}}
   if(t&&t.kind==='r'&&t.type==='d'&&us.some(u=>u.def.worker)&&!(t.ext&&t.ext.p===ME&&t.ext.built)){this.say('데이터 수집 건물을 먼저 지어야 합니다.');return}
   if(t&&t.kind==='r'){const w=us.filter(u=>u.def.worker);if(w.length){g.cmdGather(w,t);const o=us.filter(u=>!u.def.worker);if(o.length)g.cmdMove(o,wx,wy);this.mark(t.x,t.y,'#bff3e6');this.ack('go');return}}
   if(t&&t.p>=0&&t.p!==ME&&g.hostile(ME,t.p)){g.cmdAttack(us,t);const no=us.filter(u=>!g.canHit(u,t));if(no.length)g.cmdMove(no,wx,wy,true);this.mark(t.x,t.y,'#ff8a8a');this.ack('atk');return}
   if(t&&t.p===ME&&t.kind==='b'&&us.every(u=>u.def.worker)){
    if(us[0].def.fac==='gem'&&(!t.built||t.hp<t.def.hp)){g.cmdRepair(us,t);this.mark(t.x,t.y,'#bff3e6');AudioFX.play('ui');return}
    if(t.def.role==='hq'&&us.some(u=>u.carry>0)){for(const u of us)g.setOrder(u,{t:'gather',id:(g.findRes(u,u.carryType||'c')||{}).id,ph:'ret'});return}
   }
   if(t&&t.p===ME&&t.kind==='u'&&us.every(u=>u.def.worker&&u.def.fac==='gem')&&t.def.tags.includes('mech')&&t.hp<t.def.hp&&!us.includes(t)){g.cmdRepair(us,t);return}
   g.cmdMove(us,wx,wy,false,this.shift);this.mark(wx,wy,'#8ef0b0');this.ack('go');return;
  }
  if(bs.length){if(t&&t.kind==='r')g.setRally(bs,t.x,t.y,t);else g.setRally(bs,wx,wy);this.mark(wx,wy,'#8ef0b0');this.say('집결지를 지정했습니다.')}
 },
 ack(kind){
  const u=this.sel.find(e=>e.p===ME);if(!u||u.kind!=='u')return;const L=LINES[u.def.fac][kind],t=L[Math.floor(Math.random()*L.length)];const l=$('line');if(l)l.textContent=t;AudioFX.voice(u.def.fac);
 },
 mark(x,y,c){this.g.fx.push({k:'move',x,y,r:12,t:0,d:.45,c})},
 selectIdle(){const l=this.g.units.filter(u=>u.p===ME&&u.def.worker&&!u.o);if(l.length){const u=l[Math.floor(this.g.tick/5)%l.length];this.setSel([u]);this.center(u.x,u.y)}},
 selectArmy(){const l=this.g.units.filter(u=>u.p===ME&&!u.def.worker);this.setSel(l);if(l[0])this.center(l[0].x,l[0].y)},
 beginAbility(){
  const g=this.g;if(!g||!this.playing)return;const p=g.p[ME];
  if(!g.hasBuilt(ME,'tech')){this.say('연구소를 먼저 완공해야 합니다.');return}
  if(p.abilCd>0){this.say('재사용 대기 중입니다.');return}
  if(p.d<ABIL[p.fac].d){this.say('데이터가 부족합니다.');return}
  this.mode={t:'abil'};this.say(ABIL[p.fac].name+': 위치를 선택하십시오.');
 },
 applyTarget(wx,wy){
  const m=this.mode,g=this.g;if(!m)return false;
  if(m.t==='amove'){const us=this.myUnits(),t=this.pick(wx,wy);if(t&&t.p>=0&&t.p!==ME&&g.hostile(ME,t.p)&&!this.shift){g.cmdAttack(us.filter(u=>g.canHit(u,t)),t)}else g.cmdMove(us,wx,wy,true,this.shift);this.mark(wx,wy,'#ff8a8a');this.mode=null;this.ack('atk');return true}
  if(m.t==='patrol'){g.cmdPatrol(this.myUnits(),wx,wy);this.mark(wx,wy,'#8ef0b0');this.mode=null;this.ack('go');return true}
  if(m.t==='abil'){if(g.castAbility(ME,wx,wy))AudioFX.play('ability');this.mode=null;return true}
  if(m.t==='place'){
   const d=BLD[m.key],[tx,ty]=this.siteFor(m.key,wx,wy);
   if(!g.canPlace(ME,m.key,tx,ty)){if(d.role==='ext'){this.say('데이터 레이크 위에 지어야 합니다.');return true}this.say(g.p[ME].fac==='cla'&&d.role!=='hq'?'Claude 건물은 맥락 지대 안에만 지을 수 있습니다.':d.role==='hq'?'자원과 3칸 이상 떨어진 빈 땅이 필요합니다.':'그 위치에는 건설할 수 없습니다.');return true}
   const ws=this.myUnits().filter(u=>u.def.worker);
   let w=null,bd=1e9;for(const u of ws){const dd=hyp(u.x-wx,u.y-wy);if(dd<bd){bd=dd;w=u}}
   if(!w){this.mode=null;return true}
   if(!g.cmdBuild(w,m.key,tx,ty)){this.say('자원이 부족합니다.');this.mode=null;return true}
   AudioFX.play('ui');this.mode=this.shift?m:null;
   return true;
  }
  return false;
 },
 siteFor(key,wx,wy){
  const d=BLD[key];
  if(d.role==='ext'){let best=null,bd=1e9;for(const r of this.g.res){if(r.type!=='d'||r.ext)continue;const v=hyp(r.x-wx,r.y-wy);if(v<bd){bd=v;best=r}}if(best&&bd<90)return[best.tx,best.ty]}
  return[Math.round(wx/T-d.w/2),Math.round(wy/T-d.h/2)];
 },
 bindInput(){
  const v=$('view');
  const pos=e=>{const r=v.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
  v.addEventListener('contextmenu',e=>e.preventDefault());
  v.addEventListener('pointerdown',e=>{
   if(!this.playing||this.paused)return;
   AudioFX.init();const [sx,sy]=pos(e),[wx,wy]=this.r.toWorld(sx,sy);this.mouse.type=e.pointerType;v.setPointerCapture(e.pointerId);
   this.shift=e.shiftKey;
   if(e.pointerType==='touch'){this.tap={sx,sy,x0:this.r.cam.x,y0:this.r.cam.y,moved:false,id:e.pointerId};return}
   if(e.button===1){this.drag={sx,sy,x0:this.r.cam.x,y0:this.r.cam.y};e.preventDefault();return}
   if(e.button===2){if(this.mode){this.mode=null;return}this.smart(wx,wy);return}
   if(e.button===0){if(this.mode){this.applyTarget(wx,wy);return}this.box={sx,sy,cx:sx,cy:sy}}
  });
  v.addEventListener('pointermove',e=>{
   const [sx,sy]=pos(e);this.mouse.x=sx;this.mouse.y=sy;this.mouse.in=true;this.mouse.type=e.pointerType;
   if(this.tap&&e.pointerId===this.tap.id){const dx=sx-this.tap.sx,dy=sy-this.tap.sy;if(hyp(dx,dy)>10)this.tap.moved=true;if(this.tap.moved){const z=this.r.cam.z;this.r.cam.x=this.tap.x0-dx/z;this.r.cam.y=this.tap.y0-dy/z;this.r.clamp(this.hudH())}return}
   if(this.drag){const z=this.r.cam.z;this.r.cam.x=this.drag.x0-(sx-this.drag.sx)/z;this.r.cam.y=this.drag.y0-(sy-this.drag.sy)/z;this.r.clamp(this.hudH());return}
   if(this.box){this.box.cx=sx;this.box.cy=sy}
  });
  v.addEventListener('pointerleave',()=>{this.mouse.in=false});
  const up=e=>{
   const [sx,sy]=pos(e);
   if(this.tap&&e.pointerId===this.tap.id){const tp=this.tap;this.tap=null;if(!tp.moved&&this.playing&&!this.paused){const [wx,wy]=this.r.toWorld(sx,sy);if(this.mode){this.applyTarget(wx,wy);return}
     const hit=this.pick(wx,wy);
     if(hit&&hit.p===ME&&!(this.myUnits().length&&hit.kind==='b'&&this.myUnits().every(u=>u.def.worker)&&hit.def.fac==='gem'&&(!hit.built||hit.hp<hit.def.hp))){this.setSel([hit]);return}
     if(this.sel.length&&this.sel[0].p===ME)this.smart(wx,wy);else this.setSel(hit&&hit.p!==-1?[hit]:[])}
    return}
   if(this.drag){this.drag=null;return}
   if(this.box){const b=this.box;this.box=null;this.finishBox(b,e.shiftKey)}
  };
  v.addEventListener('pointerup',up);v.addEventListener('pointercancel',()=>{this.box=null;this.drag=null;this.tap=null});
  v.addEventListener('wheel',e=>{if(!this.playing)return;e.preventDefault();const [sx,sy]=pos(e),[wx,wy]=this.r.toWorld(sx,sy),c=this.r.cam;const oz=c.z,mx=c.x+this.r.w/2/oz,my=c.y+this.r.h/2/oz;c.z=Math.max(.5,Math.min(1.8,c.z*(e.deltaY<0?1.1:.91)));if(this.r.is3D){c.x=mx-this.r.w/2/c.z;c.y=my-this.r.h/2/c.z}else{c.x=wx-sx/c.z;c.y=wy-sy/c.z}this.r.clamp(this.hudH())},{passive:false});
  const mini=$('mini'),mp=e=>{const r=mini.getBoundingClientRect();return[(e.clientX-r.left)/r.width*MW*T,(e.clientY-r.top)/r.height*MH*T]};
  let md=false;mini.addEventListener('contextmenu',e=>e.preventDefault());
  mini.addEventListener('pointerdown',e=>{if(!this.playing)return;mini.setPointerCapture(e.pointerId);const [x,y]=mp(e);if(e.button===2){if(this.sel.length)this.smart(x,y);return}if(this.mode&&this.mode.t!=='place'){this.applyTarget(x,y);return}md=true;this.center(x,y)});
  mini.addEventListener('pointermove',e=>{if(md){const [x,y]=mp(e);this.center(x,y)}});
  mini.addEventListener('pointerup',()=>md=false);
  addEventListener('keydown',e=>{
   if(!this.playing)return;
   this.keys[e.key]=true;
   if(e.key.startsWith('Arrow')||e.key===' '||e.key==='Tab')e.preventDefault();
   if(this.g.winner>=0)return;
   if(e.key==='Escape'){if(this.mode){this.mode=null;return}if(this.menu){this.menu=null;this.cardK='';return}this.setPause(!this.paused);return}
   if(this.paused)return;this.shift=e.shiftKey;
   const dg=e.code.startsWith('Digit')?e.code.slice(5):null;
   if(dg&&dg!=='0'){
    if(e.ctrlKey||e.metaKey){e.preventDefault();this.groups[dg]=this.sel.map(x=>x.id);this.say('부대 '+dg+'을(를) 지정했습니다.');return}
    const ids=this.groups[dg];if(ids){const l=ids.map(i=>this.g.by.get(i)).filter(x=>x&&!x.dead&&!x.stowed);
     if(this.lastDg===dg&&performance.now()-this.lastDgT<320&&l[0])this.center(l[0].x,l[0].y);this.lastDg=dg;this.lastDgT=performance.now();this.setSel(l)}return}
   const k=e.code==='Space'?' ':e.code.startsWith('Key')?e.code.slice(3).toLowerCase():e.key.toLowerCase();
   if(k===' '){if(this.alertPos)this.center(this.alertPos[0],this.alertPos[1]);return}
   if(k==='f'){this.beginAbility();return}
   if(k==='i'){this.selectIdle();return}
   if(k==='g'){this.selectArmy();return}
   const c=(this.card||[]).find(b=>b.key===k);if(c){e.preventDefault();this.run(c)}
  });
  addEventListener('keyup',e=>{this.keys[e.key]=false});
  addEventListener('blur',()=>{this.keys={};this.mouse.in=false});
  document.addEventListener('dblclick',e=>{if(!this.playing||e.target!==v)return;const [sx,sy]=pos(e),[wx,wy]=this.r.toWorld(sx,sy),t=this.pick(wx,wy);if(t&&t.p===ME&&t.kind==='u'){this.setSel(this.g.units.filter(u=>u.p===ME&&u.def===t.def&&this.onScreen(u.x,u.y)))}});
 },
 finishBox(b,add){
  const g=this.g,x0=Math.min(b.sx,b.cx),x1=Math.max(b.sx,b.cx),y0=Math.min(b.sy,b.cy),y1=Math.max(b.sy,b.cy);
  if(x1-x0<6&&y1-y0<6){const [wx,wy]=this.r.toWorld(b.cx,b.cy),t=this.pick(wx,wy);if(t){if(add&&t.p===ME&&t.kind==='u')this.setSel([t],true);else this.setSel(t.kind==='r'?[]:[t])}else if(!add)this.setSel([]);return}
  const inBox=(e,h)=>{const p=this.r.project(e.x,e.y,h);return p[0]>=x0&&p[0]<=x1&&p[1]>=y0&&p[1]<=y1};
  const l=g.units.filter(u=>u.p===ME&&inBox(u,u.air?30:10));
  if(l.length){const army=l.filter(u=>!u.def.worker);this.setSel(army.length?army:l,add);return}
  if(!add){const bl=g.blds.filter(c=>c.p===ME&&inBox(c,20));this.setSel(bl.slice(0,1))}
 },
 drawWorld(c,t){
  const g=this.g,m=this.mode;
  for(const u of this.sel){if(u.kind!=='u'||u.p!==ME||!u.oq||!u.oq.length)continue;c.strokeStyle='rgba(125,255,154,.5)';c.lineWidth=1.3;c.setLineDash([5,5]);c.beginPath();c.moveTo(u.x,u.y);if(u.o&&u.o.x!=null)c.lineTo(u.o.x,u.o.y);for(const q of u.oq)c.lineTo(q.x,q.y);c.stroke();c.setLineDash([]);for(const q of u.oq){circ(c,q.x,q.y,3);c.fillStyle=q.t==='amove'?'#ff8a8a':'#7dff9a';c.fill()}}
  if(m&&m.t==='place'){
   const d=BLD[m.key],[wx,wy]=this.r.toWorld(this.mouse.x,this.mouse.y),[tx,ty]=this.siteFor(m.key,wx,wy),ok=g.canPlace(ME,m.key,tx,ty),sp=Sprites.get(m.key,g.p[ME].color);
   if(sp){c.globalAlpha=.68;c.drawImage(sp.cv,(tx+d.w/2)*T-sp.ax/sp.S,(ty+d.h/2)*T-sp.ay/sp.S,sp.cw/sp.S,sp.ch/sp.S);c.globalAlpha=1}c.globalAlpha=.34;c.fillStyle=ok?'#7dff9a':'#ff4a3d';c.fillRect(tx*T,ty*T,d.w*T,d.h*T);c.globalAlpha=1;
  }
  if(m&&m.t==='abil'){const [wx,wy]=this.r.toWorld(this.mouse.x,this.mouse.y),R=ABIL[g.p[ME].fac].r*T;circ(c,wx,wy,R);c.fillStyle='rgba(255,255,255,.08)';c.fill();c.strokeStyle=PEARL;c.lineWidth=1.6;c.setLineDash([8,6]);c.stroke();c.setLineDash([])}
 },
 drawWorld3D(c,t,r){
  const g=this.g,m=this.mode;
  for(const u of this.sel){if(u.kind!=='u'||u.p!==ME||!u.oq||!u.oq.length)continue;c.strokeStyle='rgba(125,255,154,.6)';c.lineWidth=1.3;c.setLineDash([5,5]);c.beginPath();let p=r.project(u.x,u.y,2);c.moveTo(p[0],p[1]);if(u.o&&u.o.x!=null){p=r.project(u.o.x,u.o.y,2);c.lineTo(p[0],p[1])}for(const q of u.oq){p=r.project(q.x,q.y,2);c.lineTo(p[0],p[1])}c.stroke();c.setLineDash([]);for(const q of u.oq){p=r.project(q.x,q.y,2);circ(c,p[0],p[1],3);c.fillStyle=q.t==='amove'?'#ff8a8a':'#7dff9a';c.fill()}}
  if(m&&m.t==='place'){
   const d=BLD[m.key],[wx,wy]=r.toWorld(this.mouse.x,this.mouse.y),[tx,ty]=this.siteFor(m.key,wx,wy),ok=g.canPlace(ME,m.key,tx,ty);
   c.fillStyle=ok?'rgba(125,255,154,.42)':'rgba(255,74,61,.48)';c.strokeStyle=ok?'#7dff9a':'#ff4a3d';c.lineWidth=2;c.beginPath();[[tx,ty],[tx+d.w,ty],[tx+d.w,ty+d.h],[tx,ty+d.h]].forEach((q,i)=>{const p=r.project(q[0]*T,q[1]*T,2);i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])});c.closePath();c.fill();c.stroke();
   const ic=this._ghost&&this._ghost.k===m.key?this._ghost.i:null;if(!ic){const im=new Image();im.src=iconURL(m.key,g.p[ME].color,160);this._ghost={k:m.key,i:im}}else if(ic.complete){const p=r.project((tx+d.w/2)*T,(ty+d.h/2)*T,0),S2=d.w*T*r.cam.z*1.18;c.globalAlpha=.72;c.drawImage(ic,p[0]-S2/2,p[1]-S2*.78,S2,S2);c.globalAlpha=1}
  }
  if(m&&m.t==='abil'){const [wx,wy]=r.toWorld(this.mouse.x,this.mouse.y);r.ring3(c,wx,wy,r.gh(wx,wy)+4,ABIL[g.p[ME].fac].r*T,'#fff',t,1.8)}
 },
 drawScreen(c){
  const b=this.box;if(b&&(Math.abs(b.cx-b.sx)>3||Math.abs(b.cy-b.sy)>3)){c.strokeStyle='#8ef0b0';c.lineWidth=1.2;c.fillStyle='rgba(142,240,176,.09)';c.fillRect(b.sx,b.sy,b.cx-b.sx,b.cy-b.sy);c.strokeRect(b.sx,b.sy,b.cx-b.sx,b.cy-b.sy)}
  if(this.mode&&this.mode.t==='patrol'){c.fillStyle='#8ef0b0';c.font='12px '+getComputedStyle(document.body).fontFamily;c.fillText('순찰 지점 선택',this.mouse.x+14,this.mouse.y+4)}
  if(this.mode&&this.mode.t==='amove'){c.fillStyle='#ff8a8a';c.font='12px '+getComputedStyle(document.body).fontFamily;c.fillText('공격 위치 선택',this.mouse.x+14,this.mouse.y+4)}
 },
 run(b){if(b.enabled===false){this.say(b.reason||'지금은 사용할 수 없습니다.');AudioFX.play('ui');return}AudioFX.play('ui');b.fn();this.cardK=''},
 cardFor(){
  const g=this.g,p=g.p[ME],s=this.sel.filter(e=>e.p===ME),out=new Array(9).fill(null);
  if(!s.length)return out;
  const us=s.filter(e=>e.kind==='u'),bs=s.filter(e=>e.kind==='b');
  const cost=d=>{if(!g.canAfford(p,d.c,d.d))return p.c<d.c?'컴퓨트가 부족합니다.':'데이터가 부족합니다.';return null};
  const put=(i,b)=>{out[i]=b};
  if(us.length){
   if(this.menu==='build'&&us.every(u=>u.def.worker)){
    const keys=['q','w','e','r','t','y','a','s'],roles=['hq','sup','ext','bar','tech','twr','aura','adv'],order=[0,1,2,3,4,5,6,7];
    roles.forEach((role,i)=>{const k=p.fac+'_'+role,d=BLD[k];let reason=null;if(!g.reqMet(ME,d))reason=BLD[p.fac+'_'+d.req].name+'을(를) 먼저 완공해야 합니다.';else reason=cost(d);put(order[i],{key:keys[i],icon:k,def:d,enabled:!reason,reason,on:this.mode&&this.mode.key===k,fn:()=>{this.mode={t:'place',key:k};this.say(d.name+': 건설 위치를 선택하십시오.')}})});
    put(8,{key:'c',label:'이전',desc:'이전 메뉴로 돌아갑니다.',fn:()=>{this.menu=null;this.mode=null}});
    return out;
   }
   if(us.some(u=>u.def.dmg)){put(0,{key:'a',label:'공격',desc:'이동하면서 만나는 적을 공격합니다.',fn:()=>{this.mode={t:'amove'}},on:this.mode&&this.mode.t==='amove'});put(2,{key:'h',label:'사수',desc:'자리를 지키며 사거리 안의 적만 공격합니다.',fn:()=>g.cmdHold(this.myUnits())})}
   if(us.some(u=>u.def.dmg&&!u.def.worker))put(4,{key:'p',label:'순찰',desc:'현재 위치와 지정 지점을 왕복하며 적을 공격합니다.',fn:()=>{this.mode={t:'patrol'}},on:this.mode&&this.mode.t==='patrol'});
   put(1,{key:'s',label:'정지',desc:'현재 명령을 취소합니다.',fn:()=>g.cmdStop(this.myUnits())});
   if(us.every(u=>u.def.worker))put(3,{key:'b',label:'건설',desc:'건설할 건물을 선택합니다.',fn:()=>{this.menu='build'}});
   const sk=us.find(u=>u.def.skill);if(sk){const S2=SKILL[sk.def.skill],ready=us.some(u=>u.def.skill===sk.def.skill&&!(u.skillCd>0));put(5,{key:'t',label:S2.name,desc:S2.desc,enabled:ready,reason:'재사용 대기 중입니다.',on:sk.deployed,fn:()=>{g.cmdSkill(this.myUnits().filter(u=>u.def.skill===sk.def.skill));this.ack('atk')}})}
  }else if(bs.length){
   const b=bs[0],d=b.def;
   if(!b.built){put(8,{key:'c',label:'취소',desc:'건설을 취소하고 비용의 75%를 돌려받습니다.',fn:()=>{g.cancelBuild(b);this.setSel([])}});return out}
   const same=bs.filter(x=>x.def===d),keys=['q','w','e','r','a','s','d','z'];
   const least=()=>same.slice().sort((a,b2)=>a.q.length-b2.q.length)[0];
   if(d.modes){['inf','mech','air'].forEach((m,i)=>{put(6+i,{key:['z','x','c'][i],label:MODE_NAME[m],desc:MODE_NAME[m]+' 모드로 전환합니다. 생산 대기열이 비어 있어야 합니다.',on:b.mode===m,enabled:!b.q.length&&b.modeT<=0,reason:'대기열이 비어 있어야 전환할 수 있습니다.',fn:()=>{for(const x of same)g.setMode(x,m)}})})}
   const list=d.modes?d.modes[b.mode]:d.trains;
   if(list&&b.modeT<=0)list.forEach((k,i)=>{
    const ud=UNIT[k];let reason=null;
    if(!g.reqMet(ME,ud))reason=BLD[p.fac+'_'+ud.req].name+' 완공이 필요합니다.';else if(p.supUsed+ud.sup*(ud.count||1)>Math.min(p.supCap,SUP_MAX))reason='토큰 한도가 부족합니다. 증설 건물을 지으십시오.';else reason=cost(ud);
    if(!reason&&least().q.length>=5)reason='대기열이 가득 찼습니다.';
    put(i,{key:keys[i],icon:k,def:ud,enabled:!reason,reason,fn:()=>{const r=g.train(least(),k);if(r==='sup')this.say('토큰 한도를 초과했습니다.')}});
   });
   if(d.role==='tech'){
    const line=(id,list,cur,slot,key)=>{const pending=g.blds.some(o=>o.p===ME&&o.q.some(q=>q.kind==='r'&&q.line===id)),lvl=cur+(pending?1:0);if(lvl>=list.length)return;const r=list[lvl],reason=b.q.length?'연구가 진행 중입니다.':cost(r);put(slot,{key,label:r.name,def:r,enabled:!reason,reason,fn:()=>g.research(b,id)})};
    line('atk',RESEARCH,p.atk,0,'q');line('arm',ARMOR,p.arm,1,'w');
   }
  }
  return out;
 },
 hud(){
  const g=this.g,p=g.p[ME],m=Math.floor(g.tick/TPS);
  $('rc').textContent=Math.floor(p.c);$('rd').textContent=Math.floor(p.d);
  const su=Math.ceil(p.supUsed),cap=Math.min(p.supCap,SUP_MAX);$('rs').textContent=su+'/'+cap;$('rsw').classList.toggle('alarm',su>=cap);
  $('clock').textContent=Math.floor(m/60)+':'+String(m%60).padStart(2,'0');
  $('idleN').textContent=g.units.filter(u=>u.p===ME&&u.def.worker&&!u.o).length;
  this.renderHint();this.renderDiplo();this.renderGroups();
  $('view').classList.toggle('tgt',!!this.mode&&this.mode.t!=='place');
  const ab=$('abil'),ad=ABIL[p.fac];
  if(g.hasBuilt(ME,'tech')){ab.classList.add('show');const cd=Math.max(0,p.abilCd);$('abilT').textContent=ad.name+' · 데이터 '+ad.d+(cd>0?' · '+Math.ceil(cd)+'초':' · F');$('abilCd').style.width=(cd/ad.cd*100)+'%';ab.style.opacity=(p.d<ad.d||cd>0)?.6:1;ab.title=ad.desc}else ab.classList.remove('show');
  this.renderSel();this.renderCard();
 },
 renderDiplo(){
  const g=this.g,el=$('diplo');if(g.p.length!==3)return;
  const parts=g.p.filter(q=>q.id!==ME).map(q=>{const ally=g.ally[ME][q.id]>g.tick,left=ally?Math.ceil((g.ally[ME][q.id]-g.tick)/TPS):0;return q.id+':'+(q.out?'x':ally?'a':'e')+':'+(left>>0)}),k=parts.join('|');
  if(k===this.diploK)return;const rebuild=this.diploS!==parts.map(x=>x.split(':').slice(0,2).join()).join();this.diploK=k;
  if(!rebuild){g.p.filter(q=>q.id!==ME).forEach(q=>{const e=$('dp-'+q.id);if(e&&g.ally[ME][q.id]>g.tick)e.textContent='동맹 '+Math.ceil((g.ally[ME][q.id]-g.tick)/TPS)+'초'});return}
  this.diploS=parts.map(x=>x.split(':').slice(0,2).join()).join();el.innerHTML='';
  for(const q of g.p.filter(q=>q.id!==ME)){const d=document.createElement('div');d.className='dp';d.style.setProperty('--dc',q.color);const ally=g.ally[ME][q.id]>g.tick;
   d.innerHTML=`${EMB[q.fac]}<b>${FAC[q.fac].name}</b><span id="dp-${q.id}">${q.out?'멸망':ally?'동맹':'적대'}</span>`;
   if(!q.out){const b=document.createElement('button');b.textContent=ally?'파기':'동맹 제안';b.onclick=()=>{if(g.winner>=0)return;if(g.ally[ME][q.id]>g.tick){g.betray(ME,q.id);this.diploK='';return}const r=g.propose(ME,q.id);this.say(r==='ok'?FAC[q.fac].name+'이(가) 동맹을 받아들였습니다. 3분간 유지됩니다.':r==='wait'?'아직 재협상할 수 없습니다.':FAC[q.fac].name+'이(가) 동맹을 거절했습니다.');this.diploK=''};d.appendChild(b)}
   el.appendChild(d)}
 },
 renderGroups(){
  const g=this.g,el=$('groups'),items=[];
  for(let i=1;i<=9;i++){const ids=this.groups[i];if(!ids)continue;const l=ids.map(x=>g.by.get(x)).filter(x=>x&&!x.dead&&!x.stowed);if(l.length)items.push([i,l])}
  const k=items.map(([i,l])=>i+':'+l.length+':'+l[0].def.key).join('|');if(k===this.groupK)return;this.groupK=k;el.hidden=!items.length;el.innerHTML='';
  for(const [i,l] of items){const b=document.createElement('button');b.title='부대 '+i;b.innerHTML=`<img alt="" src="${iconURL(l[0].def.key,g.p[ME].color,76)}"><em>${i}</em><u>${l.length}</u>`;b.onclick=()=>{const now=performance.now();const list=(this.groups[i]||[]).map(x=>g.by.get(x)).filter(x=>x&&!x.dead&&!x.stowed);if(this.lastGb===i&&now-this.lastGbT<320&&list[0])this.center(list[0].x,list[0].y);this.lastGb=i;this.lastGbT=now;this.setSel(list)};el.appendChild(b)}
 },
 renderHint(){
  const g=this.g,p=g.p[ME],ws=g.units.filter(u=>u.p===ME&&u.def.worker).length,army=g.units.filter(u=>u.p===ME&&!u.def.worker).length,has=r=>g.blds.some(b=>b.p===ME&&b.def.role===r),h=$('hint'),f=p.fac;
  let s=null;
  if(g.tick/TPS>540||this.mis){h.hidden=true;return}
  if(!has('bar')&&ws<8)s='본진을 선택하고 Q로 일꾼을 늘리십시오. 일꾼 8기가 목표입니다.';
  else if(p.supUsed+2>=p.supCap&&!g.blds.some(b=>b.p===ME&&b.def.role==='sup'&&!b.built))s='토큰 한도가 곧 찹니다. 일꾼을 선택하고 B → W로 '+BLD[f+'_sup'].name+'를 지으십시오.';
  else if(!has('bar'))s='일꾼을 선택하고 B → R로 '+BLD[f+'_bar'].name+'을(를) 지으십시오.';
  else if(!has('ext'))s='일꾼을 선택하고 B → E로 데이터 레이크 위에 '+BLD[f+'_ext'].name+'를 지으십시오.';
  else if(army<6)s=BLD[f+'_bar'].name+'에서 전투 유닛을 훈련하고, 일꾼 3기를 '+BLD[f+'_ext'].name+'로 우클릭해 보내십시오.';
  else if(!has('tech'))s='B → T로 '+BLD[f+'_tech'].name+'를 지으면 고급 유닛과 전술 스킬(F)이 열립니다.';
  else if(army<14)s='병력을 모으십시오. 유닛마다 T로 쓰는 스킬이 있을 수 있습니다.';
  else s='G로 전군을 선택하고 A를 누른 뒤 미니맵의 적 기지 방향을 클릭하십시오.';
  if(h.dataset.t!==s){h.dataset.t=s;h.innerHTML='<small>지휘 메모</small>'+s}h.hidden=false;
 },
 renderSel(){
  const el=$('sel'),s=this.sel,g=this.g;
  let key=s.length+':'+s.slice(0,1).map(e=>e.id)+(s.length>1?s.map(e=>e.id).join():'');
  const prog=e=>e&&e.kind==='b'?(e.built?1:0)+'/'+e.q.map(q=>q.key||q.lvl).join():'';
  const k2=key+prog(s[0]);
  if(!s.length){if(this.hudK!=='none'){this.hudK='none';$('portI').removeAttribute('src');$('line').textContent='';el.innerHTML='<div class="info"><p style="margin-top:6px">유닛이나 건물을 선택하십시오.</p></div>'}return}
  if(k2!==this.hudK){
   this.hudK=k2;
   if(s.length===1)this.buildSingle(el,s[0]);
   else{$('portI').removeAttribute('src');$('line').textContent=s.length+'기 선택';el.innerHTML='<div class="grid" id="mems"></div>';const w=$('mems');s.forEach(e=>{const b=document.createElement('button');b.className='mem';b.innerHTML=`<img alt="${e.def.name}" src="${iconURL(e.def.key,g.p[e.p].color)}"><i></i>`;b.dataset.id=e.id;b.onclick=()=>this.setSel([e]);w.appendChild(b)})}
  }
  if(s.length===1){this.updSingle(s[0])}
  else{for(const b of $('mems').children){const e=g.by.get(+b.dataset.id);if(!e)continue;const f=Math.max(0,e.hp/e.def.hp),i=b.lastChild;i.style.width=(f*100)+'%';i.style.background=f>.5?'#7be08f':f>.25?'#ffc765':'#ff6b6b'}}
 },
 buildSingle(el,e){
  const g=this.g,color=e.p>=0?g.p[e.p].color:'#bff3e6';
  if(e.kind==='r'){$('portI').removeAttribute('src');$('line').textContent='';el.innerHTML=`<div class="info"><h3>${e.type==='c'?'컴퓨트 노드':'데이터 레이크'}</h3><p>일꾼으로 채취합니다. 남은 양 <b id="rAmt"></b></p></div>`;return}
  const d=e.def,own=e.p===ME;
  let stats='';
  if(d.dmg)stats+=`<span>공격<b>${Math.round(d.dmg)}</b></span><span>주기<b>${d.cd}초</b></span><span>사거리<b>${d.rng}</b></span>`;
  if(d.spd)stats+=`<span>속도<b>${d.spd}</b></span>`;
  if(d.heal)stats+=`<span>회복<b>초당 ${d.heal.amt}</b></span>`;
  if(d.skill==='cargo')stats+=`<span>탑재<b id="cargoN">0</b></span>`;
  if(d.tags)stats+=`<span>유형<b>${d.tags.includes('armored')?'중장갑':d.tags.includes('mech')?'기계':'경장갑'}${d.air?'·공중':''}</b></span>`;
  const pi=$('portI');pi.src=iconURL(d.key,color,180);if(own&&e.kind==='u'){const L=LINES[d.fac].sel;$('line').textContent=L[e.id%L.length]}else $('line').textContent='';AudioFX.voice&&own&&e.kind==='u'&&AudioFX.voice(d.fac);
  el.innerHTML=`<div class="info"><h3>${d.name}</h3><p>${own?d.desc:(FAC[d.fac].name+' 진영')}</p>
   <div class="bar"><i id="hpB"></i></div>${d.sh?'<div class="bar"><i id="shB" style="background:#8fd6ff"></i></div>':''}
   <div class="stats"><span>체력<b id="hpT"></b></span>${stats}</div>
   ${e.kind==='b'?'<div class="queue" id="que"></div><div class="bar" id="pgW" hidden><i id="pgB" style="background:var(--pearl)"></i></div>':''}</div>`;
  if(e.kind==='b'){const q=$('que');e.q.forEach((it,i)=>{const b=document.createElement('button');b.className='mem';b.title='취소';b.innerHTML=it.kind==='u'?`<img alt="${UNIT[it.key].name}" src="${iconURL(it.key,color)}">`:'<span style="font-size:10px">연구</span>';b.onclick=()=>{if(e.p===ME){g.cancelQ(e,i);this.hudK=''}};q.appendChild(b)})}
 },
 updSingle(e){
  if(e.kind==='r'){const a=$('rAmt');if(a)a.textContent=Math.floor(e.amt);return}
  const cg=$('cargoN');if(cg)cg.textContent=(e.cargo?e.cargo.length:0)+'기';
  const f=Math.max(0,e.hp/e.def.hp),b=$('hpB');if(!b)return;b.style.width=(f*100)+'%';b.style.background=f>.5?'#7be08f':f>.25?'#ffc765':'#ff6b6b';
  $('hpT').textContent=Math.ceil(e.hp)+'/'+e.def.hp+(e.def.sh?' · 보호막 '+Math.ceil(e.sh):'');
  const s=$('shB');if(s)s.style.width=(e.sh/e.def.sh*100)+'%';
  if(e.kind==='b'){const w=$('pgW');if(!e.built){w.hidden=false;$('pgB').style.width=(e.prog*100)+'%'}else if(e.q.length){w.hidden=false;$('pgB').style.width=(e.q[0].t/e.q[0].dur*100)+'%'}else if(e.modeT>0){w.hidden=false;$('pgB').style.width=((5-e.modeT)/5*100)+'%'}else w.hidden=true}
 },
 renderCard(){
  const card=this.cardFor(),host=$('cmd');
  const k=card.map(b=>b?[b.key,b.enabled!==false,!!b.on].join():'_').join('|');
  this.card=card.filter(Boolean);
  if(k===this.cardK)return;this.cardK=k;host.innerHTML='';
  const g=this.g,color=g.p[ME].color;
  card.forEach(b=>{
   const e=document.createElement('button');
   if(!b){e.className='cb hide';e.tabIndex=-1;host.appendChild(e);return}
   e.className='cb'+(b.on?' on':'');e.setAttribute('aria-disabled',b.enabled===false);e.setAttribute('aria-label',(b.def?b.def.name:b.label)+' ('+b.key.toUpperCase()+')');
   e.innerHTML=(b.icon?`<img alt="" src="${iconURL(b.icon,color)}">`:`${icoFor(b)?icoSvg(icoFor(b)):''}<span class="t">${b.label}</span>`)+`<span class="k">${b.key.toUpperCase()}</span>`;
   e.onclick=()=>this.run(b);
   e.onmouseenter=()=>this.showTip(b);e.onmouseleave=()=>{$('tip').hidden=true};
   host.appendChild(e);
  });
 },
 showTip(b){
  const t=$('tip'),d=b.def;
  const name=d?d.name:b.label,cost=d&&d.c!=null?`컴퓨트 ${d.c} · 데이터 ${d.d}${d.sup&&UNIT[d.key]?' · 토큰 '+(d.sup*(d.count||1)):''}${d.t?' · '+d.t+'초':''}`:'';
  t.innerHTML=`<h4>${name}</h4>${cost?`<div class="cost">${cost}</div>`:''}<div>${d?d.desc:b.desc}</div>${b.enabled===false&&b.reason?`<div class="need">${b.reason}</div>`:''}`;t.hidden=false;
 },
 drawTrend(g){
  const w=$('overG'),T2=g.trend;w.textContent='';if(T2.length<3){w.hidden=true;return}w.hidden=false;
  const chart=(label,idx)=>{const W=480,H=92,pad=4,max=Math.max(1,...T2.flat().map(r=>r[idx])),n=T2.length,pts=i=>T2.map((row,k)=>((pad+k/(n-1)*(W-2*pad)).toFixed(1))+','+((H-pad-row[i][idx]/max*(H-2*pad)).toFixed(1))).join(' ');const d=document.createElement('figure');const c=document.createElement('figcaption');c.textContent=label;const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 '+W+' '+H);s.setAttribute('role','img');s.setAttribute('aria-label',label+' 추이');g.p.forEach((q,i)=>{const l=document.createElementNS('http://www.w3.org/2000/svg','polyline');l.setAttribute('points',pts(i));l.setAttribute('fill','none');l.setAttribute('stroke',q.color);l.setAttribute('stroke-width','2');s.appendChild(l)});d.append(c,s);return d};
  w.append(chart('병력 가치',0),chart('누적 채취 자원',1));
 },
 gameOver(){
  this.overDone=true;const g=this.g,obs=Replay.on||Net.spec,win=g.winner===ME,m=Math.floor(g.tick/TPS);
  $('overT').textContent=obs?FAC[g.p[g.winner].fac].name+' 승리':win?'승리':'패배';$('overT').style.color=obs?g.p[g.winner].color:win?g.p[ME].color:'#ff8a8a';
  {const w=g.p[g.winner],c0=w.color,hk='hero_'+FAC[w.fac].show[2];$('overHero').src=(this.use3D||Sprites.get(hk,c0))?iconURL(hk,c0,420):'';if(!$('overHero').getAttribute('src'))$('overHero').removeAttribute('src')}
  $('overS').textContent=`${g.p.map(q=>FAC[q.fac].name).join(' 대 ')} · ${Math.floor(m/60)}분 ${m%60}초`;
  const row=(n,f)=>`<tr><th>${n}</th>${g.p.map(q=>`<td>${f(q)}</td>`).join('')}</tr>`;
  $('overTb').innerHTML=`<tr><th></th>${g.p.map((q,i)=>`<td style="color:${q.color}">${i===0&&!obs?'나':FAC[q.fac].name}</td>`).join('')}</tr>`+row('생산 유닛',q=>q.stats.made)+row('격파',q=>q.stats.killed)+row('손실',q=>q.stats.lost)+row('채취 자원',q=>q.stats.gathered);
 this.drawTrend(g);if(!Replay.on&&!this.mis&&!Net.on&&this.rec){Record.add(g.winner===ME);Replay.save()}if(Net.on&&!Net.spec&&this.rec)Replay.save();$('bRep').hidden=!this.rec||Replay.on;$('bShare').hidden=!this.rec||Replay.on||Net.base!==WSRoom;$('shareL').hidden=true;$('repB').hidden=true;
  $('over').hidden=false;$('hint').hidden=true;
 }
};
window.AISG={headless,UI,Game};
UI.init();
