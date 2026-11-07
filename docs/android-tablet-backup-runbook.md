# ZAHN POS — Android-first backup and launch checklist

Status: **NOT READY FOR LIVE SALES**. This document is a procedure, not evidence of a successful backup.

## Architecture
- Live records: Supabase Postgres (free tier).
- Android Samsung 128 GB tablet: a destination for downloaded backups, **not** a database backup engine.
- Second independent copy: USB-C drive or another secure storage destination.
- Later: computer + external hard drive for automated, tested database exports.

## Critical distinction
Recipe draft JSON is only browser-local recipes. Sales CSV, products CSV and other app exports are **not** a complete database backup. A recoverable backup must include the Postgres schema, data, relevant database roles/permissions and any separately stored files/configuration required for recovery. Auth-related data and application secrets need a separately reviewed recovery plan; never place secrets in browser-accessible files.

## Before enabling live billing
- [ ] Capture a full, consistent Postgres database backup through an approved trusted server/CLI environment (never embed database passwords or service role keys in React or Android browser JavaScript).
- [ ] Save dated backup with an integrity checksum and verify it is readable.
- [ ] Copy it to Android storage AND a separate location, with access controls/encryption appropriate for customer records.
- [ ] Restore into a **separate test database**, never over production, and verify tables, relationships, totals, representative invoices and inventory.
- [ ] Verify RLS, user permissions and server-side transaction atomicity for billing and stock posting.
- [ ] Verify tax/invoice rules before charging VAT; do not issue a tax invoice before applicable registration/compliance is confirmed.
- [ ] Run a successful Android browser smoke test for invoice, purchase, backup download and restore procedure.
- [ ] Explicitly approve production activation.

## First-week daily closing procedure (after launch approval)
1. Stop new transactions briefly or use a database-consistent backup method.
2. Run the trusted backup process and wait for **verified success**.
3. Download encrypted dated backup to Samsung My Files / Internal storage / Documents / ZAHN_POS_BACKUP.
4. Copy to a second independent location. Check file sizes and checksums.
5. Record date/time, backup ID, result and operator. Keep multiple generations; do not overwrite yesterday's copy.
6. If backup fails, record failure and resolve it; never label a CSV or recipe JSON as a full restore point.

## Restore drill
Restore the backup into a separate temporary project/database, validate row counts and financial/stock totals, check access permissions and document recovery time. Never test by overwriting production.

## Current project facts
- Recipe JSON export was manually confirmed by the user.
- Full Supabase database backup and restore test are **pending**.
- Live billing and stock posting remain disabled.
- This documentation makes **no** database or production deployment changes.
