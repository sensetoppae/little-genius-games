'use strict';
/* ========= Colouring studio (replaces the old roomDraw) =========
   Loaded after play.js and art.js. Picker of pictures with thumbnails, 20 colours, magic fills
   (rainbow / stripes / dots / checker / glitter), brushes (normal / rainbow / sparkle), emoji stamps,
   eraser, undo, "I'm done" celebration and a personal gallery saved on the device. */
const PAINT=[
 ['#e53935','แดง','Red'],['#fb8c00','ส้ม','Orange'],['#fdd835','เหลือง','Yellow'],['#9ccc65','เขียวอ่อน','Light green'],['#43a047','เขียว','Green'],
 ['#26c6da','ฟ้าอมเขียว','Turquoise'],['#4fc3f7','ฟ้า','Sky blue'],['#1e88e5','น้ำเงิน','Blue'],['#3949ab','น้ำเงินเข้ม','Navy'],['#8e24aa','ม่วง','Purple'],
 ['#ec407a','ชมพู','Pink'],['#f8bbd0','ชมพูอ่อน','Light pink'],['#ffcc80','สีเนื้อ','Peach'],['#ffe9a8','ครีม','Cream'],['#ffc107','ทอง','Gold'],
 ['#6d4c41','น้ำตาล','Brown'],['#9e9e9e','เทา','Grey'],['#212121','ดำ','Black'],['#ffffff','ขาว','White'],['#b71c1c','แดงเข้ม','Dark red']];
const MAGIC=[['solid','●',B('สีเดียว','Plain')],['rainbow','🌈',B('สายรุ้ง','Rainbow')],['stripes','▨',B('ลายทาง','Stripes')],['dots','⚬',B('ลายจุด','Dots')],['checker','▦',B('ลายตาราง','Checker')],['glitter','✨',B('กลิตเตอร์','Glitter')]];
const PTOOLS=[['fill','🪣',B('เทสี','Fill')],['brush','🖌️',B('พู่กัน','Brush')],['rainbow','🌈',B('พู่กันรุ้ง','Rainbow brush')],['sparkle','✨',B('ประกาย','Sparkle')],['stamp','⭐',B('ตราประทับ','Stamps')],['erase','🧽',B('ยางลบ','Eraser')]];
const STAMPS=['⭐','❤️','🌸','🦋','🐟','🌈','☀️','🍎','🐶','🐱','🎈','🌙','🐞','🍓','🦄','👑'];
const PCATS=[['all','🎨',B('ทั้งหมด','All')],['animal','🐶',B('สัตว์','Animals')],['ride','🚗',B('ยานพาหนะ','Vehicles')],['food','🍎',B('ขนม ผลไม้','Food')],['nature','🌳',B('ธรรมชาติ','Nature')],['fun','🎈',B('ของเล่น สิ่งของ','Fun & things')]];
const PCAT_OF={animal:'🐟🐱🐶🐰🐻🐷🦁🐸🦋🐞🐝🦉🦆🐧🐢🐘',ride:'🚗🚀✈️⛵🚂🚌',food:'🍎🍓🍦🧁',nature:'☀️🌸🌳🌙🍄🌈🌵⛄☂️',fun:'🏠❤️⭐🎈🏰🤖👑🪁⏰'};
const catOfArt=e=>Object.keys(PCAT_OF).find(k=>[...PCAT_OF[k].matchAll(/./gu)].some(m=>m[0]===e))||'fun';

/* ---- colour helpers & magic patterns ---- */
const hexRGB=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
const mixRGB=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));
function hsl2rgb(h,s,l){h/=360;const f=n=>{const k=(n+h*12)%12,a=s*Math.min(l,1-l);return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))))};return[f(0),f(8),f(4)]}
function patternFn(kind,rgb){
  const light=mixRGB(rgb,[255,255,255],.62);
  switch(kind){
    case 'rainbow':return(x,y)=>hsl2rgb(((x+y)/1200*360)%360,.85,.6);
    case 'stripes':return(x,y)=>(((x+y)/26)|0)%2?light:rgb;
    case 'dots':return(x,y)=>{const dx=x%28-14,dy=y%28-14;return dx*dx+dy*dy<49?rgb:light};
    case 'checker':return(x,y)=>((((x/30)|0)+((y/30)|0))%2)?light:rgb;
    case 'glitter':return(x,y)=>{const h=(((x*73856093)^(y*19349663))>>>0)%100;return h<5?[255,255,255]:h<9?mixRGB(rgb,[255,255,255],.55):rgb};
    default:return()=>rgb;
  }
}
const magicCSS=(kind,col)=>kind==='rainbow'?'linear-gradient(135deg,#ff5252,#ffb300,#ffee58,#66bb6a,#42a5f5,#ab47bc)':
  kind==='stripes'?`repeating-linear-gradient(45deg,${col} 0 6px,#fff 6px 12px)`:kind==='dots'?`radial-gradient(${col} 28%,#fff 30%) 0 0/9px 9px`:
  kind==='checker'?`conic-gradient(${col} 25%,#fff 0 50%,${col} 0 75%,#fff 0) 0 0/14px 14px`:kind==='glitter'?`radial-gradient(#fff 8%,transparent 10%) 0 0/8px 8px,${col}`:col;

/* ---- small shared helpers ---- */
const thumbCache={},boundsCache={};
function artBounds(i){
  if(boundsCache[i])return boundsCache[i];
  const c=document.createElement('canvas');c.width=c.height=600;
  const g=c.getContext('2d');g.lineWidth=9;g.lineCap=g.lineJoin='round';g.strokeStyle='#000';
  ART[i][2](g);
  const d=g.getImageData(0,0,600,600).data;
  let x0=600,y0=600,x1=0,y1=0;
  for(let y=0;y<600;y++)for(let x=0;x<600;x++)if(d[(y*600+x)*4+3]>20){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  if(x1<=x0||y1<=y0)return boundsCache[i]={cx:300,cy:300,w:500,h:500};
  return boundsCache[i]={cx:(x0+x1)/2,cy:(y0+y1)/2,w:x1-x0,h:y1-y0};
}
function drawArtFitted(g,i,W,H,ratio=.86){
  const b=artBounds(i),sc=Math.min((W*ratio)/b.w,(H*ratio)/b.h);
  g.save();
  g.translate(W/2-b.cx*sc,H/2-b.cy*sc);
  g.scale(sc,sc);
  g.lineWidth=9/sc;g.lineCap=g.lineJoin='round';g.strokeStyle='#2b2d42';
  ART[i][2](g);
  g.restore();
}
function artThumb(i,size=180){
  const k=i+':'+size;if(thumbCache[k])return thumbCache[k];
  const big=document.createElement('canvas');big.width=big.height=600;const g=big.getContext('2d');drawArtFitted(g,i,600,600,.86);
  const sm=document.createElement('canvas');sm.width=sm.height=size;const s=sm.getContext('2d');s.fillStyle='#fff';s.fillRect(0,0,size,size);s.drawImage(big,0,0,size,size);
  return thumbCache[k]=sm.toDataURL('image/png');
}
function pModal(html,onClose){
  const o=document.createElement('div');o.className='pmodal';o.innerHTML=`<div class="card pmcard">${html}</div>`;
  document.body.appendChild(o);
  const close=()=>{o.remove();if(onClose)onClose()};
  o.addEventListener('pointerdown',e=>{if(e.target===o)close()});
  return{el:o,close};
}
function pToast(msg){
  const t=document.createElement('div');t.className='ptoast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2200);
}
const worksOf=()=>{const p=P();if(!p)return[];if(!p.works)p.works=[];return p.works};
const roomTopP=back=>`<div class="top"><button class="iconbtn" id="pback">⬅</button><div class="grow"></div>${langBtn()}</div>`;

/* ================= picture picker ================= */
function paintPick(cat){
  cat=cat||'all';theme(307);
  const items=ART.map((a,i)=>({a,i,c:catOfArt(a[0])})).filter(x=>cat==='all'||x.c===cat);
  app.innerHTML=roomTopP()+`<div class="card"><h1>🎨 ${tx(B('ห้องระบายสี','Colouring studio'))}</h1>
  <div class="sub">${tx(B('เลือกภาพที่อยากระบาย','Pick a picture to colour'))}</div>
  <div class="tabs pcats">${PCATS.map(c=>`<button class="tab ${c[0]===cat?'on':''}" data-c="${c[0]}">${c[1]} ${tx(c[2])}</button>`).join('')}</div>
  <div class="pbtns"><button class="pbtn" id="pblank">✏️ ${tx(B('กระดานเปล่า','Blank page'))}</button><button class="pbtn" id="prand">🎲 ${tx(B('สุ่มภาพ','Surprise me'))}</button><button class="pbtn" id="pwk">🏆 ${tx(B(`ผลงานของฉัน (${worksOf().length})`,`My gallery (${worksOf().length})`))}</button></div>
  <div class="pthumbs">${items.map(x=>`<button class="pth" data-i="${x.i}"><img src="${artThumb(x.i)}" alt=""><span>${x.a[0]} ${tx(x.a[1])}</span></button>`).join('')}</div></div>`;
  $('#pback').onclick=playHub;bindLang(()=>paintPick(cat));
  document.querySelectorAll('.pcats .tab').forEach(b=>b.onclick=()=>{sTap();paintPick(b.dataset.c)});
  document.querySelectorAll('.pth').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;sTap();speak(ART[i][1]);paintBoard(i)});
  $('#pblank').onclick=()=>{sTap();paintBoard(-1)};
  $('#prand').onclick=()=>{sTap();const i=ri(0,ART.length-1);speak(ART[i][1]);paintBoard(i)};
  $('#pwk').onclick=paintGallery;
}
function roomDraw(i){ if(i===undefined||i===null)paintPick();else paintBoard(i) }

/* ================= gallery of finished works ================= */
function paintGallery(){
  theme(307);const ws=worksOf();
  app.innerHTML=roomTopP()+`<div class="card"><h1>🏆 ${tx(B('ผลงานของฉัน','My gallery'))}</h1>
  ${ws.length?`<div class="pthumbs">${ws.map((w,k)=>`<button class="pth" data-k="${k}"><img src="${w.img}" alt=""><span>${w.t} ${new Date(w.ts).toLocaleDateString()}</span></button>`).join('')}</div>`:
  `<div class="mascot">🖼️</div><div class="sub">${tx(B('ยังไม่มีผลงาน ลองระบายสีแล้วกด "เสร็จแล้ว" ดูนะ','No artwork yet — colour a picture and press "Done"!'))}</div>`}
  <button class="big" id="pnew" style="margin-top:12px">🎨 ${tx(B('ระบายสีภาพใหม่','Colour something new'))}</button></div>`;
  $('#pback').onclick=()=>paintPick();bindLang(paintGallery);
  $('#pnew').onclick=()=>paintPick();
  document.querySelectorAll('.pth').forEach(b=>b.onclick=()=>{
    const w=ws[+b.dataset.k];sTap();
    const m=pModal(`<img class="pbigimg" src="${w.img}" alt=""><div class="row"><button class="big alt" id="mdl">⬇️ ${tx(B('บันทึกรูป','Save image'))}</button><button class="big grey" id="mdel">🗑️ ${tx(B('ลบ','Delete'))}</button></div><button class="big" id="mok">${tx(B('ปิด','Close'))}</button>`);
    $('#mok').onclick=m.close;
    $('#mdl').onclick=()=>{const a=document.createElement('a');a.href=w.img;a.download='my-art.jpg';a.click()};
    $('#mdel').onclick=()=>askConfirm(tx(B('ลบผลงานนี้?','Delete this artwork?')),()=>{ws.splice(+b.dataset.k,1);save();m.close();paintGallery()});
  });
}

/* ================= the drawing board ================= */
function paintBoard(artIdx){
  theme(307);
  let art=artIdx,col=PAINT[0][0],tool=art<0?'brush':'fill',magic='solid',size=16,stamp=STAMPS[0],hist=[],drawing=false,last=null,hue=0,fills=0,praised=false,lastSpark=null;
  const name=art>=0?ART[art][1]:B('กระดานเปล่า','Blank page'),icon=art>=0?ART[art][0]:'✏️';
  app.innerHTML=`<div class="card paintcard">
  <div class="pbar"><button class="pbtn" id="pback">⬅</button><button class="pbtn" id="pchg">🖼️ ${tx(B('เลือกภาพ','Pictures'))}</button><span class="ptitle">${icon} ${tx(name)}</span><button class="pbtn" id="pwk">🏆</button>${langBtn()}</div>
  <div class="pmain">
   <div class="cwrap"><canvas id="cp"></canvas><canvas id="cl"></canvas></div>
   <div class="pctl">
    <div class="ppal">${PAINT.map((p,i)=>`<button class="sw2 ${i===0?'on':''}" data-i="${i}" style="background:${p[0]}" aria-label="${p[2]}"></button>`).join('')}</div>
    <div class="pmagic" id="pmagic">${MAGIC.map((m,i)=>`<button class="pm ${i===0?'on':''}" data-m="${m[0]}" title="${tx(m[2])}"><i style="background:${magicCSS(m[0],PAINT[0][0])}"></i></button>`).join('')}</div>
    <div class="ptools">${PTOOLS.map(t=>`<button class="pt" data-t="${t[0]}"><b>${t[1]}</b><small>${tx(t[2])}</small></button>`).join('')}</div>
    <div class="psizes" id="psizes"><button class="ps" data-s="7"><i style="width:8px;height:8px"></i></button><button class="ps on" data-s="16"><i style="width:15px;height:15px"></i></button><button class="ps" data-s="30"><i style="width:24px;height:24px"></i></button></div>
    <div class="pstamps" id="pstamps" hidden>${STAMPS.map((s,i)=>`<button class="pst ${i===0?'on':''}" data-s="${s}">${s}</button>`).join('')}</div>
    <div class="pact"><button class="pbtn" id="undo">↩️ ${tx(B('ย้อนกลับ','Undo'))}</button><button class="pbtn" id="clr">🗑️ ${tx(B('ล้าง','Clear'))}</button><button class="pbtn done" id="done">✅ ${tx(B('เสร็จแล้ว!','Done!'))}</button></div>
   </div>
  </div></div>`;
  const cp=$('#cp'),cl=$('#cl'),wrap=document.querySelector('.cwrap');
  const wr=wrap.getBoundingClientRect(),ar=(wr.width>20&&wr.height>20)?wr.width/wr.height:1;
  const W=ar>=1?Math.round(600*ar):600;
  const H=ar<1?Math.round(600/ar):600;
  cp.width=cl.width=W;cp.height=cl.height=H;
  const g=cp.getContext('2d',{willReadFrequently:true}),gl=cl.getContext('2d',{willReadFrequently:true});
  g.fillStyle='#fff';g.fillRect(0,0,W,H);g.lineCap=g.lineJoin='round';
  if(art>=0)drawArtFitted(gl,art,W,H,.86);
  cp.style.touchAction=cl.style.touchAction='none';
  const lineData=art>=0?gl.getImageData(0,0,W,H).data:null;

  const mark=()=>{
    document.querySelectorAll('.pt').forEach(b=>b.classList.toggle('on',b.dataset.t===tool));
    $('#pmagic').style.display=tool==='fill'?'grid':'none';      // magic fills and brush sizes share one row
    $('#psizes').style.display=tool==='fill'?'none':'flex';
    $('#pstamps').hidden=tool!=='stamp';
    document.querySelectorAll('.pm i').forEach((el,i)=>el.style.background=magicCSS(MAGIC[i][0],col));
  };
  mark();
  const snap=()=>{hist.push(g.getImageData(0,0,W,H));if(hist.length>15)hist.shift()};
  const pos=e=>{const r=cp.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]};

  function burst(x,y,em){
    const r=cp.getBoundingClientRect(),w=wrap.getBoundingClientRect();
    for(let k=0;k<5;k++){const s=document.createElement('span');s.className='pspark';s.textContent=em||pick(['✨','⭐','💫']);
      s.style.left=((x/W)*r.width+(r.left-w.left)+ri(-26,26))+'px';s.style.top=((y/H)*r.height+(r.top-w.top)+ri(-26,26))+'px';s.style.animationDelay=k*40+'ms';wrap.appendChild(s);setTimeout(()=>s.remove(),900)}
  }
  function flood(x0,y0){
    x0|=0;y0|=0;
    if(x0<0||x0>=W||y0<0||y0>=H)return false;
    const img=g.getImageData(0,0,W,H),d=img.data,line=lineData,rgb=hexRGB(col),fn=patternFn(magic,rgb),i0=(y0*W+x0)*4;
    const sr=d[i0],sg=d[i0+1],sb=d[i0+2];
    if(line&&line[i0+3]>90)return false;                       // tapped on an outline
    if(magic==='solid'&&Math.abs(sr-rgb[0])+Math.abs(sg-rgb[1])+Math.abs(sb-rgb[2])<12&&!line)return false;
    const ok=line?(i=>line[i*4+3]<90):(i=>Math.abs(d[i*4]-sr)+Math.abs(d[i*4+1]-sg)+Math.abs(d[i*4+2]-sb)<60);
    const seen=new Uint8Array(W*H),st=[y0*W+x0],fill=[];seen[y0*W+x0]=1;
    while(st.length){
      const i=st.pop(),x=i%W,y=(i/W)|0;fill.push(i);
      if(x>0&&!seen[i-1]&&ok(i-1)){seen[i-1]=1;st.push(i-1)}
      if(x<W-1&&!seen[i+1]&&ok(i+1)){seen[i+1]=1;st.push(i+1)}
      if(y>0&&!seen[i-W]&&ok(i-W)){seen[i-W]=1;st.push(i-W)}
      if(y<H-1&&!seen[i+W]&&ok(i+W)){seen[i+W]=1;st.push(i+W)}
    }
    if(fill.length<20&&line)return false;
    const put=i=>{const c=fn(i%W,(i/W)|0),o=i*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255};
    fill.forEach(put);
    if(line)fill.forEach(i=>{ // grow one pixel under the outlines so no white halo is left
      const x=i%W;
      if(x>0&&!seen[i-1])put(i-1);if(x<W-1&&!seen[i+1])put(i+1);if(i>=W&&!seen[i-W])put(i-W);if(i<W*H-W&&!seen[i+W])put(i+W);
    });
    g.putImageData(img,0,0);return true;
  }
  const star4=(x,y,r,fill)=>{g.fillStyle=fill;g.beginPath();for(let k=0;k<8;k++){const a=k*Math.PI/4,rr=k%2?r*.35:r;g.lineTo(x+rr*Math.sin(a),y-rr*Math.cos(a))}g.closePath();g.fill()};
  function celebrateFirst(){
    if(praised||fills<6)return;praised=true;
    confetti();pToast(tx(B('🌟 สวยมาก!','🌟 Beautiful!')));speak(B('สวยมากเลย','Beautiful!'));
  }

  cp.addEventListener('pointerdown',e=>{
    e.preventDefault();ctx();const[x,y]=pos(e);
    if(tool==='fill'){
      snap();
      if(flood(x,y)){fills++;tone(380+ri(0,6)*70,0,.18,'triangle',.12);tone(760,.08,.15,'sine',.08);burst(x,y);celebrateFirst()}
      else{hist.pop();sBad()}
      return;
    }
    if(tool==='stamp'){
      snap();const sz=size<10?64:size<20?100:170;
      g.save();g.translate(x,y);g.rotate((Math.random()-.5)*.6);g.font=`${sz}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(stamp,0,sz*.05);g.restore();
      tone(520+ri(0,5)*60,0,.12,'triangle',.1);burst(x,y,stamp);fills++;celebrateFirst();return;
    }
    snap();drawing=true;last=[x,y];lastSpark=[x,y];cp.setPointerCapture(e.pointerId);
    if(tool==='sparkle'){star4(x,y,size*.9,hsl2css(ri(0,359)));return}
    g.fillStyle=tool==='erase'?'#fff':tool==='rainbow'?`hsl(${hue},90%,55%)`:col;
    g.beginPath();g.arc(x,y,(tool==='erase'?size*1.6:size)/2,0,7);g.fill();
  });
  const hsl2css=h=>`hsl(${h},90%,58%)`;
  cp.addEventListener('pointermove',e=>{
    if(!drawing)return;const[x,y]=pos(e);
    if(tool==='sparkle'){
      if(Math.hypot(x-lastSpark[0],y-lastSpark[1])>size*1.6){star4(x+ri(-8,8),y+ri(-8,8),size*(.6+Math.random()*.7),hsl2css(ri(0,359)));lastSpark=[x,y]}
      last=[x,y];return;
    }
    if(tool==='rainbow'){hue=(hue+4)%360;g.strokeStyle=`hsl(${hue},90%,55%)`}else g.strokeStyle=tool==='erase'?'#fff':col;
    g.lineWidth=tool==='erase'?size*1.6:size;
    g.beginPath();g.moveTo(last[0],last[1]);g.lineTo(x,y);g.stroke();last=[x,y];
  });
  const up=()=>{drawing=false};cp.addEventListener('pointerup',up);cp.addEventListener('pointercancel',up);

  document.querySelectorAll('.sw2').forEach(b=>b.onclick=()=>{
    const p=PAINT[+b.dataset.i];col=p[0];if(tool==='erase')tool=art<0?'brush':'fill';
    document.querySelectorAll('.sw2').forEach(x=>x.classList.toggle('on',x===b));mark();sTap();speak(B(p[1],p[2]));
  });
  document.querySelectorAll('.pm').forEach(b=>b.onclick=()=>{magic=b.dataset.m;document.querySelectorAll('.pm').forEach(x=>x.classList.toggle('on',x===b));sTap();speak(MAGIC.find(m=>m[0]===magic)[2])});
  document.querySelectorAll('.pt').forEach(b=>b.onclick=()=>{tool=b.dataset.t;mark();sTap();speak(PTOOLS.find(t=>t[0]===tool)[2])});
  document.querySelectorAll('.ps').forEach(b=>b.onclick=()=>{size=+b.dataset.s;document.querySelectorAll('.ps').forEach(x=>x.classList.toggle('on',x===b));sTap()});
  document.querySelectorAll('.pst').forEach(b=>b.onclick=()=>{stamp=b.dataset.s;document.querySelectorAll('.pst').forEach(x=>x.classList.toggle('on',x===b));sTap()});
  $('#undo').onclick=()=>{const h=hist.pop();if(h)g.putImageData(h,0,0);sTap()};
  $('#clr').onclick=()=>askConfirm(tx(B('ลบสีทั้งหมดแล้วเริ่มใหม่?','Clear all the colours?')),()=>{snap();g.fillStyle='#fff';g.fillRect(0,0,W,H)});
  $('#pchg').onclick=()=>paintPick();
  $('#pwk').onclick=paintGallery;
  $('#pback').onclick=()=>paintPick();
  bindLang(()=>paintBoard(art));

  $('#done').onclick=()=>{
    const full=document.createElement('canvas');full.width=W;full.height=H;const f=full.getContext('2d');f.drawImage(cp,0,0);f.drawImage(cl,0,0);
    const sm=document.createElement('canvas');sm.width=sm.height=360;const sc=Math.min(360/W,360/H),sw=W*sc,sh=H*sc,sx=sm.getContext('2d');
    sx.fillStyle='#fff';sx.fillRect(0,0,360,360);sx.drawImage(full,(360-sw)/2,(360-sh)/2,sw,sh);
    const img=sm.toDataURL('image/jpeg',.82),png=full.toDataURL('image/png');
    const ws=worksOf();ws.unshift({t:icon,img,ts:Date.now()});if(ws.length>20)ws.length=20;save();
    sWin();confetti();speak(B(`สวยมาก ${P().name}`,`Wonderful, ${P().name}!`));
    const m=pModal(`<h1>🎉 ${tx(B('ผลงานสวยมาก!','Wonderful work!'))}</h1><img class="pbigimg" src="${img}" alt="">
      <div class="sub">${tx(B('เก็บไว้ใน "ผลงานของฉัน" แล้ว','Saved in "My gallery"'))}</div>
      <div class="row"><button class="big alt" id="mdl">⬇️ ${tx(B('บันทึกรูป','Save image'))}</button><button class="big" id="mnew">🎨 ${tx(B('ภาพใหม่','New picture'))}</button></div>
      <button class="big grey" id="mkeep" style="font-size:16px;padding:8px">${tx(B('ระบายต่อ','Keep colouring'))}</button>`);
    $('#mkeep').onclick=m.close;
    $('#mnew').onclick=()=>{m.close();paintPick()};
    $('#mdl').onclick=()=>{const a=document.createElement('a');a.href=png;a.download='my-colouring.png';a.click()};
  };
}
