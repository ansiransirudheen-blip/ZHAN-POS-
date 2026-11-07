import {test,expect} from '@playwright/test';

test('safe preview and sign-in form render without cloud credentials',async({page})=>{
 await page.goto('/');
 await expect(page.getByText('SAFE PREVIEW — live billing is disabled; no transactions can be saved.')).toBeVisible();
 await expect(page.getByRole('heading',{name:'Cloud connection not configured'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Save bill'})).toHaveCount(0);
});

test('browser PIN hash and local storage roundtrip',async({page})=>{
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  const {hashPin,getPin,pinKey}=await import('/src/lib/devicePin.js');
  const salt=Array.from(crypto.getRandomValues(new Uint8Array(16)));
  const hash=await hashPin('123456',salt);
  localStorage.setItem(pinKey('browser-test-user'),JSON.stringify({salt,hash}));
  const stored=getPin('browser-test-user');
  const valid=stored&&await hashPin('123456',stored.salt)===stored.hash;
  const wrong=stored&&await hashPin('654321',stored.salt)!==stored.hash;
  localStorage.removeItem(pinKey('browser-test-user'));
  return {valid,wrong,cleared:getPin('browser-test-user')===null};
 });
 expect(result).toEqual({valid:true,wrong:true,cleared:true});
});
