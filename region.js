'use strict';
/* =====================================================================
   AIRPORTS + THE COUNTRY BETWEEN BOSTON AND PROVIDENCE
   ===================================================================== */
const APT={},STAD=[-3010,7300],NWD=flatP(R128+430,640),NOROAD=[[-4050,14500,560],[STAD[0],STAD[1],150]];
const LAKES=[[-1880,5750,210,330],[-3420,8800,260,150],[-1300,9200,330,220],[-4300,6600,200,280],[-600,7400,180,260],[-2100,10900,150,240],[400,11500,300,200]];
/* real places pinned onto this compressed map: lat, lon -> world x,z */
const GEO=(()=>{const bh=flatP(R128+330,-1180),ov=flatP(R128-215,2.5),v9=flatP(338,2.5),st=(i)=>rpos(STN[i].d,0),ms=i=>spos(PST[i].s,0),fh=rpos(FHd,0);
  const A=[[42.3523,-71.0552,0,75],[42.3473,-71.0753,st(1).x,st(1).z],[42.3364,-71.0892,st(2).x,st(2).z],[42.3005,-71.1139,fh.x,fh.z],[42.2553,-71.1253,st(3).x,st(3).z],[42.2103,-71.1470,st(4).x,st(4).z],[42.1632,-71.1536,st(5).x,st(5).z],[42.1570,-71.1466,st(6).x,st(6).z],[42.1242,-71.1033,st(7).x,st(7).z],
    [42.1247,-71.1840,ms(0).x,ms(0).z],[42.0327,-71.2196,ms(1).x,ms(1).z],[41.9422,-71.2850,ms(2).x,ms(2).z],[41.8290,-71.4133,ms(3).x,ms(3).z],[42.3656,-71.0096,1100,-600],[41.7240,-71.4283,-4050,14500],[42.1905,-71.1729,NWD.x-50,NWD.z+60],[42.2118,-71.1142,bh.x,bh.z],[42.0909,-71.2643,STAD[0],STAD[1]],[42.2133,-71.1465,ov.x,ov.z],[42.3445,-71.0625,v9.x,v9.z],[42.3688,-71.0632,-250,-1000],[42.3588,-71.0638,-420,-560],[42.3591,-71.0533,60,-560],[42.3493,-71.0751,-700,150]];
  const n=A.length,U=A.map(a=>[1,a[0]-42.1,(a[1]+71.2)*.74]),S=[[0,0,0],[0,0,0],[0,0,0]],bx=[0,0,0],bz=[0,0,0];U.forEach((u,i)=>{for(let r=0;r<3;r++){for(let c=0;c<3;c++)S[r][c]+=u[r]*u[c];bx[r]+=u[r]*A[i][2];bz[r]+=u[r]*A[i][3];}});
  const det=m=>m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]),D=det(S),sol=b=>[0,1,2].map(k=>det(S.map((row,r)=>row.map((v,c)=>c===k?b[r]:v)))/D),cx=sol(bx),cz=sol(bz);
  const base=u=>[cx[0]+cx[1]*u[1]+cx[2]*u[2],cz[0]+cz[1]*u[1]+cz[2]*u[2]],R=U.map((u,i)=>{const b=base(u);return [A[i][2]-b[0],A[i][3]-b[1]];});
  return (lat,lon)=>{const u=[1,lat-42.1,(lon+71.2)*.74],b=base(u);let sw=0,rx=0,rz=0;for(let i=0;i<n;i++){const d2=(u[1]-U[i][1])**2+(u[2]-U[i][2])**2,w=1/(d2*d2+1e-10);sw+=w;rx+=w*R[i][0];rz+=w*R[i][1];}return [b[0]+rx/sw,b[1]+rz/sw];};})();
const ROADS=[
 ['I-93',26,[[42.3530,-71.0600],[42.3445,-71.0625],[42.3300,-71.0560],[42.3110,-71.0500],[42.2850,-71.0420],[42.2500,-71.0300],[42.2150,-71.0200],[42.2130,-71.0500],[42.1960,-71.0680],[42.2030,-71.0900],[42.2040,-71.1200],[42.2085,-71.1380],[42.2133,-71.1465]]],
 ['I-95 / 128',26,[[42.2133,-71.1465],[42.2220,-71.1600],[42.2320,-71.1780],[42.2620,-71.2050],[42.2850,-71.2150],[42.3380,-71.2620]]],
 ['I-95',26,[[42.2085,-71.1420],[42.1980,-71.1500],[42.1860,-71.1600],[42.1650,-71.1700],[42.1350,-71.1950],[42.1200,-71.2100],[42.0730,-71.2450],[42.0300,-71.2620],[41.9750,-71.3000],[41.9400,-71.3300],[41.9250,-71.3450],[41.8750,-71.3800],[41.8250,-71.4150],[41.7800,-71.4200],[41.7350,-71.4450],[41.6800,-71.4800]]],
 ['ROUTE 1',14,[[42.2800,-71.1500],[42.2450,-71.1700],[42.2200,-71.1850],[42.2000,-71.1900],[42.1900,-71.1950],[42.1500,-71.2150],[42.0920,-71.2680],[42.0300,-71.3100],[41.9750,-71.3350],[41.8800,-71.3850],[41.8300,-71.4100]]],
 ['ROUTE 24',22,[[42.1960,-71.0680],[42.1700,-71.0660],[42.1400,-71.0650],[42.1000,-71.0600],[42.0200,-71.0500],[41.9400,-71.0600],[41.8500,-71.1000]]],
 ['ROUTE 138',12,[[42.2670,-71.0930],[42.2400,-71.1050],[42.2150,-71.1150],[42.1900,-71.1250],[42.1700,-71.1320],[42.1570,-71.1450],[42.1400,-71.1250],[42.1250,-71.1000],[42.0800,-71.1000],[42.0300,-71.1000],[41.9300,-71.0700]]],
 ['ROUTE 27',12,[[42.0850,-71.0200],[42.1050,-71.0600],[42.1250,-71.1000],[42.1220,-71.1400],[42.1235,-71.1780],[42.1320,-71.2150],[42.1420,-71.2500],[42.1870,-71.3050]]],
 ['ROUTE 139',12,[[42.1250,-71.1000],[42.1400,-71.0750],[42.1600,-71.0450],[42.1500,-71.0100]]],
 ['ROUTE 28',12,[[42.2700,-71.0700],[42.2400,-71.0680],[42.2100,-71.0600],[42.1600,-71.0400],[42.0800,-71.0200]]],
 ['ROUTE 3',22,[[42.2150,-71.0200],[42.1950,-70.9800],[42.1800,-70.9500],[42.1200,-70.8500],[41.9500,-70.7000]]],
 ['MASS PIKE  I-90',26,[[42.3490,-71.0600],[42.3480,-71.0850],[42.3570,-71.1250],[42.3450,-71.2000],[42.3380,-71.2620],[42.3100,-71.4000]]],
 ['ROUTE 9',14,[[42.3320,-71.1100],[42.3250,-71.1600],[42.3200,-71.2100],[42.3000,-71.3500]]],
 ['I-495',26,[[41.8000,-70.7500],[41.9300,-70.9500],[41.9400,-71.0600],[41.9900,-71.1700],[42.0300,-71.2620],[42.0700,-71.4000],[42.1500,-71.5000]]],
 ['I-295',24,[[41.9400,-71.3300],[41.9700,-71.3700],[41.9600,-71.4200],[41.9000,-71.5200],[41.8200,-71.5100],[41.7600,-71.4700],[41.7100,-71.4700]]],
 ['I-195',24,[[41.8200,-71.4050],[41.8150,-71.3700],[41.8100,-71.3300],[41.7700,-71.2300],[41.7200,-71.1500]]],
 ['ROUTE 140',12,[[42.0650,-71.2500],[42.0300,-71.2200],[41.9700,-71.1900],[41.9000,-71.0900]]],
 ['ROUTE 123',12,[[41.9440,-71.2850],[41.9660,-71.1870],[42.0200,-71.1000],[42.0800,-71.0200]]],
 ['ROUTE 106',12,[[42.0330,-71.2190],[42.0250,-71.1500],[42.0200,-71.0500]]],
 ['ROUTE 109',12,[[42.2620,-71.2050],[42.2200,-71.2600],[42.1870,-71.3050]]],
 ['NEPONSET ST',9,[[42.1940,-71.2000],[42.1968,-71.1830],[42.1930,-71.1700],[42.1860,-71.1600],[42.1800,-71.1500],[42.1700,-71.1420]]],
 ['UNIVERSITY AVE',9,[[42.2180,-71.1560],[42.2103,-71.1500],[42.2000,-71.1540],[42.1900,-71.1560],[42.1800,-71.1500]]],
 ['WASHINGTON ST',9,[[42.2450,-71.1700],[42.2150,-71.1900],[42.1940,-71.2000],[42.1700,-71.2100],[42.1500,-71.2150]]],
 ['BLUE HILL AVE',10,[[42.3200,-71.0780],[42.2950,-71.0880],[42.2670,-71.0930]]],
 ['COLUMBIA RD',9,[[42.3300,-71.0560],[42.3150,-71.0650],[42.3050,-71.0800],[42.2950,-71.0880]]],
 ['VFW PKWY',10,[[42.3005,-71.1139],[42.2850,-71.1500],[42.2620,-71.1650],[42.2450,-71.1700]]],
 ['CENTRAL ST',9,[[42.1250,-71.1000],[42.1150,-71.1300],[42.1100,-71.1600],[42.1235,-71.1780]]],
 ['ROUTE 146',14,[[41.8300,-71.4150],[41.8800,-71.4350],[41.9600,-71.4700],[42.0500,-71.5400]]]];
function buildRoads(){
  const okR=(x,z)=>pip(x,z,MAIN)&&nearRoute(x,z)[0]>38&&nearMain(x,z)[0]>34&&NOROAD.every(c=>(x-c[0])**2+(z-c[1])**2>c[2]*c[2])&&hillH(x,z)<1&&LAKES.every(l=>((x-l[0])/(l[2]+14))**2+((z-l[1])/(l[3]+14))**2>1)&&Math.hypot(x-VC.x,z-VC.z)>VRA+20&&!(x>-700&&x<200&&z>-900&&z<-60);
  const mats={},mat=w=>mats[w]||(mats[w]=(()=>{const m=roadFlat.clone();m.map=roadTex.clone();m.map.needsUpdate=true;m.map.repeat.set(w>20?2:1,1);return m;})());
  ROADS.forEach(r=>{const pts=r[2].map(p=>{const q=GEO(p[0],p[1]);return new V3(q[0],0,q[1]);}),c=new THREE.CatmullRomCurve3(pts,false,'centripetal');c.arcLengthDivisions=pts.length*40;const L=c.getLength(),w=r[1],f=(d,o)=>{const u=clamp(d/L,0,1),p=c.getPointAt(u),t=c.getTangentAt(u);p.x-=t.z*o;p.z+=t.x*o;p.y=0;return p;};
    let run=null,lastLab=-900;const flush=e=>{if(run!==null&&e-run>50){const m=strip(f,run,e,-w/2,.13,w/2,.13,mat(w),30,12);m.receiveShadow=true;world.add(m);if(e-run>260)TRAF.runs.push({f,a:run,len:e-run,w});}run=null;};
    for(let d=0;d<=L;d+=30){const p=f(d,0);if(okR(p.x,p.z)){if(run===null)run=d;EXC.push([p.x,p.z,w/2+9]);
        if(d-lastLab>1300&&d>120&&d<L-120){lastLab=d;const t=c.getTangentAt(clamp(d/L,0,1)),hw=w>20,lb=new THREE.Mesh(new THREE.PlaneGeometry(hw?64:46,hw?16:11.5),new THREE.MeshBasicMaterial({map:signTex(r[0],hw?'#0f3f8a':'#1c5a2e','#ffffff'),transparent:true,opacity:.95,polygonOffset:true,polygonOffsetFactor:-5,polygonOffsetUnits:-5}));lb.rotation.x=-Math.PI/2;lb.rotation.z=Math.atan2(t.x,t.z)+Math.PI/2;lb.position.set(p.x-t.z*(w/2+(hw?14:10)),.2,p.z+t.x*(w/2+(hw?14:10)));world.add(lb);}}
      else flush(d-30);}
    flush(L);});
}

function runwayTex(nA,nB,len){return cvs(128,2048,(g,w,h)=>{const k=h/len;g.fillStyle='#2c2f34';g.fillRect(0,0,w,h);for(let i=0;i<5000;i++){g.fillStyle='rgba(255,255,255,'+rnd(0,.05)+')';g.fillRect(rnd(0,w),rnd(0,h),2,2);}
  g.fillStyle='rgba(18,18,18,.3)';g.fillRect(w*.3,0,w*.4,h);g.fillStyle='#ecece6';g.fillRect(4,0,3,h);g.fillRect(w-7,0,3,h);for(let y=75*k;y<h-75*k;y+=34*k)g.fillRect(w/2-2,y,4,18*k);
  const end=(flip,txt)=>{g.save();if(flip){g.translate(w,h);g.rotate(Math.PI);}
    const gr=g.createLinearGradient(0,h-260*k,0,h-70*k);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.5,'rgba(0,0,0,.5)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(w*.2,h-260*k,w*.6,190*k);
    g.fillStyle='#ecece6';g.fillRect(4,h-4*k,w-8,3*k);for(let i=0;i<8;i++)g.fillRect(14+i*13.2+(i>3?6:0),h-30*k,8,22*k);
    g.textAlign='center';g.textBaseline='alphabetic';const num=txt.replace(/[LRC]/,''),sfx=txt.replace(/[0-9]/g,'');g.font='800 '+Math.round(26*k)+'px Arial';g.fillText(num,w/2,h-40*k);if(sfx){g.font='800 '+Math.round(16*k)+'px Arial';g.fillText(sfx,w/2,h-68*k);}
    [100,140,180].forEach(d=>{g.fillRect(w*.2,h-(d+16)*k,w*.14,16*k);g.fillRect(w*.66,h-(d+16)*k,w*.14,16*k);});g.fillRect(w*.16,h-250*k,w*.2,34*k);g.fillRect(w*.64,h-250*k,w*.2,34*k);g.restore();};
  end(false,nA);end(true,nB);});}
function rwT(a,b,l){const t=runwayTex(a,b,l);t.flipY=false;t.needsUpdate=true;return t;}
const lampG=new THREE.SphereGeometry(1,8,6);
function runway(x1,z1,x2,z2,wid,nA,nB){
  const dx=x2-x1,dz=z2-z1,len=Math.hypot(dx,dz),psi=Math.atan2(dx,dz),ux=dx/len,uz=dz/len,m=new THREE.Mesh(new THREE.PlaneGeometry(wid,len),flat('#ffffff',2,{map:rwT(nA,nB,len)}));
  m.rotation.x=-Math.PI/2;m.rotation.z=psi+Math.PI;m.position.set((x1+x2)/2,.1,(z1+z2)/2);world.add(m);
  const pts=[];for(let s=0;s<=len;s+=30)[-1,1].forEach(k=>pts.push([x1+ux*s-uz*k*(wid/2+1.5),z1+uz*s+ux*k*(wid/2+1.5)]));
  world.add(inst(lampG,GL('#fff8dc'),pts,1,(it,i,q,dm)=>{dm.position.set(it[0],.45,it[1]);dm.scale.setScalar(.5);dm.updateMatrix();q.setMatrixAt(i,dm.matrix);}));
  return {x1,z1,x2,z2,ux,uz,len,wid,psi};
}
function approachLights(r,end1){ // lights + PAPI for landings that touch down at end1 (or end2)
  const tx=end1?r.x1:r.x2,tz=end1?r.z1:r.z2,ux=end1?r.ux:-r.ux,uz=end1?r.uz:-r.uz,rx=-uz,rz=ux,w=[],gn=[];
  for(let s=18;s<=170;s+=19)for(let k=-2;k<=2;k++)w.push([tx-ux*s+rx*k*3,tz-uz*s+rz*k*3]);for(let k=-6;k<=6;k++)gn.push([tx+rx*k*r.wid/13,tz+rz*k*r.wid/13]);
  const put=(pts,c,sc)=>world.add(inst(lampG,GL(c),pts,1,(it,i,q,dm)=>{dm.position.set(it[0],.6,it[1]);dm.scale.setScalar(sc);dm.updateMatrix();q.setMatrixAt(i,dm.matrix);}));
  put(w,'#ffffff',.7);put(gn,'#3dff7a',.6);
  for(let k=0;k<4;k++)box(1.6,1,1,GL(k<2?'#ffffff':'#ff2a2a'),tx+ux*95-rx*(r.wid/2+9+k*3.2),.9,tz+uz*95-rz*(r.wid/2+9+k*3.2),world);
  return {tx,tz,ux,uz,len:r.len,wid:r.wid};
}
function helipad(x,z){const m=new THREE.Mesh(new THREE.CircleGeometry(16,28),flat('#ffffff',3,{map:cvs(128,128,g=>{g.fillStyle='#4a4d52';g.fillRect(0,0,128,128);g.strokeStyle='#f2c230';g.lineWidth=7;g.beginPath();g.arc(64,64,54,0,7);g.stroke();g.fillStyle='#fff';g.font='800 78px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('H',64,68);})}));m.rotation.x=-Math.PI/2;m.position.set(x,.16,z);world.add(m);return [x,z];}
function hangar(x,z,ry,w,l){const m=sbox(w,7,l,x,3.5,z,ry,M('#b9c0c8',{roughness:.5,metalness:.5}),20);const r=new THREE.Mesh(gable(w+1,3.2,l+1),M('#7d8791',{roughness:.5,metalness:.6}));r.position.set(x,7,z);r.rotation.y=ry;world.add(r);const d=box(w*.7,5.5,.3,M('#3a4048',{roughness:.6}),x+Math.sin(ry)*(l/2+.1),2.75,z+Math.cos(ry)*(l/2+.1),world);d.rotation.y=ry;}
function ctower(x,z,h){const tw=M('#cfc9bb',{roughness:.8});cyl(2.2,2.6,h,tw,x,h/2,z,world,12);box(9,4.5,9,M('#1c3246',{roughness:.08,metalness:.9}),x,h+2.2,z,world);box(10,.8,10,tw,x,h+4.8,z,world);cyl(.25,.25,6,M('#c33'),x,h+8,z,world,6);}
function buildAirports(){
  /* ---- Logan ---- */
  runway(620,-330,1620,-330,46,'9','27');runway(1000,-200,1500,-1100,46,'4R','22L');const r4l=runway(760,-260,1230,-1160,46,'4L','22R');runway(700,-1100,1560,-420,46,'15R','33L');
  approachLights(r4l,true);
  const ap=new THREE.Mesh(new THREE.CircleGeometry(215,32),flat('#ffffff',1,{map:rep(concTex.clone(),14,14)}));ap.material.map.needsUpdate=true;ap.rotation.x=-Math.PI/2;ap.position.set(650,.08,-640);world.add(ap);
  for(let k=0;k<4;k++){const a=Math.PI*(.62+k*.25),x=640+Math.cos(a)*105,z=-640+Math.sin(a)*105,t=tower(x,z,86,15,30,1,-a+Math.PI/2);box(90,1,34,M('#d7dbe2',{roughness:.5}),x,15.5,z,world).rotation.y=t.rotation.y;
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(12,12),new THREE.MeshBasicMaterial({map:cvs(64,64,g=>{g.fillStyle='#1f5fbf';g.fillRect(0,0,64,64);g.fillStyle='#fff';g.font='800 52px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('ABCE'[k],32,35);})}));sg.position.set(640+Math.cos(a)*88,24,-640+Math.sin(a)*88);sg.lookAt(640+300,24,-640);world.add(sg);}
  const tw=M('#cfc9bb',{roughness:.8});[-6,6].forEach(x=>cyl(3.2,3.6,84,tw,700+x,42,-830,world,16));box(24,6,12,tw,700,50,-830,world);box(26,11,20,M('#1c3246',{roughness:.08,metalness:.9}),700,89,-830,world);box(28,2,22,tw,700,95.5,-830,world);cyl(.5,.5,14,M('#c33'),700,103,-830,world,6);
  ['#b3261f','#1f5fbf','#2e8b57','#d9821a','#6f2c91'].forEach((c,k)=>{const a=-1+k*.5,p=makePlane(c);p.position.set(640+Math.cos(a)*170,3.25,-640+Math.sin(a)*170);p.rotation.y=Math.atan2(-Math.cos(a),-Math.sin(a));world.add(p);});
  APT.logan={name:'Logan',pad:helipad(505,-790),dep:{x:1230+r4l.ux*-34,z:-1160+r4l.uz*-34,yaw:Math.atan2(-r4l.ux,-r4l.uz)}};
  /* ---- Norwood Memorial (laid out from the published runway ends, about 1:2.9) ---- */
  { const N=NWD,X=e=>N.x+e,Z=n=>N.z+n,r17=runway(X(-140),Z(-125),X(39),Z(257),30,'17','35'),r10=runway(X(-207),Z(-64),X(213),Z(-64),23,'10','28');approachLights(r17,false);
    const pv=(x,z,w,l,c,rx,rz)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,l),flat(c||'#ffffff',1,c?{}:{map:rep(concTex.clone(),rx||6,rz||8)}));if(!c)m.material.map.needsUpdate=true;m.rotation.x=-Math.PI/2;m.position.set(X(x),.09,Z(z));world.add(m);return m;};
    pv(-150,45,110,180);pv(-98,10,26,150,'#3a3d42');pv(-150,-48,150,14,'#3a3d42');pv(120,-30,16,60,'#3a3d42');pv(-30,170,120,14,'#3a3d42').rotation.z=.44;
    [[-222,-10,34,30],[-222,34,34,30],[-222,78,30,26]].forEach(a=>hangar(X(a[0]),Z(a[1]),Math.PI/2,a[2],a[3]));hangar(X(-160),Z(-95),0,40,26);
    tower(X(-218),Z(128),30,9,18,1,0);box(32,.6,20,M('#d7dbe2'),X(-218),9.3,Z(128),world);ctower(X(-196),Z(152),15);
    {const sg=new THREE.Mesh(new THREE.PlaneGeometry(22,3.2),new THREE.MeshBasicMaterial({map:signTex('NORWOOD MEMORIAL AIRPORT','#16324a','#c9a227')}));sg.position.set(X(-202.9),6.4,Z(128));sg.rotation.y=Math.PI/2;world.add(sg);}
    [[-150,20,.5],[-130,48,-.4],[-165,70,2.3],[-128,95,.9],[-172,105,-2.6]].forEach((a,k)=>{const p=makeProp(['#c0392b','#2e8b57','#1f5fbf','#d9821a','#6f2c91'][k]);p.position.set(X(a[0]),1.55,Z(a[1]));p.rotation.y=a[2];world.add(p);});
    {const j=makeJet('#1b2a4a');j.position.set(X(-185),1.7,Z(12));j.rotation.y=1.2;world.add(j);}
    cyl(.1,.1,6,M('#ddd'),X(-60),3,Z(-20),world,6);{const w=cyl(.2,.7,3,M('#ff7a1a',{side:THREE.DoubleSide}),X(-60),5.8,Z(-18.6),world,8);w.rotation.x=Math.PI/2;}
    /* Access Road, parking, the cafe, the airplane playground and the viewing area */
    pv(-285,40,10,560,'#3a3d42');pv(-262,150,34,90,'#4a4d52');for(let k=0;k<12;k++)car(world,X(-270+(k%2)*14),.1,Z(112+((k/2)|0)*14),k%2?Math.PI/2:-Math.PI/2);
    { const bx=X(-250),bz=Z(205);sbox(22,5.2,14,bx,2.6,bz,0,new THREE.MeshStandardMaterial({color:C('#e9dcc0'),roughness:.9}),8);const rf=new THREE.Mesh(gable(24,3,15),M('#7a2f24',{roughness:.8}));rf.position.set(bx,5.2,bz);world.add(rf);
      box(22.4,.5,3.2,M('#b3261f'),bx,3.6,bz-8.4,world).rotation.x=.35;const sg=new THREE.Mesh(new THREE.PlaneGeometry(13,2.4),new THREE.MeshBasicMaterial({map:cvs(512,96,(g,w,h)=>{g.fillStyle='#fff7e6';g.fillRect(0,0,w,h);g.fillStyle='#b3261f';g.fillRect(0,h-10,w,10);g.fillStyle='#1b2145';g.textAlign='center';g.textBaseline='middle';g.font='800 50px Georgia';g.fillText("Taso's Euro-Cafe",w/2,h/2-4);})}));sg.position.set(bx,6.6,bz-7.6);sg.rotation.y=Math.PI;world.add(sg);
      for(let k=0;k<4;k++){const tx=bx-9+k*6,tz=bz-13;cyl(.9,.9,.08,M('#f4f1ea'),tx,1,tz,world,12);cyl(.06,.06,2.6,M('#555'),tx,1.3,tz,world,6);cyl(0,1.9,.7,M(k%2?'#b3261f':'#f4f1ea'),tx,2.8,tz,world,10);PEOPLE.push([tx+1.1,0,tz],[tx-1.1,0,tz+.3]);} }
    { const px=X(-246),pz=Z(168),pad=new THREE.Mesh(new THREE.PlaneGeometry(34,24),flat('#ffffff',3,{map:cvs(128,96,g=>{g.fillStyle='#2e7fd0';g.fillRect(0,0,128,96);g.fillStyle='#48b06a';g.beginPath();g.ellipse(40,50,34,26,0,0,7);g.fill();g.fillStyle='#f2c230';g.beginPath();g.ellipse(96,36,22,18,0,0,7);g.fill();g.strokeStyle='#fff';g.lineWidth=3;g.setLineDash([8,6]);g.beginPath();g.moveTo(6,84);g.lineTo(122,70);g.stroke();})}));pad.rotation.x=-Math.PI/2;pad.position.set(px,.14,pz);world.add(pad);
      const R=M('#d8322a',{roughness:.5}),B=M('#1f6fd6',{roughness:.5}),Y=M('#f2c230',{roughness:.5}),G=M('#8a9098',{metalness:.6,roughness:.4}),g=new THREE.Group();
      const f=cyl(1.1,1.1,7,B,0,2.3,0,g,14);f.rotation.x=Math.PI/2;const nz=sph(1.1,R,0,2.3,3.5,g);nz.scale.z=1.3;box(10,.3,2,Y,0,2.2,.6,g);box(4,.3,1.3,Y,0,2.6,-3.2,g);box(.3,2.2,1.6,R,0,3.5,-3.1,g);[[-1,1.6],[1,1.6],[-1,-2],[1,-2]].forEach(a=>cyl(.12,.12,1.6,G,a[0],.8,a[1],g,6));
      const pr=new THREE.Group();pr.position.set(0,2.3,5);[0,1.57].forEach(a=>{box(.25,3,.08,Y,0,0,0,pr).rotation.z=a;});g.add(pr);const sl=box(1.4,.15,5,Y,3,1.2,1.2,g);sl.rotation.x=.42;sl.rotation.y=1.2;box(.8,.1,2.4,G,-1.6,1.1,-1,g).rotation.z=.9;
      g.position.set(px-6,.1,pz-2);g.rotation.y=.6;world.add(g);
      [[7,-4],[11,-4]].forEach(a=>{[-1.6,1.6].forEach(k=>{const l=cyl(.1,.1,4.4,G,px+a[0]+k,2.1,pz+a[1],world,6);l.rotation.z=k*.07;});box(3.6,.12,.12,G,px+a[0],4.2,pz+a[1],world);[-.8,.8].forEach(k=>{box(.04,2.8,.04,G,px+a[0]+k,2.8,pz+a[1],world);box(.7,.08,.35,[R,B][k>0?1:0],px+a[0]+k,1.4,pz+a[1],world);});});
      cyl(1.6,1.6,3,R,px+8,1.5,pz+6,world,6);cyl(0,2.3,1.6,B,px+8,3.8,pz+6,world,6);const s2=box(1.2,.14,5.5,Y,px+11.6,1.55,pz+6,world);s2.rotation.z=-.5;
      for(let k=0;k<9;k++)PEOPLE.push([px+rnd(-14,14),0,pz+rnd(-9,9)]);
      for(let x=-17;x<=17;x+=3.4){box(.12,1.2,.12,G,px+x,.6,pz-12,world);box(.12,1.2,.12,G,px+x,.6,pz+12,world);}box(34,.08,.08,G,px,1.15,pz-12,world);box(34,.08,.08,G,px,1.15,pz+12,world);
      const ps=new THREE.Mesh(new THREE.PlaneGeometry(9,2.3),new THREE.MeshBasicMaterial({map:signTex('Tyler J. Lawrence Memorial Park','#1f5a2e','#f2c230')}));ps.position.set(px-18,2.6,pz);ps.rotation.y=-Math.PI/2;world.add(ps);[-3.8,3.8].forEach(k=>cyl(.1,.1,2.4,G,px-18,1.2,pz+k,world,6));
      for(let k=0;k<5;k++){const bx2=X(-205),bz2=Z(168+k*7);box(.8,.5,3,M('#6b4a2f'),bx2,.5,bz2,world);box(.15,.9,3,M('#6b4a2f'),bx2-.45,.9,bz2,world);if(k%2)PEOPLE.push([bx2+1.2,0,bz2]);}
      for(let z=100;z<=230;z+=5)box(.1,2,.1,G,X(-198),1,Z(z),world);box(.06,.06,130,G,X(-198),2,Z(165),world);box(.06,.06,130,G,X(-198),1,Z(165),world); }
    EXC.push([X(-70),Z(60),330],[X(-240),Z(170),90]);NOROAD.push([X(-40),Z(60),300]);
    APT.norwood={name:'Norwood',x:X(-50),z:Z(60),land:approachLights(r17,true),pad:helipad(X(-150),Z(-14))}; }
  /* ---- Providence ---- */
  { const r5=runway(-4320,14860,-3780,14140,44,'5','23');runway(-4250,14200,-3960,14860,40,'16','34');
    const a2=new THREE.Mesh(new THREE.PlaneGeometry(260,420),flat('#ffffff',1,{map:rep(concTex.clone(),14,22)}));a2.material.map.needsUpdate=true;a2.rotation.x=-Math.PI/2;a2.position.set(-4400,.08,14520);world.add(a2);
    tower(-4490,14520,40,16,260,1,0);box(46,1,266,M('#d7dbe2',{roughness:.5}),-4490,16.5,14520,world);ctower(-4420,14760,40);hangar(-4470,14300,Math.PI/2,40,34);
    ['#1f5fbf','#b3261f','#2e8b57'].forEach((c,k)=>{const p=makePlane(c);p.position.set(-4425,3.25,14440+k*75);p.rotation.y=-Math.PI/2;world.add(p);});
    APT.providence={name:'Providence',x:-4050,z:14500,land:approachLights(r5,false),pad:helipad(-4350,14680)}; }
}
function buildRegion(){
  const line=(pts,w,mat,y,vr)=>{const c=new THREE.CatmullRomCurve3(pts.map(p=>new V3(p[0],0,p[1])),false,'centripetal'),l=c.getLength(),f=(d,o)=>{const u=clamp(d/l,0,1),p=c.getPointAt(u),t=c.getTangentAt(u);p.x-=t.z*o;p.z+=t.x*o;p.y=0;return p;};const s=strip(f,0,l,-w/2,y,w/2,y,mat,40,vr);s.receiveShadow=true;world.add(s);return [f,l];};
  /* lakes */
  const lakes=LAKES;
  lakes.forEach(a=>{const w=new THREE.Mesh(new THREE.CircleGeometry(1,36),water2());w.rotation.x=-Math.PI/2;w.scale.set(a[2],a[3],1);w.position.set(a[0],.1,a[1]);world.add(w);EXC.push([a[0],a[1],Math.max(a[2],a[3])+20]);});
  /* stadium by the highway */
  { const sx=STAD[0],sz=STAD[1],pr=[[58,0],[60,3],[92,30],[98,30],[98,0]].map(p=>new THREE.Vector2(p[0],p[1])),st=cvs(64,64,g=>{g.fillStyle='#39486b';g.fillRect(0,0,64,64);for(let y=0;y<64;y+=6){g.fillStyle='#55648a';g.fillRect(0,y,64,2);}for(let i=0;i<300;i++){g.fillStyle=['#c33','#ddd','#fc3','#39c'][i%4];g.fillRect(rnd(0,64),rnd(0,64),2,2);}});rep(st,40,6);
    const bowl=new THREE.Mesh(new THREE.LatheGeometry(pr,48),new THREE.MeshStandardMaterial({map:st,roughness:.8,side:THREE.DoubleSide}));bowl.scale.set(1.25,1,1);bowl.position.set(sx,0,sz);world.add(bowl);
    const f=new THREE.Mesh(new THREE.PlaneGeometry(126,62),flat('#ffffff',3,{map:cvs(256,128,g=>{g.fillStyle='#2f8a3a';g.fillRect(0,0,256,128);for(let i=0;i<10;i++){g.fillStyle=i%2?'#35963f':'#2b7f35';g.fillRect(28+i*20,6,20,116);}g.strokeStyle='#fff';g.lineWidth=2;g.strokeRect(28,6,200,116);for(let i=1;i<10;i++){g.beginPath();g.moveTo(28+i*20,6);g.lineTo(28+i*20,122);g.stroke();}g.fillStyle='#1c3f8a';g.fillRect(8,6,20,116);g.fillRect(228,6,20,116);})}));f.rotation.x=-Math.PI/2;f.position.set(sx,.2,sz);world.add(f);
    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(a=>{cyl(.8,1,56,M('#aab',{metalness:.6}),sx+a[0]*128,28,sz+a[1]*100,world,6);box(12,7,1,GL('#fffbe6'),sx+a[0]*128,57,sz+a[1]*100,world).lookAt(sx,20,sz);});
    const lot=new THREE.Mesh(new THREE.PlaneGeometry(520,420),flat('#55585d',.9));lot.rotation.x=-Math.PI/2;lot.position.set(sx,.06,sz);world.add(lot);EXC.push([sx,sz,330]); }
  /* Providence */
  { const pv=new THREE.Mesh(new THREE.PlaneGeometry(640,560),flat('#9a9c9f',.9,{map:rep(concTex.clone(),20,18)}));pv.material.map.needsUpdate=true;pv.rotation.x=-Math.PI/2;pv.position.set(-3330,.08,12480);world.add(pv);
    line([[-2900,12760],[-2960,12500],[-2900,12100],[-2850,11500]],46,water2(),.15);
    for(let i=0;i<26;i++){const x=rnd(-3560,-3210),z=rnd(12420,12700),c=Math.hypot(x+3360,z-12560);tower(x,z,rnd(26,38),rnd(20,50)+Math.max(0,130-c*.9)*rnd(.4,1),rnd(26,38),(Math.random()*6)|0,rnd(0,.4));}
    tower(-3330,12590,40,62,34,3,0);tower(-3330,12590,28,44,24,3,0,62);tower(-3330,12590,16,30,14,3,0,106);const sp=cyl(0,5,18,M('#a8946c'),-3330,145,12590,world,4);sp.rotation.y=Math.PI/4;
    const wm=M('#f1efe9',{roughness:.55});box(96,18,34,wm,-3440,9,12300,world);box(40,24,40,wm,-3440,12,12300,world);cyl(11,12,14,wm,-3440,31,12300,world,20);const dm=sph(11,wm,-3440,38,12300,world);dm.scale.y=1.15;cyl(1.6,2,7,wm,-3440,53,12300,world,10);
    const lawn=new THREE.Mesh(new THREE.CircleGeometry(90,28),flat('#4f8a3a',1.4));lawn.rotation.x=-Math.PI/2;lawn.position.set(-3440,.1,12320);world.add(lawn); }
  /* towns + woods all the way down */
  const towns=[[-1950,5350,230],[-2330,7000,260],[-2180,8350,260],[-2700,10250,330],[-2950,11750,360],[-3300,12950,330],[-3900,13800,260],[-600,6500,220],[-4200,9400,220],[900,8200,240],[-700,10400,240],[-1500,12600,260],[600,13200,220],[-4700,12200,240]];
  const H=[],T=[],okp=(x,z)=>pip(x,z,MAIN)&&EXC.every(c=>(x-c[0])**2+(z-c[1])**2>c[2]*c[2])&&Math.hypot(x+4050,z-14500)>620&&!(x>-3660&&x<-3000&&z>12180&&z<12790);
  towns.forEach(t=>{for(let i=0;i<t[2]*.6;i++){const a=rnd(0,6.283),r=t[2]*Math.sqrt(Math.random()),x=t[0]+Math.cos(a)*r,z=t[1]+Math.sin(a)*r;if(okp(x,z))(i%3?H:T).push([x,z]);}
    if(okp(t[0],t[1])){const wh=M('#f1efe8',{roughness:.7});box(9,8,16,wh,t[0],4,t[1],world);box(4,16,4,wh,t[0],8,t[1]-9,world);const s=cyl(0,2.4,9,M('#3a3d44'),t[0],20.5,t[1]-9,world,4);s.rotation.y=Math.PI/4;sbox(34,12,18,t[0]+40,6,t[1]+30,.4,bt[2],14);cyl(4,4,5,M('#9fb7c8',{metalness:.5,roughness:.5}),t[0]-50,24,t[1]+20,world,12);cyl(.8,.8,22,M('#888'),t[0]-50,11,t[1]+20,world,6);}});
  for(let i=0;i<9000;i++){const x=rnd(-5600,2600),z=rnd(5900,16800);if(okp(x,z)&&fbm(((x+6000)/9000)%1,((z)/9000)%1,8)>.42)T.push([x,z]);}
  for(let i=0;i<1500;i++){const x=rnd(-6000,-3650),z=rnd(-1500,5900);if(okp(x,z))T.push([x,z]);}
  const bin=(L)=>{const b={};L.forEach(p=>{const k=(p[0]/1600|0)+'_'+(p[1]/1600|0);(b[k]=b[k]||[]).push(p);});return Object.values(b);};
  const hg=new THREE.BoxGeometry(10,6,8),hm2=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85}),rg=gable(11,4,9),rm=M('#3a3d44',{roughness:.9}),hc=['#efe6d2','#cfdbe6','#e3c9b6','#d5dcc0','#e9d79a','#b9c6d8','#f4f4f0','#b5553f'];
  HILLS.forEach(h=>{const n=Math.round(h[2]*h[4]/900);for(let k=0;k<n;k++){const a=rnd(0,6.283),r=Math.sqrt(Math.random())*.97,x=h[0]+Math.cos(a)*r*h[2],z=h[1]+Math.sin(a)*r*h[4],y=hillH(x,z);if(y>3&&fbm(((x/500)%1+1)%1,((z/500)%1+1)%1,8)>.36)T.push(Object.assign([x,z],{y}));}});
  bin(T).forEach(L=>addTrees(L,1.2));
  bin(H).forEach(L=>{L.forEach(s=>{s.r=rnd(0,6);});world.add(inst(hg,hm2,L,1,(s,i,m,dm,col)=>{dm.position.set(s[0],3,s[1]);dm.scale.set(1,1,1);dm.rotation.set(0,s.r,0);dm.updateMatrix();m.setMatrixAt(i,dm.matrix);m.setColorAt(i,col.set(hc[i%hc.length]).convertSRGBToLinear());}));
    world.add(inst(rg,rm,L,1,(s,i,m,dm)=>{dm.position.set(s[0],6,s[1]);dm.rotation.set(0,s.r,0);dm.updateMatrix();m.setMatrixAt(i,dm.matrix);}));});
}
buildCity();buildTracks();buildCuts();buildTunnel();buildHall();buildStations();buildLandmarks();buildMain();
catenary(rpos,HE+14,T1-24);catenary(rpos,T2+26,DJ);catenary(spos,10,SL);
buildHills();buildAirports();buildPlaces();buildRoads();buildTunnels();buildRegion();buildNature();shadowize(world);buildTraffic();
