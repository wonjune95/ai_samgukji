// 코드 모델의 프리미티브 배치를 JSON으로 내보낸다
const fs=require('fs'),vm=require('vm');
const c=vm.createContext({console,Math,Float32Array,Uint8Array,Uint8ClampedArray,Uint16Array,Int32Array,Array,Map,Set,Object,JSON,Infinity,Date,window:{},self:{},navigator:{hardwareConcurrency:1},document:{},indexedDB:null,performance:{now:()=>0}});
const src=['src/01-data.js','src/04-bake.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
vm.runInContext(src+`;globalThis.__x={RT:bakeRuntime(),UNIT,BLD};`,c);
const {RT,UNIT,BLD}=c.__x,out={};
const lst=(k,T,fx)=>{const m=RT.B();if(RT.UN[k])RT.UN[k](m,T,fx);else RT.BM[k](m,T);return m.L.map(p=>({...p}))};
const T0=[0,0,0],T1=[1,1,1];
for(const k of [...Object.keys(RT.UN),...Object.keys(RT.BM)]){

 const fr=RT.UN[k]?RT.framesFor(k):[null];
 out[k]={frames:fr.map(fx=>{const a=lst(k,T0,fx),b=lst(k,T1,fx);return a.map((p,i)=>{const q=b[i],kk=((q.c0-p.c0)+(q.c1-p.c1)+(q.c2-p.c2))/3;return{t:p.t,x:p.x,y:p.y,z:p.z,a:p.a,b:p.b,c:p.c,d:p.d,e:p.e,rot:p.rot||0,m:p.m,c0:p.c0,c1:p.c1,c2:p.c2,k:kk}})}),fac:k.slice(0,3),unit:!!RT.UN[k],air:!!(UNIT[k]&&UNIT[k].air),r:UNIT[k]?UNIT[k].r:0,w:BLD[k]?BLD[k].w:0,h:BLD[k]?BLD[k].h:0,role:BLD[k]?BLD[k].role:''};
}
fs.writeFileSync(process.argv[2],JSON.stringify(out));
const fp=p=>[p.t,p.x,p.y,p.z,p.a,p.b,p.c,p.d,p.e,p.rot,p.c0].map(v=>+v.toFixed(3)).join(',');
for(const k in out){const F=out[k].frames.map(l=>l.map(fp)),st=F[0].filter(x=>F.every(l=>l.includes(x)));console.log(k.padEnd(12),'frames',F.length,'prims',F[0].length,'static',st.length,'dyn',F.map(l=>l.length-st.length).join(' '))}
