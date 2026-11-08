# Staging restore verification report — ZAHN POS

**Status: NOT VERIFIED.** This is an evidence template, not a completed backup or restore.

| Gate | Evidence required | Status |
| --- | --- | --- |
| Full production Postgres backup | Private backup filename, UTC time, byte size and backup tool/version | Pending |
| Backup integrity | Independently calculated SHA-256 and successful local verification | Pending |
| Isolated staging restore | Separate project identifier, restore timestamp and successful exit status | Pending |
| Table/row reconciliation | Source vs staging inventory JSON comparison result | Pending |
| Functions, RLS and grants | Source vs staging inventory plus manual security review | Pending |
| Recovery smoke test | Read-only test of expected schema/functions; no production transactions | Pending |
| Invoice VAT/tax review | Confirm registration status, 15% VAT calculation and required label | Pending |
| Release authorization | Explicit user approval after all above checks | Pending |

## Local verification commands (trusted computer only)

```sh
node scripts/verify-backup.mjs /secure/backup.dump EXPECTED_SHA256
node scripts/compare-restore-inventory.mjs /secure/source-inventory.json /secure/staging-inventory.json
```

Do not upload the backup, secrets or customer records to GitHub or chat. Do not use a production service-role key in browser code. The inventory comparator checks recorded metadata only; it cannot establish actual restore correctness without an independently executed restore and verification.

## Outcome

**Blocked:** No backup/restore evidence has been supplied or verified. Production schema, billing, purchasing and public customer invoice API must remain unchanged.
