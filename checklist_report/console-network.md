# UniDeal — Browser Console and Network Report

## 1. Overview
Audit of browser console warnings, errors, failed network requests, unhandled promise rejections, and deprecation messages during user interaction.

## 2. Console Messages Observed

| Page Visited | Type | Message | Impact |
|---|---|---|---|
| All pages | Deprecation Warning | `(node:24016) [DEP0040] DeprecationWarning: The punycode module is deprecated. Please use a userland alternative instead.` | Low (Node internal deprecation from older dependency, non-blocking) |
| `/browse` | Console Info | `[PERF_TRACE] GET /api/listings: queryDuration=...ms` | None (Server development debug logging) |
| `/sell` | Console Info | `[whatsapp] NEXT_PUBLIC_SITE_URL is unset; omitting listing URL from pre-filled message.` (only when unset) | Low (Handled safely with fallback) |
| `/favicon.ico` | Network Error (404) | `GET /favicon.ico 404 (Not Found)` | Medium (Browser automatically polls favicon.ico, generates 404 console entry) |
| `/robots.txt` | Network Error (404) | `GET /robots.txt 404 (Not Found)` | High (Crawlers requesting robots.txt receive 404) |
| `/sitemap.xml` | Network Error (404) | `GET /sitemap.xml 404 (Not Found)` | Medium (Search engines requesting sitemap receive 404) |

## 3. Network Request Integrity
- **Failed Requests on Page Navigations**: Zero 5xx errors observed during standard browsing, searching, or auth modal interaction.
- **Client Bundle Assets**: All JS chunks and CSS stylesheets loaded with HTTP 200 during clean server operation.
- **Third-Party Requests**: Zero unexpected external network calls (no analytics trackers, unvetted CDNs, or foreign font loaders).
