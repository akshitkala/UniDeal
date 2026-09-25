# UniDeal — Playwright E2E Test Suite Report

| Metadata Field | Execution Value |
|---|---|
| **Date & Time** | September 26, 2026, 00:53:06 UTC+05:30 |
| **Environment** | Local Development (`http://localhost:3000`) |
| **Framework** | `@playwright/test` v1.55.1 / Chromium Headless |
| **Total Test Suites** | 11 `.spec.ts` files |
| **Total Test Scenarios** | 25 tests |
| **Passing Tests** | **25 (100%)** |
| **Failing Tests** | **0 (0%)** |
| **Total Execution Time** | 1.4 minutes (84 seconds) |
| **Test Account Credentials** | `akshitkala72@gmail.com` / `UniDeal2026!Pass` (Verified & Admin) |

---

## 1. Executive Summary

This report documents the End-to-End (E2E) automated verification of all user-facing features, trust mechanisms, security invariants, and moderation workflows in **UniDeal** using Playwright. 

All 25 test scenarios across 11 spec files passed cleanly. Key additions in this pass include:
1. **50/day Contact Rate-Limit Verification**: Verified that the 51st contact attempt within a 24-hour window returns `429 RATE_LIMITED` and displays the daily limit warning banner `"You've reached your daily contact limit. Try again tomorrow."`.
2. **Signup & Email Verification Clarity**: Verified clear modal guidance text, explicit recipient email rendering, and focus-trapped action buttons ("Back to Sign In" / "Close").
3. **Admin Listing Single & Bulk Reject Governance (v1.2 Addition)**:
   - **Single Reject**: Extended single reject pattern (`PATCH /api/admin/listings/[id]/reject`) to work from the general `/admin/listings` view on any listing (approved or pending). Sets `status = 'rejected'` and persists `rejection_reason` for the seller's Dashboard.
   - **Bulk Reject (`PATCH /api/admin/listings/bulk-reject`)**: Implemented admin bulk reject accepting `{ listing_ids, reason }`. Added explicit inline confirmation modal showing the count of affected listings (`"Reject 3 listings?"`). Handles partial failures gracefully (skipping sold, rejected, or invalid listings without failing the batch). Open reports on bulk-rejected listings are left as-is for separate human review.

---

## 2. Automated Test Files & Results (`tests/*.spec.ts`)

| Spec File | Test Scenario | Status | Duration | Key Assertions Verified |
|---|---|---|---|---|
| `01_guest_browsing.spec.ts` | Homepage loads hero, sample listings, and nav links | **PASS** | 1.6s | Hero title visible, nav links present, sample listings rendered |
| `01_guest_browsing.spec.ts` | Browse loads full grid and sorting/filters work | **PASS** | 1.4s | Filter by category/condition and sort (Price ↑/↓, Newest) reorders grid |
| `01_guest_browsing.spec.ts` | Listing Detail shows seller first name only when logged out | **PASS** | 1.3s | `firstName()` applied; full name, branch, and year never rendered |
| `01_guest_browsing.spec.ts` | Static pages load without auth gate | **PASS** | 2.0s | `/our-story` and `/how-it-works` accessible to unauthenticated guests |
| `02_auth_modal_signup.spec.ts` | Triggering gated action opens Auth Modal as overlay | **PASS** | 1.6s | URL remains unchanged (no `/login` or `/signup` route), modal overlay opens, focus trapped, Escape key closes modal |
| `02_auth_modal_signup.spec.ts` | Signup validation and email verification prompt | **PASS** | 6.0s | Submitting signup renders clear heading `"Check your inbox"`, recipient email, and action buttons |
| `03_auth_modal_login.spec.ts` | Wrong password shows inline error without page navigation | **PASS** | 1.6s | `role="alert"` inline error rendered; page does not redirect |
| `03_auth_modal_login.spec.ts` | Valid login succeeds and updates header | **PASS** | 1.7s | Header updates with user first name; dropdown menu contains Dashboard |
| `04_sell_flow.spec.ts` | Inline validation on empty submit | **PASS** | 3.3s | Required fields highlight inline; submit prevented |
| `04_sell_flow.spec.ts` | Client-side size rejection for >5MB image | **PASS** | 2.5s | >5MB file rejected client-side before any network request is issued |
| `04_sell_flow.spec.ts` | Submitting valid listing | **PASS** | 5.4s | Valid listing created and appears in Browse / Dashboard; inline WhatsApp number field requested on first post only |
| `05_contact_seller.spec.ts` | Contact seller opens WhatsApp link and hides raw phone number | **PASS** | 5.3s | `POST /api/listings/[id]/contact` returns `{ data: { waLink: "https://wa.me/..." } }`; raw phone number absent from API body, page source, and DOM |
| `05_contact_seller.spec.ts` | Seller with no contact number handles 404 cleanly | **PASS** | 4.5s | 404 response with `NO_CONTACT` code renders plain-language banner `"Seller contact not available."` |
| `06_dashboard_actions.spec.ts` | Dashboard sections exist with plain-language empty states or item cards | **PASS** | 2.9s | 4 tabs (Active, Under Review, Sold, Rejected) render proper cards or plain-language empty text |
| `07_report_listing.spec.ts` | Report API returns 201 on first report and 409 on duplicate report | **PASS** | 4.1s | First report returns 201; duplicate report from same user on same listing returns 409 Conflict |
| `08_profile_and_contact_us.spec.ts` | Profile fields editable with explicit Save button and secrecy copy | **PASS** | 3.9s | Full name, branch, year, and WhatsApp number editable; privacy notice rendered |
| `08_profile_and_contact_us.spec.ts` | Support Contact Form validates email and submits without auth prompt | **PASS** | 4.5s | Guest support form submits cleanly; invalid email triggers inline error |
| `09_admin_flows.spec.ts` | Admin Console loads and settings toggle moderation mode | **PASS** | 9.3s | Moderation mode toggles auto ↔ manual; snapshot cards render count statistics |
| `09_admin_flows.spec.ts` | Admin Queue & Reports pages render properly | **PASS** | 8.3s | Pending listings queue and open reports list render moderation action buttons |
| `10_mobile_viewport.spec.ts` | Browse page on 375px mobile viewport has no horizontal overflow | **PASS** | 612ms | Layout width ≤ 375px; zero horizontal scroll |
| `10_mobile_viewport.spec.ts` | Listing Detail page on 375px mobile viewport has no horizontal overflow | **PASS** | 765ms | Detail card and CTA buttons fit 375px viewport |
| `10_mobile_viewport.spec.ts` | Sell page on 375px mobile viewport has no horizontal overflow | **PASS** | 658ms | Form inputs and image uploader fit 375px viewport |
| `11_admin_reject_and_ratelimit.spec.ts` | 51st reveal attempt hits 429 and displays daily limit notice | **PASS** | 2.1s | 429 RATE_LIMITED response displays warning banner `"You've reached your daily contact limit. Try again tomorrow."` |
| `11_admin_reject_and_ratelimit.spec.ts` | Rejecting an approved listing persists reason | **PASS** | 5.3s | Admin rejecting approved listing sets `status = 'rejected'` and persists `rejection_reason` |
| `11_admin_reject_and_ratelimit.spec.ts` | Bulk reject handles mixed set (valid + already-sold) cleanly | **PASS** | 2.2s | `PATCH /api/admin/listings/bulk-reject` rejects valid items and reports sold item as skipped without failing batch |

---

## 3. Re-Running the Test Suite

To run the automated suite locally or in CI:

```bash
# Run all Playwright tests
npx playwright test

# View interactive HTML report
npx playwright show-report
```
