#!/usr/bin/env node
// Verify an already-created local Postgres backup. NEVER connects to a database.
// Usage: node scripts/verify-backup.mjs /secure/path/backup.dump EXPECTED_SHA256
import {createHash} from 'node:crypto';
import {createReadStream,statSync} from 'node:fs';
import {basename} from 'node:path';

const [file,expected]=process.argv.slice(2);
if(!file||!/^[0-9a-fA-F]{64}$/.test(expected||'')){
 console.error('Usage: node scripts/verify-backup.mjs BACKUP_FILE EXPECTED_SHA256');
 process.exit(2);
}
let size;
try{size=statSync(file).size;if(size===0)throw Error('empty backup');}
catch(e){console.error('Backup file unavailable or empty:',e.message);process.exit(2);}
const digest=createHash('sha256');
try{
 for await(const chunk of createReadStream(file))digest.update(chunk);
 const actual=digest.digest('hex');
 if(actual!==expected.toLowerCase()){
  console.error('FAIL: checksum mismatch for',basename(file));
  process.exitCode=1;
 }else{
  console.log('PASS: backup checksum matches:',basename(file),'bytes:',size);
  console.log('Restore verification is still required before release.');
 }
}catch(e){console.error('Backup verification failed:',e.message);process.exitCode=2;}
