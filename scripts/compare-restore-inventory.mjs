#!/usr/bin/env node
// Compare two independently captured, NON-SENSITIVE database inventory JSON files.
// No database access; no writes. Use only with isolated staging restores.
// Usage: node scripts/compare-restore-inventory.mjs source.json restored.json
import {readFileSync} from 'node:fs';
const [sourceFile,restoredFile]=process.argv.slice(2);
if(!sourceFile||!restoredFile){console.error('Usage: node scripts/compare-restore-inventory.mjs source.json restored.json');process.exit(2);}
const keys=['tables','functions','policies','grants','rowCounts'];
function load(path){
 const x=JSON.parse(readFileSync(path,'utf8'));
 if(!x||typeof x!=='object'||Array.isArray(x))throw Error('Inventory must be an object');
 for(const key of keys)if(!x[key]||typeof x[key]!=='object'||Array.isArray(x[key]))throw Error('Missing object: '+key);
 return x;
}
try{
 const a=load(sourceFile),b=load(restoredFile);
 const diffs=[];
 for(const key of keys){
  const names=new Set([...Object.keys(a[key]),...Object.keys(b[key])]);
  for(const name of [...names].sort()){
   if(JSON.stringify(a[key][name])!==JSON.stringify(b[key][name]))
    diffs.push(key+'.'+name);
  }
 }
 if(diffs.length){
  console.error('FAIL: restore inventory differs:',diffs.join(', '));
  process.exitCode=1;
 }else{
  console.log('PASS: inventory values match (tables/functions/policies/grants/rowCounts).');
  console.log('This is NOT a substitute for a full restore, integrity and application test.');
 }
}catch(e){console.error('FAIL: inventory comparison:',e.message);process.exitCode=2;}
