(()=>{
"use strict";

const ASSETS={
  adult:"assets/characters/eleonora-adult-hero.png",
  neutral:"assets/characters/eleonora-11-neutral.png",
  letter:"assets/characters/eleonora-11-letter.png",
  wand:"assets/characters/eleonora-11-wand.png"
};

const moments={
  adultIntro:{
    image:ASSETS.adult,
    kicker:"OGGI",
    title:"Eleonora",
    text:"Nel mondo magico esistono mille modi per creare luce. Eleonora non ne ha mai avuto bisogno. A trent’anni, perfino un castello pieno d’incantesimi sembrava un po’ meno straordinario quando entrava lei. Per capire dove è cominciata la sua storia, dobbiamo tornare al 4 ottobre 1996.",
    button:"Apri il ricordo",
    adult:true
  },
  letter:{
    image:ASSETS.letter,
    kicker:"ESTATE 2008",
    title:"Finalmente, una risposta.",
    text:"A undici anni Eleonora non sapeva ancora che il castello avrebbe imparato il suo nome. Sapeva soltanto che, per la prima volta, tutte quelle cose strane della sua infanzia avevano una parola: magia.",
    button:"Continua"
  },
  wand:{
    image:ASSETS.wand,
    kicker:"LA PRIMA BACCHETTA",
    title:"La bacchetta l’ha riconosciuta.",
    text:"Non si limitò a funzionare. Vibrò nella sua mano come se l’avesse aspettata. La luce si raccolse sul suo viso e, per un istante, perfino la bottega sembrò fermarsi.",
    button:"Prosegui"
  },
  adultOutro:{
    image:ASSETS.adult,
    kicker:"MOLTI ANNI DOPO",
    title:"La magia non era la cosa più rara.",
    text:"Il castello le avrebbe insegnato incantesimi, duelli e segreti. Ma nessuna magia avrebbe mai spiegato la cosa più semplice: per me, Eleonora era la donna più bella di ogni mondo possibile.",
    button:"Continua la storia",
    adult:true
  }
};

let overlay=null;
let continuation=null;
let activeMoment=null;
const seen=new Set();

function ensureOverlay(){
  if(overlay)return overlay;
  overlay=document.createElement("div");
  overlay.className="eleonora-focus";
  overlay.setAttribute("aria-hidden","true");
  overlay.innerHTML=`
    <img class="eleonora-focus__image" alt="">
    <div class="eleonora-focus__shade"></div>
    <div class="eleonora-focus__scar"></div>
    <div class="eleonora-focus__copy">
      <div class="eleonora-focus__kicker"></div>
      <h2 class="eleonora-focus__title"></h2>
      <p class="eleonora-focus__text"></p>
      <button class="eleonora-focus__button" type="button"></button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector(".eleonora-focus__button").addEventListener("click",()=>{
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden","true");
    const cb=continuation;
    continuation=null;
    activeMoment=null;
    requestAnimationFrame(()=>cb?.());
  });
  return overlay;
}

function showMoment(key,cb){
  const data=moments[key];
  if(!data){cb?.();return}
  const el=ensureOverlay();
  activeMoment=key;
  continuation=cb||null;
  el.querySelector(".eleonora-focus__image").src=data.image;
  el.querySelector(".eleonora-focus__kicker").textContent=data.kicker;
  el.querySelector(".eleonora-focus__title").textContent=data.title;
  el.querySelector(".eleonora-focus__text").textContent=data.text;
  el.querySelector(".eleonora-focus__button").textContent=data.button;
  el.querySelector(".eleonora-focus__scar").style.display=data.adult?"block":"none";
  el.classList.add("show");
  el.setAttribute("aria-hidden","false");
}

window.showEleonoraMoment=showMoment;

function interceptOnce(id,key){
  const el=document.getElementById(id);
  if(!el)return;
  document.addEventListener("click",e=>{
    if(e.target!==el||seen.has(key))return;
    seen.add(key);
    e.preventDefault();
    e.stopImmediatePropagation();
    showMoment(key,()=>el.click());
  },true);
}

interceptOnce("play","adultIntro");
interceptOnce("letterContinue","letter");
interceptOnce("magicContinue","wand");

const presenceMap=[
  ["owlChapter","letter","left"],
  ["wandShop","neutral","right"],
  ["magicGame","wand","left"],
  ["stationScene","neutral","right"],
  ["trainScene","neutral","left"],
  ["arrivalScene","neutral","right"],
  ["greatHallScene","neutral","left"],
  ["spellClassScene","wand","right"],
  ["libraryScene","neutral","left"],
  ["corridorScene","neutral","right"],
  ["stairsScene","neutral","left"]
];

function addPresence(sceneId,assetKey,side){
  const scene=document.getElementById(sceneId);
  if(!scene||scene.querySelector(".eleonora-presence"))return;
  const card=document.createElement("div");
  card.className=`eleonora-presence ${side} ${assetKey}`;
  card.innerHTML=`<img src="${ASSETS[assetKey]}" alt=""><span>ELEONORA</span>`;
  scene.appendChild(card);
}
presenceMap.forEach(x=>addPresence(...x));

const finalEnd=document.getElementById("end");
if(finalEnd){
  const observer=new MutationObserver(()=>{
    const finished=localStorage.getItem("amoremio.movingStairs")==="passed";
    if(!finished||!finalEnd.classList.contains("show")||seen.has("adultOutro"))return;
    seen.add("adultOutro");
    finalEnd.classList.remove("show");
    showMoment("adultOutro",()=>finalEnd.classList.add("show"));
  });
  observer.observe(finalEnd,{attributes:true,attributeFilter:["class"]});
}

})();