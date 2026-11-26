'use strict';

const $=id=>document.getElementById(id), clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), rnd=(a,b)=>a+Math.random()*(b-a);
const V3=THREE.Vector3;

/* ---------- renderer ---------- */
const canvas=$('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
let PR=Math.min(window.devicePixelRatio||1,2);renderer.setPixelRatio(PR);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const cam=new THREE.PerspectiveCamera(60,1,1,14000);
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);cam.aspect=w/h;cam.fov=w<h?78:60;cam.updateProjectionMatrix();}
addEventListener('resize',resize);resize();
const ANISO=renderer.capabilities.getMaxAnisotropy();

/* ---------- helpers ---------- */
const C=c=>new THREE.Color(c).convertSRGBToLinear();
const mats={};
function M(c,o){const k=c+(o?JSON.stringify(o):'');return mats[k]||(mats[k]=new THREE.MeshStandardMaterial(Object.assign({color:C(c),roughness:.85,metalness:0},o||{})));}
const GL=c=>new THREE.MeshBasicMaterial({color:C(c)});
function box(w,h,d,mat,x,y,z,p){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x||0,y||0,z||0);if(p)p.add(m);return m;}
function cyl(rt,rb,h,mat,x,y,z,p,seg){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||14),mat);m.position.set(x||0,y||0,z||0);if(p)p.add(m);return m;}
function sph(r,mat,x,y,z,p){const m=new THREE.Mesh(new THREE.SphereGeometry(r,18,12),mat);m.position.set(x||0,y||0,z||0);if(p)p.add(m);return m;}
function cvs(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=ANISO;return t;}
function rep(t,x,y){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(x,y);return t;}
function signTex(text,bg,stripe){return cvs(512,128,(g,w,h)=>{g.fillStyle=bg||'#1b2145';g.fillRect(0,0,w,h);g.fillStyle=stripe||'#8a3aa8';g.fillRect(0,h-22,w,22);g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';let f=68;g.font='800 '+f+'px Arial,sans-serif';while(g.measureText(text).width>w-30){f-=4;g.font='800 '+f+'px Arial,sans-serif';}g.fillText(text,w/2,h/2-8);});}
function pip(x,z,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
function shade(hex,k){const c=new THREE.Color(hex);return 'rgb('+[c.r,c.g,c.b].map(v=>Math.min(255,(v*255*k)|0)).join(',')+')';}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function glassFill(g,y,h){const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'#5d7f9f');gr.addColorStop(.4,'#22303f');gr.addColorStop(1,'#0d141c');g.fillStyle=gr;}
/* tileable value noise */
const N1=(()=>{const n=64,a=new Float32Array(n*n);for(let i=0;i<a.length;i++)a[i]=Math.random();return (x,y)=>{x=((x%n)+n)%n;y=((y%n)+n)%n;const xi=x|0,yi=y|0,xf=x-xi,yf=y-yi,x1=(xi+1)%n,y1=(yi+1)%n,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return (a[yi*n+xi]*(1-u)+a[yi*n+x1]*u)*(1-v)+(a[y1*n+xi]*(1-u)+a[y1*n+x1]*u)*v;};})();
function fbm(u,v,b){let s=0,a=.5,f=b;for(let o=0;o<4;o++){s+=a*N1(u*f,v*f);a*=.5;f*=2;}return s/.9375;}
function noiseTex(sz,fn,srgb){const c=document.createElement('canvas');c.width=c.height=sz;const g=c.getContext('2d'),im=g.createImageData(sz,sz),d=im.data;for(let y=0;y<sz;y++)for(let x=0;x<sz;x++){const p=fn(x/sz,y/sz),i=(y*sz+x)*4;d[i]=p[0];d[i+1]=p[1];d[i+2]=p[2];d[i+3]=p.length>3?p[3]:255;}g.putImageData(im,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(srgb!==false)t.encoding=THREE.sRGBEncoding;t.anisotropy=ANISO;return t;}
const grassTex=noiseTex(256,(u,v)=>{const n=fbm(u,v,8),m=N1(u*64,v*64),k=.5+n*.55+(m-.5)*.3;return [58*k+22,80*k+28,38*k+16];});
const concTex=noiseTex(128,(u,v)=>{const k=150+fbm(u,v,8)*50+(N1(u*64,v*64)-.5)*24;return [k,k,k*.97];});
const waterN=noiseTex(256,(u,v)=>{const e=1/256,h=fbm(u,v,8),dx=(h-fbm(u+e,v,8))*46,dy=(h-fbm(u,v+e,8))*46,l=Math.hypot(dx,dy,1);return [(dx/l*.5+.5)*255,(dy/l*.5+.5)*255,(1/l*.5+.5)*255];},false);
const trackTex=cvs(256,128,(g,w,h)=>{g.fillStyle='#6f6a62';g.fillRect(0,0,w,h);for(let i=0;i<2600;i++){const s=rnd(2,5);g.fillStyle=['#58544d','#8a847a','#77716a','#9a948a','#4b4741'][i%5];g.beginPath();g.ellipse(rnd(0,w),rnd(0,h),s,s*.7,rnd(0,3),0,7);g.fill();}
  const x0=w*.25,tw=w*.5,y0=h*.3,th=h*.4;g.fillStyle='#3d2e22';g.fillRect(x0,y0,tw,th);for(let i=0;i<40;i++){g.fillStyle='rgba('+(i%2?'20,14,8':'110,85,60')+','+rnd(.1,.3)+')';g.fillRect(x0,y0+rnd(0,th),tw,1);}
  g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x0,y0+th,tw,3);
  [.356,.644].forEach(u=>{g.fillStyle='#2a2623';g.fillRect(w*u-9,y0+4,18,th-8);const gr=g.createLinearGradient(w*u-14,0,w*u+14,0);gr.addColorStop(0,'rgba(90,50,25,0)');gr.addColorStop(.5,'rgba(90,50,25,.4)');gr.addColorStop(1,'rgba(90,50,25,0)');g.fillStyle=gr;g.fillRect(w*u-14,0,28,h);});});
trackTex.wrapS=trackTex.wrapT=THREE.RepeatWrapping;
const trackMat=new THREE.MeshStandardMaterial({map:trackTex,roughness:.95,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
function flat(c,layer,o){return new THREE.MeshStandardMaterial(Object.assign({color:C(c),roughness:.9,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-layer,polygonOffsetUnits:-layer},o||{}));}
function strip2(fA,fB,d0,d1,mat,step,vRep){
  const n=Math.max(1,Math.ceil((d1-d0)/(step||3))),pos=[],uv=[],idx=[];
  for(let i=0;i<=n;i++){const d=d0+(d1-d0)*i/n,a=fA(d),b=fB(d);pos.push(a.x,a.y,a.z,b.x,b.y,b.z);const v=vRep?d/vRep:i/n;uv.push(0,v,1,v);if(i<n){const k=i*2;idx.push(k,k+2,k+1,k+1,k+2,k+3);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,mat);m.userData.noCast=true;return m;
}
function strip(posFn,d0,d1,o1,y1,o2,y2,mat,step,vRep){return strip2(d=>{const p=posFn(d,o1);p.y=(p.y||0)+y1;return p;},d=>{const p=posFn(d,o2);p.y=(p.y||0)+y2;return p;},d0,d1,mat,step,vRep);}
const ss=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
function inst(geo,mat,items,k,fn){const g=new THREE.BufferGeometry();for(const n in geo.attributes)g.setAttribute(n,geo.attributes[n]);g.setIndex(geo.index);g.groups=geo.groups;
  const m=new THREE.InstancedMesh(g,mat,items.length*k),c=new V3();items.forEach(it=>c.add(new V3(it[0],0,it[1])));c.multiplyScalar(1/Math.max(1,items.length));let r=0;items.forEach(it=>{r=Math.max(r,Math.hypot(it[0]-c.x,it[1]-c.z)+(it.y||0));});
  g.boundingSphere=new THREE.Sphere(c,r+60);const dm=new THREE.Object3D(),col=new THREE.Color();items.forEach((it,i)=>fn(it,i,m,dm,col));return m;}
const railTop=new THREE.MeshStandardMaterial({color:C('#b9bec6'),roughness:.22,metalness:1,side:THREE.DoubleSide}),railSide=new THREE.MeshStandardMaterial({color:C('#4d382b'),roughness:.8,metalness:.3,side:THREE.DoubleSide});
function rails(posFn,d0,d1,off,parent,s,step,y0){[-.75,.75].forEach(r=>{const o=off+r*s,hw=.075*s,y1=y0+.28*s;parent.add(strip(posFn,d0,d1,o-hw,y1,o+hw,y1,railTop,step));parent.add(strip(posFn,d0,d1,o-hw,y0,o-hw,y1,railSide,step));parent.add(strip(posFn,d0,d1,o+hw,y0,o+hw,y1,railSide,step));});}
function gable(w,h,l){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,h);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:l,bevelEnabled:false});g.translate(0,0,-l/2);return g;}
function shadowize(root){root.traverse(o=>{if(!o.isMesh)return;const m=Array.isArray(o.material)?o.material[0]:o.material,t=o.geometry.type,fg=t==='PlaneGeometry'||t==='ShapeGeometry'||t==='CircleGeometry';o.receiveShadow=!m.isMeshBasicMaterial;o.castShadow=!(fg||m.isMeshBasicMaterial||m.transparent||m.polygonOffset||o.userData.noCast);});return root;}

/* ---------- vehicles (front = +z, origin at rail level, ~20 long) ---------- */
function steel(g,w,h){const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#dfe3e8');gr.addColorStop(.5,'#c6cbd2');gr.addColorStop(1,'#a7adb6');g.fillStyle=gr;g.fillRect(0,0,w,h);for(let i=0;i<200;i++){g.fillStyle='rgba(255,255,255,'+rnd(.02,.09)+')';g.fillRect(0,rnd(0,h),w,1);}g.fillStyle='rgba(0,0,0,.10)';for(let y=h*.8;y<h*.96;y+=5)g.fillRect(0,y,w,1.5);}
function grime(g,w,h){const gg=g.createLinearGradient(0,h*.78,0,h);gg.addColorStop(0,'rgba(60,50,40,0)');gg.addColorStop(1,'rgba(60,50,40,.4)');g.fillStyle=gg;g.fillRect(0,h*.78,w,h*.22);}
const CAR={};
function carMats(){if(CAR.ok)return;CAR.ok=1;
  const T=(t,o)=>new THREE.MeshStandardMaterial(Object.assign({map:t,roughness:.38,metalness:.55},o||{})),flip=t=>{const c=t.clone();c.wrapS=THREE.RepeatWrapping;c.repeat.x=-1;c.offset.x=1;c.needsUpdate=true;return c;};
  const cs=cvs(1024,160,(g,w,h)=>{steel(g,w,h);g.fillStyle='#5f2583';g.fillRect(0,h*.5,w,h*.14);g.fillStyle='#f2bf1b';g.fillRect(0,h*.65,w,h*.035);
    for(let x=96;x<w-150;x+=74){glassFill(g,h*.14,h*.3);rr(g,x,h*.14,56,h*.3,7);g.fill();g.strokeStyle='#6d737d';g.lineWidth=3;g.stroke();}
    [22,w-70].forEach(x=>{g.strokeStyle='#5d636d';g.lineWidth=3;g.strokeRect(x,h*.1,48,h*.82);glassFill(g,h*.16,h*.26);g.fillRect(x+10,h*.16,28,h*.26);});grime(g,w,h);});
  const ce=cvs(128,128,(g,w,h)=>{steel(g,w,h);g.strokeStyle='#555b65';g.lineWidth=3;g.strokeRect(w*.3,h*.12,w*.4,h*.8);glassFill(g,h*.18,h*.25);g.fillRect(w*.38,h*.18,w*.24,h*.25);grime(g,w,h);});
  const roof=M('#8d939d',{roughness:.6,metalness:.4}),under=M('#1f2126');
  CAR.coach=[T(cs),T(cs),roof,under,T(ce),T(ce)];
  const ls=cvs(1024,160,(g,w,h)=>{steel(g,w,h);g.fillStyle='#5f2583';g.fillRect(0,h*.34,w,h*.38);g.fillStyle='#f2bf1b';g.fillRect(0,h*.72,w,h*.05);g.fillRect(0,h*.30,w,h*.035);
    glassFill(g,h*.07,h*.2);rr(g,36,h*.07,74,h*.2,6);g.fill();g.strokeStyle='#3d3f45';g.lineWidth=3;g.strokeRect(128,h*.07,46,h*.84);
    for(let x=250;x<920;x+=150){g.fillStyle='#262a30';g.fillRect(x,h*.06,112,h*.2);g.fillStyle='#5b616b';for(let y=h*.08;y<h*.25;y+=5)g.fillRect(x,y,112,1.5);}
    g.fillStyle='#fff';g.font='700 36px Arial';g.fillText('1050',430,h*.63);grime(g,w,h);});
  const lf=cvs(256,256,(g,w,h)=>{steel(g,w,h);g.fillStyle='#5f2583';g.fillRect(0,h*.34,w,h*.38);g.fillStyle='#f2bf1b';g.fillRect(0,h*.72,w,h*.05);
    g.beginPath();g.moveTo(w*.08,h*.36);g.lineTo(w*.5,h*.6);g.lineTo(w*.92,h*.36);g.lineTo(w*.92,h*.45);g.lineTo(w*.5,h*.69);g.lineTo(w*.08,h*.45);g.closePath();g.fill();
    glassFill(g,h*.06,h*.22);rr(g,w*.1,h*.06,w*.37,h*.22,8);g.fill();rr(g,w*.53,h*.06,w*.37,h*.22,8);g.fill();g.fillStyle='#16181c';g.fillRect(w*.38,h*.8,w*.24,h*.2);grime(g,w,h);});
  CAR.loco=[T(ls),T(flip(ls)),roof,under,T(lf),T(ce)];
  const ms=cvs(1024,160,(g,w,h)=>{steel(g,w,h);g.fillStyle='#e8731a';g.fillRect(0,h*.52,w,h*.12);for(let x=40;x<w-60;x+=58){if((x-40)/58%5===2)continue;glassFill(g,h*.16,h*.3);rr(g,x,h*.16,44,h*.3,5);g.fill();}
    [156,446,736].forEach(x=>{g.fillStyle='#b9bec6';g.fillRect(x,h*.1,62,h*.82);g.strokeStyle='#4d535d';g.lineWidth=3;g.strokeRect(x,h*.1,31,h*.82);g.strokeRect(x+31,h*.1,31,h*.82);glassFill(g,h*.16,h*.3);g.fillRect(x+6,h*.16,20,h*.3);g.fillRect(x+36,h*.16,20,h*.3);});grime(g,w,h);});
  const mf=cvs(128,128,(g,w,h)=>{steel(g,w,h);g.fillStyle='#e8731a';g.fillRect(0,h*.52,w,h*.12);glassFill(g,h*.1,h*.34);g.fillRect(w*.1,h*.1,w*.8,h*.34);grime(g,w,h);});
  CAR.metro=[T(ms),T(ms),roof,under,T(mf),T(mf)];CAR.all=CAR.coach.concat(CAR.loco,CAR.metro);
  CAR.roofG=l=>{const g=new THREE.CylinderGeometry(1.6,1.6,l,14,1,false,0,Math.PI);g.rotateX(Math.PI/2);g.rotateZ(Math.PI/2);g.scale(1,.32,1);return g;};
}
function bogies(g,zs){const dk=M('#1d1f24',{roughness:.7,metalness:.4}),wm=M('#6a6f78',{roughness:.35,metalness:.9});(zs||[6.5,-6.5]).forEach(z=>{box(2.3,.6,4.4,dk,0,.7,z,g);box(2.6,.25,3.2,dk,0,.55,z,g);[1.4,-1.4].forEach(dz=>{const w=cyl(.5,.5,2.1,wm,0,.5,z+dz,g,14);w.rotation.z=Math.PI/2;});});}
function makeCar(type){
  carMats();const g=new THREE.Group(),col=type.split(':')[1];type=type.split(':')[0];
  const glass=M('#141d28',{roughness:.08,metalness:.9}),dark=M('#1f2126',{roughness:.7,metalness:.3}),roofM=CAR.coach[2];
  if(type==='loco'){
    box(3.2,3.3,20,CAR.loco,0,2.55,0,g);const r=new THREE.Mesh(CAR.roofG(20),roofM);r.position.y=4.2;g.add(r);
    [-5,-1,3].forEach(z=>{cyl(.85,.85,.25,dark,0,4.78,z,g,16);cyl(.7,.7,.06,M('#3a3f48',{metalness:.8,roughness:.4}),0,4.92,z,g,16);});box(1.2,.5,2,dark,0,4.85,-8,g);
    [-.95,.95].forEach(x=>sph(.24,GL('#fff4b8'),x,1.75,10.02,g));sph(.2,GL('#fff4b8'),0,4.72,9.6,g);[-.6,.6].forEach(x=>sph(.14,GL('#ff3b30'),x,1.3,10.02,g));
    box(2.8,.5,18.5,dark,0,1.05,0,g);const ft=cyl(.75,.75,5,dark,0,.85,0,g,12);ft.rotation.x=Math.PI/2;box(2.6,.9,.5,dark,0,.85,10.2,g);box(.4,.4,.9,dark,0,.9,10.6,g);box(3,.12,.5,M('#f2bf1b'),0,1.32,10.25,g);bogies(g);
  }else if(type==='coach'){
    box(3.2,3.3,20.6,CAR.coach,0,2.55,0,g);const r=new THREE.Mesh(CAR.roofG(20.6),roofM);r.position.y=4.2;g.add(r);[-6,6].forEach(z=>box(1.6,.3,2.4,dark,0,4.72,z,g));
    box(2.8,.5,19,dark,0,1.05,0,g);box(1.6,.7,4,dark,0,.75,0,g);[10.5,-10.5].forEach(z=>box(.4,.4,.8,dark,0,.9,z,g));bogies(g);
  }else if(type==='metro'){
    box(3.1,3.2,20.6,CAR.metro,0,2.5,0,g);const r=new THREE.Mesh(CAR.roofG(20.6),roofM);r.position.y=4.1;r.scale.x=.97;g.add(r);box(2.8,.5,19,dark,0,1.05,0,g);[.8,-.8].forEach(x=>{sph(.2,GL('#fff4b8'),x,1.6,10.32,g);sph(.2,GL('#ff3b30'),x,1.6,-10.32,g);});bogies(g);
  }else if(type==='steam'){
    const blk=M('#17191d',{roughness:.3,metalness:.6}),red=M('#b3261f',{roughness:.35,metalness:.2}),gold=M('#d6a531',{roughness:.25,metalness:1});
    const b=cyl(1.35,1.35,11.5,blk,0,2.5,2.2,g,20);b.rotation.x=Math.PI/2;const sb=cyl(1.45,1.45,1.2,M('#2c2f36',{roughness:.4,metalness:.7}),0,2.5,8.2,g,20);sb.rotation.x=Math.PI/2;
    [0,3.5,6.5].forEach(z=>{const bd=cyl(1.39,1.39,.18,gold,0,2.5,z,g,20);bd.rotation.x=Math.PI/2;});
    cyl(.55,.4,1.8,blk,0,4.5,7.4,g);cyl(.75,.55,.5,red,0,5.5,7.4,g);sph(.7,gold,0,3.8,3.5,g);cyl(.35,.35,.9,gold,0,4.0,.6,g);
    box(3.1,3.2,4.6,red,0,2.9,-6.2,g);box(3.5,.3,5.4,blk,0,4.65,-6.2,g);box(3.14,1.1,2.4,glass,0,3.6,-6.2,g);
    box(3.0,.3,13,red,0,1.2,2,g);const cc=cyl(0,1.7,2.2,red,0,.75,9.6,g,4);cc.rotation.x=Math.PI/2;cc.rotation.z=Math.PI/4;cc.scale.set(1,1,.62);
    sph(.3,GL('#fff4b8'),0,3.6,8.85,g);
    [-1.6,1.6].forEach(s=>{[-3,-0.4,2.2].forEach(z=>{const w=cyl(1.15,1.15,.35,red,s,1.15,z,g,18);w.rotation.z=Math.PI/2;});[5.4,7.2].forEach(z=>{const w=cyl(.6,.6,.35,red,s,.6,z,g,14);w.rotation.z=Math.PI/2;});box(.2,.25,6.4,M('#b9bec6',{metalness:1,roughness:.3}),s*1.12,1.15,-.4,g);});
    g.userData.stack=new V3(0,5.9,7.4);
  }else if(type==='tender'){
    const blk=M('#17191d',{roughness:.3,metalness:.6});box(3,2.2,9,blk,0,2,0,g);box(2.5,.7,7.5,M('#0c0c0d',{roughness:1}),0,3.2,0,g);box(3.04,.25,9.04,M('#b3261f'),0,1.2,0,g);bogies(g,[2.6,-2.6]);
  }else if(type==='box'){
    box(3.1,3.2,18,M(col||'#9a3a2a',{roughness:.6,metalness:.2}),0,2.7,0,g);box(3.3,.25,18.4,M('#2f231d'),0,4.4,0,g);box(3.18,2.7,3.6,M('#3a2a22',{roughness:.7}),0,2.6,0,g);box(2.8,.5,18,dark,0,1.0,0,g);bogies(g);
  }else if(type==='tank'){
    const t=cyl(1.6,1.6,17,M(col||'#dfe1e6',{roughness:.3,metalness:.5}),0,2.8,0,g,20);t.rotation.x=Math.PI/2;cyl(.7,.7,.7,dark,0,4.6,0,g);box(2.8,.5,18,dark,0,1.0,0,g);bogies(g);
  }else if(type==='caboose'){
    const rd=M('#b8301f',{roughness:.5});box(3.1,3.0,13,rd,0,2.6,0,g);box(2.2,1.3,3.5,rd,0,4.6,0,g);box(2.24,.7,3.0,glass,0,4.7,0,g);box(3.3,.25,14,M('#4a1813'),0,4.15,0,g);box(3.14,.9,1.4,glass,0,3,3,g);box(3.14,.9,1.4,glass,0,3,-3,g);box(2.8,.5,15,dark,0,1.0,0,g);bogies(g,[4,-4]);
  }else if(type==='hsF'||type==='hsR'||type==='hsC'||type==='eloco'||type==='amc'){
    /* intercity electric trains: a high-speed tilting set and a regional with an electric engine */
    if(!CAR.ic){const T=(t)=>new THREE.MeshStandardMaterial({map:t,roughness:.3,metalness:.6}),flip=t=>{const c=t.clone();c.wrapS=THREE.RepeatWrapping;c.repeat.x=-1;c.offset.x=1;c.needsUpdate=true;return c;},six=(t,rf)=>[T(t),T(flip(t)),rf,M('#1f2126'),T(t),T(t)];
      const rfS=M('#b9bfc8',{roughness:.45,metalness:.6}),rfD=M('#565c66',{roughness:.6,metalness:.4});
      const hs=cvs(1024,160,(g,w,h)=>{steel(g,w,h);g.fillStyle='rgba(255,255,255,.28)';g.fillRect(0,0,w,h);g.fillStyle='#16324f';g.fillRect(0,h*.2,w,h*.3);g.fillStyle='#0f7fa8';g.fillRect(0,h*.52,w,h*.05);g.fillStyle='#b8242a';g.fillRect(0,h*.86,w,h*.04);
        for(let x=70;x<w-90;x+=92){glassFill(g,h*.23,h*.22);rr(g,x,h*.23,72,h*.22,10);g.fill();}[16,w-56].forEach(x=>{g.strokeStyle='#7d838d';g.lineWidth=3;g.strokeRect(x,h*.12,40,h*.78);});grime(g,w,h);});
      const hp=cvs(1024,160,(g,w,h)=>{steel(g,w,h);g.fillStyle='rgba(255,255,255,.28)';g.fillRect(0,0,w,h);g.fillStyle='#16324f';g.fillRect(0,h*.2,w,h*.3);g.fillStyle='#0f7fa8';g.fillRect(0,h*.52,w,h*.05);g.fillStyle='#b8242a';g.fillRect(0,h*.86,w,h*.04);
        for(let x=120;x<w-120;x+=150){g.fillStyle='#2a3038';for(let k=0;k<7;k++)g.fillRect(x,h*.6+k*5,96,2.5);}grime(g,w,h);});
      const am=cvs(1024,160,(g,w,h)=>{steel(g,w,h);for(let y=0;y<h;y+=7){g.fillStyle=y%14?'rgba(255,255,255,.16)':'rgba(0,0,0,.14)';g.fillRect(0,y,w,3);}g.fillStyle='#1b3f77';g.fillRect(0,h*.22,w,h*.27);g.fillStyle='#b8242a';g.fillRect(0,h*.5,w,h*.045);g.fillStyle='#f4f5f7';g.fillRect(0,h*.55,w,h*.03);
        for(let x=110;x<w-130;x+=66){glassFill(g,h*.26,h*.18);rr(g,x,h*.26,46,h*.18,8);g.fill();}[20,w-68].forEach(x=>{g.strokeStyle='#5d636d';g.lineWidth=3;g.strokeRect(x,h*.1,46,h*.82);glassFill(g,h*.2,h*.2);g.fillRect(x+10,h*.2,26,h*.2);});grime(g,w,h);});
      const el=cvs(1024,160,(g,w,h)=>{g.fillStyle='#d9dde3';g.fillRect(0,0,w,h);g.fillStyle='#1b3f77';g.fillRect(0,h*.08,w,h*.5);g.fillStyle='#b8242a';g.fillRect(0,h*.6,w,h*.06);g.fillStyle='#2a3038';[[200,150],[440,150],[680,150]].forEach(q=>{for(let k=0;k<8;k++)g.fillRect(q[0],h*.16+k*6,q[1],3);});
        [30,w-110].forEach(x=>{glassFill(g,h*.14,h*.26);rr(g,x,h*.14,80,h*.26,8);g.fill();});grime(g,w,h);});
      const end=cvs(128,128,(g,w,h)=>{steel(g,w,h);g.strokeStyle='#555b65';g.lineWidth=3;g.strokeRect(w*.3,h*.12,w*.4,h*.8);grime(g,w,h);});
      CAR.ic={hs:six(hs,rfS),hp:six(hp,rfS),am:six(am,rfS),el:six(el,rfD)};[CAR.ic.hs,CAR.ic.hp,CAR.ic.am,CAR.ic.el].forEach(a=>{a[4]=T(end);a[5]=a[4];a.forEach(m=>{if(CAR.all&&CAR.all.indexOf(m)<0)CAR.all.push(m);});});}
    const gm=M('#3a3f48',{roughness:.5,metalness:.8}),panto=(z,up)=>{box(1.5,.18,2.6,gm,0,4.45,z,g);if(!up){box(.1,.1,2.4,gm,0,4.62,z,g);return;}const a=box(.1,.1,1.9,gm,0,5.0,z-.35,g);a.rotation.x=-.75;const b=box(.1,.1,1.9,gm,0,5.75,z-.35,g);b.rotation.x=.75;box(2.1,.09,.28,gm,0,6.38,z+.3,g);[-.7,.7].forEach(x=>box(.3,.3,.3,M('#8a4a2a'),x,4.65,z+.9,g));};
    const skirt=M('#7e8593',{metalness:.5,roughness:.5}),wh=M('#e9edf2',{roughness:.22,metalness:.45}),navy=M('#16324f',{roughness:.3,metalness:.4});
    if(type==='hsC'){box(3.2,3.1,20.8,CAR.ic.hs,0,2.55,0,g);const r=new THREE.Mesh(CAR.roofG(20.8),CAR.ic.hs[2]);r.position.y=4.1;g.add(r);box(2.95,.6,19.6,skirt,0,.95,0,g);[10.5,-10.5].forEach(z=>box(2.6,2.6,.5,dark,0,2.5,z,g));bogies(g);}
    else if(type==='hsF'||type==='hsR'){const s=type==='hsR'?-1:1;box(3.2,3.1,13,CAR.ic.hp,0,2.55,-3.9*s,g);const r=new THREE.Mesh(CAR.roofG(13),CAR.ic.hp[2]);r.position.set(0,4.1,-3.9*s);g.add(r);
      const n=sph(1,wh,0,2.3,2.2*s,g);n.scale.set(1.6,1.32,8.3);const nb=sph(1,navy,0,2.75,2.0*s,g);nb.scale.set(1.615,.5,7.6);const cw=sph(1,glass,0,3.2,4.3*s,g);cw.scale.set(1.12,.56,2.5);
      box(2.5,.8,2.4,skirt,0,.9,6.6*s,g);[.75,-.75].forEach(x=>{sph(.2,GL(s>0?'#fff4b8':'#ff3b30'),x,1.75,9.55*s,g);});sph(.17,GL(s>0?'#fff4b8':'#7a1512'),0,3.85,6.5*s,g);
      box(2.95,.6,18,skirt,0,.95,-1.2*s,g);panto(-6*s,s<0);[-1,-3.6].forEach(z=>box(1.8,.35,1.6,gm,0,4.4,z*s,g));bogies(g);}
    else if(type==='amc'){box(3.2,3.25,20.6,CAR.ic.am,0,2.55,0,g);const r=new THREE.Mesh(CAR.roofG(20.6),CAR.ic.am[2]);r.position.y=4.18;g.add(r);[-6,6].forEach(z=>box(1.5,.25,2.2,dark,0,4.7,z,g));box(2.8,.5,19,dark,0,1.05,0,g);box(1.6,.7,4,dark,0,.75,0,g);[10.5,-10.5].forEach(z=>box(.4,.4,.8,dark,0,.9,z,g));bogies(g);}
    else{box(3.2,3.2,15.2,CAR.ic.el,0,2.6,0,g);[1,-1].forEach(s=>{const cab=box(3.2,3.2,2.6,M('#1b3f77',{roughness:.3,metalness:.5}),0,2.6,8.7*s,g);cab.rotation.x=-.16*s;const w=box(2.7,1.0,.2,glass,0,3.55,9.85*s,g);w.rotation.x=-.16*s;box(3.24,.2,2.7,M('#b8242a'),0,1.75,8.75*s,g);});
      const r=new THREE.Mesh(CAR.roofG(17),CAR.ic.el[2]);r.position.y=4.2;g.add(r);[.95,-.95].forEach(x=>{sph(.22,GL('#fff4b8'),x,1.6,10.12,g);sph(.14,GL('#ff3b30'),x,1.25,10.12,g);});sph(.2,GL('#fff4b8'),0,4.45,9.55,g);
      box(2.8,.5,18.5,dark,0,1.05,0,g);box(2.6,.9,.5,dark,0,.85,10.2,g);box(.4,.4,.9,dark,0,.9,10.6,g);[-2.5,2.5].forEach(z=>box(2,.5,2.4,gm,0,4.45,z,g));panto(5.6,true);panto(-5.6,false);bogies(g);}
  }else{
    const wh=M('#eef1f5',{roughness:.22,metalness:.3}),blue=M('#1b5fc0',{roughness:.3,metalness:.3});
    if(type==='bulletmid'){box(3.2,3.1,20.8,wh,0,2.55,0,g);box(3.26,.8,18.5,glass,0,3.1,0,g);box(3.28,.35,20.84,blue,0,2.2,0,g);}
    else{const s=type==='bulletT'?-1:1;box(3.2,3.1,12,wh,0,2.55,-4.4*s,g);const n=sph(1,wh,0,2.25,1.6*s,g);n.scale.set(1.6,1.25,8.6);const cw=sph(1,glass,0,3.05,3.2*s,g);cw.scale.set(1.15,.62,3.2);
      box(3.26,.8,9.5,glass,0,3.1,-5.2*s,g);box(3.28,.35,12.04,blue,0,2.2,-4.4*s,g);[.7,-.7].forEach(x=>sph(.25,GL('#fff4b8'),x,1.7,9.6*s,g));}
    box(2.9,.6,19.5,M('#7e8593',{metalness:.5,roughness:.5}),0,.95,0,g);bogies(g);
  }
  return shadowize(g);
}
class Consist{
  constructor(types,scale,parent){this.s=scale;this.cars=types.map(t=>{const c=makeCar(t);c.scale.setScalar(scale);parent.add(c);return c;});this.grp=parent;}
  place(posFn,d,dir,y){dir=dir||1;const s=this.s;this.cars.forEach((c,i)=>{const cd=d-dir*(10+i*22)*s,a=posFn(cd+dir*7*s,0),b=posFn(cd-dir*7*s,0);c.position.set((a.x+b.x)/2,y+((a.y||0)+(b.y||0))/2,(a.z+b.z)/2);a.y=(a.y||0)+y;c.lookAt(a);});}
  remove(){this.cars.forEach(c=>this.grp.remove(c));}
}
let fusTex=null;
function makePlane(tail){
  const g=new THREE.Group(),gg=new THREE.Group(),wh=M('#f2f4f7',{roughness:.25,metalness:.25,side:THREE.DoubleSide}),tc=M(tail||'#1f5fbf',{roughness:.3,metalness:.2}),gr=M('#9aa1ac',{roughness:.3,metalness:.9});
  g.add(gg);g.userData.gear=gg;
  if(!fusTex)fusTex=cvs(256,1024,(c,w,h)=>{c.fillStyle='#f3f5f8';c.fillRect(0,0,w,h);c.fillStyle='#d6dae0';c.fillRect(0,0,w*.1,h);c.fillRect(w*.9,0,w*.1,h);
    const vy=y=>(1-(y+22)/41)*h;c.fillStyle='#1a2430';for(let y=-11;y<=11.5;y+=.95)[.293,.707].forEach(u=>{rr(c,w*u-3,vy(y)-5,6,9,2);c.fill();});
    c.fillStyle='#2a63b8';[.225,.775].forEach(u=>c.fillRect(w*u-2,vy(14),4,vy(-16)-vy(14)));
    c.fillStyle='#121a24';[[.34,.42],[.43,.495],[.505,.57],[.58,.66]].forEach(p=>{c.beginPath();c.moveTo(w*p[0],vy(15.2));c.lineTo(w*p[1],vy(15.2));c.lineTo(w*(p[1]-.008),vy(16.5));c.lineTo(w*(p[0]+.008),vy(16.5));c.closePath();c.fill();});
    [.293,.707].forEach(u=>{c.strokeStyle='#8a9099';c.lineWidth=1.5;c.strokeRect(w*u-6,vy(13)-10,12,22);c.strokeRect(w*u-6,vy(-13)-10,12,22);});});
  const prof=[[-22,.05],[-21.5,.55],[-18,1.15],[-13,1.72],[-8,2],[10,2],[13,1.9],[15.5,1.6],[17.4,1.1],[18.6,.5],[19,.02]],pts=[];
  for(let i=0;i<=40;i++){const y=-22+41*i/40;let k=0;while(k<prof.length-2&&prof[k+1][0]<y)k++;const a=prof[k],b=prof[k+1],t=clamp((y-a[0])/(b[0]-a[0]),0,1),s=t*t*(3-2*t);pts.push(new THREE.Vector2(Math.max(.02,a[1]+(b[1]-a[1])*s),y));}
  const fg=new THREE.LatheGeometry(pts,28);fg.rotateX(Math.PI/2);g.add(new THREE.Mesh(fg,new THREE.MeshStandardMaterial({map:fusTex,roughness:.25,metalness:.25})));
  const wingG=(()=>{const s=new THREE.Shape();s.moveTo(1.2,4.2);s.lineTo(17.5,-4.6);s.lineTo(17.5,-6.6);s.lineTo(6,-3.4);s.lineTo(1.2,-3.2);s.closePath();const e=new THREE.ExtrudeGeometry(s,{depth:.5,bevelEnabled:false});e.rotateX(Math.PI/2);return e;})();
  [1,-1].forEach(s=>{const w=new THREE.Mesh(wingG,wh);w.scale.x=s;w.position.set(0,-.55,0);w.rotation.z=s*.07;g.add(w);
    const wl=box(.25,2,1.8,tc,s*17.6,1.5,-5.3,g);wl.rotation.z=-s*.15;wl.rotation.x=-.3;
    const e=cyl(1.1,.95,4.6,gr,s*6.3,-1.75,1.6,g,18);e.rotation.x=Math.PI/2;const ei=cyl(.9,.9,.1,M('#0c0e11'),s*6.3,-1.75,3.92,g,18);ei.rotation.x=Math.PI/2;box(.35,1,2.6,wh,s*6.3,-.9,.6,g);
    const st=new THREE.Mesh(wingG,wh);st.scale.set(s*.4,.7,.42);st.position.set(0,1,-18.6);g.add(st);
    box(.3,1.7,.3,gr,s*2.6,-2.3,-1.5,gg);[-.5,.5].forEach(dz=>{const t=cyl(.65,.65,.5,M('#141414',{roughness:.9}),s*2.6,-2.9,-1.5+dz*1.5,gg,14);t.rotation.z=Math.PI/2;});});
  const fin=(()=>{const s=new THREE.Shape();s.moveTo(-15.5,1.2);s.lineTo(-21,9.2);s.lineTo(-23.2,9.2);s.lineTo(-21.6,1.2);s.closePath();const e=new THREE.ExtrudeGeometry(s,{depth:.4,bevelEnabled:false});e.rotateY(-Math.PI/2);e.translate(.2,0,0);return e;})();
  g.add(new THREE.Mesh(fin,M(tail||'#1f5fbf',{roughness:.3,metalness:.2,side:THREE.DoubleSide})));
  box(.3,2,.3,gr,0,-2.2,12,gg);const nw=cyl(.5,.5,.5,M('#141414',{roughness:.9}),0,-3.05,12,gg,14);nw.rotation.z=Math.PI/2;
  return shadowize(g);
}

/* ---------- sound ---------- */
let AC=null,master,eng,noiseBuf,muted=false;
function audioInit(){if(AC){if(AC.state==='suspended')AC.resume();return;}try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){AC=null;return;}
  master=AC.createGain();master.gain.value=muted?0:.8;master.connect(AC.destination);
  noiseBuf=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const n=AC.createBufferSource();n.buffer=noiseBuf;n.loop=true;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=200;const g=AC.createGain();g.gain.value=0;n.connect(f);f.connect(g);g.connect(master);n.start();
  const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=40;const of=AC.createBiquadFilter();of.type='lowpass';of.frequency.value=260;const og=AC.createGain();og.gain.value=0;o.connect(of);of.connect(og);og.connect(master);o.start();
  eng={f,g,o,og};}
function engine(ng,cut,ogain,freq){if(!AC)return;const t=AC.currentTime;eng.g.gain.setTargetAtTime(ng,t,.15);eng.f.frequency.setTargetAtTime(cut,t,.15);eng.og.gain.setTargetAtTime(ogain,t,.15);eng.o.frequency.setTargetAtTime(freq,t,.15);}
function tone(freq,dur,type,vol,when){if(!AC)return;const t=AC.currentTime+(when||0),o=AC.createOscillator(),g=AC.createGain(),f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=2600;o.type=type||'sine';o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.2,t+.03);g.gain.setValueAtTime(vol||.2,t+dur*.6);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(f);f.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.05);}
function puff(vol,dur,cut){if(!AC)return;const t=AC.currentTime,n=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();n.buffer=noiseBuf;f.type='bandpass';f.frequency.value=cut||900;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);n.connect(f);f.connect(g);g.connect(master);n.start(t,Math.random());n.stop(t+dur+.05);}
const snd={horn(){[277,330,415].forEach(f=>tone(f,1.2,'sawtooth',.1));},bell(){tone(1320,.45,'sine',.16);tone(1975,.35,'sine',.07);},ding(){tone(880,.16,'sine',.22);tone(1320,.35,'sine',.22,.13);},
  whistle(){[587,740,880].forEach(f=>tone(f,.95,'triangle',.12));},fanfare(){[523,659,784,1047,784,1047].forEach((f,i)=>tone(f,.28,'triangle',.2,i*.14));},chime(){tone(659,.4,'sine',.2);tone(523,.6,'sine',.2,.35);}};
function say(t){try{if(muted||!window.speechSynthesis)return;const u=new SpeechSynthesisUtterance(t);u.rate=.95;u.pitch=1.05;speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){}}

/* ---------- UI bits ---------- */
let stars=0;try{stars=+(localStorage.getItem('btp-stars')||0)||0;}catch(e){}
function addStar(n){stars+=n||1;$('sc').textContent=stars;try{localStorage.setItem('btp-stars',stars);}catch(e){}}
$('sc').textContent=stars;
let msgT=0;function msg(t,ms){const m=$('msg');m.textContent=t;m.style.opacity=1;clearTimeout(msgT);msgT=setTimeout(()=>m.style.opacity=0,ms||3500);}
function confetti(){const e=['⭐','🎉','🎈','🚆','✈️','💜','🌟'];for(let i=0;i<34;i++){const s=document.createElement('span');s.className='cf';s.textContent=e[i%e.length];s.style.left=Math.random()*96+'%';s.style.animationDelay=Math.random()*.9+'s';document.body.appendChild(s);setTimeout(()=>s.remove(),3800);}}
function Lever(el){const o={v:0},k=el.querySelector('.knob');
  o.set=v=>{o.v=clamp(v,0,1);k.style.bottom=o.v*(el.clientHeight-68)+'px';};
  const ev=e=>{const r=el.getBoundingClientRect();o.set(1-(e.clientY-r.top-34)/(r.height-68));e.preventDefault();};
  el.addEventListener('pointerdown',e=>{audioInit();try{el.setPointerCapture(e.pointerId);}catch(x){}o.drag=e.pointerId;ev(e);});
  el.addEventListener('pointermove',e=>{if(o.drag===e.pointerId)ev(e);});
  const up=e=>{if(o.drag===e.pointerId)o.drag=null;};el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);return o;}
const levT=Lever($('levT')),levF=Lever($('levF'));
const joy={x:0,y:0,id:null};(function(){const el=$('joy'),k=el.querySelector('.knob');
  const set=(x,y)=>{joy.x=x;joy.y=y;k.style.transform='translate('+x*44+'px,'+(-y*44)+'px)';};
  const ev=e=>{const r=el.getBoundingClientRect();let x=(e.clientX-r.left-r.width/2)/55,y=-(e.clientY-r.top-r.height/2)/55;const l=Math.hypot(x,y);if(l>1){x/=l;y/=l;}set(x,y);e.preventDefault();};
  el.addEventListener('pointerdown',e=>{audioInit();try{el.setPointerCapture(e.pointerId);}catch(x){}joy.id=e.pointerId;ev(e);});
  el.addEventListener('pointermove',e=>{if(joy.id===e.pointerId)ev(e);});
  const up=e=>{if(joy.id===e.pointerId){joy.id=null;set(0,0);}};el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);joy.set=set;})();
const keys={},keyTap={};let kbSeen=false;const kn=e=>e.key.length===1?e.key.toLowerCase():e.key;
addEventListener('keydown',e=>{const k=kn(e);if(/^Arrow|^ $|^Page/.test(k))e.preventDefault();if(!kbSeen){kbSeen=true;document.body.classList.add('kb');}if(!e.repeat&&keyTap[k]){audioInit();keyTap[k](e);}keys[k]=1;});
addEventListener('keyup',e=>{keys[kn(e)]=0;});addEventListener('blur',()=>{for(const k in keys)keys[k]=0;});
/* smoothed keyboard stick so a key press is a gentle push, not full deflection */
const kst={x:0,y:0};function keyStick(dt){const tx=((keys.ArrowRight||keys.d)?1:0)-((keys.ArrowLeft||keys.a)?1:0),ty=(keys.ArrowUp?1:0)-(keys.ArrowDown?1:0),f=keys.Shift?1:.62;
  kst.x+=clamp(tx*f-kst.x,-dt*(tx?2.2:5),dt*(tx?2.2:5));kst.y+=clamp(ty*f-kst.y,-dt*(ty?2.2:5),dt*(ty?2.2:5));return kst;}

