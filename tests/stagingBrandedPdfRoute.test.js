import test from 'node:test';
import assert from 'node:assert/strict';
import {createStagingBrandedPdfRoute} from '../server/stagingBrandedPdfRoute.js';
test('staging route is disabled by default and reveals no data',async()=>{
 const route=createStagingBrandedPdfRoute();
 const result=await route({method:'GET',token:'a'.repeat(43)});
 assert.equal(result.status,404);
 assert.equal(result.headers['Cache-Control'],'no-store');
});
test('enabled staging route requires private adapter and logo loader',()=>{
 assert.throws(()=>createStagingBrandedPdfRoute({stagingEnabled:true}),/Staging dependencies/);
});
test('enabled staging route denies invalid methods and tokens before backend access',async()=>{
 let reads=0;
 const adapter={lookupTokenByHash:async()=>{reads++;return null},lookupInvoiceById:async()=>{reads++;return null}};
 const route=createStagingBrandedPdfRoute({stagingEnabled:true,adapter,loadOriginalLogo:async()=>{throw Error('should not load')}});
 assert.equal((await route({method:'POST',token:'a'.repeat(43)})).status,404);
 assert.equal((await route({method:'GET',token:'bad'})).status,404);
 assert.equal(reads,0);
});
test('valid-looking but unknown staging token is denied',async()=>{
 const adapter={lookupTokenByHash:async()=>null,lookupInvoiceById:async()=>null};
 const route=createStagingBrandedPdfRoute({stagingEnabled:true,adapter,loadOriginalLogo:async()=>{throw Error('should not load')}});
 assert.equal((await route({method:'GET',token:'a'.repeat(43)})).status,404);
});
