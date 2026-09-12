# UniDeal — Design System

| Field | Value |
|---|---|
| Version | 1.0 |
| Date | September 2026 |
| Companion docs | PRD v2.1, TRD v1.1, architecture.md v1.1, rules.md v1.1, appflow.md |

> **Purpose:** This is the canonical visual and interaction reference for UniDeal. `rules.md` §2 points here for the actual token values. Every screen-generation prompt (Stitch or otherwise) should reconcile against this document before being finalized. Where a screen's design conflicts with something here, this document wins unless explicitly overridden and noted.

---

## 1. Design Principles

- **Trust-first, not hype-first.** UniDeal's credibility comes from clarity and restraint, not bold/loud visual energy. Avoid anything that reads as a generic startup landing page (gradients, glassmorphism, testimonial carousels with fabricated quotes).
- **WhatsApp-adjacent, not WhatsApp-branded.** The green accent nods to the platform UniDeal bridges into, without copying Meta's brand assets or claiming affiliation.
- **Mobile-first by necessity, not preference.** Per PRD success metrics, mobile session share is targeted at 60-70%+. Every layout decision starts at 375px.
- **Flat and clean.** No gradients, glassmorphism, or neumorphism anywhere in the product.

---

## 2. Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--color-accent` | `#16A34A` | General accent / primary CTA color — sort/filter active states, links, primary buttons other than Contact Seller |
| `--color-accent-contact` | `#15803D` | **Reserved exclusively** for the "Contact Seller" button. This is a deliberately distinct, slightly deeper green so the single highest-stakes action on the app reads as visually distinct from routine navigation/CTAs. Never used for any other element. |
| `--color-destructive` | `#DC2626` | Delete, reject, ban actions; error states |
| `--color-background` | `#FFFFFF` / near-white | Base page background |
| `--color-foreground` | Near-black (e.g. `#0F172A`) | Primary text |
| `--color-muted-foreground` | Mid-gray (e.g. `#64748B`) | Secondary text, timestamps, helper copy |
| `--color-border` | Light gray (e.g. `#E2E8F0`) | Card borders, dividers |
| `--color-card` | `#FFFFFF` | Card backgrounds |

**Contrast requirement:** all text/background pairings must meet 4.5:1 minimum contrast (WCAG AA). Do not use `--color-muted-foreground` for body text under ~14px.

**Anti-patterns to avoid:**
- No gradients on buttons, cards, or backgrounds
- No glassmorphism (frosted/blurred translucent panels)
- No neumorphism (soft-shadow embossed elements)
- No color used as the *only* signal for status (pair every status color with a text label or icon)

---

## 3. Typography

- **Headings:** Outfit
- **Body:** Work Sans
- **Base size:** 16px minimum for body text; never drop below 12px anywhere, including badges/labels
- **Line height:** 1.5 for body copy, tighter (1.2–1.3) acceptable for large display headings only
- **Scale:** standard modular scale — display (32px+) → h1 (28px) → h2 (22px) → h3 (18px) → body (16px) → small (14px) → caption (12px, use sparingly)

---

## 4. Spacing & Layout

- **Spacing scale:** standard 16–64px range for marketing/content pages (Home, Our Story, How It Works); tighter 8–32px range acceptable for dense utility screens (Admin tables, Dashboard grid)
- **Breakpoints:** 375px (mobile baseline) → 768px (tablet) → 1024px (desktop) → 1440px (large desktop)
- **No horizontal scroll** at any breakpoint except deliberately within a horizontally-scrolling component (e.g. an image gallery)
- **Touch targets:** minimum 44×44px for any tappable element, with at least 8px spacing between adjacent targets

---

## 5. Component Patterns

### 5.1 Buttons
- Primary (`--color-accent`): main actions — Post Listing, Save, Apply Filters, Sign In/Sign Up submit
- Contact Seller (`--color-accent-contact`): the one and only use of this token, on Listing Detail only
- Destructive (`--color-destructive`): Delete, Reject, Ban, Remove
- Secondary/ghost: Cancel, Clear Filters, low-emphasis actions
- All buttons: visible focus ring (`focus:ring-2`), 150-300ms hover transition, `cursor-pointer`, no instant (0ms) state changes

### 5.2 Cards (Listing Card)
- Image (square or near-square), title (1-2 line truncate), price (bold), condition badge, seller first name (small, secondary text)
- No avatar, no branch/year, no review stars, no verified badge, no wishlist/heart icon
- Compact 2-column grid on mobile, scaling to more columns on wider breakpoints

### 5.3 Modals & Overlays
- Must trap keyboard focus while open (Tab/Shift+Tab cycles only within the modal)
- Escape key and backdrop click both close the modal
- Opening pushes a `history.pushState` entry so back-navigation closes the modal rather than leaving the page
- Visible focus ring required on every control inside, same as the rest of the app — a modal is not exempt from focus-visibility rules

### 5.4 Forms
- Visible labels always (never placeholder-only labels)
- Inline validation errors appear next to the relevant field, not only as a top-of-form summary
- Helper text for anything non-obvious (e.g. WhatsApp number format on Profile)
- `inputmode="numeric"` on numeric fields (price) to trigger the correct mobile keyboard
- Progressive disclosure over upfront overwhelm — but never at the cost of the "single form, no wizard" rule for Sell/Edit

### 5.5 Empty States
Per rules.md §7.5: state what's true and what to do next. Never a generic "Nothing here!" placeholder.

### 5.6 Status Badges (Dashboard / Admin)
| DB status | Label | Suggested treatment |
|---|---|---|
| `approved` | Active | Accent-tinted badge |
| `pending` | Under Review | Neutral/muted badge |
| `rejected` | Rejected | Destructive-tinted badge |
| `sold` | Sold | Muted/gray badge |

---

## 6. Icons

- SVG icons only (Heroicons/Lucide or equivalent) — never emoji as functional icons
- Icon-only buttons must have an accessible label (`aria-label`), never rely on the icon alone
- Decorative icons marked `aria-hidden`

---

## 7. Per-Screen Design Summary

### 7.1 Home
Hero, problem statement, solution overview, sample listings (first-name-only), CTA. No fabricated WhatsApp mockups, no invented trust badges.

### 7.2 Browse
Sticky top bar: search input (full width) + "Filters" button (opens modal: category + condition chips) + sort dropdown (Newest / Price ↑ / Price ↓). 2-column compact grid on mobile. Infinite scroll. Empty state: "No listings match these filters — try clearing them."

### 7.3 Listing Detail
Standalone page (no drawer). Image gallery (1–4, swipeable on mobile) → title/price/condition/negotiable badge → description → seller first name → **Contact Seller** button (`#15803D`). Report link below the fold, low-emphasis. States: logged-out, unverified, rate-limited, no-number-available.

### 7.4 Auth Modal (Login/Signup)
Overlay triggered from any gated CTA. Tabbed Login/Signup inside one modal. Focus-trapped, closes on Escape/backdrop/back-navigation. Resumes the triggering action (`returnTo`) on success rather than dropping the user on Home.

### 7.5 Verify Email
Minimal status page: "Check your inbox" message, resend-email action with cooldown timer, link back to Browse. No form fields — reactive to state only.

### 7.6 Sell / Edit Listing
Single-page form, no wizard. Fields in order: title, category, condition, price (`inputmode="numeric"`), negotiable toggle, description, image upload (drag-drop + tap, 5MB client-side rejection, inline error). Submit disabled until valid. Edit reuses the same form pre-filled, submit label changes to "Save changes."

### 7.7 Dashboard
Four status tabs/sections: Active, Sold, Under Review, Rejected (see §5.6 badge mapping). Inline card actions (Mark Sold, Edit, Delete) — no drawer. `rejection_reason` shown directly on rejected cards. Per-section empty states.

### 7.8 Profile
Form: full name, branch, year (optional), WhatsApp number (E.164, format helper text). Explicit note that the number is never shown publicly. Explicit Save action, no silent auto-save-on-blur.

### 7.9 Our Story
Static single-column page. Founder narrative, mission, origin story. Generous line-height, optional supporting photo. Credibility content, not conversion content — low CTA emphasis.

### 7.10 How It Works
3-4 step visual walkthrough (List → Discover → Contact on WhatsApp → Meet up). Icon + short copy per step, same step-pattern visual language as Home's solution-overview section.

### 7.11 Contact Us
Simple form: name, email, message → `POST /api/contact` → Resend. Inline validation. Success state: "Message sent — we'll get back to you soon." Failure state: plain-language, no raw error text. Nav label "Contact Us" (never just "Contact," to avoid colliding with Contact Seller).

### 7.12 Admin — Overview
Snapshot cards: pending listings count, open reports count, total users, approval-mode toggle (front and center — highest-leverage control). Dense layout acceptable; still respect 44×44px touch targets.

### 7.13 Admin — Pending Queue
Manual-mode only. List with inline Approve/Reject. Reject opens a required reason field, persisted to `rejection_reason`. No bulk actions in v1.

### 7.14 Admin — Reports
List/table: listing title, reporter, reason, date. Remove/Dismiss actions per row. Resolved reports filterable out of default view, not deleted.

### 7.15 Admin — Users
Searchable list with Ban/Unban/Promote per row. `is_admin`/`is_banned` shown as badges. Lightweight confirm step before Ban/Promote (consequential actions), not a full modal wizard.

---

## 8. Explicit Prohibitions (recurring Stitch/AI-generation failure modes)

Carry these into every screen-generation prompt — these are documented failure modes from earlier iterations, not hypothetical risks:

- No seller avatar, department, branch, or year displayed anywhere except the seller's own Profile page
- No ".edu-only" or college-restriction language — signup is open to any email
- No fabricated WhatsApp chat mockups or message previews
- No invented trust claims, verified badges, star ratings, or review counts — reviews are out of scope entirely
- No wishlist/save/heart icons — out of scope
- No drawer or bottom-sheet pattern for listing detail — standalone page only
- No multi-step wizard for Sell/Edit — single form only
- No dedicated `/login` or `/signup` route — Auth Modal only
- No "Most Viewed" sort option — Newest / Price ↑ / Price ↓ only
