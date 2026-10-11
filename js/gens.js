'use strict';
/* Question generators. Each takes c={N,b,p} (band 0-5, progress 0-1 inside the band)
   and returns a question object. Spoken text: string | {t,l} | {n} | {m} | {th,en}. */
const opt=(h,k,sp)=>({h:String(h),k:k===undefined?h:k,sp});
const T=(text,l)=>opt(text,text,{t:text,l});
function nOpts(c,n,min=0){
  const set=new Set([c]),mag=Math.max(1,Math.pow(10,String(Math.abs(c)).length-2)),ds=[1,2,3,mag,mag*2,10,5];
  let t=0;
  while(set.size<n&&t++<300){const v=c+pick(ds)*(Math.random()<.5?-1:1);if(v>=min&&v!==c)set.add(v)}
  let k=1;while(set.size<n)set.add(c+k++);
  return shuffle([...set]).map(v=>opt(v,v,{n:v}));
}
function dOpts(c,n,dec){
  const set=new Set([c.toFixed(dec)]),st=Math.pow(10,-dec);let t=0;
  while(set.size<n&&t++<200){const v=c+pick([1,2,3,10,-1,-2,-3,-10])*st;if(v>0)set.add(v.toFixed(dec))}
  return shuffle([...set]).map(s=>opt(s,s,{m:s}));
}
function C(prompt,visual,opts,ans,o){
  const i=opts.findIndex(x=>x.k===ans);
  return Object.assign({kind:'choice',prompt,visual,opts,ans:i},o);
}
const nPrompt=B('ตอบเท่าไหร่?','What is the answer?');
// round-robin through categories so a prefix of the list is varied
const VORDER=(()=>{const cs=Object.keys(CAT).map(k=>V_ALL.filter(w=>w.c===k)),out=[];for(let i=0;i<30;i++)cs.forEach(a=>{if(a[i])out.push(a[i])});return out})();

function clockSVG(h,m){
  let s='<svg viewBox="0 0 200 200" width="190" height="190"><circle cx="100" cy="100" r="94" fill="#fff" stroke="#2b2d42" stroke-width="6"/>';
  for(let i=1;i<=12;i++){const a=i*Math.PI/6;s+=`<text x="${100+72*Math.sin(a)}" y="${100-72*Math.cos(a)+7}" font-size="20" font-weight="800" text-anchor="middle" fill="#2b2d42">${i}</text>`}
  const ha=((h%12)+m/60)*30,ma=m*6;
  s+=`<line x1="100" y1="100" x2="100" y2="55" stroke="#2b2d42" stroke-width="8" stroke-linecap="round" transform="rotate(${ha} 100 100)"/>`;
  s+=`<line x1="100" y1="100" x2="100" y2="30" stroke="#ff5d5d" stroke-width="5" stroke-linecap="round" transform="rotate(${ma} 100 100)"/>`;
  return s+'<circle cx="100" cy="100" r="7" fill="#2b2d42"/></svg>';
}
function pieSVG(n,k,size=150){
  const r=size/2-6,cx=size/2,cy=size/2;
  let s=`<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`;
  if(n===1)return s+`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${k?'#ff9f1c':'#fff'}" stroke="#2b2d42" stroke-width="3"/></svg>`;
  for(let i=0;i<n;i++){
    const a0=i*2*Math.PI/n-Math.PI/2,a1=(i+1)*2*Math.PI/n-Math.PI/2;
    const x0=cx+r*Math.cos(a0),y0=cy+r*Math.sin(a0),x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1);
    s+=`<path d="M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 ${a1-a0>Math.PI?1:0} 1 ${x1} ${y1} Z" fill="${i<k?'#ff9f1c':'#fff'}" stroke="#2b2d42" stroke-width="3"/>`;
  }
  return s+'</svg>';
}
function rectSVG(w,h,showW=true,showH=true){
  // rectangle fits a fixed box (x 80-260, y 10-135); labels sit at fixed spots so they never leave the picture
  const sc=Math.min(170/w,120/h),W=w*sc,H=h*sc,x=80+(180-W)/2,y=10+(125-H)/2;
  return `<svg viewBox="0 0 280 190" width="260" height="176"><rect x="${x}" y="${y}" width="${W}" height="${H}" fill="#ffe29f" stroke="#2b2d42" stroke-width="4"/>`
   +(showW?`<text x="170" y="170" font-size="22" font-weight="800" text-anchor="middle">${w} cm</text>`:'')
   +(showH?`<text x="72" y="78" font-size="22" font-weight="800" text-anchor="end">${h} cm</text>`:'')+'</svg>';
}

/* ---------- vocab / reading ---------- */
function vocabGen(c,modes){
  const pool=VORDER.slice(0,Math.min(VORDER.length,lerp(c.b<=1?20:36,VORDER.length,Math.min(1,c.p*(c.b<=1?1.4:2)))));
  const n=c.b<=1?(c.p<.3?3:4):c.p<.4?4:c.p<.8?5:6;
  const m=pick(modes),w=pick(pool);
  const all=shuffle([w,...shuffle(pool.filter(x=>x!==w&&x.en!==w.en)).slice(0,n-1)]);
  const ans=w,cls=n===6?'n6':n===3?'n3':n===5?'n6':'';
  const en=x=>T(x.en,'en'),th=x=>T(x.th,'th'),pic=(x,l)=>opt(x.e,x,{t:l==='en'?x.en:x.th,l});
  switch(m){
   case 'e2en':return C(B('ภาพนี้ภาษาอังกฤษคืออะไร?','What is this in English?'),w.e,all.map(x=>{const o=en(x);o.k=x;return o}),ans,{vcls:'big',cls,onOk:()=>speak({t:w.en,l:'en'})});
   case 'e2th':return C(B('ภาพนี้ภาษาไทยเรียกว่าอะไร?','What is this called in Thai?'),w.e,all.map(x=>{const o=th(x);o.k=x;return o}),ans,{vcls:'big',cls,onOk:()=>speak({t:w.th,l:'th'})});
   case 'en2e':return C(B(`เลือกภาพของ "${w.en}"`,`Pick the picture for "${w.en}"`),w.en,all.map(x=>pic(x,'en')),ans,{vcls:'eq',emoji:true,cls,say:{t:w.en,l:'en'}});
   case 'th2e':return C(B(`เลือกภาพของ "${w.th}"`,`Pick the picture for "${w.th}"`),w.th,all.map(x=>pic(x,'th')),ans,{vcls:'eq',emoji:true,cls,say:{t:w.th,l:'th'}});
   case 'en2th':return C(B(`"${w.en}" ภาษาไทยคืออะไร?`,`What does "${w.en}" mean in Thai?`),w.e,all.map(x=>{const o=th(x);o.k=x;return o}),ans,{say:{t:w.en,l:'en'},onOk:()=>speak({t:w.th,l:'th'})});
   default:return C(B(`"${w.th}" ภาษาอังกฤษคืออะไร?`,`What is "${w.th}" in English?`),w.e,all.map(x=>{const o=en(x);o.k=x;return o}),ans,{say:{t:w.th,l:'th'},onOk:()=>speak({t:w.en,l:'en'})});
  }
}

const GEN={
/* ================= toddlers ================= */
tapNum(c){
  const max=lerp(3,10,c.p),nums=shuffle(Array.from({length:max},(_,i)=>i+1)).slice(0,Math.min(max,c.p<.4?3:4)),e=pick(EM);
  return {kind:'explore',prompt:B('แตะตัวเลข แล้วฟังเสียง','Tap a number and listen'),cols:nums.length>3?2:3,
    items:nums.sort((a,b)=>a-b).map(n=>({h:`${n}<small>${e.repeat(n)}</small>`,sp:{n}}))};
},
tapPic(c){
  const cat=pick(['animal','animal','food','vehicle','body','color','shape','thing']),pool=V_TOD.filter(w=>w.c===cat);
  const ws=shuffle(pool).slice(0,Math.min(pool.length,c.p<.5?4:6));
  return {kind:'explore',prompt:B('แตะรูป แล้วฟังเสียง','Tap a picture and listen'),cols:ws.length>4?3:2,
    items:ws.map(w=>({h:w.e,sp:cat==='animal'&&w.sEn?{th:`${w.th} ${w.sTh}`,en:`${w.en}, ${w.sEn}`}:{th:w.th,en:w.en}}))};
},
countTap(c){
  return {kind:'tapcount',prompt:B('แตะนับไปด้วยกัน','Tap to count together'),n:lerp(2,10,c.p),e:pick(EM)};
},
findPic(c){
  const n=c.p<.35?2:c.p<.7?3:4;
  if(Math.random()<.3){
    const nums=shuffle([1,2,3,4,5,6,7,8,9,10].slice(0,lerp(4,10,c.p))).slice(0,n),t=pick(nums);
    return C(B(`เลขอะไรอยู่ที่ไหน? หาเลข ${thNum(t)}`,`Find the number ${enNum(t)}`),'',nums.map(x=>opt(x,x,{n:x})),t,{tod:true,emoji:true,say:B(`หาเลข ${thNum(t)}`,`Find the number ${enNum(t)}`)});
  }
  const cat=pick(['animal','food','vehicle','body','color','shape','thing']),pool=V_TOD.filter(w=>w.c===cat),ws=shuffle(pool).slice(0,n),w=pick(ws);
  return C(B(`${w.th} อยู่ไหน?`,`Where is the ${w.en}?`),'',ws.map(x=>opt(x.e,x,{th:x.th,en:x.en})),w,{tod:true,emoji:true,say:B(`${w.th} อยู่ไหน`,`Where is the ${w.en}`)});
},
soundQ(c){
  const an=V_TOD.filter(w=>w.c==='animal'&&w.sEn),n=c.p<.5?2:3,ws=shuffle(an).slice(0,n),w=pick(ws);
  return C(B(`ตัวไหนร้อง "${w.sTh}"?`,`Who says "${w.sEn}"?`),'🔊',ws.map(x=>opt(x.e,x,{th:x.th,en:x.en})),w,{tod:true,emoji:true,vcls:'big',say:B(`ตัวไหนร้อง ${w.sTh}`,`Who says ${w.sEn}`)});
},
memory(c){
  const pairs=c.b===0?lerp(2,3,c.p):c.b===1?lerp(3,6,c.p):c.b===2?lerp(4,8,c.p):lerp(6,10,c.p);
  let cards=[];
  if(c.b>=3&&Math.random()<.5){
    const used=new Set();
    for(let i=0;i<pairs;i++){
      let a,b,h,r;
      do{if(c.b===3){a=ri(2,12);b=ri(2,12);h=`${a}+${b}`;r=a+b}else{a=ri(2,9);b=ri(2,9);h=`${a}×${b}`;r=a*b}}while(used.has(r));
      used.add(r);
      cards.push({k:i,h,w:true,sp:{m:h.replace('+',' + ').replace('×',' × ')}},{k:i,h:String(r),w:true,sp:{n:r}});
    }
  }else{
    const ws=shuffle(VORDER.slice(0,40)).slice(0,pairs),word=c.b>=1&&c.p>.4&&Math.random()<.6,L=pick(['en','th']);
    ws.forEach((w,i)=>{
      cards.push({k:i,h:w.e,sp:{th:w.th,en:w.en}});
      cards.push(word?{k:i,h:L==='en'?w.en:w.th,w:true,sp:{t:L==='en'?w.en:w.th,l:L}}:{k:i,h:w.e,sp:{th:w.th,en:w.en}});
    });
  }
  return {kind:'memory',prompt:B('จับคู่ที่เหมือนกัน','Find the matching pairs'),cards:shuffle(cards),pairs,cols:cards.length>12?5:4};
},

/* ================= numbers ================= */
count(c){
  const max=c.b<=1?lerp(3,20,c.p):lerp(10,40,c.p);
  const e1=pick(EM);
  if(c.b>=1&&c.p>.45&&max>=8){
    const e2=pick(EM.filter(x=>x!==e1)),a=ri(2,max>>1),b=ri(2,max>>1);
    const items=shuffle([...Array(a).fill(e1),...Array(b).fill(e2)]),ask=Math.random()<.5?e1:e2,n=ask===e1?a:b;
    return C(B(`มี ${ask} กี่อัน? (แตะนับได้)`,`How many ${ask}? (tap to count)`),`<div class="cnt">${items.map(x=>`<span class="ci">${x}</span>`).join('')}</div>`,nOpts(n,4,1),n,{say:B('มีกี่อัน','How many?')});
  }
  const n=ri(1,max);
  return C(B('นับดู มีกี่อัน? (แตะนับได้)','Count! How many? (tap to count)'),`<div class="cnt" style="font-size:${n>20?30:n>10?40:54}px">${Array(n).fill(`<span class="ci">${e1}</span>`).join('')}</div>`,nOpts(n,4,1),n,{say:B('นับดู มีกี่อัน','Count. How many?')});
},
numRec(c){
  const max=c.b<=1?lerp(5,20,c.p):lerp(20,100,c.p),n=ri(1,max);
  const modes=c.b<=1?['hear','pic','next']:['hear','word','next','prev'];
  if(c.p>.2)modes.push('thdig');
  const m=pick(modes);
  if(m==='pic'){
    const n=ri(1,Math.min(max,10)),ns=shuffle([n,...shuffle([1,2,3,4,5,6,7,8,9,10].filter(x=>x!==n)).slice(0,2)]),oo=ns.map(v=>opt(`<span style="font-size:.6em">${pick(EM).repeat(Math.min(v,12))}</span>`,v,{n:v}));
    return C(B('ภาพไหนมีจำนวนเท่ากับเลขนี้?','Which picture shows this many?'),String(n),oo,n,{vcls:'big',cls:'n3',say:{n}});
  }
  if(m==='next'||m==='prev'){
    const nx=m==='next',x=nx?n:n+1;
    return C(nx?B(`เลขอะไรมาหลัง ${x}?`,`What comes after ${x}?`):B(`เลขอะไรมาก่อน ${x}?`,`What comes before ${x}?`),nx?`${x} , ❓`:`❓ , ${x}`,nOpts(nx?x+1:x-1,4,0),nx?x+1:x-1,{cls:'eq',say:B(nx?`เลขอะไรมาหลัง ${thNum(x)}`:`เลขอะไรมาก่อน ${thNum(x)}`,nx?`What comes after ${enNum(x)}`:`What comes before ${enNum(x)}`)});
  }
  if(m==='word')return C(B('เลขนี้คือตัวเลขอะไร?','Which number is this word?'),numWord(n,DB.lang),nOpts(n,4,0),n,{vcls:'eq',say:{n}});
  if(m==='thdig')return C(B('เลขไทยนี้คือเลขอะไร?','Which number is this Thai numeral?'),tdig(n),nOpts(n,4,0),n,{vcls:'big',say:{n}});
  return C(B(`หาเลข ${thNum(n)}`,`Find the number ${enNum(n)}`),'',nOpts(n,c.p<.4?3:4,1),n,{emoji:true,say:{n},cls:c.p<.4?'n3':'',vcls:'eq'});
},
add(c){
  const R=[0,[3,10],[10,100],[50,999],[500,9999],[2000,99999]][c.b],max=lerp(R[0],R[1],c.p);
  let vis,ans,extra='';
  if(c.b>=2&&c.p>.55&&Math.random()<.35){
    const x=ri(1,max/3|0||1),y=ri(1,max/3|0||1),z=ri(1,max/3|0||1);ans=x+y+z;vis=`${x} + ${y} + ${z} = ?`;
  }else{
    const a=ri(1,Math.max(1,max-1)),b=ri(c.b===1?1:0,Math.max(1,max-a)),s=a+b;
    if(c.b>=2&&Math.random()<.3){ans=b;vis=`${a} + ? = ${s}`}
    else{ans=s;vis=`${a} + ${b} = ?`;if(s<=10&&c.b<=2)extra=`<div style="width:100%;font-size:34px">${'🍎'.repeat(a)} ➕ ${'🍏'.repeat(b)}</div>`}
  }
  return C(B('บวกเลข','Add'),vis+extra,nOpts(ans,4),ans,{vcls:'eq',say:{m:vis}});
},
sub(c){
  const R=[0,[3,10],[10,100],[50,999],[500,9999],[2000,99999]][c.b],max=lerp(R[0],R[1],c.p);
  let vis,ans,extra='';
  if(c.b>=3&&c.p>.5&&Math.random()<.35){
    const a=ri(10,max),b=ri(1,a>>1||1),cc=ri(0,(a-b)>>1);ans=a-b-cc;vis=`${a} − ${b} − ${cc} = ?`;
  }else{
    const a=ri(1,max),b=ri(0,a),r=a-b;
    if(c.b>=2&&Math.random()<.3){ans=b;vis=`${a} − ? = ${r}`}
    else{ans=r;vis=`${a} − ${b} = ?`;if(a<=10&&c.b<=2)extra=`<div style="width:100%;font-size:34px">${'🍎'.repeat(a-b)}<span style="opacity:.3">${'🍎'.repeat(b)}</span></div>`}
  }
  return C(B('ลบเลข','Subtract'),vis+extra,nOpts(ans,4),ans,{vcls:'eq',say:{m:vis}});
},
mul(c){
  let a,b;
  if(c.b===2){a=pick(c.p<.5?[2,10]:[2,5,10]);b=ri(1,10)}
  else if(c.b===3){a=ri(2,lerp(5,10,c.p));b=ri(2,10)}
  else if(c.b===4){a=ri(2,12);b=ri(2,12);if(c.p>.5&&Math.random()<.5){a=ri(11,60);b=ri(2,9)}}
  else{a=ri(11,99);b=ri(2,c.p>.5?30:9);if(c.p>.75){a=ri(100,999);b=ri(2,9)}}
  let vis=`${a} × ${b} = ?`,ans=a*b;
  if(c.b>=3&&c.p>.3&&Math.random()<.25&&a<=12){ans=b;vis=`${a} × ? = ${a*b}`}
  return C(B('คูณเลข','Multiply'),vis,nOpts(ans,4),ans,{vcls:'eq',say:{m:vis}});
},
div(c){
  if(c.b>=4&&c.p>.3&&Math.random()<.25){
    const d=ri(2,9),a=ri(10,99);
    return C(B('หารแล้วเหลือเศษเท่าไหร่?','What is the remainder?'),`${a} ÷ ${d}`,nOpts(a%d,4,0).map(o=>o),a%d,{vcls:'eq',say:{m:`${a} ÷ ${d}`}});
  }
  let q,d;
  if(c.b===3){d=ri(2,lerp(5,10,c.p));q=ri(1,10)}
  else if(c.b===4){d=ri(2,12);q=ri(2,c.p>.5?30:12)}
  else{d=ri(2,c.p>.5?25:12);q=ri(2,c.p>.5?60:30)}
  const a=q*d,vis=`${a} ÷ ${d} = ?`;
  return C(B('หารเลข','Divide'),vis,nOpts(q,4,1),q,{vcls:'eq',say:{m:vis}});
},
compare(c){
  if(c.b<=1&&c.p<.5){
    const a=ri(1,8);let b=ri(1,8);while(b===a)b=ri(1,8);
    const e=pick(EM),more=Math.random()<.5,ans=more?Math.max(a,b):Math.min(a,b);
    return C(more?B('กลุ่มไหนมากกว่า?','Which group has more?'):B('กลุ่มไหนน้อยกว่า?','Which group has fewer?'),'',
      [a,b].map(v=>opt(`<span style="font-size:.7em">${e.repeat(v)}</span>`,v,{n:v})),ans,{cls:'n3',say:more?B('กลุ่มไหนมากกว่า','Which has more'):B('กลุ่มไหนน้อยกว่า','Which has fewer')});
  }
  const max=[0,20,100,1000,100000,100000][c.b]*(c.b===1?1:1);
  if(c.b<=2){
    let a=ri(0,max),b=ri(0,max);while(a===b)b=ri(0,max);
    const big=Math.random()<.5;
    return C(big?B('เลขไหนมากกว่า?','Which is bigger?'):B('เลขไหนน้อยกว่า?','Which is smaller?'),'',[a,b].map(v=>opt(v,v,{n:v})),big?Math.max(a,b):Math.min(a,b),{cls:'n3',say:big?B('เลขไหนมากกว่า','Which is bigger'):B('เลขไหนน้อยกว่า','Which is smaller')});
  }
  let A,Bv,la,lb;
  if(c.p>.6){const m=Math.max(10,max>>2),x=ri(1,m),y=ri(1,m),z=ri(1,m),w=ri(1,m);A=x+y;Bv=z+w;la=`${x} + ${y}`;lb=`${z} + ${w}`}
  else{A=ri(0,max);Bv=Math.random()<.15?A:ri(0,max);la=A;lb=Bv}
  const ans=A>Bv?'>':A<Bv?'<':'=';
  return C(B('เลือกเครื่องหมายที่ถูก','Pick the right sign'),`${la} <span style="color:#ff9f1c;margin:0 8px">?</span> ${lb}`,['>','<','='].map(s=>opt(s,s,{m:s})),ans,{vcls:'eq',cls:'n3',say:{m:`${la} ? ${lb}`}});
},
place(c){
  if(c.b===2){
    const n=ri(10,99),t=Math.floor(n/10),o=n%10;
    return pick([0,1])?C(B(`เลข ${n} มีกี่สิบ?`,`How many tens in ${n}?`),String(n),nOpts(t,4,0),t,{vcls:'big',say:{n}}):
      C(B(`${t} สิบ ${o} หน่วย คือเลขอะไร?`,`${t} tens and ${o} ones make?`),`${t*10} + ${o}`,nOpts(n,4,10),n,{vcls:'eq',say:{m:`${t*10} + ${o} = ?`}});
  }
  if(c.b===3){
    const n=ri(100,999),h=Math.floor(n/100),t=Math.floor(n/10)%10,o=n%10,m=pick([0,1,2]);
    if(m===0)return C(B(`เลข ${n} หลักร้อยคือเลขอะไร?`,`Which digit is in the hundreds place of ${n}?`),String(n),nOpts(h,4,0),h,{vcls:'big',say:{n}});
    if(m===1)return C(B(`เลข ${n} หลักสิบคือเลขอะไร?`,`Which digit is in the tens place of ${n}?`),String(n),nOpts(t,4,0),t,{vcls:'big',say:{n}});
    return C(B('รวมกันได้เท่าไหร่?','What number is this?'),`${h*100} + ${t*10} + ${o}`,nOpts(n,4),n,{vcls:'eq',say:{m:`${h*100} + ${t*10} + ${o} = ?`}});
  }
  const n=ri(1000,99999),s=String(n),i=ri(0,s.length-1),d=+s[i],v=d*Math.pow(10,s.length-1-i),sh=s.split('').map((x,j)=>j===i?`<u style="color:#ff9f1c">${x}</u>`:x).join('');
  const names=B(['หน่วย','สิบ','ร้อย','พัน','หมื่น'],['ones','tens','hundreds','thousands','ten-thousands']);
  const pl=s.length-1-i;
  if(d===0||Math.random()<.4)return C(B('ตัวเลขที่ขีดเส้นใต้อยู่ในหลักอะไร?','Which place is the underlined digit in?'),sh,
    shuffle([0,1,2,3,4].filter(x=>x<s.length)).slice(0,4).concat(pl).filter((x,j,a)=>a.indexOf(x)===j).slice(0,4).map(x=>opt(names[DB.lang][x],x,null)).concat([]),pl,{vcls:'eq'});
  return C(B('เลขที่ขีดเส้นใต้มีค่าเท่าไหร่?','What is the value of the underlined digit?'),sh,nOpts(v,4,0),v,{vcls:'eq'});
},
pattern(c){
  if(c.b<=1){
    const [a,b,cc]=shuffle(EM).slice(0,3),t=pick(c.p<.5?[[a,b]]:[[a,b],[a,a,b],[a,b,cc],[a,b,b]]),seq=[];
    for(let i=0;i<t.length*2+2;i++)seq.push(t[i%t.length]);
    const ans=seq.pop(),ch=[...new Set([ans,...shuffle(EM).slice(0,3)])].slice(0,4);if(!ch.includes(ans))ch[0]=ans;
    return C(B('ตัวต่อไปคืออะไร?','What comes next?'),seq.join(' ')+' ❓',shuffle(ch).map(x=>opt(x,x,null)),ans,{emoji:true,say:B('ตัวต่อไปคืออะไร','What comes next')});
  }
  let seq;const R=Math.random(),p=c.p;
  if(c.b===2){const s=pick(p<.5?[2,10]:[2,5,10,3]),a=s*ri(0,4);seq=Array.from({length:6},(_,i)=>a+s*i)}
  else if(c.b===3){const s=ri(2,12),a=ri(1,40);seq=Array.from({length:6},(_,i)=>a+s*i);if(R<.3)seq=seq.reverse();else if(R<.45){const d=ri(2,6);seq=[a];for(let i=1;i<6;i++)seq.push(seq[i-1]+(i%2?d*2:-d+1))}}
  else if(c.b===4){
    if(R<.25){const r=pick([2,3]),a=ri(1,4);seq=Array.from({length:6},(_,i)=>a*r**i)}
    else if(R<.5){const k=ri(1,6);seq=Array.from({length:6},(_,i)=>(k+i)**2)}
    else if(R<.75){const k=ri(0,4);seq=Array.from({length:6},(_,i)=>(k+i+1)*(k+i+2)/2)}
    else{const d=ri(1,3),a=ri(1,20);seq=[a];for(let i=1;i<6;i++)seq.push(seq[i-1]+d*i)}
  }else{
    if(R<.3){const a=ri(1,4),b=ri(2,6);seq=[a,b];for(let i=2;i<7;i++)seq.push(seq[i-1]+seq[i-2])}
    else if(R<.6){const a=ri(1,20),cc=ri(50,90),s=ri(2,6),t=ri(2,6);seq=Array.from({length:7},(_,i)=>i%2?cc+t*((i-1)/2):a+s*(i/2))}
    else if(R<.8){const r=pick([2,3]),a=ri(1,3);seq=Array.from({length:6},(_,i)=>a*r**i+i)}
    else{const d=ri(2,5),a=ri(100,300);seq=[a];for(let i=1;i<7;i++)seq.push(seq[i-1]-d*i)}
  }
  const hide=c.b<=2?seq.length-1:ri(2,seq.length-1),ans=seq[hide];
  return C(B('เลขที่หายไปคืออะไร?','Find the missing number'),`<span style="font-size:.75em;font-weight:800">${seq.map((x,i)=>i===hide?'❓':x).join(' , ')}</span>`,nOpts(ans,4,0),ans,{say:{m:seq.slice(0,hide).join(' , ')}});
},
clock(c){
  let h=ri(1,12),m=0;
  if(c.b===1&&c.p>.6)m=pick([0,30]);
  if(c.b===2)m=c.p<.5?pick([0,30]):pick([0,15,30,45]);
  if(c.b===3)m=c.p<.4?pick([0,15,30,45]):ri(0,11)*5;
  if(c.b>=4)m=c.p<.5?ri(0,11)*5:ri(0,59);
  const f=(h,m)=>`${h}:${String(m).padStart(2,'0')}`;
  if(c.b>=4&&c.p>.5&&Math.random()<.4){
    const add=pick([15,20,30,40,45,50,60,75,90]),t=h*60+m+add,h2=(Math.floor(t/60)-1)%12+1,m2=t%60,ans=f(h2,m2),s=new Set([ans]);
    while(s.size<4)s.add(f(ri(1,12),ri(0,11)*5));
    return C(B(`เริ่ม ${f(h,m)} ผ่านไป ${add} นาที เป็นเวลาเท่าไหร่?`,`Start at ${f(h,m)}. What time is it after ${add} minutes?`),clockSVG(h,m),shuffle([...s]).map(x=>{const[hh,mm]=x.split(':').map(Number);return opt(x,x,timeSay(hh,mm))}),ans);
  }
  const ans=f(h,m),s=new Set([ans]);
  while(s.size<4){const h2=Math.random()<.5?h:ri(1,12),m2=Math.random()<.5?m:(c.b>=3?ri(0,11)*5:pick([0,30]));s.add(f(h2,m2))}
  return C(B('นาฬิกาบอกเวลาเท่าไหร่?','What time is it?'),clockSVG(h,m),shuffle([...s]).map(x=>{const[hh,mm]=x.split(':').map(Number);return opt(x,x,timeSay(hh,mm))}),ans,{say:B('นาฬิกาบอกเวลาเท่าไหร่','What time is it')});
},
money(c){
  const coin=v=>v>=20?`<span class="note n${v}">${v}</span>`:`<span class="coin ${v===10?'c10':''}">${v}</span>`;
  if(c.b===2){
    const max=lerp(10,50,c.p);let parts=[],sum=0;
    while(parts.length<ri(2,5)){const v=pick([1,2,5,10]);if(sum+v>max)break;parts.push(v);sum+=v}
    if(!parts.length){parts=[5,2];sum=7}
    return C(B('รวมเป็นเงินกี่บาท?','How many baht in total?'),parts.map(coin).join(''),nOpts(sum,4,1),sum,{say:B('รวมเป็นเงินกี่บาท','How many baht in total')});
  }
  if(c.b===3&&Math.random()<.5){
    const max=lerp(50,300,c.p),parts=[];let sum=0;
    for(let i=0;i<ri(2,5);i++){const v=pick([1,2,5,10,20,50,100]);if(sum+v>max)break;parts.push(v);sum+=v}
    if(!parts.length){parts.push(20,5);sum=25}
    return C(B('รวมเป็นเงินกี่บาท?','How many baht in total?'),parts.sort((a,b)=>b-a).map(coin).join(''),nOpts(sum,4,1),sum,{say:B('รวมเป็นเงินกี่บาท','How many baht in total')});
  }
  const e=pick(['🍎','🍪','🥛','🍦','✏️','🎈','🍌']);
  if(c.b===3){
    const price=ri(3,19)*5,pay=pick([50,100,100,200].filter(x=>x>price)),ch=pay-price;
    return C(B(`ซื้อ ${e} ราคา ${price} บาท จ่าย ${pay} บาท ทอนเท่าไหร่?`,`A ${e} costs ${price} baht. You pay ${pay}. What is the change?`),'',nOpts(ch,4,1),ch,{say:B(`ซื้อของราคา ${thNum(price)} บาท จ่าย ${thNum(pay)} บาท ทอนเท่าไหร่`,`It costs ${enNum(price)} baht. You pay ${enNum(pay)}. What is the change`)});
  }
  const a=ri(5,60)*(c.b>=5?5:1),b=ri(5,80),pay=pick([100,200,500,1000].filter(x=>x>a+b)),sum=a+b;
  return Math.random()<.5?C(B(`${e} ${a} บาท และ ${e==='🍎'?'🍌':'🍪'} ${b} บาท รวมกี่บาท?`,`${e} ${a} baht and ${e==='🍎'?'🍌':'🍪'} ${b} baht. How much in total?`),'',nOpts(sum,4,1),sum,{say:B(`${thNum(a)} บาท กับ ${thNum(b)} บาท รวมกี่บาท`,`${enNum(a)} baht and ${enNum(b)} baht. How much in total`)}):
    C(B(`ซื้อของรวม ${sum} บาท จ่าย ${pay} บาท ทอนเท่าไหร่?`,`The total is ${sum} baht. You pay ${pay}. What is the change?`),'',nOpts(pay-sum,4,1),pay-sum,{say:B(`รวม ${thNum(sum)} บาท จ่าย ${thNum(pay)} บาท ทอนเท่าไหร่`,`Total ${enNum(sum)} baht. You pay ${enNum(pay)}. What is the change`)});
},
fraction(c){
  const f=(a,d)=>`${a}/${d}`;
  if(c.b===3){
    const d=pick(c.p<.5?[2,4]:[2,3,4]),k=ri(1,d-1);
    if(d>=3&&Math.random()<.35){
      const fs=shuffle([...Array(d-1).keys()].map(i=>i+1)).slice(0,3);if(!fs.includes(k))fs[0]=k;
      return C(B(`ภาพไหนแสดง ${f(k,d)}?`,`Which picture shows ${f(k,d)}?`),`<span style="font-weight:800">${f(k,d)}</span>`,shuffle(fs).map(x=>opt(pieSVG(d,x,90),x,{m:f(x,d)})),k,{vcls:'eq',cls:'n3',say:{m:f(k,d)}});
    }
    const cs=shuffle([...Array(d-1).keys()].map(i=>f(i+1,d)));
    const set=new Set([f(k,d)]);[f(1,2),f(1,4),f(3,4),f(1,3),f(2,3)].forEach(x=>{if(set.size<4)set.add(x)});
    return C(B('ส่วนที่แรเงาคือเศษส่วนเท่าไหร่?','What fraction is shaded?'),pieSVG(d,k),shuffle([...set]).map(x=>opt(x,x,{m:x})),f(k,d),{vcls:'big',say:B('ส่วนที่แรเงาคือเศษส่วนเท่าไหร่','What fraction is shaded')});
  }
  if(c.b===4){
    const m=pick(['cmp','eq','shade']);
    if(m==='cmp'){const d=ri(3,12),a=ri(1,d-1);let b=ri(1,d-1);while(b===a)b=ri(1,d-1);const big=Math.random()<.5;
      return C(big?B('เศษส่วนไหนมากกว่า?','Which fraction is bigger?'):B('เศษส่วนไหนน้อยกว่า?','Which fraction is smaller?'),'',[a,b].map(x=>opt(f(x,d),x,{m:f(x,d)})),big?Math.max(a,b):Math.min(a,b),{cls:'n3',say:big?B('เศษส่วนไหนมากกว่า','Which is bigger'):B('เศษส่วนไหนน้อยกว่า','Which is smaller')})}
    if(m==='eq'){const d=ri(2,5),k=ri(1,d-1),mu=ri(2,4);return C(B('เศษส่วนที่เท่ากัน','Equivalent fractions'),`${f(k,d)} = ?/${d*mu}`,nOpts(k*mu,4,1),k*mu,{vcls:'eq'})}
    const d=ri(5,10),k=ri(1,d-1),set=new Set([f(k,d)]);while(set.size<4)set.add(f(ri(1,d-1),d));
    return C(B('ส่วนที่แรเงาคือเศษส่วนเท่าไหร่?','What fraction is shaded?'),pieSVG(d,k),shuffle([...set]).map(x=>opt(x,x,{m:x})),f(k,d),{vcls:'big'});
  }
  const m=pick(['add','sub','of']);
  if(m==='of'){const d=pick([2,3,4,5,10]),q=ri(2,10),n=d*q,k=ri(1,d-1);return C(B(`${f(k,d)} ของ ${n} คือเท่าไหร่?`,`What is ${f(k,d)} of ${n}?`),`${f(k,d)} × ${n}`,nOpts(k*q,4,1),k*q,{vcls:'eq',say:B(`${thNum(k)} ส่วน ${thNum(d)} ของ ${thNum(n)} คือเท่าไหร่`,`What is ${enNum(k)} over ${enNum(d)} of ${enNum(n)}`)})}
  const d=ri(4,12),a=ri(1,d-2),b=ri(1,d-a-1);
  if(m==='add')return C(B('บวกเศษส่วน','Add the fractions'),`${f(a,d)} + ${f(b,d)} = ?`,[a+b,a+b+1,Math.max(1,a+b-1),a*b+1].filter((x,i,ar)=>ar.indexOf(x)===i).slice(0,4).map(x=>opt(f(x,d),x,{m:f(x,d)})).sort(()=>Math.random()-.5),a+b,{vcls:'eq',say:{m:`${f(a,d)} + ${f(b,d)} = ?`}});
  return C(B('ลบเศษส่วน','Subtract the fractions'),`${f(a+b,d)} − ${f(a,d)} = ?`,[b,b+1,Math.max(1,b-1),b+2].filter((x,i,ar)=>ar.indexOf(x)===i).slice(0,4).map(x=>opt(f(x,d),x,{m:f(x,d)})).sort(()=>Math.random()-.5),b,{vcls:'eq',say:{m:`${f(a+b,d)} − ${f(a,d)} = ?`}});
},
geometry(c){
  if(c.b===2){
    const S=[['triangle','สามเหลี่ยม','🔺',3],['square','สี่เหลี่ยมจัตุรัส','🟦',4],['rectangle','สี่เหลี่ยมผืนผ้า','▭',4],['pentagon','ห้าเหลี่ยม','⬟',5],['hexagon','หกเหลี่ยม','⬡',6]];
    const s=pick(S.slice(0,c.p<.5?3:5));
    return C(B(`${s[1]}มีกี่ด้าน?`,`How many sides does a ${s[0]} have?`),s[2],nOpts(s[3],4,2),s[3],{vcls:'big',say:B(`${s[1]}มีกี่ด้าน`,`How many sides does a ${s[0]} have`)});
  }
  if(c.b===3){
    const w=ri(2,lerp(6,12,c.p)),h=ri(2,lerp(5,9,c.p)),per=2*(w+h);
    return C(B('รอบรูปสี่เหลี่ยมผืนผ้ายาวเท่าไหร่ (ซม.)?','What is the perimeter (cm)?'),rectSVG(w,h),nOpts(per,4,1),per,{say:B('รอบรูปยาวเท่าไหร่','What is the perimeter')});
  }
  if(c.b===4){
    const w=ri(2,lerp(8,15,c.p)),h=ri(2,lerp(6,12,c.p)),ar=Math.random()<.5;
    return ar?C(B('พื้นที่สี่เหลี่ยมผืนผ้า (ตร.ซม.)?','What is the area (sq cm)?'),rectSVG(w,h),nOpts(w*h,4,1),w*h,{say:B('พื้นที่เท่าไหร่','What is the area')}):
      C(B('รอบรูปยาวเท่าไหร่ (ซม.)?','What is the perimeter (cm)?'),rectSVG(w,h),nOpts(2*(w+h),4,1),2*(w+h),{say:B('รอบรูปยาวเท่าไหร่','What is the perimeter')});
  }
  const w=ri(3,lerp(12,30,c.p)),h=ri(3,lerp(10,25,c.p)),m=pick(['area','per','miss']);
  if(m==='area')return C(B('พื้นที่ (ตร.ซม.)?','Area (sq cm)?'),rectSVG(w,h),nOpts(w*h,4,1),w*h);
  if(m==='per')return C(B('รอบรูปยาวเท่าไหร่ (ซม.)?','Perimeter (cm)?'),rectSVG(w,h),nOpts(2*(w+h),4,1),2*(w+h));
  return C(B(`พื้นที่ ${w*h} ตร.ซม. กว้าง ${w} ซม. ยาวกี่ซม.?`,`Area is ${w*h} sq cm and width is ${w} cm. What is the length?`),rectSVG(w,h,true,false).replace('</svg>',`<text x="20" y="40" font-size="22" font-weight="800">?</text></svg>`),nOpts(h,4,1),h);
},
round(c){
  if(c.b===3){const n=ri(11,99);return C(B(`ปัดเศษ ${n} เป็นสิบที่ใกล้ที่สุด`,`Round ${n} to the nearest ten`),String(n),nOpts(Math.round(n/10)*10,4,0),Math.round(n/10)*10,{vcls:'big',say:{m:`${n}`}})}
  if(c.b===4){const hund=Math.random()<.6,n=ri(101,hund?999:99);const u=hund?100:10,a=Math.round(n/u)*u;return C(B(`ปัดเศษ ${n} เป็น${hund?'ร้อย':'สิบ'}ที่ใกล้ที่สุด`,`Round ${n} to the nearest ${hund?'hundred':'ten'}`),String(n),nOpts(a,4,0),a,{vcls:'big',say:{m:`${n}`}})}
  const t=Math.random()<.5,n=ri(1001,t?9999:99999),u=t?1000:Math.pow(10,String(n).length-1)>=10000?10000:1000,a=Math.round(n/u)*u;
  return C(B(`ปัดเศษ ${n} เป็น${u===1000?'พัน':'หมื่น'}ที่ใกล้ที่สุด`,`Round ${n} to the nearest ${u===1000?'thousand':'ten thousand'}`),String(n),nOpts(a,4,0),a,{vcls:'big',say:{m:`${n}`}});
},
ops(c){
  const a=ri(2,9),b=ri(2,9),d=ri(2,9),k=Math.random();let vis,ans;
  if(k<.3){vis=`${a} + ${b} × ${d}`;ans=a+b*d}
  else if(k<.55){vis=`(${a} + ${b}) × ${d}`;ans=(a+b)*d}
  else if(k<.8){vis=`${a*d} ÷ ${d} + ${b}`;ans=a+b}
  else{const m=a*b+d;vis=`${a} × ${b} − ${Math.min(d,a*b)}`;ans=a*b-Math.min(d,a*b)}
  return C(B('คำนวณตามลำดับ (วงเล็บ → × ÷ → + −)','Solve in order (brackets, × ÷, then + −)'),`${vis} = ?`,nOpts(ans,4,0),ans,{vcls:'eq',say:{m:`${vis} = ?`}});
},
decimal(c){
  const dec=c.p<.5?1:2,sc=Math.pow(10,dec),m=pick(['cmp','add','sub','frac']);
  const rd=()=>ri(1,9*sc)/sc;
  if(m==='cmp'){const a=rd();let b=rd();const f=x=>x.toFixed(dec),ans=a>b?'>':a<b?'<':'=';return C(B('เลือกเครื่องหมายที่ถูก','Pick the right sign'),`${f(a)} <span style="color:#ff9f1c;margin:0 8px">?</span> ${f(b)}`,['>','<','='].map(s=>opt(s,s,{m:s})),ans,{vcls:'eq',cls:'n3',say:{m:`${f(a)} ? ${f(b)}`}})}
  if(m==='frac'){const k=ri(1,9),q=Math.random()<.5;return q?C(B('เศษส่วนนี้เท่ากับทศนิยมใด?','Which decimal equals this fraction?'),`${k}/10`,dOpts(k/10,4,1),(k/10).toFixed(1),{vcls:'eq',say:{m:`${k}/10`}}):
    C(B('ทศนิยมนี้เท่ากับเศษส่วนใด?','Which fraction equals this decimal?'),(k/10).toFixed(1),[k,k+1,Math.max(1,k-1),10-k||1].filter((x,i,a)=>a.indexOf(x)===i).slice(0,4).map(x=>opt(`${x}/10`,x,{m:`${x}/10`})),k,{vcls:'eq',say:{m:(k/10).toFixed(1)}})}
  const a=ri(1,9*sc)/sc+ri(0,9),b=ri(1,9*sc)/sc+ri(0,5);
  const hi=Math.max(a,b),lo=Math.min(a,b),r=m==='add'?a+b:hi-lo,vis=m==='add'?`${a.toFixed(dec)} + ${b.toFixed(dec)} = ?`:`${hi.toFixed(dec)} − ${lo.toFixed(dec)} = ?`;
  return C(m==='add'?B('บวกทศนิยม','Add decimals'):B('ลบทศนิยม','Subtract decimals'),vis,dOpts(+r.toFixed(dec),4,dec),r.toFixed(dec),{vcls:'eq',say:{m:vis}});
},
factor(c){
  const m=pick(['mul','fac','even']);
  if(m==='mul'){const n=ri(2,12),good=n*ri(2,12),s=new Set([good]);while(s.size<4){const v=ri(4,150);if(v%n)s.add(v)}return C(B(`ข้อใดเป็นพหุคูณของ ${n}?`,`Which number is a multiple of ${n}?`),'',shuffle([...s]).map(v=>opt(v,v,{n:v})),good,{cls:'n3'})}
  if(m==='fac'){const n=pick([12,16,18,20,24,30,36,40,48]),fs=[];for(let i=1;i<=n;i++)if(n%i===0)fs.push(i);const good=pick(fs),s=new Set([good]);while(s.size<4){const v=ri(2,n);if(n%v)s.add(v)}return C(B(`ข้อใดเป็นตัวประกอบของ ${n}?`,`Which number is a factor of ${n}?`),'',shuffle([...s]).map(v=>opt(v,v,{n:v})),good,{cls:'n3'})}
  const n=ri(10,999),ev=n%2===0;return C(B(`${n} เป็นเลขคู่หรือเลขคี่?`,`Is ${n} even or odd?`),String(n),[opt(DB.lang==='th'?'เลขคู่':'Even','e',{th:'เลขคู่',en:'even'}),opt(DB.lang==='th'?'เลขคี่':'Odd','o',{th:'เลขคี่',en:'odd'})],ev?'e':'o',{vcls:'big',cls:'n3',say:{n}});
},

/* ================= letters & words ================= */
vocab(c){return vocabGen(c,c.b<=1?['e2en','e2th','en2e','th2e']:['e2en','e2th','en2e','th2e','en2th','th2en'])},
thRead(c){return vocabGen(c,['e2th','th2e','th2e','e2th'])},
letters(c){
  const lets=(arr,a,n=4)=>shuffle([a,...shuffle(arr.filter(x=>x!==a)).slice(0,n-1)]);
  const thOpt=x=>{const t=TL.find(y=>y[0]===x);return opt(x,x,{t:t?`${x} ${t[2]}`:x,l:'th'})};
  const enOpt=x=>opt(x,x,{t:`${x}, ${ABCW[x.toUpperCase()]}`,l:'en'});
  const modes=['thFirst','enFirst','thHear','enHear'];
  if(c.b===1&&c.p>.3)modes.push('case');
  if(c.b===1&&c.p>.5)modes.push('next','prev');
  if(c.b>=2)modes.push('rhyme','missing','enFirst','case');
  const m=pick(modes);
  if(m==='thFirst'){
    const t=pick(TL.slice(0,Math.min(TL.length,lerp(6,23,c.b===1?c.p:1))));
    return C(B('คำนี้ขึ้นต้นด้วยพยัญชนะอะไร?','Which Thai letter does it start with?'),`${t[1]}<div style="width:100%;font-size:.6em">${t[2]}</div>`,lets(TL.map(x=>x[0]),t[0]).map(thOpt),t[0],{say:{t:t[2],l:'th'}});
  }
  if(m==='thHear'){
    const t=pick(TL.slice(0,Math.min(TL.length,lerp(6,23,c.b===1?c.p:1))));
    return C(B(`หาตัว ${t[0]}`,`Find the Thai letter ${t[0]}`),'',lets(TL.map(x=>x[0]),t[0],c.p<.4?3:4).map(thOpt),t[0],{emoji:true,say:{t:`${t[0]} ${t[2]}`,l:'th'},vcls:'big'});
  }
  if(m==='enFirst'){
    const w=pick(V_ALL.filter(x=>/^[a-z]+$/.test(x.en))),L=w.en[0].toUpperCase();
    return C(B('คำนี้ขึ้นต้นด้วยตัวอะไร?','What letter does it start with?'),`${w.e}<div style="width:100%;font-size:.6em">${w.en}</div>`,lets(ABC,L).map(enOpt),L,{say:{t:w.en,l:'en'}});
  }
  if(m==='enHear'){
    const L=pick(ABC.slice(0,Math.min(26,lerp(8,26,c.b===1?c.p:1))));
    return C(B(`หาตัว ${L}`,`Find the letter ${L}`),'',lets(ABC,L,c.p<.4?3:4).map(enOpt),L,{emoji:true,say:{t:`${L}, ${ABCW[L]}`,l:'en'},vcls:'big'});
  }
  if(m==='case'){
    const L=pick(ABC),up=Math.random()<.5,sh=up?L:L.toLowerCase(),a=up?L.toLowerCase():L;
    return C(up?B('เลือกตัวพิมพ์เล็กที่ตรงกัน','Pick the matching small letter'):B('เลือกตัวพิมพ์ใหญ่ที่ตรงกัน','Pick the matching capital letter'),sh,lets(ABC.map(x=>up?x.toLowerCase():x),a).map(enOpt),a,{vcls:'big',say:{t:`${L}`,l:'en'}});
  }
  if(m==='next'||m==='prev'){
    const nx=m==='next',i=nx?ri(0,24):ri(1,25),a=ABC[nx?i+1:i-1];
    return C(nx?B(`ตัวอะไรมาหลัง ${ABC[i]}?`,`What comes after ${ABC[i]}?`):B(`ตัวอะไรมาก่อน ${ABC[i]}?`,`What comes before ${ABC[i]}?`),ABC[i],lets(ABC,a).map(enOpt),a,{vcls:'big',say:{t:ABC[i],l:'en'}});
  }
  if(m==='rhyme'){
    const g=pick(RHYME),w=pick(g),ans=pick(g.filter(x=>x!==w)),ds=shuffle(RHYME.filter(x=>x!==g).flat()).slice(0,2);
    return C(B(`คำไหนสัมผัสกับ "${w}"?`,`Which word rhymes with "${w}"?`),w,shuffle([ans,...ds]).map(x=>T(x,'en')),ans,{vcls:'eq',cls:'n3',say:{t:w,l:'en'}});
  }
  const w=pick(V_ALL.filter(x=>/^[a-z]+$/.test(x.en)&&x.en.length>=3&&x.en.length<=7)),i=ri(0,w.en.length-1),L=w.en[i].toUpperCase();
  return C(B('ตัวอักษรที่หายไปคืออะไร?','Which letter is missing?'),`${w.e}<div style="width:100%;font-size:.7em;letter-spacing:6px">${w.en.toUpperCase().split('').map((x,j)=>j===i?'_':x).join(' ')}</div>`,lets(ABC,L).map(enOpt),L,{say:{t:w.en,l:'en'}});
},
spell(c){
  const [lo,hi]=[0,[3,3],[3,5],[4,6],[5,8],[6,12]][c.b],len=lerp(lo,hi,c.p);
  let ws=V_ALL.filter(x=>/^[a-z]+$/.test(x.en)&&x.en.length>=3&&x.en.length<=len);
  if(!ws.length)ws=V_ALL.filter(x=>/^[a-z]{3}$/.test(x.en));
  const w=pick(ws.filter(x=>x.en.length>=len-1).length?ws.filter(x=>x.en.length>=len-1):ws),word=w.en.toUpperCase(),letters=word.split('');
  if(c.b>=3)for(let i=0;i<Math.min(3,c.b-2);i++)letters.push(pick(ABC));
  return {kind:'spell',prompt:B('เรียงตัวอักษรให้เป็นคำศัพท์','Spell the word'),emoji:w.e,hint:w.th,word,tiles:shuffle(letters),en:w.en};
},
grammar(c){
  const pickable=GRAM.filter(g=>g[0]===c.b||(g[0]===c.b-1&&Math.random()<.35)||(c.b<2));
  const g=pick(pickable.length?pickable:GRAM.filter(x=>x[0]<=c.b)),[,sen,ans,ds]=g;
  const full=sen.replace('___',ans);
  return C(B('เลือกคำที่เติมในช่องว่าง','Fill in the blank'),`<div class="sentence">${sen.replace('___','<u>&nbsp;&nbsp;&nbsp;&nbsp;</u>')}</div>`,shuffle([ans,...ds]).map(x=>T(x,'en')),ans,{cls:'n3',say:{t:sen.replace('___','blank'),l:'en'},onOk:()=>speak({t:full,l:'en'})});
},
calendar(c){
  const L=DB.lang,D=DAYS[L],M=MONTHS[L],dayQ=c.b<=2||Math.random()<.3;
  const o=(arr,i)=>opt(arr[i],i,{t:arr[i],l:L});
  if(dayQ){
    const i=ri(0,6),nx=Math.random()<.5,a=(i+(nx?1:6))%7,s=new Set([a]);while(s.size<4)s.add(ri(0,6));
    return C(nx?B(`วันนี้${DAYS.th[i]} พรุ่งนี้วันอะไร?`,`Today is ${DAYS.en[i]}. What day is tomorrow?`):B(`วันนี้${DAYS.th[i]} เมื่อวานวันอะไร?`,`Today is ${DAYS.en[i]}. What day was yesterday?`),'📅',shuffle([...s]).map(x=>o(D,x)),a,{vcls:'big',cls:'n3'});
  }
  const i=ri(0,11);
  if(c.b<=3||Math.random()<.4){
    const nx=Math.random()<.5,a=(i+(nx?1:11))%12,s=new Set([a]);while(s.size<4)s.add(ri(0,11));
    return C(nx?B(`เดือนอะไรมาหลัง${MONTHS.th[i]}?`,`Which month comes after ${MONTHS.en[i]}?`):B(`เดือนอะไรมาก่อน${MONTHS.th[i]}?`,`Which month comes before ${MONTHS.en[i]}?`),'📅',shuffle([...s]).map(x=>o(M,x)),a,{vcls:'big',cls:'n6'});
  }
  return C(B(`เดือน${MONTHS.th[i]} มีกี่วัน? (ปีปกติ)`,`How many days are in ${MONTHS.en[i]}? (normal year)`),'📅',[28,30,31].map(x=>opt(x,x,{n:x})),MDAYS[i],{vcls:'big',cls:'n3'});
},

/* ================= Thai ================= */
thVowel(c){
  if(Math.random()<.5||c.p<.3){
    const v=pick(VOWELS.slice(0,Math.min(13,lerp(6,13,c.p*1.5)))),ds=shuffle(VOWELS.filter(x=>x!==v)).slice(0,3);
    return Math.random()<.5?C(B('รูปนี้คือสระอะไร?','Which Thai vowel is this?'),v[0],shuffle([v,...ds]).map(x=>opt(x[1],x,{t:x[1],l:'th'})),v,{vcls:'big',say:{t:v[1],l:'th'}}):
      C(B(`เลือก ${v[1]}`,`Find ${v[1]}`),'',shuffle([v,...ds]).map(x=>opt(x[0],x,{t:x[1],l:'th'})),v,{emoji:true,say:{t:v[1],l:'th'},vcls:'eq'});
  }
  const w=pick(VWORDS),names=shuffle(VNAMES.filter(x=>x!==w[2])).slice(0,3);
  return C(B(`คำว่า "${w[0]}" มีสระอะไร?`,`Which vowel is in "${w[0]}"?`),`${w[1]}<div style="width:100%;font-size:.6em">${w[0]}</div>`,shuffle([w[2],...names]).map(x=>T(x,'th')),w[2],{say:{t:w[0],l:'th'}});
},
thTone(c){
  if(Math.random()<.5||c.b<=2&&c.p<.5){
    const t=pick(TONES),ds=TONES.filter(x=>x!==t);
    return Math.random()<.5?C(B('รูปนี้คือวรรณยุกต์อะไร?','Which tone mark is this?'),t[0],shuffle([t,...ds]).map(x=>opt(x[1],x,{t:x[1],l:'th'})),t,{vcls:'big',say:{t:t[1],l:'th'}}):
      C(B(`เลือก ${t[1]}`,`Find ${t[1]}`),'',shuffle([t,...ds]).map(x=>opt(x[0],x,{t:x[1],l:'th'})),t,{emoji:true,say:{t:t[1],l:'th'},cls:'n4w'});
  }
  const w=pick(TWORDS),ds=shuffle(TONES.map(x=>x[1]).filter(x=>x!==w[1])).slice(0,3);
  return C(B(`คำว่า "${w[0]}" มีวรรณยุกต์อะไร?`,`Which tone mark is in "${w[0]}"?`),w[0],shuffle([w[1],...ds]).map(x=>T(x,'th')),w[1],{vcls:'big',say:{t:w[0],l:'th'}});
},
thAnti(c){
  const e=pick(ANTI),useTh=DB.lang==='th'||Math.random()<.3,flip=Math.random()<.5;
  const q=flip?e:[e[1],e[0],e[3],e[2]],others=shuffle(ANTI.filter(x=>x!==e));
  if(useTh){
    const ds=others.slice(0,3).map(x=>x[ri(0,1)]);
    return C(B(`ตรงข้ามกับ "${q[0]}" คือ?`,`What is the opposite of "${q[0]}"? (Thai)`),q[0],shuffle([q[1],...ds.filter(x=>x!==q[1])].slice(0,4)).map(x=>T(x,'th')),q[1],{vcls:'eq',say:{t:q[0],l:'th'}});
  }
  const ds=others.slice(0,3).map(x=>x[2+ri(0,1)]);
  return C(B(`ตรงข้ามกับ "${q[2]}" คือ?`,`What is the opposite of "${q[2]}"?`),q[2],shuffle([q[3],...ds.filter(x=>x!==q[3])].slice(0,4)).map(x=>T(x,'en')),q[3],{vcls:'eq',say:{t:q[2],l:'en'}});
},
thClass(c){
  const cls=[['กลาง','mid',CLS_MID],['สูง','high',CLS_HIGH],['ต่ำ','low',CLS_LOW]],k=pick(cls),l=pick(k[2]);
  return C(B(`${l} เป็นอักษรหมู่ไหน?`,`Which class is the Thai consonant ${l}?`),l,cls.map(x=>opt(DB.lang==='th'?'อักษร'+x[0]:x[1]+' class',x[0],{t:'อักษร'+x[0],l:'th'})),k[0],{vcls:'big',cls:'n3',say:{t:l,l:'th'}});
},
thWordType(c){
  const e=pick(WT),useTh=DB.lang==='th'||Math.random()<.3,ds=shuffle(WT.filter(x=>x[2]!==e[2])).slice(0,2),L=useTh?'th':'en',ix=useTh?0:1;
  const own=shuffle(WT.filter(x=>x[2]===e[2]&&x!==e));
  return C(B(`คำไหนเป็น${tx(WT_NAME[e[2]])}?`,`Which word is ${tx(WT_NAME[e[2]])}?`),'',shuffle([e,...ds]).map(x=>opt(x[ix],x,{t:x[ix],l:L})),e,{vcls:'eq',cls:'n3'});
}
};
