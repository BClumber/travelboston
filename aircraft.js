'use strict';
/* ---------- small aircraft + helicopter (front = +z, origin at fuselage centre) ---------- */
function fuse(prof,seg,mat){const pts=[],y0=prof[0][0],y1=prof[prof.length-1][0];for(let i=0;i<=36;i++){const y=y0+(y1-y0)*i/36;let k=0;while(k<prof.length-2&&prof[k+1][0]<y)k++;const a=prof[k],b=prof[k+1],t=clamp((y-a[0])/(b[0]-a[0]),0,1),s=t*t*(3-2*t);pts.push(new THREE.Vector2(Math.max(.02,a[1]+(b[1]-a[1])*s),y));}const g=new THREE.LatheGeometry(pts,seg||24);g.rotateX(Math.PI/2);return new THREE.Mesh(g,mat);}
function fuseTex(y0,y1,w0,w1,ck0,ck1,stripe,step){return cvs(256,512,(c,w,h)=>{c.fillStyle='#f3f5f8';c.fillRect(0,0,w,h);c.fillStyle='#d6dae0';c.fillRect(0,0,w*.1,h);c.fillRect(w*.9,0,w*.1,h);const vy=y=>(1-(y-y0)/(y1-y0))*h;
  c.fillStyle=stripe;[.2,.8].forEach(u=>c.fillRect(w*u-7,vy(y1-.6),14,vy(y0+.8)-vy(y1-.6)));c.fillStyle='#16202c';for(let y=w0;y<=w1;y+=step)[.3,.7].forEach(u=>{rr(c,w*u-7,vy(y)-7,14,14,4);c.fill();});
  [[.33,.49],[.51,.67]].forEach(p=>{c.beginPath();c.moveTo(w*p[0],vy(ck0));c.lineTo(w*p[1],vy(ck0));c.lineTo(w*(p[1]-.02),vy(ck1));c.lineTo(w*(p[0]+.02),vy(ck1));c.closePath();c.fill();});[.24,.76].forEach(u=>c.fillRect(w*u-9,vy(ck0+.1),18,vy(ck0-.5)-vy(ck0+.1)));});}
function wingGeo(pts,th){const s=new THREE.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();const e=new THREE.ExtrudeGeometry(s,{depth:th,bevelEnabled:false});e.rotateX(Math.PI/2);return e;}
function finGeo(pts,th){const s=new THREE.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();const e=new THREE.ExtrudeGeometry(s,{depth:th,bevelEnabled:false});e.rotateY(-Math.PI/2);e.translate(th/2,0,0);return e;}
function wheel(parent,x,y,z,r){const t=cyl(r,r,r*.7,M('#141414',{roughness:.9}),x,y,z,parent,12);t.rotation.z=Math.PI/2;return t;}
function propeller(parent,x,y,z,r){const g=new THREE.Group();g.position.set(x,y,z);for(let i=0;i<3;i++){const b=box(.16,r,.04,M('#22262c',{roughness:.5}),0,r/2,0,g);b.position.set(Math.sin(i*2.094)*r/2,Math.cos(i*2.094)*r/2,0);b.rotation.z=-i*2.094;}
  const d=new THREE.Mesh(new THREE.CircleGeometry(r,20),new THREE.MeshBasicMaterial({color:0x9aa0a8,transparent:true,opacity:.22,side:THREE.DoubleSide,depthWrite:false}));g.add(d);const sp=cyl(0,.2,.45,M('#d0d4da',{metalness:.9,roughness:.3}),0,0,.2,g,12);sp.rotation.x=Math.PI/2;parent.add(g);return g;}
let propTex=null,jetTex=null;
function makeProp(col){
  const g=new THREE.Group(),gg=new THREE.Group(),wh=M('#f2f4f7',{roughness:.3,metalness:.2,side:THREE.DoubleSide}),tc=M(col,{roughness:.35,metalness:.2,side:THREE.DoubleSide}),gr=M('#9aa1ac',{roughness:.35,metalness:.8});g.add(gg);
  propTex=propTex||fuseTex(-5.6,5.4,-1.6,2,3.0,3.7,'#0a8fa0',.9);
  g.add(fuse([[-5.6,.05],[-5.2,.25],[-3,.55],[-1,.8],[2.2,.82],[3.6,.7],[4.6,.42],[5.2,.15],[5.4,.02]],20,new THREE.MeshStandardMaterial({map:propTex,roughness:.3,metalness:.2})));
  const wg=wingGeo([[.5,1.5],[6.7,.5],[6.7,-.55],[.5,-1.0]],.2),props=[];
  [1,-1].forEach(s=>{const w=new THREE.Mesh(wg,wh);w.scale.x=s;w.position.y=-.4;w.rotation.z=s*.08;g.add(w);const n=cyl(.42,.34,2.6,wh,s*2.3,-.28,.9,g,14);n.rotation.x=Math.PI/2;box(.86,.14,2.4,tc,s*2.3,-.28,.9,g);props.push(propeller(g,s*2.3,-.28,2.25,1.0));
    const st=new THREE.Mesh(wg,wh);st.scale.set(s*.38,.8,.5);st.position.set(0,.5,-4.6);g.add(st);box(.1,.9,.1,gr,s*2.3,-.9,.6,gg);wheel(gg,s*2.3,-1.27,.6,.28);});
  g.add(new THREE.Mesh(finGeo([[-3.5,.45],[-5.0,2.5],[-5.6,2.5],[-5.3,.3]],.14),tc));box(.1,.9,.1,gr,0,-.85,3.9,gg);wheel(gg,0,-1.3,3.9,.25);
  g.userData={gear:gg,props};return shadowize(g);
}
function makeJet(col){
  const g=new THREE.Group(),gg=new THREE.Group(),wh=M('#f4f5f7',{roughness:.2,metalness:.3,side:THREE.DoubleSide}),tc=M(col,{roughness:.3,metalness:.3,side:THREE.DoubleSide}),gr=M('#9aa1ac',{roughness:.3,metalness:.9});g.add(gg);
  jetTex=jetTex||fuseTex(-9.5,9.5,-3,3.6,5.4,6.5,'#1b2a4a',1.1);
  g.add(fuse([[-9.5,.05],[-9,.3],[-6,.8],[-3,1.05],[4,1.05],[6.5,.85],[8.2,.5],[9.2,.15],[9.5,.02]],24,new THREE.MeshStandardMaterial({map:jetTex,roughness:.2,metalness:.3})));
  const wg=wingGeo([[.8,1.4],[8.3,-2.9],[8.3,-3.9],[3,-1.7],[.8,-1.8]],.22);
  [1,-1].forEach(s=>{const w=new THREE.Mesh(wg,wh);w.scale.x=s;w.position.y=-.65;w.rotation.z=s*.06;g.add(w);const wl=box(.1,1.2,1,tc,s*8.35,.1,-3.5,g);wl.rotation.z=-s*.2;
    const e=cyl(.55,.48,3,wh,s*1.75,.5,-4.6,g,16);e.rotation.x=Math.PI/2;const ei=cyl(.45,.45,.06,M('#0c0e11'),s*1.75,.5,-3.08,g,16);ei.rotation.x=Math.PI/2;box(.7,.16,1.6,wh,s*1.2,.5,-4.6,g);
    const st=new THREE.Mesh(wg,wh);st.scale.set(s*.4,.8,.42);st.position.set(0,4.15,-8.6);g.add(st);box(.12,1,.12,gr,s*1.3,-1.1,-1,gg);wheel(gg,s*1.3,-1.42,-1,.28);});
  g.add(new THREE.Mesh(finGeo([[-6.2,.8],[-9.1,4.2],[-10.2,4.2],[-8.9,.7]],.16),tc));box(.12,1,.12,gr,0,-1.05,6.8,gg);wheel(gg,0,-1.45,6.8,.25);
  g.userData={gear:gg,props:[]};return shadowize(g);
}
function makeHeli(col){
  const g=new THREE.Group(),bc=M(col,{roughness:.3,metalness:.3}),gl=new THREE.MeshStandardMaterial({color:C('#1a2a3a'),roughness:.05,metalness:.9,transparent:true,opacity:.55}),dk=M('#22262c',{roughness:.5,metalness:.6});
  const b=sph(1,bc,0,0,-.4,g);b.scale.set(1.25,1.25,2.0);const n=sph(1,gl,0,.08,.9,g);n.scale.set(1.2,1.12,1.5);box(1.5,.14,2.6,M('#f2f4f7'),0,-.5,-.4,g);
  const bm=cyl(.3,.15,5.6,bc,0,.45,-4.9,g,12);bm.rotation.x=-Math.PI/2;g.add(new THREE.Mesh(finGeo([[-6.6,.3],[-7.8,2],[-8.2,2],[-7.7,.2]],.1),bc));box(1.8,.08,.5,bc,0,.5,-7.2,g);
  cyl(.12,.12,.8,dk,0,1.55,-.4,g,8);const rotor=new THREE.Group();rotor.position.set(0,1.95,-.4);[0,Math.PI/2].forEach(a=>{const bl=box(.34,.05,10.4,dk,0,0,0,rotor);bl.rotation.y=a;});
  const rd=new THREE.Mesh(new THREE.CircleGeometry(5.2,28),new THREE.MeshBasicMaterial({color:0x8a9098,transparent:true,opacity:.16,side:THREE.DoubleSide,depthWrite:false}));rd.rotation.x=-Math.PI/2;rotor.add(rd);g.add(rotor);
  const tr=new THREE.Group();tr.position.set(.22,1.1,-7.7);[0,Math.PI/2].forEach(a=>{const bl=box(.05,1.9,.2,dk,0,0,0,tr);bl.rotation.x=a;});g.add(tr);
  [1,-1].forEach(s=>{const sk=cyl(.07,.07,4.2,dk,s*1.15,-1.55,-.2,g,8);sk.rotation.x=Math.PI/2;[.9,-1.3].forEach(z=>{const l=box(.07,1,.07,dk,s*.95,-1.1,z,g);l.rotation.z=s*.35;});});
  sph(.14,GL('#ff3b30'),0,-.75,-1,g);g.userData={rotor,trotor:tr,props:[]};return shadowize(g);
}
