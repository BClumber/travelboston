/* ---------- life.js: people, shops, buses, subway and trolley lines, street furniture ---------- */
const LIFE={walk:[],lamps:[],stops:[],parked:[],sig:[],bench:[],fp:[],fu:[],ap:[],ac:[],buses:[],tick:[]};
const SHOPS=[['BAKERY','#a8442a','🥖🥐🍞'],['PIZZA','#2f7a4a','🍕🍕🥤'],['HARDWARE','#b3261f','🔨🪛🧰'],['BOOKS','#27578f','📚📖📕'],['PHARMACY','#1f6f8a','💊🧴🩹'],['COFFEE & DONUTS','#c2571a','☕🍩🥯'],
  ['TOY SHOP','#6d3a86','🧸🚂🪀'],['ICE CREAM','#d0628f','🍦🍨🍧'],['MARKET','#2e6b45','🍎🥕🍌'],['BARBER','#1d2440','💈✂️💈'],['FLOWERS','#8a3a6b','🌷💐🌻'],['PET SHOP','#a56a1c','🐶🐟🐱'],
  ['BIKE SHOP','#3b4a6b','🚲⛑️🚲'],['DINER','#9a1f2b','🍔🥞🍟'],['LAUNDRY','#3a7ca5','🧺👕🧦'],['POST OFFICE','#274690','✉️📦📮']];
let shopMat=null,awnMat=null;
function shopAtlas(){
  const t=cvs(1024,640,(g,W,H)=>{const tw=256,th=160;SHOPS.forEach((s,i)=>{const x=(i%4)*tw,y=(i/4|0)*th;
    g.fillStyle='#4a3b33';g.fillRect(x,y,tw,th);                                   // frame/piers
    g.fillStyle=s[1];g.fillRect(x+4,y+4,tw-8,40);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x+4,y+38,tw-8,6);
    g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';let f=30;g.font='800 '+f+'px Arial,sans-serif';while(g.measureText(s[0]).width>tw-26){f-=2;g.font='800 '+f+'px Arial,sans-serif';}g.fillText(s[0],x+tw/2,y+23);
    const win=(wx,ww)=>{const gr=g.createLinearGradient(0,y+52,0,y+140);gr.addColorStop(0,'#9fc4dc');gr.addColorStop(.5,'#31465a');gr.addColorStop(1,'#1c2733');g.fillStyle=gr;g.fillRect(wx,y+52,ww,88);
      g.fillStyle='rgba(255,240,200,.22)';g.fillRect(wx,y+52,ww,88);g.fillStyle='#d9c9a8';g.fillRect(wx,y+118,ww,5);g.strokeStyle='#e9e4d8';g.lineWidth=3;g.strokeRect(wx,y+52,ww,88);};
    win(x+12,138);win(x+212,34);
    g.font='34px sans-serif';g.textAlign='center';const em=Array.from(s[2]);em.forEach((e,k)=>g.fillText(e,x+36+k*45,y+100));g.font='22px sans-serif';g.fillText(em[0],x+229,y+102);
    g.fillStyle='#2a1f1a';g.fillRect(x+160,y+52,44,104);g.fillStyle='#7fa3bb';g.fillRect(x+166,y+58,32,58);g.fillStyle='#e9e4d8';g.fillRect(x+194,y+108,4,10);
    g.fillStyle='#fff';g.fillRect(x+170,y+64,24,12);g.fillStyle='#b3261f';g.font='800 9px Arial';g.fillText('OPEN',x+182,y+71);
    g.fillStyle='#6f675f';g.fillRect(x,y+142,160,18);g.fillRect(x+204,y+142,52,18);});});
  t.anisotropy=ANISO;return t;}
/* one storefront quad into the shared mesh. (x,z)=centre of the bottom edge, ry=facing */
function shopFront(x,z,ry,w,h,ti,y0,awn){
  const ax=Math.cos(ry),az=-Math.sin(ry),nx=Math.sin(ry),nz=Math.cos(ry),y=y0||0,c=ti%4,r=ti/4|0,u0=c/4+.002,u1=(c+1)/4-.002,v1=1-r/4-.002,v0=1-(r+1)/4+.002,P=LIFE.fp,U=LIFE.fu;
  const x0=x-ax*w/2+nx*.14,z0=z-az*w/2+nz*.14,x1=x+ax*w/2+nx*.14,z1=z+az*w/2+nz*.14;
  P.push(x0,y,z0,x1,y,z1,x1,y+h,z1,x0,y,z0,x1,y+h,z1,x0,y+h,z0);U.push(u0,v0,u1,v0,u1,v1,u0,v0,u1,v1,u0,v1);
  if(awn){const col=new THREE.Color(SHOPS[ti][1]).convertSRGBToLinear(),A=LIFE.ap,Cc=LIFE.ac,hy=y+h*.72,ly=hy-.9,o=1.9,wx=w*.47,q=(px,py,pz,k)=>{A.push(px,py,pz);const s=k?1:.82;Cc.push(col.r*s,col.g*s,col.b*s);};
    const a0x=x-ax*wx,a0z=z-az*wx,a1x=x+ax*wx,a1z=z+az*wx;
    q(a0x,hy,a0z,1);q(a1x,hy,a1z,1);q(a1x+nx*o,ly,a1z+nz*o,1);q(a0x,hy,a0z,1);q(a1x+nx*o,ly,a1z+nz*o,1);q(a0x+nx*o,ly,a0z+nz*o,1);
    q(a0x+nx*o,ly,a0z+nz*o,0);q(a1x+nx*o,ly,a1z+nz*o,0);q(a1x+nx*o,ly-.45,a1z+nz*o,0);q(a0x+nx*o,ly,a0z+nz*o,0);q(a1x+nx*o,ly-.45,a1z+nz*o,0);q(a0x+nx*o,ly-.45,a0z+nz*o,0);}
}
let shopSeed=3;const shopDeck=[];function shopPick(){if(!shopDeck.length){for(let i=0;i<16;i++)shopDeck.push(i);for(let i=15;i>0;i--){const j=(Math.random()*(i+1))|0,t=shopDeck[i];shopDeck[i]=shopDeck[j];shopDeck[j]=t;}}return shopDeck.pop();}
/* a block of shops: (cx,cz)=centre of the front line, ry=facing */
function shopRow(cx,cz,ry,n,opt){
  opt=opt||{};const W=11,L=n*W,ax=Math.cos(ry),az=-Math.sin(ry),nx=Math.sin(ry),nz=Math.cos(ry),H=opt.h||(n%2?13:16),dep=11;
  const b=sbox(L,H,dep,cx-nx*dep/2,H/2,cz-nz*dep/2,ry,bt[(shopSeed%2)?2:3],13);b.userData.noCast=false;box(L+.8,.7,dep+.8,M('#4b4640',{roughness:.9}),cx-nx*dep/2,H+.35,cz-nz*dep/2,world).rotation.y=ry;
  BLD.push([cx-nx*dep/2,cz-nz*dep/2,L/2,dep/2,ry,H]);
  for(let i=0;i<n;i++){const s=(i-(n-1)/2)*W;shopSeed++;shopFront(cx+ax*s,cz+az*s,ry,W-.3,6.4,shopPick(),0,true);}
  const sw=new THREE.Mesh(new THREE.PlaneGeometry(L+10,7),(LIFE.swm||(LIFE.swm=new THREE.MeshStandardMaterial({map:concTex,roughness:.9,polygonOffset:true,polygonOffsetFactor:-2.4,polygonOffsetUnits:-2.4}))));sw.rotation.x=-Math.PI/2;sw.rotation.z=ry;sw.position.set(cx+nx*3.5,.14,cz+nz*3.5);world.add(sw);
  if(!opt.noPark){const ap=new THREE.Mesh(new THREE.PlaneGeometry(L+10,9),flat('#3b3e44',2.2));ap.rotation.x=-Math.PI/2;ap.rotation.z=ry;ap.position.set(cx+nx*11.5,.13,cz+nz*11.5);world.add(ap);for(let s=-L/2;s<=L/2;s+=14)EXC.push([cx+ax*s+nx*10,cz+az*s+nz*10,12]);}
  for(let s=-L/2;s<=L/2;s+=22)LIFE.lamps.push([cx+ax*s+nx*6.3,cz+az*s+nz*6.3,ry]);
  LIFE.bench.push([cx+ax*(L*.25)+nx*1.3,cz+az*(L*.25)+nz*1.3,ry]);
  if(!opt.noStop){LIFE.stops.push([cx-ax*(L/2-5)+nx*5.2,cz-az*(L/2-5)+nz*5.2,ry]);for(let k=0;k<3;k++)PEOPLE.push([cx-ax*(L/2-5+rnd(-2,2))+nx*4.3,0,cz-az*(L/2-5+rnd(-2,2))+nz*4.3]);}
  if(opt.bus)parkedBus(cx-ax*(L/2-13)+nx*9.3,cz-az*(L/2-13)+nz*9.3,ry+Math.PI/2,opt.bus);
  if(!opt.noPark)for(let s=-L/2+(opt.bus?24:12);s<L/2-2;s+=6.2)if(Math.random()<.6)LIFE.parked.push([cx+ax*s+nx*8.6,cz+az*s+nz*8.6,ry+Math.PI/2]);
  for(let k=0;k<n;k++){const s=rnd(-L/2,L/2),o=rnd(1.2,5.5);PEOPLE.push([cx+ax*s+nx*o,0,cz+az*s+nz*o]);}
  LIFE.walk.push({a:[cx-ax*(L/2+4)+nx*3.6,0,cz-az*(L/2+4)+nz*3.6],b:[cx+ax*(L/2+4)+nx*3.6,0,cz+az*(L/2+4)+nz*3.6],n:Math.max(2,Math.round(n*.8)),lat:1.6});
  for(let s=-L/2;s<=L/2;s+=14)EXC.push([cx+ax*s-nx*2,cz+az*s-nz*2,17]);
}
/* shops beside a station. pf=position fn, tf=tangent fn, d=distance, o=side offset of the front line */
function stationShops(pf,tf,d,o,n,opt){const p=pf(d,o),t=tf(d),s=o<0?1:-1,nx=-t.z*s,nz=t.x*s;shopRow(p.x,p.z,Math.atan2(nx,nz),n,opt);}

/* ---------- city bus + school bus (shared by traffic and parked ones) ---------- */
let busMats=null;
function busMat(kind){
  if(!busMats){const mk=(o)=>{const T=t=>new THREE.MeshStandardMaterial({map:t,roughness:.4,metalness:.35}),flip=t=>{const c=t.clone();c.wrapS=THREE.RepeatWrapping;c.repeat.x=-1;c.offset.x=1;c.needsUpdate=true;return c;};
      const side=cvs(512,128,(g,w,h)=>{g.fillStyle=o.body;g.fillRect(0,0,w,h);g.fillStyle=o.band;g.fillRect(0,h*.58,w,h*.1);if(o.band2){g.fillStyle=o.band2;g.fillRect(0,h*.7,w,h*.04);g.fillRect(0,h*.5,w,h*.04);}
        g.fillStyle='#10161d';g.fillRect(12,h*.12,w-24,h*.36);for(let x=18;x<w-30;x+=o.school?40:58){const gr=g.createLinearGradient(0,h*.14,0,h*.46);gr.addColorStop(0,'#8fb2c9');gr.addColorStop(1,'#22313f');g.fillStyle=gr;g.fillRect(x,h*.15,o.school?32:50,h*.3);}
        if(!o.school)[[70,34],[300,44]].forEach(q=>{g.fillStyle='#1a2129';g.fillRect(q[0],h*.12,q[1],h*.72);g.fillStyle='#6f93ab';g.fillRect(q[0]+4,h*.16,q[1]/2-6,h*.5);g.fillRect(q[0]+q[1]/2+2,h*.16,q[1]/2-6,h*.5);});
        else{g.fillStyle='#111';g.font='800 20px Arial';g.textAlign='center';g.fillText('SCHOOL BUS',w/2,h*.675);}
        g.fillStyle='#15171b';g.fillRect(0,h*.84,w,h*.16);[90,430].forEach(x=>{g.fillStyle='#0b0c0e';g.beginPath();g.arc(x,h*.86,21,0,7);g.fill();g.fillStyle='#8a8f98';g.beginPath();g.arc(x,h*.86,9,0,7);g.fill();});});
      const end=(front)=>cvs(128,128,(g,w,h)=>{g.fillStyle=o.body;g.fillRect(0,0,w,h);if(front){g.fillStyle='#0b0e12';g.fillRect(8,6,w-16,22);g.fillStyle=o.school?'#111':'#ffb21a';g.font='800 15px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(o.school?'SCHOOL BUS':'DOWNTOWN',w/2,17);if(o.school){g.fillStyle=o.body;g.fillRect(8,6,w-16,22);g.fillStyle='#111';g.fillText('SCHOOL BUS',w/2,17);}}
        const gr=g.createLinearGradient(0,32,0,78);gr.addColorStop(0,'#9fc0d6');gr.addColorStop(1,'#1f2c38');g.fillStyle=gr;g.fillRect(10,front?32:20,w-20,front?46:30);g.fillStyle=o.band;g.fillRect(0,h*.62,w,h*.08);
        g.fillStyle=front?'#fff6c8':'#ff3b30';[14,w-30].forEach(x=>g.fillRect(x,h*.74,16,9));g.fillStyle='#15171b';g.fillRect(0,h*.86,w,h*.14);});
      const roof=M(o.roof,{roughness:.6}),un=M('#15171b');return [T(side),T(flip(side)),roof,un,T(end(1)),T(end(0))];};
    busMats={city:mk({body:'#f1f2f4',band:'#f2bf1b',band2:'#22252b',roof:'#d9dce0'}),school:mk({body:'#f0b81c',band:'#111111',roof:'#f0b81c',school:1})};}
  return busMats[kind];}
const busGeo=()=>new THREE.BoxGeometry(2.7,3.1,11.6);
function parkedBus(x,z,ry,kind){const m=new THREE.Mesh(busGeo(),busMat(kind||'city'));m.position.set(x,1.72,z);m.rotation.y=ry;world.add(m);return m;}

/* ---------- Red Line over the river bridge, trolley street ---------- */
let redTrain=null,tramA=null,tramB=null,RED=null,TRM=null;
function buildLifeLines(){
  /* river bridge with the subway down the middle */
  { const A=new V3(-728,0,-668),B=new V3(-778,0,-932),dir=B.clone().sub(A),L=dir.length();dir.normalize();const H=8.5,pf=(s,o)=>{const p=new V3(A.x+dir.x*s-dir.z*(o||0),H,A.z+dir.z*s+dir.x*(o||0));return p;},st=M('#9a9288',{roughness:.95}),s0=-112,s1=L+112;
    world.add(strip(pf,s0,s1,-13,0,13,0,M('#3a3d42',{roughness:.95,side:THREE.DoubleSide}),20));world.add(strip(pf,s0,s1,-3,.04,3,.04,flat('#6f6a62',3),20));
    [-13,13].forEach(o=>{world.add(strip(pf,s0,s1,o,1.1,o,-1.8,st,20,6));});world.add(strip(pf,s0,s1,-13,-1.8,13,-1.8,M('#6f6a62',{side:THREE.DoubleSide}),20));
    [-3.1,3.1].forEach(o=>world.add(strip(pf,s0,s1,o,.05,o,.75,M('#55585e',{side:THREE.DoubleSide}),20)));
    rails(pf,s0,s1,0,world,1,10,.05);
    for(let s=s0+14;s<s1;s+=31){const p=pf(s,0);const pr=box(22,H,5,st,p.x,H/2-1,p.z,world);pr.rotation.y=Math.atan2(dir.x,dir.z);}
    [L/2-24,L/2+24].forEach(s=>[-14.5,14.5].forEach(o=>{const p=pf(s,o);cyl(3.4,3.8,H+9,st,p.x,(H+9)/2-1,p.z,world,10);cyl(3.9,3.9,1,st,p.x,H+8,p.z,world,10);cyl(2.6,2.9,3,st,p.x,H+10,p.z,world,10);cyl(0,3.2,3.4,M('#5d6a5e',{roughness:.7}),p.x,H+13.2,p.z,world,10);}));
    /* a station at each end */
    [[s0+56,'Charles'],[s1-56,'Kendall']].forEach(q=>{[-1,1].forEach(k=>{slab(pf,q[0]-46,q[0]+46,k*2.1,k*6.2,1.15,1.15,1.15,conc);slab(pf,q[0]-34,q[0]+34,k*3.2,k*6.6,5.4,5.1,.25,roofMt,true);for(let s=q[0]-28;s<=q[0]+28;s+=14){const p=pf(s,k*5.6);cyl(.18,.18,4.2,post,p.x,H+3.2,p.z,world,8);}
        for(let i=0;i<5;i++){const p=pf(q[0]+rnd(-40,40),k*rnd(3.4,5.6));PEOPLE.push([p.x,H+1.15,p.z]);}
        LIFE.walk.push({a:[pf(q[0]-42,k*4.4).x,H+1.15,pf(q[0]-42,k*4.4).z],b:[pf(q[0]+42,k*4.4).x,H+1.15,pf(q[0]+42,k*4.4).z],n:3,lat:.7});});
      const e=pf(q[0]<L/2?s0:s1,0);const pb=box(27,9,10,st,e.x,H+1.5,e.z,world);pb.rotation.y=Math.atan2(dir.x,dir.z);});
    label('Longfellow Bridge',pf(L/2,0).x,46,pf(L/2,0).z,.8);
    redTrain=new Consist(['metro:#da291c','metro:#da291c','metro:#da291c','metro:#da291c'],1,world);RED={pf,a:s0+104,b:s1-6,t:0};
    for(let s=s0;s<=s1;s+=24){const p=pf(s,0);EXC.push([p.x,p.z,22]);}}
  /* trolley street west of the Southwest Corridor */
  { const d0=BB+200,d1=RG+430,OF=150,g=(d,o)=>{const p=rpos(clamp(d,d0-40,d1+40),OF-(o||0));p.y=0;return p;},tf=d=>rtan(d);
    world.add(strip(g,d0-30,d1+30,-12,.14,12,.14,flat('#3b3e44',2.2),12));world.add(strip(g,d0-30,d1+30,-5,.15,5,.15,flat('#57534d',2.6),12));
    [-12,12].forEach(o=>world.add(strip(g,d0-30,d1+30,o,.16,o+(o>0?5:-5),.16,new THREE.MeshStandardMaterial({map:concTex,roughness:.9,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2.8,polygonOffsetUnits:-2.8}),12,5)));
    [-8.4,8.4].forEach(o=>world.add(strip(g,d0-30,d1+30,o-.12,.17,o+.12,.17,flat('#e8e2c8',3.2),12)));
    rails(g,d0-30,d1+30,-2.4,world,1,8,.12);rails(g,d0-30,d1+30,2.4,world,1,8,.12);
    for(let d=d0-30;d<=d1+30;d+=18){const p=g(d,0);EXC.push([p.x,p.z,24]);}
    /* overhead wire poles */
    for(let d=d0-20;d<=d1+20;d+=44){const p=g(d,0),ry=ryaw(d);const pl=box(.3,7.6,.3,post,p.x,3.8,p.z,world);const bm=box(9.6,.16,.16,post,p.x,7.2,p.z,world);bm.rotation.y=ry;}
    const stopsD=[d0+10,(d0+d1)/2,d1-10];stopsD.forEach((d,i)=>{[-1,1].forEach(k=>{slab(g,d-20,d+20,k*4.1,k*6.6,.55,.55,.55,conc);const p=g(d,k*5.6);LIFE.stops.push([p.x,p.z,ryaw(d)+(k>0?-1:1)*Math.PI/2,.55]);for(let j=0;j<3;j++){const q=g(d+rnd(-16,16),k*rnd(4.6,6));PEOPLE.push([q.x,.55,q.z]);}});});
    let k=0;for(let d=d0+70;d<d1-60;d+=118){[-1,1].forEach(s=>{if((k++)%5===4)return;const n=5+(k%3);const p=g(d,s*17.5),t=tf(d),nx=(s>0?1:-1)*t.z*-1,nz=(s>0?1:-1)*t.x;const q=g(d,0);shopRow(p.x,p.z,Math.atan2(q.x-p.x,q.z-p.z),n,{noPark:true,noStop:k%2});});}
    [-1,1].forEach(s=>LIFE.walk.push({a:[g(d0,s*14.4).x,0,g(d0,s*14.4).z],b:[g(d1,s*14.4).x,0,g(d1,s*14.4).z],n:26,lat:1.4,curve:(u)=>g(d0+(d1-d0)*u,s*14.4)}));
    TRAF.runs.push({f:(d,o)=>g(d,o),a:d0-20,len:d1-d0+40,w:26,city:1});
    label('Huntington Ave trolley',g((d0+d1)/2,0).x,40,g((d0+d1)/2,0).z,.8);
    tramA=new Consist(['metro:#0a8a4a','metro:#0a8a4a'],1,world);tramB=new Consist(['metro:#0a8a4a','metro:#0a8a4a'],1,world);TRM={g,d0,d1,stops:stopsD,t:0};
    [tramA,tramB].forEach(c=>c.cars.forEach(car=>{const gm=M('#3a3f48',{roughness:.5,metalness:.8});const a=box(.1,.1,2.2,gm,0,4.9,-.3,car);a.rotation.x=-.8;const b=box(.1,.1,2.2,gm,0,5.9,-.3,car);b.rotation.x=.8;box(1.9,.09,.25,gm,0,6.6,.45,car);}));}
  /* downtown streets carry traffic and people */
  { const vs=[-385,-275,-165,-55],hs=[-630,-520,-410,-300,-190];
    vs.forEach(X=>{TRAF.runs.push({f:(d,o)=>new V3(X-o,0,-760+d),a:0,len:670,w:19,city:1});[-1,1].forEach(s=>LIFE.walk.push({a:[X+s*11.2,.12,-750],b:[X+s*11.2,.12,-100],n:11,lat:1.2}));});
    hs.forEach(Z=>{TRAF.runs.push({f:(d,o)=>new V3(-440+d,0,Z+o),a:0,len:540,w:19,city:1});[-1,1].forEach(s=>LIFE.walk.push({a:[-430,.12,Z+s*11.2],b:[90,.12,Z+s*11.2],n:9,lat:1.2}));});
    vs.forEach(X=>hs.forEach(Z=>{LIFE.sig.push([X+10.6,Z+10.6,0],[X-10.6,Z-10.6,Math.PI]);LIFE.lamps.push([X+10.4,Z-40,Math.PI/2],[X-10.4,Z+40,-Math.PI/2]);if((X+Z)%3===0){LIFE.stops.push([X+12.6,Z+26,-Math.PI/2]);for(let k=0;k<3;k++)PEOPLE.push([X+12+rnd(-.6,.6),.12,Z+26+rnd(-2.5,2.5)]);}}));
    /* ground-floor shops on the downtown blocks */
    BLD.forEach(b=>{if(b[4]!==0||b[5]<14)return;const dt=(b[0]>-640&&b[0]<50&&b[1]>-770&&b[1]<-90),bb=(b[0]>-1000&&b[0]<-440&&b[1]>80&&b[1]<240);if(!dt&&!bb)return;
      [[0,b[3],0,b[2]],[0,-b[3],Math.PI,b[2]],[b[2],0,Math.PI/2,b[3]],[-b[2],0,-Math.PI/2,b[3]]].forEach((f,fi)=>{if(Math.random()<.35)return;const wid=f[3]*2,nt=Math.max(1,Math.floor(wid/10)),tw=wid/nt,ax=Math.cos(f[2]),az=-Math.sin(f[2]);
        for(let i=0;i<nt;i++){const s=(i-(nt-1)/2)*tw;shopFront(b[0]+f[0]+ax*s,b[1]+f[1]+az*s,f[2],tw-.3,6.4,shopPick(),.1,Math.random()<.55);}});});}
}
/* ---------- shops beside the stations and in the town centres ---------- */
function buildLifeShops(){
  const rt=d=>rtan(d),stn=d=>stubC.getTangentAt(clamp(d/SL,0,1));
  [[HP,-41,-78,6],[HP,TB+41,70,5],[R128,TB+44,-10,6],[CC,-41,-75,5],[CJ,-44,-95,5]].forEach(a=>stationShops(rpos,rt,a[0]+a[2],a[1],a[3],{bus:a[1]<0?'city':null}));
  /* people walking the platforms */
  STN.slice(3).forEach(s=>[-5,TB+5].forEach(o=>{const a=P(s.d-58,o,1.15),b=P(s.d+58,o,1.15);LIFE.walk.push({a:[a.x,a.y,a.z],b:[b.x,b.y,b.z],n:4,lat:1.2,curve:u=>P(s.d-58+116*u,o<0?o-.6:o+.6,0)});}));
  PST.forEach(s=>[-5,TB+5].forEach(o=>{const a=spos(s.s-58,o),b=spos(s.s+58,o);LIFE.walk.push({a:[a.x,1.15,a.z],b:[b.x,1.15,b.z],n:4,lat:1.2,curve:u=>spos(s.s-58+116*u,o<0?o-.6:o+.6)});}));
  PST.slice(0,3).forEach((s,i)=>{stationShops(spos,stn,s.s-72,-41,6,{bus:i===1?'school':'city'});stationShops(spos,stn,s.s+62,TB+41,5+i%2);});
}
/* ---------- people ---------- */
const PPL={st:null,dy:null,list:[]};
function buildPeople(){
  const shirt=['#b5452b','#27578f','#2f7a4a','#c79a1c','#6d3a86','#b65a85','#3b4a6b','#e8e4da','#8a8f98','#1f6f8a','#d4692a','#22252b','#7a9a3a','#a02a4a'],pants=['#2b3040','#3a3a3a','#4a5a78','#5b4a3a','#1d2230','#6b6f78','#8a7a5a'],skin=['#f0cfae','#e8bf9a','#c99772','#a8754f','#8d5e3f','#5f3d28'],hair=['#1b1512','#3a2718','#6b4a2a','#b08a4a','#8a8f98','#e8e4da','#7a2f1a'];
  const mat=()=>new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85}),legG=new THREE.BoxGeometry(.23,1.12,.27);legG.translate(0,-.56,0);const armG=new THREE.BoxGeometry(.16,.92,.19);armG.translate(0,-.46,0);
  const torG=new THREE.CylinderGeometry(.3,.33,.92,7);torG.scale(1,1,.62);const headG=new THREE.SphereGeometry(.235,7,5),hairG=new THREE.SphereGeometry(.252,7,3,0,6.283,0,1.75),bagG=new THREE.BoxGeometry(.42,.52,.2);
  const pick=a=>a[(Math.random()*a.length)|0],mk=(x,y,z,o)=>Object.assign({x,y,z,yaw:rnd(0,6.283),h:Math.random()<.14?rnd(.58,.75):rnd(.92,1.1),w:rnd(.9,1.18),cs:pick(shirt),cp:pick(pants),ck:pick(skin),ch:pick(hair),bag:Math.random()<.3,ph:rnd(0,6)},o||{});
  const stand=PEOPLE.map(p=>mk(p[0],p[1],p[2])),walk=[];
  LIFE.walk.forEach(W=>{const len=Math.hypot(W.b[0]-W.a[0],W.b[2]-W.a[2]);for(let i=0;i<W.n;i++)walk.push(mk(0,0,0,{W,len,t:Math.random(),dir:Math.random()<.5?1:-1,sp:rnd(1.9,2.9),lat:rnd(-1,1)*(W.lat||1)}));});
  const set=(arr,ctr,rad)=>{const n=Math.max(1,arr.length),I=(g0,k)=>{const g=g0.clone();g.boundingSphere=new THREE.Sphere(ctr,rad);const m=new THREE.InstancedMesh(g,mat(),n*k);m.frustumCulled=true;world.add(m);return m;},S={leg:I(legG,2),tor:I(torG,1),arm:I(armG,2),head:I(headG,1),hair:I(hairG,1),bag:I(bagG,1),arr};
    S.arm.userData.noCast=S.hair.userData.noCast=S.bag.userData.noCast=S.head.userData.noCast=true;const c=new THREE.Color(),sc=(m,i,h)=>m.setColorAt(i,c.set(h).convertSRGBToLinear());
    arr.forEach((p,i)=>{sc(S.leg,i*2,p.cp);sc(S.leg,i*2+1,p.cp);sc(S.tor,i,p.cs);sc(S.arm,i*2,p.cs);sc(S.arm,i*2+1,p.cs);sc(S.head,i,p.ck);sc(S.hair,i,p.ch);sc(S.bag,i,pick(shirt));});return S;};
  walk.forEach(p=>walkPos(p,0));
  /* group by area so far-away people are skipped by the renderer */
  const bins=(arr,keyf)=>{const b=new Map();arr.forEach(p=>{const k=keyf(p);(b.get(k)||b.set(k,[]).get(k)).push(p);});return [...b.values()].map(a=>{const c=new THREE.Vector3();a.forEach(p=>c.add(_pv.set(p.x,p.y,p.z)));c.multiplyScalar(1/a.length);let r=0;a.forEach(p=>{r=Math.max(r,Math.hypot(p.x-c.x,p.z-c.z)+(p.len||0));});return set(a,c,r+6);});};
  PPL.st=bins(stand,p=>Math.floor(p.x/500)+'_'+Math.floor(p.z/500));PPL.dy=bins(walk,p=>LIFE.walk.indexOf(p.W)>>1);
  PPL.st.forEach(S=>S.arr.forEach((p,i)=>pose(S,i,p,0)));PPL.dy.forEach(S=>S.arr.forEach((p,i)=>pose(S,i,p,Math.sin(p.ph))));
}
const _pb=new THREE.Matrix4(),_pl=new THREE.Matrix4(),_pr=new THREE.Matrix4(),_pq=new THREE.Quaternion(),_pv=new THREE.Vector3(),_ps=new THREE.Vector3(),_py=new THREE.Vector3(0,1,0),_z0=new THREE.Matrix4().makeScale(0,0,0);
function pose(S,i,p,sw){
  _pb.compose(_pv.set(p.x,p.y,p.z),_pq.setFromAxisAngle(_py,p.yaw),_ps.set(p.h*p.w,p.h,p.h));
  const put=(m,k,px,py,pz,rx)=>{_pl.makeRotationX(rx);_pl.setPosition(px,py,pz);_pr.multiplyMatrices(_pb,_pl);m.setMatrixAt(k,_pr);};
  const a=sw*.62;put(S.leg,i*2,.13,1.12,0,a);put(S.leg,i*2+1,-.13,1.12,0,-a);put(S.tor,i,0,1.56,0,Math.abs(sw)*.04);put(S.arm,i*2,.39,1.98,0,-a*.8+.04);put(S.arm,i*2+1,-.39,1.98,0,a*.8+.04);put(S.head,i,0,2.27,0,0);put(S.hair,i,0,2.29,-.012,-.18);
  if(p.bag)put(S.bag,i,0,1.62,-.3,0);else S.bag.setMatrixAt(i,_z0);
}
function walkPos(p,dt){const W=p.W;p.t+=p.dir*p.sp*dt/p.len;if(p.t>1){p.t=1;p.dir=-1;}else if(p.t<0){p.t=0;p.dir=1;}
  let x,z,tx,tz;if(W.curve){const q=W.curve(p.t),r=W.curve(Math.min(1,p.t+.004));x=q.x;z=q.z;tx=r.x-q.x;tz=r.z-q.z;if(p.t>.995){tx=q.x-W.curve(p.t-.004).x;tz=q.z-W.curve(p.t-.004).z;}}else{x=W.a[0]+(W.b[0]-W.a[0])*p.t;z=W.a[2]+(W.b[2]-W.a[2])*p.t;tx=W.b[0]-W.a[0];tz=W.b[2]-W.a[2];}
  const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;p.x=x-tz*p.lat;p.z=z+tx*p.lat;p.y=W.a[1];p.yaw=Math.atan2(tx*p.dir,tz*p.dir);}
let pplF=0;
function updPeople(dt){if(!PPL.dy||cam.position.y>320)return;const cx=cam.position.x,cz=cam.position.z;pplF++;
  PPL.dy.forEach((S,si)=>{const bs=S.leg.geometry.boundingSphere,dd=Math.hypot(bs.center.x-cx,bs.center.z-cz)-bs.radius;if(dd>520){if((si+pplF)%30)return;}let any=false;
    S.arr.forEach((p,i)=>{const d2=(p.x-cx)**2+(p.z-cz)**2;if(d2>270000){if(dd>520){walkPos(p,dt*30);pose(S,i,p,0);any=true;}return;}p.ph+=dt*p.sp*2.7;walkPos(p,dt);pose(S,i,p,Math.sin(p.ph));any=true;});
    if(any)[S.leg,S.tor,S.arm,S.head,S.hair,S.bag].forEach(m=>m.instanceMatrix.needsUpdate=true);});}

/* ---------- street furniture, built once everything has registered its spots ---------- */
function buildLifeFinish(){
  /* storefronts + awnings as two meshes */
  if(LIFE.fp.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(LIFE.fp,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(LIFE.fu,2));g.computeVertexNormals();
    shopMat=new THREE.MeshStandardMaterial({map:shopAtlas(),roughness:.6,metalness:.1,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});const m=new THREE.Mesh(g,shopMat);m.userData.noCast=true;m.frustumCulled=false;world.add(m);
    const a=new THREE.BufferGeometry();a.setAttribute('position',new THREE.Float32BufferAttribute(LIFE.ap,3));a.setAttribute('color',new THREE.Float32BufferAttribute(LIFE.ac,3));a.computeVertexNormals();awnMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,side:THREE.DoubleSide});const am=new THREE.Mesh(a,awnMat);am.frustumCulled=false;world.add(am);}
  const dm=new THREE.Object3D(),I=(geo,mt,items,fn)=>{if(!items.length)return null;const m=new THREE.InstancedMesh(geo,mt,items.length);items.forEach((it,i)=>{fn(it,dm,i,m);dm.updateMatrix();m.setMatrixAt(i,dm.matrix);});m.frustumCulled=false;world.add(m);return m;};
  const pm=M('#2f3440',{metalness:.7,roughness:.5});
  /* street lamps */
  I(new THREE.CylinderGeometry(.12,.16,6.4,6),pm,LIFE.lamps,(l,d)=>{d.position.set(l[0],3.2,l[1]);d.rotation.set(0,0,0);d.scale.set(1,1,1);});
  I(new THREE.BoxGeometry(.14,.14,1.7),pm,LIFE.lamps,(l,d)=>{d.rotation.set(0,l[2],0);d.position.set(l[0]+Math.sin(l[2])*.8,6.35,l[1]+Math.cos(l[2])*.8);});
  {const m=I(new THREE.BoxGeometry(.42,.16,.7),GL('#fff3c4'),LIFE.lamps,(l,d)=>{d.rotation.set(0,l[2],0);d.position.set(l[0]+Math.sin(l[2])*1.5,6.25,l[1]+Math.cos(l[2])*1.5);});if(m)m.userData.noCast=true;}
  /* bus stops: shelter, bench, sign */
  const gl=new THREE.MeshStandardMaterial({color:C('#9fc4dc'),transparent:true,opacity:.35,roughness:.1,metalness:.6,side:THREE.DoubleSide}),Y=s=>s[3]||0;
  I(new THREE.BoxGeometry(5.2,.16,2.2),M('#3f4654',{metalness:.6,roughness:.5}),LIFE.stops,(s,d)=>{d.rotation.set(0,s[2],0);d.position.set(s[0],3.3+Y(s),s[1]);});
  {const m=I(new THREE.BoxGeometry(5,2.9,.08),gl,LIFE.stops,(s,d)=>{d.rotation.set(0,s[2],0);d.position.set(s[0]-Math.sin(s[2])*1,1.75+Y(s),s[1]-Math.cos(s[2])*1);});if(m)m.userData.noCast=true;}
  I(new THREE.BoxGeometry(.12,3.3,.12),pm,LIFE.stops.flatMap(s=>[[s,-2.5],[s,2.5]]),(q,d)=>{const s=q[0];d.rotation.set(0,s[2],0);d.position.set(s[0]+Math.cos(s[2])*q[1]-Math.sin(s[2])*1,1.65+Y(s),s[1]-Math.sin(s[2])*q[1]-Math.cos(s[2])*1);});
  I(new THREE.BoxGeometry(3.4,.14,.6),M('#6b4a2f'),LIFE.stops.concat(LIFE.bench),(s,d)=>{d.rotation.set(0,s[2],0);d.position.set(s[0]-Math.sin(s[2])*.5,.75+Y(s),s[1]-Math.cos(s[2])*.5);});
  {const st=cvs(64,96,(g,w,h)=>{g.fillStyle='#1b4fa0';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.fillRect(4,4,w-8,h-8);g.fillStyle='#1b4fa0';g.font='800 22px Arial';g.textAlign='center';g.fillText('BUS',w/2,30);g.font='30px sans-serif';g.fillText('🚌',w/2,70);});
    const sm=new THREE.MeshBasicMaterial({map:st,side:THREE.DoubleSide});I(new THREE.PlaneGeometry(.9,1.35),sm,LIFE.stops,(s,d)=>{d.rotation.set(0,s[2]+Math.PI/2,0);d.position.set(s[0]+Math.cos(s[2])*3.3+Math.sin(s[2])*.9,3.2+Y(s),s[1]-Math.sin(s[2])*3.3+Math.cos(s[2])*.9);});
    I(new THREE.CylinderGeometry(.06,.06,3.9,5),pm,LIFE.stops,(s,d)=>{d.rotation.set(0,0,0);d.position.set(s[0]+Math.cos(s[2])*3.3+Math.sin(s[2])*.9,1.95+Y(s),s[1]-Math.sin(s[2])*3.3+Math.cos(s[2])*.9);});}
  /* traffic signals */
  I(new THREE.CylinderGeometry(.11,.14,5.2,6),pm,LIFE.sig,(s,d)=>{d.rotation.set(0,0,0);d.position.set(s[0],2.6,s[1]);});
  {const tt=cvs(32,96,(g,w,h)=>{g.fillStyle='#16181c';g.fillRect(0,0,w,h);[['#ff3b30',16],['#ffb21a',48],['#35c46a',80]].forEach((c,i)=>{g.fillStyle=i===2?c[0]:shade(c[0],.35);g.beginPath();g.arc(16,c[1],10,0,7);g.fill();});}),tm=[M('#16181c'),M('#16181c'),M('#16181c'),M('#16181c'),new THREE.MeshBasicMaterial({map:tt}),new THREE.MeshBasicMaterial({map:tt})];
    I(new THREE.BoxGeometry(.55,1.6,.5),tm,LIFE.sig,(s,d)=>{d.rotation.set(0,s[2],0);d.position.set(s[0],5.6,s[1]);});}
  /* parked cars */
  if(LIFE.parked.length){const col=new THREE.Color(),b=I(new THREE.BoxGeometry(1.9,.95,4.4),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.35,metalness:.5}),LIFE.parked,(p,d,i,m)=>{d.rotation.set(0,p[2],0);d.position.set(p[0],.75,p[1]);m.setColorAt(i,col.set(carCols[i%carCols.length]).convertSRGBToLinear());});
    I(new THREE.BoxGeometry(1.7,.8,2.3),M('#18222e',{roughness:.1,metalness:.8}),LIFE.parked,(p,d)=>{d.rotation.set(0,p[2],0);d.position.set(p[0]-Math.sin(p[2])*.25,1.6,p[1]-Math.cos(p[2])*.25);});}
  buildPeople();
}
/* ---------- moving subway + trolleys ---------- */
function updLife(dt){
  if(RED){RED.t+=dt;const cyc=RED.t%58,k=cyc<22?ss(0,22,cyc):cyc<29?1:cyc<51?1-ss(29,51,cyc):0;redTrain.place(RED.pf,RED.a+(RED.b-RED.a)*k,1,.67);}
  if(TRM){TRM.t+=dt;const T=TRM,span=T.d1-T.d0-50,leg=t=>{const c=t%96,seg=c<40?c/40:c<48?1:c<88?1-(c-48)/40:0;/* ease through the middle stop */const e=seg<.5?ss(0,.5,seg)*.5:.5+ss(.5,1,seg)*.5;return T.d0+46+span*e;};
    tramA.place((d,o)=>T.g(d,-2.4),leg(T.t),1,.72);tramB.place((d,o)=>T.g(d,2.4),leg(T.t+48),1,.72);}
  updPeople(dt);
}
