# Production read-only inventory — 2026-11-08

Source: read-only count queries against Supabase project `zahn-pos-production` (`shibmzlswdghjyuutjgx`). This is **not a backup** and contains no customer/staff details.

| Public table | Rows |
| --- | ---: |
| day_closes | 0 |
| expenses | 0 |
| products | 0 |
| purchase_items | 0 |
| purchases | 0 |
| sale_items | 0 |
| sales | 0 |
| staff_profiles | 1 |
| stock_movements | 0 |
| suppliers | 0 |

Scope limitation: only `public` base-table row counts; excludes Auth identities, Storage objects, functions, triggers, policies, secrets, schema definitions, and any other schemas. Counts may change after observation. No writes performed.

**Release gate remains blocked:** obtain a full independent export including schema, relevant Auth/Storage assets as applicable, record SHA256 checksum, perform an isolated restore, compare inventories and verify app authentication before any live deployment.
