# Customer invoice token storage — DESIGN ONLY / NOT DEPLOYED

**Status:** Proposal for review. This file is not a migration. No database changes, grants, RLS policies, endpoints, or live billing have been enabled.

## Proposed private data model

Keep a dedicated token table in a **non-exposed private schema** (name and migration to be finalized only after reviewing the actual production schema and a successful isolated restore):

| Column | Purpose |
| --- | --- |
| id | Internal UUID primary key |
| invoice_id | Foreign key to the committed invoice, subject to schema verification |
| token_hash | Unique SHA-256 digest of a server-generated 256-bit bearer token |
| created_at | Server timestamp |
| expires_at | Mandatory short-lived expiry |
| revoked_at | Nullable timestamp; non-null blocks access |
| issued_by | Authenticated staff audit reference |
| last_accessed_at | Optional server-only audit timestamp; no plaintext token |

Do not store the raw token, phone number, or customer name in this table. Never log raw tokens. Store a token hash only. Unique index on token_hash, index on invoice_id, and constraints for valid expiry/revocation are required. Determine exact expiry/retention after privacy review.

## Access boundaries

- **No anon or authenticated table grants**; never add anonymous SELECT on sales, customer or line item tables.
- Server-only API performs rate limiting, token hashing, lookup, expiration/revocation check, invoice-ID equality and committed-status check. Return a strict public field allowlist; never use SELECT * for customer responses.
- Issuance/revocation require authenticated authorized staff, validated server-side. Issue only **after** an atomic, successful bill commit. Retry/idempotency and rollback must not create orphaned links.
- Service credentials never reach Vite bundles or browser. Avoid SECURITY DEFINER in exposed public schema. Audit all grants and RLS after a reviewed migration.
- HTTP responses: HTTPS, Cache-Control: no-store, Referrer-Policy: no-referrer, anti-framing, no third-party scripts, generic 404 for invalid/expired/revoked/cross-invoice tokens.
- URL is a bearer secret and can be forwarded by the recipient. Reissue must revoke the old token. Do not claim end-to-end access control beyond possession of link.

## Release blockers and verification

1. Confirm actual invoice table/columns and authorization model without writing data.
2. Full production backup + SHA256 checksum + restore to isolated database + test recovery.
3. VAT registration and tax invoice labeling review; current billing RPC always calculates 15% VAT.
4. Prepare a separately reviewed migration and test it in isolated staging, including no anonymous table access, token collision, expiry, revocation, cross-invoice isolation, audit and retention.
5. Implement authenticated issuance, rate-limited read-only endpoint and customer UI; verify integration and rollback.
6. Explicit production release approval. Until then: **do not execute SQL against production, deploy a customer API, enable live billing/purchases, or send customer messages**.

Existing `server/invoiceTokens.js`, `server/customerInvoicePolicy.js`, and `server/customerInvoiceHandler.js` are server-only primitives and are **not** wired to any database or deployed API.
