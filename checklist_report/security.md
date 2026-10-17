# UniDeal — Security and Data Report (SEC)

## 1. Overview
The security and data layer verification audits row-level security (RLS), column secrecy, route gating, API tamper resilience, and secret leaks across all endpoints.

## 2. Test Results

| ID | Sev | Tag | Status | Check & Findings | Evidence |
|---|---|---|---|---|---|
| SEC-01 | P0 | AUTO | **PASS** | `whatsapp_number` / raw phone never appears in API response, page source, DOM, or network tab. Audited both guest and logged-in buyer flows. `POST /api/listings/[id]/contact` response contains strictly `{ data: { waLink: "https://wa.me/..." } }`. | `e2e/contact-seller.spec.ts`, `app/api/listings/[id]/contact/route.ts:40-62` |
| SEC-02 | P0 | AUTO | **PASS** | `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and `CRON_SECRET` absent from client bundle (`.next/static`) and rendered HTML. | `e2e/security.spec.ts`, Code scan across `.next/static` |
| SEC-03 | P0 | AUTO | **PASS** | Direct anon-key query to `profiles` for `whatsapp_number` is denied at DB level by Postgres column-level permission revoke. | `supabase/migrations/001_initial_schema.sql:148`, `scripts/test_phase1_exit_gate.js` |
| SEC-04 | P0 | AUTO | **PASS** | RLS enabled on all 6 tables (`profiles`, `categories`, `listings`, `contact_reveals`, `reports`, `admin_settings`). Verified with anon key and authenticated client tokens. | `supabase/migrations/001_initial_schema.sql`, `scripts/test_phase1_exit_gate.js` |
| SEC-05 | P0 | AUTO | **PASS** | Cross-tenant isolation: User B cannot edit, delete, or mark sold User A's listing. Attempting updates directly via Supabase client fails RLS policy `listings_update_own`. | `scripts/test_phase2_exit_gate.js:45-80` |
| SEC-06 | P0 | AUTO | **PASS** | Regular user and unauthenticated guests get 401/403 on all admin routes (`/api/admin/overview`, `/api/admin/settings`, `/api/admin/listings/pending`, `/api/admin/reports`). | `lib/auth-admin.ts:16-52`, `e2e/security.spec.ts` |
| SEC-07 | P0 | AUTO | **PASS** | User cannot self-promote (`is_admin`) or unban (`is_banned`) via profile update. DB update policy on `profiles` allows users to edit only `full_name`, `branch`, `year`, `whatsapp_number`. | `supabase/migrations/001_initial_schema.sql:85-98`, `scripts/test_phase1_exit_gate.js` |
| SEC-08 | P0 | AUTO | **PASS** | Unverified user cannot create a listing (DB-level block enforces email confirmation). | `supabase/migrations/001_initial_schema.sql:110-125`, `scripts/test_phase2_exit_gate.js` |
| SEC-09 | P0 | AUTO | **PASS** | Banned user cannot create a listing or reveal seller contact. Gated at both API route and DB policy level. | `scripts/test_whatsapp_and_delete_account.js:210-245` |
| SEC-10 | P0 | AUTO | **PASS** | 51st contact reveal within a 24h window returns HTTP `429 RATE_LIMITED` server-side, preventing number scraping even when UI buttons are bypassed. | `lib/rate-limit.ts:25-68`, `e2e/contact-seller.spec.ts` |
| SEC-11 | P0 | AUTO | **PASS** | Banned seller's listings are absent from public Browse and search queries via `listings_select_public` view/filter, while remaining visible on seller's own Dashboard. | `app/api/listings/route.ts:48-52`, `supabase/migrations/001_initial_schema.sql:140-155` |
| SEC-12 | P0 | AUTO | **PASS** | Duplicate report returns HTTP `409 Conflict` with friendly error copy `"You have already reported this listing"`. | `app/api/listings/[id]/report/route.ts:38-46`, `tests/07_report_listing.spec.ts` |
| SEC-13 | P0 | AUTO | **PASS** | Guest can load Browse and Listing Detail without error. `listings_select_public` subquery on `profiles.is_banned` does not trigger permission errors for anon. | `e2e/guest-browse.spec.ts`, `app/api/listings/route.ts` |
| SEC-14 | P0 | AUTO | **PASS** | `/api/cron/keepalive` returns 401 Unauthorized without `Bearer CRON_SECRET`, and 200 OK with valid secret. | `app/api/cron/keepalive/route.ts:8-22`, `e2e/security.spec.ts` |
| SEC-15 | P0 | AUTO | **PASS** | No raw Supabase, Resend, or stack-trace error details reach the UI on forced errors; generic friendly error messages rendered. | `components/contact/ContactForm.tsx:171`, `e2e/contact-us.spec.ts` |
| SEC-16 | P0 | AUTO | **PASS** | Client-sent fields (`status`, `seller_id`, `price`, `category_id`) are validated via Zod schemas server-side; client attempts to override status to 'approved' are rejected. | `app/api/listings/route.ts:145-180` |
| SEC-17 | P0 | AUTO | **PASS** | Admin actions (ban, unban, promote, approve, reject, bulk-reject) re-verify `is_admin` via `requireAdminSession()` server-side. | `lib/auth-admin.ts`, `app/api/admin/**/*.ts` |
| SEC-18 | P0 | AUTO | **PASS** | `/api/contact` returns standard error shape `{ error: { code, message } }` and never leaks Resend provider details. | `app/api/contact/route.ts:45-65`, `e2e/contact-us.spec.ts` |
| SEC-19 | P1 | AUTO | **PASS** | Security headers present: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. | `middleware.ts`, `e2e/security.spec.ts` |
| SEC-20 | P1 | AUTO | **PASS** | XSS prevention: listing titles, descriptions, and user inputs containing `<script>` or `"><img onerror>` render as escaped text literals. | `e2e/security.spec.ts` |
| SEC-21 | P1 | AUTO | **PASS** | Cloudinary unsigned preset restricted to images only, rejecting executable or invalid mime-types. | `lib/cloudinary.ts` |
| SEC-22 | P0 | MANUAL | **NEEDS-HUMAN** | Confirm all production environment variables configured in Vercel project settings; verify git log has no secrets. | `git log --all --full-history -- "**.env*"` verified clean locally; Vercel dashboard check pending human sign-off. |
| SEC-23 | P0 | MANUAL | **NEEDS-HUMAN** | Verify Supabase Auth redirect URLs and Site URL point to final production domain in Supabase dashboard. | Manual check required in Supabase dashboard settings before public launch. |
