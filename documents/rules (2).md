# UniDeal — Development Rules

| Field | Value |
|---|---|
| Version | 1.0 |
| Date | August 2026 |
| Companion docs | PRD v2, TRD v1, architecture.md |

> **Purpose:** This doc is the guardrail for every coding session — yours or an AI assistant's. When PRD/TRD/architecture.md say *what* to build, this says *how* to build it consistently, and where the hard lines are. If a coding assistant proposes something that conflicts with a rule here, the rule wins unless you explicitly override it.

---

## 1. Language & Type Safety

- **TypeScript strict mode is on globally** (`"strict": true` in `tsconfig.json`). This is non-negotiable project-wide — it's nearly free once configured and catches real bugs before runtime.
- **`any` is banned in security- and money-adjacent code**: auth logic, `/api/listings/[id]/contact`, admin routes, rate-limit checks, price/payment-adjacent fields. Use `unknown` + narrowing, or a proper type, instead.
- **`any` is tolerated (not encouraged) in low-stakes UI code** — e.g. a quick prop type while prototyping a component's visual layout. Clean it up before merging if you have time; don't block shipping over it.
- **Database types are always generated, never hand-written**: run `supabase gen types typescript` into `types/database.ts` after every schema change. Hand-typed DB interfaces drift from reality silently — a generated type can't.
- **Validation schemas (Zod) are the single source of truth for a shape.** Define once in a shared location (e.g. `lib/validation/listing.ts`), infer the TypeScript type from it (`z.infer<typeof listingSchema>`), and reuse that same schema on both the client form and the server route. Never write the same shape twice by hand.

---

## 2. Styling — Tailwind CSS

- **Utility classes in JSX, no inline `style={{}}` props** except for genuinely dynamic values Tailwind can't express statically (e.g. a computed width percentage).
- **No ad-hoc magic numbers.** Once the design guide (colors, spacing scale, type scale) is finalized, all colors/spacing must come from `tailwind.config.ts` theme tokens — not one-off hex codes or arbitrary `px` values scattered through components. Until the design guide exists, it's fine to prototype with Tailwind defaults, but flag any hardcoded value as temporary.
- **Component-level composition over giant page-level className strings.** If a `className` string is fighting for readability, extract the repeated pattern into a small component (e.g. `<Badge>`, `<PriceTag>`) rather than copy-pasting the same utility chain everywhere.
- **Mobile-first.** Write the unprefixed (mobile) styles first, then layer `sm:` / `md:` / `lg:` breakpoints upward — matches the >60-70% mobile session share target from the PRD.

---

## 3. Security Boundaries — the non-negotiables

These map directly to decisions already locked in the TRD. Listed here explicitly because they're the ones most likely to get quietly broken under "just make it work" pressure during a vibe-coding session.

1. **RLS is the real security boundary, not the API route.** Every table has RLS enabled per the TRD. An API route doing an auth check is a *convenience* (better error messages, rate limiting) — it is never the only thing standing between a bad actor and the data. If a policy and a route check ever disagree, fix the policy; don't patch around it in the route.
   - **RLS is row-level, not column-level.** A permissive `select` policy on a table exposes *every column* on any row it allows through — it cannot hide one sensitive field (like `whatsapp_number`) while allowing the rest of the row. If a table has a column that must never reach certain clients, use a `REVOKE`/`GRANT` on that specific column, or — more simply — create a view that omits the sensitive column entirely and point all client-facing reads at the view instead of the base table. This exact mistake was caught during review on `profiles.whatsapp_number` (see TRD §3.1/§5.5) — treat it as the standing pattern for any future sensitive column, not a one-off fix.
2. **The Supabase service-role key never reaches the client.** It's used only in server-only files (`lib/supabase/admin.ts`) and only for the specific case that needs to bypass RLS (reading `whatsapp_number` in the contact-reveal route). Never import `lib/supabase/admin.ts` into a Client Component.
3. **The seller's phone number is never sent to the browser as a field**, in any API response, any page prop, any client-side state. The only thing that ever crosses that boundary is a fully-constructed `wa.me` URL, built server-side, per TRD §5.5.
4. **Rate limits are enforced server-side, always**, even though the UI also disables the button client-side for UX. A disabled button is a hint to the user, not a security control — assume any client-side check can be bypassed and confirm server-side too.
5. **Never trust `category_id`, `price`, `status`, or `seller_id` values sent from the client without validating against the Zod schema first.** Especially `status` — a listing's status transitions (pending → approved, approved → sold) should be controlled by server logic based on role/ownership, never accepted verbatim from client input.
6. **Admin actions (ban, promote, approve/reject, resolve report) always re-check `is_admin` server-side**, even if the UI only renders the button for admins. Hiding a button is not access control.

---

## 4. Scope Boundaries

Tie back to PRD v2 §3.2 and §8 — this is where "vibe coding drift" tends to happen, where a coding assistant, trying to be helpful, quietly adds something out of scope because it seems like a natural extension.

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

If a coding assistant suggests any of the above "since it would only take a few more minutes" — that's exactly the scope-creep instinct this project has deliberately fought since the PRD stage. Decline it, even if it's technically easy.

---

## 5. What to Use

| Concern | Use |
|---|---|
| Styling | Tailwind CSS, theme tokens once design guide is finalized |
| Validation | Zod, one schema per shape, shared client/server |
| Forms | Native React state + Zod validation; no heavy form library needed at this scale (React Hook Form is fine to add later if forms get complex, not required for v1) |
| Data fetching (reads) | Direct Supabase client queries from Server Components where possible — don't wrap every read in a custom API route unnecessarily |
| Data mutations / sensitive logic | Next.js API routes (`app/api/**/route.ts`) per TRD §5 |
| Auth | Supabase Auth SDK directly — no custom session/JWT handling |
| Images | Cloudinary unsigned upload preset, direct browser-to-Cloudinary upload |
| IDs | `gen_random_uuid()` at the DB level for primary keys; `nanoid` for the human-readable slug suffix |
| Dates/times | Store as `timestamptz` in Postgres; format for display with a lightweight utility (e.g. native `Intl.DateTimeFormat`) — avoid pulling in a heavy date library for simple relative-time display |

---

## 6. What to Avoid

- **No new backend services or databases.** Everything lives in Supabase + Cloudinary + Vercel per the locked stack — don't introduce Redis, a separate queue service, etc. for v1, even if it would "solve X more elegantly."
- **No client-side secrets.** Anything prefixed `NEXT_PUBLIC_` is public by definition — never put an API secret, service-role key, or Cloudinary API secret behind that prefix.
- **No premature abstraction.** Don't build a generic plugin system, theme engine, or config-driven feature flags beyond the one that already exists (`admin_settings.approval_mode`). Solo, zero-budget, fast-moving projects lose more time to speculative abstraction than they save.
- **No silently swallowed errors.** Every `try/catch` either handles the error meaningfully (user-facing message, retry, fallback) or re-throws/logs it — never an empty `catch {}` block.
- **No inconsistent naming across layers.** If the DB column is `whatsapp_number`, the API field and the TypeScript type should also be `whatsapp_number` (or a single, consistent transform applied everywhere) — not `phone` in one place and `contactNumber` in another.

---

## 7. Error Handling

### 7.1 API route error shape (consistent across every route)
```ts
// Success
{ data: <payload> }

// Error
{ error: { message: string, code?: string } }
```
Every API route returns this shape. The frontend never has to guess whether a response is `{ ...fields }` on success vs. `{ error: "..." }` on failure — it's always one of these two shapes.

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
| Unexpected server error | 500 |

### 7.3 User-facing message tone
Per the interface's own voice, not apologetic, not vague:
- ❌ "Oops! Something went wrong, sorry about that 😅"
- ✅ "Couldn't post your listing. Check that all fields are filled in and try again."
- ❌ "Error 429"
- ✅ "Daily contact limit reached. Try again tomorrow."

State what happened and what to do next, every time. Never expose raw database or stack trace text to the user — log that server-side, show a plain-language message client-side.

### 7.4 Fail-open vs. fail-closed — decide per feature, don't default blindly
- **Contact reveal, listing creation, admin actions → fail closed.** If the rate-limit check errors, if the admin-check query fails, if anything is uncertain — deny the action and show an error. Never let an exception accidentally grant access.
- **Non-critical background operations → fail open, logged.** E.g. incrementing a listing's `views` counter, or the Cloudinary cleanup-on-delete call — if these fail, log it and move on; don't block the user's primary action (viewing a listing, deleting their own listing) over a failed side-effect.
- **The daily cron keepalive → fail open, silent.** If it fails once, it's not urgent (Supabase's pause window is 7 days, one missed daily ping isn't fatal) — but should still log the failure somewhere you can notice if it fails repeatedly.

### 7.5 Empty states
Per the same "direction, not mood" principle: an empty Browse grid, an empty Dashboard, zero pending reports — each should say plainly what's true and what to do about it (e.g. "No listings match these filters — try clearing them" / "You haven't posted anything yet — list your first item"), not a generic "Nothing here!" placeholder.

---

## 8. When Rules Conflict With Speed

This project explicitly wants both speed and security — here's the resolution order when they pull against each other:
1. **Security boundaries (Section 3) are never traded for speed.** These are cheap to do right from the start and expensive to retrofit.
2. **Scope boundaries (Section 4) are never traded for "it's basically free to add."** Scope discipline is a speed tool, not its opposite.
3. **Styling polish and type-perfection in low-stakes UI code CAN be traded for speed** — ship the ugly-but-working version of a non-critical screen and refine later, rather than blocking launch on it.

---

## 9. Version Control

- **Push to GitHub before making any key change** — a key change means anything touching auth, RLS policies, the contact-reveal route, admin logic, the database schema, or the approval-mode toggle. The commit before the change is your rollback point; a vibe-coding session that goes wrong on one of these should be a `git checkout` away from undone, not a rebuild.
- Routine UI tweaks, copy changes, or styling adjustments don't need this ceremony — use judgment. The rule exists for changes that are expensive to debug blind, not every single commit.
- Commit messages should say what changed and why in plain language (e.g. `"Add rate limit check to contact reveal route"`), not generic messages like `"update"` or `"fix"` — future-you (or a coding assistant resuming a session) needs to be able to scan the log and understand what happened without opening every diff.

## 10. Progress Log — `progress.md`

- Maintain a `progress.md` at the project root, updated as work happens — not retroactively reconstructed later.
- Each entry should note: **date, what was built/changed, which phase (per roadmap.md) it belongs to, and anything left unfinished or deliberately deferred.**
- This is the handoff document between sessions — since you're vibe-coding, a new session (or a new coding assistant instance with no memory of earlier ones) should be able to read `progress.md` and understand exactly where the build stands, without you having to re-explain context every time.
- Suggested format per entry:
  ```
  ## 2026-08-14 — Phase 1: Database, RLS & Auth
  - Created all tables from TRD §2
  - Applied RLS policies for profiles, listings, categories
  - Signup + email verification flow working end to end
  - TODO: contact_reveals and admin_settings RLS still pending
  ```
