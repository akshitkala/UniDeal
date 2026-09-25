# UniDeal — Technical Requirements Document

| Field | Value |
|---|---|
| Version | 1.1 |
| Date | September 2026 |
| Status | Ready for Development |
| Author | Akshit (Solo Founder), spec assisted by Claude |
| Platform | Next.js 14+ (App Router), Web |
| Budget | ₹0/month — free tiers only |
| Companion docs | UniDeal PRD v2.1, architecture.md v1.1, design.md, appflow.md |

> **How to use this document:** This TRD is written to be handed directly to an AI coding assistant. Every schema, policy, and API contract below is intended to be implemented exactly as specified — not reinterpreted. Where a decision was deliberately deferred (e.g. AI moderation), it is marked `[FUTURE]` and must NOT be built in v1.
>
> **Changes in this revision (v1.1):** (1) resolved the first-name-only display decision — no schema change, render-layer only, see §2.1a; (2) login/signup routes replaced by a modal component, §4 and §5.1a; (3) added `POST /api/contact` route and `RESEND_API_KEY`, §5.12 and §7; (4) added `our-story`, `how-it-works` static routes to folder structure.

---

## 1. Final Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend + Backend | Next.js 14+ App Router | Deployed on Vercel (Hobby/free tier) |
| Database | Supabase (Postgres) | Free tier: 500MB DB, 50k MAU |
| Auth | Supabase Auth | Email/password + email verification, no domain restriction |
| Authorization | Postgres Row Level Security (RLS) | Enforced at DB level, not just in API routes |
| Image storage | Cloudinary | Free tier: 25 credits/month (storage+bandwidth+transforms shared pool) |
| Contact flow (seller) | `wa.me` deep link | Generated server-side; phone number never rendered in DOM |
| Contact flow (support) | Resend API | Free tier; powers the `/contact` form only, unrelated to seller contact |
| Uptime | Daily Vercel Cron | Pings a health-check route to prevent Supabase 7-day pause |
| Hosting | Vercel | Hobby (free) tier |

**Known constraint (documented, not solved in v1):** Cloudinary's free tier realistically supports up to ~5,000–8,000 active listings before storage/bandwidth credits run out. This is acceptable for single-campus launch. Revisit when approaching that volume — either upgrade Cloudinary or migrate images to Cloudflare R2.

---

## 2. Database Schema

All tables live in the `public` schema. `auth.users` is managed by Supabase Auth — do not modify it directly; extend via `profiles`.

### 2.1 `profiles`

Extends `auth.users` with app-specific fields. One row per user, created via trigger on signup.

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  branch text,
  year text,
  whatsapp_number text, -- stored as E.164 format e.g. +919876543210, NEVER exposed to clients — see §3.1 for column-level lockdown
  is_admin boolean not null default false,
  is_banned boolean not null default false,
  promoted_by uuid references public.profiles(id), -- who promoted this user to admin, null if never promoted or is the original admin
  promoted_at timestamptz, -- lightweight breadcrumb, not a full audit log (that's still out of scope per rules.md §4)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_is_admin on public.profiles(is_admin);
```

### 2.1a Seller identity display — resolved (no schema change)

Per PRD v2.1 §5.2, listings show **first name only**. This is a **render-layer decision, not a schema change**: `full_name` continues to be collected at signup and stored as-is (e.g. `"Akshit Sharma"`), and `public_profiles` (§5.5) continues to expose `full_name` unchanged.

The first-token extraction happens in the frontend display layer only — e.g. a small shared utility:
```ts
// lib/display-name.ts
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}
```
Every component that renders a seller's name on a listing card, listing detail page, or anywhere else visible to other users must call this utility rather than rendering `full_name` directly. `branch` and `year` are collected and stored but, per the same scope decision, are **not rendered on listing cards or listing detail** — they remain collected only for potential future use and are visible to the user on their own Profile page.

**Why this approach over a schema split:** splitting into `first_name`/`last_name` columns would require a migration and touches auth-trigger logic for no functional gain — the full name is still useful to store (e.g. for admin-side identification, future full-name display if the tradeoff is revisited) and the display restriction is purely a UI concern. If this assumption is wrong for your use case, flag it and we can migrate to split columns instead.

**Note on `whatsapp_number` is optional:** the field stays optional on the Profile page and for rows that already exist — a user can leave it blank there in isolation, and TRD §5.5 still handles a null number as a valid "Seller contact not available" state for listings that already exist. One enforcement point was added post-launch (2026-09-24): `POST /api/listings` refuses to create a *new* listing while the seller's number is null — it collects the number in the same submission when the seller has none yet (see §5.2). Do not block a *Profile* save on this field being set.

**Trigger — auto-create profile on signup:**
```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Student'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 2.2 `categories`

Hardcoded seed data, not dynamically editable in v1 (per scope cut).

```sql
create table public.categories (
  id serial primary key,
  name text not null unique,
  slug text not null unique
);

insert into public.categories (name, slug) values
  ('Books & Notes', 'books-notes'),
  ('Electronics', 'electronics'),
  ('Furniture', 'furniture'),
  ('Clothing', 'clothing'),
  ('Sports & Fitness', 'sports-fitness'),
  ('Miscellaneous', 'miscellaneous');
```

### 2.3 `listings`

```sql
create type listing_condition as enum ('New', 'Like New', 'Good', 'Used', 'Damaged');
create type listing_status as enum ('approved', 'pending', 'rejected', 'sold', 'expired');

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique, -- e.g. "study-lamp-x7f2a"
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  negotiable boolean not null default false,
  category_id int not null references public.categories(id),
  condition listing_condition not null,
  images text[] not null check (array_length(images, 1) between 1 and 4), -- Cloudinary URLs
  status listing_status not null default 'approved', -- default depends on approval mode, see 5.9
  rejection_reason text, -- set when an admin rejects a listing (5.9); null otherwise
  views int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sold_at timestamptz
);

create index idx_listings_status on public.listings(status);
create index idx_listings_category on public.listings(category_id);
create index idx_listings_seller on public.listings(seller_id);
create index idx_listings_created on public.listings(created_at desc);
```

**Slug generation:** `{kebab-case-title}-{5 char nanoid}`, generated in the API route before insert (not in DB) so the coding assistant can reuse the same nanoid utility across create/edit.

### 2.4 `reports`

```sql
create type report_status as enum ('pending', 'resolved_removed', 'resolved_dismissed');

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null, -- from fixed dropdown, see 5.8
  status report_status not null default 'pending',
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (listing_id, reporter_id) -- one report per user per listing
);

create index idx_reports_status on public.reports(status);
```

### 2.5 `contact_reveals`

Logs every WhatsApp contact reveal — used for rate limiting AND as your demand-signal metric.

```sql
create table public.contact_reveals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index idx_contact_reveals_user_date on public.contact_reveals(user_id, created_at);
```

### 2.6 `admin_settings`

Single-row config table controlling approval mode — avoids hardcoding logic that you'll want to toggle without a redeploy.

```sql
create table public.admin_settings (
  id int primary key default 1,
  approval_mode text not null default 'auto' check (approval_mode in ('auto', 'manual', 'ai')), -- 'ai' is [FUTURE], do not implement branch logic for it in v1
  constraint single_row check (id = 1)
);

insert into public.admin_settings (id, approval_mode) values (1, 'auto');
```

---

## 3. Row Level Security (RLS) Policies

Enable RLS on every table. These policies are the actual security layer — do not rely on API route checks alone.

```sql
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.reports enable row level security;
alter table public.contact_reveals enable row level security;
alter table public.admin_settings enable row level security;
alter table public.categories enable row level security;
```

### 3.1 `profiles`

> **Important — RLS is row-level, not column-level.** A `select` policy on `profiles` controls *which rows* a user can read, not *which columns*. If `whatsapp_number` lives on a row a policy allows through, RLS alone will not stop a client from reading it directly via `select * from profiles`. Column-level secrecy needs a `REVOKE` on the column itself, or a view that omits it (used below). This is why `public_profiles` (§5.5) is not just a nicety for the contact route — it is the **only** surface any client-side code should ever query for profile data.

```sql
-- Authenticated users can read profile ROWS (name/branch/year/etc via public_profiles view below,
-- never whatsapp_number directly — see REVOKE statement)
create policy "profiles_select_all" on public.profiles
  for select using (auth.role() = 'authenticated');

-- Column-level lockdown: even though the row-select policy above is permissive,
-- explicitly strip SELECT on whatsapp_number from both anon and authenticated roles.
-- Only the service-role key (used exclusively in the /contact route, see §5.5) can read it.
revoke select on public.profiles from anon, authenticated;
grant select (id, full_name, branch, year, is_admin, is_banned, promoted_by, promoted_at, created_at, updated_at)
  on public.profiles to authenticated;
-- Note: this deliberately does NOT include whatsapp_number in the granted column list.

-- Users can only update their own profile; cannot self-promote to admin or unban themselves
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and is_admin = (select is_admin from public.profiles where id = auth.uid()) and is_banned = (select is_banned from public.profiles where id = auth.uid()));

-- Only admins can change is_admin / is_banned on other users
create policy "profiles_admin_update_any" on public.profiles
  for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));
```

**Public-readable view for guests:** guests (not logged in) must be able to see the seller's first name on a listing detail page per PRD §5.2 — but the column grant above only covers the `authenticated` role. Add a `public_profiles` view (defined fully in §5.5) with its own permissive policy so logged-out visitors can read it too:
```sql
alter view public.public_profiles set (security_invoker = false); -- runs as view owner, bypassing base-table RLS by design
grant select on public.public_profiles to anon, authenticated;
```
This view is the **only** profile surface guest-facing pages should ever query. It never exposes `whatsapp_number` by construction (the column simply isn't selected into it), so there's no reliance on RLS at all for this path. It still returns full `full_name` — the first-name-only restriction is applied at render time per §2.1a, not by narrowing this view further.

### 3.2 `categories`
```sql
create policy "categories_select_all" on public.categories
  for select using (true);
-- No insert/update/delete policy = only editable via Supabase dashboard/service role, not app-facing in v1
```

### 3.3 `listings`
```sql
-- Public can browse approved listings from non-banned sellers
create policy "listings_select_public" on public.listings
  for select using (
    status = 'approved'
    and exists (select 1 from public.profiles p where p.id = seller_id and p.is_banned = false)
  );

-- Sellers can always see their own listings regardless of status
create policy "listings_select_own" on public.listings
  for select using (auth.uid() = seller_id);

-- Admins can see everything
create policy "listings_select_admin" on public.listings
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- Only verified, non-banned users can create listings, and only as themselves
create policy "listings_insert_own" on public.listings
  for insert with check (
    auth.uid() = seller_id
    and exists (
      select 1 from public.profiles p
      join auth.users u on u.id = p.id
      where p.id = auth.uid() and p.is_banned = false and u.email_confirmed_at is not null
    )
  );

-- Sellers can update their own listings (edit, mark sold); admins can update any (approve/reject)
create policy "listings_update_own" on public.listings
  for update using (auth.uid() = seller_id);

create policy "listings_update_admin" on public.listings
  for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- Sellers can delete their own; admins can delete any
create policy "listings_delete_own" on public.listings
  for delete using (auth.uid() = seller_id);

create policy "listings_delete_admin" on public.listings
  for delete using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));
```

### 3.4 `reports`
```sql
-- Verified users can file a report as themselves
create policy "reports_insert_own" on public.reports
  for insert with check (auth.uid() = reporter_id);

-- Reporters can see their own reports; admins can see all
create policy "reports_select_own" on public.reports
  for select using (auth.uid() = reporter_id);

create policy "reports_select_admin" on public.reports
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- Only admins can resolve reports
create policy "reports_update_admin" on public.reports
  for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));
```

### 3.5 `contact_reveals`
```sql
-- Users can insert their own reveal logs (done via API route with service checks, see 5.5)
create policy "reveals_insert_own" on public.contact_reveals
  for insert with check (auth.uid() = user_id);

-- Users can see their own reveal history (for rate-limit count); admins see all
create policy "reveals_select_own" on public.contact_reveals
  for select using (auth.uid() = user_id);

create policy "reveals_select_admin" on public.contact_reveals
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));
```

### 3.6 `admin_settings`
```sql
-- Admin-only read: no regular user's client needs the moderation mode.
create policy "settings_select_admin" on public.admin_settings
  for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

create policy "settings_update_admin" on public.admin_settings
  for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));
```
Note: `POST /api/listings` (§5.2) still needs to read `approval_mode` when a regular user creates a listing — that read happens **server-side using the service-role client**, not via the user's own session, so this admin-only policy does not block listing creation.

---

## 4. Folder Structure

```
/app
  /(public)
    /page.tsx                    → Home (static landing)
    /browse/page.tsx             → Browse (grid + filters + sort)
    /listing/[slug]/page.tsx     → Listing detail (standalone page, no drawer)
    /our-story/page.tsx          → Static founder/mission page
    /how-it-works/page.tsx       → Static visual walkthrough
    /contact/page.tsx            → Contact Us form (nav label "Contact Us")
  /(auth)
    /verify-email/page.tsx       → Only real route in this group; login/signup are a modal, not routes
  /(account)
    /sell/page.tsx                → Single-form post listing (also used for edit)
    /listing/[slug]/edit/page.tsx → Reuses the Sell form, pre-filled
    /dashboard/page.tsx           → Own listings grouped by status (Active/Sold/Under Review/Rejected)
    /profile/page.tsx
  /admin
    /page.tsx                    → Admin dashboard (overview + settings)
    /listings/pending/page.tsx   → Manual-mode queue
    /reports/page.tsx
    /users/page.tsx
  /api
    /listings/route.ts           → GET (browse+filter+sort), POST (create)
    /listings/[id]/route.ts      → PATCH (edit), DELETE
    /listings/[id]/sold/route.ts → POST
    /listings/[id]/contact/route.ts → POST (rate-limited reveal)
    /listings/[id]/report/route.ts → POST
    /contact/route.ts            → POST (support contact form → Resend, see §5.12)
    /admin/settings/route.ts     → GET, PATCH (approval_mode)
    /admin/listings/pending/route.ts → GET (manual-mode queue)
    /admin/listings/[id]/approve/route.ts → PATCH
    /admin/listings/[id]/reject/route.ts  → PATCH
    /admin/reports/route.ts      → GET
    /admin/reports/[id]/resolve/route.ts → PATCH
    /admin/users/[id]/ban/route.ts       → POST
    /admin/users/[id]/promote/route.ts   → POST
    /cron/keepalive/route.ts     → GET (daily ping target)
/components
  /auth
    /AuthModal.tsx                → Login/Signup tabbed modal, focus-trapped, closes on Escape,
                                     pushes history state so browser back closes it, not the page
/lib
  /supabase/client.ts   → browser client
  /supabase/server.ts   → server client (uses cookies)
  /supabase/admin.ts    → service-role client, server-only, for admin-privileged operations
  /cloudinary.ts        → upload helper
  /whatsapp.ts          → wa.me link builder
  /slug.ts              → nanoid slug generator
  /display-name.ts      → firstName() utility, see §2.1a
/types
  /database.ts          → generated via `supabase gen types typescript`
```

**Auth modal note:** since login/signup no longer have dedicated routes, `returnTo` intent must be tracked in client state (e.g. a query param or a small context value set right before the modal opens) rather than as a page redirect target. On successful auth, the modal closes and the triggering action (Contact Seller, Sell submit, etc.) resumes automatically rather than requiring the user to re-click.

---

## 5. API Contracts & Core Logic

### 5.1 Auth
Use Supabase Auth client SDK directly for signup/login/logout/password-reset — no custom API routes needed. On signup, pass `full_name` in `options.data` so the `handle_new_user` trigger picks it up.

### 5.1a Auth modal behavior
The `AuthModal` component wraps Supabase Auth SDK calls the same way a page would — the only difference is presentation. Requirements:
- Focus trap: Tab/Shift+Tab cycles only within the modal while open
- Escape key closes the modal
- Clicking the overlay backdrop closes the modal
- Opening the modal pushes a history entry (`history.pushState`) so the browser/device back gesture closes the modal instead of navigating away from the underlying page
- On successful login or signup, the modal closes and control returns to whatever action opened it

Email verification: Supabase sends the verification email automatically. Gate posting and contact-reveal by checking `user.email_confirmed_at !== null` both client-side (UI state) AND via RLS (`listings_insert_own` policy above already enforces this at the DB level).

### 5.2 `POST /api/listings` — Create listing
**Auth required.** Body:
```json
{
  "title": "string, 3-100 chars",
  "description": "string, 10-1000 chars",
  "price": "number >= 0",
  "negotiable": "boolean",
  "category_id": "int",
  "condition": "New | Like New | Good | Used | Damaged",
  "images": ["array of 1-4 Cloudinary URLs, already uploaded client-side before this call"],
  "whatsapp_number": "E.164 string — required only when the seller's profile has no number saved yet; omitted otherwise"
}
```
Logic:
1. Verify session server-side.
1a. Read `profiles.whatsapp_number` for the seller (service-role client — the column is REVOKE'd from client roles). If no number is on file, this body must include `whatsapp_number` (E.164) and it is saved to the profile **before** the insert; if the body omits it too → 400 `VALIDATION_ERROR`. A listing is never created with a null seller number. If a number is already on file the field is ignored — the Profile page remains the place to change it. (Post-launch addition, 2026-09-24 — see §2.1a.)
2. Generate slug: `slugify(title) + '-' + nanoid(5)`.
3. Read `admin_settings.approval_mode`. If `'auto'` → insert with `status = 'approved'`. If `'manual'` → insert with `status = 'pending'`. (`'ai'` branch is `[FUTURE]` — do not implement conditional logic for it yet; treat any unexpected value as `'manual'` as a safe fallback.)
4. Insert row. RLS `listings_insert_own` policy enforces email-verified + not-banned.
5. Return created listing.

### 5.3 `GET /api/listings` — Browse
Query params: `?category=slug&condition=X&search=text&sort=newest|price_asc|price_desc&page=1`

Logic:
- Base query filters `status = 'approved'` (RLS already restricts this, but also filter explicitly for clarity/performance).
- `search` does `ilike` match against `title` and `description`.
- `sort=newest` → `order by created_at desc` (default). `price_asc` → `order by price asc`. `price_desc` → `order by price desc`.
- Paginate 20 per page.

### 5.4 Listing detail — direct Supabase query, no API route

Direct Supabase query from the server component at `/listing/[slug]/page.tsx`. Query `listings` joined with `public_profiles` (never the base `profiles` table) to get `full_name`, then apply `firstName()` (§2.1a) before rendering — never render `branch`/`year` on this page per the scope decision in PRD §5.2.

**Views counter:** incrementing `views` cannot go through a normal client update, since RLS on `listings` only allows the seller or an admin to `update` a row (§3.3), and a random visitor is neither. Use a narrow `security definer` Postgres function instead:
```sql
create or replace function public.increment_listing_views(listing_id uuid)
returns void as $$
begin
  update public.listings set views = views + 1 where id = listing_id;
end;
$$ language plpgsql security definer;

grant execute on function public.increment_listing_views(uuid) to anon, authenticated;
```
Call this via `supabase.rpc('increment_listing_views', { listing_id })` from the page component, fire-and-forget (rules.md §7.4 — non-critical background operation, fail open).

### 5.5 `POST /api/listings/[id]/contact` — Reveal contact
**This is the core trust mechanic — implement exactly as specified.**

1. Verify session server-side. If not logged in → 401.
2. Check `profiles.is_banned` — if true, 403.
3. Check `auth.users.email_confirmed_at` — if null, 403 with message `"Verify your email to contact sellers"`.
4. Rate limit check:
   ```sql
   select count(*) from contact_reveals
   where user_id = :current_user_id
   and created_at > now() - interval '1 day';
   ```
   If count >= 50 → 429, message `"Daily limit reached. Try again tomorrow."`
5. Fetch listing's seller `whatsapp_number`. If null → 404, message `"Seller contact not available"`.
6. Insert a row into `contact_reveals` (user_id, listing_id).
7. Build the link: `https://wa.me/{whatsapp_number}?text={encoded prefill message}` — e.g. `Hi! I'm interested in your listing "{title}" on UniDeal.`
8. Return `{ "waLink": "https://wa.me/..." }` — **the response body must never contain the raw phone number as a separate field.** The frontend calls `window.open(waLink, '_blank')`.

Use the **service-role client** (`lib/supabase/admin.ts`) for this route specifically — it is the *only* place in the codebase permitted to read `whatsapp_number`. The view definition:

```sql
create view public.public_profiles as
  select id, full_name, branch, year, is_admin, is_banned, promoted_by, promoted_at, created_at, updated_at
  from public.profiles;
-- Deliberately omits whatsapp_number. This is a hard schema-level guarantee.
```
Grants for this view are defined in §3.1.

### 5.6 `POST /api/listings/[id]/sold` — Mark as sold
Seller-only (checked via RLS `listings_update_own`). Sets `status = 'sold'`, `sold_at = now()`.

### 5.7 `PATCH` / `DELETE /api/listings/[id]` — Edit / delete
Standard, RLS-enforced. Editing does not reset `status` back to pending even in manual mode (avoid re-review friction for minor edits like price drops) — this is a deliberate v1 simplification.

**QA-07 decision (2026-09-22):** rejected listings are **not editable** from the dashboard — since editing never resets status, the Edit action could not change the rejection, so the button is hidden for rejected listings. The v1 recovery path is delete-and-repost, which creates a fresh listing that re-enters the moderation queue under the current `approval_mode`. A `rejected → pending` resubmit flow is deliberately out of scope: under auto-approve mode it would republish admin-rejected listings without review (moderation-integrity hole).

### 5.8 `POST /api/listings/[id]/report` — Report a listing
Body: `{ "reason": "one of: Fake listing | Prohibited item | Misleading price | Spam | Other" }`
Inserts into `reports` with `status = 'pending'`. The `unique(listing_id, reporter_id)` constraint prevents duplicate reports from the same user — handle the resulting DB error gracefully as `"You've already reported this listing"`.

**No auto-hide threshold in v1** (per your call — every report waits for manual admin approval to remove). Admin resolves via:

### `PATCH /api/admin/reports/[id]/resolve`
Admin-only. Body: `{ "action": "remove" | "dismiss" }`. If `"remove"` → set listing `status = 'rejected'` AND report `status = 'resolved_removed'`. If `"dismiss"` → report `status = 'resolved_dismissed'`, listing untouched.

**Dashboard status label mapping (confirmed):** the DB enum (`approved | pending | rejected | sold | expired`) and the Dashboard UI labels map 1:1 as follows — `approved` → "Active", `pending` → "Under Review", `rejected` → "Rejected", `sold` → "Sold". `expired` is unused in v1 (placeholder only).

### 5.9 Admin settings & moderation
- `GET /api/admin/settings` → `{ "approval_mode": "auto" }`
- `PATCH /api/admin/settings` → admin-only, updates `approval_mode`. Changing this does NOT retroactively affect existing listings.
- `GET /api/admin/listings/pending` → only meaningful in `'manual'` mode; returns `status = 'pending'` listings.
- `PATCH /api/admin/listings/[id]/approve` → `status = 'approved'`.
- `PATCH /api/admin/listings/[id]/reject` → body `{ "reason": "..." }`, sets `status = 'rejected'` AND persists the reason into `listings.rejection_reason`. Display `rejection_reason` to the seller on their own Dashboard/listing view.

### 5.10 User management
- `POST /api/admin/users/[id]/ban` — admin-only, sets `is_banned = true`. Their listings remain in DB with `status` unchanged, but the `listings_select_public` policy already excludes banned sellers' listings from public view automatically.
- `POST /api/admin/users/[id]/unban` — reverses.
- `POST /api/admin/users/[id]/promote` — admin-only, sets target's `is_admin = true`. Any admin can promote any user — no super-admin tier.

### 5.11 `GET /api/cron/keepalive`
Trivial route that runs a lightweight query (e.g. `select 1 from categories limit 1`) to keep the Supabase project active. Protect with a `CRON_SECRET` header check:
```ts
if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
  return new Response('Unauthorized', { status: 401 });
}
```

`vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/keepalive", "schedule": "0 3 * * *" }
  ]
}
```

### 5.12 `POST /api/contact` — Support contact form (new in v1.1)
Body:
```json
{
  "name": "string, 2-100 chars",
  "email": "string, valid email",
  "message": "string, 10-1000 chars"
}
```
Logic:
1. Validate body against a Zod schema (`lib/validation/contact.ts`).
2. Send via Resend API using `RESEND_API_KEY`, addressed to the founder's support inbox, with the submitter's name/email/message in the body.
3. On Resend failure, return the standard error shape (`{ error: { message, code } }`) with a 500 — do not expose Resend's raw error to the client; log it server-side.
4. Return `{ data: { sent: true } }` on success.

This route is unrelated to the seller-contact mechanic in §5.5 — no rate limiting, auth, or `contact_reveals` logging applies here. It is a simple support-form email send. No auth required to submit — this is public-facing support contact, open to guests and logged-in users alike.

---

## 6. Image Upload Flow (Cloudinary)

1. Client selects up to 4 images on the sell form.
2. Client-side: reject any file > 5MB before upload.
3. Upload directly from browser to Cloudinary using an **unsigned upload preset**. Configure the preset in the Cloudinary dashboard with:
   - Folder: `unideal/listings`
   - Auto-format + auto-quality transformation applied on delivery (`f_auto,q_auto`)
   - Max file size enforced server-side on Cloudinary's end too, as defense in depth
4. Cloudinary returns a `secure_url` per image; the frontend collects these into the `images` array sent to `POST /api/listings`.
5. On listing delete, optionally call Cloudinary's destroy API to free storage credits — best-effort cleanup, not a blocking requirement.

---

## 7. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-only, never exposed to client
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
CRON_SECRET=                        # random string, used to protect /api/cron/keepalive
RESEND_API_KEY=                     # server-only, used by /api/contact (new in v1.1)
```

---

## 8. Acceptance Criteria (carried over + refined from PRD)

| Feature | Acceptance Criteria |
|---|---|
| Registration | Any email accepted; verification email sent by Supabase automatically |
| Posting gate | Unverified or banned users cannot create listings — enforced by RLS, not just UI |
| Contact reveal | Verified, non-banned, under-limit user taps "Contact Seller" → `waLink` returned → WhatsApp opens. Phone number never appears in any API response body or DOM. 51st reveal in a rolling 24h window is rejected. |
| Auto-approve mode | New listings go live immediately with `status = 'approved'`, no admin action needed |
| Banned user listings | Immediately excluded from public browse via RLS the moment `is_banned` flips true — no manual hide step needed |
| Report flow | Duplicate reports from same user on same listing rejected with clear message; listing only removed after explicit admin action |
| Image upload | Files > 5MB rejected client-side before any network call |
| Admin promotion | Any existing admin can promote any user to admin; no separate super-admin tier exists |
| Profile data secrecy | `whatsapp_number` cannot be read by any client-side query, logged-in or not |
| Guest listing detail | A logged-out visitor can view a listing's seller first name (via `public_profiles` + `firstName()`) without being blocked by auth |
| Rejection reason | A rejected listing's reason is visible to the seller on their own Dashboard, not silently discarded |
| First-name-only display | No page or API response renders a seller's full name, branch, or year to anyone other than the seller themselves |
| Auth modal | Login/signup never navigates to a dedicated URL; browser back closes the modal without leaving the underlying page |
| Contact form | `POST /api/contact` sends via Resend; validation errors are field-level, not just a top-of-form summary |

---

## 9. Explicitly Out of Scope (v1)

Unchanged from PRD: in-app chat, payments/escrow, reviews/ratings, exchange/rent, push notifications, dynamic category management, AI moderation (`admin_settings.approval_mode = 'ai'` value exists in the schema as a placeholder only), drawer/bottom-sheet listing detail pattern, save/wishlist, multi-campus (`campus_id`) fields, full name/branch/year shown publicly on listings.
