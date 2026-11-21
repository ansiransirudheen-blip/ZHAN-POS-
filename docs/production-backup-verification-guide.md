# ZAHN production backup verification — operator guide

**No backup has been created by this guide.** Do not paste database passwords, connection strings, backup contents or service keys into GitHub or chat.

1. On a trusted computer, use Supabase's documented database backup/export procedure appropriate for the project plan to create a **complete Postgres backup** (schema, data, roles/grants/policies/functions as applicable). A JSON export or dashboard screenshot is not a substitute.
2. Store the backup encrypted outside the browser, outside the GitHub repository, and outside any public web folder. Keep the backup path private.
3. On the same trusted computer, calculate SHA-256 independently: macOS/Linux `shasum -a 256 /secure/path/backup.dump`; Windows PowerShell `Get-FileHash -Algorithm SHA256 'C:\\secure\\backup.dump'`.
4. Verify the saved file against that expected checksum: `node scripts/verify-backup.mjs /secure/path/backup.dump EXPECTED_64_CHARACTER_SHA256`. The script reads a local file only; it never connects to Supabase.
5. Record backup UTC time, byte size, SHA-256 and secure storage location privately. Do not share the backup file or checksum publicly.
6. Restore into an **isolated staging** project, not production. Validate table counts, functions, RLS, grants and a recovery test. A checksum match alone does **not** prove restorability.

Do not run production migrations or enable live billing until backup + checksum + isolated restore + VAT/tax review + explicit approval.
