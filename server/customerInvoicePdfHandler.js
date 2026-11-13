// Server-only composition; not wired to any public route or database.
import {createCustomerInvoiceHandler} from './customerInvoiceHandler.js';
import {createCustomerInvoicePdf} from './customerInvoicePdf.js';
export function createCustomerInvoicePdfHandler(adapter){
 const lookup=createCustomerInvoiceHandler(adapter);
 return async request=>{
  if(!request||request.method!=='GET')return createCustomerInvoicePdf(null);
  try{return createCustomerInvoicePdf(await lookup(request))}
  catch{return createCustomerInvoicePdf(null)}
 };
}
