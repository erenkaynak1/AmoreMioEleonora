(()=>{
"use strict";
const app=document.querySelector(".app");
if(!app)return;

const A={adult:"assets/characters/eleonora-adult-hero.png"};
let root=null,timers=[],activeZones=new Set(),dragging=false,dragDX=0,dragDY=0;
const years=["1996","2008","2015","2020","4 OTTOBRE 2026"];

function later(fn,ms){const t=setTimeout(fn,ms);timers.push(t);return t}
function clearTimers(){timers.forEach(clearTimeout);timers=[]}

function memorySummary(){
  const traitMap={curiosita:"la tua curiosità",dolcezza:"la tua dolcezza",determinazione:"la tua determinazione"};
  const sortMap={coraggio:"il tuo coraggio",curiosita:"la tua curiosità",lealta:"la tua lealtà",ambizione:"la tua ambizione"};
  const wandMap={nocciolo:"la bacchetta di nocciolo",quercia:"la bacchetta di quercia",ebano:"la bacchetta d’ebano"};
  const bits=[
    traitMap[localStorage.getItem("amoremio.firstTrait")],
    sortMap[localStorage.getItem("amoremio.sortingValue")],
    wandMap[localStorage.getItem("amoremio.wand")]
  ].filter(Boolean);
  return bits.length
    ? "Il castello ricorda "+bits.join(", ")+". Ogni scelta ti ha portata fin qui."
    : "Ogni scelta, ogni porta e ogni incantesimo ti hanno portata fin qui.";
}

function createLight(parent,i,extra){
  const l=document.createElement("i");
  l.className="bf-light"+(extra?" "+extra:"");
  const ring=Math.floor(i/10);
  const local=i%10;
  const x=8+local*9.1+(ring%2)*2.4;
  const y=11+ring*28+Math.sin((i+2)*1.7)*7;
  l.style.left=x+"%";
  l.style.top=y+"%";
  l.dataset.index=String(i);
  parent.appendChild(l);
  return l;
}

function ensure(){
  if(root)return root;
  root=document.createElement("section");
  root.id="birthdayFinale";
  root.className="birthday-final";

  const yearsHtml=years.map(function(y){return '<div class="bf-year">'+y+'</div>';}).join("");
  root.innerHTML=
    '<div id="bfMontage" class="bf-phase bf-montage">'+
      '<img class="bf-bg" src="'+A.adult+'" alt="">'+
      '<div class="bf-shade"></div>'+
      '<div class="bf-years">'+yearsHtml+'</div>'+
      '<div class="bf-copy">'+
        '<div class="bf-kicker">IL TEMPO PASSA</div>'+
        '<h2>La magia cresce con lei.</h2>'+
        '<p>Le lezioni diventano ricordi. I corridoi diventano familiari. Gli anni corrono più veloci delle scale del castello.</p>'+
      '</div>'+
    '</div>'+

    '<div id="bfLetterScene" class="bf-phase bf-letter-scene">'+
      '<div class="bf-shade"></div>'+
      '<div class="bf-owl-shadow" aria-hidden="true"></div>'+
      '<button id="bfEnvelope" class="bf-envelope" type="button" aria-label="Apri la seconda lettera"></button>'+
      '<div class="bf-copy" id="bfLetterHint">'+
        '<div class="bf-kicker">4 OTTOBRE 2026</div>'+
        '<h2>Trent’anni dopo.</h2>'+
        '<p>Alla finestra torna un battito d’ali che Eleonora non sentiva da molti anni.</p>'+
        '<button id="bfOpenEnvelope" class="bf-btn" type="button">Apri la seconda lettera</button>'+
      '</div>'+
      '<article id="bfLetterPaper" class="bf-letter-paper">'+
        '<h2>Cara Eleonora,</h2>'+
        '<p>sono passati trent’anni dalla notte in cui la tua storia è cominciata.</p>'+
        '<p>Hai imparato che alcune porte si aprono con una chiave, altre con una bacchetta. Ma nel castello ne esiste ancora una che non hai mai aperto.</p>'+
        '<p><strong>Torna dove la magia ha pronunciato il tuo nome per la prima volta.</strong></p>'+
        '<p>Porta con te la tua bacchetta. La cicatrice saprà indicarti la strada.</p>'+
        '<p class="bf-sign">Ti aspettiamo.</p>'+
        '<button id="bfGoChamber" class="bf-btn" type="button">Torna al castello</button>'+
      '</article>'+
    '</div>'+

    '<div id="bfChamber" class="bf-phase bf-chamber">'+
      '<div class="bf-chamber-flash"></div>'+
      '<div class="bf-chamber-title">'+
        '<b>La Stanza dei Trent’Anni</b>'+
        '<span>La porta si apre quando la cicatrice si illumina. Dentro, trenta luci attendono nel buio.</span>'+
      '</div>'+
      '<div id="bfLights" class="bf-lights"></div>'+
      '<div class="bf-memory-zone z1" data-zone="0">1996–2005</div>'+
      '<div class="bf-memory-zone z2" data-zone="1">2006–2015</div>'+
      '<div class="bf-memory-zone z3" data-zone="2">2016–2026</div>'+
      '<div id="bfWandLight" class="bf-wand-light" role="button" tabindex="0" aria-label="Muovi la bacchetta tra le luci"></div>'+
      '<div id="bfCounter" class="bf-counter">Luci: 0 / 30</div>'+
    '</div>'+

    '<div id="bfReveal" class="bf-phase bf-reveal">'+
      '<img class="bf-bg" src="'+A.adult+'" alt="">'+
      '<div class="bf-shade"></div>'+
      '<div id="bfCrown" class="bf-crown"></div>'+
      '<div id="bfFinalGate" class="bf-final-gate">'+
        '<div class="bf-kicker">4 OTTOBRE 2026</div>'+
        '<div id="bfFinalEnvelope" class="bf-final-envelope" aria-hidden="true"><i>30</i></div>'+
        '<h2>Un’ultima lettera.</h2>'+
        '<p>Per aprirla devi usare le parole magiche.</p>'+
        '<div class="bf-magic-phrase">Deep Purple</div>'+
        '<button id="bfFinalMic" class="bf-final-mic" type="button"><span class="bf-mic-icon">🎙</span><span>Pronuncia le parole magiche</span></button>'+
        '<div id="bfFinalVoiceStatus" class="bf-final-voice-status">Tocca il microfono e pronuncia “Deep Purple”.</div>'+
        '<button id="bfFinalFallback" class="bf-btn bf-final-fallback" type="button" hidden>Apri comunque la lettera</button>'+
      '</div>'+
      '<article id="bfFinalLetter" class="bf-final-letter">'+
        '<div class="bf-kicker">4 OTTOBRE 2026</div>'+
        '<h2>Buon 30° compleanno, Eleonora.</h2>'+
        '<p id="bfMemorySummary" class="bf-memory-summary"></p>'+
        '<p>Cara Eleonora,</p>'+
        '<p>la magia ti ha accompagnata per trent’anni. Ha attraversato con te ogni porta, ogni scelta, ogni piccola meraviglia.</p>'+
        '<p class="bf-final-line">Io spero di accompagnarti in tutti quelli che verranno.</p>'+
        '<p class="bf-signature">Con tutto il mio amore,<br>Eren ♥</p>'+
        '<button id="bfReplayFinale" class="bf-btn" type="button">Rivedi questo momento</button>'+
      '</article>'+
    '</div>';

  app.appendChild(root);

  const lights=root.querySelector("#bfLights");
  for(let i=0;i<30;i++)createLight(lights,i,"");

  const crown=root.querySelector("#bfCrown");
  for(let i=0;i<30;i++){
    const l=createLight(crown,i,"on");
    const a=(i/30)*Math.PI*2;
    l.style.left=(50+43*Math.cos(a))+"%";
    l.style.top=(48+37*Math.sin(a))+"%";
  }

  root.querySelector("#bfOpenEnvelope").addEventListener("click",openLetter);
  root.querySelector("#bfEnvelope").addEventListener("click",openLetter);
  root.querySelector("#bfGoChamber").addEventListener("click",showChamber);
  root.querySelector("#bfReplayFinale").addEventListener("click",start);
  setupWand();
  setupFinalLetter();
  return root;
}

function phase(selector){
  const el=ensure();
  el.querySelectorAll(".bf-phase").forEach(function(x){x.classList.remove("active");});
  const p=el.querySelector(selector);
  if(p)p.classList.add("active");
}

function start(){
  clearTimers();
  const el=ensure();
  el.classList.add("show");
  activeZones.clear();
  el.querySelectorAll(".bf-memory-zone").forEach(function(x){x.classList.remove("done");});
  el.querySelectorAll("#bfLights .bf-light").forEach(function(x){x.classList.remove("on");});
  el.querySelector("#bfCounter").textContent="Luci: 0 / 30";
  el.querySelector("#bfLetterPaper").classList.remove("show");
  el.querySelector("#bfEnvelope").classList.remove("open");
  el.querySelector("#bfLetterHint").style.display="";
  resetFinalLetterGate();
  phase("#bfMontage");

  const ys=[].slice.call(el.querySelectorAll(".bf-year"));
  ys.forEach(function(x){x.classList.remove("on");});
  ys.forEach(function(y,i){later(function(){y.classList.add("on");},350+i*430);});
  later(function(){phase("#bfLetterScene");},2850);
}

function openLetter(){
  const el=ensure();
  el.querySelector("#bfEnvelope").classList.add("open");
  el.querySelector("#bfLetterHint").style.display="none";
  later(function(){el.querySelector("#bfLetterPaper").classList.add("show");},280);
}

function showChamber(){
  activeZones.clear();
  phase("#bfChamber");
  const wand=ensure().querySelector("#bfWandLight");
  wand.style.left="50%";
  wand.style.top="";
  wand.style.bottom="9%";
  wand.style.transform="translateX(-50%)";
}

function activateZone(n){
  if(activeZones.has(n))return;
  activeZones.add(n);
  const el=ensure();
  const zone=el.querySelector('.bf-memory-zone[data-zone="'+n+'"]');
  if(zone)zone.classList.add("done");
  const all=[].slice.call(el.querySelectorAll("#bfLights .bf-light"));
  for(let i=n*10;i<n*10+10;i++){
    (function(idx,delay){later(function(){if(all[idx])all[idx].classList.add("on");},delay);})(i,(i-n*10)*55);
  }
  el.querySelector("#bfCounter").textContent="Luci: "+(activeZones.size*10)+" / 30";

  try{
    const AC=window.AudioContext||window.webkitAudioContext;
    const ac=new AC(),o=ac.createOscillator(),g=ac.createGain();
    o.type="triangle";o.frequency.value=560+n*120;g.gain.value=.035;
    o.connect(g).connect(ac.destination);o.start();
    g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.35);
    o.stop(ac.currentTime+.36);
    later(function(){ac.close().catch(function(){});},500);
  }catch(e){}

  if(activeZones.size===3){
    localStorage.setItem("amoremio.birthday30","revealed");
    const chamber=el.querySelector("#bfChamber");
    chamber.classList.add("complete");
    later(showReveal,1250);
  }
}

function setupWand(){
  const el=ensure();
  const wand=el.querySelector("#bfWandLight");
  const zones=[].slice.call(el.querySelectorAll(".bf-memory-zone"));

  function check(x,y){
    zones.forEach(function(z,i){
      const r=z.getBoundingClientRect();
      if(x>r.left&&x<r.right&&y>r.top&&y<r.bottom)activateZone(i);
    });
  }

  wand.addEventListener("pointerdown",function(e){
    e.preventDefault();
    dragging=true;
    const r=wand.getBoundingClientRect();
    dragDX=e.clientX-r.left;
    dragDY=e.clientY-r.top;
    if(wand.setPointerCapture)wand.setPointerCapture(e.pointerId);
    check(e.clientX,e.clientY);
  });

  wand.addEventListener("pointermove",function(e){
    if(!dragging)return;
    e.preventDefault();
    const chamber=el.querySelector("#bfChamber");
    const cr=chamber.getBoundingClientRect();
    const x=Math.max(0,Math.min(cr.width-72,e.clientX-cr.left-dragDX));
    const y=Math.max(75,Math.min(cr.height-170,e.clientY-cr.top-dragDY));
    wand.style.left=x+"px";
    wand.style.top=y+"px";
    wand.style.bottom="auto";
    wand.style.transform="none";
    check(e.clientX,e.clientY);
  });

  wand.addEventListener("pointerup",function(e){
    if(!dragging)return;
    dragging=false;
    check(e.clientX,e.clientY);
  });
  wand.addEventListener("pointercancel",function(){dragging=false;});
  wand.addEventListener("keydown",function(e){
    if(e.key!=="Enter"&&e.key!==" ")return;
    e.preventDefault();
    const next=[0,1,2].find(function(x){return !activeZones.has(x);});
    if(next!==undefined)activateZone(next);
  });
}

let finalRecognition=null;
let finalFallbackTimer=null;
let finalUnlocked=false;

function normalizeMagicWords(s){
  return (s||"")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z ]/g," ")
    .replace(/\s+/g," ")
    .trim();
}

function finalEditDistance(a,b){
  a=normalizeMagicWords(a);b=normalizeMagicWords(b);
  const n=b.length,dp=new Array(n+1);
  for(let j=0;j<=n;j++)dp[j]=j;
  for(let i=1;i<=a.length;i++){
    let prev=dp[0];dp[0]=i;
    for(let j=1;j<=n;j++){
      const tmp=dp[j];
      dp[j]=Math.min(dp[j]+1,dp[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));
      prev=tmp;
    }
  }
  return dp[n];
}

function isDeepPurple(text){
  const s=normalizeMagicWords(text);
  if(!s)return false;
  if((/deep|dip|deeb|diip/.test(s))&&(/purple|purpl|perple|people/.test(s)))return true;
  const target="deep purple";
  return finalEditDistance(s,target)/Math.max(s.length,target.length)<=0.46;
}

function resetFinalLetterGate(){
  if(!root)return;
  finalUnlocked=false;
  clearTimeout(finalFallbackTimer);
  const gate=root.querySelector("#bfFinalGate");
  const env=root.querySelector("#bfFinalEnvelope");
  const letter=root.querySelector("#bfFinalLetter");
  const mic=root.querySelector("#bfFinalMic");
  const status=root.querySelector("#bfFinalVoiceStatus");
  const fallback=root.querySelector("#bfFinalFallback");
  if(gate)gate.classList.remove("unlocking","hidden");
  if(env)env.classList.remove("unlocked","open");
  if(letter)letter.classList.remove("show");
  if(mic){mic.disabled=false;mic.classList.remove("listening");}
  if(status)status.textContent='Tocca il microfono e pronuncia “Deep Purple”.';
  if(fallback)fallback.hidden=true;
  try{finalRecognition?.abort?.()}catch(e){}
}

function unlockFinalLetter(){
  if(finalUnlocked)return;
  finalUnlocked=true;
  clearTimeout(finalFallbackTimer);
  const gate=root.querySelector("#bfFinalGate");
  const env=root.querySelector("#bfFinalEnvelope");
  const letter=root.querySelector("#bfFinalLetter");
  const mic=root.querySelector("#bfFinalMic");
  const status=root.querySelector("#bfFinalVoiceStatus");
  const fallback=root.querySelector("#bfFinalFallback");

  if(mic){mic.disabled=true;mic.classList.remove("listening");}
  if(fallback)fallback.hidden=true;
  if(status)status.textContent="Parole magiche riconosciute.";
  env?.classList.add("unlocked");

  later(function(){env?.classList.add("open");gate?.classList.add("unlocking");},420);
  later(function(){
    gate?.classList.add("hidden");
    letter?.classList.add("show");
  },1050);
}

function setupFinalLetter(){
  const el=ensure();
  const mic=el.querySelector("#bfFinalMic");
  const fallback=el.querySelector("#bfFinalFallback");
  const status=el.querySelector("#bfFinalVoiceStatus");
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;

  if(SR){
    finalRecognition=new SR();
    finalRecognition.lang="en-GB";
    finalRecognition.interimResults=true;
    finalRecognition.continuous=false;
    finalRecognition.maxAlternatives=5;

    finalRecognition.onresult=function(e){
      const heard=[];
      for(let i=e.resultIndex;i<e.results.length;i++){
        for(let j=0;j<e.results[i].length;j++)heard.push(e.results[i][j].transcript);
      }
      const text=heard.join(" ");
      if(isDeepPurple(text)){
        try{finalRecognition.stop()}catch(err){}
        unlockFinalLetter();
      }else if(e.results[e.results.length-1]?.isFinal){
        status.textContent='Ho sentito «'+text+'». Riprova: “Deep Purple”.';
        fallback.hidden=false;
      }else{
        status.textContent="Ti sto ascoltando…";
      }
    };

    finalRecognition.onerror=function(){
      mic?.classList.remove("listening");
      status.textContent="Il microfono non riesce a capire bene le parole magiche.";
      fallback.hidden=false;
    };
    finalRecognition.onend=function(){
      mic?.classList.remove("listening");
      if(!finalUnlocked)fallback.hidden=false;
    };
  }else{
    status.textContent="Il riconoscimento vocale non è disponibile su questo browser.";
    fallback.hidden=false;
  }

  mic?.addEventListener("click",function(){
    if(finalUnlocked)return;
    if(!finalRecognition){
      fallback.hidden=false;
      return;
    }
    clearTimeout(finalFallbackTimer);
    try{
      mic.classList.add("listening");
      status.textContent='Sto ascoltando… “Deep Purple”.';
      finalRecognition.start();
      finalFallbackTimer=setTimeout(function(){
        if(!finalUnlocked){
          fallback.hidden=false;
          status.textContent='Pronuncia “Deep Purple”. Se il browser non collabora, puoi aprire comunque la lettera.';
        }
      },4200);
    }catch(e){
      fallback.hidden=false;
      try{finalRecognition.stop()}catch(err){}
    }
  });

  fallback?.addEventListener("click",unlockFinalLetter);
}

function showReveal(){
  const el=ensure();
  el.querySelector("#bfChamber").classList.remove("complete");
  el.querySelector("#bfMemorySummary").textContent=memorySummary();
  resetFinalLetterGate();
  phase("#bfReveal");
}

window.startBirthdayFinale=start;
})();