# Real Browser Pass — Visual Issues & UI Observations (2026-10-17)

This document details all visual, layout, and UX discrepancies identified during the Playwright MCP real-browser pass across Desktop (1440x900) and Mobile (375x812) viewports.

---

## 1. Missing "Report Listing" Button on Listing Detail Page
- **Checklist ID**: `FUN-36`, `UI-04`
- **Severity**: High (Functional & UX Inconsistency)
- **Screenshot**: `screenshots/J7_03_missing_report_button_desktop.png`
- **Observed Behavior**:
  - The listing detail page (`/listing/[slug]`) completely lacks any button, link, or dropdown to report a listing.
  - Meanwhile, the Contact Us page (`/contact`) states: *"Reporting a listing? Use the Report button at the bottom of the listing page, so it goes straight to a moderator."*
  - The Home page safety section states: *"Every listing has a report button, and every report is reviewed by a person."*
  - In reality, the DOM contains only "Back to Browse", image gallery, price/details card, trust box, "Contact Seller on WhatsApp", and "About This Item". No report option exists for students to flag spam, prohibited items, or abuse.

---

## 2. Primary Green Button vs. Contact Seller Button Visual Discrepancy
- **Checklist ID**: `UI-01`, `UI-06`
- **Severity**: Medium (Visual Branding & Semantic Distinction)
- **Screenshots**: `screenshots/J1_08_listing_detail_desktop.png`, `screenshots/J4_03_contact_clicked_desktop.png`
- **Measured Values**:
  - **Primary Action ("Sell Item")**: `background-color: rgb(22, 101, 52)` (`#166534`, Emerald-800)
  - **Contact Seller Button ("Contact Seller on WhatsApp")**: `background-color: rgb(20, 83, 45)` (`#14532D`, Green-900)
- **Observed Behavior**:
  - Per spec rules (`rules_v1.1.md` §2 and `design (2).md`), `#15803D` was reserved strictly for the Contact Seller button to distinguish the external WhatsApp handoff from regular application CTAs.
  - In practice, both buttons now render in nearly identical dark green shades (`rgb(22, 101, 52)` vs `rgb(20, 83, 45)`).
  - Side-by-side, they look virtually indistinguishable in hue and luminance, confusing the visual hierarchy between an internal app action and a third-party WhatsApp redirect.

---

## 3. Broken External Images via Chromium ORB (Opaque Response Blocking)
- **Checklist ID**: `STA-02`, `UI-02`
- **Severity**: Medium
- **Screenshots**: `screenshots/J7_01_browse_listings_desktop.png`
- **Observed Behavior**:
  - Several seeded dummy listings use external Unsplash image URLs (`https://images.unsplash.com/...`).
  - Chromium blocked these requests with `net::ERR_BLOCKED_BY_ORB` or 404, resulting in broken image icons or blank cards in the Browse grid until a fallback placeholder takes over.
  - All listing photos should ideally be served via Cloudinary or local assets to prevent third-party CORS/ORB blocking.

---

## 4. Home Problem Section Layout Review (Post-Chat Mockup Removal)
- **Checklist ID**: `UI-05`, `RSP-01`
- **Severity**: Low / Cosmetic
- **Screenshots**: `screenshots/J1_02_home_problem_desktop.png`, `screenshots/J1_02_home_problem_mobile.png`, `screenshots/J1_02_home_problem_section_inspect.png`
- **Observed Behavior**:
  - Following the removal of the simulated phone chat mockup, the Problem section features a sticky headline ("WhatsApp groups weren't built for this.") on the left, paired with 3 problem statement cards on the right ("Messages get buried", "Zero buyer trust", "Zero search").
  - On Desktop (1440x900): Spacing is balanced, and typography reads cleanly. However, on screens wider than 1440px, the right-hand stack leaves a slight vertical asymmetry below the sticky left block.
  - On Mobile (375x812): Stacks vertically with generous 20px padding and legible line-height.

---

## 5. Sticky Browse Search Bar Pinned Behavior
- **Checklist ID**: `RSP-03`, `UI-09`
- **Severity**: Informational / Verified Clean
- **Screenshots**: `screenshots/J10_05_sticky_browse_bar_mobile.png`
- **Observed Behavior**:
  - On mobile 375x812, the search bar and filter button container stays securely docked at `top: 0` during rapid touch scrolling (`scrollY > 700px`), preventing layout jumping while allowing instant query adjustments.
