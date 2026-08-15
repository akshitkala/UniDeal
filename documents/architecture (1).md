# UniDeal — Architecture

| Field | Value |
|---|---|
| Version | 1.0 |
| Date | August 2026 |
| Companion docs | UniDeal PRD v2, UniDeal TRD v1 |

> **Purpose of this doc:** This is the entry point for understanding how UniDeal works as a system, before diving into the TRD's schema/API-level detail. Read this first to understand *what talks to what* and *where every file lives*; read the TRD for exact SQL, RLS policies, and endpoint contracts.

---

## 1. System Topology

```
                         ┌──────────────────────┐
                         │   Browser / Client    │
                         │  (Next.js frontend)   │
                         └──────────┬────────────┘
                                    │
                     ┌──────────────┼────────────────────┐
                     │              │                     │
                     ▼              ▼                     ▼
          ┌──────────────┐  ┌───────────────┐   ┌──────────────────┐
          │   Supabase    │  │  Vercel Edge/  │   │    Cloudinary     │
          │ Auth + Postgres│  │  Node Functions│   │  (image hosting)  │
          │   + RLS        │  │  (/app/api/*)  │   │  unsigned upload  │
          └──────────────┘  └───────┬───────┘   └──────────────────┘
                                    │
                                    │ service-role key
                                    │ (contact reveal only)
                                    ▼
                         ┌──────────────────────┐
                         │  wa.me deep link       │
                         │  → opens WhatsApp      │
                         └──────────────────────┘

          ┌──────────────────────────────────────────┐
          │  Vercel Cron (daily) → /api/cron/keepalive │
          │  keeps Supabase project from pausing        │
          └──────────────────────────────────────────┘
```

**Key architectural principle:** the browser talks to Supabase *directly* for most reads (browse, listing detail) using the anon key + RLS — it does not need to round-trip through a Vercel API route for simple reads. Vercel API routes are used specifically where server-side logic, the service-role key, or cross-cutting checks (rate limiting, admin-only actions) are required. This keeps the architecture lean — not everything needs a custom backend route.

**Where each piece owns the logic:**
| Concern | Owner |
|---|---|
| Who can see/edit which rows | Postgres RLS (Supabase) — the real security boundary |
| Which columns are exposed within an allowed row | Postgres column `GRANT`/`REVOKE`, or a view that omits the column entirely (`public_profiles`) — RLS alone cannot hide a single column on an otherwise-readable row (see rules.md §3) |
| Session/auth state | Supabase Auth, read via Next.js middleware + server components |
| Rate limiting (50 reveals/day) | Vercel API route (`/api/listings/[id]/contact`), backed by a query against `contact_reveals` |
| Phone number secrecy | Never sent to client except as a constructed `wa.me` link, built server-side with the service-role key. All client-facing profile reads (listing detail, guest or logged-in) go through the `public_profiles` view, which structurally omits `whatsapp_number` — not a policy that could be misconfigured, a hard schema guarantee |
| View counters | A narrow `security definer` Postgres function (`increment_listing_views`), same pattern as the signup trigger — bypasses RLS for exactly one column |
| Image storage/delivery | Cloudinary directly (browser uploads straight to Cloudinary, bypassing Vercel functions) |
| Keeping infra alive | Vercel Cron, once daily |

---

## 2. App Flow Diagrams

### 2.1 First-time visitor (not logged in)

```
Instagram / word of mouth
        │
        ▼
   [ Home ]  ── static hero, story, how-it-works, sample listings
        │
        ├──► taps "Browse" ──► [ Browse ] (read-only, full grid+filters, no login required)
        │                             │
        │                             ▼
        │                     [ Listing Detail ]
        │                             │
        │                    taps "Contact Seller"
        │                             │
        │                             ▼
        │                  redirected to [ Login/Signup ]
        │                       (returnTo = listing url)
        │
        └──► taps "Sell" ──► redirected to [ Login/Signup ]
                                   (returnTo = /sell)
```

Guests can browse and view listing details freely — the paywall only appears at the two actions that need trust: contacting a seller, and posting a listing.

### 2.2 Signup → Verification → First action

```
[ Signup form ] → submit (email, password, full_name)
        │
        ▼
Supabase Auth creates user ──► trigger creates `profiles` row automatically
        │
        ▼
Verification email sent
        │
        ▼
User can browse immediately (unverified state allowed)
        │
        ├── tries to Sell or Contact Seller
        │         │
        │         ▼
        │   Blocked with "Verify your email to continue" prompt
        │         │
        │         ▼
        │   User clicks link in email → email_confirmed_at set
        │         │
        │         ▼
        │   Action now succeeds
        │
        └── (verifies proactively via banner/reminder) → same unlock
```

### 2.3 Browse → Contact Seller (core trust flow)

```
[ Browse ] → filters (category, condition) + sort (newest/price↑/price↓) + search
        │
        ▼
[ Listing Detail ] — shows seller name, branch, year, images, price, condition
        │
        ▼
  "Contact Seller" button state depends on auth:
        │
        ├── Not logged in        → redirect to login
        ├── Logged in, unverified→ "Verify email to contact"
        ├── Verified, under limit→ POST /api/listings/[id]/contact
        │         │
        │         ▼
        │   Server checks: not banned, verified, < 50 reveals today
        │         │
        │         ▼
        │   Logs row in `contact_reveals`, builds wa.me link
        │         │
        │         ▼
        │   Returns { waLink } → window.open(waLink)
        │         │
        │         ▼
        │   WhatsApp opens with pre-filled message — deal continues off-platform
        │
        └── Verified, 50/day reached → "Daily limit reached" (disabled state)
```

### 2.4 Sell flow

```
[ Sell ] (single form: title, description, price, negotiable, category, condition, images)
        │
        ▼
Client uploads images directly to Cloudinary (unsigned preset) → gets back URLs
        │
        ▼
POST /api/listings with form data + image URLs
        │
        ▼
Server checks admin_settings.approval_mode
        │
        ├── 'auto'   → status = 'approved' → live immediately, appears in Browse
        └── 'manual' → status = 'pending'  → sits in Dashboard as "Under Review"
                              until an admin approves/rejects
```

### 2.5 Dashboard — status lifecycle

```
                 ┌────────────┐
   created  ───► │  Active     │ (status = 'approved', or 'pending' if manual mode)
                 └─────┬──────┘
                       │
        ┌──────────────┼───────────────┐
        │               │                │
        ▼               ▼                ▼
   seller marks    admin rejects    (manual mode only)
   as Sold         (violates rules)  sits as "Under Review"
        │               │                │ until admin acts
        ▼               ▼                ▼
   status='sold'   status='rejected'  → becomes Active or Rejected
```

No `expired` or `banned` listing states exist — kept simple per scope decisions. A banned *user's* listings are excluded from public Browse via RLS but remain visible on their own Dashboard, unchanged in status.

### 2.6 Report → Admin resolution flow

```
Any verified user → [ Listing Detail ] → "Report" → selects reason
        │
        ▼
INSERT into `reports` (status = 'pending')
   (unique constraint blocks duplicate reports from same user on same listing)
        │
        ▼
Listing stays fully live and unaffected — no auto-hide
        │
        ▼
[ Admin Dashboard → Reports ] → admin reviews
        │
        ├── "Remove" → listing.status = 'rejected', report.status = 'resolved_removed'
        └── "Dismiss" → report.status = 'resolved_dismissed', listing untouched
```

### 2.7 Admin promotion flow

```
[ Admin Dashboard → Users ] → admin selects a user → "Promote to Admin"
        │
        ▼
profiles.is_admin = true for target user
        │
        ▼
Target user now has admin nav access on next session — no separate super-admin tier
```

---

## 3. Folder & File Structure Blueprint

```
unideal/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                     → Home (static hero, story, how-it-works, sample listings)
│   │   ├── browse/
│   │   │   └── page.tsx                 → Browse (grid + filters + sort)
│   │   └── listing/
│   │       └── [slug]/
│   │           └── page.tsx             → Listing detail (standalone page)
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── verify-email/page.tsx
│   │
│   ├── (account)/                       → requires auth, uses layout.tsx to gate
│   │   ├── layout.tsx                   → auth guard wrapper
│   │   ├── sell/page.tsx                → single-form listing creation
│   │   ├── dashboard/
│   │   │   └── page.tsx                 → own listings grouped by status
│   │   ├── listing/[slug]/edit/page.tsx
│   │   └── profile/page.tsx             → name + contact number
│   │
│   ├── admin/                           → requires is_admin, own layout guard
│   │   ├── layout.tsx
│   │   ├── page.tsx                     → dashboard overview
│   │   ├── reports/page.tsx
│   │   ├── users/page.tsx
│   │   └── listings/pending/page.tsx    → only relevant in manual mode
│   │
│   └── api/
│       ├── listings/
│       │   ├── route.ts                 → GET (browse), POST (create)
│       │   └── [id]/
│       │       ├── route.ts             → PATCH (edit), DELETE
│       │       ├── sold/route.ts        → POST
│       │       ├── contact/route.ts     → POST (rate-limited reveal — core trust logic)
│       │       └── report/route.ts      → POST
│       ├── admin/
│       │   ├── settings/route.ts        → GET, PATCH (approval_mode)
│       │   ├── listings/
│       │   │   ├── pending/route.ts     → GET
│       │   │   └── [id]/
│       │   │       ├── approve/route.ts → PATCH
│       │   │       └── reject/route.ts  → PATCH
│       │   ├── reports/
│       │   │   ├── route.ts             → GET
│       │   │   └── [id]/resolve/route.ts→ PATCH
│       │   └── users/
│       │       └── [id]/
│       │           ├── ban/route.ts     → POST
│       │           ├── unban/route.ts   → POST
│       │           └── promote/route.ts → POST
│       └── cron/
│           └── keepalive/route.ts       → GET, protected by CRON_SECRET
│
├── components/
│   ├── nav/
│   │   ├── TopNav.tsx                   → desktop nav (logo, Browse, Sell CTA, Sign In)
│   │   └── BottomNav.tsx                → mobile nav (Home, Browse, Sell, Dashboard, Profile)
│   ├── listing/
│   │   ├── ListingCard.tsx              → grid card used in Browse + Dashboard
│   │   ├── ListingForm.tsx              → shared by Sell + Edit
│   │   ├── ListingGrid.tsx
│   │   ├── ContactSellerButton.tsx      → handles all auth/verification/rate-limit states
│   │   └── ReportButton.tsx
│   ├── filters/
│   │   ├── CategoryFilter.tsx
│   │   ├── ConditionFilter.tsx
│   │   └── SortDropdown.tsx
│   ├── admin/
│   │   ├── ReportsTable.tsx
│   │   ├── UsersTable.tsx
│   │   └── PendingQueue.tsx
│   └── ui/                              → shared primitives (Button, Input, Badge, EmptyState, etc.)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                    → browser client (anon key)
│   │   ├── server.ts                    → server client (cookies-based session)
│   │   └── admin.ts                     → service-role client, server-only
│   ├── cloudinary.ts                    → upload helper, unsigned preset config
│   ├── whatsapp.ts                      → wa.me link builder + message template
│   ├── slug.ts                          → nanoid-based slug generator
│   └── rate-limit.ts                    → shared contact_reveals count-check logic
│
├── types/
│   └── database.ts                      → generated via `supabase gen types typescript`
│
├── public/
│   └── (static assets, logo, icons)
│
├── middleware.ts                        → refreshes Supabase session on each request
├── vercel.json                          → cron config for /api/cron/keepalive
└── .env.local                           → see TRD §7 for required variables
```

**Route-group rationale:**
- `(public)` — no auth required, fully crawlable/shareable
- `(auth)` — login/signup/verify, redirects away if already logged in
- `(account)` — everything requiring a logged-in user; gated in one shared `layout.tsx` rather than checking auth in every page
- `admin/` — separate top-level route (not a group) since it needs its own distinct guard (`is_admin`, not just logged-in) and deliberately has no nav-bar entry point for regular users

---

## 4. Feature Inventory

Cross-reference of every v1 feature, which screen it lives on, and which API route (if any) powers it — useful as a build checklist.

| Feature | Screen(s) | Route(s) |
|---|---|---|
| Email/password signup + verification | Signup, Verify Email | Supabase Auth SDK (no custom route) |
| Browse listings (filter, sort, search) | Browse | `GET /api/listings` |
| View listing detail | Listing Detail | Direct Supabase query (no API route needed) |
| Post a listing | Sell | `POST /api/listings` |
| Edit a listing | Edit | `PATCH /api/listings/[id]` |
| Delete a listing | Dashboard | `DELETE /api/listings/[id]` |
| Mark as sold | Dashboard, Listing Detail (own) | `POST /api/listings/[id]/sold` |
| Contact seller via WhatsApp | Listing Detail | `POST /api/listings/[id]/contact` |
| Rate limiting (50/day) | (enforced server-side) | within contact route |
| Report a listing | Listing Detail | `POST /api/listings/[id]/report` |
| View own listings by status | Dashboard | Direct Supabase query, filtered by `seller_id` |
| View/edit account info | Profile | Direct Supabase query + update |
| Toggle approval mode | Admin | `GET/PATCH /api/admin/settings` |
| Review pending listings (manual mode) | Admin | `GET /api/admin/listings/pending`, approve/reject routes |
| Review + resolve reports | Admin | `GET /api/admin/reports`, resolve route |
| Ban / unban users | Admin | `POST /api/admin/users/[id]/ban` `/unban` |
| Promote user to admin | Admin | `POST /api/admin/users/[id]/promote` |
| Keep Supabase project alive | (background) | `GET /api/cron/keepalive`, daily |

**Deliberately absent from this inventory** (per PRD v2 out-of-scope): in-app chat, AI moderation logic, listing expiry, save/wishlist, dynamic categories, drawer/bottom-sheet detail pattern, multi-campus fields, payments.
