'use strict';
/* ========= app version & update check =========
   Set playPackage to your real Play Store package name and updateUrl to where you host version.json.
   version.json: {"latest":"1.1.0","min":"1.0.0","notes":{"th":"...","en":"..."}}
   latest > current -> friendly update banner; current < min -> update required screen. */
const APP_CONFIG={
  version:'1.1.0',
  playPackage:'com.example.littlegenius',   // TODO: replace with the real Play Store package id
  updateUrl:'https://sensetoppae.github.io/little-genius-games/version.json'   // hosted on GitHub Pages
};
const verNum=v=>String(v||'0').split('.').map(x=>parseInt(x,10)||0);
function verCmp(a,b){const x=verNum(a),y=verNum(b);for(let i=0;i<Math.max(x.length,y.length);i++){const d=(x[i]||0)-(y[i]||0);if(d)return d<0?-1:1}return 0}
const storeUrl=()=>`https://play.google.com/store/apps/details?id=${APP_CONFIG.playPackage}`;
function openStore(){
  const ua=navigator.userAgent||'';
  // Android devices open the Play Store app directly; otherwise the web listing
  if(/Android/i.test(ua))location.href=`market://details?id=${APP_CONFIG.playPackage}`;
  else window.open(storeUrl(),'_blank');
  setTimeout(()=>{if(/Android/i.test(ua)&&!document.hidden)location.href=storeUrl()},1500);
}
let UPD={state:'unknown',info:null};   // unknown | latest | optional | required | error
async function checkUpdate(){
  if(!APP_CONFIG.updateUrl){UPD={state:'error',info:null};return UPD}
  try{
    const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),6000);
    const r=await fetch(APP_CONFIG.updateUrl+(APP_CONFIG.updateUrl.includes('?')?'&':'?')+'t='+Date.now(),{cache:'no-store',signal:ctl.signal});
    clearTimeout(t);
    if(!r.ok)throw new Error('http '+r.status);
    const j=await r.json(),cur=APP_CONFIG.version;
    UPD={state:j.min&&verCmp(cur,j.min)<0?'required':verCmp(cur,j.latest)<0?'optional':'latest',info:j};
  }catch(e){UPD={state:'error',info:null}}
  return UPD;
}
const updSkipKey=v=>'lgg_skip_'+v;
const updSkipped=v=>{try{return localStorage.getItem(updSkipKey(v))==='1'}catch(e){return false}};
function updNotes(j){return j&&j.notes?(j.notes[DB.lang]||j.notes.th||''):''}
/* Pop-up that jumps out over any screen when an update exists. Required updates cannot be dismissed. */
function closeUpdatePopup(){const o=$('#updpop');if(o)o.remove()}
function showUpdatePopup(u){
  closeUpdatePopup();
  const req=u.state==='required',o=document.createElement('div');
  o.id='updpop';
  o.style.cssText='position:fixed;inset:0;background:#000a;z-index:100;display:flex;align-items:center;justify-content:center;padding:20px';
  o.innerHTML=`<div class="card" style="max-width:420px;width:100%;animation:popin .5s cubic-bezier(.2,1.6,.4,1)">
    <div class="mascot">🎁</div>
    <h1>${tx(req?B('ต้องอัปเดตเกมก่อนนะ','Please update the game'):B('มีเวอร์ชันใหม่!','New version available!'))}</h1>
    <div class="sub">${tx(B(`ของคุณ ${APP_CONFIG.version} → ใหม่ ${u.info.latest}`,`Yours ${APP_CONFIG.version} → New ${u.info.latest}`))}</div>
    ${updNotes(u.info)?`<div class="sub" style="margin:8px 0">${updNotes(u.info)}</div>`:''}
    <button class="big" id="updgo">⬇️ ${tx(B('อัปเดตที่ Play Store','Update on Play Store'))}</button>
    ${req?'':`<button class="big grey" id="updlater" style="font-size:18px;padding:10px">${tx(B('ไว้ทีหลัง','Later'))}</button>`}</div>`;
  document.body.appendChild(o);
  try{sOk()}catch(e){}
  $('#updgo').onclick=openStore;
  if(!req)$('#updlater').onclick=()=>{try{localStorage.setItem(updSkipKey(u.info.latest),'1')}catch(e){}closeUpdatePopup()};
}
let UPD_LAST=0;
async function runUpdateCheck(force){
  if(!force&&Date.now()-UPD_LAST<6*3600*1000)return;
  UPD_LAST=Date.now();
  const u=await checkUpdate();
  if(u.state==='required'||(u.state==='optional'&&!updSkipped(u.info.latest)))showUpdatePopup(u);
}
function startUpdateWatch(){
  runUpdateCheck(true);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)runUpdateCheck(false)});
}
/* Manual check from Settings */
async function manualUpdateCheck(){
  const out=$('#updres'),btn=$('#updchk');if(!out)return;
  btn.disabled=true;out.textContent=tx(B('กำลังตรวจสอบ…','Checking…'));
  const u=await checkUpdate();if(!$('#updres'))return;
  btn.disabled=false;
  if(u.state==='latest')out.textContent='✅ '+tx(B('คุณใช้เวอร์ชันล่าสุดแล้ว','You have the latest version'));
  else if(u.state==='error')out.textContent='⚠️ '+tx(B('ตรวจสอบไม่ได้ (ลองตอนมีอินเทอร์เน็ต)','Could not check (try again when online)'));
  else{
    out.innerHTML=`🎁 ${tx(B(`มีเวอร์ชันใหม่ ${u.info.latest}`,`New version ${u.info.latest} available`))} <button class="big" id="updgo2" style="margin:8px 0 0;font-size:18px;padding:10px">⬇️ ${tx(B('ไปอัปเดตที่ Play Store','Update on Play Store'))}</button>`;
    $('#updgo2').onclick=openStore;showUpdatePopup(u);
  }
}
