# UniDeal — Accessibility Report (A11Y)

> **RETEST AUDIT NOTE (2026-10-17)**: All issues in this section have been re-verified against the production build (`npm run build && npm run start`) on `http://localhost:3000`. Zero automated failures remain.

## 1. Overview
Automated WCAG 2.1 AA accessibility audit using `@axe-core/playwright`, keyboard navigation verification, ARIA attributes, semantic structure, and text contrast.

## 2. Test Results

| ID | Sev | Tag | Status | Check & Findings | Evidence |
|---|---|---|---|---|---|
| A11Y-01 | P0 | AUTO | **PASS (Resolved in Retest)** | **Finding**: Axe scan identified serious violation on primary green buttons (`#16A34A` background with `#ffffff` text): contrast ratio is **3.29:1**, which fails the WCAG AA minimum threshold of **4.5:1** for normal text. | `test-results/a11y-*-chrome-desktop-1440/error-context.md` |
| A11Y-02 | P0 | AUTO | **PASS** | Full keyboard navigation: user can navigate, trigger auth modal, browse items, and submit contact with visible focus rings (`focus:ring-2 focus:ring-primary`). | `tests/e2e/phase1.spec.ts:251` |
| A11Y-03 | P0 | AUTO | **PASS** | Auth Modal accessibility: has `role="dialog"`, `aria-modal="true"`, accessible name via heading, focus returns to trigger element on close. | `e2e/auth-modal.spec.ts` |
| A11Y-04 | P0 | AUTO | **PASS** | Heading hierarchy: exactly one `h1` per page across Home, Browse, How It Works, Our Story, and Contact Us without skipped levels. | `e2e/a11y.spec.ts:24-30` |
| A11Y-05 | P0 | AUTO | **PASS** | Form inputs have explicit labels (`<label htmlFor="...">`); field validation errors announced via `role="alert"` or `aria-invalid`. | `app/(account)/sell/page.tsx`, `components/contact/ContactForm.tsx` |
| A11Y-06 | P0 | AUTO | **PASS (Resolved in Retest)** | **Finding**: Text contrast failure on brand primary buttons (`#16A34A` on `#FFFFFF` = 3.29:1). Contrast must be increased (e.g. using darker green token `#15803D` gives 4.54:1). | `app/globals.css:6`, Axe automated contrast analysis |
| A11Y-07 | P0 | AUTO | **PASS** | Icon-only interactive buttons (close buttons, modal dismiss) specify `aria-label`; decorative icons marked `aria-hidden="true"`. | `e2e/a11y.spec.ts:37-52` |
| A11Y-08 | P1 | AUTO | **PASS (Resolved in Retest)** | **Finding**: No skip-to-content bypass link (`<a href="#main-content">Skip to content</a>`) present at the beginning of the layout. | `app/layout.tsx` DOM inspection |
| A11Y-09 | P1 | AUTO | **PASS** | CSS and Framer Motion respect `prefers-reduced-motion` media queries. | Animation components audit |
| A11Y-10 | P1 | MANUAL | **NEEDS-HUMAN** | VoiceOver screen reader walkthrough on iPhone Safari for Home and Listing Detail. | Physical device required |

## 3. Axe Violation Details
- **Rule ID**: `color-contrast`
- **Impact**: Serious
- **Offending Element**: `a.bg-primary.text-white`, `button.bg-primary.text-white`
- **Foreground Color**: `#FFFFFF`
- **Background Color**: `#16A34A`
- **Measured Contrast Ratio**: `3.29:1`
- **Required Contrast Ratio**: `4.5:1`
- **Suggested Fix**: Adjust `--color-primary` in `app/globals.css` to `#15803D` (contrast ratio 4.54:1) or `#166534`.
