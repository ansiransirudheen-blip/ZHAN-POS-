// Server-side message builder. Never manufacture a PDF URL from a bill number.
// Only pass an HTTPS invoice URL returned by a trusted, deployed invoice service.
export function buildCustomerInvoiceWhatsApp({phone,invoiceNumber,total,invoiceUrl}){
 if(typeof phone!=='string'||!/^[1-9]\d{7,14}$/.test(phone))throw new TypeError('International phone in E.164 digits required');
 if(typeof invoiceNumber!=='string'||!/^[-A-Za-z0-9]{1,64}$/.test(invoiceNumber))throw new TypeError('Invalid invoice number');
 if(typeof total!=='number'||!Number.isFinite(total)||total<0)throw new TypeError('Invalid total');
 let url;
 try{url=new URL(invoiceUrl)}catch{throw new TypeError('Verified invoice URL required')}
 if(url.protocol!=='https:'||!url.hostname||url.username||url.password||url.hash||url.port||url.hostname==='example.com'||url.hostname.endsWith('.example.com'))
  throw new TypeError('Published HTTPS invoice URL required');
 const message=['Thank you for shopping with ZAHN Luxury Perfumes!', 'Invoice: '+invoiceNumber,'Total: SAR '+total.toFixed(2),'View / download your invoice: '+url.href,'ZAHN — ESSENCE OF YOU'].join('\n');
 return {message,whatsappUrl:'https://wa.me/'+phone+'?text='+encodeURIComponent(message)};
}
