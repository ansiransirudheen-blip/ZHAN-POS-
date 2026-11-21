import test from 'node:test';
import assert from 'node:assert/strict';
import {createCustomerInvoiceDocumentHandler} from '../server/customerInvoiceDocumentHandler.js';
import {hashInvoiceToken} from '../server/invoiceTokens.js';
const token='t'.repeat(43);
const now=new Date('2026-11-08T10:00:00Z');
const record={invoice_id:'sale-1',token_hash:hashInvoiceToken(token),expires_at:'2026-11-09T10:00:00Z',revoked_at:null};
const sale={id:'sale-1',invoice_number:'ZHN-001',sale_date:'2026-11-08T09:00:00Z',subtotal:100,vat_amount:0,grand_total:100,status:'completed'};
test('unknown token returns unavailable, never invoice HTML',async()=>{
 const handler=createCustomerInvoiceDocumentHandler({lookupTokenByHash:async()=>null,lookupInvoiceById:async()=>sale});
 const response=await handler({method:'GET',token,now});
 assert.equal(response.status,404);
 assert.doesNotMatch(response.body,/ZHN-001/);
});
test('wrong HTTP method returns unavailable',async()=>{
 const handler=createCustomerInvoiceDocumentHandler({lookupTokenByHash:async()=>record,lookupInvoiceById:async()=>sale});
 assert.equal((await handler({method:'POST',token,now})).status,404);
});
test('backend failures return generic unavailable',async()=>{
 const handler=createCustomerInvoiceDocumentHandler({lookupTokenByHash:async()=>{throw Error('private DB failure')},lookupInvoiceById:async()=>sale});
 const response=await handler({method:'GET',token,now});
 assert.equal(response.status,404);assert.doesNotMatch(response.body,/private DB failure/);
});
