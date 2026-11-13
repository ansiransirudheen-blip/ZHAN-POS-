import test from 'node:test';
import assert from 'node:assert/strict';
import {renderCustomerInvoiceDocument,customerInvoiceDocumentResponse} from '../server/customerInvoiceDocument.js';
const invoice={invoice_number:'ZHN-001',issued_at:'2026-11-08T10:00:00Z',currency:'SAR',subtotal:100,vat_amount:0,total:100};
test('renders printable authorized invoice without private fields',()=>{
 const html=renderCustomerInvoiceDocument({...invoice,customer_phone:'SECRET-PHONE',unit_cost:12});
 assert.match(html,/ZHN-001/);assert.match(html,/Print \/ Save PDF/);
 assert.doesNotMatch(html,/SECRET-PHONE/);assert.doesNotMatch(html,/unit_cost/);
});
test('escapes malicious invoice number',()=>{
 const html=renderCustomerInvoiceDocument({...invoice,invoice_number:'<img src=x onerror=alert(1)>'});
 assert.doesNotMatch(html,/<img src=x/);assert.match(html,/&lt;img/);
});
test('fails closed when not authorized',()=>{
 const denied=customerInvoiceDocumentResponse({status:404,body:{error:'Invoice unavailable'}});
 assert.equal(denied.status,404);assert.doesNotMatch(denied.body,/Print/);
});
test('validates amount and date',()=>{
 assert.throws(()=>renderCustomerInvoiceDocument({...invoice,total:Infinity}));
 assert.throws(()=>renderCustomerInvoiceDocument({...invoice,issued_at:'bad-date'}));
});
