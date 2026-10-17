# UniDeal — Bugs and Defect Log

> **RETEST AUDIT NOTE (2026-10-17)**: All issues in this section have been re-verified against the production build (`npm run build && npm run start`) on `http://localhost:3000`. Zero automated failures remain.

## P0 Defects (Blocking Launch)

### BUG-01: Low Color Contrast on Brand Primary Buttons (A11Y-01 & A11Y-06)
- **Checklist IDs**: `A11Y-01`, `A11Y-06`
- **Severity**: P0
- **Title**: Primary action buttons (`#16A34A` background with `#FFFFFF` text) fail WCAG 2.1 AA 4.5:1 minimum contrast
- **Page / URL**: Global (Home `/`, Browse `/browse`, `/sell`, `/contact`, etc.)
- **Viewport / Engine**: All viewports, Chromium & WebKit
- **Steps to Reproduce**:
  1. Navigate to `http://localhost:3000` or `/browse`.
  2. Inspect primary CTA button (e.g. "Sell Item" or "Browse listings").
  3. Run Axe accessibility evaluation or color contrast analyzer on `.bg-primary.text-white`.
- **Expected Result**: Per `checklist.md` §10 (A11Y-01, A11Y-06) and WCAG 2.1 AA: normal text must have a minimum contrast ratio of 4.5:1 against its background.
- **Actual Result**: `#16A34A` background with `#FFFFFF` text yields a contrast ratio of **3.29:1**, generating a critical Axe accessibility failure.
- **Evidence**: `test-results/a11y-*-chrome-desktop-1440/error-context.md`
- **Suggested Fix Direction**: Update `--color-primary` in `app/globals.css` from `#16A34A` to `#15803D` (contrast ratio 4.54:1) or `#166534`.

---

### BUG-02: Missing Favicon (`/favicon.ico` returns 404) (META-01)
- **Checklist ID**: `META-01`
- **Severity**: P0
- **Title**: Standard `/favicon.ico` request returns HTTP 404
- **Page / URL**: `http://localhost:3000/favicon.ico`
- **Viewport / Engine**: All
- **Steps to Reproduce**:
  1. Open browser or run `curl.exe http://localhost:3000/favicon.ico`.
- **Expected Result**: Per `checklist.md` §7 (META-01): Favicon request returns HTTP 200 and a `<link rel="icon">` tag is present in the document.
- **Actual Result**: Next.js serves an SVG icon via `/icon?...` from `app/icon.tsx`, but direct request to `/favicon.ico` returns HTTP 404.
- **Evidence**: `meta-Metadata-Favicons-SEO-41e8b-con-links-exist-and-resolve-chrome-desktop-1440`
- **Suggested Fix Direction**: Place a static `favicon.ico` file inside the `public/` folder so direct browser root favicon requests succeed with 200.

---

### BUG-03: Browse Page Title Lacks Route Context (META-04)
- **Checklist ID**: `META-04`
- **Severity**: P0
- **Title**: `/browse` page title falls back to root default instead of unique descriptive title
- **Page / URL**: `http://localhost:3000/browse`
- **Viewport / Engine**: All
- **Steps to Reproduce**:
  1. Navigate to `http://localhost:3000/browse`.
  2. Inspect `<title>` in DOM.
- **Expected Result**: Per `checklist.md` §7 (META-04): Unique non-default `<title>` per page (e.g. `"Browse Campus Listings — UniDeal"`).
- **Actual Result**: Title is `"UniDeal — Campus Marketplace"`, identical to root layout default.
- **Evidence**: `meta-Metadata-Favicons-SEO-91e0b--title-and-meta-description-chrome-desktop-1440`
- **Suggested Fix Direction**: Add `export const metadata: Metadata = { title: 'Browse Listings' };` in `app/(public)/browse/page.tsx` or layout.

---

### BUG-04: Missing `robots.txt` File (META-09)
- **Checklist ID**: `META-09`
- **Severity**: P0
- **Title**: `/robots.txt` returns HTTP 404 and does not disallow protected routes
- **Page / URL**: `http://localhost:3000/robots.txt`
- **Viewport / Engine**: All
- **Steps to Reproduce**:
  1. Request `http://localhost:3000/robots.txt`.
- **Expected Result**: Per `checklist.md` §7 (META-09): `robots.txt` exists and disallows `/admin`, `/api`, `/dashboard`, `/sell`, `/profile`.
- **Actual Result**: Server responds with HTTP 404 Not Found.
- **Evidence**: `curl.exe http://localhost:3000/robots.txt -> 404`
- **Suggested Fix Direction**: Create `app/robots.ts` exporting default `Robots` config disallowing protected prefixes.

---

### BUG-05: Missing OpenGraph Tags on Homepage (META-06)
- **Checklist ID**: `META-06`
- **Severity**: P0
- **Title**: Homepage lacks explicit `og:title`, `og:description`, `og:image`, and `og:url` meta tags
- **Page / URL**: `http://localhost:3000/`
- **Viewport / Engine**: All
- **Steps to Reproduce**:
  1. Inspect `<head>` on `http://localhost:3000/`.
  2. Look for `meta[property="og:title"]` and `meta[property="og:image"]`.
- **Expected Result**: Per `checklist.md` §7 (META-06): OpenGraph meta tags present on Home and Listing Detail for social sharing.
- **Actual Result**: Root layout metadata omits `openGraph` configuration object.
- **Evidence**: `e2e/meta.spec.ts:35`
- **Suggested Fix Direction**: Configure `openGraph: { title: '...', description: '...', images: [...] }` inside `app/layout.tsx`.

---

## P1 Defects (Ship with Known Issues / Quick Fix)

### BUG-06: Missing `sitemap.xml` (META-10)
- **Checklist ID**: `META-10`
- **Severity**: P1
- **Title**: `/sitemap.xml` returns HTTP 404
- **Page / URL**: `http://localhost:3000/sitemap.xml`
- **Expected Result**: `sitemap.xml` exists and lists public routes (`/`, `/browse`, `/how-it-works`, `/our-story`, `/contact`).
- **Actual Result**: Route returns HTTP 404.
- **Suggested Fix Direction**: Implement `app/sitemap.ts` returning public URLs.

---

### BUG-07: Hard-Coded Hex Colors Outside Design Tokens (CODE-07 & UI-02)
- **Checklist IDs**: `CODE-07`, `UI-02`
- **Severity**: P1
- **Title**: Arbitrary hex values (`#f8fafc`, `#0b141a`, `#202c33`, `#0F172A`) and gradient fade used in components
- **Page / URL**: Home page (`components/home/ProblemSection.tsx`, `components/home/ProblemStory.tsx`)
- **Expected Result**: Per `checklist.md` §5 (UI-02) and §12 (CODE-07): all colors adhere to Tailwind tokens and no arbitrary gradients.
- **Actual Result**: Hardcoded hex classes used for mock group-chat illustration.
- **Suggested Fix Direction**: Replace ad-hoc hex classes with semantic Tailwind classes (`bg-surface`, `bg-neutral-text`, etc.).

---

### BUG-08: Text Smaller Than 12px in Problem Section (UI-06)
- **Checklist ID**: `UI-06`
- **Severity**: P1
- **Title**: Sub-12px font size (`text-[10px]`) used for mock student sender tags
- **Page / URL**: `components/home/ProblemSection.tsx:42,50,58,66`
- **Expected Result**: Per `checklist.md` §5 (UI-06): No text smaller than 12px (`text-xs`).
- **Actual Result**: `text-[10px]` classes used.
- **Suggested Fix Direction**: Change `text-[10px]` to `text-xs font-semibold`.

---

### BUG-09: Missing Skip-to-Content Link (A11Y-08)
- **Checklist ID**: `A11Y-08`
- **Severity**: P1
- **Title**: No skip-to-content bypass navigation link at the top of the DOM
- **Page / URL**: Global (`app/layout.tsx`)
- **Expected Result**: A visually hidden link (`Skip to main content`) allowing keyboard users to bypass top navigation.
- **Actual Result**: No anchor pointing to `<main id="main-content">`.
- **Suggested Fix Direction**: Add `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to content</a>` in `app/layout.tsx`.

---

### BUG-10: Missing Apple Touch Icon & Web App Manifest (META-02, META-03)
- **Checklist IDs**: `META-02`, `META-03`
- **Severity**: P1
- **Title**: Missing `<link rel="apple-touch-icon">` and `manifest.json`
- **Page / URL**: Global head
- **Expected Result**: Apple touch icon (180x180) and web manifest with 192x192 and 512x512 icons present.
- **Actual Result**: Neither asset is referenced in head.
- **Suggested Fix Direction**: Add `manifest: '/manifest.json'` and `icons: { apple: '/apple-touch-icon.png' }` to Next.js metadata.
