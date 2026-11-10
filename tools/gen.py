#!/usr/bin/env python3
"""AI삼국지 GLB 제작기: 코드 모델의 배치를 부호 거리장으로 재조형하여 정밀 메시를 만든다.
입력: tools/dump.js 출력(JSON) / 출력: 단일 GLB 팩
사용: gen.py prims.json out.glb [key ...]"""
import json,struct,sys,math,gzip,os,hashlib,pickle
SRC_V='1'
import numpy as np
from skimage.measure import marching_cubes
import fast_simplification as fs

def lin(c):
    c=np.asarray(c,float); return np.where(c<.04045,c/12.92,((c+.055)/1.055)**2.4)
def smin(a,b,k):
    if k<=1e-6: return np.minimum(a,b)
    h=np.maximum(k-np.abs(a-b),0)/k
    return np.minimum(a,b)-h*h*k*.25
def rotz(P,c,rot):
    Q=P-c
    if rot:
        s,co=math.sin(rot),math.cos(rot); x=Q[:,0]*co+Q[:,1]*s; y=-Q[:,0]*s+Q[:,1]*co; Q=np.c_[x,y,Q[:,2]]
    return Q
def gyroid(P,f):
    x,y,z=P[:,0]*f,P[:,1]*f,P[:,2]*f
    return np.sin(x)*np.cos(y)+np.sin(y)*np.cos(z)+np.sin(z)*np.cos(x)
def noise(P,f=1.):
    x,y,z=P[:,0]*f,P[:,1]*f,P[:,2]*f
    return (np.sin(x*.9+y*.31+1.3)*np.cos(z*.7+x*.2)*.5+np.sin(y*1.7+z*1.1+.7)*.3+np.sin(x*2.9-z*2.3+y*1.9)*.2)
def fbm(P,f=1.):
    W=P+np.c_[noise(P+7,f*.7),noise(P+13,f*.7),noise(P+29,f*.7)]*(1.4/f)
    return noise(W,f)*.55+noise(W+3.1,f*2.1)*.3+noise(W+9.7,f*4.3)*.15

def base_sdf(p,P):
    t=p['t']; c=np.array([p['x'],p['y'],p['z']],float)
    if t==0: return np.linalg.norm(P-c,axis=1)-p['a']
    if t==1:
        b=np.array([p['a'],p['b'],p['c']],float); pa=P-c; ba=b-c; bb=max(np.dot(ba,ba),1e-6)
        h=np.clip((pa@ba)/bb,0,1); return np.linalg.norm(pa-np.outer(h,ba),axis=1)-(p['d']+(p['e']-p['d'])*h)
    if t==2:
        H=np.array([p['a'],p['b'],p['c']],float); r=min(p['d'],*(H*.98)); Q=rotz(P,c,p['rot'])
        q=np.abs(Q)-(H-r); return np.linalg.norm(np.maximum(q,0),axis=1)+np.minimum(q.max(axis=1),0)-r
    if t==3:
        R=np.array([p['a'],p['b'],p['c']],float); Q=rotz(P,c,p['rot'])
        k0=np.linalg.norm(Q/R,axis=1); k1=np.maximum(np.linalg.norm(Q/(R*R),axis=1),1e-6); return k0*(k0-1)/k1
    if t==6:
        b0=np.array([p['x'],p['y'],p['z']],float);ax=np.array([p['a'],p['b'],p['c']],float)-b0;L=max(np.linalg.norm(ax),1e-3);w=ax/L
        hv=np.array([0,0,1.]) if abs(w[2])<.9 else np.array([1.,0,0]);u=np.cross(w,hv);u/=np.linalg.norm(u);v=np.cross(w,u)
        cr,sr=math.cos(p['rot']),math.sin(p['rot']);u,v=cr*u+sr*v,-sr*u+cr*v
        q=P-b0;hh=q@w;pu=np.abs(q@u);pv=np.abs(q@v);h0=L*(1-p['e'])
        r=p['d']*np.where(hh>h0,np.clip((L-hh)/max(L-h0,1e-3),0,1),1.)
        kx,ky,kz=-0.8660254,0.5,0.57735027;dt=np.minimum(kx*pu+ky*pv,0)*2;pu=pu-dt*kx;pv=pv-dt*ky
        pu=pu-np.clip(pu,-kz*r,kz*r);pv=pv-r;d2=np.hypot(pu,pv)*np.sign(pv)
        return np.maximum(d2,np.maximum(-hh,hh-L))
    if t==4:
        zc=(p['z']+p['a'])/2; hh=(p['a']-p['z'])/2; r=p['b']; bv=min(.8,hh*.4,r*.4)
        dx=np.hypot(P[:,0]-p['x'],P[:,1]-p['y'])-(r-bv); dz=np.abs(P[:,2]-zc)-(hh-bv)
        return np.hypot(np.maximum(dx,0),np.maximum(dz,0))+np.minimum(np.maximum(dx,dz),0)-bv
    Q=rotz(P,c,p['rot'])
    if p['c']:
        rr=np.hypot(Q[:,1],Q[:,2]); return np.hypot(rr-p['a'],Q[:,0])-p['b']
    rr=np.hypot(Q[:,0],Q[:,1]); return np.hypot(rr-p['a'],Q[:,2])-p['b']

def aabb(p):
    t=p['t']
    if t==0: r=p['a']; return [p['x']-r,p['y']-r,p['z']-r],[p['x']+r,p['y']+r,p['z']+r]
    if t==1:
        r=max(p['d'],p['e']); a=(p['x'],p['y'],p['z']); b=(p['a'],p['b'],p['c'])
        return [min(a[i],b[i])-r for i in range(3)],[max(a[i],b[i])+r for i in range(3)]
    if t in(2,3):
        hx=math.hypot(p['a'],p['b']) if p['rot'] else p['a']; hy=hx if p['rot'] else p['b']
        return [p['x']-hx,p['y']-hy,p['z']-p['c']],[p['x']+hx,p['y']+hy,p['z']+p['c']]
    if t==6:
        r=p['d']; a=(p['x'],p['y'],p['z']); b=(p['a'],p['b'],p['c'])
        return [min(a[i],b[i])-r for i in range(3)],[max(a[i],b[i])+r for i in range(3)]
    if t==4: return [p['x']-p['b'],p['y']-p['b'],p['z']],[p['x']+p['b'],p['y']+p['b'],p['a']]
    R=p['a']+p['b']
    if p['c']: return [p['x']-R,p['y']-R,p['z']-R],[p['x']+R,p['y']+R,p['z']+R]
    return [p['x']-R,p['y']-R,p['z']-p['b']],[p['x']+R,p['y']+R,p['z']+p['b']]

def size(p):
    return {0:lambda:p['a'],1:lambda:max(p['d'],p['e']),2:lambda:max(p['a'],p['b'],p['c']),3:lambda:max(p['a'],p['b'],p['c']),4:lambda:p['b'],5:lambda:p['a'],6:lambda:p['d']}[p['t']]()
def P(t,x,y,z,a=0,b=0,c=0,d=0,e=0,rot=0,col=(.5,.5,.5),m=1,k=0.):
    return dict(t=t,x=x,y=y,z=z,a=a,b=b,c=c,d=d,e=e,rot=rot,m=m,c0=col[0],c1=col[1],c2=col[2],k=k)
def ext(p,col=None,**kw):
    q=dict(p); q.update(kw); return q
def bright(p): return p['c0']+p['c1']+p['c2']
def is_hard(p): return p['m']==2 or (bright(p)>2.1 and 'sk' not in p)  # 발광부·이빨

def enrich(fac,L,building):
    """진영별 형상 추가: 코드 배치 위에 실제 부품을 덧붙인다."""
    add=[]; rng=np.random.default_rng(abs(hash(tuple(round(p['x'],1) for p in L)))%2**32 if False else len(L)*97+int(sum(p['x']+p['z'] for p in L)*7)&0xffff)
    STEEL=(.47,.52,.6); DARK=(.1,.12,.15)
    for p in L:
        if p['m']==2: continue
        if fac=='gem' and p['t']==2:
            a,b,c=p['a'],p['b'],p['c']
            if a>=5 and b>=5 and c>=2.2:
                top=p['z']+c
                # 상판 장갑과 볼트
                add.append(ext(p,z=top+.28,c=.42,a=a*.72,b=b*.72,d=.35,c0=p['c0']*.82,c1=p['c1']*.82,c2=p['c2']*.82,k=p['k']))
                co,si=math.cos(p['rot']),math.sin(p['rot'])
                for sx,sy in((1,1),(-1,1),(1,-1),(-1,-1)):
                    ox,oy=sx*(a-1.5),sy*(b-1.5)
                    add.append(P(0,p['x']+ox*co-oy*si,p['y']+ox*si+oy*co,top+.15,a=.72,col=STEEL))
                # 측면 환기구
                if c>=3.2:
                    for s in(-1,1):
                        for i in range(-1,2):
                            ox,oy=(s*(a+.06),0); oz=i*c*.34
                            add.append(ext(p,x=p['x']+ox*co,y=p['y']+ox*si,z=p['z']+oz,a=.26,b=b*.5,c=.42,d=.1,c0=DARK[0],c1=DARK[1],c2=DARK[2],k=0))
        if fac=='gem' and p['t']==1 and size(p)>=3:
            # 원통부 띠
            ax=np.array([p['a']-p['x'],p['b']-p['y'],p['c']-p['z']],float); n=np.linalg.norm(ax)
            if n>10:
                for f in(.25,.75):
                    r=(p['d']+(p['e']-p['d'])*f)+.5
                    add.append(P(1,p['x']+ax[0]*(f-.018),p['y']+ax[1]*(f-.018),p['z']+ax[2]*(f-.018),a=p['x']+ax[0]*(f+.018),b=p['y']+ax[1]*(f+.018),c=p['z']+ax[2]*(f+.018),d=r,e=r,col=STEEL))
        if fac=='cla' and not is_hard(p) and size(p)>=7:
            # 등뼈 돌기
            n=int(min(12,size(p)*.9))
            for i in range(n):
                th=rng.uniform(0,6.283); ph=rng.uniform(.25,1.3)
                if p['t']==3: rx,ry,rz=p['a'],p['b'],p['c']
                elif p['t']==0: rx=ry=rz=p['a']
                else: continue
                dx,dy,dz=math.cos(th)*math.cos(ph),math.sin(th)*math.cos(ph),math.sin(ph)
                bx,by,bz=p['x']+dx*rx*.93,p['y']+dy*ry*.93,p['z']+dz*rz*.93
                l=rng.uniform(1.2,3.)
                add.append(P(1,bx,by,bz,a=bx+dx*l*1.6,b=by+dy*l*1.6,c=bz+dz*l*1.6,d=1.1+.25*l,e=.18,col=(.94,.81,.62)))
    return L+add

def field_fn(fac,L):
    """프리미티브 목록의 합성 거리장"""
    k_soft={'cla':3.4,'gpt':.55,'gem':.3}.get(fac,.5)
    groups=[p for p in L]
    def disp(p,X,d):
        if p['m']==2 or is_hard(p): return d
        S=size(p)
        if fac=='cla':
            amp=min(.95,.16+S*.05)
            g=gyroid(X+(fbm(X,.09)*5.)[:,None],.42)
            return d-fbm(X,.32)*amp*.9+np.maximum(.4-np.abs(g),0)*amp*.55
        if fac=='gpt' and bright(p)>1.9 and S>=5:
            Q=X-np.array([p['x'],p['y'],p['z']]); lat=np.abs(np.mod(Q[:,2]+S,S*.55)-S*.275)
            return d+np.maximum(.3-lat,0)*.7
        return d
    def F(X,margin=2.,mask=True):
        v=np.full(len(X),1e3,float)
        for p in groups:
            ks=p.get('sk',k_soft) if not is_hard(p) else min(.25,p.get('sk',.25))
            a,b=aabb(p); pad=margin+ks+1.6
            m=np.all((X>=np.array(a)-pad)&(X<=np.array(b)+pad),axis=1)
            if not m.any(): continue
            d=np.full(len(X),1e3,float); sub=X[m]; d[m]=disp(p,sub,base_sdf(p,sub))
            v=smin(v,d,ks)
        return v
    return F

def normals(F,X,e=.12):
    d=np.eye(3)*e; n=np.c_[F(X+d[0])-F(X-d[0]),F(X+d[1])-F(X-d[1]),F(X+d[2])-F(X-d[2])]
    l=np.linalg.norm(n,axis=1,keepdims=True); return n/np.maximum(l,1e-9)

def paint(fac,L,F,X,N):
    n=len(X); D=np.zeros((len(L),n))
    for i,p in enumerate(L):
        a,b=aabb(p); D[i]=base_sdf(p,X)
    s={'cla':1.5,'gpt':.45,'gem':.18}.get(fac,.5)
    dm=D.min(axis=0); W=np.exp(-(D-dm)/s); W/=W.sum(axis=0)
    hard=np.array([is_hard(p) for p in L],bool); near=D.argmin(axis=0)
    W2=np.zeros_like(W); W2[near,np.arange(n)]=1
    useh=hard[near]; W[:,useh]=W2[:,useh]
    cols=[]
    for p in L:
        c=lin([p['c0'],p['c1'],p['c2']])
        white=fac=='gpt' and p['k']<.5 and p['m']!=2 and bright(p)>2.3
        cols.append(c*(.6 if white else 1))
    C=np.array(cols); K=np.array([min(1,p['k']) for p in L])
    MR=[]
    for p in L:
        tk=p['k']>.95; r,g,b=p['c0']+p['k'],p['c1']+p['k'],p['c2']+p['k']; br=r+g+b; grey=abs(r-g)<.08 and abs(g-b)<.1
        if p['m']==2: MR.append((0,.4,p.get('em',3.4)))
        elif fac=='gpt': MR.append((.15,.24,0) if tk else ((0,.2,0) if br>2.3 else (.75,.3,0)))
        elif fac=='gem': MR.append((.42,.42,0) if tk else ((.25,.72,0) if br<.6 else ((.88,.36,0) if grey else (.1,.52,0))))
        elif fac=='cla': MR.append((0,.26,0) if br>2.1 else (0,.46,0))
        else: MR.append((.7 if grey else .2,.5,0))
    MR=np.array(MR)
    rgb=(C.T*W).T.sum(axis=0) if False else (W.T@C); team=W.T@K; mr=W.T@MR
    # 틈 음영
    ao=np.zeros(n); wsum=0
    for h,w in((.8,1.),(2.,.8),(4.5,.55),(9.,.32)):
        ao+=w*np.clip((h-F(X+N*h))/h,0,1); wsum+=w
    ao=np.clip(1-ao/wsum*1.45,0,1); ao=.16+.84*ao
    # 표면 곡률
    e=.9; d6=np.eye(3)*e; lap=(F(X+d6[0])+F(X-d6[0])+F(X+d6[1])+F(X-d6[1])+F(X+d6[2])+F(X-d6[2])-6*F(X))/(e*e)
    conv=np.clip(lap*1.1,0,1); cav=np.clip(-lap*1.1,0,1)
    soft=~useh
    if fac=='cla':
        g=gyroid(X+(fbm(X,.09)*5.)[:,None],.42); v=np.clip(1-np.abs(g)/.13,0,1)
        vein=v*soft; cv=np.clip(1-np.abs(g)/.42,0,1)*soft
        # 등갑(어두움)과 연한 살(밝음)의 대비
        tone=np.clip(fbm(X,.075)*1.5+.5+(X[:,2]-X[:,2].mean())/max(np.ptp(X[:,2]),1)*.6,0,1)
        dk=np.array([.05,.016,.014]); fl=np.array([.3,.095,.05])
        A=np.where(soft)[0]; rgb[A]=(rgb[A]*.35+(dk*tone[A][:,None]+fl*(1-tone[A])[:,None])*.65)
        team[A]=np.minimum(team[A],.55)*(1-tone[A]*.6)
        base=np.array([.016,.004,.005]); rgb=rgb*(1-cv[:,None]*.85)+base*cv[:,None]*.85
        tv=(vein>.55)&soft&(fbm(X,.06)>-.12); team[tv]=1.; mr[tv,2]=1.1
        rgb[soft]+=np.array([.16,.1,.07])*(conv[soft]*.32)[:,None]; mr[soft,1]=np.clip(.4-tone[soft]*.2-conv[soft]*.12,.14,1)
    elif fac=='gem':
        rgb[soft]=rgb[soft]*(1-cav[soft]*.5)[:,None]+np.array([.5,.5,.48])*(conv[soft]*.5)[:,None]; mr[soft,1]=np.clip(mr[soft,1]+.16*np.clip(fbm(X[soft],.25),0,1),.1,.95)
        d=np.clip(fbm(X,.09)+.15,0,1)*(1-X[:,2]/max(X[:,2].max(),1)); rgb[soft]*=(1-.42*d[soft])[:,None]
    elif fac=='gpt':
        rgb[soft]=rgb[soft]*(1-cav[soft]*.35)[:,None]
    return rgb,team,mr,ao

def mesh(fac,L,target,h,seed_margin=4.):
    F=field_fn(fac,L)
    mn=np.array([aabb(p)[0] for p in L]).min(axis=0)-seed_margin; mx=np.array([aabb(p)[1] for p in L]).max(axis=0)+seed_margin
    ext_=mx-mn; n=np.minimum(np.ceil(ext_/h).astype(int)+1,260); h3=ext_/(n-1)
    xs=[np.linspace(mn[i],mx[i],n[i]) for i in range(3)]
    g=np.stack(np.meshgrid(*xs,indexing='ij'),-1).reshape(-1,3)
    v=np.empty(len(g));
    for s in range(0,len(g),2_000_000): v[s:s+2_000_000]=F(g[s:s+2_000_000])
    v=v.reshape(n)
    v0,f0,_,_=marching_cubes(v,0,spacing=tuple(h3),gradient_direction='ascent'); v0=v0+mn
    def finish(tg):
        vv,ff=fs.simplify(v0,f0.copy(),target_count=tg) if len(f0)>tg else (v0,f0)
        vv=np.asarray(vv,float)
        for _ in range(2):
            d=F(vv); N=normals(F,vv,e=.15); vv=vv-N*np.clip(d,-1.5,1.5)[:,None]
        return vv,np.asarray(ff,np.int64),normals(F,vv)
    return finish,F

def fp(p,dz=0):
    return tuple(round(x,2) for x in (p['t'],p['x'],p['y'],p['z']-dz,p['a'],p['b'],(p['c']-dz) if p['t']==1 else p['c'],(p['a']-dz) if False else p['d'],p['e'],p['rot'],p['c0'],p['c1'],p['c2']))
def shift(p,dz):
    q=dict(p); q['z']-=dz
    if p['t']==1: q['c']-=dz
    if p['t']==4: q['a']-=dz
    return q
def split(frames):
    """프레임을 공통 몸통과 프레임별 부품으로 나눈다"""
    F0=frames[0]; out=[]
    for fr in frames:
        if len(fr)>=len(F0):
            dz=[round(fr[i]['z']-F0[i]['z'],2) for i in range(len(F0))]
            vals,cnt=np.unique(dz,return_counts=True); dd=float(vals[cnt.argmax()]) if cnt.max()>=max(3,len(F0)*.3) else 0.
        else: dd=0.
        out.append([shift(p,dd) for p in fr])
    fps=[{fp(p) for p in fr} for fr in out]
    common=set.intersection(*fps)
    body=[p for p in out[0] if fp(p) in common]
    dyn=[[p for p in fr if fp(p) not in common] for fr in out]
    return body,dyn

CACHE=os.environ.get('GEN_CACHE')
def part(fac,L,target,h,low=0):
    key=None
    if CACHE:
        key=hashlib.sha1(json.dumps([fac,L,target,h,low,SRC_V],sort_keys=True).encode()).hexdigest();fp_=os.path.join(CACHE,key+'.pkl')
        if os.path.exists(fp_):
            with open(fp_,'rb') as f: return pickle.load(f)
    finish,F=mesh(fac,L,target,h)
    def dress(tg):
        vv,ff,N=finish(tg); rgb,team,mr,ao=paint(fac,L,F,vv,N)
        return dict(p=vv,n=N,f=ff,c=rgb,t=team,m=mr,a=ao)
    out=dress(target),(dress(low) if low else None)
    if key:
        with open(fp_,'wb') as f: pickle.dump(out,f)
    return out

class Pack:
    def __init__(s): s.bin=bytearray(); s.views=[]; s.acc=[]; s.meshes=[]; s.nodes=[]; s.roots=[]
    def add(s,arr,ctype,typ,count,target,norm=False,minmax=None):
        off=len(s.bin); b=arr.tobytes(); s.bin+=b
        while len(s.bin)%4: s.bin.append(0)
        s.views.append(dict(buffer=0,byteOffset=off,byteLength=len(b),target=target)); a=dict(bufferView=len(s.views)-1,componentType=ctype,count=count,type=typ)
        if norm: a['normalized']=True
        if minmax: a['min'],a['max']=minmax
        s.acc.append(a); return len(s.acc)-1
    def node(s,name,q):
        P=q['p']; lo=P.min(axis=0); hi=P.max(axis=0); sc=np.maximum(hi-lo,1e-3)/2; ce=(lo+hi)/2
        # 게임 좌표(x,y,z상향)를 glTF 좌표(x,z상향,y)로 변환
        ord_=[0,2,1]
        pq=np.round((P[:,ord_]-ce[ord_])/sc[ord_]*32767).astype(np.int16)
        nq=np.round(q['n'][:,ord_]*127).astype(np.int8)
        ao=np.clip(q['a'],0,1); srgb=np.clip(q['c'],0,1)
        col=np.round(np.c_[srgb,ao]*255).astype(np.uint8)
        mat=np.round(np.clip(np.c_[q['m'][:,0],q['m'][:,1],q['m'][:,2]/4,q['t']],0,1)*255).astype(np.uint8)
        idx=q['f'].astype(np.uint16)
        attrs=dict(POSITION=s.add(pq,5122,'VEC3',len(P),34962,minmax=(pq.min(axis=0).tolist(),pq.max(axis=0).tolist())) if False else s.add(pad(pq,8),5122,'VEC3',len(P),34962,minmax=([-32767]*3,[32767]*3)))
        s.views[-1]['byteStride']=8; s.acc[-1]['normalized']=True
        attrs['NORMAL']=s.add(pad(nq,4),5120,'VEC3',len(P),34962,norm=True); s.views[-1]['byteStride']=4
        attrs['COLOR_0']=s.add(col,5121,'VEC4',len(P),34962,norm=True)
        attrs['_AMAT']=s.add(mat,5121,'VEC4',len(P),34962,norm=True)
        ind=s.add(idx.reshape(-1),5123,'SCALAR',idx.size,34963)
        s.meshes.append(dict(primitives=[dict(attributes=attrs,indices=ind,mode=4)]))
        s.nodes.append(dict(name=name,mesh=len(s.meshes)-1,translation=ce[ord_].tolist(),scale=sc[ord_].tolist()))
        return len(s.nodes)-1
    def write(s,path):
        j=dict(asset=dict(version='2.0',generator='AI삼국지 tools/gen.py'),extensionsUsed=['KHR_mesh_quantization'],extensionsRequired=['KHR_mesh_quantization'],scene=0,scenes=[dict(nodes=s.roots)],nodes=s.nodes,meshes=s.meshes,accessors=s.acc,bufferViews=s.views,buffers=[dict(byteLength=len(s.bin))])
        js=json.dumps(j,separators=(',',':')).encode(); js+=b' '*((4-len(js)%4)%4)
        with open(path,'wb') as f:
            f.write(struct.pack('<III',0x46546C67,2,12+8+len(js)+8+len(s.bin))); f.write(struct.pack('<II',len(js),0x4E4F534A)); f.write(js); f.write(struct.pack('<II',len(s.bin),0x004E4942)); f.write(s.bin)
def pad(a,stride):
    w=a.reshape(len(a),-1); ex=stride-w.shape[1]*w.dtype.itemsize
    return np.c_[w,np.zeros((len(a),ex//w.dtype.itemsize),w.dtype)] if ex else w

def build(key,M,pk):
    fac=M['fac']; fr=M['frames']; unit=M['unit']; S=None
    tur=[p for p in fr[0] if p.get('tur')]; fr=[[p for p in f if not p.get('tur')] for f in fr]
    body,dyn=split(fr)
    bb=np.array([aabb(p)[1] for p in fr[0]]).max(axis=0)-np.array([aabb(p)[0] for p in fr[0]]).min(axis=0); R=float(bb.max())
    if unit:
        tg=int(max(1500,min(8000,M['r']*M['r']*22))); h=max(.28,R/150)
    else:
        tg=int(min(9000,3500+M['w']*M['h']*260)) if M['w'] else 900; h=max(.55,R/190)
    if not body: body=[fr[0][0]]
    if M.get('authored') and unit: tg=int(max(3000,min(9000,M['r']*M['r']*30)))
    if M.get('authored') and not unit: tg=int(min(14000,5000+M['w']*M['h']*500))
    if key.startswith('res_c'): tg=1500
    elif key.startswith('dd_'): tg=1800 if key!='dd_shard' else 700
    elif key=='res_d': tg=3000
    bL=body if M.get('authored') else enrich(fac,body,not unit)
    hi,lo=part(fac,bL,tg,h,low=int(max(500,tg*.24)) if unit else 0)
    kids=[pk.node(key+'|b',hi)]
    if lo: kids.append(pk.node(key+'|l',lo))
    if tur:
        ht,lt=part(fac,tur,int(tg*.5),h,low=int(max(300,tg*.13)))
        kids.append(pk.node(key+'|t',ht)); kids.append(pk.node(key+'|lt',lt))
    seen={}
    for i,d in enumerate(dyn):
        if not d: continue
        sg=tuple(sorted(fp(p) for p in d))
        if sg in seen:
            for nm,ref in(('f',seen[sg][0]),('l',seen[sg][1])):
                pk.nodes.append(dict(name=key+'|%s%d'%(nm,i),mesh=pk.nodes[ref]['mesh'],translation=pk.nodes[ref]['translation'],scale=pk.nodes[ref]['scale'])); kids.append(len(pk.nodes)-1)
            continue
        tg2=int(min(1200,len(d)*85)); hi2,lo2=part(fac,d,tg2,max(.3,h*1.1),low=max(160,int(tg2*.28))); n=pk.node(key+'|f%d'%i,hi2); seen[sg]=(n,pk.node(key+'|l%d'%i,lo2)); kids.append(n); kids.append(seen[sg][1])
    pk.nodes.append(dict(name=key,children=kids)); pk.roots.append(len(pk.nodes)-1)

if __name__=='__main__':
    D=json.load(open(sys.argv[1])); out=sys.argv[2]; keys=sys.argv[3:] or list(D)
    import os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
    from designs import DESIGN
    FRAMES=[{'t':0},{'walk':1,'t':0},{'walk':1,'t':1/6},{'walk':1,'t':2/6},{'walk':1,'t':.5},{'walk':1,'t':4/6},{'walk':1,'t':5/6},{'atk':1,'t':0}]
    for k,fn in DESIGN.items():
        n=len(D[k]['frames']); fr_=FRAMES if n==8 else ([{'t':0},{'t':.5},{'dep':1}] if k=='gem_audio' else [{'t':i/n} for i in range(n)]); D[k]['frames']=[fn(f) for f in fr_]; D[k]['authored']=True
    pk=Pack()
    for k in keys:
        n0=len(pk.bin); build(k,D[k],pk); print(k,'%dKB'%((len(pk.bin)-n0)/1024),flush=True)
    pk.write(out); raw=open(out,'rb').read(); print('total',len(raw)//1024,'KB gz',len(gzip.compress(raw,9))//1024,'KB',flush=True)
