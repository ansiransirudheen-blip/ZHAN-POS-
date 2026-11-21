#!/usr/bin/env bash
# ZAHN POS — operator-run PostgreSQL backup (requires Supabase CLI and trusted computer/server)
# Never run in browser; never commit connection strings or passwords.
set -euo pipefail
umask 077
command -v supabase >/dev/null || { echo "Install Supabase CLI first"; exit 1; }
command -v sha256sum >/dev/null || { echo "sha256sum required"; exit 1; }
: "${ZAHN_DB_URL:?Set ZAHN_DB_URL privately to a direct or session-pooler Postgres connection URL}"
OUT_DIR="${1:-./private-backups}"
mkdir -p "$OUT_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
TARGET="$OUT_DIR/zahn-$STAMP"
mkdir -m 700 "$TARGET"
echo "Exporting roles, schema and data to $TARGET"
supabase db dump --db-url "$ZAHN_DB_URL" --role-only -f "$TARGET/roles.sql"
supabase db dump --db-url "$ZAHN_DB_URL" -f "$TARGET/schema.sql"
supabase db dump --db-url "$ZAHN_DB_URL" --data-only --use-copy -f "$TARGET/data.sql"
(cd "$TARGET" && sha256sum roles.sql schema.sql data.sql > SHA256SUMS && sha256sum -c SHA256SUMS)
echo "Backup files and checksums created: $TARGET"
echo "NOT YET RESTORE-VERIFIED. Copy securely off-device and test restoration to a separate database."
