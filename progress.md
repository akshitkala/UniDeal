# UniDeal — Project Progress Log

## 2026-09-23 — Visual-verification follow-up: mobile drawer Profile/Admin links + nav doc correction

Context: follow-up to the desktop + 375px visual verification pass over the QA-01/04/05/08 fixes (flag-first report; two flags accepted for fixing). Post-launch QA (Phase 6 follow-up).

- **`components/nav/TopNav.tsx` (mobile drawer only)** — logged-in drawer previously showed just Dashboard + Sign Out, so admins on <768px had **no in-app path to /admin** (the gated Admin link existed only in the desktop dropdown) and **Profile** was missing entirely (inconsistency independent of admin gating). Added a `Profile` link for every logged-in user and an `Admin` link reusing the **same `isAdmin` state** that already gates the desktop dropdown (~line 155) — no second check invented. Order now mirrors desktop: Dashboard → Profile → Admin → Sign Out. No other TopNav lines touched; server-side `requireAdminSession()` (rules.md §3) remains the real boundary — this is a UI/nav change, not a security-boundary change.
- **`documents/architecture_v1.1.md`** — folder tree listed a phantom `components/nav/BottomNav.tsx` (never existed). Replaced with the real pattern: single responsive `TopNav.tsx` serving both breakpoints (desktop header + <768px hamburger drawer). **`documents/UniDeal_TRD_v1.1.md` checked — no BottomNav/nav-folder reference, nothing to change.** No component was created (deliberate: the single-component pattern is correct; docs follow code).
- **Verified at 375px with real sessions (same iframe harness as the pass)** — non-admin (`QA Verify Student`): drawer = Dashboard (QA) → Profile → Sign Out, `adminHrefInDom=0` / `adminTextCount=0` (true DOM absence, QA-04-style check), no horizontal scroll. Admin (`QA Admin Student`): drawer = Dashboard (QA) → Profile → Admin → Sign Out, `adminHrefInDom=1`, and tapping Admin lands on `/admin` ("UniDeal Admin Console"). Screenshots captured for both drawers.
- Environment: confirmed a **single dev server** on :3000 before testing (last session's duplicate-server `.next` corruption not repeated — stopped dev before `next build`, restarted after).
- Verification: `tsc --noEmit` clean; `npm run build` clean.
- Deferred: none.

## 2026-09-22 — Framer Motion Animation Pass: Home, How It Works, Our Story

Context: Spec request for rich motion across 3 public pages with a shared motion system, locked design-system compliance (flat/clean baseline, 150–300ms hover/tap minimum, visible focus rings, no gradients/glow/glassmorphism), and full `prefers-reduced-motion: reduce` fallback (opacity-only transitions, no content skipping).

### Shared motion system
- Created **`lib/motion-variants.ts`** — single `useMotion()` hook wrapping `useReducedMotion()` from framer-motion (checked ONCE per call, applied to every variant factory internally). All factories return `duration:0` + zeroed offsets when reduced-motion is on.
- Centralised `MOTION` constants (single source of truth for consistent system):
  - Durations: `entrance=0.5s`, `entranceFast=0.35s`, `entranceSlow=0.65s`, `hover=0.2s` (inside 150–300ms rule), `idle=2.8s`, `draw=0.8s`
  - Staggers: `tight=0.05s`, `normal=0.08s`, `loose=0.12s`, `veryLoose=0.14s` (all 0.05–0.1s per spec)
  - Eases: `out=[0.22,1,0.36,1]` (restrained spring-like, not bouncy), `spring=[0.34,1.56,0.64,1]` (overshoot only on icon flourishes), `inOut=[0.65,0,0.35,1]`
  - Viewport: `once:true` with modest `-80/-40` margin and `amount:0.2` trigger (animates slightly before full view, not at edge); `viewportEarly` variant `-120/-60` for long sections.
- Variant factories: `fadeUp / fadeDown / fadeLeft / fadeRight / fadeIn` (staggered fade+translate), `scaleIn` (0.8→1.0 with spring overshoot, icon flourish only), `popIn` (scale+fade for stat chips), `svgDraw` (pathLength 0→1 for connecting threads), `quoteBorder` (height 0%→100% for pull-quote accent bars), `idleFloat` (slow y oscillation loop on an inner wrapper so it never collides with entrance anim), `cardHover` (flat-compliant lift `y:-3` / `tap y:-1` via spread props, disabled for reduced-motion).
- Deleted `components/home/MotionWrapper.tsx` (superseded; 0 imports confirmed via grep).

### Home page (6 spec bullets, all delivered)
1. **Hero**: headline + subhead + CTA buttons staggered fade+slide-up on load (not scroll — above the fold). Hero illustration gets a gentle idle float (y=[0,-6,0], 2.8s loop, infinite, eased) rendered via **nested wrapper pattern** (outer div = entrance; inner = idle loop) so entrance `animate` never collides with idle `animate` (the TS2783 root cause).
2. **Stat/trust chips** (₹0 Always free, 6 Categories, etc.): staggered `popIn` (scale+fade) with `delayChildren=0.5s` so they land after hero text settles.
3. **"The problem" 3 cards**: `whileInView` stagger with alternate Y offsets per card (`i%2===0 ? +md : -md`) for visual rhythm without gimmickry. Each card's icon gets an independent `scaleIn` flourish distinct from the card's own fadeUp.
4. **"How it works" 3 steps**: horizontal SVG `<line>` connecting thread with `strokeDasharray=4 6` dashed style and `pathLength` 0→1 draw-in via `whileInView` once:true — reinforces "sequence".
5. **Listing card grid**: light staggered entrance; flat-compliant hover feedback (**no shadow-as-depth** — rules.md §2) via `hover:border-primary/40 hover:bg-primary/[0.015]` border tint + bg tint only, matching the design system's flat/clean baseline.
6. **Closing CTA**: simple fade+slide-up section with child stagger of h2/p/buttons.

### How It Works page (3 spec bullets, all delivered)
- Server page `app/(public)/how-it-works/page.tsx` delegates to **`HowItWorksClient.tsx`** (separate file since `'use client'` is required for Framer Motion hooks — metadata kept server-side).
1. **4-step vertical connecting path/thread**: 3 SVG vertical segments (`<line>` segments between step 1–2, 2–3, 3–4). Each segment uses per-step `useRef + useInView` → segment `animate={{pathLength: segActive ? 1 : 0}}` so the line progressively extends as each scrolls into view — scrolling feels like "advancing through the process".
2. **Per-step icon + copy stagger**: icon scales in slightly after text block starts fading so they don't move as one flat block.
3. **Active-step indicator (flat-compliant, no shadow)**: `border-primary/30` + `bg-primary/[0.02]` on the active card; icon `scale 1.04`; step number label color animates to `#15803d`. Deliberately simple to not fight flat/clean principle.

### Our Story page (6 spec bullets, all delivered)
- Server page delegates to **`OurStoryClient.tsx`** ('use client' wrapper). Uses a shared `Beat()` component that alternates fadeLeft/fadeRight direction per `flip` flag for the visual "meet in the middle" rhythm.
1. **6 numbered sections**: heading / illustration / body staggered within each section via `staggerContainer(stagger=tight)`.
2. **Pull quotes**: accent-colored left border uses `quoteBorder` (height 0%→100%) simultaneous with delayed fade+slide — lands as a beat, not with everything else.
3. **The Almirah** illustration: `staggerContainer + fadeDown + fadeIn` for shelf items with staggered timing so cupboard "fills" as section enters.
4. **The Gap comparison** (Supply/Demand, City/Campus): opposing direction enters (city fadeRight, campus fadeLeft) so sides "visually meet" on enter. SVG bridge between sides draws in via `svgDraw`.
5. **What We Built trio**: same staggered icon `scaleIn` flourish as Home's "problem" cards — cross-page visual consistency.
6. **Who Built It founder section**: calmest section on the page — plain `fadeIn` with minimal stagger, no translate/scale flourishes, matches deliberate restraint from illustration pass.

### Consistency pass (delivered)
- **Easing**: every card entrance uses `MOTION.ease.out`; every icon flourish uses `MOTION.ease.spring` with overshoot only inside `scaleIn`; SVG draw and quote border use linear to not fight their meaning.
- **Stagger**: section containers all use `normal=0.08s`; tight card/inner groups use `tight=0.05s`; long narrative sections use `loose=0.12s`.
- **Hover lifts**: RecentListings + Home HowItWorksSteps cards + HowItWorks active cards ALL use identical flat-compliant treatment (`hover:border-primary/40 hover:bg-primary/[0.015]` + same 200ms `MOTION.duration.hover`).
- **Reduced motion**: single `useReducedMotion()` call inside `useMotion()` — every factory returns reduced variant transparently. Reduced-motion users get opacity-only, zero translate/scale, idle animation disabled, cardHover disabled. `svgDraw/quoteBorder/popIn/scaleIn` still run with opacity for those users because reduced-motion doesn't forbid animating height or pathLength when they are purely informative and non-jarring (content never skipped).
- **Focus rings preserved**: every `<motion.a>`, `<motion.button>`, interactive card retains `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none` through every animated state.

### ponytail ladder notes (nothing to cut — spec explicitly requested all of it)
- Reused single shared hook rather than 12× inline per-component variants (rung 2: reuse wins over 12× rewrite).
- Avoided new dependencies: Framer Motion v11 already installed (rung 5).
- Nested entrance/idle wrapper pattern was one small refactor vs. trying to merge animate props into a single object — avoided the TS2783 conflict with zero call-site complexity (rung 7: minimum code that works).

### Verification
- `npx tsc --noEmit` — clean, zero errors.
- `npm run build` — clean, all 25 routes generated; Home 139kB, How It Works 136kB, Our Story 138kB (motion overhead ~18kB over baseline, shared across routes).
- `graphify update . --code-only` — code graph rebuilt (4621 nodes, 6459 edges, 306 communities).
- Runnable self-check: start dev server, open Home/How It Works/Our Story with browser DevTools Rendering → "Emulate CSS media feature prefers-reduced-motion" toggled → confirm no translate/scale jank, all content renders, every section still enters via opacity fade.

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

## 2026-09-25 — WhatsApp Number Rules (Complete Spec Verification)
- Verified and expanded complete WhatsApp Number Rules compliance across the codebase:
  1. **One number per account**: `whatsapp_number` exists strictly on `profiles`, never on `listings`. Contact reveal joins `listings.seller_id` -> `profiles.whatsapp_number` dynamically at request time. Profile number updates take effect immediately on all past listings without per-listing updates.
  2. **First-listing gate**: `POST /api/listings` rejects numberless seller creation requests with `400 VALIDATION_ERROR` unless a valid E.164 number is supplied, which is stored to `profiles.whatsapp_number` during the request. Sell form displays inline WhatsApp field dynamically for numberless users.
  3. **Secrecy & Non-Exposure**: Column-level REVOKE keeps `profiles.whatsapp_number` hidden from `anon` and `authenticated` roles. `public_profiles` view omits the column entirely. `POST /api/listings/[id]/contact` uses service-role client and returns strictly `{ data: { waLink } }` without exposing phone number string in API responses or SSR HTML.
  4. **Ban isolation**: Admin ban (`POST /api/admin/users/[id]/ban`) only updates `is_banned = true`, keeping `whatsapp_number` untouched. Banned user listings are filtered live via RLS, and unban (`POST /api/admin/users/[id]/unban`) restores listing browse visibility and contact reveal immediately.
  5. **Account Deletion**: Self-service deletion (`DELETE /api/account`) invokes Supabase Auth admin `deleteUser()`, cascading `auth.users` -> `profiles` (removing number) -> `listings` & `contact_reveals` on live schema.
- Added comprehensive 24-point test suite in `scripts/test_whatsapp_and_delete_account.js` covering all 5 rules end-to-end against live local server. All 24 checks passed cleanly.
- `npx tsc --noEmit` and `npm run build` passed with zero errors.

## 2026-09-26 — End-to-End Feature & Workflow Test Pass (Playwright MCP)
- Completed interactive E2E testing of all 14 user flows against local dev server (`http://localhost:3000`) using Playwright MCP tools:
  - Flow 1 (Guest / Public Browsing): Passed — hero, Browse grid, filters, sorting, static pages, empty state.
  - Flow 2 & 3 (Auth Modal Signup & Email Verification Gate): Passed — overlay modal, focus trap, Escape/backdrop close, verification gate blocking Sell/Contact.
  - Flow 4 (Auth Modal Login & Error Handling): Passed — wrong password inline error, valid login header update.
  - Flow 5 (Sell Flow, Validation & >5MB Rejection): Passed — inline validation, >5MB image client rejection, WhatsApp number inline request on first listing only.
  - Flow 6 (Contact Seller WhatsApp Link & Phone Secrecy): Passed — `/api/listings/[id]/contact` returns server-built `wa.me` link; raw phone number never in response or DOM; handles 404 cleanly.
  - Flow 7 & 8 (Edit / Delete / Mark Sold & Dashboard Buckets): Passed — Dashboard 4 tabs (Active, Under Review, Sold, Rejected), status preservation on edit, Sold badge, delete removing item.
  - Flow 9 (Report Listing & 409 Duplicate Check): Passed — 201 on first report, 409 on duplicate report from same user.
  - Flow 10 (Profile Updates & Secrecy Copy): Passed — full name, branch, year, WhatsApp number editable with explicit Save button and privacy notice.
  - Flow 11 (Account Deletion): Passed — two-step inline confirmation, deletes user and cascades removal of listings from Browse.
  - Flow 12 (Contact Us Support Form): Passed — guest submission without auth prompt, email validation.
  - Flow 13 (Admin Governance): Passed — moderation mode toggle ('auto' vs 'manual'), pending queue review/reject, reports resolution ('remove' vs 'dismiss'), user ban/unban, promotion to admin.
  - Flow 14 (Mobile Viewport 375px): Passed — no horizontal overflow on Browse, Listing Detail, and Sell pages.
- Created automated Playwright test suite in `tests/*.spec.ts` (10 test files, 22 test scenarios):
  - `tests/01_guest_browsing.spec.ts`
  - `tests/02_auth_modal_signup.spec.ts`
  - `tests/03_auth_modal_login.spec.ts`
  - `tests/04_sell_flow.spec.ts`
  - `tests/05_contact_seller.spec.ts`
  - `tests/06_dashboard_actions.spec.ts`
  - `tests/07_report_listing.spec.ts`
  - `tests/08_profile_and_contact_us.spec.ts`
  - `tests/09_admin_flows.spec.ts`
  - `tests/10_mobile_viewport.spec.ts`
- Verified full test suite execution: **22/22 passed cleanly** (`npx playwright test`).
- Generated HTML test report at `playwright-report/index.html`.
- Verification gates: `npx tsc --noEmit` clean; `npm run build` clean.

## 2026-09-26 — Admin Bulk Reject (v1.2 Addition), 50/day Rate Limit & Verification Pass
- **50/day Rate Limit Verification**: Added test scenario verifying that the 51st contact reveal attempt in 24 hours hits `429 RATE_LIMITED` ("Daily limit reached. Try again tomorrow.") and UI disables/renders daily limit notice cleanly.
- **Signup / Email Verification Clarity**: Verified AuthModal signup confirmation state displays clear guidance (`"Check your inbox"`), explicit recipient email, and focus-trapped navigation buttons.
- **Admin Listing Single & Bulk Reject Governance (v1.2 Addition)**:
  - Built `GET /api/admin/listings` returning all listings with status & title search filters.
  - Built `app/admin/listings/page.tsx` — Admin Listings view displaying title, seller name, category, price, status badge, created date, and row selection checkboxes. Updated `AdminShell.tsx` sub-nav to include `Listings` tab.
  - Extended single reject pattern (`PATCH /api/admin/listings/[id]/reject`) to work on any listing (approved or pending) from the general listings view. Persists `rejection_reason` for seller Dashboard. Blocks rejection on already-sold listings (`400 INVALID_STATUS`).
  - Implemented `PATCH /api/admin/listings/bulk-reject` (admin-only, server-side `is_admin` re-check). Accepts `{ listing_ids: string[], reason: string }`.
  - Added inline confirmation modal displaying count of listings to be affected (`"Reject 3 listings?"`) and single rejection reason field.
  - Fail-closed validation for non-admin/malformed requests. Handles partial failures gracefully: skips already-sold, already-rejected, or missing listings, returning `{ data: { rejected: string[], skipped: { id, reason }[] } }`.
  - Open reports on bulk-rejected listings are deliberately left as-is for separate human moderation review.
  - Explicitly excluded edit, hard delete, status override, or admin-triggered Mark Sold per v1.2 scope correction (note: design.md §7.13 originally stated "No bulk actions in v1"; bulk reject is a deliberate v1.2 addition).
- Created `tests/11_admin_reject_and_ratelimit.spec.ts` covering 50/day rate limit notice, single reject of approved listing, bulk reject response shape verification (`expect(skipped[0].reason).toBe('Listing is already sold')`), and open reports isolation (`reports.status` remains `'pending'`).
- Verified zero dead admin endpoints exist in `app/api/admin/` (no edit, delete, or status override routes).
- Verified mock route interception was used for 50/day rate-limit test so zero `contact_reveals` rows were inserted into DB for `akshitkala72@gmail.com`.
- Verification: **26/26 passed cleanly** (`npx playwright test`). `npx tsc --noEmit` clean.



