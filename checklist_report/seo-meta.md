# UniDeal — Favicon, Metadata, and Sharing Report (META)

## 1. Overview
Audit of page `<title>`, `<meta name="description">`, OpenGraph social sharing tags, `favicon.ico`, web manifests, `robots.txt`, `sitemap.xml`, and language attributes.

## 2. Test Results

| ID | Sev | Tag | Status | Check & Findings | Evidence |
|---|---|---|---|---|---|
| META-01 | P0 | AUTO | **FAIL (P0)** | **Finding**: Request to `/favicon.ico` returns HTTP 404. While `app/icon.tsx` dynamically generates an SVG icon at `/icon?...`, standard root `/favicon.ico` is missing from `public/`. | `curl.exe http://localhost:3000/favicon.ico -> 404` |
| META-02 | P1 | AUTO | **FAIL (P1)** | **Finding**: No `<link rel="apple-touch-icon">` tag (180x180) configured in root layout metadata. | DOM inspection of `<head>` |
| META-03 | P1 | AUTO | **FAIL (P1)** | **Finding**: Web application manifest (`manifest.json` or `site.webmanifest`) missing from `public/` and not referenced in root `<head>`. | Head link audit |
| META-04 | P0 | AUTO | **FAIL (P0)** | **Finding**: Page title on `/browse` falls back to default root layout title `"UniDeal — Campus Marketplace"` without page-specific `"Browse Listings"` prefix. | `e2e/meta.spec.ts:15`, `app/(public)/browse/page.tsx` |
| META-05 | P0 | AUTO | **PASS** | Meta description exists on public pages; dynamic listings generate description based on item title/description. | `<meta name="description">` audit |
| META-06 | P0 | AUTO | **FAIL (P0)** | **Finding**: Root Home page lacks explicit OpenGraph tags (`og:title`, `og:description`, `og:image`, `og:url`) in metadata configuration. | DOM inspection of `/` head |
| META-07 | P1 | AUTO | **FAIL (P1)** | **Finding**: Twitter Card meta tags (`twitter:card`, `twitter:title`, `twitter:image`) missing on Home page. | DOM inspection of `/` head |
| META-08 | P1 | AUTO | **PASS** | `theme-color` meta tag configured with campus accent green `#16A34A`. | `<meta name="theme-color">` |
| META-09 | P0 | AUTO | **FAIL (P0)** | **Finding**: Request to `/robots.txt` returns HTTP 404. No `app/robots.ts` or `public/robots.txt` disallowing `/admin`, `/api`, `/dashboard`, `/sell`, `/profile`. | `curl.exe http://localhost:3000/robots.txt -> 404` |
| META-10 | P1 | AUTO | **FAIL (P1)** | **Finding**: Request to `/sitemap.xml` returns HTTP 404. No `app/sitemap.ts` or `public/sitemap.xml` generating public routes list. | `curl.exe http://localhost:3000/sitemap.xml -> 404` |
| META-11 | P0 | AUTO | **PASS** | HTML document specifies `<html lang="en">`. | `app/layout.tsx:18`, `e2e/a11y.spec.ts:31` |
| META-12 | P1 | AUTO | **PASS** | Canonical URL logic handles base paths without query parameter contamination. | Head canonical tags |
| META-13 | P0 | AUTO | **PASS** | Custom 404 and 500 error pages follow UniDeal design tokens and provide prominent CTA button back to Browse. | `app/not-found.tsx`, `e2e/static-pages.spec.ts:57` |
| META-14 | P0 | MANUAL | **NEEDS-HUMAN** | WhatsApp and Instagram DM link preview verification with a real phone device before social launch. | External human check required |
