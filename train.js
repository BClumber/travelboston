'use strict';
/* ---------- train mode ---------- */
const playerTrain=new Consist(['loco','coach','coach','coach','coach'],1,world),aiTrain=new Consist(['loco','coach','coach','coach'],1,world),aiExp=new Consist(['bullet','bulletmid','bulletmid','bulletT'],1,world),orange=new Consist(['metro','metro','metro','metro'],1,world);
const head=new THREE.SpotLight(0xfff0cc,1.5,280,.42,.7,1.1);world.add(head,head.target);
const TR={d:137,v:0,next:1,dwell:0,view:'cab',done:false,bellT:0,ai:RL*.5,exp:false,tf:0,yaw:-1.32,pitch:-.05,cyaw:0,cpitch:0,prov:false,swDone:false,fr:0,clack:0,lm:0,ot:0};
const LMK=[[HE+30,'Leaving South Station','Leaving South Station'],[300,'Under the highway, yard on the left','Rail yard on the left'],[R1+60,'Down into the Back Bay tunnel!','Here comes the tunnel!'],[T2+40,'Out of the tunnel. Orange Line on the right!','Look right, the Orange Line'],[FHd-120,'Forest Hills and the Arboretum hill','Forest Hills'],
  [HP+150,'Readville rail yard','Readville yard'],[HP+360,'Crossing the Neponset River','Neponset River'],[R128+230,'Blue Hills on the left, marsh all around','Blue Hills on the left'],[DJ-10,'Branching off to Stoughton','We take the Stoughton branch'],[VD-170,'Look right: the old stone viaduct!','Look right! The Canton viaduct'],[CC+200,'Through the woods to Stoughton','Next is the last stop'],[ST-330,'Stoughton clock tower ahead','Stoughton clock tower ahead']];
/* passenger interior, lives inside the first coach */
const cabin=(()=>{const g=new THREE.Group(),E=(c,e)=>new THREE.MeshStandardMaterial({color:C(c),roughness:.8,emissive:C(c),emissiveIntensity:e||.18}),wall=E('#d9dbd6'),fl=E('#3a3f4c',.1),seat=E('#2a4f8f',.2),hd=E('#6a2f8e',.22),metal=E('#9aa0a8',.15);
  const b=(w,h,d,m,x,y,z)=>{const q=box(w,h,d,m,x,y,z,g);return q;};
  b(3.06,.1,20.4,fl,0,1.25,0);b(3.06,.1,20.4,wall,0,4.12,0);b(.5,.05,19,GL('#fff8e6'),0,4.05,0);
  [-1.53,1.53].forEach(x=>{b(.08,1.15,20.4,wall,x,1.85,0);b(.08,.85,20.4,wall,x,3.7,0);for(let k=0;k<13;k++)b(.1,.9,.16,wall,x,2.85,8.55-1.489*k+.03);b(.5,.06,19.6,metal,x*.8,3.42,0);});
  [10.2,-10.2].forEach(z=>{b(3.06,2.9,.1,wall,0,2.7,z);b(.9,2.1,.12,E('#8d939c',.12),0,2.35,z*.999);b(.5,.7,.13,M('#16202c',{roughness:.1,metalness:.8}),0,3,z*.998);});
  for(let k=0;k<12;k++){const z=7.75-1.489*k;[-.9,.9].forEach(x=>{b(1.08,.42,.62,seat,x,1.72,z);const bk=b(1.08,.78,.12,seat,x,2.25,z-.36);bk.rotation.x=-.12;b(1.0,.14,.14,hd,x,2.68,z-.41).rotation.x=-.12;b(.06,.6,.06,metal,x*.36,1.5,z);});}
  g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});g.visible=false;playerTrain.cars[1].add(g);return g;})();
const tp=(d,o)=>TR.prov&&d>DJ?spos(d-DJ,o):rpos(d,o),tP=(d,o,y)=>{const p=tp(d,o);p.y+=y||0;return p;},tcover=d=>TR.prov&&d>DJ?0:cover(d);
const LMKP=LMK.slice(0,8).concat([[DJ-10,'Staying on the main line to Providence','Main line to Providence'],[DJ+VS-150,'Over the great stone viaduct!','We are crossing the Canton viaduct'],[DJ+PST[0].s+260,'Lake on the left','Look left, a lake'],[DJ+PST[1].s+120,'The stadium is off to the right','Stadium on the right'],[DJ+PST[2].s+900,'Almost in Rhode Island','Almost in Providence'],[DJ+SL-900,'Providence skyline and the State House dome','Providence ahead']]);
function setSwitch(v){if(TR.swDone)return;TR.prov=v;$('sw').textContent=v?'🔀 To Providence':'🔀 To Stoughton';$('sw').classList.toggle('on',v);}
const cabI=(()=>{const g=new THREE.Group(),E=(c,e)=>new THREE.MeshStandardMaterial({color:C(c),roughness:.75,emissive:C(c),emissiveIntensity:e||.22}),dk=E('#23262c'),md=E('#4a505a'),lt=E('#8a909a',.15),b=(w,h,d,m,x,y,z)=>box(w,h,d,m,x,y,z,g);
  b(3.1,.1,3.2,dk,0,2.3,8.5);b(3.1,.1,3.2,md,0,4.42,8.5);b(3.1,2.1,.1,md,0,3.35,6.95);[-1.56,1.56].forEach(x=>{b(.08,.95,3.2,md,x,2.8,8.5);b(.1,1.15,.12,dk,x,3.85,9.93);b(.1,1.15,.12,dk,x,3.85,8.3);b(.08,.1,3.2,dk,x,4.36,8.5);});
  b(.1,1.15,.1,dk,0,3.85,9.97);b(3.1,.16,.16,dk,0,4.36,9.95);b(3.1,.12,.2,dk,0,3.26,9.9);
  const desk=b(3.1,.75,.85,md,0,2.86,9.5);b(3.1,.06,.9,dk,0,3.24,9.48);
  const mk=()=>{const c=document.createElement('canvas');c.width=c.height=256;const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return {g:c.getContext('2d'),t};},sp=mk(),pl=new THREE.Mesh(new THREE.PlaneGeometry(.5,.5),new THREE.MeshBasicMaterial({map:sp.t,toneMapped:false}));
  pl.position.set(-.08,3.4,9.5);pl.rotation.set(-.45,Math.PI+.5,0,'YXZ');pl.scale.setScalar(.8);g.add(pl);b(.5,.02,.3,E('#111'),.2,3.28,9.3);[[.05,'#35c46a'],[.2,'#ffd23f'],[.35,'#e23d3d']].forEach(a=>b(.07,.04,.07,GL(a[1]),a[0],3.3,9.3));
  const lev=new THREE.Group();lev.position.set(-1.28,3.27,9.25);box(.05,.36,.05,lt,0,.18,0,lev);const kn=sph(.07,E('#c0261c',.4),0,.38,0,lev);g.add(lev);box(.3,.05,.4,dk,-1.28,3.28,9.25,g);
  const br=new THREE.Group();br.position.set(-.18,3.27,9.25);br.rotation.x=-.4;box(.05,.3,.05,lt,0,.15,0,br);box(.2,.06,.06,E('#111'),0,.32,0,br);g.add(br);
  b(.9,1.1,.5,E('#3a4a6a'),-.72,2.3,7.8);b(.9,1.2,.12,E('#3a4a6a'),-.72,3.1,7.5);
  g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});g.userData={sp,lev};g.visible=false;playerTrain.cars[0].add(g);return g;})();
function drawSpeedo(){const g=cabI.userData.sp.g,mph=TR.v*2.24;g.fillStyle='#0d1014';g.fillRect(0,0,256,256);g.strokeStyle='#cfd4dc';g.lineWidth=5;g.beginPath();g.arc(128,138,104,Math.PI*.8,Math.PI*2.2);g.stroke();g.fillStyle='#fff';g.font='700 17px Arial';g.textAlign='center';
  for(let m=0;m<=120;m+=20){const a=Math.PI*.8+m/120*Math.PI*1.4;g.fillText(m,128+Math.cos(a)*80,144+Math.sin(a)*80);g.fillRect(128+Math.cos(a)*98-2,138+Math.sin(a)*98-2,4,4);}
  const a=Math.PI*.8+Math.min(120,mph)/120*Math.PI*1.4;g.strokeStyle='#ff4a3a';g.lineWidth=6;g.beginPath();g.moveTo(128,138);g.lineTo(128+Math.cos(a)*88,138+Math.sin(a)*88);g.stroke();g.fillStyle='#ffe45e';g.font='800 40px Arial';g.fillText(Math.round(mph),128,214);g.font='700 15px Arial';g.fillStyle='#9aa';g.fillText('MPH',128,236);cabI.userData.sp.t.needsUpdate=true;}
function resetTrain(){TR.swDone=false;setSwitch(false);$('sw').classList.remove('hide');STNP.forEach(q=>q.called=0);TR.d=137;TR.v=0;TR.next=1;TR.dwell=0;TR.done=false;TR.lm=0;STN.forEach(s=>s.called=0);levT.set(0);TR.ai=RL*.5;}
function setView(v){TR.view=v;$('dash').classList.toggle('hide',v==='cab');cabin.visible=v==='seat';cabI.visible=v==='cab';cam.near=v==='seat'||v==='cab'?.15:(mode==='model'?.3:1);cam.updateProjectionMatrix();}
function trainTraffic(dt){
  TR.ai-=27*dt;if(TR.ai<250||TR.ai<TR.d-500){TR.ai=Math.min(DJ+SL-80,Math.max(TR.d,137)+1700);TR.exp=!TR.exp;}const A=TR.exp?aiExp:aiTrain,Bq=TR.exp?aiTrain:aiExp;A.place(aiPos,TR.ai,-1,.62);if(Bq.cars[0].position.y>-100)Bq.cars.forEach(c=>c.position.y=-200);
  TR.ot+=dt;const cyc=TR.ot%64,a=T2-100,b=FHd+52,k=cyc<26?ss(0,26,cyc):cyc<32?1:cyc<58?1-ss(32,58,cyc):0;orange.place((d)=>rpos(d,cyc<32?18:23),a+(b-a)*k,1,.62);
}
function updTrain(dt){
  if(keys.ArrowUp)levT.set(levT.v+dt*.7);if(keys.ArrowDown)levT.set(levT.v-dt*.9);
  const SN=TR.prov?STNP:STN,vmx=TR.prov&&TR.d>DJ+200?46:32;let target=levT.v*vmx;const ns=SN[TR.next],last=TR.next===SN.length-1;
  if(TR.dwell>0){TR.dwell-=dt;target=0;if(TR.dwell<=0&&!TR.done){msg('All aboard! Push the lever up 🟢');say('All aboard!');}}
  if(ns&&!TR.done){const rem=ns.d+52-TR.d;
    if(rem<420&&!ns.called){ns.called=1;msg('🛑 Next stop: '+ns.name,5000);say('Next stop, '+ns.name);snd.chime();}
    if(last)target=Math.min(target,Math.sqrt(Math.max(0,2*2.6*(rem-1))));else if(rem<130&&rem>-50)target=Math.min(target,11);
    if(Math.abs(rem)<75&&TR.v<.35&&TR.dwell<=0&&(levT.v<.08||last)){
      addStar(1);snd.ding();TR.next++;
      if(last){TR.done=true;levT.set(0);addStar(2);msg('🎉 You made it to '+ns.name+'!',8000);say(ns.name+'! Last stop. Great driving!');snd.fanfare();confetti();$('again').classList.remove('hide');}
      else{TR.dwell=4;msg('⭐ '+ns.name+'! Doors open',3500);say('This is '+ns.name);}
    }else if(rem<-90&&!last){TR.next++;}
  }
  const LK=TR.prov?LMKP:LMK,L=LK[TR.lm];if(L&&TR.d>L[0]){TR.lm++;if(TR.d<L[0]+80&&!(ns&&ns.called&&ns.d+52-TR.d<300)){msg('👀 '+L[1],4500);say(L[2]);}}
  TR.v+=clamp(target-TR.v,-7*dt,3.6*dt);if(TR.v<0)TR.v=0;TR.d=Math.min((TR.prov?DJ+SL:RL)-2,TR.d+TR.v*dt);
  if(TR.d>DJ-40&&!TR.swDone){TR.swDone=true;$('sw').classList.add('hide');}
  playerTrain.place(tp,TR.d,1,.62);trainTraffic(dt);
  /* crossings */
  let ring=false;const tm=performance.now()/350|0;XING.forEach(c=>{const act=!TR.prov&&TR.d>c.d-320&&TR.d<c.d+130;c.arms.forEach(a=>{const tg=act?0:a[1]*1.35;a[0].rotation.x+=(tg-a[0].rotation.x)*Math.min(1,dt*2.5);});c.lights.forEach((l,i)=>l.color.set(act&&((i+tm)%2)?'#ff2a2a':'#400'));if(act&&Math.abs(TR.d-c.d)<260)ring=true;});
  TR.bellT-=dt;if(ring&&TR.bellT<=0){snd.bell();TR.bellT=.55;}
  /* tunnel light level */
  const cv=tcover(TR.d-(TR.view==='seat'?32:0)),tgt=cv===2?(TR.d<HE?.55:1):0;TR.tf+=(tgt-TR.tf)*Math.min(1,dt*2.5);hemi.intensity=.4-.2*TR.tf;CAR.all.forEach(m=>m.envMapIntensity=1-.85*TR.tf);
  {const p=tP(TR.d-.5,0,3.2),q=tP(TR.d+60,0,.5);head.position.copy(p);head.target.position.copy(q);head.target.updateMatrixWorld();}
  /* camera */
  const sway=Math.sin(performance.now()*.0031)*.004*TR.v/32+Math.sin(performance.now()*.0113)*.002*TR.v/32;
  if(TR.view==='nose'){const p=tP(TR.d+.8,0,3.9),l=tP(TR.d+45,0,2.6);cam.position.copy(p);cam.lookAt(l);cam.rotateZ(sway);}
  else if(TR.view==='cab'){const c=playerTrain.cars[0];c.updateMatrixWorld();cam.position.copy(c.localToWorld(new V3(-.72,3.66+sway*3,8.5)));cam.quaternion.copy(c.quaternion).multiply(QYs).multiply(_q.setFromEuler(_e.set(TR.cpitch-.07,TR.cyaw,sway*2,'YXZ')));cabI.userData.lev.rotation.x=.55-levT.v*1.1;if((TR.fr++&7)===0)drawSpeedo();}
  else if(TR.view==='seat'){const c=playerTrain.cars[1];c.updateMatrixWorld();cam.position.copy(c.localToWorld(new V3(-.66,2.86+sway*4,1.88)));cam.quaternion.copy(c.quaternion).multiply(QYs).multiply(_q.setFromEuler(_e.set(TR.pitch,TR.yaw,sway*2,'YXZ')));}
  else{const c2=tcover(TR.d-30),want=c2===2?tP(TR.d-46,0,TR.d<HE+40?7:5.9):c2===1?tP(TR.d-62,-3.5,12.5):tP(TR.d-78,-20,17);if(cam.position.distanceTo(want)>220)cam.position.copy(want);else cam.position.lerp(want,1-Math.exp(-dt*3.2));cam.lookAt(tP(TR.d-14,0,3));}
  {const f=tP(TR.d+(TR.view==='cab'||TR.view==='nose'?40:-30),0,0);sunFollow(f.x,f.y,f.z,TR.view==='cab'||TR.view==='nose'?150:185);}
  $('spd').textContent=Math.round(TR.v*2.24);
  TR.clack+=TR.v*dt;if(TR.clack>13){TR.clack=0;if(TR.v>2){puff(.05+TR.v/32*.14,.05,260);setTimeout(()=>puff(.04+TR.v/32*.11,.05,220),70+900/Math.max(4,TR.v));}}
  engine((.04+Math.min(1,TR.v/32)*.3)*(1+TR.tf*.7),160+TR.v*22+TR.tf*120,.05+levT.v*.07,34+TR.v*2.2);
}
const QYs=new THREE.Quaternion().setFromAxisAngle(new V3(0,1,0),Math.PI),_q=new THREE.Quaternion(),_e=new THREE.Euler();
function trainIdle(dt){trainTraffic(dt);playerTrain.place(rpos,137,1,.62);hemi.intensity=.4;CAR.all.forEach(m=>m.envMapIntensity=1);}
/* drag to look around from the passenger seat */
(function(){let id=null,lx=0,ly=0;canvas.addEventListener('pointerdown',e=>{if(mode!=='train'||(TR.view!=='seat'&&TR.view!=='cab'))return;id=e.pointerId;lx=e.clientX;ly=e.clientY;});
  canvas.addEventListener('pointermove',e=>{if(e.pointerId!==id||mode!=='train')return;if(TR.view==='cab'){TR.cyaw=clamp(TR.cyaw+(e.clientX-lx)*.006,-1.9,1.9);TR.cpitch=clamp(TR.cpitch+(e.clientY-ly)*.004,-.5,.4);}else{TR.yaw=clamp(TR.yaw+(e.clientX-lx)*.006,-2.6,2.6);TR.pitch=clamp(TR.pitch+(e.clientY-ly)*.004,-.6,.5);}lx=e.clientX;ly=e.clientY;});
  const up=e=>{if(e.pointerId===id)id=null;};canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);})();

$('sw').onclick=()=>{audioInit();if(TR.swDone)return;setSwitch(!TR.prov);msg(TR.prov?'🔀 Switch set: main line to Providence':'🔀 Switch set: branch to Stoughton',3500);say(TR.prov?'Switch set for Providence':'Switch set for Stoughton');};
