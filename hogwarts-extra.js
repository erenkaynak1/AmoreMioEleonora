(() => {
  const prologue=document.getElementById("prologue");
  const end=document.getElementById("end");
  const corridor=document.getElementById("corridorScene");
  const mystery=document.getElementById("mysteryMessage");
  if(!prologue||!end||!corridor||!mystery)return;

  const html=`
  <div id="spellLesson" class="extra-scene">
    <img class="extra-bg" src="assets/hogwarts/spell-class-hq.png" alt="">
    <div class="extra-head"><b>Lezione di Incantesimi</b><span>Questa volta la magia richiede voce e movimento.</span></div>
    <div class="spell-table"></div>
    <div id="spellFeather" class="spell-feather" aria-hidden="true">🪶</div>
    <canvas id="spellTrail"></canvas>
    <div id="lessonWand" class="spell-wand" role="button" tabindex="0" aria-label="Muovi la bacchetta"></div>
    <div class="extra-panel">
      <div class="spell-status">
        <div id="voiceChip" class="spell-chip">Voce: in attesa</div>
        <div id="gestureChip" class="spell-chip">Bacchetta: in attesa</div>
      </div>
      <p id="spellFeedback" class="spell-feedback">Pronuncia “Wingardium Leviosa”, poi traccia un ampio movimento verso l’alto con la bacchetta.</p>
      <div class="spell-actions">
        <button id="spellMic" class="extra-btn" type="button">🎙 Pronuncia l’incantesimo</button>
        <button id="spellFallback" class="extra-btn" type="button" hidden>Conferma l’incantesimo</button>
        <button id="spellContinue" class="extra-btn" type="button" hidden>Continua →</button>
      </div>
    </div>
  </div>

  <div id="libraryScene" class="extra-scene">
    <img class="extra-bg" src="assets/hogwarts/library-hq.png" alt="">
    <div class="library-vignette"></div>
    <div class="extra-head"><b>La Biblioteca</b><span>La cicatrice reagisce a uno dei libri. Trovalo.</span></div>
    <button class="book-hotspot b1" data-book="1" type="button" aria-label="Libro 1"></button>
    <button class="book-hotspot b2" data-book="2" type="button" aria-label="Libro 2"></button>
    <button class="book-hotspot b3" data-book="3" type="button" aria-label="Libro 3"></button>
    <button class="book-hotspot b4" data-book="4" type="button" aria-label="Libro 4"></button>
    <button class="book-hotspot b5" data-book="5" type="button" aria-label="Libro 5"></button>
    <div id="libraryClue" class="library-clue">
      <div class="clue-paper">
        <h3>Il libro senza titolo</h3>
        <p>«Il segno che porti non è soltanto una ferita. È una chiave. Cerca dove le scale cambiano strada.»</p>
        <button id="libraryContinue" class="extra-btn" type="button">Segui l’indizio</button>
      </div>
    </div>
  </div>

  <div id="stairsScene" class="extra-scene">
    <img class="extra-bg" src="assets/hogwarts/stairs-hq.png" alt="">
    <div class="stairs-scene-flash" id="stairsFlash"></div>
    <div class="extra-head"><b>Le Scale Mobili</b><span>Aspetta il momento giusto. Tre passaggi e raggiungerai il corridoio superiore.</span></div>
    <div id="stepToken" class="step-token" aria-hidden="true"></div>
    <div class="stairs-game">
      <div class="timing-track"><div class="timing-zone"></div><div id="timingMarker" class="timing-marker"></div></div>
      <div class="stairs-row">
        <div id="stairsProgress" class="stairs-progress">Passaggi: 0 / 3</div>
        <button id="stairsJump" class="extra-btn" type="button">Attraversa</button>
      </div>
    </div>
    <div id="stairsFinish" class="stairs-finish">
      <div>
        <h2>La cicatrice pulsa.</h2>
        <p>Da qualche parte nel castello, una voce sussurra il nome di Eleonora. Non sembra una coincidenza.</p>
        <button id="stairsContinue" class="extra-btn" type="button">Continua la storia</button>
      </div>
    </div>
  </div>`;

  end.insertAdjacentHTML("beforebegin",html);

  const mysteryInner=mystery.querySelector("div")||mystery;
  if(!document.getElementById("mysteryContinue")){
    const btn=document.createElement("button");
    btn.id="mysteryContinue";
    btn.className="extra-btn";
    btn.type="button";
    btn.textContent="Il giorno seguente →";
    mysteryInner.appendChild(btn);
  }

  const spell=document.getElementById("spellLesson");
  const library=document.getElementById("libraryScene");
  const stairs=document.getElementById("stairsScene");
  const mysteryContinue=document.getElementById("mysteryContinue");
  const mic=document.getElementById("spellMic");
  const fallback=document.getElementById("spellFallback");
  const spellContinue=document.getElementById("spellContinue");
  const feedback=document.getElementById("spellFeedback");
  const voiceChip=document.getElementById("voiceChip");
  const gestureChip=document.getElementById("gestureChip");
  const feather=document.getElementById("spellFeather");
  const wand=document.getElementById("lessonWand");
  const canvas=document.getElementById("spellTrail");
  let ctx=null,voiceDone=false,gestureDone=false,drag=false,startX=0,startY=0,minY=0,lastX=0,lastY=0,gestureDistance=0;

  function showOnly(scene){
    [corridor,spell,library,stairs,end].forEach(x=>x&&x.classList.remove("show"));
    scene.classList.add("show");
  }

  mysteryContinue.addEventListener("click",()=>{
    mystery.classList.remove("show");
    showOnly(spell);
    setupCanvas();
  });

  function setupCanvas(){
    const dpr=Math.min(window.devicePixelRatio||1,2);
    const r=canvas.getBoundingClientRect();
    canvas.width=Math.max(1,Math.floor(r.width*dpr));
    canvas.height=Math.max(1,Math.floor(r.height*dpr));
    ctx=canvas.getContext("2d");
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.lineCap="round";ctx.lineJoin="round";
  }
  function clearCanvas(){
    if(!ctx)return;
    const r=canvas.getBoundingClientRect();
    ctx.clearRect(0,0,r.width,r.height);
  }
  function checkSpell(){
    if(!(voiceDone&&gestureDone))return;
    feedback.textContent="Perfetto. La piuma risponde alla tua magia.";
    feather.classList.add("fly");
    spellContinue.hidden=false;
    localStorage.setItem("amoremio.firstSpell","wingardium-leviosa");
  }
  function passVoice(){
    voiceDone=true;
    voiceChip.classList.add("done");
    voiceChip.textContent="Voce: riuscita";
    checkSpell();
  }

  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  let recognition=null;
  if(SR){
    recognition=new SR();
    recognition.lang="it-IT";
    recognition.interimResults=false;
    recognition.maxAlternatives=3;
    recognition.onresult=e=>{
      const heard=[...e.results[0]].map(x=>x.transcript.toLowerCase()).join(" ");
      if(heard.includes("wingardium")||heard.includes("leviosa")){
        feedback.textContent="La pronuncia è abbastanza chiara. Ora completa il gesto.";
        passVoice();
      }else{
        feedback.textContent="La classe resta in silenzio. Riprova: “Wingardium Leviosa”.";
      }
    };
    recognition.onerror=()=>{
      feedback.textContent="Il microfono non è disponibile. Puoi usare il comando manuale.";
      fallback.hidden=false;
    };
  }else{
    mic.hidden=true;
    fallback.hidden=false;
  }
  mic.addEventListener("click",()=>{
    if(!recognition){fallback.hidden=false;return}
    feedback.textContent="Ti ascolto…";
    try{recognition.start()}catch(e){}
  });
  fallback.addEventListener("click",()=>{
    feedback.textContent="Incantesimo pronunciato. Ora completa il gesto.";
    passVoice();
  });

  function pointerPoint(e){
    const r=spell.getBoundingClientRect();
    return {x:e.clientX-r.left,y:e.clientY-r.top};
  }
  wand.addEventListener("pointerdown",e=>{
    e.preventDefault();drag=true;wand.classList.add("active");
    const p=pointerPoint(e);startX=lastX=p.x;startY=lastY=minY=p.y;gestureDistance=0;
    clearCanvas();wand.setPointerCapture?.(e.pointerId);
  });
  wand.addEventListener("pointermove",e=>{
    if(!drag)return;
    const p=pointerPoint(e);
    gestureDistance+=Math.hypot(p.x-lastX,p.y-lastY);
    minY=Math.min(minY,p.y);
    const dx=p.x-lastX,dy=p.y-lastY;
    wand.style.left=(p.x-10)+"px";
    wand.style.top=(p.y-24)+"px";
    wand.style.bottom="auto";
    wand.style.transform="rotate("+(Math.atan2(dy,dx)*180/Math.PI+90)+"deg)";
    if(ctx){
      ctx.strokeStyle="rgba(241,211,139,.62)";ctx.lineWidth=4;
      ctx.beginPath();ctx.moveTo(lastX,lastY);ctx.lineTo(p.x,p.y);ctx.stroke();
    }
    lastX=p.x;lastY=p.y;
  });
  wand.addEventListener("pointerup",()=>{
    if(!drag)return;
    drag=false;wand.classList.remove("active");
    const rise=startY-minY;
    const side=Math.abs(lastX-startX);
    if(gestureDistance>150&&rise>68&&side>40){
      gestureDone=true;
      gestureChip.classList.add("done");
      gestureChip.textContent="Bacchetta: riuscita";
      feedback.textContent=voiceDone?"Perfetto. La magia sta reagendo.":"Bel movimento. Ora pronuncia l’incantesimo.";
      checkSpell();
    }else{
      feedback.textContent="Il gesto è troppo piccolo. Disegna un arco ampio verso l’alto.";
      setTimeout(clearCanvas,650);
    }
  });
  wand.addEventListener("pointercancel",()=>{drag=false;wand.classList.remove("active")});

  spellContinue.addEventListener("click",()=>{
    spell.classList.remove("show");
    library.classList.add("show");
  });

  const clue=document.getElementById("libraryClue");
  document.querySelectorAll(".book-hotspot").forEach(book=>book.addEventListener("click",()=>{
    if(book.dataset.book==="3"){
      book.classList.add("correct");
      localStorage.setItem("amoremio.libraryClue","found");
      setTimeout(()=>clue.classList.add("show"),500);
    }else{
      book.classList.remove("wrong");void book.offsetWidth;book.classList.add("wrong");
    }
  }));
  document.getElementById("libraryContinue").addEventListener("click",()=>{
    clue.classList.remove("show");
    library.classList.remove("show");
    stairs.classList.add("show");
    startTiming();
  });

  const marker=document.getElementById("timingMarker");
  const progress=document.getElementById("stairsProgress");
  const jump=document.getElementById("stairsJump");
  const token=document.getElementById("stepToken");
  const stairsFlash=document.getElementById("stairsFlash");
  const finish=document.getElementById("stairsFinish");
  let timingActive=false,timingStart=0,stepCount=0,markerPct=0,raf=0;

  function startTiming(){
    timingActive=true;timingStart=performance.now();stepCount=0;
    progress.textContent="Passaggi: 0 / 3";
    token.style.left="12%";token.style.bottom="31%";
    finish.classList.remove("show");
    animateTiming();
  }
  function animateTiming(now=performance.now()){
    if(!timingActive)return;
    const phase=((now-timingStart)%1800)/1800;
    markerPct=phase<.5?phase*2*94:(1-phase)*2*94;
    marker.style.left=markerPct+"%";
    raf=requestAnimationFrame(animateTiming);
  }
  function updateToken(){
    const pos=[
      ["12%","31%"],
      ["36%","39%"],
      ["61%","49%"],
      ["80%","61%"]
    ][stepCount];
    token.style.left=pos[0];token.style.bottom=pos[1];
  }
  jump.addEventListener("click",()=>{
    const hit=markerPct>=38&&markerPct<=58;
    stairsFlash.classList.add("on");setTimeout(()=>stairsFlash.classList.remove("on"),240);
    if(hit){
      stepCount++;
      progress.textContent="Passaggi: "+stepCount+" / 3";
      updateToken();
      if(stepCount>=3){
        timingActive=false;cancelAnimationFrame(raf);
        localStorage.setItem("amoremio.movingStairs","cleared");
        setTimeout(()=>finish.classList.add("show"),650);
      }
    }else{
      stepCount=Math.max(0,stepCount-1);
      progress.textContent="Passaggi: "+stepCount+" / 3";
      updateToken();
    }
  });

  document.getElementById("stairsContinue").addEventListener("click",()=>{
    stairs.classList.remove("show");
    finish.classList.remove("show");
    end.classList.add("show");
    const h=end.querySelector("h2"),p=end.querySelector("p");
    if(h)h.textContent="Il primo mistero è iniziato.";
    if(p)p.textContent="Eleonora ora sa che la cicatrice, il libro e il castello sono collegati. Qualcuno la sta aspettando.";
  });

  window.addEventListener("resize",()=>{if(spell.classList.contains("show"))setupCanvas()});
})();