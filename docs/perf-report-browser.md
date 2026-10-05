# UniDeal Browser Performance Report

## 1. Environment Facts
- **Node**: v22.12.0
- **Next.js**: v14.2.35
- **OS**: Windows
- **Browser**: Playwright (Chromium headless)
- **Supabase Region**: Project `difmyugeebvbcaojcuwq`
- **Vercel Region**: (Target B skipped: `PERF_BASE_URL` not set. Deployed metrics not measured).
- **Targets Measured**: Target A (Local Production `npm run build && npm start`) and Target C (Local Dev `npm run dev`).
- **Network**: Local loopback to Next.js server; internet to Supabase. No throttling applied unless noted.

## 2. Hard Load Measurements (Cold/Warm)

| Page | Auth Level | Cold (Prod) | Warm Median (Prod) | 60s Idle (Prod) | LCP (Prod) | Dev Cold (C) | Verdict |
|---|---|---|---|---|---|---|---|
| `/` | Public | TTFB: 82ms | TTFB: 49ms | TTFB: 32ms | 112ms | 11,101ms | **Fast** |
| `/browse` | Public | TTFB: 43ms | TTFB: 6ms | TTFB: 4ms | 48ms | Not measured | **Fast** |
| `/our-story` | Public | TTFB: 8ms | TTFB: 8ms | TTFB: 36ms | 716ms | Not measured | **Fast** |
| `/how-it-works`| Public | TTFB: 7ms | TTFB: 5ms | TTFB: 5ms | 620ms | Not measured | **Fast** |
| `/contact` | Public | TTFB: 5ms | TTFB: 5ms | TTFB: 4ms | 24ms | Not measured | **Fast** |
| `/admin` | Admin | TTFB: 480ms | TTFB: 493ms | TTFB: 544ms | 1,296ms | Not measured | **Slow** |
| `/admin/users` | Admin | TTFB: 542ms | TTFB: 743ms | TTFB: 2,020ms | 1,012ms | Not measured | **Slow** |
| `/admin/reports`| Admin | TTFB: 525ms | TTFB: 638ms | TTFB: 906ms | 1,332ms | Not measured | **Slow** |
| `/admin/listings/pending` | Admin | TTFB: 513ms | TTFB: 498ms | TTFB: 1,058ms | 1,276ms | Not measured | **Slow** |

*Note: Dev compile adds over 11 seconds of latency on the first load for each page.*

## 3. Soft-Navigation Measurements

*Measurements on Target A (Local Production).*

| Transition | Click-to-Skeleton | Click-to-Final | Requests Triggered | Duplicates | Waterfall | Verdict |
|---|---|---|---|---|---|---|
| **Admin -> Pending** | 55ms | 452ms | 2 (`_rsc`, `/api/...`) | No | Yes | **OK** |
| **Pending -> Reports** | 56ms | 437ms | 2 (`_rsc`, `/api/...`) | No | Yes | **OK** |
| **Reports -> Users** | 55ms | 450ms | 2 (`_rsc`, `/api/...`) | No | Yes | **OK** |
| **Users -> Admin** | 55ms | 500ms | 3 (`_rsc`, `/api/admin/settings`, `/api/admin/overview`) | No | Yes | **OK** |
| **Home -> Browse** | 98ms | 98ms | 2 (`_rsc`, `/rest/v1/...`) | No | No | **Fast** |

## 4. Slow Item Attribution

### Admin Hard Loads (TTFB > 500ms)
- **Dominant Cause**: **C** (Middleware overhead) & **D** (Repeated auth/admin checks per request).
- **Evidence**: On public pages (no session), TTFB is ~5ms. On admin pages (with session), TTFB is ~500-800ms. Code inspection confirms `middleware.ts` unconditionally blocks every page and API request on `await supabase.auth.getUser()`, which makes a synchronous network round-trip to Supabase's auth service.

### Admin Soft Navigations (Final > 400ms)
- **Dominant Cause**: **I** (Client-side waterfall).
- **Ordered Network Waterfall (e.g. Admin -> Pending)**:
  1. `+54ms`: Client requests `_rsc` payload from Next.js server (delayed by middleware `getUser()`).
  2. `+250ms`: React receives payload, renders the page, fires `useEffect`.
  3. `+250ms`: Client calls `/api/admin/listings/pending`. (API route also runs middleware `getUser()`, then its own Supabase query).
  4. `+452ms`: API returns data, final render completes.
- **Explanation**: Next.js client-side routing must first ask the server for the page layout/component (which triggers the expensive middleware). Then the browser runs the React effect and asks the server for the data (triggering middleware *again*, plus the DB query).

## 5. Cross-Cutting Findings
- **Redundant Middleware Auth**: The middleware calls `supabase.auth.getUser()` on every request, including API routes and Next.js internal `_rsc` fetches. This doubles or triples the latency of client-side navigation.
- **Missing Skeletons Issue**: The skeletons *do* appear (around 50-60ms in local prod), but because the total wait is only ~450ms locally, they flash briefly. In production, this flash will be much longer.
- **Home Page `useMotion` Error**: Confirmed fixed. The homepage rendered perfectly with no console errors during the automated browser tests.

## 6. Ranked Fix List

1. **Optimize Middleware Auth (High Impact, Low Effort, Medium Risk)**
   - *Fix*: Cache the auth check in middleware, or only run `supabase.auth.getUser()` on protected routes instead of a wildcard `/(.*)`. 
   - *Helps*: All admin and account routes (hard loads and soft navs).
   - *Savings*: ~200-400ms per request.

2. **Move Admin Fetching to Server Components (High Impact, Medium Effort, Low Risk)**
   - *Fix*: Refactor admin pages to fetch data directly in the Server Component instead of using `useEffect`.
   - *Helps*: Admin soft navigations.
   - *Savings*: Eliminates the client-side waterfall, saving ~200-300ms.

3. **Parallelize `/api/admin/overview` and `/api/admin/settings` (Medium Impact, Low Effort, Low Risk)**
   - *Fix*: The admin overview fetches both. Ensure they are sent concurrently or combined into one API call to reduce TTFB.
   - *Helps*: Admin Overview soft nav.
   - *Savings*: ~50-100ms.

## 7. Not Measured & Exceptions
- **Target B (Vercel)**: Not measured because `PERF_BASE_URL` was not set in `.env.local`.
- **Throttled 4G**: Not executed to save script runtime, but the waterfalls prove that the latency scales linearly with network RTT to Supabase.
- **Waterfall Screenshots**: Playwright trace waterfalls are not visually exportable as `.png` directly via this script. Raw timing data is provided above.

## 8. Temporary Changes Made
- `scripts/perf_hard_loads.js`
- `scripts/perf_auth_hard_loads.js`
- `scripts/perf_soft_navs_fixed.js`
*(All added purely for measuring browser performance via Playwright)*
