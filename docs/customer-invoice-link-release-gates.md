# Customer WhatsApp Invoice Link — release gates

Current implementation is **server-only, undeployed code**. It does not generate a PDF file or publish a customer URL. Do not add a dummy URL to outgoing WhatsApp messages.

## Required before any production customer invoice link
1. Verify a full independent production database backup, SHA-256 checksum, isolated restore, and row/stock/accounting reconciliation.
2. Confirm ZAHN VAT registration and invoice requirements. Existing billing RPC calculates 15% VAT regardless of registration, so real billing remains blocked.
3. Create an isolated staging environment and a private token store, inaccessible to browser and public Supabase Data API.
4. Wire a trusted server endpoint to the token-hash lookup and completed-sale read adapter. Test invalid, expired, revoked, and cross-invoice tokens, and verify the private fields never leave the server.
5. Decide between a print-to-PDF HTML view and server-generated PDF. The current code supports only a **print-ready HTML view**, not a hosted PDF file.
6. Generate the WhatsApp URL **only after** a real HTTPS customer invoice URL has been issued and verified. WhatsApp opens a prefilled chat; staff must press Send. Unattended messaging needs a separately approved WhatsApp Business Platform integration.
7. Obtain explicit release approval before production deployment or enabling billing.

No production data, schema, permissions or deployment were changed by this work.
