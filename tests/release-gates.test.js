import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Static release-gate checks. These are not substitutes for database/restore tests.
const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
const purchases=readFileSync(new URL('../src/components/Purchases.jsx',import.meta.url),'utf8');

test('live billing remains explicitly disabled regardless of deploy environment',()=>{
  assert.match(app,/const liveEnabled\s*=\s*false\s*;/);
  assert.doesNotMatch(app,/const liveEnabled\s*=\s*import\.meta\.env/);
});
test('billing action cannot proceed without live release gate',()=>{
  assert.match(app,/if\s*\(\s*!liveEnabled\s*\|\|/);
  assert.match(app,/disabled=\{!liveEnabled\s*\|\|/);
});
test('billing preview does not claim VAT-inclusive or 15% tax',()=>{
  assert.doesNotMatch(app,/VAT-inclusive total:/);
  assert.doesNotMatch(app,/VAT 15%:/);
  assert.match(app,/Tax Registration|Tax registration|tax status unverified|Tax treatment unverified/i);
});
test('purchase posting stays guarded behind a separate release flag',()=>{
  assert.match(purchases,/VITE_ENABLE_LIVE_PURCHASES/);
});
