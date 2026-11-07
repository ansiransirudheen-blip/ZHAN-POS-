import {test,expect} from '@playwright/test';

test('safe preview and sign-in form render without cloud credentials',async({page})=>{
 await page.goto('/');
 await expect(page.getByText('SAFE PREVIEW — live billing is disabled; no transactions can be saved.')).toBeVisible();
 await expect(page.getByRole('heading',{name:'Cloud connection not configured'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Save bill'})).toHaveCount(0);
});
