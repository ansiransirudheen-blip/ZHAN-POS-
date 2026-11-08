// Server-only request handler factory; no deployment, credentials or DB access.
// Adapter must implement lookupTokenByHash(hash) and lookupInvoiceById(id)
// using a trusted server connection with narrowly scoped permissions.
import {hashInvoiceToken} from './invoiceTokens.js';
import {resolveCustomerInvoice,INVOICE_RESPONSE_HEADERS} from './customerInvoicePolicy.js';

const unavailable=()=>({status:404,headers:INVOICE_RESPONSE_HEADERS,body:{error:'Invoice unavailable'}});
export function createCustomerInvoiceHandler(adapter){
 if(!adapter||typeof adapter.lookupTokenByHash!=='function'||typeof adapter.lookupInvoiceById!=='function')
  throw new TypeError('Trusted server adapter required');
 return async function handleCustomerInvoice(request){
  if(!request||request.method!=='GET') return unavailable();
  const token=request.token;
  let hash;
  try{hash=hashInvoiceToken(token)}catch{return unavailable()}
  try{
   const tokenRecord=await adapter.lookupTokenByHash(hash);
   if(!tokenRecord||!tokenRecord.invoice_id) return unavailable();
   const invoice=await adapter.lookupInvoiceById(tokenRecord.invoice_id);
   return resolveCustomerInvoice({token,tokenRecord,invoice,now:request.now||new Date()});
  }catch{
   // Do not leak internal DB errors or distinguish missing/invalid links.
   return unavailable();
  }
 };
}
