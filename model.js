'use strict';
/* =====================================================================
   MODEL TRAIN TABLE: terrain, lots of pieces, tunnels, and a wild coaster mode
   ===================================================================== */
let model=null;
const MT={W:160,D:110,tool:'look',az:.55,el:.78,dist:108,tx:0,tz:0,d:0,style:0,lay:0,ride:false,chuffD:0,wild:false,smoke:true,v:0,fw:0,night:0};
const UP=new V3(0,1,0),_mx=new V3(),_my=new V3(),_mz=new V3(),_mm=new THREE.Matrix4();
const MSTY=[['steam','tender','box:#b5412e','tank:#f0f0f4','box:#2f8f5b','caboose'],['loco','coach','coach','coach'],['bullet','bulletmid','bulletmid','bulletT']],MICON=['🚂','🚆','🚄'];
function layoutPts(k){const p=[];if(k===0)for(let i=0;i<24;i++){const a=i/24*6.2832;p.push([Math.cos(a)*64,Math.sin(a)*40]);}
  else if(k===1)for(let i=0;i<30;i++){const a=i/30*6.2832;p.push([Math.sin(a)*66,Math.sin(2*a)*38]);}
  else if(k===2)for(let i=0;i<32;i++){const a=i/32*6.2832,r=1+.28*Math.sin(3*a);p.push([Math.cos(a)*56*r,Math.sin(a)*36*r]);}
  else for(let i=0;i<40;i++){const a=i/40*6.2832,r=1+.16*Math.sin(5*a)+.1*Math.cos(2*a);p.push([Math.cos(a)*60*r,Math.sin(a)*40*r]);}
  return p;}
/* wild coaster: climb, big drop, a vertical loop, a helix */
function wildPts(){const P=[[-56,1.2,44],[-20,1.2,46],[20,1.2,44],[52,3,36],[68,8,16],[66,15,-10],[52,22,-30],[26,28,-42],[4,20,-42],[-10,6,-40]];
  const cx=-30,cy=13.5,cz=-40,R=11;for(let k=0;k<=8;k++){const t=k/8*6.2832;P.push([cx-R*Math.sin(t)-k*.4,cy-R*Math.cos(t),cz+k*.75]);}
  P.push([-50,3,-32],[-66,4,-20]);for(let k=0;k<=10;k++){const t=k/10*6.2832*1.5;P.push([-52+14*Math.cos(t+Math.PI),5+k*1.1-(k>6?(k-6)*3.4:0),2+14*Math.sin(t+Math.PI)*-1]);}
  P.push([-70,2,26],[-68,1.4,38]);return P;}
/* ---------- terrain ---------- */
function TH0(x,z){let y=0;for(const f of model.feat){const dx=x-f.x,dz=z-f.z,r2=(dx*dx+dz*dz)/(f.r*f.r);if(r2>=1)continue;const k=(1-r2)*(1-r2);
    if(f.t==='hill')y=Math.max(y,f.h*k);else{const n=fbm(((x/61)%1+1)%1,((z/61)%1+1)%1,8),rd=1-Math.abs(2*n-1);let h=f.h*k*(.62+.6*rd);if(f.t==='volcano'){const c=Math.sqrt(r2);if(c<.2)h=Math.min(h,f.h*(.52+c*1.6));}y=Math.max(y,h);}}return y;}
function gridH(x,z){const W=MT.W,D=MT.D,fx=clamp(x+W/2,0,W-.001),fz=clamp(z+D/2,0,D-.001),ix=fx|0,iz=fz|0,a=fx-ix,b=fz-iz,H=model.hgt,n=W+1;return (H[iz*n+ix]*(1-a)+H[iz*n+ix+1]*a)*(1-b)+(H[(iz+1)*n+ix]*(1-a)+H[(iz+1)*n+ix+1]*a)*b;}
function rebuildTerrain(){
  const W=MT.W,D=MT.D,n=W+1,g=model.terr.geometry,p=g.attributes.position,S=[],bk={},key=(x,z)=>((x/5)|0)+'_'+((z/5)|0);
  while(model.portals.children.length)model.portals.remove(model.portals.children[0]);
  if(!MT.wild){let prev=null;for(let d=0;d<model.L;d+=.7){const q=model.pos(d),fl=TH0(q.x,q.z)>4.8?1:0,s=[q.x,q.z,fl];S.push(s);const k=key(q.x+200,q.z+200);(bk[k]=bk[k]||[]).push(s);
      if(prev!==null&&prev!==fl){const t=model.tan(d),m=new THREE.Group(),st=M('#8d8a84',{roughness:.95});box(.7,3.6,.8,st,-1.7,1.8,0,m);box(.7,3.6,.8,st,1.7,1.8,0,m);box(4.3,.9,.8,st,0,3.9,0,m);box(2.7,3.3,.1,new THREE.MeshBasicMaterial({color:0x050505}),0,1.7,fl?.5:-.5,m);m.position.set(q.x,0,q.z);m.rotation.y=Math.atan2(t.x,t.z);model.portals.add(shadowize(m));}prev=fl;}}
  const col=[],cg=C('#5e9a48'),ch=C('#4a7f3a'),cr=C('#807a70'),cs=C('#f4f6f8'),cl=C('#d8431c'),cd=C('#3a3431'),c=new THREE.Color();
  for(let iz=0;iz<=D;iz++)for(let ix=0;ix<=W;ix++){const x=ix-W/2,z=iz-D/2;let h=TH0(x,z);
      if(h>.01&&S.length){let dm=99,fl=0;const kx=((x+200)/5)|0,kz=((z+200)/5)|0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const L=bk[(kx+a)+'_'+(kz+b)];if(L)for(const s of L){const q=(s[0]-x)**2+(s[1]-z)**2;if(q<dm){dm=q;fl=s[2];}}}
        if(dm<36&&!fl)h*=ss(1.5,5.5,Math.sqrt(dm));}
      const e=Math.min(ix,W-ix,iz,D-iz);if(e<3)h*=e/3;model.hgt[iz*n+ix]=h;p.setY(iz*n+ix,h);}
  g.computeVertexNormals();const nr=g.attributes.normal;
  for(let i=0;i<p.count;i++){const h=p.getY(i),sl=1-nr.getY(i),x=p.getX(i),z=p.getZ(i);let vol=null;for(const f of model.feat)if(f.t==='volcano'&&Math.hypot(x-f.x,z-f.z)<f.r)vol=f;
    c.copy(cg).lerp(ch,clamp(h/5,0,1)).lerp(cr,clamp(sl*3.4-.3+(h-9)/9,0,1));if(vol){c.lerp(cd,clamp(h/6,0,1));if(Math.hypot(x-vol.x,z-vol.z)<vol.r*.2)c.lerp(cl,.9);}else if(h>17)c.lerp(cs,clamp((h-17)/4,0,1)*(1-clamp(sl*2.2-.5,0,1)));col.push(c.r,c.g,c.b);}
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));p.needsUpdate=true;
  model.scen.children.forEach(o=>{if(!o.userData.fly)o.position.y=gridH(o.position.x,o.position.z)+(o.userData.y0||0);});
}
/* ---------- track ---------- */
function setPath(pts,wild){
  const c=new THREE.CatmullRomCurve3(pts.map(p=>wild?new V3(p[0],p[1],p[2]):new V3(p[0],0,p[1])),true,'centripetal');c.arcLengthDivisions=1200;model.curve=c;model.L=c.getLength();
  const wrap=d=>((d/model.L)%1+1)%1;model.pos=d=>c.getPointAt(wrap(d));model.tan=d=>c.getTangentAt(wrap(d));
  if(wild){const N=700,F=c.computeFrenetFrames(N,true),t0=F.tangents[0],u0=UP.clone().addScaledVector(t0,-UP.dot(t0)).normalize(),n0=F.normals[0],th=Math.atan2(new V3().crossVectors(n0,u0).dot(t0),n0.dot(u0)),ups=F.normals.map((nn,i)=>nn.clone().multiplyScalar(Math.cos(th)).addScaledVector(new V3().crossVectors(F.tangents[i],nn),Math.sin(th)));
    model.up=d=>{const f=wrap(d)*N,i=f|0;return ups[i].clone().lerp(ups[Math.min(N,i+1)],f-i).normalize();};}
  else model.up=()=>UP.clone();
  while(model.track.children.length){const m=model.track.children.pop();if(m.geometry)m.geometry.dispose();}
  const A=(d,o,h)=>{const p=model.pos(d),u=model.up(d),l=new V3().crossVectors(u,model.tan(d)).normalize();return p.addScaledVector(l,o).addScaledVector(u,h);},L=model.L,st=wild?.5:.6;
  model.track.add(strip2(d=>A(d,-.83,.24),d=>A(d,.83,.24),0,L,wild?model.neon:trackMat,st,wild?6:.48));
  if(wild)model.track.add(strip2(d=>A(d,-.83,.1),d=>A(d,.83,.1),0,L,M('#20232b',{side:THREE.DoubleSide}),st));
  [-.24,.24].forEach(r=>{model.track.add(strip2(d=>A(d,r-.024,.33),d=>A(d,r+.024,.33),0,L,wild?model.glow:railTop,st));if(!wild){model.track.add(strip2(d=>A(d,r-.024,.24),d=>A(d,r-.024,.33),0,L,railSide,st));model.track.add(strip2(d=>A(d,r+.024,.24),d=>A(d,r+.024,.33),0,L,railSide,st));}});
  if(wild){const sm=M('#c9ccd4',{metalness:.8,roughness:.35});for(let d=0;d<L;d+=5){const p=model.pos(d),u=model.up(d);if(p.y>1.6&&u.y>.35){const h=p.y-.1;cyl(.14,.2,h,sm,p.x,h/2,p.z,model.track,6);}}
    model.track.children.forEach(m=>{m.userData.noCast=false;});shadowize(model.track);}
  model.track.children.forEach(m=>m.receiveShadow=true);
}
function wildCar(k){const g=new THREE.Group();
  if(k==='rocket'){const b=cyl(1.5,1.5,13,M('#e9ecf1',{roughness:.2,metalness:.7}),0,2.6,0,g,18);b.rotation.x=Math.PI/2;const n=cyl(0,1.5,5,M('#e02d2d',{roughness:.3}),0,2.6,9,g,18);n.rotation.x=Math.PI/2;[0,1,2,3].forEach(i=>{const f=box(.2,3,3.4,M('#e02d2d'),0,0,0,g);f.position.set(Math.sin(i*1.571)*2,2.6+Math.cos(i*1.571)*2,-5.4);f.rotation.z=-i*1.571;});
    box(1.6,.9,2.4,M('#18222e',{roughness:.05,metalness:.9}),0,3.75,3,g);const fl=cyl(1.2,0,5,new THREE.MeshBasicMaterial({color:C('#ffb21a'),transparent:true,opacity:.9}),0,2.6,-9,g,12);fl.rotation.x=Math.PI/2;g.userData.flame=fl;bogies(g,[4,-4]);}
  else{const hue=Math.random();const m=new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(hue,.85,.5).convertSRGBToLinear(),roughness:.3,metalness:.3,emissive:new THREE.Color().setHSL(hue,.9,.25).convertSRGBToLinear()});box(3.1,2.2,17,m,0,2.1,0,g);box(3.3,.3,17.4,M('#f2c230'),0,3.3,0,g);for(let i=-2;i<=2;i++){sph(.75,M(['#f1c9a5','#c99772','#8d5e3f'][Math.abs(i)%3]),0,4.1,i*3.2,g);}bogies(g);}
  return shadowize(g);}
function setStyle(i){MT.style=i;if(model.consist)model.consist.remove();
  if(MT.wild){const cars=['rocket','party','party','party'].map(k=>{const c=wildCar(k);c.scale.setScalar(.3);model.scene.add(c);return c;});model.consist={cars,remove(){cars.forEach(c=>model.scene.remove(c));}};$('mtrain').textContent='🚀';}
  else{model.consist=new Consist(MSTY[i],.3,model.scene);$('mtrain').textContent=MICON[i];}}
function placeTrain(){const s=.3;model.consist.cars.forEach((c,i)=>{const cd=MT.d-(10+i*22)*s,a=model.pos(cd+7*s),b=model.pos(cd-7*s),u=model.up(cd);_mz.subVectors(a,b).normalize();_mx.crossVectors(u,_mz).normalize();_my.crossVectors(_mz,_mx);_mm.makeBasis(_mx,_my,_mz);c.quaternion.setFromRotationMatrix(_mm);c.position.addVectors(a,b).multiplyScalar(.5).addScaledVector(_my,.33);});}
/* ---------- pieces ---------- */
const PIECES={
  tree(g){cyl(.3,.42,2.2,M('#5a4028'),0,1.1,0,g,6);[[0,3.6,0,1.9],[.9,3,.4,1.3],[-.8,3.1,-.5,1.4],[0,4.9,0,1.3]].forEach(a=>{const s=sph(a[3],M(['#3f7a3a','#35692f','#4d8a42'][(Math.random()*3)|0],{roughness:1}),a[0],a[1],a[2],g);s.scale.y=.85;});g.scale.setScalar(rnd(.8,1.25));},
  pine(g){cyl(.25,.35,1.6,M('#4a3626'),0,.8,0,g,6);[[2,3.2,2.2],[1.5,2.8,4.2],[1,2.4,6]].forEach(a=>{const c=new THREE.Mesh(new THREE.ConeGeometry(a[0],a[1],9),M('#264a2c',{roughness:1}));c.position.y=a[2];g.add(c);});g.scale.setScalar(rnd(.8,1.3));},
  house(g){box(5,3.2,4,M(['#f3ead7','#d9e6f2','#f7e6a6','#f2c9c2','#b5553f'][(Math.random()*5)|0]),0,1.6,0,g);const r=new THREE.Mesh(gable(5.6,2.2,4.6),M('#5a3a32'));r.position.y=3.2;g.add(r);box(1,1.8,.1,M('#6b4a2f'),0,.9,2.02,g);[-1.5,1.5].forEach(x=>box(1,1,.1,M('#18222e',{roughness:.1,metalness:.8}),x,1.9,2.02,g));box(.6,1.6,.6,M('#8a4a3a'),1.4,4.2,-.6,g);g.rotation.y=rnd(-.4,.4);},
  station(g,x,z){box(14,.7,4.6,M('#b8bcc2'),0,.35,0,g);box(7,3,3,bt[2],0,2.2,.6,g);const r=new THREE.Mesh(gable(14,1.6,5.4),M('#4a3550'));r.position.y=3.9;g.add(r);[-6,6].forEach(q=>cyl(.15,.15,3.4,M('#444b5e'),q,2.2,-1.9,g,6));const sg=new THREE.Mesh(new THREE.PlaneGeometry(4.4,1.1),new THREE.MeshBasicMaterial({map:signTex('STATION')}));sg.position.set(0,3.1,-.95);sg.rotation.y=Math.PI;g.add(sg);
    let b=1e9,bt2=null;for(let i=0;i<240;i++){const p=model.curve.getPointAt(i/240),q=(p.x-x)**2+(p.z-z)**2;if(q<b){b=q;bt2=model.curve.getTangentAt(i/240);}}if(bt2)g.rotation.y=Math.atan2(bt2.x,bt2.z)+Math.PI/2;},
  barn(g){box(7,4,9,M('#a3271f'),0,2,0,g);const r=new THREE.Mesh(gable(7.6,3,9.6),M('#4a4f58'));r.position.y=4;g.add(r);box(2.6,3,.1,M('#f4f1ea'),0,1.5,4.52,g);cyl(1.6,1.6,7.5,M('#c9ccd4',{metalness:.6,roughness:.4}),6,3.75,-2,g,14);sph(1.6,M('#9aa0ab',{metalness:.6}),6,7.5,-2,g).scale.y=.6;},
  church(g){box(5,5,9,M('#f4f1ea'),0,2.5,0,g);const r=new THREE.Mesh(gable(5.6,3,9.6),M('#3a3d44'));r.position.y=5;g.add(r);box(2.6,9,2.6,M('#f4f1ea'),0,4.5,5,g);const s=cyl(0,1.8,5,M('#3a3d44'),0,11.5,5,g,4);s.rotation.y=Math.PI/4;},
  windmill(g,x,z,an){cyl(1.2,2,7,M('#e9dcc0'),0,3.5,0,g,10);cyl(0,1.5,1.6,M('#7a3b2e'),0,7.8,0,g,10);const w=new THREE.Group();w.position.set(0,6.4,1.5);[0,1,2,3].forEach(i=>{const b=box(.9,5,.1,M('#f4f1ea'),0,0,0,w);b.position.set(Math.sin(i*1.571)*2.6,Math.cos(i*1.571)*2.6,0);b.rotation.z=-i*1.571;});g.add(w);an.push(dt=>w.rotation.z+=dt*1.6);},
  tower(g){[[1.6,1.6],[1.6,-1.6],[-1.6,1.6],[-1.6,-1.6]].forEach(a=>{const l=cyl(.14,.14,7,M('#6b6f76',{metalness:.7}),a[0],3.5,a[1],g,6);});cyl(2.6,2.6,3.2,M('#9fb7c8',{metalness:.5,roughness:.4}),0,8.4,0,g,16);cyl(0,2.8,1.4,M('#6b7f8f',{metalness:.5}),0,10.7,0,g,16);},
  lighthouse(g,x,z,an){cyl(1.2,2,10,M('#f4f1ea'),0,5,0,g,14);[2.5,6].forEach(y=>cyl(1.75-y*.08,1.8-y*.08,1.6,M('#c8322b'),0,y,0,g,14));cyl(1.5,1.5,.3,M('#22252b'),0,10.1,0,g,14);const l=cyl(1,1,1.4,new THREE.MeshBasicMaterial({color:C('#fff3a0')}),0,10.9,0,g,12);cyl(0,1.4,1.2,M('#c8322b'),0,12.2,0,g,12);an.push(()=>l.material.color.setScalar(.6+.4*Math.sin(performance.now()*.006)));},
  castle(g){box(9,5,9,M('#9a9690'),0,2.5,0,g);[[4.5,4.5],[4.5,-4.5],[-4.5,4.5],[-4.5,-4.5]].forEach(a=>{cyl(1.6,1.6,8,M('#8a8680'),a[0],4,a[1],g,10);cyl(0,2,2.6,M('#b3261f'),a[0],9.3,a[1],g,10);});box(2.2,3,.2,M('#3d2d20'),0,1.5,4.55,g);for(let i=-3;i<=3;i+=2)box(1,1,1,M('#9a9690'),i,5.5,4.2,g);},
  ferris(g,x,z,an){[[-1,0],[1,0]].forEach(a=>{const l=box(.25,9,.25,M('#5a6b8a'),a[0]*2,4.2,0,g);l.rotation.z=a[0]*.24;});const w=new THREE.Group();w.position.y=8.2;const rim=new THREE.Mesh(new THREE.TorusGeometry(6,.16,6,28),M('#e23d3d'));w.add(rim);for(let i=0;i<8;i++){const a=i/8*6.283,s=box(.1,12,.1,M('#ddd'),0,0,0,w);s.rotation.z=a;const c=box(1.2,1,1,M(['#ffd23f','#35c46a','#1f7ae0','#e2572b'][i%4]),Math.cos(a)*6,Math.sin(a)*6,0,w);c.userData.cab=1;}g.add(w);an.push(dt=>{w.rotation.z+=dt*.5;w.children.forEach(c=>{if(c.userData.cab)c.rotation.z=-w.rotation.z;});});},
  sky(g){const h=rnd(12,22);const m=new THREE.Mesh(new THREE.BoxGeometry(5,h,5),bt[(Math.random()*6)|0]);m.position.y=h/2;g.add(m);box(2.4,1,2.4,M('#8b8f96'),0,h+.5,0,g);},
  cow(g){const w=M('#fafafa'),k=M('#222');box(1.2,1.2,2.4,w,0,1.5,0,g);box(1.22,.7,.9,k,0,1.6,-.3,g);box(.9,.9,.9,w,0,1.9,1.5,g);box(.92,.4,.4,M('#f3a6b5'),0,1.6,1.85,g);[[.4,.8],[-.4,.8],[.4,-.8],[-.4,-.8]].forEach(a=>box(.3,1,.3,k,a[0],.5,a[1],g));g.rotation.y=rnd(0,6.28);g.scale.setScalar(.8);},
  horse(g){const b=M(['#6b4a2f','#3a2a1e','#c9a36a'][(Math.random()*3)|0]);box(.9,1.1,2.6,b,0,1.9,0,g);const n=box(.6,1.5,.7,b,0,2.7,1.3,g);n.rotation.x=.5;box(.5,.6,1.1,b,0,3.3,1.9,g);[[.3,.9],[-.3,.9],[.3,-.9],[-.3,-.9]].forEach(a=>box(.25,1.4,.25,b,a[0],.7,a[1],g));box(.15,1,.15,M('#222'),0,1.9,-1.4,g).rotation.x=-.5;g.rotation.y=rnd(0,6.28);g.scale.setScalar(.8);},
  people(g){for(let i=0;i<3;i++){const x=rnd(-1.2,1.2),z=rnd(-1.2,1.2);cyl(.28,.24,.8,M('#2b3040'),x,.4,z,g,8);cyl(.28,.34,1.1,M(['#b5452b','#27578f','#2f7a4a','#c79a1c','#6d3a86'][(Math.random()*5)|0]),x,1.3,z,g,8);sph(.27,M(['#e8bf9a','#c99772','#8d5e3f'][i%3]),x,2.1,z,g);}},
  car(g){car(g,0,0,0,rnd(0,6.28));g.scale.setScalar(.75);},
  dino(g,x,z,an){const m=M('#3f8f4a',{roughness:.8}),b=box(1.6,2.2,3.4,m,0,3,0,g);b.rotation.x=-.35;const n=box(1.1,2.2,1.1,m,0,4.6,1.6,g);const hd=box(1.3,1.2,2.2,m,0,5.7,2.3,g);box(1.32,.2,1.2,M('#fff'),0,5.25,2.9,g);const t=box(.9,.9,3.6,m,0,2.2,-2.6,g);t.rotation.x=.3;[[.6,0],[-.6,0]].forEach(a=>box(.6,2,.8,m,a[0],1,a[1],g));[[.8,1.4],[-.8,1.4]].forEach(a=>box(.25,.8,.25,m,a[0],3.4,a[1],g));sph(.15,M('#111'),.66,6,2.9,g);sph(.15,M('#111'),-.66,6,2.9,g);g.rotation.y=rnd(0,6.28);an.push(()=>{hd.rotation.x=Math.sin(performance.now()*.003+x)*.15;});},
  balloon(g,x,z,an){const b=sph(3,M(['#e23d3d','#1f7ae0','#ffd23f','#35c46a'][(Math.random()*4)|0],{roughness:.5}),0,7,0,g);b.scale.y=1.2;const c=new THREE.Mesh(new THREE.ConeGeometry(2.4,3,12,1,true),b.material);c.position.y=3.2;c.rotation.x=Math.PI;g.add(c);box(1.1,.9,1.1,M('#8a5f3c'),0,.9,0,g);g.userData.fly=1;const y0=rnd(10,20),ph=rnd(0,6);an.push(()=>{g.position.y=y0+Math.sin(performance.now()*.0008+ph)*2;});},
  rocks(g){for(let i=0;i<4;i++){const r=new THREE.Mesh(new THREE.IcosahedronGeometry(rnd(.6,1.3),0),new THREE.MeshStandardMaterial({color:C('#807a70'),roughness:1,flatShading:true}));r.position.set(rnd(-1.5,1.5),.5,rnd(-1.5,1.5));r.rotation.set(rnd(0,3),rnd(0,3),0);g.add(r);}},
  signal(g,x,z,an){cyl(.12,.12,4.4,M('#444b5e'),0,2.2,0,g,6);box(.8,1.9,.5,M('#16181c'),0,4.6,0,g);const a=new THREE.MeshBasicMaterial({color:0x39ff6a}),b=new THREE.MeshBasicMaterial({color:0x400000});sph(.24,a,0,5.1,.3,g);sph(.24,b,0,4.2,.3,g);an.push(()=>{const k=(performance.now()/1400|0)%2;a.color.set(k?0x39ff6a:0x063010);b.color.set(k?0x400000:0xff2a2a);});},
  pond(g){const w=new THREE.Mesh(new THREE.CircleGeometry(1,28),water2());w.rotation.x=-Math.PI/2;w.scale.set(rnd(6,9),rnd(4,6),1);w.position.y=.12;g.add(w);const s=new THREE.Mesh(new THREE.RingGeometry(.94,1.1,28),flat('#b9a77a',1));s.rotation.x=-Math.PI/2;s.scale.copy(w.scale);s.position.y=.1;g.add(s);g.rotation.y=rnd(0,3);}
};
function addScen(kind,x,z){const g=new THREE.Group();PIECES[kind](g,x,z,model.anim);g.userData.kind=kind;g.userData.y0=.15;g.position.set(x,(g.userData.fly?0:gridH(x,z))+.15,z);model.scen.add(shadowize(g));return g;}
function addFeat(t,x,z){model.feat.push({t,x,z,r:t==='hill'?rnd(12,17):t==='volcano'?24:rnd(24,30),h:t==='hill'?rnd(3,4.4):t==='volcano'?20:rnd(22,28)});rebuildTerrain();
  if(t!=='hill'){const f=model.feat[model.feat.length-1];for(let i=0;i<(t==='volcano'?0:16);i++){const a=rnd(0,6.283),r=rnd(.45,.95)*f.r,px=f.x+Math.cos(a)*r,pz=f.z+Math.sin(a)*r;if(Math.abs(px)<MT.W/2-3&&Math.abs(pz)<MT.D/2-3&&gridH(px,pz)<15&&gridH(px,pz)>.5)addScen('pine',px,pz);}}}
function eraseAt(x,z){let best=null,bd=64;model.scen.children.forEach(o=>{const q=(o.position.x-x)**2+(o.position.z-z)**2;if(q<bd){bd=q;best=o;}});if(best){model.scen.remove(best);return true;}
  const i=model.feat.findIndex(f=>Math.hypot(f.x-x,f.z-z)<f.r*.7);if(i>=0){model.feat.splice(i,1);rebuildTerrain();return true;}return false;}
/* ---------- scene ---------- */
function buildModel(){
  const s=new THREE.Scene();s.background=C('#d8cdbd');s.environment=ENV;const hemi2=new THREE.HemisphereLight(0xfff6e8,0x8a7358,.45);s.add(hemi2);
  const l=new THREE.DirectionalLight(0xfff0d8,2.1);l.position.set(100,190,120);l.castShadow=true;l.shadow.mapSize.set(2048,2048);const sc=l.shadow.camera;sc.left=-125;sc.right=125;sc.top=125;sc.bottom=-125;sc.near=20;sc.far=560;l.shadow.bias=-.0004;l.shadow.normalBias=.14;s.add(l);
  const wood=cvs(512,512,(g,w,h)=>{g.fillStyle='#b98a55';g.fillRect(0,0,w,h);for(let i=0;i<260;i++){g.strokeStyle='rgba('+(i%2?'90,60,30':'225,185,130')+','+rnd(.08,.3)+')';g.lineWidth=rnd(.6,2.4);g.beginPath();const y=rnd(0,h);g.moveTo(0,y);g.bezierCurveTo(w*.3,y+rnd(-9,9),w*.7,y+rnd(-9,9),w,y+rnd(-4,4));g.stroke();}});wood.wrapS=wood.wrapT=THREE.RepeatWrapping;
  const wm=new THREE.MeshStandardMaterial({map:wood,roughness:.45}),flT=cvs(512,512,(g,w,h)=>{for(let r=0;r<8;r++){for(let c=0;c<2;c++){g.fillStyle=shade('#8a5f3c',rnd(.8,1.1));g.fillRect(c*256+(r%2?128:0)-128,r*64,256,64);g.fillRect(c*256+(r%2?128:0)+384,r*64,256,64);}g.fillStyle='rgba(30,18,8,.6)';g.fillRect(0,r*64,w,2);}});rep(flT,7,7);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(900,900),new THREE.MeshStandardMaterial({map:flT,roughness:.4}));fl.rotation.x=-Math.PI/2;fl.position.y=-52;s.add(fl);
  const wall=new THREE.MeshStandardMaterial({color:C('#e6ddcf'),roughness:.95});[[0,-300,0],[-300,0,Math.PI/2],[300,0,-Math.PI/2],[0,300,Math.PI]].forEach(a=>{const w=new THREE.Mesh(new THREE.PlaneGeometry(900,420),wall);w.position.set(a[0],158,a[1]);w.rotation.y=a[2];s.add(w);});
  box(MT.W+10,4,MT.D+10,wm,0,-2.15,0,s);[[1,1],[1,-1],[-1,1],[-1,-1]].forEach(a=>box(6,50,6,wm,a[0]*(MT.W/2-2),-28,a[1]*(MT.D/2-2),s));
  const gm=noiseTex(256,(u,v)=>{const k=.72+fbm(u,v,8)*.36+(N1(u*64,v*64)-.5)*.3;return [255*k,255*k,255*k];});rep(gm,7,5);
  const tg=new THREE.PlaneGeometry(MT.W,MT.D,MT.W,MT.D);tg.rotateX(-Math.PI/2);const terr=new THREE.Mesh(tg,new THREE.MeshStandardMaterial({map:gm,vertexColors:true,roughness:1,side:THREE.DoubleSide}));terr.receiveShadow=true;terr.castShadow=true;terr.position.y=.02;s.add(terr);
  const neonT=cvs(64,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);['#ff3b6b','#ffb21a','#f7f03a','#39e06a','#2aa8ff','#a05cff','#ff3b6b'].forEach((c,i)=>gr.addColorStop(i/6,c));g.fillStyle=gr;g.fillRect(0,0,w,h);g.fillStyle='rgba(0,0,0,.35)';for(let y=0;y<h;y+=16)g.fillRect(0,y,w,5);});neonT.wrapS=neonT.wrapT=THREE.RepeatWrapping;
  model={scene:s,terr,hgt:new Float32Array((MT.W+1)*(MT.D+1)),feat:[],anim:[],track:new THREE.Group(),scen:new THREE.Group(),portals:new THREE.Group(),consist:null,smoke:[],fx:[],dots:null,draw:[],hemi:hemi2,sun:l,wall,
    neon:new THREE.MeshBasicMaterial({map:neonT,side:THREE.DoubleSide}),glow:new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}),stars:new THREE.Group()};
  s.add(model.track,model.scen,model.portals,model.stars);model.stars.visible=false;const stm=new THREE.MeshBasicMaterial({color:0xffffff});for(let i=0;i<160;i++){const a=rnd(0,6.283),e=rnd(.1,1.3);sph(rnd(.5,1.2),stm,Math.cos(a)*Math.cos(e)*270,Math.sin(e)*270-20,Math.sin(a)*Math.cos(e)*270,model.stars);}
  for(let i=0;i<10;i++){const p=sph(.25,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false}),0,-99,0,s);p.userData.life=0;model.smoke.push(p);}
  for(let i=0;i<90;i++){const p=sph(.35,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false}),0,-99,0,s);p.userData={life:0,v:new V3()};model.fx.push(p);}
  model.dots=new THREE.InstancedMesh(new THREE.CylinderGeometry(.9,.9,.3,10),new THREE.MeshBasicMaterial({color:C('#ffd23f')}),600);model.dots.count=0;s.add(model.dots);
  model.plane=new THREE.Plane(new V3(0,1,0),-.2);shadowize(s);terr.castShadow=true;
  model.feat.push({t:'mount',x:44,z:-22,r:30,h:26},{t:'hill',x:-48,z:26,r:17,h:4.2},{t:'hill',x:-10,z:-34,r:14,h:3.6});
  setPath(layoutPts(0),false);rebuildTerrain();setStyle(0);
  [[-70,-44,'pine'],[-62,-46,'tree'],[70,44,'tree'],[72,34,'pine'],[-70,42,'tree'],[-20,-8,'house'],[-8,-10,'house'],[-14,4,'church'],[0,49,'station'],[-30,10,'cow'],[-36,4,'cow'],[14,6,'barn'],[30,14,'horse'],[-52,-14,'windmill'],[8,-6,'pond'],[66,-2,'tree'],[-72,2,'pine'],[26,-2,'tower'],[-2,20,'people'],[52,-40,'pine'],[60,-36,'pine'],[24,-40,'pine']].forEach(a=>addScen(a[2],a[0],a[1]));
}
function setWild(on){MT.wild=on;$('mwild').classList.toggle('on',on);model.stars.visible=on;model.scene.background=C(on?'#0b0f2a':'#d8cdbd');model.wall.color.copy(C(on?'#141a3a':'#e6ddcf'));model.hemi.intensity=on?.22:.45;model.sun.intensity=on?.9:2.1;
  if(on){if(!model.feat.some(f=>f.t==='volcano'))model.feat.push({t:'volcano',x:20,z:0,r:24,h:20});setPath(wildPts(),true);}else setPath(layoutPts(MT.lay),false);rebuildTerrain();setStyle(MT.style);MT.d=0;MT.v=8;
  msg(on?'🤪 WILD MODE! Hold on tight!':'🚂 Back to the regular railroad',4000);if(on){say('Wild mode! Hold on tight!');snd.fanfare();}}
function mray(e){const r=canvas.getBoundingClientRect(),v=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1)),rc=new THREE.Raycaster();rc.setFromCamera(v,cam);const h=rc.intersectObject(model.terr);if(h.length)return h[0].point;const p=new V3();return rc.ray.intersectPlane(model.plane,p)?p:null;}
function finishDraw(){let pts=model.draw;model.draw=[];model.dots.count=0;let len=0;for(let i=1;i<pts.length;i++)len+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);
  if(pts.length<6||len<90){msg('✏️ Draw a BIG loop on the table!');return;}
  const rs=[pts[0]];let acc=0;for(let i=1;i<pts.length;i++){let a=pts[i-1],b=pts[i],sg=Math.hypot(b[0]-a[0],b[1]-a[1]);while(acc+sg>=9){const t=(9-acc)/sg;a=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];rs.push(a);sg=Math.hypot(b[0]-a[0],b[1]-a[1]);acc=0;}acc+=sg;}
  const f=rs[0],e=rs[rs.length-1];if(Math.hypot(f[0]-e[0],f[1]-e[1])<7&&rs.length>4)rs.pop();
  let c=rs;for(let k=0;k<2;k++){const n=[];for(let i=0;i<c.length;i++){const a=c[i],b=c[(i+1)%c.length];n.push([a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25],[a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75]);}c=n;}
  if(MT.wild)setWild(false);setPath(c.filter((_,i)=>i%2===0),false);rebuildTerrain();MT.d=0;snd.ding();addStar(1);msg('🚂 Your track! Hills get cuts and mountains get tunnels');say('Choo choo!');}
(function(){const P=new Map();let moved=0,pinch=0;
  canvas.addEventListener('pointerdown',e=>{audioInit();if(mode!=='model')return;try{canvas.setPointerCapture(e.pointerId);}catch(x){}P.set(e.pointerId,[e.clientX,e.clientY]);moved=0;if(MT.tool==='draw'&&P.size===1){model.draw=[];model.dots.count=0;MT.ride=false;}});
  canvas.addEventListener('pointermove',e=>{if(mode!=='model'||!P.has(e.pointerId))return;const o=P.get(e.pointerId),dx=e.clientX-o[0],dy=e.clientY-o[1];moved+=Math.abs(dx)+Math.abs(dy);P.set(e.pointerId,[e.clientX,e.clientY]);
    if(P.size===2){const a=[...P.values()],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);if(pinch)MT.dist=clamp(MT.dist*pinch/d,22,240);pinch=d;return;}
    if(MT.tool==='draw'){const p=mray(e);if(p){const x=clamp(p.x,-MT.W/2+5,MT.W/2-5),z=clamp(p.z,-MT.D/2+5,MT.D/2-5),l=model.draw[model.draw.length-1];if(!l||Math.hypot(x-l[0],z-l[1])>2){model.draw.push([x,z]);if(model.dots.count<600){model.dots.setMatrixAt(model.dots.count++,new THREE.Matrix4().makeTranslation(x,gridH(x,z)+.5,z));model.dots.instanceMatrix.needsUpdate=true;}}}}
    else if(MT.tool==='look'){MT.az-=dx*.008;MT.el=clamp(MT.el+dy*.006,.16,1.45);MT.ride=false;}
    else if(moved>12){const k=MT.dist*.0016,c=Math.cos(MT.az),s=Math.sin(MT.az);MT.tx=clamp(MT.tx-(dx*c+dy*s)*k,-MT.W/2,MT.W/2);MT.tz=clamp(MT.tz-(-dx*s+dy*c)*k,-MT.D/2,MT.D/2);MT.ride=false;}});
  const up=e=>{if(mode!=='model'||!P.has(e.pointerId))return;P.delete(e.pointerId);pinch=0;
    if(MT.tool==='draw'){if(P.size===0)finishDraw();}
    else if(MT.tool!=='look'&&moved<12){const p=mray(e);if(p&&Math.abs(p.x)<MT.W/2-2&&Math.abs(p.z)<MT.D/2-2){if(MT.tool==='erase'){if(eraseAt(p.x,p.z))puff(.2,.15,500);}else if(MT.tool==='hill'||MT.tool==='mount'||MT.tool==='volcano'){addFeat(MT.tool,p.x,p.z);puff(.3,.3,300);}else{addScen(MT.tool,p.x,p.z);puff(.25,.12,1400);}}}};
  canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
  canvas.addEventListener('wheel',e=>{if(mode==='model')MT.dist=clamp(MT.dist+e.deltaY*.1,22,240);},{passive:true});})();
const TIPS={look:'✋ Drag to look around, pinch to zoom',draw:'✏️ Draw a big loop with your finger!',erase:'🧽 Tap a piece or a hill to remove it',hill:'Tap to raise a hill',mount:'Tap to raise a mountain. Track through it gets a tunnel',volcano:'Tap to raise a volcano 🌋'};
document.querySelectorAll('#mbar [data-tool]').forEach(b=>b.onclick=()=>{MT.tool=b.dataset.tool;document.querySelectorAll('#mbar [data-tool]').forEach(x=>x.classList.toggle('on',x===b));
  msg(TIPS[MT.tool]||('Tap the table to place it. Drag to slide around'),3500);MT.ride=false;if(MT.tool==='draw'){MT.az=0;MT.el=1.42;MT.tx=0;MT.tz=0;MT.dist=canvasPortrait()?250:150;}else{if(MT.el>1.3){MT.az=.55;MT.el=.78;}if(MT.tool!=='look'&&MT.dist>64)MT.dist=58;if(MT.tool==='look'&&MT.dist<80){MT.dist=108;MT.tx=0;MT.tz=0;}}});
function canvasPortrait(){return innerWidth<innerHeight;}
$('mlay').onclick=()=>{if(MT.wild){setWild(false);return;}MT.lay=(MT.lay+1)%4;setPath(layoutPts(MT.lay),false);rebuildTerrain();MT.d=0;snd.ding();};
$('mtrain').onclick=()=>{if(MT.wild){snd.horn();return;}setStyle((MT.style+1)%3);MT.style===0?snd.whistle():snd.horn();};
$('mwh').onclick=()=>{MT.style===0&&!MT.wild?snd.whistle():snd.horn();};
$('msmoke').onclick=()=>{MT.smoke=!MT.smoke;$('msmoke').classList.toggle('on',MT.smoke);msg(MT.smoke?'💨 A little smoke':'Smoke off',2000);};
$('mwild').onclick=()=>setWild(!MT.wild);
$('mzin').onclick=()=>{MT.dist=clamp(MT.dist*.72,22,240);};$('mzout').onclick=()=>{MT.dist=clamp(MT.dist*1.35,22,240);};
$('mclr').onclick=()=>{while(model.scen.children.length)model.scen.remove(model.scen.children[0]);model.anim.length=0;model.feat=model.feat.filter(f=>MT.wild&&f.t==='volcano');rebuildTerrain();msg('🧹 All clean!');};
function burst(x,y,z,n,hue,up){let k=0;for(const p of model.fx){if(p.userData.life>0)continue;p.position.set(x,y,z);const a=rnd(0,6.283),e=rnd(-1.2,1.5),sp=rnd(5,12);p.userData.v.set(Math.cos(a)*Math.cos(e)*sp,Math.sin(e)*sp+(up||0),Math.sin(a)*Math.cos(e)*sp);p.userData.life=rnd(.8,1.6);p.material.color.setHSL(hue<0?rnd(.02,.1):(hue+rnd(-.05,.05)+1)%1,1,.6);if(++k>=n)break;}}
function updModel(dt){
  const sl=+$('mspd').value;
  if(MT.wild){const y=model.pos(MT.d).y,tz=model.tan(MT.d).y,tgt=Math.max(tz>.12?11:5,Math.sqrt(Math.max(0,2*13*(31-y))))*(.45+sl*1.1);MT.v+=(tgt-MT.v)*Math.min(1,dt*2.2);}else MT.v=sl*28;
  MT.d+=MT.v*dt;placeTrain();const loco=model.consist.cars[0];
  if(!MT.wild&&MT.style===0&&MT.smoke&&MT.v>.5){MT.chuffD+=MT.v*dt;if(MT.chuffD>5){MT.chuffD=0;puff(.1,.1,700);const p=model.smoke.find(q=>q.userData.life<=0);if(p){p.position.copy(loco.localToWorld(loco.userData.stack.clone()));p.userData.life=.7;p.scale.setScalar(1);}}}
  model.smoke.forEach(p=>{if(p.userData.life>0){p.userData.life-=dt;p.position.y+=dt*1.6;p.scale.multiplyScalar(1+dt*1.2);p.material.opacity=Math.max(0,p.userData.life/.7)*.3;if(p.userData.life<=0){p.position.y=-99;p.material.opacity=0;}}});
  if(MT.wild){if(loco.userData.flame)loco.userData.flame.scale.set(1,rnd(.7,1.3),1);MT.fw-=dt;if(MT.fw<=0){MT.fw=rnd(.6,1.5);burst(rnd(-60,60),rnd(30,55),rnd(-40,40),18,Math.random());if(Math.random()<.5)puff(.15,.25,rnd(300,900));const v=model.feat.find(f=>f.t==='volcano');if(v&&Math.random()<.6)burst(v.x,gridH(v.x,v.z)+1,v.z,14,-1,10);}}
  model.fx.forEach(p=>{const u=p.userData;if(u.life>0){u.life-=dt;p.position.addScaledVector(u.v,dt);u.v.y-=dt*9;p.material.opacity=clamp(u.life,0,1);}else p.material.opacity=0;});
  model.anim.forEach(f=>f(dt));
  if(MT.ride){const u=model.up(MT.d+.5),p=model.pos(MT.d+.5).addScaledVector(u,1.8),l=model.pos(MT.d+9).addScaledVector(model.up(MT.d+9),1.3);cam.up.copy(u);cam.position.copy(p);cam.lookAt(l);}
  else{cam.up.set(0,1,0);const d=MT.dist*(canvasPortrait()?1.3:1),ce=Math.cos(MT.el);cam.position.set(MT.tx+Math.sin(MT.az)*ce*d,Math.sin(MT.el)*d,MT.tz+Math.cos(MT.az)*ce*d);cam.lookAt(MT.tx,2,MT.tz);}
  if(MT.wild)engine(.04+MT.v/40*.3,300+MT.v*40,.03,60+MT.v*6);else engine(MT.style===0?0:.03+MT.v/26*.1,400,MT.style===0?0:.03,50+MT.v*2);
}
