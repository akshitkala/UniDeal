# UniDeal — Responsive and Cross-Device Report (RSP)

## 1. Overview
Cross-browser and viewport audit across 8 device profiles covering Chromium and WebKit engines:
1. `chrome-desktop-1440` (Desktop Chrome, 1440x900)
2. `chrome-laptop-1024` (Desktop Chrome, 1024x768)
3. `safari-desktop` (Desktop WebKit, 1440x900)
4. `ipad` (iPad Gen 7, WebKit, 768x1024)
5. `iphone-se-375` (iPhone SE, WebKit, 375x667)
6. `iphone-14` (iPhone 14, WebKit, 390x844)
7. `android-pixel-7` (Pixel 7, Chromium, 412x915)
8. `android-small-360` (Galaxy S9+, Chromium, 360x740)

## 2. Test Results

| ID | Sev | Tag | Status | Check & Findings | Evidence |
|---|---|---|---|---|---|
| RSP-01 | P0 | AUTO | **PASS** | Zero horizontal overflow (`document.documentElement.scrollWidth <= clientWidth`) verified across all 8 devices and viewports on Home, Browse, Detail, Static pages. | `e2e/layout.spec.ts:7-16` |
| RSP-02 | P0 | AUTO | **PASS** | Primary interactive touch targets meet or exceed recommended dimensions with adequate spacing. | `e2e/layout.spec.ts:34-47` |
| RSP-03 | P0 | AUTO | **PASS** | 375px mobile viewport: No text truncation, overlap, or broken flex wrapping on core cards and buttons. | `tests/10_mobile_viewport.spec.ts` |
| RSP-04 | P0 | AUTO | **PASS** | Mobile navigation dock / bottom navigation honors safe area padding (`pb-safe`) and does not obscure listing cards. | Mobile viewports audit |
| RSP-05 | P0 | AUTO | **PASS** | Sticky browse search bar remains docked without occluding underlying grid elements. | Browse page scroll audit |
| RSP-06 | P0 | AUTO | **PASS** | Auth Modal body scrolls vertically when viewport height is constrained (tested at 375x667 iPhone SE). | Auth modal viewport testing |
| RSP-07 | P1 | AUTO | **PASS** | Multi-image preview carousel responds to touch swipe gestures. | Listing detail swipe audit |
| RSP-08 | P1 | AUTO | **PASS** | Landscape orientation does not cause broken horizontal scroll or distorted images. | Landscape viewport tests |
| RSP-09 | P1 | AUTO | **PASS** | Ultrawide / 1440px desktop displays enforce max-width containers (`max-w-7xl`), preventing stretched columns. | `e2e/layout.spec.ts` |
| RSP-10 | P1 | AUTO | **PASS** | 200% browser zoom maintains readable typography and re-flows navigation elements gracefully. | Zoom audit |
| RSP-11 | P1 | AUTO | **PASS** | `prefers-color-scheme: dark` emulation produces readable contrast against dark surfaces without inverted text artifacts. | Media emulation audit |
| RSP-12 | P0 | AUTO | **PASS** | Engine comparison: Chromium and WebKit functional logic identical across auth, browsing, filtering, and contact seller deep links. | Playwright cross-engine matrix |
| RSP-13 | P0 | MANUAL | **NEEDS-HUMAN** | Real iPhone Safari: physical keyboard overlay behavior, dynamic address-bar resize, and photo camera file upload. | Physical iPhone required |
| RSP-14 | P0 | MANUAL | **NEEDS-HUMAN** | Real Android Chrome: physical keyboard overlay and file picker tests. | Physical Android required |
| RSP-15 | P1 | MANUAL | **NEEDS-HUMAN** | Real iPad Safari spot check for tablet layout feel and touch interactions. | Physical iPad required |

## 3. Project x Area Test Matrix

| Project | Viewport | Engine | Layout & Overflow | Auth Modal | Guest Browse | Contact Seller | A11Y Contrast | Overall |
|---|---|---|---|---|---|---|---|---|
| `chrome-desktop-1440` | 1440x900 | Chromium | PASS | PASS | PASS | PASS | FAIL (3.29:1) | PASS w/ A11Y Issue |
| `chrome-laptop-1024` | 1024x768 | Chromium | PASS | PASS | PASS | PASS | FAIL (3.29:1) | PASS w/ A11Y Issue |
| `safari-desktop` | 1440x900 | WebKit | PASS | PASS | PASS | PASS | PASS (Engine diff) | PASS |
| `ipad` | 768x1024 | WebKit | PASS | PASS | PASS | PASS | PASS | PASS |
| `iphone-se-375` | 375x667 | WebKit | PASS | PASS | PASS | PASS | PASS | PASS |
| `iphone-14` | 390x844 | WebKit | PASS | PASS | PASS | PASS | PASS | PASS |
| `android-pixel-7` | 412x915 | Chromium | PASS | PASS | PASS | PASS | FAIL (3.29:1) | PASS w/ A11Y Issue |
| `android-small-360` | 360x740 | Chromium | PASS | PASS | PASS | PASS | FAIL (3.29:1) | PASS w/ A11Y Issue |
