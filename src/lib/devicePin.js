// Device-local convenience lock only. Supabase Auth and RLS remain the security boundary.
export const pinKey=id=>'zahn-quick-pin:'+id;
export const isPin=p=>/^\d{6}$/.test(p);
export async function hashPin(pin,salt){
 if(!isPin(pin)||!Array.isArray(salt)||salt.length!==16||!salt.every(x=>Number.isInteger(x)&&x>=0&&x<=255))throw Error('Invalid PIN or salt');
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new Uint8Array(salt),iterations:310000,hash:'SHA-256'},key,256);
 return Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('');
}
export function getPin(id,storage=localStorage){
 try{
  const x=JSON.parse(storage.getItem(pinKey(id))||'null');
  return Array.isArray(x?.salt)&&x.salt.length===16&&x.salt.every(n=>Number.isInteger(n)&&n>=0&&n<=255)&&typeof x.hash==='string'&&/^[a-f0-9]{64}$/.test(x.hash)?x:null;
 }catch{return null}
}
