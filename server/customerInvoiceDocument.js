// Server-only print-ready invoice document. No live route, storage or PDF service.
// Accept ONLY the whitelisted result of the authorized customer invoice policy.
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Number(n).toFixed(2);
export function renderCustomerInvoiceDocument(invoice){
 if(!invoice||typeof invoice!=='object')throw new TypeError('Authorized invoice required');
 const {invoice_number,issued_at,currency,subtotal,vat_amount,total}=invoice;
 if(typeof invoice_number!=='string'||!invoice_number||invoice_number.length>100||
 typeof issued_at!=='string'||!Number.isFinite(Date.parse(issued_at))||currency!=='SAR'||
 ![subtotal,vat_amount,total].every(v=>typeof v==='number'&&Number.isFinite(v)&&v>=0))
 throw new TypeError('Invalid authorized invoice');
 const date=new Date(issued_at).toISOString().slice(0,10);
 // No VAT/tax-invoice claim until compliance review. No customer phone or staff data.
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>ZAHN Invoice</title><style>body{font:16px system-ui,sans-serif;max-width:640px;margin:32px auto;padding:20px;color:#24211b}header{text-align:center;border-bottom:2px solid #b99550;padding-bottom:20px}h1{letter-spacing:.16em}table{width:100%;border-collapse:collapse;margin-top:24px}td{padding:12px 4px;border-bottom:1px solid #ddd}td:last-child{text-align:right}footer{margin-top:30px;font-size:12px;color:#555}.print{margin:24px 0;padding:12px 18px}@media print{.print{display:none}body{margin:0}}</style></head><body><header><img src="/zahn-original-logo.jpg" alt="ZAHN — ESSENCE OF YOU" width="200" style="max-width:75%;height:auto"><h2>Invoice</h2></header><p><strong>Invoice:</strong> ${escapeHtml(invoice_number)}</p><p><strong>Date:</strong> ${date}</p><table><tbody><tr><td>Subtotal</td><td>SAR ${money(subtotal)}</td></tr><tr><td>Recorded VAT amount (unverified)</td><td>SAR ${money(vat_amount)}</td></tr><tr><td><strong>Total</strong></td><td><strong>SAR ${money(total)}</strong></td></tr></tbody></table><footer>Invoice preview. Tax treatment and final invoice compliance are pending verification.</footer><button class="print" onclick="window.print()">Print / Save PDF</button></body></html>`;
}
export function customerInvoiceDocumentResponse(authorizedResponse){
 if(!authorizedResponse||authorizedResponse.status!==200)return {status:404,headers:{'Cache-Control':'no-store','Content-Type':'text/plain; charset=utf-8'},body:'Invoice unavailable'};
 return {status:200,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"},body:renderCustomerInvoiceDocument(authorizedResponse.body)};
}
