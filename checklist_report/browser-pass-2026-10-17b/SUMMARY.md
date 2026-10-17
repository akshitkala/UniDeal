# Browser Pass Re-Test Summary (2026-10-17b)

**Date**: 2026-10-17  
**Scope**: Full resolution and verification of issues identified in the October 17 Browser Pass.  
**Verification Gates**:
- `npm run lint`: **PASS** (Clean, 0 errors)
- `npx tsc --noEmit`: **PASS** (Clean, 0 type errors)
- `npm run build`: **PASS** (37/37 static and dynamic routes compiled successfully)
- Automated Playwright Spec `tests/e2e/report-listing.spec.ts` (`FUN-36`): **PASS** on both Desktop and Mobile projects.

---

## Key Changes & Verifications

### 1. Report Button (P0, FUN-36) — RESOLVED & PASS
- Added `components/listing/ReportButton.tsx` and integrated it below the fold on `/listing/[slug]`.
- Low-emphasis trigger button with flag icon.
- Hidden on viewer's own listing (`seller_id === user.id`).
- Guest state: opens `AuthModal` with `returnTo` set to resume reporting.
- Logged in but unverified state: renders amber callout "Verify your email to report."
- Verified user state: accessible modal dialog with focus trap, backdrop dismissal, Escape dismissal, and browser history back handling.
- Reason dropdown with standard options: "Fake listing", "Prohibited item", "Misleading price", "Spam", "Other".
- Submit button disables while sending. Handles 201 success notice ("Thanks, we'll review this.") and 409 duplicate message ("You've already reported this listing.").
- Listing remains live (no auto-hide).
- Added `tests/e2e/report-listing.spec.ts` starting with `FUN-36`, validated with 4/4 passing tests across Desktop and Mobile projects. `FUN-36` updated to **PASS**.

### 2. Contact Seller Distinction — RESOLVED & PASS
- Contact Seller button is now differentiated by icon, explicit label, and size rather than shade alone.
- Replaced previous icon with a generic chat SVG icon (speech bubble with call prompt; non-Meta).
- Button label explicitly says "Contact seller on WhatsApp".
- Rendered full width with `min-h-[50px]`.
- Mobile layout: pins to the bottom of the viewport with safe-area inset support (`fixed bottom-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]`).
- Page container updated with `pb-28 md:pb-8` to ensure content, safety tips, and Report button are never obscured.
- Documented in `documents/design (2).md` §2 and `documents/rules_v1.1.md` §2.

### 3. /admin for Non-Admins Returns 404 — RESOLVED & PASS
- Updated `app/admin/layout.tsx` to invoke Next.js `notFound()` instead of redirecting to `/`.
- Both unauthenticated guests and authenticated non-admin users attempting to load `/admin` receive HTTP 404 and the custom branded "Page Not Found" layout, preventing administrative route discovery.
- Admin API routes continue to return 401/403 as specified.

### 4. Home Problem Section Layout Rebalance — RESOLVED & PASS
- Refactored `components/home/ProblemStory.tsx`.
- Single clean heading ("WhatsApp groups weren't built for this.") with short supporting copy.
- 3 problem cards arranged in a responsive grid row at desktop (`md:grid-cols-3 gap-6`), stacked on mobile.
- Zero gradients, zero fake chat bubble mockups, zero awkward empty whitespace at 1440px+.

### 5. Seed Images & Live Database Unsplash URLs — RESOLVED & PASS
- Updated `scripts/seed_admin_and_listings.js` replacing all raw `images.unsplash.com` links with local assets (`/hero-campus.webp`, `/problem-search.jpg`, etc.) and Cloudinary demo assets.
- Cleaned 20 existing listings in the live Supabase database that previously held Unsplash URLs, resolving Chromium cross-origin image blocking.

### 6. Orphan-Feature Audit — COMPLETED
- Full audit saved to `checklist_report/orphan-features.md`.
- Categorized all TRD §5, Architecture v1.1, and app API routes.
- Identified 5 endpoints with NO UI (predominantly Server Component SSR direct query bypasses such as `GET /api/admin/overview`, `GET /api/admin/settings`, `GET /api/admin/listings/pending`, `GET /api/admin/reports`, and background `GET /api/cron/keepalive`).
- No UI components or routes were created for NO UI items per instructions.

### 7. Re-test Journeys J2, J4, J7, J10 — ALL PASS
- Executed via Playwright MCP tools against `http://localhost:3000`.
- 28 real screenshots captured and saved in `checklist_report/browser-pass-2026-10-17b/screenshots/`.
- Full tool call traces and assertions documented in `checklist_report/browser-pass-2026-10-17b/journey-results.md`.
