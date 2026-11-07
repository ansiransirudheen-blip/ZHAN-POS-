# ZAHN POS — isolated restore drill (NOT YET RUN)

## Purpose
Demonstrate that a full database export can be restored **without ever writing to production**. Run on a trusted computer/server, not a browser. This procedure is not a one-click restore tool.

## Prerequisites
1. Completed backup directory containing `roles.sql`, `schema.sql`, `data.sql`, `SHA256SUMS`.
2. Verify files with `bash scripts/verify-backup.sh /path/to/backup`.
3. Separate, disposable **self-hosted Supabase test instance** provisioned according to official docs, with its own credentials and no production users or integrations. Never reuse production connection string.
4. Supabase CLI, Docker and `psql` installed. Check current CLI help and official restore guide.
5. Ensure test instance has compatible Postgres version and required extensions.

## Manual procedure
- Confirm the destination hostname and project identifier in writing; a second operator should verify it is not production.
- Use a test-only destination connection string in a private terminal environment; do not put credentials in repository, browser, logs, screenshots or chat.
- Follow Supabase's documented restore order (roles, schema, then data), with `psql --single-transaction --set ON_ERROR_STOP=1`, and any required session replication settings according to the current official guide.
- Do **not** blindly run these SQL files on an existing database. The test destination must be fresh and disposable.
- Inspect restore output for errors. Query representative counts for `products`, `purchases`, `purchase_items`, `sales`, `sale_items`, `stock_movements`, `expenses`, `day_closes`, `suppliers`, `staff_profiles`.
- Validate sample invoice totals, stock reconciliation, relationships and authorization separately. A SQL import succeeding is not sufficient.
- Note that a database dump may not include Supabase Auth-managed data, Storage objects, secrets or edge functions; plan and verify these separately.
- Record backup timestamp, SHA256 check result, restore date, target test database, errors, row counts and final sign-off.
- Delete test data securely after validation according to retention policy.

## Release gate
Do not enable production billing or stock posting until a real export and isolated restore have passed, RLS and financial workflows have been reviewed, and shop owner explicitly approves activation.

Official guide: https://supabase.com/docs/guides/self-hosting/restore-from-platform
