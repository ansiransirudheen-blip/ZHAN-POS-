import test from 'node:test';
import assert from 'node:assert/strict';
import {issueInvoiceToken,hashInvoiceToken} from '../server/invoiceTokens.js';
import {createCustomerInvoiceHandler} from '../server/customerInvoiceHandler.js';

test('handler resolves only hash-bound invoice with minimal public fields',async()=>{
 const token=issueInvoiceToken(),hash=hashInvoiceToken(token);
 const calls=[];
 const handler=createCustomerInvoiceHandler({
  async lookupTokenByHash(h){calls.push(['token',h]);return h===hash?{token_hash:hash,invoice_id:'i1',expires_at:'2030-01-01T00:00:00Z',revoked_at:null}:null},
  async lookupInvoiceById(id){calls.push(['invoice',id]);return {id:'i1',status:'completed',invoice_number:'ZHN-1',issued_at:'2026-11-08T10:00:00Z',currency:'SAR',subtotal:100,vat_amount:15,total:115,customer_phone:'PRIVATE'}}
 });
 const r=await handler({method:'GET',token,now:new Date('2026-11-08')});
 assert.equal(r.status,200);
 assert.equal(r.body.customer_phone,undefined);
 assert.deepEqual(calls,[['token',hash],['invoice','i1']]);
 const missing=await handler({method:'GET',token:issueInvoiceToken()});
 assert.equal(missing.status,404);
 assert.equal(calls.length,3); // missing token must not trigger invoice lookup
});
test('handler denies invalid methods, malformed tokens, and storage failures',async()=>{
 const handler=createCustomerInvoiceHandler({
  async lookupTokenByHash(){throw Error('secret database error')},
  async lookupInvoiceById(){throw Error('should not run')}
 });
 for(const req of [{method:'POST',token:issueInvoiceToken()},{method:'GET',token:'bad'},{method:'GET',token:issueInvoiceToken()}]){
  const r=await handler(req);
  assert.equal(r.status,404);
  assert.deepEqual(r.body,{error:'Invoice unavailable'});
  assert.equal(r.headers['Cache-Control'],'no-store');
 }
});
