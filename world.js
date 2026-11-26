'use strict';
/* =====================================================================
   BOSTON WORLD
   ===================================================================== */
const world=new THREE.Scene();
const HAZE='#c9dceb';world.fog=new THREE.Fog(C(HAZE),420,8200);
const skyTex=cvs(8,512,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#1f5fb4');gr.addColorStop(.25,'#3f86d4');gr.addColorStop(.42,'#8dbfe8');gr.addColorStop(.495,HAZE);gr.addColorStop(1,HAZE);g.fillStyle=gr;g.fillRect(0,0,w,h);});
const sky=new THREE.Mesh(new THREE.SphereGeometry(12000,24,16),new THREE.MeshBasicMaterial({side:THREE.BackSide,fog:false,map:skyTex,depthWrite:false}));world.add(sky);
const SD=new V3(-.5,.62,.48).normalize();
const sunSpr=new THREE.Sprite(new THREE.SpriteMaterial({map:cvs(128,128,g=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,245,1)');r.addColorStop(.12,'rgba(255,250,225,.95)');r.addColorStop(.3,'rgba(255,240,200,.3)');r.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=r;g.fillRect(0,0,128,128);}),fog:false,depthWrite:false,transparent:true,toneMapped:false}));sunSpr.scale.set(2600,2600,1);world.add(sunSpr);
const ENV=(()=>{const s=new THREE.Scene(),t=cvs(8,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#2f6fc0');gr.addColorStop(.4,'#9cc8ec');gr.addColorStop(.5,'#dbe8f2');gr.addColorStop(.53,'#8a9a7a');gr.addColorStop(1,'#4f5d44');g.fillStyle=gr;g.fillRect(0,0,w,h);});
  s.add(new THREE.Mesh(new THREE.SphereGeometry(50,24,16),new THREE.MeshBasicMaterial({side:THREE.BackSide,map:t})));sph(5,new THREE.MeshBasicMaterial({color:0xffffff}),SD.x*45,SD.y*45,SD.z*45,s);
  const p=new THREE.PMREMGenerator(renderer),e=p.fromScene(s,.03).texture;p.dispose();return e;})();
world.environment=ENV;
const hemi=new THREE.HemisphereLight(0xcfe2ff,0x6f7d58,.4);world.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d6,2.3);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.near=100;sun.shadow.camera.far=2800;sun.shadow.bias=-.0005;sun.shadow.normalBias=.5;world.add(sun,sun.target);
const SR=new V3().crossVectors(new V3(0,1,0),SD).normalize(),SU=new V3().crossVectors(SD,SR).normalize(),_sf=new V3();
function sunFollow(x,y,z,R){const tx=2*R/2048;_sf.set(x,y,z);const a=Math.round(_sf.dot(SR)/tx)*tx,b=Math.round(_sf.dot(SU)/tx)*tx,c=_sf.dot(SD);_sf.set(0,0,0).addScaledVector(SR,a).addScaledVector(SU,b).addScaledVector(SD,c);
  sun.position.copy(_sf).addScaledVector(SD,1300);sun.target.position.copy(_sf);sun.target.updateMatrixWorld();const s=sun.shadow.camera;if(s.right!==R){s.left=-R;s.right=R;s.top=R;s.bottom=-R;s.updateProjectionMatrix();}}

/* ---------- trees: crossed leafy cards with a canopy disc ---------- */
function treeTex(k){return cvs(256,256,(g,w,h)=>{g.clearRect(0,0,w,h);
  if(k===3){g.fillStyle='#3d2d20';g.fillRect(122,196,12,60);for(let i=0;i<9;i++){const y=205-i*22,hw=80-i*8.4;for(let j=0;j<30;j++){const x=128+rnd(-hw,hw),yy=y+rnd(-4,14)+Math.abs(x-128)*.22;g.fillStyle=shade(['#1f3a24','#274a2c','#31573a','#1a3020'][j%4],rnd(.8,1.3)*(x<128?1.12:.88));g.beginPath();g.moveTo(x-rnd(8,14),yy+rnd(6,12));g.lineTo(x,yy-rnd(8,16));g.lineTo(x+rnd(8,14),yy+rnd(6,12));g.fill();}}}
  else{const pal=[['#2c4420','#3b5a28','#4f7334','#6a8c44'],['#243a1c','#30501f','#3f6429','#587c37'],['#7a3f18','#a05a1e','#c27f27','#d8a23a']][k];
    g.strokeStyle='#3b2c20';g.lineCap='round';g.lineWidth=13;g.beginPath();g.moveTo(128,256);g.lineTo(128,150);g.stroke();g.lineWidth=6;[[128,185,82,122],[128,175,174,116],[128,165,108,90],[128,158,152,82]].forEach(b=>{g.beginPath();g.moveTo(b[0],b[1]);g.lineTo(b[2],b[3]);g.stroke();});
    for(let i=0;i<460;i++){const a=rnd(0,6.283),r=Math.sqrt(Math.random()),x=128+Math.cos(a)*r*106,y=98+Math.sin(a)*r*84,lit=clamp(.5-(x-128)/250-(y-98)/190+rnd(-.25,.25),0,.999);g.fillStyle=shade(pal[(lit*4)|0],rnd(.85,1.15));g.beginPath();g.ellipse(x,y,rnd(6,16),rnd(5,12),rnd(0,3),0,7);g.fill();}
    g.globalCompositeOperation='destination-out';for(let i=0;i<80;i++){const a=rnd(0,6.283),x=128+Math.cos(a)*rnd(72,114),y=98+Math.sin(a)*rnd(58,92);g.beginPath();g.arc(x,y,rnd(3,8),0,7);g.fill();}g.globalCompositeOperation='source-over';}});}
const treeG=(()=>{const pos=[],uv=[],idx=[],nr=[],quad=(a,b,c,d,ua,ub,uc,ud)=>{const k=pos.length/3;pos.push(...a,...b,...c,...d);uv.push(...ua,...ub,...uc,...ud);idx.push(k,k+1,k+2,k,k+2,k+3);for(let i=0;i<4;i++)nr.push(0,1,0);};
  quad([-.5,0,0],[.5,0,0],[.5,1,0],[-.5,1,0],[0,0],[1,0],[1,1],[0,1]);quad([0,0,-.5],[0,0,.5],[0,1,.5],[0,1,-.5],[0,0],[1,0],[1,1],[0,1]);quad([-.36,.64,.36],[.36,.64,.36],[.36,.64,-.36],[-.36,.64,-.36],[.16,.36],[.84,.36],[.84,.92],[.16,.92]);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('normal',new THREE.Float32BufferAttribute(nr,3));g.setIndex(idx);return g;})();
const TREEM=[0,1,2,3].map(k=>{const t=treeTex(k);return {m:new THREE.MeshStandardMaterial({map:t,alphaTest:.2,side:THREE.DoubleSide,roughness:1}),d:new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:t,alphaTest:.2})};});
function addTrees(L,sc){const by=[[],[],[],[]];L.forEach(s=>{const r=Math.random();by[r<.38?0:r<.62?1:r<.72?2:3].push(s);});by.forEach((B,k)=>{if(!B.length)return;const q=sc||1;
  const m=inst(treeG,TREEM[k].m,B,1,(s,i,me,dm,col)=>{const h=(k===3?rnd(15,24):rnd(12,20))*q,w=(k===3?rnd(.42,.55):rnd(.8,1.05))*h;dm.position.set(s[0],(s.y||0)-.2,s[1]);dm.scale.set(w,h,w);dm.rotation.set(0,rnd(0,3.14),0);dm.updateMatrix();me.setMatrixAt(i,dm.matrix);const v=rnd(.5,.82);me.setColorAt(i,col.setRGB(v,v,v*rnd(.9,1)));});
  m.customDepthMaterial=TREEM[k].d;world.add(m);});}
/* ---------- hills as real terrain ---------- */
const HILLS=[],BLD=[];
function hillH(x,z){let y=0;for(let i=0;i<HILLS.length;i++){const h=HILLS[i],dx=(x-h[0])/h[2],dz=(z-h[1])/h[4],r=dx*dx+dz*dz;if(r<1){const f=1-r,n=fbm(((x/1900)%1+1)%1,((z/1900)%1+1)%1,8),rd=1-Math.abs(2*n-1);y=Math.max(y,h[3]*f*f*(.5+.75*rd)+h[3]*.14*f*(n-.5));}}return y;}
function buildHills(){const ft=noiseTex(256,(u,v)=>{const k=.72+fbm(u,v,16)*.4+(N1(u*64,v*64)-.5)*.3;return [255*k,255*k,255*k];});const fo=C('#2c4526'),rk=C('#807a70'),gr=C('#4d6a36'),c=new THREE.Color();
  HILLS.forEach(H=>{const n=46,g=new THREE.PlaneGeometry(2*H[2],2*H[4],n,n);g.rotateX(-Math.PI/2);const p=g.attributes.position,uv=g.attributes.uv,cl=[];for(let i=0;i<p.count;i++){const wx=H[0]+p.getX(i),wz=H[1]+p.getZ(i),y=hillH(wx,wz);p.setY(i,y>.3?y:-4);uv.setXY(i,wx/70,wz/70);}
    g.computeVertexNormals();const nr=g.attributes.normal;for(let i=0;i<p.count;i++){const y=p.getY(i),t=clamp((1-nr.getY(i))*4.2-.35+(y/H[3]-.8)*1.4,0,1),b=clamp(y/14,0,1);c.copy(gr).lerp(fo,b).lerp(rk,t);cl.push(c.r,c.g,c.b);}
    g.setAttribute('color',new THREE.Float32BufferAttribute(cl,3));const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:rep(ft,1,1),vertexColors:true,roughness:1}));m.position.set(H[0],0,H[1]);m.userData.noCast=true;m.receiveShadow=true;world.add(m);});}
const MAIN=[[-9000,-9000],[400,-9000],[250,-1500],[170,-1200],[190,-700],[160,-300],[220,-60],[300,120],[950,180],[1050,420],[700,640],[100,760],[-100,1100],[-50,1700],[200,2400],[900,3000],[2200,3600],[3000,5000],[3800,8000],[5200,10500],[5200,17500],[-1900,17500],[-2150,15200],[-2500,13500],[-2900,12750],[-3250,13400],[-3350,15200],[-3600,17500],[-9000,17500]];
const LOGAN=[[480,-1250],[1250,-1350],[1650,-900],[1700,-250],[1300,-80],[700,-150],[420,-500]];
const LANDS=[MAIN,LOGAN],isLand=(x,z)=>LANDS.some(P=>pip(x,z,P));

/* ---------- route: Stoughton Line ---------- */
const RP=[[0,-20],[0,80],[0,180],[-40,290],[-160,360],[-350,370],[-520,350],[-650,330],[-800,360],[-930,470],[-1050,620],[-1160,800],[-1240,1000],[-1290,1400],[-1320,1800],[-1380,2200],[-1500,2600],[-1580,3000],[-1620,3350],[-1540,3640],[-1420,3900],[-1340,4250],[-1300,4600],[-1300,4760]];
const route=new THREE.CatmullRomCurve3(RP.map(p=>new V3(p[0],0,p[1])),false,'centripetal');route.arcLengthDivisions=3000;
const RL=route.getLength();
const RS=[];for(let i=0;i<=1400;i++){const p=route.getPointAt(i/1400);RS.push([p.x,p.z,RL*i/1400]);}
function nearRoute(x,z){let b=1e9,bd=0;for(const s of RS){const q=(s[0]-x)**2+(s[1]-z)**2;if(q<b){b=q;bd=s[2];}}return [Math.sqrt(b),bd];}
const STN=[['South Station',0,75],['Back Bay',-650,330],['Ruggles',-1050,620],['Hyde Park',-1320,1800],['Route 128',-1500,2600],['Canton Junction',-1620,3350],['Canton Center',-1420,3900],['Stoughton',-1300,4600]].map(s=>({name:s[0],d:nearRoute(s[1],s[2])[1]}));
STN[7].d=RL-78;
const BB=STN[1].d,RG=STN[2].d,HP=STN[3].d,R128=STN[4].d,CJ=STN[5].d,CC=STN[6].d,ST=STN[7].d,FHd=nearRoute(-1270,1200)[1];
const TB=5,HE=172,R1=BB-430,T1=BB-262,T2=RG-190,C2=RG+424,DJ=CJ+75;
const elev=d=>-9*ss(R1,BB-250,d)+2*ss(T2,RG-100,d)+7*ss(RG+120,RG+420,d);
/* offset o>0 = west (right-hand side heading south) */
function rpos(d,o){const u=clamp(d/RL,0,1),p=route.getPointAt(u);if(o){const t=route.getTangentAt(u);p.x-=t.z*o;p.z+=t.x*o;}p.y=elev(d);return p;}
function rtan(d){return route.getTangentAt(clamp(d/RL,0,1));}
const P=(d,o,y)=>{const p=rpos(d,o);p.y+=y||0;return p;},flatP=(d,o,y)=>{const p=rpos(d,o);p.y=y||0;return p;};
const ryaw=d=>{const t=rtan(d);return Math.atan2(t.x,t.z);};
function cover(d){if(d<HE)return 2;if(d>T1&&d<T2)return 2;if((d>R1+50&&d<=T1)||(d>=T2&&d<RG+330))return 1;return 0;}
/* main line continues past the junction toward the viaduct */
const J0=rpos(DJ,0),JT=rtan(DJ),JW=new V3(-JT.z,0,JT.x);
const stubC=new THREE.CatmullRomCurve3([[0,0],[120,6],[300,55],[520,160],[800,320],[1150,560]].map(a=>new V3(J0.x+JT.x*a[0]+JW.x*a[1],0,J0.z+JT.z*a[0]+JW.z*a[1])).concat([[-2130,5200],[-2290,6600],[-2440,8300],[-2740,10100],[-2990,11700],[-3120,12300],[-3170,12640]].map(q=>new V3(q[0],0,q[1]))),false,'centripetal');stubC.arcLengthDivisions=4000;
const SL=stubC.getLength();
function spos(s,o){const u=clamp(s/SL,0,1),p=stubC.getPointAt(u);if(o){const t=stubC.getTangentAt(u);p.x-=t.z*o;p.z+=t.x*o;}p.y=0;return p;}
const aiPos=d=>d<=DJ?rpos(d,TB):spos(d-DJ,TB);
const MS=[];for(let i=0;i<=2400;i++){const p=stubC.getPointAt(i/2400);MS.push([p.x,p.z,SL*i/2400]);}
const nearMain=(x,z)=>{let b=1e9,bd=0;for(const m of MS){const q=(m[0]-x)**2+(m[1]-z)**2;if(q<b){b=q;bd=m[2];}}return [Math.sqrt(b),bd];};
const PST=[['Sharon',-2130,5200],['Mansfield',-2330,7100],['Attleboro',-2740,10100]].map(a=>({name:a[0],s:nearMain(a[1],a[2])[1]}));PST.push({name:'Providence',s:SL-84});
const STNP=STN.slice(0,6).map(q=>({name:q.name,d:q.d})).concat(PST.map(q=>({name:q.name,d:DJ+q.s})));
const syaw=q=>{const t=stubC.getTangentAt(clamp(q/SL,0,1));return Math.atan2(t.x,t.z);};
const VS=385,VC=spos(VS,2.5),VT=stubC.getTangentAt(VS/SL),VW=new V3(-VT.z,0,VT.x),VRA=clamp(nearRoute(VC.x,VC.z)[0]-17,90,420),VRL=105,VD=nearRoute(VC.x,VC.z)[1];
const ell=k=>{const a=[];for(let i=0;i<44;i++){const t=i/44*6.2832;a.push([VC.x+VT.x*Math.cos(t)*VRL*k+VW.x*Math.sin(t)*VRA*k,VC.z+VT.z*Math.cos(t)*VRL*k+VW.z*Math.sin(t)*VRA*k]);}return a;};
function holePts(d0,d1,oA,oB){const n=Math.ceil((d1-d0)/10),a=[],b=[];for(let i=0;i<=n;i++){const d=d0+(d1-d0)*i/n,p=rpos(d,oA),q=rpos(d,oB);a.push([p.x,p.z]);b.push([q.x,q.z]);}return a.concat(b.reverse());}
const HOLES=[holePts(R1-2,T1,-10,15),holePts(T2,C2,-10,27),ell(1)];

function polyMesh(poly,mat,y,holes){const s=new THREE.Shape();poly.forEach((p,i)=>i?s.lineTo(p[0],-p[1]):s.moveTo(p[0],-p[1]));(holes||[]).forEach(h=>{const q=new THREE.Path();h.forEach((p,i)=>i?q.lineTo(p[0],-p[1]):q.moveTo(p[0],-p[1]));s.holes.push(q);});
  const m=new THREE.Mesh(new THREE.ShapeGeometry(s),mat);m.rotation.x=-Math.PI/2;m.position.y=y;world.add(m);return m;}
const waterMat=new THREE.MeshStandardMaterial({color:C('#1f5f86'),roughness:.1,metalness:.82,normalMap:rep(waterN,1/150,1/150),normalScale:new THREE.Vector2(.14,.14)});
const water2=()=>new THREE.MeshStandardMaterial({color:C('#1f5f86'),roughness:.1,metalness:.82,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
polyMesh([[-17000,-17000],[17000,-17000],[17000,21000],[-17000,21000]],waterMat,-1.5,[MAIN,LOGAN]);
const grassMat=new THREE.MeshStandardMaterial({map:rep(grassTex,1/34,1/34),roughness:1});
polyMesh(MAIN,grassMat,0,HOLES);polyMesh(LOGAN,grassMat,0);
{const mt=noiseTex(256,(u,v)=>{const n=fbm(u,v,4);return n>.5?[36,52,20,clamp((n-.5)*5,0,1)*120]:[150,150,90,clamp((.5-n)*5,0,1)*80];});rep(mt,1/1300,1/1300);
 const mm=new THREE.MeshStandardMaterial({map:mt,transparent:true,roughness:1,polygonOffset:true,polygonOffsetFactor:-.5,polygonOffsetUnits:-.5,depthWrite:false});polyMesh(MAIN,mm,.02,HOLES);polyMesh(LOGAN,mm,.02);}

/* shared materials + builders */
const XING=[],PEOPLE=[],EXC=[],EXS=[];           // crossings, people, exclusion circles [x,z,r], exclusion segments [ax,az,bx,bz,r]
const conc=new THREE.MeshStandardMaterial({map:concTex,roughness:.9,side:THREE.DoubleSide}),roofMt=M('#3f4654',{roughness:.5,metalness:.6,side:THREE.DoubleSide}),post=M('#2f3440',{metalness:.7,roughness:.5});
const roadTex=cvs(64,256,(q,w,h)=>{q.fillStyle='#3a3d42';q.fillRect(0,0,w,h);for(let i=0;i<500;i++){q.fillStyle='rgba(255,255,255,'+rnd(0,.06)+')';q.fillRect(rnd(0,w),rnd(0,h),2,2);}q.fillStyle='#e6c84a';q.fillRect(30,0,1.5,h);q.fillRect(33,0,1.5,h);q.fillStyle='#ddd';q.fillRect(2,0,2,h);q.fillRect(w-4,0,2,h);});roadTex.wrapS=roadTex.wrapT=THREE.RepeatWrapping;
const roadM=new THREE.MeshStandardMaterial({map:roadTex,roughness:.9,side:THREE.DoubleSide}),roadFlat=new THREE.MeshStandardMaterial({map:roadTex,roughness:.9,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2.5,polygonOffsetUnits:-2.5});
const stoneTex=cvs(256,256,(g,w,h)=>{g.fillStyle='#8f8a80';g.fillRect(0,0,w,h);for(let r=0;r<8;r++)for(let c=0;c<5;c++){g.fillStyle=shade('#8f8a80',rnd(.72,1.18));g.fillRect(c*64+(r%2?32:0)-32+1,r*32+1,62,30);}for(let i=0;i<600;i++){g.fillStyle='rgba(0,0,0,'+rnd(0,.12)+')';g.fillRect(rnd(0,w),rnd(0,h),3,2);}});stoneTex.wrapS=stoneTex.wrapT=THREE.RepeatWrapping;
const stoneM=new THREE.MeshStandardMaterial({map:stoneTex,roughness:.95});
function slab(pf,a,b,o1,o2,y1,y2,th,mat,cast){const g=new THREE.Group(),A=(d,o,y)=>{const p=pf(d,o);p.y=(p.y||0)+y;return p;};
  g.add(strip2(d=>A(d,o1,y1),d=>A(d,o2,y2),a,b,mat,4,8));g.add(strip2(d=>A(d,o1,y1-th),d=>A(d,o2,y2-th),a,b,mat,4,8));g.add(strip2(d=>A(d,o1,y1),d=>A(d,o1,y1-th),a,b,mat,4,8));g.add(strip2(d=>A(d,o2,y2),d=>A(d,o2,y2-th),a,b,mat,4,8));
  [a,b].forEach(d=>{const bg=new THREE.BufferGeometry().setFromPoints([A(d,o1,y1),A(d,o2,y2),A(d,o2,y2-th),A(d,o1,y1-th)]);bg.setIndex([0,1,2,0,2,3]);bg.setAttribute('uv',new THREE.Float32BufferAttribute([0,1,1,1,1,0,0,0],2));bg.computeVertexNormals();const m=new THREE.Mesh(bg,mat);m.userData.noCast=true;g.add(m);});
  if(cast)g.children.forEach(c=>c.userData.noCast=false);world.add(g);return g;}
function sideSign(pf,tf,d,o,name,col){const sm=new THREE.MeshBasicMaterial({map:signTex(name,'#1b2145',col)}),p=pf(d,o),q=pf(d,0),t=tf(d);p.y=(p.y||0)+3.5;q.y=p.y;const m=new THREE.Mesh(new THREE.PlaneGeometry(7.4,1.85),sm);m.position.copy(p);m.lookAt(q);world.add(m);[-3.5,3.5].forEach(k=>cyl(.1,.1,3.4,post,p.x+t.x*k,p.y-1.25,p.z+t.z*k,world,6));}
function sbox(w,h,d,x,y,z,ry,mat,k){const g=new THREE.BoxGeometry(w,h,d),uv=g.attributes.uv,s=k||12;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*Math.max(w,d)/s,uv.getY(i)*h/s);const m=new THREE.Mesh(g,mat||stoneM);m.position.set(x,y,z);m.rotation.y=ry||0;world.add(m);return m;}
let bt=[],tower=null;
const carCols=['#b3261f','#1f4f9f','#e6e6e6','#2b2b2b','#8a8f98','#d9b21a','#2e6b45'];
function car(parent,x,y,z,ry){const g=new THREE.Group(),c=M(carCols[(Math.random()*carCols.length)|0],{roughness:.3,metalness:.5});box(1.9,.9,4.4,c,0,.75,0,g);box(1.7,.8,2.3,M('#18222e',{roughness:.1,metalness:.8}),0,1.55,-.2,g);[[.95,1.4],[-.95,1.4],[.95,-1.4],[-.95,-1.4]].forEach(a=>{const w=cyl(.36,.36,.25,M('#111'),a[0],.36,a[1],g,10);w.rotation.z=Math.PI/2;});g.position.set(x,y,z);g.rotation.y=ry||0;parent.add(g);return g;}

function buildCity(){
  const rv=new THREE.CatmullRomCurve3([[-4500,-760],[-2500,-700],[-1500,-650],[-700,-800],[-250,-1000],[230,-1060]].map(p=>new V3(p[0],0,p[1])));const rl=rv.getLength();
  const rvp=(d,o)=>{const u=clamp(d/rl,0,1),p=rv.getPointAt(u),t=rv.getTangentAt(u);p.x+=t.z*o;p.z-=t.x*o;return p;};world.add(strip(rvp,0,rl,-95,.1,95,.1,water2(),40));
  const stTex=cvs(256,256,(g,w,h)=>{g.fillStyle='#8f9296';g.fillRect(0,0,w,h);for(let i=0;i<1500;i++){g.fillStyle='rgba(0,0,0,'+rnd(0,.07)+')';g.fillRect(rnd(0,w),rnd(0,h),3,3);}
    g.fillStyle='#34373c';g.fillRect(0,0,w,22);g.fillRect(0,h-22,w,22);g.fillRect(0,0,22,h);g.fillRect(w-22,0,22,h);g.fillStyle='#b9bcc0';g.fillRect(22,22,w-44,4);g.fillRect(22,h-26,w-44,4);g.fillRect(22,22,4,h-44);g.fillRect(w-26,22,4,h-44);
    g.fillStyle='#e8d9a0';for(let i=30;i<w-30;i+=22){g.fillRect(i,0,10,1.5);g.fillRect(0,i,1.5,10);}});
  const BLK=110,pave=new THREE.MeshStandardMaterial({map:rep(stTex,7,7),roughness:.9,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  const pv=new THREE.Mesh(new THREE.PlaneGeometry(770,770),pave);pv.rotation.x=-Math.PI/2;pv.position.set(-220,.1,-465);world.add(pv);
  const pave2=pave.clone();pave2.map=stTex.clone();pave2.map.needsUpdate=true;rep(pave2.map,5,2);const pv2=new THREE.Mesh(new THREE.PlaneGeometry(550,220),pave2);pv2.rotation.x=-Math.PI/2;pv2.position.set(-700,.1,170);world.add(pv2);
  const fac=o=>{const t=cvs(256,256,(g,w,h)=>{g.fillStyle=o.wall;g.fillRect(0,0,w,h);if(o.noise)for(let i=0;i<900;i++){g.fillStyle='rgba(0,0,0,'+rnd(0,.09)+')';g.fillRect(rnd(0,w),rnd(0,h),rnd(2,10),rnd(1,3));}
      const n=4,cw=w/n,ch=h/n,mx=cw*o.mx,my=ch*o.my;for(let r=0;r<n;r++)for(let c=0;c<n;c++){const x=c*cw+mx,y=r*ch+my,ww=cw-2*mx,hh=ch-2*my,gr=g.createLinearGradient(0,y,0,y+hh),k=rnd(.75,1.2);
        gr.addColorStop(0,shade(o.glass,1.6*k));gr.addColorStop(1,shade(o.glass,.7*k));g.fillStyle=gr;g.fillRect(x,y,ww,hh);if(Math.random()<.2){g.fillStyle='rgba(235,225,200,.3)';g.fillRect(x,y,ww,hh*rnd(.3,.7));}
        if(o.frame){g.strokeStyle=o.frame;g.lineWidth=2;g.strokeRect(x,y,ww,hh);g.beginPath();g.moveTo(x+ww/2,y);g.lineTo(x+ww/2,y+hh);g.stroke();}
        else{g.strokeStyle='rgba(20,30,40,.55)';g.lineWidth=1.5;g.strokeRect(x,y,ww,hh);}}});
    t.wrapS=t.wrapT=THREE.RepeatWrapping;return new THREE.MeshStandardMaterial({map:t,roughness:o.metal?.12:.75,metalness:o.metal?.8:.05});};
  bt=[fac({wall:'#8b9096',glass:'#2f4459',mx:.16,my:.2,frame:'#5c6166',noise:1}),fac({wall:'#3f6288',glass:'#5c8cbd',mx:.03,my:.04,metal:1}),fac({wall:'#7a4032',glass:'#252e38',mx:.22,my:.2,frame:'#e8e2d5',noise:1}),
    fac({wall:'#bfb298',glass:'#2a3744',mx:.2,my:.18,frame:'#8d8168',noise:1}),fac({wall:'#2b2622',glass:'#6a5642',mx:.04,my:.05,metal:1}),fac({wall:'#d6d8d9',glass:'#2d4860',mx:0,my:.26,noise:1})];
  const roofM=M('#55585e',{roughness:.95}),mech=M('#8b8f96',{roughness:.6,metalness:.5});
  tower=(x,z,w,h,d,ti,ry,y0)=>{const g=new THREE.BoxGeometry(w,h,d),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*Math.max(1,Math.round(w/14)),uv.getY(i)*Math.max(1,Math.round(h/14)));const m=new THREE.Mesh(g,[bt[ti],bt[ti],roofM,roofM,bt[ti],bt[ti]]);m.position.set(x,(y0||0)+h/2,z);m.rotation.y=ry||0;world.add(m);BLD.push([x,z,w/2,d/2,ry||0,(y0||0)+h]);
    if(h>60&&w>24){const k=box(w*.45,5,d*.45,mech,x+rnd(-3,3),(y0||0)+h+2.5,z+rnd(-3,3),world);k.rotation.y=ry||0;}return m;};
  const keep=[[60,-560,50],[-420,-560,62],[0,-75,120],[-530,-400,112],[80,-800,135],[-330,-840,70],[120,-150,32],[119,-290,32],[118,-420,32],[114,-520,26],[112,-640,32]];
  for(let bx=0;bx<7;bx++)for(let bz=0;bz<7;bz++)for(let q=0;q<4;q++){if(Math.random()<.24)continue;const x=-605+BLK*(bx+.5)+(q%2?22:-22),z=-850+BLK*(bz+.5)+(q<2?22:-22);if(x>150||keep.some(k=>Math.hypot(x-k[0],z-k[1])<k[2]))continue;
    const c=Math.hypot(x+200,z+430),h=rnd(22,55)+Math.max(0,190-c*.6)*rnd(.35,1),ti=h>110?[1,4,1,0,5][(Math.random()*5)|0]:(Math.random()*6)|0;tower(x,z,rnd(30,40),h,rnd(30,40),ti,0);}
  for(let i=0;i<18;i++)tower(-960+i*29+rnd(-4,4),i%2?105:215,rnd(20,25),rnd(18,34)+(i%5===0?40:0),rnd(26,34),[2,2,3,0,5][i%5],0);
  tower(-700,150,58,250,28,1,.35);
  tower(-850,160,46,215,46,0,0);box(30,12,30,mech,-850,221,160,world);cyl(.8,.8,40,M('#ddd',{metalness:.8,roughness:.3}),-850,247,160,world,6);
  { tower(60,-560,44,55,44,3,0);tower(60,-560,20,150,20,3,0);const p=cyl(0,15,26,M('#a8946c',{roughness:.7}),60,163,-560,world,4);p.rotation.y=Math.PI/4;
    [[0,10.2,0],[0,-10.2,Math.PI],[10.2,0,Math.PI/2],[-10.2,0,-Math.PI/2]].forEach(a=>{const c=new THREE.Mesh(new THREE.CircleGeometry(6,24),clockM);c.position.set(60+a[0],130,-560+a[1]);c.rotation.y=a[2];world.add(c);});box(46,4,46,M('#bfb298'),60,56,-560,world);}
  { box(70,22,36,bt[2],-420,11,-560,world);box(40,8,24,M('#e9e3d6'),-420,26,-560,world);for(let i=-3;i<=3;i++)cyl(1,1,14,M('#efe9dc'),-420+i*5,15,-579,world,10);
    const d=sph(13,new THREE.MeshStandardMaterial({color:C('#e8b21e'),metalness:1,roughness:.18}),-420,31,-560,world);d.scale.y=.9;cyl(1.2,1.2,8,M('#e8b21e',{metalness:1,roughness:.2}),-420,46,-560,world,8);}
  { const g=new THREE.Group(),wh=M('#e9ecef',{roughness:.5});box(320,2.4,34,M('#62666c'),0,16,0,g);box(320,1.2,.8,wh,0,18,17,g);box(320,1.2,.8,wh,0,18,-17,g);[-150,-110,-30,30,110,150].forEach(x=>box(5,16,26,M('#9a9da3'),x,7.5,0,g));
    [-70,70].forEach(x=>{[1,-1].forEach(s=>{const l=box(4,62,4,wh,x,31,s*14,g);l.rotation.x=-s*.24;});box(5,56,5,wh,x,88,0,g);
      const pts=[];for(let i=1;i<=7;i++)[1,-1].forEach(s=>pts.push(new V3(x,62+i*7.4,0),new V3(x+s*i*11,17,0)));g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xffffff})));});
    g.position.set(-250,0,-1000);g.rotation.y=-.42;world.add(g);}
}
const clockM=new THREE.MeshBasicMaterial({map:cvs(128,128,g=>{g.fillStyle='#f6f1e0';g.beginPath();g.arc(64,64,62,0,7);g.fill();g.strokeStyle='#222';g.lineWidth=5;g.stroke();for(let i=0;i<12;i++){const a=i/12*6.283;g.fillStyle='#222';g.fillRect(64+Math.cos(a)*50-2,64+Math.sin(a)*50-2,5,5);}g.lineWidth=6;g.beginPath();g.moveTo(64,64);g.lineTo(64,24);g.moveTo(64,64);g.lineTo(92,74);g.stroke();}),transparent:true});

/* ---------- track, trench, tunnel ---------- */
const tunTrack=new THREE.MeshBasicMaterial({map:trackTex,color:0x595959,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
function buildTracks(){
  const bal=M('#6a655d',{roughness:1,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  [[0,T1,trackMat],[T1,T2,tunTrack],[T2,RL,trackMat]].forEach(a=>{world.add(strip(rpos,a[0],a[1],-2.6,.34,2.6,.34,a[2],2.5,1.5));if(a[0]<DJ)world.add(strip(rpos,a[0],Math.min(a[1],DJ),TB-2.4,.34,TB+2.6,.34,a[2],2.5,1.5));});
  [[0,T1],[T2,RL]].forEach(a=>{world.add(strip(rpos,a[0],a[1],-4.2,.02,-2.6,.34,bal,5));world.add(strip(rpos,a[0],Math.min(a[1],DJ),TB+2.6,.34,TB+4.2,.02,bal,5));});
  world.add(strip(rpos,DJ+60,RL,2.6,.34,4.2,.02,bal,5));
  rails(rpos,0,RL,0,world,1,2.5,.34);rails(rpos,0,DJ,TB,world,1,2.5,.34);
  [18,23].forEach(o=>{world.add(strip(rpos,T2-16,FHd+62,o-2.5,.34,o+2.5,.34,trackMat,3,1.5));rails(rpos,T2-16,FHd+62,o,world,1,3,.34);});
  /* main line stub + junction */
  let s0=0;while(s0<200&&spos(s0,0).distanceTo(flatP(DJ+s0,0))<5.4)s0+=2;
  world.add(strip(spos,0,SL,TB-2.4,.34,TB+2.6,.34,trackMat,3,1.5));world.add(strip(spos,s0,SL,-2.6,.34,2.6,.34,trackMat,3,1.5));world.add(strip(spos,0,SL,TB+2.6,.34,TB+4.2,.02,bal,6));world.add(strip(spos,s0+20,SL,-4.2,.02,-2.6,.34,bal,6));
  rails(spos,0,SL,TB,world,1,3,.34);rails(spos,16,SL,0,world,1,3,.34);
  EXS.push([J0.x,J0.z,spos(SL,2.5).x,spos(SL,2.5).z,0]);for(let s=0;s<SL;s+=40){const p=spos(s,2.5);EXC.push([p.x,p.z,s<1200?26:13]);}
}
function buildCuts(){
  const wt=cvs(256,256,(g,w,h)=>{g.fillStyle='#8d8a84';g.fillRect(0,0,w,h);for(let i=0;i<1400;i++){g.fillStyle='rgba(0,0,0,'+rnd(0,.08)+')';g.fillRect(rnd(0,w),rnd(0,h),rnd(2,8),rnd(1,3));}
    for(let i=0;i<26;i++){const x=rnd(0,w),gr=g.createLinearGradient(x,0,x+rnd(60,200),0);gr.addColorStop(0,'rgba(40,32,22,.35)');gr.addColorStop(1,'rgba(40,32,22,0)');g.fillStyle=gr;g.fillRect(x,rnd(0,h),200,rnd(3,10));}
    g.fillStyle='rgba(30,30,30,.5)';for(let y=0;y<h;y+=64)g.fillRect(0,y,w,2);g.fillStyle='rgba(60,90,40,.25)';g.fillRect(0,0,26,h);});wt.wrapS=wt.wrapT=THREE.RepeatWrapping;
  const wall=new THREE.MeshStandardMaterial({map:wt,roughness:.95,side:THREE.DoubleSide}),floor=M('#55514a',{roughness:1,side:THREE.DoubleSide}),fence=M('#3a3f48',{roughness:.6,metalness:.5,side:THREE.DoubleSide});
  [[R1-2,T1,15],[T2,C2,27]].forEach(a=>{[-10,a[2]].forEach(o=>{const w=strip2(d=>P(d,o,0),d=>flatP(d,o,0),a[0],a[1],wall,10,12);w.userData.noCast=false;world.add(w);world.add(strip2(d=>flatP(d,o,0),d=>flatP(d,o,1.15),a[0],a[1],conc,10,8));world.add(strip2(d=>flatP(d,o,1.15),d=>flatP(d,o,2.3),a[0],a[1],fence,10,8));});
    world.add(strip(rpos,a[0],a[1],-10,0,a[2],0,floor,10));});
  /* portals */
  const hw=(d,o1,o2,dir)=>{const e=elev(d),p=rpos(d+dir*.8,(o1+o2)/2),h=1.3-(e+6.8),m=sbox(o2-o1,h,1.6,p.x,(1.3+e+6.8)/2,p.z,ryaw(d),conc,10);box(o2-o1+1,.5,2,M('#6f6a62'),p.x,1.4,p.z,world).rotation.y=ryaw(d);return m;};
  hw(T1,-10,15,1);hw(T2,-10,27,-1);
  /* cut bridges (streets over the trench) */
  const cb=(d,oR,w)=>{const c=flatP(d,(oR-10)/2),g=new THREE.Group(),len=oR+10+6;box(len,1.1,w,conc,0,-.2,0,g);const rd=new THREE.Mesh(new THREE.PlaneGeometry(w-1.5,len+260),roadFlat.clone());rd.material.map=roadTex.clone();rd.material.map.needsUpdate=true;rd.material.map.repeat.set(1,(len+260)/12);rd.rotation.x=-Math.PI/2;rd.rotation.z=Math.PI/2;rd.position.y=.38;g.add(rd);
    [w/2-.3,-w/2+.3].forEach(z=>{box(len,1.1,.4,conc,0,.9,z,g);box(len,.9,.08,M('#3a3f48',{metalness:.5}),0,1.9,z,g);});car(g,rnd(-12,12),.4,1.9,Math.PI/2);car(g,rnd(-30,-16),.4,-1.9,-Math.PI/2);
    g.position.copy(c);g.rotation.y=ryaw(d);world.add(g);const n=rtan(d);EXS.push([c.x+n.z*160,c.z-n.x*160,c.x-n.z*160,c.z+n.x*160,w/2+8]);};
  cb(BB-292,15,13);cb(RG-150,27,13);cb(RG-72,27,11);cb(RG+96,27,13);
}
function buildTunnel(){
  const wallT=cvs(128,512,(g,w,h)=>{g.fillStyle='#262422';g.fillRect(0,0,w,h);for(let i=0;i<900;i++){g.fillStyle='rgba('+(i%2?'0,0,0':'120,110,100')+','+rnd(0,.12)+')';g.fillRect(rnd(0,w),rnd(0,h),rnd(2,7),rnd(2,7));}
    g.fillStyle='rgba(0,0,0,.4)';g.fillRect(w*.72,0,w*.28,h);g.fillStyle='rgba(0,0,0,.5)';for(let y=0;y<h;y+=128)g.fillRect(0,y,w,3);
    g.fillStyle='#4b4a48';g.fillRect(w*.42,0,4,h);g.fillRect(w*.47,0,3,h);g.fillStyle='#5a3a22';g.fillRect(w*.53,0,3,h);
    const gr=g.createRadialGradient(w*.2,h/2,2,w*.2,h/2,150);gr.addColorStop(0,'rgba(255,214,150,.85)');gr.addColorStop(.25,'rgba(255,190,120,.3)');gr.addColorStop(1,'rgba(255,190,120,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);g.fillStyle='#fff3d0';g.fillRect(w*.17,h/2-10,8,20);});
  const tileT=cvs(128,256,(g,w,h)=>{g.fillStyle='#d9d2bd';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=8)for(let y=0;y<h;y+=16){g.fillStyle=shade('#d9d2bd',rnd(.9,1.06));g.fillRect(x+.5,y+.5,7,15);}g.fillStyle='#d06a1c';g.fillRect(w*.38,0,10,h);g.fillStyle='#3a3530';g.fillRect(w*.86,0,w*.14,h);
    const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'rgba(255,250,235,.25)');gr.addColorStop(1,'rgba(0,0,0,.3)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
  const ceilT=cvs(256,128,(g,w,h)=>{g.fillStyle='#1b1a19';g.fillRect(0,0,w,h);g.fillStyle='#2a2826';g.fillRect(0,h*.4,w,h*.2);g.fillStyle='#111';g.fillRect(0,h*.6,w,4);});
  const ceilS=cvs(256,128,(g,w,h)=>{g.fillStyle='#3a3936';g.fillRect(0,0,w,h);g.fillStyle='#24231f';g.fillRect(0,h*.45,w,h*.1);[.14,.34,.66,.86].forEach(u=>{const gr=g.createRadialGradient(w*u,h*.25,2,w*u,h*.25,60);gr.addColorStop(0,'rgba(255,255,240,.9)');gr.addColorStop(1,'rgba(255,255,240,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);g.fillStyle='#fffff2';g.fillRect(w*u-3,h*.05,6,h*.4);});});
  [wallT,tileT,ceilT,ceilS].forEach(t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;});
  const B=(t,o)=>new THREE.MeshBasicMaterial(Object.assign({map:t,side:THREE.DoubleSide},o||{})),wm=B(wallT),tm=B(tileT),cm=B(ceilT),cs=B(ceilS),fm=new THREE.MeshBasicMaterial({color:C('#1d1b19'),side:THREE.DoubleSide});
  const a=BB-72,b=BB+72;
  [[T1,a,wm,16],[a,b,tm,8],[b,T2,wm,16]].forEach(s=>{[-10,15].forEach(o=>world.add(strip(rpos,s[0],s[1],o,6.8,o,0,s[2],6,s[3])));});
  [[T1,a,cm],[a,b,cs],[b,T2,cm]].forEach(s=>{const c=strip(rpos,s[0],s[1],-10,6.8,15,6.8,s[2],6,8);c.userData.noCast=false;world.add(c);});
  world.add(strip(rpos,T1,T2,-10,0,15,0,fm,8));
  /* orange line stub portal */
  world.add(strip(rpos,T2-16,T2,27,6.8,27,0,wm,6,16));world.add(strip(rpos,T2-16,T2,15,6.8,27,6.8,cm,6,8));world.add(strip(rpos,T2-16,T2,15,0,27,0,fm,8));
  {const p=P(T2-16,21,3.4),m=new THREE.Mesh(new THREE.PlaneGeometry(12,6.8),new THREE.MeshBasicMaterial({color:0x000000,side:THREE.DoubleSide}));m.position.copy(p);m.rotation.y=ryaw(T2-16);world.add(m);}
  /* centre columns */
  const cols=[];for(let d=T1+4;d<T2-2;d+=7)cols.push(d);const cg=new THREE.BoxGeometry(.5,6.8,.5),cmats=[C('#33221a'),C('#33221a'),C('#33221a'),C('#33221a'),C('#7a543d'),C('#7a543d')].map(c=>new THREE.MeshBasicMaterial({color:c}));
  const cm2=new THREE.InstancedMesh(cg,cmats,cols.length),dm=new THREE.Object3D();cols.forEach((d,i)=>{const p=P(d,2.5,3.4);dm.position.copy(p);dm.rotation.y=ryaw(d);dm.updateMatrix();cm2.setMatrixAt(i,dm.matrix);});cm2.frustumCulled=false;world.add(cm2);
  /* Back Bay platforms */
  const pm=new THREE.MeshBasicMaterial({map:concTex,color:0xb5b0a6,side:THREE.DoubleSide}),ym=new THREE.MeshBasicMaterial({color:C('#d9a916'),side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
  [[-2.1,-10],[TB+2.1,15]].forEach(o=>{slab(rpos,a+4,b-4,o[0],o[1],1.15,1.15,1.15,pm);world.add(strip(rpos,a+4,b-4,o[0]+(o[0]<0?-.05:.05),1.18,o[0]+(o[0]<0?-.65:.65),1.18,ym,4));});
  const sm=new THREE.MeshBasicMaterial({map:signTex('BACK BAY','#f4efe2','#d06a1c')});sm.map=cvs(512,128,(g,w,h)=>{g.fillStyle='#f4efe2';g.fillRect(0,0,w,h);g.fillStyle='#d06a1c';g.fillRect(0,h-22,w,22);g.fillStyle='#1b2145';g.textAlign='center';g.textBaseline='middle';g.font='800 70px Arial';g.fillText('BACK BAY',w/2,h/2-8);});
  for(let d=a+14;d<b;d+=26)[-9.85,14.85].forEach(o=>{const p=P(d,o,3.6),q=P(d,2.5,3.6),m=new THREE.Mesh(new THREE.PlaneGeometry(8,2),sm);m.position.copy(p);m.lookAt(q);world.add(m);});
  const pcm=new THREE.MeshBasicMaterial({color:C('#cfc8b2')});for(let d=a+10;d<b;d+=12)[-6.5,11.5].forEach(o=>{const p=P(d,o,4);cyl(.35,.35,5.6,pcm,p.x,p.y,p.z,world,10);});
  for(let k=0;k<12;k++){const p=P(BB+rnd(-60,60),k%2?rnd(-4,-9):rnd(TB+4,14),1.15);PEOPLE.push([p.x,p.y,p.z]);}
}
function buildHall(){
  /* head house */
  const st=new THREE.MeshStandardMaterial({map:stoneTex,color:C('#d9c9a4'),roughness:.85});
  sbox(170,24,46,2,12,-70,0,st,16);sbox(60,32,50,2,16,-72,0,st,16);box(64,2,54,M('#a8987a'),2,33,-72,world);for(let i=-3;i<=3;i++)cyl(1.8,1.8,20,M('#e0d6bd',{roughness:.6}),2+i*7.5,14,-98,world,14);
  for(let i=-9;i<=9;i++)if(Math.abs(i)>2)box(4,9,.4,M('#1a2530',{roughness:.1,metalness:.9}),2+i*8,13,-93.1,world);
  const c=new THREE.Mesh(new THREE.CircleGeometry(4.5,24),clockM);c.position.set(2,28,-97.3);c.rotation.y=Math.PI;world.add(c);
  box(66,.6,26,conc,-2,.3,-34,world);
  /* stub tracks + platforms (x = -offset here) */
  [-10.2,-15.2,15.2,20.2].forEach(o=>{const x=-o,m=new THREE.Mesh(new THREE.PlaneGeometry(5.2,165),trackMat.clone());m.material.map=trackTex.clone();m.material.map.needsUpdate=true;m.material.map.repeat.set(1,110);m.rotation.x=-Math.PI/2;m.position.set(x,.34,62);world.add(m);rails((d,oo)=>new V3(x+oo,0,d),-20,144,0,world,1,160,.34);});
  [[-5.2,5.6],[10.1,5.4],[-20.6,6],[25.6,6]].forEach(a=>{box(a[1],1.15,150,conc,-a[0],.58,65,world);});[-2.5,7.5,-7.9,12.7,-17.9,22.9].forEach(o=>box(.5,.03,150,M('#f2bf1b'),-o,1.17,65,world));
  [0,5,-10.2,15.2,-15.2,20.2].forEach(o=>{box(2.4,1.6,1,M('#c0261c'),-o,1.2,-20,world);box(2.8,.5,1.6,M('#333'),-o,.6,-20,world);});
  /* overbuild: deck, podium and tower above the platforms */
  const dk=M('#2a2b2e',{roughness:.9});box(72,1.4,182,dk,-2.5,9.2,60,world);
  for(let z=-12;z<=140;z+=19){[-5.2,10.1,-20.6,25.6].forEach(o=>cyl(.45,.45,7.4,M('#8c8f95',{roughness:.6}),-o,4.8,z,world,10));[-36,31].forEach(x=>box(1.6,8.5,1.6,conc,x,4.25,z,world));
    [-5.2,10.1,-20.6,25.6].forEach(o=>box(.5,.12,9,GL('#fff6dc'),-o,8.42,z+9,world));}
  for(let z=-10;z<=140;z+=30)box(70,.9,1.2,M('#3a3b3f'),-2.5,8.1,z,world);
  const pod=sbox(72,15,182,-2.5,17.4,60,0,bt[5],14);tower(-2.5,30,48,215,48,1,0,24.9);tower(-2.5,112,40,70,52,0,0,24.9);
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(40,7),new THREE.MeshBasicMaterial({map:signTex('SOUTH STATION')}));sg.position.set(-2.5,15,151.2);world.add(sg);
  const p1=new Consist(['loco','coach','coach'],1,world);p1.place((d)=>new V3(15.2,0,d),80,1,.62);const p2=new Consist(['loco','coach','coach'],1,world);p2.place((d)=>new V3(-20.2,0,d),96,1,.62);
  for(let k=0;k<16;k++)PEOPLE.push([[5.2,-10.1,20.6,-25.6][k%4]+rnd(-1.6,1.6),1.15,rnd(-8,135)]);
  /* signs */
  {const sm=new THREE.MeshBasicMaterial({map:signTex('South Station')});[20,100].forEach(z=>[5.2,-10.1].forEach(x=>{[1,-1].forEach(k=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(8,2),sm);m.position.set(x+k*.06,6.4,z);m.rotation.y=k*Math.PI/2;world.add(m);});[-3.6,3.6].forEach(q=>cyl(.06,.06,1.1,post,x,7.9,z+q,world,6));}));}
  /* yard east of the main line, service shed */
  [-11,-16,-21].forEach(o=>{world.add(strip(rpos,190,R1-25,o-2.6,.34,o+2.6,.34,trackMat,4,1.5));rails(rpos,190,R1-25,o,world,1,4,.34);});
  const y1=new Consist(['loco','coach','coach','coach'],1,world);y1.place((d)=>rpos(d,-16),R1-70,1,.62);const y2=new Consist(['metro','metro','metro'],1,world);y2.place((d)=>rpos(d,-21),R1-150,1,.62);const y3=new Consist(['box:#5a6b3a','tank','box:#7a3a2a'],1,world);y3.place((d)=>rpos(d,-11),300,1,.62);
  /* city blocks around the yard and channel */
  {const pvm=new THREE.MeshStandardMaterial({map:rep(concTex.clone(),1,1),color:C('#9a9c9f'),roughness:.95,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-.8,polygonOffsetUnits:-.8});pvm.map.needsUpdate=true;
    [[-27,-300],[11,260]].forEach(o=>{const s=strip(rpos,HE+2,R1-6,o[0],.04,o[1],.04,pvm,20,30);s.receiveShadow=true;world.add(s);});
    for(let d=205;d<R1-10;d+=44){[-1,1].forEach(sd=>{for(let k=0;k<3;k++){if(Math.abs(d-338)<36)continue;const o=sd<0?-(58+k*62+rnd(-6,6)):(34+k*60+rnd(-6,6)),p=flatP(d+rnd(-6,6),o);if(!pip(p.x,p.z,MAIN))continue;tower(p.x,p.z,rnd(26,36),k===2&&Math.random()<.4?rnd(50,90):rnd(10,30),rnd(26,34),[2,2,3,0,5,2][(Math.random()*6)|0],ryaw(d));}});}}
  {const p=rpos(360,-44),m=sbox(26,11,80,p.x,5.5,p.z,ryaw(360),bt[2],14);const r=new THREE.Mesh(gable(28,4,82),M('#4a4f58',{roughness:.6,metalness:.4}));r.position.set(p.x,11,p.z);r.rotation.y=ryaw(360);world.add(r);}
}
function overpass(d,w,H,L,sA,sB,ncar,fr){ // humped road bridge: local x along the track, local z across (s>0 = west)
  const yw=fr?fr.yaw:ryaw(d),c=fr?fr.c:flatP(d,TB/2),g=new THREE.Group(),hy=s=>{const u=s<sA?(sA-s)/(L+sA):s>sB?(s-sB)/(L-sB):0;return H*.5*(1+Math.cos(Math.PI*clamp(u,0,1)));},top=(s,k,dy)=>new V3(k,hy(s)+(dy||0),s),h2=w/2;
  const rm=roadM.clone();rm.map=roadTex.clone();rm.map.needsUpdate=true;rm.map.repeat.set(w>20?2:1,1);const rd=strip2(s=>top(s,-h2),s=>top(s,h2),-L,L,rm,4,12);rd.userData.noCast=false;g.add(rd);
  [-h2,h2].forEach(k=>{g.add(strip2(s=>top(s,k),s=>top(s,k,1.05),-L,L,conc,4,8));g.add(strip2(s=>top(s,k,0),s=>top(s,k,-1.5),sA-1,sB+1,M('#5d6b5a',{roughness:.6,metalness:.4,side:THREE.DoubleSide}),4));
    [[-L,sA],[sB,L]].forEach(r=>g.add(strip2(s=>top(s,k),s=>new V3(k+Math.sign(k)*hy(s)*1.6,0,s),r[0],r[1],emb,5)));});
  g.add(strip2(s=>top(s,-h2,-1.5),s=>top(s,h2,-1.5),sA-1,sB+1,M('#4a4d52',{side:THREE.DoubleSide}),4));
  if(w>20)g.add(strip2(s=>top(s,0,0),s=>top(s,0,.9),-L,L,conc,4,8));
  [sA,sB].forEach(s=>{const h=hy(s)-1.5,sh=new THREE.Shape();sh.moveTo(-h2-1,h);sh.lineTo(h2+1,h);sh.lineTo(h2+1+h*1.6,0);sh.lineTo(-h2-1-h*1.6,0);sh.closePath();const m=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:1.4,bevelEnabled:false}),conc);m.position.z=s-(s===sA?1.4:0);g.add(m);});
  if(sB-sA>40)box(w-2,hy(-8.5)-1.5,1.5,conc,0,(hy(-8.5)-1.5)/2,-8.5,g);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(w,2*L+500),roadFlat.clone());fl.material.map=rm.map.clone();fl.material.map.needsUpdate=true;fl.material.map.repeat.set(w>20?2:1,(2*L+500)/12);fl.rotation.x=-Math.PI/2;fl.position.y=.13;g.add(fl);
  for(let i=0;i<(ncar||3);i++){const s=rnd(-L*.8,L*.8),ln=(i%2?1:-1)*(w>20?rnd(3,h2-2):h2/2);car(g,ln,hy(s)+.05,s,ln>0?0:Math.PI);}
  g.position.copy(c);g.rotation.y=yw-Math.PI/2;world.add(g);const n={x:Math.sin(yw),z:Math.cos(yw)},q=L+250;EXS.push([c.x-n.z*q,c.z+n.x*q,c.x+n.z*q,c.z-n.x*q,w/2+H*1.6+10]);return g;
}
const emb=M('#4c6638',{roughness:1,side:THREE.DoubleSide});
function crossing(d){
  const c=P(d,0),g=new THREE.Group(),o={d,arms:[],lights:[]},yr=s=>.57*ss(30,9,Math.abs(s));
  const rm=roadFlat.clone();rm.map=roadTex.clone();rm.map.needsUpdate=true;g.add(strip2(s=>new V3(s,yr(s),-4.5),s=>new V3(s,yr(s),4.5),-330,330,rm,3,12));
  [[-5.6,5.6,1],[5.6,-5.6,-1]].forEach(a=>{cyl(.22,.22,4.6,M('#c9ccd1',{metalness:.7,roughness:.4}),a[0],2.3,a[1],g,8);const pv=new THREE.Group();pv.position.set(a[0],1.6,a[1]);box(.25,.25,8.5,M('#f2f2f2'),0,0,-a[2]*4.2,pv);[2,4,6,8].forEach(k=>box(.27,.27,.8,M('#c81e1e'),0,0,-a[2]*k,pv));g.add(pv);o.arms.push([pv,a[2]]);
    [-.6,.6].forEach(x=>{const lm=new THREE.MeshBasicMaterial({color:'#400'});sph(.36,lm,a[0]+x,3.9,a[1],g);o.lights.push(lm);});[.6,-.6].forEach(r=>{const xs=box(2.6,.35,.1,M('#fff'),a[0],4.7,a[1],g);xs.rotation.z=r;});});
  car(g,-16,.25,2.2,Math.PI/2);car(g,19,.25,-2.2,-Math.PI/2);
  g.position.copy(c);g.rotation.y=ryaw(d);world.add(g);XING.push(o);const n=rtan(d);EXS.push([c.x-n.z*340,c.z+n.x*340,c.x+n.z*340,c.z-n.x*340,14]);
}
function catenary(pf,d0,d1,skip){
  const ds=[];for(let d=d0;d<d1;d+=52)if(!skip||!skip(d))ds.push(d);const pm=M('#4a5a52',{roughness:.6,metalness:.6}),dm=new THREE.Object3D();
  const poles=new THREE.InstancedMesh(new THREE.BoxGeometry(.32,8.4,.32),pm,ds.length*2),beams=new THREE.InstancedMesh(new THREE.BoxGeometry(10.2,.3,.3),pm,ds.length),arms=new THREE.InstancedMesh(new THREE.BoxGeometry(.12,.9,.12),pm,ds.length*2);
  ds.forEach((d,i)=>{const t=pf(d+1,0).sub(pf(d,0)),ry=Math.atan2(t.x,t.z);dm.rotation.set(0,ry,0);[-4.9,TB+4.9].forEach((o,k)=>{const p=pf(d,o);dm.position.set(p.x,p.y+4.2,p.z);dm.updateMatrix();poles.setMatrixAt(i*2+k,dm.matrix);});
    const m=pf(d,TB/2);dm.position.set(m.x,m.y+7.9,m.z);dm.updateMatrix();beams.setMatrixAt(i,dm.matrix);[0,TB].forEach((o,k)=>{const p=pf(d,o);dm.position.set(p.x,p.y+7.3,p.z);dm.updateMatrix();arms.setMatrixAt(i*2+k,dm.matrix);});});
  [poles,beams,arms].forEach(m=>{m.frustumCulled=false;world.add(m);});
  const wm=new THREE.MeshBasicMaterial({color:C('#2a2d30'),side:THREE.DoubleSide});[0,TB].forEach(o=>{world.add(strip(pf,d0,d1,o-.025,5.95,o+.025,5.95,wm,13));world.add(strip(pf,d0,d1,o-.02,6.8,o+.02,6.8,wm,13));});
}
function buildStations(){
  const ym=flat('#f2bf1b',4),gb=gable(9,3.4,15);
  STN.forEach((s,i)=>{if(i<2){return;}const a=s.d-66,b=s.d+66,two=i<=5,sides=two?[[-2.1,-8],[TB+2.1,TB+8]]:[[-2.1,-8]];
    sides.forEach(o=>{slab(rpos,a,b,o[0],o[1],1.15,1.15,1.15,conc);
      const k=o[0]<0?-1:1;world.add(strip(rpos,a,b,o[0]+k*.05,1.18,o[0]+k*.65,1.18,ym,4));
      if(i>2){slab(rpos,s.d-36,s.d+36,o[0]+k*1.5,o[0]+k*6.3,5.4,5.0,.25,roofMt,true);for(let d=s.d-32;d<=s.d+32;d+=16){const p=P(d,o[0]+k*4.5,3.15);cyl(.2,.2,4.1,post,p.x,p.y,p.z,world,8);}}});
    if(i>2)for(let d=s.d-50;d<=s.d+50;d+=25){const p=P(d,-7.4,0);cyl(.1,.12,5,post,p.x,p.y+3.6,p.z,world,6);sph(.3,GL('#fff6d0'),p.x,p.y+6.2,p.z,world);}
    [s.d-34,s.d+34].forEach(d=>sideSign(rpos,rtan,d,-7.75,s.name));
    for(let k=0;k<9;k++){const p=P(s.d+rnd(-55,60),(k%3||!two)?rnd(-4,-7):TB+rnd(4,7),1.15);PEOPLE.push([p.x,p.y,p.z]);}
    if(i===3||i===5||i===6){const hp=flatP(s.d,-17),ry=ryaw(s.d),h=box(8,5,14,bt[2],hp.x,2.5,hp.z,world);h.rotation.y=ry;const rf=new THREE.Mesh(gb,M('#3d414b',{roughness:.8}));rf.position.set(hp.x,5,hp.z);rf.rotation.y=ry;world.add(rf);EXC.push([hp.x,hp.z,20]);}
  });
  /* Ruggles: glass concourse spanning the cut, university blocks */
  {const c=flatP(RG,8.5),ry=ryaw(RG),m=tower(c.x,c.z,44,6.5,18,1,ry,1.2);box(46,.6,20,M('#d7dbe2'),c.x,8,c.z,world).rotation.y=ry;box(44,1.2,18,conc,c.x,.6,c.z,world).rotation.y=ry;
    [[-40,40,26,60],[-52,-70,34,38],[-95,10,30,44],[62,60,28,30],[70,-40,36,52]].forEach((a,k)=>{const p=flatP(RG+a[1],a[0]);tower(p.x,p.z,a[2],a[3],a[2]+8,[2,5,2,1,3][k],ry);EXC.push([p.x,p.z,34]);});}
  /* Forest Hills: pass-through platforms, clock tower, end of the subway tracks */
  {const a=FHd-60,b=FHd+60;[[-2.1,-8],[TB+2.1,TB+8],[25.7,31]].forEach(o=>slab(rpos,a,b,o[0],o[1],1.15,1.15,1.15,conc));
    slab(rpos,a+10,b-10,24.5,32,5.6,5.2,.25,roofMt,true);
    const p=flatP(FHd,48),ry=ryaw(FHd);tower(p.x,p.z,22,9,54,5,ry);const tp=flatP(FHd+34,44);box(5.5,34,5.5,M('#e6e2d8',{roughness:.7}),tp.x,17,tp.z,world).rotation.y=ry;const cap=cyl(0,4.6,5,M('#3d414b'),tp.x,36.5,tp.z,world,4);cap.rotation.y=ry+Math.PI/4;
    [0,1,2,3].forEach(k=>{const f=new THREE.Mesh(new THREE.CircleGeometry(2.2,20),clockM);f.position.set(tp.x+Math.sin(ry+k*Math.PI/2)*2.8,29,tp.z+Math.cos(ry+k*Math.PI/2)*2.8);f.rotation.y=ry+k*Math.PI/2;world.add(f);});
    [FHd-30,FHd+30].forEach(d=>sideSign(rpos,rtan,d,-7.75,'Forest Hills','#e8731a'));
    [18,23].forEach(o=>{const q=P(FHd+62,o,1.2);box(2.4,1.6,1,M('#c0261c'),q.x,q.y,q.z,world).rotation.y=ry;});EXC.push([p.x,p.z,50]);for(let k=0;k<8;k++){const q=P(FHd+rnd(-50,50),rnd(27,30),1.15);PEOPLE.push([q.x,q.y,q.z]);}}
  /* Route 128: parking garage + offices */
  {const gt=cvs(128,128,(g,w,h)=>{g.fillStyle='#b9b4a8';g.fillRect(0,0,w,h);g.fillStyle='#15171a';g.fillRect(0,h*.2,w,h*.5);g.fillStyle='#8d887c';for(let x=0;x<w;x+=32)g.fillRect(x,h*.2,6,h*.5);});gt.wrapS=gt.wrapT=THREE.RepeatWrapping;
    const gm=new THREE.MeshStandardMaterial({map:gt,roughness:.9}),p=flatP(R128,-52),ry=ryaw(R128);const g=new THREE.BoxGeometry(64,17,130),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*12,uv.getY(i)*5);const m=new THREE.Mesh(g,[gm,gm,conc,conc,gm,gm]);m.position.set(p.x,8.5,p.z);m.rotation.y=ry;world.add(m);
    const top=new THREE.Group();top.position.set(p.x,17,p.z);top.rotation.y=ry;world.add(top);for(let k=0;k<14;k++)car(top,rnd(-26,26),0,rnd(-58,58),k%2?0:Math.PI);
    const fb=flatP(R128-20,-12);box(5,20,5,conc,fb.x,10,fb.z,world).rotation.y=ry;const br=flatP(R128-20,3);box(40,3,4,bt[1],br.x,9,br.z,world).rotation.y=ry;const fb2=flatP(R128-20,17);box(5,12,5,conc,fb2.x,6,fb2.z,world).rotation.y=ry;
    [[90,-60,1],[130,40,5],[-120,-90,1]].forEach(a=>{const q=flatP(R128+a[1],a[0]);tower(q.x,q.z,44,rnd(24,40),60,a[2],ry);EXC.push([q.x,q.z,48]);});EXC.push([p.x,p.z,80]);}
  /* Canton Center: church, mill, pond */
  {const ry=ryaw(CC),p=flatP(CC+46,40),wh=M('#f1efe8',{roughness:.7});box(10,9,20,wh,p.x,4.5,p.z,world).rotation.y=ry;const r=new THREE.Mesh(gable(11.4,5,21),M('#3a3d44'));r.position.set(p.x,9,p.z);r.rotation.y=ry;world.add(r);
    const tp=flatP(CC+34,40);box(4.4,17,4.4,wh,tp.x,8.5,tp.z,world).rotation.y=ry;box(3.4,4,3.4,wh,tp.x,19,tp.z,world).rotation.y=ry;const sp=cyl(0,2.4,10,M('#3a3d44'),tp.x,26,tp.z,world,4);sp.rotation.y=ry+Math.PI/4;EXC.push([p.x,p.z,26]);
    [[-34,-60,14,11,40],[-36,20,12,9,26],[34,110,14,10,34],[-40,90,12,12,30]].forEach(a=>{const q=flatP(CC+a[1],a[0]);sbox(a[2],a[3],a[4],q.x,a[3]/2,q.z,ryaw(CC+a[1]),bt[2],14);EXC.push([q.x,q.z,24]);});
    const pd=flatP(CC-190,-150),w=new THREE.Mesh(new THREE.CircleGeometry(1,36),water2());w.rotation.x=-Math.PI/2;w.scale.set(120,70,1);w.position.set(pd.x,.1,pd.z);world.add(w);EXC.push([pd.x,pd.z,125]);}
  /* Stoughton: granite station with its clock tower, downtown blocks */
  {const ry=ryaw(ST),p=flatP(ST+6,-17);sbox(11,6.5,26,p.x,3.25,p.z,ry);const r=new THREE.Mesh(gable(13.5,5,28),M('#4a2f28',{roughness:.8}));r.position.set(p.x,6.5,p.z);r.rotation.y=ry;world.add(r);
    const tp=flatP(ST-12,-17);sbox(6,20,6,tp.x,10,tp.z,ry);const cap=cyl(0,5,9,M('#4a2f28',{roughness:.8}),tp.x,24.5,tp.z,world,4);cap.rotation.y=ry+Math.PI/4;
    [0,1,2,3].forEach(k=>{const f=new THREE.Mesh(new THREE.CircleGeometry(2,20),clockM);f.position.set(tp.x+Math.sin(ry+k*Math.PI/2)*3.05,16.5,tp.z+Math.cos(ry+k*Math.PI/2)*3.05);f.rotation.y=ry+k*Math.PI/2;world.add(f);});
    slab(rpos,ST-40,ST+40,-2.6,-11.4,4.6,4.2,.25,roofMt,true);EXC.push([p.x,p.z,34]);
    [[36,-90,14,10,40,2],[34,-20,12,13,30,3],[38,40,16,9,44,2],[-46,-80,14,12,36,2],[-48,40,14,8,50,3],[-44,110,12,11,30,2]].forEach(a=>{const q=flatP(ST+a[1],a[0]);sbox(a[2],a[3],a[4],q.x,a[3]/2,q.z,ryaw(ST+a[1]),bt[a[5]],14);EXC.push([q.x,q.z,26]);});
    [0].forEach(o=>{const q=rpos(RL-1,o);box(2.6,1.7,1.2,M('#c0261c'),q.x,1.2,q.z,world).rotation.y=ry;});const e=rpos(RL),t=rtan(RL);box(60,2.4,.4,M('#6b6f76',{metalness:.6,roughness:.5}),e.x+t.x*8,1.2,e.z+t.z*8,world).rotation.y=ry;
    const rd=new THREE.Mesh(new THREE.PlaneGeometry(9,600),roadFlat.clone());rd.material.map=roadTex.clone();rd.material.map.needsUpdate=true;rd.material.map.repeat.set(1,50);rd.rotation.x=-Math.PI/2;rd.rotation.z=ry;const rp=flatP(ST-100,-27);rd.position.set(rp.x,.13,rp.z);world.add(rd);}
}
function buildMain(){
  const ym=flat('#f2bf1b',4),stan=d=>stubC.getTangentAt(clamp(d/SL,0,1)),sP=(d,o,y)=>{const p=spos(d,o);p.y=y||0;return p;},gb=gable(9,3.4,15);
  PST.forEach((st,i)=>{const a=st.s-66,b=st.s+66,last=i===PST.length-1;
    [[-2.1,-8],[TB+2.1,TB+8]].forEach(o=>{const k=o[0]<0?-1:1;slab(spos,a,b,o[0],o[1],1.15,1.15,1.15,conc);world.add(strip(spos,a,b,o[0]+k*.05,1.18,o[0]+k*.65,1.18,ym,4));slab(spos,st.s-40,st.s+40,o[0]+k*1.5,o[0]+k*6.3,5.4,5.0,.25,roofMt,true);
      for(let d=st.s-32;d<=st.s+32;d+=16){const p=sP(d,o[0]+k*4.5,3.15);cyl(.2,.2,4.1,post,p.x,p.y,p.z,world,8);}});
    [st.s-34,st.s+34].forEach(d=>sideSign(spos,stan,d,-7.75,st.name));
    for(let k=0;k<10;k++){const p=sP(st.s+rnd(-55,60),k%3?rnd(-4,-7):TB+rnd(4,7),1.15);PEOPLE.push([p.x,p.y,p.z]);}
    const hp=sP(st.s,-17),ry=syaw(st.s);
    if(!last){box(8,5,14,bt[2],hp.x,2.5,hp.z,world).rotation.y=ry;const rf=new THREE.Mesh(gb,M('#3d414b',{roughness:.8}));rf.position.set(hp.x,5,hp.z);rf.rotation.y=ry;world.add(rf);}
    else{const q=sP(st.s,-24);sbox(22,9,64,q.x,4.5,q.z,ry,bt[2],14);const d0=sph(9,M('#8fa39a',{roughness:.5,metalness:.4}),q.x,9,q.z,world);d0.scale.y=.45;const tp=sP(st.s-40,-24);sbox(7,26,7,tp.x,13,tp.z,ry,bt[2],14);const cap=cyl(0,5.6,7,M('#3d414b'),tp.x,29.5,tp.z,world,4);cap.rotation.y=ry+Math.PI/4;
      [0,1,2,3].forEach(k=>{const f=new THREE.Mesh(new THREE.CircleGeometry(2.4,20),clockM);f.position.set(tp.x+Math.sin(ry+k*Math.PI/2)*3.55,21,tp.z+Math.cos(ry+k*Math.PI/2)*3.55);f.rotation.y=ry+k*Math.PI/2;world.add(f);});
      [0,TB].forEach(o=>{const e=sP(SL-1,o,1.2);box(2.6,1.7,1.2,M('#c0261c'),e.x,e.y,e.z,world).rotation.y=ry;});}
    EXC.push([hp.x,hp.z,30]);});
  [1480,3300,5250,7650].forEach(q=>overpass(0,11,9.6,140,-13,13,3,{c:sP(q,TB/2),yaw:syaw(q)}));
}
function buildLandmarks(){
  /* highway viaduct over the yard (I-93), Readville yard, Neponset bridge, Route 128 highway */
  overpass(338,30,11.5,330,-34,14,9);
  overpass(2330,11,9.6,140,-13,13,3);overpass(2545,11,9.6,140,-13,13,3);
  overpass(R128-215,30,10.6,330,-15,15,10);
  overpass(CJ-108,11,9.6,140,-13,13,3);
  [-11,-16].forEach(o=>world.add(strip(rpos,HP+90,HP+330,o-2.6,.34,o+2.6,.34,trackMat,4,1.5)));rails(rpos,HP+90,HP+330,-11,world,1,4,.34);rails(rpos,HP+90,HP+330,-16,world,1,4,.34);
  {const f1=new Consist(['box:#7a3a2a','tank','box:#3a5a7a','box:#8a7a2a','tank:#3a3a3a'],1,world);f1.place((d)=>rpos(d,-16),HP+300,1,.62);const f2=new Consist(['loco','coach','coach'],1,world);f2.place((d)=>rpos(d,-11),HP+230,1,.62);}
  { const d=HP+395,p=flatP(d,TB/2),ry=ryaw(d),g=new THREE.Group(),sm=M('#3e5566',{metalness:.7,roughness:.5});
    const rc=new THREE.CatmullRomCurve3([[-1700,-90],[-900,40],[-300,-30],[0,0],[300,30],[800,-60],[1500,60]].map(a=>new V3(p.x+Math.cos(ry)*a[0]+Math.sin(ry)*a[1],0,p.z-Math.sin(ry)*a[0]+Math.cos(ry)*a[1]))),rl=rc.getLength();
    const rf=(s,o)=>{const u=clamp(s/rl,0,1),q=rc.getPointAt(u),t=rc.getTangentAt(u);q.x+=t.z*o;q.z-=t.x*o;return q;};world.add(strip(rf,0,rl,-24,.12,24,.12,water2(),30));for(let s=0;s<rl;s+=50){const q=rf(s,0);EXC.push([q.x,q.z,34]);}
    [4,-9].forEach(z=>{box(.5,.5,60,sm,z,6.4,0,g);box(.5,.5,60,sm,z,.9,0,g);for(let k=-30;k<=30;k+=10)box(.4,5.6,.4,sm,z,3.6,k,g);for(let k=-30;k<30;k+=10){const dg=box(.3,.3,11.4,sm,z,3.6,k+5,g);dg.rotation.x=(k/10%2?1:-1)*.5;}});
    g.position.copy(flatP(d,0));g.rotation.y=ry;world.add(g);}
  /* level crossings on the branch */
  crossing(CJ+290);crossing(CC+330);crossing(ST-118);
  /* stone viaduct on the main line */
  { const at=cvs(1400,160,(g,w,h)=>{g.fillStyle='#8a857b';g.fillRect(0,0,w,h);for(let r=0;r<10;r++)for(let c=0;c<45;c++){g.fillStyle=shade('#8a857b',rnd(.72,1.15));g.fillRect(c*32+(r%2?16:0)-16+1,r*16+1,30,14);}
      g.fillStyle='#6f6a61';g.fillRect(0,0,w,10);g.globalCompositeOperation='destination-out';for(let i=0;i<7;i++){const x=i*200+36;g.beginPath();g.arc(x+64,84,64,Math.PI,0);g.lineTo(x+128,h);g.lineTo(x,h);g.closePath();g.fill();}g.globalCompositeOperation='source-over';});
    const fm=new THREE.MeshStandardMaterial({map:at,alphaTest:.5,side:THREE.DoubleSide,roughness:.95}),g=new THREE.Group(),L=2*VRL+12;
    [-6.5,6.5].forEach(x=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(L,24),fm);m.rotation.y=Math.PI/2;m.position.set(x,-11.8,0);m.userData.noCast=true;g.add(m);});
    for(let i=0;i<=7;i++)box(12.6,24,5,stoneM,0,-11.8,-L/2+i*L/7,g);box(14,1.4,L,stoneM,0,-.5,0,g);[-6.7,6.7].forEach(x=>box(.6,1.3,L,stoneM,x,.85,0,g));
    g.position.set(VC.x,0,VC.z);g.rotation.y=Math.atan2(VT.x,VT.z);world.add(g);
    const ks=[1,.93,.84,.72,.55,.3,.08],pos=[],uv=[],idx=[],N=44;ks.forEach(k=>{const e=ell(k),y=-23*(1-k*k*k);for(let i=0;i<=N;i++){const q=e[i%N];pos.push(q[0],y,q[1]);uv.push(q[0],-q[1]);}});
    for(let j=0;j<ks.length-1;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;idx.push(a,a+1,b,b,a+1,b+1);}
    const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));bg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));bg.setIndex(idx);bg.computeVertexNormals();const bm=new THREE.Mesh(bg,new THREE.MeshStandardMaterial({map:grassMat.map,roughness:1,side:THREE.DoubleSide}));bm.userData.noCast=true;world.add(bm);
    const sh=new THREE.Shape();ell(.66).forEach((q,i)=>i?sh.lineTo(q[0],-q[1]):sh.moveTo(q[0],-q[1]));const wm=new THREE.Mesh(new THREE.ShapeGeometry(sh),water2());wm.rotation.x=-Math.PI/2;wm.position.y=-16;world.add(wm);
    ell(1.1).forEach(q=>EXC.push([q[0],q[1],34]));ell(.6).forEach(q=>EXC.push([q[0],q[1],60]));EXC.push([VC.x,VC.z,Math.max(VRA,VRL)*.9]);}
  /* hills: Blue Hills with the observatory, the arboretum, distant ridges */
  const hill=(x,z,rx,h,rz)=>{HILLS.push([x,z,rx,h,rz]);EXC.push([x,z,Math.max(rx,rz)*.9]);};
  {const b=flatP(R128+330,-1180);hill(b.x,b.z,640,215,540);hill(b.x+760,b.z+160,520,150,420);hill(b.x+1350,b.z-60,560,170,460);hill(b.x-150,b.z+700,380,90,330);
    const hy=hillH(b.x,b.z)-2;cyl(5,6,20,stoneM,b.x,hy+10,b.z,world,10);cyl(6.4,6.4,1.5,stoneM,b.x,hy+20,b.z,world,10);box(14,8,10,stoneM,b.x+11,hy+3,b.z,world);cyl(.3,.3,16,M('#ccc',{metalness:.8}),b.x,hy+29,b.z,world,5);}
  {const a=flatP(FHd-140,420);hill(a.x,a.z,300,58,330);}
  [[-4200,1500,900,150,1300],[-4600,3600,1000,190,1400],[-3900,5600,900,140,1100],[1300,4700,700,110,900],[-1200,6400,1200,160,700],[-4300,-400,900,120,1000]].forEach(a=>hill(a[0],a[1],a[2],a[3],a[4]));
}
function buildNature(){
  /* marsh between Route 128 and Canton Junction */
  const m0=R128+190,m1=CJ-130,mt=noiseTex(256,(u,v)=>{const n=fbm(u,v,8),m=N1(u*64,v*64);return n<.4?[40,62,70,235]:[150*(.6+n*.5)+m*20,138*(.6+n*.5)+m*18,78*(.6+n*.5),235];});rep(mt,1,1);
  const mm=new THREE.MeshStandardMaterial({map:mt,roughness:.9,transparent:true,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1.2,polygonOffsetUnits:-1.2});
  [[-12,-250],[TB+12,TB+240]].forEach(o=>{const s=strip(rpos,m0,m1,o[0],.05,o[1],.05,mm,20,170);s.receiveShadow=true;world.add(s);});
  const reeds=[],snags=[];for(let i=0;i<3200;i++){const d=rnd(m0,m1),o=(Math.random()<.5?-1:1)*rnd(13,235)+(TB/2),p=flatP(d,o);(i%14?reeds:snags).push([p.x,p.z]);}
  world.add(inst(new THREE.ConeGeometry(.5,1,5),M('#8f8a4a',{roughness:1}),reeds,1,(it,i,m,dm)=>{const h=rnd(1.3,2.6);dm.position.set(it[0],h/2,it[1]);dm.scale.set(rnd(.16,.4),h,rnd(.16,.4));dm.rotation.set(0,rnd(0,6),0);dm.updateMatrix();m.setMatrixAt(i,dm.matrix);}));
  world.add(inst(new THREE.CylinderGeometry(.08,.3,1,5),M('#6a6258',{roughness:1}),snags,1,(it,i,m,dm)=>{dm.position.set(it[0],3,it[1]);dm.scale.set(1,rnd(4,8),1);dm.rotation.set(rnd(-.1,.1),0,rnd(-.1,.1));dm.updateMatrix();m.setMatrixAt(i,dm.matrix);}));
  /* trees + houses, generated by stretch of line */
  const spots=[],exOK=(x,z)=>EXC.every(c=>(x-c[0])**2+(z-c[1])**2>c[2]*c[2])&&EXS.every(s=>{const ax=s[2]-s[0],az=s[3]-s[1],t=clamp(((x-s[0])*ax+(z-s[1])*az)/(ax*ax+az*az),0,1);return Math.hypot(x-s[0]-ax*t,z-s[1]-az*t)>s[4];});
  const ok=(x,z,r)=>{if(!pip(x,z,MAIN))return false;if(x>-615&&x<175&&z>-860&&z<-70)return false;if(x>-990&&x<-410&&z>40&&z<300)return false;if(Math.hypot(x+2,z-40)<135)return false;const nr=nearRoute(x,z);if(nr[0]<r)return false;if(nr[1]>R1-20&&nr[1]<C2+10&&nr[0]<36)return false;if(nr[1]<R1&&nr[0]<50)return false;if(nr[1]>m0&&nr[1]<m1&&nr[0]<250)return false;if(STN.some(s=>Math.abs(nr[1]-s.d)<90&&nr[0]<24))return false;return exOK(x,z)?nr[1]:false;};
  for(let i=0;i<13000;i++){const d=rnd(R1,RL+60);let o,ty=0,sy=1;const sd=Math.random()<.5?-1:1;
    if(d<FHd){o=sd*rnd(38,i%3?150:340);if(Math.random()<.5){ty=1;sy=d<T2?2.3:1.7;}}
    else if(d<R128){o=sd*rnd(16,i%3?130:380);if(Math.random()<.24){ty=1;sy=d<HP+100?1.5:1;}}
    else if(d<CJ){o=sd*rnd(16,i%2?200:520);if(Math.random()<.04)ty=1;}
    else{o=sd*rnd(15,i%4?110:330);if(Math.random()<(Math.abs(d-CC)<260||d>ST-330?.42:.1)){ty=1;sy=Math.abs(d-CC)<200||d>ST-250?1.5:1;}}
    if(i>5200){if(ty)continue;o=sd*rnd(15,260);}const p=flatP(d,o+TB/2);if(!ty&&i>5200&&fbm(((p.x/640)%1+1)%1,((p.z/640)%1+1)%1,8)<.5)continue;const k=ok(p.x,p.z,ty?30:15);if(k!==false)spots.push([p.x,p.z,ty,sy,k]);}
  for(let i=0;i<1500;i++){const x=rnd(-3600,1000),z=rnd(-2100,6000),k=ok(x,z,24);if(k!==false)spots.push([x,z,i%4===0?1:0,1,k]);}
  for(let i=0;i<15000;i++){const q=rnd(60,SL),o=(Math.random()<.5?-1:1)*rnd(16,i%3?150:430)+TB/2,p=spos(q,o),ty=PST.some(t=>Math.abs(t.s-q)<460)&&Math.random()<.3?1:0;
    if(!ty&&fbm(((p.x/640)%1+1)%1,((p.z/640)%1+1)%1,8)<.47)continue;if(!pip(p.x,p.z,MAIN)||!exOK(p.x,p.z)||nearRoute(p.x,p.z)[0]<22||nearMain(p.x,p.z)[0]<(ty?30:14))continue;spots.push([p.x,p.z,ty,ty?(Math.random()<.4?1.5:1):1,100000+q]);}
  const bins={};spots.forEach(s=>{const b=(s[4]/520|0)+(s[2]?'h':'t');(bins[b]=bins[b]||[]).push(s);});
  const wht=()=>new THREE.MeshStandardMaterial({color:0xffffff,roughness:.95}),roofI=wht();
  const hT=cvs(256,128,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='rgba(0,0,0,.13)';for(let y=0;y<h;y+=8)g.fillRect(0,y,w,1.5);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,h-10,w,10);
    [40,200].forEach(x=>{g.fillStyle='#39424d';g.fillRect(x-22,30,10,50);g.fillRect(x+12,30,10,50);glassFill(g,30,50);g.fillRect(x-12,30,24,50);g.strokeStyle='#fff';g.lineWidth=3;g.strokeRect(x-12,30,24,50);g.beginPath();g.moveTo(x-12,55);g.lineTo(x+12,55);g.stroke();});
    g.fillStyle='#5a2f25';g.fillRect(108,44,40,84);g.strokeStyle='#fff';g.lineWidth=4;g.strokeRect(108,44,40,84);});
  const hM=new THREE.MeshStandardMaterial({map:hT,roughness:.85}),hG=new THREE.BoxGeometry(10,6,8),rG=gable(11,4,9),hc=['#efe6d2','#cfdbe6','#e3c9b6','#d5dcc0','#e9d79a','#b9c6d8','#d9b9b6','#f4f4f0','#9aa7b0','#b5553f','#8d4a3a','#a85a45'];
  Object.keys(bins).forEach(b=>{const L=bins[b];if(b.endsWith('h')){
      world.add(inst(hG,hM,L,1,(s,i,m,dm,col)=>{s.r=rnd(0,6);dm.scale.set(1,s[3],1);dm.position.set(s[0],3*s[3],s[1]);dm.rotation.set(0,s.r,0);dm.updateMatrix();m.setMatrixAt(i,dm.matrix);m.setColorAt(i,col.set(hc[(Math.random()*(s[3]>1.6?hc.length:9))|0]).convertSRGBToLinear());}));
      world.add(inst(rG,roofI,L,1,(s,i,m,dm,col)=>{dm.scale.set(1,s[3]>2?.12:1,1);dm.position.set(s[0],6*s[3],s[1]);dm.rotation.set(0,s.r,0);dm.updateMatrix();m.setMatrixAt(i,dm.matrix);m.setColorAt(i,col.set(['#3a3d44','#4a3a30','#2f3238','#5a3a32'][i%4]).convertSRGBToLinear());}));
    }else addTrees(L);});
  /* people (instanced) */
  const pc=['#b5452b','#27578f','#2f7a4a','#c79a1c','#6d3a86','#b65a85','#3b4a6b','#555','#8a8f98'],sk=['#e8bf9a','#c99772','#8d5e3f','#f0cfae'],wm=()=>new THREE.MeshStandardMaterial({color:0xffffff,roughness:.8});
  const mk=(geo,yo,cols)=>{const m=new THREE.InstancedMesh(geo,wm(),PEOPLE.length),dm=new THREE.Object3D(),col=new THREE.Color();PEOPLE.forEach((p,i)=>{dm.position.set(p[0],p[1]+yo,p[2]);dm.updateMatrix();m.setMatrixAt(i,dm.matrix);m.setColorAt(i,col.set(cols[(i*7+3)%cols.length]).convertSRGBToLinear());});m.frustumCulled=false;world.add(m);};
  mk(new THREE.CylinderGeometry(.3,.26,.9,8),.45,['#2b3040','#3a3a3a','#4a5a78']);mk(new THREE.CylinderGeometry(.3,.38,1.3,10),1.4,pc);mk(new THREE.SphereGeometry(.3,10,8),2.3,sk);
  /* clouds */
  const cT=cvs(256,128,g=>{for(let i=0;i<22;i++){const x=rnd(50,206),y=rnd(52,84),r=rnd(22,46),gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.75)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,256,128);}});
  for(let i=0;i<70;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:cT,transparent:true,depthWrite:false,fog:false,opacity:rnd(.6,.95)}));const k=rnd(900,2200);s.scale.set(k,k*.5,1);s.position.set(rnd(-9000,9000),rnd(1100,2000),rnd(-8000,17000));world.add(s);}
}
function buildLogan(){
  const rwT=cvs(128,256,(g,w,h)=>{g.fillStyle='#2f3237';g.fillRect(0,0,w,h);for(let i=0;i<1200;i++){g.fillStyle='rgba(255,255,255,'+rnd(0,.05)+')';g.fillRect(rnd(0,w),rnd(0,h),2,2);}g.fillStyle='rgba(15,15,15,.35)';g.fillRect(w*.3,0,w*.4,h);g.fillStyle='#e9e9e4';g.fillRect(w/2-2,0,4,h*.55);g.fillRect(5,0,3,h);g.fillRect(w-8,0,3,h);});
  const rw=(x1,z1,x2,z2)=>{const l=Math.hypot(x2-x1,z2-z1),t=rwT.clone();t.needsUpdate=true;rep(t,1,l/60);const m=new THREE.Mesh(new THREE.PlaneGeometry(46,l),flat('#ffffff',2,{map:t}));m.rotation.x=-Math.PI/2;m.rotation.z=-Math.atan2(x2-x1,z2-z1)+Math.PI;m.position.set((x1+x2)/2,.1,(z1+z2)/2);world.add(m);};
  rw(1620,-330,620,-330);rw(1000,-200,1500,-1100);rw(760,-260,1230,-1160);rw(700,-1100,1560,-420);
  const ap=new THREE.Mesh(new THREE.CircleGeometry(215,32),flat('#ffffff',1,{map:rep(concTex.clone(),14,14)}));ap.material.map.needsUpdate=true;ap.rotation.x=-Math.PI/2;ap.position.set(650,.08,-640);world.add(ap);
  for(let k=0;k<4;k++){const a=Math.PI*(.62+k*.25),x=640+Math.cos(a)*105,z=-640+Math.sin(a)*105,t=tower(x,z,86,15,30,1,-a+Math.PI/2);box(90,1,34,M('#d7dbe2',{roughness:.5}),x,15.5,z,world).rotation.y=t.rotation.y;
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(12,12),new THREE.MeshBasicMaterial({map:cvs(64,64,g=>{g.fillStyle='#1f5fbf';g.fillRect(0,0,64,64);g.fillStyle='#fff';g.font='800 52px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('ABCE'[k],32,35);})}));sg.position.set(640+Math.cos(a)*88,24,-640+Math.sin(a)*88);sg.lookAt(640+300,24,-640);world.add(sg);}
  const tw=M('#cfc9bb',{roughness:.8});[-6,6].forEach(x=>cyl(3.2,3.6,84,tw,700+x,42,-830,world,16));box(24,6,12,tw,700,50,-830,world);box(26,11,20,M('#1c3246',{roughness:.08,metalness:.9}),700,89,-830,world);box(28,2,22,tw,700,95.5,-830,world);cyl(.5,.5,14,M('#c33'),700,103,-830,world,6);
  ['#b3261f','#1f5fbf','#2e8b57','#d9821a','#6f2c91'].forEach((c,k)=>{const a=-1+k*.5,p=makePlane(c);p.position.set(640+Math.cos(a)*170,3.25,-640+Math.sin(a)*170);p.rotation.y=Math.atan2(-Math.cos(a),-Math.sin(a));world.add(p);});
}
