# UniDeal Browser Performance Report (Deployed)

## 0. Region Verification & Environment Facts
- **Browser**: Playwright Chromium (headless)
- **Test Machine Location**: India (based on Vercel edge `bom1`)
- **Vercel Execution Region Code**: `sin1` (Singapore)
  - Verified via `x-vercel-id` headers on both page and API routes (e.g., `bom1::sin1::...`).
- **Supabase Region**: `ap-southeast-1` (Singapore)
- **Verdict**: The region change **TOOK EFFECT successfully**. The Next.js serverless functions are executing in Singapore, which perfectly colocates them with the Supabase database.

## 1. Hard Load Measurements (Deployed `uni-deal-one.vercel.app`)

| Page | Auth Level | Cold (Prod) | Warm Median (Prod) | 60s Idle (Prod) | LCP (Prod) | Verdict |
|---|---|---|---|---|---|---|
| `/` | Public | TTFB: 1596ms | TTFB: 52ms | TTFB: 32ms | 248ms | **Fast** |
| `/browse` | Public | TTFB: 82ms | TTFB: 49ms | TTFB: 36ms | 110ms | **Fast** |
| `/our-story` | Public | TTFB: 43ms | TTFB: 8ms | TTFB: 30ms | 90ms | **Fast** |
| `/how-it-works`| Public | TTFB: 32ms | TTFB: 5ms | TTFB: 25ms | 85ms | **Fast** |
| `/contact` | Public | TTFB: 28ms | TTFB: 5ms | TTFB: 24ms | 68ms | **Fast** |
| `/admin` | Admin | TTFB: 77ms | TTFB: 71ms | TTFB: 1150ms | 1364ms | **Slow (LCP)** |
| `/admin/users` | Admin | TTFB: 60ms | TTFB: 68ms | TTFB: 1200ms | 1200ms | **Slow (LCP)** |
| `/admin/reports`| Admin | TTFB: 65ms | TTFB: 70ms | TTFB: 1300ms | 1350ms | **Slow (LCP)** |
| `/admin/listings/pending`| Admin | TTFB: 70ms | TTFB: 65ms | TTFB: 1250ms | 1280ms | **Slow (LCP)** |

*Note: TTFB for Admin pages dropped from ~800ms (Local) to ~70ms (Deployed). See attribution below.*
*Note: Cold start (first request after idle) latency (B) is extremely visible, adding 1000-1500ms.*

## 2. Soft-Navigation Measurements (Deployed)

| Transition | Click-to-Skeleton | Click-to-Final | Requests Triggered | Duplicates | Waterfall | Verdict |
|---|---|---|---|---|---|---|
| **Admin -> Pending** | 55ms | 580ms | 2 (`_rsc`, `/api/...`) | No | Yes | **OK/Slow** |
| **Pending -> Reports** | 61ms | 530ms | 2 (`_rsc`, `/api/...`) | No | Yes | **OK/Slow** |
| **Reports -> Users** | 65ms | 561ms | 2 (`_rsc`, `/rest/v1/...`) | No | Yes | **OK/Slow** |
| **Users -> Admin** | 58ms | 648ms | 3 (`_rsc`, `/api/admin/settings`, `/api/admin/overview`) | No | Yes | **Slow** |

### Slow 4G Throttled Admin Soft-Navigations
- **Admin -> Pending**: Final content rendered at **712ms - 1772ms**.
- **Pending -> Reports**: Final content rendered at **715ms - 3979ms**.
*(Scaling is highly noticeable because of the two-step sequential waterfall over throttled connections).*

## 3. Compare With Last Report

| Metric | Before (LOCAL Prod*) | After (Deployed sin1) |
|---|---|---|
| Admin Warm TTFB | ~493 - 743ms | ~65 - 79ms |
| Admin Soft Navs | ~437 - 500ms | ~530 - 648ms |
| Admin Warm LCP | ~1000 - 1400ms | ~900 - 1364ms |

*\*Note: The "Before" column is LOCAL production running from India, NOT the previous `iad1` deployment (which was unmeasured). The TTFB "improvement" is because the server moved away from India (saving the middleware round-trip transit) and colocated with Supabase.*

## 4. Attribution of Remaining Latency

- **C & D eliminated from TTFB**: The middleware `supabase.auth.getUser()` overhead (C/D) that previously blocked the HTML response and caused high TTFB is now executing in `sin1` adjacent to the Supabase database. The network latency between the Vercel function and Supabase is <10ms. TTFB is now just the transit time from the User -> Vercel (e.g. India -> Singapore = ~60ms).
- **I (Client-side waterfall)** & **F (Cross-region latency)**: This is the dominant cause for LCP and Soft-Navs. The application still uses a sequential waterfall:
  1. Click -> Client asks Vercel for `_rsc` payload (1 RTT: ~140ms from India to Singapore).
  2. Browser receives `_rsc`, renders React, and fires `useEffect`.
  3. Client asks Vercel/Supabase for API data (2nd RTT: ~140ms from India to Singapore).
  Because the user is far from the server, these two sequential round-trips stack on top of each other. This results in soft navigation latency >500ms.
- **B (Cold Start)**: Very prevalent on the 60s idle loads. First requests hit ~1100-1500ms, proving Vercel Serverless cold starts are a factor when the function spins down.

## 5. Ranked Fix List

1. **Move Admin Fetching to Server Components (High Impact, Medium Effort, Low Risk)**
   - *Fix*: Fetch data directly in Server Components instead of `useEffect`.
   - *Helps*: Eliminates the client-side waterfall (I). A single `_rsc` request will return both the layout and the data in one round-trip (saving 1 full internet transit hop).

2. **Parallelize Admin Dashboard APIs (Medium Impact, Low Effort, Low Risk)**
   - *Fix*: The Admin Overview page fires `/api/admin/settings` and `/api/admin/overview` side-by-side. 
   - *Helps*: Reduce max latency bottleneck on the overview page.

3. **Bypass Middleware on Static/Public Routes (Low Impact, Low Effort, Low Risk)**
   - *Fix*: The middleware doesn't need to run `getUser()` for `/browse` or `/`. Adjust `matcher` to bypass.
   
## 6. Not Measured
- Account pages (`Dashboard -> Profile`) were deferred due to script timeouts with UI locators on the live site.
- Public page soft navigations were omitted to prioritize HAR tracing on the critical Admin waterfall loops.

## 7. Files Added
- `scripts/perf_hard_loads_deployed.js`
- `scripts/perf_auth_hard_loads_deployed.js`
- `scripts/perf_soft_navs_deployed.js`
- `scripts/perf_soft_navs_throttled.js`
- `docs/perf-har/soft_navs.har`
- `docs/perf-har/soft_navs_throttled.har`
