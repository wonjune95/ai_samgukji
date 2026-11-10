"""보병·곤충형 유닛의 독자 디자인. 프레임 입력은 게임의 framesFor와 같은 형식이다."""
import math
TAU=math.pi*2
W=(.93,.94,.91);GR=(.55,.59,.62);DK=(.12,.14,.17);GM=(.24,.28,.35);ST=(.47,.52,.6);HZ=(.96,.73,.14)
CL=(.74,.38,.25);CD=(.3,.13,.11);CR=(.94,.81,.62);T='T';GO=(1,.82,.36)
class B:
    def __init__(s,sk=None): s.L=[];s.sk=sk
    def pr(s,t,x,y,z,a=0,b=0,c=0,d=0,e=0,rot=0,col=GR,m=1,sk=None,em=None):
        k=0.;
        if col==T: col=(0,0,0);k=1.
        p=dict(t=t,x=x,y=y,z=z,a=a,b=b,c=c,d=d,e=e,rot=rot,m=m,c0=col[0],c1=col[1],c2=col[2],k=k)
        q=sk if sk is not None else s.sk
        if q is not None: p['sk']=q
        if em is not None: p['em']=em
        if getattr(s,'tur',False): p['tur']=1
        s.L.append(p)
    def S(s,x,y,z,r,col=GR,m=1,sk=None,em=None): s.pr(0,x,y,z,r,col=col,m=m,sk=sk,em=em)
    def C(s,x,y,z,a,b,c,r1,r2,col=GR,m=1,sk=None): s.pr(1,x,y,z,a,b,c,r1,r2,col=col,m=m,sk=sk)
    def X(s,x,y,z,hx,hy,hz,rd=.6,rot=0,col=GR,m=1,sk=None): s.pr(2,x,y,z,hx,hy,hz,rd,0,rot,col,m,sk)
    def E(s,x,y,z,a,b,c,col=GR,m=1,rot=0,sk=None,em=None): s.pr(3,x,y,z,a,b,c,0,0,rot,col,m,sk,em)
    def Y(s,x,y,z0,z1,r,col=GR,m=1,sk=None): s.pr(4,x,y,z0,z1,r,0,.8,0,0,col,m,sk)
    def R(s,x,y,z,RR,r,col=GR,m=1,vert=False,rot=0,sk=None): s.pr(5,x,y,z,RR,r,1 if vert else 0,0,0,rot,col,m,sk)
    def K(s,x,y,z,a,b,c,r,tip=.3,rot=0,col=GR,m=1,sk=None,em=None): s.pr(6,x,y,z,a,b,c,r,tip,rot,col,m,sk,em)

def hleg(m,f,hz,hy,th,sh,col_u,col_a,foot,bulk=1.,col_k=None):
    for q in(-1,1):
        ph=TAU*f.get('t',0)+(math.pi if q>0 else 0); w=f.get('walk')
        a=.5*math.sin(ph) if w else .06*q; b=(.22+.8*max(0,math.sin(ph+1.2))) if w else .24
        hx=0;kx=math.sin(a)*th;kz=hz-math.cos(a)*th;ax=kx+math.sin(a-b)*sh;az=kz-math.cos(a-b)*sh
        dz=max(0,3-az)
        kz+=dz;az+=dz
        m.C(hx,q*hy,hz,kx,q*hy,kz,3.3*bulk,2.5*bulk,col_u)
        m.E(kx+.9,q*hy,kz,2.5*bulk,2.5*bulk,2.8*bulk,col_k or col_a)
        m.C(kx,q*hy,kz,ax,q*hy,az,2.7*bulk,2.*bulk,col_a)
        m.C(kx+1.3,q*hy,kz-1.5,ax+1.2,q*hy,az+2.5,1.5*bulk,1.1*bulk,col_a)
        m.X(ax+1.5,q*hy,max(1.6,az-1.4),4.1*bulk,2.2*bulk,1.5,.6,0,foot)
        m.E(ax+4.2,q*hy,max(1.5,az-1.6),2.4*bulk,2.*bulk,1.25,foot)

def gpt_shell(m,z0,w,trim=True):
    # 공통 흉갑: 좁은 허리와 각진 가슴판
    m.X(0,0,z0,3.1,w*.66,2.3,.9,0,GM);m.X(3.1,0,z0-1.6,.7,2.5,3.4,.5,0,W)
    for q in(-1,1): m.X(0,q*(w*.8),z0-1.2,2.5,.8,3.6,.6,0,W)
    m.C(0,0,z0+.5,0,0,z0+5.6,2.8,3.5,GM)
    m.X(.4,0,z0+10,4.5,w,5.3,2.2,0,W);m.X(1.1,0,z0+12.2,4.4,w*.92,3.2,1.6,0,W);m.X(4.9,0,z0+9.8,.5,1.1,3.8,.3,0,T,2)
    for q in(-1,1): m.X(4.65,q*3.3,z0+11.4,.55,1.5,1.6,.35,0,GR)
    m.X(-4.6,0,z0+11,1.5,w*.66,4.3,1.,0,GR)
def gpt_head(m,z,scale=1.):
    s=scale
    m.C(.4,0,z-4.4*s,.7,0,z-2.3*s,1.65*s,1.5*s,GM)
    m.X(1.1,0,z,2.8*s,2.3*s,3*s,1.5*s,0,W);m.X(3.65*s+.3,0,z+.4,.4,1.85*s,.5*s,.2,0,T,2)
    m.R(1.1,0,z-2.9*s,2.5*s,.42*s,T,2)
    for q in(-1,1): m.C(.6,q*2.1*s,z+1.6*s,-5.3*s,q*5.4*s,z+7*s,.8*s,.14,T,2)
def gpt_guard(f):
    m=B(.16); hleg(m,f,17.5,4.2,8.3,8.2,W,W,GM,.86,col_k=T)
    gpt_shell(m,18.6,7.2)
    for q in(-1,1):
        m.X(.2,q*9.1,31.6,3.8,3.1,1.6,1.1,0,W);m.X(.2,q*10.1,29.6,3.3,2.5,1.1,.8,0,GR);m.X(3.8,q*9.1,31.4,.4,2,.6,.2,0,T,2);m.C(.2,q*9.8,28.4,1.8,q*11,22,1.75,1.45,GM);m.C(1.8,q*11,22,6.2,q*11.2,18.6,2.4,1.85,W);m.R(4.3,q*11.1,20,2.45,.35,T,2,vert=True)
    gpt_head(m,37.5)
    m.X(8.3,-12.4,21,1.05,6.2,13,1.,0,W,sk=.1);m.X(9.45,-12.4,21,.38,4.2,10.4,.25,0,GR);m.X(9.9,-12.4,21,.28,1.15,9.,.2,0,T,2)
    m.C(6.5,11.2,18,21,11.2,27,.75,.4,GR);m.C(10,11.2,20.3,23.5,11.2,29,.48,.18,T,2)
    if f.get('atk'): m.S(23.5,11.2,29,2.6,T,2)
    return m.L
def gpt_arch(f):
    m=B(.16); hleg(m,f,16.5,3.5,7.7,7.8,W,W,GM,.72,col_k=T)
    gpt_shell(m,17,5.6)
    for q in(-1,1):
        m.X(.1,q*7.1,29.2,2.8,2.3,1.2,.8,0,W);m.C(0,q*7.4,27.5,6,q*7.2,24.5,1.4,1.1,GM);m.C(6,q*7.2,24.5,11.5,q*4.5,27.5,1.5,1.15,W)
        for i in range(3): m.C(-3.6,q*(2.6+i*1.1),29-i*2.6,-12-i*1.6,q*(7+i*2.3),36.5-i*5.6,.9,.14,W)
    gpt_head(m,34.8,.86)
    m.R(14,0,26,9.7,.55,T,2,vert=True);m.C(14,0,17,14,0,35,.34,.34,GR);m.X(14,0,26,1.,1.,2.6,.4,0,W)
    if f.get('atk'): m.S(14,0,26,3.4,T,2)
    return m.L
def gpt_tf(f):
    m=B(.2)
    for i in range(6):
        a=i/6*TAU;x,y=math.cos(a),math.sin(a);m.C(x*5,y*5,20,x*18,y*18,4,4.5,.9,W);m.X(x*18,y*18,9,2.4,2.4,1.6,.5,a,T,2)
    m.R(0,0,5,17,1.6,GR);m.R(0,0,5,12,.8,T,2);m.Y(0,0,4,22,8,GM);m.X(0,0,24,9.5,10.5,5.6,2.5,0,GR)
    m.C(0,0,24,0,0,34,6.5,8,GM);m.X(.5,0,43,11.5,15.5,11,4.5,0,W);m.X(2,0,48,10.6,14,5,3,0,W);m.X(12.1,0,42.5,.9,6.4,6.4,.7,0,GR);m.X(13,0,42.5,.6,3.4,4.4,.4,0,T,2);m.X(-11.5,0,44,2.8,10,8.4,1.6,0,GR)
    for q in(-1,1):
        m.X(0,q*22,52,8.8,7.4,3.6,2.4,0,W,sk=.1);m.X(0,q*23.6,47.6,8,5.4,2.6,1.8,0,GR);m.X(8.6,q*22,52,.5,4.6,1.1,.3,0,T,2);m.X(-1,q*27.2,52,4.8,.8,6.6,.8,0,GR)
        m.C(0,q*23,43,5,q*25,32,3.7,3.,GM);m.C(5,q*25,32,18,q*24,30,5,3.8,W)
        m.R(18,q*24,30,4.6,.7,T,2,vert=True);m.S(22.7,q*24,30,2.7,T,2)
        for i in range(3): m.C(-9,q*(6+i*3),52+i*1,-23-i*2,q*(13+i*6),66+i*2-i*i*2,2.2,.3,W)
    gpt_head(m,60.8,1.75)
    m.R(0,0,62,13,.7,T,2,vert=True,rot=math.pi/2)
    return m.L

def gem_text(f):
    m=B(.15); hleg(m,f,17,4.2,7.6,7.8,GM,ST,DK,1.05)
    m.X(0,0,18.3,3.5,5.1,2.5,.7,0,DK);m.X(0,0,23,3.1,4.2,3.3,.8,0,GM);m.X(.5,0,29,4.6,6.5,4.6,1.,0,T);m.X(4.9,0,29.6,.6,3.5,2.5,.3,0,ST);m.X(5.5,0,29.6,.3,2.1,1.1,.15,0,(.55,.95,1.),2)
    m.X(-5.8,0,29.5,2.5,4.9,5.6,.8,0,GM);m.Y(-6.2,3.2,34,40,.75,DK);m.C(-6.2,-3,35,-6.2,-3,47,.34,.18,ST);m.S(-6.2,-3,47.3,.65,(1,.3,.15),2)
    for q in(-1,1):
        m.X(0,q*8.4,32,3.5,2.7,2.3,.9,0,T);m.X(0,q*8.9,33.8,2.9,1.8,.45,.2,0,ST);m.C(.2,q*8.7,30,1.5,q*9.4,25,1.95,1.7,GM);m.C(1.5,q*9.4,25,6,q*(9.4-5*(q<0)),22.5,1.9,1.6,ST)
        m.X(0,q*5.8,20,2.4,1.2,2.2,.3,0,GM)
    m.X(.8,0,35.2,1.8,1.9,1.3,.4,0,DK);m.X(1.2,0,38.7,3.6,3.2,3,1.1,0,ST);m.X(4.3,0,38.8,.55,2.4,1.05,.2,0,(.55,.95,1.),2);m.X(1.2,3.8,38,1.1,.9,1.7,.3,0,GM);m.X(1.2,-3.8,38,1.1,.9,1.7,.3,0,GM);m.X(.6,0,41.7,2.8,2.4,.7,.3,0,T)
    m.X(9.5,4.4,23.7,6.6,1.15,1.5,.4,0,DK);m.X(13,4.4,25.6,2.8,.6,.55,.2,0,GM);m.Y(0,0,0,0,0) if False else None;m.C(16,4.4,23.8,22.5,4.4,23.8,.65,.65,ST);m.X(7.8,4.4,21,1.4,.9,2.4,.3,0,GM)
    if f.get('atk'): m.S(23.5,4.4,23.8,2.5,(1,.8,.4),2)
    return m.L

def gem_vision(f):
    m=B(.15); hleg(m,f,16,4.6,7,7.4,GM,ST,DK,.95)
    m.X(0,0,17,3.2,4.7,2.2,.7,0,DK);m.X(-.5,0,22,2.8,3.9,3.4,.8,0,GM);m.X(0,0,28,4,5.6,4,1.,0,T);m.X(-5,0,29,2.2,4.4,4.8,.7,0,GM)
    m.C(0,6,31,5,7.5,27,1.8,1.5,GM);m.C(0,-6,31,5,-5,25.5,1.8,1.5,GM);m.X(.5,0,34,1.5,1.7,1.2,.4,0,DK)
    m.S(1.5,0,38.6,4.3,ST);m.S(4.5,0,38.8,2.5,DK);m.S(5.7,0,38.8,1.75,T,2);m.R(4.3,0,38.8,2.85,.42,HZ,1,vert=True);m.C(-1.5,2,41,-1.5,2,46,.3,.15,ST)
    m.X(8,1.6,33,9,1.6,1.8,.5,0,DK);m.C(14,1.6,33,31,1.6,33,.95,.75,ST);m.R(23,1.6,33,1.55,.42,GM,1,vert=True);m.R(28,1.6,33,1.55,.42,GM,1,vert=True);m.C(31,1.6,33,33.8,1.6,33,1.55,1.3,DK);m.X(7,1.6,37,4.5,.9,1.3,.4,0,T)
    if f.get('atk'): m.S(35.5,1.6,33,3.2,T,2)
    return m.L

def bleg(m,f,n,hz,hy,xs,span,up,lift,stride,col,tip,r=1.):
    for i,xo in enumerate(xs):
        for q in(-1,1):
            ph=TAU*f.get('t',0)+(math.pi if (i+(q>0))%2 else 0); w=f.get('walk')
            sw=math.cos(ph)*stride if w else 0; l=max(0,math.sin(ph))*lift if w else 0; dx=xo*.25
            kx=xo+dx+sw*.45;ky=q*(hy+span*.56);kz=hz+up+l*.6;fx=xo+dx*2+sw;fy=q*(hy+span);fz=.6+l
            mx=(kx+fx)/2+dx*.2;my=q*(hy+span*.84);mz=(kz+fz)/2+up*.25
            m.C(xo,q*hy,hz,kx,ky,kz,1.75*r,1.3*r,col,sk=.7)
            m.S(kx,ky,kz,1.65*r,col,sk=.5)
            m.C(kx,ky,kz,mx,my,mz,1.35*r,.95*r,col,sk=.5)
            m.C(mx,my,mz,fx,fy,fz,.9*r,.2*r,tip,sk=.2)
def segs(m,x0,x1,z,yw,zh,n,taper=.72,col=CL,sk=.7):
    for i in range(n):
        u=i/max(n-1,1);x=x0+(x1-x0)*u;s=1-(1-taper)*abs(u-.35)/.65
        L=abs(x1-x0)/n*.82
        m.E(x,0,z,L,yw*s,zh*s,col,sk=sk)
        if i%2==0: m.C(x,-yw*s*.1,z+zh*s*.9,x-1,yw*s*.1-yw*s*.1,z+zh*s*1.42,zh*.22,.15,CR,sk=.15)

def cla_swarm(f):
    m=B(1.2);bleg(m,f,6,8,3.6,[6,0,-6],8.2,3.6,3.,4.,CD,CR,.72)
    segs(m,3,-11,8.4,6.4,4.3,3,.72)
    m.E(8,0,8.4,5,4.8,3.6,CD,sk=.5)
    for q in(-1,1):
        m.C(10.8,q*3.2,7.5,16.5,q*4.9,7.5,1.25,.8,CR,sk=.2);m.C(16.5,q*4.9,7.5,20.2,q*1.4,6.8,.8,.12,CR,sk=.2);m.S(11.3,q*2.3,10,.72,T,2);m.S(10,q*3.5,10.8,.5,T,2)
    if f.get('atk'): m.S(20.5,0,7,1.8,T,2)
    return m.L
def cla_w(f):
    m=B(1.2);bleg(m,f,4,10,3.6,[3.5,-4],8.4,3.8,2.8,3.4,CD,CR,.75)
    segs(m,2,-9,11,6,4.6,2,.8);m.E(-5.6,0,17.5,3.9,3.7,4,T,2,sk=.7,em=.8);m.R(-5.6,0,15.4,3.4,.7,CD,sk=.4);m.R(-5.6,0,19.2,3.,.65,CD,sk=.4)
    m.E(7,0,11,4.4,4,3.4,CD,sk=.5)
    for q in(-1,1):m.C(9,q*2.8,9.5,15,q*2.3,6,.9,.5,CR,sk=.2);m.C(15,q*2.3,6,17.5,0,7,.5,.12,CR,sk=.2);m.S(10,q*2,12.4,.6,T,2)
    return m.L
def cla_scout(f):
    m=B(1.);bleg(m,f,4,10,2.5,[3,-3.5],12.5,8,4.4,5.,CD,CR,.62)
    segs(m,2,-12,11.5,3.9,3.1,3,.65);m.E(6,0,11.5,3.2,2.9,2.6,CD,sk=.5)
    for q in(-1,1):m.C(7.5,q*1.4,13.4,14,q*6.5,23,.32,.12,CR,sk=.1);m.S(8.3,q*1.8,12.8,.72,T,2);m.E(-4,q*3.6,14.2,7,1,2.7,T,2,rot=q*-.2,sk=.2)
    return m.L
def cla_spine(f):
    m=B(1.);bleg(m,f,4,10,4.3,[4.5,-5],8.6,5.4,3.,3.6,CD,CR,.86)
    segs(m,-3,-15,9.8,6.2,5,3,.7)
    m.C(0,0,11,2,0,20,5.2,4.5,CL,sk=1.2);m.C(2,0,20,4,0,31,4.5,3.5,CL,sk=1.2)
    for z,s in((16,5.8),(23,5),(29,4.1)): m.E(1.6+(z-16)*.18,0,z,s*.92,s*1.04,2.3,CD,sk=.5)
    m.E(7,0,36.3,7.2,5,3.3,CD,sk=.6);m.E(4,0,38.8,4.6,3.8,1.8,CL,sk=.4);m.S(12.6,0,36.2,1.6,T,2)
    for q in(-1,1): m.C(11,q*3,35,18,q*1.5,33.2,1.05,.15,CR,sk=.15)
    for q in(-1,1):
        m.S(7.1,q*2.8,38.6,.72,T,2);m.C(2.8,q*5,31,10,q*7.4,28,1.2,.8,CD,sk=.5);m.C(10,q*7.4,28,16.2,q*5.5,23,.75,.12,CR,sk=.15)
        for i,(a,b) in enumerate(((0,27),(-2.6,21),(-5,15.6))): m.C(a-2.4,q*2.2,b,a-11,q*(7.4+i),b+9.5,1.05,.15,CR,sk=.2)
    if f.get('atk'): m.S(15,0,37.9,3,T,2)
    return m.L
def cla_beast(f):
    m=B(1.);bleg(m,f,8,11,12,[18,6,-7,-18],14,5,4,5.8,CD,CR,1.75)
    m.E(0,0,14,28,15.5,12,CD,sk=1.4)
    for i,(x,yw,zh) in enumerate(((22,14.2,12.6),(13,17.5,16.2),(3.5,18.6,18.4),(-6,18.3,18),(-15,16.2,15.8),(-23,12.4,12.6))):
        m.E(x,0,15.5,7.7,yw,zh,CL,sk=.6)
        for q in(-1,0,1):
            yy=q*yw*.5;zz=15.5+zh*(.96 if q==0 else .78);l=(5.6 if q==0 else 3.9)
            m.C(x,yy,zz-1,x-2.2,yy*1.32,zz+l,2.6 if q==0 else 2.,.2,CR,sk=.15)
        m.R(x+.6,0,15.5,min(yw,zh)*.97,.42,T,2,vert=True,rot=0,sk=.3) if False else None
    m.E(30,0,14,8.5,11,8.6,CD,sk=.7)
    for q in(-1,1):
        m.S(36.8,q*5.2,17,1.15,T,2);m.S(35.4,q*7.8,18.5,.8,T,2)
        m.C(34,q*8.5,11,47,q*14.5,10,4.1,2.6,CL,sk=.5);m.C(47,q*14.5,10,57,q*7.2,10.5,2.7,1.2,CR,sk=.2);m.C(57,q*7.2,10.5,60.5,q*1.8,12,1.25,.18,CR,sk=.2)
        for i in range(3): m.C(42+i*5,q*(10.5+i*2.1),11.5,42.8+i*5.4,q*(5.8+i*2.4),11,.95,.15,CR,sk=.15)
    if f.get('atk'): m.S(60,0,12,4.6,T,2)
    return m.L
def cla_acid(f):
    m=B(1.1);bleg(m,f,6,11,8,[11,1,-9],11,4.6,3.2,4.4,CD,CR,1.15)
    m.E(6,0,13,11,8.6,7.6,CL,sk=1.)
    for x,s in((12,8.4),(5,9.4),(-1.4,8.8)): m.E(x,0,14.4,4.9,s,s*.98,CD,sk=.5)
    m.E(-13,0,21,14,11.5,14,T,2,sk=1.,em=.75)
    for x in(-23,-16,-9,-2): m.R(x+1,0,21,max(1,11.9-abs(x+12.5)*.48),.92,CD,1,vert=True,sk=.5)
    m.Y(-13,0,32,38.5,3.3,CD,sk=.5);m.R(-13,0,38.5,3.3,.75,CR,sk=.2);m.S(-13,0,38.3,2.2,T,2)
    for q in(-1,1): m.Y(-7,q*6.8,27,33,2.1,CD,sk=.5);m.R(-7,q*6.8,33,2.1,.55,CR,sk=.2);m.S(-7,q*6.8,32.8,1.4,T,2)
    m.E(17.5,0,13.5,6.6,7.4,4.5,CD,sk=.6);m.E(15,0,16.6,4.8,5.6,2,CL,sk=.4)
    for q in(-1,1):m.S(22.8,q*3,15.4,.9,T,2);m.C(21,q*4.8,11,29,q*2.6,8.4,1.25,.15,CR,sk=.15)
    if f.get('atk'): m.S(-13,0,41,4.2,T,2)
    return m.L
def cla_heal(f):
    m=B(1.2);bleg(m,f,6,9,8,[7,0,-7],7,3,2.4,3,CD,CR,1.05)
    m.E(0,0,13,12.5,11.5,8.8,CL,sk=1.)
    for a in(0,1.57,3.14,4.71): m.C(math.cos(a)*8,math.sin(a)*8,17.5,math.cos(a)*5,math.sin(a)*5,22,3.1,1.9,CD,sk=.8)
    for x,y,z,r in((0,0,28,6.8),(-6.2,4.4,24.2,4.3),(5.6,4.6,23.8,3.7),(1,-6.4,24.4,4)):
        m.C(x*.6,y*.6,17,x,y,z,1.5,1.2,CD,sk=.6);m.E(x,y,z,r,r,r*1.05,T,2,sk=.5,em=.8);m.R(x,y,z,r*.9,.32,CD,sk=.25);
    for i in range(6):
        a=i/6*TAU+.3;x,y=math.cos(a),math.sin(a);m.C(x*11,y*10.5,14,x*16,y*15.5,20+i%2*4,.62,.12,CR,sk=.15)
    m.E(11.8,0,12,3.6,3.7,3,CD,sk=.5)
    for q in(-1,1): m.S(14,q*1.8,13,.7,T,2)
    return m.L


LENS=(.55,.95,1.);BLK=(.06,.07,.09);RUST=(.5,.28,.12);BN=(.42,.18,.13);WARN=(1,.3,.15)
def ring4(n=4,off=.785):
    return [(math.cos(i/n*TAU+off),math.sin(i/n*TAU+off)) for i in range(n)]
def hover(m,z,R):
    m.R(0,0,z,R,.8,GR);m.R(0,0,z-.3,R*.72,.42,T,2)

# --- ChatGPT 유닛 ---
def gpt_w(f):
    m=B(.2);hover(m,6,8);m.E(0,0,14,8,7.4,6.2,W);m.X(5.2,0,14,3.4,4.2,3.2,1.6,0,W);m.X(8.5,0,14.6,.4,2.6,.8,.2,0,T,2);m.X(-6,0,17,2.3,3.4,3.4,1,0,GR);m.R(0,0,12,7.4,.32,T,2)
    for q in(-1,1):m.C(2,q*7,13,7,q*9.2,8,1.1,.8,GM);m.C(7,q*9.2,8,11,q*4.6,6,.8,.2,W);m.X(0,q*7.6,18.5,3.4,.5,2.2,.4,0,W)
    m.C(-2,0,20,-5,0,25,.5,.14,T,2);return m.L
def gpt_scout(f):
    m=B(.15);hover(m,12,6);m.C(-11,0,20,12,0,20,3.6,1.4,W);m.E(1,0,23,5,2.6,2,T,2,em=1.2,sk=.2);m.S(12.8,0,20,1.3,T,2)
    for q in(-1,1):m.X(-3,q*8,19,6.5,.5,1.5,.4,q*-.35,W);m.X(-3,q*10.8,20,5,.4,.42,.2,q*-.35,T,2);m.C(-7,q*3,20,-13,q*4.2,20,1.3,.6,GM)
    m.C(-9,0,23,-13,0,30,.8,.15,W);return m.L
def gpt_heal(f):
    m=B(.2);hover(m,6,10);m.E(0,0,20,6.4,6.4,7,T,2,em=1.1,sk=.3);m.R(0,0,20,8.6,.5,W);m.R(0,0,20,8,.5,T,2,vert=True);m.R(0,0,20,8,.5,GR,1,vert=True,rot=1.57)
    for i,(x,y) in enumerate(ring4(6,0)):
        m.C(x*3,y*3,8,x*11.5,y*11.5,13,2.3,.7,W);m.C(x*11.5,y*11.5,13,x*11,y*11,19-i%2*3,.8,.15,W)
    m.Y(0,0,5,13,3.4,GM);m.C(0,0,27,0,0,35,1.2,.25,W);m.S(0,0,36,1.2,T,2);return m.L
def gpt_ram(f):
    m=B(.2)
    for q in(-1,1):
        m.X(-4,q*18,8,20,4.4,6,3,0,GM);m.X(-4,q*22.4,8,14,.6,3.4,.4,0,T,2);m.X(-4,q*18,14.5,15,3.6,1.4,1,0,W)
    m.X(-6,0,16,20,14,9,4,0,W);m.X(-11,0,27,12,10,4,2.5,0,GR);m.X(4,0,21,10,10,4,2.5,0,W);m.X(-11,0,31.5,5,5,1.2,.6,0,T,2)
    m.Y(0,0,0,0,0,GM) if False else None
    for q in(-1,1):m.C(12,q*9,12,28,q*5,13,4,3.6,GR);m.R(25,q*5.2,13,4.3,.7,T,2,vert=True)
    m.C(18,0,14,40,0,14,7.2,8.2,W);m.E(41,0,14,3,9.2,9.2,GM,sk=.15);m.R(39,0,14,8.5,.95,T,2,vert=True);return m.L
def gpt_ship(f):
    m=B(.2);Z=44;m.E(0,0,Z,30,8.6,6.2,W);m.X(4,0,Z+5,14,5,2.4,1.4,0,GR);m.X(-10,0,Z+7.4,6,3.6,1.8,.8,0,W);m.X(10.8,0,Z+7.4,.4,3,.6,.2,0,T,2);m.R(-2,0,Z,10.4,.55,T,2,vert=True,rot=1.57)
    m.C(26,0,Z,34,0,Z,3.4,.6,GR)
    for q in(-1,1):
        m.X(-7,q*12.5,Z-1,8,5.5,1,.8,q*-.1,W);m.C(-14,q*18,Z-1,10,q*18,Z-1,3.6,2.3,W);m.R(-13,q*18,Z-1,3.8,.5,T,2,vert=True);m.S(-15,q*18,Z-1,2.8,T,2);m.X(10,q*18,Z+3.5,3.6,.5,3,.6,0,GR)
    m.S(-30,0,Z,4,T,2);return m.L
def gpt_trans(f):
    m=B(.22);Z=45;m.E(0,0,Z,26,14,8.2,W);m.X(0,0,Z-6.5,18,10,2.2,1.2,0,GM);m.X(0,0,Z-8.2,12,6.6,.5,.25,0,T,2);m.X(6,0,Z+7,10,6.4,2.2,1.4,0,GR);m.X(16,0,Z+8.5,.5,3,.8,.2,0,T,2)
    for x,y in((16,27),(-16,27),(16,-27),(-16,-27)):
        m.C(x*.6,y*.45,Z,x,y,Z,2.1,2.1,GR);m.R(x,y,Z,8,1.2,W);m.R(x,y,Z-.7,6.8,.42,T,2);m.Y(x,y,Z-2,Z+2,2.2,GM)
    return m.L

# --- Gemini 유닛 ---
def track(m,x0,x1,y,z,hw,hh):
    L=(x1-x0)/2;c=(x0+x1)/2
    m.X(c,y,z,L,hw,hh,hh*.9,0,BLK);n=int((x1-x0)/4.2)
    for i in range(n):
        m.X(x0+1.6+i*(x1-x0-3)/(n-1),y,z+hh+.15,1.15,hw+.2,.42,.15,0,GM);m.X(x0+1.6+i*(x1-x0-3)/(n-1),y,z-hh-.15,1.15,hw+.2,.42,.15,0,GM)
    for x in(x0+hh*.8,c,x1-hh*.8): m.R(x,y+(1 if y>0 else -1)*(hw+.1),z,hh*.62,.4,ST,1,vert=True,rot=1.57)
def gem_w(f):
    m=B(.12);track(m,-11,10,8,5,2.6,4);track(m,-11,10,-8,5,2.6,4);m.X(-1,0,12,9,5.6,4,1,0,T);m.X(-6,0,18,4,5,2.5,.7,0,GM);m.X(4,0,18,3.4,3.8,2.6,1,0,ST);m.X(7.4,0,18.6,.4,2.6,1,.15,0,LENS,2);m.Y(-8,4,20,25,.7,DK);m.S(-8,-4,21,1.6,WARN,2)
    m.C(4,3,14,13,3,20,1.7,1.3,HZ);m.C(13,3,20,19,3,10,1.4,1.,HZ);m.X(19,3,7,2,3.2,2.6,.7,0,ST);return m.L
def gem_scout(f):
    m=B(.12)
    for x in(-14,14):m.R(x,0,7.2,6,1.6,BLK,1,vert=True,rot=1.57);m.R(x,0,7.2,3.4,.5,ST,1,vert=True,rot=1.57)
    m.C(-14,0,7.2,-3,0,14,1,.9,ST);m.C(14,0,7.2,8,0,18,1,.9,ST);m.X(0,0,14,7,3.4,3,1.2,0,T);m.X(-7,0,17,4.4,3,1.2,.6,0,BLK);m.X(7,0,18,2.4,3.2,1.2,.5,0,GM);m.X(9.4,0,18,.3,2,.6,.1,0,LENS,2)
    m.C(-3,0,19,0,0,27,2.4,2.8,GM);m.S(1,0,30,2.9,ST);m.X(3.2,0,30.2,.4,1.8,.65,.12,0,LENS,2)
    for q in(-1,1):m.C(0,q*2.6,26,6,q*3.4,20.5,1,.8,GM);m.C(-3,q*2.2,19,3,q*3.8,10,1.4,1,GM)
    m.C(-7,2,20,-9,2,33,.25,.12,ST);return m.L
def rotor(m,x,y,z,R,col=ST,f=None):
    a=(f or {}).get('t',0)*1.5708
    m.R(x,y,z,R,.75,col);m.Y(x,y,z-1,z+1,1.5,DK);m.X(x,y,z+.2,R*.92,.6,.42,.12,a,BLK);m.X(x,y,z+.2,.6,R*.92,.42,.12,a,BLK)
def gem_drone(f):
    m=B(.15);Z=33;m.X(0,0,Z,9,7,4.2,1.4,0,T);m.X(0,0,Z+5,5,4,1.6,.7,0,ST);m.X(-1,0,Z-5.5,6,4.6,1.5,.6,0,GM)
    for x,y in ring4():
        m.C(x*6,y*6,Z,x*18,y*18,Z+1,1.5,1.2,GM);rotor(m,x*18,y*18,Z+2.5,7.2,ST,f)
    m.S(9,0,Z-3,3,ST);m.S(11,0,Z-3,1.7,LENS,2)
    for q in(-1,1):m.C(9,q*5,Z-5,19,q*5,Z-5,.75,.6,DK);m.X(4,q*5,Z-5,5,1.3,1.4,.4,0,GM)
    return m.L
def gem_heal(f):
    m=B(.15);Z=32;m.S(0,0,Z,5.4,W);m.X(0,0,Z+5.2,3.2,.9,.28,.1,0,WARN,2);m.X(0,0,Z+5.2,.9,3.2,.28,.1,0,WARN,2)
    for x,y in ring4():m.C(x*4,y*4,Z,x*10.6,y*10.6,Z+1,1,.8,GM);rotor(m,x*10.6,y*10.6,Z+2,4.2,GR,f)
    m.C(3,0,Z-3,8,0,Z-8,.9,.6,HZ);m.C(8,0,Z-8,5,0,Z-12,.6,.3,HZ);m.S(4.6,0,Z-12.6,1.2,LENS,2);m.Y(-3,0,Z-6,Z-3,2,T);return m.L
def gem_audio(f):
    m=B(.12);d=f.get('dep');track(m,-20,19,16,6,3.4,5);track(m,-20,19,-16,6,3.4,5);m.X(-1,0,14,16,12,4.4,1.2,0,T);m.X(-12,0,20,6,9,2.4,.8,0,GM)
    for q in(-1,1):
        m.X(0,q*12.8,15,9,.4,1.8,.15,0,HZ)
        if d:m.C(-16,q*19,10,-27,q*22,1.5,2,1.5,ST);m.X(-27.5,q*22,1.3,3.2,3.2,1.2,.5,0,DK);m.C(14,q*19,10,25,q*22,1.5,2,1.5,ST);m.X(25.5,q*22,1.3,3.2,3.2,1.2,.5,0,DK)
    z=28;tilt=2
    m.Y(0,0,18,24,8,DK);m.tur=True;m.X(0,0,25,10,9,3,1.1,0,ST)
    m.C(-8,0,z-tilt*.4,10,0,z+tilt*.4,8.6,12.5,GM);m.R(11,0,z+.8,13,1.2,GO,1,vert=True);m.E(11.5,0,z+.8,2.2,11.5,11.5,BLK,sk=.1);m.S(12.5,0,z+.8,5,T,2);m.R(13,0,z+.8,8.4,.45,T,2,vert=True);m.Y(-5,8,33,41,.5,DK);m.S(-5,8,41.5,1,WARN,2);return m.L
def gem_how(f):
    m=B(.12);track(m,-24,20,15,6,3.2,5);track(m,-24,20,-15,6,3.2,5);m.X(-3,0,14,20,11.4,4,1.2,0,T);m.tur=True;m.X(-2,0,23,13,10,5,1.6,0,ST);m.X(-13,0,30,5,7,2,.7,0,GM)
    m.C(9,0,26,37,0,46,2.6,2.,GM);m.C(32,0,42.4,37,0,46,3.2,3.2,DK);m.R(23,0,36,3.4,.7,ST,1,vert=True,rot=0);m.X(10,5.6,27,6,1.1,3,.5,0,GM);m.X(10,-5.6,27,6,1.1,3,.5,0,GM);m.Y(-9,6,28,36,1.4,HZ);m.tur=False
    for q in(-1,1):m.C(-22,q*10,10,-31,q*12,1.5,1.6,1.3,ST);m.X(-31,q*12,1.2,2.8,3,1.1,.4,0,DK)
    return m.L
def gem_trans(f):
    m=B(.15);Z=47;m.C(-26,0,Z,26,0,Z,8.6,8,T);m.E(26.5,0,Z+1,6,8,7.5,ST);m.E(30.8,0,Z+2.5,2.4,6,3.1,LENS,2,em=1.2,sk=.1);m.X(0,0,Z-8.4,18,6,1.5,.6,0,GM);m.X(-26,0,Z-3,8,7,4,1.4,0,DK)
    for x,z2 in((-30,Z+10),(29,Z+8)):
        m.Y(x,0,Z+4,z2,3.2,GM);a=f.get('t',0)*1.5708;m.R(x,0,z2+.5,16,.8,ST);m.X(x,0,z2+.8,15.4,1.2,.6,.15,a,BLK);m.X(x,0,z2+.8,1.2,15.4,.6,.15,a,BLK);m.Y(x,0,z2,z2+2,2.3,DK)
    for q in(-1,1):m.X(4,q*9.4,Z+2,16,.5,1.6,.2,0,HZ);m.X(-2,q*9.4,Z-5.2,16,1,1.4,.5,0,ST)
    return m.L

# --- Claude 공중 유닛 ---
def cla_spore(f):
    m=B(1.);Z=38;m.E(0,0,Z,13,13,9,CL,sk=1.2);m.E(0,0,Z+7,7,7,4,CD,sk=.8);m.R(0,0,Z-5,12.2,1.1,CD,sk=.5)
    for x,y in ring4(8,0):
        m.S(x*9,y*9,Z+4.5,1.3,T,2);m.C(x*11.6,y*11.6,Z-5,x*14,y*14,Z-13,1.2,.7,CD,sk=.5);m.C(x*14,y*14,Z-13,x*11,y*11,Z-23,.7,.15,CR,sk=.2)
    m.E(0,0,Z-6,6.4,6.4,4.2,T,2,em=.9,sk=.4);return m.L
def cla_carry(f):
    m=B(1.2);Z=46;m.E(0,0,Z,23,13.5,11,CL,sk=1.2);m.E(-3,0,Z-9,13.5,9.4,8.4,T,2,em=.8,sk=.8)
    for x in(-12,-5,2,9,15):m.E(x,0,Z+6.2,3.6,10.4-abs(x)*.25,6.5,CD,sk=.4);m.C(x,0,Z+12-abs(x)*.14,x-1.5,0,Z+17-abs(x)*.17,1.3,.15,CR,sk=.15)
    for x in(-12,-3,6):m.R(x,0,Z-9,8.2-abs(x+3)*.28,.72,CD,1,vert=True,sk=.4)
    for q in(-1,1):
        m.E(1,q*19,Z+5,13,10,1.2,BN,rot=q*.2,sk=.4);m.C(13,q*9,Z+4,-5,q*29,Z+7,1.3,.4,CD,sk=.4);m.C(4,q*11,Z+4,-13,q*23,Z+6,1,.3,CD,sk=.4);m.S(20,q*6,Z+3,1.2,T,2)
    m.E(23,0,Z-1,5,6.4,4.6,CD,sk=.6);m.C(25,q*3,Z-5,31,q*1.6,Z-7,1,.12,CR,sk=.15) if False else None
    for q in(-1,1):m.C(25,q*3,Z-5,31,q*1.6,Z-7,1,.12,CR,sk=.15)
    return m.L

# --- ChatGPT 건물 ---
def base_w(m,R,h=4):
    m.X(0,0,h/2,R,R,h/2+.8,2,0,GR);m.X(0,0,h+.4,R-3,R-3,.8,.6,0,W);m.X(0,0,h+1.1,R-5.5,R-5.5,.2,.1,0,T,2)
def pyl(m,R,z):
    for x,y in((1,1),(-1,1),(1,-1),(-1,-1)):
        X,Y=x*R,y*R;m.X(X,Y,z*.45,2.6,2.6,z*.45,1,0,W);m.X(X,Y,z*.92,1.2,1.2,z*.1,.5,0,GM);m.S(X,Y,z*1.05,2,T,2)
def gpt_hq(f):
    m=B(.3);base_w(m,60);m.Y(0,0,5,16,49,W);m.R(0,0,15,48,.8,T,2);m.Y(0,0,16,30,37,GR);m.Y(0,0,28,38,30,W);m.R(0,0,37.6,29.6,.6,T,2);m.E(0,0,40,27,27,26,W);m.S(0,0,68,6.5,T,2);m.C(0,0,62,0,0,92,2.2,.3,W);m.R(0,0,70,17,1,T,2,vert=True);m.R(0,0,70,17,1,GR,1,vert=True,rot=1.57);pyl(m,52,44)
    for x,y in ring4(8,0):m.X(x*46,y*46,16,1.2,8,10,.8,math.atan2(y,x),GR);m.X(x*47.6,y*47.6,17,.4,5,7,.2,math.atan2(y,x),T,2)
    for x,y in ring4(4,0):m.X(x*32,y*32,40,6,6,3,1.6,math.atan2(y,x),GR);m.X(x*37.6,y*37.6,41,.4,4.4,1.2,.2,math.atan2(y,x),T,2)
    return m.L
def gpt_sup(f):
    m=B(.3);base_w(m,27,3);m.Y(0,0,4,15,17,GR);m.E(0,0,21,16,16,23,W);m.R(0,0,16,16.4,.7,T,2);m.R(0,0,28,14.5,.55,T,2);m.R(0,0,36,10,.5,GR);m.C(0,0,40,0,0,50,1.2,.2,W);m.S(0,0,50,1.5,T,2);return m.L
def gpt_bar(f):
    m=B(.3);base_w(m,43,4)
    for q in(-1,1):m.X(4,q*27,28,17,9,24,4,0,W);m.X(21.4,q*27,28,.6,5.5,18,.3,0,T,2);m.X(4,q*27,56,14,7,4,2,0,GR)
    m.X(-26,0,26,11,18,21,4,0,W);m.R(16,0,34,16,1.8,GR,1,vert=True);m.R(16,0,34,13.2,.7,T,2,vert=True);m.E(16,0,34,1.2,12,12,T,2,em=1.2,sk=.1);m.C(-26,0,48,-26,0,76,3.5,.4,W);m.S(-26,0,77,2.2,T,2);pyl(m,37,26);return m.L
def gpt_tech(f):
    m=B(.3);base_w(m,43,4);m.Y(0,0,5,40,20,W);m.X(0,0,24,27,8,14,3,0,GR);m.X(0,0,24,8,27,14,3,0,GR);m.R(0,0,40,20,.8,T,2);m.E(0,0,44,22,22,18,W);m.X(20,0,50,4,10,1,.4,0,T,2);m.R(0,0,70,24,1.3,GR);m.R(0,0,70,20,1.2,T,2,vert=True);m.R(0,0,70,20,1.2,W,1,vert=True,rot=1.57);m.S(0,0,70,8.5,T,2);m.C(0,0,76,0,0,102,1.8,.2,W);pyl(m,37,30);return m.L
def gpt_twr(f):
    m=B(.3);base_w(m,26,3);m.Y(0,0,3,10,17,GR);m.C(0,0,10,0,0,34,10,5,W);for_=0
    for x,y in ring4(3,0):m.C(x*8,y*8,12,x*17,y*17,3,3.2,1.8,W);m.C(x*6,y*6,30,x*15,y*15,52,1.7,.3,W)
    m.R(0,0,44,12,1.2,GR);m.R(0,0,44,11.6,.55,T,2,vert=True);m.S(0,0,44,6.5,T,2);m.C(0,0,50,0,0,56,1,.25,W);return m.L
def gpt_ext(f):
    m=B(.3);m.R(0,0,4,42,4,GR);m.R(0,0,8,40,.8,T,2);m.X(0,0,3,31,31,3.6,2,0,W);m.C(0,0,6,0,0,44,21,8,W);m.R(0,0,30,14.5,.8,T,2);m.Y(0,0,42,50,8.5,GM);m.E(0,0,52,8,8,6,T,2,em=1.2,sk=.3)
    for x,y in ring4(4):m.C(x*36,y*36,9,x*14,y*14,34,3,2.4,GR);m.R(x*36,y*36,9,5,.8,T,2)
    return m.L

# --- Gemini 건물 ---
def base_g(m,R,h=2.6):
    m.X(0,0,h/2,R,R,h/2,.5,0,GM)
    for s in(-1,1):
        for i in range(int(R/6)):m.X(-R+4+i*12,s*(R-1),h+.1,3,.8,.12,.05,0,HZ);m.X(s*(R-1),-R+4+i*12,h+.1,.8,3,.12,.05,0,HZ)
def stack(m,x,y,z0,z1,r):
    m.Y(x,y,z0,z1,r,ST);m.R(x,y,z1,r,.6,DK);m.R(x,y,z0+(z1-z0)*.6,r+.4,.42,HZ);m.S(x,y,z1+.2,r*.65,BLK)
def pipe(m,a,b,r=1.2,c=ST):
    m.C(a[0],a[1],a[2],b[0],b[1],b[2],r,r,c)
def windows(m,x,y0,y1,z,n,h=1.1):
    for i in range(n):m.X(x,y0+(y1-y0)*(i+.5)/n,z,.3,(y1-y0)/n*.32,h,.1,0,LENS,2)
def gem_hq(f):
    m=B(.16);base_g(m,62);m.X(-4,0,18,44,48,15,1.6,0,T);m.X(-8,0,41,30,34,8,1.4,0,GM);m.X(-10,0,56,18,20,7,1.2,0,ST);windows(m,40.3,-40,40,22,12,3.6);windows(m,22.3,-28,28,42,8,2.4)
    stack(m,-38,32,33,74,6);stack(m,-38,18,33,66,5);stack(m,-38,-30,33,70,6);m.Y(14,-30,49,58,1.4,DK);m.S(14,-30,66,10,ST);m.S(17,-30,68.5,8.6,BLK);m.C(14,-30,66,25,-30,76,.6,.3,ST);m.S(25,-30,76.5,1.2,WARN,2)
    m.X(50,0,6,10,22,3.6,1,0,HZ);m.X(53,0,9.8,6,16,.3,.1,0,BLK);m.X(44,0,18,1.2,20,10,.4,0,DK);pipe(m,(-34,44,22),(30,44,22),2);pipe(m,(-34,-44,28),(30,-44,28),2);m.X(-10,0,65,7,7,3,.8,0,DK);m.C(-10,0,68,-10,0,90,.8,.25,ST);m.S(-10,0,90,1.4,WARN,2);return m.L
def gem_sup(f):
    m=B(.16);base_g(m,29)
    for q in(-1,1):m.C(-16,q*12,14,16,q*12,14,10.6,10.6,ST);m.R(-11,q*12,14,10.8,.55,HZ,1,vert=True);m.R(11,q*12,14,10.8,.55,HZ,1,vert=True);m.X(-20,q*12,7,3,6,4,.5,0,DK);m.X(20,q*12,7,3,6,4,.5,0,DK)
    m.X(0,0,26,20,2,.5,.15,0,DK);m.X(0,0,31,6,6,6,1,0,T);m.X(6.4,0,31,.3,3.2,3,.1,0,LENS,2);m.C(0,0,37,0,0,42,.5,.2,ST);return m.L
def gem_bar(f):
    m=B(.16);base_g(m,45);m.X(-2,0,20,36,36,18,1.2,0,T)
    for i in range(5):m.X(-30+i*14,0,40,5.6,35,4,.5,0,ST);m.X(-26.5+i*14,0,44,1,35,1.2,.2,0,LENS,2)
    m.X(34.7,0,16,.8,21,14,.3,0,DK);
    for i in range(6):m.X(35.6,0,5+i*4.2,.3,20,1.2,.1,0,HZ if i%2 else GM)
    windows(m,34.7,-34,34,32,10,1.6);stack(m,-30,28,38,64,5);m.X(26,0,47,4,38,2,.6,0,GM);m.X(26,-16,41,3,4,5,.6,0,HZ);m.C(26,-16,37,26,-16,25,.3,.3,DK);m.X(0,38,18,20,5,14,1,0,GM);pipe(m,(-34,-40,22),(34,-40,22),2.4);return m.L
def gem_tech(f):
    m=B(.16);base_g(m,45);m.X(0,0,8,36,36,6,1.2,0,GM)
    for y in(-22,0,22):
        m.X(-14,y,42,12,7.6,28,1,0,T if y==0 else ST);m.X(-1.7,y,42,.3,5.6,24,.1,0,BLK)
        for i in range(8):m.X(-1.4,y-3+6*(i%2),18+i*6,.25,1.4,.55,.08,0,LENS if i%3 else WARN,2)
    m.X(22,0,26,12,28,20,1.2,0,GM);windows(m,34.3,-26,26,28,8,4);m.S(22,0,54,13,ST);m.S(27,0,57,11.2,BLK);m.Y(22,0,44,50,2.5,DK);m.C(22,0,66,22,0,80,.6,.25,ST);m.S(22,0,80,1.3,T,2);pipe(m,(-2,32,14),(-2,44,14),2);return m.L
def gem_twr(f):
    m=B(.16);base_g(m,29);m.X(0,0,14,20,20,11,1.5,0,T)
    for s in(-1,1):m.X(s*20.1,0,18,.3,12,1.5,.1,0,BLK);m.X(0,s*20.1,18,12,.3,1.5,.1,0,BLK)
    m.Y(0,0,25,31,11,DK);m.tur=True;m.X(0,0,36,13,12,6,1.6,0,ST);m.X(13.4,0,38,.3,7,1.1,.1,0,LENS,2)
    for q in(-1,1):m.C(12,q*5.5,34,30,q*5.5,34,1.4,1.1,DK);m.C(26,q*5.5,34,30.4,q*5.5,34,1.9,1.9,GM)
    m.C(-6,5,42,-6,5,52,.4,.2,ST);m.S(-6,5,52,1,WARN,2);return m.L
def gem_ext(f):
    m=B(.16);m.X(0,0,3,44,44,3,1,0,GM);m.Y(0,0,5,22,17,ST);m.R(0,0,16,17.3,.8,HZ);m.X(0,0,28,8,8,7,1,0,T);m.X(0,0,10,36,3,6,1,0,DK) if False else None
    for x,y in ring4(4):m.C(x*30,y*30,5,x*6,y*6,62,1.6,1.1,ST);m.C(x*18,y*18,33,-x*(-1)*6,y*6,36,.5,.5,DK) if False else None
    for z in(26,42):m.R(0,0,z,20-(z-26)*.65,.7,DK)
    m.X(0,0,63,6,6,3,.8,0,ST);m.C(0,0,28,0,0,60,2.4,2.4,GM);pipe(m,(-16,12,11),(-40,12,9),2.8);pipe(m,(16,-12,11),(40,-12,9),2.8);m.S(0,0,66.5,1.4,WARN,2);return m.L

# --- Claude 건물 ---
def root(m,R,n,sd=3):
    for i in range(n):
        a=i/n*TAU+sd*.37;x,y=math.cos(a),math.sin(a);r2=R*(1+.14*math.sin(i*2.7))
        m.C(x*R*.55,y*R*.55,9,x*R*.82,y*R*.82,5,4.2,3.1,CD,sk=2);m.C(x*R*.82,y*R*.82,5,x*r2,y*r2,.5,3.2,.7,CD,sk=1.4)
def rib(m,R,z0,z1,n):
    for i in range(n):
        a=i/n*TAU+.2;x,y=math.cos(a),math.sin(a);m.C(x*R,y*R,z0,x*R*.92,y*R*.92,(z0+z1)/2,3,2.2,CR,sk=.8);m.C(x*R*.92,y*R*.92,(z0+z1)/2,x*R*.34,y*R*.34,z1,2.2,.5,CR,sk=.6)
def cla_hq(f):
    m=B(2.);root(m,68,16);m.E(0,0,24,54,54,34,CL,sk=3);m.E(-7,5,58,32,29,28,CD,sk=2);m.E(7,-8,82,12,12,12,T,2,em=.9,sk=1);rib(m,50,16,76,10)
    for x,y in ring4(5,.4):m.E(x*38,y*38,28,8,8,10,T,2,em=.8,sk=1);m.R(x*38,y*38,28,8,1.4,CD,1,vert=True,rot=math.atan2(y,x)+1.57,sk=.8)
    m.E(40,0,16,12,16,11,BLK,sk=.8);
    for q in(-1,1):
        for i in range(4):m.C(46,q*(3+i*3.6),28-i*.6,54,q*(3+i*3.6),15-i*.5,1.8,.2,CR,sk=.15);m.C(46,q*(3+i*3.6),5+i*.5,54,q*(3+i*3.6),16+i*.3,1.5,.2,CR,sk=.15)
    return m.L
def cla_sup(f):
    m=B(1.4);root(m,31,9);m.E(0,0,24,19,19,24,CL,sk=1.5)
    for z in(10,18,26,34):m.R(0,0,z,19*math.sqrt(max(.1,1-((z-24)/24)**2))+.2,1.1,CD,sk=.5)
    m.E(0,0,48,8,8,7,T,2,em=.8,sk=.7);rib(m,14,40,58,6);return m.L
def cla_bar(f):
    m=B(1.8);root(m,47,13);m.E(-4,0,18,38,38,22,CD,sk=2.5);m.E(-14,0,46,18,20,22,CL,sk=2)
    for x,y,z,r in((26,-18,17,12),(14,22,16,11),(-24,24,22,10),(-26,-24,20,10)):
        m.E(x,y,z,r,r,r*1.15,T,2,em=.8,sk=.8);m.R(x,y,z,r*.9,.75,CD,sk=.4);m.R(x,y,z,r*.9,.7,CD,1,vert=True,sk=.4)
    m.E(31,8,20,9,14,10,BLK,sk=.8)
    for i in range(5):m.C(38,8-8+i*4,29,43,8-8+i*4,20,1.6,.2,CR,sk=.15)
    rib(m,18,50,74,5);return m.L
def cla_tech(f):
    m=B(1.6);root(m,47,12);m.E(0,0,17,36,36,18,CL,sk=2.5);m.E(0,0,34,20,20,9,CD,sk=2)
    for x,y,z,r in((0,0,42,13),(-13,8,38,8),(13,8,38,8),(0,-14,38,8)):m.E(x,y,z,r,r,r*.62,T,2,em=.9,sk=.8)
    for x,y in ring4(5,.3):
        ax,ay,az=x*26,y*26,62
        m.C(x*20,y*20,26,ax,ay,az,7,4.4,CD,sk=2);m.C(ax,ay,az,ax+x*9+y*6,ay+y*9-x*6,az+20,3.8,.6,CR,sk=.5);m.C(ax,ay,az,ax+x*9-y*7,ay+y*9+x*7,az+15,3.1,.5,CR,sk=.5);m.S(ax,ay,az+1,2.7,T,2)
    for x,y in ring4(7,0):m.C(x*30,y*30,20,x*40,y*40,42+3*x,3.4,.35,CR,sk=.6)
    return m.L
def cla_twr(f):
    m=B(1.3);root(m,30,8);m.E(0,0,10,20,20,11,CD,sk=1.8);m.C(0,0,14,0,0,42,10.5,7,CL,sk=1.5)
    for z in(20,28,36):m.R(0,0,z,9.8-(z-20)*.14,1.1,CD,sk=.4)
    m.tur=True;m.E(4,0,47,10,9,8,CD,sk=1);m.S(11,0,48,3.4,T,2);m.R(12,0,48,4.3,.9,CR,1,vert=True,sk=.2);m.tur=False
    for x,y in ring4(6,0):m.C(x*7,y*7,50,x*15,y*15,57,1.5,.2,CR,sk=.2)
    return m.L
def cla_ext(f):
    m=B(1.4);root(m,47,11);m.R(0,0,6,34,8,CD,sk=2);m.Y(0,0,6,26,18,CL,sk=1.5);m.E(0,0,30,22,22,16,CL,sk=2);m.E(0,0,45,10,10,8,T,2,em=1,sk=.6)
    for x,y in ring4(6,0):m.C(x*17,y*17,34,x*27,y*27,52,3.2,.5,CD,sk=.8);m.E(x*40,y*40,10,5.6,5.6,6,T,2,em=.8,sk=.6);m.C(x*34,y*34,8,x*17,y*17,25,2.4,2,BN,sk=1)
    return m.L


# --- 신규 고급 유닛 ---
def gpt_lance(f):
    m=B(.16);hleg(m,f,19,4.6,9,9,W,W,GM,.95,col_k=T)
    gpt_shell(m,20,6.6);gpt_head(m,38,.9)
    for q in(-1,1):m.X(0,q*8.6,32.6,3.4,2.6,1.5,1,0,W);m.C(0,q*9,30,4,q*9.6,25,1.7,1.5,GM)
    m.X(2,-11,30,6,2.2,3,1,0,W);m.C(-6,-11,31,26,-11,31,1.7,1.2,GR);m.C(26,-11,31,33,-11,31,.9,.6,W);m.R(10,-11,31,2.6,.55,T,2,vert=True,rot=1.57);m.R(18,-11,31,2.3,.5,T,2,vert=True,rot=1.57);m.S(-8,-11,31,2.4,T,2)
    if f.get('atk'): m.S(34,-11,31,3,T,2)
    return m.L
def gpt_wing(f):
    m=B(.15);Z=30;m.C(-12,0,Z,14,0,Z,3.4,1.2,W);m.E(3,0,Z+2.4,4.6,2.4,1.6,T,2,em=1.2,sk=.2)
    for q in(-1,1):m.X(-3,q*8.5,Z,7.5,6,.7,.6,q*-.45,W);m.X(-5,q*13,Z+.3,4.6,.5,.4,.2,q*-.45,T,2);m.C(-11,q*3.4,Z,-15,q*3.8,Z,1.5,1.2,GM);m.S(-15.6,q*3.8,Z,1.2,T,2);m.X(-9,q*2.2,Z+3,3,.4,2.6,.3,q*.3,W)
    return m.L
def gpt_ark(f):
    m=B(.22);Z=52;m.E(0,0,Z,40,16,9,W);m.X(-6,0,Z+7,22,10,4,2.4,0,GR);m.X(10,0,Z+10,12,7,3,2,0,W);m.X(22.6,0,Z+10,.6,4.4,1,.3,0,T,2);m.R(-4,0,Z,17,.9,T,2,vert=True,rot=1.57);m.R(-4,0,Z,21,1.4,W,1,vert=True,rot=1.57)
    for q in(-1,1):
        m.X(-10,q*18,Z-2,14,6,1.4,1,q*-.12,W);m.C(-28,q*26,Z-2,6,q*26,Z-2,4.4,3,W);m.R(-26,q*26,Z-2,4.6,.6,T,2,vert=True);m.S(-29,q*26,Z-2,3.6,T,2);m.X(-4,q*27,Z+4.4,4,.6,3.6,.6,0,GR)
        m.C(14,q*8,Z-7,30,q*8,Z-7,1.3,1,GM);m.S(30.5,q*8,Z-7,1.5,T,2)
    m.S(-40,0,Z,5.2,T,2);m.C(36,0,Z,48,0,Z,3.6,.6,GR);return m.L
def gem_aa(f):
    m=B(.12)
    for q in(-1,1):track(m,-15,14,q*12,5,3,4.4)
    m.X(-1,0,12,14,9,3.6,1.2,0,T);m.X(-10,0,17,4,7,2,.6,0,GM);m.Y(0,0,15,20,6,DK)
    m.tur=True;m.X(0,0,23,7,7,3,1,0,ST);m.X(3,0,29,8,7.4,3.6,1.1,0,GM)
    for q in(-1,1):
        for z in(27.6,30.6):m.C(8,q*3.6,z,12,q*3.6,z,1.1,1.1,BLK);m.S(12.2,q*3.6,z,.8,WARN,2)
    m.C(-3,5,26,-3,5,36,.4,.2,ST);m.S(-3,5,36,1,WARN,2);m.tur=False;return m.L
def gem_mech(f):
    m=B(.14);hleg(m,f,26,9,13,13,GM,ST,DK,1.75)
    m.X(0,0,30,7,11,4,1.2,0,DK);m.X(0,0,40,10,14,8,1.8,0,T);m.X(10.5,0,41,.6,6,3,.2,0,ST);m.X(11,0,42,.3,3.6,1,.1,0,LENS,2);m.X(-9,0,43,4,11,7,1,0,GM);stack(m,-12,7,44,56,2.2);stack(m,-12,-7,44,54,2)
    m.X(2,0,50.5,5,5,2.6,.8,0,ST);m.X(7,0,51,.4,3.4,.8,.1,0,LENS,2)
    for q in(-1,1):
        m.X(0,q*17,44,5,4,4,1.1,0,T);m.C(0,q*18,41,6,q*19,34,2.6,2.2,GM);m.X(10,q*19,33,7,2.6,2.6,.8,0,ST)
        for z in(32,34.6):m.C(16,q*19,z,26,q*19,z,.8,.8,DK)
        m.X(0,q*17.6,48.6,4.4,3,.4,.1,0,HZ)
    if f.get('atk'):
        for q in(-1,1):m.S(27,q*19,33.3,2.5,(1,.8,.4),2)
    return m.L
def gem_bomb(f):
    m=B(.14);Z=44;m.X(0,0,Z,18,7,4.6,2,0,T);m.X(14,0,Z+1,6,5,3.2,1.6,0,ST);m.X(19,0,Z+1.6,.4,3.4,1.2,.15,0,LENS,2);m.X(-3,0,Z-5.4,10,4,1.4,.5,0,DK)
    for q in(-1,1):
        m.X(-2,q*16,Z,8,11,1.1,.8,q*-.18,ST);m.X(-2,q*27,Z+.4,6,.8,.5,.2,q*-.18,HZ);m.C(-6,q*12,Z-2.6,10,q*12,Z-2.6,2.4,2.2,GM);m.S(-7,q*12,Z-2.6,1.8,WARN,2);m.X(-15,q*5,Z+5,3,.5,4,.5,q*.2,ST)
        for x in(-4,4):m.C(x,q*3,Z-7,x+5,q*3,Z-7,1.4,1.1,BLK)
    return m.L
def cla_leech(f):
    m=B(1.1);bleg(m,f,6,9,5.5,[7,0,-7],9,4.2,3,3.8,CD,CR,1)
    segs(m,2,-14,10,7,5.4,3,.75)
    m.E(8,0,13,6.2,6,5,CD,sk=.6);m.C(6,0,14,9,0,26,3.6,3.2,CL,sk=.9)
    for i in range(7):
        a=i/7*TAU;m.C(9,0,27,9+math.cos(a)*7,math.sin(a)*7,31,1.3,.3,CR,sk=.3)
    m.E(9,0,28,4.2,4.2,1.8,CD,sk=.4);m.S(9,0,28.8,2.4,T,2)
    for q in(-1,1):m.S(12,q*2.6,14.6,.8,T,2);m.C(12,q*3.4,11,18,q*2.6,8,1,.15,CR,sk=.15)
    if f.get('atk'): m.S(9,0,32,3,T,2)
    return m.L
def cla_brood(f):
    m=B(1.1);bleg(m,f,8,10,10,[15,5,-5,-15],12,5,3.6,4.6,CD,CR,1.45)
    m.E(0,0,14,22,13,10,CD,sk=1.2)
    for x,s in((14,11),(4,13),(-7,13),(-17,10.5)):m.E(x,0,16,6.4,s,s*1.05,CL,sk=.6)
    for x,y,r in((-2,0,9),(-12,5,6.4),(-12,-5,6.4),(7,5,5.6),(7,-5,5.6)):m.E(x,y,26+r*.35,r,r,r*.95,T,2,em=.8,sk=.6);m.R(x,y,26+r*.35,r*.92,.65,CD,sk=.3)
    m.E(25,0,14,7.6,9,6.4,CD,sk=.7)
    for q in(-1,1):m.S(31,q*3.8,17,1,T,2);m.C(30,q*6,10,40,q*7.4,8,2.6,1.2,CL,sk=.4);m.C(40,q*7.4,8,45,q*2.6,9,1.2,.15,CR,sk=.15)
    if f.get('atk'): m.S(-2,0,38,4.6,T,2)
    return m.L
def cla_wing(f):
    m=B(1.);Z=34;segs(m,6,-18,Z,4.2,3.6,4,.6);m.E(10,0,Z,5,4.4,3.6,CD,sk=.5)
    for q in(-1,1):
        for i,(x,l,w) in enumerate(((4,17,5.4),(-3,15,4.6))):m.E(x,q*(l*.62),Z+1.6+i,l*.42,l*.62,.55,BN,rot=q*(.25+i*.25),sk=.3);m.C(x,q*2,Z+1,x-3,q*(l*1.16),Z+2+i,.7,.2,CD,sk=.3)
        m.S(12.6,q*2.2,Z+1,.85,T,2);m.C(13,q*1.6,Z-1.6,18,q*.8,Z-3,.7,.12,CR,sk=.15)
    m.C(-18,0,Z,-24,0,Z+1,1.4,.2,CR,sk=.2);return m.L

# --- 신규 건물 ---
def gpt_adv(f):
    m=B(.3);base_w(m,43,4)
    for x,y in ring4(4):m.X(x*30,y*30,20,4,4,16,2,math.atan2(y,x),W);m.X(x*30,y*30,40,3,3,4,1.4,math.atan2(y,x),GR);m.S(x*30,y*30,46,2.6,T,2)
    m.Y(0,0,5,16,24,GR);m.R(0,0,16,24,.8,T,2);m.R(0,0,46,26,1.6,W);m.R(0,0,46,22,.7,T,2);m.R(0,0,36,17,1.2,W,1,vert=True);m.R(0,0,36,17,1.2,W,1,vert=True,rot=1.57);m.E(0,0,36,9,9,9,T,2,em=1.3,sk=.2);m.C(0,0,16,0,0,26,5,3,W);return m.L
def gpt_aura(f):
    m=B(.3);base_w(m,27,3);m.Y(0,0,3,10,14,GR)
    for x,y in ring4(3,.5):m.C(x*12,y*12,6,x*5,y*5,34,2.4,1.2,W)
    m.S(0,0,36,6.4,T,2);m.R(0,0,36,9,.8,W);m.R(0,0,22,15,.5,T,2);m.R(0,0,10,18,.6,T,2);return m.L
def gem_adv(f):
    m=B(.16);base_g(m,45);m.X(-6,0,22,30,36,20,1.4,0,T)
    for i in range(4):m.X(-26+i*14,0,44,5,37,2,.6,0,ST)
    m.X(25,0,14,.8,24,12,.3,0,DK)
    for i in range(5):m.X(26,0,4+i*5,.3,22,1.4,.1,0,HZ if i%2 else GM)
    for q in(-1,1):m.Y(30,q*34,2,62,2.6,ST);m.R(30,q*34,62,3,.7,HZ)
    m.X(30,0,63,3,36,2,.7,0,ST);m.X(30,10,57,4,4,4,.8,0,HZ);m.C(30,10,53,30,10,40,.4,.4,DK);m.X(30,10,38,2.6,1.6,1.2,.3,0,DK)
    windows(m,24.3,-30,30,32,9,1.6);stack(m,-30,-30,42,66,4);return m.L
def gem_aura(f):
    m=B(.16);base_g(m,29);m.X(0,0,12,22,14,10,1.4,0,T);m.X(0,0,24,22,15,2,.6,0,ST);m.X(22.5,0,11,.5,10,8,.2,0,DK)
    for q in(-1,1):m.C(-8,q*10,26,6,q*6,34,1.6,1.2,HZ);m.C(6,q*6,34,14,q*3,28,1.2,.8,HZ);m.S(14.4,q*3,27.4,1.3,WARN,2)
    m.Y(-14,0,26,34,3,ST);m.S(-14,0,35,2,LENS,2);return m.L
def cla_adv(f):
    m=B(1.8);root(m,47,13);m.E(0,0,16,36,36,18,CD,sk=2.5)
    for x,y,z,r in((0,0,40,16),(-18,12,30,11),(16,14,28,10),(4,-18,30,11)):
        m.E(x,y,z,r*.9,r*.9,r*1.25,CL,sk=1.6)
        for k in(-.5,0,.5):m.R(x,y,z+k*r*1.4,r*.86*math.sqrt(1-k*k*.8),.8,CD,sk=.4)
        m.E(x,y,z+r*1.1,r*.32,r*.32,r*.22,T,2,em=.9,sk=.4)
    rib(m,30,10,44,8);return m.L
def cla_aura(f):
    m=B(1.4);root(m,31,9);m.R(0,0,4,20,5.5,CD,sk=1.5);m.Y(0,0,1,5,18,T,2,sk=.6) if False else None;m.E(0,0,5,17,17,2.2,T,2,em=.7,sk=.5)
    for x,y in ring4(6,.2):m.C(x*20,y*20,4,x*15,y*15,20,2.6,.6,CR,sk=.5);m.E(x*12,y*12,7,3,3,3.4,T,2,em=.8,sk=.5)
    return m.L
# --- 자원과 장식 ---
import random as _rnd
RK=(.17,.15,.13);RK2=(.11,.1,.09);CG=(.22,.96,.72);CG2=(.07,.4,.32);GOLD=(.85,.62,.2);DLB=(.3,.85,1.)
def res_c(sd):
    def f(_f):
        R=_rnd.Random(sd*97+5);m=B(.12)
        for i in range(5):m.E(R.uniform(-24,24),R.uniform(-9,9),0,R.uniform(7,12),R.uniform(5,8),R.uniform(2.5,4.5),RK if i%2 else RK2,sk=1.2)
        m.X(R.uniform(-6,6),0,1.6,16,7,1.1,.4,R.uniform(-.2,.2),(.05,.06,.07));m.X(0,0,2.8,13,.5,.2,.1,0,GOLD);m.X(-5,2.5,2.8,.5,3,.2,.1,0,GOLD);m.X(6,-2.5,2.8,.5,3,.2,.1,0,GOLD)
        n=R.randint(6,8)
        for i in range(n):
            x=-25+i*50/(n-1)+R.uniform(-3,3);y=R.uniform(-6,6);core=i%3!=1;L=R.uniform(26,42) if core else R.uniform(14,24);r=R.uniform(4.2,6) if core else R.uniform(2.6,3.8)
            lx=R.uniform(-.35,.35)+x*.006;ly=R.uniform(-.3,.3)+y*.03
            m.K(x,y,-2,x+lx*L,y+ly*L,-2+L,r,R.uniform(.22,.34),R.uniform(0,1),CG if core else CG2,2 if core else 1,sk=.05,em=R.uniform(.45,.75) if core else None)
        for i in range(5):
            x=R.uniform(-28,28);y=R.choice([-1,1])*R.uniform(8,13);L=R.uniform(6,11)
            m.K(x,y,-1,x+R.uniform(-3,3),y*1.25,-1+L,R.uniform(1.4,2.2),.35,R.uniform(0,1),CG2,1,sk=.05)
        return m.L
    return f
def res_d(f):
    m=B(.3);R=_rnd.Random(77)
    for i in range(14):
        a=i/14*TAU+R.uniform(-.1,.1);rr=R.uniform(50,56);m.E(math.cos(a)*rr,math.sin(a)*rr,0,R.uniform(7,11),R.uniform(6,9),R.uniform(3,6),RK if i%2 else RK2,rot=a,sk=1.5)
    for k,a in enumerate((.6,2.7,4.6)):
        x,y=math.cos(a),math.sin(a);m.Y(x*58,y*58,0,22+k*6,4.2,ST);m.R(x*58,y*58,22+k*6,4.2,.7,DK);m.S(x*58,y*58,23+k*6,2.6,DLB,2,em=1.)
        m.C(x*56,y*56,9,x*38,y*38,3,1.8,1.8,GM);m.R(x*47,y*47,6,2.4,.5,HZ,1,vert=True,rot=a+1.57)
    m.C(-30,44,4,-6,52,6,1.4,1.4,DK);m.C(28,-46,4,46,-30,5,1.4,1.4,DK);return m.L
def dd_pylon(f):
    m=B(.2);C2=(.3,.32,.34)
    for q in(-1,1):
        m.C(-30,q*7,2,26,q*4,10,1.3,1.1,C2);m.C(-30,-q*7,2,26,-q*4,22,1.2,1,C2)
    for i in range(8):
        x=-28+i*7.4;m.C(x,-7,2+i*1,x+3.7,7,2+i*1+10,.7,.7,C2);m.C(x,7,2+i*1,x+3.7,-7,2+i*1+10,.7,.7,C2)
    m.C(26,0,16,38,0,18,1.2,1,C2);m.X(38,0,18,1,9,1,.3,0,C2);m.C(38,8,18,40,9,10,.4,.3,GM);m.C(-34,0,1,-26,0,1,6,6,RK);return m.L
def dd_dish(f):
    m=B(.2);m.X(0,0,4,10,10,4,1,.5,GM);m.C(0,0,6,4,0,18,2.2,1.8,ST);m.E(8,0,26,3,17,15,(.62,.64,.66));m.R(9.5,0,26,16,1,ST,1,vert=True);m.C(9,0,26,22,0,26,.8,.5,DK);m.S(22.6,0,26,1.4,(1,.35,.2),2,em=.6)
    m.E(-6,8,1,8,6,2.5,RK,sk=1);return m.L
def dd_shard(f):
    m=B(.12);R=_rnd.Random(9);m.E(0,0,0,9,7,2.6,RK2,sk=1)
    for i in range(4):x=R.uniform(-6,6);y=R.uniform(-4,4);L=R.uniform(8,15);m.K(x,y,-1,x*1.5,y*1.5,-1+L,R.uniform(1.6,2.6),.3,R.uniform(0,1),CG if i==0 else CG2,2 if i==0 else 1,sk=.05,em=.5 if i==0 else None)
    return m.L

DESIGN={'gpt_guard':gpt_guard,'gpt_arch':gpt_arch,'gpt_tf':gpt_tf,'gem_text':gem_text,'gem_vision':gem_vision,'cla_swarm':cla_swarm,'cla_w':cla_w,'cla_scout':cla_scout,'cla_spine':cla_spine,'cla_beast':cla_beast,'cla_acid':cla_acid,'cla_heal':cla_heal,
'gpt_w':gpt_w,'gpt_scout':gpt_scout,'gpt_heal':gpt_heal,'gpt_ram':gpt_ram,'gpt_ship':gpt_ship,'gpt_trans':gpt_trans,'gem_w':gem_w,'gem_scout':gem_scout,'gem_drone':gem_drone,'gem_heal':gem_heal,'gem_audio':gem_audio,'gem_how':gem_how,'gem_trans':gem_trans,'cla_spore':cla_spore,'cla_carry':cla_carry,
'gpt_hq':gpt_hq,'gpt_sup':gpt_sup,'gpt_bar':gpt_bar,'gpt_tech':gpt_tech,'gpt_twr':gpt_twr,'gpt_ext':gpt_ext,'gem_hq':gem_hq,'gem_sup':gem_sup,'gem_bar':gem_bar,'gem_tech':gem_tech,'gem_twr':gem_twr,'gem_ext':gem_ext,'cla_hq':cla_hq,'cla_sup':cla_sup,'cla_bar':cla_bar,'cla_tech':cla_tech,'cla_twr':cla_twr,'cla_ext':cla_ext,'gpt_lance':gpt_lance,'gpt_wing':gpt_wing,'gpt_ark':gpt_ark,'gem_aa':gem_aa,'gem_mech':gem_mech,'gem_bomb':gem_bomb,'cla_leech':cla_leech,'cla_brood':cla_brood,'cla_wing':cla_wing,'gpt_adv':gpt_adv,'gpt_aura':gpt_aura,'gem_adv':gem_adv,'gem_aura':gem_aura,'cla_adv':cla_adv,'cla_aura':cla_aura,'res_c0':res_c(1),'res_c1':res_c(2),'res_c2':res_c(3),'res_d':res_d,'dd_pylon':dd_pylon,'dd_dish':dd_dish,'dd_shard':dd_shard}
