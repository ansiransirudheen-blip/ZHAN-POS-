import test from 'node:test';
import assert from 'node:assert/strict';
import {TABLES,validateInventory} from '../scripts/check-backup-inventory.mjs';
test('inventory checker accepts ten nonnegative integer table counts',()=>{
 const manifest=Object.fromEntries(TABLES.map(t=>[t,0]));manifest.staff_profiles=1;
 assert.deepEqual(validateInventory(manifest),{tables:10,totalRows:1});
});
test('rejects incomplete or fabricated count types',()=>{
 const manifest=Object.fromEntries(TABLES.map(t=>[t,0]));
 delete manifest.staff_profiles;
 assert.throws(()=>validateInventory(manifest));
 manifest.staff_profiles='1';
 assert.throws(()=>validateInventory(manifest));
});
