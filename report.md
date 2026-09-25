# UniDeal — QA Findings Report

| Field | Value |
|---|---|
| Date | September 22, 2026 |
| Audited against | PRD v2.1 §7, TRD v1.1 §8, appflow.md, rules.md v1.1 |
| Scope | All 49 acceptance criteria across 9 parts |
| Total findings | 9 (2 FAIL, 5 DEVIATION, 2 FAIL-within-PASS) |

---

## Part 1 — Guest / First-Time Visitor Flows

| # | Result | Flow | Notes |
|---|---|---|---|
| 1 | PASS | Home loads with no auth | Server component, no gate, all sections render at 375px |
| 2 | PASS | Browse usable without login | Category/condition filters, sort, search all work. No auth required |
| 3 | PASS | Listing Detail viewable without login | `firstName()` applied, full name/branch/year never exposed |
| 4 | PASS | Our Story / How It Works load with no auth gate | Both in `(public)` route group, no layout guard |
| 5 | PASS | Contact Us submittable while logged out | `POST /api/contact` has no auth check — per TRD §5.12 |
| 6 | PASS | Contact Seller while logged out → Auth Modal | `ContactSellerButton` calls `openAuthModal()`, no `/login` route |
| 7 | PASS | Sell while logged out → Auth Modal with returnTo=/sell | `TopNav.handleSellClick` opens modal with `returnTo: '/sell'` |

---

## Part 2 — Auth Flows

| # | Result | Flow | Notes |
|---|---|---|---|
| 8 | DEVIATION | Signup → Auth Modal closes | Modal does **not** auto-close after signup — it shows "Check your inbox" panel inside the still-open modal. User must manually close. appflow.md §2 says "modal closes → user resumes browsing." Functional but deviates from spec. Route: any page with modal |
| 9 | PASS | Sell/Contact blocked for unverified user with clear message | `SellPage` and `ContactSellerButton` both show explicit messages, not silent failures |
| 10 | DEVIATION | Post-verification action resumption | After clicking the email link, page shows two manual navigation links. Spec says "action resumes automatically" — architecturally impractical for an email-link flow. Deliberate constraint; confirm accepted. Route: `/verify-email` |
| 11 | PASS | Login success closes modal and resumes returnTo | `handleAuthSuccess()` calls `closeAuthModal()` then `router.push(returnTo)` |
| 12 | PASS | Login failure shows inline error, modal stays open | `generalError` rendered in `role="alert"` div, no navigation |
| 13 | PASS | Auth Modal keyboard/interaction behavior | Escape, backdrop click, Tab trap, browser back all implemented per design.md §5.3 |
| 13b | FAIL | Focus trap doesn't re-query on error state | `useEffect` deps are `[isAuthModalOpen, tab, signupSuccessEmail]` — `generalError` excluded. If a future change makes the error div interactive, the trap silently breaks. Low severity. Route: Auth Modal |

---

## Part 3 — Contact Seller (Core Trust Flow)

| # | Result | Flow | Notes |
|---|---|---|---|
| 14 | PASS | Verified user under limit → WhatsApp opens with pre-filled title | Full check sequence correct, `buildWhatsAppLink` includes listing title |
| 15 | PASS | Phone number never in API response body | Response is `{ data: { waLink } }` only — no raw number field |
| 16 | PASS | Banned user → 403 | Route checks `profile?.is_banned` via admin client |
| 17 | PASS | Unverified user → 403 "Verify your email to contact sellers" | Exact message matches spec |
| 18 | PASS | Rate limit: 51st attempt → 429 "Daily limit reached. Try again tomorrow." | Rolling 24h window, count check against `contact_reveals` |
| 19 | PASS | No seller number set → 404 "Seller contact not available" | Not a crash or silent failure |

---

## Part 4 — Sell / Edit / Dashboard Flows

| # | Result | Flow | Notes |
|---|---|---|---|
| 20 | PASS | Sell form: single page, no wizard | All fields inline, `inputMode="numeric"` on price |
| 20b | DEVIATION | Edit button shown on rejected listings | Dashboard renders Edit for all statuses except `sold`. Editing a rejected listing won't auto-reset its status (per TRD §5.7), but this scenario isn't documented as intentional. Confirm whether sellers should be able to edit rejected listings or if the button should be hidden. Route: `/dashboard` |
| 21 | PASS | Image >5MB rejected client-side before any network call | Size check runs before `fetch()`, inline error shown |
| 22 | PASS | approval_mode='auto' → listing live immediately | `POST /api/listings` sets `status = 'approved'` |
| 23 | PASS | approval_mode='manual' → "Under Review" in Dashboard, not in Browse | `status = 'pending'`, Browse filters `status = 'approved'` only |
| 24 | PASS | Edit PATCH does not reset status to pending | `updateListingSchema` is a partial of createListingSchema — no `status` field accepted |
| 25 | PASS | Mark as Sold → drops from public Browse | Sets `status = 'sold'`, RLS/query filters it out |
| 26 | PASS | Delete: seller can delete own listing | RLS `listings_delete_own` enforced |
| 27 | PASS | Dashboard four tabs with correct status mapping | Active/Under Review/Sold/Rejected match TRD §5.8 exactly |
| 28 | PASS | Rejected listings show rejection_reason on seller's card | Conditional render with danger-tinted box |

---

## Part 5 — Report Flow

| # | Result | Flow | Notes |
|---|---|---|---|
| 29 | PASS | Verified user can report with fixed reason dropdown | `reason` validated against enum, auth required |
| 30 | PASS | Duplicate report → 409 "You've already reported this listing" | Catches `insertError.code === '23505'` — not a raw DB error |
| 31 | PASS | Reported listing stays live until admin acts | No auto-hide; report status insert doesn't change listing status |

---

## Part 6 — Admin Flows

| # | Result | Flow | Notes |
|---|---|---|---|
| 32 | FAIL | Admin Overview missing snapshot cards | `app/admin/page.tsx` shows only the approval mode toggle. Missing: pending listings count, open reports count, total users count. Spec (PRD §7, design.md §7.12) requires these snapshot cards. Route: `/admin` |
| 33 | PASS | Approval mode toggle doesn't affect existing listings | `PATCH /api/admin/settings` only updates `admin_settings` row |
| 34 | PASS | Pending Queue: Approve/Reject with required reason | Inline reject form requires non-empty reason; reason persists to `rejection_reason` |
| 35 | PASS | Reports: Remove → listing=rejected + report=resolved_removed; Dismiss → listing untouched | Both branches correct in `resolve/route.ts` |
| 36 | PASS | Ban: listings disappear from public Browse immediately | RLS `listings_select_public` policy excludes `is_banned = true` sellers |
| 37 | PASS | Unban reverses immediately | Sets `is_banned = false`, RLS re-includes listings in Browse |
| 38 | PASS | Promote: any admin can promote, no super-admin tier | `requireAdminSession()` allows any admin; sets `is_admin = true` |
| 39 | FAIL | Non-admin can view `/admin` UI — no server-side page guard | `app/admin/layout.tsx` is a client component with nav UI only. No server redirect or `is_admin` check in any admin page. A non-admin reaching `/admin` sees the full admin interface. API routes are protected (won't execute actions), but the page itself is unguarded. Routes: `/admin`, `/admin/listings/pending`, `/admin/reports`, `/admin/users` |

---

## Part 7 — Security / RLS Spot-Checks

| # | Result | Check | Notes |
|---|---|---|---|
| 40 | PASS | `profiles.whatsapp_number` unreadable via client-side query | Migration applies `REVOKE SELECT ON public.profiles FROM anon, authenticated` then grants back all columns except `whatsapp_number`. Confirmed in migration SQL and progress.md verification log |
| 40b | FAIL | Profile page queries `whatsapp_number` on the client | `app/(account)/profile/page.tsx` calls `supabase.from('profiles').select('full_name, branch, year, whatsapp_number')` from a `'use client'` component. The column REVOKE means this field returns `null` silently — the WhatsApp number input will always be blank on load even when a number is saved. The user can type a number and save it but can never see their current stored value. Functional bug for profile management. Route: `/profile` |
| 41 | PASS | Admin actions blocked for non-admins via direct API call | All admin routes call `requireAdminSession()` which re-checks `is_admin` server-side via admin client |
| 42 | PASS | category_id / price / status / seller_id validated server-side | `createListingSchema` validates all fields; `status` and `seller_id` set server-side, never trusted from client |

---

## Part 8 — Contact Us (Support Form)

| # | Result | Flow | Notes |
|---|---|---|---|
| 43 | PASS | Submittable while logged out | No auth check in route or component |
| 44 | DEVIATION | Success message phrasing | Component shows "Message sent." / "We'll get back to you soon." as separate paragraphs. Spec (appflow.md §12, design.md §7.11) specifies: "Message sent — we'll get back to you soon." (single line with em-dash). Content identical, phrasing differs. Route: `/contact` |
| 45 | PASS | Resend failure shows plain-language error, raw error not exposed | Catch block logs server-side, returns `"Couldn't send your message. Please try again later."` |

---

## Part 9 — Cross-Cutting

| # | Result | Check | Notes |
|---|---|---|---|
| 46 | PASS | Empty states are descriptive with next-step guidance | Browse, Dashboard (per tab), Admin Pending Queue, Admin Reports all have specific, actionable empty state copy |
| 47 | PASS | API error shape consistent, status codes correct | All routes return `{ error: { message, code? } }` / `{ data: ... }`. 401/403/404/400/409/429/500 all used correctly |
| 48 | PASS | All flows functional at 375px, 44px touch targets | `min-h-[44px]` on all interactive elements, mobile-first layout, no horizontal scroll |
| 49 | PASS | Visible focus rings on all interactive elements | `focus:ring-2 focus:ring-primary` present throughout, including inside Auth Modal |
| 49b | DEVIATION | TopNav shows Admin link to all logged-in users | Profile dropdown renders the Admin link regardless of `is_admin`. Non-admins see it, can navigate to `/admin`, and view the admin UI (see finding #39). Should be gated on `is_admin` from `public_profiles`. Route: nav dropdown |

---

## Part 10 — v1.2 Additions & Governance Pass (2026-09-26)

| # | Result | Check | Notes |
|---|---|---|---|
| 50 | PASS | 50/day Contact Reveal Rate-Limit Verification | 51st reveal attempt in 24h window returns `429 RATE_LIMITED` ("Daily limit reached. Try again tomorrow.") and UI renders warning banner |
| 51 | PASS | Auth Modal Signup Verification Guidance | Verification notification panel displays clear heading ("Check your inbox"), recipient email, and focus-trapped navigation buttons |
| 52 | PASS | Admin Single Reject on any listing | `PATCH /api/admin/listings/[id]/reject` updates `status = 'rejected'` and persists `rejection_reason` from `/admin/listings` view |
| 53 | PASS | Admin Bulk Reject (`PATCH /api/admin/listings/bulk-reject`) | Accepts `{ listing_ids, reason }`, inline confirmation ("Reject N listings?"), handles partial failure (skipping sold/rejected items) without erroring batch |
| 54 | PASS | Open reports left untouched on bulk reject | Deliberate governance decision: bulk rejection leaves open pending reports in the report queue for separate human review |

---

## Tickets Summary

| Ticket | Severity | Route | Issue |
|---|---|---|---|
| **QA-01** | 🔴 HIGH | `/admin`, `/admin/*` | Fixed (layout server guard `requireAdminSession()` redirects non-admins) |
| **QA-02** | 🔴 HIGH | `/profile` | Fixed (`GET /api/profile` server endpoint loads owner-only WhatsApp number) |
| **QA-03** | 🟡 MEDIUM | `/admin` | Fixed (`GET /api/admin/overview` renders snapshot cards) |
| **QA-04** | 🟡 MEDIUM | TopNav (all pages) | Fixed (gated on `is_admin` state) |
| **QA-05** | 🟢 LOW | Auth Modal | Accepted decision (stays open on inbox-check panel) |
| **QA-06** | 🟢 LOW | `/verify-email` | Accepted constraint (manual navigation links) |
| **QA-07** | 🟢 LOW | `/dashboard` | Accepted decision (Edit button hidden on rejected listings) |
| **QA-08** | 🟢 LOW | `/contact` | Fixed (single line success text) |
| **QA-09** | 🟢 LOW | Auth Modal | Fixed (`generalError` added to focus-trap deps) |
| **v1.2-01**| 🟢 PASS | `/admin/listings` | Admin single & bulk reject with inline confirmation and partial failure handling (v1.2 addition) |

