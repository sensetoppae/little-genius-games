'use strict';
/* ========= Free Play (มุมเล่นอิสระ) — no levels, no stars, tap & explore =========
   Rooms: numbers, Thai letters, A-Z, things & animals, piano, draw/colour.
   Uses globals from core/data/app (app, theme, langBtn, bindLang, home, speak, tx, B ...). */
const PLAYROOMS=[
  ['num','🔢',B('ตัวเลข','Numbers')],['th','ก',B('ก-ฮ ภาษาไทย','Thai letters')],['abc','🅰️',B('A-Z ภาษาอังกฤษ','A-Z letters')],
  ['things','🐶',B('สัตว์และสิ่งต่างๆ','Animals & things')],['piano','🎹',B('เปียโน','Piano')],['draw','🎨',B('วาดรูป / ระบายสี','Draw & colour')]];
const roomTop=back=>`<div class="top"><button class="iconbtn" id="pback">⬅</button><div class="grow"></div>${langBtn()}</div>`;
const stageHTML=(big,small)=>`<div class="stage"><div class="sbig">${big||'👆'}</div><div class="ssmall">${small||tx(B('แตะได้เลย!','Tap one!'))}</div></div>`;
function setStage(big,small){const s=$('.stage');if(s){s.querySelector('.sbig').textContent=big;s.querySelector('.ssmall').textContent=small||''}}

function playHub(){
  theme(301);
  app.innerHTML=`<div class="top"><button class="iconbtn" id="pback">⬅</button><div class="grow"></div>${langBtn()}</div>
  <div class="card"><div class="mascot">🎨</div><h1>${tx(B('มุมเล่นอิสระ','Free Play'))}</h1>
  <div class="sub">${tx(B('เล่นได้ตามใจ ไม่มีคะแนน ไม่มีแพ้','Play any way you like — no score, no losing'))}</div>
  <div class="tgrid prooms">${PLAYROOMS.map(r=>`<button class="tcard" data-r="${r[0]}">${r[1]}<small>${tx(r[2])}</small></button>`).join('')}</div></div>`;
  $('#pback').onclick=home;bindLang(playHub);
  document.querySelectorAll('.prooms .tcard').forEach(b=>b.onclick=()=>{
    const r=PLAYROOMS.find(x=>x[0]===b.dataset.r);sTap();speak(r[2]);
    setTimeout(()=>openRoom(r[0]),350);
  });
}
function openRoom(id){({num:roomNum,th:roomTh,abc:roomAbc,things:roomThings,piano:roomPiano,draw:roomDraw})[id]()}

/* ---------- numbers ---------- */
function roomNum(tab){
  tab=tab||0;theme(302);
  const sets=[Array.from({length:10},(_,i)=>i),Array.from({length:11},(_,i)=>i+10),Array.from({length:10},(_,i)=>(i+1)*10)];
  const names=['0-9','10-20','10-100'];
  const thd=n=>String(n).replace(/\d/g,d=>TD[d]);
  app.innerHTML=roomTop()+`<div class="card"><h1>🔢 ${tx(B('ตัวเลข','Numbers'))}</h1>${stageHTML()}
  <div class="tabs">${names.map((n,i)=>`<button class="tab ${i===tab?'on':''}" data-t="${i}">${n}</button>`).join('')}</div>
  <div class="pgrid">${sets[tab].map(n=>`<button class="pcard" data-n="${n}">${n}<small>${thd(n)}</small></button>`).join('')}</div></div>`;
  $('#pback').onclick=playHub;bindLang(()=>roomNum(tab));
  document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{sTap();roomNum(+b.dataset.t)});
  document.querySelectorAll('.pcard').forEach(b=>b.onclick=()=>{
    const n=+b.dataset.n;sTap();b.classList.add('on');setTimeout(()=>b.classList.remove('on'),500);
    setStage(n,numWord(n));speak({n});
  });
}

/* ---------- Thai letters ---------- */
function roomTh(){
  theme(303);
  const pic={};TL.forEach(t=>pic[t[0]]=t);
  app.innerHTML=roomTop()+`<div class="card"><h1>ก ${tx(B('ก-ฮ ภาษาไทย','Thai letters'))}</h1>${stageHTML()}
  <div class="pgrid">${THC.map(c=>`<button class="pcard" data-c="${c}">${c}${pic[c]?`<small>${pic[c][1]}</small>`:''}</button>`).join('')}</div></div>`;
  $('#pback').onclick=playHub;bindLang(roomTh);
  document.querySelectorAll('.pcard').forEach(b=>b.onclick=()=>{
    const c=b.dataset.c,t=pic[c];sTap();b.classList.add('on');setTimeout(()=>b.classList.remove('on'),500);
    if(t){setStage(t[1],`${c} ${t[2]}`);speak({t:`${c} ${t[2]}`,l:'th'})}
    else{setStage(c,c);speak({t:c,l:'th'})}
  });
}

/* ---------- A-Z ---------- */
function roomAbc(){
  theme(304);
  const em={};V_ALL.forEach(v=>{em[v.en]=v.e});
  app.innerHTML=roomTop()+`<div class="card"><h1>🅰️ A-Z</h1>${stageHTML()}
  <div class="pgrid">${ABC.map(c=>`<button class="pcard" data-c="${c}">${c}<small>${c.toLowerCase()}</small></button>`).join('')}</div></div>`;
  $('#pback').onclick=playHub;bindLang(roomAbc);
  document.querySelectorAll('.pcard').forEach(b=>b.onclick=()=>{
    const c=b.dataset.c,w=ABCW[c];sTap();b.classList.add('on');setTimeout(()=>b.classList.remove('on'),500);
    setStage(em[w]||c,`${c} ${c.toLowerCase()} · ${w}`);
    speak({t:c,l:'en'},{t:w,l:'en'});
  });
}

/* ---------- animals & things ---------- */
function roomThings(cat){
  cat=cat||'animal';theme(305);
  const CN={animal:['🐶',B('สัตว์','Animals')],food:['🍎',B('อาหาร','Food')],vehicle:['🚗',B('ยานพาหนะ','Vehicles')],body:['👁️',B('ร่างกาย','Body')],
    color:['🔴',B('สี','Colours')],shape:['⭐',B('รูปทรง','Shapes')],thing:['🏠',B('สิ่งของ','Things')],job:['👩‍🏫',B('อาชีพ','Jobs')]};
  const ws=mkV([cat]);
  app.innerHTML=roomTop()+`<div class="card"><h1>${CN[cat][0]} ${tx(CN[cat][1])}</h1>
  <div class="tabs">${Object.keys(CN).map(k=>`<button class="tab ${k===cat?'on':''}" data-k="${k}">${CN[k][0]}</button>`).join('')}</div>
  <div class="tgrid t3">${ws.map((w,i)=>`<button class="tcard" data-i="${i}">${w.e}<small>${tx(B(w.th,w.en))}</small></button>`).join('')}</div></div>`;
  $('#pback').onclick=playHub;bindLang(()=>roomThings(cat));
  document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{sTap();roomThings(b.dataset.k)});
  document.querySelectorAll('.tcard').forEach(b=>b.onclick=()=>{
    const w=ws[+b.dataset.i];sTap();b.classList.add('on');setTimeout(()=>b.classList.remove('on'),500);
    speak(cat==='animal'&&w.sEn?{th:`${w.th} ${w.sTh}`,en:`${w.en}, ${w.sEn}`}:{th:w.th,en:w.en});
  });
}

/* ---------- piano ---------- */
function roomPiano(){
  theme(306);
  const keys=[['โด','Do',0,'#ff6b6b'],['เร','Re',2,'#ff9f43'],['มี','Mi',4,'#feca57'],['ฟา','Fa',5,'#1dd1a1'],['ซอล','Sol',7,'#48dbfb'],['ลา','La',9,'#5f6df8'],['ที','Ti',11,'#a55eea'],['โด','Do',12,'#ff6b6b']];
  app.innerHTML=roomTop()+`<div class="card"><h1>🎹 ${tx(B('เปียโน','Piano'))}</h1>
  <div class="sub">${tx(B('แตะเล่นเพลงเองได้เลย','Tap to make your own tune'))}</div>
  <div class="piano">${keys.map((k,i)=>`<button class="pkey" data-i="${i}" style="background:${k[3]}"><span>${k[1]}</span></button>`).join('')}</div></div>`;
  $('#pback').onclick=playHub;bindLang(roomPiano);
  document.querySelectorAll('.pkey').forEach(b=>{
    const k=keys[+b.dataset.i],go=e=>{e.preventDefault();ctx();tone(hz(k[2]),0,.9,'triangle',.22);b.classList.add('on');setTimeout(()=>b.classList.remove('on'),250)};
    b.addEventListener('pointerdown',go);
  });
}

/* ---------- draw & colour ---------- */
const PCOL=[['#e53935','แดง','red'],['#fb8c00','ส้ม','orange'],['#fdd835','เหลือง','yellow'],['#43a047','เขียว','green'],['#1e88e5','ฟ้า','blue'],
  ['#8e24aa','ม่วง','purple'],['#ec407a','ชมพู','pink'],['#6d4c41','น้ำตาล','brown'],['#212121','ดำ','black'],['#ffffff','ขาว','white']];
const ART=[ // [emoji, name, draw(ctx)] on a 600x600 line layer
  ['☀️',B('ดวงอาทิตย์','Sun'),c=>{circ(c,300,300,110);for(let i=0;i<12;i++){const a=i*Math.PI/6,p=a+.18,q=a-.18;c.beginPath();c.moveTo(300+135*Math.sin(q),300-135*Math.cos(q));c.lineTo(300+235*Math.sin(a),300-235*Math.cos(a));c.lineTo(300+135*Math.sin(p),300-135*Math.cos(p));c.closePath();c.stroke()}}],
  ['🏠',B('บ้าน','House'),c=>{c.strokeRect(120,280,360,260);poly(c,[[90,285],[300,100],[510,285]]);c.strokeRect(255,390,90,150);c.strokeRect(160,330,70,70);c.strokeRect(370,330,70,70);c.strokeRect(390,130,50,95)}],
  ['🐟',B('ปลา','Fish'),c=>{c.beginPath();c.ellipse(260,300,170,110,0,0,7);c.stroke();poly(c,[[420,300],[540,200],[540,400]]);circ(c,170,270,18);poly(c,[[240,195],[290,110],[330,200]])}],
  ['🌸',B('ดอกไม้','Flower'),c=>{for(let i=0;i<6;i++){const a=i*Math.PI/3;circ(c,300+85*Math.sin(a),210-0+(-85*Math.cos(a))+0,55)}circ(c,300,210,45);c.strokeRect(285,340,30,230);c.beginPath();c.ellipse(225,450,60,28,-.5,0,7);c.stroke();c.beginPath();c.ellipse(375,400,60,28,.5,0,7);c.stroke()}],
  ['🌳',B('ต้นไม้','Tree'),c=>{c.strokeRect(255,360,90,200);circ(c,300,230,150);circ(c,230,200,28);circ(c,350,170,28);circ(c,330,265,28)}],
  ['🚗',B('รถ','Car'),c=>{rr(c,70,320,460,130,40);poly(c,[[160,320],[220,210],[390,210],[460,320]]);poly(c,[[190,310],[235,235],[290,235],[290,310]]);poly(c,[[310,310],[310,235],[375,235],[425,310]]);circ(c,170,455,55);circ(c,170,455,22);circ(c,430,455,55);circ(c,430,455,22)}],
  ['❤️',B('หัวใจ','Heart'),c=>{c.beginPath();c.moveTo(300,520);c.bezierCurveTo(60,370,90,130,300,240);c.bezierCurveTo(510,130,540,370,300,520);c.closePath();c.stroke()}],
  ['⭐',B('ดาว','Star'),c=>{const p=[];for(let i=0;i<10;i++){const r=i%2?105:250,a=i*Math.PI/5;p.push([300+r*Math.sin(a),320-r*Math.cos(a)])}poly(c,p)}]];
function circ(c,x,y,r){c.beginPath();c.arc(x,y,r,0,7);c.stroke()}
function poly(c,p){c.beginPath();c.moveTo(p[0][0],p[0][1]);p.slice(1).forEach(q=>c.lineTo(q[0],q[1]));c.closePath();c.stroke()}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();c.stroke()}

function roomDraw(artIdx){
  theme(307);
  const S=600;let art=artIdx==null?-1:artIdx,col=PCOL[0][0],tool=art<0?'brush':'fill',size=14,hist=[],drawing=false,last=null;
  app.innerHTML=roomTop()+`<div class="card drawcard"><h1>🎨 ${tx(B('วาดรูป / ระบายสี','Draw & colour'))}</h1>
  <div class="tabs"><button class="tab ${art<0?'on':''}" data-a="-1">✏️ ${tx(B('กระดานเปล่า','Blank'))}</button>${ART.map((a,i)=>`<button class="tab ${i===art?'on':''}" data-a="${i}">${a[0]}</button>`).join('')}</div>
  <div class="cwrap"><canvas id="cp" width="${S}" height="${S}"></canvas><canvas id="cl" width="${S}" height="${S}"></canvas></div>
  <div class="ctl"><div class="pal">${PCOL.map((p,i)=>`<button class="sw2 ${i===0?'on':''}" data-i="${i}" style="background:${p[0]}"></button>`).join('')}</div>
  <div class="tools"><button class="tl" data-t="brush">🖌️</button><button class="tl" data-t="fill">🪣</button><button class="tl" data-t="erase">🧽</button>
  <button class="tl" id="small">•</button><button class="tl" id="bigb" style="font-size:34px">●</button><button class="tl" id="undo">↩️</button><button class="tl" id="clr">🗑️</button></div></div></div>`;
  const cp=$('#cp'),cl=$('#cl'),g=cp.getContext('2d',{willReadFrequently:true}),gl=cl.getContext('2d',{willReadFrequently:true});
  g.fillStyle='#fff';g.fillRect(0,0,S,S);g.lineCap=g.lineJoin='round';
  if(art>=0){gl.lineWidth=9;gl.lineCap=gl.lineJoin='round';gl.strokeStyle='#2b2d42';ART[art][2](gl)}
  const toolMark=()=>document.querySelectorAll('.tl[data-t]').forEach(b=>b.classList.toggle('on',b.dataset.t===tool));toolMark();
  const snap=()=>{hist.push(g.getImageData(0,0,S,S));if(hist.length>10)hist.shift()};
  const pos=e=>{const r=cp.getBoundingClientRect();return[(e.clientX-r.left)*S/r.width,(e.clientY-r.top)*S/r.height]};
  const hexRGB=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
  function flood(x0,y0){
    x0|=0;y0|=0;const img=g.getImageData(0,0,S,S),d=img.data,line=gl.getImageData(0,0,S,S).data,[fr,fg,fb]=hexRGB(col);
    const i0=(y0*S+x0)*4,sr=d[i0],sg=d[i0+1],sb=d[i0+2];
    if(line[i0+3]>90)return false;               // tapped on a line
    if(Math.abs(sr-fr)+Math.abs(sg-fg)+Math.abs(sb-fb)<12)return false;
    const ok=i=>line[i*4+3]<90&&Math.abs(d[i*4]-sr)+Math.abs(d[i*4+1]-sg)+Math.abs(d[i*4+2]-sb)<60;
    const seen=new Uint8Array(S*S),st=[y0*S+x0];seen[y0*S+x0]=1;
    while(st.length){
      const i=st.pop(),x=i%S,y=(i/S)|0,o=i*4;d[o]=fr;d[o+1]=fg;d[o+2]=fb;d[o+3]=255;
      if(x>0&&!seen[i-1]&&ok(i-1)){seen[i-1]=1;st.push(i-1)}
      if(x<S-1&&!seen[i+1]&&ok(i+1)){seen[i+1]=1;st.push(i+1)}
      if(y>0&&!seen[i-S]&&ok(i-S)){seen[i-S]=1;st.push(i-S)}
      if(y<S-1&&!seen[i+S]&&ok(i+S)){seen[i+S]=1;st.push(i+S)}
    }
    // soften the halo next to lines: grow the fill one pixel under the outline layer
    for(let i=0;i<S*S;i++){if(seen[i])continue;const x=i%S;
      if((x>0&&seen[i-1])||(x<S-1&&seen[i+1])||(i>=S&&seen[i-S])||(i<S*S-S&&seen[i+S])){if(line[i*4+3]>=20){d[i*4]=fr;d[i*4+1]=fg;d[i*4+2]=fb}}}
    g.putImageData(img,0,0);return true;
  }
  cp.style.touchAction=cl.style.touchAction='none';
  cp.addEventListener('pointerdown',e=>{
    e.preventDefault();ctx();const[x,y]=pos(e);
    if(tool==='fill'){snap();if(flood(x,y))sTap();else hist.pop();return}
    snap();drawing=true;last=[x,y];cp.setPointerCapture(e.pointerId);
    g.fillStyle=tool==='erase'?'#fff':col;g.beginPath();g.arc(x,y,(tool==='erase'?size*1.6:size)/2,0,7);g.fill();
  });
  cp.addEventListener('pointermove',e=>{
    if(!drawing)return;const[x,y]=pos(e);
    g.strokeStyle=tool==='erase'?'#fff':col;g.lineWidth=tool==='erase'?size*1.6:size;
    g.beginPath();g.moveTo(last[0],last[1]);g.lineTo(x,y);g.stroke();last=[x,y];
  });
  const up=()=>{drawing=false};cp.addEventListener('pointerup',up);cp.addEventListener('pointercancel',up);
  document.querySelectorAll('.sw2').forEach(b=>b.onclick=()=>{
    const p=PCOL[+b.dataset.i];col=p[0];if(tool==='erase')tool=art<0?'brush':'fill';toolMark();
    document.querySelectorAll('.sw2').forEach(x=>x.classList.toggle('on',x===b));sTap();speak(B(p[1],p[2]));
  });
  document.querySelectorAll('.tl[data-t]').forEach(b=>b.onclick=()=>{tool=b.dataset.t;toolMark();sTap();
    speak(tool==='brush'?B('พู่กัน','Brush'):tool==='fill'?B('เทสี','Fill colour'):B('ยางลบ','Eraser'))});
  $('#small').onclick=()=>{size=7;sTap()};$('#bigb').onclick=()=>{size=26;sTap()};
  $('#undo').onclick=()=>{const h=hist.pop();if(h)g.putImageData(h,0,0);sTap()};
  $('#clr').onclick=()=>askConfirm(tx(B('ลบทั้งหมดแล้วเริ่มใหม่?','Clear everything?')),()=>{snap();g.fillStyle='#fff';g.fillRect(0,0,S,S)});
  document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{const a=+b.dataset.a;sTap();if(a>=0)speak(ART[a][1]);roomDraw(a)});
  $('#pback').onclick=playHub;bindLang(()=>roomDraw(art<0?undefined:art));
}
