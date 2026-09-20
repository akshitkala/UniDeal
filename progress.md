# UniDeal — Project Progress Log

## 2026-09-21 — Phase 2 Exit Gate: Core Marketplace (Listings) Complete
- Implemented `lib/validation/listing.ts` (Zod schemas for create and update listing).
- Implemented API Routes for Listings:
  - `GET /api/listings` — Browse listings with filtering (category, condition, search query), sorting (newest, price_asc, price_desc), and 20/page pagination.
  - `POST /api/listings` — Create listing with server-side Zod validation, nanoid slug generation (`{title}-{nanoid(5)}`), and `admin_settings.approval_mode` check ('auto' vs 'manual').
  - `PATCH /api/listings/[id]` — Update listing fields (excluding protected seller_id/slug/status).
  - `DELETE /api/listings/[id]` — Delete listing, enforced by RLS `listings_delete_own`.
- Implemented Client & Server Pages:
  - `app/(account)/sell/page.tsx` — Post listing page with authentication and email verification gates.
  - `app/(account)/listing/[slug]/edit/page.tsx` — Edit listing page pre-filled with listing data.
  - `components/listing/ListingForm.tsx` — Form supporting title, category select, condition, price, negotiable toggle, description, and Cloudinary unsigned image uploads (up to 4 images, < 5MB client-side rejection).
  - `app/(public)/browse/page.tsx` — Browse page with category tabs, condition filters, search bar, sort dropdown, and responsive grid layout (`ListingGrid.tsx`, `ListingFilters.tsx`).
  - `app/(public)/listing/[slug]/page.tsx` — Detail page fetching listing joined with `public_profiles`, `firstName()` display, and fire-and-forget view count increment (`increment_listing_views`).
- Column & RLS Permission Polish:
  - Granted column-level SELECT on non-sensitive `profiles` columns (`id, full_name, branch, year, is_admin, is_banned, promoted_by, promoted_at, created_at, updated_at`) to `anon` role so guest browse queries succeed without exposing `whatsapp_number`.
- Live Exit-Gate Verification Suite (`scripts/test_phase2_exit_gate.js`):
  - ✅ Verified seller user created, verified, and logged in.
  - ✅ Unverified user strictly blocked from authenticating or posting listings by RLS.
  - ✅ Verified seller successfully posted listing with auto-approved status.
  - ✅ Public guest query retrieves listing joined with `public_profiles`, `firstName()` utility extracts first name ("Ananya").
  - ✅ Seller successfully edits own listing price via `PATCH`.
  - ✅ Unauthorized 3rd party user blocked from editing seller's listing by RLS.
  - ✅ Seller successfully deletes own listing via `DELETE`.
- Automated Phase 1 (`scripts/test_phase1_exit_gate.js`) and Phase 2 (`scripts/test_phase2_exit_gate.js`) suites both pass 100%.
- Production build (`npm run build`) passed with zero errors across all 17 routes.

## 2026-09-12 — Phase 1 Exit Gate: Auth Modal, Email Verification, & RLS Verification Complete
- Built `components/auth/AuthModal.tsx`:
  - Tabbed Sign In / Create Account modal overlay matching `design (2).md` §7.4 and TRD §5.1a.
  - Implemented focus trap cycling Tab/Shift+Tab strictly inside the modal.
  - Escape key and backdrop click close modal.
  - Integrated `history.pushState` on modal open with `popstate` listener so browser/device back gesture closes the modal without navigating away from the underlying page.
  - Contextual `returnTo` and `onSuccess` action resumption.
  - Full name collected on signup, passed via `options.data.full_name` to populate `profiles.full_name` via DB trigger.
  - Inline field validation errors and pending email verification notification state.
- Implemented `contexts/AuthContext.tsx`:
  - Global auth provider exposing user session, verification status, and `openAuthModal` / `closeAuthModal` handlers.
- Implemented `middleware.ts`:
  - Supabase session token refresh on incoming requests across App Router.
- Implemented `components/nav/TopNav.tsx`:
  - Responsive header integrating `AuthModal` trigger for unauthenticated users, Sell CTA, first-name display via `firstName()`, and verified badge / navigation dropdown.
- Implemented `app/(auth)/verify-email/page.tsx`:
  - Real verification page exchanging `token_hash` / `code` OTP tokens.
  - Verified state confirmation with navigation to Browse / Sell.
  - Resend verification email action with 60-second cooldown timer.
- Live Exit-Gate Verification Suite (`scripts/test_phase1_exit_gate.js`):
  - ✅ Signup via Supabase Auth SDK creates user.
  - ✅ Postgres trigger `handle_new_user` auto-creates `public.profiles` row with full_name.
  - ✅ Email confirmation sets `email_confirmed_at` properly.
  - ✅ Login with confirmed credentials succeeds.
  - ✅ Column-level lockdown verified: authenticated client attempting `select('whatsapp_number')` on `profiles` is blocked with `permission denied for table profiles`.
  - ✅ Public view verified: guest/authenticated queries against `public_profiles` return public identity fields with `whatsapp_number` strictly absent.
- Production build (`npm run build`) passed with zero errors across all 16 routes.

## 2026-09-20 — Design token correction
- Corrected the stale Phase 1 token record and implementation to the authoritative `design (2).md`: accent `#16A34A`, Contact Seller `#15803D`, destructive `#DC2626`, white surface, `#E2E8F0` border, `#0F172A` foreground, `#64748B` muted text, Outfit headings, and Work Sans body text.
- Existing AuthModal, TopNav, and verify-email components consume semantic Tailwind classes, so updating their shared token definitions restyles them consistently without component-specific color overrides.

## 2026-09-12 — Repository history reset
- Preserved the local document relocation and project tooling in commit `adaba06ca55e31490bbc2804e622bd69f254ad0e`.
- Replaced the abandoned, unrelated `origin/main` history with local `main` using `git push --force-with-lease origin main`.
- Confirmed `origin/main` now points to `adaba06ca55e31490bbc2804e622bd69f254ad0e`.
- The prior remote contained an incompatible OAuth-based implementation and is intentionally not part of this project history.

## 2026-09-11 — Phase 1: Project Scaffold + Supabase Schema
- Initialized Next.js 14+ App Router project structure matching TRD §4 / architecture.md §3:
  - Route groups: `(public)`, `(auth)`, `(account)`, and top-level `admin/`.
  - Configured locked design tokens from `design.md` in `tailwind.config.ts`; corrected to the authoritative design values on 2026-09-20.
  - TypeScript strict mode enabled globally with path aliases (`@/*`).
- Created complete SQL schema migration `supabase/migrations/001_initial_schema.sql`:
  - 3 enums: `listing_condition`, `listing_status`, `report_status`.
  - 6 tables: `profiles`, `categories` (with 6 seed rows), `listings`, `reports`, `contact_reveals`, `admin_settings` (seeded single row `id=1, approval_mode='auto'`).
  - Performance indexes on all status, category, seller, date, and admin columns.
  - `handle_new_user` trigger on `auth.users` for automatic profile creation.
  - `increment_listing_views` security definer Postgres function.
  - Column-level lockdown: `whatsapp_number` revoked from anon and authenticated roles.
  - `public_profiles` view created for guest/buyer display without `whatsapp_number`.
  - RLS enabled and all 16 policies applied exactly per TRD §3 across all 6 tables.
- Generated `types/database.ts` representing all tables, views, enums, and functions.
- Implemented core library infrastructure:
  - `lib/supabase/client.ts` (browser client via `@supabase/ssr`)
  - `lib/supabase/server.ts` (server client via `@supabase/ssr` with typed cookies)
  - `lib/supabase/admin.ts` (service-role client with client-import guard)
  - `lib/display-name.ts` (`firstName()` standard utility)
  - `lib/slug.ts` (`{title}-{nanoid(5)}` slug generation)
  - `lib/rate-limit.ts` (50 reveals / 24h rolling count check)
  - `lib/cloudinary.ts` (upload constants and URL helpers)
  - `lib/whatsapp.ts` (`wa.me` deep link builder)
  - `lib/resend.ts` (server-only Resend client helper)
  - `lib/validation/listing.ts` & `lib/validation/contact.ts` (shared Zod schemas)
- Configured `.env.local` and `.env.example` with all TRD §7 environment variables.
- Configured `vercel.json` for the daily keepalive cron job.
- Verified TypeScript compilation (`tsc --noEmit`) with zero errors.
- Initial git commit created.
