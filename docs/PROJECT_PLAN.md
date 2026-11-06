# ZAHN Luxury Perfumes POS — Fresh Start

## Decision
Start a new POS without importing legacy sales, stock, customer or purchase records. Reuse useful interface ideas from the old React/HTML source, but do not use its localStorage data as the new database.

## Planned stack
- React + Vite, responsive Android tablet and laptop interface
- Supabase Auth and existing secured RPCs for billing and purchases
- Netlify staging, then production after testing

## Modules
Billing and VAT-inclusive receipt printing; products and inventory; supplier purchases; customers; expenses; reports; staff permissions.

## Safety
Do not delete or reset the existing Supabase project, tables, functions or auth users. No live data import. Do not publish credentials or customer data. Deploy staging first and test before live billing.

## Build milestones
1. Create React app and responsive navigation.
2. Configure environment placeholders and Supabase client.
3. Connect authenticated product reads and billing/purchase RPCs.
4. Add receipts, reporting, and staff controls.
5. Validate on tablet/laptop and deploy staging.
