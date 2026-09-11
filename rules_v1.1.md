# UniDeal — Development Rules

| Field | Value |
|---|---|
| Version | 1.1 |
| Date | September 2026 |
| Companion docs | PRD v2.1, TRD v1.1, architecture.md v1.1, design.md, appflow.md |

> **Purpose:** This doc is the guardrail for every coding session — yours or an AI assistant's. When PRD/TRD/architecture.md say *what* to build, this says *how* to build it consistently, and where the hard lines are. If a coding assistant proposes something that conflicts with a rule here, the rule wins unless you explicitly override it.
>
> **Changes in this revision:** design tokens are now locked (§2) rather than deferred — see `design.md` for the full system; added a rule on first-name-only rendering (§4); added `AuthModal` as the required auth pattern (§4); noted `RESEND_API_KEY` alongside other server-only secrets (§6).

---

## 1. Language & Type Safety

- **TypeScript strict mode is on globally** (`"strict": true` in `tsconfig.json`). This is non-negotiable project-wide.
- **`any` is banned in security- and money-adjacent code**: auth logic, `/api/listings/[id]/contact`, admin routes, rate-limit checks, price/payment-adjacent fields. Use `unknown` + narrowing, or a proper type, instead.
- **`any` is tolerated (not encouraged) in low-stakes UI code** — e.g. a quick prop type while prototyping a component's visual layout.
- **Database types are always generated, never hand-written**: run `supabase gen types typescript` into `types/database.ts` after every schema change.
- **Validation schemas (Zod) are the single source of truth for a shape.** Define once in a shared location (e.g. `lib/validation/listing.ts`, `lib/validation/contact.ts`), infer the TypeScript type from it, and reuse that same schema on both the client form and the server route.

---

## 2. Styling — Tailwind CSS

**Design tokens are locked as of this revision** — see `design.md` for the full, canonical system (colors, typography, spacing, component patterns, per-screen specs). Summary for quick reference during coding:

| Token | Value | Usage |
|---|---|---|
| `--color-accent` | `#16A34A` | General accent / primary CTA color across the app |
| `--color-accent-contact` | `#15803D` | Reserved exclusively for the "Contact Seller" button — never used elsewhere |
| Typography | Outfit (headings), Work Sans (body) | See design.md for weight/scale |
| Visual baseline | Flat/clean | No gradients, glassmorphism, or neumorphism anywhere in the app |

- **Utility classes in JSX, no inline `style={{}}` props** except for genuinely dynamic values Tailwind can't express statically.
- **No ad-hoc magic numbers.** All colors/spacing must come from `tailwind.config.ts` theme tokens sourced from `design.md` — not one-off hex codes or arbitrary `px` values. This is no longer a "once finalized" caveat — the design guide exists now, so this applies from this point forward.
- **Component-level composition over giant page-level className strings.** Extract repeated patterns into small components (e.g. `<Badge>`, `<PriceTag>`) rather than copy-pasting the same utility chain everywhere.
- **Mobile-first.** Write the unprefixed (mobile) styles first, then layer `sm:` / `md:` / `lg:` breakpoints upward.
- **Visible focus states are mandatory**, including inside the `AuthModal` and any other overlay — never remove a focus outline without a replacement (`focus:ring-2 focus:ring-[--color-accent]` or equivalent).

---

## 3. Security Boundaries — the non-negotiables

1. **RLS is the real security boundary, not the API route.** Every table has RLS enabled per the TRD. An API route doing an auth check is a *convenience* — it is never the only thing standing between a bad actor and the data. If a policy and a route check ever disagree, fix the policy; don't patch around it in the route.
   - **RLS is row-level, not column-level.** Use `REVOKE`/`GRANT` or a view (`public_profiles`) for column-level secrecy. Treat the base `profiles` table as server-only in practice.
2. **The Supabase service-role key never reaches the client.** Server-only files (`lib/supabase/admin.ts`) only. Never import it into a Client Component.
3. **The seller's phone number is never sent to the browser as a field**, in any API response, any page prop, any client-side state. Only a fully-constructed `wa.me` URL, built server-side, ever crosses that boundary.
4. **Rate limits are enforced server-side, always**, even though the UI also disables the button client-side for UX.
5. **Never trust `category_id`, `price`, `status`, or `seller_id` values sent from the client without validating against the Zod schema first.** Status transitions are controlled by server logic based on role/ownership, never accepted verbatim.
6. **Admin actions (ban, promote, approve/reject, resolve report) always re-check `is_admin` server-side**, even if the UI only renders the button for admins.
7. **The `RESEND_API_KEY` follows the same server-only rule as the service-role key** — used exclusively inside `/api/contact/route.ts`, never prefixed `NEXT_PUBLIC_`, never referenced from a Client Component.

---

## 4. Scope Boundaries

Tie back to PRD v2.1 §3.2 and §8.

**Do not build, even if it seems easy or "basically free" while already in that file:**
- In-app chat / messaging of any kind
- AI-assisted moderation logic (the `admin_settings.approval_mode = 'ai'` value exists as a placeholder only)
- Payments, escrow, or any transaction handling
- Reviews/ratings
- Listing expiry / auto-expiration
- Save/wishlist
- Dynamic, admin-editable categories
- Drawer or bottom-sheet listing detail patterns — plain page only
- Multi-campus fields or logic
- A "banned" status on listings — banning is user-level only (`profiles.is_banned`)
- **Rendering a seller's full name, branch, or year anywhere other than their own Profile page** — every listing-facing surface uses `firstName()` (TRD §2.1a) only. This is the same category of scope discipline as the items above: it would be trivial to just render `full_name`, and that's exactly the instinct to resist.
- **A dedicated login/signup page or route** — auth is the `AuthModal` component only. If a coding assistant proposes `/login/page.tsx` or `/signup/page.tsx`, that's a regression to the pre-v2.1 pattern — decline it.

If a coding assistant suggests any of the above "since it would only take a few more minutes" — decline it, even if it's technically easy.

---

## 5. What to Use

| Concern | Use |
|---|---|
| Styling | Tailwind CSS, theme tokens from `design.md` (now finalized, not deferred) |
| Validation | Zod, one schema per shape, shared client/server |
| Forms | Native React state + Zod validation; no heavy form library needed at this scale |
| Data fetching (reads) | Direct Supabase client queries from Server Components where possible |
| Data mutations / sensitive logic | Next.js API routes (`app/api/**/route.ts`) per TRD §5 |
| Auth | Supabase Auth SDK directly, wrapped by `AuthModal` for presentation — no custom session/JWT handling |
| Images | Cloudinary unsigned upload preset, direct browser-to-Cloudinary upload |
| Transactional email | Resend, server-only, `/api/contact` only |
| IDs | `gen_random_uuid()` at the DB level for primary keys; `nanoid` for the human-readable slug suffix |
| Dates/times | Store as `timestamptz` in Postgres; format for display with a lightweight utility (e.g. native `Intl.DateTimeFormat`) |

---

## 6. What to Avoid

- **No new backend services or databases.** Everything lives in Supabase + Cloudinary + Vercel + Resend per the locked stack.
- **No client-side secrets.** Anything prefixed `NEXT_PUBLIC_` is public by definition — this now explicitly includes `RESEND_API_KEY` staying server-only, same as `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET`.
- **No premature abstraction.** Don't build a generic plugin system, theme engine, or config-driven feature flags beyond `admin_settings.approval_mode`.
- **No silently swallowed errors.** Every `try/catch` either handles the error meaningfully or re-throws/logs it — never an empty `catch {}` block.
- **No inconsistent naming across layers.** If the DB column is `whatsapp_number`, the API field and the TypeScript type should also be `whatsapp_number`.
- **No re-deriving the first name inline in multiple components.** Always import `firstName()` from `lib/display-name.ts` — a hand-rolled `.split(' ')[0]` scattered across components is the same "same shape written twice" problem Zod schemas already guard against, just for display logic instead of validation.

---

## 7. Error Handling

### 7.1 API route error shape (consistent across every route)
```ts
// Success
{ data: <payload> }

// Error
{ error: { message: string, code?: string } }
```
Every API route returns this shape, including `/api/contact`.

### 7.2 HTTP status codes — use meaningfully, not just 200/500
| Situation | Status |
|---|---|
| Success | 200 / 201 (created) |
| Not logged in | 401 |
| Logged in but not allowed (unverified, banned, not owner, not admin) | 403 |
| Resource doesn't exist / already deleted | 404 |
| Validation failed (Zod parse error) | 400 |
| Rate limit hit (50/day reveals) | 429 |
| Duplicate action (e.g. reporting the same listing twice) | 409 |
| Unexpected server error (e.g. Resend send failure) | 500 |

### 7.3 User-facing message tone
- ❌ "Oops! Something went wrong, sorry about that 😅"
- ✅ "Couldn't post your listing. Check that all fields are filled in and try again."
- ❌ "Error 429"
- ✅ "Daily contact limit reached. Try again tomorrow."

State what happened and what to do next, every time. Never expose raw database, Resend, or stack trace text to the user — log that server-side, show a plain-language message client-side.

### 7.4 Fail-open vs. fail-closed — decide per feature, don't default blindly
- **Contact reveal, listing creation, admin actions → fail closed.** If uncertain, deny the action and show an error.
- **Non-critical background operations → fail open, logged.** E.g. incrementing a listing's `views` counter, Cloudinary cleanup-on-delete.
- **The `/api/contact` support form → fail closed with a clear message** if Resend errors — the submitter should know their message didn't send, unlike a background operation.
- **The daily cron keepalive → fail open, silent**, but log the failure somewhere noticeable if it repeats.

### 7.5 Empty states
Per the "direction, not mood" principle: an empty Browse grid, an empty Dashboard, zero pending reports — each should say plainly what's true and what to do about it, not a generic "Nothing here!" placeholder.

---

## 8. When Rules Conflict With Speed

1. **Security boundaries (Section 3) are never traded for speed.**
2. **Scope boundaries (Section 4) are never traded for "it's basically free to add."**
3. **Styling polish and type-perfection in low-stakes UI code CAN be traded for speed** — ship the ugly-but-working version of a non-critical screen and refine later, rather than blocking launch on it.

---

## 9. Version Control

- **Push to GitHub before making any key change** — a key change means anything touching auth, RLS policies, the contact-reveal route, admin logic, the database schema, the approval-mode toggle, or the new `/api/contact` Resend integration.
- Routine UI tweaks, copy changes, or styling adjustments don't need this ceremony.
- Commit messages should say what changed and why in plain language, not generic messages like `"update"` or `"fix"`.

## 10. Progress Log — `progress.md`

- Maintain a `progress.md` at the project root, updated as work happens.
- Each entry should note: **date, what was built/changed, which phase (per roadmap.md) it belongs to, and anything left unfinished or deliberately deferred.**
- Suggested format per entry:
  ```
  ## 2026-08-14 — Phase 1: Database, RLS & Auth
  - Created all tables from TRD §2
  - Applied RLS policies for profiles, listings, categories
  - Signup + email verification flow working end to end
  - TODO: contact_reveals and admin_settings RLS still pending
  ```
