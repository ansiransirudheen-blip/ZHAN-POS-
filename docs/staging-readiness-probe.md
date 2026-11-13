# Staging read-only readiness probe

`createStagingReadinessProbe({environment:'staging',client})` checks ten public table row counts without fetching any row data. It does not create staging, restore a backup, test permissions, or enable billing. The caller must provision a **separate isolated staging project** and provide a read-only, least-privileged staging client. Never use production keys or production URL.

A staging flag alone is not proof of isolation; validate the actual project ID/URL outside this module before invoking it. The module fails closed for missing staging configuration, invalid counts, and query errors. Even a successful probe does **not** satisfy independent backup/restore, VAT compliance, authentication, atomic billing, or offline sync release gates.
