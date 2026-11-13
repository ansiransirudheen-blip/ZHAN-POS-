# ZAHN POS — Final Production Critical Path

Priority is a complete production-ready POS, not incremental feature demos. This is a work tracker, **not a release approval**.

| Priority | Workstream | Current evidence / blocker |
| --- | --- | --- |
| P0 | Independent Supabase backup + SHA256 + isolated restore | Not verified. Production free plan has no confirmed automatic backup. |
| P0 | VAT registration/tax treatment and compliant invoice | Not verified. Existing production RPC assumes 15% VAT. |
| P0 | Auth and authorization for Admin/Staff | Demo role switch is UI-only. Production PIN model needs security verification. |
| P0 | Atomic billing, purchase, stock + duplicate/retry checks | Server-side routines exist; end-to-end production-safe staging tests missing. |
| P0 | Offline/online synchronization and conflict recovery | Not end-to-end verified across tablet and laptop. |
| P1 | Original-logo PDF + secure WhatsApp URL | Server-only modules and tests; no private staging token store or deployed URL. |
| P1 | Reports, invoice print and mobile usability | Demo UI exists; staging and real device testing pending. |
| P0 | Explicit owner release approval | Must follow all verification, not precede it. |

**Next execution order:** verify a recoverable backup without writing production; build isolated staging; validate tax and staff permissions; run atomic billing/stock and offline sync tests; exercise PDF/WhatsApp on real devices; seek final approval. Never use test sales on production. A green GitHub build alone does not establish readiness.
