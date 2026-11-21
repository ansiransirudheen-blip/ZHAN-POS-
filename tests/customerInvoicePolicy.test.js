import test from 'node:test';
import assert from 'node:assert/strict';
import {issueInvoiceToken,hashInvoiceToken} from '../server/invoiceTokens.js';
import {resolveCustomerInvoice,INVOICE_RESPONSE_HEADERS} from '../server/customerInvoicePolicy.js';

const now=new Date('2026-11-08T00:00:00Z');
function fixture(){
 const token=issueInvoiceToken();
 const tokenRecord={token_hash:hashInvoiceToken(token),invoice_id:'id-1',expires_at:'2030-01-01T00:00:00Z',revoked_at:null};
 const invoice={id:'id-1',status:'completed',invoice_number:'ZHN-100',issued_at:'2026-11-08T10:00:00Z',currency:'SAR',subtotal:100,vat_amount:15,total:115,customer_phone:'+966500000000',staff_id:'private',cost:50,internal_notes:'secret'};
 return {token,tokenRecord,invoice,now};
}
test('authorized response exposes only whitelisted fields and no caching',()=>{
 const result=resolveCustomerInvoice(fixture());
 assert.equal(result.status,200);
 assert.equal(result.body.invoice_number,'ZHN-100');
 assert.equal(result.body.customer_phone,undefined);
 assert.equal(result.body.staff_id,undefined);
 assert.equal(result.body.internal_notes,undefined);
 assert.equal(result.body.cost,undefined);
 assert.equal(result.headers['Cache-Control'],'no-store');
 assert.equal(result.headers['Referrer-Policy'],'no-referrer');
});
test('unknown, expired, revoked, cross-invoice and uncommitted requests fail closed',()=>{
 const f=fixture();
 for(const change of [
  {token:issueInvoiceToken()},
  {tokenRecord:{...f.tokenRecord,expires_at:'2020-01-01T00:00:00Z'}},
  {tokenRecord:{...f.tokenRecord,revoked_at:'2026-11-08T00:00:00Z'}},
  {invoice:{...f.invoice,id:'another-id'}},
  {invoice:{...f.invoice,status:'draft'}},
  {invoice:null}
 ]){
  const result=resolveCustomerInvoice({...f,...change});
  assert.equal(result.status,404);
  assert.deepEqual(result.body,{error:'Invoice unavailable'});
 }
});
