# UniDeal Master Regression & Pre-Launch Audit — SUMMARY.md

| Field | Value |
|---|---|
| Project | UniDeal Campus Marketplace |
| Target URL | `http://localhost:3000` (Production Clean Build `npm run build && npm run start`) |
| Audit Date | October 17, 2026 |
| QA Suite | Playwright 8-Project Device Matrix (592 Executions) + MCP Browser Pass (J0-J10) |
| Final Verdict | **NO-GO** |
| Total Checklist Items | **184 items** |

---

## 1. Launch Gate Verdict

> ### 🛑 VERDICT: **NO-GO**
> 
> **Decision Rule**: Per `checklist.md` §1 & Prompt: *"Statuses: PASS (with evidence source), FAIL, UNTESTED, NEEDS-HUMAN. Any P0 FAIL or UNTESTED = NO-GO."*
> 
> **Verdict Rationale**: 1 P0 checklist item(s) failed in automated testing: A11Y-01.

### Four Status Counts (Rebuilt Strictly from Playwright JSON Output)

| Status | Count | Percentage | Definition |
|---|---|---|---|
| **PASS** | **64** | 34.8% | Verified with passing automated Playwright tests across 8 projects |
| **FAIL** | **1** | 0.5% | Failed automated Playwright test execution |
| **UNTESTED** | **92** | 50.0% | Automated-eligible item with no Playwright test executed |
| **NEEDS-HUMAN** | **27** | 14.7% | Items tagged MANUAL requiring real device or founder sign-off |
| **Total** | **184** | **100.0%** | Master Checklist Surface |

---

## 2. P0 & P1 Failures Summary

### P0 Failures (1 Failure)
- **A11Y-01** (A11Y): Failed in 1/40 tests. Error: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoEqual[2m([22m[32mexpected[39m[2m) // deep equality[22m

### P1 Failures (0 Failures)


---

## 3. Key Regression Audit Findings

1. **PROVENANCE & NO-GO STATUS**:
   - Out of 184 total checklist items, **64 items** are verified PASS via 591 passed tests in Playwright's JSON reporter.
   - 1 item (**A11Y-01**) is a verified P1 FAIL in Safari.
   - **92 items** remain UNTESTED because automated Playwright specs do not yet exist for every non-core sub-case.
   - Per the prompt requirement (*"Any P0 FAIL or UNTESTED = NO-GO"*), the formal verdict is strictly **NO-GO** until either remaining P0 items are covered with automated tests or explicitly cleared.

2. **LAYOUT SHIFT J0 NUMBERS (FIX VERIFIED)**:
   - **Mobile (375x812)**:
     - Footer Top at 0.5s: **3301px**
     - Footer Top at 3.0s: **3301px**
     - Footer Top at 8.0s: **3301px**
     - Movement: **0px** | CLS: **0.000**
   - **Desktop (1440x900)**:
     - Footer Top at 0.5s: **2475px**
     - Footer Top at 3.0s: **2475px**
     - Footer Top at 8.0s: **2475px**
     - Movement: **0px** | CLS: **0.000**

3. **MOBILE LISTING J10 CONTACT BUTTON OVERLAP CHECK**:
   - **375x812 (iPhone)**:
     - Contact button bounds: `top: 750px`, `bottom: 800px` (fixed bottom sticky).
     - Report button bounds: `top: 388px`, `bottom: 424px` (when centered in view).
     - Vertical separation: **326px**.
     - BottomNav overlap: **No BottomNav exists** (UniDeal uses top header with mobile hamburger drawer).
     - Overlap verdict: **ZERO OVERLAP**.
   - **360x740 (Small Android)**:
     - Contact button bounds: `top: 678px`, `bottom: 728px`.
     - Report button bounds: `top: 373px`, `bottom: 409px`.
     - Vertical separation: **269px**.
     - Overlap verdict: **ZERO OVERLAP**.

4. **LIGHTHOUSE MOBILE 3-RUN MEDIANS**:
   - **Home (`/`)**: Performance **92**, Accessibility **98**, Best Practices **100**, SEO **100** | Median LCP **3.32s**, CLS **0.000**, TBT **3ms**
   - **Browse (`/browse`)**: Performance **66**, Accessibility **98**, Best Practices **100**, SEO **100** | Median LCP **3.61s**, CLS **0.814**, TBT **0ms**
   - **Listing Detail (`/listing/...`)**: Performance **90**, Accessibility **96**, Best Practices **100**, SEO **100** | Median LCP **3.63s**, CLS **0.000**, TBT **0ms**
