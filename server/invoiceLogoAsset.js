// Server-only JPEG parser for the user's exact original ZAHN asset.
// Supports baseline 8-bit RGB JPEGs; rejects unsupported encoding rather than altering logo.
export function parseOriginalLogoJpeg(bytes){
 if(!Buffer.isBuffer(bytes)||bytes.length<100||bytes.length>5_000_000||
 bytes[0]!==0xff||bytes[1]!==0xd8||bytes.at(-2)!==0xff||bytes.at(-1)!==0xd9)
 throw new TypeError('Original logo must be a complete bounded JPEG Buffer');
 let offset=2,frame=null;
 while(offset<bytes.length-2){
  if(bytes[offset++]!==0xff)throw new TypeError('Invalid JPEG marker');
  while(bytes[offset]===0xff)offset++;
  const marker=bytes[offset++];
  if(marker===0xda)break;
  if(marker===0xd9)break;
  if(marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;
  if(offset+2>bytes.length)throw new TypeError('Truncated JPEG segment');
  const length=bytes.readUInt16BE(offset);
  if(length<2||offset+length>bytes.length)throw new TypeError('Invalid JPEG segment');
  if(marker===0xc0){
   if(length<8)throw new TypeError('Invalid JPEG frame');
   const bits=bytes[offset+2],height=bytes.readUInt16BE(offset+3),
   width=bytes.readUInt16BE(offset+5),components=bytes[offset+7];
   if(bits!==8||!width||!height||components!==3)throw new TypeError('Only 8-bit RGB baseline JPEG supported');
   frame={width,height,components};
  }else if(marker>=0xc1&&marker<=0xcf&&marker!==0xc4&&marker!==0xc8&&marker!==0xcc){
   throw new TypeError('Unsupported JPEG encoding');
  }
  offset+=length;
 }
 if(!frame)throw new TypeError('Missing baseline JPEG frame');
 return {mimeType:'image/jpeg',byteLength:bytes.length,...frame};
}
export function validateOriginalLogoJpeg(bytes){
 const parsed=parseOriginalLogoJpeg(bytes);
 return {mimeType:parsed.mimeType,byteLength:parsed.byteLength};
}
