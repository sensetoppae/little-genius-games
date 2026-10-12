'use strict';
const app=$('#app');
let G=null,MP=0; // game state, map page
const AVATARS=['🦊','🐼','🐰','🐱','🐶','🦁','🐸','🐵','🦄','🐯','🐨','🐻'];
const MASCOT=['🦉','🐠','👩‍🚀','🍭','🐪','🐧','🦜','🐲','🤴','🦄'];
const WORLDS=[
 ['🌳','ป่าสดใส','Happy Forest','#7ee0a0','#4cc3ff'],['🌊','ใต้ทะเล','Under the Sea','#6dd5ed','#2193b0'],
 ['🚀','อวกาศ','Outer Space','#8e9eff','#3a1c71'],['🍭','เมืองขนม','Candy Land','#ffb6d9','#ffd6a5'],
 ['🏜️','ทะเลทราย','Desert','#ffe29f','#ffa99f'],['🐧','ขั้วโลก','Arctic','#d4f1ff','#8fb8ff'],
 ['🦜','ป่าดิบ','Jungle','#a8e063','#56ab2f'],['🌋','ภูเขาไฟ','Volcano','#ffb347','#ff6a6a'],
 ['🏰','ปราสาท','Castle','#c9b6ff','#7f7fd5'],['🌈','สายรุ้ง','Rainbow','#ff9a9e','#a1c4fd']];
const wName=i=>tx(B(WORLDS[i][1],WORLDS[i][2]));

function deco(N){
  const d=$('#deco'),w=worldOf(N);if(!d||d.dataset.w==w)return;d.dataset.w=w;
  const base=[WORLDS[w][0],'⭐','✨','☁️','🎈'];
  d.innerHTML=Array.from({length:8},()=>`<span style="left:${ri(0,96)}%;font-size:${ri(22,50)}px;animation-duration:${ri(14,30)}s;animation-delay:-${ri(0,30)}s">${pick(base)}</span>`).join('');
}
function theme(N){const w=WORLDS[worldOf(N)];document.documentElement.style.setProperty('--c1',w[3]);document.documentElement.style.setProperty('--c2',w[4]);deco(N)}
const langBtn=()=>`<button class="iconbtn" id="lang">${DB.lang==='th'?'EN':'ไทย'}</button>`;
function bindLang(f){const b=$('#lang');if(b)b.onclick=()=>{DB.lang=DB.lang==='th'?'en':'th';save();f()}}
const starStr=n=>'★'.repeat(n||0);
const totalStars=p=>Object.values(p.stars).reduce((a,b)=>a+b,0);

/* ================= players ================= */
function route(){
  if(location.hash==='#unlock'&&P())P().unlocked=MAXL;
  P()?home():DB.players.length?pickPlayer():createPlayer();
}
function pickPlayer(){
  theme(1);
  app.innerHTML=`<div class="top"><div class="grow"></div>${langBtn()}</div><div class="card"><div class="mascot">👋</div>
  <h1>${tx(B('ใครกำลังเล่น?','Who is playing?'))}</h1>
  <div class="plist">${DB.players.map(p=>`<button class="prow" data-id="${p.id}"><b>${p.av}</b><span>${p.name}<small>${BANDS[p.band].icon} ${tx(BANDS[p.band].n)} · ${tx(B('ด่าน','Level'))} ${p.unlocked} · ⭐ ${totalStars(p)}</small></span></button>`).join('')}</div>
  <button class="big alt" id="new">➕ ${tx(B('เพิ่มผู้เล่นใหม่','New player'))}</button></div>`;
  document.querySelectorAll('.prow').forEach(b=>b.onclick=()=>{DB.cur=b.dataset.id;save();sTap();home()});
  $('#new').onclick=createPlayer;bindLang(pickPlayer);
}
function createPlayer(){
  theme(1);
  let av=pick(AVATARS),band=1;
  app.innerHTML=`<div class="top">${DB.players.length?`<button class="iconbtn" id="back">⬅</button>`:''}<div class="grow"></div>${langBtn()}</div><div class="card">
  <h1>${tx(B('สร้างผู้เล่น','New player'))}</h1>
  <div class="prompt">${tx(B('ชื่อของหนู','Your name'))} <button class="iconbtn" id="spkn" style="width:38px;height:38px;font-size:18px">🔊</button></div>
  <input class="name" id="nm" maxlength="14" placeholder="${tx(B('พิมพ์ชื่อ','Type your name'))}" autocomplete="off">
  <div class="prompt">${tx(B('เลือกตัวการ์ตูน','Pick a friend'))}</div>
  <div class="avs">${AVATARS.map(a=>`<button class="av" data-a="${a}">${a}</button>`).join('')}</div>
  <div class="prompt">${tx(B('อายุ / ชั้นเรียน','Age / grade'))}</div>
  <div class="chips">${BANDS.map(b=>`<button class="chip" data-b="${b.id}"><span>${b.icon}</span>${tx(b.n)}</button>`).join('')}</div>
  <button class="big" id="go">▶ ${tx(B('เริ่มเล่น','Start'))}</button></div>`;
  const mark=()=>{document.querySelectorAll('.av').forEach(x=>x.classList.toggle('on',x.dataset.a===av));document.querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',+x.dataset.b===band))};
  mark();
  document.querySelectorAll('.av').forEach(b=>b.onclick=()=>{av=b.dataset.a;sTap();mark()});
  document.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{band=+b.dataset.b;sTap();mark()});
  $('#spkn').onclick=()=>speak(B('ชื่ออะไรคะ','What is your name?'));
  $('#go').onclick=()=>{
    const name=$('#nm').value.trim();
    if(!name){$('#nm').focus();sBad();speak(B('พิมพ์ชื่อก่อนนะ','Please type your name'));return}
    const p={id:'p'+Date.now(),name,av,band,unlocked:BANDS[band].start,stars:{},auto:BANDS[band].auto===true};
    DB.players.push(p);DB.cur=p.id;save();sOk();
    speak(B(`สวัสดี ${name} ยินดีต้อนรับ`,`Hello ${name}! Welcome!`));home();
  };
  if(DB.players.length)$('#back').onclick=pickPlayer;
  bindLang(()=>{const n=$('#nm')?$('#nm').value:'';createPlayer();$('#nm').value=n});
  setTimeout(()=>{const n=$('#nm');if(n)n.focus()},100);
}

/* ================= home / settings / map ================= */
function home(){
  const p=P(),N=Math.min(p.unlocked,MAXL),b=bandOf(N);theme(N);
  const noTh=VOICES.length&&!hasVoice('th');
  app.innerHTML=`<div class="top"><button class="iconbtn" id="who" title="players">${p.av}</button><div class="grow"></div>${langBtn()}<button class="iconbtn" id="set">⚙️</button></div>
  <div class="card"><div class="mascot">${p.av}</div>
  <h1>${tx(B(`สวัสดี ${p.name}!`,`Hello ${p.name}!`))}</h1>
  <div class="sub">${tx(B('เกมหนูน้อยอัจฉริยะ — 10,000 ด่าน','Little Genius Games — 10,000 levels'))}</div>
  <div class="pills"><span class="pill">${b.icon} ${tx(b.n)}</span> <span class="pill">${WORLDS[worldOf(N)][0]} ${wName(worldOf(N))}</span> <span class="pill">⭐ ${totalStars(p)}</span></div>
  <button class="big" id="play">▶ ${tx(B('เล่นด่าน','Play level'))} ${N}</button>
  <button class="big alt" id="map">🗺️ ${tx(B('แผนที่ด่าน','Level map'))}</button>
  <div class="hint" style="margin-top:14px">${tx(B('สร้างโดย','Created by'))} <b>Nattawut Ch.</b></div>
  ${noTh?`<div class="hint">🔇 ${tx(B('เครื่องนี้ยังไม่มีเสียงอ่านภาษาไทย — ติดตั้งเสียงไทยใน Windows (Settings › Time & language › Speech) หรือใช้เบราว์เซอร์ Edge/Chrome','No Thai voice found on this device — install a Thai voice in your system, or use Edge/Chrome'))}</div>`:''}
  </div>`;
  $('#play').onclick=()=>{ctx();start(N)};$('#map').onclick=()=>{MP=Math.floor((N-1)/100);map()};
  $('#who').onclick=pickPlayer;$('#set').onclick=settings;bindLang(home);
  if(p.name&&!home.greeted){home.greeted=true}
}
function askConfirm(msg,onYes){
  const o=document.createElement('div');
  o.style.cssText='position:fixed;inset:0;background:#0007;z-index:50;display:flex;align-items:center;justify-content:center;padding:20px';
  o.innerHTML=`<div class="card" style="max-width:420px;width:100%"><div class="prompt">${msg}</div><div class="row"><button class="big grey" id="cn">${tx(B('ยกเลิก','Cancel'))}</button><button class="big" id="cy" style="background:linear-gradient(180deg,#ff7a7a,#e04848);border-bottom-color:#a82c2c">${tx(B('ยืนยัน','Confirm'))}</button></div></div>`;
  document.body.appendChild(o);
  $('#cn').onclick=()=>o.remove();
  $('#cy').onclick=()=>{o.remove();onYes()};
}
function settings(){
  const p=P();theme(Math.min(p.unlocked,MAXL));
  const row=(label,id,on,txt)=>`<div class="srow"><span>${label}</span><button class="sw ${on?'on':''}" id="${id}">${txt}</button></div>`;
  app.innerHTML=`<div class="top"><button class="iconbtn" id="back">⬅</button><div class="grow"></div></div><div class="card">
  <h1>⚙️ ${tx(B('ตั้งค่า','Settings'))}</h1>
  ${row(tx(B('ภาษาในเกม','Game language')),'sl',true,DB.lang==='th'?'ไทย':'English')}
  ${row(tx(B('เสียงพูด (กดแล้วมีเสียงอ่าน)','Voice (tap to hear)')),'sv',DB.voice!==false,DB.voice!==false?'ON':'OFF')}
  ${row(tx(B('อ่านโจทย์ให้ฟังอัตโนมัติ','Read questions aloud')),'sa',p.auto,p.auto?'ON':'OFF')}
  ${row(tx(B('ดนตรีเบาๆ','Soft music')),'sm',DB.music!==false,DB.music!==false?'ON':'OFF')}
  <div class="srow"><span>${tx(B('ทดสอบเสียงพูด','Test voice'))}<br><small style="font-weight:600">🇹🇭 ${hasVoice('th')?'✅':'❌'} · 🇬🇧 ${hasVoice('en')?'✅':'❌'}</small></span><button class="sw" id="vt">🔊</button></div>
  <div class="srow"><span>${tx(B('เวอร์ชัน','Version'))} ${APP_CONFIG.version}<br><small id="updres" style="font-weight:600"></small></span><button class="sw" id="updchk">${tx(B('ตรวจสอบอัปเดต','Check update'))}</button></div>
  <div class="prompt" style="margin-top:14px">${tx(B('ข้ามไปเล่นระดับ','Jump to level group'))}</div>
  <div class="chips">${BANDS.map(b=>`<button class="chip ${bandOf(p.unlocked).id===b.id?'on':''}" data-b="${b.id}"><span>${b.icon}</span>${tx(b.n)}</button>`).join('')}</div>
  <div class="hint">${tx(B('ข้ามไปข้างหน้าได้ ด่านที่ผ่านแล้วยังอยู่ครบ','You can jump ahead — finished levels are kept.'))}</div>
  <button class="big alt" id="sw">🔁 ${tx(B('เปลี่ยนผู้เล่น','Switch player'))}</button>
  <button class="big grey" id="rs" style="font-size:16px;padding:10px">${tx(B('ล้างความคืบหน้าของผู้เล่นนี้','Reset this player'))}</button>
  <button class="big grey" id="dl" style="font-size:16px;padding:10px">🗑️ ${tx(B('ลบผู้เล่นนี้','Delete this player'))}</button>
  <div class="hint" style="text-align:center">${tx(B('สร้างโดย','Created by'))} <b>Nattawut Ch.</b> · v${APP_CONFIG.version}</div></div>`;
  $('#back').onclick=home;
  $('#updchk').onclick=manualUpdateCheck;
  $('#vt').onclick=()=>speak({t:'สวัสดี หนึ่ง สอง สาม',l:'th'},{t:'Hello. One, two, three.',l:'en'});
  $('#sl').onclick=()=>{DB.lang=DB.lang==='th'?'en':'th';save();settings()};
  $('#sv').onclick=()=>{DB.voice=DB.voice===false;save();settings();speak(B('เสียงพูดทำงานแล้ว','Voice is on'))};
  $('#sa').onclick=()=>{p.auto=!p.auto;save();settings()};
  $('#sm').onclick=()=>{setMusic(DB.music===false);settings()};
  document.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{const bd=BANDS[+b.dataset.b];p.band=bd.id;if(p.unlocked<bd.start)p.unlocked=bd.start;if(bd.id>1)p.auto=p.auto;save();sTap();home()});
  $('#sw').onclick=pickPlayer;
  $('#rs').onclick=()=>askConfirm(tx(B(`ล้างความคืบหน้าของ ${p.name} แล้วเริ่มใหม่?`,`Reset ${p.name}'s progress and start over?`)),()=>{p.unlocked=BANDS[p.band].start;p.stars={};save();home()});
  $('#dl').onclick=()=>askConfirm(tx(B(`ลบผู้เล่น ${p.name} ถาวร?`,`Delete player ${p.name} for good?`)),()=>{DB.players=DB.players.filter(x=>x!==p);DB.cur=null;save();route()});
}
function map(){
  const p=P(),cur=Math.min(p.unlocked,MAXL),page=MP,base=page*100;
  let g='';
  for(let i=1;i<=100;i++){
    const N=base+i,lock=N>p.unlocked,ty=levelType(N),icon=N%100===0?'🏆':N%10===0?'👑':TYPES[ty].icon;
    g+=`<button class="lv ${lock?'lock':''} ${N===cur?'cur':''} ${N%10===0?'boss':''}" data-l="${N}">${lock?'🔒':icon}<br>${N}<small>${lock?'':starStr(p.stars[N])}</small></button>`;
  }
  theme(base+1);
  const b=bandOf(base+1);
  app.innerHTML=`<div class="top"><button class="iconbtn" id="back">🏠</button><div class="grow"></div><span class="pill">⭐ ${totalStars(p)}</span>${langBtn()}</div>
  <div class="tabs">${BANDS.map(x=>`<button class="tab ${x.id===b.id?'on':''}" data-s="${x.start}">${x.icon} ${tx(x.n)}</button>`).join('')}</div>
  <div class="pager"><button class="iconbtn" id="pv">◀</button><select id="pg">${Array.from({length:100},(_,i)=>`<option value="${i}" ${i===page?'selected':''}>${i*100+1} – ${i*100+100}</option>`).join('')}</select><button class="iconbtn" id="nx">▶</button></div>
  <div class="card" style="padding:12px"><div class="prompt">${WORLDS[worldOf(base+1)][0]} ${wName(worldOf(base+1))}</div><div class="grid">${g}</div></div>`;
  $('#back').onclick=home;bindLang(map);
  $('#pv').onclick=()=>{MP=Math.max(0,page-1);map()};$('#nx').onclick=()=>{MP=Math.min(99,page+1);map()};
  $('#pg').onchange=e=>{MP=+e.target.value;map()};
  document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{MP=Math.floor((+t.dataset.s-1)/100);map()});
  document.querySelectorAll('.lv').forEach(x=>x.onclick=()=>{const N=+x.dataset.l;if(N<=p.unlocked){ctx();start(N)}else{sBad()}});
  const c=document.querySelector('.lv.cur');if(c)c.scrollIntoView({block:'center'});
}

/* ================= game flow ================= */
function start(N){
  theme(N);
  const type=levelType(N),boss=type==='boss',b=bandOf(N);
  G={N,type,boss,b:b.id,i:0,mistakes:0,total:boss?bossTotal(N):b.id===0?4:5,intro:N===b.start,done:false};
  const verbal=['vocab','letters','spell','grammar','thRead','thVowel','thTone','thAnti','boss'];
  MUS.vol=verbal.includes(type)?.35:1;
  nextQ();
}
const pool=N=>poolOf(N).filter(t=>t!=='memory');
function topbar(){
  const ty=G.boss?{icon:G.N%100===0?'🏆':'👑',n:B('ด่านบอส!','Boss!')}:TYPES[G.type];
  return `<div class="top"><button class="iconbtn" id="exit">✖</button><div class="bar"><i style="width:${G.i/G.total*100}%"></i></div><span class="pill">${ty.icon} ${G.N}</span></div>
  ${G.intro?`<div class="banner">🎓 ${tx(bandOf(G.N).n)} · ${tx(TYPES[G.type]?TYPES[G.type].n:B('ด่านบอส','Boss'))}</div>`:''}`;
}
function exitGame(){try{speechSynthesis.cancel()}catch(e){}MUS.vol=1;MP=Math.floor((G.N-1)/100);map()}
function nextQ(){
  if(G.i>=G.total){finish();return}
  const c=ctxOf(G.N),t=G.boss?pick(pool(G.N)):G.type;
  const q=GEN[t](c);G.q=q;G.done=false;G.cnt=0;
  ({choice:drawChoice,explore:drawExplore,tapcount:drawTapCount,spell:drawSpell,memory:drawMemory}[q.kind])(q);
  G.intro=false;
  if(P().auto&&q.kind!=='memory')speakQ(q);
}
function speakQ(q){const l=[q.prompt];if(q.say)l.push(q.say);speak(...l)}
function next(delay){G.i++;afterSpeech(()=>nextQ(),delay||500)}

function drawChoice(q){
  app.innerHTML=topbar()+`<div class="card"><div class="prompt">${tx(q.prompt)} <button class="iconbtn" id="spk" style="width:38px;height:38px;font-size:18px">🔊</button></div>
  <div class="visual ${q.vcls||''}">${q.visual||''}</div>
  <div class="opts ${q.cls||''}">${q.opts.map((o,i)=>`<button class="opt ${q.emoji?'emoji':''} ${o.h.length>9?'sm':''}" data-i="${i}">${o.h}</button>`).join('')}</div></div>`;
  $('#exit').onclick=exitGame;$('#spk').onclick=()=>speakQ(q);
  document.querySelectorAll('.visual .ci').forEach(el=>el.onclick=()=>{
    if(el.classList.contains('on'))return;el.classList.add('on');G.cnt++;sTap();speak({n:G.cnt});
  });
  document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
    if(G.done)return;
    const i=+b.dataset.i,o=q.opts[i],spk=o.sp!==undefined?o.sp:stripEmoji(o.h);
    if(i===q.ans){
      G.done=true;b.classList.add('good');sOk();
      const extra=q.onOk?[q.onOk]:[];
      speak(spk,q.onOk?null:praise());
      if(q.onOk)setTimeout(q.onOk,700);
      next(q.onOk?900:500);
    }else if(q.tod){
      b.style.animation='none';void b.offsetWidth;b.style.animation='shake .4s';sBad();speak(spk);
    }else{
      b.classList.add('wrong');G.mistakes++;sBad();speak(spk);
    }
  });
}
function drawExplore(q){
  const seen=new Set();
  app.innerHTML=topbar()+`<div class="card"><div class="prompt">${tx(q.prompt)}</div>
  <div class="tgrid ${q.cols===3?'t3':''}">${q.items.map((it,i)=>`<button class="tcard" data-i="${i}">${it.h}</button>`).join('')}</div></div>`;
  $('#exit').onclick=exitGame;
  document.querySelectorAll('.tcard').forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i;sTap();b.classList.add('on');speak(q.items[i].sp);
    seen.add(i);
    if(seen.size===q.items.length&&!G.done){G.done=true;setTimeout(()=>{sOk();confetti()},400);next(900)}
  });
}
function drawTapCount(q){
  app.innerHTML=topbar()+`<div class="card"><div class="prompt">${tx(q.prompt)}</div>
  <div class="visual"><div class="cnt" style="font-size:${q.n>6?58:76}px">${Array(q.n).fill(`<span class="ci">${q.e}</span>`).join('')}</div></div>
  <div class="visual big" id="big" style="min-height:110px">&nbsp;</div></div>`;
  $('#exit').onclick=exitGame;
  document.querySelectorAll('.ci').forEach(el=>el.onclick=()=>{
    if(el.classList.contains('on'))return;
    el.classList.add('on');G.cnt++;sTap();$('#big').textContent=G.cnt;speak({n:G.cnt});
    if(G.cnt===q.n&&!G.done){G.done=true;setTimeout(()=>{sOk();confetti()},500);next(900)}
  });
}
function drawSpell(q){
  let pos=0;
  app.innerHTML=topbar()+`<div class="card"><div class="prompt">${tx(q.prompt)} <button class="iconbtn" id="spk" style="width:38px;height:38px;font-size:18px">🔊</button></div>
  <div class="visual big">${q.emoji}</div><div class="sub" style="font-size:20px">${q.hint}</div>
  <div class="slots">${q.word.split('').map(()=>`<div class="slot"></div>`).join('')}</div>
  <div class="tiles">${q.tiles.map((c,i)=>`<button class="tile" data-i="${i}">${c}</button>`).join('')}</div></div>`;
  $('#exit').onclick=exitGame;
  $('#spk').onclick=()=>speak({t:q.en,l:'en'});
  const slots=document.querySelectorAll('.slot');
  document.querySelectorAll('.tile').forEach(b=>b.onclick=()=>{
    if(G.done)return;
    const c=q.tiles[+b.dataset.i];
    speak({t:c.toLowerCase()==='a'?'ay':c,l:'en'});
    if(c===q.word[pos]){
      slots[pos].textContent=c;slots[pos].classList.add('f');b.classList.add('used');pos++;tone(600+pos*60,0,.12);
      if(pos===q.word.length){G.done=true;sOk();setTimeout(()=>speak({t:q.en,l:'en'},praise()),500);next(900)}
    }else{G.mistakes++;sBad();b.classList.add('wrong');setTimeout(()=>b.classList.remove('wrong'),400)}
  });
  if(P().auto)setTimeout(()=>speak({t:q.en,l:'en'}),900);
}
function drawMemory(q){
  const total=q.pairs;let matched=0,open=[],lock=false;
  app.innerHTML=topbar()+`<div class="card"><div class="prompt">${tx(q.prompt)}</div>
  <div class="mem" style="grid-template-columns:repeat(${q.cols},1fr)">${q.cards.map((c,i)=>`<button class="mc" data-i="${i}">?</button>`).join('')}</div></div>`;
  $('#exit').onclick=exitGame;
  const els=document.querySelectorAll('.mc'),bar=document.querySelector('.bar i');
  els.forEach(el=>el.onclick=()=>{
    const i=+el.dataset.i,cd=q.cards[i];
    if(lock||open.includes(i)||el.classList.contains('done'))return;
    el.classList.add('up');el.innerHTML=cd.h;if(cd.w||cd.h.length>3)el.classList.add('word');sTap();speak(cd.sp);
    open.push(i);
    if(open.length===2){
      const [a,b]=open;lock=true;
      if(q.cards[a].k===q.cards[b].k){
        setTimeout(()=>{[a,b].forEach(x=>els[x].classList.add('done'));sOk();matched++;open=[];lock=false;bar.style.width=matched/total*100+'%';
          if(matched>=total){G.i=G.total;setTimeout(finish,900)}},700);
      }else{
        G.mistakes++;
        setTimeout(()=>{[a,b].forEach(x=>{els[x].classList.remove('up','word');els[x].textContent='?'});sBad();open=[];lock=false},1100);
      }
    }
  });
  if(P().auto)speak(q.prompt);
}

function finish(){
  const p=P(),m=G.mistakes,mem=G.type==='memory';
  const th=G.boss?[1,4]:mem?[G.total,G.total*2]:[0,2];
  const st=G.b===0?3:m<=th[0]?3:m<=th[1]?2:1;
  p.stars[G.N]=Math.max(p.stars[G.N]||0,st);
  if(G.N===p.unlocked&&p.unlocked<MAXL)p.unlocked=G.N+1;
  save();sWin();confetti();
  const last=G.N>=MAXL,N=G.N,nb=bandOf(N+1).id!==bandOf(N).id&&!last;
  app.innerHTML=`<div class="card" style="margin-top:30px"><div class="mascot">${last?'🏆':p.av}</div>
  <h1>${last?tx(B('เก่งที่สุดในโลก! ครบ 10,000 ด่าน','Amazing! All 10,000 levels done!')):tx(B(`เก่งมาก ${p.name}!`,`Great job, ${p.name}!`))}</h1>
  <div class="stars">${[0,1,2].map(i=>`<span>${i<st?'⭐':'☆'}</span>`).join('')}</div>
  ${G.b===0?'':`<div class="sub">${tx(B(`ด่าน ${N} ผิด ${m} ครั้ง`,`Level ${N} – ${m} mistake${m===1?'':'s'}`))}</div>`}
  ${nb?`<div class="banner" style="margin-top:10px">🎓 ${tx(B('ขึ้นระดับใหม่: ','New stage: '))}${tx(bandOf(N+1).n)}</div>`:''}
  ${last?'':`<button class="big" id="nx">▶ ${tx(B('ด่านต่อไป','Next level'))} ${N+1}</button>`}
  <div class="row"><button class="big alt" id="again">🔁 ${tx(B('เล่นอีกครั้ง','Replay'))}</button><button class="big grey" id="mp">🗺️ ${tx(B('แผนที่','Map'))}</button></div></div>`;
  if(!last)$('#nx').onclick=()=>start(N+1);
  $('#again').onclick=()=>start(N);$('#mp').onclick=()=>{MP=Math.floor((N-1)/100);map()};
  speak(B(`เก่งมาก ${p.name}`,`Great job ${p.name}`));
  MUS.vol=1;
}

initMusicUI();
route();
startUpdateWatch();
