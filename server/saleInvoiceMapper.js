// Server-only mapping of existing public.sales rows into a minimal invoice
// view. Does not connect to Supabase or expose an endpoint.
const money=(value)=>{
 if(typeof value!=='number'&&typeof value!=='string') return null;
 if(typeof value==='string'&&!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(value)) return null;
 const n=Number(value);
 return Number.isSafeInteger(Math.round(n*100))&&n>=0&&Math.abs(n*100-Math.round(n*100))<1e-7?n:null;
};
export function mapCompletedSaleToCustomerInvoice(sale){
 if(!sale||sale.status!=='completed'||typeof sale.id!=='string'||!sale.id||
 typeof sale.invoice_number!=='string'||!sale.invoice_number.trim()) return null;
 const issuedAt=new Date(sale.sale_date);
 if(!sale.sale_date||!Number.isFinite(issuedAt.getTime())) return null;
 const subtotal=money(sale.subtotal),vat=money(sale.vat_amount),total=money(sale.grand_total);
 if([subtotal,vat,total].some(x=>x===null)) return null;
 // Validate taxable totals in a separate compliance gate before live release.
 return {id:sale.id,status:'completed',invoice_number:sale.invoice_number,
  issued_at:issuedAt.toISOString(),currency:'SAR',subtotal,vat_amount:vat,total};
}
