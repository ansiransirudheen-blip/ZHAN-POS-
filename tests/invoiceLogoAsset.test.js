import test from 'node:test';
import assert from 'node:assert/strict';
import {validateOriginalLogoJpeg} from '../server/invoiceLogoAsset.js';
test('accepts bounded JPEG signature for original asset',()=>{
 const jpeg=Buffer.alloc(128);jpeg[0]=0xff;jpeg[1]=0xd8;jpeg[126]=0xff;jpeg[127]=0xd9;
 assert.equal(validateOriginalLogoJpeg(jpeg).mimeType,'image/jpeg');
});
test('rejects missing, malformed or oversized assets',()=>{
 for(const bytes of [null,Buffer.from('not jpeg'),Buffer.alloc(128),Buffer.alloc(5_000_001)]){
  assert.throws(()=>validateOriginalLogoJpeg(bytes));
 }
});
