import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('www',{recursive:true});
for(const name of ['index.html','apple-sqlite.js','manifest.webmanifest','icon.svg','service-worker.js'])await copyFile(name,'www/'+name);
console.log('Staged web assets in www/');
