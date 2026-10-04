(()=>{
"use strict";
const cache=new Map();

const critical=[
  "assets/characters/eleonora-adult-hero.png",
  "assets/prologue/city-9x16.png",
  "assets/prologue/window-9x16.png",
  "assets/prologue/nursery-9x16.png",
  "assets/prologue/interaction-9x16.png",
  "assets/prologue/child-9x16.png"
];

const deferred=[
  "assets/characters/eleonora-11-letter.png",
  "assets/characters/eleonora-11-neutral.png",
  "assets/characters/eleonora-11-wand.png",
  "assets/journey/diagon-hq.png",
  "assets/journey/station-hq.png",
  "assets/journey/platform-hq.png",
  "assets/journey/train-hq.png",
  "assets/journey/castle-hq.png",
  "assets/hogwarts/great-hall-hq.png",
  "assets/hogwarts/spell-class-hq.png",
  "assets/hogwarts/library-hq.png",
  "assets/hogwarts/potions-hq.png",
  "assets/hogwarts/corridor-hq.png",
  "assets/hogwarts/stairs-hq.png",
  "assets/hogwarts/duel-hq.png",
  "assets/hogwarts/flight-hq.png"
];

function preload(src,priority){
  if(cache.has(src))return cache.get(src);
  const p=new Promise(resolve=>{
    const img=new Image();
    img.decoding="async";
    try{img.fetchPriority=priority||"auto"}catch(e){}
    const done=()=>{
      if(typeof img.decode==="function"){
        img.decode().catch(()=>{}).finally(()=>resolve(src));
      }else resolve(src);
    };
    img.onload=done;
    img.onerror=()=>resolve(src);
    img.src=src;
    if(img.complete&&img.naturalWidth)done();
  });
  cache.set(src,p);
  return p;
}

function curtain(){
  let el=document.getElementById("assetCurtain");
  if(el)return el;
  el=document.createElement("div");
  el.id="assetCurtain";
  el.className="asset-curtain";
  el.innerHTML='<i></i><span>Caricamento…</span>';
  document.body.appendChild(el);
  return el;
}

function showCurtain(){curtain().classList.add("show")}
function hideCurtain(){curtain().classList.remove("show")}

const criticalPromise=Promise.all(critical.map(x=>preload(x,"high")));
window.preloadAsset=preload;
window.showAssetCurtain=showCurtain;
window.hideAssetCurtain=hideCurtain;
window.waitForCriticalAssets=async function(){
  let timer=setTimeout(showCurtain,120);
  await criticalPromise;
  clearTimeout(timer);
  hideCurtain();
};

const idle=window.requestIdleCallback||function(cb){return setTimeout(cb,250)};
idle(()=>deferred.forEach(x=>preload(x,"low")));

})();