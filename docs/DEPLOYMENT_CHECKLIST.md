# ZAHN POS — safe deployment checklist

## Build validation
1. Open GitHub Actions and confirm **Build check** succeeded for the latest `main` commit.
2. If it fails, inspect the failing job log and fix the source before deployment.
3. Build runs without Supabase credentials; this verifies compilation, not login or database operations.

## Netlify staging deployment
1. Import the GitHub repository into Netlify, with `npm run build` and publish directory `dist` (also configured in `netlify.toml`).
2. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` using the project's URL and **publishable** key only. Never use a secret/service-role key in `VITE_` variables.
3. Explicitly set `VITE_ENABLE_LIVE_BILLING=false` and `VITE_ENABLE_LIVE_PURCHASES=false`.
4. Deploy to a test URL and verify mobile/tablet and laptop layouts, sign-in, staff permissions, read-only products and reports, and logout.
5. Check Supabase Auth redirect/allowed URLs for the staging domain as needed.

## Before production transactions
- Verify stock and sales RPCs in a separate non-production test environment.
- Confirm idempotent retry behavior, role/RLS permissions, and negative-stock protections.
- Confirm invoice layout and Saudi ZATCA e-invoicing requirements with a qualified provider before using receipts as tax invoices.
- Obtain explicit approval before enabling live billing or purchases or changing the production database.

**Status:** Configuration and CI workflow committed; successful build, deployed website, and live operations are **not yet verified**.
