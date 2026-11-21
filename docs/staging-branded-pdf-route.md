# Staging branded PDF route — development only

The `createStagingBrandedPdfRoute` function is a **server-side adapter**, not an HTTP endpoint. It is disabled by default and accepts only GET and 43-character URL-safe tokens. Authorized requests go through the existing token policy, invoice field allowlist, and original-JPEG PDF renderer. No production Supabase connection or public route has been configured.

Staging deployment prerequisites: isolated staging database and private token table, restricted service credentials held server-side, original `public/zahn-original-logo.jpg` loaded by a trusted server path, rate limits and abuse controls, HTTPS, end-to-end PDF reader validation, and no-store headers. Do not put service credentials in Vite frontend variables.

Production release remains blocked pending verified independent backup, SHA256, isolated restore, stock/accounting and tax verification, and explicit approval.
