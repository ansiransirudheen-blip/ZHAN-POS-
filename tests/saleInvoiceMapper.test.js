import test from 'node:test';
import assert from 'node:assert/strict';
import {mapCompletedSaleToCustomerInvoice} from '../server/saleInvoiceMapper.js';

const sale={id:'sale-1',status:'completed',invoice_number:'ZHN-100',sale_date:'2026-11-08T10:00:00Z',subtotal:'100.00',vat_amount:'13.04',grand_total:'100.00',customer_phone:'+966500000000',customer_name:'Private',payment_method:'cash',request_fingerprint:'secret'};
test('maps only whitelisted public invoice fields from actual sales columns',()=>{
 const mapped=mapCompletedSaleToCustomerInvoice(sale);
 assert.deepEqual(mapped,{id:'sale-1',status:'completed',invoice_number:'ZHN-100',issued_at:'2026-11-08T10:00:00.000Z',currency:'SAR',subtotal:100,vat_amount:13.04,total:100});
 assert.equal(mapped.customer_phone,undefined);
 assert.equal(mapped.customer_name,undefined);
 assert.equal(mapped.payment_method,undefined);
});
test('rejects drafts, voids, invalid dates, missing invoice numbers and malformed amounts',()=>{
 for(const update of [{status:'draft'},{status:'void'},{invoice_number:null},{sale_date:'bad'},{subtotal:'NaN'},{vat_amount:'-1'},{grand_total:'1.234'},{grand_total:Infinity},{id:null}]){
  assert.equal(mapCompletedSaleToCustomerInvoice({...sale,...update}),null);
 }
});
