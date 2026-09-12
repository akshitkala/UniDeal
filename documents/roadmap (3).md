# UniDeal — Roadmap (Development → Production)

| Field | Value |
|---|---|
| Companion docs | PRD v2.1, TRD v1.1, architecture.md v1.1, rules.md v1.1, design.md, appflow.md |

> This is the phase reference `progress.md` entries should cite (rules.md §10). Each phase has a goal, deliverables, an exit gate, and the rules.md sections most at risk of being cut corners on. Don't start a phase until the previous one's exit gate is met — flag it to me if something forces you out of order.

---

## Phase 1 — Foundation: Schema, RLS, Auth

**Goal:** A running Next.js app backed by a fully-locked-down Supabase project. No listings UI yet — this phase is entirely about the security boundary being correct before anything is built on top of it.

**Deliverables**
- Project scaffold matching TRD §4 folder structure exactly (route groups, `lib/`, `components/`, `types/`)
- All six tables, enums, indexes, and the `handle_new_user` trigger (TRD §2)
- RLS enabled and every policy applied (TRD §3), including the `public_profiles` view and the `whatsapp_number` column REVOKE/GRANT
- `AuthModal.tsx` — tabbed login/signup, focus-trapped, `history.pushState`, `returnTo` resume (TRD §5.1a, design.md §5.3)
- `/verify-email` route
- `.env.local` scaffolded per TRD §7

**Exit gate**
- A test user can sign up, receive a verification email, verify, and log back in — entirely through the modal, no dedicated auth route exists
- Querying `profiles` as an authenticated client cannot return `whatsapp_number` under any circumstance (test this directly, don't just assume the GRANT worked)
- First commit pushed to GitHub (rules.md §9 — this phase is nothing but "key changes")

**Watch for:** any temptation to gate something in the API route instead of RLS "for now, tighten later" — rules.md §3 says this is never a speed tradeoff.

---

## Phase 2 — Core Marketplace: Listings

**Goal:** Sellers can post, edit, and delete listings; buyers can browse, search, filter, and sort. No contact mechanic yet — browsing and listing detail work standalone.

**Deliverables**
- `POST/GET /api/listings`, `PATCH/DELETE /api/listings/[id]`
- Sell form (single page, no wizard) and Edit (same form, pre-filled) — TRD §5.2, §5.6, §5.7
- Listing detail page — direct Supabase query joined to `public_profiles`, `firstName()` applied, view counter via `increment_listing_views` (TRD §5.4)
- Browse page — filters, sort (Newest / Price ↑ / Price ↓ only), search, pagination
- Cloudinary unsigned upload flow, 5MB client-side rejection (TRD §6)
- Zod schemas in `lib/validation/listing.ts`, shared client/server

**Exit gate**
- A verified user can post a listing with 1–4 images and see it live in Browse (auto-approve mode, the v1 default)
- An unverified user is blocked from posting, with the RLS policy — not just the UI — enforcing it
- Seller identity on every card and detail page is first name only, sourced from `firstName()`, never a raw `.split(' ')[0]`

**Watch for:** branch/year sneaking onto listing cards "since the data's already there" — rules.md §4 explicitly calls this out as the tempting-but-wrong move.

---

## Phase 3 — Trust Mechanic: Contact Flow

**Goal:** The one feature the whole product exists to support — implemented exactly to spec, no shortcuts.

**Deliverables**
- `POST /api/listings/[id]/contact` per TRD §5.5, byte-for-byte: service-role client only, banned/verified/rate-limit checks in order, `contact_reveals` insert, `wa.me` link construction
- `ContactSellerButton.tsx` covering every state in appflow.md §4 (logged-out, unverified, rate-limited, success)
- Rate-limit enforcement server-side, with client-side disabling as UX only (rules.md §3.4)

**Exit gate**
- Phone number never appears in any API response body, page prop, or client-side state — verify by inspecting the network tab, not just reading the code
- 51st reveal in a rolling 24h window returns 429 with the exact copy from rules.md §7.3
- A listing with no `whatsapp_number` set returns "Seller contact not available," not a crash

**Watch for:** this is the single highest-risk phase for a "simplify it" suggestion from a minimalism-biased coding assistant — the multi-step check order (banned → verified → rate limit → number exists) is deliberate, not padding.

---

## Phase 4 — Moderation & Admin

**Goal:** The founder (and anyone they promote) can manage the platform without touching the database directly.

**Deliverables**
- Dashboard — four status tabs, inline Mark Sold/Edit/Delete, per-section empty states (design.md §7.7)
- Report flow — `POST /api/listings/[id]/report`, duplicate-report handling, admin resolve (remove/dismiss)
- Admin overview, approval-mode toggle (auto/manual/ai-placeholder), pending queue (manual mode only)
- User management — ban/unban/promote, all re-checking `is_admin` server-side regardless of what the UI renders

**Exit gate**
- Switching approval mode affects only new listings, not existing ones (TRD §5.9, appflow.md §11)
- A banned user's listings disappear from public Browse immediately via RLS, with zero manual hide step, but remain visible on their own Dashboard
- Every admin action is blocked server-side for a non-admin even if they craft the request directly (don't just trust the UI hiding the button)

**Watch for:** building real logic behind `approval_mode = 'ai'` — it's a schema placeholder only, per TRD §2.6 and rules.md §4.

---

## Phase 5 — Public Pages, Design Polish, Accessibility

**Goal:** The credibility layer around the marketplace, and a full pass to bring every screen in line with `design.md` rather than "good enough for now."

**Deliverables**
- `/our-story`, `/how-it-works`, `/contact` (Resend-backed, `POST /api/contact` per TRD §5.12)
- Full design-token pass — no ad-hoc hex codes, no magic-number spacing, `--color-accent-contact` used only on Contact Seller
- Focus states, touch targets (44×44px minimum), contrast checks (4.5:1) across every screen
- Mobile QA at 375px baseline for all pages, per PRD §7's acceptance criteria

**Exit gate**
- Contact form sends via Resend, fails closed with a plain-language message on error, and is entirely unauthenticated (no rate limit, no `contact_reveals` row — appflow.md §12)
- Nav labels read "Our Story," "How It Works," "Contact Us" — never bare "Contact," to avoid colliding with Contact Seller
- Nothing on the site resembles a gradient, glassmorphism panel, fabricated testimonial, or "verified" badge — design.md §8's explicit prohibitions list

**Watch for:** the `/our-story` live-listings dependency flagged earlier — confirm the component architecture decision before building Section 6, since it changes whether the page can stay purely static.

---

## Phase 6 — Hardening & Production Launch

**Goal:** Everything above, verified against the acceptance-criteria tables in PRD §7 and TRD §8, then shipped.

**Deliverables**
- Full pass through PRD §7 and TRD §8 acceptance criteria tables, item by item, with each one either confirmed working or explicitly flagged as a gap
- Security review: RLS policies re-read against rules.md §3's seven non-negotiables, service-role key usage audited to confirm it never touches a Client Component
- `vercel.json` cron config live, `/api/cron/keepalive` protected by `CRON_SECRET` and verified to actually ping on schedule post-deploy
- Production environment variables set on Vercel (never committed, never `NEXT_PUBLIC_`-prefixed where they shouldn't be)
- Smoke test on the deployed URL: signup → verify → post a listing → browse → contact seller → WhatsApp opens, end to end, on both desktop and a real mobile device

**Exit gate**
- Every row in both acceptance-criteria tables is either ✅ or has a linked, explicit reason it's deferred — no silent gaps
- `unideal-lemon.vercel.app` (or whatever the launch domain is) is live and passes the smoke test
- `progress.md` has a final entry marking launch, with anything deliberately deferred to post-launch called out by name

**Watch for:** the temptation to treat "it works on localhost" as done — Supabase free-tier's 7-day pause, Cloudinary's credit ceiling, and cold-start Vercel functions are all things that only show up in production.

---

## Cross-phase reminders

- Update `progress.md` after every phase, per the format in rules.md §10.
- Push to GitHub before any "key change" as defined in rules.md §9 — this applies within a phase, not just between phases.
- If ponytail (or any coding assistant) suggests simplifying anything inside Phases 1, 3, or 4's security/admin logic, override it and flag the suggestion to me rather than accepting it silently.
