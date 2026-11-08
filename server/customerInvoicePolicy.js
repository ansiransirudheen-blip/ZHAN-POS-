// Server-only customer invoice response policy. NOT an HTTP endpoint.
// Call only after a trusted server has fetched a token record and the invoice
// associated with that record. Never accept invoice IDs from a public request.
import {verifyInvoiceToken} from './invoiceTokens.js';

export const INVOICE_RESPONSE_HEADERS=Object.freeze({
 'Cache-Control':'no-store',
 'Referrer-Policy':'no-referrer',
 'X-Content-Type-Options':'nosniff',
 'Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"
});

export function resolveCustomerInvoice({token,tokenRecord,invoice,now=new Date()}){
 const denied={status:404,headers:INVOICE_RESPONSE_HEADERS,body:{error:'Invoice unavailable'}};
 if(!verifyInvoiceToken(token,tokenRecord,now)) return denied;
 if(!invoice||invoice.id!==tokenRecord.invoice_id||invoice.status!=='completed') return denied;
 // Explicit public field allowlist: never return customer phone, staff, cost,
 // internal notes, payment metadata, or any extra database fields.
 const {invoice_number,issued_at,currency,subtotal,vat_amount,total}=invoice;
 if(typeof invoice_number!=='string'||!invoice_number||
    typeof issued_at!=='string'||currency!=='SAR'||
    ![subtotal,vat_amount,total].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0)) return denied;
 return {status:200,headers:INVOICE_RESPONSE_HEADERS,body:{
  invoice_number,issued_at,currency,subtotal,vat_amount,total
 }};
}
