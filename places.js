'use strict';
/* =====================================================================
   NAMED PLACES (hand-placed on this compressed map) + labels + traffic
   ===================================================================== */
const LBL=[];function label(name,x,y,z,s){const t=cvs(512,96,(g,w,h)=>{g.clearRect(0,0,w,h);g.font='800 44px Arial';const tw=Math.min(w-16,g.measureText(name).width+46);g.fillStyle='rgba(16,24,48,.88)';rr(g,(w-tw)/2,10,tw,76,38);g.fill();g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.fillText(name,w/2,50,w-44);});
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false})),k=s||1;sp.scale.set(170*k,32*k,1);sp.position.set(x,y,z);world.add(sp);sp.userData.rail=Math.min(nearRoute(x,z)[0],nearMain(x,z)[0])<260;LBL.push(sp);return sp;}
function green(x,z,rx,rz,c){const m=new THREE.Mesh(new THREE.CircleGeometry(1,32),flat(c||'#4f7a3a',1.6));m.rotation.x=-Math.PI/2;m.scale.set(rx,rz,1);m.position.set(x,.12,z);world.add(m);return m;}
function dog(x,z,c,ry){const g=new THREE.Group(),m=M(c,{roughness:.9});box(.5,.5,1.2,m,0,.75,0,g);box(.42,.42,.5,m,0,1.05,.75,g);box(.16,.3,.1,m,0,.95,-.68,g).rotation.x=-.6;[[.18,.4],[-.18,.4],[.18,-.4],[-.18,-.4]].forEach(a=>box(.14,.55,.14,m,a[0],.27,a[1],g));g.position.set(x,0,z);g.rotation.y=ry||0;g.scale.setScalar(1.5);world.add(g);}
function buildPlaces(){
  const brick=bt[2],lime=new THREE.MeshStandardMaterial({color:C('#d8d0bd'),roughness:.85}),wh=M('#f1efe8',{roughness:.7}),slate=M('#3a3d44',{roughness:.8}),col=(x,y,z,h,r,m)=>cyl(r,r,h,m||lime,x,y,z,world,10);
  /* North End + Old North Church */
  for(let i=0;i<5;i++)for(let j=0;j<5;j++){const x=-10+i*36+rnd(-3,3),z=-890+j*36+rnd(-3,3);if(Math.hypot(x-92,z+800)<26||plDist(x,z,TUN_I93)<27)continue;sbox(rnd(22,28),rnd(11,17),rnd(22,28),x,7,z,rnd(-.08,.08),brick,14);}
  sbox(12,13,26,92,6.5,-800,0,brick,14);box(6,26,6,wh,92,13,-816,world);box(4.6,8,4.6,wh,92,30,-816,world);const sp=cyl(0,3,18,wh,92,43,-816,world,8);label('North End · Old North Church',92,70,-810);
  /* Museum of Science on the Charles River dam */
  box(230,3,26,M('#8d8a84'),-430,.5,-925,world).rotation.y=-.42;sbox(84,16,38,-440,10,-925,-.42,new THREE.MeshStandardMaterial({color:C('#c9b99a'),roughness:.85}),14);sbox(26,34,22,-405,19,-940,-.42,bt[0],14);
  {const d=new THREE.Mesh(new THREE.SphereGeometry(15,24,12,0,6.283,0,Math.PI/2),M('#c9ced6',{metalness:.7,roughness:.3}));d.position.set(-470,18,-912);world.add(d);}label('Museum of Science',-440,62,-925);
  /* arena by the bridge */
  sbox(78,22,54,-330,11,-840,-.42,bt[0],14);box(80,2.5,56,M('#f2c230'),-330,23,-840,world).rotation.y=-.42;label('TD Garden',-330,48,-840,.8);
  /* Bunker Hill Monument */
  green(-120,-1215,60,46);{const o=cyl(1.6,4,62,M('#b9b5ac',{roughness:.9}),-120,33,-1215,world,4);o.rotation.y=Math.PI/4;const t=cyl(0,1.6,5,M('#b9b5ac'),-120,66.5,-1215,world,4);t.rotation.y=Math.PI/4;}label('Bunker Hill Monument',-120,84,-1215,.9);
  /* Boston Common + Public Garden */
  green(-530,-400,105,82);green(-640,-330,48,56,'#57863f');{const w=new THREE.Mesh(new THREE.CircleGeometry(1,24),water2());w.material.polygonOffsetFactor=-4;w.material.polygonOffsetUnits=-4;w.rotation.x=-Math.PI/2;w.scale.set(26,12,1);w.position.set(-640,.16,-330);world.add(w);}
  {const L=[];for(let i=0;i<70;i++){const a=rnd(0,6.283),r=Math.sqrt(Math.random());L.push([-530+Math.cos(a)*r*98,-400+Math.sin(a)*r*76]);}for(let i=0;i<22;i++){const a=rnd(0,6.283);L.push([-640+Math.cos(a)*42,-330+Math.sin(a)*50]);}addTrees(L,.8);}
  col(-520,3,-410,6,3,wh);cyl(0,4,2.4,slate,-520,7.2,-410,world,8);label('Boston Common',-530,46,-400,.9);
  /* MIT */
  { const x=-950,z=-950;green(x,z+48,70,34,'#57863f');sbox(120,17,34,x,8.5,z,0,lime,16);sbox(34,17,60,x-58,8.5,z+30,0,lime,16);sbox(34,17,60,x+58,8.5,z+30,0,lime,16);for(let i=-4;i<=4;i++)col(x+i*4.2,8,z+19,15,1.1);box(42,3,8,lime,x,17,z+19,world);
    cyl(15,15,7,lime,x,20.5,z,world,24);const d=new THREE.Mesh(new THREE.SphereGeometry(14.5,24,12,0,6.283,0,Math.PI/2),lime);d.position.set(x,24,z);d.scale.y=.75;world.add(d);
    sbox(16,92,34,x+130,46,z-30,0,bt[0],14);sph(6,wh,x+130,97,z-30,world);tower(x-130,z-20,40,36,40,5,0);tower(x+70,z-70,34,28,50,2,0);label('MIT',x,64,z); }
  /* Harvard + the stadium across the river */
  { const x=-1900,z=-870;green(x,z,74,56,'#57863f');[[-58,-34,26,40],[-58,22,26,44],[58,-30,26,46],[58,26,26,40],[0,-52,60,22],[-4,50,50,20]].forEach(a=>{sbox(a[2],13,a[3],x+a[0],6.5,z+a[1],0,brick,14);const r=new THREE.Mesh(gable(a[2]+1.5,5,a[3]+1.5),slate);r.position.set(x+a[0],13,z+a[1]);world.add(r);});
    sbox(54,16,30,x+110,8,z-10,0,lime,16);for(let i=-4;i<=4;i++)col(x+110+i*5,8,z+7,15,1.1);
    sbox(24,22,60,x-10,11,z-110,0,brick,14);sbox(12,46,12,x-10,23,z-78,0,brick,14);const tp=cyl(0,10,16,M('#7a3b2e'),x-10,54,z-78,world,4);tp.rotation.y=Math.PI/4;label('Harvard',x,58,z);
    const sx=-1990,sz=-520,pr=[[34,0],[36,2],[58,18],[62,18],[62,0]].map(p=>new THREE.Vector2(p[0],p[1])),hs=new THREE.Mesh(new THREE.LatheGeometry(pr,36,.5,Math.PI*1.68),new THREE.MeshStandardMaterial({color:C('#b9b3a6'),roughness:.9,side:THREE.DoubleSide}));hs.scale.set(1.5,1,1);hs.position.set(sx,0,sz);world.add(hs);
    const f=new THREE.Mesh(new THREE.PlaneGeometry(96,50),flat('#2f8a3a',3));f.rotation.x=-Math.PI/2;f.position.set(sx,.2,sz);world.add(f);label('Harvard Stadium',sx,44,sz,.8);EXC.push([sx,sz,110],[x,z,150],[-950,-950,190]); }
  /* Fenway */
  { const x=-1250,z=165,f=new THREE.Mesh(new THREE.CircleGeometry(52,4,Math.PI/4),flat('#2f8a3a',3));f.rotation.x=-Math.PI/2;f.position.set(x,.2,z);world.add(f);const inf=new THREE.Mesh(new THREE.CircleGeometry(15,4,Math.PI/4),flat('#b98a55',4));inf.rotation.x=-Math.PI/2;inf.position.set(x,.24,z+26);world.add(inf);
    const pr=[[40,0],[42,2],[60,20],[64,20],[64,0]].map(p=>new THREE.Vector2(p[0],p[1])),st=new THREE.Mesh(new THREE.LatheGeometry(pr,28,-.9,Math.PI*1.15),new THREE.MeshStandardMaterial({color:C('#3d5a48'),roughness:.9,side:THREE.DoubleSide}));st.position.set(x,0,z+26);st.rotation.y=Math.PI/2+.2;world.add(st);
    box(64,13,2.4,M('#2f5a3f'),x-30,6.5,z-28,world).rotation.y=-.75;[[-64,-30],[58,-34],[64,40],[-60,48]].forEach(a=>{cyl(.7,.9,40,M('#aab',{metalness:.6}),x+a[0],20,z+a[1],world,6);box(9,5,1,GL('#fffbe6'),x+a[0],41,z+a[1],world).lookAt(x,10,z);});label('Fenway Park',x,56,z,.9);EXC.push([x,z,95]); }
  /* Castle Island fort, JFK Library */
  { const x=975,z=300;green(x,z,66,58);for(let k=0;k<5;k++){const a=k/5*6.283,b=(k+1)/5*6.283,x1=x+Math.cos(a)*34,z1=z+Math.sin(a)*34,x2=x+Math.cos(b)*34,z2=z+Math.sin(b)*34;sbox(Math.hypot(x2-x1,z2-z1)+5,9,5,(x1+x2)/2,4.5,(z1+z2)/2,-Math.atan2(z2-z1,x2-x1));}label('Castle Island',x,34,z,.8); }
  { const x=520,z=640;sbox(22,44,22,x,22,z,.5,new THREE.MeshStandardMaterial({color:C('#f1f1ee'),roughness:.5}),20);sbox(26,34,26,x+22,17,z+14,.5,bt[4],14);cyl(26,26,7,wh,x-24,3.5,z-6,world,24);label('JFK Library',x,64,z,.8); }
  /* Stodder's Neck dog park: a wooded peninsula with a loop trail */
  { const P0=[[1440,3275],[1385,3130],[1400,2995],[1500,2940],[1600,2990],[1625,3125],[1570,3300]];LANDS.push(P0);polyMesh(P0,grassMat,0);const cx=1505,cz=3110;
    const ring=new THREE.Mesh(new THREE.RingGeometry(.86,.93,48),flat('#b8a680',2));ring.rotation.x=-Math.PI/2;ring.scale.set(100,138,1);ring.position.set(cx,.12,cz);world.add(ring);
    const lot=new THREE.Mesh(new THREE.PlaneGeometry(70,34),flat('#4a4d52',2));lot.rotation.x=-Math.PI/2;lot.position.set(1505,.12,3275);world.add(lot);for(let k=0;k<8;k++)car(world,1476+k*8.2,.1,3270+(k%2)*10,k%2?0:Math.PI);
    const L=[];for(let i=0;i<120;i++){const a=rnd(0,6.283),r=rnd(.62,1.02);L.push([cx+Math.cos(a)*r*100,cz+Math.sin(a)*r*138]);}for(let i=0;i<14;i++)L.push([cx+rnd(-40,40),cz+rnd(-70,60)]);addTrees(L.filter(p=>pip(p[0],p[1],P0)),.9);
    const dc=['#6b4a2f','#f1efe8','#22252b','#c79a5a','#8a8f98'];for(let i=0;i<14;i++){const a=rnd(0,6.283),r=rnd(.2,.85),x=cx+Math.cos(a)*r*80,z=cz+Math.sin(a)*r*115;dog(x,z,dc[i%5],rnd(0,6));if(i%2)PEOPLE.push([x+rnd(2,5),0,z+rnd(-3,3)]);}
    const G=M('#6b4a2f');for(let k=0;k<4;k++){box(3,.5,.8,G,cx-30+k*20,.5,cz+100,world);}for(let x=1470;x<=1540;x+=4)box(.15,1.3,.15,G,x,.65,3256,world);box(70,.1,.1,G,1505,1.2,3256,world);
    const ps=new THREE.Mesh(new THREE.PlaneGeometry(13,3.2),new THREE.MeshBasicMaterial({map:signTex("Stodder's Neck",'#1f5a2e','#f2c230')}));ps.position.set(1505,3.4,3254);ps.rotation.y=Math.PI;world.add(ps);[-6,6].forEach(k=>cyl(.14,.14,3.4,G,1505+k,1.7,3254,world,6));
    const rd=new THREE.Mesh(new THREE.PlaneGeometry(11,900),roadFlat.clone());rd.material.map=roadTex.clone();rd.material.map.needsUpdate=true;rd.material.map.repeat.set(1,75);rd.rotation.x=-Math.PI/2;rd.rotation.z=-1.14;rd.position.set(1650,.13,3370);world.add(rd);
    box(260,1.4,12,conc,1250,2.2,3190,world).rotation.y=.42;for(let k=-2;k<=2;k++)box(3,6,10,conc,1250+k*52*Math.cos(.42),-.8,3190-k*52*Math.sin(.42),world).rotation.y=.42;
    label("Stodder's Neck Dog Park",cx,52,cz); }
  buildZoo();
  /* name tags for places that were already here */
  [['Zakim Bridge',-250,128,-1000,.9],['State House',-420,66,-560,.8],['Custom House Tower',60,196,-560,.8],['Back Bay towers',-770,286,150,.9],['South Station',-2,262,60,.9],['Logan Airport',700,128,-830,1],['Forest Hills',rpos(FHd,48).x,54,rpos(FHd,48).z,.8],['Arnold Arboretum',flatP(FHd-140,420).x,96,flatP(FHd-140,420).z,.9],
   ['Blue Hills',flatP(R128+330,-1180).x,300,flatP(R128+330,-1180).z,1.1],['Route 128 Station',rpos(R128,-52).x,40,rpos(R128,-52).z,.8],['Canton Viaduct',VC.x,26,VC.z,.8],['Stoughton Station',rpos(ST,-17).x,44,rpos(ST,-17).z,.8],['The stadium',STAD[0],78,STAD[1],.9],['Providence',-3330,190,12590,1.2],['Rhode Island State House',-3440,84,12300,.9]].forEach(a=>label(a[0],a[1],a[2],a[3],a[4]));
}
/* ---------- moving traffic on the mapped roads ---------- */
const TRAF={runs:[],cars:[],b:null,c:null};
function buildTraffic(){
  if(!TRAF.runs.length)return;const tot=TRAF.runs.reduce((a,r)=>a+r.len,0),N=Math.min(900,Math.round(tot/55)),m4=()=>new THREE.MeshStandardMaterial({color:0xffffff,roughness:.35,metalness:.5});
  TRAF.b=new THREE.InstancedMesh(new THREE.BoxGeometry(1.9,.95,4.4),m4(),N);TRAF.c=new THREE.InstancedMesh(new THREE.BoxGeometry(1.7,.8,2.3),M('#18222e',{roughness:.1,metalness:.8}),N);const col=new THREE.Color();
  for(let i=0;i<N;i++){let k=Math.random()*tot,r=TRAF.runs[0];for(const q of TRAF.runs){if(k<q.len){r=q;break;}k-=q.len;}const dir=i%2?1:-1,hw=r.w>20;TRAF.cars.push({r,d:r.a+Math.random()*r.len,dir,v:(hw?rnd(34,48):rnd(16,26)),o:dir*(hw?rnd(3.4,9.5):r.w/4)});TRAF.b.setColorAt(i,col.set(carCols[i%carCols.length]).convertSRGBToLinear());}
  [TRAF.b,TRAF.c].forEach(m=>{m.frustumCulled=false;m.castShadow=false;m.receiveShadow=false;world.add(m);});
}
const _tm=new THREE.Matrix4();
function updTraffic(dt){if(!TRAF.b)return;const cx=cam.position.x,cz=cam.position.z;TRAF.cars.forEach((c,i)=>{c.d+=c.dir*c.v*dt;const r=c.r;if(c.d>r.a+r.len)c.d=r.a;else if(c.d<r.a)c.d=r.a+r.len;const p=r.f(c.d,c.o);if((p.x-cx)**2+(p.z-cz)**2>36e6){_tm.makeScale(0,0,0);TRAF.b.setMatrixAt(i,_tm);TRAF.c.setMatrixAt(i,_tm);return;}
    const q=r.f(c.d+c.dir*3,c.o),ry=Math.atan2(q.x-p.x,q.z-p.z);_tm.makeRotationY(ry);_tm.setPosition(p.x,.75,p.z);TRAF.b.setMatrixAt(i,_tm);_tm.setPosition(p.x-Math.sin(ry)*.25,1.6,p.z-Math.cos(ry)*.25);TRAF.c.setMatrixAt(i,_tm);});TRAF.b.instanceMatrix.needsUpdate=true;TRAF.c.instanceMatrix.needsUpdate=true;}
/* ---------- road tunnels shown as ghosted routes with portals ---------- */
const TUN_I93=[[30,290],[100,150],[120,-150],[118,-420],[112,-600],[40,-760],[-120,-900],[-205,-955]];
function plDist(x,z,P){let b=1e9;for(let i=0;i<P.length-1;i++){const ax=P[i+1][0]-P[i][0],az=P[i+1][1]-P[i][1],t=clamp(((x-P[i][0])*ax+(z-P[i][1])*az)/(ax*ax+az*az),0,1);b=Math.min(b,Math.hypot(x-P[i][0]-ax*t,z-P[i][1]-az*t));}return b;}
function buildTunnels(){
  const tt=cvs(64,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='rgba(18,22,34,.6)';g.fillRect(0,0,w,h);g.fillStyle='#ffd23f';g.fillRect(30,6,4,30);g.fillStyle='#fff';g.fillRect(2,0,4,40);g.fillRect(w-6,0,4,40);});tt.wrapS=tt.wrapT=THREE.RepeatWrapping;
  const gm=new THREE.MeshBasicMaterial({map:tt,transparent:true,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-7,polygonOffsetUnits:-7});
  const path=(pts,w,mat,vr,yf)=>{const c=new THREE.CatmullRomCurve3(pts.map(p=>new V3(p[0],0,p[1])),false,'centripetal'),L=c.getLength(),f=(d,o)=>{const u=clamp(d/L,0,1),p=c.getPointAt(u),t=c.getTangentAt(u);p.x-=t.z*o;p.z+=t.x*o;p.y=yf?yf(p.x,p.z):0;return p;};const s=strip(f,0,L,-w/2,.2,w/2,.2,mat,12,vr);world.add(s);return {c,L,f};};
  const portal=(x,z,ry,w)=>{const g=new THREE.Group();box(w+6,7,2.4,conc,0,3.5,0,g);box(w,5,2.6,new THREE.MeshBasicMaterial({color:0x050608}),0,2.5,0,g);box(w+8,1,3,M('#6f6a62'),0,7.4,0,g);g.position.set(x,0,z);g.rotation.y=ry;world.add(g);};
  const ends=(r,w)=>{[0,r.L].forEach(d=>{const p=r.f(d,0),t=r.c.getTangentAt(d?1:0);if(isLand(p.x,p.z))portal(p.x,p.z,Math.atan2(t.x,t.z),w);});};
  const wy=(x,z)=>isLand(x,z)?0:-1.45;
  /* I-93 under downtown, with the Greenway on top */
  const a=path(TUN_I93,22,gm,14,wy);ends(a,22);world.add(strip(a.f,90,a.L-120,-15,.12,-11.5,.12,flat('#4f8a3a',5),12));world.add(strip(a.f,90,a.L-120,11.5,.12,15,.12,flat('#4f8a3a',5),12));
  label('I-93 tunnel under the Greenway',120,60,-330,.9);
  /* the Pike: beside the tracks, under the Prudential, under the channel, then the Ted Williams Tunnel to Logan */
  const rm=roadFlat.clone();rm.map=roadTex.clone();rm.map.needsUpdate=true;rm.map.repeat.set(2,1);
  const pk=[[-1500,300],[-1250,330],[-1020,250]].map(p=>p),s1=path(pk,24,rm,12);const pru=path([[-1020,250],[-860,235],[-620,262],[-360,300],[-90,322],[60,326]],24,gm,14,wy);ends(pru,24);label('Mass Pike under the Prudential',-800,70,250,.85);
  const ch=path([[60,326],[230,330],[330,322]],24,gm,14,wy);const sb=path([[330,322],[600,300],[840,235]],24,rm,12);
  const tw=path([[840,235],[985,120],[1040,-60],[1000,-185]],22,gm,14,wy);ends(tw,22);label('Ted Williams Tunnel',1035,58,10,.9);const lr=path([[1000,-185],[900,-330],[760,-470]],14,rm,12);
  /* Sumner and Callahan tunnels: downtown to East Boston */
  const sc=path([[112,-640],[250,-640],[390,-590],[470,-545]],18,gm,14,wy);ends(sc,18);label('Sumner + Callahan Tunnels',300,54,-625,.9);path([[470,-545],[540,-560],[610,-600]],12,rm,12);
  /* Storrow Drive along the river with its short tunnel */
  const st=path([[-330,-800],[-430,-760],[-560,-690]],12,rm,12);const stt=path([[-560,-690],[-640,-660],[-720,-640]],12,gm,14,wy);ends(stt,12);path([[-720,-640],[-1000,-570],[-1400,-520],[-1850,-560]],12,rm,12);label('Storrow Drive',-900,40,-585,.75);
  [s1,sb,lr].forEach(r=>{if(r.L>260)TRAF.runs.push({f:r.f,a:20,len:r.L-40,w:24});});
}
/* ---------- Franklin Park Zoo ---------- */
function zooAnimal(kind,x,z,ry){const g=new THREE.Group(),B=(w,h,d,m,px,py,pz,rx)=>{const q=box(w,h,d,m,px,py,pz,g);if(rx)q.rotation.x=rx;return q;};
  if(kind==='giraffe'){const t=cvs(64,64,c=>{c.fillStyle='#e9c46a';c.fillRect(0,0,64,64);c.fillStyle='#8a4f1d';for(let i=0;i<26;i++){c.beginPath();c.ellipse(rnd(0,64),rnd(0,64),rnd(4,8),rnd(4,7),rnd(0,3),0,7);c.fill();}}),m=new THREE.MeshStandardMaterial({map:t,roughness:.9});
    B(1.2,1.5,3,m,0,4.2,0);B(.7,4.6,.8,m,0,7,1.7,.35);B(.6,.7,1.5,m,0,9.3,2.9);[[.4,1.1],[-.4,1.1],[.4,-1.1],[-.4,-1.1]].forEach(a=>B(.3,3.5,.3,m,a[0],1.75,a[1]));B(.1,.5,.1,M('#5a3a1a'),.2,9.9,2.5);B(.1,.5,.1,M('#5a3a1a'),-.2,9.9,2.5);}
  else if(kind==='zebra'){const t=cvs(64,64,c=>{c.fillStyle='#f4f4f0';c.fillRect(0,0,64,64);c.fillStyle='#16181c';for(let i=0;i<64;i+=9)c.fillRect(i,0,4.5,64);}),m=new THREE.MeshStandardMaterial({map:t,roughness:.9});
    B(.9,1.1,2.4,m,0,1.9,0);B(.5,1.3,.6,m,0,2.7,1.2,.6);B(.45,.55,1,m,0,3.2,1.8);[[.3,.8],[-.3,.8],[.3,-.8],[-.3,-.8]].forEach(a=>B(.22,1.4,.22,m,a[0],.7,a[1]));}
  else if(kind==='lion'){const m=M('#c9a05a',{roughness:.9});B(.95,1,2.3,m,0,1.4,0);const mn=sph(.85,M('#7a4a1c',{roughness:1}),0,1.9,1.3,g);B(.7,.7,.7,m,0,1.95,1.75);[[.3,.8],[-.3,.8],[.3,-.8],[-.3,-.8]].forEach(a=>B(.25,.9,.25,m,a[0],.45,a[1]));B(.12,.12,1.5,m,0,1.5,-1.8,-.4);}
  else if(kind==='gorilla'){const m=M('#22252b',{roughness:1});B(1.4,1.5,1.2,m,0,1.9,0,.3);sph(.55,m,0,2.9,.6,g);[[.75,.5],[-.75,.5]].forEach(a=>B(.4,1.8,.4,m,a[0],1.1,a[1]));[[.4,-.4],[-.4,-.4]].forEach(a=>B(.45,1,.45,m,a[0],.5,a[1]));B(.5,.3,.2,M('#4a4f58'),0,2.8,1.05);}
  else{const m=M('#b98a5a',{roughness:.9});B(.7,1.5,.9,m,0,1.6,0,-.5);B(.4,.5,.6,m,0,2.6,.8);B(.12,.6,.12,m,.15,3.1,.6);B(.12,.6,.12,m,-.15,3.1,.6);[[.3,0],[-.3,0]].forEach(a=>B(.25,.4,1.3,m,a[0],.2,.3));B(.25,.25,1.8,m,0,.5,-1.1,.3);}
  g.position.set(x,0,z);g.rotation.y=ry||0;g.scale.setScalar(1.6);world.add(g);}
function buildZoo(){
  const x=-880,z=1130,G=M('#5a4028'),F=M('#8a9098',{metalness:.5,roughness:.5});green(x,z,170,125,'#4f7f3a');EXC.push([x,z,178]);
  {const L=[];for(let i=0;i<120;i++){const a=rnd(0,6.283),r=rnd(.7,1);L.push([x+Math.cos(a)*r*165,z+Math.sin(a)*r*120]);}for(let i=0;i<26;i++)L.push([x+rnd(-110,110),z+rnd(-70,70)]);addTrees(L.filter(p=>Math.hypot(p[0]-x,(p[1]-z)*1.2)>52||Math.random()<.2),.85);}
  const pth=new THREE.Mesh(new THREE.RingGeometry(.52,.58,40),flat('#c9bb98',3));pth.rotation.x=-Math.PI/2;pth.scale.set(110,80,1);pth.position.set(x,.14,z);world.add(pth);
  const pen=(px,pz,w,d,c)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),flat(c,3));m.rotation.x=-Math.PI/2;m.position.set(px,.15,pz);world.add(m);for(let k=-w/2;k<=w/2;k+=3){box(.14,1.5,.14,G,px+k,.75,pz-d/2,world);box(.14,1.5,.14,G,px+k,.75,pz+d/2,world);}for(let k=-d/2;k<=d/2;k+=3){box(.14,1.5,.14,G,px-w/2,.75,pz+k,world);box(.14,1.5,.14,G,px+w/2,.75,pz+k,world);}
    [[w,.1,.1,0,-d/2],[w,.1,.1,0,d/2],[.1,.1,d,-w/2,0],[.1,.1,d,w/2,0]].forEach(a=>{box(a[0],a[1],a[2],G,px+a[3],1.4,pz+a[4],world);box(a[0],a[1],a[2],G,px+a[3],.8,pz+a[4],world);});};
  pen(x-22,z-18,36,26,'#c9b06a');zooAnimal('giraffe',x-28,z-20,.6);zooAnimal('giraffe',x-16,z-14,2.4);zooAnimal('zebra',x-30,z-10,1.2);zooAnimal('zebra',x-12,z-24,-.6);zooAnimal('zebra',x-20,z-26,2.9);
  pen(x+24,z-16,30,24,'#bfa468');zooAnimal('lion',x+20,z-18,.4);zooAnimal('lion',x+30,z-12,-2);for(let i=0;i<3;i++){const r=new THREE.Mesh(new THREE.IcosahedronGeometry(rnd(2,3.4),0),new THREE.MeshStandardMaterial({color:C('#8a857b'),roughness:1,flatShading:true}));r.position.set(x+24+rnd(-8,8),1.2,z-22+rnd(-3,3));world.add(r);}
  pen(x+26,z+20,28,22,'#6a9a52');zooAnimal('kangaroo',x+20,z+18,1);zooAnimal('kangaroo',x+30,z+24,-1.4);zooAnimal('kangaroo',x+26,z+14,2.6);
  /* Tropical Forest: big low dome with the gorillas */
  {const d=new THREE.Mesh(new THREE.SphereGeometry(20,28,12,0,6.283,0,Math.PI/2),new THREE.MeshStandardMaterial({color:C('#dfe7ea'),roughness:.25,metalness:.5}));d.scale.y=.55;d.position.set(x-24,0,z+24);world.add(d);cyl(20.5,20.5,2,conc,x-24,1,z+24,world,28);zooAnimal('gorilla',x-2,z+30,-1.2);zooAnimal('gorilla',x-4,z+22,-.4);pen(x-2,z+26,10,16,'#5f8f4a');label('Tropical Forest',x-24,22,z+24,.55);}
  /* entrance gate */
  [-7,7].forEach(k=>sbox(3,7,3,x+k,3.5,z+62,0,stoneM,6));const sg=new THREE.Mesh(new THREE.PlaneGeometry(13,3),new THREE.MeshBasicMaterial({map:signTex('Franklin Park Zoo','#1f5a2e','#f2c230'),side:THREE.DoubleSide}));sg.position.set(x,7.2,z+62);world.add(sg);
  const lot=new THREE.Mesh(new THREE.PlaneGeometry(70,30),flat('#4a4d52',3));lot.rotation.x=-Math.PI/2;lot.position.set(x,.14,z+88);world.add(lot);for(let k=0;k<10;k++)car(world,x-30+k*6.6,.1,z+82+(k%2)*11,k%2?0:Math.PI);
  for(let k=0;k<16;k++)PEOPLE.push([x+Math.cos(k*.7)*rnd(52,60)*1.05,0,z+Math.sin(k*.7)*rnd(38,44)]);
  label('Franklin Park Zoo',x,54,z);
}
