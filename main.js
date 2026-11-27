'use strict';
/* =====================================================================
   mode switching + loop
   ===================================================================== */
let mode='menu';
function setMode(m){if(m!==mode&&typeof camDip==='function')camDip();mode=m;if(typeof tmShow==='function')setTimeout(tmShow,0);LBL.forEach(sp=>sp.visible=m==='fly'||(m==='train'&&!sp.userData.rail));$('keys').classList.toggle('hide',m!=='fly'&&m!=='train');$('kFly').classList.toggle('hide',m!=='fly');$('kTrain').classList.toggle('hide',m!=='train');cam.up.set(0,1,0);$('menu').classList.toggle('hide',m!=='menu');$('hud').classList.toggle('hide',m==='menu');
  $('hTrain').classList.toggle('hide',m!=='train');$('hFly').classList.toggle('hide',m!=='fly');$('hModel').classList.toggle('hide',m!=='model');$('hTun').classList.toggle('hide',m!=='tunnel');$('hAc').classList.toggle('hide',m!=='acela');$('hSub').classList.toggle('hide',m!=='subway');$('again').classList.add('hide');
  flyShow(m==='fly');$('pick').classList.add('hide');
  cam.near=(m==='model'||m==='tunnel'||m==='subway')?.3:1;cam.updateProjectionMatrix();
  setView('cab');if(m!=='train'){hemi.intensity=HEMI_I;CAR.all.forEach(q=>q.envMapIntensity=1);}
  if(m==='train'){resetTrain();msg('Push the lever up to go! 🚆',6000);say('Welcome aboard! Push the lever up to go.');}
  if(m==='fly')openPicker();
  if(m==='model'){if(!model)buildModel();MT.ride=false;msg('Tap ✏️ and draw your own track!',6000);}
  if(m==='tunnel'){if(!tun)buildTunnel();tReset();$('msg').style.opacity=0;tBig('🚗','Push the lever up to drive!',6000);}
  if(m==='acela'){if(!ace)buildAcela();aReset();$('msg').style.opacity=0;aBig('🚄','Push the lever up to go!',6000);say('All aboard! Push the lever up to go.');}
  if(m==='subway'){$('msg').style.opacity=0;subPick();}
  if(m==='menu'){engine(0,200,0,40);try{speechSynthesis.cancel();}catch(e){}}
}
/* phones: go full screen and turn the game sideways, even when the phone or the app showing it will not rotate */
function goWide(){if(!matchMedia('(pointer:coarse)').matches)return;const el=document.documentElement,lock=()=>{try{if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(()=>{});}catch(e){}setTimeout(resize,300);setTimeout(resize,900);};
  try{if(!document.fullscreenElement&&el.requestFullscreen)el.requestFullscreen({navigationUI:'hide'}).then(lock).catch(lock);else if(!document.webkitFullscreenElement&&el.webkitRequestFullscreen){el.webkitRequestFullscreen();lock();}else lock();}catch(e){lock();}}
document.querySelectorAll('.card').forEach(b=>b.onclick=()=>{audioInit();goWide();setMode(b.dataset.m);});
$('turn').onclick=goWide;
['orientationchange','fullscreenchange'].forEach(ev=>addEventListener(ev,()=>{resize();setTimeout(resize,250);setTimeout(resize,800);}));if(screen.orientation&&screen.orientation.addEventListener)screen.orientation.addEventListener('change',()=>{setTimeout(resize,250);});if(window.visualViewport)visualViewport.addEventListener('resize',()=>resize());
$('home').onclick=()=>setMode('menu');
$('mute').onclick=()=>{muted=!muted;$('mute').textContent=muted?'🔇':'🔊';if(master)master.gain.value=muted?0:.8;if(muted)try{speechSynthesis.cancel();}catch(e){}};
$('camb').onclick=()=>{if(mode==='train'){const nv={cab:'nose',nose:'seat',seat:'out',out:'cab'}[TR.view];setView(nv);msg({cab:"🚆 Driver's cab. Drag to look around",nose:'📷 Front camera',seat:'💺 Passenger seat. Drag to look around',out:'🎥 Outside view'}[nv],3000);}else if(mode==='fly'&&FL.phase!=='pick'){setFlyView(FL.view==='chase'?'cockpit':'chase');msg(FL.view==='cockpit'?'🧑‍✈️ Cockpit. Drag to look around':'🎥 Outside view',3000);}else if(mode==='model')MT.ride=!MT.ride;else if(mode==='subway'){subNextView();}else if(mode==='acela'){AC_.view={out:'nose',nose:'side',side:'out'}[AC_.view];msg({out:'🎥 Outside view',nose:'📷 Front of the train',side:'💺 Window seat'}[AC_.view],2500);}else if(mode==='tunnel'){TU.view=TU.view==='chase'?'drive':'chase';if(TU.xray)tXray(false);msg(TU.view==='drive'?"🧑 Driver's seat":'🎥 Outside view',2500);}};
$('horn').onclick=()=>{audioInit();snd.horn();};$('bell').onclick=()=>{audioInit();snd.bell();setTimeout(snd.bell,400);};
$('again').onclick=()=>{$('again').classList.add('hide');if(mode==='train'){resetTrain();msg('Push the lever up to go! 🚆');}else if(mode==='fly')openPicker();};

let last=performance.now(),mt=0,lastRaw=performance.now(),fAcc=0,fN=0,qLevel=0;
/* ---------- PASS 3: camera and lens ----------
   View changes ease over ~0.85 s instead of cutting, scene changes dip through black,
   and each kind of shot gets its own focal length (wide inside, longer outside, long on the skyline). */
const CF={t:1,fp:new V3(),fq:new THREE.Quaternion(),tp:new V3(),tq:new THREE.Quaternion(),lp:new V3(),lq:new THREE.Quaternion()};
function camBlend(){CF.fp.copy(CF.lp);CF.fq.copy(CF.lq);CF.t=0;}
function camDip(){const f=$('fade');if(!f)return;f.style.transition='none';f.style.opacity=1;requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.transition='opacity .75s ease-out';f.style.opacity=0;}));CF.t=1;}
function lensFor(){if(mode==='menu')return 40;if(mode==='model')return 50;const v=mode==='train'?TR.view:mode==='fly'?F.view:mode==='subway'?SB.view:mode==='acela'?AC_.view:mode==='tunnel'?TU.view:'';
  return /cab|seat|nose|cock|drive/.test(v||'')?64:v==='side'?44:52;}
function camFilm(dt){if(CF.t<1){if(CF.fp.distanceTo(cam.position)>260)CF.t=1;else{CF.t=Math.min(1,CF.t+dt/.85);const t=CF.t,k=t*t*t*(t*(t*6-15)+10);CF.tp.copy(cam.position);CF.tq.copy(cam.quaternion);cam.position.lerpVectors(CF.fp,CF.tp,k);cam.quaternion.copy(CF.fq).slerp(CF.tq,k);}}
  CF.lp.copy(cam.position);CF.lq.copy(cam.quaternion);const tf=lensFor()*(innerWidth<innerHeight?1.3:1);if(Math.abs(cam.fov-tf)>.05){cam.fov+=(tf-cam.fov)*Math.min(1,dt*3.2);cam.updateProjectionMatrix();}}
$('camb').addEventListener('click',camBlend,true);
(function(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),im=g.createImageData(128,128);for(let i=0;i<im.data.length;i+=4){const k=Math.random()*255|0;im.data[i]=im.data[i+1]=im.data[i+2]=k;im.data[i+3]=255;}g.putImageData(im,0,0);const e=$('grain');if(e)e.style.backgroundImage='url('+c.toDataURL()+')';})();
/* ---------- play timer: a grown-up sets it, the game counts down and ends itself kindly ---------- */
const TM={len:0,left:0,done:false,w:{},steps:[0,5,10,15,20,30]};
function tmShow(){const on=TM.len>0;$('tset').textContent=on?'⏱️ '+TM.len+' min':'⏱️ Off';$('tset').classList.toggle('hide',mode!=='menu');const play=on&&mode!=='menu'&&!TM.done;$('tmr').classList.toggle('hide',!play);$('tbar').classList.toggle('hide',!on||TM.done);
  if(on){const mins=Math.ceil(TM.left/60);$('tmr').lastChild.textContent=mins;$('tmr').classList.toggle('low',TM.left<=60);const f=TM.left/(TM.len*60),b=$('tbar').firstChild;b.style.width=(f*100)+'%';b.style.background=TM.left<=60?'#e23d3d':TM.left<=120?'#ffd23f':'#35c46a';}}
function tmSet(n){TM.len=n;TM.left=n*60;TM.done=false;TM.w={};try{localStorage.setItem('tb_timer',n);}catch(e){}tmShow();}
function tmTick(s){if(!TM.len||TM.done||mode==='menu')return;const b=TM.left;TM.left=Math.max(0,TM.left-s);
  const at=(t,k,txt,sp)=>{if(b>t&&TM.left<=t&&!TM.w[k]&&TM.len*60>t+20){TM.w[k]=1;msg(txt,5000);say(sp);snd.chime();}};at(120,'a','⏳ 2 more minutes','Two more minutes. Then we are all done.');at(60,'b','⏳ 1 more minute','One more minute.');at(10,'c','⏳ Almost done','Almost done. Time to say bye bye.');
  if((b|0)!==(TM.left|0))tmShow();
  if(TM.left<=0){TM.done=true;setMode('menu');$('tdone').classList.remove('hide');$('tset').classList.add('hide');tmShow();snd.chime();say('All done! Great job today. Bye bye, trains!');}}
(function(){let n=0;try{n=+localStorage.getItem('tb_timer')||0;}catch(e){}TM.len=n;TM.left=n*60;
  let h=null;const ts=$('tset'),up=()=>{if(h){clearTimeout(h);h=null;msg('⏱️ Grown-ups: press and hold to change the play timer',3200);}};
  ts.addEventListener('pointerdown',e=>{e.preventDefault();h=setTimeout(()=>{h=null;const i=TM.steps.indexOf(TM.len);tmSet(TM.steps[(i+1)%TM.steps.length]);msg(TM.len?'⏱️ Play time: '+TM.len+' minutes':'⏱️ Timer off',2600);},650);});ts.addEventListener('pointerup',up);ts.addEventListener('pointerleave',()=>{if(h){clearTimeout(h);h=null;}});
  let g=null;const tm=$('tmore'),off=()=>{if(g){clearTimeout(g);g=null;}tm.classList.remove('h');};tm.addEventListener('pointerdown',e=>{e.preventDefault();tm.classList.add('h');g=setTimeout(()=>{g=null;tm.classList.remove('h');$('tdone').classList.add('hide');tmSet(TM.len);},3000);});['pointerup','pointerleave','pointercancel'].forEach(k=>tm.addEventListener(k,off));setTimeout(tmShow,0);})();
function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  for(let w=0;w<(window.__warp||1);w++){if(mode==='train')updTrain(dt);else if(mode==='fly')updFly(dt);else if(mode==='model')updModel(dt);else if(mode==='tunnel')updTunnel(dt);else if(mode==='acela')updAcela(dt);else if(mode==='subway')updSubway(dt);}
  if(mode==='menu'){mt+=dt;const a=mt*.06+2.2;cam.position.set(-120+Math.sin(a)*520,170,-180+Math.cos(a)*520);cam.lookAt(-150,40,-260);trainIdle(dt);sunFollow(-200,0,-380,760);}
  if(mode!=='model'&&mode!=='tunnel'&&mode!=='acela'&&mode!=='subway'){updTraffic(dt);updLife(dt);}
  tmTick(Math.min(1,(now-lastRaw)/1000)*(window.__tmWarp||1));
  camFilm(dt);
  if(window.__dbgCam){const q=window.__dbgCam;cam.position.set(q[0],q[1],q[2]);cam.lookAt(q[3],q[4],q[5]);}
  if(mode==='model')renderer.render(model.scene,cam);else if(mode==='tunnel')renderer.render(tun.scene,cam);else if(mode==='acela')renderer.render(ace.scene,cam);else if(mode==='subway')renderer.render(sub.scene,cam);else{sky.position.copy(cam.position);sunSpr.position.copy(cam.position).addScaledVector(SD,10500);WU.uT.value+=dt;renderer.render(world,cam);}
  fAcc+=(now-lastRaw)/1000;lastRaw=now;if(++fN>=80){const fps=fN/fAcc;fAcc=0;fN=0;if(fps<24&&!window.__noAdapt&&qLevel<2){qLevel++;if(qLevel===1){PR=Math.min(PR,1.3);renderer.setPixelRatio(PR);resize();}else{sun.castShadow=false;if(model)model.scene.traverse(o=>{if(o.isDirectionalLight)o.castShadow=false;});}}}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.__sim={TU,levU,AC_,levA,AST,SB,levS,SUBL,subStart,subView,setMode,setView,TR,FL,MT,levT,levF,joy,STN,RL,XING,APT,startFlight,setFlyView,STNP,PST,SL,setSwitch,GEO,K:{VD,VRA,BB,RG,T1,T2,R1,HP,R128,CJ,CC,ST,FHd,DJ,HE}};
LBL.forEach(sp=>sp.visible=false);
