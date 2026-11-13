# Production constraints audit — 2026-11-08 (read-only)

Read-only `pg_constraint` inspection of the existing production schema. **Not** a full backup, restore, security certification or end-to-end test.

## Verified database invariants

- `products`: allowed sizes 10,20,30,50,80,100 ml; unique SKU; nonnegative stock, cost, selling price and low-stock threshold.
- `sales`: unique `client_request_id` and `invoice_number`; `grand_total = subtotal - discount_total`; discount cannot exceed subtotal; payment method restricted to cash/mada/bank_transfer; status draft/completed/void; nonnegative amounts and VAT rate in [0,1].
- `sale_items`: positive quantity; nonnegative unit price, unit cost, discount; discount cannot exceed quantity × unit price; product and sale foreign keys.
- `purchases`: supplier foreign key; unique (supplier_id,invoice_number); status draft/posted/cancelled; nonnegative total.
- `purchase_items`: positive quantity; nonnegative unit cost; product and purchase foreign keys.
- `stock_movements`: `stock_after = stock_before + quantity_change`; nonnegative before/after; nonzero change; movement type opening/purchase/sale/return/adjustment; product foreign key.
- `staff_profiles`: role admin/staff; user foreign key to `auth.users` with ON DELETE CASCADE.

## Remaining release blockers

Constraints do **not** prove atomicity, safe concurrent decrements, rollback, request-fingerprint replay protection, role permissions, or VAT legal correctness. Independently verify those in isolated staging with controlled test identities. Confirm independent production backup, SHA256, and restore first. Do not enable production writes or merge to main on the strength of this audit.
