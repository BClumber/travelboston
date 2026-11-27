'use strict';
/* =====================================================================
   subway.js : drive a Boston subway line, station to station.
   Pick a line by colour. Tunnels, lit stations, and the places where
   each line comes up into daylight (the river bridge, the open cut,
   the street, the beach).
   ===================================================================== */
let sub=null;
const SB={d:0,v:0,view:'nose',next:1,dwell:0,done:false,said:{},fid:0,line:0,phase:'pick'};
const SSP=470,SB0=130,STB=5.2;
/* stops: [name, 'u' underground | 'o' open air]   seg: what lies between stop i and i+1 */
const SUBL=[
  {name:'Red Line',word:'Red',col:'#da291c',cars:4,marks:[[SB0+2*SSP+250,'⛵','Boats, far away','Look! Sailboats, far away on the river. The city is near.']],stops:[['Harvard','u'],['Central','u'],['Kendall/MIT','u'],['Charles/MGH','o'],['Park Street','u'],['Downtown Crossing','u'],['South Station','u']],seg:['t','t','b','t','t','t'],
    notes:{2:['🌉','Over the river!','Up we come, out of the tunnel and over the Charles River. Look at the boats!']}},
  {name:'Orange Line',word:'Orange',col:'#ed8b00',cars:4,look:1,marks:[[SB0+5*SSP+330,'🚆','Big train on the LEFT','Look left! A big purple train is next to us.']],stops:[['North Station','u'],['Haymarket','u'],['State','u'],['Downtown Crossing','u'],['Chinatown','u'],['Back Bay','u'],['Ruggles','o'],['Forest Hills','o']],seg:['t','t','t','t','t','c','c'],
    notes:{5:['☀️','Out in the open','Out of the tunnel. Now we ride in a long open cut beside the big trains.']}},
  {name:'Blue Line',word:'Blue',col:'#003da5',cars:4,marks:[[SB0+4*SSP+250,'⬅️','Planes on the LEFT','Look left! Airplanes and the control tower.'],[SB0+5*SSP+300,'➡️','Sea on the RIGHT','Look right! The sand and the sea.']],stops:[['Bowdoin','u'],['Government Center','u'],['State','u'],['Aquarium','u'],['Maverick','u'],['Airport','o'],['Wonderland','o']],seg:['t','t','t','h','s','e'],
    notes:{3:['🌊','Under the harbor','Now we go under the harbor. The water is over our heads!'],4:['✈️','The airport','Out of the tunnel. Look for the airplanes.'],5:['🏖️','The beach','We are riding by the beach.']}},
  {name:'Green Line',word:'Green',col:'#00843d',cars:2,tram:1,look:1,marks:[[SB0+SSP-330,'🦖','Museum of Science','Look left! The Museum of Science. Can you see the dinosaur?']],stops:[['Lechmere','o'],['Science Park','o'],['North Station','u'],['Government Center','u'],['Park Street','u'],['Boylston','u'],['Copley','u'],['Museum of Fine Arts','o']],seg:['b','t','t','t','t','t','s'],
    notes:{0:['🌉','Over the river!','The trolley rides high over the Charles River.'],1:['🚇','Into the tunnel','Down into the tunnel we go.'],6:['🚋','On the street','Up onto the street. The trolley rides in the middle of the road.']}}];
const sbX=d=>46*Math.sin(d/520)+18*Math.sin(d/190+1.3);
let SBU=[];
const sbH=d=>{let k=0;for(const u of SBU){const m=Math.min(clamp((d-u[0])/90,0,1),clamp((u[1]-d)/90,0,1));if(m>k)k=m;}return -7*k*k*(3-2*k);};
function sbP(d,o,y){const e=.5,dx=sbX(d+e)-sbX(d-e),l=Math.hypot(dx,1),tx=dx/l,tz=-1/l;o=o||0;return new V3(sbX(d)-tz*o,(y||0)+sbH(d),-d+tx*o);}
const sbYaw=d=>Math.atan2(sbX(d+.5)-sbX(d-.5),-1);
const sbStop=i=>SB0+i*SSP;
function sbZones(L){const z=[];L.stops.forEach((s,i)=>{const d=sbStop(i);z.push([d-108,d+18,s[1]==='u'?'hall':'ost',i]);if(i<L.seg.length)z.push([d+18,d+SSP-108,L.seg[i],i]);});z[0][0]=-60;z[z.length-1][1]=sbStop(L.stops.length-1)+70;return z;}
const sbUnder=k=>k==='t'||k==='h'||k==='hall';

function buildSubway(li){
  if(sub){sub.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
  const L=SUBL[li],Z=sbZones(L);SBU=[];for(let i=0;i<Z.length;i++){if(!sbUnder(Z[i][2]))continue;const u=[Z[i][0],Z[i][1]];while(i+1<Z.length&&sbUnder(Z[i+1][2])){i++;u[1]=Z[i][1];}if(u[0]<=Z[0][0])u[0]-=300;if(u[1]>=Z[Z.length-1][1])u[1]+=300;SBU.push(u);}
  const s=new THREE.Scene(),sky=C('#9fcdf0');s.background=sky.clone();s.fog=new THREE.Fog(sky.clone(),300,2200);s.environment=ENV;
  const hemi=new THREE.HemisphereLight(0xd8e8ff,0x77705f,.8),sun=new THREE.DirectionalLight(0xfff0d6,1.9);sun.position.set(.6,1,.35);s.add(hemi,sun);const lamp=new THREE.PointLight(0xfff1cf,0,90,1.5),head=new THREE.SpotLight(0xfff6dc,0,150,.55,.6,1.1),ht=new THREE.Object3D();s.add(lamp,head,ht);head.target=ht;
  const add=m=>{s.add(m);return m;},dbl=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:C(c),roughness:.95,side:THREE.DoubleSide},o||{})),at=(o,y)=>d=>sbP(d,o,y),lc=L.col,rnd2=(a,b)=>a+Math.random()*(b-a),side=()=>Math.random()<.5?-1:1;
  const T=(t,o)=>new THREE.MeshStandardMaterial(Object.assign({map:t,roughness:.8,side:THREE.DoubleSide,envMapIntensity:.2},o||{}));
  /* textures: canvas x runs across the strip (bottom to top on walls), canvas y along it */
  const tunT=rep(cvs(128,256,(c,w,h)=>{c.fillStyle='#4b4d52';c.fillRect(0,0,w,h);for(let i=0;i<900;i++){const k=50+Math.random()*50;c.fillStyle='rgba('+k+','+k+','+k+',.5)';c.fillRect(Math.random()*w,Math.random()*h,2,3);}c.fillStyle='#17181b';[.5,.56,.62].forEach(x=>c.fillRect(w*x,0,3,h));c.fillStyle='#6a6d73';c.fillRect(0,h*.5,w,4);c.fillStyle='#2b2d31';c.fillRect(0,0,w*.12,h);}),1,1);
  const tileT=rep(cvs(256,256,(c,w,h)=>{c.fillStyle='#ecebe6';c.fillRect(0,0,w,h);for(let x=0;x<w;x+=16)for(let y=0;y<h;y+=32){const k=224+Math.random()*24;c.fillStyle='rgb('+k+','+k+','+(k-4)+')';c.fillRect(x+1,y+1,14,30);}c.fillStyle='#35373c';c.fillRect(0,0,w*.07,h);c.fillStyle=lc;c.fillRect(w*.56,0,w*.11,h);c.fillStyle='rgba(0,0,0,.12)';c.fillRect(w*.67,0,2,h);}),1,1);
  const bedT=rep(cvs(128,64,(c,w,h)=>{c.fillStyle='#5a564f';c.fillRect(0,0,w,h);for(let i=0;i<500;i++){const k=70+Math.random()*60;c.fillStyle='rgb('+k+','+(k-4)+','+(k-10)+')';c.fillRect(Math.random()*w,Math.random()*h,2,2);}c.fillStyle='#3d3429';[[.16,.44],[.56,.84]].forEach(q=>{c.fillRect(w*q[0],h*.2,w*(q[1]-q[0]),h*.3);c.fillRect(w*q[0],h*.7,w*(q[1]-q[0]),h*.3);});}),1,1);
  const tunM=T(tunT),tileM=T(tileT,{roughness:.35,emissive:new THREE.Color(0xffffff),emissiveMap:tileT,emissiveIntensity:.34}),conc=dbl('#b3b6ba'),dark=dbl('#2b2e33'),stone=dbl('#9a9288'),pave=dbl('#6f747a'),grass=dbl('#587f42'),water=new THREE.MeshStandardMaterial({color:C('#2f7fb5'),roughness:.18,metalness:.35,side:THREE.DoubleSide});
  const a0=Z[0][0],a1=Z[Z.length-1][1];
  add(strip2(at(-3.6,.02),at(STB+3.6,.02),a0,a1,new THREE.MeshStandardMaterial({map:bedT,roughness:1,side:THREE.DoubleSide}),8,3));rails(sbP,a0,a1,0,s,1,10,.05);rails(sbP,a0,a1,STB,s,1,10,.05);
  const towers=(a,b,near,far,n,hmax)=>{for(let i=0;i<n;i++){const d=rnd2(a,b),o=side()*rnd2(near,far),w=rnd2(14,26),h=rnd2(16,hmax),p=sbP(d,o,0),f=bt[i%bt.length],m=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),[f,f,dark,dark,f,f]);m.position.set(p.x,h/2,p.z);m.rotation.y=sbYaw(d);s.add(m);}};
  const trees=[],trunks=[],tree=(d,o,y)=>{const p=sbP(d,o,y||0),k=rnd2(.8,1.4);trees.push([p.x,p.y+5*k,p.z,k]);trunks.push([p.x,p.y+1.7*k,p.z,k]);};
  const lights=[],dim=[],sig=[],ppl=[],cols=[],clouds=[],autos=[],lampP=[],homes=[];
  Z.forEach((z,zi)=>{const a=z[0],b=z[1],k=z[2];
    if(k==='t'||k==='h'){add(strip2(at(-4.2,0),at(-4.2,6.6),a,b,tunM,10,14));add(strip2(at(STB+4.2,0),at(STB+4.2,6.6),a,b,tunM,10,14));add(strip2(at(-4.2,6.6),at(STB+4.2,6.6),a,b,dark,10));for(let d=a+10;d<b;d+=26)dim.push(d);for(let d=a+60;d<b-30;d+=150)sig.push(d);
      if(k==='h')for(let d=a+30;d<b;d+=40){const p=sbP(d,-4.1,3.4),m=new THREE.Mesh(new THREE.PlaneGeometry(5,2.6),new THREE.MeshBasicMaterial({map:sub_wave(),side:THREE.DoubleSide}));m.position.copy(p);m.rotation.y=sbYaw(d)-Math.PI/2;s.add(m);}}
    else if(k==='hall'){const Lw=-11.5,Rw=STB+11.5,H=7.2;add(strip2(at(Lw,0),at(Lw,H),a,b,tileM,10,16));add(strip2(at(Rw,0),at(Rw,H),a,b,tileM,10,16));add(strip2(at(Lw,H),at(Rw,H),a,b,dbl('#3a3d42'),10));
      [a,b].forEach(d=>{[[Lw,-4.2],[STB+4.2,Rw]].forEach(q=>{const p=sbP(d,(q[0]+q[1])/2,H/2),m=box(Math.abs(q[1]-q[0]),H,.6,tileM,p.x,p.y,p.z,s);m.rotation.y=sbYaw(d);});});
      for(let d=a+8;d<b;d+=11)lights.push(d);for(let d=a+14;d<b-4;d+=14)cols.push(d);}
    else{ /* open air */
      for(let i=0;i<(b-a)/45;i++){const p=sbP(rnd2(a,b),side()*rnd2(40,700),rnd2(150,260));clouds.push([p,rnd2(14,30)]);}
      let K=k;if(k==='ost'){const nx=zi+1<Z.length?Z[zi+1][2]:null,pv=zi>0?Z[zi-1][2]:null;K=nx&&!sbUnder(nx)&&nx!=='ost'?nx:pv&&!sbUnder(pv)&&pv!=='ost'?pv:'s';}z[4]=K;
      if(K==='b'){[[-900,-4.2],[STB+4.2,900]].forEach(q=>add(strip2(at(q[0],-9),at(q[1],-9),a,b,water,30)));add(strip2(at(-4.2,-9),at(STB+4.2,-9),a,b,water,30));[-4.2,STB+4.2].forEach(o=>{add(strip2(at(o,-1.6),at(o,1.1),a,b,stone,20));});add(strip2(at(-4.2,-1.6),at(STB+4.2,-1.6),a,b,stone,20));
        for(let d=a+20;d<b;d+=46){const p=sbP(d,STB/2,-5.4),m=box(STB+7.4,7.6,5,stone,p.x,p.y,p.z,s);m.rotation.y=sbYaw(d);}
        if(k!=='ost'){const mid=(a+b)/2;[mid-26,mid+26].forEach(d=>[-6.4,STB+6.4].forEach(o=>{const p=sbP(d,o,0);cyl(2.4,2.8,15,stone,p.x,5.5,p.z,s,10);cyl(2.9,2.9,.8,stone,p.x,13.2,p.z,s,10);cyl(0,2.6,3,dbl('#5d6a5e'),p.x,15.2,p.z,s,10);}));
          for(let i=0;i<6;i++){const p=sbP(rnd2(a+20,b-20),side()*rnd2(40,300),-8.4),g=new THREE.Group();g.position.copy(p);g.rotation.y=Math.random()*6;s.add(g);box(2.4,1.4,8,M('#f2f4f7'),0,.4,0,g);box(.14,10,.14,M('#8a6a3a'),0,5.6,.6,g);const sl=new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new V3(0,1.6,.5),new V3(0,10,.5),new V3(0,1.6,-3.6)]),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));g.add(sl);}}
        towers(a-60,b+60,330,640,16,120);[-1,1].forEach(q=>{add(strip2(at(q*250,-8.6),at(q*330,-2),a-60,b+60,grass,30));for(let i=0;i<(b-a)*.07;i++)tree(rnd2(a-40,b+40),q*rnd2(268,326),-3);});
        if(li===3&&z[3]===0&&k!=='ost'){const d=sbStop(1)-150,p=sbP(d,-92,0),m=mkMoS(9);m.position.set(p.x,0,p.z);m.rotation.y=sbYaw(d)+Math.PI/2;s.add(m);}}
      else if(K==='c'){[[-900,-9],[STB+9,900]].forEach(q=>add(strip2(at(q[0],7),at(q[1],7),a,b,pave,30)));add(strip2(at(-9,0),at(-9,7),a,b,stone,10));add(strip2(at(STB+9,0),at(STB+9,7),a,b,stone,10));add(strip2(at(-9,0),at(-3.6,0),a,b,dbl('#4a4d52'),20));add(strip2(at(STB+3.6,0),at(STB+9,0),a,b,dbl('#4a4d52'),20));
        const P=(d,o)=>sbP(d,o,7);for(let i=0;i<(b-a)*.09;i++){const d=rnd2(a,b),o=side()*rnd2(30,260),w=rnd2(14,24),h=rnd2(14,60),p=P(d,o),f=bt[i%bt.length],m=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),[f,f,dark,dark,f,f]);m.position.set(p.x,7+h/2,p.z);m.rotation.y=sbYaw(d);s.add(m);}for(let i=0;i<(b-a)*.08;i++)tree(rnd2(a,b),side()*rnd2(12,26),7);
        for(let d=a+40;d<b;d+=120){const p=sbP(d,STB/2,8),m=box(STB+22,1.4,9,conc,p.x,p.y,p.z,s);m.rotation.y=sbYaw(d);}
        if(k!=='ost'&&z[3]===5){rails(sbP,a,b,-6.6,s,1,10,.05);new Consist(['loco','coach','coach','coach'],1,s).place((d,o)=>sbP(d,-6.6),a+250,1,.62);}
        for(let d=a;d<b;d+=38)[-13,STB+13].forEach(o=>lampP.push(sbP(d,o,7)));}
      else if(K==='e'){add(strip2(at(-900,0),at(-4.2,0),a,b,grass,30));add(strip2(at(STB+4.2,0),at(16,0),a,b,grass,30));add(strip2(at(16,0),at(74,-.6),a,b,dbl('#e3cf9a'),30));add(strip2(at(74,-.6),at(1400,-.6),a,b,water,30));for(let i=0;i<(b-a)*.1;i++)tree(rnd2(a,b),-rnd2(14,200));for(let i=0;i<(b-a)*.07;i++){const d=rnd2(a,b);homes.push([sbP(d,-rnd2(26,170),0),sbYaw(d)+rnd2(-.3,.3)]);}for(let i=0;i<26;i++)ppl.push(sbP(rnd2(a,b),rnd2(20,70),-1.3));
        {const p=sbP((a+b)/2+80,150,0);cyl(3,4.2,26,M('#f4f4f0'),p.x,12,p.z,s,12);cyl(3.4,3.4,3,M('#c7352b'),p.x,26.5,p.z,s,12);cyl(0,3.6,3,M('#33363c'),p.x,29.5,p.z,s,12);cyl(9,10,2,stone,p.x,0,p.z,s,14);}
        for(let i=0;i<16;i++){const p=sbP(rnd2(a,b),rnd2(22,66),-.2),g=new THREE.Group();g.position.copy(p);s.add(g);cyl(.06,.06,3,M('#c9ced6'),0,1.5,0,g,5);const u=new THREE.Mesh(new THREE.ConeGeometry(2,1,10),M(['#d9362b','#f2c21b','#2d7fe0','#35b45a'][i%4]));u.position.y=3.2;g.add(u);}}
      else{ /* street / city surface */
        add(strip2(at(-900,0),at(-4.2,0),a,b,pave,30));add(strip2(at(STB+4.2,0),at(900,0),a,b,pave,30));
        if(L.tram){[[-14,-4.2],[STB+4.2,STB+14]].forEach(q=>add(strip2(at(q[0],.04),at(q[1],.04),a,b,dbl('#3b3e44'),20)));[-9,STB+9].forEach(o=>add(strip2(at(o-.12,.06),at(o+.12,.06),a,b,dbl('#e8e2c8'),20)));}
        {const ln=L.tram?[-7,-11.5,STB+7,STB+11.5]:[-17,-21,STB+17,STB+21];if(!L.tram)[[-24,-14],[STB+14,STB+24]].forEach(q=>add(strip2(at(q[0],.04),at(q[1],.04),a,b,dbl('#3b3e44'),20)));for(let i=0;i<(b-a)*.09;i++){const d=rnd2(a+8,b-8),o=ln[i%4];autos.push([sbP(d,o,.05),sbYaw(d)+(o<0?Math.PI:0)]);}for(let d=a;d<b;d+=36)[L.tram?-15.5:-26,STB+(L.tram?15.5:26)].forEach(o=>lampP.push(sbP(d,o,0)));}
        if(li===2&&k!=='ost'){const p=sbP((a+b)/2,-150,0);cyl(2.6,3.4,34,M('#d9dce0'),p.x,17,p.z,s,10);cyl(5.4,3.6,4,M('#20303f',{roughness:.2,metalness:.6}),p.x,36,p.z,s,10);cyl(5.8,5.8,.8,M('#d9dce0'),p.x,38.4,p.z,s,10);const q=sbP((a+b)/2+60,-240,0),t=box(150,16,40,M('#cfd6dc',{roughness:.5}),q.x,8,q.z,s);t.rotation.y=sbYaw((a+b)/2);}
        towers(a,b,L.tram?26:30,260,Math.round((b-a)*.1),K==='s'&&li===2?26:70);for(let i=0;i<(b-a)*.06;i++)tree(rnd2(a,b),side()*rnd2(L.tram?17:13,24));
        if(li===2){for(let i=0;i<3;i++){const pl=ACS.liner.make(),p=sbP(a+90+i*110,-(70+i*26),0);pl.position.set(p.x,ACS.liner.gh,p.z);pl.rotation.y=1+i;s.add(pl);}}}
      if(k==='ost'){[[-2.2,-8.6],[STB+2.2,STB+8.6]].forEach(q=>{add(strip2(at(q[0]+(q[0]<0?-.9:.9),5.2),at(q[1],4.9),a+14,b-8,dbl('#3f4650'),10));for(let d=a+18;d<b-8;d+=13){const p=sbP(d,(q[0]+q[1])/2,3.1);cyl(.15,.15,3.9,M('#2f3440'),p.x,p.y,p.z,s,6);}});}
    }
    /* portals where a tunnel meets daylight */
    if(zi>0){const pk=Z[zi-1][2];if(sbUnder(pk)!==sbUnder(k)){const d=a,p=sbP(d,STB/2,0),g=new THREE.Group();g.position.copy(p);g.rotation.y=sbYaw(d);s.add(g);box(5,12,2.4,stone,-STB/2-6.7,6,0,g);box(5,12,2.4,stone,STB/2+6.7,6,0,g);box(STB+18.4,5.4,2.4,stone,0,9.3,0,g);const und=sbUnder(k)?[a,a+60]:[a-60,a];[[-900,-9.2],[STB+9.2,900]].forEach(q=>add(strip2(at(q[0],0),at(q[1],0),und[0],und[1],grass,30)));add(strip2(at(-9.2,12),at(STB+9.2,12),und[0],und[1],grass,30));}}
    /* platforms, signs and people at every stop */
    if(k==='hall'||k==='ost'){const st=L.stops[z[3]],d=sbStop(z[3]),pa=d-98,pb=d+8,nt=cvs(512,96,(c,w,h)=>{c.fillStyle='#fff';c.fillRect(0,0,w,h);c.fillStyle=lc;c.fillRect(0,0,w,16);c.fillRect(0,h-10,w,10);c.fillStyle='#1d2440';c.font='800 50px Arial';c.textAlign='center';c.textBaseline='middle';let f=50;while(c.measureText(st[0]).width>w-26){f-=3;c.font='800 '+f+'px Arial';}c.fillText(st[0],w/2,h/2+3);});
      [[-2.2,k==='hall'?-11.5:-8.6],[STB+2.2,k==='hall'?STB+11.5:STB+8.6]].forEach(q=>{add(strip2(at(q[0],1.1),at(q[1],1.1),pa,pb,conc,10));add(strip2(at(q[0],0),at(q[0],1.1),pa,pb,conc,10));add(strip2(at(q[0],1.12),at(q[0]+(q[0]<0?-.5:.5),1.12),pa,pb,dbl('#f2c21b'),10));
        for(let dd=pa+16;dd<pb;dd+=24){const p=sbP(dd,q[1]-(q[1]<0?-.12:.12),k==='hall'?4.4:3.4),m=new THREE.Mesh(new THREE.PlaneGeometry(6,1.12),new THREE.MeshBasicMaterial({map:nt}));m.position.copy(p);m.rotation.y=sbYaw(dd)+(q[1]<0?-1:1)*Math.PI/2;s.add(m);}
        for(let dd=pa+12;dd<pb-6;dd+=30){const p=sbP(dd,q[1]-(q[1]<0?-1:1),1.5),m=box(.6,.12,3,M('#6b4a2f'),p.x,p.y,p.z,s);m.rotation.y=sbYaw(dd);}
        for(let i=0;i<9;i++)ppl.push(sbP(rnd2(pa+4,pb-4),rnd2(Math.min(q[0],q[1])+1.5,Math.max(q[0],q[1])-1.2),1.1));});}
  });
  /* instanced bits */
  const dm=new THREE.Object3D(),I=(geo,mat,n)=>{const m=new THREE.InstancedMesh(geo,mat,Math.max(1,n));m.frustumCulled=false;s.add(m);return m;},put=(m,i,p,ry,sx,sy,sz)=>{dm.position.copy(p);dm.rotation.set(0,ry||0,0);dm.scale.set(sx||1,sy||sx||1,sz||sx||1);dm.updateMatrix();m.setMatrixAt(i,dm.matrix);};
  { const m=I(new THREE.BoxGeometry(.5,.12,4),new THREE.MeshBasicMaterial({color:0xfff6dc}),lights.length*4);lights.forEach((d,i)=>[-8,-2.6,STB+2.6,STB+8].forEach((o,j)=>put(m,i*4+j,sbP(d,o,7.05),sbYaw(d))));
    const m2=I(new THREE.BoxGeometry(.3,.1,1.6),new THREE.MeshBasicMaterial({color:0xd9c98a}),dim.length*2);dim.forEach((d,i)=>[-3.9,STB+3.9].forEach((o,j)=>put(m2,i*2+j,sbP(d,o,5.2),sbYaw(d))));
    const m3=I(new THREE.BoxGeometry(.5,7.2,.5),M('#c9ced6',{roughness:.5}),cols.length);cols.forEach((d,i)=>put(m3,i,sbP(d,STB/2,3.6)));
    const m4=I(new THREE.SphereGeometry(.22,8,6),new THREE.MeshBasicMaterial({color:0x39e06f}),sig.length),m5=I(new THREE.BoxGeometry(.5,1.5,.4),M('#16181c'),sig.length);sig.forEach((d,i)=>{put(m4,i,sbP(d,-3.6,3.6));put(m5,i,sbP(d-.2,-3.6,3.3));});
    const lf=new THREE.MeshStandardMaterial({color:C('#3f7a3a'),roughness:1,flatShading:true}),t1=I(new THREE.IcosahedronGeometry(3,1),lf,trees.length),t2=I(new THREE.CylinderGeometry(.3,.4,3.4,5),M('#5b4630'),trunks.length);trees.forEach((t,i)=>{put(t1,i,new V3(t[0],t[1],t[2]),0,t[3]);put(t2,i,new V3(trunks[i][0],trunks[i][1],trunks[i][2]),0,1,trunks[i][3],1);});
    const cw=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,emissive:new THREE.Color(0x9fb4c8),emissiveIntensity:.5,flatShading:true}),cl=I(new THREE.IcosahedronGeometry(1,1),cw,clouds.length*3);clouds.forEach((c,i)=>{for(let j=0;j<3;j++){const p=c[0].clone();p.x+=(j-1)*c[1]*.9;p.y+=j===1?c[1]*.18:0;put(cl,i*3+j,p,0,c[1]*(j===1?1.15:.8),c[1]*.42,c[1]*.7);}});
    const col=new THREE.Color(),wm=()=>new THREE.MeshStandardMaterial({color:0xffffff,roughness:.45,metalness:.3}),ab=I(new THREE.BoxGeometry(1.9,.9,4.4),wm(),autos.length),at2=I(new THREE.BoxGeometry(1.7,.75,2.3),M('#1c2530',{roughness:.15,metalness:.7}),autos.length),ac=['#c8312b','#2d5fb8','#f2f2ee','#22252a','#e0b21c','#2f8a4c','#8a8f98'];autos.forEach((q,i)=>{put(ab,i,q[0].clone().setY(q[0].y+.75),q[1]);put(at2,i,q[0].clone().setY(q[0].y+1.5),q[1]);ab.setColorAt(i,col.set(ac[i%7]).convertSRGBToLinear());});
    const lp=I(new THREE.CylinderGeometry(.12,.16,7,6),M('#3a3f48'),lampP.length),ll=I(new THREE.SphereGeometry(.45,8,6),new THREE.MeshBasicMaterial({color:0xfff3c4}),lampP.length);lampP.forEach((p,i)=>{put(lp,i,p.clone().setY(p.y+3.5));put(ll,i,p.clone().setY(p.y+7.2));});
    const hb=I(new THREE.BoxGeometry(9,6,8),wm(),homes.length),hr=I(new THREE.ConeGeometry(7.2,4,4),M('#5b4038'),homes.length),hc=['#e8dcc0','#c9d6e2','#d9b9a0','#b9cfae','#f0e6d2','#c7b0c9'];homes.forEach((q,i)=>{put(hb,i,q[0].clone().setY(3),q[1]);put(hr,i,q[0].clone().setY(8),q[1]+Math.PI/4);hb.setColorAt(i,col.set(hc[i%6]).convertSRGBToLinear());});
    const pm=()=>new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85}),b=I(new THREE.CylinderGeometry(.3,.33,.95,7),pm(),ppl.length),h=I(new THREE.SphereGeometry(.24,7,5),pm(),ppl.length),lg=I(new THREE.BoxGeometry(.5,1.1,.3),pm(),ppl.length),sh=['#b5452b','#27578f','#2f7a4a','#c79a1c','#6d3a86','#e8e4da','#1f6f8a','#d4692a'],sk=['#f0cfae','#c99772','#8d5e3f','#e8bf9a'];
    ppl.forEach((p,i)=>{const k=rnd2(.6,1.08);put(b,i,p.clone().setY(p.y+1.55*k),0,k);put(h,i,p.clone().setY(p.y+2.3*k),0,k);put(lg,i,p.clone().setY(p.y+.55*k),0,k);b.setColorAt(i,col.set(sh[i%8]).convertSRGBToLinear());h.setColorAt(i,col.set(sk[i%4]).convertSRGBToLinear());lg.setColorAt(i,col.set('#2b3040').convertSRGBToLinear());});}
  s.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});
  const dyn=new Set();batchStatic(s,dyn,900);
  const types=[];for(let i=0;i<L.cars;i++)types.push('metro:'+lc);const mine=new Consist(types,1,s),oth=new Consist(types,1,s);
  if(L.tram)[mine,oth].forEach(c=>c.cars.forEach(car=>{const gm=M('#3a3f48',{roughness:.5,metalness:.8}),a=box(.1,.1,2.2,gm,0,4.9,-.3,car);a.rotation.x=-.8;const b2=box(.1,.1,2.2,gm,0,5.9,-.3,car);b2.rotation.x=.8;box(1.9,.09,.25,gm,0,6.6,.45,car);}));
  s.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});
  const cab=sbCabIn(mine.cars[0]),seat=sbSeatIn(mine.cars[Math.min(1,L.cars-1)],lc,L.look||-1);
  sub={scene:s,L,Z,mine,oth,hemi,sun,lamp,head,ht,sky,len:L.cars*22,od:sbStop(3),cab,seat};
}
/* driver's cab: windscreen, desk, lever and a turtle-to-rabbit speed dial */
function sbCabIn(car){const g=new THREE.Group(),E=(c,e)=>new THREE.MeshStandardMaterial({color:C(c),roughness:.75,emissive:C(c),emissiveIntensity:e||.25}),dk=E('#23262c'),md=E('#4d535e'),lt=E('#9aa0aa',.2),b=(w,h,d,m,x,y,z)=>box(w,h,d,m,x,y,z,g);
  b(3.1,.1,3,dk,0,1.3,8.8);b(3.1,.1,3,md,0,4.06,8.8);b(3.1,2.8,.1,md,0,2.7,7.3);[-1.55,1.55].forEach(x=>{b(.08,1.25,3,md,x,1.9,8.8);b(.12,1.5,.14,dk,x,3.27,10.26);b(.12,1.5,.14,dk,x,3.27,8.5);b(.08,.12,3,dk,x,4,8.8);});
  b(3.1,.14,.2,dk,0,2.5,10.22);b(3.1,.2,.16,dk,0,3.98,10.26);b(3.1,1.2,.9,md,0,1.9,9.82);b(3.1,.06,.95,dk,0,2.52,9.8);
  const c=document.createElement('canvas');c.width=c.height=256;const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;const pl=new THREE.Mesh(new THREE.PlaneGeometry(.62,.62),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));pl.position.set(-.6,2.84,9.95);pl.rotation.set(-.35,Math.PI,0,'YXZ');pl.scale.setScalar(.8);g.add(pl);
  const lev=new THREE.Group();lev.position.set(-1.32,2.55,9.85);box(.04,.3,.04,lt,0,.15,0,lev);sph(.06,E('#c0261c',.5),0,.32,0,lev);g.add(lev);[[.1,'#35c46a'],[.3,'#ffd23f'],[.5,'#e23d3d']].forEach(q=>b(.09,.05,.09,GL(q[1]),q[0],2.57,9.7));
  g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});g.userData={g2:c.getContext('2d'),t,lev};g.visible=false;car.add(g);return g;}
function sbDial(v,max){const u=sub.cab.userData,g=u.g2,k=clamp(v/max,0,1);g.fillStyle='#0d1014';g.fillRect(0,0,256,256);const A=Math.PI*.85,B=Math.PI*2.15;[['#35c46a',0,.4],['#ffd23f',.4,.7],['#e23d3d',.7,1]].forEach(q=>{g.strokeStyle=q[0];g.lineWidth=22;g.beginPath();g.arc(128,140,92,A+(B-A)*q[1],A+(B-A)*q[2]);g.stroke();});
  g.font='44px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('🐢',44,222);g.fillText('🐇',212,222);const a=A+(B-A)*k;g.strokeStyle='#fff';g.lineWidth=9;g.lineCap='round';g.beginPath();g.moveTo(128,140);g.lineTo(128+Math.cos(a)*78,140+Math.sin(a)*78);g.stroke();g.fillStyle='#fff';g.beginPath();g.arc(128,140,12,0,7);g.fill();u.t.needsUpdate=true;}
/* passenger car: benches in the line colour, poles, windows, riders */
function sbSeatIn(car,col,look){const g=new THREE.Group(),E=(c,e)=>new THREE.MeshStandardMaterial({color:C(c),roughness:.8,emissive:C(c),emissiveIntensity:e||.22}),wall=E('#dfe1dc'),fl=E('#454a55',.12),seat=E(col,.12),metal=E('#c2c7cf',.25),b=(w,h,d,m,x,y,z)=>box(w,h,d,m,x,y,z,g);
  b(3.06,.1,20.4,fl,0,1.25,0);b(3.06,.1,20.4,wall,0,4.1,0);b(.5,.05,19,GL('#fff8e6'),0,4.03,0);
  [-1.53,1.53].forEach(x=>{b(.08,.8,20.4,wall,x,1.62,0);b(.08,.5,20.4,wall,x,3.86,0);for(let k=0;k<7;k++)b(.1,1.6,.3,wall,x,2.82,9-3*k);b(.56,.12,17.6,seat,x*.8,1.72,0);b(.1,.3,17.6,seat,x*.96,1.9,0);b(.05,.05,19,metal,x*.5,3.8,0);});
  for(let z=-8;z<=8;z+=4)[-.48,.48].forEach(x=>b(.05,2.8,.05,metal,x,2.7,z));[10.2,-10.2].forEach(z=>{b(3.06,2.9,.1,wall,0,2.7,z);b(.9,2.1,.12,E('#8d939c',.15),0,2.35,z*.999);});
  const sh=['#b5452b','#27578f','#2f7a4a','#c79a1c','#6d3a86','#1f6f8a','#d4692a'],sk=['#f0cfae','#c99772','#8d5e3f','#e8bf9a'],fig=(x,z,k,i)=>{const q=x>0?-1:1,m=E(sh[i%7],.2);cyl(.2*k,.22*k,.62*k,m,x,1.78+.42*k,z,g,8);sph(.17*k,E(sk[i%4],.2),x,1.78+.92*k,z,g);b(.5,.14,.34*k,E('#2b3040',.15),x+q*.3,1.85,z);b(.12,.42,.3*k,E('#2b3040',.15),x+q*.52,1.6,z);};
  [[1.2,6.6,1],[1.2,3.4,.72],[1.2,-3.5,1],[1.2,-6.4,.9],[-1.2,7.4,1],[-1.2,4.2,.95],[-1.2,-1.2,.7],[-1.2,-5.8,1]].forEach((q,i)=>{if(Math.abs(q[1]-1)<1.6&&q[0]*look<0)return;fig(q[0],q[1],q[2],i);});
  fig(-look*1.2,2.25,.7,3); /* the friend sitting next to you */
  g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});g.visible=false;car.add(g);return g;}
let _sw=null;function sub_wave(){return _sw||(_sw=cvs(256,128,(c,w,h)=>{c.fillStyle='#0f3f73';c.fillRect(0,0,w,h);c.font='70px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('🌊🐟🌊',w/2,h/2+6);}));}
const sbKind=d=>{if(!sub)return 's';for(const z of sub.Z)if(d>=z[0]&&d<z[1])return z[2];return 's';};
const sbFlav=d=>{if(!sub)return 's';for(const z of sub.Z)if(d>=z[0]&&d<z[1])return z[4]||z[2];return 's';};
const sbDark=d=>{if(!sub)return 0;let k=0;const Z=sub.Z;for(let i=0;i<Z.length;i++){if(!sbUnder(Z[i][2]))continue;let a=Z[i][0],b=Z[i][1];while(i+1<Z.length&&sbUnder(Z[i+1][2])){i++;b=Z[i][1];}k=Math.max(k,clamp((d-a+6)/30,0,1)*clamp((b+6-d)/30,0,1));}return k;};

const levS=Lever($('levS'));
$('shorn').onclick=()=>{audioInit();[440,554].forEach(f=>tone(f,.9,'square',.05));};
function sBig(e,w,ms){const b=$('tbig3');b.innerHTML='<span>'+e+'</span><b>'+w+'</b>';b.style.opacity=1;clearTimeout(SB.bt);SB.bt=setTimeout(()=>{b.style.opacity=0;},ms||3400);}
function subView(v){if(!sub)return;SB.view=v;sub.cab.visible=v==='nose';sub.seat.visible=v==='seat';SB.yaw=0;SB.pitch=0;cam.near=v==='out'?.3:.12;cam.updateProjectionMatrix();}
function subNextView(){if(SB.phase!=='run')return;const o=['nose','seat','out'],v=o[(o.indexOf(SB.view)+1)%3];subView(v);msg(v==='nose'?'🧑‍✈️ Driver seat':v==='seat'?'💺 Passenger seat. Drag to look around':'🎥 Outside view',2600);}
function subMap(){const L=sub.L,n=L.stops.length,m=$('smap');m.style.setProperty('--c',L.col);m.innerHTML='<i class="ln"></i>'+L.stops.map((s,i)=>'<i class="dot" style="left:'+(i/(n-1)*100)+'%"></i>').join('')+'<i class="me">🚇</i>';}
function subPick(){SB.phase='pick';subView('out');$('spick').classList.remove('hide');$('tbig3').style.opacity=0;if(!sub)buildSubway(SB.line);cam.position.copy(sbP(sbStop(0)-60,-7,3.4));cam.lookAt(sbP(sbStop(0),0,2.5));say('Which subway line? Red, orange, blue, or green?');}
function subStart(li){$('spick').classList.add('hide');SB.line=li;buildSubway(li);const L=sub.L;SB.phase='run';SB.d=sbStop(0);SB.v=0;SB.next=1;SB.dwell=0;SB.done=false;SB.said={};SB.yaw=0;SB.pitch=0;subView('nose');subMap();levS.set(0);$('snext').textContent='Next: '+L.stops[1][0];$('snext').style.borderColor=L.col;$('sline').textContent=L.name;$('sline').style.background=L.col;
  sBig('<i style="display:inline-block;width:58px;height:58px;border-radius:50%;border:5px solid #fff;background:'+L.col+'"></i>',L.name+'. Push the lever up!',6000);say('The '+L.name+'. '+L.word+'! This is '+L.stops[0][0]+'. Push the lever up to go.');}
document.querySelectorAll('#spick button').forEach((b,i)=>b.onclick=()=>{audioInit();subStart(i);});
function updSubway(dt){
  if(SB.phase==='pick'){const t=performance.now()/4000;cam.position.copy(sbP(sbStop(0)-70+Math.sin(t)*14,-7,3.6));cam.lookAt(sbP(sbStop(0)-20,1,2.4));sub.mine.place(sbP,sbStop(0),1,.62);sub.oth.place((d,o)=>sbP(d,STB),sub.od,-1,.62);subLight(sbStop(0),dt);return;}
  const A=SB,L=sub.L,n=L.stops.length,S=sbStop(A.next);
  if(keys.ArrowUp||keys.w)levS.set(levS.v+dt*.7);if(keys.ArrowDown||keys.s)levS.set(levS.v-dt*.9);
  let vt=A.done?0:levS.v*(L.tram?26:33);
  if(!A.done){const rem=S-A.d;if(A.dwell<=0)vt=Math.min(vt,Math.sqrt(Math.max(0,2*3.2*(rem-.3)))+.5);
    if(A.dwell<=0&&(rem<1&&A.v<1&&levS.v>.02||rem<=.3)){A.v=0;A.d=Math.min(A.d,S);const nm=L.stops[A.next][0];
      if(A.next===n-1){A.done=true;levS.set(0);addStar(3);sBig('🎉','Yay! Last stop!',7400);say('Yay! '+nm+'. Last stop. Great driving!');snd.fanfare();confetti();const id=++A.fid;setTimeout(()=>{if(mode==='subway'&&A.done)confetti();},1800);setTimeout(()=>{if(mode==='subway'&&A.done&&A.fid===id)setMode('menu');},7500);}
      else{A.dwell=5.5;addStar(1);snd.chime();sBig('<i class="num">'+(A.next+1)+'</i>',nm,4600);say(nm+'. Stop number '+(A.next+1)+'. Doors open.');}}}
  if(A.dwell>0){A.dwell-=dt;vt=0;if(A.dwell<=0){A.next++;const nm=L.stops[A.next][0],lf=n-A.next;$('snext').textContent='Next: '+nm;say('Doors closing. Next stop, '+nm+'. '+(lf===1?'One more stop to go.':lf+' more stops to go.'));sBig('🚪','Next stop: '+nm,3400);}}
  A.v+=clamp(vt-A.v,-7*dt,2.4*dt);if(A.v<.02&&vt===0)A.v=0;const d0=A.d;A.d+=A.v*dt;
  sub.mine.place(sbP,A.d,1,.62);
  sub.od-=17*dt;if(sub.od<A.d-260)sub.od=A.d+700+Math.random()*500;if(sub.od>sbStop(n-1)+40)sub.od=sbStop(n-1)+40;sub.oth.place((d,o)=>sbP(d,STB),sub.od,-1,.62);
  /* things to say between stops, and going in and out of tunnels */
  if(!A.done&&A.dwell<=0){const seg=A.next-1,mid=sbStop(seg)+90;if(L.notes[seg]&&d0<mid&&A.d>=mid&&!A.said['n'+seg]){A.said['n'+seg]=1;const q=L.notes[seg];sBig(q[0],q[1],4200);say(q[2]);}
    const k0=sbUnder(sbKind(d0+14)),k1=sbUnder(sbKind(A.d+14));if(k0!==k1){sBig(k1?'⬇️':'⬆️',k1?'Going DOWN':'Going UP',2600);if(!L.notes[seg])say(k1?'Going down, into the dark tunnel.':'Going up, into the sunshine.');}
    /* one little lesson per ride between stops: fast, left or right, colour */
    const les=sbStop(seg)+215;if(!L.notes[seg]&&d0<les&&A.d>=les){const w=seg%3;if(w===0&&A.v>14){sBig('🐇','FAST!',2600);say('We are going fast!');}else if(w===1){const c=(sbX(A.d+90)-sbX(A.d+60))-(sbX(A.d+10)-sbX(A.d-20));if(Math.abs(c)>.2){sBig(c>0?'➡️':'⬅️',c>0?'Turning RIGHT':'Turning LEFT',2800);say(c>0?'We are turning right.':'We are turning left.');}}else if(w===2){sBig('<i style="display:inline-block;width:58px;height:58px;border-radius:50%;border:5px solid #fff;background:'+L.col+'"></i>',L.word+' train',2800);say('What colour is our train? '+L.word+'!');}}
    const slo=S-58;if(d0<slo&&A.d>=slo&&A.v>8){sBig('🐢','Slow...',2200);if(A.next%2===0)say('Slowing down. Slow.');}
    if(L.marks)L.marks.forEach((q,i)=>{if(d0<q[0]&&A.d>=q[0]){sBig(q[1],q[2],4200);say(q[3]);}});}
  {const n1=n-1,f=clamp((A.d-SB0)/(n1*SSP),0,1),m=$('smap'),me=m.lastChild;if(me)me.style.left=(f*100)+'%';const ds=m.querySelectorAll('.dot');for(let i=0;i<ds.length;i++)ds[i].classList.toggle('on',A.d>=sbStop(i)-2);}
  subLight(A.d,dt);
  engine(.03+A.v*.004,240+A.v*30,.02+A.v*.001,60+A.v*5);
  if(A.view==='nose'||A.view==='seat'){const cabv=A.view==='nose',c=cabv?sub.mine.cars[0]:sub.seat.parent,lk=L.look||-1,sway=Math.sin(performance.now()*.004)*.004*A.v/30;c.updateMatrixWorld();
    cam.position.copy(c.localToWorld(cabv?new V3(-.6,3.0+sway*3,8.75):new V3(-lk*.95,2.78+sway*4,1.1)));cam.quaternion.copy(c.quaternion).multiply(QYs).multiply(_q.setFromEuler(_e.set((cabv?-.1:.03)+(A.pitch||0),(cabv?0:lk*(.95+.2*Math.sin(performance.now()*.0004)))+(A.yaw||0),sway*2,'YXZ')));
    if(cabv){sub.cab.userData.lev.rotation.x=.5-levS.v*1.0;if((A.fr=(A.fr||0)+1)%8===0)sbDial(A.v,L.tram?26:33);}}
  else{const zk=sbFlav(A.d),und=sbDark(A.d)>.02||sbDark(A.d-sub.len-14)>.02,want=und?sbP(A.d-sub.len-12,STB/2,5.2):zk==='c'?sbP(A.d-sub.len-16,STB/2,6):sbP(A.d-sub.len*.5-34,-13,7.5);if(cam.position.distanceTo(want)>300)cam.position.copy(want);else cam.position.lerp(want,1-Math.exp(-dt*4));cam.lookAt(sbP(A.d-sub.len*.3,und?0:1,2.6));}
}
function subLight(d,dt){const k=sbDark(d),hall=sbKind(d+10)==='hall'?1:0;sub.hemi.intensity=.8-.6*k+.25*hall*k;sub.sun.intensity=1.9*(1-k);sub.lamp.intensity=(1.1+1.2*hall)*k;sub.lamp.position.copy(sbP(d+8,STB/2,5.6));sub.head.intensity=3*k;sub.head.position.copy(sbP(d+1,0,2.6));sub.ht.position.copy(sbP(d+40,0,1));
  sub.scene.fog.near=300-240*k;sub.scene.fog.far=2200-1700*k;sub.scene.fog.color.setRGB(sub.sky.r*(1-k)+.015*k,sub.sky.g*(1-k)+.015*k,sub.sky.b*(1-k)+.02*k);sub.scene.background=sub.scene.fog.color;}

/* drag to look around from the driver or passenger seat */
(function(){let id=null,lx=0,ly=0;canvas.addEventListener('pointerdown',e=>{if(mode!=='subway'||SB.view==='out')return;id=e.pointerId;lx=e.clientX;ly=e.clientY;});
  addEventListener('pointermove',e=>{if(e.pointerId!==id)return;SB.yaw=clamp((SB.yaw||0)+(e.clientX-lx)*.006,-2.2,2.2);SB.pitch=clamp((SB.pitch||0)+(e.clientY-ly)*.004,-.6,.5);lx=e.clientX;ly=e.clientY;});
  addEventListener('pointerup',e=>{if(e.pointerId===id)id=null;});addEventListener('pointercancel',e=>{if(e.pointerId===id)id=null;});})();
