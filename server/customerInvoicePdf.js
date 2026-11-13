// Server-only minimal PDF response, not a deployed endpoint.
// Input MUST be the authorized, whitelisted invoice response (status 200).
// Deliberately no customer data, payment details, or unverified VAT claims.
const ascii=value=>String(value).normalize('NFKD').replace(/[^\x20-\x7e]/g,'?');
const pdfText=value=>ascii(value).replace(/[\\()]/g,'\\$&');
export function createCustomerInvoicePdf(authorized){
 if(!authorized||authorized.status!==200) return {status:404,headers:{'Cache-Control':'no-store','Content-Type':'text/plain; charset=utf-8'},body:'Invoice unavailable'};
 const b=authorized.body;
 if(!b||typeof b.invoice_number!=='string'||!b.invoice_number||b.invoice_number.length>100||
 typeof b.issued_at!=='string'||!Number.isFinite(Date.parse(b.issued_at))||b.currency!=='SAR'||
 ![b.subtotal,b.vat_amount,b.total].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0))
 return {status:404,headers:{'Cache-Control':'no-store','Content-Type':'text/plain; charset=utf-8'},body:'Invoice unavailable'};
 const lines=['ZAHN - ESSENCE OF YOU','Invoice (preview)','Invoice: '+b.invoice_number,
 'Date: '+new Date(b.issued_at).toISOString().slice(0,10),
 'Subtotal: SAR '+b.subtotal.toFixed(2),'Total: SAR '+b.total.toFixed(2),
 'Tax treatment pending compliance verification'];
 const commands=['BT','/F1 15 Tf','50 770 Td',...lines.flatMap((line,i)=>[...(i?['0 -32 Td']:[]),'('+pdfText(line)+') Tj']),'ET'].join('\n')+'\n';
 const objects=[
 '<< /Type /Catalog /Pages 2 0 R >>',
 '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
 '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
 '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
 '<< /Length '+Buffer.byteLength(commands,'ascii')+' >>\nstream\n'+commands+'endstream'
 ];
 let pdf='%PDF-1.4\n';const offsets=[0];
 for(let i=0;i<objects.length;i++){offsets.push(Buffer.byteLength(pdf,'ascii'));pdf+=(i+1)+' 0 obj\n'+objects[i]+'\nendobj\n'}
 const xref=Buffer.byteLength(pdf,'ascii');
 pdf+='xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n';
 for(const offset of offsets.slice(1))pdf+=String(offset).padStart(10,'0')+' 00000 n \n';
 pdf+='trailer\n<< /Size '+(objects.length+1)+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF\n';
 return {status:200,headers:{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="zahn-invoice-preview.pdf"','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'},body:Buffer.from(pdf,'ascii')};
}
