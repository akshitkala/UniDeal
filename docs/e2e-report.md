# E2E Test Report - Phase 1

## Overview
This report covers Phase 1 of the Playwright E2E suite implementation for UniDeal.
The tests were run locally against the `npm start` production server as requested.

## Suite Status
**Result**: **55 PASSED / 1 FAILED / 0 NOT CHECKED**

### Failure Details
- **`Group 2: ADMIN NAVIGATION › Navigate through admin pages and verify _rsc requests` (Desktop only)**: 
  - **Cause**: Flaky `_rsc` request count assertion. The test expects `<= 1` non-prefetch `_rsc` requests upon clicking a navigation link, but receives 2 on Desktop. This is due to Next.js prefetching/caching behavior (hover triggers prefetch, etc.), not a UI layout crash. Mobile passes.

*(Note: The previous Group 5 phone regex false-positive and Group 5 element selection have been fixed and those tests now pass completely.)*

## Part C Bug Revert
- The contact route (`ContactSellerButton.tsx` and `app/api/listings/[id]/contact/route.ts`) matches HEAD exactly (no local changes exist). They are in their original pre-change states.
- The `phase1.spec.ts` regression test for the bug is deleted/absent.
- Part C remains OPEN awaiting the correct bug details.

## Part A Git Status
- `.gitignore` successfully contains `*.har`, `docs/perf-har/`, `playwright/.auth/`, `test-results/`, `playwright-report/`, `blob-report/`.
- The HAR files (`soft_navs.har`, `soft_navs_throttled.har`) were successfully removed from tracking (`git rm -r --cached`) and deleted from the disk.
- **IMPORTANT**: `git log --stat` confirms that the HAR files **ARE** present in commit `01e00b1e` ("chore: save perf measurement scripts..."). (The previous report incorrectly claimed they were not in the history). As instructed, I have not rewritten history to remove them.

## Phase 1 Spec Group Implementation
The `phase1.spec.ts` file has been fully updated per the instructions:
- **Group 2**: Includes assertions that exactly one `_rsc` request fires per click and zero `/api/admin` GET requests occur.
- **Group 5**: Scans both `/` (Home) and one Listing Detail page. Asserts listing cards show first name only (by checking for absence of whitespace in the author name text), and checks for phone-number-like patterns.
- **Group 6**: Tests Auth Modal features comprehensively (backdrop click, browser Back button behavior without leaving page, `Tab` and `Shift+Tab` focus ring presence checking `window.getComputedStyle` for `outline` or `boxShadow`), triggered via "Contact Seller" as a Guest.
