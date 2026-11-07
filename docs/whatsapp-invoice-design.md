# Customer WhatsApp invoice delivery — release design (NOT LIVE)

## Agreed flow
1. Staff enters customer name and WhatsApp number while preparing the bill.
2. After an approved, committed bill save, the backend issues a scoped, unguessable customer-view URL for that exact invoice.
3. The POS opens WhatsApp with the customer's normalized phone number and a prefilled invoice message and URL. Staff taps **Send**. Opening WhatsApp does **not** mean a message was delivered.
4. Customer opens the HTTPS URL without a POS login and sees only that invoice; optional PDF/download. Printing remains optional.

## Security / implementation requirements
- No invoice URL may be assembled from invoice number or database row ID. Generate at least 256 bits of cryptographically secure random token on the trusted server, store only a hash, associate it with one invoice, an expiry and a revocation timestamp. Never log plaintext tokens.
- Create a dedicated read-only invoice endpoint using server-side authorization against the hashed token. Do not grant anonymous SELECT on invoices, customers, line items or payments. Return only whitelisted invoice fields and no internal notes, staff IDs or customer phone numbers.
- HTTPS only. Set Cache-Control: no-store and Referrer-Policy: no-referrer; avoid third-party scripts and analytics on customer invoice page. Provide a way to revoke/reissue a link and reasonable abuse throttling. Treat the link as a bearer secret; WhatsApp recipient can forward it.
- Do not expose a service-role key in the browser. Keep link-issuing credentials server-side. Require authenticated authorized staff to issue or revoke links.
- Store the WhatsApp number only as needed for the sale and delivery, with appropriate notice and access controls; avoid putting phone numbers into invoice URLs.
- Open the prefilled WhatsApp URL directly from a staff-initiated user gesture to avoid popup blocking. If the URL has not been issued or billing remains locked, keep the share button disabled. A copy-link fallback can be considered only after secure issuance.
- In the first phase, **no automatic sending**. Sending without staff tapping Send would require an approved WhatsApp Business Platform/API setup, templates and consent/compliance review.

## Hard release gates
- Live billing and purchases remain hard-disabled. No production Supabase migrations, RLS changes, or invoice RPC changes until a full verified backup, checksum validation, isolated restore, VAT registration/invoice compliance review, and explicit release approval.
- Existing save_pos_bill RPC always calculates 15% VAT; this is an unresolved blocker. No customer-facing tax invoice may be issued until verified.
- Demo receipts never get a customer URL or an enabled WhatsApp share action.
- Tests: unauthorized/expired/revoked token denied; cross-invoice isolation; URL only returned after committed save; phone validation; browser WhatsApp button disabled for demo and safe preview; customer page contains no sensitive internal fields.

## Status
WhatsApp message formatting and disabled share button are implemented on the development branch. Customer invoice endpoint, token storage, customer-facing webpage, issuance flow, PDF, and delivery are **not implemented**.
