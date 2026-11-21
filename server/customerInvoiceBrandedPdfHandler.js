// Staging-only composition: trusted invoice adapter + original logo loader.
// Does not create a public endpoint, issue tokens, or access production.
import {createCustomerInvoiceHandler} from './customerInvoiceHandler.js';
import {createCustomerInvoiceBrandedPdf} from './customerInvoiceBrandedPdf.js';
import {createCustomerInvoicePdf} from './customerInvoicePdf.js';
export function createCustomerInvoiceBrandedPdfHandler(adapter,loadOriginalLogo){
 if(typeof loadOriginalLogo!=='function')throw new TypeError('Trusted original logo loader required');
 const lookup=createCustomerInvoiceHandler(adapter);
 return async request=>{
  if(!request||request.method!=='GET')return createCustomerInvoicePdf(null);
  try{
   const authorized=await lookup(request);
   if(authorized.status!==200)return createCustomerInvoicePdf(null);
   const originalLogo=await loadOriginalLogo();
   return createCustomerInvoiceBrandedPdf(authorized,originalLogo);
  }catch{return createCustomerInvoicePdf(null)}
 };
}
