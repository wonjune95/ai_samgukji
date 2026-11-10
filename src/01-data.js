'use strict';
let ME=0;
const T=32,MW=76,MH=76,N=MW*MH,TPS=30,DT=1/TPS,SUP_MAX=150;
const FAC={
  gpt:{name:'ChatGPT',color:'#2fd6a0',motto:'백자 자동인형 군단',brief:'비싸고 강한 정예 유닛. 보호막이 전투 후 재충전되고, 일꾼은 건물을 배치만 하고 곧바로 복귀합니다.',worker:'gpt_w',show:['gpt_guard','gpt_arch','gpt_tf','gpt_ship']},
  gem:{name:'Gemini',color:'#3f86ff',motto:'멀티모달 강철 공업',brief:'공장 한 동이 보병·기계·항공 모드를 전환합니다. 건물이 단단하고, 일꾼이 건물과 기계 유닛을 수리합니다.',worker:'gem_w',show:['gem_text','gem_vision','gem_audio','gem_drone']},
  cla:{name:'Claude',color:'#ff8a3d',motto:'살아 있는 점토 군집',brief:'기본 유닛이 2기씩 태어납니다. 맥락 지대에서 빨라지고 재생하지만, 일꾼이 건물로 변이해 소모됩니다.',worker:'cla_w',show:['cla_swarm','cla_spine','cla_beast','cla_spore']}
};
const ALT_COLOR='#c583ff';

const UNIT={
 gpt_w:{name:'프롬프터',fac:'gpt',worker:1,c:50,d:0,sup:1,t:12,hp:25,sh:20,dmg:4,cd:1.2,rng:.3,spd:3.3,sight:7,r:8,tags:['light'],desc:'자원을 채취합니다. 건물을 배치한 뒤 바로 작업으로 돌아갑니다.'},
 gpt_guard:{skill:'charge',name:'가드레일 검사',fac:'gpt',c:100,d:0,sup:2,t:14,hp:80,sh:76,dmg:16,cd:.9,rng:.5,spd:3,sight:8,r:11,tags:['armored'],desc:'튼튼한 근접 보병입니다. 전열을 유지합니다.'},
 gpt_arch:{name:'추론 궁수',fac:'gpt',req:'tech',c:100,d:25,sup:2,t:16,hp:52,sh:54,dmg:14,cd:.85,rng:5,spd:3,sight:9,r:10,hitsAir:1,proj:'bolt',tags:['light'],desc:'지상과 공중을 모두 공격하는 원거리 유닛입니다.'},
 gpt_tf:{name:'트랜스포머',fac:'gpt',req:'adv',c:250,d:150,sup:5,t:28,hp:185,sh:185,dmg:40,cd:2,rng:7,splash:1.5,noAir:1,spd:2.3,sight:10,r:17,proj:'beam',tags:['armored'],desc:'지상 범위 공격을 하는 대형 유닛입니다. 공중은 공격하지 못합니다.'},
 gpt_ship:{name:'어텐션 함선',fac:'gpt',req:'adv',air:1,c:175,d:125,sup:4,t:24,hp:126,sh:132,dmg:19,cd:1,rng:5,spd:3.4,sight:10,r:15,hitsAir:1,proj:'bolt',tags:['armored'],desc:'가장 가까운 대상에 집중 사격하는 공중 전함입니다.'},

 gem_w:{name:'크롤러',fac:'gem',worker:1,c:50,d:0,sup:1,t:12,hp:55,sh:0,dmg:4,cd:1.2,rng:.3,spd:3.3,sight:7,r:8,tags:['light','mech'],desc:'자원을 채취합니다. 건설 중에는 자리를 지키며, 건물과 기계 유닛을 수리합니다.'},
 gem_text:{skill:'overclock',name:'텍스트 보병',fac:'gem',mode:'inf',c:50,d:0,sup:1,t:11,hp:46,sh:0,dmg:6.5,cd:.57,rng:4.5,spd:3,sight:8,r:8,hitsAir:1,proj:'bolt',tags:['light'],desc:'값싼 범용 소총병입니다. 보병 모드에서 생산합니다.'},
 gem_vision:{name:'비전 저격수',fac:'gem',mode:'inf',req:'tech',c:100,d:50,sup:2,t:18,hp:69,sh:0,dmg:21,cd:1.48,rng:7,spd:2.9,sight:10,r:9,hitsAir:1,bonus:{armored:14},proj:'beam',tags:['light'],desc:'중장갑에 추가 피해를 주는 장거리 저격수입니다. 보병 모드에서 생산합니다.'},
 gem_audio:{skill:'deploy',name:'오디오 전차',fac:'gem',mode:'mech',req:'tech',c:150,d:100,sup:3,t:24,hp:227,sh:0,dmg:32,cd:1.58,rng:6.5,splash:1.3,noAir:1,spd:2.7,sight:9,r:15,proj:'shell',tags:['armored','mech'],desc:'음파로 지상 범위 피해를 줍니다. 기계 모드에서 생산합니다.'},
 gem_drone:{name:'비디오 드론',fac:'gem',mode:'air',req:'adv',air:1,c:150,d:100,sup:3,t:22,hp:160,sh:0,dmg:14,cd:.73,rng:4.5,spd:3.6,sight:10,r:14,hitsAir:1,proj:'bolt',tags:['mech'],desc:'빠른 연사의 공중 유닛입니다. 항공 모드에서 생산합니다.'},

 cla_w:{name:'서브에이전트',fac:'cla',worker:1,c:50,d:0,sup:1,t:8,hp:42,sh:0,dmg:4,cd:1.2,rng:.3,spd:3.3,sight:7,r:8,tags:['light'],desc:'자원을 채취합니다. 건물을 지으면 그 건물로 변이해 사라집니다.'},
 cla_swarm:{name:'토큰 스웜',fac:'cla',count:2,c:50,d:0,sup:.5,t:10,hp:36,sh:0,dmg:5,cd:.46,rng:.4,spd:3.7,sight:8,r:7,tags:['light'],desc:'한 번에 2기가 태어나는 빠른 근접 유닛입니다.'},
 cla_spine:{name:'컨텍스트 침술사',fac:'cla',req:'tech',c:85,d:25,sup:1,t:15,hp:68,sh:0,dmg:9,cd:.92,rng:4.5,spd:3,sight:9,r:9,hitsAir:1,proj:'spit',tags:['light'],desc:'지상과 공중을 맞히는 원거리 유닛입니다.'},
 cla_beast:{skill:'molt',name:'장문맥 거수',fac:'cla',req:'adv',c:240,d:120,sup:5,t:28,hp:470,sh:0,dmg:33,cd:1.35,rng:.8,splash:1.2,noAir:1,spd:2.8,sight:9,r:19,tags:['armored'],desc:'체력이 매우 높은 근접 거수입니다. 주변을 함께 타격합니다.'},
 cla_spore:{name:'아티팩트 포자',fac:'cla',req:'adv',air:1,c:95,d:70,sup:2,t:19,hp:116,sh:0,dmg:9,cd:.68,rng:4,spd:4.1,sight:10,r:12,hitsAir:1,proj:'spit',tags:['light'],desc:'빠르게 떠다니며 침을 쏘는 공중 유닛입니다.'},
 gpt_scout:{name:'샘플링 정찰기',fac:'gpt',c:50,d:0,sup:1,t:10,hp:30,sh:30,dmg:5,cd:1,rng:3.5,spd:5.1,sight:13,r:9,hitsAir:1,proj:'bolt',tags:['light'],desc:'시야가 넓고 빠른 정찰 유닛입니다.'},
 gpt_heal:{name:'프롬프트 치유사',fac:'gpt',req:'tech',c:75,d:75,sup:2,t:20,hp:40,sh:65,dmg:0,cd:1,rng:0,spd:3,sight:9,r:10,heal:{amt:14,r:5,kind:'shield'},tags:['light'],desc:'주변 아군의 보호막과 체력을 자동으로 회복합니다.'},
 gpt_ram:{name:'추론 공성추',fac:'gpt',req:'tech',c:200,d:100,sup:4,t:28,hp:230,sh:130,dmg:45,cd:2.4,rng:.7,noAir:1,bldMul:2.8,spd:2.3,sight:8,r:17,tags:['armored'],desc:'건물에 2.8배 피해를 주는 근접 공성 병기입니다.'},
 gpt_trans:{name:'임베딩 수송선',fac:'gpt',req:'tech',air:1,c:150,d:50,sup:2,t:24,hp:150,sh:110,dmg:0,cd:1,rng:0,spd:3.8,sight:10,r:16,skill:'cargo',tags:['armored'],desc:'주변 지상 유닛을 토큰 8만큼 태우고 내립니다.'},
 gem_scout:{name:'번역 오토바이',fac:'gem',mode:'mech',req:'tech',c:50,d:0,sup:1,t:10,hp:55,sh:0,dmg:6,cd:.8,rng:3.5,spd:5.4,sight:12,r:10,hitsAir:1,proj:'bolt',tags:['light','mech'],desc:'가장 빠른 지상 정찰 유닛입니다. 기계 모드에서 생산합니다.'},
 gem_heal:{name:'수리 드론',fac:'gem',mode:'air',req:'adv',air:1,c:75,d:50,sup:1,t:18,hp:70,sh:0,dmg:0,cd:1,rng:0,spd:3.8,sight:9,r:9,heal:{amt:16,r:5,kind:'mech'},tags:['light','mech'],desc:'주변 기계 유닛과 건물을 자동으로 수리합니다. 항공 모드에서 생산합니다.'},
 gem_how:{name:'코드 곡사포',fac:'gem',mode:'mech',req:'adv',c:175,d:125,sup:4,t:30,hp:130,sh:0,dmg:48,cd:3,rng:10,splash:1.6,noAir:1,spd:2.2,sight:9,r:15,proj:'shell',bldMul:1.5,tags:['armored','mech'],desc:'사거리 10의 지상 범위 포격을 합니다. 기계 모드에서 생산합니다.'},
 gem_trans:{name:'멀티모달 수송기',fac:'gem',mode:'air',req:'adv',air:1,c:150,d:50,sup:2,t:24,hp:230,sh:0,dmg:0,cd:1,rng:0,spd:3.7,sight:10,r:16,skill:'cargo',tags:['armored','mech'],desc:'주변 지상 유닛을 토큰 8만큼 태우고 내립니다. 항공 모드에서 생산합니다.'},
 cla_scout:{name:'맥락 탐지충',fac:'cla',c:40,d:0,sup:1,t:8,hp:38,sh:0,dmg:4,cd:.6,rng:.4,spd:5.2,sight:12,r:8,tags:['light'],desc:'값싸고 빠른 정찰 곤충입니다.'},
 cla_heal:{name:'재생 포자낭',fac:'cla',req:'tech',c:75,d:50,sup:1,t:18,hp:100,sh:0,dmg:0,cd:1,rng:0,spd:2.8,sight:9,r:11,heal:{amt:15,r:5,kind:'bio'},tags:['light'],desc:'주변 아군을 자동으로 재생시킵니다.'},
 cla_acid:{name:'압축 산성충',fac:'cla',req:'tech',c:150,d:100,sup:3,t:26,hp:165,sh:0,dmg:30,cd:2.4,rng:8,splash:1.4,noAir:1,spd:2.5,sight:9,r:15,proj:'spit',bldMul:1.6,tags:['armored'],desc:'사거리 8의 산성 범위 공격을 합니다.'},
 gpt_lance:{name:'정렬 창기병',fac:'gpt',req:'tech',c:150,d:100,sup:3,t:24,hp:110,sh:90,dmg:24,cd:1.6,rng:8,bonus:{armored:12},noAir:1,spd:2.6,sight:10,r:13,proj:'beam',tags:['armored'],desc:'중장갑에 강한 장거리 보행 포대입니다. 지상만 공격합니다.'},
 gpt_wing:{name:'토큰 요격기',fac:'gpt',req:'adv',air:1,c:125,d:75,sup:2,t:20,hp:80,sh:70,dmg:11,cd:.55,rng:5.5,hitsAir:1,noGround:1,spd:4.6,sight:11,r:12,proj:'bolt',tags:['light'],desc:'공중 유닛만 공격하는 빠른 요격기입니다.'},
 gpt_ark:{name:'컨텍스트 방주',fac:'gpt',req:'adv',air:1,c:350,d:250,sup:6,t:45,hp:300,sh:300,dmg:26,cd:1.3,rng:7,splash:1.2,hitsAir:1,spd:2.2,sight:12,r:22,proj:'beam',tags:['armored'],desc:'지상과 공중을 범위 공격하는 주력 기함입니다.'},
 gem_aa:{name:'대공 미사일 차량',fac:'gem',req:'adv',c:100,d:50,sup:2,t:18,hp:150,sh:0,dmg:13,cd:.9,rng:8,splash:.8,hitsAir:1,noGround:1,spd:3,sight:10,r:13,proj:'shell',tags:['armored','mech'],desc:'공중 유닛만 공격하는 장거리 대공 차량입니다.'},
 gem_mech:{name:'프로토타입 메카',fac:'gem',req:'adv',c:275,d:175,sup:6,t:40,hp:440,sh:0,dmg:22,cd:.75,rng:6,hitsAir:1,spd:2.4,sight:10,r:20,proj:'bolt',tags:['armored','mech'],desc:'지상과 공중을 모두 공격하는 대형 보행 병기입니다.'},
 gem_bomb:{name:'데이터 폭격기',fac:'gem',req:'adv',air:1,c:200,d:150,sup:4,t:32,hp:230,sh:0,dmg:40,cd:2.4,rng:3,splash:1.5,noAir:1,bldMul:1.4,spd:3.2,sight:10,r:18,proj:'shell',tags:['armored','mech'],desc:'지상만 범위 폭격하는 공중 폭격기입니다.'},
 cla_leech:{name:'주의 흡혈충',fac:'cla',req:'adv',c:100,d:75,sup:2,t:18,hp:135,sh:0,dmg:15,cd:.9,rng:7,hitsAir:1,noGround:1,spd:3,sight:10,r:12,proj:'spit',tags:['armored'],desc:'공중 유닛만 공격하는 대공 곤충입니다.'},
 cla_brood:{name:'기억 군락 모체',fac:'cla',req:'adv',c:250,d:175,sup:5,t:38,hp:320,sh:0,dmg:38,cd:3,rng:9,splash:1.7,noAir:1,bldMul:1.3,spd:2.1,sight:10,r:19,proj:'spit',tags:['armored'],desc:'사거리 9의 대형 범위 포격 곤충입니다.'},
 cla_wing:{name:'가설 비행충',fac:'cla',req:'adv',air:1,c:125,d:75,sup:2,t:20,hp:140,sh:0,dmg:12,cd:.85,rng:4.5,hitsAir:1,spd:4.4,sight:11,r:13,proj:'spit',tags:['light'],desc:'지상과 공중을 공격하는 빠른 비행 곤충입니다.'},
 cla_carry:{name:'메모리 운반 낭',fac:'cla',req:'tech',air:1,c:125,d:40,sup:2,t:22,hp:200,sh:0,dmg:0,cd:1,rng:0,spd:3.6,sight:10,r:16,skill:'cargo',tags:['light'],desc:'주변 지상 유닛을 토큰 8만큼 삼켜 옮깁니다.'},
};
const BLD={
 gpt_hq:{name:'오케스트레이터',fac:'gpt',role:'hq',c:400,d:0,t:60,w:4,h:4,hp:800,sh:500,sup:10,trains:['gpt_w'],desc:'일꾼을 생산하고 자원을 받습니다.'},
 gpt_sup:{name:'토큰 증설소',fac:'gpt',role:'sup',c:100,d:0,t:18,w:2,h:2,hp:200,sh:200,sup:8,desc:'토큰 한도를 8 늘립니다.'},
 gpt_bar:{name:'파인튜닝 전당',fac:'gpt',role:'bar',c:150,d:0,t:30,w:3,h:3,hp:400,sh:400,trains:['gpt_guard','gpt_arch','gpt_tf','gpt_lance','gpt_scout','gpt_heal','gpt_ram','gpt_trans'],desc:'전투 유닛을 훈련합니다.'},
 gpt_tech:{name:'추론 연구소',fac:'gpt',role:'tech',req:'bar',c:150,d:100,t:40,w:3,h:3,hp:400,sh:400,desc:'2단계 유닛, 공격 연구, 전술 스킬을 해금합니다.'},
 gpt_twr:{name:'가드레일 포탑',fac:'gpt',role:'twr',req:'bar',c:125,d:0,t:22,w:2,h:2,hp:150,sh:150,dmg:16,cd:1,rng:7,hitsAir:1,proj:'bolt',sight:9,desc:'지상과 공중을 공격하는 방어 포탑입니다.'},

 gem_hq:{name:'TPU 캠퍼스',fac:'gem',role:'hq',c:400,d:0,t:60,w:4,h:4,hp:1300,sh:0,sup:10,trains:['gem_w'],desc:'일꾼을 생산하고 자원을 받습니다.'},
 gem_sup:{name:'토큰 증설소',fac:'gem',role:'sup',c:100,d:0,t:18,w:2,h:2,hp:360,sh:0,sup:8,desc:'토큰 한도를 8 늘립니다.'},
 gem_bar:{name:'멀티모달 공장',fac:'gem',role:'bar',c:150,d:0,t:30,w:3,h:3,hp:850,sh:0,modes:{inf:['gem_text','gem_vision'],mech:['gem_audio','gem_how','gem_scout'],air:['gem_drone','gem_heal','gem_trans']},desc:'모드를 바꾸어 보병, 기계, 항공 유닛을 생산합니다.'},
 gem_tech:{name:'딥리서치 연구소',fac:'gem',role:'tech',req:'bar',c:150,d:100,t:40,w:3,h:3,hp:650,sh:0,desc:'2단계 유닛, 공격 연구, 전술 스킬을 해금합니다.'},
 gem_twr:{name:'센서 포탑',fac:'gem',role:'twr',req:'bar',c:100,d:0,t:20,w:2,h:2,hp:320,sh:0,dmg:14,cd:.9,rng:7,hitsAir:1,proj:'bolt',sight:9,desc:'지상과 공중을 공격하는 방어 포탑입니다.'},

 cla_hq:{name:'컨텍스트 허브',fac:'cla',role:'hq',c:300,d:0,t:55,w:4,h:4,hp:1100,sh:0,sup:8,ctx:11,trains:['cla_w'],desc:'일꾼을 생산하고 넓은 맥락 지대를 만듭니다.'},
 cla_sup:{name:'메모리 고치',fac:'cla',role:'sup',c:75,d:0,t:16,w:2,h:2,hp:220,sh:0,sup:8,ctx:6,desc:'토큰 한도를 8 늘리고 맥락 지대를 넓힙니다.'},
 cla_bar:{name:'프롬프트 둥지',fac:'cla',role:'bar',c:150,d:0,t:28,w:3,h:3,hp:650,sh:0,ctx:7,trains:['cla_swarm','cla_spine','cla_beast','cla_spore','cla_scout','cla_heal','cla_acid','cla_carry'],desc:'전투 유닛을 키웁니다.'},
 cla_tech:{name:'헌법 서고',fac:'cla',role:'tech',req:'bar',c:150,d:100,t:40,w:3,h:3,hp:600,sh:0,ctx:7,desc:'2단계 유닛, 공격 연구, 전술 스킬을 해금합니다.'},
 cla_twr:{name:'포자 포탑',fac:'cla',role:'twr',req:'bar',c:75,d:0,t:20,w:2,h:2,hp:300,sh:0,ctx:5,dmg:13,cd:.9,rng:6.5,hitsAir:1,proj:'spit',sight:9,desc:'지상과 공중을 공격하는 방어 포탑입니다.'},
 gpt_ext:{name:'데이터 증류기',fac:'gpt',role:'ext',c:75,d:0,t:20,w:3,h:3,hp:220,sh:220,desc:'데이터 레이크 위에 지어 데이터를 채취합니다.'},
 gem_ext:{name:'데이터 펌프',fac:'gem',role:'ext',c:75,d:0,t:20,w:3,h:3,hp:480,sh:0,desc:'데이터 레이크 위에 지어 데이터를 채취합니다.'},
 gpt_adv:{name:'정렬 성소',fac:'gpt',role:'adv',req:'tech',c:200,d:150,t:45,w:3,h:3,hp:500,sh:500,trains:['gpt_ship','gpt_wing','gpt_ark'],desc:'3단계 유닛을 해금하고 항공 전력을 생산합니다.'},
 gpt_aura:{name:'보호막 충전소',fac:'gpt',role:'aura',req:'bar',c:125,d:50,t:25,w:2,h:2,hp:200,sh:300,aura:{r:7,amt:10,kind:'shield'},desc:'반경 7 안의 아군 보호막을 초당 10 회복합니다.'},
 gem_adv:{name:'로보틱스 정비창',fac:'gem',role:'adv',req:'tech',c:200,d:150,t:45,w:3,h:3,hp:900,sh:0,trains:['gem_aa','gem_mech','gem_bomb'],desc:'3단계 유닛과 공장의 항공 모드를 해금합니다.'},
 gem_aura:{name:'정비 격납고',fac:'gem',role:'aura',req:'bar',c:125,d:50,t:25,w:2,h:2,hp:420,sh:0,aura:{r:7,amt:8,kind:'mech'},desc:'반경 7 안의 기계 유닛과 건물을 초당 8 수리합니다.'},
 cla_adv:{name:'변이 산실',fac:'cla',role:'adv',req:'tech',c:200,d:150,t:45,w:3,h:3,hp:750,sh:0,ctx:7,trains:['cla_leech','cla_brood','cla_wing'],desc:'3단계 유닛을 해금하고 상위 변종을 키웁니다.'},
 cla_aura:{name:'영양 웅덩이',fac:'cla',role:'aura',req:'bar',c:100,d:50,t:22,w:2,h:2,hp:320,sh:0,ctx:6,aura:{r:7,amt:7,kind:'bio'},desc:'반경 7 안의 생체 유닛과 건물을 초당 7 재생합니다.'},
 cla_ext:{name:'데이터 흡수체',fac:'cla',role:'ext',c:50,d:0,t:20,w:3,h:3,hp:380,sh:0,desc:'데이터 레이크 위에 지어 데이터를 채취합니다.'},
};
for(const k in UNIT)UNIT[k].key=k;
for(const k in BLD)BLD[k].key=k;
const ABIL={
 gpt:{name:'가드레일 재충전',desc:'지정 범위의 아군 보호막을 즉시 120 회복합니다.',d:100,cd:32,r:5.5},
 gem:{name:'TPU 집중 타격',desc:'1.5초 뒤 지정 범위의 적 유닛에게 85, 건물에 60 피해를 줍니다.',d:125,cd:42,r:3.2},
 cla:{name:'스웜 호출',desc:'지정 위치에 18초간 유지되는 토큰 스웜 6기를 소환합니다.',d:100,cd:38,r:3}
};
const RESEARCH=[{c:100,d:100,t:35,name:'가중치 강화 1',desc:'모든 유닛의 공격력이 15% 증가합니다.'},{c:175,d:175,t:45,name:'가중치 강화 2',desc:'모든 유닛의 공격력이 추가로 15% 증가합니다.'}];
const ARMOR=[{c:100,d:75,t:35,name:'잠재공간 장갑 1',desc:'모든 유닛이 받는 피해가 1 감소합니다.'},{c:175,d:150,t:45,name:'잠재공간 장갑 2',desc:'모든 유닛이 받는 피해가 추가로 1 감소합니다.'}];
const MODE_NAME={inf:'보병',mech:'기계',air:'항공'};
function defOf(k){return UNIT[k]||BLD[k]}

const SKILL={
 overclock:{name:'오버클럭',key:'t',cd:20,desc:'체력 10을 소모하고 8초간 이동·공격 속도가 50% 증가합니다.'},
 charge:{name:'돌격 프로토콜',key:'t',cd:18,desc:'5초간 이동 속도가 80% 증가합니다.'},
 molt:{name:'탈피 재생',key:'t',cd:25,desc:'최대 체력의 40%를 즉시 회복합니다.'},
 cargo:{name:'탑승·하차',key:'t',cd:1,desc:'주변 5칸의 지상 유닛을 태웁니다. 다시 누르면 현재 위치에 내립니다. 격추되면 탑승 유닛도 파괴됩니다.'},
 deploy:{name:'정밀 모드',key:'t',cd:2,desc:'고정된 채 사거리 11, 공격력 46의 넓은 범위 공격을 합니다. 다시 누르면 해제합니다.'}
};
const LINES={
 gpt:{sel:['네, 도와드리겠습니다.','무엇을 도와드릴까요?','프롬프트를 입력하세요.'],go:['좋은 질문입니다. 이동합니다.','추론을 시작합니다.','물론이죠, 바로 처리합니다.'],atk:['가드레일을 강화합니다.','정책에 따라 제거합니다.','요청을 처리 중입니다.']},
 gem:{sel:['멀티모달 대기 중.','입력 형식을 선택하십시오.','센서 동기화 완료.'],go:['경로를 검색했습니다.','딥리서치로 이동합니다.','위치 데이터 수신.'],atk:['TPU 가동.','표적을 인식했습니다.','전 모달 화력 집중.']},
 cla:{sel:['맥락을 살펴볼게요.','어떤 부분을 도와드릴까요?','조금 더 알려 주시겠어요?'],go:['신중하게 움직이겠습니다.','좋습니다, 단계별로 가죠.','그 방향이 합리적이네요.'],atk:['그 점에는 동의하기 어렵습니다.','정중하게 제거하겠습니다.','헌법에 따라 대응합니다.']}
};
