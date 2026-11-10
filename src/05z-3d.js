// 실시간 3D 렌더러. 시뮬레이션은 그대로 두고 표현만 담당한다.
function webglOK(){try{if(!window.THREE||!THREE.BufferGeometryUtils||!THREE.EffectComposer)return false;const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'))}catch(e){return false}}
const RT3=bakeRuntime();
const lin=v=>Math.pow(v,2.1);
const hexRgb=(()=>{const m=new Map();return h=>{let r=m.get(h);if(!r){r=[parseInt(h.slice(1,3),16)/255,parseInt(h.slice(3,5),16)/255,parseInt(h.slice(5,7),16)/255].map(lin);m.set(h,r)}return r}})();
function geoBox(a,b,c,r){
 r=Math.min(r,a*.98,b*.98,c*.98);const g=new THREE.BoxGeometry(2,2,2,3,3,3),P=g.attributes.position,Nn=g.attributes.normal,map=(v,h)=>{const s=Math.sign(v),q=Math.abs(v);return s*(q>.9?h:h-r)};
 for(let i=0;i<P.count;i++){const x=map(P.getX(i),a),y=map(P.getY(i),b),z=map(P.getZ(i),c),cx=Math.max(-(a-r),Math.min(a-r,x)),cy=Math.max(-(b-r),Math.min(b-r,y)),cz=Math.max(-(c-r),Math.min(c-r,z));let dx=x-cx,dy=y-cy,dz=z-cz;const l=Math.hypot(dx,dy,dz);if(l>1e-4&&r>1e-4){dx/=l;dy/=l;dz/=l;P.setXYZ(i,cx+dx*r,cy+dy*r,cz+dz*r);Nn.setXYZ(i,dx,dy,dz)}else P.setXYZ(i,x,y,z)}
 return g;
}
const YAX=window.THREE?new THREE.Vector3(0,1,0):null;
function geoCapsule(ax,ay,az,bx,by,bz,r1,r2){
 const dir=new THREE.Vector3(bx-ax,by-ay,bz-az),len=dir.length()||.01;dir.normalize();const pts=[],n=4;
 for(let i=0;i<=n;i++){const t=i/n*Math.PI/2;pts.push(new THREE.Vector2(Math.max(.0001,Math.sin(t)*r1),-Math.cos(t)*r1))}
 for(let i=0;i<=n;i++){const t=i/n*Math.PI/2;pts.push(new THREE.Vector2(Math.max(.0001,Math.cos(t)*r2),len+Math.sin(t)*r2))}
 const g=new THREE.LatheGeometry(pts,12),m=new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(YAX,dir));
 g.applyMatrix4(m);g.translate(ax,ay,az);return g;
}
function matOf(fac,p,isTeam){
 const [r,g,b]=[p.c0,p.c1,p.c2];let metal=0,rough=.5;const grey=Math.abs(r-g)<.08&&Math.abs(g-b)<.1,bright=r+g+b;
 if(p.m===2)return[0,.4,3.4];
 if(fac==='gpt'){if(isTeam){metal=.15;rough=.24}else if(bright>2.3){metal=0;rough=.2}else{metal=.75;rough=.3}}
 else if(fac==='gem'){if(isTeam){metal=.42;rough=.42}else if(bright<.6){metal=.25;rough=.72}else if(grey){metal=.88;rough=.36}else{metal=.1;rough=.52}}
 else if(fac==='cla'){if(bright>2.1){metal=0;rough=.26}else{metal=0;rough=.46}}
 else{metal=grey?.7:.2;rough=.5;if(r>.7&&b<.4){metal=1;rough=.28}}
 return[metal,rough,0];
}
const FACI={gpt:0,gem:1,cla:2,res:3,dd_:3};
const nz3=(x,y,z)=>Math.sin(x*.9+y*.31)*Math.cos(z*.7+x*.2)*.5+Math.sin(y*1.7+z*1.1)*.3+Math.sin(x*2.9-z*2.3+y*1.9)*.2;
function primsToGeo(L,fac,team,key){
 const parts=[],fi=FACI[fac]==null?3:FACI[fac];
 const push=(g,cr,cg,cb,mt,rg,em)=>{if(g.attributes.uv)g.deleteAttribute('uv');const n=g.attributes.position.count,col=new Float32Array(n*3),ma=new Float32Array(n*4);for(let i=0;i<n;i++){col[i*3]=cr;col[i*3+1]=cg;col[i*3+2]=cb;ma[i*4]=mt;ma[i*4+1]=rg;ma[i*4+2]=em;ma[i*4+3]=fi}g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('aMat',new THREE.BufferAttribute(ma,4));parts.push(g)};
 const lumpy=(g,size)=>{const P=g.attributes.position,Nn=g.attributes.normal,amp=Math.min(2.1,Math.max(.22,size*.085));for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),d=nz3(x,y,z)*amp+nz3(x*2.6+9,y*2.6,z*2.6)*amp*.4;P.setXYZ(i,x+Nn.getX(i)*d,y+Nn.getY(i)*d,z+Nn.getZ(i)*d)}g.computeVertexNormals()};
 const B3=(x,y,z,a,b,c,r)=>{const g=geoBox(a,c,b,r);g.translate(x,z,y);return g};
 const dk=[.015,.018,.024],steel=[.22,.25,.3],tc=team?[lin(team[0]),lin(team[1]),lin(team[2])]:[.3,.3,.3];
 for(const p of L){
  let g;const big=p.t===3?Math.max(p.a,p.b,p.c):p.t===1?Math.max(p.d,p.e):p.t===0?p.a:0,seg=fac==='cla'&&big>8?1.6:1;
  if(p.t===0){g=new THREE.SphereGeometry(p.a,16*seg|0,12*seg|0);g.translate(p.x,p.z,p.y)}
  else if(p.t===1){g=geoCapsule(p.x,p.z,p.y,p.a,p.c,p.b,p.d,p.e)}
  else if(p.t===2){g=geoBox(p.a,p.c,p.b,p.d);if(p.rot)g.rotateY(-p.rot);g.translate(p.x,p.z,p.y)}
  else if(p.t===3){g=new THREE.SphereGeometry(1,18*seg|0,14*seg|0);g.scale(p.a,p.c,p.b);if(p.rot)g.rotateY(-p.rot);g.translate(p.x,p.z,p.y)}
  else if(p.t===4){const h0=p.z,h1=p.a,r=p.b,bv=Math.min(1.1,(h1-h0)*.2,r*.2),pts=[[.0001,h0],[r-bv,h0],[r,h0+bv],[r,h1-bv],[r-bv,h1],[.0001,h1]].map(q=>new THREE.Vector2(q[0],q[1]));g=new THREE.LatheGeometry(pts,18);g.translate(p.x,0,p.y)}
  else{g=new THREE.TorusGeometry(p.a,p.b,10,36);if(p.c){g.rotateY(Math.PI/2);if(p.rot)g.rotateY(-p.rot)}else g.rotateX(Math.PI/2);g.translate(p.x,p.z,p.y)}
  if(fac==='cla'&&p.m!==2&&p.t!==2&&p.t!==4&&p.t!==5)lumpy(g,big||3);
  const isTeam=team&&p.c0===team[0]&&p.c1===team[1]&&p.c2===team[2],[mt,rg,em]=matOf(fac,p,isTeam);let cr=lin(p.c0),cg=lin(p.c1),cb=lin(p.c2);const white=fac==='gpt'&&!isTeam&&p.m!==2&&p.c0+p.c1+p.c2>2.3;if(white){cr*=.6;cg*=.6;cb*=.6}
  push(g,cr,cg,cb,mt,rg,em);
  if(p.m===2)continue;
  // 진영별 자동 세부
  if(fac==='gem'&&p.t===2&&!p.rot&&p.a>=5&&p.b>=5&&p.c>=2.4){
   const top=p.z+p.c;for(const [a,b] of[[1,1],[-1,1],[1,-1],[-1,-1]]){const r=new THREE.SphereGeometry(.75,6,4);r.translate(p.x+a*(p.a-1.8),top,p.y+b*(p.b-1.8));push(r,steel[0]*1.6,steel[1]*1.6,steel[2]*1.6,.9,.3,0)}
   push(B3(p.x,p.y,top+.1,p.a*.6,p.b*.6,.3,.15),dk[0]*3,dk[1]*3,dk[2]*3,.6,.55,0);
   if(p.c>=3.6){for(let i=-1;i<=1;i++)push(B3(p.x+p.a+.08,p.y,p.z+i*p.c*.34,.2,p.b*.52,.34,.08),dk[0],dk[1],dk[2],.4,.7,0)}
   if(p.c>=8){for(let i=0;i<3;i++)push(B3(p.x-p.a*.5+i*p.a*.5,p.y+p.b+.1,p.z+p.c*.4,p.a*.16,.15,p.c*.1,.05),.5,1.4,1.7,0,.4,1.3)}
  }
  if(fac==='gpt'&&white&&(p.t===3||p.t===0)&&big>=6){const a=p.t===3?p.a:p.a,b=p.t===3?p.b:p.a,c=p.t===3?p.c:p.a;for(const h of[.32,-.3]){const f=Math.sqrt(1-h*h),t2=new THREE.TorusGeometry(1,.016,6,48);t2.rotateX(Math.PI/2);t2.scale(a*f*1.008,1,b*f*1.008);t2.translate(p.x,p.z+c*h,p.y);push(t2,tc[0]*.6,tc[1]*.6,tc[2]*.6,.4,.3,.5)}}
  if(fac==='gpt'&&white&&p.t===2&&!p.rot&&p.a>=8&&p.b>=8){const top=p.z+p.c;push(B3(p.x,p.y,top+.08,p.a*.74,p.b*.74,.22,.15),cr*.72,cg*.72,cb*.72,.1,.22,0)}
 }
 const bd=BLD[key];
 if(bd&&bd.role!=='ext'){
  const R2=mulberry(key.length*17+key.charCodeAt(4)),HX=bd.w*16-5,HY=bd.h*16-5;
  if(fac==='gem'){push(geoCapsule(-HX,7,HY-1,HX,7,HY-1,1.6,1.6),steel[0],steel[1],steel[2],.9,.34,0);push(geoCapsule(-HX,4,HY-1,HX,4,HY-1,1.1,1.1),.5,.28,.05,.8,.4,0);for(const a of[-1,1])push(B3(a*(HX-7),HY-5,6+R2()*2,4.5,3.6,4+R2()*2,.5),steel[0]*.8,steel[1]*.8,steel[2]*.8,.7,.45,0);push(geoCapsule(HX-2,5,-HY+2,HX-2,bd.w*12,-HY+2,.8,.6),steel[0],steel[1],steel[2],.9,.3,0);const m3=new THREE.SphereGeometry(1.6,8,6);m3.translate(HX-2,bd.w*12+2,-HY+2);push(m3,3,.4,.2,0,.4,3)}
  else if(fac==='gpt'){for(const [a,b] of[[1,1],[-1,1],[1,-1],[-1,-1]]){const X=a*(HX-3),Y=b*(HY-3);push(geoCapsule(X,4,Y,X,16,Y,1.3,.8),.3,.33,.33,.8,.28,0);const m3=new THREE.SphereGeometry(1.7,10,8);m3.translate(X,17.5,Y);push(m3,tc[0],tc[1],tc[2],0,.4,3)}}
  else if(fac==='cla'){const n=8+bd.w*3;for(let i=0;i<n;i++){const a=i/n*Math.PI*2+R2(),r0=Math.min(HX,HY)*(.5+R2()*.2),r1=Math.min(HX,HY)*(.95+R2()*.2),g=geoCapsule(Math.cos(a)*r0,8,Math.sin(a)*r0,Math.cos(a)*r1,.8,Math.sin(a)*r1,2.3+R2()*1.6,.5);lumpy(g,3);push(g,lin(.42),lin(.18),lin(.13),0,.5,0)}}
 }
 return THREE.BufferGeometryUtils.mergeBufferGeometries(parts,false);
}
const GLSL_NOISE=`
float h13(vec3 p){p=fract(p*.1031);p+=dot(p,p.zyx+31.32);return fract((p.x+p.y)*p.z);}
float vn3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h13(i),h13(i+vec3(1,0,0)),f.x),mix(h13(i+vec3(0,1,0)),h13(i+vec3(1,1,0)),f.x),f.y),mix(mix(h13(i+vec3(0,0,1)),h13(i+vec3(1,0,1)),f.x),mix(h13(i+vec3(0,1,1)),h13(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fb3(vec3 p){return vn3(p)*.5+vn3(p*2.03)*.27+vn3(p*4.1)*.15+vn3(p*8.2)*.08;}
`;
const SH={uFog:{value:null},uT:{value:0},uPulse:{value:1},uFogOff:{value:0},uCtx:{value:null},uMap:{value:window.THREE?new THREE.Vector2(1,1):null}};
const FOGF=`uniform sampler2D uFog;uniform float uFogOff;uniform vec2 uMap;float fogAt(vec3 w){if(uFogOff>.5)return 1.;float a=texture2D(uFog,w.xz/uMap).a;float cl=fb3(vec3(w.xz*.0024+vec2(uT*.016,uT*.007),0.));return a*mix(.58,1.08,smoothstep(.34,.58,cl));}`;
function makeUnitMaterial(){
 const m=new THREE.MeshStandardMaterial({vertexColors:true,metalness:0,roughness:.5,envMapIntensity:.55});
 m.extensions={derivatives:true};
 m.onBeforeCompile=s=>{
  Object.assign(s.uniforms,{uFog:SH.uFog,uT:SH.uT,uPulse:SH.uPulse,uFogOff:SH.uFogOff,uMap:SH.uMap});
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aMat;varying vec4 vMat;varying vec3 vLP;varying vec3 vWP;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvMat=aMat;vLP=position;')
   .replace('#include <project_vertex>',`#include <project_vertex>\n{vec4 w=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nw=instanceMatrix*w;\n#endif\nw=modelMatrix*w;vWP=w.xyz;}`);
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nfloat dN,fI;varying vec4 vMat;varying vec3 vLP;varying vec3 vWP;uniform float uT;uniform float uPulse;'+GLSL_NOISE+FOGF+`
float panel(vec3 p,float sc){vec3 q=abs(fract(p*sc)-.5);float d=min(min(.5-q.x,.5-q.y),.5-q.z);return smoothstep(.0,.035,d);}`)
  .replace('#include <map_fragment>','#include <map_fragment>\ndN=fb3(vLP*.55);fI=vMat.w;').replace('#include <roughnessmap_fragment>','float roughnessFactor=clamp(vMat.y+(dN-.5)*(fI<.5?.1:.42),.05,1.);')
  .replace('#include <metalnessmap_fragment>','float metalnessFactor=vMat.x;')
  .replace('#include <color_fragment>',`#include <color_fragment>
  if(vMat.z<.5){
   float grime=smoothstep(.34,.78,fb3(vLP*.3+7.));
   float low=clamp(vLP.y/30.,0.,1.);
   if(fI<.5){diffuseColor.rgb*=.92+.08*dN; diffuseColor.rgb*=mix(1.,.55,(1.-low)*.28);float veins=smoothstep(.015,.0,abs(fb3(vLP*.16)-.5))*step(fI,.2);diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*.42,veins*.55);}
   else if(fI<1.5){float pl=panel(vLP,.075);diffuseColor.rgb*=mix(.28,1.,pl);diffuseColor.rgb*=mix(1.,.5,grime*.85);float wear=smoothstep(.66,.86,fb3(vLP*.34+3.));diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*1.5+.02,wear*.32);diffuseColor.rgb*=mix(.62,1.,low);}
   else if(fI<2.5){float cells=smoothstep(.2,.62,vn3(vLP*.35));diffuseColor.rgb*=mix(.48,1.2,cells);float v2=smoothstep(.022,.0,abs(fb3(vLP*.14+11.)-.5));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.95,.34,.06),v2*.72);diffuseColor.rgb*=mix(.66,1.,low);}
   else{diffuseColor.rgb*=.7+.5*dN;}
  }`)
  .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
  if(vMat.z<.5){float ampl=fI<.5?.07:(fI<1.5?.22:.5);float h=fb3(vLP*(fI<1.5?1.1:.7))*ampl;if(fI>.5&&fI<1.5)h-=(1.-panel(vLP,.075))*.34;
   vec3 dp1=dFdx(-vViewPosition),dp2=dFdy(-vViewPosition);float dhx=dFdx(h),dhy=dFdy(h);vec3 rA=cross(dp2,normal),rB=cross(normal,dp1);float det=dot(dp1,rA);vec3 gg=sign(det)*(dhx*rA+dhy*rB);normal=normalize(abs(det)*normal-gg);}`)
  .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nif(vMat.z>.5)totalEmissiveRadiance+=diffuseColor.rgb*vMat.z*uPulse*(.75+.25*sin(uT*2.1+vWP.x*.03+vWP.z*.05));')
  .replace('#include <dithering_fragment>','#include <dithering_fragment>\n{float rim=pow(1.-clamp(dot(normalize(vViewPosition),normal),0.,1.),3.);if(fI>1.5&&fI<2.9&&vMat.z<.5)gl_FragColor.rgb+=vec3(.5,.14,.03)*rim*.8;gl_FragColor.rgb*=fogAt(vWP);}');
 };
 return m;
}
function makeTerrainMaterial(tex,outer){
 const m=new THREE.MeshStandardMaterial({map:tex,roughness:.95,metalness:0,envMapIntensity:.22});m.extensions={derivatives:true};
 m.onBeforeCompile=s=>{
  Object.assign(s.uniforms,{uFog:SH.uFog,uT:SH.uT,uFogOff:SH.uFogOff,uMap:SH.uMap,uCtx:SH.uCtx});
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying vec3 vWN;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWP=position;vWN=normal;');
  s.fragmentShader=(outer?'#define OUTER\n':'')+s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying vec3 vWN;uniform float uT;uniform sampler2D uCtx;'+GLSL_NOISE+FOGF+'float gH;float sl;float crk;vec4 ctxV;float cellE(vec2 p){vec2 i=floor(p),f=fract(p);float d1=8.,d2=8.;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 o=fract(sin(vec2(dot(i+g,vec2(127.1,311.7)),dot(i+g,vec2(269.5,183.3))))*43758.5453);float d=length(g+o-f);if(d<d1){d2=d1;d1=d;}else if(d<d2)d2=d;}return d2-d1;}float outD(){vec2 q=max(max(-vWP.xz,vWP.xz-uMap),0.);return length(q);}')
  .replace('#include <map_fragment>',`#include <map_fragment>
   sl=1.-clamp(normalize(vWN).y,0.,1.);float cliff=smoothstep(.13,.46,sl);
   vec3 sq=vec3(vWP.x*.045,vWP.y*.42,vWP.z*.045);float strata=fb3(sq)+.25*sin(vWP.y*.55+fb3(vWP*.05)*7.);
   vec3 rock=mix(vec3(.05,.042,.04),vec3(.3,.25,.2),clamp(strata,0.,1.));rock*=.72+.5*vn3(vWP*.32);
   float crack=smoothstep(.02,.0,abs(fb3(vec3(vWP.x,vWP.z,vWP.y)*.05)-.5));rock*=1.-crack*.7;
   gH=fb3(vec3(vWP.x,vWP.y,vWP.z)*.14);
   diffuseColor.rgb*=.66+.72*gH;diffuseColor.rgb=mix(diffuseColor.rgb,rock,cliff);
   float fine=vn3(vec3(vWP.x,0.,vWP.z)*.9);diffuseColor.rgb*=.86+.28*fine;
   #ifdef OUTER
   {float od=outD();diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.16,.12,.085)*(.75+.5*gH),smoothstep(20.,260.,od));}
   #endif
   {vec3 cc=diffuseColor.rgb;float sat=max(cc.r,max(cc.g,cc.b))-min(cc.r,min(cc.g,cc.b));float flat2=(1.-cliff)*smoothstep(.0,.025,cc.r-cc.g)*smoothstep(.0,.02,cc.g-cc.b)*(1.-smoothstep(.2,.34,sat));
    float tint=fb3(vec3(vWP.xz*.0018,3.));diffuseColor.rgb*=mix(vec3(1.08,.99,.9),vec3(.8,.83,.88),smoothstep(.3,.7,tint));
    float mud=smoothstep(.48,.62,fb3(vec3(vWP.xz*.0045,7.)))*flat2;float e=cellE(vWP.xz*.034+vec2(fb3(vWP*.02))*1.4);crk=smoothstep(.07,.0,e)*mud;
    diffuseColor.rgb*=1.-crk*.62;diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.12,1.05,.96),mud*.35*(1.-crk));
    float sp=vn3(vec3(vWP.xz*2.6,1.));diffuseColor.rgb*=1.+flat2*(smoothstep(.8,.92,sp)*.35-smoothstep(.78,.9,1.-sp)*.3);}
   #ifdef OUTER
   ctxV=vec4(0.);
   #else
   ctxV=texture2D(uCtx,vWP.xz/uMap);diffuseColor.rgb=mix(diffuseColor.rgb,ctxV.rgb*.72,ctxV.a*.74);
   #endif`)
  .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   {float h=gH*1.7+vn3(vec3(vWP.x,0.,vWP.z)*.7)*.45+fb3(sq*1.4)*sl*3.2-crk*.9;vec3 dp1=dFdx(-vViewPosition),dp2=dFdy(-vViewPosition);float dhx=dFdx(h),dhy=dFdy(h);vec3 rA=cross(dp2,normal),rB=cross(normal,dp1);float det=dot(dp1,rA);vec3 gg=sign(det)*(dhx*rA+dhy*rB);float gl=length(gg),gm=abs(det)*.85;if(gl>gm)gg*=gm/gl;normal=normalize(abs(det)*normal-gg);}`)
  .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=ctxV.rgb*ctxV.a*(.12+.07*sin(uT*1.7+vWP.x*.02+vWP.z*.03));')
  .replace('#include <dithering_fragment>','#include <dithering_fragment>\n#ifdef OUTER\ngl_FragColor.rgb*=mix(.82,.18,smoothstep(120.,1350.,outD()));\n#else\ngl_FragColor.rgb*=fogAt(vWP);\n#endif');
 };
 return m;
}
class PBuf{
 constructor(n,additive){
  this.n=n;this.c=0;this.P=new Float32Array(n*3);this.C=new Float32Array(n*4);this.S=new Float32Array(n);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(this.P,3).setUsage(THREE.DynamicDrawUsage));g.setAttribute('aC',new THREE.BufferAttribute(this.C,4).setUsage(THREE.DynamicDrawUsage));g.setAttribute('aS',new THREE.BufferAttribute(this.S,1).setUsage(THREE.DynamicDrawUsage));
  this.mat=new THREE.ShaderMaterial({uniforms:{uScale:{value:1}},transparent:true,depthWrite:false,blending:additive?THREE.AdditiveBlending:THREE.NormalBlending,
   vertexShader:'attribute vec4 aC;attribute float aS;varying vec4 vC;uniform float uScale;void main(){vC=aC;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=aS*uScale/-mv.z;}',
   fragmentShader:'varying vec4 vC;void main(){float d=length(gl_PointCoord-.5)*2.;float a=smoothstep(1.,.15,d);gl_FragColor=vec4(vC.rgb,vC.a*a);}'});
  this.m=new THREE.Points(g,this.mat);this.m.frustumCulled=false;this.g=g;
 }
 add(x,y,z,s,r,g,b,a){if(this.c>=this.n)return;const i=this.c++;this.P[i*3]=x;this.P[i*3+1]=z;this.P[i*3+2]=y;this.C[i*4]=r;this.C[i*4+1]=g;this.C[i*4+2]=b;this.C[i*4+3]=a;this.S[i]=s}
 flush(){this.g.setDrawRange(0,this.c);for(const k of['position','aC','aS'])this.g.attributes[k].needsUpdate=true;this.c=0}
}
class Renderer3D extends Renderer{
 constructor(cv,mini,glc){
  super(cv,mini);this.is3D=true;this.glc=glc;this.autoQ=true;this.q='high';this.slow=0;this.dtE=16;this.lastNow=0;
  const R=this.gl=new THREE.WebGLRenderer({canvas:glc,antialias:false,powerPreference:'high-performance'});
  R.outputEncoding=THREE.LinearEncoding;R.toneMapping=THREE.NoToneMapping;R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;R.setClearColor(0x05070b,1);
  this.scene=new THREE.Scene();this.world=new THREE.Group();this.scene.add(this.world);
  this.fov=26;this.camera=new THREE.PerspectiveCamera(this.fov,1,20,9000);this.pitch=58*Math.PI/180;
  const sun=this.sun=new THREE.DirectionalLight(new THREE.Color(1,.84,.64),2.35);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0009;sun.shadow.normalBias=1.4;this.scene.add(sun);this.scene.add(sun.target);
  this.fill=new THREE.HemisphereLight(0x8fb4e6,0x3a2a1c,.26);this.scene.add(this.fill);
  this.lights=[0,1,2].map(()=>{const l=new THREE.PointLight(0xffaa66,0,300,2);this.scene.add(l);return l});
  // 환경 반사
  const env=new THREE.Scene(),skyM=new THREE.ShaderMaterial({side:THREE.BackSide,vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 p;void main(){vec3 d=normalize(p);float h=d.y*.5+.5;vec3 c=mix(vec3(.16,.12,.09),vec3(.28,.46,.86),smoothstep(.42,.9,h));c+=vec3(3.4,2.6,1.7)*pow(max(dot(d,normalize(vec3(-.5,.62,-.46))),0.),22.);c+=vec3(1.1,1.1,1.2)*smoothstep(.72,.74,d.y)*smoothstep(.36,.34,abs(d.x))*.8;gl_FragColor=vec4(c,1.);\n#include <encodings_fragment>\n}'});
  env.add(new THREE.Mesh(new THREE.SphereGeometry(50,32,20),skyM));
  const pm=new THREE.PMREMGenerator(R);this.scene.environment=pm.fromScene(env,.03).texture;pm.dispose();
  this.matU=makeUnitMaterial();
  this.geoC=new Map();this.batches=new Map();this.bMesh=new Map();this.wrecks=[];this.ruins=[];
  this.fogD=new Uint8Array(N*4);this.fogT=new THREE.DataTexture(this.fogD,MW,MH,THREE.RGBAFormat);this.fogT.magFilter=this.fogT.minFilter=THREE.LinearFilter;SH.uFog.value=this.fogT;SH.uMap.value.set(MW*T,MH*T);
  this.fogGL=-2;
  this.ctxC=document.createElement('canvas');this.ctxC.width=this.ctxC.height=1024;this.ctxX=this.ctxC.getContext('2d');this.ctxT=new THREE.CanvasTexture(this.ctxC);this.ctxT.flipY=false;SH.uCtx.value=this.ctxT;this.ctxKey='';
  this.fire=new PBuf(5000,true);this.smoke=new PBuf(1600,false);this.fire.m.renderOrder=5;this.smoke.m.renderOrder=4;this.scene.add(this.smoke.m);this.scene.add(this.fire.m);
  const rtp={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,type:THREE.HalfFloatType,stencilBuffer:false};
  const rt=R.capabilities.isWebGL2?new THREE.WebGLMultisampleRenderTarget(4,4,rtp):new THREE.WebGLRenderTarget(4,4,rtp);if(rt.samples!==undefined)rt.samples=4;
  this.composer=new THREE.EffectComposer(R,rt);
  this.composer.addPass(new THREE.RenderPass(this.scene,this.camera));
  this.bloom=new THREE.UnrealBloomPass(new THREE.Vector2(4,4),.42,.5,1.25);this.composer.addPass(this.bloom);
  this.grade=new THREE.ShaderPass({uniforms:{tDiffuse:{value:null},uT:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
   fragmentShader:`uniform sampler2D tDiffuse;uniform float uT;varying vec2 vUv;
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
float rnd(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec3 c=texture2D(tDiffuse,vUv).rgb*.86;c=aces(c);float l=dot(c,vec3(.3,.59,.11));c=mix(vec3(l),c,1.2);c=mix(c,smoothstep(0.,1.,c),.34);c=mix(c,c*vec3(1.05,.99,.9),smoothstep(.45,1.,l));c=mix(c,c*vec3(.88,.97,1.1),smoothstep(.45,0.,l));c=pow(c,vec3(1./2.2));float v=smoothstep(1.12,.34,length((vUv-vec2(.5,.56))*vec2(1.05,1.15)));c*=mix(.52,1.,v);c+=(rnd(vUv*vec2(1920.,1080.)+uT)-.5)*.014;gl_FragColor=vec4(c,1.);}`});
  this.grade.renderToScreen=true;this.composer.addPass(this.grade);
 }
 resize(){
  const r=this.cv.getBoundingClientRect();this.dpr=Math.min(1.5,window.devicePixelRatio||1);this.w=r.width;this.h=r.height;this.cv.width=Math.round(r.width*this.dpr);this.cv.height=Math.round(r.height*this.dpr);
  if(!this.gl)return;this.gl.setPixelRatio(this.dpr);this.gl.setSize(r.width,r.height,false);this.composer.setPixelRatio&&this.composer.setPixelRatio(this.dpr);this.composer.setSize(r.width,r.height);this.camera.aspect=r.width/Math.max(1,r.height);this.camera.updateProjectionMatrix();
  this.fire.mat.uniforms.uScale.value=this.smoke.mat.uniforms.uScale.value=(r.height*this.dpr)/(2*Math.tan(this.fov*Math.PI/360));
 }
 setQuality(q){this.q=q;this.sun.castShadow=q==='high';this.bloom.enabled=q==='high';const pr=q==='high'?this.dpr:Math.min(1,this.dpr);this.gl.setPixelRatio(pr);this.composer.setPixelRatio(pr);this.composer.setSize(this.w,this.h)}
 geoFull(key,color,frame){if(!Pack.m.has(key+'#t'))return this.geo(key,color,frame);const id='F'+key+'|'+color+'|'+frame;let g=this.geoC.get(id);if(g)return g;const fac=key.slice(0,3);g=Pack.geo(key,color?RT3.rgb(color):[0,0,0],frame,({gpt:.4,gem:1,cla:2.7})[fac]||3,false,true);this.geoC.set(id,g);return g}
 geoL(key,color,frame){const id='L'+key+'|'+color+'|'+frame;let g=this.geoC.get(id);if(g)return g;const fac=key.slice(0,3);g=Pack.geo(key,color?RT3.rgb(color):[0,0,0],frame,({gpt:.4,gem:1,cla:2.7})[fac]||3,true);this.geoC.set(id,g);return g}
 geo(key,color,frame){
  const id=key+'|'+color+'|'+frame;let g=this.geoC.get(id);if(g)return g;
  const m=RT3.B(),team=color?RT3.rgb(color):[0,0,0],fac=key.slice(0,3);
  if(Pack.m.has(key)){g=Pack.geo(key,team,frame,({gpt:.4,gem:1,cla:2.7})[fac]||3);this.geoC.set(id,g);return g}
  if(RT3.UN[key])RT3.UN[key](m,team,RT3.framesFor(key)[frame]);else RT3.BM[key](m,team);
  g=primsToGeo(m.L,fac,team,key);this.geoC.set(id,g);return g;
 }
 batch(key,color,frame){
  const cm=Models.map.get(key);if(cm)frame=0;const lod=!!this.lodOn&&!cm&&Pack.hasLod(key),id=key+'|'+color+'|'+frame+(lod?'|l':'');let b=this.batches.get(id);
  if(!b){const cap=240,m=new THREE.InstancedMesh(cm?cm.geo:lod?this.geoL(key,color,frame):this.geo(key,color,frame),cm?cm.mat:this.matU,cap);m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;m.count=0;this.world.add(m);b={m,n:0,cap};this.batches.set(id,b)}
  return b;
 }
 heightGrid(g){
  const SC=2,W=MW*SC+1,H2=MH*SC+1,a=new Float32Array(W*H2),t=g.terrain,lv=g.level,CL=34,RK=62;
  const raw=new Float32Array(MW*MH);for(let i=0;i<MW*MH;i++)raw[i]=t[i]?RK:lv[i]*CL;
  const R=mulberry(77);
  for(let y=0;y<H2;y++)for(let x=0;x<W;x++){
   const tx=x/SC-.5,ty=y/SC-.5,X0=Math.max(0,Math.min(MW-1,Math.floor(tx))),Y0=Math.max(0,Math.min(MH-1,Math.floor(ty))),X1=Math.min(MW-1,X0+1),Y1=Math.min(MH-1,Y0+1),fx=Math.max(0,Math.min(1,tx-X0)),fy=Math.max(0,Math.min(1,ty-Y0));
   const s=fx*fx*(3-2*fx),q=fy*fy*(3-2*fy),A=raw[X0+Y0*MW],B=raw[X1+Y0*MW],C=raw[X0+Y1*MW],D=raw[X1+Y1*MW];let h=A+(B-A)*s+(C-A)*q+(A-B-C+D)*s*q;
   if(h>CL+4)h+=R()*13-3;a[x+y*W]=h;
  }
  this.hg={a,W,H:H2,SC};
 }
 gh(x,y){const {a,W,H,SC}=this.hg,px=Math.max(0,Math.min(W-1.001,x/T*SC)),py=Math.max(0,Math.min(H-1.001,y/T*SC)),X=px|0,Y=py|0,fx=px-X,fy=py-Y,A=a[X+Y*W],B=a[X+1+Y*W],C=a[X+(Y+1)*W],D=a[X+1+(Y+1)*W];return A+(B-A)*fx+(C-A)*fy+(A-B-C+D)*fx*fy}
 attach(g,terrainCanvas){
  super.attach(g,terrainCanvas);
  while(this.world.children.length)this.world.remove(this.world.children[0]);
  this.batches.clear();for(const m of this.bMesh.values())m.dispose&&m.dispose();this.bMesh.clear();this.wrecks.length=0;this.ruins.length=0;this.shake=0;
  this.fogGL=-2;this.ctxKey='';this.heightGrid(g);
  const {a,W,H}=this.hg,pos=new Float32Array(W*H*3),uv=new Float32Array(W*H*2);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=x+y*W,px=x/(W-1)*MW*T,py=y/(H-1)*MH*T;pos[i*3]=px;pos[i*3+1]=a[i];pos[i*3+2]=py;uv[i*2]=x/(W-1);uv[i*2+1]=y/(H-1)}
  const idxA=new Uint32Array((W-1)*(H-1)*6);let k=0;for(let y=0;y<H-1;y++)for(let x=0;x<W-1;x++){const i=x+y*W,j=i+1,q=i+W,r=q+1;idxA[k++]=i;idxA[k++]=q;idxA[k++]=j;idxA[k++]=j;idxA[k++]=q;idxA[k++]=r}
  const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.BufferAttribute(pos,3));tg.setAttribute('uv',new THREE.BufferAttribute(uv,2));tg.setIndex(new THREE.BufferAttribute(idxA,1));tg.computeVertexNormals();
  if(!this.albC){this.albC=document.createElement('canvas');this.albC.width=this.albC.height=2048}
  this.albX=this.albC.getContext('2d');this.albX.drawImage(this.bg,0,0,2048,2048);
  if(this.albT)this.albT.dispose();this.albT=new THREE.CanvasTexture(this.albC);this.albT.flipY=false;this.albT.encoding=THREE.sRGBEncoding;this.albT.anisotropy=8;this.albT.minFilter=THREE.LinearMipmapLinearFilter;
  if(this.tMat)this.tMat.dispose();this.tMat=makeTerrainMaterial(this.albT);
  this.tMat.shadowSide=THREE.BackSide;const tm=new THREE.Mesh(tg,this.tMat);tm.receiveShadow=true;tm.castShadow=true;this.world.add(tm);
  const skirt=new THREE.Mesh(new THREE.PlaneGeometry(12000,12000),new THREE.MeshBasicMaterial({color:0x04060a}));skirt.rotation.x=-Math.PI/2;skirt.position.set(MW*T/2,-60,MH*T/2);this.world.add(skirt);
  {// 맵 바깥으로 이어지는 산지
   const MX=MW*T,MY=MH*T,EX=1500,ST2=40,nx=Math.ceil((MX+2*EX)/ST2)+1,ny=Math.ceil((MY+2*EX)/ST2)+1,op=new Float32Array(nx*ny*3),ou=new Float32Array(nx*ny*2),sm=(a,b,v)=>{const k=Math.min(1,Math.max(0,(v-a)/(b-a)));return k*k*(3-2*k)},cl=(v,a,b)=>Math.max(a,Math.min(b,v));
   const rid=(x,y)=>{let v=0,a=1,f=.0042;for(let o=0;o<4;o++){v+=a*(1-Math.abs(Math.sin(x*f+o*1.7+Math.sin(y*f*.8+o)*1.3)*Math.cos(y*f*1.1-o*.9+Math.sin(x*f*.6)*1.1)));a*=.5;f*=2.07}return v/1.875};
   for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const x=-EX+i*ST2,y=-EX+j*ST2,k=i+j*nx,dx=Math.max(-x,0,x-MX),dy=Math.max(-y,0,y-MY),d=Math.hypot(dx,dy);let h;
    if(d<=0)h=-46;else{const amp=170+100*sm(0,300,-y)-130*sm(0,240,y-MY);h=this.gh(cl(x,0,MX),cl(y,0,MY))*(1-sm(0,80,d))+sm(30,560,d)*amp*(.35+.75*rid(x,y))+sm(0,40,d)*2}
    op[k*3]=x;op[k*3+1]=h;op[k*3+2]=y;ou[k*2]=cl(x/MX,0,1);ou[k*2+1]=cl(y/MY,0,1)}
   const oi=new Uint32Array((nx-1)*(ny-1)*6);let q2=0;for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){const a=i+j*nx,b=a+1,c=a+nx,e=c+1;oi[q2++]=a;oi[q2++]=c;oi[q2++]=b;oi[q2++]=b;oi[q2++]=c;oi[q2++]=e}
   const og=new THREE.BufferGeometry();og.setAttribute('position',new THREE.BufferAttribute(op,3));og.setAttribute('uv',new THREE.BufferAttribute(ou,2));og.setIndex(new THREE.BufferAttribute(oi,1));og.computeVertexNormals();
   if(!this.oMat)this.oMat=makeTerrainMaterial(this.albT,true);else{this.oMat.map=this.albT;this.oMat.needsUpdate=true}
   const om=new THREE.Mesh(og,this.oMat);om.receiveShadow=true;this.world.add(om);this.outerH=(x,y)=>{const i=Math.round((x+EX)/ST2),j=Math.round((y+EX)/ST2);return op[(cl(i,0,nx-1)+cl(j,0,ny-1)*nx)*3+1]};
  }
  this.buildProps(g);
  this.albDirty=0;
 }
 buildProps(g){
  const R=mulberry(31),rockG=(()=>{let q=new THREE.IcosahedronGeometry(1,2);q.deleteAttribute('uv');q.deleteAttribute('normal');q=THREE.BufferGeometryUtils.mergeVertices(q,.001);const P=q.attributes.position,V3=(a,b,c)=>Math.sin(a*3.1+b*1.7)*.5+Math.sin(b*4.3+c*2.9)*.3+Math.sin(c*6.7+a*5.3)*.2;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),d=.82+V3(x,y,z)*.22;P.setXYZ(i,x*d,y*d*.62,z*d)}q.computeVertexNormals();const n=P.count,col=new Float32Array(n*3),ma=new Float32Array(n*4);for(let i=0;i<n;i++){col[i*3]=.055;col[i*3+1]=.047;col[i*3+2]=.043;ma[i*4]=0;ma[i*4+1]=.93;ma[i*4+2]=0;ma[i*4+3]=3}q.setAttribute('color',new THREE.BufferAttribute(col,3));q.setAttribute('aMat',new THREE.BufferAttribute(ma,4));return q})();
  const list=[];const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),P3=new THREE.Vector3(),S3=new THREE.Vector3(),E=new THREE.Euler();
  const pebG=(()=>{const q=new THREE.IcosahedronGeometry(1,1);q.deleteAttribute('uv');const n=q.attributes.position.count,col=new Float32Array(n*3),ma=new Float32Array(n*4);for(let i=0;i<n;i++){const v=.04+((i*7)%5)*.006;col[i*3]=v*1.15;col[i*3+1]=v;col[i*3+2]=v*.88;ma[i*4+1]=.9;ma[i*4+3]=3}q.setAttribute('color',new THREE.BufferAttribute(col,3));q.setAttribute('aMat',new THREE.BufferAttribute(ma,4));return q})();
  for(let i=0;i<1500;i++){const x=R()*MW*T,y=R()*MH*T,tile=idx(tileOf(x),tileOf(y)),bk=g.terrain[tile];if(bk&&R()>.55)continue;if(!bk&&R()>.42)continue;if(!bk&&g.level[tile]>.5)continue;const near=g.res.some(r=>hyp(r.x-x,r.y-y)<r.r+24)||g.bases.some(b=>hyp(b.x*T-x,b.y*T-y)<3.4*T);if(!bk&&near)continue;const s=bk?5+R()*11:1.4+R()*5;list.push([x,y,s])}
  for(const r of g.res){if(r.type!=='d')continue;for(let i=0;i<16;i++){const a=i/16*TAU;list.push([r.x+Math.cos(a)*r.r*1.16,r.y+Math.sin(a)*r.r*1.04,4+R()*4])}}
  const rocks=new THREE.InstancedMesh(rockG,this.matU,list.length);rocks.castShadow=true;rocks.receiveShadow=true;rocks.frustumCulled=false;
  list.forEach((q,i)=>{P3.set(q[0],this.gh(q[0],q[1])+q[2]*.1,q[1]);E.set(R()*.5,R()*6.28,R()*.5);Q.setFromEuler(E);S3.set(q[2]*(.8+R()*.6),q[2]*(.6+R()*.5),q[2]*(.8+R()*.6));M.compose(P3,Q,S3);rocks.setMatrixAt(i,M)});
  this.world.add(rocks);
  // 폐서버 잔해
  // 조약돌
  {const pl=[];for(let i=0;i<2600;i++){const x=R()*MW*T,y=R()*MH*T,tile=idx(tileOf(x),tileOf(y));if(g.terrain[tile]||g.blocked[tile])continue;if(g.res.some(r=>hyp(r.x-x,r.y-y)<r.r+10)||g.bases.some(b=>hyp(b.x*T-x,b.y*T-y)<2.6*T))continue;pl.push([x,y,.7+R()*1.9])}
   const pm=new THREE.InstancedMesh(pebG,this.matU,pl.length);pm.receiveShadow=true;pm.frustumCulled=false;pl.forEach((q,i)=>{P3.set(q[0],this.gh(q[0],q[1])+q[2]*.15,q[1]);E.set(R(),R()*6.28,R());Q.setFromEuler(E);S3.set(q[2]*(.8+R()*.5),q[2]*(.5+R()*.4),q[2]*(.8+R()*.5));M.compose(P3,Q,S3);pm.setMatrixAt(i,M)});this.world.add(pm)}
  // 마른 풀
  {const parts=[];for(let i=0;i<7;i++){const c=new THREE.ConeGeometry(.16,1,4,1);c.translate(0,.5,0);const h=.55+R()*.7;c.scale(1,h,1);c.rotateZ((R()-.5)*.7);c.rotateX((R()-.5)*.7);c.translate((R()-.5)*1.1,0,(R()-.5)*1.1);parts.push(c)}
   const tg2=THREE.BufferGeometryUtils.mergeBufferGeometries(parts.map(c=>{c.deleteAttribute('uv');return c}),false),n=tg2.attributes.position.count,col=new Float32Array(n*3),ma=new Float32Array(n*4);
   for(let i=0;i<n;i++){const y=tg2.attributes.position.getY(i),k=Math.min(1,y/1.1);col[i*3]=.03+.16*k;col[i*3+1]=.028+.13*k;col[i*3+2]=.012+.035*k;ma[i*4]=0;ma[i*4+1]=.9;ma[i*4+2]=0;ma[i*4+3]=3}
   tg2.setAttribute('color',new THREE.BufferAttribute(col,3));tg2.setAttribute('aMat',new THREE.BufferAttribute(ma,4));
   const gl2=[];for(let i=0;i<4200&&gl2.length<1500;i++){const x=R()*MW*T,y=R()*MH*T,tile=idx(tileOf(x),tileOf(y));if(g.terrain[tile]||g.blocked[tile])continue;const nz=Math.sin(x*.011+1.2)*Math.cos(y*.0093-.4)+.5*Math.sin(x*.027-y*.021);if(nz<.35)continue;if(g.res.some(r=>hyp(r.x-x,r.y-y)<r.r+14)||g.bases.some(b=>hyp(b.x*T-x,b.y*T-y)<3*T))continue;gl2.push([x,y,3.4+R()*4.2])}
   const gm=new THREE.InstancedMesh(tg2,this.matU,gl2.length);gm.receiveShadow=true;gm.frustumCulled=false;gl2.forEach((q,i)=>{P3.set(q[0],this.gh(q[0],q[1])-.3,q[1]);E.set(0,R()*6.28,0);Q.setFromEuler(E);S3.set(q[2],q[2]*(.8+R()*.6),q[2]);M.compose(P3,Q,S3);gm.setMatrixAt(i,M)});this.world.add(gm)}
  // 맵 바깥 잔해와 바위
  {const MX=MW*T,MY=MH*T,out=[];for(let i=0;i<900&&out.length<260;i++){const x=-900+R()*(MX+1800),y=-900+R()*(MY+1800),d=Math.hypot(Math.max(-x,0,x-MX),Math.max(-y,0,y-MY));if(d<60||d>820)continue;out.push([x,y,d])}
   const big=new THREE.InstancedMesh(rockG,this.matU,out.length);big.castShadow=true;big.receiveShadow=true;big.frustumCulled=false;out.forEach((q,i)=>{const s2=9+R()*26*(.4+q[2]/900);P3.set(q[0],this.outerH(q[0],q[1])+s2*.12,q[1]);E.set(R()*.5,R()*6.28,R()*.5);Q.setFromEuler(E);S3.set(s2*(.8+R()*.6),s2*(.5+R()*.5),s2*(.8+R()*.6));M.compose(P3,Q,S3);big.setMatrixAt(i,M)});this.world.add(big);
   for(const k of ['dd_pylon','dd_dish','dd_rack','dd_fan']){const sp=[];for(let i=0;i<400&&sp.length<6;i++){const x=-500+R()*(MX+1000),y=-420+R()*(MY+700),d=Math.hypot(Math.max(-x,0,x-MX),Math.max(-y,0,y-MY));if(d<70||d>330||y>MY+120)continue;sp.push([x,y])}
    const m=new THREE.InstancedMesh(this.geo(k,null,0),this.matU,sp.length);m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;sp.forEach((q,i)=>{P3.set(q[0],this.outerH(q[0],q[1])-3,q[1]);E.set(R()*.3,R()*6.28,R()*.3);Q.setFromEuler(E);S3.setScalar(1.4+R()*1.2);M.compose(P3,Q,S3);m.setMatrixAt(i,M)});this.world.add(m)}}
  // 컴퓨트 지대 주변의 작은 결정
  {const sp=[];for(const r of g.res){if(r.type!=='c')continue;for(let i=0;i<2;i++){const a=R()*TAU,d=r.r+26+R()*30,x=r.x+Math.cos(a)*d,y=r.y+Math.sin(a)*d,tile=idx(tileOf(x),tileOf(y));if(g.blocked[tile]||g.res.some(q=>hyp(q.x-x,q.y-y)<q.r+12))continue;if(R()<.45)sp.push([x,y])}}
   const m=new THREE.InstancedMesh(this.geo('dd_shard',null,0),this.matU,Math.max(1,sp.length));m.count=sp.length;m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;sp.forEach((q,i)=>{P3.set(q[0],this.gh(q[0],q[1])-1,q[1]);E.set(0,R()*6.28,0);Q.setFromEuler(E);S3.setScalar(.6+R()*.5);M.compose(P3,Q,S3);m.setMatrixAt(i,M)});this.world.add(m)}
  const ddk=['dd_rack','dd_fan','dd_cable'];for(const k of ddk){const sp=[];for(let i=0;i<60;i++){const tx=2+R()*(MW-4)|0,ty=2+R()*(MH-4)|0;if(g.terrain[idx(tx,ty)]&&sp.length<7)sp.push([tx,ty])}if(!sp.length)continue;const m=new THREE.InstancedMesh(this.geo(k,null,0),this.matU,sp.length);m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;sp.forEach((q,i)=>{const X=q[0]*T+16,Y=q[1]*T+16;P3.set(X,this.gh(X,Y)-2,Y);E.set(R()*.25,R()*6.28,R()*.25);Q.setFromEuler(E);S3.setScalar(.95+R()*.6);M.compose(P3,Q,S3);m.setMatrixAt(i,M)});this.world.add(m)}
  // 데이터 호수
  this.lakes=new Map();if(!this.lakeM)this.lakeM=new THREE.ShaderMaterial({uniforms:{uT:SH.uT,uFog:SH.uFog,uFogOff:SH.uFogOff,uMap:SH.uMap},vertexShader:'varying vec3 vWP;varying vec2 vU;void main(){vU=uv;vec4 w=modelMatrix*vec4(position,1.);vWP=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
   fragmentShader:`uniform float uT;varying vec3 vWP;varying vec2 vU;${GLSL_NOISE}${FOGF}void main(){vec2 c=vU-.5;float r=length(c)*2.;vec3 p=vec3(vWP.x*.07,uT*.35,vWP.z*.07);float e=.12;float h=fb3(p),hx=fb3(p+vec3(e,0,0)),hz=fb3(p+vec3(0,0,e));vec3 n=normalize(vec3(h-hx,.12,h-hz));vec3 v=normalize(vec3(0.,.86,.5));float fr=pow(1.-max(dot(n,v),0.),3.);vec3 deep=vec3(.002,.05,.1),shal=vec3(.01,.42,.62);vec3 col=mix(shal,deep,smoothstep(.0,.95,1.-r*r));col+=vec3(.7,.95,1.)*fr*1.8;vec3 l=normalize(vec3(-.5,.62,-.46));vec3 hv=normalize(l+v);col+=vec3(3.,2.6,2.)*pow(max(dot(n,hv),0.),160.);float ring=sin(r*34.-uT*2.6)*.5+.5;col+=vec3(.02,.5,.8)*pow(ring,10.)*(1.-r)*1.4;float mot=smoothstep(.76,.86,vn3(vec3(vWP.xz*.28,uT*.7)));col+=vec3(.5,1.8,2.2)*mot;col*=smoothstep(1.,.92,r);gl_FragColor=vec4(col*fogAt(vWP),1.);}`});
  for(const r of g.res){if(r.type!=='d')continue;const m=new THREE.Mesh(new THREE.CircleGeometry(r.r*1.04,48),this.lakeM);m.rotation.x=-Math.PI/2;m.position.set(r.x,this.gh(r.x,r.y)+2.5,r.y);m.scale.set(1,.92,1);this.world.add(m);if(Pack.m.has('res_d')){const rim=new THREE.Mesh(this.geo('res_d',null,0),this.matU);rim.castShadow=true;rim.receiveShadow=true;rim.position.set(0,0,-2.5);rim.rotation.x=Math.PI/2;rim.rotation.y=0;rim.rotateOnAxis(new THREE.Vector3(0,1,0),r.id*1.3);m.add(rim)}this.lakes.set(r.id,m)}
 }
 screen(x,y,h){const v=this._v||(this._v=new THREE.Vector3());v.set(x,h,y).project(this.camera);return[(v.x+1)/2*this.w,(1-v.y)/2*this.h]}
 project(x,y,h){return this.screen(x,y,this.gh(x,y)+(h||0))}
 toWorld(sx,sy){
  const c=this.camera,v=new THREE.Vector3((sx/this.w)*2-1,1-(sy/this.h)*2,.5).unproject(c),o=c.position,d=v.sub(o).normalize();let Hh=0,x=0,y=0;
  for(let i=0;i<3;i++){const t=(Hh-o.y)/d.y;x=o.x+d.x*t;y=o.z+d.z*t;Hh=this.gh(x,y)}
  return[x,y];
 }
 updateCam(){
  const cam=this.cam,z=cam.z,cx=cam.x+this.w/(2*z),cy=cam.y+this.h/(2*z),dist=(this.h/2)/Math.tan(this.fov*Math.PI/360)/z,c=this.camera;
  c.near=Math.max(40,dist*.42);c.far=dist*2.1;c.updateProjectionMatrix();c.position.set(cx,Math.sin(this.pitch)*dist,cy+Math.cos(this.pitch)*dist);c.lookAt(cx,0,cy);c.updateMatrixWorld();
  const span=Math.max(this.w,this.h)/z*.95,sun=this.sun;sun.target.position.set(cx,0,cy-40);sun.position.set(cx-.5*2200,.74*2200,cy-40-.46*2200);const sc=sun.shadow.camera;sc.left=-span;sc.right=span;sc.top=span;sc.bottom=-span;sc.near=200;sc.far=5200;sc.updateProjectionMatrix();
 }
 syncFog(){
  const g=this.g,d=this.fogD;if(g.observer){if(this.fogGL!==-1){for(let i=0;i<N;i++)d[i*4+3]=255;this.fogT.needsUpdate=true;this.fogGL=-1}return}
  if(this.fogGL===g.visV)return;this.fogGL=g.visV;const A=this._fa2||(this._fa2=new Float32Array(N));for(let i=0;i<N;i++){const v=g.vis[i];A[i]=v===2?255:v===1?88:0}
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){let s=0,w=0;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const X=x+a,Y=y+b;if(X<0||Y<0||X>=MW||Y>=MH)continue;const k=(a?1:2)*(b?1:2);s+=A[X+Y*MW]*k;w+=k}d[(x+y*MW)*4+3]=s/w}this.fogT.needsUpdate=true;
 }
 syncCtx(){
  const g=this.g,k=g.p.map(p=>p.fac==='cla'?p.ctxV:'').join();if(k===this.ctxKey)return;this.ctxKey=k;const c=this.ctxX;c.clearRect(0,0,1024,1024);for(const p of g.p)if(p.fac==='cla')c.drawImage(this.ctxLayer(p),0,0,1024,1024);this.ctxT.needsUpdate=true;
 }
 sfx(s,x,y,z){}
 draw(ui,now){
  const g=this.g,t=now/1000,dtm=now-this.lastNow;this.lastNow=now;
  if(this.autoQ&&ui){this.dtE+=(dtm-this.dtE)*.05;if(this.q==='high'&&this.dtE>48){if(++this.slow>90){this.setQuality('low');ui.say('프레임 유지를 위해 그래픽 품질을 낮췄습니다.')}}else this.slow=0}
  SH.uT.value=t;this.grade.uniforms.uT.value=t%10;this.updateCam();this.syncFog();this.syncCtx();
  // 지면 잔해
  if(g.decals.length){this.flushDecals();this.albDirty=1;this.albNext=this.albNext||now+1200}
  if(this.albDirty&&now>(this.albNext||0)){this.albX.drawImage(this.bg,0,0,2048,2048);this.albT.needsUpdate=true;this.albDirty=0;this.albNext=0}
  for(const b of this.batches.values())b.n=0;
  const M=this._M||(this._M=new THREE.Matrix4()),Q=this._Q||(this._Q=new THREE.Quaternion()),P3=this._P||(this._P=new THREE.Vector3()),S3=this._S||(this._S=new THREE.Vector3()),AX=YAX;
  const EU=this._E||(this._E=new THREE.Euler(0,0,0,'YXZ'));const put=(key,color,frame,x,y,yOff,face,s,pitch,roll)=>{const b=this.batch(key,color,frame);if(b.n>=b.cap)return;P3.set(x,this.gh(x,y)+yOff,y);EU.set(roll||0,-face,pitch||0);Q.setFromEuler(EU);S3.setScalar(s);M.compose(P3,Q,S3);b.m.setMatrixAt(b.n++,M)};
  // 자원
  for(const r of g.res){if(r.type==='d'){const m=this.lakes.get(r.id);if(m)m.visible=g.tileExp(r.x,r.y)&&!(r.ext&&r.ext.built);continue}if(!g.tileExp(r.x,r.y))continue;put('res_c'+(r.id%3),null,0,r.x,r.y,0,0,1.2*(.55+.45*Math.min(1,r.amt/r.max)))}
  // 유닛
  this.lodOn=this.cam.z<1||g.units.length>140||(this.q!=='high'&&g.units.length>70);
  for(const u of g.units){if(!(u.p===ME||g.observer||g.tileVis(u.x,u.y)))continue;const n=RT3.framesFor(u.def.key).length,sp={n};const age=(g.tick-(u.born||0))/TPS,s=1.26*(age<.4&&g.tick>30?.35+.65*age/.4:1);
   if(u._rf==null)u._rf=u.face;let dA=u.face-u._rf;while(dA>Math.PI)dA-=TAU;while(dA<-Math.PI)dA+=TAU;u._rf+=dA*Math.min(1,.22);const veh=u.def.tags.includes('mech')||u.def.r>13,mov=u.moving?1:0;u._mv=(u._mv||0)+(mov-(u._mv||0))*.14;
   let yO=0,pitch=0,roll=0,ox=0,oy=0;if(u.air){roll=-Math.max(-.42,Math.min(.42,dA*1.4));pitch=-.13*u._mv;yO=Math.sin(t*2.2+u.id)*1.8}else if(veh){pitch=-.022*u._mv+Math.sin(t*16+u.id)*.006*u._mv}else{yO=Math.abs(Math.sin(u.walk*2.4))*1.5*u._mv;roll=Math.sin(u.walk*2.4)*.05*u._mv}
   if(u.atkT>0&&u.def.rng>1.2){const k=u.atkT/.2*2.4;ox=-Math.cos(u.face)*k;oy=-Math.sin(u.face)*k;if(veh)pitch+=.03*u.atkT/.2}
   put(u.def.key,g.p[u.p].color,this.frameOf(u,sp,t),u.x+ox,u.y+oy,yO,u._rf,s,pitch,roll);
   const tk=u.def.key+'#t';if(Pack.m.has(tk)&&!Models.map.get(u.def.key)){const e=u.tgt&&!u.tgt.dead?u.tgt:null,want=e?Math.atan2(e.y-u.y,e.x-u.x):u._rf;if(u._ta==null)u._ta=u._rf;let dt2=want-u._ta;while(dt2>Math.PI)dt2-=TAU;while(dt2<-Math.PI)dt2+=TAU;u._ta+=dt2*.16;put(tk,g.p[u.p].color,0,u.x+ox,u.y+oy,yO,u._ta,s,pitch,roll)}}
  this.drawWrecks(put,g,t);
  // 건물
  const live=new Set();
  for(const b of g.blds){const vis=b.p===ME||g.observer||b.seen;let m=this.bMesh.get(b.id);if(!vis){if(m)m.visible=false;continue}if(!m){const cm=Models.map.get(b.def.key);m=new THREE.Mesh(cm?cm.geo:this.geo(b.def.key,g.p[b.p].color,0),cm?cm.mat:this.matU);m.castShadow=true;m.receiveShadow=true;m.position.set(b.x,this.gh(b.x,b.y),b.y);this.world.add(m);this.bMesh.set(b.id,m);const tk=b.def.key+'#t';if(!cm&&Pack.m.has(tk)){const tm=new THREE.Mesh(this.geo(tk,g.p[b.p].color,0),this.matU);tm.castShadow=true;tm.receiveShadow=true;m.add(tm);m.userData.tur=tm;m.userData.ang=(b.id%8)*.785}}if(m.userData.tur){const e=b.tgt&&!b.tgt.dead?b.tgt:null,want=e?Math.atan2(e.y-b.y,e.x-b.x):m.userData.ang+.004;let d2=want-m.userData.ang;while(d2>Math.PI)d2-=TAU;while(d2<-Math.PI)d2+=TAU;m.userData.ang+=d2*(e?.18:.5);m.userData.tur.rotation.y=-m.userData.ang}live.add(b.id);m.visible=true;const pr=b.built?1:Math.max(.06,b.prog);if(b.def.fac==='cla')m.scale.setScalar(b.built?1:.42+.58*pr);else m.scale.set(1,b.built?1:pr,1)}
  for(const [id,m] of this.bMesh){if(!live.has(id)&&!g.by.has(id)){this.bMesh.delete(id);if(g.tileVis(m.position.x,m.position.z))this.ruins.push({m,t,y0:m.position.y,h:(m.geometry.boundingSphere?m.geometry.boundingSphere.radius:40),sx:Math.sin(id*3.1),sz:Math.cos(id*2.3)});else this.world.remove(m)}}
  this.updRuins(t);
  for(const b of this.batches.values()){b.m.count=b.n;b.m.instanceMatrix.needsUpdate=true}
  this.emitFx(g,t,now);
  const ca=this.shake||0;if(ca>.2){const c=this.camera;this._sp=this._sp||new THREE.Vector3();this._sp.copy(c.position);c.position.x+=(Math.random()-.5)*ca*2;c.position.z+=(Math.random()-.5)*ca*2;c.updateMatrixWorld();this.composer.render();c.position.copy(this._sp);c.updateMatrixWorld();this.shake=ca*.88}else{this.shake=0;this.composer.render()}
  this.overlay(ui,t);
 }
 drawWrecks(put,g,t){
  const W=this.wrecks;for(let i=W.length-1;i>=0;i--){const w=W[i],k=(t-w.t)/w.life;if(k>=1||w.g!==g){W.splice(i,1);continue}
   const down=w.air?Math.min(1,k*4):0,sink=Math.max(0,k-.65)/.35,yOff=-(w.air?w.z*down:0)-sink*w.h,tilt=(w.air?.7*down:.22)+.1*k;
   put(w.key,w.color,0,w.x,w.y,yOff,w.face,w.s*(w.fac==='cla'?1-.5*k:1),tilt*w.sa,tilt*w.sb);
  }
 }
 updRuins(t){
  const R=this.ruins;for(let i=R.length-1;i>=0;i--){const r=R[i],k=(t-r.t)/2.6;if(k>=1){this.world.remove(r.m);R.splice(i,1);continue}
   const e=k*k;r.m.position.y=r.y0-e*r.h*1.5;r.m.rotation.x=r.sx*.16*e;r.m.rotation.z=r.sz*.16*e;
   for(let q=0;q<6;q++){const a=q*1.05+t*.8,kk=((t*.8+q*.17)%1),rr=r.h*.55;this.smoke.add(r.m.position.x+Math.cos(a)*rr,r.m.position.z+Math.sin(a)*rr,r.y0+12+kk*110,34+kk*70,.05,.05,.055,(1-kk)*(1-k)*.7);this.fire.add(r.m.position.x+Math.cos(a*2)*rr*.7,r.m.position.z+Math.sin(a*2)*rr*.7,r.y0+6+kk*44,26*(1-kk),4,1.3,.2,(1-kk)*(1-k))}
  }
 }
 envFx(g,t){
  if(this.q==='low')return;const F=this.fire,Sm=this.smoke,z=this.cam.z,cx=this.cam.x+this.w/(2*z),cy=this.cam.y+this.h/(2*z),hw=this.w/z*.75,hh=this.h/z*.9;
  for(const r of g.res){if(Math.abs(r.x-cx)>hw||Math.abs(r.y-cy)>hh||!g.tileExp(r.x,r.y))continue;const G=this.gh(r.x,r.y);
   if(r.type==='d'){if(r.ext&&r.ext.built)continue;for(let i=0;i<7;i++){const k=(t*.11+i/7+r.id*.37)%1,a=i*2.4+t*.3;Sm.add(r.x+Math.cos(a)*(8+k*22),r.y+Math.sin(a)*(8+k*22),G+8+k*120,46+k*110,.26,.52,.66,(1-k)*k*.5);if(i<4){const k2=(t*.32+i/4+r.id*.21)%1;F.add(r.x+Math.cos(a*1.7)*20*k2,r.y+Math.sin(a*1.7)*20*k2,G+4+k2*60,7,.25,.8,1.2,(1-k2)*.55)}}}
   else if(r.amt>0){for(let i=0;i<2;i++){const ph=(t*.6+r.id*.41+i*.5)%1,pk=Math.pow(Math.max(0,Math.sin(ph*Math.PI)),6),ox=Math.sin(r.id*3.7+i*2.1)*22,oy=Math.cos(r.id*2.3+i*1.7)*7;F.add(r.x+ox,r.y+oy,G+18+i*12,16*pk+2,.35,1.2,.85,pk*.8)}}}
  for(let i=0;i<30;i++){const s1=i*97.31,x=cx-hw+((s1*7.3+t*9)%(hw*2)),y=cy-hh+((s1*13.7+Math.sin(t*.2+i)*30)%(hh*2)),h=12+(s1*3.1%70)+Math.sin(t*.7+i)*6;Sm.add(x,y,this.gh(x,y)+h,26,.5,.42,.32,.05)}
 }
 emitFx(g,t,now){
  this.envFx(g,t);
  const F=this.fire,Sm=this.smoke,gh=(x,y)=>this.gh(x,y);let lightN=0;const light=(x,y,z,col,I)=>{if(lightN>=3||this.q!=='high')return;const l=this.lights[lightN++];l.position.set(x,z,y);l.color.set(col);l.intensity=I};
  const seen=(x,y)=>g.tileVis(x,y);
  for(const u of g.units){
   if(!(u.p===ME||g.observer||g.tileVis(u.x,u.y)))continue;const col=hexRgb(g.p[u.p].color),G=gh(u.x,u.y),age=(g.tick-(u.born||0))/TPS;
   if(u.o&&u.o.t==='gather'&&u.o.ph==='mine'){const r=g.by.get(u.o.id);if(r){const c=u.def.fac==='gem'?[3,1.4,.3]:u.def.fac==='cla'?[3,.9,.2]:[col[0]*4,col[1]*4,col[2]*4],n=10,ex=r.x+Math.sin(t*3+u.id)*8,ey=r.y;for(let i=0;i<=n;i++){const k=i/n,wob=u.def.fac==='cla'?Math.sin(t*9+k*7+u.id)*4:0;F.add(u.x+(ex-u.x)*k+wob,u.y+(ey-u.y)*k,G+18*(1-k)+10*k,5,c[0],c[1],c[2],.9)}for(let i=0;i<3;i++){const a=t*30+i*2.1+u.id;F.add(ex+Math.cos(a)*7,ey+Math.sin(a)*5,G+11+Math.abs(Math.sin(a))*7,7,c[0]*1.3,c[1]*1.3,c[2]*1.3,1)}}}
   if(u.healT>0){const e=g.by.get(u.healId);if(e&&!e.dead){const Ge=gh(e.x,e.y),n=12,hc=u.def.fac==='gem'?[3.2,1.8,.4]:u.def.fac==='cla'?[1.6,2.8,.4]:[col[0]*3,col[1]*3,col[2]*3];for(let i=0;i<=n;i++){const k=i/n;F.add(u.x+(e.x-u.x)*k,u.y+(e.y-u.y)*k,G+(u.air?40:24)+(Ge+18-G-(u.air?40:24))*k+Math.sin(k*9+t*12)*2,5,hc[0],hc[1],hc[2],.8)}F.add(e.x,e.y,Ge+18,26,hc[0],hc[1],hc[2],.55)}}
   if(u.boost>0)F.add(u.x,u.y,G+14,34,col[0]*.8,col[1]*.8,col[2]*.8,.5);
   if(u.def.sh&&u.sh>0&&g.tick-u.lastHit<9){const R0=u.r*1.5;for(let i=0;i<14;i++){const a=i/14*TAU;F.add(u.x+Math.cos(a)*R0,u.y+Math.sin(a)*R0,G+18+Math.sin(a*2+t*12)*7,7,col[0]*3,col[1]*3,col[2]*3,.8)}}
   if(age<.5&&g.tick>30){if(u.def.fac==='gpt'){for(let i=0;i<14;i++){F.add(u.x,u.y,G+i*12,16-(i*.5),col[0]*2.6,col[1]*2.6,col[2]*2.6,(1-age*2)*(1-i/14))}}else if(u.def.fac==='gem'){for(let i=0;i<10;i++){const a=i*.8+u.id;F.add(u.x+Math.cos(a)*u.r*2.4*age*2,u.y+Math.sin(a)*u.r*2.4*age*2,G+8+30*age,6,3,1.8,.5,1-age*2)}}else{for(let i=0;i<12;i++){const a=i*.7+u.id;Sm.add(u.x+Math.cos(a)*14*age*2,u.y+Math.sin(a)*14*age*2,G+6,10,.5,.14,.04,1-age*2)}}}
   if(u.moving&&!u.air&&(u.def.tags.includes('mech')||u.def.r>13)&&((g.tick+u.id)%6===0))Sm.add(u.x+(Math.random()-.5)*10,u.y+(Math.random()-.5)*10,G+4,32,.3,.26,.22,.2);
  }
  for(const b of g.blds){
   if(!g.tileVis(b.x,b.y))continue;const G=gh(b.x,b.y),hf=b.hp/b.def.hp,col=hexRgb(g.p[b.p].color);
   if(b.built&&hf<.55){const n=hf<.3?4:2;for(let i=0;i<n;i++){const ox=Math.sin(b.id*3+i*2.2)*b.r*.55,oy=Math.cos(b.id*5+i*1.7)*b.r*.55,bz=G+22+((b.id*7+i*13)%24);for(let q=0;q<7;q++){const k=((t*1.5+q*.16+i*.3)%1);F.add(b.x+ox+Math.sin(q*9+t*7)*5*(1-k),b.y+oy,bz+k*34,(26-k*16),3.6,1.2*(1.1-k),.12,(1-k)*.85);}for(let q=0;q<5;q++){const k=((t*.32+q*.2+i*.3)%1);Sm.add(b.x+ox-k*20+Math.sin(q+t)*5,b.y+oy,bz+34+k*120,30+k*64,.05,.05,.06,(1-k)*.5)}}}
   if(b.def.fac==='gem'&&b.def.role==='hq'&&b.built){for(let i=0;i<3;i++)for(let q=0;q<5;q++){const k=((t*.22+q*.2+i*.17)%1);Sm.add(b.x-36+i*16-k*30,b.y-34,G+90+k*110,20+k*60,.32,.32,.34,(1-k)*.34)}}
   if(!b.built){const y0=G+(b.prog||.05)*(b.def.role==='hq'?90:58);for(let i=0;i<20;i++){const a=i/20*TAU+t*2;F.add(b.x+Math.cos(a)*b.r*.95,b.y+Math.sin(a)*b.r*.95,y0,7,col[0]*3,col[1]*3,col[2]*3,.8)}}
   if(b.q.length&&b.built)F.add(b.x,b.y,G+60,50+Math.sin(t*5)*12,col[0]*1.1,col[1]*1.1,col[2]*1.1,.35);
  }
  for(const s of g.proj){
   if(!seen(s.x,s.y))continue;const C=hexRgb(s.c),G=gh(s.x,s.y),z0=s.air?44:20,HC=[C[0]*6+.5,C[1]*6+.5,C[2]*6+.5];
   if(s.kind==='beam'){const Gs=gh(s.sx,s.sy),n=Math.ceil(hyp(s.x-s.sx,s.y-s.sy)/9);for(let i=0;i<=n;i++){const k=i/n;F.add(s.sx+(s.x-s.sx)*k,s.sy+(s.y-s.sy)*k,Gs+z0+(G+18-Gs-z0)*k,9,HC[0],HC[1],HC[2],.95);F.add(s.sx+(s.x-s.sx)*k,s.sy+(s.y-s.sy)*k,Gs+z0+(G+18-Gs-z0)*k,3.4,7,7,7,1)}light(s.x,s.y,G+30,s.c,3.2)}
   else if(s.kind==='shell'){const d=hyp(s.tx-s.sx,s.ty-s.sy)||1,prog=Math.min(1,hyp(s.x-s.sx,s.y-s.sy)/d),ar=Math.sin(prog*Math.PI)*Math.min(90,d*.4);F.add(s.x,s.y,G+22+ar,16,HC[0],HC[1]*.7,HC[2]*.5,1);Sm.add(s.x,s.y,G+22+ar,22,.12,.12,.13,.42)}
   else if(s.kind==='spit'){F.add(s.x,s.y,G+20,14,HC[0],HC[1],HC[2],1)}
   else{const a=Math.atan2(s.ty-s.y,s.tx-s.x);for(let i=0;i<6;i++){const q=i*3.4;F.add(s.x-Math.cos(a)*q,s.y-Math.sin(a)*q,G+20,7-i*.7,HC[0],HC[1],HC[2],1-i/7)}}
   if(hyp(s.x-s.sx,s.y-s.sy)<46){const Gs=gh(s.sx,s.sy);F.add(s.sx,s.sy,Gs+z0,30,8,6,3,1);light(s.sx,s.sy,Gs+z0+12,'#ffd9a0',1.8)}
  }
  for(const f of g.fx){
   if(!seen(f.x,f.y))continue;const k=f.t/f.d,a=1-k,G=gh(f.x,f.y),C=f.c&&f.c[0]==='#'?hexRgb(f.c):[1,1,1],rnd=(i,s)=>{const v=Math.sin(i*127.1+s*311.7+f.x)*43758.5;return v-Math.floor(v)};
   switch(f.k){
    case'ring':{const R0=f.r*(.4+.6*k);for(let i=0;i<30;i++){const an=i/30*TAU;F.add(f.x+Math.cos(an)*R0,f.y+Math.sin(an)*R0,G+6,8,C[0]*3,C[1]*3,C[2]*3,a)}break}
    case'die':{if(!f._w){f._w=1;if(f.key&&!f.air&&f.big||f.air&&f.key){if(this.wrecks.length>48)this.wrecks.shift();const sd=f.x+f.y;this.wrecks.push({g,key:f.key,color:f.c,x:f.x,y:f.y,face:f.face||0,s:1.26,t,life:f.air?2.4:7,air:f.air,z:44,h:40,fac:f.fac,sa:Math.sin(sd)>0?1:-1,sb:Math.cos(sd)>0?1:-1})}}const fc=f.fac==='gem'?[4.5,1.7,.3]:f.fac==='cla'?[3.6,.9,.15]:[C[0]*5+1,C[1]*5+1,C[2]*5+1];F.add(f.x,f.y,G+14,f.r*(f.big?2.6:4)*(.4+k),fc[0]*.6,fc[1]*.6,fc[2]*.6,a*.55);light(f.x,f.y,G+26,'#ffb36a',2.4*a);for(let i=0;i<26;i++){const an=rnd(i,1)*TAU,sp=f.r*2.7*(rnd(i,2)*.6+.4)*k;F.add(f.x+Math.cos(an)*sp,f.y+Math.sin(an)*sp,G+6+80*k*(rnd(i,3))*(1-k)*2,3.4,fc[0],fc[1],fc[2],a)}if(f.fac==='cla'){for(let i=0;i<14;i++){const an=rnd(i,4)*TAU,sp=f.r*2.3*k;Sm.add(f.x+Math.cos(an)*sp,f.y+Math.sin(an)*sp,G+6+30*k*(1-k)*3,9,.5,.12,.03,a)}}else if(f.fac==='gem'||f.big){for(let i=0;i<8;i++){const an=rnd(i,5)*TAU;Sm.add(f.x+Math.cos(an)*14*k,f.y+Math.sin(an)*14*k,G+14+70*k,30+50*k,.06,.06,.07,a*.6)}}break}
    case'blast':{if(!f._w){f._w=1;this.shake=Math.max(this.shake||0,Math.min(12,f.r*.12))}light(f.x,f.y,G+50,'#ff9040',9*a);for(let i=0;i<34;i++){const an=rnd(i,1)*TAU,rr=f.r*(.25+rnd(i,2)*1.25)*Math.pow(k,.55),up=rnd(i,3)*80*Math.sin(Math.min(1,k*1.5)*Math.PI/1.2);const c0=rnd(i,4);F.add(f.x+Math.cos(an)*rr,f.y+Math.sin(an)*rr,G+12+up,f.r*(.32+rnd(i,5)*.4)*(1-k*.45),2.5,.62+c0*.8,.05,a*.62)}for(let i=0;i<40;i++){const an=rnd(i,6)*TAU,rr=f.r*(.3+rnd(i,7))*Math.pow(k,.5);Sm.add(f.x+Math.cos(an)*rr,f.y+Math.sin(an)*rr,G+20+rnd(i,8)*90*k,f.r*(1.1+rnd(i,9))*(.6+k),.035,.03,.03,a*.78)}const R0=f.r*1.9*k;for(let i=0;i<44;i++){const an=i/44*TAU;F.add(f.x+Math.cos(an)*R0,f.y+Math.sin(an)*R0,G+6,12,3,2.2,1.4,a*.9)}for(let i=0;i<30;i++){const an=rnd(i,10)*TAU,sp=f.r*2.5*k;F.add(f.x+Math.cos(an)*sp,f.y+Math.sin(an)*sp,G+6+190*k*(1-k)*rnd(i,11)*2,3.6,6,4,2,a)}break}
    case'slash':{F.add(f.x,f.y,G+16,26,C[0]*3,C[1]*3,C[2]*3,a);for(let i=0;i<8;i++){const an=k*3+i*.25;F.add(f.x+Math.cos(an)*f.r,f.y+Math.sin(an)*f.r,G+18,6,6,6,6,a)}break}
    case'spark':{F.add(f.x,f.y,G+16,20*(.4+k),C[0]*4,C[1]*4,C[2]*4,a);for(let i=0;i<5;i++){const an=rnd(i,1)*TAU;F.add(f.x+Math.cos(an)*16*k,f.y+Math.sin(an)*16*k,G+16+14*k,3,5,4,3,a)}break}
    case'wave':{const R0=f.r*k;for(let i=0;i<60;i++){const an=i/60*TAU;F.add(f.x+Math.cos(an)*R0,f.y+Math.sin(an)*R0,G+8,14,C[0]*4,C[1]*4,C[2]*4,a)}light(f.x,f.y,G+40,f.c,5*a);break}
    case'tele':{for(let i=0;i<46;i++){const an=i/46*TAU+f.t*2;F.add(f.x+Math.cos(an)*f.r,f.y+Math.sin(an)*f.r,G+6,i%3?7:11,4,.4,.2,.95)}const R0=f.r*k;for(let i=0;i<30;i++){const an=i/30*TAU;F.add(f.x+Math.cos(an)*R0,f.y+Math.sin(an)*R0,G+6,6,4,.6,.3,.7)}for(let i=0;i<20;i++)F.add(f.x,f.y,G+(1-k)*520*(i/20),22,5,1,.3,k*.7);break}
    case'move':{const R0=16*a+3;for(let i=0;i<18;i++){const an=i/18*TAU;F.add(f.x+Math.cos(an)*R0,f.y+Math.sin(an)*R0*.9,G+3,4,C[0]*2.6,C[1]*2.6,C[2]*2.6,a)}break}
   }
  }
  // 대기 먼지
  const cam=this.cam,z=cam.z,vw=this.w/z,vh=this.h/z*1.2;for(let i=0;i<70;i++){const px=cam.x+((i*197.3+t*(10+i%6))%vw),py=cam.y+((i*131.7+t*(5+i%5))%vh);if(g.tileVis(px,py))F.add(px,py,gh(px,py)+20+(i*37%110),3.2,.75,.65,.46,.3+.16*Math.sin(t*1.5+i))}
  for(let i=lightN;i<3;i++)this.lights[i].intensity=0;
  F.flush();Sm.flush();
 }
 ring3(c,x,y,h,R,col,t,lw){const n=40;for(let pass=0;pass<2;pass++){c.beginPath();for(let i=0;i<=n;i++){const a=i/n*TAU,p=this.screen(x+Math.cos(a)*R,y+Math.sin(a)*R,h);i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])}if(pass){c.setLineDash([R*this.cam.z*.95,R*this.cam.z*.4]);c.lineDashOffset=-t*16;c.strokeStyle=col;c.lineWidth=lw}else{c.setLineDash([]);c.strokeStyle='rgba(2,6,8,.6)';c.lineWidth=lw+2}c.stroke()}c.setLineDash([]);c.lineDashOffset=0}
 overlay(ui,t){
  const c=this.c,g=this.g,z=this.cam.z;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.clearRect(0,0,this.w,this.h);
  if(!ui)return;const sel=ui.selSet;
  const bar=(sx,sy,w,e)=>{this.bar(c,sx,sy,w,e)};
  for(const b of g.blds){const vis=g.tileVis(b.x,b.y);if(sel.has(b.id)&&(b.p===ME||b.seen))this.ring3(c,b.x,b.y,this.gh(b.x,b.y)+3,b.r*1.25,this.side(b.p),t,2.4);if(vis&&(sel.has(b.id)||g.tick-b.lastHit<90||!b.built)){const p=this.project(b.x,b.y,b.def.role==='hq'?112:76);bar(p[0],p[1],b.w*T*.74*z,b)}
   if(sel.has(b.id)&&b.rally&&b.p===ME){const A=this.project(b.x,b.y,8),B=this.project(b.rally.x,b.rally.y,3);c.strokeStyle='rgba(125,255,154,.75)';c.setLineDash([6,6]);c.lineDashOffset=-t*18;c.lineWidth=1.5;c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(B[0],B[1]);c.stroke();c.setLineDash([]);circ(c,B[0],B[1],4);c.fillStyle='#7dff9a';c.fill()}}
  for(const u of g.units){if(!(u.p===ME||g.observer||g.tileVis(u.x,u.y)))continue;const G=this.gh(u.x,u.y);if(sel.has(u.id))this.ring3(c,u.x,u.y,G+2,u.r*1.32+4,this.side(u.p),t,1.9);if(sel.has(u.id)||g.tick-u.lastHit<90){const hgt=u.air?62:u.def.r>13?56:40,p=this.screen(u.x,u.y,G+hgt);bar(p[0],p[1],Math.max(20,u.r*2.3*z),u)}}
  if(ui.drawWorld3D)ui.drawWorld3D(c,t,this);
  ui.drawScreen(c);
 }
 viewRect(m,s){const pts=[[0,0],[this.w,0],[this.w,this.h-ui3Hud()],[0,this.h-ui3Hud()]].map(p=>this.toWorld(p[0],p[1]));m.strokeStyle='#fff';m.lineWidth=1;m.beginPath();pts.forEach((q,i)=>{const X=q[0]*s,Y=q[1]*s;i?m.lineTo(X,Y):m.moveTo(X,Y)});m.closePath();m.stroke()}
}
function ui3Hud(){return window.AISG&&AISG.UI.playing?AISG.UI.hudH():0}
// 아이콘·초상화·표제 이미지 촬영
const Studio={
 ready:false,cache:new Map(),
 init(r){this.r=r;this.ready=true},
 shot(key,color,size,hero){
  const id=key+'|'+color+'|'+size+'|'+(hero?1:0);if(this.cache.has(id))return this.cache.get(id);
  const r=this.r,R=r.gl,SS=2,S=size*SS,rt=new THREE.WebGLRenderTarget(S,S,{format:THREE.RGBAFormat,type:THREE.UnsignedByteType});rt.texture.encoding=THREE.sRGBEncoding;
  const scene=new THREE.Scene();scene.environment=r.scene.environment;
  const cm=Models.map.get(key),geo=cm?cm.geo:r.geoFull(key,color,0);geo.computeBoundingSphere();const bs=geo.boundingSphere;
  const mesh=new THREE.Mesh(geo,cm?cm.mat:r.matU);if(RT3.UN[key])mesh.rotation.y=-Math.PI/4;scene.add(mesh);
  const s1=new THREE.DirectionalLight(new THREE.Color(1,.9,.76),3.2);s1.position.set(-.5,.74,.6).multiplyScalar(300);scene.add(s1);
  const s2=new THREE.DirectionalLight(new THREE.Color(.4,.6,1),1.5);s2.position.set(.8,.3,-.5).multiplyScalar(300);scene.add(s2);scene.add(new THREE.HemisphereLight(0x9fc0ee,0x3a2a1c,.7));
  const fov=24,cam=new THREE.PerspectiveCamera(fov,1,1,4000),d=bs.radius/Math.sin(fov*Math.PI/360)*1.04,el=(hero?20:30)*Math.PI/180,az=hero?.0:0;
  cam.position.set(bs.center.x+Math.sin(az)*Math.cos(el)*d,bs.center.y+Math.sin(el)*d,bs.center.z+Math.cos(az)*Math.cos(el)*d);cam.lookAt(bs.center);
  const pT=SH.uT.value;SH.uFogOff.value=1;const tmO=R.toneMapping,exp=R.toneMappingExposure,ca=new THREE.Color();R.getClearColor(ca);const al=R.getClearAlpha();
  R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=.82;R.setRenderTarget(rt);R.setClearColor(0,0);R.clear();R.render(scene,cam);
  const buf=new Uint8Array(S*S*4);R.readRenderTargetPixels(rt,0,0,S,S,buf);R.setRenderTarget(null);R.toneMapping=tmO;R.toneMappingExposure=exp;R.setClearColor(ca,al);SH.uFogOff.value=0;rt.dispose();
  const a=document.createElement('canvas');a.width=a.height=S;const ax=a.getContext('2d'),img=ax.createImageData(S,S);for(let y=0;y<S;y++){const row=(S-1-y)*S*4;for(let x=0;x<S*4;x++)img.data[y*S*4+x]=buf[row+x]}ax.putImageData(img,0,0);
  let x0=S,y0=S,x1=0,y1=0;for(let y=0;y<S;y++)for(let x=0;x<S;x++)if(img.data[(x+y*S)*4+3]>30){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  const b=document.createElement('canvas');b.width=b.height=size;const bx=b.getContext('2d'),bw=x1-x0+1,bh=y1-y0+1,k=Math.min((size-4)/bw,(size-4)/bh);bx.imageSmoothingQuality='high';if(bw>0)bx.drawImage(a,x0,y0,bw,bh,(size-bw*k)/2,(size-bh*k)/2,bw*k,bh*k);
  const u=b.toDataURL();this.cache.set(id,u);return u;
 }
};

// 게임에 내장된 GLB 팩 (tools/gen.py로 제작)
const Pack={
 m:new Map(),
 async load(){
  if(typeof GLB_PACK==='undefined'||!window.DecompressionStream||!THREE.GLTFLoader)return 0;
  try{
   const raw=Uint8Array.from(atob(GLB_PACK),c=>c.charCodeAt(0)),ab=await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
   const gltf=await new Promise((res,rej)=>new THREE.GLTFLoader().parse(ab,'',res,rej));
   for(const root of gltf.scene.children){const parts={};for(const o of root.children){if(!o.isMesh)continue;const tag=o.name.split('|')[1];if(!tag)continue;const G=o.geometry,P=G.attributes.position,N=G.attributes.normal,C=G.attributes.color,A=G.attributes._amat,n=P.count,pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*4),mat=new Float32Array(n*4),S=o.scale,T3=o.position;
     for(let i=0;i<n;i++){pos[i*3]=P.getX(i)/32767*S.x+T3.x;pos[i*3+1]=P.getY(i)/32767*S.y+T3.y;pos[i*3+2]=P.getZ(i)/32767*S.z+T3.z;let x=N.getX(i)/127,y=N.getY(i)/127,z=N.getZ(i)/127;const l=Math.hypot(x,y,z)||1;nor[i*3]=x/l;nor[i*3+1]=y/l;nor[i*3+2]=z/l;for(let j=0;j<4;j++){col[i*4+j]=C.array[i*4+j]/255;mat[i*4+j]=A.array[i*4+j]/255}}
     parts[tag]={pos,nor,col,mat,idx:G.index.array}}
    if(parts.b){this.m.set(root.name,parts);if(parts.t)this.m.set(root.name+'#t',{b:parts.t,l:parts.lt})}}
   return this.m.size;
  }catch(e){console.warn('GLB 팩 로드 실패',e);this.m.clear();return 0}
 },
 hasLod(key){const Q=this.m.get(key);return !!(Q&&Q.l)},
 geo(key,team,frame,fi,lod,withT){
  const Q=this.m.get(key),L=[lod&&Q.l?Q.l:Q.b],fq=lod&&Q['l'+frame]||Q['f'+frame];if(fq)L.push(fq);if(withT&&Q.t)L.push(Q.t);let nv=0,ni=0;for(const q of L){nv+=q.pos.length/3;ni+=q.idx.length}
  const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),col=new Float32Array(nv*3),ma=new Float32Array(nv*4),idx=nv>65000?new Uint32Array(ni):new Uint16Array(ni),tc=[lin(team[0]),lin(team[1]),lin(team[2])];let v0=0,i0=0;
  for(const q of L){const n=q.pos.length/3;pos.set(q.pos,v0*3);nor.set(q.nor,v0*3);for(let i=0;i<n;i++){const t=q.mat[i*4+3],ao=q.col[i*4+3],j=v0+i;for(let c=0;c<3;c++)col[j*3+c]=(q.col[i*4+c]*(1-t)+tc[c]*t)*ao;ma[j*4]=q.mat[i*4];ma[j*4+1]=q.mat[i*4+1];ma[j*4+2]=q.mat[i*4+2]*4;ma[j*4+3]=fi}for(let i=0;i<q.idx.length;i++)idx[i0+i]=q.idx[i]+v0;v0+=n;i0+=q.idx.length}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('aMat',new THREE.BufferAttribute(ma,4));g.setIndex(new THREE.BufferAttribute(idx,1));g.computeBoundingSphere();return g;
 }
};

// 사용자가 불러온 GLB 모델
const Models={
 map:new Map(),
 fogMat(o){const m=o;m.onBeforeCompile=s=>{Object.assign(s.uniforms,{uFog:SH.uFog,uT:SH.uT,uFogOff:SH.uFogOff,uMap:SH.uMap});s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;').replace('#include <project_vertex>','#include <project_vertex>\n{vec4 w=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nw=instanceMatrix*w;\n#endif\nw=modelMatrix*w;vWP=w.xyz;}');s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;uniform float uT;'+GLSL_NOISE+FOGF).replace('#include <dithering_fragment>','#include <dithering_fragment>\ngl_FragColor.rgb*=fogAt(vWP);')};return m},
 async install(key,buf,r){
  const gltf=await new Promise((res,rej)=>new THREE.GLTFLoader().parse(buf,'',res,rej));gltf.scene.updateMatrixWorld(true);
  const list=[];let mat=null;gltf.scene.traverse(o=>{if(!o.isMesh)return;let q=o.geometry.clone();if(q.index)q=q.toNonIndexed();q.applyMatrix4(o.matrixWorld);for(const n of Object.keys(q.attributes))if(!['position','normal','uv'].includes(n))q.deleteAttribute(n);if(!q.attributes.normal)q.computeVertexNormals();if(!q.attributes.uv)q.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(q.attributes.position.count*2),2));q.morphAttributes={};list.push(q);if(!mat)mat=Array.isArray(o.material)?o.material[0]:o.material});
  if(!list.length)throw new Error('메시가 없습니다');
  const geo=THREE.BufferGeometryUtils.mergeBufferGeometries(list,false);geo.rotateY(Math.PI/2);geo.computeBoundingBox();
  const ref=r.geo(key,Object.values(FAC).find(f=>key.startsWith(Object.keys(FAC).find(k=>FAC[k]===f)))?.color||'#ffffff',0);ref.computeBoundingBox();
  const a=geo.boundingBox,b=ref.boundingBox,sa=new THREE.Vector3(),sb=new THREE.Vector3();a.getSize(sa);b.getSize(sb);const k=Math.max(sb.x,sb.z)/Math.max(sa.x,sa.z,.0001);geo.scale(k,k,k);geo.computeBoundingBox();const c=geo.boundingBox,cx=(c.min.x+c.max.x)/2,cz=(c.min.z+c.max.z)/2,lift=UNIT[key]&&UNIT[key].air?b.min.y:0;geo.translate(-cx,lift-c.min.y,-cz);
  const m=new THREE.MeshStandardMaterial({map:mat&&mat.map||null,normalMap:mat&&mat.normalMap||null,roughnessMap:mat&&mat.roughnessMap||null,metalnessMap:mat&&mat.metalnessMap||null,emissiveMap:mat&&mat.emissiveMap||null,emissive:mat&&mat.emissive||new THREE.Color(0),color:mat&&mat.color||new THREE.Color(1,1,1),metalness:mat?mat.metalness:.3,roughness:mat?mat.roughness:.6,envMapIntensity:.6});
  this.fogMat(m);this.map.set(key,{geo,mat:m});
  for(const [id,b2] of r.batches)if(id.startsWith(key+'|')){r.world.remove(b2.m);r.batches.delete(id)}
  if(r.g)for(const b2 of r.g.blds)if(b2.def.key===key){const q=r.bMesh.get(b2.id);if(q){r.world.remove(q);r.bMesh.delete(b2.id)}}
  for(const id of [...Studio.cache.keys()])if(id.startsWith(key+'|'))Studio.cache.delete(id);
 },
 openDB(){return new Promise((res,rej)=>{try{const q=indexedDB.open('aisg-glb',1);q.onupgradeneeded=()=>q.result.createObjectStore('m');q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)}catch(e){rej(e)}})},
 async save(key,buf){try{const d=await this.openDB();await new Promise(res=>{const t=d.transaction('m','readwrite');t.objectStore('m').put(buf,key);t.oncomplete=res;t.onerror=res});d.close()}catch(e){}},
 async restore(r){try{const d=await this.openDB(),keys=await new Promise(res=>{const q=d.transaction('m').objectStore('m').getAllKeys();q.onsuccess=()=>res(q.result);q.onerror=()=>res([])});for(const k of keys){const buf=await new Promise(res=>{const q=d.transaction('m').objectStore('m').get(k);q.onsuccess=()=>res(q.result);q.onerror=()=>res(null)});if(buf)try{await this.install(k,buf,r)}catch(e){}}d.close();return keys.length}catch(e){return 0}},
 async clear(){try{const d=await this.openDB();await new Promise(res=>{const t=d.transaction('m','readwrite');t.objectStore('m').clear();t.oncomplete=res;t.onerror=res});d.close()}catch(e){}}
};
