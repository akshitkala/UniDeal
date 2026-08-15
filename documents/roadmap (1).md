# UniDeal — Build Roadmap

| Field | Value |
|---|---|
| Version | 1.0 |
| Date | August 2026 |
| Companion docs | PRD v2, TRD v1, architecture.md, rules.md, design.md |

> **How to use this:** Each phase has a clear exit criteria — don't move to the next phase until the current one's criteria are actually met. This is a solo, zero-budget, vibe-coded build, so phases are ordered by *dependency*, not by what's most exciting to build. Skipping ahead (e.g. building Admin before Auth/RLS is solid) tends to create rework.

---

## Phase 0 — Foundation & Environment

**Goal:** Nothing product-facing yet — just a working, deployed skeleton with all three services talking to each other.

- Initialize Next.js 14+ project (App Router, TypeScript strict mode per rules.md)
- Set up Tailwind CSS, wire `tailwind.config.ts` to design.md's tokens (colors, spacing scale, fonts)
- Create Supabase project, note free-tier constraints already documented in TRD §1
- Create Cloudinary account, configure unsigned upload preset per TRD §6
- Set up `.env.local` with all variables from TRD §7
- Deploy an empty "Hello World" page to Vercel — confirm the pipeline works before building anything real
- Set up `vercel.json` cron entry + `/api/cron/keepalive` route (TRD §5.11) — do this early so the keep-alive habit exists from day one, not as a launch-week scramble

**Exit criteria:** A blank Next.js app is live on a Vercel URL, connected to Supabase (a test query succeeds) and Cloudinary (a test upload succeeds).

---

## Phase 1 — Database & Auth Foundation

**Goal:** The full schema and security model exist and are provably correct before any UI is built on top of them.

- Run all table creation SQL from TRD §2 (`profiles`, `categories`, `listings`, `reports`, `contact_reveals`, `admin_settings`)
- Run the `handle_new_user` trigger (TRD §2.1)
- Enable and apply every RLS policy from TRD §3 — table by table
- Generate TypeScript types: `supabase gen types typescript`
- Build signup, login, verify-email pages (`app/(auth)/`)
- Build the shared auth-guard `layout.tsx` for the `(account)` route group per architecture.md §3
- **Manually test RLS, not just the UI**: try to read/write another user's data directly via the Supabase client with a non-admin session and confirm it's rejected. This is the one phase where skipping verification is expensive to unwind later.

**Exit criteria:** You can sign up, verify by email, log in, and log out. A logged-in non-admin user cannot read or write another user's `profiles` row when tested directly against Supabase (not just blocked by UI).

---

## Phase 2 — Core Listing Flow

**Goal:** The single most important loop — post something, see it, view it — works end to end.

- Build the Sell form (`app/(account)/sell/page.tsx`) — single page per PRD §5.6, Zod validation per rules.md
- Wire Cloudinary direct upload (browser → Cloudinary, not through a Vercel function) per TRD §6
- Build `POST /api/listings` — includes the `admin_settings.approval_mode` branch (auto vs. manual) from TRD §5.2
- Build Browse page (`app/(public)/browse/page.tsx`) — grid only, no filters yet
- Build Listing Detail page (`app/(public)/listing/[slug]/page.tsx`) — plain page, no drawer, per locked scope decision
- Build `ListingCard` and `ListingGrid` components per architecture.md §3

**Exit criteria:** A verified user can post a listing with images, see it appear on Browse (immediately, since auto-approve is the launch default), and open its detail page.

---

## Phase 3 — Search, Filter, Sort

**Goal:** Browse becomes a real discovery tool, not just a static grid.

- Category filter, condition filter (`components/filters/`)
- Sort: Newest / Price ↑ / Price ↓ (PRD §5.7 — confirmed 3-option scope, not 5)
- Full-text search across title/description
- URL query param sync (`?category=&condition=&sort=&search=`) so filtered views are shareable/bookmarkable

**Exit criteria:** All three filter dimensions (category, condition, search) and all three sort options work together correctly, and the URL reflects the current filter state.

---

## Phase 4 — The Trust Mechanic: Contact Reveal

**Goal:** The feature that actually differentiates UniDeal from a WhatsApp group.

- Build `POST /api/listings/[id]/contact` exactly per TRD §5.5 — every check in order: session, banned, verified, rate limit, phone-exists
- Build the `public_profiles` view (TRD §5.5) so `whatsapp_number` is never reachable through a general profile read
- Build `ContactSellerButton` component handling all five UI states from the PRD §5.5 table (guest / unverified / verified-ready / rate-limited / no-contact-available)
- Display seller name, branch, year on listing detail — this is where the "trust" half of the product thesis becomes visible, don't treat it as an afterthought field

**Exit criteria:** Every one of the five contact-button states can be manually triggered and looks/behaves correctly, including hitting the 51st reveal and getting rate-limited. The phone number never appears in a network response — verify this by inspecting the actual API payload, not just the UI.

---

## Phase 5 — Seller Tools: Dashboard & Listing Management

**Goal:** Sellers can manage what they've posted without needing you to do it for them.

- Dashboard page — own listings grouped by status (Active / Sold / Under Review / Rejected) per nav discussion
- Edit listing flow (pre-filled Sell form)
- Delete listing (with Cloudinary cleanup best-effort per rules.md §7.4)
- Mark as sold (seller-only, per PRD §5.2)
- Report button on listing detail (`POST /api/listings/[id]/report`)

**Exit criteria:** A seller can see all their own listings correctly bucketed by status, edit one, mark one sold, and delete one. A buyer can report a listing and gets a clear confirmation.

---

## Phase 6 — Admin System

**Goal:** You (and anyone you promote) can operate the platform without touching the database directly.

- Admin route guard (`app/admin/layout.tsx`, checks `is_admin`)
- Admin settings toggle — switch `approval_mode` between auto/manual
- Pending queue (only meaningful once you test manual mode)
- Reports table — resolve (remove/dismiss) per TRD §5.9
- User management — ban/unban, promote to admin

**Exit criteria:** You can log in as admin, see reports, resolve one, ban a test user (confirm their listings disappear from public Browse immediately), and promote another test account to admin.

---

## Phase 7 — Navigation, Home, and Design Pass

**Goal:** All the individually-working screens become one coherent product.

- Build TopNav (desktop) and BottomNav (mobile) per the locked nav diagram
- Build the Home page — static hero, story, how-it-works, sample listings (PRD §2.2 framing: burial + unverifiability)
- Apply design.md tokens consistently across every screen built in Phases 2–6 — this is the point where earlier screens get revisited with real styling, not before
- Empty states for Browse (no results), Dashboard (no listings yet), Admin queues (nothing pending) — per rules.md §7.5 tone guidance
- Full mobile pass — everything checked at 375px viewport per PRD acceptance criteria

**Exit criteria:** Every screen built in prior phases is reachable through the actual nav, visually consistent with design.md, and usable one-handed on a phone.

---

## Phase 8 — Pre-Launch Hardening

**Goal:** Confirm the things that are expensive to discover after real users are on the platform.

- Re-verify every security boundary in rules.md §3 (RLS, service-role key isolation, rate limiting) — this is the second, final check, not the first
- Error handling audit — confirm every API route returns the consistent `{ data }` / `{ error }` shape from rules.md §7.1
- Test the full guest → signup → verify → post → browse → contact loop as a brand-new user, start to finish, uninterrupted
- Confirm the daily cron keepalive is actually running (check Vercel cron logs after 24h)
- Seed 15-20 real listings from your own inventory / early users **before** announcing publicly — per the cold-start plan discussed early in this project (a marketplace with 3 listings feels dead; one with 20 feels alive)

**Exit criteria:** You've personally completed the full user journey without hitting a bug, and the platform has real inventory on it before a single outside user sees it.

---

## Phase 9 — Launch

**Goal:** Convert your existing 50+ warm users and Instagram audience while the idea is fresh.

- Ask your committed 50 users to each post at least one real listing in a coordinated window, before any public announcement (per the seeding strategy discussed earlier)
- Instagram push tied to a specific action/urgency (e.g. "list your stuff before the semester ends"), not a generic "we launched" post
- Monitor early metrics against PRD §10 targets (100 registered users / 50 active listings / 10 contact reveals per day at 30 days)
- Watch admin reports and contact-reveal logs closely in week one — this is your real signal on whether the trust mechanic is working, not just whether people signed up

**Exit criteria:** 30-day PRD targets are being tracked, and you have a clear read on whether users are converting past signup into actually posting/contacting.

---

## Phase 10 — Post-Launch (V1.1+, not built yet)

Deferred features to revisit only once real usage data justifies them — not before:
- AI-assisted moderation (`approval_mode = 'ai'`) if manual review load becomes real
- Save/wishlist if users show search fatigue
- Sort by "Most viewed" if view data proves meaningfully differentiated from "Newest"
- Multi-campus expansion, once single-campus density is genuinely proven (per the competitive-landscape lesson from early in this project — premature multi-campus expansion is what killed several prior competitors)
- Monetization (hero-section or otherwise) — revisit the placement question flagged in PRD §5.9 deliberately, not by default

---

## Dependency Summary (why this order)

```
Phase 0 (foundation)
    │
    ▼
Phase 1 (DB + RLS + Auth)  ← everything else depends on this being correct
    │
    ▼
Phase 2 (post + view a listing) ← the core loop, prove it end-to-end first
    │
    ├──► Phase 3 (search/filter/sort)     ← enhances Browse, doesn't block it
    ├──► Phase 4 (contact reveal)          ← needs listings + auth to exist
    └──► Phase 5 (dashboard/seller tools)  ← needs listings to exist
              │
              ▼
        Phase 6 (admin)  ← needs reports + listings + users to already exist
              │
              ▼
        Phase 7 (nav + design pass)  ← ties everything together, deliberately last
              │
              ▼
        Phase 8 (hardening) → Phase 9 (launch) → Phase 10 (post-launch, deferred)
```
