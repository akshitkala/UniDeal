# Orphan-Feature Audit

Date: 2026-10-17  
Scope: TRD Section 5 & Architecture v1.1 Feature Inventory (plus all codebase API routes)  
Status: Report only. No UI changes applied.

---

## 1. Audit Summary

| Category | Count |
|---|---|
| Routes with Active UI Triggers | 18 |
| Routes with Background/System Triggers (e.g. Cron) | 1 |
| Routes with NO UI (Server-side SSR query bypass or unused endpoint) | 5 |

---

## 2. TRD Section 5 & Architecture Feature Inventory Cross-Reference

| Method | Endpoint | TRD / Arch Ref | UI Trigger Element | Status | Notes |
|---|---|---|---|---|---|
| `POST` | `/api/listings` | TRD §5.2, Arch §4 | Submit button (`"Post Listing"`) in `components/listing/ListingForm.tsx` on `/sell` | Active UI | Authenticated & verified users only. |
| `GET` | `/api/listings` | TRD §5.3, Arch §4 | Search input, Category chips, Condition filter, Sort dropdown, and pagination in `app/(public)/browse/page.tsx` | Active UI | Public browse endpoint with filters & pagination. |
| `POST` | `/api/listings/[id]/contact` | TRD §5.5, Arch §4 | `"Contact seller on WhatsApp"` button (`components/listing/ContactSellerButton.tsx`) on `/listing/[slug]` | Active UI | Rate-limited WhatsApp reveal (`wa.me` deep link). |
| `POST` | `/api/listings/[id]/sold` | TRD §5.6, Arch §4 | `"Mark Sold"` button in `app/(account)/dashboard/page.tsx` (Active tab) | Active UI | Seller-only action for their own listing. |
| `PATCH` | `/api/listings/[id]` | TRD §5.7, Arch §4 | `"Save Changes"` submit button in `components/listing/ListingForm.tsx` on `/listing/[slug]/edit` | Active UI | Reuses sell form, pre-filled with listing data. |
| `DELETE` | `/api/listings/[id]` | TRD §5.7, Arch §4 | `"Delete"` button with confirmation prompt in `app/(account)/dashboard/page.tsx` | Active UI | Seller-only listing deletion. |
| `POST` | `/api/listings/[id]/report` | TRD §5.8, Arch §4 | `"Submit Report"` button in report modal triggered by `"Report this listing"` (`components/listing/ReportButton.tsx`) on `/listing/[slug]` | Active UI | Verified user report submission with fixed reason dropdown. |
| `PATCH` | `/api/admin/reports/[id]/resolve` | TRD §5.8, Arch §4 | `"Remove Listing"` & `"Dismiss Report"` action buttons in `app/admin/reports/client.tsx` on `/admin/reports` | Active UI | Admin-only moderation decision. |
| `GET` | `/api/admin/reports` | TRD §4, Arch §3/§4 | **NO UI** | Orphan / SSR | `app/admin/reports/page.tsx` fetches pending reports server-side via `getPendingReports()` during SSR. The API route is not called by frontend client components. |
| `GET` | `/api/admin/settings` | TRD §5.9, Arch §4 | **NO UI** | Orphan / SSR | `app/admin/page.tsx` loads platform settings directly server-side via `getAdminSettings()` query. The client does not call GET. |
| `PATCH` | `/api/admin/settings` | TRD §5.9, Arch §4 | Approval mode toggle switch (`"Auto"` / `"Manual"`) in `app/admin/client.tsx` on `/admin` | Active UI | Updates `approval_mode` on platform. |
| `GET` | `/api/admin/listings/pending` | TRD §5.9, Arch §4 | **NO UI** | Orphan / SSR | `app/admin/listings/pending/page.tsx` fetches queue server-side via `getPendingListings()`. No client fetch calls this route. |
| `PATCH` | `/api/admin/listings/[id]/approve` | TRD §5.9, Arch §4 | `"Approve"` button in `app/admin/listings/pending/client.tsx` on `/admin/listings/pending` | Active UI | Admin-only manual mode approval. |
| `PATCH` | `/api/admin/listings/[id]/reject` | TRD §5.9, Arch §4 | `"Reject"` button with reason modal in `app/admin/listings/pending/client.tsx` and `app/admin/listings/page.tsx` | Active UI | Admin-only rejection with reason. |
| `POST` | `/api/admin/users/[id]/ban` | TRD §5.10, Arch §4 | `"Ban"` button in `app/admin/users/client.tsx` on `/admin/users` | Active UI | Admin user management. |
| `POST` | `/api/admin/users/[id]/unban` | TRD §5.10, Arch §4 | `"Unban"` button in `app/admin/users/client.tsx` on `/admin/users` | Active UI | Admin user management. |
| `POST` | `/api/admin/users/[id]/promote` | TRD §5.10, Arch §4 | `"Promote to Admin"` button in `app/admin/users/client.tsx` on `/admin/users` | Active UI | Admin user management. |
| `GET` | `/api/cron/keepalive` | TRD §5.11, Arch §4 | **NO UI** | Background Cron | Invoked daily at `0 3 * * *` by Vercel Cron (`vercel.json`) with `CRON_SECRET` bearer token. Intended background infra task. |
| `POST` | `/api/contact` | TRD §5.12, Arch §4 | `"Send Message"` button in `components/contact/ContactForm.tsx` on `/contact` | Active UI | Public support form via Resend. |
| `GET` | `/api/profile` | Arch §3 Blueprint | Fetch on page mount in `app/(account)/profile/page.tsx` and in `components/listing/ListingForm.tsx` (to prefill phone) | Active UI | Owner-only profile fetch bypassing REVOKE on `whatsapp_number`. |
| `DELETE` | `/api/account` | Arch §3 Blueprint | `"Delete Account"` button with confirmation prompt in `app/(account)/profile/page.tsx` | Active UI | Self-service account deletion. |

---

## 3. Additional Codebase Routes (Outside TRD §5)

| Method | Endpoint | Source / Purpose | UI Trigger Element | Status | Notes |
|---|---|---|---|---|---|
| `GET` | `/api/admin/overview` | `app/api/admin/overview/route.ts` (Admin stats snapshot) | **NO UI** | Orphan / SSR | `app/admin/page.tsx` loads statistics server-side via `getAdminOverview()`. Route retained for perf monitoring and test suites. |
| `GET` | `/api/admin/listings` | `app/api/admin/listings/route.ts` (Admin listings view) | Search, status filter, and pagination in `app/admin/listings/page.tsx` | Active UI | Powers the full admin listings management table. |
| `PATCH` | `/api/admin/listings/bulk-reject` | `app/api/admin/listings/bulk-reject/route.ts` (Bulk reject) | `"Bulk Reject"` button on `app/admin/listings/page.tsx` | Active UI | Batch rejection of selected listings. |

---

## 4. Summary of Items Marked NO UI

1. **`GET /api/admin/reports`**: Server Component SSR reads DB directly via `getPendingReports()`.
2. **`GET /api/admin/settings`**: Server Component SSR reads DB directly via `getAdminSettings()`.
3. **`GET /api/admin/listings/pending`**: Server Component SSR reads DB directly via `getPendingListings()`.
4. **`GET /api/cron/keepalive`**: Headless cron endpoint pinged by Vercel Cron, not intended to have UI.
5. **`GET /api/admin/overview`**: Server Component SSR reads DB directly via `getAdminOverview()`.

*Per instructions: no features or UI elements have been built or modified for any items marked NO UI.*
