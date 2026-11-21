import test from 'node:test';
import assert from 'node:assert/strict';
import {issueInvoiceToken,hashInvoiceToken,verifyInvoiceToken} from '../server/invoiceTokens.js';

test('issues unpredictable 256-bit URL-safe token and stores only hash',()=>{
 const a=issueInvoiceToken(),b=issueInvoiceToken();
 assert.match(a,/^[A-Za-z0-9_-]{43}$/);
 assert.notEqual(a,b);
 assert.match(hashInvoiceToken(a),/^[0-9a-f]{64}$/);
 assert.equal(hashInvoiceToken(a),hashInvoiceToken(a));
 assert.notEqual(hashInvoiceToken(a),a);
});
test('accepts only matching, active, unexpired token record',()=>{
 const token=issueInvoiceToken();
 const record={token_hash:hashInvoiceToken(token),invoice_id:'invoice-1',expires_at:'2030-01-01T00:00:00Z',revoked_at:null};
 const now=new Date('2026-11-08T00:00:00Z');
 assert.equal(verifyInvoiceToken(token,record,now),true);
 assert.equal(verifyInvoiceToken(issueInvoiceToken(),record,now),false);
 assert.equal(verifyInvoiceToken('not-a-token',record,now),false);
 assert.equal(verifyInvoiceToken(token,{...record,revoked_at:'2026-11-08T00:00:00Z'},now),false);
 assert.equal(verifyInvoiceToken(token,{...record,expires_at:'2020-01-01T00:00:00Z'},now),false);
 assert.equal(verifyInvoiceToken(token,{...record,invoice_id:null},now),false);
 assert.equal(verifyInvoiceToken(token,{...record,token_hash:'bad'},now),false);
});
