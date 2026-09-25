# UniDeal — Architecture

| Field | Value |
|---|---|
| Version | 1.1 |
| Date | September 2026 |
| Companion docs | UniDeal PRD v2.1, UniDeal TRD v1.1, design.md, appflow.md |

> **Changes in this revision:** login/signup flow diagrams updated to reflect the modal overlay pattern (no dedicated route); folder structure updated to match TRD v1.1 (auth modal component, `our-story`/`how-it-works`/`contact` routes, `/api/contact`); feature inventory updated with the three new public pages; nav component descriptions updated for renamed labels ("Our Story", "Contact Us").
>
> **Purpose of this doc:** This is the entry point for understanding how UniDeal works as a system, before diving into the TRD's schema/API-level detail. Read this first to understand *what talks to what* and *where every file lives*; read the TRD for exact SQL, RLS policies, and endpoint contracts. Read `appflow.md` for the consolidated, screen-by-screen user journeys.

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
                        ┌───────────┼────────────┐
                        │ service-role key         │ Resend API
                        │ (contact reveal only)    │ (/api/contact only)
                        ▼                           ▼
             ┌──────────────────────┐    ┌───────────────────────┐
             │  wa.me deep link       │    │  Support email sent    │
             │  → opens WhatsApp      │    │  to founder inbox      │
             └──────────────────────┘    └───────────────────────┘

          ┌──────────────────────────────────────────┐
          │  Vercel Cron (daily) → /api/cron/keepalive │
          │  keeps Supabase project from pausing        │
          └──────────────────────────────────────────┘
```

**Key architectural principle:** the browser talks to Supabase *directly* for most reads (browse, listing detail) using the anon key + RLS — it does not need to round-trip through a Vercel API route for simple reads. Vercel API routes are used specifically where server-side logic, the service-role key, cross-cutting checks (rate limiting, admin-only actions), or a third-party API call (Resend) is required.

**Where each piece owns the logic:**
| Concern | Owner |
|---|---|
| Who can see/edit which rows | Postgres RLS (Supabase) — the real security boundary |
| Which columns are exposed within an allowed row | Postgres column `GRANT`/`REVOKE`, or a view that omits the column entirely (`public_profiles`) |
| Which *part* of an exposed column is rendered | Frontend display layer (`firstName()` utility) — `public_profiles` still returns full `full_name`; first-name-only is a UI rule, not a data-access rule |
| Session/auth state | Supabase Auth, read via Next.js middleware + server components |
| Login/signup presentation | Client-side `AuthModal` component — no dedicated route; browser history is pushed manually so back-navigation closes the modal |
| Rate limiting (50 reveals/day) | Vercel API route (`/api/listings/[id]/contact`), backed by a query against `contact_reveals` |
| Phone number secrecy | Never sent to client except as a constructed `wa.me` link, built server-side with the service-role key |
| Support/contact-form email | Vercel API route (`/api/contact`) using the Resend API and `RESEND_API_KEY` — entirely separate system from the seller `wa.me` contact flow |
| View counters | A narrow `security definer` Postgres function (`increment_listing_views`) |
| Image storage/delivery | Cloudinary directly (browser uploads straight to Cloudinary, bypassing Vercel functions) |
| Keeping infra alive | Vercel Cron, once daily |

---

## 2. App Flow Diagrams

> These are summarized here for system-level context. The full, screen-by-screen flow set (including Sell, Dashboard, Admin, and the new public pages) lives in `appflow.md` — treat that as canonical for flow detail; this section covers only the flows that changed materially in this revision.

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
        │                  [ Auth Modal opens over current page ]
        │                       (returnTo = resume Contact Seller action)
        │
        ├──► taps "Sell" ──► [ Auth Modal opens over current page ]
        │                         (returnTo = /sell)
        │
        ├──► taps "Our Story" ──► [ Our Story ] (static, no auth)
        ├──► taps "How It Works" ──► [ How It Works ] (static, no auth)
        └──► taps "Contact Us" ──► [ Contact Us ] (form, no auth required to submit)
```

Guests can browse, view listing details, and read the static/support pages freely — the modal only appears at the two actions that need trust: contacting a seller, and posting a listing.

### 2.2 Signup → Verification → First action

```
[ Auth Modal, Signup tab ] → submit (email, password, full_name)
        │
        ▼
Supabase Auth creates user ──► trigger creates `profiles` row automatically
        │
        ▼
Verification email sent
        │
        ▼
Modal closes; user can browse immediately (unverified state allowed)
        │
        ├── tries to Sell or Contact Seller
        │         │
        │         ▼
        │   Blocked with "Verify your email to continue" prompt
        │         │
        │         ▼
        │   User clicks link in email → lands on /verify-email → email_confirmed_at set
        │         │
        │         ▼
        │   Action now succeeds
        │
        └── (verifies proactively via banner/reminder) → same unlock
```

Note: `/verify-email` remains the one auth-related **route** in the app (reached via the email link, not an in-app CTA) — login and signup themselves never get a URL.

### 2.3 Browse → Contact Seller (core trust flow)

```
[ Browse ] → filters (category, condition) + sort (newest/price↑/price↓) + search
        │
        ▼
[ Listing Detail ] — shows seller first name, images, price, condition
        │
        ▼
  "Contact Seller" button state depends on auth:
        │
        ├── Not logged in        → Auth Modal opens, resumes this action on success
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

### 2.4 Contact Us flow (new)

```
[ Contact Us page ] → fills name, email, message
        │
        ▼
POST /api/contact
        │
        ▼
Server validates (Zod) → sends via Resend API
        │
        ├── Success → "Message sent — we'll get back to you soon"
        └── Failure → plain-language error, raw error logged server-side only
```

This is fully separate from the seller-contact flow in §2.3 — no auth, no rate limit, no `contact_reveals` row.

---

## 3. Folder & File Structure Blueprint

```
unideal/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                     → Home (static hero, story, how-it-works, sample listings)
│   │   ├── browse/
│   │   │   └── page.tsx                 → Browse (grid + filters + sort)
│   │   ├── listing/
│   │   │   └── [slug]/
│   │   │       └── page.tsx             → Listing detail (standalone page)
│   │   ├── our-story/
│   │   │   └── page.tsx                 → Founder/mission narrative
│   │   ├── how-it-works/
│   │   │   └── page.tsx                 → Visual step-by-step explainer
│   │   └── contact/
│   │       └── page.tsx                 → Contact Us form (nav label "Contact Us")
│   │
│   ├── (auth)/
│   │   └── verify-email/page.tsx        → Only routed auth page; login/signup are the AuthModal
│   │
│   ├── (account)/                       → requires auth, uses layout.tsx to gate
│   │   ├── layout.tsx                   → auth guard wrapper
│   │   ├── sell/page.tsx                → single-form listing creation
│   │   ├── dashboard/
│   │   │   └── page.tsx                 → own listings grouped by status
│   │   ├── listing/[slug]/edit/page.tsx → reuses the Sell form, pre-filled
│   │   └── profile/page.tsx             → name + branch/year + contact number
│   │
│   ├── admin/                           → requires is_admin, own layout guard
│   │   ├── layout.tsx
│   │   ├── page.tsx                     → dashboard overview + approval-mode toggle
│   │   ├── reports/page.tsx
│   │   ├── users/page.tsx
│   │   └── listings/pending/page.tsx    → only relevant in manual mode
│   │
│   └── api/
│       ├── profile/
│       │   └── route.ts                 → GET (owner-only own profile incl. whatsapp_number)
│       ├── account/
│       │   └── route.ts                 → DELETE (self-deletion; FK cascade removes profile + listings)
│       ├── listings/
│       │   ├── route.ts                 → GET (browse), POST (create)
│       │   └── [id]/
│       │       ├── route.ts             → PATCH (edit), DELETE
│       │       ├── sold/route.ts        → POST
│       │       ├── contact/route.ts     → POST (rate-limited reveal — core trust logic)
│       │       └── report/route.ts      → POST
│       ├── contact/
│       │   └── route.ts                 → POST (support form → Resend, new in v1.1)
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
│   ├── auth/
│   │   └── AuthModal.tsx                → Login/Signup tabbed overlay; focus-trapped, Escape closes,
│   │                                       pushes history state, resumes returnTo action on success
│   ├── nav/
│   │   └── TopNav.tsx                   → single responsive nav for both breakpoints: desktop (logo, Browse,
│   │                                       Sell CTA, Sign In → AuthModal, profile dropdown with Dashboard /
│   │                                       Profile / Admin) and <768px (hamburger → inline mobile drawer);
│   │                                       no separate BottomNav component
│   ├── listing/
│   │   ├── ListingCard.tsx              → grid card used in Browse + Dashboard, first-name-only
│   │   ├── ListingForm.tsx              → shared by Sell + Edit
│   │   ├── ListingGrid.tsx
│   │   ├── ContactSellerButton.tsx      → handles all auth/verification/rate-limit states
│   │   └── ReportButton.tsx
│   ├── filters/
│   │   ├── CategoryFilter.tsx
│   │   ├── ConditionFilter.tsx
│   │   └── SortDropdown.tsx
│   ├── contact/
│   │   └── ContactForm.tsx              → used on /contact, posts to /api/contact
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
│   ├── display-name.ts                  → firstName() utility, see TRD §2.1a
│   ├── resend.ts                        → Resend client wrapper for /api/contact
│   └── rate-limit.ts                    → shared contact_reveals count-check logic
│
├── types/
│   └── database.ts                      → generated via `supabase gen types typescript`
│
├── public/
│   └── (static assets, logo, icons)
│
├── middleware.ts (or proxy.ts on Next.js 16+)  → refreshes Supabase session on each request
├── vercel.json                          → cron config for /api/cron/keepalive
└── .env.local                           → see TRD §7 for required variables
```

**Route-group rationale:**
- `(public)` — no auth required, fully crawlable/shareable; now includes `our-story`, `how-it-works`, `contact`
- `(auth)` — only `verify-email` remains as a route; login/signup moved to `components/auth/AuthModal.tsx`
- `(account)` — everything requiring a logged-in user; gated in one shared `layout.tsx`
- `admin/` — separate top-level route (not a group) since it needs its own distinct guard (`is_admin`, not just logged-in) and deliberately has no nav-bar entry point for regular users

---

## 4. Feature Inventory

Cross-reference of every v1 feature, which screen it lives on, and which API route (if any) powers it.

| Feature | Screen(s) | Route(s) |
|---|---|---|
| Email/password signup + verification | Auth Modal, Verify Email | Supabase Auth SDK (no custom route) |
| Browse listings (filter, sort, search) | Browse | `GET /api/listings` |
| View listing detail | Listing Detail | Direct Supabase query (no API route needed) |
| Post a listing | Sell | `POST /api/listings` |
| Edit a listing | Edit (Sell form, pre-filled) | `PATCH /api/listings/[id]` |
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
| Founder story / credibility content | Our Story | Static page, no route |
| Visual how-it-works explainer | How It Works | Static page, no route |
| Support/feedback form | Contact Us | `POST /api/contact` (new) |
| Keep Supabase project alive | (background) | `GET /api/cron/keepalive`, daily |

**Deliberately absent from this inventory** (per PRD v2.1 out-of-scope): in-app chat, AI moderation logic, listing expiry, save/wishlist, dynamic categories, drawer/bottom-sheet detail pattern, multi-campus fields, payments, full name/branch/year shown publicly.
