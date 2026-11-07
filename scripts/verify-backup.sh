#!/usr/bin/env bash
# Read-only integrity check. Does not restore data or access a database.
set -euo pipefail
if [[ $# -ne 1 ]]; then echo "Usage: bash scripts/verify-backup.sh /path/to/zahn-backup-folder" >&2; exit 2; fi
DIR="$1"
[[ -d "$DIR" ]] || { echo "Backup folder not found" >&2; exit 1; }
for name in roles.sql schema.sql data.sql SHA256SUMS; do
  [[ -f "$DIR/$name" ]] || { echo "Missing: $name" >&2; exit 1; }
done
command -v sha256sum >/dev/null || { echo "sha256sum is required" >&2; exit 1; }
(cd "$DIR" && sha256sum --check --strict SHA256SUMS)
for name in roles.sql schema.sql data.sql; do
  [[ -s "$DIR/$name" ]] || { echo "Empty: $name" >&2; exit 1; }
done
echo "PASS: Files present, non-empty and checksum-verified."
echo "IMPORTANT: This is NOT a restore test. Restore to an isolated test database before live billing."
