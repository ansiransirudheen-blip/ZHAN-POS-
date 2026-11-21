import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeSaudiWhatsApp,createInvoiceWhatsAppLink} from '../src/lib/invoiceWhatsApp.js';
test('Saudi WhatsApp number normalization',()=>{
 assert.equal(normalizeSaudiWhatsApp('055 123 4567'),'966551234567');
 assert.equal(normalizeSaudiWhatsApp('+966 55 123 4567'),'966551234567');
 assert.equal(normalizeSaudiWhatsApp('00966 55 123 4567'),'966551234567');
 assert.equal(normalizeSaudiWhatsApp('12345'),null);
});
test('secure invoice URL is included in encoded WhatsApp message',()=>{
 const link=createInvoiceWhatsAppLink({phone:'0551234567',invoiceNumber:'ZHN-000125',total:250,invoiceUrl:'https://invoices.example.com/i/opaque-token'});
 const u=new URL(link);
 assert.equal(u.hostname,'wa.me');assert.equal(u.pathname,'/966551234567');
 assert.match(u.searchParams.get('text'),/ZHN-000125/);
 assert.match(u.searchParams.get('text'),/https:\/\/invoices.example.com\/i\/opaque-token/);
});
test('reject missing or insecure invoice links',()=>{
 const base={phone:'0551234567',invoiceNumber:'ZHN-000125',total:250};
 assert.throws(()=>createInvoiceWhatsAppLink({...base,invoiceUrl:''}));
 assert.throws(()=>createInvoiceWhatsAppLink({...base,invoiceUrl:'http://example.com/invoice'}));
 assert.throws(()=>createInvoiceWhatsAppLink({...base,invoiceUrl:'https://localhost/invoice'}));
});
