import test from 'node:test';
import assert from 'node:assert/strict';
import {createCustomerInvoicePdfHandler} from '../server/customerInvoicePdfHandler.js';
import {hashInvoiceToken} from '../server/invoiceTokens.js';
const token='t'.repeat(43),now=new Date('2026-11-08T10:00:00Z');
const tokenRecord={invoice_id:'sale-1',token_hash:hashInvoiceToken(token),expires_at:'2026-11-09T10:00:00Z',revoked_at:null};
const sale={id:'sale-1',invoice_number:'ZHN-001',sale_date:'2026-11-08T09:00:00Z',subtotal:100,vat_amount:0,grand_total:100,status:'completed',customer_phone:'PRIVATE'};
const handler=(record=tokenRecord,invoice=sale)=>createCustomerInvoicePdfHandler({
 lookupTokenByHash:async()=>record,lookupInvoiceById:async()=>invoice
});
test('valid authorized token yields downloadable PDF without private fields',async()=>{
 const result=await handler()({method:'GET',token,now});
 assert.equal(result.status,200);
 assert.equal(result.headers['Content-Type'],'application/pdf');
 assert.match(result.body.toString('ascii'),/ZHN-001/);
 assert.doesNotMatch(result.body.toString('ascii'),/PRIVATE/);
});
test('invalid token fails closed',async()=>{
 assert.equal((await handler()({method:'GET',token:'bad',now})).status,404);
});
test('expired or revoked token fails closed',async()=>{
 assert.equal((await handler({...tokenRecord,expires_at:'2026-11-07T10:00:00Z'})({method:'GET',token,now})).status,404);
 assert.equal((await handler({...tokenRecord,revoked_at:'2026-11-08T08:00:00Z'})({method:'GET',token,now})).status,404);
});
test('draft, void, mismatched sale and wrong method fail closed',async()=>{
 for(const status of ['draft','void'])assert.equal((await handler(tokenRecord,{...sale,status})({method:'GET',token,now})).status,404);
 assert.equal((await handler(tokenRecord,{...sale,id:'another-sale'})({method:'GET',token,now})).status,404);
 assert.equal((await handler()({method:'POST',token,now})).status,404);
});
test('database error fails closed without leaking details',async()=>{
 const failing=createCustomerInvoicePdfHandler({lookupTokenByHash:async()=>{throw Error('DB SECRET')},lookupInvoiceById:async()=>sale});
 const result=await failing({method:'GET',token,now});
 assert.equal(result.status,404);assert.doesNotMatch(result.body,/DB SECRET/);
});
