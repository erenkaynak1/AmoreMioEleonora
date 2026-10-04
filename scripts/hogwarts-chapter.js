(()=>{
"use strict";

const q=s=>document.querySelector(s);
const qa=s=>[...document.querySelectorAll(s)];

const spellScene=q("#spellClassScene");
const spellWand=q("#spellLessonWand");
const spellFeather=q("#spellFeather");
const spellCanvas=q("#spellLessonTrail");
const voiceCard=q("#voiceCard");
const micBtn=q("#spellMicBtn");
const voiceFallback=q("#voiceFallback");
const voiceFeedback=q("#voiceFeedback");
const spellGestureHint=q("#spellGestureHint");
const spellContinue=q("#spellLessonContinue");

const libraryScene=q("#libraryScene");
const libraryLight=q("#libraryLight");
const hiddenBook=q("#hiddenBook");
const libraryDesk=q("#libraryDesk");
const libraryFeedback=q("#libraryFeedback");
const clueCard=q("#clueCard");
const clueContinue=q("#clueContinue");

const stairsScene=q("#stairsScene");
const stairsGame=q("#stairsGame");
const stairsMarker=q("#stairsMarker");
const stairsZone=q("#stairsZone");
const stairsAction=q("#stairsAction");
const stairsFeedback=q("#stairsFeedback");
const stairsResult=q("#stairsResult");
const stairsContinue=q("#stairsContinue");

const corridor=q("#corridorScene");
const mystery=q("#mysteryMessage");
const mysteryContinue=q("#mysteryContinue");
const finalEnd=q("#end");

let hxCtx=null;
let hxDpr=1;
let hxVoicePassed=false;
let hxDraggingWand=false;
let hxWandDistance=0;
let hxLast=null;

function tinyMagicSound(freq=640,duration=.28){
  try{
    const AC=window.AudioContext||window.webkitAudioContext;
    const ac=new AC();
    const o=ac.createOscillator();
    const g=ac.createGain();
    o.type="triangle";
    o.frequency.setValueAtTime(freq,ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(Math.max(90,freq*.42),ac.currentTime+duration);
    g.gain.setValueAtTime(.055,ac.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+duration);
    o.connect(g).connect(ac.destination);
    o.start();
    o.stop(ac.currentTime+duration);
    setTimeout(()=>ac.close().catch(()=>{}),(duration+0.1)*1000);
  }catch(e){}
}

function resizeSpellCanvas(){
  if(!spellCanvas)return;
  const r=spellCanvas.getBoundingClientRect();
  hxDpr=Math.min(window.devicePixelRatio||1,2);
  spellCanvas.width=Math.max(1,Math.floor(r.width*hxDpr));
  spellCanvas.height=Math.max(1,Math.floor(r.height*hxDpr));
  hxCtx=spellCanvas.getContext("2d");
  hxCtx.setTransform(hxDpr,0,0,hxDpr,0,0);
  hxCtx.lineCap="round";
  hxCtx.lineJoin="round";
}
function clearSpellTrail(){
  if(!hxCtx||!spellCanvas)return;
  const r=spellCanvas.getBoundingClientRect();
  hxCtx.clearRect(0,0,r.width,r.height);
}
function drawSpellTrail(from,to){
  if(!hxCtx||!spellCanvas)return;
  const r=spellCanvas.getBoundingClientRect();
  hxCtx.strokeStyle="rgba(246,220,157,.72)";
  hxCtx.lineWidth=4;
  hxCtx.shadowBlur=12;
  hxCtx.shadowColor="rgba(238,196,104,.8)";
  hxCtx.beginPath();
  hxCtx.moveTo(from.x-r.left,from.y-r.top);
  hxCtx.lineTo(to.x-r.left,to.y-r.top);
  hxCtx.stroke();
  hxCtx.shadowBlur=0;
}
function resetSpellWand(){
  hxDraggingWand=false;
  hxWandDistance=0;
  hxLast=null;
  clearSpellTrail();
  spellWand.style.left="12%";
  spellWand.style.bottom="10%";
  spellWand.style.top="";
  spellWand.style.transform="rotate(24deg)";
  spellWand.classList.remove("active");
}
function startSpellLesson(){
  if(corridor)corridor.classList.remove("show");
  if(mystery)mystery.classList.remove("show");
  spellScene.classList.add("show");
  spellFeather.classList.remove("lift");
  spellContinue.classList.remove("show");
  spellGestureHint.hidden=true;
  voiceCard.hidden=false;
  hxVoicePassed=false;
  resetSpellWand();
  requestAnimationFrame(resizeSpellCanvas);
}

function passVoice(){
  if(hxVoicePassed)return;
  hxVoicePassed=true;
  localStorage.setItem("amoremio.firstVoiceSpell","wingardium-leviosa");
  micBtn.classList.remove("listening");
  voiceFeedback.textContent="Perfetto. Ora completa l’incantesimo con il movimento della bacchetta.";
  voiceFallback.hidden=true;
  spellGestureHint.hidden=false;
  tinyMagicSound(760,.35);
}

if(mysteryContinue)mysteryContinue.addEventListener("click",startSpellLesson);

let recognition=null;
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
if(SR){
  recognition=new SR();
  recognition.lang="it-IT";
  recognition.interimResults=false;
  recognition.continuous=false;
  recognition.maxAlternatives=3;
  recognition.onresult=e=>{
    const all=[];
    for(let i=0;i<e.results.length;i++){
      for(let j=0;j<e.results[i].length;j++)all.push(e.results[i][j].transcript.toLowerCase());
    }
    const heard=all.join(" ");
    if(heard.includes("wingardium")||heard.includes("leviosa")||heard.includes("vingardium")){
      voiceFeedback.textContent="Incantesimo riconosciuto.";
      passVoice();
    }else{
      voiceFeedback.textContent="Quasi. Pronuncia lentamente: “Wingardium Leviosa”.";
    }
  };
  recognition.onerror=()=>{
    micBtn.classList.remove("listening");
    voiceFeedback.textContent="Il microfono non collabora. Puoi usare il comando alternativo.";
    voiceFallback.hidden=false;
  };
  recognition.onend=()=>micBtn.classList.remove("listening");
}else{
  voiceFeedback.textContent="Il riconoscimento vocale non è disponibile su questo browser.";
  voiceFallback.hidden=false;
}

if(micBtn)micBtn.addEventListener("click",()=>{
  if(!recognition){voiceFallback.hidden=false;return}
  try{
    micBtn.classList.add("listening");
    voiceFeedback.textContent="Sto ascoltando…";
    recognition.start();
  }catch(e){
    recognition.stop?.();
  }
});
if(voiceFallback)voiceFallback.addEventListener("click",()=>{
  voiceFeedback.textContent="Incantesimo pronunciato.";
  passVoice();
});

function wandTip(){
  const r=spellWand.getBoundingClientRect();
  return {x:r.left+r.width*.5,y:r.top+3};
}
if(spellWand){
  spellWand.addEventListener("pointerdown",e=>{
    if(!hxVoicePassed)return;
    e.preventDefault();
    hxDraggingWand=true;
    hxWandDistance=0;
    hxLast={x:e.clientX,y:e.clientY};
    spellWand.classList.add("active");
    spellWand.setPointerCapture?.(e.pointerId);
  });
  spellWand.addEventListener("pointermove",e=>{
    if(!hxDraggingWand)return;
    e.preventDefault();
    const sr=spellScene.getBoundingClientRect();
    const x=Math.max(8,Math.min(sr.width-32,e.clientX-sr.left));
    const y=Math.max(42,Math.min(sr.height-92,e.clientY-sr.top));
    spellWand.style.left=(x-12)+"px";
    spellWand.style.top=(y-20)+"px";
    spellWand.style.bottom="auto";
    if(hxLast){
      const dx=e.clientX-hxLast.x,dy=e.clientY-hxLast.y;
      hxWandDistance+=Math.hypot(dx,dy);
      const angle=Math.atan2(dy,dx)*180/Math.PI+90;
      spellWand.style.transform="rotate("+angle+"deg)";
      drawSpellTrail(hxLast,{x:e.clientX,y:e.clientY});
    }
    hxLast={x:e.clientX,y:e.clientY};
  });
  const endWand=e=>{
    if(!hxDraggingWand)return;
    hxDraggingWand=false;
    spellWand.classList.remove("active");
    const tip=wandTip();
    const fr=spellFeather.getBoundingClientRect();
    const near=tip.x>fr.left-150&&tip.x<fr.right+120&&tip.y>fr.top-170&&tip.y<fr.bottom+120;
    if(hxWandDistance>190&&near){
      spellFeather.classList.add("lift");
      spellGestureHint.textContent="La piuma si solleva.";
      spellContinue.classList.add("show");
      localStorage.setItem("amoremio.firstSpell","success");
      tinyMagicSound(880,.48);
    }else{
      spellGestureHint.textContent="Segui l’arco luminoso e termina il gesto vicino alla piuma.";
      setTimeout(clearSpellTrail,650);
    }
  };
  spellWand.addEventListener("pointerup",endWand);
  spellWand.addEventListener("pointercancel",endWand);
}
if(spellContinue)spellContinue.addEventListener("click",()=>{
  spellScene.classList.remove("show");
  startLibrary();
});

/* Library */
let hxLightDrag=false,hxLightDX=0,hxLightDY=0;
let hxBookDrag=false,hxBookDX=0,hxBookDY=0;

function startLibrary(){
  libraryScene.classList.add("show");
  hiddenBook.classList.remove("found");
  hiddenBook.style.left="";
  hiddenBook.style.right="15%";
  hiddenBook.style.top="37%";
  hiddenBook.style.bottom="";
  libraryDesk.classList.remove("ready");
  clueCard.classList.remove("show");
  libraryFeedback.textContent="Muovi la luce tra gli scaffali. Un libro reagirà alla cicatrice.";
  libraryLight.style.left="12%";
  libraryLight.style.top="55%";
}

function checkBookReveal(){
  const lr=libraryLight.getBoundingClientRect();
  const br=hiddenBook.getBoundingClientRect();
  const lx=lr.left+lr.width/2,ly=lr.top+lr.height/2;
  const bx=br.left+br.width/2,by=br.top+br.height/2;
  if(Math.hypot(lx-bx,ly-by)<135&&!hiddenBook.classList.contains("found")){
    hiddenBook.classList.add("found");
    libraryFeedback.textContent="Eccolo. Ora porta il libro sul tavolo.";
    tinyMagicSound(700,.3);
  }
}
if(libraryLight){
  libraryLight.addEventListener("pointerdown",e=>{
    e.preventDefault();hxLightDrag=true;
    const r=libraryLight.getBoundingClientRect();hxLightDX=e.clientX-r.left;hxLightDY=e.clientY-r.top;
    libraryLight.setPointerCapture?.(e.pointerId);
  });
  libraryLight.addEventListener("pointermove",e=>{
    if(!hxLightDrag)return;
    const r=libraryScene.getBoundingClientRect();
    const x=Math.max(0,Math.min(r.width-96,e.clientX-r.left-hxLightDX));
    const y=Math.max(90,Math.min(r.height-160,e.clientY-r.top-hxLightDY));
    libraryLight.style.left=x+"px";libraryLight.style.top=y+"px";
    checkBookReveal();
  });
  libraryLight.addEventListener("pointerup",()=>hxLightDrag=false);
  libraryLight.addEventListener("pointercancel",()=>hxLightDrag=false);
}
if(hiddenBook){
  hiddenBook.addEventListener("pointerdown",e=>{
    if(!hiddenBook.classList.contains("found"))return;
    e.preventDefault();hxBookDrag=true;
    const r=hiddenBook.getBoundingClientRect();hxBookDX=e.clientX-r.left;hxBookDY=e.clientY-r.top;
    hiddenBook.setPointerCapture?.(e.pointerId);
  });
  hiddenBook.addEventListener("pointermove",e=>{
    if(!hxBookDrag)return;
    const r=libraryScene.getBoundingClientRect();
    hiddenBook.style.right="auto";
    hiddenBook.style.left=(e.clientX-r.left-hxBookDX)+"px";
    hiddenBook.style.top=(e.clientY-r.top-hxBookDY)+"px";
    const d=libraryDesk.getBoundingClientRect();
    const hit=e.clientX>d.left&&e.clientX<d.right&&e.clientY>d.top&&e.clientY<d.bottom;
    libraryDesk.classList.toggle("ready",hit);
  });
  hiddenBook.addEventListener("pointerup",e=>{
    if(!hxBookDrag)return;hxBookDrag=false;
    const d=libraryDesk.getBoundingClientRect();
    const hit=e.clientX>d.left&&e.clientX<d.right&&e.clientY>d.top&&e.clientY<d.bottom;
    if(hit){
      hiddenBook.style.left="50%";
      hiddenBook.style.top="auto";
      hiddenBook.style.bottom="13%";
      hiddenBook.style.transform="translateX(-50%) rotate(90deg)";
      libraryDesk.classList.remove("ready");
      localStorage.setItem("amoremio.libraryClue","scar-symbol");
      setTimeout(()=>clueCard.classList.add("show"),450);
      tinyMagicSound(520,.32);
    }else{
      hiddenBook.style.left="";
      hiddenBook.style.right="15%";
      hiddenBook.style.top="37%";
      hiddenBook.style.bottom="";
      hiddenBook.style.transform="";
      libraryDesk.classList.remove("ready");
    }
  });
  hiddenBook.addEventListener("pointercancel",()=>hxBookDrag=false);
}
if(clueContinue)clueContinue.addEventListener("click",()=>{
  clueCard.classList.remove("show");
  libraryScene.classList.remove("show");
  startStairs();
});

/* Moving stairs */
let hxStairRound=0;
const hxDurations=[2.05,1.65,1.28];
function resetStairRound(){
  stairsMarker.style.animation="none";
  void stairsMarker.offsetWidth;
  stairsMarker.style.animation="stairsSweep "+hxDurations[Math.min(hxStairRound,2)]+"s linear infinite alternate";
}
function startStairs(){
  stairsScene.classList.add("show");
  stairsResult.classList.remove("show");
  hxStairRound=0;
  qa(".stairs-progress i").forEach(x=>x.classList.remove("done"));
  stairsFeedback.textContent="Aspetta che la scala entri nella zona verde, poi attraversa.";
  resetStairRound();
}
if(stairsAction)stairsAction.addEventListener("click",()=>{
  const mr=stairsMarker.getBoundingClientRect();
  const zr=stairsZone.getBoundingClientRect();
  const overlap=Math.max(0,Math.min(mr.right,zr.right)-Math.max(mr.left,zr.left));
  if(overlap>mr.width*.55){
    qa(".stairs-progress i")[hxStairRound]?.classList.add("done");
    hxStairRound++;
    tinyMagicSound(620+hxStairRound*90,.2);
    if(hxStairRound>=3){
      localStorage.setItem("amoremio.movingStairs","passed");
      stairsFeedback.textContent="Hai trovato il ritmo del castello.";
      setTimeout(()=>stairsResult.classList.add("show"),600);
    }else{
      stairsFeedback.textContent="Perfetto. La prossima si muove più in fretta.";
      resetStairRound();
    }
  }else{
    stairsGame.classList.remove("shake");void stairsGame.offsetWidth;stairsGame.classList.add("shake");
    stairsFeedback.textContent="Troppo presto. La scala si allontana.";
    tinyMagicSound(160,.18);
  }
});
if(stairsContinue)stairsContinue.addEventListener("click",()=>{
  stairsResult.classList.remove("show");
  stairsScene.classList.remove("show");
  if(finalEnd){
    finalEnd.querySelector("h2").textContent="Il castello ti sta osservando.";
    finalEnd.querySelector("p").textContent="La cicatrice, il libro e quella porta non sono una coincidenza. La vera avventura di Eleonora è appena iniziata.";
    finalEnd.classList.add("show");
  }
});

window.addEventListener("resize",()=>{
  if(spellScene?.classList.contains("show"))resizeSpellCanvas();
});
})();