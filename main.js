'use strict';
/* =====================================================================
   mode switching + loop
   ===================================================================== */
let mode='menu';
function setMode(m){mode=m;LBL.forEach(sp=>sp.visible=!(m==='train'&&sp.userData.rail));$('keys').classList.toggle('hide',m!=='fly'&&m!=='train');$('kFly').classList.toggle('hide',m!=='fly');$('kTrain').classList.toggle('hide',m!=='train');cam.up.set(0,1,0);$('menu').classList.toggle('hide',m!=='menu');$('hud').classList.toggle('hide',m==='menu');
  $('hTrain').classList.toggle('hide',m!=='train');$('hFly').classList.toggle('hide',m!=='fly');$('hModel').classList.toggle('hide',m!=='model');$('again').classList.add('hide');
  flyShow(m==='fly');$('pick').classList.add('hide');
  cam.near=m==='model'?.3:1;cam.updateProjectionMatrix();
  setView('cab');if(m!=='train'){hemi.intensity=.4;CAR.all.forEach(q=>q.envMapIntensity=1);}
  if(m==='train'){resetTrain();msg('Push the lever up to go! 🚆',6000);say('Welcome aboard! Push the lever up to go.');}
  if(m==='fly')openPicker();
  if(m==='model'){if(!model)buildModel();MT.ride=false;msg('Tap ✏️ and draw your own track!',6000);}
  if(m==='menu'){engine(0,200,0,40);try{speechSynthesis.cancel();}catch(e){}}
}
document.querySelectorAll('.card').forEach(b=>b.onclick=()=>{audioInit();setMode(b.dataset.m);});
$('home').onclick=()=>setMode('menu');
$('mute').onclick=()=>{muted=!muted;$('mute').textContent=muted?'🔇':'🔊';if(master)master.gain.value=muted?0:.8;if(muted)try{speechSynthesis.cancel();}catch(e){}};
$('camb').onclick=()=>{if(mode==='train'){const nv={cab:'nose',nose:'seat',seat:'out',out:'cab'}[TR.view];setView(nv);msg({cab:"🚆 Driver's cab. Drag to look around",nose:'📷 Front camera',seat:'💺 Passenger seat. Drag to look around',out:'🎥 Outside view'}[nv],3000);}else if(mode==='fly'&&FL.phase!=='pick'){setFlyView(FL.view==='chase'?'cockpit':'chase');msg(FL.view==='cockpit'?'🧑‍✈️ Cockpit. Drag to look around':'🎥 Outside view',3000);}else if(mode==='model')MT.ride=!MT.ride;};
$('horn').onclick=()=>{audioInit();snd.horn();};$('bell').onclick=()=>{audioInit();snd.bell();setTimeout(snd.bell,400);};
$('again').onclick=()=>{$('again').classList.add('hide');if(mode==='train'){resetTrain();msg('Push the lever up to go! 🚆');}else if(mode==='fly')openPicker();};

let last=performance.now(),mt=0,lastRaw=performance.now(),fAcc=0,fN=0,qLevel=0;
function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  for(let w=0;w<(window.__warp||1);w++){if(mode==='train')updTrain(dt);else if(mode==='fly')updFly(dt);else if(mode==='model')updModel(dt);}
  if(mode==='menu'){mt+=dt;const a=mt*.06+2.2;cam.position.set(-120+Math.sin(a)*520,170,-180+Math.cos(a)*520);cam.lookAt(-150,40,-260);trainIdle(dt);sunFollow(-200,0,-380,760);}
  if(mode!=='model')updTraffic(dt);
  if(mode==='model')renderer.render(model.scene,cam);else{sky.position.copy(cam.position);sunSpr.position.copy(cam.position).addScaledVector(SD,10500);waterN.offset.x+=dt*.012;waterN.offset.y+=dt*.007;renderer.render(world,cam);}
  fAcc+=(now-lastRaw)/1000;lastRaw=now;if(++fN>=80){const fps=fN/fAcc;fAcc=0;fN=0;if(fps<24&&!window.__noAdapt&&qLevel<2){qLevel++;if(qLevel===1){PR=Math.min(PR,1.3);renderer.setPixelRatio(PR);resize();}else{sun.castShadow=false;if(model)model.scene.traverse(o=>{if(o.isDirectionalLight)o.castShadow=false;});}}}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.__sim={setMode,setView,TR,FL,MT,levT,levF,joy,STN,RL,XING,APT,startFlight,setFlyView,STNP,PST,SL,setSwitch,GEO,K:{VD,VRA,BB,RG,T1,T2,R1,HP,R128,CJ,CC,ST,FHd,DJ,HE}};
