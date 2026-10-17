# 5. Mobile Browse Performance & Lighthouse Audit

## Metrics from Lighthouse JSON (`checklist_report/lighthouse/browse-mobile.json`)

| Metric | Measured Value | Lighthouse Score | Status |
|---|---|---|---|
| **Performance Score** | **71 / 100** | 0.71 | Needs Optimization |
| **Largest Contentful Paint (LCP)** | **2.9 s** | 0.77 | Moderate |
| **Cumulative Layout Shift (CLS)** | **0.814** | 0.04 | 🚨 Critical Failure |
| **Total Blocking Time (TBT)** | **0 ms** | 1.00 | Excellent |
| **Max Potential FID (INP synthetic proxy)** | **16 ms** | 1.00 | Excellent |
| **First Contentful Paint (FCP)** | **1.4 s** | 0.93 | Good |
| **Speed Index** | **1.4 s** | 0.99 | Good |

---

## Exact LCP Element
- **DOM Selector**: `main#main-content > div.container > div.mb-6 > h1.text-2xl`
- **HTML Snippet**: `<h1 class="text-2xl sm:text-3xl font-bold text-neutral-text font-heading">Campus Marketplace</h1>`
- **LCP Sub-parts Breakdown**:
  - **Time to First Byte (TTFB)**: 455 ms (16%)
  - **Load Delay**: 0 ms (0%)
  - **Load Duration**: 0 ms (0% — inline text heading)
  - **Render Delay**: 2414 ms (84% — blocking hydration & font rendering)

---

## Why Performance is 71: Top 3 Causes with Concrete Evidence

### Cause 1: Severe Cumulative Layout Shift (CLS 0.814)
- **Score Impact**: Lighthouse scores CLS at **0.04 out of 1.00**, heavily weighing down the overall performance score.
- **Evidence**:
  - The page footer (`footer.border-t.bg-white`) starts at vertical offset `y = 900px` when the initial skeleton renders.
  - As client-side listings populate asynchronously from `/api/listings`, the grid expands dynamically, shifting the footer down to `y = 3541px` (a 2,641px layout shift).
  - Score for this single cluster is **0.783** of the total 0.814 CLS.

### Cause 2: Client Hydration & Render Delay (2.41s)
- **Score Impact**: LCP takes 2.9s despite TTFB being only 455ms.
- **Evidence**:
  - Render delay accounts for **84%** of the entire LCP duration.
  - The browser halts rendering while parsing Google Fonts (Outfit / Work Sans) and evaluating large client bundles (`_buildManifest.js` and client component chunks).

### Cause 3: Non-Responsive Image Sizing on Mobile Grid
- **Score Impact**: Mobile bandwidth and memory waste.
- **Evidence**:
  - Lighthouse audit `uses-responsive-images` reports **155.2 KiB** of potential savings.
  - Unsplash listing images are delivered at desktop dimensions (e.g. 1000px wide) inside cards rendered at 170px width on mobile viewports.
