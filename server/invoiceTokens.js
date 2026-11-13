// SERVER ONLY. Never import into Vite/client code.
// Building blocks for a future approved customer-invoice API; no DB writes or endpoints here.
import {createHash, randomBytes, timingSafeEqual} from 'node:crypto';

const TOKEN_BYTES=32;
const TOKEN_PATTERN=/^[A-Za-z0-9_-]{43}$/;

export function issueInvoiceToken(){
 return randomBytes(TOKEN_BYTES).toString('base64url');
}

export function hashInvoiceToken(token){
 if(typeof token!=='string'||!TOKEN_PATTERN.test(token)) throw new TypeError('Invalid invoice token');
 return createHash('sha256').update(token,'utf8').digest('hex');
}

export function verifyInvoiceToken(token,record,now=new Date()){
 if(typeof token!=='string'||!TOKEN_PATTERN.test(token)||!record) return false;
 if(typeof record.token_hash!=='string'||!/^[0-9a-f]{64}$/.test(record.token_hash)) return false;
 if(record.revoked_at||!record.expires_at||!record.invoice_id) return false;
 const expiry=new Date(record.expires_at);
 if(!Number.isFinite(expiry.getTime())||expiry.getTime()<=now.getTime()) return false;
 const supplied=Buffer.from(hashInvoiceToken(token),'hex');
 const stored=Buffer.from(record.token_hash,'hex');
 return timingSafeEqual(supplied,stored);
}
