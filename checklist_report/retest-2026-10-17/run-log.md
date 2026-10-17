# Pre-Launch QA Execution Run Log

> **RETEST AUDIT NOTE (2026-10-17)**: All issues in this section have been re-verified against the production build (`npm run build && npm run start`) on `http://localhost:3000`. Zero automated failures remain.

| Field | Value |
|---|---|
| Target Application | UniDeal (Next.js 14 App Router, Supabase, Tailwind CSS) |
| Environment | Local Test Pre-Launch (`http://localhost:3000`) |
| Date & Time | 2026-10-16 |
| QA Engineer | Antigravity QA Lead Agent |
| Total Checklist Items | 184 items (SEC, FUN, UI, LNK, META, STA, RSP, A11Y, CPY, CODE, PERF, INF, MAN) |

---

## 1. Timeline of Execution

### Phase A: Setup & Test Environment Initialization
- **Environment Inspection**: Verified `.env.local` and created `.env.test` with test account configuration (`ADMIN`, `USER_A`, `USER_B`, `UNVERIFIED`, `BANNED`).
- **Server Health Check**: Checked running Next.js server on port 3000; validated that the application responds with HTTP 200 at `http://localhost:3000`.
- **Dependency & Browser Installation**:
  - Installed `@axe-core/playwright` as devDependency.
  - Installed Playwright browser binaries (`chromium`, `firefox`, `webkit`) via `npx playwright install --with-deps`.
- **Directory Structure Setup**: Created `checklist_report/` with subdirectories `screenshots/`, `lighthouse/`, `playwright-report/`.

### Phase B: Real-Browser Pass (Antigravity Browser Agent)
- **Session 1 (Desktop 1440x900)**:
  - Navigated to `http://localhost:3000`.
  - Tested navigation header, hero section, CTA buttons, active state highlights.
  - Tested AuthModal trigger via "Sell" button and "Sign In" button; confirmed backdrop click and Escape key dismissal.
  - Tested `/browse` page: loaded listings, tested search bar, tested category filtering, tested condition filters.
  - Tested Listing Detail page: verified seller privacy (first name rendered, no branch/year, no raw phone number).
  - Tested Contact Seller button: verified guest trigger opens AuthModal with `returnTo` preserved.
  - Captured desktop baseline screenshots.
- **Session 2 (Mobile 375x812)**:
  - Resized viewport to 375x812.
  - Verified responsive layout, hamburger/bottom navigation, mobile card aspect ratio, safe area padding.
  - Verified AuthModal usability on small screen height without overflow truncation.

### Phase C: Cross-Browser & Cross-Device Playwright Suite
- **Configuration**: Created `e2e/playwright.config.ts` defining 8 targeted device projects:
  1. `chrome-desktop-1440` (Chromium, 1440x900)
  2. `chrome-laptop-1024` (Chromium, 1024x768)
  3. `safari-desktop` (WebKit, 1440x900)
  4. `ipad` (WebKit, 768x1024)
  5. `iphone-se-375` (WebKit, 375x667)
  6. `iphone-14` (WebKit, 390x844)
  7. `android-pixel-7` (Chromium, 412x915)
  8. `android-small-360` (Chromium, 360x740)
- **Test Specs Executed**:
  - `e2e/guest-browse.spec.ts`: SEC-13, FUN-25, FUN-26, FUN-27, FUN-29, FUN-44, SEC-01, UI-09, UI-10.
  - `e2e/auth-modal.spec.ts`: FUN-01, FUN-03, FUN-04, FUN-06, FUN-07, A11Y-03, RSP-06.
  - `e2e/contact-seller.spec.ts`: FUN-31, FUN-33, FUN-34, SEC-01, SEC-10, UI-01.
  - `e2e/contact-us.spec.ts`: FUN-42, SEC-18, STA-04.
  - `e2e/static-pages.spec.ts`: FUN-43, LNK-01, LNK-02, LNK-04, LNK-06, UI-04, CPY-01, META-13.
  - `e2e/layout.spec.ts`: RSP-01, RSP-02, UI-05.
  - `e2e/a11y.spec.ts`: A11Y-01, A11Y-04, A11Y-07, META-11.
  - `e2e/meta.spec.ts`: META-01, META-02, META-04, META-05, META-06, META-09, META-10.
  - `e2e/security.spec.ts`: SEC-02, SEC-06, SEC-14, SEC-19, SEC-20.

### Phase D: Static Code Scans & Link Crawling
- **Security & Scope Scans (`rg`)**:
  - Queried `lib/supabase/admin.ts` across `app/`: confirmed 0 imports in Client Components (CODE-01).
  - Queried `NEXT_PUBLIC_`: confirmed no server secrets prefixed with NEXT_PUBLIC_ (CODE-02).
  - Queried `whatsapp_number`: verified select occurs only in server routes (CODE-04).
  - Queried `full_name`: confirmed only `firstName()` rendered on listing-facing surfaces (CODE-05).
  - Queried `/login` and `/signup`: verified 0 routes created (CODE-06).
  - Queried `catch {}`: confirmed zero empty catch blocks (CODE-09).
  - Queried `console.log`: confirmed no user data leakage (CODE-11).
  - Ran `npx tsc --noEmit`: 0 TypeScript compiler errors (CODE-12).
- **Link Crawl**:
  - Executed recursive link crawler `scratch/crawl_links.js`: crawled 58 internal anchor tags; 0 broken links (LNK-05).

### Phase E: Performance Benchmarking
- **Latency & TTFB Benchmarks**:
  - Executed `scripts/perf-report.mjs` against live server.
  - Warm median TTFB: 76ms (`/browse`), 193ms (`/listings/[slug]`), 205ms (`/sell`), 220ms (`/profile`).

### Phase F: Report Generation
- Generated 14 comprehensive markdown reports in `checklist_report/`:
  - `checklist_report/SUMMARY.md`
  - `checklist_report/results.json`
  - `checklist_report/bugs.md`
  - `checklist_report/security.md`
  - `checklist_report/functional.md`
  - `checklist_report/ui-visual.md`
  - `checklist_report/links.md`
  - `checklist_report/seo-meta.md`
  - `checklist_report/states-edge-cases.md`
  - `checklist_report/responsive-devices.md`
  - `checklist_report/accessibility.md`
  - `checklist_report/content-copy.md`
  - `checklist_report/code-scan.md`
  - `checklist_report/console-network.md`
  - `checklist_report/performance.md`
  - `checklist_report/needs-human.md`
  - `checklist_report/run-log.md`

---

## 2. Commands Run

```bash
# Verify TypeScript compilation
npx tsc --noEmit

# Install testing dependencies
npm i -D @axe-core/playwright
npx playwright install --with-deps chromium firefox webkit

# Execute link crawler
node scratch/crawl_links.js

# Performance benchmarking
node scripts/perf-report.mjs

# Generate machine-readable checklist results
node scratch/generate_results_json.js
```

---

## 3. Discrepancies, Blockers, & Notes
- **Playwright WebKit Engine Note**: Playwright WebKit is the Safari browser engine compiled for Linux/Windows; it is not the identical operating-system-level Safari on iOS/macOS. Physical iPhone/iPad testing remains required under `needs-human.md`.
- **WhatsApp Direct Message Safety**: Assertions were made strictly against the generated `wa.me` URL string and HTTP payload. No real WhatsApp messages were dispatched.
- **Resend Mocking**: Resend failure was tested via mocked server-side route interception, keeping real email credentials and deliverability intact.
