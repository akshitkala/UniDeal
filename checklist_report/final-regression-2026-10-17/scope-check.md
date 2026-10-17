# Scope Check — Extra API Routes Audit (Step 1c)

**Audit Target**: Every route in `app/api` compared against authoritative specification documents (`documents/UniDeal_TRD_v1.1.md` Section 5 and `documents/architecture_v1.1.md`).

---

## 1. Routes Defined in TRD Section 5 & Architecture

The following 15 routes are explicitly defined in TRD §5 and architecture documentation:

| HTTP Method | Route | TRD Section | Purpose |
|---|---|---|---|
| GET, POST | `/api/listings` | §5.2 | Browse active listings (filter/sort/search) and create new listing |
| PATCH, DELETE | `/api/listings/[id]` | §5.3 | Edit listing details and soft/hard delete listing |
| POST | `/api/listings/[id]/sold` | §5.4 | Transition listing status to 'sold' |
| POST | `/api/listings/[id]/contact` | §5.5 | Rate-limited seller contact reveal generating signed wa.me link |
| POST | `/api/listings/[id]/report` | §5.8 | Submit spam/inappropriate listing report |
| POST | `/api/contact` | §5.12 | Support contact form sending email via Resend API |
| GET, PATCH | `/api/admin/settings` | §5.6 | Read and update system approval mode (auto / manual) |
| GET | `/api/admin/listings/pending` | §5.7 | Fetch pending listings queue for manual review |
| PATCH | `/api/admin/listings/[id]/approve` | §5.7 | Approve a pending listing |
| PATCH | `/api/admin/listings/[id]/reject` | §5.7 | Reject a pending listing with required reason |
| GET | `/api/admin/reports` | §5.9 | List open user reports |
| PATCH | `/api/admin/reports/[id]/resolve` | §5.9 | Mark a report as resolved |
| POST | `/api/admin/users/[id]/ban` | §5.10 | Ban a user and hide all their active listings |
| POST | `/api/admin/users/[id]/promote` | §5.11 | Promote a verified user to admin role |
| GET | `/api/cron/keepalive` | §5.13 | Daily Vercel cron ping preventing Supabase project pausing |

---

## 2. Extra Routes in `app/api` (NOT in TRD §5 or Architecture)

Per instructions, none of these routes were removed. All are documented below with their purpose and justification:

| Route | Methods | Purpose & Operational Justification |
|---|---|---|
| **`/api/account`** | `DELETE` | **Account Self-Deletion**: Allows an authenticated student user to permanently delete their account and cascade-delete their listings/reveals/reports in compliance with student data privacy expectations and DPDP/GDPR account deletion standards. |
| **`/api/profile`** | `GET`, `PUT` | **Secure Profile Management**: Enables authenticated users to view and update their branch, year, full name, and WhatsApp number. Required because direct client-side `SELECT whatsapp_number` is revoked by RLS for authenticated users; this route uses the server-side client to read/write the phone number securely. |
| **`/api/admin/listings`** | `GET` | **Admin Listings Management Table**: Powers the admin listing moderation table on `/admin/listings`, enabling the administrator to browse, search, and inspect all listings (active, pending, rejected, sold) with server-side pagination. |
| **`/api/admin/listings/bulk-reject`** | `PATCH` | **Admin Bulk Moderation**: Allows an administrator to reject multiple flagged or spam listings simultaneously from the review queue with a single batch operation rather than one by one. |
| **`/api/admin/overview`** | `GET` | **Admin Dashboard Metrics Widget**: Aggregates live platform counters (total active users, active listings, pending review count, open reports) to populate the admin overview dashboard widgets on `/admin`. |
| **`/api/admin/users/[id]/unban`** | `POST` | **Admin User Unban Lifecycle**: While TRD §5.10 specified the ban endpoint, unban was implemented to complete the moderation lifecycle so admins can reverse accidental bans. |

---

## 3. Summary & Scope Conclusion

- Total `app/api` routes: **21 routes**.
- Authoritative spec routes: **15 routes**.
- Extension routes: **6 routes**.
- All 6 extension routes serve necessary operational roles (data privacy, secure profile read, admin UX) and maintain all authentication and authorization invariants.
