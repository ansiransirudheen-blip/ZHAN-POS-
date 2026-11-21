# Production schema integration contract — read-only inspection

Inspected public table columns through information_schema. This is a development reference, **not** a backup, a migration, or proof of operational readiness.

## Product
`products`: `id uuid`, `name text`, `brand text nullable`, `size_ml integer`, `sku text`, `cost_price numeric`, `selling_price numeric`, `stock_quantity integer`, `low_stock_threshold integer`, timestamps.

## Billing
`sales`: `id uuid`, `invoice_number text nullable`, `client_request_id uuid NOT NULL`, `sale_date timestamptz`, nullable customer name/phone, `payment_method text`, `subtotal numeric`, `discount_total numeric`, `grand_total numeric`, `status text`, `taxable_amount numeric`, `vat_amount numeric`, `vat_rate numeric`, `request_fingerprint text nullable`.

`sale_items`: `sale_id uuid`, `product_id uuid`, `quantity integer`, `unit_price numeric`, `unit_cost numeric` (PRIVATE), `discount_amount numeric`, `line_total numeric nullable`.

## Purchasing
`purchases`: `id uuid`, `supplier_id uuid`, `invoice_number text`, `purchase_date date`, `total_amount numeric`, `status text`, `client_request_id uuid nullable`, `request_fingerprint text nullable`.
`purchase_items`: `purchase_id uuid`, `product_id uuid`, `quantity integer`, `unit_cost numeric`, `line_total numeric nullable`.

## Stock audit
`stock_movements`: `product_id uuid`, `movement_type text`, `quantity_change integer`, `stock_before integer`, `stock_after integer`, `reference_id uuid nullable`, `notes text nullable`.

## Staff
`staff_profiles`: `user_id uuid`, `display_name text`, `role text`, `is_active boolean`, `created_at timestamptz`. Staff identity must be validated server-side; UI role switching is not authorization.

## Critical integration rules
- Never write `sales`, `sale_items`, or stock independently from a client; use an approved atomic server-side billing RPC with idempotent `client_request_id`.
- Never expose `unit_cost`, staff records, or customer phone via public invoice token links.
- Never trust client-calculated VAT, prices, stock, or roles. Existing billing RPC's 15% assumption must be reviewed before production activation.
- Validate all database constraints, RLS, RPC behavior, concurrency, and rollback in isolated staging; column inspection alone cannot verify these.
- Independent backup, SHA256 verification and isolated restore remain required before any production changes.
