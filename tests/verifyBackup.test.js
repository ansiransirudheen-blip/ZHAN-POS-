import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';

test('backup checksum verifier accepts matching hash and rejects mismatch or missing file',()=>{
 const dir=mkdtempSync(join(tmpdir(),'zahn-backup-check-'));
 try{
  const file=join(dir,'sample.dump'),bytes=Buffer.from('SAMPLE ONLY, NOT A DATABASE BACKUP');
  writeFileSync(file,bytes);
  const hash=createHash('sha256').update(bytes).digest('hex');
  const run=(f,h)=>spawnSync(process.execPath,['scripts/verify-backup.mjs',f,h],{encoding:'utf8'});
  const ok=run(file,hash);
  assert.equal(ok.status,0,ok.stderr);
  assert.match(ok.stdout,/PASS: backup checksum matches/);
  const bad=run(file,'0'.repeat(64));
  assert.equal(bad.status,1);
  const missing=run(join(dir,'missing.dump'),hash);
  assert.equal(missing.status,2);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
