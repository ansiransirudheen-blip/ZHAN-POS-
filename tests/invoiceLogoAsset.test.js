import test from 'node:test';
import assert from 'node:assert/strict';
import {validateOriginalLogoJpeg} from '../server/invoiceLogoAsset.js';
test('accepts bounded JPEG signature for original asset',()=>{
 const jpeg=Buffer.alloc(128);jpeg[0]=0xff;jpeg[1]=0xd8;jpeg[2]=0xff;jpeg[3]=0xc0;jpeg.writeUInt16BE(17,4);jpeg[6]=8;jpeg.writeUInt16BE(100,7);jpeg.writeUInt16BE(200,9);jpeg[11]=3;jpeg[21]=0xff;jpeg[22]=0xda;jpeg[126]=0xff;jpeg[127]=0xd9;
 assert.equal(validateOriginalLogoJpeg(jpeg).mimeType,'image/jpeg');
});
test('rejects missing, malformed or oversized assets',()=>{
 for(const bytes of [null,Buffer.from('not jpeg'),Buffer.alloc(128),Buffer.alloc(5_000_001)]){
  assert.throws(()=>validateOriginalLogoJpeg(bytes));
 }
});
