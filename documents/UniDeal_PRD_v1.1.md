**UniDeal**

**Product Requirements Document**

| **Field** | **Value** |
| --- | --- |
| Version | 1.1 |
| --- | --- |
| Date | February 2026 |
| --- | --- |
| Status | Approved — Ready for Development |
| --- | --- |
| Author | Solo Developer |
| --- | --- |
| Platform | Next.js 14+ Web App |
| --- | --- |
| Budget | ₹0 / month — Entirely Free Tier |
| --- | --- |
| Launch URL | unideal.vercel.app |
| --- | --- |

# 1\. Executive Summary

UniDeal is a zero-budget university campus marketplace that enables students to buy and sell physical items in a structured, trustworthy, and searchable environment. It replaces the chaos of WhatsApp groups — where listings get buried, sellers are unverifiable, and discovery is nearly impossible — with an organised platform built specifically for campus life.

The product launches at Lovely Professional University (LPU) and is architected to expand to other campuses. Version 1 focuses entirely on the buy/sell flow, deliberately excluding complexity such as rental, exchange, barter, or in-app chat.

# 2\. Problem Statement

## 2.1 Current State

Students buying and selling items on campus currently rely on WhatsApp groups. This creates several compounding problems:

- Listings disappear within hours as new messages push them out of view
- No category or price filtering — discovery requires scrolling through hundreds of messages
- No seller verification — buyers have no way to assess trust
- Contact details are publicly exposed to every group member
- No mechanism to mark items as sold, leading to repeated enquiries on sold goods
- Admins cannot moderate content — fake or inappropriate listings persist

## 2.2 Core Insight

Students don't need a better WhatsApp. They need a structured discovery layer on top of it. UniDeal is that layer — browse, find, and connect on UniDeal, then close the deal on WhatsApp.

# 3\. Product Goals

## 3.1 Primary Goals (V1)

- Replace WhatsApp group listings with a structured, searchable marketplace
- Protect seller contact details behind email verification — contact revealed as a WhatsApp deep link only, never as a displayed phone number
- Enable admin moderation of all listings before they go live
- Operate entirely on free-tier infrastructure at zero monthly cost
- Launch within 6 weeks as a solo developer

## 3.2 Non-Goals (V1)

- In-app chat or messaging system — WhatsApp handles this
- Rental or exchange transactions — coordination complexity and legal risk
- Mobile app (iOS / Android) — web-first for V1
- Payment processing or escrow — deals close off-platform
- Reviews and ratings — useless without transaction volume at launch

# 4\. User Personas

## 4.1 The Seller — Final Year Student

Graduating student with items accumulated over 3–4 years: textbooks, electronics, furniture, appliances. Has limited time and wants a fast, reliable way to find buyers on campus before leaving. Currently posts to WhatsApp groups but finds it unreliable.

## 4.2 The Buyer — New or Mid-Year Student

Newly enrolled or mid-program student looking for affordable second-hand goods. Knows items are available on campus but has no reliable way to discover them. Price-sensitive and values trust in the seller.

## 4.3 The Admin — Designated Campus Moderator

Staff or trusted student assigned to moderate listings. Reviews flagged content and AI-flagged listings. Needs a clean moderation queue, ability to approve or reject with reasons, and visibility into user activity.

# 5\. Feature Specification

## 5.1 Authentication & Verification

- Open signup — any email address accepted
- Firebase Email/Password authentication with HTTP-only JWT session
- Email verification required before posting or revealing seller contact
- Unverified users can browse freely but cannot post or access contacts
- Role system: user → admin → super_admin

## 5.2 Listings

- Any physical item can be listed — not limited to books or electronics
- Required fields: title, description, price, category, condition, minimum 1 image
- Up to 6 images per listing, max 5MB each, compressed on upload via Cloudinary
- Condition enum: New, Like New, Good, Used, Damaged
- All listings start with status: pending — require admin approval before going live
- Listings expire automatically after 60 days
- Sellers can mark items as Sold, edit details, or delete their own listings
- URL-friendly slugs generated with nanoid suffix for uniqueness

## 5.3 Listing Detail — Drawer Pattern

Listing detail does not navigate to a full page. When a user clicks a listing card on browse, a right-side drawer opens on desktop (min(680px, 90vw)) and a bottom sheet opens on mobile (90dvh). The browse grid remains visible and interactive behind the backdrop. The URL updates to /listing/\[slug\] for shareability. Direct navigation to a shared link renders the listing as a standalone full-page view.

## 5.4 Categories

- 6 initial categories: Books & Notes, Electronics, Furniture, Clothing, Sports & Fitness, Miscellaneous
- Dynamic — admins add, hide, or reorder without code changes or redeployment
- Only super_admin can rename or delete categories; deleting is blocked if active listings exist

## 5.5 Contact Flow

Seller contact is never exposed publicly. The phone number is never displayed as text anywhere in the UI — not in the DOM, not as a tooltip, not as a rendered element. The server constructs a wa.me deep link and passes it directly to window.open(). Three UI states exist based on auth and verification:

| **User State** | **What They See** | **Behaviour** |
| --- | --- | --- |
| Guest (not logged in) | Lock icon button, greyed out | Redirects to /login with returnTo param |
| --- | --- | --- |
| Logged in, unverified email | Amber 'Verify Email to Contact' button | Opens verify email flow or scrolls to verify banner |
| --- | --- | --- |
| Logged in + verified | 'Contact Seller' button — full opacity | API call → server returns waLink only → window.open(waLink) |
| --- | --- | --- |
| Rate limited (50/day reached) | 'Daily limit reached' — button disabled | Sub-text: 'Try again tomorrow' |
| --- | --- | --- |
| Seller has no phone set | 'Seller contact not available' — disabled | Help text: 'The seller hasn't added a contact number yet' |
| --- | --- | --- |

Contact reveal endpoint rate limited: 50 requests per user per day. The /contact API endpoint returns waLink only — no phone number field in the response.

## 5.6 Sell / List Item — Modal Wizard

The sell flow is a two-step modal wizard, not a routed page. It is triggered by the List Item CTA in the topbar or sidebar. Step 1 collects title, category, condition, price, and negotiable flag. Step 2 collects photos and description. On desktop/tablet it renders as a centred dialog (min(620px, 92vw)). On mobile it renders as a bottom sheet (100% width, 90dvh). Editing an existing listing opens the same modal pre-filled.

## 5.7 Search & Discovery

- Full-text search across listing titles and descriptions
- Filter by category, condition, and price range
- Sort by: Newest / Oldest / Price Low→High / Price High→Low / Most viewed
- Browse by category with listing counts displayed
- URL updates with ?category= and ?condition= params — shareable filter links
- Save/wishlist feature — verified users can save listings

## 5.8 Admin Moderation

- Moderation queue showing all pending listings
- AI-flagged listings (confidence > 0.8) automatically float to the top of the queue
- Admin can approve, reject (with mandatory reason from dropdown), or delete any listing
- User management: view, ban, unban, change roles
- Report review: students can report listings; admin reviews and dismisses
- Full audit log of all admin actions — colour-coded action pills, paginated

## 5.9 AI Quality Checks

- Three-layer check runs silently in the background after listing submission
- Gemini 1.5 Flash: detects category mismatch (e.g., book listed under Electronics)
- Cloudinary Moderation: flags inappropriate or explicit images (500/month free)
- Rule-based keyword filter: catches spam, placeholder text, and fake listings
- User always sees a normal 'under review' message — AI is never mentioned
- If AI is unavailable, listing proceeds normally — fail open, never block

# 6\. User Stories

## 6.1 Student (Seller)

- As a student, I want to list my old textbooks so that other students can find and buy them
- As a seller, I want only verified users to be able to contact me via WhatsApp so that my privacy is protected
- As a seller, I want to mark my item as sold so that I stop receiving enquiries
- As a seller, I want to edit my listing price so that I can negotiate over time

## 6.2 Student (Buyer)

- As a buyer, I want to search by category so that I can find relevant items quickly
- As a buyer, I want to filter by price and condition so that I find items within my budget
- As a buyer, I want to save listings so that I can revisit them later
- As a buyer, I want to report fake listings so that the marketplace stays trustworthy

## 6.3 Admin

- As an admin, I want to review pending listings so that only legitimate items go live
- As an admin, I want AI-flagged listings to surface first so that I prioritise my review time
- As an admin, I want to ban abusive users so that the platform stays safe

# 7\. Acceptance Criteria

| **Feature** | **Acceptance Criteria** |
| --- | --- |
| Registration | User can register with any email; receives verification email within 30 seconds |
| --- | --- |
| Email Verification | Unverified users are blocked from posting and from revealing contact info |
| --- | --- |
| Create Listing | Listing saved as pending; seller sees confirmation; AI check fires silently in background |
| --- | --- |
| Contact Reveal | Verified user taps Contact Seller → server returns waLink → WhatsApp opens. Phone number never rendered in DOM. 51st request in a day is rejected with 'Daily limit reached' state. |
| --- | --- |
| Admin Queue | All pending listings visible; AI-flagged listings (confidence > 0.8) appear at the top |
| --- | --- |
| Listing Detail | Clicking a card opens right-side drawer on desktop, bottom sheet on mobile. URL updates. Direct link to /listing/\[slug\] renders standalone page. |
| --- | --- |
| Listing Expiry | Listings 60+ days old auto-set to expired and hidden from browse |
| --- | --- |
| Image Upload | Images above 5MB rejected client-side and server-side; MIME type validated |
| --- | --- |
| Mobile | All pages fully functional and readable on 375px viewport |
| --- | --- |

# 8\. Out of Scope — V1

| **Feature** | **Reason Cut** | **Roadmap** |
| --- | --- | --- |
| In-app chat | WhatsApp handles this; 3 months work, 0 extra value | Not planned |
| --- | --- | --- |
| Reviews & Ratings | Useless without transaction volume at launch | V2  |
| --- | --- | --- |
| Exchange / Swap | Coordination complexity and dispute risk | V2  |
| --- | --- | --- |
| Rent / Lease | Damage, deposits, return dates — legal complexity | V3+ |
| --- | --- | --- |
| Push Notifications | Needs mobile app; email covers V1 needs | V2  |
| --- | --- | --- |
| Subcategories | Start flat; add depth when listings grow | V2  |
| --- | --- | --- |
| Paid Promotions | Too early; students won't pay at launch | V3+ |
| --- | --- | --- |
| Services Listings | Different UX pattern entirely | V2  |
| --- | --- | --- |
| Lost & Found | Different flow — not buying/selling | V2  |
| --- | --- | --- |

# 9\. Constraints

- Zero monthly budget — all infrastructure must remain on free tiers
- Solo developer — features scoped to 6-week build timeline
- No mobile app for V1 — responsive web only
- No payment processing — transactions handled off-platform
- Firebase free tier: 10,000 users/month — sufficient for campus launch
- MongoDB Atlas M0: 512MB storage — estimated capacity ~500K listings
- Gemini AI: 1M tokens/month free — sufficient for listing checks at launch scale

# 10\. Success Metrics

| **Metric** | **30-Day Target** | **90-Day Target** |
| --- | --- | --- |
| Registered users | 100 | 500 |
| --- | --- | --- |
| Active listings | 50  | 300 |
| --- | --- | --- |
| Contact reveals per day | 10  | 75  |
| --- | --- | --- |
| Listings approved < 24 hrs | 90% | 95% |
| --- | --- | --- |
| Fake listing reports | < 5% | < 2% |
| --- | --- | --- |
| Mobile session share | \> 60% | \> 70% |
| --- | --- | --- |