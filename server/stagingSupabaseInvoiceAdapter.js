// Server-only Supabase query adapter for a FUTURE ISOLATED STAGING DATABASE.
// No connection is created here; do not import into Vite, use browser keys,
// or pass a production client. Private token table does not exist yet.
// Inject an already authenticated, server-only, least-privilege client.
import {createInvoiceReadAdapter} from './invoiceReadAdapter.js';

export function createStagingSupabaseInvoiceAdapter({client,tokenTable='invoice_access_tokens'}={}){
 if(!client||typeof client.schema!=='function'||typeof client.from!=='function')
  throw new TypeError('Server-only Supabase client required');
 if(tokenTable!=='invoice_access_tokens') throw new TypeError('Unexpected token table');
 return createInvoiceReadAdapter({
  async findTokenByHash(hash,columns){
   const {data,error}=await client.schema('private').from(tokenTable).select(columns).eq('token_hash',hash).maybeSingle();
   if(error) throw new Error('Private token lookup failed');
   return data;
  },
  async findSaleById(id,columns){
   const {data,error}=await client.from('sales').select(columns).eq('id',id).maybeSingle();
   if(error) throw new Error('Sale lookup failed');
   return data;
  }
 });
}
