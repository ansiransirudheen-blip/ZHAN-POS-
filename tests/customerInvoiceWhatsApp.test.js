import test from 'node:test';
import assert from 'node:assert/strict';
import {buildCustomerInvoiceWhatsApp} from '../server/customerInvoiceWhatsApp.js';
const base={phone:'919876543210',invoiceNumber:'ZHN-125',total:250,invoiceUrl:'https://invoices.zahn.example.org/i/secure-token'};
test('builds customer-specific WhatsApp message with verified HTTPS link',()=>{
 const result=buildCustomerInvoiceWhatsApp(base);
 assert.match(result.whatsappUrl,/^https:\/\/wa.me\/919876543210\?text=/);
 assert.match(decodeURIComponent(result.whatsappUrl),/https:\/\/invoices.zahn.example.org\/i\/secure-token/);
});
test('rejects absent or placeholder invoice links',()=>{
 for(const invoiceUrl of [undefined,'','http://example.org/i/token','https://example.com/i/token','javascript:alert(1)']){
  assert.throws(()=>buildCustomerInvoiceWhatsApp({...base,invoiceUrl}));
 }
});
test('rejects invalid phone, total and invoice number',()=>{
 assert.throws(()=>buildCustomerInvoiceWhatsApp({...base,phone:'0551234567'}));
 assert.throws(()=>buildCustomerInvoiceWhatsApp({...base,total:NaN}));
 assert.throws(()=>buildCustomerInvoiceWhatsApp({...base,invoiceNumber:'<script>'}));
});
