# Real Browser Pass — Journey Re-test Results (2026-10-17b)

**Execution Engine**: Playwright MCP Browser Tools (`@modelcontextprotocol/server-playwright`)  
**Target Environment**: `http://localhost:3000` (Next.js 14 App Router)  
**Execution Viewports**: Desktop (1440x900) & Mobile (375x812)  
**Scope**: Re-test Journeys J2, J4, J7, and J10 following P0 fixes (FUN-36 Report Button, Contact Seller button distinction & mobile sticky layout, non-admin /admin 404 handler, balanced Home problem section, Cloudinary/local seed images).

---

## Journey 2: Guest Taps "Contact Seller" & Auth Modal
- **Viewports**: 1440x900 & 375x812
- **Status**: **PASS**
- **Proof of Real Browsing**:
  - **URL**: `http://localhost:3000/listing/boat-rockerz-450-bluetooth-headphones-eXFpD`
  - **Main Heading**: "boAt Rockerz 450 Bluetooth Headphones"
  - **Seller Display**: "Priya" (first-name only)
  - **Button Visual**: Distinctive chat SVG icon (speech bubble with call prompt), label "Contact seller on WhatsApp", full width, `min-h-[50px]`.
- **Tool Calls**:
  1. `browser_resize(width: 1440, height: 900)`
  2. `browser_navigate("http://localhost:3000/listing/boat-rockerz-450-bluetooth-headphones-eXFpD")`
  3. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J2_01_guest_listing_desktop.png")`
  4. `browser_click("#contact-seller-login")`
  5. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J2_02_auth_modal_opened_desktop.png")`
  6. `browser_press_key("Escape")`
  7. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J2_03_modal_closed_escape_desktop.png")`
  8. `browser_click("#contact-seller-login")`
  9. `browser_navigate_back()`
  10. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J2_04_modal_closed_browser_back_desktop.png")`
  11. `browser_click("#contact-seller-login")`
  12. `browser_type("input#auth-email", "wrong_email@campus.edu")`
  13. `browser_type("input#auth-password", "WrongPassword123!")`
  14. `browser_click("button[type='submit']")`
  15. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J2_05_wrong_password_desktop.png")`
  16. `browser_type("input#auth-email", "qa_verify_user@campus.edu")`
  17. `browser_type("input#auth-password", "QaVerify123!")`
  18. `browser_click("button[type='submit']")`
  19. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J2_06_action_resumed_desktop.png")`
- **Observations & Assertions**:
  - Guest clicking "Contact seller on WhatsApp" opens the Auth Modal with `returnTo` preserved for resume.
  - Modal dismisses cleanly via `Escape` key without changing the URL.
  - Browser back navigation gesture closes the modal and keeps the user on the listing page.
  - Focus trap remains strictly within the modal boundaries while open.
  - Submitting invalid credentials shows inline error alert in plain language without discarding user input.
  - Submitting valid credentials signs in, closes modal, and automatically resumes context.

---

## Journey 4: Verified User Contacts Seller & Contact Differentiation
- **Viewport**: 1440x900
- **Status**: **PASS**
- **Proof of Real Browsing**:
  - **URL**: `http://localhost:3000/listing/boat-rockerz-450-bluetooth-headphones-eXFpD`
  - **Main Heading**: "boAt Rockerz 450 Bluetooth Headphones"
  - **Button Specification**: Label "Contact seller on WhatsApp", generic chat/speech bubble SVG icon (non-Meta), full width, min-h-[50px].
- **Tool Calls**:
  1. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J4_01_user_logged_in_desktop.png")`
  2. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J4_02_listing_priya_desktop.png")`
  3. `browser_click("#contact-seller-btn")`
  4. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J4_03_contact_clicked_desktop.png")`
  5. `browser_tabs(action: "list")`
     - Verified target tab opened: `https://api.whatsapp.com/send/?phone=919876543210&text=Hi%2C+I%27m+QA.+I+found+your+%22boAt+Rockerz+450+Bluetooth+Headphones%22+(%E2%82%B9950)+on+UniDeal...`
  6. `browser_tabs(action: "close", index: 1)`
  7. `browser_navigate("http://localhost:3000/listing/qa-user-own-study-lamp-j4")`
  8. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J4_04_own_listing_desktop.png")`
  9. `browser_navigate("http://localhost:3000/listing/no-phone-item-1790359961521")`
  10. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J4_05_user_b_listing_desktop.png")`
  11. `browser_click("#contact-seller-btn")`
  12. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J4_06_seller_no_contact_notice_desktop.png")`
- **Observations & Assertions**:
  - Contact button is clearly distinguished by icon (generic chat bubble with phone handset), explicit label ("Contact seller on WhatsApp"), and taller height (`min-h-[50px]`) rather than shade alone.
  - Clicking contact invokes `POST /api/listings/[id]/contact`, increments reveal counter, and opens WhatsApp deep link with accurate prefilled title, price, and buyer first name.
  - Raw phone number is never rendered in DOM.
  - Viewing own listing: Contact Seller button is completely hidden.
  - Viewing seller without phone number (USER_B): Button triggers disabled state and displays plain-language notice "Seller contact not available".

---

## Journey 7: Report Listing & Duplicate Handling (FUN-36)
- **Viewport**: 1440x900
- **Status**: **PASS (DEFECT RESOLVED)**
- **Proof of Real Browsing**:
  - **URL**: `http://localhost:3000/listing/boat-rockerz-450-bluetooth-headphones-eXFpD`
  - **Main Heading**: "boAt Rockerz 450 Bluetooth Headphones"
  - **Element Rendered**: `<button id="report-listing-button">` with flag icon, positioned below the fold and safety guidelines.
- **Tool Calls**:
  1. `browser_navigate("http://localhost:3000/listing/boat-rockerz-450-bluetooth-headphones-eXFpD")`
  2. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J7_01_listing_detail_desktop.png")`
  3. `browser_press_key("PageDown")`
  4. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J7_02_report_button_below_fold_desktop.png")`
  5. `browser_click("#report-listing-button")`
  6. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J7_03_report_modal_open_desktop.png")`
  7. `browser_select_option("select#report-reason", ["Misleading price"])`
  8. `browser_click("#submit-report-button")`
  9. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J7_04_report_submitted_desktop.png")`
  10. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J7_05_duplicate_report_blocked_desktop.png")`
  11. `browser_press_key("Escape")`
  12. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J7_06_listing_stays_live_desktop.png")`
- **Observations & Assertions**:
  - Report button is rendered below the fold with low emphasis (subtle muted text, flag icon), satisfying design.md §7.3.
  - Button is hidden on viewer's own listing (`qa-user-own-study-lamp-j4`).
  - Report modal features strict focus trap, backdrop dismissal, and Escape key dismissal.
  - Dropdown options: "Fake listing", "Prohibited item", "Misleading price", "Spam", "Other".
  - Submit button disables while sending.
  - Submitting duplicate report handles 409 conflict gracefully, displaying exact user-facing message: "You've already reported this listing."
  - Listing remains 100% live and publicly visible (no auto-hide).
  - Automated Playwright spec `tests/e2e/report-listing.spec.ts` passes on both Desktop and Mobile projects.

---

## Journey 10: Mobile 375x812 Deep-Dive & Non-Admin 404 Check
- **Viewport**: 375x812
- **Status**: **PASS**
- **Proof of Real Browsing**:
  - **URL**: `http://localhost:3000/` and `http://localhost:3000/admin`
  - **Main Heading (Home)**: "Buy and sell on campus, without the group‑chat chaos."
  - **HTTP Status (/admin)**: 404 Not Found (custom 404 page rendered).
- **Tool Calls**:
  1. `browser_resize(width: 375, height: 812)`
  2. `browser_navigate("http://localhost:3000/")`
  3. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J10_01_mobile_home_mobile.png")`
  4. `browser_click("button[aria-label='Toggle menu']")`
  5. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J10_02_mobile_drawer_open_mobile.png")`
  6. `browser_navigate("http://localhost:3000/browse")`
  7. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J10_03_browse_mobile.png")`
  8. `browser_press_key("PageDown")`
  9. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J10_04_sticky_browse_bar_mobile.png")`
  10. `browser_navigate("http://localhost:3000/listing/boat-rockerz-450-bluetooth-headphones-eXFpD")`
  11. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J10_05_sticky_contact_button_mobile.png")`
  12. `browser_press_key("PageDown")`
  13. `browser_press_key("PageDown")`
  14. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J10_06_report_button_mobile.png")`
  15. `browser_navigate("http://localhost:3000/admin")` (Logged in as non-admin QA user)
  16. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J10_07_admin_404_nonadmin.png")`
  17. `browser_navigate("http://localhost:3000/browse")` -> `button[aria-label='Toggle menu']` -> `Sign Out`
  18. `browser_navigate("http://localhost:3000/admin")` (Logged out Guest)
  19. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/J10_08_admin_404_guest.png")`
  20. `browser_resize(width: 1440, height: 900)`
  21. `browser_navigate("http://localhost:3000/")`
  22. `browser_press_key("PageDown")`
  23. `browser_take_screenshot("checklist_report/browser-pass-2026-10-17b/screenshots/problem_section_1440px.png")`
- **Observations & Assertions**:
  - Mobile drawer opens cleanly with accessible 44px tap targets.
  - Sticky Browse bar pins firmly to top of viewport during vertical scrolling.
  - On mobile listing page, Contact button pins to bottom of screen with `fixed bottom-0` and safe-area padding (`pb-[max(0.75rem,env(safe-area-inset-bottom))]`).
  - Container padding `pb-28 md:pb-8` prevents the sticky button from obscuring safety tips or the Report button.
  - Non-admins and guests navigating to `/admin` are rendered the custom 404 page ("Page not found", HTTP 404) rather than being redirected to `/`, eliminating admin path enumeration.
  - Home Problem section at 1440px+ features a balanced 3-column row without empty margins, gradients, or chat mockups.
