import test from 'node:test';
import assert from 'node:assert/strict';
import {createStagingSupabaseInvoiceAdapter} from '../server/stagingSupabaseInvoiceAdapter.js';

test('staging adapter reads token from private repository, not Supabase Data API',async()=>{
 const calls=[];
 const tokenHash='a'.repeat(64);
 const salesClient={from(table){
  calls.push(['from',table]);
  assert.equal(table,'sales');
  return {select(cols){calls.push(['select',cols]);return {eq(col,id){
   calls.push(['eq',col,id]);return {async maybeSingle(){return {data:{id:'s1',status:'completed',invoice_number:'ZHN-1',sale_date:'2026-11-08T00:00:00Z',subtotal:'10',vat_amount:'1.3',grand_total:'10',customer_phone:'secret'},error:null}}};
  }}};
 }};
 const adapter=createStagingSupabaseInvoiceAdapter({
  salesClient,
  privateTokenRepository:{async findTokenByHash(hash,cols){
   calls.push(['private',hash,cols]);return {token_hash:hash,invoice_id:'s1',expires_at:'2030-01-01T00:00:00Z',revoked_at:null,secret:'hidden'};
  }}
 });
 const token=await adapter.lookupTokenByHash(tokenHash);
 const sale=await adapter.lookupInvoiceById('s1');
 assert.equal(token.secret,undefined);
 assert.equal(sale.customer_phone,undefined);
 assert.equal(calls[0][0],'private');
 assert.deepEqual(calls[1],['from','sales']);
});
test('staging adapter requires trusted dependencies',()=>{
 assert.throws(()=>createStagingSupabaseInvoiceAdapter(),/Trusted server-only/);
});
