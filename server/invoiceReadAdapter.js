// Server-only adapter interface for a future isolated staging database.
// The supplied repository MUST use parameterized queries and server credentials.
// No Supabase client, credentials, connection, SQL writes, or live endpoint here.
const TOKEN_COLUMNS='token_hash, invoice_id, expires_at, revoked_at';
const SALE_COLUMNS='id, status, invoice_number, sale_date, subtotal, vat_amount, grand_total';

export function createInvoiceReadAdapter(repository){
 if(!repository||typeof repository.findTokenByHash!=='function'||typeof repository.findSaleById!=='function')
  throw new TypeError('Trusted read-only repository required');
 return Object.freeze({
  async lookupTokenByHash(hash){
   if(typeof hash!=='string'||!/^[0-9a-f]{64}$/.test(hash)) return null;
   const record=await repository.findTokenByHash(hash,TOKEN_COLUMNS);
   if(!record||record.token_hash!==hash) return null;
   return {token_hash:record.token_hash,invoice_id:record.invoice_id,
    expires_at:record.expires_at,revoked_at:record.revoked_at};
  },
  async lookupInvoiceById(invoiceId){
   if(typeof invoiceId!=='string'||!invoiceId) return null;
   const sale=await repository.findSaleById(invoiceId,SALE_COLUMNS);
   if(!sale||sale.id!==invoiceId) return null;
   return {id:sale.id,status:sale.status,invoice_number:sale.invoice_number,
    sale_date:sale.sale_date,subtotal:sale.subtotal,
    vat_amount:sale.vat_amount,grand_total:sale.grand_total};
  }
 });
}
