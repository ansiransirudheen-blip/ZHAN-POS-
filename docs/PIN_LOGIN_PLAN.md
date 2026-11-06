# ZAHN POS — Six-digit PIN login implementation plan (draft)

Status: DESIGN ONLY. Do not enable in production or remove existing Supabase Auth login until the replacement is independently tested and approved.

## Goal
Staff and admin sign in to the POS using their own six-digit numeric PIN, without entering email/password for routine use. Preserve existing Supabase Auth identities, staff_profiles roles, RLS, and the existing transaction RPCs.

## Important security constraint
A React-only PIN check, PIN in localStorage, or an anonymous RPC that merely returns a staff role is **not authentication**. The existing database policies and billing RPCs depend on an authenticated user identity. A secure PIN login must issue a genuine, short-lived identity-bound session usable by Supabase, or use a separately reviewed trusted backend for all data operations. Never expose service_role/secret keys to the browser.

## Proposed implementation
1. Review current Auth users, staff_profiles, RLS, and RPC authorization **read-only**. Map each active staff profile to its existing Auth user. Do not reset passwords or alter users.
2. Implement a protected server-side PIN enrollment and verification service. Require an authenticated admin for enrollment (or a separately approved, audited one-time bootstrap recovery). Store only a slow, salted PIN verifier with a server-side secret/pepper; never store plaintext PINs. Limit attempts by account and IP, lock out temporarily, audit events, and reject inactive staff.
3. Design the session bridge with Supabase Auth/RLS and verify it in a staging environment before choosing the exact token mechanism. Do not mint arbitrary JWTs or bypass RLS.
4. Create a responsive six-digit keypad and a staff selection/identifier step. Staff identities must not be inferred solely from a shared PIN. Use neutral errors that do not reveal whether an account exists.
5. Preserve emergency recovery and administrator provisioning; keep legacy sign-in behind a temporary, restricted recovery path until PIN sessions and role boundaries pass testing.
6. Test: admin vs staff permissions; wrong PIN; lockout; session expiry; sign-out; disabled user; refresh; multi-device; direct API requests without authentication; no ability to call billing/purchase RPC anonymously.
7. Only after explicit go-live approval switch the default sign-in screen. Keep VITE_ENABLE_LIVE_BILLING=false and VITE_ENABLE_LIVE_PURCHASES=false until separately approved.

## Current project safeguards
- Netlify frontend: https://zahn-luxury-pos.netlify.app/
- Supabase project: shibmzlswdghjyuutjgx
- Existing data, staff users, schema, RLS and transaction RPCs must not be changed by this planning task.
- Never import legacy browser data.

## Outstanding dependency
The existing admin cannot currently authenticate and password recovery hit an email rate limit. A safe PIN enrollment bootstrap requires proof of admin ownership and an approved recovery/provisioning procedure. PIN-only UI cannot safely solve this by itself.
