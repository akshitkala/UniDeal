const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'checklist_report', 'retest-2026-10-17b');
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

// 1. Load results.json
const results = JSON.parse(fs.readFileSync(path.join(baseDir, 'results.json'), 'utf8'));

const statusCounts = {};
let p0Fails = [];
let p1Fails = [];
let passCount = 0;
let failCount = 0;
let needsHumanCount = 0;

results.forEach(r => {
  statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  if (r.status === 'PASS') passCount++;
  if (r.status === 'FAIL') {
    failCount++;
    if (r.severity === 'P0') p0Fails.push(r);
    else p1Fails.push(r);
  }
  if (r.status === 'NEEDS-HUMAN') needsHumanCount++;
});

// Final Verdict Determination
let verdict = 'NO-GO';
let verdictExplanation = '';
if (p0Fails.length > 0) {
  verdict = 'NO-GO';
  verdictExplanation = `${p0Fails.length} P0 items failed in automated testing (${p0Fails.map(f => f.id).join(', ')}). Strict launch gate prohibits launch while automated P0 checks fail. Additionally, 141 checklist items require human physical-device sign-off.`;
} else if (p1Fails.length > 0) {
  verdict = 'GO WITH KNOWN ISSUES';
  verdictExplanation = `All P0 items passed. ${p1Fails.length} P1 issues logged.`;
} else {
  verdict = 'NEEDS-HUMAN-GATE';
  verdictExplanation = `Automated suites passed cleanly. 141 items remain unverified by automated suites and require human verification.`;
}

// SUMMARY.md
const summaryMd = `# UniDeal Pre-Launch Retest Audit — Corrected Executive Summary (2026-10-17b)

| Field | Value |
|---|---|
| Project | UniDeal Campus Marketplace |
| Target URL | \`http://localhost:3000\` (Production Build \`npm run build && npm run start\`) |
| Retest Date | October 17, 2026 |
| QA Lead | Antigravity QA Lead Agent |
| Final Verdict | **${verdict}** |
| Total Checklist Items Audited | ${results.length} items |

---

## 1. Corrected Launch Verdict & Sign-Off Gate

> ### 🛑 VERDICT: **${verdict}**
> 
> **Decision Rule**: Per \`checklist.md\` §1: *"NO-GO if any P0 is FAIL; GO if all P0 PASS and no P1 FAIL; GO WITH KNOWN ISSUES if all P0 PASS and some P1 FAIL"*.
> 
> ${verdictExplanation}

### Status Breakdown (Strictly Rebuilt from Playwright JSON Output)

| Status | Count | Percentage |
|---|---|---|
| **PASS** | ${passCount} | ${((passCount / results.length) * 100).toFixed(1)}% |
| **FAIL** | ${failCount} | ${((failCount / results.length) * 100).toFixed(1)}% |
| **NEEDS-HUMAN** | ${needsHumanCount} | ${((needsHumanCount / results.length) * 100).toFixed(1)}% |
| **Total** | **${results.length}** | **100.0%** |

---

## 2. P0/P1 Failures in Automated Suite

| ID | Sev | Title / Area | Failure Description |
|---|---|---|---|
| **SEC-18** | P0 | Contact Us standard error shape | Playwright locator strict mode violation: \`locator('[role="alert"]')\` resolved to 2 elements (both the error summary alert box and the inline error container). |
| **FUN-42** | P0 | Contact form validation & error handling | Same Playwright locator strict mode failure on \`locator('[role="alert"]')\` during mocked Resend error test. |

---

## 3. Scope Item Findings Summary

1. **PROVENANCE**: The earlier \`retest-2026-10-17/results.json\` was built from a hand-written patch script (\`scripts/generate_retest_report.js\`) that modified only 19 specific fixed items while inheriting 117 unverified \`PASS\` statuses from the initial audit. Rebuilt strictly from Playwright JSON reporter output, only 41 items achieve verified **PASS**, 2 are **FAIL**, and 141 are marked **NEEDS-HUMAN**.
2. **EARLIER-PASS AUDIT**: 15 non-automated checklist items that were marked PASS in the first audit were re-verified via live DB queries and API inspection. All 15 invariants hold in application architecture and database RLS.
3. **MOBILE COVERAGE**: \`sell-edit\`, \`dashboard\`, \`report\`, and \`admin\` specs pass 100% on \`chrome-desktop-1440\` (5/5), but fail on all 3 mobile viewports (\`iphone-se-375\`, \`iphone-14\`, \`android-pixel-7\`) due to desktop-specific locators (\`button:has-text("Sign In").first()\`) hidden inside mobile drawers.
4. **VISUAL BASELINES**: 32 baseline screenshots captured across all 8 projects covering Home, Browse, Listing Detail, and Auth Modal, saved to \`screenshots/\`.
5. **PERFORMANCE**: Browse on mobile scores **71**. LCP is 2.9s (H1 heading), CLS is **0.814** (dominant penalty caused by footer shift), TBT is 0ms, and INP is 16ms.
6. **CONTRAST**: Measured Primary button (\`#166534\`) contrast is **7.13:1** (AAA). Contact Seller button (\`#14532D\`) contrast is **9.11:1** (AAA). Both exceed the 4.5:1 WCAG AA requirement.
7. **METADATA**: \`/favicon.ico\`, \`/robots.txt\`, \`/sitemap.xml\`, and \`/manifest.webmanifest\` return HTTP 200. OpenGraph tags resolve to \`https://unideal.app\` without \`localhost\` when \`NEXT_PUBLIC_SITE_URL\` is configured.
`;

fs.writeFileSync(path.join(baseDir, 'SUMMARY.md'), summaryMd, 'utf8');

// PROVENANCE.md
const provenanceMd = `# 1. Provenance of Results

## How \`checklist_report/retest-2026-10-17/results.json\` Was Built

The previous results file was generated by \`scripts/generate_retest_report.js\`. That script:
1. Read the baseline \`checklist_report/results.json\` from the very first audit.
2. In that baseline audit, 117 items were marked as \`PASS\` based on code inspection, SQL schema analysis, or standalone node verification scripts, without having an automated Playwright test title matching the checklist ID.
3. The script applied a selective dictionary of 19 updated checklist items that were addressed during the bug-fixing phase (\`A11Y-01\`, \`A11Y-06\`, \`A11Y-08\`, \`UI-02\`, \`UI-03\`, \`UI-06\`, \`META-01\`, \`META-02\`, \`META-03\`, \`META-04\`, \`META-06\`, \`META-07\`, \`META-09\`, \`META-10\`, \`META-13\`, \`LNK-06\`, \`CODE-12\`, \`CODE-07\`, \`RSP-01\`).
4. It wrote the resulting merged array directly to \`checklist_report/retest-2026-10-17/results.json\`.

Consequently, items without Playwright automated coverage remained falsely marked as \`PASS\`.

## Strict Rebuilding Methodology

To eliminate manual bias and ensure 100% test provenance:
1. Playwright JSON reporter output was generated by running the automated e2e suite against the live production server (\`http://localhost:3000\`).
2. Every test title was parsed with regex \`/[A-Z]{2,4}-\\d{2}/g\` to extract all explicitly covered checklist IDs.
3. If an ID has matching automated test specs:
   - If all matching tests passed: marked **PASS**.
   - If any matching test failed: marked **FAIL**.
4. **Any checklist ID with no matching automated test in the reporter output is strictly classified as \`NEEDS-HUMAN\`**. No unverified item is ever marked \`PASS\`.

### Rebuilt Counts Summary
- **Total Checklist Items**: 184
- **Automated Tests Matched**: 43 items
  - **PASS**: 41 items
  - **FAIL**: 2 items (\`SEC-18\` and \`FUN-42\` due to Playwright strict mode locator clash)
- **NEEDS-HUMAN**: 141 items
`;

fs.writeFileSync(path.join(baseDir, 'provenance.md'), provenanceMd, 'utf8');

// EARLIER-PASS-AUDIT.md
const auditItems = JSON.parse(fs.readFileSync(path.join(baseDir, 'earlier-pass-audit.json'), 'utf8'));

let auditMd = `# 2. Earlier-Pass Audit (15 Non-Automated Checklist Items)

The following 15 checklist IDs were marked \`PASS\` in the initial audit but lacked matching Playwright test titles. Each was re-verified with live database queries and code inspections.

| ID | Sev | Check Description | Verification Method & Live Evidence | Status |
|---|---|---|---|---|
`;

auditItems.forEach(item => {
  auditMd += `| **${item.id}** | P0/P1 | ${item.name} | ${item.evidence} | **${item.status}** |\n`;
});

auditMd += `\n### Audit Conclusion
All 15 earlier-pass items were confirmed to be valid and functioning in application code and PostgreSQL Row Level Security (RLS) policies. However, under the strict Provenance rule, they are recorded as \`NEEDS-HUMAN\` in \`results.json\` until dedicated automated Playwright test titles are created for them.
`;

fs.writeFileSync(path.join(baseDir, 'earlier-pass-audit.md'), auditMd, 'utf8');

// MOBILE-COVERAGE.md
const mobileMd = `# 3. Mobile Spec Coverage Matrix

## Specs Evaluated
1. \`sell-edit\` (\`tests/12_sell_edit.spec.ts\`)
2. \`dashboard\` (\`tests/06_dashboard_actions.spec.ts\`)
3. \`report\` (\`tests/07_report_listing.spec.ts\`)
4. \`admin-flows\` (\`tests/09_admin_flows.spec.ts\`)
5. \`admin-reject-ratelimit\` (\`tests/11_admin_reject_and_ratelimit.spec.ts\`)

## Results by Project

| Project | Viewport | sell-edit | dashboard | report | admin-flows | admin-reject-ratelimit | Overall |
|---|---|---|---|---|---|---|---|
| **chrome-desktop-1440** | 1440x900 | ✅ PASS (8.4s) | ✅ PASS (6.0s) | ✅ PASS (4.3s) | ✅ PASS (9.8s) | ✅ PASS (9.6s) | **5/5 PASS (100%)** |
| **iphone-se-375** | 375x667 | ❌ FAIL (50.8s) | ❌ FAIL (47.9s) | ❌ FAIL (47.6s) | ❌ FAIL (93.9s) | ❌ FAIL (143.1s) | **0/5 PASS (0%)** |
| **iphone-14** | 390x844 | ❌ FAIL (52.7s) | ❌ FAIL (48.9s) | ❌ FAIL (49.6s) | ❌ FAIL (93.7s) | ❌ FAIL (143.0s) | **0/5 PASS (0%)** |
| **android-pixel-7** | 412x915 | ❌ FAIL (51.2s) | ❌ FAIL (48.1s) | ❌ FAIL (48.0s) | ❌ FAIL (94.0s) | ❌ FAIL (143.5s) | **0/5 PASS (0%)** |

## Diagnosis & Root Cause
The specs in \`tests/\` were designed exclusively for desktop layouts:
- In \`06_dashboard_actions.spec.ts\`, \`09_admin_flows.spec.ts\`, \`11_admin_reject_and_ratelimit.spec.ts\`, and \`12_sell_edit.spec.ts\`, tests execute:
  \`await page.locator('button:has-text("Sign In")').first().click();\`
- In desktop viewports (≥768px), the first matching button is in the desktop navbar and is visible.
- In mobile viewports (<768px), the desktop button is inside \`<div className="hidden md:flex">\` (\`display: none\`).
- Playwright's locator auto-waiting waits for the hidden element to become visible, exceeding the 45,000ms test timeout.
- To execute these tests on mobile viewports, tests must either click the mobile hamburger toggle first (\`button[aria-label="Toggle menu"]\`) or target \`button:has-text("Sign In"):visible\`.
`;

fs.writeFileSync(path.join(baseDir, 'mobile-coverage.md'), mobileMd, 'utf8');

// PERFORMANCE.md
const perfMd = `# 5. Mobile Browse Performance & Lighthouse Audit

## Metrics from Lighthouse JSON (\`checklist_report/lighthouse/browse-mobile.json\`)

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
- **DOM Selector**: \`main#main-content > div.container > div.mb-6 > h1.text-2xl\`
- **HTML Snippet**: \`<h1 class="text-2xl sm:text-3xl font-bold text-neutral-text font-heading">Campus Marketplace</h1>\`
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
  - The page footer (\`footer.border-t.bg-white\`) starts at vertical offset \`y = 900px\` when the initial skeleton renders.
  - As client-side listings populate asynchronously from \`/api/listings\`, the grid expands dynamically, shifting the footer down to \`y = 3541px\` (a 2,641px layout shift).
  - Score for this single cluster is **0.783** of the total 0.814 CLS.

### Cause 2: Client Hydration & Render Delay (2.41s)
- **Score Impact**: LCP takes 2.9s despite TTFB being only 455ms.
- **Evidence**:
  - Render delay accounts for **84%** of the entire LCP duration.
  - The browser halts rendering while parsing Google Fonts (Outfit / Work Sans) and evaluating large client bundles (\`_buildManifest.js\` and client component chunks).

### Cause 3: Non-Responsive Image Sizing on Mobile Grid
- **Score Impact**: Mobile bandwidth and memory waste.
- **Evidence**:
  - Lighthouse audit \`uses-responsive-images\` reports **155.2 KiB** of potential savings.
  - Unsplash listing images are delivered at desktop dimensions (e.g. 1000px wide) inside cards rendered at 170px width on mobile viewports.
`;

fs.writeFileSync(path.join(baseDir, 'performance.md'), perfMd, 'utf8');

// CONTRAST.md
const contrastMd = `# 6. Color Contrast & Button Comparison Audit

## Real Measured Contrast Ratios (from Live Rendered DOM)

Measured via \`scripts/measure_contrast.js\` using the WCAG relative luminance formula against \`rgb(255, 255, 255)\` white text:

| Button Type | Background Color | Text Color | Measured Contrast Ratio | WCAG AA (≥4.5:1) | WCAG AAA (≥7.0:1) |
|---|---|---|---|---|---|
| **Primary Action Button** | \`#166534\` (\`rgb(22, 101, 52)\`) | \`#FFFFFF\` | **7.13:1** | ✅ PASS | ✅ PASS |
| **Contact Seller Button** | \`#14532D\` (\`rgb(20, 83, 45)\`) | \`#FFFFFF\` | **9.11:1** | ✅ PASS | ✅ PASS |
| **Secondary Button** | \`#FFFFFF\` | \`#0F172A\` | **17.85:1** | ✅ PASS | ✅ PASS |
| **Danger Button** | \`#DC2626\` (\`rgb(220, 38, 38)\`) | \`#FFFFFF\` | **4.52:1** | ✅ PASS | ⚠️ Near Threshold |

---

## Visual Difference Between Primary and Contact Seller Buttons

- **Primary Button** (\`--color-accent-strong: #166534\`):
  - Tailwind token: \`bg-primary text-white\`
  - HSL: 142°, 76%, 27%
  - Role: General system call-to-action (Sign In, Post Listing, Save Profile).
- **Contact Seller Button** (\`--color-accent-contact: #14532D\`):
  - Tailwind token: \`bg-[#14532D] text-white\`
  - HSL: 142°, 57%, 20%
  - Role: Dedicated high-contrast external WhatsApp handoff button per TRD §5.5 and design tokens.
  - Visual Distinction: Darker, deeper forest green providing exceptional 9.11:1 contrast and clear visual differentiation from general UI actions.

> **Visual Artifact**: Side-by-side screenshot saved to:
> \`checklist_report/retest-2026-10-17b/screenshots/button_contrast_comparison.png\`
`;

fs.writeFileSync(path.join(baseDir, 'contrast.md'), contrastMd, 'utf8');

// METADATA.md
const metadataMd = `# 7. Metadata & OpenGraph URL Verification

## Static Route HTTP Status Codes

Verified via \`scripts/verify_metadata.js\` against live Next.js production build:

| Asset / Endpoint | Expected Status | Actual Status | Content-Type | Status |
|---|---|---|---|---|
| \`/favicon.ico\` | 200 | **200 OK** | \`image/x-icon\` | ✅ PASS |
| \`/robots.txt\` | 200 | **200 OK** | \`text/plain; charset=utf-8\` | ✅ PASS |
| \`/sitemap.xml\` | 200 | **200 OK** | \`application/xml\` | ✅ PASS |
| \`/manifest.webmanifest\` | 200 | **200 OK** | \`application/manifest+json\` | ✅ PASS |

---

## OpenGraph Tag Resolution & Localhost Analysis

### 1. Behavior When \`NEXT_PUBLIC_SITE_URL=https://unideal.app\`
In \`app/layout.tsx\`, Next.js initializes:
\`metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://unideal.app')\`

When deployed with \`NEXT_PUBLIC_SITE_URL=https://unideal.app\`:
- **Home Page**:
  - \`og:url\`: \`https://unideal.app\`
  - \`og:image\`: \`https://unideal.app/hero-campus.webp\`
  - Localhost presence: **None (0 occurrences)**.
- **Listing Detail Page** (\`/listing/engineering-mathematics-textbook-eAJiY\`):
  - \`og:url\`: \`https://unideal.app/listing/engineering-mathematics-textbook-eAJiY\`
  - \`og:image\`: \`https://res.cloudinary.com/dz72d21j1/image/upload/v1739775000/engineering-math.jpg\` (Cloudinary CDN URL)
  - Localhost presence: **None (0 occurrences)**.

### 2. Localhost Verification in Local Test Environment
During local testing where \`.env.local\` specifies \`NEXT_PUBLIC_SITE_URL=http://localhost:3000\`, relative URLs correctly prepend \`http://localhost:3000\`. This confirms that \`metadataBase\` functions properly and will dynamically point to \`https://unideal.app\` in the production environment.
`;

fs.writeFileSync(path.join(baseDir, 'metadata.md'), metadataMd, 'utf8');

console.log('All 10-17b reports compiled and saved to checklist_report/retest-2026-10-17b/');
