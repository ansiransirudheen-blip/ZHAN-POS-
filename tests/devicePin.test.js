import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {isPin,hashPin,getPin,pinKey} from '../src/lib/devicePin.js';
globalThis.crypto=webcrypto;
test('only six ASCII digits are accepted',()=>{
 for(const p of ['000000','123456','999999'])assert.equal(isPin(p),true);
 for(const p of ['12345','1234567','abcdef','12a456','１２３４５６',''])assert.equal(isPin(p),false);
});
test('same PIN and salt derive stable hash; different PIN does not',async()=>{
 const salt=Array.from({length:16},(_,i)=>i);
 const first=await hashPin('123456',salt);
 assert.match(first,/^[a-f0-9]{64}$/);
 assert.equal(await hashPin('123456',salt),first);
 assert.notEqual(await hashPin('123457',salt),first);
 await assert.rejects(hashPin('12345',salt));
});
test('malformed or missing browser record is rejected',()=>{
 const store={getItem:()=>'{bad'};
 assert.equal(getPin('user',store),null);
 const salt=Array(16).fill(0),hash='a'.repeat(64);
 assert.deepEqual(getPin('user',{getItem:()=>JSON.stringify({salt,hash})}),{salt,hash});
 assert.equal(getPin('user',{getItem:()=>JSON.stringify({salt:[-1,...salt.slice(1)],hash})}),null);
 assert.equal(pinKey('user'),'zahn-quick-pin:user');
});
