'use strict';
/* =====================================================================
   acela.js : drive the high-speed train from Boston to Washington, D.C.
   Its own long, squeezed-down corridor: seven stops, the shoreline,
   the big bridges, the New York tunnels and the Capitol at the end.
   ===================================================================== */
let ace=null;
const AC_={d:60,v:0,view:'out',next:1,dwell:0,done:false,said:{},fid:0,look:0,ai:[]};
const AEND=15900,ATB=5.5;
const AST=[{n:'Boston',d:60,say:'South Station, Boston.'},{n:'Providence',d:1650,say:'Providence, Rhode Island.'},{n:'New Haven',d:4150,say:'New Haven, Connecticut.'},{n:'New York',d:6600,say:'New York City. Penn Station.',hall:1},
  {n:'Philadelphia',d:10800,say:'Philadelphia, Pennsylvania.'},{n:'Baltimore',d:13650,say:'Baltimore, Maryland.'},{n:'Washington, D.C.',d:AEND,say:'Washington, D.C. Union Station.'}];
/* [from, to, kind]  kinds: city, town, woods, shore, bridge, tunnel, marsh */
const AZ=[[-300,520,'city'],[520,1450,'woods'],[1450,1850,'city'],[1850,2600,'woods'],[2600,3380,'shore'],[3380,3520,'bridge'],[3520,3950,'shore'],[3950,4350,'city'],[4350,5380,'town'],[5380,5700,'bridge'],[5700,6300,'city'],
  [6300,7200,'tunnel'],[7200,8200,'marsh'],[8200,9380,'town'],[9380,9620,'bridge'],[9620,10450,'town'],[10450,11050,'city'],[11050,12000,'town'],[12000,12420,'bridge'],[12420,13300,'woods'],[13300,13480,'tunnel'],[13480,13820,'city'],[13820,14100,'tunnel'],[14100,15250,'woods'],[15250,16400,'city']];
const AMARK=[[420,'🚄','Here we go!','All aboard the fast train to Washington!'],[900,'🌳','Trees','Look at all the trees going by.'],[2700,'🌊','The ocean','Look! The ocean. We are riding by the sea.'],[3020,'🗼','A lighthouse','A lighthouse. It shines a light for the boats.'],[3360,'🌉','A bridge','We are going over a bridge.'],
  [5360,'🌉','The big red bridge','Here comes the big red bridge.'],[5800,'🏙️','New York City','New York City. So many tall buildings!'],[6290,'🚇','Into the tunnel','Into the tunnel. It is dark.'],[7230,'☀️','Out of the tunnel','Out of the tunnel. Hello, sunshine.'],[7500,'🏭','Factories','Factories and big round tanks.'],
  [9350,'🌉','Over the river','A bridge over the river.'],[10500,'🏛️','Philadelphia','Philadelphia. See the tall clock tower?'],[12000,'🌉','A long, long bridge','This is a long, long bridge. The river is very wide.'],[13290,'🚇','A tunnel','Another tunnel.'],[15300,'🏛️','Washington, D.C.','Washington, D.C. The big white dome is the Capitol.'],[15560,'⬆️','The tall white tower','The tall white tower is the Washington Monument.']];
const aX=d=>230*Math.sin(d/1900)+85*Math.sin(d/730+1);
function aP(d,o,y){const e=.5,dx=aX(d+e)-aX(d-e),l=Math.hypot(dx,1),tx=dx/l,tz=-1/l;o=o||0;return new V3(aX(d)-tz*o,y||0,-d+tx*o);}
const aYaw=d=>Math.atan2(aX(d+.5)-aX(d-.5),-1);
const aZone=d=>{for(const z of AZ)if(d>=z[0]&&d<z[1])return z[2];return 'woods';};
const aDark=d=>{let k=0;AZ.forEach(z=>{if(z[2]==='tunnel')k=Math.max(k,clamp((d-z[0]+8)/40,0,1)*clamp((z[1]+8-d)/40,0,1));});return k;};

function buildAcela(){
  const s=new THREE.Scene(),sky=C('#9fcdf0');s.background=sky;s.fog=new THREE.Fog(sky,700,3600);s.environment=ENV;
  const hemi=new THREE.HemisphereLight(0xd8e8ff,0x77705f,.8),sun=new THREE.DirectionalLight(0xfff0d6,1.9);sun.position.set(.6,1,.35);s.add(hemi,sun);const lamp=new THREE.PointLight(0xfff1cf,0,120,1.4);s.add(lamp);
  const add=m=>{s.add(m);return m;},dbl=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:C(c),roughness:.95,side:THREE.DoubleSide},o||{})),at=(o,y)=>d=>aP(d,o,y);
  const G={city:dbl('#6f747a'),town:dbl('#587f42'),woods:dbl('#4b7a3a'),shore:dbl('#587f42'),marsh:dbl('#77803f'),sand:dbl('#d9c48f'),water:new THREE.MeshStandardMaterial({color:C('#2f7fb5'),roughness:.18,metalness:.35,side:THREE.DoubleSide}),conc:dbl('#b3b6ba'),dark:dbl('#2b2e33'),stone:dbl('#9a9288')};
  /* --- track bed, rails, wires --- */
  const bedT=rep(cvs(128,64,(c,w,h)=>{c.fillStyle='#6b665e';c.fillRect(0,0,w,h);for(let i=0;i<500;i++){const k=80+Math.random()*60;c.fillStyle='rgb('+k+','+(k-4)+','+(k-10)+')';c.fillRect(Math.random()*w,Math.random()*h,2,2);}c.fillStyle='#4a3f33';[[.2,.42],[.58,.8]].forEach(q=>{c.fillRect(w*q[0],h*.2,w*(q[1]-q[0]),h*.3);c.fillRect(w*q[0],h*.7,w*(q[1]-q[0]),h*.3);});}),1,1);
  add(strip2(at(-4.2,.02),at(ATB+4.2,.02),-300,AEND+120,new THREE.MeshStandardMaterial({map:bedT,roughness:1,side:THREE.DoubleSide}),10,3));
  rails(aP,-300,AEND+60,0,s,1,12,.05);rails(aP,-300,AEND+60,ATB,s,1,12,.05);
  const inTun=d=>aZone(d)==='tunnel';
  { const ds=[];for(let d=-280;d<AEND+40;d+=56)if(!inTun(d))ds.push(d);const pm=M('#4a5a52',{roughness:.6,metalness:.6}),dm=new THREE.Object3D(),po=new THREE.InstancedMesh(new THREE.BoxGeometry(.32,8.4,.32),pm,ds.length*2),bm=new THREE.InstancedMesh(new THREE.BoxGeometry(ATB+10,.3,.3),pm,ds.length);
    ds.forEach((d,i)=>{dm.rotation.set(0,aYaw(d),0);[-4.6,ATB+4.6].forEach((o,k)=>{dm.position.copy(aP(d,o,4.2));dm.updateMatrix();po.setMatrixAt(i*2+k,dm.matrix);});dm.position.copy(aP(d,ATB/2,7.6));dm.updateMatrix();bm.setMatrixAt(i,dm.matrix);});po.frustumCulled=bm.frustumCulled=false;s.add(po,bm);
    const wm=new THREE.MeshBasicMaterial({color:0x22262b,side:THREE.DoubleSide});[0,ATB].forEach(o=>AZ.forEach(z=>{if(z[2]!=='tunnel')add(strip2(at(o-.04,6.9),at(o+.04,6.9),Math.max(z[0],-280),Math.min(z[1],AEND+40),wm,28));}));}
  /* --- ground by zone --- */
  AZ.forEach(z=>{const a=z[0],b=z[1],k=z[2];
    if(k==='bridge'){[[-900,-4.4],[ATB+4.4,900]].forEach(q=>add(strip2(at(q[0],-7),at(q[1],-7),a,b,G.water,30)));add(strip2(at(-4.4,-7),at(ATB+4.4,-7),a,b,G.water,30));
      [-4.4,ATB+4.4].forEach(o=>add(strip2(at(o,-1.4),at(o,.9),a,b,G.dark,30)));add(strip2(at(-4.4,-1.4),at(ATB+4.4,-1.4),a,b,G.dark,30));
      for(let d=a+30;d<b-10;d+=60){const p=aP(d,ATB/2,-4.4),m=box(ATB+7,6,4,G.stone,p.x,p.y,p.z,s);m.rotation.y=aYaw(d);}
      [[a-14,a],[b,b+14]].forEach(q=>[-1,1].forEach(sd=>add(strip2(at(sd<0?-900:ATB+4.4,0),at(sd<0?-4.4:900,-7),q[0],q[1],G.town,14))));return;}
    if(k==='shore'){add(strip2(at(-4.4,0),at(-34,0),a,b,G.shore,30));add(strip2(at(-34,0),at(-58,-1.2),a,b,G.sand,30));add(strip2(at(-58,-1.2),at(-1400,-1.2),a,b,G.water,30));add(strip2(at(ATB+4.4,0),at(900,0),a,b,G.shore,30));return;}
    const gm=k==='tunnel'?G.woods:G[k];add(strip2(at(-900,0),at(-4.4,0),a,b,gm,30));add(strip2(at(ATB+4.4,0),at(900,0),a,b,gm,30));
    if(k==='marsh'){for(let i=0;i<26;i++){const d=a+40+Math.random()*(b-a-80),o=(Math.random()<.5?-1:1)*(30+Math.random()*320),p=aP(d,o,.06),w=new THREE.Mesh(new THREE.CircleGeometry(14+Math.random()*40,14),G.water);w.rotation.x=-Math.PI/2;w.scale.y=.5;w.rotation.z=Math.random()*3;w.position.copy(p);s.add(w);}}
    if(k==='tunnel'){const tm=dbl('#55585e'),lit=dbl('#cfd2d6',{emissive:C('#8a8676'),emissiveIntensity:.35});
      /* a hill over the tunnel, the tube, and a stone face at each end */
      [[-900,-7],[ATB+7,900]].forEach(q=>add(strip2(at(q[0],0),at(q[1],16),a,b,G.woods,30)));add(strip2(at(-7,16),at(ATB+7,16),a,b,G.woods,30));
      const hall=AST.find(t=>t.hall&&t.d>a&&t.d<b),segs=hall?[[a,hall.d-150,0],[hall.d-150,hall.d+60,1],[hall.d+60,b,0]]:[[a,b,0]];
      segs.forEach(q=>{const L=q[2]?-13:-4.5,R=q[2]?ATB+13:ATB+4.5,H=q[2]?9.5:8.2;add(strip2(at(L,0),at(L,H),q[0],q[1],q[2]?lit:tm,20));add(strip2(at(R,0),at(R,H),q[0],q[1],q[2]?lit:tm,20));add(strip2(at(L,H),at(R,H),q[0],q[1],tm,20));if(q[2]){add(strip2(at(L,.02),at(-4.3,.02),q[0],q[1],tm,20));add(strip2(at(ATB+4.3,.02),at(R,.02),q[0],q[1],tm,20));}});
      { const L=[];for(let d=a+8;d<b;d+=16)L.push(d);const im=new THREE.InstancedMesh(new THREE.BoxGeometry(.5,.14,3),new THREE.MeshBasicMaterial({color:0xfff0c0}),L.length*2),dm=new THREE.Object3D();L.forEach((d,i)=>[-3.2,ATB+3.2].forEach((o,j)=>{dm.position.copy(aP(d,o,7.9));dm.rotation.y=aYaw(d);dm.updateMatrix();im.setMatrixAt(i*2+j,dm.matrix);}));im.frustumCulled=false;s.add(im);}
      [a,b].forEach(d=>{const p=aP(d,ATB/2,0),g=new THREE.Group();g.position.copy(p);g.rotation.y=aYaw(d);s.add(g);box(6,17,3,G.stone,-ATB/2-7.6,8.5,0,g);box(6,17,3,G.stone,ATB/2+7.6,8.5,0,g);box(ATB+21,8.6,3,G.stone,0,12.7,0,g);});}
  });
  /* --- instanced scenery in chunks so far-away pieces are skipped --- */
  const chunks=(geo,mat,items,colored)=>{const by=new Map();items.forEach(it=>{const k=Math.floor(it.d/900);(by.get(k)||by.set(k,[]).get(k)).push(it);});const dm=new THREE.Object3D(),col=new THREE.Color();
    by.forEach(list=>{const g=geo.clone(),m=new THREE.InstancedMesh(g,mat,list.length),c=new V3();list.forEach(it=>c.add(it.p));c.multiplyScalar(1/list.length);let r=0;list.forEach((it,i)=>{r=Math.max(r,it.p.distanceTo(c));dm.position.copy(it.p);dm.rotation.set(0,it.ry||0,0);dm.scale.set(it.sx||it.s||1,it.sy||it.s||1,it.sz||it.s||1);dm.updateMatrix();m.setMatrixAt(i,dm.matrix);if(colored)m.setColorAt(i,col.set(it.c||'#ffffff').convertSRGBToLinear());});
      g.boundingSphere=new THREE.Sphere(c,r+60);m.frustumCulled=true;s.add(m);});};
  const trees=[],trunks=[],pines=[],houses=[],roofs=[],rnd2=(a,b)=>a+Math.random()*(b-a),side=()=>Math.random()<.5?-1:1,houseC=['#e8e2d2','#c9d6de','#d9c7a8','#b9c4a8','#e3d0c0','#a8b4c4','#d6b8a8'],roofC=['#5a4a42','#6b3a30','#3f4650','#4a5a4a'];
  const tree=(d,o)=>{const p=aP(d,o,0),k=rnd2(.8,1.5);if(Math.random()<.35)pines.push({d,p:p.clone().setY(5.5*k),s:k});else{trees.push({d,p:p.clone().setY(5.2*k),s:k,sy:k*1.15});}trunks.push({d,p:p.clone().setY(1.8*k),sy:k});};
  const house=(d,o)=>{const p=aP(d,o,0),w=rnd2(7,11),h=rnd2(5,7),l=rnd2(8,13),ry=aYaw(d)+(Math.random()<.5?0:Math.PI/2);houses.push({d,p:p.clone().setY(h/2),sx:w,sy:h,sz:l,ry,c:houseC[(Math.random()*houseC.length)|0]});roofs.push({d,p:p.clone().setY(h+1.6),sx:w*.74,sy:3.2,sz:l*.74,ry:ry+Math.PI/4,c:roofC[(Math.random()*roofC.length)|0]});};
  const towers=new THREE.Group();s.add(towers);
  const tower=(d,o,w,h,i)=>{const p=aP(d,o,0),f=bt[i%bt.length],m=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),[f,f,G.dark,G.dark,f,f]);m.position.set(p.x,h/2,p.z);m.rotation.y=aYaw(d);towers.add(m);};
  AZ.forEach(z=>{const a=z[0],b=z[1],k=z[2],L=b-a;
    if(k==='woods'||k==='tunnel')for(let i=0;i<L*.55;i++)tree(rnd2(a,b),side()*(k==='tunnel'?rnd2(26,330):rnd2(17,330)));
    if(k==='town'){for(let i=0;i<L*.2;i++)tree(rnd2(a,b),side()*rnd2(17,330));for(let i=0;i<L*.11;i++)house(rnd2(a,b),side()*rnd2(30,300));}
    if(k==='shore'){for(let i=0;i<L*.22;i++)tree(rnd2(a,b),rnd2(17,330));for(let i=0;i<L*.05;i++)house(rnd2(a,b),rnd2(30,260));}
    if(k==='marsh'){for(let i=0;i<L*.06;i++)tree(rnd2(a,b),side()*rnd2(40,330));}
    if(k==='city'){const dc=a>15000,big=L>450&&!dc,n=Math.round(L*(big?.12:.09));for(let i=0;i<n;i++){const d=rnd2(a+10,b-10),o=side()*rnd2(big?34:40,dc?150:300);tower(d,o,rnd2(14,26),big?rnd2(24,130)*(Math.abs(o)<170?1:.6):rnd2(14,46),i);}for(let i=0;i<L*.05;i++)tree(rnd2(a,b),side()*rnd2(18,30));}
  });
  const leaf=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,flatShading:true}),leaf2=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,flatShading:true}),lc=['#3f7a3a','#4b8a3f','#35692f','#5a8f3a','#44803c'],pc=['#2f5f38','#27502f','#356a40'];
  trees.forEach(t=>t.c=lc[(Math.random()*lc.length)|0]);pines.forEach(t=>t.c=pc[(Math.random()*pc.length)|0]);
  chunks(new THREE.IcosahedronGeometry(3.3,1),leaf,trees,true);chunks(new THREE.ConeGeometry(2.6,9,7),leaf2,pines,true);chunks(new THREE.CylinderGeometry(.32,.42,3.6,5),M('#5b4630',{roughness:1}),trunks);
  {const ht=cvs(128,128,(c,w,h)=>{c.fillStyle='#fff';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=8){c.fillStyle='rgba(0,0,0,.05)';c.fillRect(0,y,w,1);}c.fillStyle='#2c3a4a';[[.12,.16],[.42,.16],[.72,.16],[.12,.58],[.72,.58]].forEach(q=>{c.fillRect(w*q[0],h*q[1],w*.17,h*.24);});c.strokeStyle='#f4f4f0';c.lineWidth=3;[[.12,.16],[.42,.16],[.72,.16],[.12,.58],[.72,.58]].forEach(q=>c.strokeRect(w*q[0],h*q[1],w*.17,h*.24));c.fillStyle='#6b3a2a';c.fillRect(w*.43,h*.56,w*.15,h*.44);});
    chunks(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:0xffffff,map:ht,roughness:.85}),houses,true);}chunks(new THREE.ConeGeometry(1,1,4),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9}),roofs,true);
  /* --- labels --- */
  const tag=(txt,d,o,y,sc)=>{const t=cvs(640,128,(c,w,h)=>{c.fillStyle='#1d2440';rr(c,4,4,w-8,h-8,54);c.fill();c.fillStyle='#fff';c.font='800 66px Arial';c.textAlign='center';c.textBaseline='middle';let f=66;while(c.measureText(txt).width>w-50){f-=3;c.font='800 '+f+'px Arial';}c.fillText(txt,w/2,h/2+5);}),sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,fog:false}));sp.scale.set(60*(sc||1),12*(sc||1),1);sp.position.copy(aP(d,o,y));sp.renderOrder=5;s.add(sp);return sp;};
  const place=(d,o,fn)=>{const g=new THREE.Group();g.position.copy(aP(d,o,0));g.rotation.y=aYaw(d);s.add(g);fn(g);return g;},white=M('#eef0f2',{roughness:.6}),col=(g,x,z,h,r)=>cyl(r||.7,r||.7,h,white,x,h/2,z,g,10);
  /* dome building: Rhode Island State House, the U.S. Capitol */
  const dome=(g,k,wings)=>{box(46*k,13*k,26*k,white,0,6.5*k,0,g);if(wings){[-1,1].forEach(sd=>{box(40*k,11*k,22*k,white,sd*42*k,5.5*k,0,g);box(44*k,1.2*k,25*k,white,sd*42*k,11.4*k,0,g);for(let i=0;i<8;i++)col(g,sd*(26+i*4.4)*k,11.6*k,10*k,.6*k);});}
    for(let i=0;i<8;i++)col(g,(-15.4+i*4.4)*k,13.6*k,11*k,.7*k);box(36*k,2*k,5*k,white,0,12.6*k,15*k,g);const ped=new THREE.Mesh(gable(36*k,5*k,4*k),white);ped.position.set(0,13.6*k,15*k);g.add(ped);
    cyl(11*k,11.6*k,9*k,white,0,17.5*k,0,g,20);for(let i=0;i<16;i++){const a=i/16*6.283;cyl(.5*k,.5*k,8*k,white,Math.cos(a)*11.6*k,17.5*k,Math.sin(a)*11.6*k,g,6);}
    const dm=sph(10*k,white,0,22*k,0,g);dm.scale.y=1.25;cyl(2.4*k,2.8*k,5*k,white,0,35.5*k,0,g,10);sph(1.2*k,M('#c9a84a',{metalness:.8,roughness:.3}),0,39.2*k,0,g);};
  place(1700,-150,g=>{dome(g,.8,false);});tag('State House',1700,-150,52,.9);
  /* lighthouse + sailboats on the shore */
  place(3040,-66,g=>{cyl(3,4,22,white,0,11,0,g,12);cyl(3.05,3.5,5,M('#c5221f'),0,9,0,g,12);cyl(3.8,3.8,.6,M('#22252b'),0,22.3,0,g,12);cyl(2.2,2.2,3.4,GL('#fff3b0'),0,24.3,0,g,10);cyl(0,2.8,2.6,M('#c5221f'),0,27.3,0,g,10);box(9,5,7,white,7,2.5,2,g);const r=new THREE.Mesh(gable(9,3,7.4),M('#6b3a30'));r.position.set(7,5,2);g.add(r);});tag('Lighthouse',3040,-66,38,.8);
  const boats=[];[2750,2900,3180,3300,3620,3760,3880].forEach((d,i)=>boats.push(place(d,-rnd2(110,420),g=>{box(2.6,1.4,9,white,0,.3,0,g);box(.14,11,.14,M('#8a6a3a'),0,6,.8,g);const m=new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new V3(0,1.6,.6),new V3(0,11,.6),new V3(0,1.6,-4)]),new THREE.MeshBasicMaterial({color:i%2?0xffe9c0:0xffffff,side:THREE.DoubleSide}));g.add(m);g.position.y=-1.3;g.userData.dyn=true;})));
  /* bridges: plain truss, and the red arch */
  const truss=(a,b,cm,o0)=>{const m=M(cm,{roughness:.6,metalness:.5});for(let d=a;d<b;d+=20){place(d,ATB/2,g=>{[-(ATB/2+4.6),ATB/2+4.6].forEach(x=>{box(.5,9,.5,m,x,4.5,0,g);const dg=box(.4,22,.4,m,x,4.5,10,g);dg.rotation.x=(d/20|0)%2?1.15:-1.15;box(.6,.6,20.4,m,x,9.2,10,g);});box(ATB+9.6,.4,.4,m,0,9.2,0,g);});}};
  truss(3380,3520,'#3f5a4a');truss(9380,9620,'#4a5560');truss(12000,12420,'#5a6068');
  { const a=5400,b=5680,red=M('#8f2f2a',{roughness:.6,metalness:.4}),mid=(a+b)/2;place(mid,ATB/2,g=>{[-(ATB/2+5),ATB/2+5].forEach(x=>{const n=22;for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,z0=(t0-.5)*(b-a),z1=(t1-.5)*(b-a),y0=4+44*Math.sin(Math.PI*t0),y1=4+44*Math.sin(Math.PI*t1),L=Math.hypot(z1-z0,y1-y0),m=box(1.6,1.6,L+.4,red,x,(y0+y1)/2,(z0+z1)/2,g);m.rotation.x=-Math.atan2(y1-y0,z1-z0);if(i%2===0&&i)box(.35,y0-1,.35,red,x,(y0+1)/2,z0,g);}});
      for(let i=1;i<11;i++){const t=i/11,y=4+44*Math.sin(Math.PI*t);if(y>12)box(ATB+11.6,.5,.5,red,0,y,(t-.5)*(b-a),g);}[-1,1].forEach(e=>[-(ATB/2+7),ATB/2+7].forEach(x=>{box(8,34,10,G.stone,x,13,e*((b-a)/2+6),g);box(9,2,11,G.stone,x,31,e*((b-a)/2+6),g);}));});tag('Hell Gate Bridge',mid,ATB/2,62,.9);}
  /* New York: one very tall tower with a spire */
  place(6080,-120,g=>{const f=bt[0];[[30,70,0],[24,60,70],[17,40,130],[10,22,170]].forEach(q=>{const m=new THREE.Mesh(new THREE.BoxGeometry(q[0],q[1],q[0]),[f,f,G.dark,G.dark,f,f]);m.position.y=q[2]+q[1]/2;g.add(m);});cyl(.6,2.4,34,M('#aeb3bb',{metalness:.8}),0,209,0,g,8);});tag('New York City',6050,-60,236,1.5);
  /* factories, tanks and power lines */
  for(let i=0;i<16;i++){const d=7260+i*56,o=side()*rnd2(40,220);place(d,o,g=>{if(i%3===0){box(40,12,26,M('#9aa0a8',{roughness:.8}),0,6,0,g);cyl(1.6,2,24,M('#8a4a3a'),14,12,6,g,10);}else{const r=rnd2(6,11);cyl(r,r,rnd2(8,13),white,0,5,0,g,16);cyl(r+.2,r+.2,.6,M('#8a8f98'),0,10.4,0,g,16);}});}
  for(let d=7240;d<8200;d+=120)place(d,60,g=>{const m=M('#7d838d',{metalness:.6});[-1,1].forEach(x=>{const l=box(.5,34,.5,m,x*3.4,16,0,g);l.rotation.z=x*.2;});box(22,.5,.5,m,0,30,0,g);box(14,.5,.5,m,0,24,0,g);});
  /* the lettered bridge at the Delaware River */
  place(9500,150,g=>{const m=M('#6a7078',{metalness:.5});for(let i=-5;i<=5;i++){box(.7,12,.7,m,0,6,i*22,g);if(i<5){const dg=box(.5,25,.5,m,0,6,i*22+11,g);dg.rotation.x=i%2?1.07:-1.07;}}box(.9,.9,222,m,0,12,0,g);box(.9,.9,222,m,0,.4,0,g);
    const t=cvs(2048,128,(c,w,h)=>{c.fillStyle='#22262b';c.fillRect(0,0,w,h);c.fillStyle='#ffdf7a';c.font='800 96px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('TRENTON MAKES  ·  THE WORLD TAKES',w/2,h/2+6);}),sg=new THREE.Mesh(new THREE.PlaneGeometry(170,10.6),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));sg.position.set(1,7,0);sg.rotation.y=Math.PI/2;g.add(sg);});
  /* Philadelphia: clock tower, columned station, boathouses */
  place(10640,150,g=>{box(50,26,50,M('#b9b2a2',{roughness:.8}),0,13,0,g);box(15,92,15,M('#b9b2a2',{roughness:.8}),0,46,0,g);[0,1,2,3].forEach(i=>{const c=new THREE.Mesh(new THREE.CircleGeometry(5,20),new THREE.MeshBasicMaterial({color:0xfff6d0,side:THREE.DoubleSide}));c.position.set(Math.sin(i*1.5708)*7.6,82,Math.cos(i*1.5708)*7.6);c.rotation.y=i*1.5708;g.add(c);});cyl(4,7.5,16,M('#8f9a94'),0,100,0,g,10);cyl(1.1,1.4,9,M('#5a6a60'),0,112,0,g,8);});tag('Philadelphia',10640,150,134,1.2);
  place(10770,-62,g=>{box(90,20,30,M('#d6cfbf',{roughness:.7}),0,10,0,g);for(let i=0;i<8;i++)cyl(1.5,1.5,17,M('#e6e0d2'),-30+i*8.6,8.5,-16.5,g,10);box(74,3,6,M('#e6e0d2'),0,18.5,-16.5,g);});
  for(let i=0;i<7;i++)place(10480+i*13,-(44+i*2),g=>{const c=['#b3261f','#27578f','#2e6b45','#c79a1c','#6d3a86','#a8442a','#1f6f8a'][i];box(9,6,12,M(c),0,3,0,g);const r=new THREE.Mesh(gable(9.6,3.4,12.6),M('#3f4650'));r.position.y=6;g.add(r);});
  /* Washington: the Capitol, the Monument, Union Station */
  place(15640,230,g=>{g.rotation.y+=-Math.PI/2;dome(g,1.5,true);});tag('The Capitol',15640,230,84,1.3);
  place(15520,-300,g=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(3.4,7,128,4),white);m.position.y=64;m.rotation.y=Math.PI/4;g.add(m);const t=new THREE.Mesh(new THREE.ConeGeometry(4.8,11,4),white);t.position.y=133.5;t.rotation.y=Math.PI/4;g.add(t);});tag('Washington Monument',15520,-300,152,1.2);
  place(AEND+92,ATB/2,g=>{box(150,26,36,white,0,13,0,g);[-28,0,28].forEach(x=>{const a=new THREE.Mesh(new THREE.CircleGeometry(9,20,0,Math.PI),new THREE.MeshBasicMaterial({color:0x1c2733,side:THREE.DoubleSide}));a.position.set(x,9,-18.1);a.rotation.y=Math.PI;g.add(a);box(18,9,.3,M('#1c2733'),x,4.5,-18.1,g);});for(let i=0;i<6;i++)col(g,-52+i*20.8,-19.4,22,1.3);box(120,3,5,white,0,24,-19.4,g);box(8,3,8,white,0,-1,-40,g);});
  /* --- stations --- */
  const nameT=n=>cvs(512,96,(c,w,h)=>{c.fillStyle='#1b3f77';c.fillRect(0,0,w,h);c.fillStyle='#fff';c.fillRect(0,h-8,w,8);c.font='800 54px Arial';c.textAlign='center';c.textBaseline='middle';let f=54;while(c.measureText(n).width>w-30){f-=3;c.font='800 '+f+'px Arial';}c.fillText(n,w/2,h/2-2);});
  const ppl=[];
  AST.forEach(st=>{const a=st.d-150,b=st.d+14,roof=M('#3f4650',{roughness:.6,metalness:.4}),nt=nameT(st.n);
    [[-2.3,-9.5],[ATB+2.3,ATB+9.5]].forEach(q=>{add(strip2(at(q[0],1.15),at(q[1],1.15),a,b,G.conc,10));add(strip2(at(q[0],0),at(q[0],1.15),a,b,G.conc,10));add(strip2(at(q[0],1.17),at(q[0]+(q[0]<0?-.5:.5),1.17),a,b,dbl('#f2c21b'),10));
      if(!st.hall){add(strip2(at(q[0]+(q[0]<0?-1:1),5.6),at(q[1],5.2),a+20,b-10,roof,10));for(let d=a+24;d<b-10;d+=14){const p=aP(d,(q[0]+q[1])/2-.1,3.3);cyl(.16,.16,4.3,M('#2f3440'),p.x,p.y,p.z,s,6);}}
      for(let d=a+40;d<b;d+=46){const p=aP(d,q[1]-(q[1]<0?-.6:.6),3.6),m=new THREE.Mesh(new THREE.PlaneGeometry(7,1.3),new THREE.MeshBasicMaterial({map:nt,side:THREE.DoubleSide}));m.position.copy(p);m.rotation.y=aYaw(d)+Math.PI/2;s.add(m);}
      for(let i=0;i<10;i++)ppl.push({d:st.d,p:aP(rnd2(a+12,b-6),rnd2(Math.min(q[0],q[1])+1.6,Math.max(q[0],q[1])-1),1.15)});});
    if(st.d>=AEND)place(AEND+22,ATB/2,g=>{[-ATB/2,ATB/2].forEach(x=>{box(2.4,1.6,1.2,M('#c5221f'),x,1.1,0,g);box(.3,1.4,.3,GL('#ff3b30'),x,2.4,0,g);});});});
  { const shirts=['#b5452b','#27578f','#2f7a4a','#c79a1c','#6d3a86','#e8e4da','#1f6f8a','#d4692a'],b=[],h=[],l=[];ppl.forEach(q=>{const k=rnd2(.85,1.1);b.push({d:q.d,p:q.p.clone().setY(q.p.y+1.55*k),s:k,c:shirts[(Math.random()*8)|0]});h.push({d:q.d,p:q.p.clone().setY(q.p.y+2.3*k),s:k,c:['#f0cfae','#c99772','#8d5e3f','#e8bf9a'][(Math.random()*4)|0]});l.push({d:q.d,p:q.p.clone().setY(q.p.y+.55*k),s:k,c:['#2b3040','#3a3a3a','#4a5a78'][(Math.random()*3)|0]});});
    const pm=()=>new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85});chunks(new THREE.CylinderGeometry(.3,.33,.95,7),pm(),b,true);chunks(new THREE.SphereGeometry(.24,7,5),pm(),h,true);chunks(new THREE.BoxGeometry(.5,1.1,.3),pm(),l,true);}
  s.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});
  batchStatic(s,null,1200);
  /* --- trains: yours, and others coming the other way --- */
  const mine=new Consist(['hsF','hsC','hsC','hsC','hsC','hsR'],1,s),oth=[new Consist(['eloco','amc','amc','amc','amc','amc'],1,s),new Consist(['loco','coach','coach','coach'],1,s),new Consist(['hsF','hsC','hsC','hsC','hsC','hsR'],1,s)];
  s.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});
  ace={scene:s,mine,oth,hemi,sun,lamp,boats,sky};AC_.ai=oth.map((c,i)=>({c,d:1200+i*1900,v:[40,26,66][i]}));
}

const levA=Lever($('levA'));
$('ahorn').onclick=()=>{audioInit();[311,370,466].forEach(f=>tone(f,1.3,'sawtooth',.09));};
function aBig(e,w,ms){const b=$('tbig2');b.innerHTML='<span>'+e+'</span><b>'+w+'</b>';b.style.opacity=1;clearTimeout(AC_.bt);AC_.bt=setTimeout(()=>{b.style.opacity=0;},ms||3400);}
function aReset(){AC_.d=AST[0].d;AC_.v=0;AC_.next=1;AC_.dwell=0;AC_.done=false;AC_.said={};AC_.view='out';levA.set(0);$('anext').textContent='Next: '+AST[1].n;$('aspd').textContent='0';AC_.ai.forEach((a,i)=>a.d=1200+i*1900);cam.position.copy(aP(20,-20,10));}
const _av=new THREE.Vector3();
function updAcela(dt){
  const A=AC_,S=AST[A.next];
  if(keys.ArrowUp||keys.w)levA.set(levA.v+dt*.7);if(keys.ArrowDown||keys.s)levA.set(levA.v-dt*.9);
  let vt=A.done?0:levA.v*76;
  if(S&&!A.done){const rem=S.d-A.d;if(A.dwell<=0)vt=Math.min(vt,Math.sqrt(Math.max(0,2*4.6*(rem-.3)))+.6);
    if(rem<1.2&&A.dwell<=0&&A.v<1.2&&levA.v>.02||rem<=.3&&A.dwell<=0){A.v=0;A.d=Math.min(A.d,S.d);
      if(A.next===AST.length-1){A.done=true;levA.set(0);addStar(3);aBig('🎉','Yay! Washington, D.C.!',7400);say('Yay! We made it to Washington, D.C. Great driving!');snd.fanfare();confetti();const id=++A.fid;setTimeout(()=>{if(mode==='acela'&&A.done)confetti();},1800);setTimeout(()=>{if(mode==='acela'&&A.done&&A.fid===id)setMode('menu');},7500);}
      else{A.dwell=6.5;addStar(1);snd.chime();aBig('🚉',S.n,5200);say(S.say+' Doors open.');}}}
  if(A.dwell>0){A.dwell-=dt;vt=0;if(A.dwell<=0){A.next++;$('anext').textContent='Next: '+AST[A.next].n;say('Doors closing. Next stop, '+AST[A.next].n+'.');aBig('🚪','Next stop: '+AST[A.next].n,3600);}}
  A.v+=clamp(vt-A.v,-9*dt,(A.v<20?3.4:2.6)*dt);if(A.v<.02&&vt===0)A.v=0;A.d+=A.v*dt;$('aspd').textContent=Math.round(A.v*2);
  ace.mine.place(aP,A.d,1,.62);
  /* other trains come the other way on the second track */
  A.ai.forEach(a=>{a.d-=a.v*dt;if(a.d<A.d-500)a.d=A.d+1500+Math.random()*1400;if(a.d>AEND-40)a.d=AEND-40;a.c.place((d,o)=>aP(d,ATB),a.d,-1,.62);
    if(!a.h&&a.d-A.d<300&&a.d>A.d&&aDark(A.d)<.5){a.h=1;[311,370,466].forEach(f=>tone(f,.9,'sawtooth',.04));}if(a.d-A.d>900)a.h=0;});
  ace.boats.forEach((b,i)=>{b.position.x+=Math.sin(i*2.1)*dt*1.2;b.rotation.z=Math.sin(performance.now()/800+i)*.05;});
  /* light and sky */
  const k=aDark(A.d);ace.hemi.intensity=.8-.62*k;ace.sun.intensity=1.9*(1-k);ace.lamp.intensity=1.6*k;ace.lamp.position.copy(aP(A.d-30,ATB/2,6));ace.scene.fog.near=700-560*k;ace.scene.fog.far=3600-2600*k;ace.scene.fog.color.setRGB(ace.sky.r*(1-k)+.02*k,ace.sky.g*(1-k)+.02*k,ace.sky.b*(1-k)+.03*k);ace.scene.background=ace.scene.fog.color;
  /* things to see */
  if(!A.done)AMARK.forEach((m,i)=>{if(A.d>=m[0]&&!A.said[i]){A.said[i]=1;if(A.dwell<=0){aBig(m[1],m[2],3600);say(m[3]);}}});
  {const N=AST[A.next];if(N&&!A.done&&A.dwell<=0&&N.d-A.d<620&&N.d-A.d>60&&!A.said['s'+A.next]){A.said['s'+A.next]=1;aBig('🚉','Coming up: '+N.n,3600);say('Coming up, '+N.n+'.');}}
  engine(.04+A.v*.0022,300+A.v*22,.02+A.v*.0006,70+A.v*3.2);
  /* cameras */
  const tun=k>.3;
  if(A.view==='nose'){cam.position.copy(aP(A.d+1.5,0,3.5));cam.lookAt(aP(A.d+70,0,2.6));}
  else if(A.view==='side'){cam.position.copy(aP(A.d-34,-1.25,3.15));cam.lookAt(aP(A.d+26,-70,2.5));}
  else{const want=tun?aP(A.d-150,ATB/2,5.6):aP(A.d-96,-15,8.5);if(cam.position.distanceTo(want)>500)cam.position.copy(want);else cam.position.lerp(want,1-Math.exp(-dt*3.5));cam.lookAt(tun?aP(A.d-40,0,3):aP(A.d-6,1,2.6));}
}
