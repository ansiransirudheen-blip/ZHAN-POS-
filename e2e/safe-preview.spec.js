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

test('sample invoice preview prints without saving a bill',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Preview sample receipt (no sale saved)'}).click();
 await expect(page.getByText('SAMPLE INVOICE — NOT A SALE')).toBeVisible();
 await expect(page.getByText('DEMO ONLY — NOT A VALID INVOICE. No VAT charged. No sale or payment was recorded.')).toBeVisible();
 await expect(page.getByRole('heading',{name:'Total: SAR 115.00',exact:true})).toBeVisible();
 await page.evaluate(()=>{window.__printCalled=false;window.print=()=>{window.__printCalled=true}});
 await page.getByRole('button',{name:'Print receipt'}).click();
 expect(await page.evaluate(()=>window.__printCalled)).toBe(true);
 await page.getByRole('button',{name:'New bill'}).click();
 await expect(page.getByText('SAMPLE INVOICE — NOT A SALE')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Save bill'})).toHaveCount(0);
});

test('iPhone-sized viewport has accessible navigation and no horizontal overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await expect(page.getByRole('button',{name:'Settings'})).toBeVisible();
 const metrics=await page.evaluate(()=>({
  viewport:document.documentElement.clientWidth,
  content:document.documentElement.scrollWidth,
  navigationButtons:[...document.querySelectorAll('nav button')].every(b=>{const r=b.getBoundingClientRect();return r.width>=44&&r.left>=0&&r.right<=innerWidth})
 }));
 expect(metrics.content).toBeLessThanOrEqual(metrics.viewport);
 expect(metrics.navigationButtons).toBe(true);
 await page.getByRole('button',{name:'Preview sample receipt (no sale saved)'}).click();
 await expect(page.getByText('SAMPLE INVOICE — NOT A SALE')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('Samsung tablet-sized viewport shows preview and print controls without overflow',async({page})=>{
 await page.setViewportSize({width:800,height:1280});
 await page.goto('/');
 await expect(page.getByRole('button',{name:'Settings'})).toBeVisible();
 await page.getByRole('button',{name:'Preview sample receipt (no sale saved)'}).click();
 await expect(page.getByRole('heading',{name:'Total: SAR 115.00',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Print receipt'})).toBeVisible();
 const metrics=await page.evaluate(()=>({
  viewport:document.documentElement.clientWidth,
  content:document.documentElement.scrollWidth,
  printButton:(()=>{const r=document.querySelector('.receipt-actions button')?.getBoundingClientRect();return !!r&&r.width>=44&&r.left>=0&&r.right<=innerWidth})()
 }));
 expect(metrics.content).toBeLessThanOrEqual(metrics.viewport);
 expect(metrics.printButton).toBe(true);
});

test('tablet landscape does not horizontally overflow with receipt open',async({page})=>{
 await page.setViewportSize({width:1280,height:800});
 await page.goto('/');
 await page.getByRole('button',{name:'Preview sample receipt (no sale saved)'}).click();
 await expect(page.getByText('SAMPLE INVOICE — NOT A SALE')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(1280);
});
