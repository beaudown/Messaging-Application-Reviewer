const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dest=path.join(root,'www');
fs.mkdirSync(dest,{recursive:true});
for(const name of ['index.html','apple-sqlite.js','manifest.webmanifest','icon.svg','service-worker.js']){
 const src=path.join(root,name);
 if(!fs.existsSync(src))throw Error('Missing app asset: '+name);
 fs.copyFileSync(src,path.join(dest,name));
}
for(const name of ['sql-wasm.js','sql-wasm.wasm']){
 const src=require.resolve('sql.js/dist/'+name);
 fs.copyFileSync(src,path.join(dest,name));
}
console.log('Prepared offline-capable Android web assets in www/');
