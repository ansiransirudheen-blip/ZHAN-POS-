import test from 'node:test';
import assert from 'node:assert/strict';
import {createCustomerInvoiceBrandedPdfHandler} from '../server/customerInvoiceBrandedPdfHandler.js';
import {hashInvoiceToken} from '../server/invoiceTokens.js';
const token='t'.repeat(43),now=new Date('2026-11-08T10:00:00Z');
const record={invoice_id:'sale-1',token_hash:hashInvoiceToken(token),expires_at:'2026-11-09T10:00:00Z',revoked_at:null};
const sale={id:'sale-1',invoice_number:'ZHN-001',sale_date:'2026-11-08T09:00:00Z',subtotal:100,vat_amount:0,grand_total:100,status:'completed',customer_phone:'PRIVATE'};
function jpeg(){const a=Buffer.alloc(120);a[0]=255;a[1]=216;a[2]=255;a[3]=192;a.writeUInt16BE(17,4);a[6]=8;a.writeUInt16BE(100,7);a.writeUInt16BE(200,9);a[11]=3;a[21]=255;a[22]=218;a[118]=255;a[119]=217;return a;}
const adapter=(invoice=sale)=>({lookupTokenByHash:async()=>record,lookupInvoiceById:async()=>invoice});
test('authorized token produces branded PDF, not private fields',async()=>{
 const h=createCustomerInvoiceBrandedPdfHandler(adapter(),async()=>jpeg());
 const result=await h({method:'GET',token,now});
 assert.equal(result.status,200);
 assert.equal(result.headers['Content-Type'],'application/pdf');
 assert.match(result.body.toString('latin1'),/\/Subtype \/Image/);
 assert.doesNotMatch(result.body.toString('latin1'),/PRIVATE/);
});
test('denied token never loads original logo',async()=>{
 let loaded=false;
 const h=createCustomerInvoiceBrandedPdfHandler(adapter(),async()=>{loaded=true;return jpeg()});
 assert.equal((await h({method:'GET',token:'invalid',now})).status,404);
 assert.equal(loaded,false);
});
test('missing logo fails closed and does not return unbranded invoice',async()=>{
 const h=createCustomerInvoiceBrandedPdfHandler(adapter(),async()=>{throw Error('logo unavailable')});
 const result=await h({method:'GET',token,now});
 assert.equal(result.status,404);
});
test('draft and wrong method are denied',async()=>{
 const h=createCustomerInvoiceBrandedPdfHandler(adapter({...sale,status:'draft'}),async()=>jpeg());
 assert.equal((await h({method:'GET',token,now})).status,404);
 assert.equal((await h({method:'POST',token,now})).status,404);
});
