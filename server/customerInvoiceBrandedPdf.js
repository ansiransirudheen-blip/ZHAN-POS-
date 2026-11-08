// Server-only branded PDF: embeds the exact original JPEG bytes.
// No public endpoint or production data access.
import {parseOriginalLogoJpeg} from './invoiceLogoAsset.js';
import {createCustomerInvoicePdf} from './customerInvoicePdf.js';
const safe=s=>String(s).normalize('NFKD').replace(/[^\x20-\x7e]/g,'?').replace(/[\\()]/g,'\\$&');
export function createCustomerInvoiceBrandedPdf(authorized,logoJpeg){
 const check=createCustomerInvoicePdf(authorized);
 if(check.status!==200)return check;
 const {width,height}=parseOriginalLogoJpeg(logoJpeg);
 const b=authorized.body;
 const scale=Math.min(200/width,100/height),w=(width*scale).toFixed(2),h=(height*scale).toFixed(2);
 const lines=['Invoice (preview)','Invoice: '+b.invoice_number,'Date: '+new Date(b.issued_at).toISOString().slice(0,10),'Subtotal: SAR '+b.subtotal.toFixed(2),'Total: SAR '+b.total.toFixed(2),'Tax treatment pending compliance verification'];
 const commands=['q',w+' 0 0 '+h+' 50 700 cm','/Logo Do','Q','BT','/F1 14 Tf','50 660 Td',...lines.flatMap((line,i)=>[...(i?['0 -32 Td']:[]),'('+safe(line)+') Tj']),'ET'].join('\n')+'\n';
 const parts=[Buffer.from('%PDF-1.4\n','ascii')],offsets=[0];
 const size=()=>parts.reduce((n,p)=>n+p.length,0);
 const addObject=(id,body)=>{
  offsets.push(size());parts.push(Buffer.from(id+' 0 obj\n','ascii'));
  parts.push(body);parts.push(Buffer.from('\nendobj\n','ascii'));
 };
 addObject(1,Buffer.from('<< /Type /Catalog /Pages 2 0 R >>','ascii'));
 addObject(2,Buffer.from('<< /Type /Pages /Kids [3 0 R] /Count 1 >>','ascii'));
 addObject(3,Buffer.from('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> /XObject << /Logo 6 0 R >> >> /Contents 5 0 R >>','ascii'));
 addObject(4,Buffer.from('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>','ascii'));
 addObject(5,Buffer.from('<< /Length '+Buffer.byteLength(commands,'ascii')+' >>\nstream\n'+commands+'endstream','ascii'));
 addObject(6,Buffer.concat([Buffer.from('<< /Type /XObject /Subtype /Image /Width '+width+' /Height '+height+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+logoJpeg.length+' >>\nstream\n','ascii'),logoJpeg,Buffer.from('\nendstream','ascii')]));
 const xref=size();parts.push(Buffer.from('xref\n0 7\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF\n','ascii'));
 return {...check,body:Buffer.concat(parts)};
}
