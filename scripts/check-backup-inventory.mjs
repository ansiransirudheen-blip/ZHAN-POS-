// Read-only validation of a manually prepared inventory JSON export.
// Never connects to production and never treats counts as a full backup.
import {readFileSync} from 'node:fs';
export const TABLES=['day_closes','expenses','products','purchase_items','purchases','sale_items','sales','staff_profiles','stock_movements','suppliers'];
export function validateInventory(manifest){
 if(!manifest||typeof manifest!=='object'||Array.isArray(manifest))throw Error('Inventory must be an object');
 const missing=TABLES.filter(t=>!Number.isSafeInteger(manifest[t])||manifest[t]<0);
 if(missing.length)throw Error('Missing or invalid row counts: '+missing.join(', '));
 return {tables:TABLES.length,totalRows:TABLES.reduce((n,t)=>n+manifest[t],0)};
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href){
 try{const result=validateInventory(JSON.parse(readFileSync(process.argv[2],'utf8')));process.stdout.write(JSON.stringify(result)+'\n')}
 catch(error){process.stderr.write(error.message+'\n');process.exitCode=1}
}
