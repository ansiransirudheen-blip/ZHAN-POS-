// Server-only, NON-DEPLOYED staging adapter.
// Supabase Data API should NOT expose the private token schema.
// Token lookup is injected from a separate trusted, parameterized Postgres
// repository with least-privilege private-schema access.
// Sales lookup uses an injected server-only Supabase client; no credentials here.
import {createInvoiceReadAdapter} from './invoiceReadAdapter.js';

export function createStagingSupabaseInvoiceAdapter({salesClient,privateTokenRepository}={}){
 if(!salesClient||typeof salesClient.from!=='function'||
    !privateTokenRepository||typeof privateTokenRepository.findTokenByHash!=='function')
  throw new TypeError('Trusted server-only repositories required');
 return createInvoiceReadAdapter({
  async findTokenByHash(hash,columns){
   return privateTokenRepository.findTokenByHash(hash,columns);
  },
  async findSaleById(id,columns){
   const {data,error}=await salesClient.from('sales').select(columns).eq('id',id).maybeSingle();
   if(error) throw new Error('Sale lookup failed');
   return data;
  }
 });
}
