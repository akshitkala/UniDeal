# UniDeal — Frontend Audit Report (Phase 2)
Generated: 2026-03-06 15:31 IST

## Summary
- Frontend files checked: 33
- Missing files: 14
- Component checks passed: 34
- Component checks failed: 27

---

## 1. File Existence

### EXISTS
- `app/(main)/page.tsx`
- `app/(main)/layout.tsx`
- `app/(main)/listings/[slug]/page.tsx`
- `app/(main)/@modal/default.tsx`
- `app/(main)/@modal/(.)listings/[slug]/page.tsx`
- `app/(main)/dashboard/page.tsx`
- `app/(main)/saved/page.tsx`
- `app/(main)/profile/page.tsx`
- `app/(auth)/login/page.tsx`
- `app/(auth)/layout.tsx`
- `app/(admin)/layout.tsx`
- `app/(admin)/moderation/page.tsx` *(note: path is `/moderation`, not `/admin`)*
- `app/(admin)/super-admin/config/page.tsx`
- `components/layout/Topbar.tsx`
- `components/layout/Sidebar.tsx`
- `components/layout/AdminSidebar.tsx`
- `components/listing/ListingCard.tsx`
- `components/listing/SkeletonCard.tsx`
- `components/listing/ListingDetailDrawer.tsx`
- `components/listing/SellModal.tsx`
- `components/listing/PhotoUploadZone.tsx`
- `components/listing/ContactButton.tsx`
- `components/listing/ContactOverlay.tsx` *(note: named differently from spec; is ContactButton's sub-component)*
- `components/listing/SellProvider.tsx` *(note: named SellProvider, not SellModalContext)*

### MISSING
- `app/(admin)/admin/page.tsx` *(closest: `app/(admin)/moderation/page.tsx`)*
- `app/(admin)/admin/layout.tsx`
- `app/(admin)/admin/listings/page.tsx`
- `app/(admin)/admin/users/page.tsx`
- `app/(admin)/admin/reports/page.tsx`
- `app/(admin)/super-admin/activity/page.tsx`
- `app/(admin)/super-admin/users/page.tsx`
- `components/admin/ModerationCard.tsx` *(inlined in moderation/page.tsx)*
- `components/admin/RejectionReasonModal.tsx`
- `context/SellModalContext.tsx` *(equivalent: `components/listing/SellProvider.tsx`)*
- `lib/auth/AuthProvider.tsx` *(required by many components — EXISTS but not in audit spec)*

---

## 2. Component-by-Component Audit

### PASS

**app/(main)/layout.tsx**
- ✅ Accepts `modal` prop alongside `children`
- ✅ Renders `{modal}` at end of `SellProvider` wrapper
- ✅ Wraps children with `SellProvider` (equivalent of `SellModalProvider`)
- ✅ Imports and renders `Topbar` and `Sidebar`
- ✅ Has maintenance mode check with admin bypass

**app/(main)/@modal/default.tsx**
- ✅ Returns `null`

**app/(main)/@modal/(.)listings/[slug]/page.tsx**
- ✅ Imports `ListingDetailDrawer`
- ✅ Fetches listing from DB by slug
- ✅ Imports `@/models/User` and `@/models/Category` for populate
- ✅ Passes listing as prop to `ListingDetailDrawer`
- ✅ Returns `null` for not-found listing (no crash)
- ✅ Serializes with `JSON.parse(JSON.stringify(listing))` before passing

**app/(main)/page.tsx**
- ✅ Imports `@/models/User` and `@/models/Category`
- ✅ Reads `searchParams` for category, condition, sort, search
- ✅ Renders filter chips for condition with active state
- ✅ Renders sort dropdown via `SortSelect`
- ✅ Renders listing grid with `ListingCard`
- ✅ Shows `SkeletonCard` via `Suspense` fallback
- ✅ Shows empty state when no listings

**app/(main)/listings/[slug]/page.tsx**
- ✅ Standalone page for direct URL access
- ✅ Uses `ListingDetailView` component for full detail

**app/(main)/saved/page.tsx**
- ✅ Redirects to `/login` if no token
- ✅ Verifies token before fetching
- ✅ Shows listing card grid
- ✅ Shows empty state with browse link

**app/(auth)/login/page.tsx**
- ✅ Uses `signInWithPopup` with `googleProvider`
- ✅ Gets `getIdToken()` after popup
- ✅ POSTs to `/api/auth/login` with `{ firebaseIdToken: token }`
- ✅ Redirects to `returnTo` param or `/` on success
- ✅ Suppresses error for `auth/popup-closed-by-user`

**app/(admin)/layout.tsx**
- ✅ Renders `Topbar` and `AdminSidebar`
- ✅ Grid layout with `gridTemplateAreas`

**app/(admin)/super-admin/config/page.tsx**
- ✅ Fetches from `GET /api/super-admin/config` on load
- ✅ Approval mode dropdown with Automatic / Manual / AI-gated
- ✅ Maintenance mode toggle with warning indicator
- ✅ Allow new listings toggle
- ✅ Each control calls PATCH `/api/super-admin/config` independently
- ✅ Saving state disables all controls

**components/layout/Topbar.tsx**
- ✅ UniDeal logo + wordmark
- ✅ Search bar with form submit navigating to `/?search=...`
- ✅ "List Item" button guards with `!user` → redirects to `/login`
- ✅ Shows profile photo or initial letter avatar
- ✅ Avatar click shows dropdown
- ✅ Dropdown shows: My Listings, Profile, Sign Out links
- ✅ Sign Out calls `logout()` from `useAuth`

**components/listing/ListingCard.tsx**
- ✅ Uses `router.push('/listings/' + slug, { scroll: false })` — NOT hard navigation
- ✅ Shows image, price, condition badge, title, location, time-ago
- ✅ Shows save button (♡ / 🔖)
- ✅ Calls POST `/api/listings/[slug]/save`
- ✅ Optimistic UI on save toggle (reverts on error)
- ✅ Handles unauthenticated save → redirects to `/login`

**components/listing/ListingDetailDrawer.tsx**
- ✅ `'use client'` directive
- ✅ `position: fixed, right: 0, top: 60px, bottom: 0`
- ✅ Backdrop closes drawer on click via `router.back()`
- ✅ Escape key closes drawer
- ✅ Slide-in animation from right via `translateX`
- ✅ Shows listing images, title, price, condition, location, seller info, description
- ✅ Sticky footer with `ContactButton`
- ✅ NEVER displays `sellerPhone` or `sellerEmail` in JSX
- ✅ Seller row shows only `displayName`, `photoURL`, and "Verified Seller" label

**components/listing/PhotoUploadZone.tsx**
- ✅ Client-side validates file type (jpeg/png/webp)
- ✅ Validates per-file size (max 5MB)
- ✅ Validates count (max 6)
- ✅ Shows thumbnails with cover label on first image
- ✅ Each thumbnail has × remove button
- ✅ POSTs to `/api/listings/upload`
- ✅ Supports drag-and-drop

**components/layout/Sidebar.tsx**
- ✅ Shows 7 browse nav items
- ✅ Shows 3 account nav items (My Listings, Saved, Profile)
- ✅ Uses `usePathname()` for active state on account items
- ✅ Guards "List Item" button with auth check

**context (SellProvider)**
- ✅ Exports `SellProvider` and `useSell`
- ✅ Provides `openSellModal`
- ✅ `SellProvider` wraps layout in `app/(main)/layout.tsx`
- ✅ `useSell()` throws if used outside provider

---

### FAIL

**app/(admin)/layout.tsx** *(CRITICAL)*
- ❌ No server-side role check — any authenticated user can access admin routes by navigating directly to `/admin/**` or `/super-admin/**`
- The layout never reads cookies to verify that the user has `admin` or `superadmin` role — it just renders children

**app/(main)/layout.tsx** *(MEDIUM)*
- ❌ Grid layout uses flexbox (`display: flex`), not CSS Grid with `gridTemplateAreas: "topbar topbar" "sidebar main"` as specified. Sidebar is positioned inside `<main>`. Works visually but doesn't match spec.

**app/(main)/dashboard/page.tsx** *(HIGH)*
- ❌ No tab bar (All / Active / Pending / Rejected / Sold / Expired) — all listings shown flat
- ❌ No Edit button — spec requires Edit to open SellModal pre-filled
- ❌ No auth redirect to `/login` — if `user` is null from `useAuth()`, displays loading state or empty, not redirect
- ❌ Uses `(window as any).openSellModal?.()` in "Post First Item" button — this hack won't work; should use `useSell().openSellModal()`

**app/(main)/profile/page.tsx** *(CRITICAL)*
- ❌ Missing phone and whatsapp edit form entirely — these are the primary contact mechanism and new `PATCH /api/users/profile` route cannot be used without this UI
- ❌ Missing "Account Phone" field with lock icon + "Used for OTP only. Never shared." text
- ❌ Missing "WhatsApp Number" field with green icon + "Buyers will contact you here." text
- ❌ Missing Save button calling `PATCH /api/users/profile`
- The existing page only shows email, join date, listing stats, and a Sign Out button — it is read-only

**components/layout/Sidebar.tsx** *(HIGH)*
- ❌ No ADMIN section for admin/superadmin users — all admin navigation is absent from the main sidebar
- ❌ No SUPERADMIN section — spec requires `/super-admin/config`, `/super-admin/activity`, `/super-admin/users` links
- ❌ Sidebar category hrefs use wrong slugs: `books-notes`, `sports-fitness`, `miscellaneous` but seeded categories have slugs `books`, `sports`, `other` — browse by category will return empty
- ❌ Active state for Browse items: only `href === "/"` triggers highlight — category links (`/?category=...`) are never highlighted

**components/layout/AdminSidebar.tsx** *(CRITICAL)*
- ❌ `const superadmin = true;` — hardcoded! Every user sees super-admin links regardless of actual role
- ❌ No import of `useAuth()` — cannot detect user role
- ❌ Links point to wrong paths: sidebar lists `/admin` (no route), `/admin/listings` (no page), `/admin/reports` (no page), `/admin/users` (no page), `/admin/categories` (no page), `/super-admin/activity` (no page), `/super-admin/config` → only existing page is `/moderation`
- ❌ No pending count badge on moderation queue link (spec requires badge)

**components/listing/ContactButton.tsx / ContactOverlay.tsx** *(CRITICAL — security)*
- ❌ `ContactOverlay.tsx` stores `waLink` in `useState` — **`waLink` is persisted in component state between renders**. The spec requires that `waLink` is NEVER stored in state
- ❌ `ContactOverlay` renders a loading state while `waLink` is null — **the overlay is shown before the link arrives**, meaning the seller's WhatsApp link has a window where it exists in state but the UI might be dismissed without calling `window.open()`
- ❌ ContactButton does NOT implement the 7 required states (locked / unverified / ready / loading / opening / no_number / rate_limited) — it has only 2 states: owner (disabled) and default (open overlay)
- ❌ No `requireVerified` check before fetching contact — unverified users can retrieve the WhatsApp link
- ✅ `window.open(waLink, '_blank')` is used correctly (does not render waLink in JSX)

**components/listing/SellModal.tsx** *(HIGH)*
- ❌ Uses `window.location.href = '/listings/${data.slug}'` after submit — should use `router.push()` to prevent full page reload
- ❌ SellModal step 1 is category selection grid (not title/category/condition/price/negotiable as spec requires) — step structure is different from spec
- ❌ No "Continue button disabled until all Step 1 fields filled" — user auto-advances to step 2 on category click with no validation
- ❌ No success toast on submit — closes modal and hard-navigates
- ❌ Does not support edit mode (pre-filled) — spec requires Edit in dashboard to open pre-filled SellModal

**app/(admin)/moderation/page.tsx** *(HIGH)*
- ❌ Path is `/moderation`, not `/admin` — admin sidebar links to `/admin` (matches nothing)
- ❌ No AI-Flagged filter tab — spec requires All / AI Flagged tabs
- ❌ ModerationCard is inlined, not in `components/admin/ModerationCard.tsx`
- ❌ Actions are "Remove Item" (calls DELETE `/api/listings`) and "Dismiss" — spec requires Approve/Reject with `RejectionReasonModal`
- ❌ No `RejectionReasonModal` component
- ❌ Calls `/api/admin/moderation` (report queue) — but spec intends this for the listing approval queue route (`/api/admin/listings`)

**ListingDetailDrawer.tsx** *(LOW)*
- ❌ No "⚑ Report this listing" link in drawer — spec requires it at the bottom
- ❌ No bottom-sheet mode on mobile < 640px (spec requirement)
- ❌ `<style jsx global>` requires `styled-jsx` package — not in standard Next.js App Router

---

## 3. Cross-cutting Checks

| Check | Result | Notes |
|---|---|---|
| `sellerPhone` / `sellerEmail` in `.tsx` components | ✅ **PASS** | grep returned 0 results — contact data is never rendered in client components |
| `waLink` only in `window.open()` call | ❌ **FAIL** | `waLink` is stored in `useState<string \| null>` in `ContactOverlay.tsx` line 11 — persisted in component state, violating the spec |
| `window.location` navigation | ❌ **FAIL** | Found in: `SellModal.tsx` (line 57) and `AuthProvider.tsx` (line 43) — these cause full page reloads instead of using `router.push()` |
| "List Item" auth guard exists | ✅ **PASS** | Both `Topbar.tsx` and `Sidebar.tsx` check `!user` and redirect to `/login?returnTo=/` |
| `localStorage` / `sessionStorage` | ✅ **PASS** | grep returned 0 results |

---

## 4. Priority Fix List

### CRITICAL
1. **`app/(admin)/layout.tsx` has no role guard** — Any user who guesses the URL can access admin pages. Add server-side cookie check: verify JWT, check `role === 'admin' || role === 'superadmin'`, redirect to `/` if not. This is a complete admin bypass.
2. **`ContactOverlay.tsx` stores `waLink` in state** — `useState<string | null>(null)` stores the WhatsApp link in React state. Replace the overlay pattern: fetch contact, immediately call `window.open(waLink)`, and never assign `waLink` to state. The link must be transient only.
3. **`app/(main)/profile/page.tsx` is read-only** — Users cannot set their phone or WhatsApp number. Since the contact flow depends entirely on `whatsappNumber`, this means NO buyer can ever contact a seller via the platform. Add the phone/whatsapp edit form with PATCH `/api/users/profile`.
4. **`AdminSidebar.tsx` hardcodes `superadmin = true`** — Every authenticated user sees super-admin nav links. Replace with `const { user } = useAuth()` and check `user?.role === 'superadmin'`.

### HIGH
1. **`app/(admin)/layout.tsx` admin sidebar links are all broken** — `/admin`, `/admin/listings`, `/admin/reports`, `/admin/users` do not exist as pages. The only admin page is `/moderation`. Either create the missing pages or update the sidebar links.
2. **`Sidebar.tsx` missing admin/superadmin nav section** — Admin and superadmin users see no navigation to any admin tools in the main sidebar. Add conditional role-based sections using `useAuth()`.
3. **`dashboard/page.tsx` missing auth redirect** — If user is not logged in, page shows loading state forever. Add: if `!user` after loading, redirect to `/login?returnTo=/dashboard`.
4. **`dashboard/page.tsx` missing tab bar and Edit action** — No tabs for filtering by status. No Edit button. `(window as any).openSellModal?.()` is a broken hack.
5. **`SellModal.tsx` uses `window.location.href`** — Replace with `router.push()` to prevent full page reload that clears React state.
6. **Sidebar category slugs don't match seeded data** — `books-notes` should be `books`, `sports-fitness` should be `sports`, `miscellaneous` should be `other`. Browse by category silently returns empty.
7. **`moderation/page.tsx` uses wrong API + wrong action pattern** — Currently fetches reports (not pending listings), and actions are Delete/Dismiss (not Approve/Reject). Should use `/api/admin/listings` and add `RejectionReasonModal`.

### MEDIUM
1. **`ListingDetailDrawer.tsx` missing "⚑ Report" link** — Users have no way to report a listing from the drawer UI.
2. **`ListingDetailDrawer.tsx` no mobile bottom-sheet** — On mobile, the drawer slides in from the right and overlaps content. Should switch to bottom-sheet on screens < 640px.
3. **`ContactButton.tsx` only 2 states instead of 7** — Missing: locked (not verified), loading (fetching), opening, no_number, rate_limited states. Users with no whatsapp number set get no feedback.
4. **`app/(main)/layout.tsx` layout uses flexbox not CSS Grid** — Minor structural deviation from spec but works visually. Topbar is inside the `<main>` flex area instead of spanning full width as a grid area.
5. **`styled-jsx` in Drawer** — `<style jsx>` and `<style jsx global>` are not supported in Next.js App Router without additional library setup — these styles silently do nothing.

### LOW
1. **`Sidebar.tsx` active state broken for category links** — Category links `/?category=books` are never highlighted as active since `usePathname()` only returns `/` (not the query string).
2. **`dashboard/page.tsx` no Edit button** — SellModal is not wired for edit-mode (pre-fill) anywhere.
3. **`PhotoUploadZone.tsx` doesn't validate total upload size (15MB)** — Server validates it, but client gives no feedback before the upload fails.
4. **Login page uses `new URLSearchParams(window.location.search)`** — Should use `useSearchParams()` hook for proper SSR/hydration compatibility. Works currently but is anti-pattern in App Router.
