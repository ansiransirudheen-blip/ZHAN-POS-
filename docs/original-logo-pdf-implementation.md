# Original ZAHN logo in customer invoice PDF

The original supplied asset is `public/zahn-original-logo.jpg` on the development branch. The authorized HTML invoice references it; this is **not** the same as embedding it in a downloadable PDF.

The existing Node PDF generator is ASCII-only and text-only. A JPEG validation helper is now available, but **does not embed** the logo. A proper PDF renderer must embed the exact JPEG bytes as an image object (or use an audited PDF library), preserve image dimensions, support Arabic fonts where required, and be validated on iPhone and Android. Never substitute a regenerated logo.

Before production, require backup + SHA256, isolated restore, VAT/tax verification, staging endpoint and private token store, PDF reader checks and explicit release approval. No customer-facing PDF URL is live.
