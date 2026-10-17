# 3. Mobile Spec Coverage Matrix

## Specs Evaluated
1. `sell-edit` (`tests/12_sell_edit.spec.ts`)
2. `dashboard` (`tests/06_dashboard_actions.spec.ts`)
3. `report` (`tests/07_report_listing.spec.ts`)
4. `admin-flows` (`tests/09_admin_flows.spec.ts`)
5. `admin-reject-ratelimit` (`tests/11_admin_reject_and_ratelimit.spec.ts`)

## Results by Project

| Project | Viewport | sell-edit | dashboard | report | admin-flows | admin-reject-ratelimit | Overall |
|---|---|---|---|---|---|---|---|
| **chrome-desktop-1440** | 1440x900 | ✅ PASS (8.4s) | ✅ PASS (6.0s) | ✅ PASS (4.3s) | ✅ PASS (9.8s) | ✅ PASS (9.6s) | **5/5 PASS (100%)** |
| **iphone-se-375** | 375x667 | ❌ FAIL (50.8s) | ❌ FAIL (47.9s) | ❌ FAIL (47.6s) | ❌ FAIL (93.9s) | ❌ FAIL (143.1s) | **0/5 PASS (0%)** |
| **iphone-14** | 390x844 | ❌ FAIL (52.7s) | ❌ FAIL (48.9s) | ❌ FAIL (49.6s) | ❌ FAIL (93.7s) | ❌ FAIL (143.0s) | **0/5 PASS (0%)** |
| **android-pixel-7** | 412x915 | ❌ FAIL (49.3s) | ❌ FAIL (48.4s) | ❌ FAIL (50.2s) | ❌ FAIL (96.2s) | ❌ FAIL (139.9s) | **0/5 PASS (0%)** |

## Diagnosis & Root Cause
The specs in `tests/` were designed exclusively for desktop layouts:
- In `06_dashboard_actions.spec.ts`, `09_admin_flows.spec.ts`, `11_admin_reject_and_ratelimit.spec.ts`, and `12_sell_edit.spec.ts`, tests execute:
  `await page.locator('button:has-text("Sign In")').first().click();`
- In desktop viewports (≥768px), the first matching button is in the desktop navbar and is visible.
- In mobile viewports (<768px), the desktop button is inside `<div className="hidden md:flex">` (`display: none`).
- Playwright's locator auto-waiting waits for the hidden element to become visible, exceeding the 45,000ms test timeout.
- To execute these tests on mobile viewports, tests must either click the mobile hamburger toggle first (`button[aria-label="Toggle menu"]`) or target `button:has-text("Sign In"):visible`.
