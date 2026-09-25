# UniDeal — App Flow

| Field | Value |
|---|---|
| Version | 1.0 |
| Date | September 2026 |
| Companion docs | PRD v2.1, TRD v1.1, architecture.md v1.1, rules.md v1.1, design.md |

> **Purpose:** This is the canonical, consolidated set of user journeys through UniDeal — every screen, every state, every branch. `architecture.md` §2 covers system-level flow context; this document is the full detail, one flow per journey, cross-referenced to the screen it touches (see `design.md` §7 for visual specs of each screen named here).

---

## 1. First-Time Visitor (Not Logged In)

```
Instagram / word of mouth
        │
        ▼
   [ Home ]
        │
        ├──► "Browse" ──► [ Browse ] (full grid, filters, sort — no login required)
        │                       │
        │                       ▼
        │               [ Listing Detail ]
        │                       │
        │              taps "Contact Seller"
        │                       │
        │                       ▼
        │         [ Auth Modal opens over Listing Detail ]
        │              (returnTo = resume Contact Seller)
        │
        ├──► "Sell" ──► [ Auth Modal opens ] (returnTo = /sell)
        │
        ├──► "Our Story" ──► [ Our Story ] (static, no gate)
        ├──► "How It Works" ──► [ How It Works ] (static, no gate)
        └──► "Contact Us" ──► [ Contact Us ] (form, no gate to submit)
```

Guests can browse, view listing details, and read all three support/credibility pages freely. The Auth Modal only appears at the two actions that need trust: contacting a seller, and posting a listing.

---

## 2. Signup → Verification → First Action

```
[ Auth Modal, Signup tab ] → email, password, full_name
        │
        ▼
Supabase Auth creates user → trigger creates `profiles` row
        │
        ▼
Verification email sent → modal shows "Check your inbox" panel (stays open until user closes it — QA-05 decision: intentional, see note) → user resumes browsing
        │
        ├── tries to Sell or Contact Seller while unverified
        │         │
        │         ▼
        │   Blocked: "Verify your email to continue"
        │         │
        │         ▼
        │   Clicks email link → lands on [ Verify Email ] route → email_confirmed_at set
        │         │
        │         ▼
        │   Action now succeeds when retried (no auto-resume — QA-06, see note)
        │
        └── verifies proactively via banner/reminder → same unlock
```

> **QA-05 decision (2026-09-22):** the modal intentionally stays open on the "Check your inbox" panel after signup. The panel carries the essential next step (which address was used, click the link); auto-closing after a delay risks hiding that instruction before it is read, and an unverified user has no actionable flow to resume (Sell / Contact Seller are blocked until verification anyway).
>
> **QA-06 — known limitation (v1):** automatic resumption of the interrupted action after email-link verification is **not** supported. The triggering action's context (`returnTo` / `onSuccess`) lives in client state on the originating page and cannot survive the email-client round-trip; carrying it would require server-side session state or URL hand-off through the email link — disproportionate for v1. The Verify Email page therefore shows manual navigation links (Browse / Sell) instead of auto-resuming. Accepted constraint, not an unmet spec item.

---

## 3. Login (Returning User)

```
Any gated CTA (Contact Seller / Sell / Dashboard / Profile)
        │
        ▼
[ Auth Modal, Login tab ] → email, password
        │
        ├── Success → modal closes → returnTo action resumes automatically
        └── Failure → inline field error, modal stays open
```

Browser back while the modal is open closes the modal (via pushed history state) rather than navigating away from the page underneath.

---

## 4. Browse → Contact Seller (Core Trust Flow)

```
[ Browse ] → filters (category, condition) + sort + search
        │
        ▼
[ Listing Detail ] — seller first name, images, price, condition, description
        │
        ▼
  "Contact Seller" button — state depends on auth:
        │
        ├── Not logged in         → Auth Modal opens, resumes on success
        ├── Logged in, unverified → "Verify email to contact"
        ├── Verified, under limit → POST /api/listings/[id]/contact
        │         │
        │         ▼
        │   Server: not banned? verified? < 50 reveals today?
        │         │
        │         ▼
        │   Log row in `contact_reveals`, build wa.me link
        │         │
        │         ▼
        │   Return { waLink } → window.open(waLink) → WhatsApp opens
        │         (deal continues off-platform from here)
        │
        └── Verified, 50/day reached → "Daily limit reached" (disabled)
```

---

## 5. Sell Flow

```
[ Sell ] (single form: title, description, price, negotiable, category, condition, images)
        │
        ▼
Images uploaded directly to Cloudinary (unsigned preset) → URLs returned
        │
        ▼
POST /api/listings with form data + image URLs
        │
        ▼
Server requires a WhatsApp number on file (collected in this same
form, only when the profile has none saved yet — first listing)
        │
        ▼
Server checks admin_settings.approval_mode
        │
        ├── 'auto'   → status = 'approved' → live immediately, appears in Browse
        └── 'manual' → status = 'pending'  → sits in Dashboard as "Under Review"
                              until an admin approves/rejects
```

---

## 6. Edit Flow

```
[ Dashboard ] → seller selects own listing → "Edit"
        │
        ▼
[ Sell form, pre-filled with existing listing data ]
        │
        ▼
PATCH /api/listings/[id]
        │
        ▼
Status unchanged (editing does not reset to pending, even in manual mode)
```

---

## 7. Dashboard — Status Lifecycle

```
                 ┌────────────┐
   created  ───► │  Active     │ (status = 'approved', or 'pending' if manual mode → "Under Review")
                 └─────┬──────┘
                       │
        ┌──────────────┼───────────────┐
        │               │                │
        ▼               ▼                ▼
   seller marks    admin rejects    (manual mode only)
   as Sold         (with reason)     sits as "Under Review"
        │               │                │ until admin acts
        ▼               ▼                ▼
   status='sold'   status='rejected'  → becomes Active or Rejected
   (shown: Sold)   (reason shown       
                    on seller's card)
```

No `expired` or listing-level "banned" state exists. A banned *user's* listings are excluded from public Browse via RLS but remain visible on their own Dashboard, unchanged in status.

---

## 8. Report → Admin Resolution Flow

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
[ Admin — Reports ] → admin reviews
        │
        ├── "Remove"  → listing.status = 'rejected', report.status = 'resolved_removed'
        └── "Dismiss" → report.status = 'resolved_dismissed', listing untouched
```

---

## 9. Admin Promotion Flow

```
[ Admin — Users ] → admin selects a user → "Promote to Admin" (with confirm step)
        │
        ▼
profiles.is_admin = true for target user
        │
        ▼
Target user has admin nav access on next session — no separate super-admin tier
```

---

## 10. Ban / Unban Flow

```
[ Admin — Users ] → admin selects a user → "Ban" (with confirm step)
        │
        ▼
profiles.is_banned = true
        │
        ▼
RLS (`listings_select_public`) immediately excludes their listings from
public Browse — no manual hide step, no delay
        │
        ▼
User's own Dashboard still shows their listings, unchanged in status
        │
        ▼
"Unban" reverses — listings reappear in public Browse immediately
```

---

## 11. Approval Mode Toggle Flow

```
[ Admin — Overview ] → toggles approval_mode (auto ↔ manual)
        │
        ▼
PATCH /api/admin/settings
        │
        ▼
Change applies to NEW listings only — existing listings' status is untouched
        │
        ├── switched to 'manual' → [ Admin — Pending Queue ] becomes active/relevant
        └── switched to 'auto'   → new listings go live immediately again
```

---

## 12. Contact Us Flow (Support, Not Seller Contact)

```
[ Contact Us ] → name, email, message
        │
        ▼
POST /api/contact → Zod validation
        │
        ▼
Resend API sends email to founder inbox
        │
        ├── Success → "Message sent — we'll get back to you soon"
        └── Failure → plain-language error shown; raw error logged server-side only
```

No auth, no rate limit, no `contact_reveals` logging — entirely separate system from §4's seller-contact flow. This distinction matters enough to restate: "Contact Us" (support) and "Contact Seller" (core trust mechanic) share the word "contact" but nothing else — different route, different backend, different data model.

---

## 13. Static/Credibility Page Flows

```
[ Our Story ]      — read-only narrative, no forms, no auth gate, reached from Home or nav
[ How It Works ]   — read-only step explainer, no forms, no auth gate, reached from Home or nav
```

Both are terminal nodes in the flow graph — no further branching. Their only job is building trust before a first-time visitor commits to signing up.

---

## 14. Cross-Cutting: Rate Limit & Verification Gates

Two gates recur across multiple flows above — documented once here rather than repeated per-flow:

| Gate | Applies to | Failure message |
|---|---|---|
| Email verification (`email_confirmed_at`) | Sell, Contact Seller | "Verify your email to continue" |
| Ban check (`is_banned`) | Sell, Contact Seller, all admin-visible actions | Listing/action silently unavailable per RLS, no separate UI message needed since banned users are already excluded upstream |
| Contact rate limit (50/24h) | Contact Seller only | "Daily limit reached. Try again tomorrow." |

Every gate is enforced server-side (RLS or API route logic) regardless of what the UI disables client-side — see rules.md §3.4.
