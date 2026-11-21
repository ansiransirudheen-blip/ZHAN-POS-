# Isolated staging readiness — ZAHN customer invoice (NOT LIVE)

## Current verified state
- GitHub Build #90 passed for commit b2c573da.
- Production public.sales uses status draft/completed/void, sale_date, grand_total and vat_amount.
- Production public.sales and public.sale_items have RLS enabled.
- Development code contains token hashing, fail-closed invoice handler, sales mapper and injected read adapter.
- **No isolated staging database, token table, real token issuance endpoint or customer API exists.**

## Required preflight before any production database change
- [ ] Export full production Postgres backup including schema, functions, RLS, grants and data, not just JSON/CSV.
- [ ] Compute and record SHA-256 checksum, backup location and UTC timestamp.
- [ ] Restore into a separate isolated staging database and verify tables, functions, row counts, grants and RLS.
- [ ] Ensure staging credentials, project URL and keys are never committed or shipped in Vite/browser bundles.
- [ ] Confirm VAT registration and legally required invoice labels, and review existing 15% VAT computation.
- [ ] Approve a reviewed staging-only migration for a private token table and its least-privilege access.
- [ ] Test expired, revoked, guessed, cross-invoice and malformed tokens; enforce rate limits and no-store headers.
- [ ] Verify only completed, authorized sales can receive tokens, with rollback/idempotency and staff audit.
- [ ] Complete secure public customer invoice page and WhatsApp prefill with staff-tap-to-send.
- [ ] Obtain explicit release approval before any production changes.

## Staging integration sequence
1. Inspect backup and restoration evidence (no production writes).
2. Create a separate staging project/database after approval; restore and verify there.
3. Implement private-schema token storage with no anonymous grants; keep it out of Supabase Data API.
4. Implement server-side authenticated token issuance and revocation only after committed billing.
5. Implement rate-limited public read endpoint with generic denial and allowlisted response.
6. Run staging end-to-end tests and security review; no real customer messages.
7. Review tax compliance, production rollback plan and obtain explicit release approval.

## Do not do yet
Do not run migrations, enable live billing/purchases, publish service keys, send WhatsApp messages, or point the staging adapter at the production project.
