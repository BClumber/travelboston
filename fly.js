'use strict';
/* ---------- flight mode ---------- */
const ACS={
  prop:{make:()=>makeProp('#0a8fa0'),vr:30,vmax:82,acc:8,gh:1.55,cb:17,cu:4.6,ck:[.42,2.3,.6]},
  jet:{make:()=>makeJet('#1b2a4a'),vr:40,vmax:135,acc:14,gh:1.7,cb:27,cu:6.5,ck:[.42,6.0,.68]},
  liner:{make:()=>makePlane('#1f5fbf'),vr:46,vmax:120,acc:11,gh:3.25,cb:62,cu:17,ck:[.7,15.0,1.12]},
  heli:{make:()=>makeHeli('#c0392b'),vmax:62,acc:11,gh:1.66,cb:19,cu:6,ck:[.32,1.25,.74],heli:true}};
cam.far=16000;cam.updateProjectionMatrix();
const craft={},QY=QYs,_fv=new V3();let PL=null,pickT=0;
const FL={type:'liner',dest:'norwood',x:0,z:0,alt:0,v:0,vy:0,yaw:0,pitch:0,roll:0,onG:true,gear:1,gt:1,wi:0,wps:[],phase:'pick',view:'chase',lyaw:0,lpitch:0,rpm:0,done:false,flew:false,brake:false,call:{},fr:0,sx:0,sz:0,chop:0},F=FL;
const RINGS=[];for(let i=0;i<12;i++){const g=new THREE.Group(),m=new THREE.MeshBasicMaterial({color:C('#ffd23f'),transparent:true,opacity:.85});g.add(new THREE.Mesh(new THREE.TorusGeometry(28,1.7,8,40),m));g.add(new THREE.Mesh(new THREE.CircleGeometry(6,5),m));g.visible=false;world.add(g);RINGS.push({g,m});}
const SMOKE=[];for(let i=0;i<6;i++){const p=sph(1,new THREE.MeshBasicMaterial({color:0xdddddd,transparent:true,opacity:0,depthWrite:false}),0,-99,0,world);p.userData.life=0;SMOKE.push(p);}
const BOOM=[];for(let i=0;i<18;i++){const p=sph(1,new THREE.MeshBasicMaterial({color:0xff8a1a,transparent:true,opacity:0,depthWrite:false}),0,-99,0,world);p.userData={life:0,v:new V3()};BOOM.push(p);}
const beacon=new THREE.Mesh(new THREE.CylinderGeometry(9,9,1400,16,1,true),new THREE.MeshBasicMaterial({color:C('#5dff8a'),transparent:true,opacity:.2,side:THREE.DoubleSide,depthWrite:false,fog:false}));beacon.visible=false;world.add(beacon);
const blabel=new THREE.Sprite(new THREE.SpriteMaterial({fog:false,depthWrite:false,transparent:true}));blabel.visible=false;world.add(blabel);
snd.boom=()=>{puff(.9,1.3,110);puff(.6,.8,480);tone(64,.9,'sawtooth',.26);};
function hitCheck(){if(F.onG)return 0;const hh=hillH(F.x,F.z);if(hh>3&&F.alt<hh+1.5)return 'hill';
  for(let i=0;i<BLD.length;i++){const b=BLD[i],dx=F.x-b[0],dz=F.z-b[1];if(dx*dx+dz*dz>8100||F.alt>b[5])continue;const c=Math.cos(b[4]),sn=Math.sin(b[4]),lx=dx*c-dz*sn,lz=dx*sn+dz*c;if(Math.abs(lx)<b[2]+3&&Math.abs(lz)<b[3]+3)return 'building';}return 0;}
function crash(why){if(F.crashT>0||F.done)return;F.crashT=3.4;F.v=0;F.vy=0;PL.visible=false;snd.boom();BOOM.forEach(p=>{p.position.set(F.x+rnd(-4,4),F.alt+2+rnd(0,4),F.z+rnd(-4,4));p.userData.life=1.4+rnd(0,1.6);p.userData.v.set(rnd(-10,10),rnd(5,18),rnd(-10,10));p.scale.setScalar(rnd(2,5));});
  msg({hill:'💥 Hit the hillside!',building:'💥 Hit a building!',water:'💦 Down in the water!',hard:'💥 Too hard! Crash landing!',field:'💥 Crashed off the runway!'}[why]+' Back up we go…',3600);say('Oh no! Let us try that again.');}
function respawn(){const S=ACS[F.type],heli=!!S.heli,n=F.wps.length;if(F.wi>=n&&!heli){F.wi=F.wps.findIndex(w=>w.gate);F.wps.forEach((w,i)=>{if(w.gate)RINGS[i].g.visible=true;});}
  const W=F.wps[Math.min(F.wi,n-1)],pv=F.wi?F.wps[Math.min(F.wi,n)-1]:{x:F.sx,z:F.sz},dx=W.x-pv.x,dz=W.z-pv.z,l=Math.hypot(dx,dz)||1,bk=Math.min(l*.8,650);
  F.x=W.x-dx/l*bk;F.z=W.z-dz/l*bk;F.yaw=Math.atan2(dx,dz);F.alt=Math.max(heli?70:150,W.y,hillH(F.x,F.z)+90);F.v=heli?20:S.vmax*.7;F.vy=0;F.pitch=0;F.roll=0;F.onG=false;F.flew=true;F.brake=false;F.gear=0;F.call={rot:1,v1:1,gu:1};PL.visible=true;levF.set(heli?.5:.7);cam.position.set(F.x-Math.sin(F.yaw)*60,F.alt+20,F.z-Math.cos(F.yaw)*60);}
function makeCockpit(heli){
  const g=new THREE.Group(),E=(c,e)=>new THREE.MeshStandardMaterial({color:C(c),roughness:.7,emissive:C(c),emissiveIntensity:e||.3}),dk=E('#23262c'),md=E('#3d434d'),b=(w,h,d,m,x,y,z)=>box(w,h,d,m,x,y,z,g);
  b(2.2,.05,2.6,dk,0,-1.15,.1);[-1.09,1.09].forEach(x=>{b(.06,.85,2.6,md,x,-.72,.1);b(.07,.95,.07,dk,x,.2,.12);b(.06,.07,1.3,dk,x,.66,-.5);});b(2.2,.06,1.9,md,0,.72,-.25);
  if(!heli){b(2.16,.07,.52,dk,0,-.27,.92);b(2.1,.62,.06,md,0,-.6,.72);b(.36,.5,.9,md,0,-.95,.3);}
  else{b(1.05,.52,.06,md,0,-.62,.74);b(1.05,.06,.34,dk,0,-.35,.86);b(.3,.7,.5,md,0,-.98,.5);}
  const cp=b(.07,1.02,.07,dk,0,.22,1.1);cp.rotation.x=.3;[-.98,.98].forEach(x=>{const q=b(.09,1.02,.09,dk,x,.22,1.0);q.rotation.x=.3;});b(2.2,.09,.3,dk,0,.68,.9);
  const mk=()=>{const c=document.createElement('canvas');c.width=c.height=256;const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return {g:c.getContext('2d'),t};};
  const pfd=mk(),nd=mk(),pl=(d,x,w)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w),new THREE.MeshBasicMaterial({map:d.t,toneMapped:false}));m.position.set(x,-.53,.685);m.rotation.y=Math.PI;g.add(m);};
  pl(pfd,heli?-.25:-.46,.42);pl(nd,heli?.25:0,.42);if(!heli)pl(pfd,.52,.34);
  const yk=new THREE.Group();yk.position.set(-.46,-.92,.5);
  if(heli){const s=cyl(.025,.025,.62,dk,0,.3,0,yk,8);cyl(.04,.04,.14,E('#111'),0,.66,0,yk,8);}
  else{const c=cyl(.03,.03,.3,dk,0,.05,0,yk,8);c.rotation.x=.3;const wh=new THREE.Mesh(new THREE.TorusGeometry(.15,.022,8,20,Math.PI*1.25),E('#111'));wh.position.set(0,.2,-.05);wh.rotation.z=-Math.PI*.125+Math.PI;yk.add(wh);yk.userData.wheel=wh;}
  g.add(yk);const th=new THREE.Group();th.position.set(.06,-.72,.3);[-.05,.05].forEach(x=>{box(.03,.2,.03,E('#888'),x,.1,0,th);box(.06,.05,.06,E('#ddd'),x,.2,0,th);});if(!heli)g.add(th);
  g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});g.userData={pfd,nd,yoke:yk,thr:th};return g;
}
function buildRoute(dest,heli){
  const A=APT[dest],W=[],add=(x,y,z,name,gate)=>W.push({x,y:heli?Math.max(55,y*.5,hillH(x,z)+45):y,z,name,gate});
  if(heli)add(380,150,-420,'the harbor');else add(545,150,150,'the harbor');
  add(150,300,70,'the South Station tower');add(-600,330,340,'the Back Bay towers');
  if(dest==='norwood'){const a=flatP(FHd-140,420);add(a.x,230,a.z,'the Arboretum hill');}
  else{const b=flatP(R128+330,-1180);add(b.x+60,340,b.z+40,'the Blue Hills');add(STAD[0],280,STAD[1],'the stadium');add(-3440,250,12300,'the State House dome');}
  if(heli)add(A.pad[0],60,A.pad[1],'the helipad');
  else{const L=A.land;[[1500,235],[950,150],[480,76]].forEach(a=>add(L.tx-L.ux*a[0],a[1],L.tz-L.uz*a[0],'the runway',true));}
  return W;
}
function setFlyView(v){F.view=v;F.lyaw=0;F.lpitch=0;cam.near=v==='cockpit'?.12:1;cam.updateProjectionMatrix();Object.values(craft).forEach(c=>{c.userData.ck.visible=v==='cockpit'&&c===PL;});}
function flyShow(on){beacon.visible=blabel.visible=on&&F.phase!=='pick';Object.values(craft).forEach(c=>c.visible=on&&c===PL);if(!on){RINGS.forEach(r=>r.g.visible=false);world.fog.density=LOOK.fog;}else world.fog.density=LOOK.fog*.72;}
function openPicker(){F.phase='pick';beacon.visible=blabel.visible=false;$('pick').classList.remove('hide');$('hFly').classList.add('hide');$('again').classList.add('hide');RINGS.forEach(r=>r.g.visible=false);Object.values(craft).forEach(c=>c.visible=false);setFlyView('chase');$('msg').style.opacity=0;}
function startFlight(){
  const S=ACS[F.type],heli=!!S.heli;
  if(!craft[F.type]){const m=S.make();m.rotation.order='YXZ';const ck=makeCockpit(heli);ck.position.set(0,S.ck[0],S.ck[1]);ck.scale.setScalar(S.ck[2]);ck.visible=false;m.add(ck);m.userData.ck=ck;m.userData.props=m.userData.props||[];world.add(m);craft[F.type]=m;}
  PL=craft[F.type];Object.values(craft).forEach(c=>c.visible=c===PL);
  const st=heli?{x:APT.logan.pad[0],z:APT.logan.pad[1],yaw:2.2}:APT.logan.dep;
  Object.assign(F,{x:st.x,z:st.z,sx:st.x,sz:st.z,yaw:st.yaw,alt:0,v:0,vy:0,pitch:0,roll:0,onG:true,gear:1,gt:1,wi:0,phase:'fly',done:false,flew:false,brake:false,call:{},rpm:0});
  F.wps=buildRoute(F.dest,heli);RINGS.forEach((r,i)=>{const w=F.wps[i];r.g.visible=!!w;if(w){r.g.position.set(w.x,w.y,w.z);r.g.scale.setScalar(w.gate?.72:1);}});
  {const A=APT[F.dest],bx=heli?A.pad[0]:A.land.tx+A.land.ux*A.land.len/2,bz=heli?A.pad[1]:A.land.tz+A.land.uz*A.land.len/2;beacon.position.set(bx,700,bz);beacon.visible=true;blabel.material.map=signTex(A.name.toUpperCase()+' ✈','#0b3d1e','#5dff8a');blabel.material.needsUpdate=true;blabel.scale.set(420,105,1);blabel.position.set(bx,520,bz);blabel.visible=true;F.crashT=0;}
  levF.set(0);$('pick').classList.add('hide');$('hFly').classList.remove('hide');$('gear').classList.toggle('hide',heli);setFlyView('chase');
  cam.position.set(F.x-Math.sin(F.yaw)*90,26,F.z-Math.cos(F.yaw)*90);
  msg(heli?'Push the lever up to lift off! 🚁':'Push the lever up for take-off! 🛫',6000);say(heli?'Helicopter ready. Push the lever up to lift off.':'Cleared for take off, runway two two right. Push the lever all the way up.');
}
document.querySelectorAll('#pAC button').forEach(b=>b.onclick=()=>{F.type=b.dataset.ac;document.querySelectorAll('#pAC button').forEach(x=>x.classList.toggle('on',x===b));});
document.querySelectorAll('#pDS button').forEach(b=>b.onclick=()=>{F.dest=b.dataset.ds;document.querySelectorAll('#pDS button').forEach(x=>x.classList.toggle('on',x===b));});
$('auto').onclick=()=>{F.auto=!F.auto;$('auto').classList.toggle('on',F.auto);msg(F.auto?'🤖 Autopilot on. Steer any time to take over':'✋ You have the controls',3500);};
$('pGo').onclick=()=>{audioInit();startFlight();};
function callout(k,t){if(!F.call[k]){F.call[k]=1;say(t);}}
function flyDone(A,heli){F.done=true;levF.set(0);addStar(3);msg('🎉 Yay! You landed at '+A.name+'! Congratulations, captain! 🎉',7500);say('Yay! You landed at '+A.name+'. Congratulations, captain!');snd.fanfare();confetti();setTimeout(()=>{if(mode==='fly'&&F.done){confetti();snd.ding();}},1800);
  const id=F.fid=(F.fid||0)+1;setTimeout(()=>{if(mode==='fly'&&F.done&&F.fid===id)setMode('menu');},7500);}
function drawPanels(T,dist,ang,A){
  const u=PL.userData.ck.userData,g=u.pfd.g;g.save();g.beginPath();g.rect(0,0,256,256);g.clip();g.translate(128,118);g.rotate(-F.roll);g.translate(0,F.pitch*230);g.fillStyle='#2a7fd6';g.fillRect(-400,-500,800,500);g.fillStyle='#7a4a22';g.fillRect(-400,0,800,500);
  g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.moveTo(-400,0);g.lineTo(400,0);g.stroke();for(let p=-30;p<=30;p+=10){if(!p)continue;const y=-p*Math.PI/180*230;g.beginPath();g.moveTo(-26,y);g.lineTo(26,y);g.stroke();}g.restore();
  g.fillStyle='#ffd23f';g.fillRect(70,116,40,5);g.fillRect(146,116,40,5);g.fillRect(124,114,8,8);g.fillStyle='rgba(10,14,20,.78)';g.fillRect(0,0,58,256);g.fillRect(198,0,58,256);g.fillRect(58,216,140,40);
  g.fillStyle='#fff';g.font='700 13px Arial';g.textAlign='center';g.fillText('SPD',29,18);g.fillText('ALT',227,18);g.font='800 22px Arial';g.fillStyle='#7dff9a';g.fillText(Math.round(F.v*1.9),29,126);g.fillText(Math.round(F.alt*3.3/10)*10,227,126);
  const hd=((Math.round(-F.yaw*180/Math.PI+180)%360)+360)%360;g.fillStyle='#fff';g.font='800 20px Arial';g.fillText(('00'+hd).slice(-3)+'°',128,243);u.pfd.t.needsUpdate=true;
  const n=u.nd.g;n.fillStyle='#05080c';n.fillRect(0,0,256,256);n.strokeStyle='#39c46a';n.lineWidth=2;[92,46].forEach(r=>{n.beginPath();n.arc(128,150,r,0,7);n.stroke();});const a=-ang-Math.PI/2;n.strokeStyle='#ff5cf0';n.lineWidth=5;n.beginPath();n.moveTo(128,150);n.lineTo(128+Math.cos(a)*90,150+Math.sin(a)*90);n.stroke();
  n.fillStyle='#fff';n.beginPath();n.moveTo(128,136);n.lineTo(138,160);n.lineTo(128,154);n.lineTo(118,160);n.closePath();n.fill();n.font='800 18px Arial';n.textAlign='center';n.fillStyle='#ff5cf0';n.fillText((T.name||A.name).toUpperCase().slice(0,22),128,24);n.fillStyle='#7dff9a';n.fillText((dist/300).toFixed(1)+' MI',128,48);u.nd.t.needsUpdate=true;
}
function updFly(dt){
  if(F.phase==='pick'){pickT+=dt;const a=pickT*.1;cam.position.set(820+Math.sin(a)*430,120,-700+Math.cos(a)*430);cam.lookAt(760,10,-640);sunFollow(760,0,-640,520);engine(0,200,0,40);return;}
  const S=ACS[F.type],A=APT[F.dest],heli=!!S.heli,L=A.land,now=performance.now();
  BOOM.forEach(p=>{const u=p.userData;if(u.life>0){u.life-=dt;p.position.addScaledVector(u.v,dt);u.v.y-=dt*4;u.v.multiplyScalar(1-dt*.8);p.scale.multiplyScalar(1+dt*1.1);const k=clamp(u.life/1.5,0,1);p.material.color.setRGB(.15+.85*k,.13+.45*k*k,.12);p.material.opacity=clamp(u.life,0,1)*.85;}else p.material.opacity=0;});
  if(F.crashT>0){F.crashT-=dt;const a=now*.0004;cam.position.lerp(_fv.set(F.x+Math.sin(a)*70,F.alt+28,F.z+Math.cos(a)*70),Math.min(1,dt*2));cam.lookAt(F.x,F.alt+4,F.z);engine(0,200,0,40);sunFollow(F.x,0,F.z,240);if(F.crashT<=0)respawn();return;}
  if(keys.w||keys.PageUp||keys['=']||keys['+'])levF.set(levF.v+dt*.7);if(keys.s||keys.PageDown||keys['-'])levF.set(levF.v-dt*.9);
  let jx=joy.x,jy=joy.y;if(joy.id===null){const k=keyStick(dt);jx=k.x;jy=k.y;}
  const landing=F.wi>=F.wps.length,W=landing?null:F.wps[F.wi];let T;
  if(!landing)T=W;else if(heli)T={x:A.pad[0],y:0,z:A.pad[1]};else{const s=(F.x-L.tx)*L.ux+(F.z-L.tz)*L.uz;T={x:L.tx+L.ux*(s+240),y:0,z:L.tz+L.uz*(s+240),s};}
  const dist=Math.hypot(T.x-F.x,T.z-F.z);let dh=Math.atan2(T.x-F.x,T.z-F.z)-F.yaw;dh=Math.atan2(Math.sin(dh),Math.cos(dh));
  const thr=levF.v,wasG=F.onG;
  if(heli){
    F.rpm+=clamp(((thr>.06||!F.onG)&&!F.done?1:0)-F.rpm,-dt*.25,dt*.45);
    let wantAlt=landing?(dist<70?0:60):W.y;{const sy=Math.sin(F.yaw),cy=Math.cos(F.yaw),gh=Math.max(hillH(F.x,F.z),hillH(F.x+sy*70,F.z+cy*70),hillH(F.x+sy*150,F.z+cy*150));if(gh>3)wantAlt=Math.max(wantAlt,gh+40);}let vyT;
    const apOn=F.auto&&joy.id===null&&thr>.06;   /* autopilot holds the height itself, whatever the lever says */
    if(apOn)vyT=clamp((wantAlt-F.alt)*.5,-9,10);else if(thr>.8)vyT=(thr-.8)/.2*13+2;else if(thr<.28)vyT=-(.28-thr)/.28*11-1;else vyT=clamp((wantAlt-F.alt)*.5,-9,10);
    if(F.alt>300){vyT=Math.min(vyT,(330-F.alt)*.4);if(!F.hiT||now-F.hiT>9000){F.hiT=now;msg('☁️ High enough! Ease the lever down a little.',3000);}}
    if(F.rpm<.9||F.done)vyT=Math.min(vyT,F.onG?0:-3);if(F.alt<6)vyT=Math.max(vyT,-2.6);
    F.vyPrev=F.vy;F.vy+=(vyT-F.vy)*Math.min(1,dt*2);F.alt=Math.max(0,F.alt+F.vy*dt);F.onG=F.alt<=.01;if(F.onG)F.vy=Math.max(0,F.vy);if(F.alt>15)F.flew=true;
    if(F.auto&&joy.id===null&&!F.onG&&!F.done){jx=clamp(-dh*1.5,-1,1);jy=dist<40?0:clamp(dist/200,.15,.9)*(Math.abs(dh)>1?.3:1);}
    const vt=F.onG?0:(jy>=0?jy:jy*.35)*S.vmax;F.v+=clamp(vt-F.v,-S.acc*dt,S.acc*dt);if(F.onG)F.v*=.9;
    if(!F.onG)F.yaw+=-jx*1.15*dt;F.pitch+=(-F.v/S.vmax*.24-F.pitch)*Math.min(1,dt*3);F.roll+=(jx*.3*Math.min(1,Math.abs(F.v)/20)-F.roll)*Math.min(1,dt*3);
    if(F.onG&&!wasG){if(!isLand(F.x,F.z))crash('water');else if(F.vyPrev<-7.5)crash('hard');else if(landing&&dist<75&&F.flew&&!F.done)flyDone(A,heli);else puff(.2,.2,600);}
    F.chop+=dt*F.rpm;if(F.chop>.105){F.chop=0;if(F.rpm>.2)puff(.1*F.rpm,.07,170);}engine(.03+F.rpm*.1,500,.04*F.rpm,60+F.rpm*50);
  }else{
    const air=!F.onG,nearApp=landing||(W&&W.gate);let vt=thr*S.vmax;if(nearApp&&air)vt=Math.min(vt,S.vr*1.32);if(F.brake||F.done)vt=0;
    F.v+=clamp(vt-F.v,-(F.brake?S.acc*2.4:S.acc*(air?.45:.8))*dt,S.acc*dt);if(air&&nearApp&&F.v<S.vr*1.14)F.v=Math.min(S.vr*1.14,F.v+S.acc*1.6*dt);
    if(F.onG){let pt=0;if(!F.brake){if(F.v>=S.vr){pt=jy>.15?jy*.3:(jy<-.15?0:.2);callout('rot','Rotate');}else if(F.v>S.vr*.82)callout('v1','V one');}
      F.pitch+=(pt-F.pitch)*Math.min(1,dt*1.3);F.roll+=-F.roll*Math.min(1,dt*4);F.yaw+=(F.brake&&Math.abs(jx)<.15?clamp(dh,-.4,.4)*.9:-jx*.6*Math.min(1,F.v/14))*dt;
      if(F.pitch>.09&&F.v>=S.vr&&!F.brake){F.onG=false;F.vy=2;}
      if(F.brake&&F.v<1&&!F.done)flyDone(A,heli);
    }else{let pt;
      if(Math.abs(jy)>.15)pt=jy*.4;else{let ta;if(landing){const lat=Math.abs((F.x-L.tx)*-L.uz+(F.z-L.tz)*L.ux);ta=Math.max(0,(70-T.s)*.15,(lat-40)*.3);}else ta=W.y;pt=clamp((ta-F.alt)/110,-.2,.24);if(landing&&F.alt<8)pt=Math.max(pt,.045);}
      F.pitch+=(pt-F.pitch)*Math.min(1,dt*1.9);let rt=jx*.75;if(Math.abs(jx)<.15&&(nearApp||F.auto))rt=clamp(-dh*1.7,-.5,.5);F.roll+=(rt-F.roll)*Math.min(1,dt*2.6);
      F.yaw+=-9.8*Math.tan(F.roll)/Math.max(F.v,28)*5*dt;
      let vyT=F.v*Math.sin(F.pitch);const stall=S.vr*.9;if(F.v<stall)vyT-=(stall-F.v)*.9;if(landing&&F.alt<9&&Math.abs(jy)<=.15)vyT=-1.1-F.alt*.3;
      F.vy+=(vyT-F.vy)*Math.min(1,dt*2.4);F.alt+=F.vy*dt;if(F.alt>25)F.flew=true;if(F.alt>760){F.alt=760;F.vy=Math.min(0,F.vy);}
      if(F.alt>14&&F.vy>1)callout('gu','Positive rate. Gear up.');
      if(landing&&F.vy<0)[[500,'Five hundred'],[100,'One hundred'],[50,'Fifty'],[30,'Thirty'],[10,'Ten']].forEach(c=>{if(F.alt*3.3<c[0])callout('a'+c[0],c[1]);});
      if(F.alt<=0){F.alt=0;
        const okAp=Math.hypot(F.x-A.x,F.z-A.z)<760||Math.hypot(F.x-1100,F.z+600)<900;
        if(!isLand(F.x,F.z))crash('water');else if(F.vy<-11||Math.abs(F.roll)>.4)crash('hard');else if(!okAp)crash('field');
        else{F.onG=true;F.vy=0;puff(.3,.22,900);SMOKE.forEach((p,i)=>{p.position.set(F.x+rnd(-3,3),1,F.z+rnd(-3,3));p.userData.life=1+i*.08;p.scale.setScalar(1.5);});
          if(landing&&Math.hypot(F.x-A.x,F.z-A.z)<760&&F.flew){F.brake=true;levF.set(0);msg('🛬 Touchdown! Braking…',4000);say('Touchdown');}}}
      if(landing&&T.s>L.len*.78&&F.alt>14){F.wi=F.wps.findIndex(w=>w.gate);F.wps.forEach((w,i)=>{if(w.gate)RINGS[i].g.visible=true;});F.call={rot:1,v1:1,gu:1};msg('🔁 Going around for another try!',4500);say('Going around');}
    }
    F.gt=(F.onG||(nearApp&&Math.hypot(L.tx-F.x,L.tz-F.z)<1900)||(F.alt<14&&!F.flew))?1:0;if(F.gt===1&&F.gear<.05&&air)callout('gd'+F.wi,'Gear down');F.gear+=clamp(F.gt-F.gear,-dt*.45,dt*.45);
    const gg=PL.userData.gear;gg.scale.y=Math.max(.02,F.gear);gg.visible=F.gear>.04;PL.userData.props.forEach(p=>p.rotation.z+=dt*(12+thr*45));
    if(F.type==='prop')engine(.04+F.v/S.vmax*.12,700,.07+thr*.1,58+thr*70);else engine(.06+thr*.3+F.v/S.vmax*.1,500+thr*2600,.02+thr*.03,180+thr*420);
  }
  {const hc=hitCheck();if(hc){crash(hc);return;}if(F.onG&&hillH(F.x,F.z)>3){crash('hill');return;}}
  const cp=heli?1:Math.cos(F.pitch);F.x+=Math.sin(F.yaw)*F.v*cp*dt;F.z+=Math.cos(F.yaw)*F.v*cp*dt;
  if(F.x<-8400||F.x>4600||F.z<-8400||F.z>16900){let df=Math.atan2(-1500-F.x,5000-F.z)-F.yaw;df=Math.atan2(Math.sin(df),Math.cos(df));F.yaw+=clamp(df,-1,1)*dt*.9;}
  /* waypoints */
  if(!landing){const d3=Math.hypot(W.x-F.x,W.y-F.alt-2,W.z-F.z),px=F.wi?F.wps[F.wi-1].x:F.sx,pz=F.wi?F.wps[F.wi-1].z:F.sz,hit=d3<(W.gate?50:75),miss=!hit&&((F.x-W.x)*(W.x-px)+(F.z-W.z)*(W.z-pz))>0&&Math.hypot(F.x-W.x,F.z-W.z)<(F.auto?700:300);
    if(hit||miss){RINGS[F.wi].g.visible=false;F.wi++;if(hit){addStar(1);snd.ding();}const n=F.wps[F.wi];
      if(!n){msg(heli?'🚁 Now land on the H!':'🛬 Runway ahead. Nice and easy!',5000);say(heli?'Now land on the helipad.':'Runway in sight.');}
      else if(n.gate&&!W.gate){msg('🛬 Line up with the rings to land at '+A.name,5500);say('Now line up to land at '+A.name);}
      else if(!n.gate){msg('⭐ Next: '+n.name,4500);say('Next, '+n.name);}}}
  RINGS.forEach((r,i)=>{if(r.g.visible){r.g.lookAt(F.x,F.alt,F.z);if(i===F.wi)r.g.children[1].rotation.z+=dt*2;}});
  SMOKE.forEach(p=>{if(p.userData.life>0){p.userData.life-=dt;p.position.y+=dt*2;p.scale.multiplyScalar(1+dt*1.6);p.material.opacity=clamp(p.userData.life,0,1)*.5;}else p.material.opacity=0;});
  PL.position.set(F.x,F.alt+S.gh,F.z);PL.rotation.set(-F.pitch,F.yaw,F.roll);
  if(heli){PL.userData.rotor.rotation.y+=dt*F.rpm*30;PL.userData.trotor.rotation.x+=dt*F.rpm*50;}
  /* camera */
  const ck=PL.userData.ck,fwd=_fv.set(Math.sin(F.yaw),0,Math.cos(F.yaw)),shake=F.onG&&!heli?Math.sin(now*.06)*.012*F.v/S.vr:0;
  if(F.view==='cockpit'){PL.updateMatrixWorld();cam.position.copy(ck.localToWorld(new V3(-.46,shake*3,-.05)));cam.quaternion.copy(PL.quaternion).multiply(QY).multiply(_q.setFromEuler(_e.set(F.lpitch-.24,F.lyaw,0,'YXZ')));
    const y=ck.userData.yoke;if(heli){y.rotation.z=-jx*.25;y.rotation.x=jy*.25;}else{y.userData.wheel.rotation.z=Math.PI*.875-F.roll*1.6;y.position.z=.5-F.pitch*.25;ck.userData.thr.rotation.x=-.5+thr*1.0;}}
  else{const want=PL.position.clone().addScaledVector(fwd,-S.cb).add(new V3(0,S.cu+shake*8,0));if(cam.position.distanceTo(want)>400)cam.position.copy(want);else cam.position.lerp(want,1-Math.exp(-dt*4));cam.lookAt(PL.position.x+fwd.x*S.cb*.5,PL.position.y+S.cu*.2,PL.position.z+fwd.z*S.cb*.5);}
  /* HUD */
  const ax=T.x-F.x,az=T.z-F.z,ang=Math.atan2(-(ax*fwd.z-az*fwd.x),ax*fwd.x+az*fwd.z);
  $('arrow').style.transform='rotate('+(-ang)+'rad)';$('arrow').style.opacity=F.done||F.view==='cockpit'?0:1;
  if((F.fr++&3)===0){$('alt').textContent=Math.round(F.alt*3.3/10)*10+' ft · '+Math.round(F.v*1.9)+' kt';const gd=$('gear');gd.textContent=F.gear>.5?'GEAR ▼':'GEAR ▲';gd.style.background=F.gear>.5?'#35c46a':'#7a8194';
    $('dist').textContent=A.name+' '+(Math.hypot((heli?A.pad[0]:L.tx)-F.x,(heli?A.pad[1]:L.tz)-F.z)/300).toFixed(1)+' mi';if(F.view==='cockpit')drawPanels(T,dist,ang,A);}
  sunFollow(F.x,0,F.z,F.alt<60?240:520);
}
/* drag to look around in the cockpit */
(function(){let id=null,lx=0,ly=0;canvas.addEventListener('pointerdown',e=>{if(mode!=='fly'||F.view!=='cockpit')return;id=e.pointerId;lx=e.clientX;ly=e.clientY;});
  canvas.addEventListener('pointermove',e=>{if(e.pointerId!==id||mode!=='fly')return;F.lyaw=clamp(F.lyaw+(e.clientX-lx)*.006,-2.2,2.2);F.lpitch=clamp(F.lpitch+(e.clientY-ly)*.004,-.6,.5);lx=e.clientX;ly=e.clientY;});
  const up=e=>{if(e.pointerId===id)id=null;};canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);})();

/* keyboard shortcuts for a computer */
function flyKey(fn){return()=>{if(mode==='fly'&&F.phase==='fly')fn();};}
keyTap.l=keyTap.p=flyKey(()=>$('auto').click());
keyTap[' ']=()=>{if(mode==='fly'&&F.phase==='fly'){levF.set(0);msg('🛑 Power off',1500);}else if(mode==='train')$('horn').click();else if(mode==='tunnel')$('thorn').click();else if(mode==='acela')$('ahorn').click();else if(mode==='subway')$('shorn').click();};
for(let i=0;i<=9;i++)keyTap[''+i]=flyKey(()=>levF.set(i===0?1:i/10));
keyTap.c=keyTap.v=()=>{if(mode==='fly'&&F.phase!=='fly')return;if(mode==='fly'||mode==='train'||mode==='tunnel'||mode==='acela'||mode==='subway')$('camb').click();};keyTap.x=()=>{if(mode==='tunnel')$('txray').click();};keyTap.l=(o=>()=>{if(mode==='tunnel')$('tlight').click();else o();})(keyTap.l);
keyTap.Enter=()=>{if(mode==='fly'&&F.phase==='pick')$('pGo').click();else if(!$('again').classList.contains('hide'))$('again').click();};
keyTap.h=keyTap['?']=()=>{$('keys').classList.toggle('open');};
