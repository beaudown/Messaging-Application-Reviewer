/* Read-only Apple Messages SQLite adapter. Requires sql.js 1.13.0 (WASM). */
(function(){
"use strict";
let enginePromise;
async function engine(){
 if(!enginePromise)enginePromise=(async()=>{
  if(typeof window.initSqlJs!=="function"){
   await new Promise((resolve,reject)=>{const script=document.createElement("script");script.src="./sql-wasm.js";script.onload=resolve;script.onerror=()=>reject(Error("SQLite engine unavailable. Connect once to load the WASM runtime."));document.head.append(script)});
  }
  return window.initSqlJs({locateFile:f=>""./"+f});
 })().catch(e=>{enginePromise=null;throw e});
 return enginePromise;
}
function quoteIdentifier(n){return '"'+String(n).replace(/"/g,'""')+'"'}
function appleDate(raw){
 if(raw===null||raw===undefined)return "";
 const v=Number(raw);if(!Number.isFinite(v))return "";
 // Apple CFAbsoluteTime, nanoseconds on modern schemas, seconds on older schemas.
 const sec=Math.abs(v)>1e14?v/1e9:v;
 const ms=(sec+978307200)*1000;
 const d=new Date(ms);return Number.isFinite(d.getTime())?d.toISOString():"";
}
async function importAppleDatabase(file){
 const SQL=await engine(), db=new SQL.Database(new Uint8Array(await file.arrayBuffer()));
 try{
  const tables=new Set(db.exec("SELECT name FROM sqlite_master WHERE type='table'").flatMap(r=>r.values.map(x=>x[0])));
  if(!tables.has("message"))throw Error("This SQLite database does not contain an Apple Messages message table.");
  const cols=new Set(db.exec("PRAGMA table_info(message)").flatMap(r=>r.values.map(x=>x[1])));
  const has=n=>cols.has(n);
  const select=["m.ROWID AS mid",has("text")?"m.text AS body":"NULL AS body",has("date")?"m.date AS sent_date":"NULL AS sent_date",has("is_from_me")?"m.is_from_me AS outgoing":"0 AS outgoing",has("service")?"m.service AS transport":"NULL AS transport",has("handle_id")?"m.handle_id AS hid":"NULL AS hid",has("guid")?"m.guid AS guid":"NULL AS guid"];
  const handles=tables.has("handle")&&has("handle_id");
  const query="SELECT "+select.join(",")+(handles?",h.id AS handle_name":"")+
   " FROM message m"+(handles?" LEFT JOIN handle h ON h.ROWID=m.handle_id":"")+" ORDER BY m.date,m.ROWID";
  const result=db.exec(query)[0];
  if(!result)return {messages:[],warnings:["No message rows found."]};
  const rows=result.values.map(v=>Object.fromEntries(result.columns.map((k,i)=>[k,v[i]])));
  const attachmentMap=new Map(),warnings=[];
  if(tables.has("attachment")&&tables.has("message_attachment_join")){
   const rs=db.exec("SELECT j.message_id AS mid,a.filename AS filename,a.mime_type AS mime,a.transfer_name AS transfer_name FROM message_attachment_join j JOIN attachment a ON a.ROWID=j.attachment_id");
   if(rs[0])for(const v of rs[0].values){const [mid,filename,mime,transfer]=v;const arr=attachmentMap.get(mid)||[];arr.push({name:transfer||filename?.split("/").pop()||"Apple attachment",mimeType:mime||"application/octet-stream",description:"Attachment referenced by Apple Messages database; original media file must be supplied separately",status:"missing",sourcePath:filename||""});attachmentMap.set(mid,arr)}
  }else warnings.push("Attachment join tables unavailable; media references could not be recovered.");
  if(tables.has("chat_message_join")&&tables.has("chat")){
   const q=db.exec("SELECT j.message_id,c.chat_identifier FROM chat_message_join j JOIN chat c ON c.ROWID=j.chat_id");
   const chats=new Map();if(q[0])for(const [id,chat] of q[0].values){const a=chats.get(id)||[];a.push(chat);chats.set(id,a)}
   for(const r of rows)r.chatIds=chats.get(r.mid)||[];
  }else warnings.push("Chat relationship tables unavailable.");
  const messages=rows.map(r=>({time:appleDate(r.sent_date),sender:r.outgoing?"Me":r.handle_name||"Unknown",message:r.body||"",type:String(r.transport||"unknown").toLowerCase(),sourceGuid:r.guid||"",chatIds:r.chatIds||[],attachments:attachmentMap.get(r.mid)||[]}));
  warnings.push("RCS, iMessage, reactions, edits and delivery metadata may not be fully represented. Native Apple Messages restoration is unsupported.");
  return {messages,warnings};
 }finally{db.close()}
}
window.MARAppleSQLite={importAppleDatabase};
})();
