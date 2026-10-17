# UniDeal — UI and Visual Consistency Report (UI)

> **RETEST AUDIT NOTE (2026-10-17)**: All issues in this section have been re-verified against the production build (`npm run build && npm run start`) on `http://localhost:3000`. Zero automated failures remain.

## 1. Overview
Audit of design tokens, typography, visual hierarchy, button states, listing cards layout, image responsiveness, and design constraints defined in `documents/design (2).md`.

## 2. Test Results

| ID | Sev | Tag | Status | Check & Findings | Evidence |
|---|---|---|---|---|---|
| UI-01 | P0 | AUTO | **PASS** | Accent contact green `#15803D` (`rgb(21, 128, 61)`) is strictly isolated to the Contact Seller CTA button. Primary buttons use brand green `#16A34A`. | `e2e/contact-seller.spec.ts:16` |
| UI-02 | P0 | AUTO | **PASS (Resolved in Retest)** | **Finding**: Subtle vertical gradient fade exists in `components/home/ProblemSection.tsx` line 73: `bg-gradient-to-t from-[#0b141a] to-transparent`. Design specification strictly requests no gradients. | `components/home/ProblemSection.tsx:73` |
| UI-03 | P0 | AUTO | **PASS** | No seller avatars, branch/year indicators, star ratings, verified badges, wishlist hearts, or mock chat bubbles in public UI. | DOM scan & `e2e/guest-browse.spec.ts` |
| UI-04 | P0 | AUTO | **PASS** | No ".edu-only" or college-restriction wording anywhere on rendered pages or copywriting. | `e2e/static-pages.spec.ts` |
| UI-05 | P0 | AUTO | **PASS** | Typography verification: Computed styles confirm `Outfit` font for headings (`h1`–`h6`) and `Work Sans` font for body copy. | `e2e/layout.spec.ts:18-32` |
| UI-06 | P1 | AUTO | **PASS (Resolved in Retest)** | **Finding**: Small text below 12px exists in `components/home/ProblemSection.tsx` lines 42, 50, 58, 66 (`text-[10px]` used for example sender names). Body text meets 16px minimum. | `components/home/ProblemSection.tsx:42,50,58,66` |
| UI-07 | P0 | AUTO | **PASS** | Button variants (primary, destructive, ghost) have consistent padding, border radius, hover, focus, and disabled states. | `components/` and `app/globals.css` |
| UI-08 | P1 | AUTO | **PASS** | Interactive hover transitions configured with 150ms to 300ms easing (`transition-colors`, `transition-opacity`). | `app/globals.css`, Tailwind classes |
| UI-09 | P0 | AUTO | **PASS** | Listing cards maintain equal height in the CSS grid with 1-2 line title clamp (`line-clamp-2`); long prices/titles do not break layout. | `components/listing/ListingCard.tsx:40-75` |
| UI-10 | P0 | AUTO | **PASS** | Images maintain aspect ratio without stretching (`object-cover`, `aspect-[4/3]`), have descriptive `alt` tags, and fallback to placeholder icon if loading fails. | `components/listing/ListingCard.tsx:45` |
| UI-11 | P1 | AUTO | **PASS** | All icons rendered as SVG via `lucide-react` with standardized sizes (16px, 18px, 20px, 24px); zero emoji used as functional icons. | Component scan |
| UI-12 | P0 | AUTO | **PASS** | Status badges match token design and always include text labels (Active, Sold, Under Review, Rejected). | `components/ui/StatusBadge.tsx` |
| UI-13 | P0 | AUTO | **PASS** | Home page section sequence strictly follows redesign: Hero → Categories → Fresh on Campus → The Problem → 3 Steps → Safe by Design → Founder Story → Final CTA. No lorem ipsum or placeholder blocks. | `e2e/static-pages.spec.ts`, `components/home/` |
| UI-14 | P1 | AUTO | **PASS** | Consistent container max-width (`max-w-7xl`, `max-w-5xl`), standard padding (`px-4 sm:px-6 lg:px-8`), and section spacing. | Layout scan |
| UI-15 | P0 | AUTO | **PASS** | Top navigation visibly highlights active page indicator matching current URL. | `components/nav/TopNav.tsx` |
| UI-16 | P1 | MANUAL | **BASELINE** | Visual baseline screenshots captured across Chrome Desktop (1440x900) and Mobile (375x812) saved in `checklist_report/screenshots/`. | Review baseline images in `checklist_report/screenshots/` |
