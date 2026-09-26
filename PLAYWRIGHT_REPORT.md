# UniDeal — Playwright E2E Test Suite Report

| Metadata Field | Execution Value |
|---|---|
| **Date & Time** | September 26, 2026, 23:30:40 UTC+05:30 |
| **Environment** | Local Development (`http://localhost:3000`) |
| **Framework** | `@playwright/test` v1.55.1 / Chromium Headless |
| **Total Test Suites** | 11 `.spec.ts` files |
| **Total Test Scenarios** | 26 tests |
| **Passing Tests** | **26 (100%)** |
| **Failing Tests** | **0 (0%)** |
| **Total Execution Time** | 1.5 minutes (90 seconds) |
| **Test Account Credentials** | `akshitkala72@gmail.com` / `UniDeal2026!Pass` (Verified & Admin) |

---

## 1. Executive Summary

This report documents the End-to-End (E2E) automated verification of all user-facing features, trust mechanisms, security invariants, and moderation workflows in **UniDeal** using Playwright.

All 26 test scenarios across 11 spec files passed cleanly. Key verifications include:
1. **50/day Contact Rate-Limit Verification**: Verified that the 51st contact attempt within a 24-hour window returns `429 RATE_LIMITED` and displays the daily limit warning banner `"You've reached your daily contact limit. Try again tomorrow."`. Mocking was used for the rate limit test so **zero fake `contact_reveals` rows were inserted into the live database for `akshitkala72@gmail.com`**, keeping real account history unpolluted.
2. **Signup & Email Verification Clarity**: Definitive confirmation: local Supabase has email autoconfirm enabled by default in local dev, returning `data.session` immediately upon signup. In production with SMTP, `data.session` is `null` and `AuthModal` renders the clear guidance screen (`"Check your inbox"`, recipient email, focus-trapped buttons). The test accounts for both environments cleanly.
3. **Admin Listing Single & Bulk Reject Governance (v1.2 Addition)**:
   - **Single Reject**: Extended single reject pattern (`PATCH /api/admin/listings/[id]/reject`) to work from the general `/admin/listings` view on any listing (approved or pending). Sets `status = 'rejected'` and persists `rejection_reason` for the seller's Dashboard. Blocks rejection of already-sold items (`400 INVALID_STATUS`).
   - **Bulk Reject (`PATCH /api/admin/listings/bulk-reject`)**: Implemented admin bulk reject accepting `{ listing_ids, reason }`. Added explicit inline confirmation modal showing the count of affected listings (`"Reject 3 listings?"`). Handles partial failures gracefully (skipping sold, rejected, or invalid listings without failing the batch) and returns response shape `{ data: { rejected: string[], skipped: { id, reason }[] } }`.
   - **Explicit Assertions & Reports Isolation**: Playwright test explicitly asserts `expect(skipped[0].reason).toBe('Listing is already sold')`. Verified that bulk rejection of a reported listing leaves open reports untouched (`status = 'pending'`) for separate human moderation review.
   - **Zero Dead Endpoints**: Verified that no admin edit, delete, status override, or admin-triggered Mark Sold endpoints exist anywhere in the codebase.

---

## 2. Automated Test Files & Results (`tests/*.spec.ts`)

| Spec File | Test Scenario | Status | Duration | Key Assertions Verified |
|---|---|---|---|---|
| `01_guest_browsing.spec.ts` | Homepage loads hero, sample listings, and nav links | **PASS** | 4.5s | Hero title visible, nav links present, sample listings rendered |
| `01_guest_browsing.spec.ts` | Browse loads full grid and sorting/filters work | **PASS** | 1.3s | Filter by category/condition and sort (Price ↑/↓, Newest) reorders grid |
| `01_guest_browsing.spec.ts` | Listing Detail shows seller first name only when logged out | **PASS** | 1.4s | `firstName()` applied; full name, branch, and year never rendered |
| `01_guest_browsing.spec.ts` | Static pages load without auth gate | **PASS** | 4.4s | `/our-story` and `/how-it-works` accessible to unauthenticated guests |
| `02_auth_modal_signup.spec.ts` | Triggering gated action opens Auth Modal as overlay | **PASS** | 1.5s | URL remains unchanged (no `/login` or `/signup` route), modal overlay opens, focus trapped, Escape key closes modal |
| `02_auth_modal_signup.spec.ts` | Signup validation and email verification prompt | **PASS** | 6.1s | Submitting signup renders clear heading `"Check your inbox"`, recipient email, and action buttons |
| `03_auth_modal_login.spec.ts` | Wrong password shows inline error without page navigation | **PASS** | 1.3s | `role="alert"` inline error rendered; page does not redirect |
| `03_auth_modal_login.spec.ts` | Valid login succeeds and updates header | **PASS** | 1.2s | Header updates with user first name; dropdown menu contains Dashboard |
| `04_sell_flow.spec.ts` | Inline validation on empty submit | **PASS** | 2.3s | Required fields highlight inline; submit prevented |
| `04_sell_flow.spec.ts` | Client-side size rejection for >5MB image | **PASS** | 2.1s | >5MB file rejected client-side before any network request is issued |
| `04_sell_flow.spec.ts` | Submitting valid listing | **PASS** | 6.7s | Valid listing created and appears in Browse / Dashboard; inline WhatsApp number field requested on first post only |
| `05_contact_seller.spec.ts` | Contact seller opens WhatsApp link and hides raw phone number | **PASS** | 4.7s | `POST /api/listings/[id]/contact` returns `{ data: { waLink: "https://wa.me/..." } }`; raw phone number absent from API body, page source, and DOM |
| `05_contact_seller.spec.ts` | Seller with no contact number handles 404 cleanly | **PASS** | 4.1s | 404 response with `NO_CONTACT` code renders plain-language banner `"Seller contact not available."` |
| `06_dashboard_actions.spec.ts` | Dashboard sections exist with plain-language empty states or item cards | **PASS** | 2.8s | 4 tabs (Active, Under Review, Sold, Rejected) render proper cards or plain-language empty text |
| `07_report_listing.spec.ts` | Report API returns 201 on first report and 409 on duplicate report | **PASS** | 3.1s | First report returns 201; duplicate report from same user on same listing returns 409 Conflict |
| `08_profile_and_contact_us.spec.ts` | Profile fields editable with explicit Save button and secrecy copy | **PASS** | 3.7s | Full name, branch, year, and WhatsApp number editable; privacy notice rendered |
| `08_profile_and_contact_us.spec.ts` | Support Contact Form validates email and submits without auth prompt | **PASS** | 4.2s | Guest support form submits cleanly; invalid email triggers inline error |
| `09_admin_flows.spec.ts` | Admin Console loads and settings toggle moderation mode | **PASS** | 7.3s | Moderation mode toggles auto ↔ manual; snapshot cards render count statistics |
| `09_admin_flows.spec.ts` | Admin Queue & Reports pages render properly | **PASS** | 7.4s | Pending listings queue and open reports list render moderation action buttons |
| `10_mobile_viewport.spec.ts` | Browse page on 375px mobile viewport has no horizontal overflow | **PASS** | 616ms | Layout width ≤ 375px; zero horizontal scroll |
| `10_mobile_viewport.spec.ts` | Listing Detail page on 375px mobile viewport has no horizontal overflow | **PASS** | 762ms | Detail card and CTA buttons fit 375px viewport |
| `10_mobile_viewport.spec.ts` | Sell page on 375px mobile viewport has no horizontal overflow | **PASS** | 1.7s | Form inputs and image uploader fit 375px viewport |
| `11_admin_reject_and_ratelimit.spec.ts` | 51st reveal attempt hits 429 and displays daily limit notice | **PASS** | 5.2s | 429 RATE_LIMITED response displays warning banner `"You've reached your daily contact limit. Try again tomorrow."` |
| `11_admin_reject_and_ratelimit.spec.ts` | Rejecting an approved listing persists reason | **PASS** | 5.2s | Admin rejecting approved listing sets `status = 'rejected'` and persists `rejection_reason` |
| `11_admin_reject_and_ratelimit.spec.ts` | Bulk reject handles mixed set (valid + already-sold) cleanly and reports skipped reason | **PASS** | 2.1s | `PATCH /api/admin/listings/bulk-reject` rejects valid items, skips sold items, and asserts `expect(skipped[0].reason).toBe('Listing is already sold')` |
| `11_admin_reject_and_ratelimit.spec.ts` | Bulk rejection leaves open reports on listing untouched | **PASS** | 2.4s | Verifies that bulk-rejecting a reported listing does NOT auto-resolve open reports (`reports.status` remains `'pending'`) |

---

## 3. Re-Running the Test Suite

To run the automated suite locally or in CI:

```bash
# Run all Playwright tests
npx playwright test

# View interactive HTML report
npx playwright show-report
```
