# ZAHN POS — Supabase security audit, 2026-11-08

Read-only audit of production project `shibmzlswdghjyuutjgx`. **No database changes made.**

## Table status
10 public tables, RLS enabled on all. `staff_profiles`: 1 row; other nine tables: 0 rows (tool-reported approximate counts).

## Supabase security advisor findings
1. **7 RLS-enabled tables have no policies:** `day_closes`, `expenses`, `purchase_items`, `purchases`, `sale_items`, `sales`, `stock_movements`. No policy generally means client access is denied; this may be intentional for RPC-only writes. Do **not** add permissive blanket policies.
2. **3 authenticated-executable SECURITY DEFINER functions:** `current_pos_role()`, `post_pos_purchase(...)`, `save_pos_bill(...)`. Inspect definitions, owner, EXECUTE grants, staff authorization, idempotency, stock validation, and search_path before deciding whether to revoke. Never change blindly: POS RPCs may depend on these privileges.
3. **Leaked password protection disabled.** Review Auth settings and plan availability.

Official remediation references:
- https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
- https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable
- https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Release gates
- [ ] Export full restorable database backup from trusted CLI environment
- [ ] Verify backup checksums and restore into isolated test database
- [ ] Inspect function definitions and actual EXECUTE permissions
- [ ] Validate staff authorization for every RPC
- [ ] Validate transaction atomicity and inventory accounting
- [ ] Confirm VAT/invoice compliance before charging VAT
- [ ] Android tablet browser test
- [ ] Explicit production go-live approval

Current state: **LIVE BILLING DISABLED / NOT READY FOR PRODUCTION.**
