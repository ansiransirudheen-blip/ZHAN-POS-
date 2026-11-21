# ZAHN POS — read-only RPC review (2026-11-08)

Source: inspected live PostgreSQL function definitions using `pg_get_functiondef` and effective EXECUTE privileges. No production writes.

## Confirmed
- `public.current_pos_role()`, `public.post_pos_purchase(...)`, `public.save_pos_bill(...)` are SECURITY DEFINER, have empty `search_path`, executable by `authenticated` but not `anon`.
- Both transaction functions check `auth.uid()`, active `staff_profiles`, and role in `('admin','staff')`.
- Both use client request UUID plus fingerprint and advisory transaction lock for idempotency.
- Both use `SELECT ... FOR UPDATE` for products; purchase checks overflow and duplicates; bill checks stock and discount.

## Critical launch blocker
- `save_pos_bill` **always** calculates VAT as `round(total/1.15,2)`, stores `vat_rate=0.15`, and returns VAT values. The business has not confirmed VAT registration. The React preview's 0 VAT does **not** fix the server RPC. Do not enable live billing before tax-compliant invoice and VAT behavior are approved, changed and tested.

## Additional checks before activation
- Verify authorization and privilege escalation tests with actual staff/nonstaff users in an isolated test project.
- Review `SECURITY DEFINER` ownership, role grants, schema usage and unexpected RPC callers.
- Verify numeric overflow, malformed JSON, integer casts and errors roll back the whole transaction.
- Verify invoice date is Gregorian and correct Saudi locale; ensure invoice text and tax status match legal requirements.
- Purchase RPC currently adds integer quantities to finished product stock; it is **not** the planned oil-in-liters / mL recipe raw-material accounting.
- Do not revoke or alter RPC permissions on production without a restorable backup and planned migration.

## Release gate
Backup + isolated restore + VAT compliance + stock recipe model + security testing + explicit owner approval.
