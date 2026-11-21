# ZAHN Customer Invoice PDF — isolated staging test plan

Status: **NOT DEPLOYED**. The Node PDF generator and handler are server-only modules. They do not establish a live customer URL or a Supabase connection.

## Verification
- Run `npm test` and `npm run build` on the development branch.
- Test authorized 256-bit token, expired/revoked/invalid token, wrong HTTP method, mismatched sale, draft/void sale and backend failures.
- Confirm response uses application/pdf and attachment, no-store and no-referrer.
- Inspect PDF in iOS Files/Preview and Android/desktop readers before relying on it. Current PDF is minimal text-only and not a compliant final invoice.
- Inspect the original logo and Arabic text requirements before finalizing the PDF renderer. The current minimal ASCII renderer cannot represent Arabic.
- Do not use a fabricated customer URL. A real link requires an approved, deployed server endpoint and private token repository.
- No production database schema, credentials, sales or live deployments may be changed before verified backup, isolated restore, VAT compliance, and explicit release approval.
