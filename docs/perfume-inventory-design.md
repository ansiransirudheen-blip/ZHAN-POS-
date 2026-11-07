# ZAHN perfume mixing: proposed inventory design (NOT DEPLOYED)

Status: development design only. No database migrations, RPC changes, or production transactions have been performed.

## Units and purchasing
- Maintain a raw-material catalog separate from sellable finished products. Raw oils and mixing liquids use **mL** as the canonical stock unit; bottles/caps/packaging use **pieces**.
- Purchase entry supports liters, mL, packs, and pieces with an explicit positive conversion factor. For oil, 1 L = 1,000 mL. Save original invoice unit, quantity, and price as well as converted base quantity.
- Weighted average unit cost on receipt: (existing quantity × existing average unit cost + received base quantity × received base unit cost) / (existing quantity + received base quantity). Use decimal/numeric, not floating-point, for monetary values. Preserve historic cost snapshots on each movement.

## Recipe and stock model
- Recipe has a version, fragrance/material IDs, output bottle size in mL, oil mL, liquid mL, bottle piece count, packaging component counts, and wastage allowance if applicable. Enforce nonnegative quantities and oil + liquid <= bottle capacity (allow headspace only when specified).
- **Made to order:** A confirmed bill atomically consumes recipe raw materials and records a sale, using the recipe version and cost snapshot applied to that bill. Never deduct again during print/retry.
- **Pre-made:** A confirmed production batch consumes raw materials once and increases finished bottle stock; subsequent sale decreases only finished bottle stock. Track batch yield and wastage. Do not double-deduct ingredients.
- Both workflows can coexist for the same fragrance/size with distinct stock types and sale fulfillment modes.

## Proposed entities (review before migration)
- raw_materials: id, sku, name, kind, base_unit, stock_quantity, average_cost_base, active
- material_purchases and material_purchase_lines: supplier, invoice, purchase_unit, unit_conversion, quantity, cost, request id
- perfume_recipes and perfume_recipe_components: fragrance, size, version, status, component_id, quantity_base
- production_batches and production_batch_consumptions: recipe version, quantity produced, actual materials, finished sku, cost snapshot
- finished_inventory: finished sku, available bottles, average finished unit cost
- inventory_movements: idempotency key, source type/id, material/finished sku, delta, cost snapshot, actor, timestamp

## Safety before enabling writes
1. Confirm existing schema, access control, and backups; take and verify a restorable export before migration.
2. Design row-level security and transactional server-side RPCs for purchase receipt, production confirmation, and sale fulfillment. No direct browser stock updates.
3. Validate material availability server-side under locks; reject insufficient stock; prevent duplicate postings with idempotency keys.
4. Test cross-device concurrency, cancellations/returns, rounding, fractional mL, VAT status, partial batches, and print retries.
5. Test iPhone, tablet, and desktop; keep live feature flags disabled until approved and backed up.

This design is not a claim that the current POS supports these features yet.
