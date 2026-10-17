# UniDeal — Pre-Launch Checklist & Antigravity QA Run

| Field | Value |
|---|---|
| Version | 1.0 |
| Date | October 2026 |
| Companion docs | PRD v2.1, TRD v1.1, architecture.md v1.1, rules.md v1.1, design.md, appflow.md |
| Output | `/reports/<YYYY-MM-DD_HHMM>/` (created by the agent) |

> **Purpose:** One file that holds (1) the master prompt to paste into Antigravity, (2) the exact report folder it must produce, and (3) every checklist item with a stable ID so each result can be traced back. If the agent's report disagrees with this file, this file wins.

---

## 0. How to use this file

1. Deploy a **production-like preview** (Vercel preview or staging URL) connected to a **dedicated test Supabase project**. Never run this against the live production database.
2. Create the four test accounts (see §2) and put the credentials in `.env.test` (never committed).
3. Put this `checklist.md` in the project root.
4. Open Antigravity in the project, start a new agent task, and paste the prompt in §1.
5. When it finishes, open `reports/<timestamp>/SUMMARY.md` first.
6. Do the `[MANUAL]` items yourself (§12). No agent can replace a real iPhone.

**Tags used below**
- `[AUTO]` the agent can verify it (real browser, Playwright, or code scan)
- `[MANUAL]` needs a human or a real device
- `P0` blocks launch if failed. `P1` can ship with a logged known issue.

---

## 1. MASTER PROMPT FOR ANTIGRAVITY (copy everything in the block)

```
ROLE
You are the QA lead for UniDeal, a campus marketplace (Next.js App Router, Supabase, Cloudinary, Vercel, Resend). You are doing the final pre-launch audit. You TEST AND REPORT. You do NOT fix, refactor, or modify any application source code, database schema, or config. If you find a bug, document it; do not patch it.

INPUTS
- Checklist: ./checklist.md (sections 3 to 11 contain every item with an ID like SEC-01).
- Reference docs (read before testing): UniDeal_PRD_v2_1.md, UniDeal_TRD_v1_1.md, architecture_v1_1.md, rules_v1_1.md, design.md, appflow.md. Where they conflict with the checklist, the checklist wins; note the conflict in the report.
- Target URL: read BASE_URL from .env.test.
- Test accounts: read from .env.test: ADMIN_EMAIL/ADMIN_PASSWORD, USER_A_EMAIL/USER_A_PASSWORD (verified, has WhatsApp number), USER_B_EMAIL/USER_B_PASSWORD (verified, no WhatsApp number), UNVERIFIED_EMAIL/UNVERIFIED_PASSWORD, BANNED_EMAIL/BANNED_PASSWORD.

HARD SAFETY RULES
1. Only test against BASE_URL. Refuse to run if BASE_URL looks like the production domain or the Supabase URL is not the test project. Ask me to confirm first.
2. Never print, log, screenshot, or write passwords, API keys, service-role keys, or full phone numbers into the report. Redact them as [REDACTED].
3. Do not modify files outside ./reports/ and ./e2e/ (you may create Playwright specs in ./e2e/ if missing).
4. Do not send real WhatsApp messages. Never follow a wa.me link; only assert that it was requested and what it contains.
5. For the Contact Us failure test, mock the failure with Playwright page.route. Do not break real Resend.
6. Clean up: delete any listings and reports you create during testing, using the test accounts only.

EXECUTION PLAN (do these in order)

PHASE A. Preparation
1. Create the report folder ./reports/<YYYY-MM-DD_HHMM>/ with the structure in "REPORT STRUCTURE" below.
2. Read all reference docs and checklist.md. Build a list of every checklist ID and mark each as PENDING in results.json.
3. Confirm the app is reachable (HTTP 200 on BASE_URL). If not, stop and report.

PHASE B. Real-browser pass (use the Antigravity browser agent, real Chrome, visible)
Walk the app like a real user at desktop width (1440x900) and at mobile width (375x812). For each section 3 to 10 in checklist.md:
- Perform the check in the real browser.
- Take a screenshot for every FAIL and for every key screen (Home, Browse, Listing Detail, Auth Modal, Sell, Dashboard, Profile, Admin overview, Contact Us, Our Story, How It Works, 404). Save to screenshots/ with the name <ID>_<viewport>_<pass|fail>.png.
- Record the browser console errors and failed network requests for each page visited into console-network.md.
- Run the broken-link crawl (LNK section) as guest, as USER_A, and as ADMIN.

PHASE C. Cross-browser and cross-device pass (Playwright)
1. Ensure @playwright/test and @axe-core/playwright are installed (npm i -D only; no app code changes) and browsers are installed (npx playwright install --with-deps).
2. Create or reuse ./e2e/playwright.config.ts with these projects:
   - chrome-desktop-1440 (Desktop Chrome, 1440x900)
   - chrome-laptop-1024 (Desktop Chrome, 1024x768)
   - safari-desktop (Desktop Safari/WebKit, 1440x900)
   - ipad (iPad gen 7, WebKit, 768 wide)
   - iphone-se-375 (iPhone SE, WebKit)
   - iphone-14 (iPhone 14, WebKit)
   - android-pixel-7 (Pixel 7, Chromium)
   - android-small-360 (Galaxy S9+, 360x740)
   Reporters: html (output to reports/<ts>/playwright-report), json (reports/<ts>/playwright-results.json), list. Traces on first retry, screenshots on failure, 1 retry.
3. Write and run one spec per area: guest-browse, auth-modal, sell-edit, contact-seller, dashboard, admin, report, contact-us, static-pages, layout, a11y, visual, links, meta, security. Tag each test title with the checklist ID(s) it verifies, for example test('SEC-01 phone number never in DOM or responses', ...).
4. Run every spec on every project. Playwright WebKit is the Safari engine but NOT real Safari. State this limitation in the report.
5. For contact-seller, assert window.open was called with a URL starting https://wa.me/ and the prefilled text contains the listing title. Never follow the link. Assert the API response body contains only { waLink } and no separate phone field.
6. For layout, at every project assert document.documentElement.scrollWidth <= clientWidth (no horizontal overflow) and that every visible button, link, and input has a bounding box of at least 44x44 CSS px (list offenders).
7. For a11y, run axe on every public and account page in every project; fail on serious or critical violations.
8. For visual, capture toHaveScreenshot baselines for Home, Browse, Listing Detail, Auth Modal on every project. First run creates baselines; mark as "BASELINE CREATED, needs human review", not PASS.

PHASE D. Static code scans (read-only)
Run the greps and scans listed in the CODE section of checklist.md (secrets in client bundle, href="#", full_name rendering, hex colors outside tokens, lorem/TODO, /login or /signup routes, localStorage of sensitive data, any import of the service-role client in a Client Component). Record file paths and line numbers.

PHASE E. Performance
Run Lighthouse (mobile and desktop) for Home, Browse, and one Listing Detail. Save the JSON and an HTML copy to lighthouse/. Record LCP, CLS, INP, TTFB and the performance, accessibility, best-practices and SEO scores.

PHASE F. Report
Fill in every file in REPORT STRUCTURE. Every checklist ID must end with exactly one status:
- PASS (verified, evidence saved)
- FAIL (reproducible, evidence saved)
- BLOCKED (could not test, say why)
- NEEDS-HUMAN (marked MANUAL or needs a real device or judgment)
- BASELINE (visual baseline created, needs review)
Never mark PASS without evidence. If unsure, use BLOCKED or NEEDS-HUMAN. Do not guess.

For every FAIL write a bug entry in bugs.md with: ID, severity (P0/P1), title, page/URL, viewport/browser, exact steps to reproduce, expected result (cite the doc section), actual result, evidence file name, and a suggested fix direction (one or two lines, no code changes made).

REPORT STRUCTURE (create exactly this)
reports/<YYYY-MM-DD_HHMM>/
  SUMMARY.md                 go/no-go verdict, totals per status and per severity, top 10 issues, browser/device matrix
  results.json               machine-readable: [{id, section, severity, status, evidence, notes}]
  bugs.md                    every FAIL with repro steps, sorted P0 then P1
  security.md                section 3 results in detail
  functional.md              section 4 results
  ui-visual.md               section 5 results
  links.md                   section 6 results + crawl table (URL, status, found-on)
  seo-meta.md                section 7 results
  states-edge-cases.md       section 8 results
  responsive-devices.md      section 9 results + the matrix of project x spec pass/fail
  accessibility.md           section 10 results + axe violation list
  content-copy.md            section 11 results
  code-scan.md               section CODE results with file:line
  console-network.md         console errors and failed requests per page
  performance.md             Lighthouse numbers vs targets
  needs-human.md             every MANUAL / NEEDS-HUMAN item as a tickable list
  screenshots/               evidence
  lighthouse/                reports
  playwright-report/         HTML report
  playwright-results.json
  run-log.md                 timeline of what you did, commands run, anything skipped and why

VERDICT RULES (put in SUMMARY.md)
- NO-GO if any P0 is FAIL.
- NO-GO if any P0 is BLOCKED (untested P0 is not a pass).
- GO WITH KNOWN ISSUES if all P0 PASS and some P1 FAIL (list them).
- GO if all P0 PASS and no P1 FAIL.
Always list the NEEDS-HUMAN items separately; they are required before launch even if the verdict is GO.

SPECIAL ATTENTION (verify first, these are suspected risks)
1. TRD section 3.1 revokes SELECT on profiles from anon, but listings_select_public runs a subquery on profiles.is_banned. As a logged-out guest, test Browse and Listing Detail. If it errors or returns empty, report as P0 SEC-13.
2. Profile page: the user's own whatsapp_number is revoked for authenticated. Test whether the Profile page can still load and save it. Report as P0 FUN-30 if broken.
3. Seller identity: search every rendered page and every API response for the full name of USER_A, and for branch/year. They must appear only on USER_A's own Profile page.

When finished, print a 10-line summary in chat with the verdict, counts, and the path to SUMMARY.md. Do not claim completion until every ID has a status.
```

---

## 2. Test account setup (do this before running)

| Account | State | Notes |
|---|---|---|
| ADMIN | verified, `is_admin = true` | the only promoted account |
| USER_A | verified, has WhatsApp number | owns 3+ listings in mixed statuses |
| USER_B | verified, no WhatsApp number | to test "Seller contact not available" |
| UNVERIFIED | email not confirmed | for gate tests |
| BANNED | `is_banned = true` with 1 approved listing | for visibility tests |

Seed the test project with: all 6 categories, 12+ approved listings across categories and conditions (one with a 100-char title, one with price 0, one with a very large price, one with non-English text), and `approval_mode = 'auto'`.

`.env.test` keys: `BASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `USER_A_EMAIL`, `USER_A_PASSWORD`, `USER_B_EMAIL`, `USER_B_PASSWORD`, `UNVERIFIED_EMAIL`, `UNVERIFIED_PASSWORD`, `BANNED_EMAIL`, `BANNED_PASSWORD`. Add `.env.test` to `.gitignore`.

---

## 3. Security and data (SEC)

| ID | Sev | Tag | Check |
|---|---|---|---|
| SEC-01 | P0 | AUTO | `whatsapp_number` / raw phone never appears in any API response, page source, DOM, or network tab (guest, user, admin) |
| SEC-02 | P0 | AUTO | `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` absent from the client bundle (`.next/static`) and page source |
| SEC-03 | P0 | AUTO | Direct anon-key query to `profiles` for `whatsapp_number` is denied |
| SEC-04 | P0 | AUTO | RLS enabled on all 6 tables, tested with real anon key and two user sessions (not SQL editor) |
| SEC-05 | P0 | AUTO | User B cannot edit, delete, or mark sold User A's listing (API and direct Supabase) |
| SEC-06 | P0 | AUTO | Regular user gets 403 on every `/api/admin/*` route |
| SEC-07 | P0 | AUTO | User cannot self-promote (`is_admin`) or unban (`is_banned`) via profile update |
| SEC-08 | P0 | AUTO | Unverified user cannot create a listing (DB-level block, not just UI) |
| SEC-09 | P0 | AUTO | Banned user cannot create a listing or reveal contact |
| SEC-10 | P0 | AUTO | 51st contact reveal in 24h returns 429 server-side even when the UI button is bypassed |
| SEC-11 | P0 | AUTO | Banned seller's listings absent from public Browse and search, still visible on own Dashboard |
| SEC-12 | P0 | AUTO | Duplicate report returns 409 with a friendly message |
| SEC-13 | P0 | AUTO | Guest can load Browse and Listing Detail (profiles revoke vs `listings_select_public` subquery) |
| SEC-14 | P0 | AUTO | `/api/cron/keepalive` returns 401 without `Bearer CRON_SECRET`, 200 with it |
| SEC-15 | P0 | AUTO | No raw Supabase, Resend, or stack-trace text reaches the UI on any forced error |
| SEC-16 | P0 | AUTO | Client-sent `status`, `seller_id`, `price`, `category_id` are validated (tamper test: POST with `status: "approved"` in manual mode, foreign `seller_id`, negative price, bad category) |
| SEC-17 | P0 | AUTO | Admin actions re-check `is_admin` server-side (call ban/promote/approve with a non-admin token) |
| SEC-18 | P0 | AUTO | `/api/contact` returns standard error shape and never leaks the Resend error |
| SEC-19 | P1 | AUTO | Security headers present (HSTS, X-Content-Type-Options, X-Frame-Options or CSP frame-ancestors, Referrer-Policy) |
| SEC-20 | P1 | AUTO | XSS test: title/description containing `<script>` and `"><img onerror>` render as text everywhere |
| SEC-21 | P1 | AUTO | Cloudinary upload preset rejects non-image files and files over the size cap |
| SEC-22 | P0 | MANUAL | All production env vars set in Vercel; nothing secret committed to GitHub (check git history too) |
| SEC-23 | P0 | MANUAL | Supabase email redirect URLs and Site URL point to the production domain |

---

## 4. Functional (FUN)

### Auth modal
| ID | Sev | Tag | Check |
|---|---|---|---|
| FUN-01 | P0 | AUTO | Modal opens from Contact Seller, Sell, Dashboard, Profile when logged out |
| FUN-02 | P0 | AUTO | Focus trapped (Tab / Shift+Tab cycle inside only) |
| FUN-03 | P0 | AUTO | Escape and backdrop click close the modal |
| FUN-04 | P0 | AUTO | Browser back closes the modal and stays on the underlying page |
| FUN-05 | P0 | AUTO | `returnTo` resumes the original action after login and after signup |
| FUN-06 | P0 | AUTO | Wrong password: inline error, modal stays open |
| FUN-07 | P0 | AUTO | `/login` and `/signup` return 404 |
| FUN-08 | P0 | AUTO | Signup with an existing email gives a clear message |
| FUN-09 | P0 | MANUAL | Verification email arrives, link lands on `/verify-email`, email is confirmed |
| FUN-10 | P1 | AUTO | Verify-email resend cooldown timer works; expired/used link shows a clear message |
| FUN-11 | P0 | AUTO | Logout works and protected pages re-gate |

### Listings
| ID | Sev | Tag | Check |
|---|---|---|---|
| FUN-12 | P0 | AUTO | Sell is a single form (no wizard); submit disabled until valid |
| FUN-13 | P0 | AUTO | 1 to 4 images enforced; 5th rejected; 0 images blocked |
| FUN-14 | P0 | AUTO | File over 5MB rejected client-side with no upload network call |
| FUN-15 | P1 | AUTO | Price field uses `inputmode="numeric"` |
| FUN-16 | P0 | AUTO | Auto mode: new listing live in Browse immediately |
| FUN-17 | P0 | AUTO | Manual mode: new listing shows "Under Review" and is not public |
| FUN-18 | P0 | AUTO | Edit pre-fills the form and keeps the status unchanged |
| FUN-19 | P0 | AUTO | Mark Sold: status becomes Sold and removed from Browse |
| FUN-20 | P0 | AUTO | Delete removes the listing (with confirm) |
| FUN-21 | P0 | AUTO | Dashboard tabs show Active, Sold, Under Review, Rejected correctly |
| FUN-22 | P0 | AUTO | Rejected card shows `rejection_reason` |
| FUN-23 | P0 | AUTO | Seller without a WhatsApp number can still list; Contact shows "Seller contact not available" |
| FUN-24 | P1 | AUTO | Slug is unique when two listings share the same title |

### Browse
| ID | Sev | Tag | Check |
|---|---|---|---|
| FUN-25 | P0 | AUTO | Search matches title and description |
| FUN-26 | P0 | AUTO | Category filter and condition filter work, alone and combined |
| FUN-27 | P0 | AUTO | Sort: Newest, Price low to high, Price high to low are correct; no "Most Viewed" |
| FUN-28 | P0 | AUTO | Pagination or infinite scroll loads more without duplicates |
| FUN-29 | P1 | AUTO | Filters and sort persist in the URL; a shared link reproduces the view; refresh and back keep state |
| FUN-30 | P0 | AUTO | Profile page loads and saves name, branch, year, WhatsApp number (E.164), with the "never shown publicly" note |

### Contact Seller
| ID | Sev | Tag | Check |
|---|---|---|---|
| FUN-31 | P0 | AUTO | Logged out: opens Auth Modal and resumes on success |
| FUN-32 | P0 | AUTO | Unverified: "Verify email to contact" |
| FUN-33 | P0 | AUTO | Verified under limit: `window.open` called with `https://wa.me/...` containing the listing title; one `contact_reveals` row written |
| FUN-34 | P0 | AUTO | Limit reached: "Daily limit reached. Try again tomorrow." and the button disabled |
| FUN-35 | P0 | AUTO | Users cannot contact their own listing, or it is handled sensibly |

### Other flows
| ID | Sev | Tag | Check |
|---|---|---|---|
| FUN-36 | P0 | AUTO | Report: reason dropdown, success state, duplicate blocked, listing stays live |
| FUN-37 | P0 | AUTO | Admin: approval-mode toggle affects new listings only |
| FUN-38 | P0 | AUTO | Admin: approve and reject (reason required, persisted) |
| FUN-39 | P0 | AUTO | Admin: report Remove sets listing rejected; Dismiss leaves it untouched |
| FUN-40 | P0 | AUTO | Admin: ban, unban, promote all work with a confirm step |
| FUN-41 | P0 | AUTO | Non-admin is redirected or blocked from `/admin/*` |
| FUN-42 | P0 | AUTO | Contact Us: success state, field-level validation, failure state (Resend mocked to fail) |
| FUN-43 | P0 | AUTO | Our Story, How It Works, Contact Us load without auth |
| FUN-44 | P0 | AUTO | Seller identity is first name only everywhere (cards, detail, dashboard views of others) |
| FUN-45 | P1 | AUTO | Listing views counter increments once per visit and never blocks the page if it fails |

---

## 5. UI and visual consistency (UI)

| ID | Sev | Tag | Check |
|---|---|---|---|
| UI-01 | P0 | AUTO | `#15803D` (contact green) used only on the Contact Seller button |
| UI-02 | P0 | AUTO | No gradients, glassmorphism, or neumorphism anywhere |
| UI-03 | P0 | AUTO | No seller avatar, branch/year, star ratings, verified badges, heart/wishlist icons, drawers, or fabricated WhatsApp mockups |
| UI-04 | P0 | AUTO | No ".edu-only" or college-restriction wording anywhere |
| UI-05 | P0 | AUTO | Outfit for headings and Work Sans for body actually load (computed styles), with no fallback flash |
| UI-06 | P1 | AUTO | No text smaller than 12px; body at least 16px |
| UI-07 | P0 | AUTO | Buttons: primary, destructive, ghost consistent; hover, focus, active, disabled states exist |
| UI-08 | P1 | AUTO | Hover transitions 150 to 300ms, no instant state changes |
| UI-09 | P0 | AUTO | Listing cards are equal height in the grid; 1 to 2 line title truncation; long titles and big prices do not break layout |
| UI-10 | P0 | AUTO | Images keep aspect ratio (no stretch), have `alt`, and show a placeholder when the image fails |
| UI-11 | P1 | AUTO | All icons are SVG with consistent size; no emoji as functional icons |
| UI-12 | P0 | AUTO | Status badges match the design table and always include a text label |
| UI-13 | P0 | AUTO | Home page: section order and storytelling per redesign, no excessive empty whitespace, no lorem ipsum or placeholder blocks |
| UI-14 | P1 | AUTO | Consistent page max-width, section spacing, and card padding |
| UI-15 | P0 | AUTO | Active nav item visibly highlighted |
| UI-16 | P1 | MANUAL | Human eyeball review of every visual baseline screenshot for taste and polish |

---

## 6. Links and navigation (LNK)

| ID | Sev | Tag | Check |
|---|---|---|---|
| LNK-01 | P0 | AUTO | Every TopNav and BottomNav link resolves (Browse, Sell, Our Story, How It Works, Contact Us, Sign In, Dashboard, Profile) |
| LNK-02 | P0 | AUTO | Every footer link resolves (Privacy, Terms, Safety, socials); external links use `target="_blank"` with `rel="noopener noreferrer"` |
| LNK-03 | P0 | AUTO | Every in-page CTA works (hero buttons, sample listing cards, cross-links between static pages) |
| LNK-04 | P0 | AUTO | Zero `href="#"` or empty `href` on rendered pages |
| LNK-05 | P0 | AUTO | Crawl all `a[href]` on every page as guest, USER_A, and ADMIN: none return 4xx/5xx (internal) |
| LNK-06 | P0 | AUTO | Listing card to Listing Detail works for every seeded slug; a bad slug shows the custom 404 |
| LNK-07 | P0 | AUTO | `/sell`, `/dashboard`, `/profile` as a guest open the Auth Modal with the correct `returnTo` |
| LNK-08 | P0 | AUTO | `/verify-email` handles valid, expired, and used links |
| LNK-09 | P1 | AUTO | Trailing-slash and case variants do not produce duplicate or broken pages |
| LNK-10 | P1 | AUTO | External links (Instagram, mailto) respond; `mailto:` addresses are correct |
| LNK-11 | P1 | AUTO | Back, forward, and refresh behave on Browse with filters applied |

---

## 7. Favicon, metadata, sharing (META)

| ID | Sev | Tag | Check |
|---|---|---|---|
| META-01 | P0 | AUTO | Favicon request returns 200 and a link tag is present |
| META-02 | P1 | AUTO | Apple touch icon (180x180) present |
| META-03 | P1 | AUTO | Web manifest valid with 192/512 icons |
| META-04 | P0 | AUTO | Unique non-default `<title>` per page; none say "Create Next App" |
| META-05 | P0 | AUTO | Meta description on every public page; unique on listings |
| META-06 | P0 | AUTO | `og:title`, `og:description`, `og:image`, `og:url` on Home and Listing Detail; listing OG image is the first listing image and loads |
| META-07 | P1 | AUTO | Twitter card tags present |
| META-08 | P1 | AUTO | `theme-color` meta set |
| META-09 | P0 | AUTO | `robots.txt` exists and disallows `/admin`, `/api`, `/dashboard`, `/sell`, `/profile` |
| META-10 | P1 | AUTO | `sitemap.xml` exists and lists public routes |
| META-11 | P0 | AUTO | `<html lang="en">` set |
| META-12 | P1 | AUTO | Canonical URLs set, especially Browse with query params |
| META-13 | P0 | AUTO | Custom 404 and 500 pages match the design system and link back to Browse |
| META-14 | P0 | MANUAL | Paste a listing link into WhatsApp and an Instagram DM; the preview shows correctly |

---

## 8. States and edge cases (STA)

| ID | Sev | Tag | Check |
|---|---|---|---|
| STA-01 | P0 | AUTO | Loading states (skeleton or spinner) on Browse, Listing Detail, Dashboard, Admin; no blank white flash |
| STA-02 | P0 | AUTO | Empty states give direction: empty Browse after filters, each Dashboard section, no reports, no users found |
| STA-03 | P0 | AUTO | Network failure on Browse, failed image upload, failed listing post, failed form submit all show plain-language errors |
| STA-04 | P0 | AUTO | Double-click on Sell, Contact Us, Sign Up creates no duplicates; the button disables with progress |
| STA-05 | P0 | AUTO | Inline field errors next to fields; visible labels (never placeholder-only); WhatsApp format helper text |
| STA-06 | P1 | AUTO | Odd content: 100-char title, 1000-char description, non-English text, price 0, very large price, one-word names |
| STA-07 | P1 | AUTO | Slow 3G throttle: nothing breaks or looks frozen |
| STA-08 | P1 | AUTO | Offline or API failing (mock with `page.route`): message shown, not a white screen |
| STA-09 | P1 | AUTO | Session expiry mid-Sell fails gracefully, form data not lost silently |
| STA-10 | P0 | AUTO | Error and success messages follow rules.md section 7.3 tone |

---

## 9. Responsive and devices (RSP)

Run every public and account page on all 8 Playwright projects (Chrome 1440, Chrome 1024, Safari desktop, iPad 768, iPhone SE 375, iPhone 14, Pixel 7, 360px Android).

| ID | Sev | Tag | Check |
|---|---|---|---|
| RSP-01 | P0 | AUTO | No horizontal overflow at any project (`scrollWidth <= clientWidth`) except intentional galleries |
| RSP-02 | P0 | AUTO | Touch targets at least 44x44px with at least 8px spacing |
| RSP-03 | P0 | AUTO | 375px: nothing cut off or overlapping on any page |
| RSP-04 | P0 | AUTO | Bottom nav does not cover content or the last card; honors the safe-area inset |
| RSP-05 | P0 | AUTO | Sticky Browse bar does not hide content |
| RSP-06 | P0 | AUTO | Auth Modal scrolls when taller than the viewport; Sign Up usable at 375x667 |
| RSP-07 | P1 | AUTO | Image gallery swipes on touch without scrolling the page |
| RSP-08 | P1 | AUTO | Landscape phone orientation does not break layout |
| RSP-09 | P1 | AUTO | 1440px and wider: content has a max width, no stretched or empty columns |
| RSP-10 | P1 | AUTO | Browser zoom 200% still usable |
| RSP-11 | P1 | AUTO | `prefers-color-scheme: dark` emulation does not produce unreadable text |
| RSP-12 | P0 | AUTO | Chrome and WebKit produce the same functional results for every spec (list any differences) |
| RSP-13 | P0 | MANUAL | Real iPhone Safari: keyboard overlap, address-bar resize, 100vh, camera/photo upload with a large photo |
| RSP-14 | P0 | MANUAL | Real Android Chrome: same checks |
| RSP-15 | P1 | MANUAL | Real iPad Safari spot check |

---

## 10. Accessibility (A11Y)

| ID | Sev | Tag | Check |
|---|---|---|---|
| A11Y-01 | P0 | AUTO | axe: zero serious or critical violations on every page, every project |
| A11Y-02 | P0 | AUTO | Keyboard-only run completes browse, sign up, post, and contact; visible focus ring everywhere |
| A11Y-03 | P0 | AUTO | Modal: `role="dialog"`, `aria-modal`, accessible name, focus returns to the trigger on close |
| A11Y-04 | P0 | AUTO | One `h1` per page and no skipped heading levels |
| A11Y-05 | P0 | AUTO | Form fields have labels; errors announced via `role="alert"` or `aria-live` |
| A11Y-06 | P0 | AUTO | Text contrast at least 4.5:1; color is never the only status signal |
| A11Y-07 | P0 | AUTO | Icon-only buttons have `aria-label`; decorative icons `aria-hidden` |
| A11Y-08 | P1 | AUTO | Skip-to-content link present |
| A11Y-09 | P1 | AUTO | `prefers-reduced-motion` respected |
| A11Y-10 | P1 | MANUAL | VoiceOver pass on Home and Listing Detail (iPhone) |

---

## 11. Content and copy (CPY)

| ID | Sev | Tag | Check |
|---|---|---|---|
| CPY-01 | P0 | AUTO | No "lorem", "TODO", "test", "asdf", "placeholder", "Create Next App" in rendered pages or seeded data |
| CPY-02 | P1 | AUTO | Spell-check every page's visible text; report suspected typos |
| CPY-03 | P0 | AUTO | "Contact Seller" and "Contact Us" never confused; "Under Review" wording consistent |
| CPY-04 | P0 | AUTO | No fabricated claims: invented testimonials, user counts, verified badges |
| CPY-05 | P1 | AUTO | Prices consistently formatted as ₹ with correct separators; dates formatted consistently |
| CPY-06 | P0 | MANUAL | Founder details real and correct (support email, Instagram handle, Our Story narrative) |
| CPY-07 | P0 | MANUAL | Legal pages (Privacy, Terms, Safety) read and approved by the founder |
| CPY-08 | P0 | MANUAL | Production DB has no test accounts, dummy listings, or dummy reports |

---

## 12. Code scans, performance, infrastructure, human-only

### CODE (read-only scans, report file:line)
| ID | Sev | Check |
|---|---|---|
| CODE-01 | P0 | No import of `lib/supabase/admin.ts` from any Client Component or file with `"use client"` |
| CODE-02 | P0 | No `NEXT_PUBLIC_` variable holds a secret |
| CODE-03 | P0 | No `.env*` file committed; no keys in git history |
| CODE-04 | P0 | `whatsapp_number` is selected only in `/api/listings/[id]/contact` (and the user's own profile route) |
| CODE-05 | P0 | No `full_name` rendered outside `firstName()` on listing-facing surfaces; no `branch`/`year` outside own Profile |
| CODE-06 | P0 | No `app/login` or `app/signup` route |
| CODE-07 | P1 | No hard-coded hex colors outside tokens in `tailwind.config.ts`; no inline `style={{}}` except dynamic values |
| CODE-08 | P1 | No `any` in auth, contact, admin, rate-limit code; `strict: true` on |
| CODE-09 | P1 | No empty `catch {}` blocks |
| CODE-10 | P1 | `types/database.ts` matches the current schema (regenerate and diff) |
| CODE-11 | P1 | No `console.log` of user data in production paths |
| CODE-12 | P0 | `npm run build` and `npm run lint` and `tsc --noEmit` all pass with zero errors |

### PERF (Lighthouse, mobile and desktop: Home, Browse, Listing Detail)
| ID | Sev | Target |
|---|---|---|
| PERF-01 | P1 | LCP under 2.5s (mobile) |
| PERF-02 | P1 | CLS under 0.1 |
| PERF-03 | P1 | INP under 200ms |
| PERF-04 | P1 | Lighthouse Accessibility at least 95, SEO at least 95, Best Practices at least 90 |
| PERF-05 | P1 | Cloudinary images delivered with `f_auto,q_auto` and sized appropriately |

### INF (infrastructure, mostly human)
| ID | Sev | Tag | Check |
|---|---|---|---|
| INF-01 | P0 | MANUAL | Vercel cron has fired at least once in production |
| INF-02 | P0 | MANUAL | Supabase production project on correct settings; backup or export taken |
| INF-03 | P0 | MANUAL | Resend sender domain verified; a real contact-form email lands in the inbox, not spam |
| INF-04 | P1 | MANUAL | Cloudinary preset locked to `unideal/listings` and size cap; usage dashboard checked |
| INF-05 | P1 | MANUAL | Vercel logs, Supabase logs, and an uptime monitor set up and someone is watching them |
| INF-06 | P0 | MANUAL | Everything pushed to GitHub, launch commit tagged, `progress.md` current |
| INF-07 | P0 | MANUAL | Rollback plan known: revert to the previous Vercel deployment |
| INF-08 | P0 | MANUAL | Custom domain and HTTPS working; `www` and non-`www` redirect correctly |

### MAN (final human walkthrough, 20 minutes on your own phone)
| ID | Sev | Check |
|---|---|---|
| MAN-01 | P0 | Open the link from an Instagram DM; the preview looks right |
| MAN-02 | P0 | Home explains itself within 5 seconds |
| MAN-03 | P0 | Browse, open a listing, tap Contact Seller; WhatsApp opens with the right message |
| MAN-04 | P0 | Sign up with a fresh email; the verification email looks and reads well |
| MAN-05 | P0 | Post a listing with photos taken on the phone itself (large files, orientation) |
| MAN-06 | P1 | Open the same listing on another browser and device |
| MAN-07 | P0 | A friend who has never seen UniDeal finds an item and contacts a seller unaided; note where they hesitate |

---

## 13. Launch-day sequence

1. Freeze code, push, tag.
2. Run the §1 prompt against the production build on staging. Verdict must be **GO** or **GO WITH KNOWN ISSUES**.
3. Complete every item in `reports/<ts>/needs-human.md`.
4. Create the production admin account and promote only yourself.
5. Seed 10 to 15 real listings from your 50+ warm users so Browse is not empty.
6. Smoke-test the live domain: sign up, verify, post, contact.
7. Soft-launch to warm users, watch logs for 24 to 48 hours, then announce on Instagram.

---

## 14. Sign-off

| Item | Value |
|---|---|
| Report folder | `reports/____________` |
| Verdict | GO / GO WITH KNOWN ISSUES / NO-GO |
| P0 failures open | ____ |
| P1 failures logged | ____ |
| Needs-human items done | ____ / ____ |
| Signed off by / date | ____________ |