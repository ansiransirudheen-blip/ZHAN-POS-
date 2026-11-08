import test from 'node:test';
import assert from 'node:assert/strict';
import {createCustomerInvoicePdf} from '../server/customerInvoicePdf.js';
const valid={status:200,body:{invoice_number:'ZHN-001',issued_at:'2026-11-08T10:00:00Z',currency:'SAR',subtotal:100,vat_amount:0,total:100,customer_phone:'SECRET'}};
test('creates a PDF attachment with valid header and xref',()=>{
 const response=createCustomerInvoicePdf(valid);
 assert.equal(response.status,200);assert.equal(response.headers['Content-Type'],'application/pdf');
 assert.ok(Buffer.isBuffer(response.body));assert.ok(response.body.toString('ascii').startsWith('%PDF-1.4'));
 assert.match(response.body.toString('ascii'),/xref\n0 6\n/);
 assert.doesNotMatch(response.body.toString('ascii'),/SECRET/);
});
test('invalid or unauthorized invoice never returns a PDF',()=>{
 for(const data of [null,{status:404}, {...valid,body:{...valid.body,total:NaN}}]){
  const response=createCustomerInvoicePdf(data);assert.equal(response.status,404);assert.equal(typeof response.body,'string');
 }
});
test('invoice text is escaped for PDF content stream',()=>{
 const response=createCustomerInvoicePdf({...valid,body:{...valid.body,invoice_number:'INV-(1)\\test'}});
 assert.equal(response.status,200);
 assert.match(response.body.toString('ascii'),/INV-\\\(1\\\)\\\\test/);
});
