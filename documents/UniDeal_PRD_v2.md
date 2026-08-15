**UniDeal**

**Product Requirements Document**

| Field | Value |
|---|---|
| Version | 2.0 |
| Date | August 2026 |
| Status | Approved — Ready for Development |
| Author | Akshit (Founder), refined with Claude |
| Platform | Next.js 14+ Web App |
| Budget | ₹0/month — entirely free tier |
| Companion doc | UniDeal TRD v1 |

> This version supersedes PRD v1.1. Changes are the result of scope discipline passes — trimming build-heavy features that don't earn their cost at launch scale, while explicitly keeping features the founder identified as non-negotiable (rate limiting, two-role admin system, sorting, report mechanism, single-form sell flow).

---

# 1. Executive Summary

UniDeal is a zero-budget university campus marketplace that enables students to buy and sell physical items in a structured, trustworthy, and searchable environment. It replaces the chaos of WhatsApp groups — where listings get buried and sellers are unverifiable — with a platform built specifically for campus life.

**Core framing:** UniDeal is not a transaction platform — it's a **bridge connecting buyers and sellers**. Discovery and credibility are the product; the deal itself closes on WhatsApp. This distinction shapes every scope decision below: build what makes a listing discoverable and trustworthy, skip what facilitates the transaction itself.

The product launches at the founder's own campus and is architected to expand to other campuses later, without being locked to a single-campus data model that has killed prior competitors in this space.

---

# 2. Problem Statement

## 2.1 Current State

Students currently rely on WhatsApp groups to buy and sell. This creates two compounding, distinct failures:

- **Burial** — listings scroll out of view within hours as new messages push them down; even a well-priced item (a charger, a used iron) gets lost and never seen by an interested buyer.
- **Unverifiability** — there's no way to assess whether a poster is a real, trustworthy student before reaching out. No profile, no history, no signal beyond a phone number.

Secondary symptoms: no category or price filtering, no way to mark items sold (leading to repeated dead-end enquiries), and no moderation — fake or inappropriate listings persist indefinitely.

## 2.2 Core Insight

Students don't need a better WhatsApp — they need a structured discovery and credibility layer on top of it. UniDeal is that layer: browse, find, and trust on UniDeal; close the deal on WhatsApp.

---

# 3. Product Goals

## 3.1 Primary Goals (V1)

- Replace WhatsApp-group listings with a structured, searchable, credible marketplace
- Protect seller contact behind email verification — revealed only as a `wa.me` deep link, never a displayed phone number
- Give sellers a visible identity (name, branch, year) so listings carry trust signals WhatsApp groups lack
- Operate entirely on free-tier infrastructure at zero monthly cost
- Ship fast enough to convert the founder's existing 50+ warm users and Instagram audience while the idea is fresh

## 3.2 Non-Goals (V1)

- In-app chat or messaging — WhatsApp handles this; building it is high cost for the trust problem it doesn't actually solve (see contact flow below)
- AI-assisted listing moderation — placeholder exists in admin settings for a future toggle; not built now
- Rental, exchange, or barter — coordination complexity and dispute risk
- Payment processing or escrow — deals close off-platform, cash/UPI on meetup
- Reviews and ratings — meaningless without transaction volume at launch
- Mobile app — responsive web only
- Multi-campus support — single-campus for now; schema is not artificially locked to prevent later expansion, but the feature isn't built yet
- Dynamic, admin-editable categories — 6 categories are fixed at launch

---

# 4. User Personas

## 4.1 The Seller — Any Student With Something to Sell

Has electronics, books, furniture, or other items they no longer need — not limited to graduating seniors. Wants a fast, credible way to find a buyer on campus without their post disappearing into WhatsApp noise within the hour.

## 4.2 The Buyer — Any Student Looking to Buy Used

Knows items are available somewhere on campus but has no reliable way to discover them or trust the seller. Price-sensitive, and burned before by "is this even a real person" hesitation on WhatsApp.

## 4.3 The Admin — Founder (and Anyone They Promote)

No fixed super-admin tier — any admin can promote another user to admin. Reviews reports, manages users, and (in manual mode) reviews pending listings. Designed to be low-friction for a solo founder to operate day-to-day without needing dedicated moderation staff.

---

# 5. Feature Specification

## 5.1 Authentication & Verification

- Open signup — any email accepted, not restricted to a college domain
- Email/password auth with mandatory email verification
- Unverified users can browse freely but cannot post listings or reveal seller contact
- Two roles: `user` and `admin` — any admin can promote any other user to admin; no super-admin tier

## 5.2 Listings

- Any physical item can be listed
- Required fields: title, description, price, category, condition, negotiable flag, 1–4 images
- Images: max 4 per listing, 5MB each, compressed via Cloudinary on upload
- Condition options: New, Like New, Good, Used, Damaged
- Sellers can mark their own listing as **Sold** (seller-only — no buyer-side confirmation in v1), edit details, or delete
- Listings from banned users are **hidden, not deleted** — preserved for record-keeping, invisible to other users

## 5.3 Listing Detail

Standard listing detail page (`/listing/[slug]`) — no drawer or bottom-sheet pattern in v1. Prioritizes shipping a clean, well-designed static page over a more complex interaction pattern that costs disproportionate build time for marginal UX gain.

## 5.4 Categories

Six fixed categories at launch: Books & Notes, Electronics, Furniture, Clothing, Sports & Fitness, Miscellaneous. Not dynamically editable by admins in v1 — hardcoded, changeable via direct database update if genuinely needed.

## 5.5 Contact Flow

This is the core trust mechanic, and it is deliberately **not** in-app chat.

- Seller's phone number is never displayed as text anywhere in the UI or API response — not in the DOM, not in any endpoint payload
- A verified, non-banned, under-limit user taps "Contact Seller" → server constructs a `wa.me` deep link with a pre-filled message → opens WhatsApp directly
- **Rate limit: 50 contact reveals per user per rolling 24-hour period** — genuine security/abuse-prevention measure, not scope creep
- Every reveal is logged server-side — this doubles as your usage metric ("how many people wanted to buy this") even though the conversation itself happens off-platform

## 5.6 Sell / List Item

**Single form page** — not a multi-step modal wizard. One page, all fields, one submit. Chosen deliberately for build simplicity without sacrificing usability; a well-designed single page can feel just as polished as a wizard.

## 5.7 Search & Discovery

- Full-text search across listing titles and descriptions
- Filter by category and condition
- **Sort by: Newest / Price Low→High / Price High→Low** (trimmed from 5 options in the original draft — "Most viewed" deferred since it needs view-tracking infra not yet justified by usage data)
- Browse by category

## 5.8 Admin Moderation

- **Three-mode approval system**, admin-configurable without redeploy:
  - **Auto-approve** (v1 launch default) — listings go live immediately; admin spot-checks after the fact
  - **Manual approve** — listings held as pending until an admin reviews
  - **AI-assisted** — placeholder only in v1; schema supports the toggle, no logic is built yet
- **Report mechanism**: any verified user can report a listing with a reason (Fake listing / Prohibited item / Misleading price / Spam / Other). Reported listings are **not** auto-hidden — removal requires explicit admin approval, keeping a human in the loop on takedowns
- User management: view, ban, unban, promote to admin
- No AI quality checks (Gemini/Cloudinary moderation), no automated queue prioritization, and no full audit log in v1 — these were cut as backend plumbing that doesn't move the needle on trust or discovery at launch scale

## 5.9 Monetization

- **Deferred to a later version**: ads placed in the hero section
- Flagged risk (raised during planning, not yet resolved): the hero section is prime visual real estate, and since UI/UX is stated as the top product priority, ad placement there should be revisited deliberately when the time comes rather than defaulted into — a quieter placement (e.g. between listing rows) may preserve the premium feel better. Decision left open for when monetization is actually implemented.

---

# 6. User Stories

## 6.1 Student (Seller)
- As a student, I want to list an item so other students can find and buy it
- As a seller, I want only verified users to contact me via WhatsApp so my privacy is protected
- As a seller, I want to mark my item as sold so I stop getting enquiries
- As a seller, I want to edit my listing so I can adjust price without reposting

## 6.2 Student (Buyer)
- As a buyer, I want to search and filter by category/condition so I find relevant items fast
- As a buyer, I want to sort by price so I can find items in my budget
- As a buyer, I want to report a fake listing so the marketplace stays trustworthy

## 6.3 Admin
- As an admin, I want to toggle between auto and manual approval so I control moderation load as the platform grows
- As an admin, I want to review reports and remove listings so the platform stays safe
- As an admin, I want to promote trusted users to admin so moderation doesn't bottleneck on me alone

---

# 7. Acceptance Criteria

| Feature | Acceptance Criteria |
|---|---|
| Registration | Any email accepted; verification email sent automatically |
| Posting gate | Unverified or banned users cannot create listings |
| Contact reveal | Verified user taps Contact Seller → WhatsApp opens with pre-filled message. Phone number never rendered anywhere. 51st reveal in 24h rejected with "Daily limit reached." |
| Approval modes | Admin can switch between auto/manual without a redeploy; existing listings are unaffected by a mode change |
| Banned users | Listings hidden from public browse immediately on ban, without being deleted |
| Report flow | Listing only removed after explicit admin approval; duplicate reports from the same user on the same listing are blocked |
| Sell flow | Single form, no multi-step wizard, 1–4 images at 5MB cap each |
| Sorting | Newest / Price ↑ / Price ↓ available on browse |
| Mobile | All pages fully functional on 375px viewport |

---

# 8. Out of Scope — V1

| Feature | Reason Cut | Roadmap |
|---|---|---|
| In-app chat | High build cost, WhatsApp already solves it | Not planned |
| AI listing moderation | No spam problem yet at launch scale; placeholder exists in schema | V1.1+ toggle |
| Drawer/bottom-sheet listing detail | High build cost for marginal UX gain | Reconsider post-launch if data supports it |
| Modal wizard sell flow | Single form is simpler and equally usable | Not planned |
| Reviews & Ratings | Meaningless without transaction volume | V2 |
| Exchange / Swap / Rent | Coordination complexity, legal risk | V2/V3+ |
| Push Notifications | Needs mobile app | V2 |
| Dynamic categories | Zero user-facing value at launch scale | V2 |
| Save/Wishlist | Premature before users hit real search fatigue | V2 |
| Paid Promotions | Too early — students won't pay at launch | V3+ |
| Multi-campus | Single-campus launch; not schema-locked out, but not built | Post-traction |

---

# 9. Constraints

- Zero monthly budget — all infrastructure on free tiers
- Solo developer, vibe-coded build — see companion TRD for implementation-precise specs
- Supabase free tier: 500MB DB, 50k MAU — comfortably sufficient at single-campus scale
- Cloudinary free tier: 25 credits/month (storage+bandwidth+transforms shared pool) — realistically supports ~5,000–8,000 active listings before requiring a paid tier or migration to Cloudflare R2; acceptable for launch, revisit as volume approaches that ceiling
- Daily Vercel Cron ping required to prevent Supabase's 7-day free-tier inactivity pause

---

# 10. Success Metrics

| Metric | 30-Day Target | 90-Day Target |
|---|---|---|
| Registered users | 100 | 500 |
| Active listings | 50 | 300 |
| Contact reveals per day | 10 | 75 |
| Fake listing reports | < 5% of listings | < 2% |
| Mobile session share | > 60% | > 70% |
