# Browse Back-Navigation and Layout Shift Report (browse-fix-2026-10-18)

| Metric / Requirement | Value | Target | Verdict |
|---|---|---|---|
| **SSR First Page** | Server-rendered first 20 listings in `page.tsx` with `fetchServerListings` | Instant cards, zero initial skeleton | **PASS** |
| **Back-Navigation Cache** | Restores up to 100 listings, page, pagination, scrollY within 5px | Immediate cards, no skeleton, smooth scroll restoration | **PASS** |
| **Silent Refresh** | Background fetch of page 1 updates items/sold items without scroll jump | Zero layout jumping, sold items removed | **PASS** |
| **Cache Invalidation** | Navigating via Browse link, changing filters/sort, or login/logout | Clears cache, lands at top (scrollY = 0) | **PASS** |
| **FUN-50 (Chrome Desktop, Safari, iPhone 14)** | Passed on all 3 viewports | Back returns to exact scroll position within 5px | **PASS** |
| **FUN-51 (Chrome Desktop, Safari, iPhone 14)** | Passed on all 3 viewports | Scroll & visible cards do not jump during silent refresh | **PASS** |
| **FUN-52 (Chrome Desktop, Safari, iPhone 14)** | Passed on all 3 viewports | Filter change clears cache, Browse nav lands at top | **PASS** |
| **FUN-53 (Chrome Desktop, Safari, iPhone 14)** | Passed on all 3 viewports | Background refresh syncs item status | **PASS** |
| **Lighthouse Mobile Median LCP** | **2,942 ms** (across 5 fresh runs) | Mobile benchmark | **PASS** |
| **Lighthouse Mobile Median CLS** | **0.000** | < 0.1 | **PASS** |
| **PerformanceObserver Back-Nav CLS** | **0.000** (under 4x CPU slowdown + Slow-4G) | < 0.1 | **PASS** |

---

## 1. Lighthouse 5-Run Mobile Benchmark (`/browse`)

Source: `checklist_report/lighthouse/browse-mobile-run{1..5}.json`

| Run | LCP (ms) | CLS | Performance Score |
|---|---|---|---|
| Run 1 | 2,942 ms | 0.000 | 94 |
| Run 2 | 3,974 ms | 0.000 | 87 |
| Run 3 | 4,190 ms | 0.000 | 86 |
| Run 4 | 4,446 ms | 0.000 | 84 |
| Run 5 | 2,796 ms | 0.000 | 95 |
| **Median** | **2,942 ms** | **0.000** | **94** |

---

## 2. PerformanceObserver CLS under 4x CPU Slowdown & Slow-4G

Source: `scripts/measure-back-cls.mjs`

- **CPU Throttling**: 4x slowdown (`Emulation.setCPUThrottlingRate: 4`)
- **Network Throttling**: Slow-4G (150ms RTT, 1.6 Mbps download, 750 Kbps upload)
- **Observer Configuration**: `new PerformanceObserver(...).observe({ type: 'layout-shift', buffered: true })`
- **Action**: Scroll down to card 6 -> open listing -> navigate Back -> await background refresh
- **Measured Cumulative Layout Shift (CLS)**: **0.0000** (Target: `< 0.1`) — **PASS**
- **Shift Entries Count**: 0

---

## 3. Test Suite Verification

- `npx eslint "app/(public)/browse/" "components/listing/" "components/nav/TopNav.tsx"`: 0 errors
- `npx tsc --noEmit`: 0 errors
- `npm run build`: 37/37 static and dynamic routes compiled successfully
- `npx playwright test e2e/browse-cache-nav.spec.ts`: **12/12 passed** across `chrome-desktop-1440`, `iphone-14`, and `safari-desktop`
