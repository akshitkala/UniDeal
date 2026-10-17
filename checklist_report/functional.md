# UniDeal — Functional Testing Report (FUN)

## 1. Overview
Audit of user journeys: Auth Modal overlays, listing creation/editing, browsing/sorting/filtering, contact seller WhatsApp link generation, user dashboard, report submission, and administrative moderation.

## 2. Test Results

### Auth Modal
| ID | Sev | Tag | Status | Check & Findings | Evidence |
|---|---|---|---|---|---|
| FUN-01 | P0 | AUTO | **PASS** | Modal opens from Contact Seller, Sell, Dashboard, Profile when logged out. | `e2e/auth-modal.spec.ts` |
| FUN-02 | P0 | AUTO | **PASS** | Focus trapped inside dialog (Tab and Shift+Tab cycle within modal elements). | `tests/02_auth_modal_signup.spec.ts`, `tests/e2e/phase1.spec.ts:236` |
| FUN-03 | P0 | AUTO | **PASS** | Escape key and overlay backdrop click close the modal cleanly. | `e2e/auth-modal.spec.ts` |
| FUN-04 | P0 | AUTO | **PASS** | Browser back button closes modal and preserves underlying page state without navigation. | `e2e/auth-modal.spec.ts` |
| FUN-05 | P0 | AUTO | **PASS** | `returnTo` parameter resumes original intended destination upon successful authentication. | `components/auth/AuthModal.tsx:180-210` |
| FUN-06 | P0 | AUTO | **PASS** | Wrong password produces inline error with `role="alert"`; modal remains open. | `e2e/auth-modal.spec.ts` |
| FUN-07 | P0 | AUTO | **PASS** | `/login` and `/signup` routes return 404 (Auth Modal is the only auth entrypoint). | `e2e/auth-modal.spec.ts` |
| FUN-08 | P0 | AUTO | **PASS** | Signup with an existing email returns an explicit, friendly error banner. | `components/auth/AuthModal.tsx:280-295` |
| FUN-09 | P0 | MANUAL | **NEEDS-HUMAN** | Real SMTP delivery check: verification email lands in inbox with working `/verify-email` link. | Requires human confirmation with custom email inbox. |
| FUN-10 | P1 | AUTO | **PASS** | Resend cooldown timer prevents email spamming; expired/used tokens show guidance message. | `app/(auth)/verify-email/page.tsx:40-75` |
| FUN-11 | P0 | AUTO | **PASS** | Logout terminates Supabase session; protected pages (/dashboard, /sell, /profile) immediately re-gate. | `components/nav/TopNav.tsx:90-110` |

### Listings Flow
| ID | Sev | Tag | Status | Check & Findings | Evidence |
|---|---|---|---|---|---|
| FUN-12 | P0 | AUTO | **PASS** | Sell page is a single unified form (no multi-step wizard); submit disabled until valid. | `app/(account)/sell/page.tsx` |
| FUN-13 | P0 | AUTO | **PASS** | Image bounds enforced: 1 to 4 images accepted; 5th image rejected; 0 images blocked. | `app/(account)/sell/page.tsx:110-135` |
| FUN-14 | P0 | AUTO | **PASS** | Files >5MB rejected client-side before any network upload call. | `tests/04_sell_flow.spec.ts` |
| FUN-15 | P1 | AUTO | **PASS** | Price field uses `inputmode="numeric"` for mobile number pad display. | `app/(account)/sell/page.tsx:220` |
| FUN-16 | P0 | AUTO | **PASS** | In auto mode: newly submitted listings appear immediately in Browse. | `tests/04_sell_flow.spec.ts` |
| FUN-17 | P0 | AUTO | **PASS** | In manual mode: new listings default to `status = 'pending'`, showing "Under Review" badge. | `scripts/test_phase4_exit_gate.js` |
| FUN-18 | P0 | AUTO | **PASS** | Edit listing pre-fills current data and maintains existing moderation status. | `app/(account)/listing/[slug]/edit/page.tsx` |
| FUN-19 | P0 | AUTO | **PASS** | Mark Sold transitions status to 'sold' and removes item from public browse. | `tests/06_dashboard_actions.spec.ts` |
| FUN-20 | P0 | AUTO | **PASS** | Delete removes listing with explicit user confirmation dialog. | `tests/06_dashboard_actions.spec.ts` |
| FUN-21 | P0 | AUTO | **PASS** | Dashboard displays 4 tabs: Active, Under Review, Sold, and Rejected. | `app/(account)/dashboard/page.tsx` |
| FUN-22 | P0 | AUTO | **PASS** | Rejected cards display administrator's `rejection_reason`. | `app/(account)/dashboard/page.tsx:310-335` |
| FUN-23 | P0 | AUTO | **PASS** | Seller without a WhatsApp number can list; Contact CTA reflects "Seller contact not available". | `tests/05_contact_seller.spec.ts` |
| FUN-24 | P1 | AUTO | **PASS** | Listing slug includes nanoid suffix guaranteeing uniqueness across identical titles. | `app/api/listings/route.ts:168` |

### Browse & Search
| ID | Sev | Tag | Status | Check & Findings | Evidence |
|---|---|---|---|---|---|
| FUN-25 | P0 | AUTO | **PASS** | Search matches across both title and description text. | `e2e/guest-browse.spec.ts` |
| FUN-26 | P0 | AUTO | **PASS** | Category filter and condition filter work individually and in combination. | `e2e/guest-browse.spec.ts` |
| FUN-27 | P0 | AUTO | **PASS** | Sort options (Newest First, Price: Low to High, Price: High to Low) correct; no "Most Viewed" option. | `e2e/guest-browse.spec.ts` |
| FUN-28 | P0 | AUTO | **PASS** | Infinite scroll / pagination loads subsequent batches without duplicates. | `app/(public)/browse/page.tsx:140-180` |
| FUN-29 | P1 | AUTO | **PASS** | Query parameters persist in URL (`?category=...&sort=...`), state preserved on reload. | `e2e/guest-browse.spec.ts` |
| FUN-30 | P0 | AUTO | **PASS** | Profile page loads and saves full name, branch, year, and WhatsApp number (E.164) with privacy disclaimer. | `tests/08_profile_and_contact_us.spec.ts` |

### Contact Seller
| ID | Sev | Tag | Status | Check & Findings | Evidence |
|---|---|---|---|---|---|
| FUN-31 | P0 | AUTO | **PASS** | Logged-out user clicking Contact Seller is presented with the Auth Modal. | `e2e/contact-seller.spec.ts` |
| FUN-32 | P0 | AUTO | **PASS** | Unverified user receives guidance to verify email before contacting seller. | `app/api/listings/[id]/contact/route.ts:42-50` |
| FUN-33 | P0 | AUTO | **PASS** | Verified user receives `https://wa.me/...` deep link containing the listing title in pre-filled text; one row logged to `contact_reveals`. | `e2e/contact-seller.spec.ts`, `tests/05_contact_seller.spec.ts` |
| FUN-34 | P0 | AUTO | **PASS** | Reaching the 50/day reveal limit disables contact CTA with notice `"Daily limit reached. Try again tomorrow."`. | `e2e/contact-seller.spec.ts` |
| FUN-35 | P0 | AUTO | **PASS** | Sellers cannot contact their own listings; button is suppressed or disabled for owner. | `app/(public)/listing/[slug]/page.tsx:180` |

### Moderation & Support
| ID | Sev | Tag | Status | Check & Findings | Evidence |
|---|---|---|---|---|---|
| FUN-36 | P0 | AUTO | **PASS** | Report listing: reason dropdown, confirmation notice, duplicate submission blocked with 409. | `tests/07_report_listing.spec.ts` |
| FUN-37 | P0 | AUTO | **PASS** | Admin approval mode toggle (auto ↔ manual) modifies future listings without affecting existing items. | `tests/09_admin_flows.spec.ts` |
| FUN-38 | P0 | AUTO | **PASS** | Admin approve/reject transitions status cleanly; rejection requires mandatory reason. | `tests/11_admin_reject_and_ratelimit.spec.ts` |
| FUN-39 | P0 | AUTO | **PASS** | Admin report Remove sets listing to rejected; Dismiss leaves listing active and resolves report. | `app/api/admin/reports/[id]/resolve/route.ts` |
| FUN-40 | P0 | AUTO | **PASS** | Admin user ban, unban, and promotion work with explicit confirmation step. | `tests/09_admin_flows.spec.ts` |
| FUN-41 | P0 | AUTO | **PASS** | Non-admin users attempting to visit `/admin/*` are redirected to `/`. | `tests/e2e/phase1.spec.ts:39` |
| FUN-42 | P0 | AUTO | **PASS** | Support contact form validates input, handles successful delivery, and shows friendly fallback on failure. | `e2e/contact-us.spec.ts` |
| FUN-43 | P0 | AUTO | **PASS** | Public static pages (`/our-story`, `/how-it-works`, `/contact`) load without authentication. | `e2e/static-pages.spec.ts` |
| FUN-44 | P0 | AUTO | **PASS** | Seller identity renders first name only across all cards, listings, and moderation views. | `e2e/guest-browse.spec.ts` |
| FUN-45 | P1 | AUTO | **PASS** | Listing views counter increments asynchronously and never blocks page rendering on error. | `app/(public)/listing/[slug]/page.tsx` |
