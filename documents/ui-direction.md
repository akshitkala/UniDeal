# UniDeal — UI Direction

| Field | Value |
|---|---|
| Version | 1.0 |
| Date | August 14, 2026 |
| Companion docs | UniDeal PRD v2, UniDeal TRD v1, architecture.md, rules.md, design.md |

> **Purpose:** This document is the bridge between `design.md`'s visual tokens and the actual screen/layout decisions used to implement UniDeal. It does not redefine the design system. It specifies how the existing tokens and the locked product thesis should be applied to real screens and reusable UI patterns.

> **Locked design thesis:** "UniDeal should feel like a well-organized digital campus noticeboard with modern credibility cues" — a trust-first campus utility with restrained character, not a glossy marketplace clone. Seller identity is not decorative data. Contact gating is not a secondary CTA. The listing page is the trust surface.

---

## 1. Homepage structure

The homepage is a **static landing page** for first-time visitors and warm traffic from Instagram/word of mouth, per architecture.md §2.1 and roadmap.md Phase 7. It should explain the product fast, show that the marketplace is real, and move users toward either Browse or Sell. It is **not** a personalized feed, recommendation engine, or live dashboard in v1.

### 1.1 Section order

1. **Hero**
2. **Problem / Story**
3. **How It Works**
4. **Sample Listings**
5. **Sell CTA strip**

### 1.2 Hero

**Purpose:** Explain what UniDeal is in one glance.

**Must contain:**
- One strong headline framed around campus buying/selling
- One short supporting line explaining the trust/discovery thesis
- Primary CTA: `Browse Listings`
- Secondary CTA: `Sell an Item`

**Visual hierarchy:**
- Headline is the dominant element on the page
- Supporting copy is compact, not paragraph-length
- CTA pair sits directly under copy, above the fold on mobile

**Content emphasis:**
- Stress that listings are structured and sellers are real students
- Do not spend hero space explaining admin systems, moderation modes, or technical details

**Do not over-build:**
- No carousel
- No animated counters
- No user-specific greeting
- No personalized recommendations
- No live marketplace stats unless real data is intentionally wired later

### 1.3 Problem / Story

**Purpose:** Translate PRD §2.1 into a quick UI story: WhatsApp creates burial and unverifiability.

**Must contain:**
- A short two-part explanation of the current pain
- A matching explanation of what UniDeal fixes

**Recommended structure:**
- `Listings get buried`
- `You can't tell who's real`
- UniDeal fixes both with searchable listings and visible seller identity

**Visual hierarchy:**
- Small section heading
- Two concise problem blocks
- One short resolution line

**Do not over-build:**
- No long founder essay
- No testimonial slider
- No fake social proof if none exists yet

### 1.4 How It Works

**Purpose:** Make the product loop legible and low-friction.

**Must contain exactly the v1 loop:**
1. Post an item
2. Buyers browse and check seller identity
3. Verified users contact on WhatsApp

**Visual hierarchy:**
- Three equal steps
- Each step should be scannable in under 3 seconds
- Keep the WhatsApp handoff explicit so users do not expect in-app chat

**Do not over-build:**
- No complex diagrams
- No onboarding wizard embedded on the homepage
- No fake interactivity

### 1.5 Sample Listings

**Purpose:** Make the marketplace feel alive and concrete, per roadmap.md Phase 8's cold-start warning.

**Must contain:**
- A small preview grid using the real listing card design
- A section header that implies freshness, not volume inflation
- A link to full Browse

**Visual hierarchy:**
- Section heading first
- Compact card grid second
- Browse CTA after or above the grid

**Recommendation:** show a limited preview count so the homepage stays light.

**Open decision for founder sign-off:** whether the homepage preview should show:
- the newest listings only, or
- a manually selected sample set during early cold start

Newest is the cleaner long-term default. Manual curation may help the first impression during early seeding.

### 1.6 Sell CTA strip

**Purpose:** Catch the seller intent after the visitor has understood the product.

**Must contain:**
- One sentence aimed at students with something to sell
- One clear CTA to `/sell`

**Visual hierarchy:**
- Simpler than the hero
- Strong contrast with surrounding sections
- One action only

---

## 2. Listing card anatomy

Listing cards are the core scanning unit of the product. They must help a student decide, in seconds, whether to tap. Per this thread, **seller `name`, `branch`, and `year` must be visible on the card itself**, not only on the detail page.

### 2.1 Field order

Top to bottom:
1. Image
2. Price
3. Title
4. Condition
5. Seller identity row: `full_name`, `branch`, `year`

Category may appear as a small chip if needed, but it must not outrank condition or seller identity.

### 2.2 Prominence rules

**Primary**
- Image
- Price
- Title

**Secondary**
- Condition
- Seller `full_name`

**Tertiary**
- Seller `branch`
- Seller `year`
- Category chip, if shown

### 2.3 Image treatment

- Image is the first thing the eye lands on
- Use consistent aspect ratio across the grid
- Avoid decorative frames or heavy overlays
- Sold/rejected states may tint or badge the card, but should not obscure the image completely

### 2.4 Price treatment

- Price is the strongest text element on the card
- It should visually outrank the title
- Use the accent color for price emphasis, per design.md
- Negotiable can appear as supporting microcopy, not as a competing badge

### 2.5 Title treatment

- Title is short, high-contrast, and limited to a compact line count
- It should read as the item's label, not as a paragraph excerpt
- Avoid letting long titles visually push seller identity off-card

### 2.6 Condition treatment

- Condition is displayed as a restrained chip or badge
- It should be visible at a glance but must not compete with the price
- Condition color treatment should remain neutral-to-supporting, except where a strong status meaning is required elsewhere

### 2.7 Seller identity treatment

Seller identity sits in a dedicated bottom row of the card and is always visible.

**Order inside the identity row:**
1. `full_name`
2. separator
3. `branch`
4. separator
5. `year`

**Rules:**
- `full_name` is slightly stronger than branch/year
- Branch and year are compact and muted
- This row should read like credibility metadata, not like a second headline

**Do not do:**
- Hide seller identity behind hover
- Put seller identity only in the detail page
- Style seller identity like social media profile chrome

### 2.8 Editorial restraint on cards

Editorial here means:
- strong type contrast between price/title/metadata
- deliberate spacing
- quiet surfaces

Editorial does **not** mean:
- stickers
- tape effects
- faux paper textures
- exaggerated drop shadows

---

## 3. Listing detail hierarchy

The listing detail page is the trust surface. The page must make the item legible and the seller credible before the buyer decides to contact.

### 3.1 Primary layout order

Top to bottom on mobile:
1. Image area
2. Price
3. Title
4. Condition + category metadata row
5. Seller identity block
6. Contact Seller CTA
7. Description
8. Secondary actions such as Report

On larger screens, the seller block and Contact CTA may sit together in the right-hand information column, but the adjacency rule below still applies.

### 3.2 Image area

- Large and clean, with image browsing that prioritizes the item over chrome
- No modal-heavy gallery system in v1
- Keep controls simple and touch-friendly

### 3.3 Price and condition hierarchy

- Price is the most prominent text element on the page
- Title is next
- Condition is visible immediately below or beside title metadata, but never heavier than price/title
- Category can live beside condition as supporting metadata

### 3.4 Seller identity block placement

The seller identity block must sit **adjacent to the Contact Seller CTA**, not below the fold and not after the description.

**Required contents:**
- Seller `full_name`
- `branch`
- `year`
- Optional quiet label such as `Student seller`

**Reason:** the buyer should evaluate trust and act in the same visual zone. Identity without CTA is passive; CTA without identity feels unsafe.

### 3.5 Contact CTA treatment

- `Contact Seller` is the primary action on the page
- It should visually dominate secondary actions like Report
- Any gating state should appear in immediate relation to the CTA, not as a distant toast alone

### 3.6 Contact unavailable state

Per TRD §5.5, seller contact may genuinely be unavailable. This must read as an informative state, not a broken button.

**Required treatment:**
- Keep the seller identity block visible
- Replace the active CTA with a disabled or non-primary state
- Show a plain-language message directly below or within the CTA area

**Copy direction:**
- Good: `Seller contact isn't available right now. Try another listing or check back later.`
- Good: `This seller hasn't added a WhatsApp number yet.`
- Avoid: `Error`, `Unavailable`, `Something went wrong`

**Behavioral rule:**
- Do not imply the user did something wrong
- Do not style it as a system failure
- Do not hide the state in a toast only

### 3.7 Description placement

- Description comes after the trust-and-action zone
- It should be readable and spacious, not compressed into a tiny caption style
- It supports the decision; it does not lead the page

### 3.8 Open decision for founder sign-off

Whether the seller identity block should include a small visual trust marker such as `Verified contact flow`-style supporting text near the CTA.

**Recommendation:** yes, but only as one line of quiet explanatory copy, not a badge explosion. This would reinforce the privacy/trust model without adding ornament.

---

## 4. Dashboard status treatment

The Dashboard is not just a gallery of the seller's cards. It is an operational screen that helps the seller understand what is live, what is waiting, what is sold, and what was taken down.

### 4.1 Status grouping

Group listings into distinct sections:
- `Active`
- `Under Review`
- `Sold`
- `Rejected`

Use the confirmed TRD mapping:
- `approved` → `Active`
- `pending` → `Under Review`
- `sold` → `Sold`
- `rejected` → `Rejected`

### 4.2 Visual treatment by status

**Active**
- Neutral card surface with normal visual weight
- No warning or success over-styling
- Action buttons remain available and obvious

**Under Review**
- Use the accent color sparingly for the status label only
- Card remains readable and calm
- Message should explain that the listing is waiting for admin review, not blocked by an error

**Sold**
- Reduce card visual energy slightly
- Keep content readable but clearly de-emphasized
- Sold label should be immediate at a glance

**Rejected**
- Strongest alert treatment of the four states
- Use danger color for the status label and rejection message framing
- Do not make the whole card feel punitive or broken

### 4.3 Rejection reason visibility

Per TRD §5.9, `rejection_reason` must be visible to the seller and should not be hidden behind an extra click if avoidable.

**Required treatment:**
- Display the rejection reason directly in the rejected card or in an always-visible inline panel attached to it
- Place it above secondary actions
- Label it clearly, e.g. `Why it was rejected`

**Rules:**
- Do not bury rejection_reason inside a modal by default
- Do not require an accordion click just to learn the reason
- Do not reduce the reason to a tiny caption

### 4.4 Status messaging tone

Messages should be plain and directional:
- `Your listing is live`
- `Your listing is under review`
- `Marked as sold`
- `Removed by admin`

Rejected entries should pair that status with the visible reason so the seller knows what happened and what to do next.

### 4.5 Open decision for founder sign-off

Whether rejected listings should still expose the `Edit and resubmit` path in v1.

**Recommendation:** do not imply resubmission unless the backend/admin flow explicitly supports it. In v1, safer options are `Delete` or `Create a new corrected listing` copy.

---

## 5. Form layout rules

The Sell page is a **single-form page** per PRD §5.6. The UI must make it feel simple and short even though all required fields are on one screen.

### 5.1 Field order

Recommended top-to-bottom order:
1. Listing images
2. Title
3. Description
4. Price
5. Negotiable toggle
6. Category
7. Condition
8. Submit action

This order matches user intent: show the item, describe it, price it, classify it.

### 5.2 Grouping rules

Use clear section breaks:
- `Photos`
- `Item details`
- `Pricing`
- `Category and condition`

Groups should reduce perceived length, not create extra ceremony.

### 5.3 Image upload area

The image area should be the strongest block at the top of the form.

**Rules:**
- Make the `1–4 images` requirement obvious
- Show upload slots/previews immediately
- Show the 5MB limit as supporting copy before upload errors happen
- Keep the area practical, not decorative

### 5.4 Input treatment

- Labels should always remain visible; do not rely on placeholder-only fields
- Required inputs should feel straightforward and uncluttered
- Description field should be roomy enough to encourage useful detail without feeling essay-like

### 5.5 Validation error display convention

Per rules.md §7.3, error messaging should be plain-language and directional.

**Rules:**
- Show field-level errors directly under the field
- Use one short sentence per problem
- Keep the message actionable

**Examples of tone:**
- `Add at least one image.`
- `Title must be at least 3 characters.`
- `Price must be 0 or more.`
- `Couldn't post your listing. Check the highlighted fields and try again.`

**Avoid:**
- raw schema text
- stack traces
- vague `Invalid input`
- apology-heavy copy

### 5.6 Submit action

- Submit button should remain visually clear throughout the form
- On mobile, a sticky submit bar is acceptable if the form length justifies it

**Open decision for founder sign-off:** whether to use a sticky mobile submit bar on the Sell page.

**Recommendation:** yes, if the final form height becomes long enough that the button frequently leaves view. If the page remains compact, a standard bottom submit is cleaner.

---

## 6. Component tone

Component tone should deliver the "editorial but restrained" direction through hierarchy, spacing, and type contrast — not decoration.

### 6.1 Badges

Use badges only for information that benefits from quick scanning:
- Condition
- Status
- Possibly category, if the layout needs it

**Confident and restrained means:**
- short text
- consistent shape
- low ornament
- one clear semantic job

**Drift into decorative when:**
- too many badge variants appear on one card
- badges compete with price/title
- badges are used for filler metadata

### 6.2 Chips

Use chips for filters and selectable category/condition controls.

**Rules:**
- Chips should feel tappable and compact
- Selected state should be obvious through token-based color contrast, not size change or extra effects
- Avoid oversized pill collections that dominate the page

### 6.3 Empty states

Per rules.md §7.5, empty states should state what is true and what to do next.

**Rules:**
- One plain headline
- One short explanatory line
- One relevant action if applicable

**Good examples:**
- `No listings match these filters. Try clearing them.`
- `You haven't posted anything yet. List your first item.`
- `No pending reports right now.`

**Do not do:**
- mascot illustrations
- joke copy
- emotionally needy language

### 6.4 Buttons

Use button emphasis sparingly and consistently.

**Primary buttons**
- Reserved for the main action on a screen: Browse, Sell, Contact Seller, Save changes

**Secondary buttons**
- Used for supporting actions: cancel, edit, back, manage filters

**Danger buttons**
- Used only for destructive or admin-removal actions

**Rules:**
- One primary action per zone whenever possible
- Do not place multiple equal-weight buttons beside each other unless the screen genuinely has two top-level actions
- Avoid oversized, glossy, or animated button styling

### 6.5 What "editorial" means in UniDeal

Editorial in this product means:
- clear contrast between headline/body/metadata
- disciplined whitespace
- intentional alignment
- quiet surfaces that let information lead

Editorial does **not** mean:
- ornamental dividers
- scrapbook motifs
- layered stickers
- textured backgrounds
- decorative gradients competing with content

### 6.6 Open decision for founder sign-off

Whether category should appear as a persistent chip on every listing card or only inside filters/detail metadata.

**Recommendation:** keep category visible on cards only if the layout stays calm after seller identity is added. If the card becomes crowded, category should drop to detail/filter contexts first, because seller identity is more core to the product thesis.
