import test from 'node:test';
import assert from 'node:assert/strict';
import {createCustomerInvoiceBrandedPdf} from '../server/customerInvoiceBrandedPdf.js';
const authorized={status:200,body:{invoice_number:'ZHN-001',issued_at:'2026-11-08T10:00:00Z',currency:'SAR',subtotal:100,vat_amount:0,total:100,customer_phone:'SECRET'}};
function fakeJpeg(){
 const a=Buffer.alloc(120,0);a[0]=255;a[1]=216;a[2]=255;a[3]=192;a.writeUInt16BE(17,4);a[6]=8;a.writeUInt16BE(100,7);a.writeUInt16BE(200,9);a[11]=3;a[21]=255;a[22]=218;a[119]=217;a[118]=255;return a;
}
test('embeds exact JPEG bytes in a PDF image object',()=>{
 const jpeg=fakeJpeg(),r=createCustomerInvoiceBrandedPdf(authorized,jpeg);
 assert.equal(r.status,200);assert.equal(r.headers['Content-Type'],'application/pdf');
 assert.match(r.body.toString('latin1'),/\/Subtype \/Image/);
 assert.equal(r.body.indexOf(jpeg)>0,true);
 assert.doesNotMatch(r.body.toString('latin1'),/SECRET/);
});
test('unauthorized request does not require logo or return PDF',()=>{
 const r=createCustomerInvoiceBrandedPdf({status:404},null);assert.equal(r.status,404);
});
test('rejects malformed logo rather than substituting one',()=>{
 assert.throws(()=>createCustomerInvoiceBrandedPdf(authorized,Buffer.alloc(120)));
});
