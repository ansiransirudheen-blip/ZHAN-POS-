// Server-only composition. No HTTP route, database credentials or deployment.
// The trusted adapter looks up the hashed token and completed sale.
import {createCustomerInvoiceHandler} from './customerInvoiceHandler.js';
import {customerInvoiceDocumentResponse} from './customerInvoiceDocument.js';
const denied=()=>customerInvoiceDocumentResponse({status:404});
export function createCustomerInvoiceDocumentHandler(adapter){
 const lookup=createCustomerInvoiceHandler(adapter);
 return async function handleDocument(request){
  if(!request||request.method!=='GET')return denied();
  try{
   const authorized=await lookup(request);
   return customerInvoiceDocumentResponse(authorized);
  }catch{return denied()}
 };
}
