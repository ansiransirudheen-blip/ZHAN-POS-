# Actual Supabase sales schema reconciliation — READ ONLY

Reviewed via table metadata, without executing SQL or changing production.

- public.sales.id: uuid PK
- public.sales.invoice_number: nullable unique text
- public.sales.sale_date: timestamptz
- public.sales.customer_name / customer_phone: nullable text (must never appear in public invoice response)
- public.sales.subtotal, discount_total, grand_total, taxable_amount, vat_amount, vat_rate: numeric
- public.sales.status: draft | completed | void (NOT committed)
- public.sale_items.sale_id references sales.id, with product_id, quantity, unit_price, discount_amount, line_total and private unit_cost.
- public.sales and public.sale_items have RLS enabled.

The draft customer invoice policy now checks status='completed'. Its illustrative input still uses issued_at, currency, total and number types. A future **server-side adapter** must explicitly map sale_date -> issued_at, grand_total -> total, set verified currency SAR, and convert validated numeric values from Postgres safely; never forward arbitrary database records. Reconcile VAT and discount arithmetic against actual receipt rules before release. Never expose unit_cost, customer_phone, staff or internal fields.

There is currently NO customer invoice token table, migration, issuance endpoint, live API, or staging restore. The security policy and tests are development-only. Production changes remain prohibited until backup, checksum, isolated restore, tax compliance review and explicit approval.
