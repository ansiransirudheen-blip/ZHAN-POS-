import test from 'node:test';
import assert from 'node:assert/strict';
import {createStagingSupabaseInvoiceAdapter} from '../server/stagingSupabaseInvoiceAdapter.js';

test('staging adapter reads tokens privately and sales with selected fields',async()=>{
 const calls=[];
 const tokenHash='a'.repeat(64);
 const salesClient={
  from(table){
   calls.push(['from',table]);
   return {
    select(columns){
     calls.push(['select',columns]);
     return {
      eq(column,value){
       calls.push(['eq',column,value]);
       return {
        async maybeSingle(){
         return {data:{
          id:'s1',status:'completed',invoice_number:'ZHN-1',
          sale_date:'2026-11-08T00:00:00Z',subtotal:'10',
          vat_amount:'1.3',grand_total:'10',customer_phone:'secret'
         },error:null};
        }
       };
      }
     };
    }
   };
  }
 };
 const adapter=createStagingSupabaseInvoiceAdapter({
  salesClient,
  privateTokenRepository:{
   async findTokenByHash(hash,columns){
    calls.push(['private',hash,columns]);
    return {token_hash:hash,invoice_id:'s1',expires_at:'2030-01-01T00:00:00Z',revoked_at:null,secret:'hidden'};
   }
  }
 });
 const token=await adapter.lookupTokenByHash(tokenHash);
 const sale=await adapter.lookupInvoiceById('s1');
 assert.equal(token.secret,undefined);
 assert.equal(sale.customer_phone,undefined);
 assert.deepEqual(calls[0][0],'private');
 assert.deepEqual(calls[1],['from','sales']);
});
test('staging adapter requires trusted dependencies',()=>{
 assert.throws(()=>createStagingSupabaseInvoiceAdapter(),/Trusted server-only/);
});
