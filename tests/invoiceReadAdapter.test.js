import test from 'node:test';
import assert from 'node:assert/strict';
import {createInvoiceReadAdapter} from '../server/invoiceReadAdapter.js';
import {createCustomerInvoiceHandler} from '../server/customerInvoiceHandler.js';
import {issueInvoiceToken,hashInvoiceToken} from '../server/invoiceTokens.js';

test('read adapter and handler return only whitelisted completed sale fields',async()=>{
 const token=issueInvoiceToken(),hash=hashInvoiceToken(token);
 const queries=[];
 const adapter=createInvoiceReadAdapter({
  async findTokenByHash(key,cols){
   queries.push(['token',key,cols]);
   return {token_hash:hash,invoice_id:'sale-1',expires_at:'2030-01-01T00:00:00Z',revoked_at:null,customer_phone:'secret'};
  },
  async findSaleById(id,cols){
   queries.push(['sale',id,cols]);
   return {id:'sale-1',status:'completed',invoice_number:'ZHN-123',sale_date:'2026-11-08T10:00:00Z',subtotal:'100.00',vat_amount:'13.04',grand_total:'100.00',customer_phone:'secret',unit_cost:'secret'};
  }
 });
 const result=await createCustomerInvoiceHandler(adapter)({method:'GET',token,now:new Date('2026-11-08')});
 assert.equal(result.status,200);
 assert.equal(result.body.invoice_number,'ZHN-123');
 assert.equal(result.body.customer_phone,undefined);
 assert.equal(result.body.unit_cost,undefined);
 assert.equal(queries.length,2);
 assert.equal(queries[0][2],'token_hash, invoice_id, expires_at, revoked_at');
 assert.equal(queries[1][2],'id, status, invoice_number, sale_date, subtotal, vat_amount, grand_total');
});
test('adapter rejects mismatched records and malformed hash',async()=>{
 const adapter=createInvoiceReadAdapter({
  async findTokenByHash(){return {token_hash:'0'.repeat(64),invoice_id:'id'}},
  async findSaleById(){return {id:'different'}}
 });
 assert.equal(await adapter.lookupTokenByHash('invalid'),null);
 assert.equal(await adapter.lookupTokenByHash('a'.repeat(64)),null);
 assert.equal(await adapter.lookupInvoiceById('id'),null);
});
