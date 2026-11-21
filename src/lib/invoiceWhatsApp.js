// Share only a server-issued public invoice URL, never a guessed ID or raw database path.
// This module does not send messages automatically or create invoice access tokens.
export function normalizeSaudiWhatsApp(value){
 const digits=String(value??'').replace(/[\s()+-]/g,'');
 if(!/^\d+$/.test(digits))return null;
 if(/^05\d{8}$/.test(digits))return '966'+digits.slice(1);
 if(/^5\d{8}$/.test(digits))return '966'+digits;
 if(/^9665\d{8}$/.test(digits))return digits;
 if(/^009665\d{8}$/.test(digits))return digits.slice(2);
 return null;
}
export function createInvoiceWhatsAppLink({phone,invoiceNumber,total,invoiceUrl}){
 const recipient=normalizeSaudiWhatsApp(phone);
 if(!recipient)throw new Error('Enter a valid Saudi mobile number.');
 if(!/^ZHN-[A-Za-z0-9-]{1,40}$/.test(String(invoiceNumber??'')))throw new Error('Invoice number is not valid.');
 if(typeof total!=='number'||!Number.isFinite(total)||total<0)throw new Error('Invoice amount is invalid.');
 let url;
 try{url=new URL(invoiceUrl)}catch{throw new Error('Secure invoice link is not available.')}
 if(url.protocol!=='https:'||url.username||url.password||url.hash||!url.hostname||url.hostname==='localhost')throw new Error('Secure invoice link is not available.');
 // Never trust a URL received from the browser as proof of invoice authorization.
 // Backend must issue an opaque, expiring, scoped link before this helper is used.
 const message=['ZAHN Luxury Perfumes','Thank you for shopping with us!','Invoice: '+invoiceNumber,'Amount: SAR '+total.toFixed(2),'View your invoice: '+url.href,'Essence of You'].join('\n');
 return 'https://wa.me/'+recipient+'?text='+encodeURIComponent(message);
}
