---
version: v1-draft
name: unideal
description: "Campus marketplace interface. Trust-forward green identity on a clean neutral base, condensed sans display paired with a highly legible body face, 4px spacing system."
sourceUrl: "original — not extracted, proposed for review"

colors:
  primary: "#1C8A56"        # verified/trust green — CTAs, active states, "Sell" action
  primary-hover: "#15683F"
  accent: "#C97A2B"         # warm amber — price emphasis, pending/under-review state, notice-tag motif
  background: "#FFFFFF"
  surface: "#F7F6F3"        # subtle warm-neutral for cards/panels, avoids stark white-on-white
  border: "#E5E3DD"
  text: "#1A1A1A"
  text-muted: "#6B6B6B"
  on-primary: "#FFFFFF"
  danger: "#C0392B"         # rejected listings, error states, report action
  success: "#1C8A56"        # reuses primary — "approved/verified" and "go" share one meaning

typography:
  display:
    fontFamily: "Sora, sans-serif"
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.2
  heading:
    fontFamily: "Sora, sans-serif"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Inter, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.4

spacing:
  base: 4px
  scale: [4, 8, 12, 16, 24, 32, 48, 64, 96]

radius:
  sm: 6px
  md: 10px
  lg: 16px
  full: 9999px             # pills — condition tags, category chips, verified badge

shadows:
  sm: "0 1px 2px rgba(26,26,26,0.06)"
  md: "0 4px 12px rgba(26,26,26,0.08)"

motion:
  easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  duration-base: 200ms

breakpoints: [640px, 768px, 1024px, 1280px]
---

## Rationale

**This is a first-pass proposal, not a locked system** — built on the green identity already visible in your existing mockups, extended into a full token set. Every choice below has a reason tied to UniDeal specifically, not a generic marketplace template. React to it, don't treat it as final.

**Color** — Primary green carries over from your existing UI (Sell CTA, active nav state) and does double duty: it already reads as "go / active" in your mockups, and now also anchors "verified / trustworthy," which is the actual product thesis. Rather than a second bright accent color, `surface` is a barely-off-white warm neutral (not stark white, not a cream/paper tone) — enough to let cards feel distinct from the page without leaning into a "vintage flyer" aesthetic that might read as twee at UI scale. The amber `accent` is reserved specifically for price and pending-state emphasis — a functional color, not decoration, so it doesn't compete with green for "what should I look at."

**Typography** — Sora (display/heading) is a confident, slightly geometric sans with more character than a default system font, used only for headings so it doesn't fight legibility at small sizes. Inter (body/caption) is chosen purely for readability at small mobile sizes, since your target is >60-70% mobile sessions — this is not the place to spend a design risk. Both are free via Google Fonts, no licensing cost, consistent with the zero-budget constraint.

**Spacing** — 4px base matches Tailwind's default scale exactly, so no config fighting — the visual rhythm and the utility classes agree by default.

**Radius** — `full` (pill) is specifically earmarked for condition tags, category chips, and the verified badge — a deliberate nod to the "tag/label" signature idea raised earlier (cards that feel *posted*, not *listed*), without committing to a heavier illustrative treatment that would cost more build time than it's worth.

**Shadows** — kept deliberately subtle (`sm`/`md` only, low opacity). A campus marketplace should feel light and fast, not heavy or skeuomorphic — shadows here separate layers (card vs. page, modal vs. background), not decorate them.

**What's still open:**
- Whether `surface` should lean slightly warmer (paper-adjacent) to more directly evoke the noticeboard metaphor discussed earlier, or stay this neutral — a genuine aesthetic call, not a technical one
- Whether the amber accent is the right "pending/price" color for you, or reads too close to a generic warning-yellow
- Dark mode is not addressed here — out of scope unless you want it considered
