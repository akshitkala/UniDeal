# UniDeal Performance Measurement & Latency Analysis Report

> **Notice**: This is a read-only measurement report for UniDeal (Next.js 14 App Router + Supabase + Cloudinary + Resend). No application behavior, schema, RLS, or API logic has been modified.

---

## 1. Environment Facts

- **Node Version**: `v22.12.0`
- **Next.js Version**: `14.2.24`
- **Package Manager**: `npm` (v10.9.0)
- **Operating System**: Windows 11 Home (x64)
- **Supabase Project Region vs. Vercel Function Region**:
  - **Supabase URL**: `https://difmyugeebvbcaojcuwq.supabase.co` (Cloudflare Edge Node: `DEL` - Delhi, India; Origin Database Region: `iad1` / `us-east-1` in N. Virginia, USA).
  - **Vercel Function Region**: `iad1` (Washington D.C. / US East - default Vercel serverless region, confirmed by absence of custom `regions` in `vercel.json`).
  - **Region Match Verdict**: **MATCHED ON PRODUCTION VERCEL**. When deployed on Vercel (`iad1`), Vercel Serverless Functions and the Supabase Postgres Database reside in the same data center region (`us-east-1`), yielding sub-5ms inter-service database latency. However, during local development from India, every network request to Supabase incurs a cross-continent round-trip time (**RTT**) of **200ms – 500ms** per query.
- **Mode for Runs**:
  - **Mode A (Development)**: `npm run dev` with fresh `.next` deletion.
  - **Mode B (Production)**: `npm run build && npm start` (local production bundle execution).
- **Network Conditions**:
  - Direct ping / `curl -w` latency to Supabase REST URL (`https://difmyugeebvbcaojcuwq.supabase.co/rest/v1/`): **207ms min, 527ms max (avg ~300ms RTT)** over warm TCP/TLS connections from local ISP in India.

---

## 2. Route Inventory & Benchmark Summary

| Route | Type | Auth Level | Dev Cold (1st Hit) | Dev Warm Median | Prod Build Type | Prod 1st Hit | Prod Warm Min / Median / Max | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Page | Public | 20,936 ms | 344 ms | Dynamic (`ƒ`) | 786 ms | 189 / **331** / 1553 ms | **OK (300-800ms)** |
| `/browse` | Page | Public | 622 ms | 81 ms | Static (`○`) | 31 ms | 5 / **6** / 10 ms | **Fast (<300ms)** |
| `/listing/engineering-mathematics-textbook-eAJiY` | Page | Public | 3,483 ms | 238 ms | Dynamic (`ƒ`) | 276 ms | 186 / **203** / 1223 ms | **Fast (<300ms)** |
| `/our-story` | Page | Public | 373 ms | 66 ms | Static (`○`) | 10 ms | 5 / **7** / 7 ms | **Fast (<300ms)** |
| `/how-it-works` | Page | Public | 594 ms | 66 ms | Static (`○`) | 9 ms | 5 / **5** / 5 ms | **Fast (<300ms)** |
| `/contact` | Page | Public | 297 ms | 53 ms | Static (`○`) | 8 ms | 4 / **5** / 6 ms | **Fast (<300ms)** |
| `/verify-email` | Page | Guest | 516 ms | 68 ms | Static (`○`) | 7 ms | 4 / **6** / 7 ms | **Fast (<300ms)** |
| `/sell` | Page | User | 2,179 ms | 285 ms | Static (`○`) | 395 ms | 165 / **204** / 212 ms | **Fast (<300ms)** |
| `/dashboard` | Page | User | 605 ms | 284 ms | Static (`○`) | 228 ms | 192 / **249** / 344 ms | **Fast (<300ms)** |
| `/profile` | Page | User | 634 ms | 254 ms | Static (`○`) | 314 ms | 392 / **504** / 2166 ms | **OK (300-800ms)** |
| `/listing/.../edit` | Page | User | 825 ms | 255 ms | Dynamic (`ƒ`) | 284 ms | 301 / **330** / 534 ms | **OK (300-800ms)** |
| `/admin` | Page | Admin | 3,163 ms | 646 ms | Dynamic (`ƒ`) | 1,113 ms | 772 / **1003** / 1208 ms | **Slow (>800ms)** |
| `/admin/listings/pending` | Page | Admin | 894 ms | 604 ms | Dynamic (`ƒ`) | 989 ms | 599 / **1594** / 3340 ms | **Slow (>800ms)** |
| `/admin/reports` | Page | Admin | 851 ms | 616 ms | Dynamic (`ƒ`) | 890 ms | 1209 / **1559** / 1675 ms | **Slow (>800ms)** |
| `/admin/users` | Page | Admin | 903 ms | 677 ms | Dynamic (`ƒ`) | 1,504 ms | 660 / **736** / 1221 ms | **OK (300-800ms)** |
| `/api/listings` (no params) | API | Public | 2,283 ms | 196 ms | Dynamic (`ƒ`) | 190 ms | 157 / **513** / 2887 ms | **OK (300-800ms)** |
| `/api/listings?search=calculator` | API | Public | 286 ms | 358 ms | Dynamic (`ƒ`) | 200 ms | 202 / **494** / 793 ms | **OK (300-800ms)** |
| `/api/listings?category=books-notes` | API | Public | 282 ms | 347 ms | Dynamic (`ƒ`) | 283 ms | 213 / **313** / 549 ms | **OK (300-800ms)** |
| `/api/listings?sort=price_asc` | API | Public | 209 ms | 219 ms | Dynamic (`ƒ`) | 499 ms | 164 / **215** / 375 ms | **Fast (<300ms)** |
| `/api/admin/settings` | API | Admin | 2,906 ms | 761 ms | Dynamic (`ƒ`) | 1,937 ms | 808 / **1653** / 3599 ms | **Slow (>800ms)** |
| `/api/admin/overview` | API | Admin | 1,260 ms | 2,039 ms | Dynamic (`ƒ`) | 2,531 ms | 1106 / **3009** / 4996 ms | **Slow (>800ms)** |
| `/api/admin/listings/pending` | API | Admin | 2,561 ms | 1,159 ms | Dynamic (`ƒ`) | 1,762 ms | 856 / **1251** / 1478 ms | **Slow (>800ms)** |
| `/api/admin/reports` | API | Admin | 735 ms | 730 ms | Dynamic (`ƒ`) | 776 ms | 659 / **932** / 4201 ms | **Slow (>800ms)** |
| `/api/profile` | API | User | 649 ms | 585 ms | Dynamic (`ƒ`) | 525 ms | 532 / **672** / 962 ms | **OK (300-800ms)** |
| `/api/cron/keepalive` | API | Cron | 603 ms | 210 ms | Dynamic (`ƒ`) | 199 ms | 152 / **202** / 272 ms | **Fast (<300ms)** |

---

## 3. Detailed Attribution & Breakdown per Slow Route

### 1. `/admin` (Admin Overview Page)
- **Production Warm Median**: **1,003 ms** (First Hit: 1,113 ms)
- **Dominant Latency Causes**: **C** (Middleware overhead), **D** (Repeated auth/admin checks), **E** (Sequential Supabase calls), **I** (Client-side waterfall).
- **Execution Breakdown (`PERF_TRACE`)**:
  1. Middleware `auth.getUser()`: **175.60 ms** (Supabase Auth network call).
  2. Next.js Server Component render: checks `requireAdminSession()`:
     - `requireAdminSession: auth.getUser()`: **710.99 ms** (Second redundant Supabase Auth network call!).
     - `requireAdminSession: profiles is_admin check`: **167.10 ms** (Third Supabase DB network call).
  3. Total server TTFB: **1,053.69 ms**.
  4. Client-side waterfall: Page mounts client component `AdminOverviewPage`, which fires two simultaneous `fetch()` calls to `/api/admin/settings` (1,653 ms) and `/api/admin/overview` (3,009 ms).
- **Plain-Language Summary**: Navigating to `/admin` forces 3 sequential round-trips across the globe to Supabase before rendering the page shell, and then makes 2 more separate API network calls from the browser.

---

### 2. `/api/admin/overview` (Admin Overview Statistics API)
- **Production Warm Median**: **3,009 ms** (Min: 1,106 ms, Max: 4,996 ms)
- **Dominant Latency Causes**: **C** (Middleware overhead), **D** (Repeated auth checks), **F** (Cross-region latency), **G** (Slow/unbounded count queries).
- **Execution Breakdown (`PERF_TRACE`)**:
  1. Middleware `auth.getUser()`: **528.83 ms** (Network RTT for token verification).
  2. Route `requireAdminSession()`:
     - `auth.getUser()`: **268.99 ms** (Redundant auth check).
     - `profiles` admin check: **645.79 ms** (Database check).
  3. Handler execution: `Promise.all` across 3 queries (`listings count`, `reports count`, `profiles count`): **1,080.15 ms – 3,361.98 ms**.
- **SQL Analysis**:
  - `select count(*) from listings where status = 'pending'`
  - `select count(*) from reports where status = 'pending'`
  - `select count(*) from profiles`
  - Each `count(*)` exact count query requires PostgreSQL to scan table rows or index leaves to count exact totals. Across cross-region connections, latency multiplies.

---

### 3. `/api/admin/settings` (Admin Platform Settings API)
- **Production Warm Median**: **1,653 ms** (Min: 808 ms, Max: 3,599 ms)
- **Dominant Latency Causes**: **C** (Middleware overhead), **D** (Repeated auth checks), **E** (Sequential calls).
- **Execution Breakdown (`PERF_TRACE`)**:
  1. Middleware `auth.getUser()`: **487.06 ms**.
  2. Route `requireAdminSession: auth.getUser()`: **433.16 ms**.
  3. Route `requireAdminSession: profiles check`: **1,231.42 ms** (Peak DB RTT).
  4. Handler query: `select approval_mode from admin_settings where id = 1`: **323.54 ms**.
- **Plain-Language Summary**: Fetching a single row containing one text setting (`approval_mode`) takes 1.6 seconds because it performs 4 sequential network round-trips back and forth between the server and Supabase.

---

### 4. `/admin/listings/pending` & `/api/admin/listings/pending`
- **Production Warm Median**: **1,594 ms** (Page), **1,251 ms** (API)
- **Dominant Latency Causes**: **C** (Middleware overhead), **D** (Repeated auth checks), **E** (Sequential calls), **I** (Client waterfall).
- **Execution Breakdown (`PERF_TRACE`)**:
  1. Middleware `auth.getUser()`: **515.00 ms**.
  2. Route `requireAdminSession()`: **411.92 ms** combined.
  3. Handler query: `select * from listings where status = 'pending'`: **357.90 ms**.

---

### 5. `/admin/reports` & `/api/admin/reports`
- **Production Warm Median**: **1,559 ms** (Page), **932 ms** (API)
- **Dominant Latency Causes**: **C** (Middleware overhead), **D** (Repeated auth checks), **E** (Sequential calls).
- **Execution Breakdown (`PERF_TRACE`)**:
  - Sequential auth checks take ~600ms – 1,000ms before main query execution.

---

### 6. `/` (Home Page)
- **Dev First Hit**: **20,936 ms** (Compile time: 20,000 ms across 1,545 modules)
- **Production Warm Median**: **331 ms**
- **Dominant Latency Causes**: **A** (Dev compile overhead - dev only), **I** (Dynamic server component fetching).
- **Step 5 Investigation Note**:
  - `RecentListingsSection.tsx` imports `useMotion()` from `@/lib/motion-variants`. Both `lib/motion-variants.ts` and `RecentListingsSection.tsx` already contain the `'use client'` directive at line 1.
  - `HomePage` in `app/(public)/page.tsx` renders `<RecentListingsFetcher />` inside a `<Suspense>` boundary. The component fetches recent listings via `createClient()` from `@/lib/supabase/server`.
  - In Dev mode, initial compilation of Framer Motion + Lucide icons + Supabase SSR took 20 seconds on first hit, but warm hits in Production execute in **331 ms**.

---

## 4. Cross-Cutting Latency Patterns

1. **Middleware Session Refresh Overhead (Category C)**
   - `middleware.ts` runs `await supabase.auth.getUser()` on every request matching the matcher pattern.
   - For public guest requests (without session cookies), it returns in **~0.1 ms**.
   - For authenticated requests (user or admin cookies present), it makes a network API call to Supabase Auth, adding **150 ms – 500 ms** to every single request.

2. **Duplicate `auth.getUser()` Verification (Category D)**
   - Every protected API route and page helper (e.g., `requireAdminSession()`) calls `await supabase.auth.getUser()` again.
   - This means a single user click causes **two separate Supabase Auth network calls** (one in Middleware, one in Route handler).

3. **Sequential Admin Guard Checks (Category E)**
   - `requireAdminSession()` performs two sequential steps:
     1. `supabase.auth.getUser()` (network call #1)
     2. `adminClient.from('profiles').select('is_admin, is_banned').eq('id', user.id)` (network call #2)
   - Then the route handler executes its own query (network call #3).
   - Because these 3 calls run sequentially, latency is strictly additive: `200ms + 200ms + 200ms = 600ms` minimum network floor.

4. **Cross-Continent Development RTT (Category F)**
   - The Supabase database resides in US-East (`iad1` / `us-east-1`). Local dev commands run from India, incurring ~200ms RTT per database round-trip.
   - On Vercel production deployment (`iad1`), serverless functions and Supabase are co-located in the same region, reducing database RTT from 200ms to <5ms.

5. **Client-Side Waterfalls in Admin UI (Category I)**
   - Admin pages (`/admin`, `/admin/users`, `/admin/listings/pending`) render client components (`'use client'`).
   - The initial HTML response only contains loading skeletons (`AdminOverviewLoading`, `AdminUsersLoading`).
   - After the browser receives and hydrates the HTML, a second network request is triggered via `useEffect` / `fetch()` to fetch data from `/api/admin/*`.

---

## 5. Ranked Fix List (Recommendations Only — Not Implemented)

> **Important**: Per task instructions, no fixes have been applied. The following recommendations are ordered by impact-per-effort.

| Rank | Recommended Fix | Target Routes | Est. Savings (ms) | Effort | Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Pass Authenticated User from Middleware to Route via Request Headers**<br>Set `x-user-id` or `x-user-role` header in Middleware after `getUser()`, allowing `requireAdminSession()` to reuse the verified session instead of making a duplicate `getUser()` call. | All Admin & User Routes (`/admin/*`, `/api/admin/*`, `/api/profile`, `/sell`, `/dashboard`) | **300 ms – 600 ms** per request | **S** (Small) | **Low** |
| **2** | **Combine Admin Profile & Setting Lookups into a Single Query or DB Function**<br>Replace sequential `is_admin` lookup + handler query with a single RPC function or combined query. | `/api/admin/settings`, `/api/admin/overview`, `/api/admin/listings/pending`, `/api/admin/reports` | **200 ms – 400 ms** per route | **S** (Small) | **Low** |
| **3** | **Migrate Admin Pages from Client-Side Fetching to Server Components**<br>Fetch admin overview stats and settings directly in Server Components on the server before returning HTML, eliminating client-side loading waterfalls. | `/admin`, `/admin/listings/pending`, `/admin/reports` | **500 ms – 1,500 ms** user-perceived load time | **M** (Medium) | **Low** |
| **4** | **Optimize Admin Snapshot Count Query (`/api/admin/overview`)**<br>Replace `count('exact')` scans across 3 tables with estimated counts or single aggregated query. | `/api/admin/overview` | **500 ms – 2,000 ms** | **S** (Small) | **Low** |
| **5** | **Cache Static Category & Policy Lookups Server-Side**<br>Cache `/api/categories` and static admin settings in-memory or via Next.js `revalidate` cache. | `/sell`, `/browse`, `/api/listings` | **100 ms – 200 ms** | **S** (Small) | **Low** |

---

## 6. Routes Not Measured & Rationale

Per **Hard Rule 2**, mutating endpoints (POST, PATCH, DELETE) were **NOT** called to prevent state mutation, sending real emails via Resend, or modifying production database records.

- **`/api/listings/[id]/contact` (POST)**: Mutating endpoint. Creates a `contact_reveals` row and generates a WhatsApp contact link.
- **`/api/listings/[id]/sold` (PATCH)**: Mutating endpoint. Updates listing status to `sold`.
- **`/api/listings/[id]/report` (POST)**: Mutating endpoint. Creates a report record in `reports` table.
- **`/api/listings/[id]` (DELETE / PATCH)**: Mutating endpoint. Deletes or modifies listing records.
- **`/api/contact` (POST)**: Mutating endpoint. Triggers a real transactional email delivery via Resend API (`RESEND_API_KEY`).
- **`/api/admin/listings/[id]/approve` (POST)**: Mutating admin endpoint. Changes listing status to `approved`.
- **`/api/admin/listings/[id]/reject` (POST)**: Mutating admin endpoint. Changes listing status to `rejected`.
- **`/api/admin/listings/bulk-reject` (POST)**: Mutating admin endpoint. Bulk modifies listing statuses.
- **`/api/admin/reports/[id]/resolve` (POST)**: Mutating admin endpoint. Updates report status to resolved.
- **`/api/admin/users/[id]/ban` (POST)**: Mutating admin endpoint. Sets `is_banned = true` on user profile.
- **`/api/admin/users/[id]/unban` (POST)**: Mutating admin endpoint. Sets `is_banned = false` on user profile.
- **`/api/admin/users/[id]/promote` (POST)**: Mutating admin endpoint. Sets `is_admin = true` on user profile.
- **`/app/auth/callback/route.ts` (GET)**: Auth PKCE code exchange handler. Requires a valid one-time Supabase auth code parameter.

---

## 7. Temporary Instrumentation Log

The following files received temporary performance timing wrappers under `if (process.env.PERF_TRACE === '1')`. No credentials, tokens, or personal data were logged.

1. `middleware.ts`: Added `PERF_TRACE` duration logging for `supabase.auth.getUser()` and populated response header `x-perf-middleware-ms`.
2. `lib/auth-admin.ts`: Added `PERF_TRACE` duration logging for `requireAdminSession()` auth and profile checks.
3. `app/api/admin/settings/route.ts`: Added `PERF_TRACE` handler timing and populated response header `x-perf-handler-ms`.
4. `app/api/admin/overview/route.ts`: Added `PERF_TRACE` handler timing and populated response header `x-perf-handler-ms`.
5. `app/api/listings/route.ts`: Added `PERF_TRACE` query timing and populated response header `x-perf-handler-ms`.
6. `.env.local`: Added test account environment variables (`PERF_USER_EMAIL`, `PERF_USER_PASSWORD`, `PERF_ADMIN_EMAIL`, `PERF_ADMIN_PASSWORD`) for automated benchmark script execution.

---
*Report generated on 2026-10-02.*
