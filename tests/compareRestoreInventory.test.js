import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

test('restore inventory comparator catches mismatches and invalid files',()=>{
 const dir=mkdtempSync(join(tmpdir(),'zahn-restore-'));
 try{
  const original=join(dir,'original.json'),restored=join(dir,'restored.json');
  const inventory={tables:{sales:true},functions:{save_pos_bill:true},policies:{'sales.rls':true},grants:{'sales.select':'restricted'},rowCounts:{sales:0}};
  writeFileSync(original,JSON.stringify(inventory));
  writeFileSync(restored,JSON.stringify(inventory));
  const run=()=>spawnSync(process.execPath,['scripts/compare-restore-inventory.mjs',original,restored],{encoding:'utf8'});
  assert.equal(run().status,0);
  writeFileSync(restored,JSON.stringify({...inventory,rowCounts:{sales:1}}));
  assert.equal(run().status,1);
  writeFileSync(restored,'{broken');
  assert.equal(run().status,2);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
