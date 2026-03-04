**UniDeal**

_UI/UX Specification_

Complete Component Reference — Every Page, Every State

LPU Campus Marketplace — V1

|     |     |
| --- | --- |
| **Section** | **Page** |
| 1\. Design System — Colours, Typography, Spacing, Motion | —   |
| 2\. Layout Architecture — Grid, Topbar, Sidebar | —   |
| 3\. Global Components — Shared across all pages | —   |
| 4\. Page: Browse / Homepage | —   |
| 5\. Page: Listing Detail Drawer | —   |
| 6\. Page: Sell / List Item Modal | —   |
| 7\. Page: Seller Dashboard | —   |
| 8\. Page: User Profile | —   |
| 9\. Page: Auth — Login, Register, Verify Email | —   |
| 10\. Page: Admin Moderation Queue | —   |
| 11\. Interaction Patterns — Animations, Transitions | —   |
| 12\. Accessibility & Responsive Rules | —   |

# **1\. Design System**

## **1.1 Colour Palette**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| \--bg | #f7f5f0 | Page background — warm off-white. Used for app-root, main area, sidebar bg. |
| \--bg-2 | #efece5 | Slightly darker warm. Sidebar active states, input backgrounds, hover fills. |
| \--bg-3 | #e5e1d8 | Deepest warm neutral. Skeleton loader highlight, pressed states. |
| \--surface | #ffffff | Cards, topbar, sidebar, modals, drawers, all elevated surfaces. |
| \--surface-2 | #faf9f7 | Subtly warm white. Detail table rows, form section backgrounds. |
| \--ink | #19180f | Primary text — headings, active nav, prices, CTA button backgrounds. |
| \--ink-2 | #37352a | Secondary text — card titles, form labels, description body. |
| \--ink-3 | #6b6858 | Tertiary text — metadata, help text, table labels, breadcrumb. |
| \--ink-4 | #9b9789 | Quaternary — placeholder text, disabled labels, icon fills. |
| \--ink-5 | #c5c1b4 | Quinary — dividers, skeleton base, time labels, count badges bg. |
| \--amber | #c07a1a | Primary CTA — List Item button, Submit button, negotiable badge, price. |
| \--amber-bg | #fef3c7 | Amber tint background — tip cards, verify nudge, negotiable tags. |
| \--amber-dim | #92400e | Amber dark — text on amber-bg, warning messages. |
| \--border | #ddd9cf | Card borders, input borders on focus, dividers. |
| \--border-2 | #e8e4da | Lighter borders — input default state, sidebar dividers. |
| \--green | #15803d | Success — WhatsApp button, verified badge, online dot, approve action. |
| \--green-bg | #dcfce7 | Green tint — contact revealed state, success toast background. |
| \--red | #b91c1c | Error — reject action, report button hover, damaged condition badge. |
| \--blue | #1e40af | Info — Like New condition badge, info notes border. |
| \--teal | #0e7490 | Accent — seller avatar palette option, teal category icons. |

## **1.2 Typography**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| \--font | DM Sans | All UI text. Body copy, labels, buttons, nav items, form inputs, metadata. |
| \--serif | Fraunces | Logo wordmark, listing titles in detail panel, modal/page H1 headings only. |
| \--mono | DM Mono | Prices, listing IDs, view counts, character counters, code/config values. |
| Base size | 16px / 22 half-pts | Root font size. All other sizes relative. |
| H1 (page) | Fraunces 600, 28–32px | Page-level headings. Browse, Dashboard, Profile page titles. |
| H2 (section) | DM Sans 700, 20px | Section headings inside pages. Card group labels. |
| H3 (sub) | DM Sans 600, 16px | Sub-section labels, form section titles, sidebar group labels. |
| Body | DM Sans 400, 14px | Card descriptions, detail panel body, form help text. |
| Label | DM Sans 600, 11px uppercase | Form field labels, table column headers, badge text. |
| Price | DM Mono 500, 16–24px | All currency values. Card price 16px, detail panel price 24px. |
| Meta | DM Sans 400, 11px | Posted time, view count, location in card footer. |
| Button | DM Sans 600, 13px | All button text regardless of button type. |

## **1.3 Spacing Scale**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| 4px | Micro gap | Icon-to-label gap, badge internal padding vertical. |
| 6px | XS gap | Filter chip gap, condition button gap in sell modal. |
| 8px | SM gap | Card internal padding, badge internal padding horizontal, avatar-to-text. |
| 12px | MD gap | Grid gap mobile, sidebar item padding, input internal padding. |
| 14px | Base gap | Card body padding, modal body padding, content header padding. |
| 16px | LG gap | Grid gap tablet, section padding, drawer padding sides. |
| 20px | XL gap | Sidebar padding, modal header padding, page content padding. |
| 24px | 2XL gap | Grid padding, section margins, desktop content padding. |
| 32px | Section break | Between major sections on a page, modal footer padding. |
| 48px | Page break | Empty state padding, top/bottom page breathing room. |

## **1.4 Border Radius Scale**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| \--r-sm | 4px | Condition badges, view count pill, small tags. |
| \--r | 8px | Buttons, inputs, dropdowns, filter chips, small cards. |
| \--r-md | 12px | Listing cards, detail table, photo upload zone. |
| \--r-lg | 16px | Sidebar, modals on desktop, drawer on desktop. |
| \--r-xl | 24px | Sheet overlays on mobile — top corners only. Sell modal on mobile. |
| 50% | Circle | Avatar, save button, notification bell, icon action buttons. |

## **1.5 Elevation / Shadow Scale**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| \--shadow-sm | 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04) | Default card state, topbar, sidebar border substitute. |
| \--shadow | 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04) | Hover card state, dropdown menus, filter pill active. |
| \--shadow-md | 0 8px 24px rgba(0,0,0,0.10), 0 3px 8px rgba(0,0,0,0.05) | Detail drawer, sell modal, mobile sidebar drawer. |
| \--shadow-lg | 0 20px 48px rgba(0,0,0,0.13), 0 6px 16px rgba(0,0,0,0.06) | Full-screen overlays, backdrop blur accompaniment. |

## **1.6 Motion & Easing**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| \--ease | cubic-bezier(0.16,1,0.3,1) | Default easing. Most enter animations, page transitions. |
| \--ease-in | cubic-bezier(0.55,0,1,0.45) | Exit animations only — elements leaving the screen. |
| \--spring | cubic-bezier(0.34,1.56,0.64,1) | Springy feel — save button, avatar pop, scale-in modals. |
| Micro (80ms) | Card press, button active | Immediate feedback on tap/click. No easing needed. |
| Fast (150ms) | Hover states, colour transitions | Input focus, nav hover, badge colour change. |
| Base (200ms) | Backdrop fade, toast enter | Most single-element transitions. |
| Medium (280ms) | Modal/drawer enter, form step | Overlay enters, sell step slide transitions. |
| Slow (320ms) | Sheet slide-up, drawer slide-in | Full-panel movements from screen edges. |
| Stagger | 30ms per grid item | Grid cards animate in sequence with 30ms delay increments. |

# **2\. Layout Architecture**

The entire application is structured using CSS Grid named template areas. This is a desktop-first layout that collapses progressively at smaller breakpoints.

## **2.1 CSS Grid Structure**

grid-template-areas:

"topbar topbar"

"sidebar main"

grid-template-rows: 60px 1fr

grid-template-columns: 240px 1fr

height: 100dvh // fills viewport, no body scroll

## **2.2 Responsive Grid Collapse**

|     |     |     |     |     |
| --- | --- | --- | --- | --- |
| **Breakpoint** | **Topbar** | **Sidebar** | **Grid cols** | **Overlays** |
| < 640px | Simplified | Hidden, hamburger | 2-col 10px | Bottom sheet |
| 640–1023px | Full | Hidden, hamburger | 3-col 14px | Centred modal |
| 1024–1279px | Full | 240px persistent | 4-col 16px | Right drawer |
| 1280px+ | Full | 260px persistent | 5-col 18px | Right drawer |

# **3\. Global Components**

These components appear across multiple pages. They are documented once here and referenced in page-level specifications.

## **3.1 Topbar**

Fixed to the top of the viewport. 60px height. Full width. Spans both sidebar and main columns in the CSS Grid.

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Height | 60px fixed | Never changes regardless of scroll or screen size. |
| Background | \--surface (#fff) | Solid white. Subtle bottom border: 1px --border-2. |
| Box shadow | \--shadow-sm | Always present — separates topbar from content below. |
| z-index | 200 | Above sidebar (z:100), below overlays (z:300+). |
| Padding | 0 24px | Reduced to 0 14px on mobile (< 640px). |
| Logo zone | Left — width matches sidebar (240px) | Logo icon + UniDeal wordmark + LPU Campus sub-label. |
| Logo icon | 34×34px, radius 9px, --ink bg | White 🏷 emoji centred. Shadow: inset 0 1px 0 rgba(255,255,255,0.08). |
| Logo wordmark | Fraunces 700 18px, --ink | Letter spacing -0.04em. 'UniDeal' text. |
| Logo sub-label | DM Sans 500 9px, --ink-4 | Letter spacing 0.15em uppercase. 'LPU CAMPUS'. Hidden < 640px. |
| Search bar | flex:1, max-width 520px, centred | Full search component — see 3.5. Reduced to flex:1 no max on mobile. |
| Stats chips | Right of search, hidden < 1024px | Online count chip + listings count chip. See 3.6. |
| Divider | 1px × 22px, --border-2 | Between stats/actions zone and CTA button. |
| List Item btn | \--amber bg, 13px 600 | Primary CTA. Always visible. Triggers Sell Modal. |
| Notif bell | 36×36px circle, --bg fill | 🔔 emoji 16px. Border 1px --border-2. Hover: --bg-2. |
| Avatar | 34px circle | User initials. See Avatar component 3.8. Cursor pointer. |
| Hamburger | 36×36 — visible < 1024px only | Three 18px bars. Animates to X when menu open. See 3.12. |

## **3.2 Sidebar**

240px fixed width on desktop (260px at 1280px+). Sticky below topbar. Full remaining viewport height. Scrollable if content overflows.

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Width | 240px (260px at 1280px+) | Hidden below 1024px — becomes hamburger drawer. |
| Background | \--surface (#fff) | White. Right border: 1px --border-2. |
| Padding | 20px 12px | Inner spacing. 12px side padding keeps items visually aligned. |
| List Item btn | Full width, --amber, mb 20px | Primary CTA repeated in sidebar. Same as topbar button. |
| Group label | DM Sans 700 10px uppercase, --ink-4 | Letter spacing 0.12em. 'BROWSE', 'MY ACCOUNT', etc. |
| Nav item | Full width, 9px 10px padding, radius --r | Icon (20px fixed width) + label + count badge. |
| Nav item icon | 15px emoji, 20px fixed width | Centred in fixed-width span. Consistent alignment. |
| Nav item label | DM Sans 400 13.5px, --ink-3 | flex:1. Bold 600 when active. |
| Nav item count | DM Mono 11px, --ink-5, --bg-2 bg | Right-aligned pill. 7px horizontal padding. radius 20px. |
| Nav item default | \--ink-3 text, transparent bg | Hover: --bg-2 bg, --ink text. |
| Nav item active | \--ink text, --bg-2 bg, 600 weight | Active state — current page or selected category. |
| Divider | 1px --border-2, my 12px | Separates Browse / My Account / Stats sections. |
| Stats section | 12px label + 4 data rows | Each row: emoji icon + label + mono value right-aligned. |
| Verify nudge | Bottom of sidebar, mt auto | \--amber-bg bg, 1px #fde68a border, --r radius. 2-line text. |

## **3.3 Listing Card**

The primary content unit. Appears in all grid views — Browse, Dashboard, Saved, Search results.

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Container | \--surface bg, 1px --border-2 border, --r-md radius | Full width of grid column. flex-direction column. |
| Default shadow | \--shadow-sm | Subtle. Card feels grounded not floating. |
| Hover shadow | \--shadow-md | Elevates on hover. translateY(-2px) simultaneously. |
| Hover transform | translateY(-2px) | 200ms --ease. Card lifts slightly on hover. |
| Active transform | translateY(0) | 80ms snap back on press/click. |
| Image zone | aspect-ratio 4/3, overflow hidden | Fixed aspect ratio. Background --bg-2 while loading. |
| Image | 100% width, object-fit cover | Scales 1.04x on card hover — 400ms --ease. |
| Views badge | top:8px left:8px absolute | DM Mono 10px 500. Dark bg rgba(0,0,0,0.45) + blur(4px). '{n} views'. |
| Save button | top:8px right:8px absolute, 32px circle | White 92% opacity bg + blur(6px). ♡ or 🔖. Spring scale on interact. |
| Negotiable tag | bottom:8px right:8px absolute | Amber 90% bg, white text, 'NEG' uppercase 9px. Hidden if not negotiable. |
| Card body | 12px 14px 14px padding, gap 6px | flex column. Contains price row, title, meta footer. |
| Price row | flex between + align center | Left: DM Mono 16px price. Right: condition badge. |
| Price | DM Mono 500 16px, --ink | Letter spacing -0.02em. Format: ₹28,000 (en-IN locale). |
| Title | DM Sans 400 13px, --ink-2 | 2-line clamp. line-height 1.45. Overflow hidden. |
| Meta footer | flex align-center gap 6px, pt 8px, border-top 1px --bg-2 | Seller avatar (18px) + location (flex:1 truncated) + time (flexShrink 0). |
| Location | DM Sans 11px, --ink-4 | Single line, text-overflow ellipsis. |
| Time | DM Sans 11px, --ink-5 | e.g. '2h ago', '1d ago'. Right-aligned. |

### **Listing Card States**

|     |     |     |
| --- | --- | --- |
| **State** | **Trigger** | **Visual / Behaviour** |
| **Default** | Loaded, no interaction | White surface, --shadow-sm, full colour image. |
| **Hover** | Mouse enters card | translateY(-2px), --shadow-md, border --border, image scale 1.04x. 200ms. |
| **Active/Press** | Mouse down or tap | translateY(0), --shadow-sm. 80ms snap back. |
| **Saved** | Save button tapped | ♡ becomes 🔖. Spring animation on save button (scale 0→1.1→1). |
| **Loading** | Image not yet loaded | \--bg-2 placeholder with shimmer skeleton behind image. |
| **Sold** | Status: sold (dashboard) | Greyed out with 'SOLD' overlay badge. Pointer-events none. |
| **Pending** | Status: pending (dashboard) | Slightly dimmed (opacity 0.75). 'UNDER REVIEW' amber badge top-left. |
| **Rejected** | Status: rejected (dashboard) | Red tint border. 'REJECTED' red badge. 'See reason' link below title. |

## **3.4 Condition Badge**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Container | inline-flex, align-center, gap 4px, 2px 7px padding, --r-sm radius | Fits inline in card price row and detail panel. |
| Colour dot | 5×5px circle, background matches condition colour | Visual colour cue before text label. |
| Text | DM Sans 600 10.5px, letter-spacing 0.04em | Condition name. Not uppercase. |
| New | dot #16a34a, text #14532d, bg #dcfce7 | Green — brand new item. |
| Like New | dot #2563eb, text #1e3a8a, bg #dbeafe | Blue — barely used. |
| Good | dot #d97706, text #78350f, bg #fef3c7 | Amber — normal wear. |
| Used | dot #6b7280, text #1f2937, bg #f3f4f6 | Grey — visible wear but functional. |
| Damaged | dot #ef4444, text #7f1d1d, bg #fee2e2 | Red — has damage, described in listing. |

## **3.5 Search Bar**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Container | flex, align-center, gap 8px, --bg bg, 1.5px --border-2 border, --r-md radius | Full width of its parent zone. |
| Search icon | 15×15px SVG, --ink-4 stroke | Circle with line. flex-shrink 0. Left of input. |
| Input | flex:1, 13.5px DM Sans, --ink | border none, outline none, transparent bg. 9px vertical padding. |
| Placeholder | \--ink-4 colour | 'Search listings on campus…' |
| Clear btn | 16px ×, --ink-4 | Visible only when value is not empty. Hover: --ink colour. |
| Default | \--bg background, --border-2 border | Sits in topbar background. |
| Focused | \--surface bg, --ink border, box-shadow 0 0 0 3px rgba(25,24,15,0.06) | Transitions in 150ms. |
| With value | Clear × button appears right | Rotates 90deg on hover for delight. |

## **3.6 Stat Chips (Topbar)**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Container | flex, align-center, gap 5px, 4px 10px, radius 100px | \--bg bg, 1px --border-2 border. |
| Online chip | Green dot (6px circle, #16a34a) + value + label | '34' in DM Mono 600 --ink + ' online now' in 11px --ink-3. |
| Listings chip | Value + label only — no dot | '406' DM Mono 600 + ' listings' 11px --ink-3. |
| Visibility | Hidden below 1024px | Topbar too narrow on tablet/mobile to show stats. |

## **3.7 Avatar**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Shape | Circle (border-radius 50%) | Always circular regardless of size. |
| Content | Initials — first 2 words, first letter each | e.g. 'Rahul Singh' → 'RS'. Max 2 characters. |
| Font | DM Sans 700, size × 0.37px | Scales with avatar size. Letter spacing -0.02em. |
| Text colour | #ffffff always | White text on all colour backgrounds. |
| Colour palette | 6 colours based on name\[0\].charCodeAt mod 6 | #c07a1a, #0e7490, #15803d, #7c3aed, #be185d, #b91c1c |
| Sizes used | 16px (card meta), 18px (detail table), 22px (detail table large), 28px (default), 34px (topbar) | Size specified per usage context. |
| Cursor | pointer when clickable | Topbar avatar is clickable (profile menu). Card avatar is not. |

## **3.8 Button Variants**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Primary (ink) | \--ink bg, --paper text, 8px 16px, --r radius, 600 13px | Main actions: Continue, Save Changes. Hover: translateY(-1px) + shadow. |
| Primary (amber) | \--amber bg, white text, 8px 18px, --r radius, 600 13px | Top CTAs: List Item, Submit for Review. Glow shadow on hover. |
| Secondary | \--surface bg, --ink text, 8px 16px, --r, 1.5px --border, 500 13px | Back, Cancel, secondary actions. Hover: --bg fill. |
| Ghost | transparent bg, --ink text, no border | Tertiary actions, inline actions. Hover: --bg-2 fill. |
| Destructive | \--red text or bg | Delete, ban actions. Outlined red by default, filled on confirm. |
| Icon button | 36×36px circle, --bg fill, 1px --border-2 | Notification bell, close button on overlays. |
| Disabled state | opacity 0.4, cursor not-allowed | Applied to all button types when action unavailable. |
| Loading state | Spinner replaces label, button still full width | Used during API calls — contact request, form submit. |
| Focus visible | 2px solid --amber outline, 3px offset | Keyboard navigation indicator on all buttons. |

## **3.9 Form Field Components**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Label | DM Sans 600 11px uppercase, --ink-3, letter-spacing 0.08em | Displayed above input. Gap 5px between label and input. |
| Input | \--surface bg, 1.5px --border-2 border, --r radius, 10px 12px padding, 13.5px DM Sans | Full width of parent. |
| Input focus | \--ink border, box-shadow 0 0 0 3px rgba(25,24,15,0.06) | 140ms transition. Blue ring replaced with ink ring. |
| Input error | \--red border, #fee2e2 bg tint, error message below | Error message: --red text, 11px, margin-top 4px. |
| Input disabled | opacity 0.5, cursor not-allowed, --bg-2 bg | Read-only fields e.g. email on profile page. |
| Placeholder | \--ink-4 colour | Descriptive hint text inside empty input. |
| Select | Same as input + chevron SVG bg-image right 12px | appearance: none. Custom chevron: --ink-3 fill. |
| Textarea | Same as input, resize vertical, min-height 90px | line-height 1.7. Character counter below right-aligned. |
| Checkbox | 15×15px, accent-color --ink | Native checkbox with ink accent. Paired with DM Sans 500 13px label. |
| Character counter | DM Sans 11px, --ink-5, text-align right | Updates live as user types. e.g. '45/100'. |
| Help text | DM Sans 11.5px, --ink-4, mt 3px | Below input. Persistent guidance, not just on error. |

## **3.10 Toast Notification**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Position | Fixed, bottom 28px, left 50%, transform translateX(-50%) | Centered horizontally. Above bottom nav on mobile. |
| Container | Pill shape — radius 100px, 10px 20px padding | flex align-center gap 8px. |
| Icon | ✓ success / ✕ error / ℹ info | 16px. Flex-shrink 0. |
| Text | DM Sans 600 13px, #fff | Single line. Max ~40 chars before truncating. |
| Success bg | \--green (#15803d) | Listing submitted, item saved, action confirmed. |
| Error bg | \--red (#b91c1c) | API failed, validation error, rate limited. |
| Info bg | \--ink (#19180f) | Neutral information — contact opening, copied to clipboard. |
| Enter animation | toastIn 340ms --spring — translateY(8px) opacity 0 → translateY(0) opacity 1 |     |
| Exit animation | toastOut 260ms --ease-in — translateY(6px) opacity 0 | Triggered at 2600ms after entry. |
| Auto-dismiss | 2600ms visible, exits 260ms, removed from DOM at 2900ms total |     |
| Stacking | New toast replaces old toast — only one shown at a time |     |

## **3.11 Breadcrumb**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Container | flex, align-center, gap 6px, mb 12px | Hidden on mobile (< 640px). |
| Separator | › character, --ink-5 colour | Between each breadcrumb item. |
| Default items | DM Sans 12px, --ink-4 | Non-current path segments. e.g. 'UniDeal', 'Campus Marketplace'. |
| Current item | DM Sans 600 12px, --ink | Last item in breadcrumb. Bold. Not a link. |
| Search state | Adds: › Search: '{query}' as current | Shows what is being searched. |
| Category state | Adds: › '{Category Name}' as current | Shows active category filter. |

## **3.12 Mobile Sidebar Drawer**

Slides in from the right when hamburger is tapped. Only visible below 1024px.

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Position | Fixed, top 0, right 0, bottom 0 | Full height. Width: min(280px, 85vw). |
| Background | \--paper (#f7f5f0), left border 1px --border-2 | Slightly different bg from main to distinguish it. |
| Backdrop | Full-screen rgba(10,9,4,0.4) + blur(6px) | Clicking backdrop closes drawer. |
| Animation enter | slideR — translateX(320px)→0, 300ms --ease | Slides in from right. |
| z-index | 300 (drawer), 200 (backdrop) | Above sidebar (100), below modals (400+). |
| Padding top | calc(topbar height + 16px) | Clears the topbar. |
| Safe area | padding-right: var(--sar) | Handles iPhone notch in landscape. |
| Content | Same nav items as sidebar | Browse categories, My Account items, List Item CTA, verify nudge. |
| Active indicator | 3px left border --ink, --paper-2 bg | Replaces sidebar's bg-only active state. |
| Close trigger | Tapping backdrop, selecting any nav item | Hamburger animates back from X to bars. |

## **3.13 Empty States**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Container | flex column, align-center, padding 80px 24px, text-align center, gap 10px | Fills the main content area. |
| Icon | 48–52px emoji | Contextual: 🔍 search, 📭 no listings, 🔖 no saved items. |
| Heading | Fraunces 700 18px, --ink, letter-spacing -0.02em | e.g. No results for \[search term\] |
| Subtext | DM Sans 13px, --ink-4, max-width 320px | Helpful suggestion. e.g. 'Try different keywords or browse a category'. |
| CTA button | Secondary button — optional | e.g. 'Clear search', 'Browse all listings'. Not always present. |
| No search results | 🔍 icon + search-specific message | Shown when search returns 0 results. |
| No listings | 📭 icon + category-specific message | Shown when category has 0 active listings. |
| No saved items | 🔖 icon + 'Nothing saved yet' | Shown on saved items tab. |
| No dashboard items | ≡ icon + 'No listings yet' | Shown on seller dashboard when 0 listings. |

## **3.14 Skeleton Loading States**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Animation | shimmer — bg-position -400% → +400%, 1.6s infinite | Gradient wash from left to right. |
| Colours | \--bg-2 base (25%), --bg-3 highlight (50%), --bg-2 return | Warm-toned shimmer matches palette. |
| Card skeleton | 4:3 block (image) + 3 lines body (price, title×2, meta) | Same dimensions as real card. |
| Grid skeleton | Full grid width × 6 skeleton cards on initial load | Replaced by real cards on data arrival. |
| Sidebar skeleton | 3 grey bars at nav item positions | Shows while categories load. |
| Detail skeleton | 16:9 image block + info lines | Shows while detail panel data loads. |

# **4\. Page: Browse / Homepage**

The primary landing page for all users. Shows the listing grid with category navigation, filter bar, and sort controls.

## **4.1 Page Layout**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| URL | / or /browse | Root path redirects to browse. |
| Auth required | No — public page | All users including unauthenticated can browse. |
| Grid area | main (CSS Grid) | Sidebar + topbar always visible on desktop. |
| Content header | Sticky top:0 inside main area, z-index 10 | Breadcrumb row + filter row. |
| Verify banner | Above content header | Amber strip prompting email verification. Dismissible. |
| Grid container | padding 24px (14px mobile) | Contains the listing grid. Scrolls with main area. |

## **4.2 Verify Banner**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Trigger | User is logged in but emailVerified: false | Not shown to logged-out users or verified users. |
| Background | \--amber-bg (#fef3c7), border-bottom 1px #fde68a | Warm amber strip full width. |
| Text | 12.5px --amber-dim: 'Verify your LPU email to unlock posting and contact reveal.' |     |
| CTA | 'Verify now →' bold underline inline link | Opens verify email flow or resends OTP. |
| Icon | 📧 emoji left of text |     |
| Position | Top of main area, above sticky content header | Not inside the sticky zone — scrolls with page. |

## **4.3 Content Header**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Position | sticky top:0 inside main, z-index 10 | Sticks below topbar when user scrolls grid. |
| Background | \--surface white, border-bottom 1px --border-2 |     |
| Padding | 16px 24px (12px 14px mobile) |     |
| Breadcrumb row | Above filter row, mb 12px | See Breadcrumb component 3.11. Hidden mobile. |
| Filter row | flex, align-center, gap 8px, flex-wrap | Condition chips + separator + count + sort. |
| Condition chips | All / New / Like New / Good / Used — filter-chip component | Active chip: --ink bg + white text. Default: white bg + border. |
| Results count | '{n} listing{s}' — DM Mono bold + DM Sans regular | Updates live as filters change. Fade-in animation on change. |
| Separator | 1px × 20px --border-2 | Between chips and count. |
| Sort dropdown | select element, 11px DM Sans, --border-2 border, --r radius | Options: Newest first / Oldest first / Price Low→High / Price High→Low / Most viewed. |

## **4.4 Listing Grid**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Container | CSS Grid auto-fill minmax(220px, 1fr) | Cards reflow naturally. No fixed column count needed. |
| Gap | 16px default, 10px mobile, 18px 1280px+ |     |
| Enter animation | fadeUp 320ms --ease with 30ms stagger | Each card animates in sequence. Max 12 stagger classes. |
| Re-render trigger | grid key increments on filter/sort/search change | Forces full re-animation of grid. |
| Pagination | V1: all results shown (capped at 50) | 'Load more' button for V1.1. |
| Empty state | See 3.13 — shown when sorted.length === 0 |     |

# **5\. Page: Listing Detail Drawer**

Opens when a listing card is clicked. Right-side drawer on desktop (≥ 1024px), bottom sheet on mobile. The browse grid remains visible and interactive behind the backdrop on desktop.

## **5.1 Container**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Desktop (≥ 1024px) | Fixed right:0 top:0 bottom:0, width min(680px, 90vw) | Right-side drawer. Grid visible behind backdrop. |
| Mobile (< 640px) | Fixed bottom:0 left:0 right:0, height 90dvh, top radius --r-xl | Bottom sheet. Full width. |
| Backdrop | rgba(10,9,4,0.4) + blur(6px), z-index 400 | Clicking backdrop closes drawer. |
| z-index | 500 (drawer), 400 (backdrop) | Above all page content. |
| Background | \--surface white |     |
| Shadow | \-12px 0 48px rgba(0,0,0,0.14) | Desktop only — casts shadow leftward onto grid. |
| Enter animation | slideR 320ms --ease (desktop) / slideUp 320ms --ease (mobile) |     |
| Exit animation | scaleOut 180ms --ease-in | Quick exit on both platforms. |
| Scroll lock | document.body.style.overflow = 'hidden' while open | Prevents background scroll on mobile. |
| Escape key | Closes drawer | addEventListener keydown Escape. |

## **5.2 Image Strip**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Aspect ratio | 16:9 width of panel | Fixed ratio. Height varies by panel width. |
| Image | object-fit cover, 100% fill |     |
| Close button | top:14px left:14px, 36×36px circle, rgba(10,9,4,0.55) bg, blur(6px) | ← arrow. Hover: darker bg + scale(1.06). |
| Save button | top:14px right:14px, 36×36px circle, rgba(255,255,255,0.92) bg, blur(6px) | ♡ or 🔖. Spring scale 1.1 on hover. |
| Image dots | bottom:12px centred, flex gap 5px | One dot per image. Active dot: white, 18px wide, 6px tall, radius 3px. Inactive: 6×6px white 45% opacity. |
| Dot transition | width 250ms --ease | Active dot expands from 6px to 18px width. |

## **5.3 Scrollable Info Section**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Title | Fraunces 700 18px, --ink, line-height 1.35 | flex:1. Letter-spacing -0.01em. |
| Price | DM Mono 500 24px, --ink, letter-spacing -0.03em | Right-aligned in same row as title. flex-shrink 0. |
| Negotiable label | DM Sans 700 10px uppercase, --amber, mt 2px | 'NEGOTIABLE'. Only shown if listing.negotiable is true. |
| Badge row | flex, gap 6px, flex-wrap, mb 20px | Condition badge + category badge. |
| Category badge | \--bg-2 bg, --ink-3 text, same dimensions as condition badge | Shows category name with icon. |
| Details table | \--surface-2 bg, 1px --border-2 border, --r-md radius, overflow hidden | 4 rows: Seller, Location, Posted, Views. |
| Table row | flex between align-center, 10px 14px padding, border-bottom 1px --border-2 | Last row has no border-bottom. |
| Table key | DM Sans 600 11px, --ink-4, width 64px flex-shrink 0 | Left cell. Fixed width for alignment. |
| Table value | DM Sans 400 13px, --ink | Right cell. Seller row includes inline avatar. |
| Description heading | DM Sans 700 11px uppercase, --ink-4, letter-spacing 0.08em, mb 8px |     |
| Description body | DM Sans 400 13.5px, --ink-2, line-height 1.8 | 2–5 sentences of item description. |
| Report link | DM Sans 11.5px, --ink-4, text-decoration underline | '⚑ Report this listing'. Hover: --red colour. mb 80px to clear sticky footer. |

## **5.4 Sticky Contact Footer**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Position | Sticky bottom of drawer, flex-shrink 0 | Does not scroll with content. Always visible. |
| Background | \--surface white, border-top 1px --border-2 |     |
| Padding | 16px 24px |     |
| Safe area | padding-bottom accounts for iOS home bar | env(safe-area-inset-bottom) + 16px. |

### **Contact Button States (Full Specification)**

|     |     |     |
| --- | --- | --- |
| **State** | **Trigger** | **Visual / Behaviour** |
| **Locked** | Not logged in | Grey button, opacity 0.6: 'Sign in to Contact Seller'. Tapping redirects to /login with returnTo param. |
| **Unverified** | Logged in, emailVerified false | Amber button: 'Verify Email to Contact'. Tapping opens verify email modal or scrolls to banner. |
| **Ready** | Logged in + verified | Ink black full-width button: '📱 Contact Seller'. Active, full opacity. |
| **Loading** | Button clicked, API in flight | Button disabled. Text replaced by spinner SVG animation. Width unchanged. |
| **Opening** | waLink received from server | window.open(waLink). Button briefly shows 'Opening WhatsApp…' 800ms then resets to Ready. |
| **No Number** | Seller has no phone set | Button text: 'Seller contact not available'. Disabled. --ink-5 colour. Help text below: 'The seller hasn't added a contact number yet.' |
| **Rate Limited** | 20 requests today exceeded | Button text: 'Daily limit reached'. Disabled. Sub-text: 'Try again tomorrow.' |
| **Error** | API call failed (500 etc) | Toast: 'Something went wrong. Please try again.' Button resets to Ready state. |

The phone number is NEVER displayed anywhere in the UI under any state. The waLink passes directly to window.open() — it never enters any DOM element that renders as visible text.

# **6\. Page: Sell / List Item Modal**

Opens from the 'List Item' CTA in topbar or sidebar. Centred dialog on desktop/tablet, bottom sheet on mobile. Two-step wizard.

## **6.1 Container**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Desktop/Tablet (≥ 768px) | Fixed centred, width min(620px, 92vw), max-height 88dvh, --r-xl radius | Centred modal with backdrop. |
| Mobile (< 768px) | Fixed bottom sheet, 100% width, max-height 90dvh, top radius --r-xl |     |
| Background | \--surface white |     |
| Shadow | \--shadow-lg |     |
| Scroll lock | body overflow hidden while open |     |
| Enter desktop | scaleIn 280ms --spring — scale(0.96)→scale(1) |     |
| Enter mobile | slideUp 320ms --ease |     |
| Exit | scaleOut 180ms --ease-in |     |
| Drag handle | Mobile only — 36×4px bar, --border colour, centred top | Visual affordance for sheet drag. |

## **6.2 Modal Header**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Title | Fraunces 600 18px, letter-spacing -0.02em | Step 1: 'List an Item'. Step 2: 'Add Photos & Details'. |
| Subtitle | DM Sans 11px, --ink-4, mt 2px | 'Step 1 of 2' / 'Step 2 of 2'. |
| Progress bars | flex gap 4px — two animated bars | Active bar: 24px wide, --ink bg. Inactive: 10px wide, --border-2 bg. Width transitions 280ms. |
| Close button | 22px ×, --ink-4 | Rotates 90deg + colour → --ink on hover. Aria-label 'Close'. |
| Border | border-bottom 1px --border-2 | Separates header from form body. |

## **6.3 Step 1 — Item Details**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Item Title | Full-width text input, max 100 chars | Label: 'ITEM TITLE \*'. Character counter right-aligned below. Required. |
| Category | Full-width select dropdown | Label: 'CATEGORY \*'. Options: all categories except 'All'. Required. |
| Condition | Full-width select dropdown | Label: 'CONDITION \*'. Options: New / Like New / Good / Used / Damaged. Required. |
| Price | Input with ₹ prefix symbol inside left edge | Label: 'ASKING PRICE (₹) \*'. Type number. Min 0. Required. |
| Negotiable | Checkbox right of price input | DM Sans 500 13px label. accent-color --ink. |
| Pricing tip card | \--bg bg, --border-2 border, --r radius, 12px 14px | 💡 icon + tip text in --ink-3 12px. Always visible. |
| Continue btn | Full-width ink button, 11px padding | Disabled (opacity 0.4) until all 4 required fields filled. |
| Two-col layout | Category + Condition side by side at ≥ 480px | Stacks vertically on narrow mobile. |

## **6.4 Step 2 — Photos & Description**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Photo upload zone | 2px dashed --border, --r-md radius, 32px 24px padding, --bg bg | Centered 📸 icon + 'Drag & drop or click to upload' heading + format hint below. |
| Zone hover | \--border → --ink border, --bg → --bg-2 bg | 140ms transition. Signals interactivity. |
| Photo format hint | DM Sans 12px, --ink-4: 'JPG, PNG, WebP — max 5MB · First photo is the cover' |     |
| Description | Full-width textarea, 4 rows, resize vertical | Label: 'DESCRIPTION'. Max 500 chars. Counter below. Optional. |
| Preview card | \--surface bg, --border-2 border, --r-md, overflow hidden | Header: 'LISTING PREVIEW' in uppercase grey label. Body: title + price + badges. |
| Preview title | DM Sans 600 14px | Shows form.title or 'Item title' placeholder. |
| Preview price | DM Mono 500 18px | Shows ₹0 until price entered. en-IN format. |
| Preview badges | Condition + category + negotiable badges | Conditionally shown based on form state. |
| AI notice | \--amber-bg bg, #fde68a border, --r radius | ⚡ icon + 'AI-assisted review' text in --amber-dim 12px. |
| Back btn | Secondary button flex:1 | ← Back. Returns to Step 1 with slide-right animation. |
| Submit btn | Amber button flex:2 | Submit for Review. Always enabled in Step 2. |
| Step transition | Step 1→2: slideInR. Step 2→1: slideInL | 240ms --ease. Key prop forces re-mount on step change. |

# **7\. Page: Seller Dashboard**

The seller's personal listing management area. Accessible via 'My Listings' in sidebar or bottom nav. Requires auth.

## **7.1 Page Layout**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| URL | /dashboard |     |
| Auth required | Yes — redirect to /login if not authenticated |     |
| Verified required | No — unverified users can see their dashboard but see a verify banner |     |
| Page title | Fraunces 700 28px: 'My Listings' | Breadcrumb: UniDeal › My Listings. |
| Layout | Same sidebar + topbar + main area grid |     |

## **7.2 Stats Row**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Container | flex gap 12px, mb 20px, flex-wrap | 3 stat cards in a row. |
| Stat card | \--surface bg, --border-2 border, --r-md, 14px 16px padding |     |
| Stat value | DM Mono 600 28px, --ink | Large prominent number. |
| Stat label | DM Sans 12px, --ink-4, mt 4px | e.g. 'Total Listings', 'Total Views', 'Contact Requests'. |
| Card widths | flex:1 each, min-width 120px | Wraps on mobile. |

## **7.3 Tab Bar**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Tabs | All / Active / Pending / Rejected / Sold / Expired | Count in parenthesis next to each tab label. |
| Container | flex, border-bottom 1px --border-2, mb 0 | Full width below page title. |
| Tab item | DM Sans 500 13px, --ink-4, 10px 14px padding, cursor pointer |     |
| Active tab | DM Sans 600 13px, --ink, border-bottom 2px solid --ink, mb -1px | Border overlaps container border-bottom. |
| Hover tab | \--ink colour, --bg-2 bg | 100ms transition. |
| Count badge | DM Mono 11px in parentheses after label | e.g. 'Active (8)'. Updates when listings change. |

## **7.4 Listing Table Row**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Container | flex align-center, gap 12px, padding 12px 0, border-bottom 1px --border-2 | Full width. Hover: --bg tint. |
| Thumbnail | 60×60px, --r radius, object-fit cover | flex-shrink 0. --bg-2 placeholder if image fails. |
| Title | DM Sans 600 14px, --ink, flex:1, line-clamp 2 | Truncates to 2 lines. |
| Badges | Category + condition badges below title | Smaller than browse cards — 10px text. |
| Price | DM Mono 500 14px, --ink | Right of badges area. ₹ format. |
| Status badge | Coloured pill badge | Active: green bg. Pending: amber bg. Rejected: red bg. Sold: grey bg. Expired: --ink-5 bg. |
| Views | DM Mono 11px, --ink-4 | '{n} views'. Right-aligned. |
| Posted | DM Sans 11px, --ink-5 | e.g. '2d ago'. Right-aligned. |
| Action buttons | Edit (✏), Mark Sold (✓), Delete (🗑) | Icon-only buttons 32×32px. Hover reveal on desktop. Always visible on mobile. |
| Edit btn | \--ink-4 icon, hover --ink | Opens sell modal pre-filled with listing data. |
| Sold btn | \--green icon, hover darker | One-tap mark as sold. Confirmation toast. |
| Delete btn | \--ink-4 icon, hover --red | Opens confirm delete dialog. Soft delete only. |
| Rejected row | Light --red-bg tint, red status badge | 'See reason' link below title — opens rejection reason tooltip. |
| Pending row | Opacity 0.8, amber status badge | Actions: Edit only. Cannot mark sold or delete while pending. |

# **8\. Page: User Profile**

Account settings and personal information management. Accessible via avatar in topbar or 'My Profile' in sidebar.

## **8.1 Page Layout**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| URL | /profile |     |
| Auth required | Yes |     |
| Page title | Fraunces 700 28px: 'My Profile' | Breadcrumb: UniDeal › My Profile. |
| Content layout | Two-column at ≥ 768px — 60% form left + 40% status card right | Single column stacked on mobile. |

## **8.2 Form Sections (Left Column)**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Section container | \--surface bg, --border-2 border, --r-md, padding 20px 24px, mb 16px | Each section is a white card. |
| Section title | DM Sans 700 13px, --ink-2, mb 14px, pb 10px, border-bottom 1px --border-2 |     |
| Basic Info fields | Display Name (text), Bio (textarea 3 rows), Campus Location (text) | All optional. Help text below each. |
| Contact Numbers section | Two fields — Account Phone and WhatsApp Number | See below for full spec. |
| Account Phone | Input, label 'ACCOUNT PHONE', lock icon 🔒 next to label | Help text: 'Used for OTP and platform notifications only. Never shared with other users.' Text colour --ink-4. |
| WhatsApp Number | Input, label 'WHATSAPP NUMBER', green icon next to label | Help text: 'Buyers will be connected to this number. Leave blank to use Account Phone.' Text colour --ink-4. |
| Visual separation | Divider between Account Phone and WhatsApp fields | Prevents confusion between the two fields. |
| Email field | Read-only input, disabled styling | Shows verified email address. Cannot be changed in V1. |
| Verified badge | Green ✓ badge inline right of email | DM Sans 11px, --green text, --green-bg bg, --r-sm radius. |
| Change Password | Secondary button below email | Triggers forgot-password email flow. |
| Save Changes btn | Full-width --amber button at bottom of left column | Disabled until any field has been changed. |
| Save success | Toast: 'Profile updated ✓' | Button returns to default state after save. |

## **8.3 Account Status Card (Right Column)**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Container | \--surface bg, --border-2 border, --r-md, padding 20px | Sticky top: calc(topbar-height + 24px) on desktop. |
| Avatar | 64px circle, user initials, coloured bg | Centred top of card. |
| Display name | DM Sans 700 16px below avatar |     |
| Email | DM Sans 12px, --ink-4 below name | Truncated if long. |
| Verified badge | Green pill: '✓ Verified' or amber pill: '⚠ Unverified' | Prominent below email. |
| Stats | Member since · Listings posted · Contact requests received | DM Mono values + DM Sans labels. Dividers between. |
| Verify nudge | Shown only if unverified — amber CTA card at bottom of status card | Same style as sidebar verify nudge. |

# **9\. Page: Auth — Login, Register, Verify Email**

Standalone pages — no sidebar, no topbar nav links. Centred card layout. Simple and frictionless.

## **9.1 Auth Page Shell**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Layout | Full-height centred — flex column align-center justify-center, --bg bg | No sidebar. No bottom nav. |
| Card | \--surface bg, --border-2 border, --r-xl radius, --shadow-md, padding 36px 40px | width min(440px, 92vw). |
| Logo | UniDeal logo icon + wordmark centred at top of card | Same as topbar logo. Links to /. |
| Heading | Fraunces 600 22px centred | Page-specific: 'Welcome back', 'Create account', 'Check your email'. |
| Sub-heading | DM Sans 14px, --ink-4 centred, mb 24px | Context text below heading. |

## **9.2 Login Page (/login)**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Email field | Full-width input, label 'EMAIL', type email | Autofocus on mount. |
| Password field | Full-width input, label 'PASSWORD', type password | Show/hide password toggle (eye icon right). |
| Submit button | Full-width --ink button: 'Sign In' | Loading spinner while API call in flight. |
| Error state | Red inline message below password: 'Incorrect email or password' | Generic message — no email enumeration. |
| Forgot password | Ghost text link below password field: 'Forgot password?' | Triggers password reset email flow. |
| Register link | Below submit: 'Don't have an account? Register →' | Links to /register. |
| Return redirect | On success: redirects to returnTo query param or / | Preserves intended destination. |

## **9.3 Register Page (/register)**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Display Name | Full-width text input, label 'DISPLAY NAME' | Required. Max 40 chars. |
| Email | Full-width email input, label 'EMAIL' | Required. Any domain V1. |
| Password | Full-width password input, label 'PASSWORD' | Min 8 chars. Show/hide toggle. |
| Submit button | Full-width --ink button: 'Create Account' | Loading state on submit. |
| Terms note | DM Sans 11px --ink-4 below button: 'By registering you agree to our Terms of Service' | Terms links to /terms. |
| Login link | Below: 'Already have an account? Sign in →' | Links to /login. |
| Success | Redirect to /verify-email after successful registration |     |

## **9.4 Verify Email Page (/verify-email)**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Heading | 'Check your email' | Fraunces 600 22px. |
| Sub-text | 'We sent a 6-digit code to {email}. Enter it below.' | \--ink-4 14px. |
| OTP input | 6 single-character inputs side by side, auto-advance | Each 48×48px, centred text, --r radius. Auto-advance on character entry. |
| Verify button | Full-width --ink button: 'Verify Email' | Enabled only when all 6 digits filled. |
| Resend link | 'Didn't receive it? Resend' — ghost link | 60-second cooldown after resend. Shows countdown timer. |
| Success | Green tick animation → redirect to / after 1.5s | Toast: 'Email verified ✓'. |
| Error | Red inline: 'Invalid or expired code' | OTP inputs shake animation (CSS keyframe). |

# **10\. Page: Admin Moderation Queue**

Accessible only to users with role: admin or super_admin. Separate sidebar navigation with admin-specific items.

## **10.1 Admin Sidebar**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Nav items | Pending Queue (badge) / All Listings / Reports (badge) / Users / Categories / Activity Log / System Config |     |
| Pending badge | Red count badge on 'Pending Queue' item | Shows number of listings awaiting review. |
| Reports badge | Amber count badge on 'Reports' item | Shows number of unreviewed reports. |
| Admin indicator | Small 'ADMIN' pill in topbar avatar area | DM Sans 600 9px uppercase, --red text, --red-bg. |

## **10.2 Pending Queue Page**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Page title | Fraunces 700 28px: 'Pending Queue' |     |
| Subtitle | DM Sans 14px --ink-4: '{n} listings awaiting review — {x} flagged by AI' |     |
| Filter tabs | All / AI Flagged / Manual Submit | Same tab style as dashboard. |
| Sort | Newest / AI Risk High→Low | Default: AI Risk High→Low (most dangerous first). |

## **10.3 Moderation Card**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Container | \--surface bg, --border-2 border, --r-md, overflow hidden, mb 12px | Horizontal layout. Hover: --shadow. |
| Thumbnail | 120×90px left, object-fit cover | flex-shrink 0. |
| Title | DM Sans 700 15px, --ink, line-clamp 2 |     |
| Badges | Category + condition + price in DM Mono 14px | Below title. |
| Seller info | Avatar 20px + seller name + 'posted {time}' | Below badges. --ink-4 14px. |
| AI score | Label 'AI RISK' + bar meter (80px wide, 6px tall) | Green 0–33% / Amber 34–66% / Red 67–100%. Percentage text right. |
| AI Flagged badge | Red pill: 'AI FLAGGED' — shown only if confidence > 0.8 | Top-right of card absolute. |
| Approve button | Outlined green: '✓ Approve' | Hover: fill green bg. Triggers status → active. |
| Reject button | Outlined red: '✗ Reject' | Hover: fill red bg. Opens rejection reason modal. |
| Flagged card | Light red tint background rgba(185,28,28,0.04), red left border 3px | Visually distinguishes high-risk listings. |

## **10.4 Rejection Reason Modal**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Trigger | Reject button on moderation card |     |
| Type | Small centred modal 400px wide |     |
| Heading | 'Reject Listing' | Fraunces 600. |
| Reason select | Dropdown — Prohibited item / Misleading / Poor quality / Spam / Other | Required. Submit disabled until selected. |
| Notes field | Optional textarea 2 rows | Additional context sent to seller. |
| Confirm button | Full-width --red button: 'Reject Listing' | Triggers status → rejected + Resend email to seller. |
| Cancel | Secondary button | Closes modal, no action taken. |

## **10.5 Activity Log**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Table columns | Action / Performed By / Target / Timestamp |     |
| Action | Colour-coded pill badge | APPROVED: green. REJECTED: red. BANNED: dark red. CONTACT_LINK_GENERATED: blue. |
| Performed By | Avatar 20px + admin display name |     |
| Target | Listing title (truncated) or username | Clickable — opens relevant item. |
| Timestamp | DM Mono 11px, --ink-4 | Relative time + full datetime on hover tooltip. |
| Pagination | 20 items per page, prev/next buttons |     |
| IP column | Hidden by default — 'Show IPs' toggle for super admin only | Masked to /24 subnet. |

# **11\. Interaction Patterns**

## **11.1 Page Load Sequence**

- Topbar renders immediately — layout stable, no shift
- Sidebar renders with skeleton loading bars in nav item positions
- Grid area shows 6 skeleton cards (same size as real cards)
- Real data replaces skeletons — cards animate in with fadeUp + stagger (30ms per card)
- Category counts update last — no layout shift

## **11.2 Category / Filter Change**

- Filter chip tapped → active state updates instantly (no loading indicator)
- Grid area fades out in 100ms, new results fade in 200ms
- gridKey prop increments → new stagger animation sequence plays
- Results count updates with fade-in on new value
- URL updates with ?category= and ?condition= params — shareable links

## **11.3 Card Hover Sequence**

- Mouse enters: border-color → --border (150ms), shadow → --shadow-md (200ms), translateY(-2px) (200ms), image scale 1.04x (400ms)
- Mouse leaves: all properties reverse with same durations
- Touch devices: hover states disabled via @media(hover:none). Active state only (scale 0.98, 80ms)

## **11.4 Save Button Interaction**

- Tap: scale spring animation 0.8→1.1→1.0 via --spring easing, 200ms
- State toggles: ♡ → 🔖 with spring pop animation
- Optimistic UI: state updates immediately, API call fires in background
- On API failure: state reverts, error toast shown

## **11.5 Overlay Open/Close**

- Open trigger → backdrop fades in 200ms simultaneously with panel animation
- Panel enter: slideR (drawer) or slideUp (sheet) or scaleIn (modal) — 280–320ms --ease
- Scroll lock applied to body immediately on open
- Backdrop click / Escape key / Close button → exit animation 180ms --ease-in
- Scroll lock released, panel unmounted from DOM after exit completes

## **11.6 Form Validation**

- Validation is real-time after first blur — not on every keystroke
- Error border (--red, 1.5px) + error message below field fade in 150ms
- Submit button stays disabled while any required field is empty or invalid
- On successful submit: form closes/resets, success toast appears
- Character counters update on every keystroke — no debounce needed

## **11.7 API Loading States**

- Contact button: spinner replaces label, button width unchanged, disabled
- Form submit: amber button shows spinner, all inputs disabled during flight
- Page-level data: skeleton cards shown, never blank white space
- Inline actions (mark sold, approve): that row/card shows opacity 0.6 + spinner, other items remain interactive

# **12\. Accessibility & Responsive Rules**

## **12.1 Keyboard Navigation**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Focus ring | 2px solid --amber, 3px offset, --r-sm | Applied via :focus-visible only — not on mouse click. |
| Tab order | Logical DOM order — topbar → sidebar → main content | No tabindex manipulation except modals. |
| Modal focus trap | Focus constrained to modal while open | First focusable element receives focus on open. |
| Escape key | Closes all overlays — drawer, modal, sheet | Global keydown listener added on mount, removed on unmount. |
| Enter key | Activates focused button or link | Native browser behaviour — no custom override. |
| Arrow keys | Navigate filter chips and tab bars | roving tabindex pattern for chip groups. |

## **12.2 ARIA**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Overlays | role='dialog', aria-modal='true', aria-label='{title}' | Applied to sell modal, detail drawer. |
| Breadcrumb | nav aria-label='Breadcrumb' |     |
| Tab bars | role='tablist', each tab role='tab', aria-selected | Dashboard tabs, admin tabs. |
| Save button | aria-label='Save listing' / 'Unsave listing' | State-aware label. |
| Contact button | aria-label reflects current state | e.g. 'Contact seller', 'Verify email to contact', 'Rate limit reached'. |
| Toast | role='status', aria-live='polite' | Screen readers announce toast messages. |
| Grid | No ARIA grid role needed — semantic button elements inside | Each card is a button with aria-label='{title}'. |
| Images | alt='{listing title}' on all listing images | Decorative images: alt=''. |
| Loading states | aria-busy='true' on loading containers | Screen readers aware of loading. |

## **12.3 Colour Contrast**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Body text on --bg | \--ink (#19180f) on #f7f5f0 = 16.4:1 | AAA — exceeds WCAG AA (4.5:1). |
| Body text on --surface | \--ink (#19180f) on #ffffff = 19.4:1 | AAA. |
| Secondary text | \--ink-3 (#6b6858) on --surface = 5.1:1 | AA — meets WCAG AA. |
| Amber on white | \--amber (#c07a1a) on #fff = 4.6:1 | AA — passes for large text + UI components. |
| White on --amber btn | #fff on #c07a1a = 4.6:1 | AA — meets for button text. |
| White on --ink btn | #fff on #19180f = 19.4:1 | AAA. |
| Placeholder text | \--ink-4 (#9b9789) on --surface = 2.7:1 | Below AA — intentional, placeholder not interactive content. |

All interactive text meets WCAG AA (4.5:1) minimum. Placeholder text intentionally below — it is not conveying required information.

## **12.4 Touch & Mobile**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Minimum tap target | 44×44px on touch devices via @media(hover:none) | Apple HIG and Material Design minimum. |
| Touch hover | @media(hover:none) disables all hover CSS transforms | Prevents sticky hover states on touch. |
| iOS safe areas | env(safe-area-inset-\*) applied to topbar, sheets, modals | Handles notch and home indicator. |
| Momentum scroll | \-webkit-overflow-scrolling: touch on scrollable zones | Smooth inertia scrolling on iOS. |
| Tap highlight | \-webkit-tap-highlight-color: transparent on all buttons | Removes grey flash on tap. |
| dvh units | 100dvh for full-height containers instead of 100vh | Handles mobile browser chrome correctly. |
| Font size | \-webkit-text-size-adjust: 100% on html | Prevents iOS from auto-scaling text on rotate. |

## **12.5 Responsive Component Rules**

|     |     |     |
| --- | --- | --- |
| **Element** | **Value / Spec** | **Notes / States** |
| Topbar < 640px | Hide logo sub-label, reduce padding to 14px | Logo icon + wordmark remain. |
| Topbar < 1024px | Hide stat chips, show hamburger button | Search bar gets full flex:1 width. |
| Sidebar < 1024px | Hidden — becomes hamburger drawer |     |
| Breadcrumb < 640px | Hidden — saves vertical space |     |
| Two-col forms < 768px | Stack to single column | Category + Condition fields stack in sell modal. |
| Detail drawer mobile | Right drawer → bottom sheet | Animation changes from slideR to slideUp. |
| Sell modal mobile | Centred modal → bottom sheet |     |
| Profile layout < 768px | Two columns → single column stack | Status card moves below form. |
| Dashboard table < 640px | Show thumbnail + title + status + action only | Price, views, date hidden to reduce clutter. |
| Admin queue < 768px | Horizontal moderation card → vertical stack | Thumbnail above content. |

_End of UI/UX Specification — Complete Component Reference V1_