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
    text:"In un mondo pieno di cose impossibili, la cosa più straordinaria restava lei. Quando Eleonora entrava in una stanza, la luce sembrava diventare più calda e perfino i ritratti parevano dimenticare per un istante le loro conversazioni. Per capire da dove viene quella luce, dobbiamo tornare al 4 ottobre 1996.",
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
  train:{
    image:ASSETS.neutral,
    kicker:"IL PRIMO VIAGGIO",
    title:"Il mondo correva fuori dal finestrino.",
    text:"Eleonora osservava tutto in silenzio. Non cercava di attirare l’attenzione, eppure aveva già qualcosa che si ricordava: uno sguardo curioso, una calma luminosa e quella sensazione strana che il castello la stesse aspettando.",
    button:"Verso Hogwarts"
  },
  sorting:{
    image:ASSETS.neutral,
    kicker:"SOTTO CENTINAIA DI CANDELE",
    title:"Per un istante, la Sala Grande si fece più silenziosa.",
    text:"Non perché Eleonora cercasse di essere notata. Era il contrario. Sembrava semplicemente portare con sé una luce che rendeva il resto della sala un po’ meno importante.",
    button:"Continua"
  },
  spell:{
    image:ASSETS.wand,
    kicker:"IL PRIMO VERO INCANTESIMO",
    title:"La magia le risponde.",
    text:"La piuma si solleva e una luce dorata corre lungo la bacchetta. Sul volto di Eleonora compare quel sorriso che nessun incantesimo potrebbe inventare.",
    button:"Continua la lezione"
  },
  flight:{
    image:ASSETS.neutral,
    kicker:"SOPRA HOGWARTS",
    title:"Per la prima volta, il castello è sotto di lei.",
    text:"Il vento le sposta i capelli mentre ride sopra le torri. Per qualche secondo non ci sono cicatrici, misteri o profezie. C’è soltanto Eleonora, libera.",
    button:"Continua"
  },
  adultOutro:{
    image:ASSETS.adult,
    kicker:"MOLTI ANNI DOPO",
    title:"La magia non era la cosa più rara.",
    text:"Hogwarts poteva riempire il cielo di candele, muovere scale e nascondere stanze impossibili. Ma per Eren nessun incantesimo avrebbe mai potuto creare qualcosa di più bello di Eleonora. In qualunque mondo, sarebbe stata sempre lei.",
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

  window.showAssetCurtain?.();
  const ready=window.preloadAsset
    ? window.preloadAsset(data.image,"high")
    : Promise.resolve(data.image);

  ready.finally(()=>{
    el.querySelector(".eleonora-focus__image").src=data.image;
    el.querySelector(".eleonora-focus__kicker").textContent=data.kicker;
    el.querySelector(".eleonora-focus__title").textContent=data.title;
    el.querySelector(".eleonora-focus__text").textContent=data.text;
    el.querySelector(".eleonora-focus__button").textContent=data.button;
    el.querySelector(".eleonora-focus__scar").style.display=data.adult?"block":"none";
    requestAnimationFrame(()=>{
      el.classList.add("show");
      el.setAttribute("aria-hidden","false");
      window.hideAssetCurtain?.();
    });
  });
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
interceptOnce("trainNext","train");
interceptOnce("spellLessonContinue","spell");
interceptOnce("flightContinue","flight");

function interceptSelectorOnce(selector,key,momentKey=key){
  document.addEventListener("click",e=>{
    const el=e.target.closest?.(selector);
    if(!el||seen.has(key))return;
    seen.add(key);
    e.preventDefault();
    e.stopImmediatePropagation();
    showMoment(momentKey,()=>el.click());
  },true);
}
interceptSelectorOnce(".sort-values button","sorting","sorting");

const presenceMap=[
  ["owlChapter","letter","left"],
  ["wandShop","neutral","right"],
  ["magicGame","wand","left"],
  ["diagonScene","neutral","right"],
  ["stationScene","neutral","right"],
  ["platformScene","neutral","left"],
  ["trainScene","neutral","left"],
  ["arrivalScene","neutral","right"],
  ["greatHallScene","neutral","left"],
  ["potionsScene","neutral","right"],
  ["corridorScene","neutral","right"],
  ["spellClassScene","wand","right"],
  ["libraryScene","neutral","left"],
  ["stairsScene","neutral","left"],
  ["duelScene","wand","left"],
  ["flightScene","neutral","right"]
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