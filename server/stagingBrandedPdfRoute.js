// Explicit staging-only HTTP adapter. No production credentials or database writes.
// Supply a trusted invoice adapter and original logo loader from the staging server.
import {createCustomerInvoiceBrandedPdfHandler} from './customerInvoiceBrandedPdfHandler.js';
const denied=()=>({status:404,headers:{'Cache-Control':'no-store','Content-Type':'text/plain; charset=utf-8','Referrer-Policy':'no-referrer'},body:'Invoice unavailable'});
export function createStagingBrandedPdfRoute({adapter,loadOriginalLogo,stagingEnabled=false}={}){
 if(!stagingEnabled)return async()=>denied();
 if(!adapter||typeof loadOriginalLogo!=='function')throw new TypeError('Staging dependencies required');
 const handle=createCustomerInvoiceBrandedPdfHandler(adapter,loadOriginalLogo);
 return async request=>{
  if(!request||request.method!=='GET')return denied();
  const token=request.token;
  if(typeof token!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(token))return denied();
  try{return await handle({method:'GET',token,now:new Date()})}
  catch{return denied()}
 };
}
