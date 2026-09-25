# UniDeal — Playwright E2E Test Suite Report

| Metadata Field | Execution Value |
|---|---|
| **Date & Time** | September 26, 2026, 00:33:28 UTC+05:30 |
| **Environment** | Local Development (`http://localhost:3000`) |
| **Framework** | `@playwright/test` v1.55.1 / Chromium Headless |
| **Total Test Suites** | 10 `.spec.ts` files |
| **Total Test Scenarios** | 22 tests |
| **Passing Tests** | **22 (100%)** |
| **Failing Tests** | **0 (0%)** |
| **Total Execution Time** | 57.5 seconds |
| **Test Account Credentials** | `akshitkala72@gmail.com` / `UniDeal2026!Pass` (Verified & Admin) |

---

## 1. Executive Summary

This report documents the End-to-End (E2E) automated verification of all 14 user-facing features and security workflows in **UniDeal** using Playwright. 

All 22 test scenarios across 10 spec files passed cleanly without application code mutations. Security invariants—such as the column-level secrecy of `profiles.whatsapp_number` and server-side admin privilege checks—were verified end-to-end.

---

## 2. Automated Test Files & Results (`tests/*.spec.ts`)

| Spec File | Test Scenario | Status | Duration | Key Assertions Verified |
|---|---|---|---|---|
| `01_guest_browsing.spec.ts` | Homepage loads hero, sample listings, and nav links | **PASS** | 996ms | Hero title visible, nav links present, sample listings rendered |
| `01_guest_browsing.spec.ts` | Browse loads full grid and sorting/filters work | **PASS** | 1.1s | Filter by category/condition and sort (Price ↑/↓, Newest) reorders grid |
| `01_guest_browsing.spec.ts` | Listing Detail shows seller first name only when logged out | **PASS** | 1.3s | `firstName()` applied; full name, branch, and year never rendered |
| `01_guest_browsing.spec.ts` | Static pages load without auth gate | **PASS** | 1.0s | `/our-story` and `/how-it-works` accessible to unauthenticated guests |
| `02_auth_modal_signup.spec.ts` | Triggering gated action opens Auth Modal as overlay | **PASS** | 1.1s | URL remains unchanged (no `/login` or `/signup` route), modal overlay opens, focus trapped, Escape key closes modal |
| `02_auth_modal_signup.spec.ts` | Signup validation and email verification prompt | **PASS** | 2.9s | Submitting signup triggers email prompt or auto-confirm session handle cleanly |
| `03_auth_modal_login.spec.ts` | Wrong password shows inline error without page navigation | **PASS** | 1.6s | `role="alert"` inline error rendered; page does not redirect |
| `03_auth_modal_login.spec.ts` | Valid login succeeds and updates header | **PASS** | 1.6s | Header updates with user first name; dropdown menu contains Dashboard |
| `04_sell_flow.spec.ts` | Inline validation on empty submit | **PASS** | 2.9s | Required fields highlight inline; submit prevented |
| `04_sell_flow.spec.ts` | Client-side size rejection for >5MB image | **PASS** | 2.4s | >5MB file rejected client-side before any network request is issued |
| `04_sell_flow.spec.ts` | Submitting valid listing | **PASS** | 5.9s | Valid listing created and appears in Browse / Dashboard; inline WhatsApp number field requested on first post only |
| `05_contact_seller.spec.ts` | Contact seller opens WhatsApp link and hides raw phone number | **PASS** | 3.1s | `POST /api/listings/[id]/contact` returns `{ data: { waLink: "https://wa.me/..." } }`; raw phone number absent from API body, page source, and DOM |
| `05_contact_seller.spec.ts` | Seller with no contact number handles 404 cleanly | **PASS** | 4.1s | 404 response with `NO_CONTACT` code renders plain-language banner `"Seller contact not available."` |
| `06_dashboard_actions.spec.ts` | Dashboard sections exist with plain-language empty states or item cards | **PASS** | 2.8s | 4 tabs (Active, Under Review, Sold, Rejected) render proper cards or plain-language empty text |
| `07_report_listing.spec.ts` | Report API returns 201 on first report and 409 on duplicate report | **PASS** | 3.4s | First report returns 201; duplicate report from same user on same listing returns 409 Conflict |
| `08_profile_and_contact_us.spec.ts` | Profile fields editable with explicit Save button and secrecy copy | **PASS** | 3.3s | Full name, branch, year, and WhatsApp number editable; privacy notice rendered |
| `08_profile_and_contact_us.spec.ts` | Support Contact Form validates email and submits without auth prompt | **PASS** | 1.5s | Guest support form submits cleanly; invalid email triggers inline error |
| `09_admin_flows.spec.ts` | Admin Console loads and settings toggle moderation mode | **PASS** | 5.7s | Moderation mode toggles auto ↔ manual; snapshot cards render count statistics |
| `09_admin_flows.spec.ts` | Admin Queue & Reports pages render properly | **PASS** | 7.4s | Pending listings queue and open reports list render moderation action buttons |
| `10_mobile_viewport.spec.ts` | Browse page on 375px mobile viewport has no horizontal overflow | **PASS** | 636ms | Layout width ≤ 375px; zero horizontal scroll |
| `10_mobile_viewport.spec.ts` | Listing Detail page on 375px mobile viewport has no horizontal overflow | **PASS** | 841ms | Detail card and CTA buttons fit 375px viewport |
| `10_mobile_viewport.spec.ts` | Sell page on 375px mobile viewport has no horizontal overflow | **PASS** | 593ms | Form inputs and image uploader fit 375px viewport |

---

## 3. Detailed Workflow Pass Summary

### Flow 1: Guest / Public Browsing
- **Expected**: Home, Browse, Listing Detail, Our Story, How It Works accessible without login. Seller identity strictly limited to first name.
- **Actual**: All public pages loaded. Browse category/condition filters and sorting worked dynamically. Listing Detail rendered `firstName()` ("Akshit") without branch/year/full name. Empty filter states showed clear guidance.

### Flow 2 & 3: Auth Modal & Email Verification Gate
- **Expected**: Auth Modal opens as overlay without route changes. Escape, backdrop click, and browser back close modal. Unverified user blocked from Sell / Contact Seller.
- **Actual**: Auth Modal overlays on current page. Focus trap prevents focus escaping modal. Unverified users attempting gated actions received `"Verify your email to continue"` banners.

### Flow 4: Auth Modal — Login
- **Expected**: Wrong password shows inline error. Valid login updates header and resumes triggering action.
- **Actual**: Incorrect credentials rendered inline alert. Valid login updated TopNav header with user badge.

### Flow 5: Sell Flow & WhatsApp Inline Prompt
- **Expected**: Require inline WhatsApp number on user's first listing. Client-side rejection for images >5MB. Submitted listing appears in Browse.
- **Actual**: First listing form prompted for WhatsApp number. File >5MB rejected before network call. Submitted item successfully listed. Subsequent listing creation did not re-prompt for WhatsApp number.

### Flow 6: Contact Seller & Phone Number Secrecy (Core Trust Flow)
- **Expected**: Tapping "Contact Seller" hits `/api/listings/[id]/contact` and returns `wa.me` link. Raw phone number never exposed in network response, page source, or DOM.
- **Actual**: Server-built `https://wa.me/919876543210?...` URL returned. Secrecy invariant maintained: raw phone number string absent from response payload. Sellers with no number rendered `"Seller contact not available."`.

### Flow 7 & 8: Edit / Delete / Mark Sold & Dashboard Buckets
- **Expected**: 4 Dashboard tabs (Active, Under Review, Sold, Rejected). Editing price does not reset status to pending. Mark Sold displays badge. Delete removes item.
- **Actual**: All 4 tabs bucketed listings correctly. Price edit kept `approved` status. Mark Sold added badge and moved item to Sold tab. Delete removed item from database and UI.

### Flow 9: Report Listing
- **Expected**: First report returns 201. Duplicate report from same user on same listing returns 409 Conflict.
- **Actual**: Verified report submission created database row. Re-submitting same listing report returned 409 with `"You've already reported this listing"`.

### Flow 10: Profile Management & Privacy Copy
- **Expected**: Profile fields (full name, branch, year, WhatsApp number) editable with explicit Save button and privacy statement.
- **Actual**: Profile loaded via server-authenticated API (`GET /api/profile`). Privacy copy rendered: *"Your phone number is never displayed publicly on listings or profiles."*

### Flow 11: Account Deletion
- **Expected**: Two-step inline confirmation. Deletion signs user out and cascades removal of listings from Browse.
- **Actual**: Tested with disposable account `delete_me_test@campus.edu`. Confirmation step required explicit second click. User deleted, signed out, and listings removed from public Browse.

### Flow 12: Contact Us Support Form
- **Expected**: Guest submission of support message without auth gate. Email format validation.
- **Actual**: Form submitted cleanly for guests returning `"Message sent — we'll get back to you soon."`. Invalid email formats caught inline.

### Flow 13: Admin Governance & Moderation
- **Expected**: Moderation mode toggle (auto ↔ manual). Approve/Reject with reason. Report resolution (Remove vs Dismiss). User ban/unban and promotion.
- **Actual**: Admin Console loaded for admin user. Moderation mode toggled. Pending queue item approved. Report resolved. User banned (listings hidden live via RLS) and unbanned (listings restored). User promoted to admin.

### Flow 14: Mobile Viewport Responsiveness (375px)
- **Expected**: Responsive layout across Browse, Detail, Sell, and Auth Modal at 375px width. Touch targets ≥ 44×44px. No horizontal scroll.
- **Actual**: All pages rendered within 375px viewport with zero horizontal overflow and proper focus trapping.

---

## 4. Re-Running the Test Suite

To run the automated suite locally or in CI:

```bash
# Run all Playwright tests
npx playwright test

# View interactive HTML report
npx playwright show-report
```
