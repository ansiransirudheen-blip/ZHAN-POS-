// Server-side original ZAHN logo validator for future PDF embedding.
// Never replace the user's supplied logo with a generated approximation.
export function validateOriginalLogoJpeg(bytes){
 if(!Buffer.isBuffer(bytes)||bytes.length<100||bytes.length>5_000_000)
  throw new TypeError('Original logo must be a bounded JPEG Buffer');
 if(bytes[0]!==0xff||bytes[1]!==0xd8||bytes.at(-2)!==0xff||bytes.at(-1)!==0xd9)
  throw new TypeError('Original logo is not a complete JPEG');
 return {mimeType:'image/jpeg',byteLength:bytes.length};
}
