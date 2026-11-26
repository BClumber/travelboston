'use strict';
/* =====================================================================
   tunnel.js : drive through the harbor tunnel to the airport.
   A learning trip for 3-4 year olds: under/over, dark/light, down/up,
   in/out, counting, colours, and what the things in a tunnel are for.
   ===================================================================== */
let tun=null;
const TU={d:0,v:0,view:'chase',xray:false,xrayT:0,lights:false,veh:0,done:false,lesson:0,wheel:0,seen:{},colT:0,fid:0,need:null,needT:0};
const TW=5.5,TH=6.2,CA=410,CB=1410,WA=540,WB=1290,TEND=1760;
const tss=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
/* road centre line: gentle S-curve, down under the harbor and back up */
function tY(d){return -24*tss(262,470,d)*(1-tss(1330,1545,d))-2.5*Math.exp(-(((d-910)/260)**2))*tss(470,560,d)*(1-tss(1250,1330,d));}
function tX(d){return 38*Math.sin(d/470)*tss(120,420,d);}
function uP(d,o,y){const e=.5,dx=tX(d+e)-tX(d-e),dz=-2*e,l=Math.hypot(dx,dz),tx=dx/l,tz=dz/l;o=o||0;return new V3(tX(d)-tz*o,tY(d)+(y||0),-d+tx*o);}
/* o>0 is the driver's right */
function tYaw(d){const e=.5;return Math.atan2(tX(d+e)-tX(d-e),-2*e);}
const tTop=d=>-11*tss(WA,WA+55,d)*(1-tss(WB-55,WB,d));       // ground or sea-bed height above the tunnel
const tIn=d=>tss(CA-6,CA+34,d)*(1-tss(CB-34,CB+6,d));          // 0 outside, 1 deep inside

const TLESS=[
  {d:60,e:'🚗',w:'Let\'s go!',s:'Let\'s drive to the airport. Push the lever up to go.'},
  {d:170,e:'🚇',w:'A tunnel!',s:'Look! A tunnel. A tunnel is a road that goes under.'},
  {d:290,e:'⬇️',w:'Down',s:'Down, down, down we go.'},
  {d:398,e:'💡',w:'Dark! Lights on',s:'It is dark inside. Turn on your lights!',need:'tlight'},
  {d:470,e:'➡️',w:'In',s:'We are in the tunnel.'},
  {d:705,e:'🌊',w:'Under the water',s:'We are under the water now. Tap the eyes to see what is above us.',need:'txray'},
  {d:835,e:'🐟',w:'Fish swim over us',s:'Fish swim over us. Boats float on top. We drive under them all.'},
  {d:1000,e:'📣',w:'Honk! Echo',s:'Honk the horn. Can you hear the echo?',need:'thorn'},
  {d:1110,e:'🚪',w:'Green door = way out',s:'See the green door? Green means the way out.'},
  {d:1215,e:'☎️',w:'Help phone',s:'The orange phone is for calling help.'},
  {d:1332,e:'⬆️',w:'Up',s:'Up, up, up we go.'},
  {d:1402,e:'☀️',w:'Light!',s:'I see light! Here comes the sun.'},
  {d:1478,e:'👋',w:'Out',s:'We came out of the tunnel.'},
  {d:1600,e:'✈️',w:'The airport',s:'Hello, airport! Look at the big airplanes.'}];
const TCOUNT=[560,582,604,626,648],TFANS=[866,894,922];
const TCOLS=[['#d9362b','Red'],['#f2c21b','Yellow'],['#2d7fe0','Blue'],['#35b45a','Green'],['#f08a1c','Orange'],['#f4f5f7','White'],['#8a4fc7','Purple'],['#22252b','Black']];

function tBig(e,w,ms){const b=$('tbig');b.innerHTML='<span>'+e+'</span><b>'+w+'</b>';b.classList.remove('hide');b.style.opacity=1;clearTimeout(TU.bt);TU.bt=setTimeout(()=>{b.style.opacity=0;},ms||3200);}
function tNeed(id){if(TU.need)$(TU.need).classList.remove('pulse');TU.need=id;TU.needT=0;if(id)$(id).classList.add('pulse');}
function tPraise(){addStar(1);snd.ding();tBig('⭐','Great job!',1800);}

function tCar(col,kind){
  const g=new THREE.Group(),dk=M('#15171b',{roughness:.6}),gl=M('#18222e',{roughness:.08,metalness:.85}),hub=M('#aeb3bb',{metalness:.8,roughness:.3}),wheels=[];
  const wheel=(x,y,z,r,w)=>{const wg=new THREE.Group();wg.position.set(x,y,z);const t=cyl(r,r,w,dk,0,0,0,wg,14);t.rotation.z=Math.PI/2;const h=cyl(r*.55,r*.55,w+.04,hub,0,0,0,wg,8);h.rotation.z=Math.PI/2;box(w+.06,r*1.5,.1,dk,0,0,0,wg);g.add(wg);wheels.push(wg);};
  let hl=[],len=4.4,eye=[.42,1.3,.2];
  if(kind==='bus'){const b=new THREE.Mesh(busGeo(),busMat('school'));b.position.y=1.9;g.add(b);[[1.25,3.6],[-1.25,3.6],[1.25,-3.4],[-1.25,-3.4]].forEach(q=>wheel(q[0],.55,q[1],.55,.36));hl=[[.95,1.0,5.82],[-.95,1.0,5.82]];len=11.6;eye=[.6,2.5,4.4];
    const sg=cvs(64,64,(c,w,h)=>{c.fillStyle='#c5221f';c.beginPath();for(let i=0;i<8;i++){const a=Math.PI/8+i*Math.PI/4;c.lineTo(32+30*Math.cos(a),32+30*Math.sin(a));}c.fill();c.fillStyle='#fff';c.font='800 20px Arial';c.textAlign='center';c.fillText('STOP',32,39);});
    const st=new THREE.Mesh(new THREE.PlaneGeometry(.9,.9),new THREE.MeshBasicMaterial({map:sg,transparent:true,side:THREE.DoubleSide}));st.position.set(1.42,2.1,2.6);st.rotation.y=Math.PI/2;g.add(st);}
  else if(kind==='fire'){const red=M('#c5221f',{roughness:.3,metalness:.4}),wh=M('#f2f4f7',{roughness:.3}),ch=M('#c9ced6',{metalness:.9,roughness:.2});
    box(2.5,1.5,5.6,red,0,1.7,-1.3,g);box(2.5,2.1,2.6,red,0,2.0,2.9,g);box(2.52,.22,8.3,wh,0,1.25,.1,g);box(2.3,.9,.12,gl,0,2.55,4.22,g);[1.26,-1.26].forEach(x=>box(.08,.8,1.5,gl,x,2.5,3.2,g));box(2.56,.3,8.5,ch,0,.75,.1,g);
    for(let i=0;i<5;i++)box(.5,.9,.06,ch,1.27,1.75,-3.4+i*1.0,g),box(.5,.9,.06,ch,-1.27,1.75,-3.4+i*1.0,g);
    [.5,-.5].forEach(x=>box(.08,.08,6.4,ch,x,2.75,-.9,g));for(let i=0;i<9;i++)box(1.0,.07,.07,ch,0,2.75,-3.9+i*.75,g);
    const lb=box(1.5,.26,.5,M('#22252b'),0,3.2,3.0,g);g.userData.beac=[box(.6,.24,.46,GL('#ff2a1f'),.42,3.22,3.0,g),box(.6,.24,.46,GL('#2a6bff'),-.42,3.22,3.0,g)];
    cyl(.25,.25,.7,ch,.9,2.75,-4.0,g,10).rotation.x=Math.PI/2;[[1.3,2.9],[-1.3,2.9],[1.3,-2.2],[-1.3,-2.2],[1.3,-3.4],[-1.3,-3.4]].forEach(q=>wheel(q[0],.6,q[1],.6,.4));hl=[[.9,1.25,4.24],[-.9,1.25,4.24]];len=8.6;eye=[.55,2.55,3.4];}
  else{const bc=M(col,{roughness:.25,metalness:.55});box(1.9,.62,4.4,bc,0,.72,0,g);const cab=box(1.72,.62,2.3,bc,0,1.32,-.25,g);box(1.6,.5,.06,gl,0,1.34,.92,g).rotation.x=-.5;box(1.6,.48,.06,gl,0,1.34,-1.42,g).rotation.x=.45;[.87,-.87].forEach(x=>box(.04,.42,1.9,gl,x,1.36,-.25,g));
    box(1.92,.16,4.5,dk,0,.4,0,g);box(1.7,.1,.5,bc,0,1.0,1.75,g).rotation.x=.12;[[.92,1.45],[-.92,1.45],[.92,-1.4],[-.92,-1.4]].forEach(q=>wheel(q[0],.36,q[1],.36,.26));hl=[[.68,.78,2.22],[-.68,.78,2.22]];
    [.68,-.68].forEach(x=>box(.4,.16,.06,GL('#ff2a1f'),x,.82,-2.22,g));}
  g.userData.lens=hl.map(p=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.14,8,6),new THREE.MeshBasicMaterial({color:0x8a8f98}));m.position.set(p[0],p[1],p[2]);g.add(m);return m;});
  if(kind!=='car')[.9,-.9].forEach(x=>box(.4,.2,.06,GL('#ff2a1f'),x,1.0,-len/2-.02+(kind==='fire'?.1:0),g));
  g.userData.wheels=wheels;g.userData.len=len;g.userData.eye=eye;return g;
}

function buildTunnel(){
  const s=new THREE.Scene();s.background=C('#8fc7ee');s.environment=ENV;
  const hemi=new THREE.HemisphereLight(0xd8e8ff,0x77705f,.85),sun=new THREE.DirectionalLight(0xfff0d6,2.1);sun.position.set(-.5,1,.35);s.add(hemi,sun);
  const lamp=new THREE.PointLight(0xfff1cf,0,70,1.6),head=new THREE.SpotLight(0xfff6dc,0,90,.5,.5,1.2),ht=new THREE.Object3D();s.add(lamp,head,ht);head.target=ht;
  const add=m=>{s.add(m);return m;},T=(t,o)=>new THREE.MeshStandardMaterial(Object.assign({map:t,roughness:.8,side:THREE.DoubleSide,envMapIntensity:.25},o||{}));
  /* --- textures (canvas x runs across the strip, canvas y along it) --- */
  const roadT=rep(cvs(256,256,(c,w,h)=>{c.fillStyle='#34363b';c.fillRect(0,0,w,h);for(let i=0;i<1600;i++){const k=40+Math.random()*40;c.fillStyle='rgba('+k+','+k+','+(k+4)+',.5)';c.fillRect(Math.random()*w,Math.random()*h,2,2);}
      c.fillStyle='#e9c21c';c.fillRect(w*.07,0,5,h);c.fillStyle='#f1f2f4';c.fillRect(w*.93-5,0,5,h);c.fillRect(w/2-3,0,6,h*.55);c.fillStyle='rgba(20,20,22,.25)';c.fillRect(w*.2,0,w*.12,h);c.fillRect(w*.68,0,w*.12,h);}),1,1);
  const tileT=rep(cvs(256,256,(c,w,h)=>{c.fillStyle='#e7e9ea';c.fillRect(0,0,w,h);for(let x=0;x<w;x+=16)for(let y=0;y<h;y+=32){const k=222+Math.random()*26;c.fillStyle='rgb('+k+','+k+','+(k+2)+')';c.fillRect(x+1,y+1,14,30);}
      c.fillStyle='#3d4046';c.fillRect(0,0,w*.085,h);c.fillStyle='#1f6fb5';c.fillRect(w*.3,0,w*.05,h);const g=c.createLinearGradient(0,0,w,0);g.addColorStop(0,'rgba(0,0,0,.28)');g.addColorStop(.45,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(255,250,225,.2)');c.fillStyle=g;c.fillRect(0,0,w,h);
      c.fillStyle='rgba(60,50,30,.07)';for(let i=0;i<14;i++)c.fillRect(w*.085,Math.random()*h,w*.25,3);}),1,1);
  const ceilT=rep(cvs(128,128,(c,w,h)=>{c.fillStyle='#4a4d52';c.fillRect(0,0,w,h);c.strokeStyle='#2c2e32';c.lineWidth=2;for(let i=0;i<=4;i++){c.strokeRect(i*w/4,0,w/4,h);}c.strokeRect(0,0,w,h/2);}),1,1);
  const earthT=rep(cvs(256,256,(c,w,h)=>{[['#6b5237',0,.2],['#8a7355',.2,.42],['#6f7a80',.42,.7],['#565b60',.7,1]].forEach(l=>{c.fillStyle=l[0];c.fillRect(0,0,w,h);});
      const bands=[['#6b5237',1],['#8a7355',.78],['#6f7a80',.55],['#565b60',.28]];bands.forEach(b=>{c.fillStyle=b[0];c.fillRect(0,0,w*b[1],h);});for(let i=0;i<500;i++){c.fillStyle='rgba(0,0,0,'+(.05+Math.random()*.12)+')';c.beginPath();c.arc(Math.random()*w,Math.random()*h,1+Math.random()*4,0,7);c.fill();}}),1,1);
  const grassM=new THREE.MeshStandardMaterial({color:C('#5f8f4a'),roughness:1,side:THREE.DoubleSide}),paveM=new THREE.MeshStandardMaterial({color:C('#8f9499'),roughness:.95,side:THREE.DoubleSide}),concM=T(rep(concTex.clone(),1,1),{color:C('#b9bcc0')});concM.map.needsUpdate=true;
  const roadM=T(roadT,{roughness:.55,metalness:.1}),wallM=T(tileT,{roughness:.35,emissive:new THREE.Color(0xffffff),emissiveMap:tileT,emissiveIntensity:.17}),ceilM=T(ceilT,{emissive:new THREE.Color(0xffffff),emissiveMap:ceilT,emissiveIntensity:.12}),earthM=T(earthT,{roughness:1});
  const g0=d=>{const p=uP(d,0,0);return p;},at=(o,yf)=>d=>{const p=uP(d,o,0);p.y=typeof yf==='function'?yf(d):tY(d)+yf;return p;};
  /* --- road all the way, kerb and walkway --- */
  add(strip2(at(-TW,0),at(TW,0),-140,TEND+260,roadM,5,14));
  /* --- the tube --- */
  const left=new THREE.Group(),xr=new THREE.Group(),nearTop=new THREE.Group();s.add(left,xr,nearTop);xr.visible=false;
  left.add(strip2(at(-TW,0),at(-TW,TH),CA,CB,wallM,5,16));add(strip2(at(TW,0),at(TW,TH),CA,CB,wallM,5,16));add(strip2(at(-TW,TH),at(TW,TH),CA,CB,ceilM,5,8));
  add(strip2(at(-TW,.55),at(-TW+1.3,.55),CA-60,CB+60,concM,5,6));add(strip2(at(-TW+1.3,.55),at(-TW+1.3,0),CA-60,CB+60,concM,5,6));add(strip2(at(TW-.5,.3),at(TW,.3),CA-60,CB+60,concM,5,6));add(strip2(at(TW-.5,0),at(TW-.5,.3),CA-60,CB+60,concM,5,6));
  /* hand rail on the walkway */
  {const rm=M('#c9ced6',{metalness:.8,roughness:.3});add(strip2(at(-TW+1.25,1.5),at(-TW+1.25,1.58),CA,CB,rm,5));const pts=[];for(let d=CA;d<=CB;d+=6)pts.push(d);const im=new THREE.InstancedMesh(new THREE.CylinderGeometry(.04,.04,1,5),rm,pts.length),dm=new THREE.Object3D();pts.forEach((d,i)=>{const p=uP(d,-TW+1.25,1.05);dm.position.copy(p);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);});im.frustumCulled=false;s.add(im);}
  /* open ramps: retaining walls rising to the street */
  [[262,CA],[CB,1548]].forEach(r=>{left.add(strip2(at(-TW,0),at(-TW,d=>1.1),r[0],r[1],concM,5,10));add(strip2(at(TW,d=>1.1),at(TW,0),r[0],r[1],concM,5,10));});
  /* portals */
  const nameT=cvs(1024,128,(c,w,h)=>{c.fillStyle='#b9bcc0';c.fillRect(0,0,w,h);c.fillStyle='#2b3038';c.font='800 78px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('HARBOR TUNNEL',w/2,h/2+4);});
  [[CA,1],[CB,-1]].forEach(q=>{const p=uP(q[0],0,0),ry=tYaw(q[0]),G=new THREE.Group();G.position.copy(p);G.rotation.y=ry;s.add(G);const hh=-tY(q[0])+3;
    box(3,hh,2.4,concM,-TW-1.5,hh/2,0,G);box(3,hh,2.4,concM,TW+1.5,hh/2,0,G);box(TW*2+6,hh-TH,2.4,concM,0,TH+(hh-TH)/2,0,G);
    const n=new THREE.Mesh(new THREE.PlaneGeometry(11,1.4),new THREE.MeshBasicMaterial({map:nameT}));n.position.set(0,TH+1.3,-1.25*q[1]);n.rotation.y=q[1]>0?Math.PI:0;G.add(n);
    box(TW*2+.4,.5,.4,GL('#ffb21a'),0,TH+.25,-1.3*q[1],G);});
  /* ceiling lights: two rows of glowing fixtures */
  {const L=[];for(let d=CA+4;d<CB;d+=9)L.push([d,-2.6],[d,2.6]);const im=new THREE.InstancedMesh(new THREE.BoxGeometry(.5,.12,3.4),new THREE.MeshBasicMaterial({color:0xfff3c8}),L.length),dm=new THREE.Object3D();L.forEach((l,i)=>{dm.position.copy(uP(l[0],l[1],TH-.1));dm.rotation.y=tYaw(l[0]);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);});im.frustumCulled=false;s.add(im);}
  /* road studs */
  {const L=[];for(let d=CA;d<CB;d+=7)L.push(d);const im=new THREE.InstancedMesh(new THREE.BoxGeometry(.16,.05,.3),new THREE.MeshBasicMaterial({color:0xffe9a0}),L.length*2),dm=new THREE.Object3D();L.forEach((d,i)=>{[-4.55,4.55].forEach((o,k)=>{dm.position.copy(uP(d,o,.03));dm.updateMatrix();im.setMatrixAt(i*2+k,dm.matrix);});});im.frustumCulled=false;s.add(im);}
  /* signs made from canvases */
  const sign=(w,h,draw,x,y,z,ry,par,lit)=>{const t=cvs(Math.round(256*w/h),256,draw),m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide,transparent:true}));m.position.set(x,y,z);m.rotation.y=ry;(par||s).add(m);return m;};
  const onPath=(d,o,y,fn)=>{const G=new THREE.Group();G.position.copy(uP(d,o,y));G.rotation.y=tYaw(d);s.add(G);fn(G);return G;};
  /* 1-2-3-4-5: green lane arrows to count */
  tun={scene:s,nums:[],fans:[],veh:[],traf:[]};
  TCOUNT.forEach((d,i)=>onPath(d,0,TH-1.25,G=>{box(TW*2,.18,.18,M('#2c2e32'),0,.75,0,G);[-2.6,2.6].forEach(x=>{box(1.5,1.5,.25,M('#16181c'),x,0,0,G);sign(1.3,1.3,(c,w,h)=>{c.fillStyle='#0b0e12';c.fillRect(0,0,w,h);c.fillStyle='#39e06f';c.beginPath();c.moveTo(w*.5,h*.9);c.lineTo(w*.14,h*.48);c.lineTo(w*.38,h*.48);c.lineTo(w*.38,h*.1);c.lineTo(w*.62,h*.1);c.lineTo(w*.62,h*.48);c.lineTo(w*.86,h*.48);c.fill();},x,0,-.14,Math.PI,G);});
      const n=sign(1.6,1.6,(c,w,h)=>{c.fillStyle='#ffd23f';c.beginPath();c.arc(w/2,h/2,w*.46,0,7);c.fill();c.fillStyle='#1d2440';c.font='800 180px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(i+1,w/2,h/2+10);},0,-.05,-.16,Math.PI,G);tun.nums.push(n);}));
  /* jet fans */
  const fanM=M('#b9bec6',{metalness:.85,roughness:.3});
  [600,740,...TFANS,1060,1240].forEach(d=>onPath(d,0,TH-.95,G=>{[-2.7,2.7].forEach(x=>{const c=cyl(.72,.72,3.4,fanM,x,0,0,G,16);c.rotation.x=Math.PI/2;c.material.side=THREE.DoubleSide;[-1.2,1.2].forEach(z=>box(.1,.5,.1,fanM,x,.72,z,G));const r=new THREE.Group();r.position.set(x,0,-1.72);for(let k=0;k<5;k++){const b=box(.22,.62,.04,M('#3a3f48'),0,.34,0,r);b.geometry=b.geometry.clone();b.position.set(0,0,0);b.geometry.translate(0,.36,0);b.rotation.z=k*Math.PI*2/5;}cyl(.14,.14,.2,M('#2c2e32'),0,0,0,r,8).rotation.x=Math.PI/2;G.add(r);tun.fans.push(r);});}));
  /* green exit doors, help phones, fire cabinets along the walkway */
  for(let d=CA+70;d<CB-40;d+=150)onPath(d,-TW+.06,0,G=>{box(.1,2.5,1.5,M('#1f8a4c',{emissive:C('#0c5a2c'),emissiveIntensity:.6}),0,1.85,0,G);box(.12,2.7,.12,GL('#39e06f'),0,1.9,.82,G);box(.12,2.7,.12,GL('#39e06f'),0,1.9,-.82,G);box(.12,.12,1.76,GL('#39e06f'),0,3.2,0,G);
    sign(1.7,.85,(c,w,h)=>{c.fillStyle='#1f8a4c';c.fillRect(0,0,w,h);c.fillStyle='#fff';c.font='800 120px Arial';c.textAlign='left';c.textBaseline='middle';c.fillText('EXIT',w*.07,h/2+8);c.font='150px sans-serif';c.fillText('🏃',w*.64,h/2+8);},-.09,3.95,0,-Math.PI/2,G);});
  for(let d=CA+145;d<CB-40;d+=150)onPath(d,-TW+.06,0,G=>{box(.3,.9,.7,M('#f08a1c',{emissive:C('#7a3a00'),emissiveIntensity:.5}),-.1,2.0,0,G);sign(.9,.9,(c,w,h)=>{c.fillStyle='#f08a1c';c.fillRect(0,0,w,h);c.font='170px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('☎️',w/2,h/2+8);},-.12,3.0,0,-Math.PI/2,G);
    box(.25,.9,.6,M('#c5221f'),-.1,2.0,2.4,G);sign(.5,.5,(c,w,h)=>{c.fillStyle='#c5221f';c.fillRect(0,0,w,h);c.font='170px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('🧯',w/2,h/2+8);},-.24,2.0,2.4,-Math.PI/2,G);});
  /* overhead road signs */
  const big=(d,l1,l2)=>onPath(d,0,0,G=>{[-TW-1.2,TW+1.2].forEach(x=>box(.4,8.4,.4,M('#8a8f98',{metalness:.7}),x,4.2,0,G));box(TW*2+2.8,.4,.4,M('#8a8f98',{metalness:.7}),0,8.3,0,G);sign(9,3,(c,w,h)=>{c.fillStyle='#17703f';c.fillRect(0,0,w,h);c.strokeStyle='#fff';c.lineWidth=10;c.strokeRect(10,10,w-20,h-20);c.fillStyle='#fff';c.textAlign='center';c.font='800 92px Arial';c.fillText(l1,w/2,105);c.font='800 80px Arial';c.fillText(l2,w/2,205);},0,6.6,-.25,Math.PI,G);});
  big(150,'TUNNEL','Airport ✈ ⬆');big(1500,'AIRPORT ✈','All terminals ⬆');
  onPath(330,TW+1.6,0,G=>{box(.14,3.6,.14,M('#8a8f98'),0,1.8,0,G);sign(1.5,1.9,(c,w,h)=>{c.fillStyle='#fff';c.fillRect(0,0,w,h);c.strokeStyle='#111';c.lineWidth=10;c.strokeRect(8,8,w-16,h-16);c.fillStyle='#111';c.textAlign='center';c.font='800 44px Arial';c.fillText('SPEED',w/2,60);c.fillText('LIMIT',w/2,108);c.font='800 120px Arial';c.fillText('40',w/2,225);},0,3.4,-.1,Math.PI,G);});
  onPath(CA-4,0,TH+2.2,G=>{box(6.4,1.3,.3,M('#16181c'),0,0,-1.5,G);sign(6,1.05,(c,w,h)=>{c.fillStyle='#0b0e12';c.fillRect(0,0,w,h);c.fillStyle='#ffb21a';c.font='800 150px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('💡 LIGHTS ON',w/2,h/2+10);},0,0,-1.68,Math.PI,G);});
  /* --- the land and the harbor on top --- */
  const far=new THREE.Group();s.add(far);
  const topAt=(o)=>d=>{const p=uP(d,o,0);p.y=d>CA-2&&d<CB+2?tTop(d):0;return p;};
  [[-140,262,grassM],[1548,TEND+260,paveM]].forEach(r=>{nearTop.add(strip2(at(-320,d=>0),at(-TW,d=>0),r[0],r[1],r[2],20));far.add(strip2(at(TW,d=>0),at(320,d=>0),r[0],r[1],r[2],20));});
  [[262,CA],[CB,1548]].forEach(r=>{nearTop.add(strip2(at(-320,d=>0),at(-TW,d=>1.1),r[0],r[1],r[0]<800?grassM:paveM,10));far.add(strip2(at(TW,d=>1.1),at(320,d=>0),r[0],r[1],r[0]<800?grassM:paveM,10));});
  nearTop.add(strip2(topAt(-320),topAt(-TW-.6),CA,CB,M('#7a8f5a',{roughness:1,side:THREE.DoubleSide}),10));far.add(strip2(topAt(-TW-.6),topAt(320),CA,CB,M('#7a8f5a',{roughness:1,side:THREE.DoubleSide}),10));
  const seaM=new THREE.MeshStandardMaterial({color:C('#2c7fb8'),roughness:.15,metalness:.3,transparent:true,opacity:.82,side:THREE.DoubleSide});
  const seaN=strip2(at(-320,d=>-.5),at(-TW-.6,d=>-.5),WA+8,WB-8,seaM,20),seaF=strip2(at(-TW-.6,d=>-.5),at(320,d=>-.5),WA+8,WB-8,seaM,20);nearTop.add(seaN);far.add(seaF);
  /* --- x-ray cut: what the ground looks like sliced open beside the tunnel --- */
  const cut=-TW-.6;
  xr.add(strip2(at(cut,-34),at(cut,-1),CA-150,CB+150,earthM,6,30));xr.add(strip2(at(cut,TH+1),at(cut,d=>Math.max(tY(d)+TH+1,d>CA&&d<CB?tTop(d):0)),CA,CB,earthM,6,30));
  xr.add(strip2(at(cut,-1),at(cut,0),CA-150,CB+150,concM,6,8));xr.add(strip2(at(cut,TH),at(cut,TH+1),CA,CB,concM,6,8));
  {const wt=cvs(64,8,(c,w,h)=>{const g=c.createLinearGradient(0,0,w,0);g.addColorStop(0,'#1c5f9a');g.addColorStop(1,'#5cb6e8');c.fillStyle=g;c.fillRect(0,0,w,h);});xr.add(strip2(at(cut,d=>tTop(d)),at(cut,d=>-.5),WA+8,WB-8,new THREE.MeshBasicMaterial({map:wt,transparent:true,opacity:.86,side:THREE.DoubleSide}),10));}
  xr.add(strip2(at(140,d=>tTop(d)-1),at(140,d=>-.5),WA,WB,new THREE.MeshBasicMaterial({color:0x1f5f96,side:THREE.DoubleSide}),20));
  /* labels that only show in the x-ray view */
  const tag=(txt,d,o,y)=>{const t=cvs(512,128,(c,w,h)=>{c.fillStyle='#1d2440';rr(c,4,4,w-8,h-8,50);c.fill();c.fillStyle='#fff';c.font='800 74px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(txt,w/2,h/2+5);}),sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false}));sp.scale.set(13,3.25,1);sp.position.copy(uP(d,o,0));sp.position.y=y;sp.renderOrder=5;xr.add(sp);};
  for(let d=WA+90;d<WB;d+=260){tag('🚢 BOAT',d,-TW,5.5);tag('🌊 WATER',d+70,-TW,-5.5);tag('🚇 TUNNEL',d+140,-TW,tY(d+140)+TH+3);}
  /* boats */
  const boat=(kind)=>{const G=new THREE.Group(),wh=M('#f2f4f7'),hull=M(kind===1?'#c5221f':kind===2?'#1b3f77':'#f2f4f7',{roughness:.5});
    if(kind===0){const hb=box(2.2,1.2,7,hull,0,.2,0,G);box(.12,8,.12,M('#8a6a3a'),0,4.4,.6,G);const sl=new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new V3(0,1.2,.5),new V3(0,8.2,.5),new V3(0,1.2,-3.2)]),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));G.add(sl);const jb=new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new V3(0,1.2,.8),new V3(0,7,.8),new V3(0,1.2,3.3)]),new THREE.MeshBasicMaterial({color:0xfff0d0,side:THREE.DoubleSide}));G.add(jb);}
    else if(kind===1){box(4,2.2,11,hull,0,.3,0,G);box(3,2,4,wh,0,2.4,1.5,G);box(2.2,1.2,2.4,wh,0,4,1.8,G);cyl(.5,.5,2.4,M('#22252b'),0,4.6,-.6,G,10);box(4.2,.4,11.2,M('#22252b'),0,1.5,0,G);}
    else{box(7,2.6,24,hull,0,.4,0,G);box(6.4,2.6,18,wh,0,3,0,G);box(5.4,2.2,9,wh,0,5.4,1,G);cyl(.9,.9,2.6,M('#f2c21b'),0,7.6,-1,G,12);for(let i=0;i<8;i++)box(6.44,.9,1.2,M('#18222e',{roughness:.1,metalness:.8}),0,3.2,-7.4+i*2.1,G);}
    far.add(G);return G;};
  tun.boats=[[2,WA+170,30,.9],[0,WA+330,-12,1.4],[1,WA+470,18,-1.1],[0,WA+600,46,-1.5],[2,WA+690,-6,.7]].map(b=>({g:boat(b[0]),d:b[1],o:b[2],v:b[3]}));
  /* fish */
  {const ft=['🐟','🐠','🐡','🦀','🐙','🦈'].map(e=>cvs(96,96,(c,w,h)=>{c.font='72px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(e,w/2,h/2+6);}));tun.fish=[];
    for(let i=0;i<46;i++){const k=i%6,sp=new THREE.Sprite(new THREE.SpriteMaterial({map:ft[k],transparent:true}));const sc=k===5?4.2:k===3?1.5:2.2;sp.scale.set(sc,sc,1);xr.add(sp);tun.fish.push({sp,d:WA+60+Math.random()*(WB-WA-120),o:-TW-.9-Math.random()*1.6,y:k===3?0:1.5+Math.random()*7,v:(k===3?.4:1.5+Math.random()*2)*(Math.random()<.5?1:-1),k,ph:Math.random()*6});}}
  /* --- city side --- */
  for(let i=0;i<34;i++){const sd=i%2?1:-1,d=-120+i*13+Math.random()*6,o=sd*(26+Math.random()*46),h=18+Math.random()*60,w=14+Math.random()*10,p=uP(Math.min(d,255),o,0);const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),[bt[i%bt.length],bt[i%bt.length],M('#3c4046'),M('#3c4046'),bt[i%bt.length],bt[i%bt.length]]);m.position.set(p.x,h/2,p.z);(sd<0?nearTop:far).add(m);}
  {const L=[];for(let d=-120;d<262;d+=26)L.push([d,-8.2],[d+13,8.2]);for(let d=1548;d<TEND+240;d+=26)L.push([d,-8.2],[d+13,8.2]);const pm=M('#2f3440',{metalness:.7}),im=new THREE.InstancedMesh(new THREE.CylinderGeometry(.13,.17,7,6),pm,L.length),im2=new THREE.InstancedMesh(new THREE.BoxGeometry(2.2,.18,.5),new THREE.MeshBasicMaterial({color:0xfff3c4}),L.length),dm=new THREE.Object3D();
    L.forEach((l,i)=>{dm.rotation.set(0,0,0);dm.position.copy(uP(l[0],l[1],3.5));dm.updateMatrix();im.setMatrixAt(i,dm.matrix);dm.position.copy(uP(l[0],l[1]-Math.sign(l[1])*1.1,7));dm.updateMatrix();im2.setMatrixAt(i,dm.matrix);});im.frustumCulled=im2.frustumCulled=false;s.add(im,im2);}
  {const tr=[];for(let i=0;i<70;i++){const d=Math.random()<.5?-120+Math.random()*520:1420+Math.random()*120,o=(Math.random()<.5?-1:1)*(12+Math.random()*120);if(d>250&&d<1420&&Math.abs(o)<16)continue;tr.push(uP(d,o,0));}
    const tm=M('#3f7a3a',{roughness:1}),tk=M('#5b4630',{roughness:1}),a=new THREE.InstancedMesh(new THREE.SphereGeometry(2.6,7,5),tm,tr.length),b=new THREE.InstancedMesh(new THREE.CylinderGeometry(.3,.4,3,5),tk,tr.length),dm=new THREE.Object3D();tr.forEach((p,i)=>{const k=.8+Math.random()*.6;dm.scale.set(k,k*1.15,k);dm.position.set(p.x,4.2*k,p.z);dm.updateMatrix();a.setMatrixAt(i,dm.matrix);dm.scale.set(1,k,1);dm.position.set(p.x,1.5*k,p.z);dm.updateMatrix();b.setMatrixAt(i,dm.matrix);});a.frustumCulled=b.frustumCulled=false;s.add(a,b);}
  /* --- airport side --- */
  { const p=uP(1650,70,0),term=new THREE.Group();term.position.copy(p);term.rotation.y=tYaw(1650);far.add(term);box(60,14,150,M('#dfe3e8',{roughness:.5}),0,7,0,term);box(.4,9,146,M('#5c8cbd',{roughness:.08,metalness:.85}),30.3,7.5,0,term);box(64,1.2,154,M('#8a8f98'),0,14.6,0,term);
    const tw=uP(1720,-90,0);cyl(3,4,44,M('#c9ced6'),tw.x,22,tw.z,nearTop,12);cyl(6.5,4.5,6,M('#18222e',{roughness:.1,metalness:.8}),tw.x,47,tw.z,nearTop,12);cyl(7,7,1,M('#c9ced6'),tw.x,50.5,tw.z,nearTop,12);
    tun.planes=[];[[1690,-46,1.2],[1790,-64,2.2]].forEach(q=>{const pl=ACS.liner.make(),pp=uP(q[0],q[1],0);pl.position.set(pp.x,ACS.liner.gh,pp.z);pl.rotation.y=q[2];nearTop.add(pl);});
    const fl=ACS.liner.make();if(fl.userData.gear)fl.userData.gear.visible=false;s.add(fl);tun.flyer=fl;
    const rw=strip2(at(-260,d=>.05),at(-40,d=>.05),1600,TEND+250,new THREE.MeshStandardMaterial({color:C('#55585e'),roughness:.9,side:THREE.DoubleSide}),40);nearTop.add(rw);}
  /* --- vehicles --- */
  tun.veh=[tCar('#2d7fe0','car'),tCar('','bus'),tCar('','fire')];tun.veh.forEach((v,i)=>{v.visible=i===0;s.add(v);});
  TCOLS.forEach((c,i)=>{const g=tCar(c[0],'car');g.userData.wheels.forEach(w=>{});s.add(g);tun.traf.push({g,d:140+i*190+Math.random()*60,v:13+((i*7)%5)*1.6,ci:i});});
  tun.lights={hemi,sun,lamp,head,ht};tun.left=left;tun.xr=xr;tun.nearTop=nearTop;tun.far=far;
  s.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});
}

function tSetVeh(i){TU.veh=i;tun.veh.forEach((v,k)=>v.visible=k===i);document.querySelectorAll('#tveh button').forEach((b,k)=>b.classList.toggle('on',k===i));}
function tReset(){TU.d=20;TU.v=0;TU.done=false;TU.lesson=0;TU.seen={};TU.xray=false;TU.xrayT=0;TU.lights=false;TU.view='chase';TU.colT=4;levU.set(0);tNeed(null);$('tbig').style.opacity=0;$('tlight').classList.remove('on');$('txray').classList.remove('on');tSetVeh(TU.veh);
  tun.traf.forEach((t,i)=>{t.d=140+i*190;});cam.position.copy(uP(0,2,6));}
function tXray(on,auto){TU.xray=on;TU.xrayT=on?13:0;$('txray').classList.toggle('on',on);if(on){say('The tunnel is under the water. Boats float on top. Fish swim in the water. We drive under them all.');tBig('👀','Look! Under the water',4200);}}
const levU=Lever($('levU'));
$('thorn').onclick=()=>{audioInit();snd.horn();if(tIn(TU.d)>.5){[277,330,415].forEach(f=>{tone(f,.9,'sawtooth',.045,.42);tone(f,.8,'sawtooth',.02,.84);tone(f,.7,'sawtooth',.009,1.26);});}if(TU.need==='thorn'){tNeed(null);tPraise();}};
$('tlight').onclick=()=>{TU.lights=!TU.lights;$('tlight').classList.toggle('on',TU.lights);snd.ding&&tone(1200,.08,'sine',.12);if(TU.lights&&TU.need==='tlight'){tNeed(null);tPraise();say('Lights on. Now we can see.');}};
$('txray').onclick=()=>{const was=TU.need==='txray';tXray(!TU.xray,false);if(was&&TU.xray){tNeed(null);addStar(1);snd.ding();}};
document.querySelectorAll('#tveh button').forEach((b,i)=>b.onclick=()=>{audioInit();tSetVeh(i);say(['The blue car','The school bus','The fire truck'][i]);});

const _tv=new THREE.Vector3(),_tw=new THREE.Vector3();
function updTunnel(dt){
  const L=tun.lights,V=tun.veh[TU.veh],k=tIn(TU.d);
  if(keys.ArrowUp||keys.w)levU.set(levU.v+dt*.7);if(keys.ArrowDown||keys.s)levU.set(levU.v-dt*.9);
  /* speed: gentle, with a slow-down for each thing to look at */
  const vmax=TU.done?0:(TU.xray?7:TU.need?9:17),vt=levU.v*vmax;TU.v+=clamp(vt-TU.v,-16*dt,6*dt);if(TU.v<.05&&vt===0)TU.v=0;TU.d+=TU.v*dt;TU.wheel+=TU.v*dt;
  const p=uP(TU.d,2.3,0),yaw=tYaw(TU.d),pitch=Math.atan2(tY(TU.d+2)-tY(TU.d-2),4);
  V.position.copy(p);V.rotation.set(0,0,0);V.rotation.y=yaw;V.rotateX(-pitch);V.userData.wheels.forEach(w=>w.rotation.x=TU.wheel/(.4));
  if(V.userData.beac){const f=(performance.now()/160|0)%2;V.userData.beac[0].visible=!!f;V.userData.beac[1].visible=!f;}
  V.userData.lens.forEach(m=>m.material.color.setHex(TU.lights?0xfff6c8:0x8a8f98));
  /* light: bright day outside, lamp-lit inside */
  {const kk=TU.xray?0:k;L.hemi.intensity=.85-.6*kk;L.sun.intensity=2.1*(1-kk);}L.lamp.intensity=1.15*k;L.lamp.position.copy(uP(TU.d+4,0,TH-1.2));
  L.head.intensity=TU.lights?(1.2+2.6*k):0;L.head.position.copy(uP(TU.d+V.userData.len/2,2.3,1.1));L.ht.position.copy(uP(TU.d+V.userData.len/2+30,2.3,.2));
  tun.scene.background.set(0x8fc7ee);
  /* traffic in the other lane */
  tun.traf.forEach(t=>{t.d+=t.v*dt;if(t.d>TEND+200)t.d=-120;if(t.d<TU.d-320)t.d=TU.d+420+Math.random()*200;const q=uP(t.d,-2.2,0);t.g.position.copy(q);t.g.rotation.set(0,0,0);t.g.rotation.y=tYaw(t.d);t.g.rotateX(-Math.atan2(tY(t.d+2)-tY(t.d-2),4));t.g.userData.wheels.forEach(w=>w.rotation.x=t.d/.36);t.g.userData.lens.forEach(m=>m.material.color.setHex(tIn(t.d)>.3?0xfff6c8:0x8a8f98));
    TU.colT-=dt/tun.traf.length;if(Math.abs(t.d-TU.d)<5&&TU.colT<=0&&TU.v>3&&!TU.need&&!TU.xray&&!TU.done){TU.colT=13;tBig('<i style="display:inline-block;width:58px;height:58px;border-radius:50%;border:5px solid #fff;background:'+TCOLS[t.ci][0]+'"></i>',TCOLS[t.ci][1]+' car',2600);say('A '+TCOLS[t.ci][1].toLowerCase()+' car.');}});
  tun.fans.forEach(f=>f.rotation.z+=dt*14);
  tun.boats.forEach(b=>{b.o+=b.v*dt;if(b.o>110)b.o=-60;if(b.o<-60)b.o=110;const q=uP(b.d,b.o,0);b.g.position.set(q.x,-.5+Math.sin(performance.now()/900+b.d)*.15,q.z);b.g.rotation.y=tYaw(b.d)+(b.v>0?-Math.PI/2:Math.PI/2);});
  if(TU.xray)tun.fish.forEach(f=>{f.d+=f.v*dt;if(f.d>WB-50)f.v=-Math.abs(f.v);if(f.d<WA+50)f.v=Math.abs(f.v);const q=uP(f.d,f.o,0);f.sp.position.set(q.x,tTop(f.d)+.8+f.y*.9+Math.sin(performance.now()/700+f.ph)*.4,q.z);f.sp.position.y=Math.min(f.sp.position.y,-1.6);});
  { const t=performance.now()/1000%26,f=tun.flyer,q=uP(1250+t*42,-150+t*5,0);f.position.set(q.x,8+Math.max(0,t-6)*9,q.z);f.rotation.set(-Math.min(.22,Math.max(0,t-6)*.05),tYaw(1600),0);}
  /* lessons */
  if(!TU.done){
    while(TU.lesson<TLESS.length&&TU.d>=TLESS[TU.lesson].d){const l=TLESS[TU.lesson++];if(l.need==='tlight'&&TU.lights){tBig('💡','Lights on!',2400);say('It is dark inside. Good thing our lights are on.');continue;}tBig(l.e,l.w,l.need?6000:3400);say(l.s);if(l.need)tNeed(l.need);}
    TCOUNT.forEach((d,i)=>{if(TU.d>=d-9&&!TU.seen['c'+i]){TU.seen['c'+i]=1;tBig('<i class="num">'+(i+1)+'</i>',['One','Two','Three','Four','Five'][i]+(i===4?'! Five green arrows':''),1500);say(['One','Two','Three','Four','Five green arrows!'][i]);tone(520+i*80,.18,'sine',.16);}});
    TFANS.forEach((d,i)=>{if(TU.d>=d-12&&!TU.seen['f'+i]){TU.seen['f'+i]=1;tBig('🌀',['One fan','Two fans','Three fans'][i],1700);say(i===2?'Three fans. Fans blow fresh air. Whoosh!':['One fan','Two fans'][i]);puff(.12,.9,500);}});
    if(TU.d>=536&&!TU.seen.cn){TU.seen.cn=1;tBig('🔢','Count the green arrows',2200);say('Let\'s count the green arrows.');}
    if(TU.need){TU.needT+=dt;if(TU.needT>14){TU.needT=0;const l=TLESS.find(x=>x.need===TU.need);if(l)say(l.s);}}
    if(TU.xrayT>0){TU.xrayT-=dt;if(TU.xrayT<=0)tXray(false);}
    if(TU.d>=TEND-60&&levU.v>.02&&TU.d<TEND)TU.v=Math.min(TU.v,Math.max(2,(TEND-TU.d)*.45));
    if(TU.d>=TEND){TU.done=true;TU.v=0;levU.set(0);tNeed(null);if(TU.xray)tXray(false);addStar(3);tBig('🎉','Yay! You drove through the tunnel!',7400);say('Yay! You drove under the water, all the way to the airport. Great driving!');snd.fanfare();confetti();
      const id=++TU.fid;setTimeout(()=>{if(mode==='tunnel'&&TU.done)confetti();},1800);setTimeout(()=>{if(mode==='tunnel'&&TU.done&&TU.fid===id)setMode('menu');},7500);}
  }
  engine(.03+TU.v*.004,260+TU.v*34,.022+TU.v*.0012,52+TU.v*4.2);
  /* cameras */
  const xr=TU.xray;tun.left.visible=!xr;tun.xr.visible=xr;tun.nearTop.visible=!xr;
  if(xr){const dist=Math.min(74,35*Math.max(1,(innerHeight/innerWidth)*1.6)),c=uP(TU.d+2,-dist,0),dep=clamp(-tY(TU.d)/24,0,1);_tv.set(c.x,tY(TU.d)+4,c.z);cam.position.lerp(_tv,1-Math.exp(-dt*3));const q=uP(TU.d+2,2.3,0);cam.lookAt(q.x,tY(TU.d)+TH/2+12.5*dep,q.z);}
  V.visible=xr||TU.view!=='drive';
  if(!xr&&TU.view==='drive'){const e=V.userData.eye;_tv.set(e[0],e[1],e[2]).applyQuaternion(V.quaternion).add(V.position);cam.position.copy(_tv);const t=uP(TU.d+26,1.6,1.4);cam.lookAt(t);}
  else if(!xr){const back=V.userData.len*.5+7.5,c=uP(TU.d-back,1.2,Math.min(4.3,2.6+V.userData.len*.14));cam.position.lerp(c,1-Math.exp(-dt*5));const t=uP(TU.d+10,2.0,1.4);cam.lookAt(t);}
}
