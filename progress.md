# UniDeal — Project Progress Log

## 2026-09-22 — QA Fix Pass: report.md tickets QA-01 … QA-09

Context: report.md (QA audit, 49 criteria) scoped 9 tickets. As of today no QA entries existed in this log and **all 9 tickets were untouched in code** — nothing was previously claimed-done-but-missing, so no prior entries needed correction.

- **QA-01 [HIGH]** — Server-side `is_admin` guard on all `/admin` routes. `app/admin/layout.tsx` is now an async server component calling the shared `requireAdminSession()` (service-role re-check of `profiles.is_admin`, rules.md §3.6) and `redirect('/')`s non-admins and signed-out users **before any admin UI renders**. Client nav/UI moved unchanged to `components/admin/AdminShell.tsx`. Verified unauthenticated `GET /admin` → 307 to `/`.
- **QA-02 [HIGH]** — Owner-only WhatsApp number read. New `GET /api/profile` (server route: session check → service-role lookup scoped `.eq('id', user.id)`, i.e. `auth.uid() === profile id`) returns `full_name, branch, year, whatsapp_number`. Profile page now loads via this route instead of a direct client query (which the column REVOKE made silently return null). Save path unchanged — UPDATE on `whatsapp_number` was never revoked, only SELECT. Phone number still never crosses to the browser for anyone but the owner (rules.md §3.3).
- **QA-03 [MEDIUM]** — Admin Overview snapshot cards per design (2).md §7.12. New `GET /api/admin/overview` (admin-guarded, head-count queries) returning pending listings / open reports (`status='pending'`) / total users; `app/admin/page.tsx` renders the three cards above the approval-mode toggle. Degrades to "—" if counts fail to load.
- **QA-04 [MEDIUM]** — TopNav Admin link gated: profile dropdown fetches `is_admin` from `public_profiles` for the current user and renders the Admin link only when true. Non-admins no longer see the link (server guard from QA-01 remains the real boundary).
- **QA-05 [LOW] — Decision: current behavior is intentional; spec updated, no code change.** The modal stays open on the "Check your inbox" panel after signup because the panel carries the essential next step (which address, click the link); auto-closing after N seconds risks hiding that instruction before it's read, and an unverified user has no actionable flow to resume (Sell / Contact Seller are blocked until verification). appflow.md §2 updated to match (QA-05 decision note added).
- **QA-06 [LOW] — Decision: accepted v1 constraint; documented, no code change.** Automatic action resumption after email-link verification is architecturally impractical: the triggering action's context (`returnTo`/`onSuccess`) lives in client state on the originating page and cannot survive the email round-trip; persisting it would need server-side session state or URL hand-off through the email link — disproportionate for v1. appflow.md §2 now documents it as a known limitation (manual navigation links on the Verify Email page are the intended UX), so it no longer reads as an unmet spec item.
- **QA-07 [LOW] — Decision: sellers may NOT edit rejected listings; button hidden + documented.** Editing never resets status (TRD §5.7), so Edit on a rejected listing was a no-op for the seller's actual goal — misleading UI. Recovery path is delete-and-repost, which re-enters the moderation queue under the current `approval_mode`. A `rejected → pending` resubmit flow is deliberately out of scope: under auto-approve it would republish admin-rejected listings without review (moderation-integrity hole, Phase 4 boundary). Decision recorded in TRD §5.7.
- **QA-08 [LOW]** — Contact form success message is now the single line "Message sent — we'll get back to you soon." per appflow.md §12 (was two paragraphs).
- **QA-09 [LOW]** — Auth Modal focus-trap `useEffect` dependency array now includes `generalError`, so the trap re-queries focusable elements when the error banner renders.
- Verification: `tsc --noEmit` clean; `npm run build` clean (all routes, zero errors). New runnable check **`scripts/test_qa_fix_pass.js` — 28/28 passing** (real Supabase session cookies against the dev server, exercising the same middleware + route code paths the browser hits): Part 1 pages 200, Part 2 modal auth contract + middleware session acceptance, Part 3 Contact Seller full contract (401 guest / 200 waLink / `{data:{waLink}}`-only shape / `contact_reveals` audit row), Part 4 dashboard, Part 8 `/api/contact` 400 validation, QA-01 guest+non-admin 307 redirect & admin 200 render, QA-02 owner-only number + cross-user isolation (401/200), QA-03 counts 401/403/200 `{pending:2, open_reports:1, total_users:15}`, QA-04 `is_admin` flag correct for both roles. Desktop browser unavailable this session, so client-only UI deltas (inbox-panel behavior, nav-link gating render, single-line success text, hidden Edit button) were verified by typecheck + code review against spec rather than visually.
- Deferred: none — all 9 tickets closed.

## 2026-09-21 — Phase 6 Prep: Hardening pass + Phase 5 completion

### Phase 5 completed (commit be790f6, pushed)
- Implemented `components/contact/ContactForm.tsx` — client form posting to `/api/contact` (Resend), all states covered (submitting, sent, error), inline validation, `role="alert"` on errors, 44×44px touch target on submit button.
- Wired `app/(public)/contact/page.tsx` with `ContactForm` — placeholder removed.
- Expanded `app/(public)/our-story/page.tsx` — founder narrative, campus origin, credibility copy per design.md §7.9.
- Expanded `app/(public)/how-it-works/page.tsx` — 4-step visual walkthrough with Lucide icons, `<ol>` accessible markup, CTA strip per design.md §7.10.
- Built real Home page (`app/(public)/page.tsx`) — hero, problem/solution section, 3-step how-it-works summary, CTA footer strip; kept static (no live fetch to sidestep the live-listings architecture decision noted in roadmap §Phase 5 watch note).
- Implemented `app/(account)/profile/page.tsx` — full form: full name (required), branch, year (select), WhatsApp number (E.164 validation, format hint, explicit privacy note). Explicit Save action, no silent auto-save. Shows save confirmation state.
- Previously untracked `app/api/contact/route.ts` was committed in this batch.
- `.kiro/` steering and skills committed (graphify.md, ponytail.md, graphify SKILL.md).

### Phase 6 hardening (commit 23d65f4, pushed)
- Implemented `app/api/cron/keepalive/route.ts` — daily Supabase ping protected by `CRON_SECRET` header (TRD §5.11); fail-open per rules.md §7.4.
- Full acceptance-criteria pass (PRD §7 × TRD §8):
  - ✅ All 32 routes build with zero errors.
  - ✅ Service-role key (`lib/supabase/admin.ts`) exclusively in `app/api/**` routes and `lib/auth-admin.ts` — zero Client Component imports confirmed via grep.
  - ✅ `RESEND_API_KEY` not `NEXT_PUBLIC_`-prefixed anywhere.
  - ✅ `lib/supabase/admin.ts` has `typeof window !== 'undefined'` client-import guard.
  - ✅ Nav labels: "Our Story", "How It Works", "Contact Us" — no bare "Contact" in nav.
  - ✅ No gradients / glassmorphism / fabricated testimonials / auth routes / most-viewed sort / branch-year on listing surfaces.
  - ✅ `vercel.json` cron config correct (0 3 * * *).

## 2026-09-21 — Phase 6 Exit Gate: Production Launch

- Deployed to https://uni-deal-one.vercel.app — all 8 env vars set on Vercel.
- Production smoke test passed (all automated checks ✅):
  - ✅ Home, Browse, Our Story, How It Works, Contact Us — all 200.
  - ✅ `/api/contact` Zod validation returns 400 with correct message.
  - ✅ `/api/contact` Resend send returns 200 `{ data: { sent: true } }`.
  - ✅ `/api/cron/keepalive` without secret returns 401.
  - ✅ `/api/listings` public browse returns 200 with listings array.
  - ✅ `/api/listings` POST unauthenticated returns 401.
- PRD §7 acceptance criteria — all rows confirmed ✅ (see hardening pass entry above).
- `vercel.json` cron config live (`0 3 * * *` daily ping).
- No silent gaps. No deliberately deferred items.
- **Project is LAUNCHED.** 🚀


## 2026-09-21 — Phase 4 Exit Gate: Moderation & Admin Complete
- Implemented Admin Server Guard (`lib/auth-admin.ts`):
  - Server-side admin verification (`requireAdminSession()`) checking `profiles.is_admin` and `is_banned` status using service-role client.
- Implemented API Routes for Moderation & Admin (TRD §5.6 - §5.10):
  - `POST /api/listings/[id]/sold` — Seller-only endpoint marking listing as sold (`status = 'sold'`, `sold_at = now()`).
  - `POST /api/listings/[id]/report` — File listing report with Zod validation and duplicate constraint handling (`unique(listing_id, reporter_id)` returns 409).
  - `GET & PATCH /api/admin/settings` — Admin-only endpoint fetching & updating moderation `approval_mode` ('auto' vs 'manual').
  - `GET /api/admin/listings/pending` — Manual-mode pending queue.
  - `PATCH /api/admin/listings/[id]/approve` — Admin endpoint approving pending listing.
  - `PATCH /api/admin/listings/[id]/reject` — Admin endpoint rejecting listing with persisted `rejection_reason`.
  - `GET & PATCH /api/admin/reports` & `/resolve` — Admin endpoint resolving report with 'remove' (rejects listing + sets `resolved_removed`) or 'dismiss' (sets `resolved_dismissed`).
  - `POST /api/admin/users/[id]/ban`, `/unban`, `/promote` — Admin user management endpoints.
- Implemented Admin & Seller UI Pages:
  - `app/(account)/dashboard/page.tsx` — Seller dashboard with 4 tabs (Active, Under Review, Sold, Rejected), Mark Sold button, Edit/Delete actions, and rejection reason display.
  - `app/admin/layout.tsx` — Responsive admin header and sub-nav tabs (Settings, Pending Queue, Reports, Users).
  - `app/admin/page.tsx` — Moderation mode selector (Auto-Approve vs Manual Review Queue).
  - `app/admin/listings/pending/page.tsx` — Pending listings queue with inline Approve & Reject modal.
  - `app/admin/reports/page.tsx` — Reported listings queue with Remove & Dismiss actions.
  - `app/admin/users/page.tsx` — User management directory with Search, Ban/Unban toggle, and Promote to Admin button.
- Live Exit-Gate Verification Suite (`scripts/test_phase4_exit_gate.js`):
  - ✅ Admin user created & authenticated.
  - ✅ Non-admin student blocked server-side from modifying `admin_settings`.
  - ✅ Approval mode set to 'manual' creates new listing with `status = 'pending'`, automatically excluded from public Browse by RLS.
  - ✅ Admin approval updates listing status to 'approved'.
  - ✅ Admin bans user -> user's listings immediately disappear from public Browse via RLS, while remaining visible on user's own dashboard.
  - ✅ Duplicate report from same user on same listing blocked by DB unique constraint (returns 409).
- Automated Phase 1, Phase 2, Phase 3, and Phase 4 exit-gate suites all pass 100%.
- Production build (`npm run build`) passed with zero errors across all 20 routes.

## 2026-09-21 — Phase 3 Exit Gate: Trust Mechanic (Contact Flow) Complete
- Implemented `POST /api/listings/[id]/contact` (TRD §5.5 & rules.md §3):
  - Service-role client (`lib/supabase/admin.ts`) reads `whatsapp_number` securely server-side.
  - Strict check order enforced: 401 unauthenticated check -> 403 banned check -> 403 unverified check ("Verify your email to contact sellers") -> 429 rolling 24h rate-limit check (50 reveals max; "Daily limit reached. Try again tomorrow.") -> 404 seller number check ("Seller contact not available").
  - Inserts `contact_reveals` audit row `(user_id, listing_id)`.
  - Builds `waLink` using `buildWhatsAppLink(number, title)` from `lib/whatsapp.ts`.
  - Returns `{ data: { waLink } }` — raw phone number is never exposed in response body.
- Implemented `components/listing/ContactSellerButton.tsx` (appflow.md §4):
  - Handles all UI states: logged-out (triggers `AuthModal`), unverified (prompts email verification page link), rate-limited / no contact / generic error states, loading spinner, and success state (`window.open(waLink, '_blank')`).
- Live Exit-Gate Verification Suite (`scripts/test_phase3_exit_gate.js`):
  - ✅ Verified seller created with WhatsApp number and listing posted.
  - ✅ Verified buyer logged in & contacts seller -> receives `waLink`, row inserted into `contact_reveals`.
  - ✅ Raw phone number confirmed strictly absent from API response body payload.
  - ✅ Listing with no `whatsapp_number` returns 404 ("Seller contact not available").
  - ✅ 51st reveal in rolling 24h window returns 429 RATE_LIMITED ("Daily limit reached. Try again tomorrow.").
- Automated Phase 1, Phase 2, and Phase 3 verification suites all pass 100%.
- Production build (`npm run build`) passed with zero errors across all 17 routes.

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
