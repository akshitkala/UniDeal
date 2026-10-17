# Real Browser Pass — Console & Network Errors Log (2026-10-17)

This log summarizes all console errors, warnings, and failed HTTP requests (4xx/5xx/network errors) captured across all 11 user journeys during the real-browser verification run.

---

## Summary Table

| Journey | Console Errors | Console Warnings | Failed Requests (4xx / 5xx / Network) | Notes |
|---|:---:|:---:|:---:|---|
| **J0** Layout-Shift Check | 0 | 0 | 0 | Zero errors on desktop & mobile |
| **J1** Guest First Visit | 0 | 0 | 0 | Clean navigation and filtering |
| **J2** Contact Seller & Auth | 0 | 0 | 0 | Clean modal interaction and login |
| **J3** Sign Up (Throwaway) | 0 | 0 | 0 | Clean registration submission |
| **J4** Verified Contact Seller | 0 | 0 | 0 | WhatsApp redirect tab clean |
| **J5** Sell Flow | 0 | 0 | 0 | Photo limits & size checks clean |
| **J6** Seller Dashboard | 0 | 0 | 0 | All tabs and badges clean |
| **J7** Report Listing | 0 | 0 | 2 | 2 Unsplash images blocked by ORB |
| **J8** Admin Console | 0 | 0 | 0 | Moderation & ban flows clean |
| **J9** Static Pages & 404 | 1 | 0 | 1 | Expected 404 for test route |
| **J10** Mobile Deep-Dive | 0 | 0 | 0 | Clean mobile interactions |

---

## Detailed Error Details

### Journey 7: External Dummy Image Loading
- **Request 1**:
  - **URL**: `https://images.unsplash.com/photo-1544698247-c36e47c7f2af?w=600&q=80`
  - **Status**: `[FAILED] net::ERR_BLOCKED_BY_ORB`
  - **Cause**: Chromium Opaque Response Blocking (ORB) on hotlinked Unsplash photo.
- **Request 2**:
  - **URL**: `https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80`
  - **Status**: `[FAILED] net::ERR_BLOCKED_BY_ORB`
  - **Cause**: Chromium Opaque Response Blocking (ORB) on hotlinked Unsplash photo.

### Journey 9: 404 Made-Up Route Verification
- **Request**:
  - **URL**: `http://localhost:3000/this-page-does-not-exist-404-test`
  - **Status**: `[404] Not Found`
  - **Console Output**: `[ERROR] Failed to load resource: the server responded with a status of 404 (Not Found)`
  - **Assessment**: Expected and verified correct response behavior for undefined URLs.
