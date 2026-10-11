'use strict';
/* ========= helpers ========= */
const $=s=>document.querySelector(s);
const ri=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const pick=a=>a[ri(0,a.length-1)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=ri(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};
const lerp=(a,b,p)=>Math.round(a+(b-a)*p);
const B=(th,en)=>({th,en});
const MAXL=10000;
const worldOf=N=>Math.floor((N-1)/100)%10;
const stripEmoji=s=>String(s).replace(/<[^>]*>/g,' ').replace(/[\p{Extended_Pictographic}️‍]/gu,'').replace(/\s+/g,' ').trim();

/* ========= storage ========= */
const KEY='lgg2';
let DB={players:[],cur:null,lang:'th',music:true,voice:true};
try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(x)DB=Object.assign(DB,x)}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}};
const P=()=>DB.players.find(p=>p.id===DB.cur)||null;
const tx=o=>o==null?'':typeof o==='string'?o:(o[DB.lang]??o.th);

/* ========= number words ========= */
const TH_D=['ศูนย์','หนึ่ง','สอง','สาม','สี่','ห้า','หก','เจ็ด','แปด','เก้า'];
function thNum(n){
  if(n===0)return TH_D[0];
  if(n>=1e6){const m=Math.floor(n/1e6),r=n%1e6;return thNum(m)+'ล้าน'+(r?thNum(r):'')}
  const u=['','สิบ','ร้อย','พัน','หมื่น','แสน'],str=String(n),L=str.length;let s='';
  for(let i=0;i<L;i++){
    const d=+str[i],pos=L-i-1;if(!d)continue;
    if(pos===0)s+=(d===1&&L>1)?'เอ็ด':TH_D[d];
    else if(pos===1)s+=d===1?'สิบ':d===2?'ยี่สิบ':TH_D[d]+'สิบ';
    else s+=TH_D[d]+u[pos];
  }
  return s;
}
const ONES=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const TENS=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function enNum(n){
  if(n<20)return ONES[n];
  if(n<100)return TENS[Math.floor(n/10)]+(n%10?'-'+ONES[n%10]:'');
  if(n<1000)return ONES[Math.floor(n/100)]+' hundred'+(n%100?' '+enNum(n%100):'');
  if(n<1e6)return enNum(Math.floor(n/1000))+' thousand'+(n%1000?' '+enNum(n%1000):'');
  return enNum(Math.floor(n/1e6))+' million'+(n%1e6?' '+enNum(n%1e6):'');
}
const numWord=(n,L)=>(L||DB.lang)==='th'?thNum(n):enNum(n);
function mathSpeak(s,L){
  const th=L==='th';
  const W={'+':th?'บวก':'plus','−':th?'ลบ':'minus','-':th?'ลบ':'minus','×':th?'คูณ':'times','÷':th?'หาร':'divided by','=':th?'เท่ากับ':'equals',
    '>':th?'มากกว่า':'is greater than','<':th?'น้อยกว่า':'is less than','?':th?'เท่าไหร่':'what','/':th?'ส่วน':'over','฿':th?'บาท':'baht','(':'',')':'',',':''};
  return String(s).replace(/\d+(?:\.\d+)?|[^\d\s]/g,m=>{
    if(/^\d/.test(m)){
      if(m.includes('.')){const[a,b]=m.split('.');return numWord(+a,L)+(th?' จุด ':' point ')+b.split('').map(d=>numWord(+d,L)).join(' ')}
      return numWord(+m,L);
    }
    return W[m]!==undefined?W[m]:m;
  }).replace(/\s+/g,' ');
}
const timeSay=(h,m)=>({th:thNum(h)+' นาฬิกา'+(m?' '+thNum(m)+' นาที':''),en:enNum(h)+' '+(m===0?"o'clock":m<10?'oh '+enNum(m):enNum(m))});

/* ========= speech ========= */
let VOICES=[];
function loadVoices(){try{VOICES=speechSynthesis.getVoices()||[]}catch(e){VOICES=[]}}
try{loadVoices();speechSynthesis.onvoiceschanged=loadVoices}catch(e){}
const hasVoice=l=>VOICES.some(v=>v.lang.toLowerCase().startsWith(l));
const voiceFor=l=>{const k=l.slice(0,2).toLowerCase(),vs=VOICES.filter(v=>v.lang.toLowerCase().startsWith(k));return vs.find(v=>/female|google|natural|premwadee|niwat|zira|aria/i.test(v.name))||vs[0]};
// sp: string (UI lang) | {t,l} | {n} | {m} | {th,en}
function resolveSp(sp){
  const L=DB.lang;
  if(sp==null)return null;
  if(typeof sp==='string')return{t:stripEmoji(sp),l:L};
  if(sp.t!==undefined)return{t:sp.t,l:sp.l||L};
  if(sp.n!==undefined)return{t:numWord(sp.n,L),l:L,num:sp.n};
  if(sp.m!==undefined)return{t:mathSpeak(sp.m,L),l:L};
  if(sp.th!==undefined||sp.en!==undefined)return{t:stripEmoji(sp[L]??sp.th),l:L,alt:sp.en?{t:stripEmoji(sp.en),l:'en'}:null};
  return null;
}
let MUS;
const _keep=[];   // keep utterances referenced (some browsers drop them if garbage collected)
let _hintAt=0;
function voiceHint(){
  if(Date.now()-_hintAt<20000)return;_hintAt=Date.now();
  const d=document.createElement('div');
  d.style.cssText='position:fixed;left:12px;right:12px;bottom:76px;z-index:60;background:#fff3c4;border:3px solid #fff;border-radius:16px;padding:10px 14px;font-weight:700;font-size:14px;text-align:center;box-shadow:0 6px 16px #0003';
  d.textContent=DB.lang==='th'?'🔇 เบราว์เซอร์นี้ไม่มีเสียงพูดภาษาไทย — ลองเปิดเกมด้วย Microsoft Edge หรือ Chrome (หรือติดตั้งเสียงไทยในเครื่อง)':'🔇 This browser has no Thai voice — try Microsoft Edge or Chrome, or install a Thai voice.';
  document.body.appendChild(d);setTimeout(()=>d.remove(),6000);
}
function speak(...sps){
  if(DB.voice===false)return;
  try{
    if(speechSynthesis.speaking||speechSynthesis.pending)speechSynthesis.cancel();
    if(MUS)MUS.mute=Date.now()+2500;
    setTimeout(()=>{
      try{speechSynthesis.resume()}catch(e){}
      for(const sp of sps.flat()){
        let r=resolveSp(sp);if(!r||!r.t)continue;
        if(r.l==='th'&&VOICES.length&&!hasVoice('th')){
          voiceHint();
          if(r.num!==undefined)r={t:enNum(r.num),l:'en'};else if(r.alt)r=r.alt;else continue;   // fall back to the English word so the child still hears something
        }
        const u=new SpeechSynthesisUtterance(r.t);u.lang=r.l==='th'?'th-TH':'en-US';
        const v=voiceFor(u.lang);if(v)u.voice=v;
        const p=P();u.rate=p&&p.band<=1?.8:.9;u.pitch=1.1;
        _keep.push(u);if(_keep.length>20)_keep.shift();
        speechSynthesis.speak(u);
      }
    },0);
  }catch(e){}
}
function afterSpeech(cb,min=500,max=2200){
  const t0=Date.now();
  (function w(){
    const dt=Date.now()-t0;let sp=false;
    try{sp=speechSynthesis.speaking||speechSynthesis.pending}catch(e){}
    if(dt>=max||(dt>=min&&!sp))cb();else setTimeout(w,120);
  })();
}
const PRAISE=B(['เก่งมาก','ถูกต้อง','ยอดเยี่ยม','สุดยอด','เยี่ยมไปเลย'],['Great job!','Correct!','Awesome!','Well done!','Super!']);
const praise=()=>{const n=P()&&Math.random()<.3?' '+P().name:'';return pick(PRAISE[DB.lang])+n};

/* ========= sound effects ========= */
let AC;
function ctx(){AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC}
function tone(f,t,d,type='sine',v=.15){try{const a=ctx(),o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=f;g.gain.value=v;g.gain.exponentialRampToValueAtTime(.001,a.currentTime+t+d);o.connect(g);g.connect(a.destination);o.start(a.currentTime+t);o.stop(a.currentTime+t+d)}catch(e){}}
const sOk=()=>{tone(660,0,.15);tone(880,.12,.25)};
const sBad=()=>{tone(220,0,.2,'triangle',.08)};
const sTap=()=>tone(520,0,.08,'sine',.08);
const sWin=()=>[523,659,784,1047].forEach((f,i)=>tone(f,i*.13,.3));

/* ========= soft background music (instrumental, no lyrics) ========= */
MUS={timer:null,beat:0,vol:1,mute:0};
const MROOT=[0,2,-2,3,5,-4,7,1,-1,4];
const CHORDS=[[0,4,7],[-3,0,4],[-7,-3,0],[-5,-1,2]];
const PENT=[0,2,4,7,9,12,14,16];
const hz=s=>261.63*Math.pow(2,s/12);
function mnote(f,dur,vol,type){try{const a=ctx(),t=a.currentTime,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=f;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol*MUS.vol,t+.05);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur+.05)}catch(e){}}
function musicTick(){
  if(Date.now()<MUS.mute)return;
  const b=MUS.beat++,p=P(),root=MROOT[worldOf(p?p.unlocked:1)]||0,ch=CHORDS[Math.floor(b/4)%4];
  if(b%4===0)ch.forEach(n=>mnote(hz(root+n-12),2.2,.025,'sine'));
  if(Math.random()<.75){const n=pick(PENT.filter(x=>ch.some(c=>((x-c)%12+12)%12===0||Math.random()<.35)));mnote(hz(root+n),.9,.04,'triangle')}
}
function musicStart(){if(MUS.timer||DB.music===false)return;MUS.timer=setInterval(musicTick,520);musicTick()}
function musicStop(){clearInterval(MUS.timer);MUS.timer=null}
function musicBtnUpdate(){const b=$('#musbtn');if(b)b.textContent=DB.music===false?'🔇':'🎵'}
function setMusic(on){DB.music=on;save();on?musicStart():musicStop();musicBtnUpdate()}
function initMusicUI(){
  const b=document.createElement('button');b.id='musbtn';b.className='iconbtn';
  b.style.cssText='position:fixed;right:12px;bottom:12px;z-index:20';
  b.onclick=e=>{e.stopPropagation();setMusic(DB.music===false)};
  document.body.appendChild(b);musicBtnUpdate();
  document.addEventListener('pointerdown',()=>musicStart());
  document.addEventListener('visibilitychange',()=>document.hidden?musicStop():musicStart());
}

/* ========= confetti ========= */
function confetti(){
  const e=['🎉','⭐','🎈','✨','🌟','🍭'];
  for(let i=0;i<24;i++){const s=document.createElement('div');s.className='fall';s.textContent=pick(e);s.style.left=ri(0,95)+'vw';s.style.animationDelay=Math.random()*.8+'s';document.body.appendChild(s);setTimeout(()=>s.remove(),4000)}
}
