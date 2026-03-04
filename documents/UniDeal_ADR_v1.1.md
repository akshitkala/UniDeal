**UniDeal**

**Architecture Decision Records**

Why we built it this way — every key decision documented.

| **Field** | **Value** |
| --- | --- |
| Version | 1.1 |
| --- | --- |
| Date | February 2026 |
| --- | --- |
| Format | Architecture Decision Records (ADRs) |
| --- | --- |
| Author | Solo Developer |
| --- | --- |

Architecture Decision Records (ADRs) capture the key decisions made while designing UniDeal — not just what was decided, but why. Each record documents the context that made the decision necessary, the decision itself, and the consequences of that choice.

# Decision Index

| **ADR** | **Decision** | **Status** | **Category** |
| --- | --- | --- | --- |
| ADR-001 | Use Next.js App Router over Pages Router | Accepted | Framework |
| --- | --- | --- | --- |
| ADR-002 | MongoDB Atlas M0 over PostgreSQL | Accepted | Database |
| --- | --- | --- | --- |
| ADR-003 | Firebase Auth + Custom JWT over Auth.js | Accepted | Auth |
| --- | --- | --- | --- |
| ADR-004 | Sell-only for V1 — no rent, exchange, or barter | Accepted | Product |
| --- | --- | --- | --- |
| ADR-005 | Open signup — any email, not just university email | Accepted | Product |
| --- | --- | --- | --- |
| ADR-006 | Contact hidden behind email verification — not just login | Accepted | Security |
| --- | --- | --- | --- |
| ADR-007 | AI moderation is silent — flagged for admin only | Accepted | AI  |
| --- | --- | --- | --- |
| ADR-008 | Soft delete over hard delete | Accepted | Data |
| --- | --- | --- | --- |
| ADR-009 | WhatsApp deep link for contact close — no in-app chat, no phone display | Accepted | Security |
| --- | --- | --- | --- |
| ADR-010 | Gemini 1.5 Flash over GPT-4 for AI quality checks | Accepted | AI  |
| --- | --- | --- | --- |
| ADR-011 | Upstash Redis for rate limiting over in-memory state | Accepted | Infrastructure |
| --- | --- | --- | --- |
| ADR-012 | Manual admin approval mode as default | Accepted | Operations |
| --- | --- | --- | --- |
| ADR-013 | Dynamic categories managed from admin dashboard | Accepted | Product |
| --- | --- | --- | --- |
| ADR-014 | Fail open on AI unavailability | Accepted | AI  |
| --- | --- | --- | --- |
| ADR-015 | Listing detail as drawer, not a standalone page | Accepted | UX Pattern |
| --- | --- | --- | --- |
| ADR-016 | Sell flow as modal wizard, not a dedicated page | Accepted | UX Pattern |
| --- | --- | --- | --- |
| ADR-017 | Carry SemesterSwap architecture patterns forward unchanged | Accepted | Foundation |
| --- | --- | --- | --- |

# Architecture Decision Records

|     |
| --- |
| **ADR-001: Use Next.js App Router over Pages Router**<br><br>Status: Accepted |
| **Context**<br><br>Next.js 14 introduces the App Router with React Server Components, which significantly reduces client-side JavaScript and improves performance. The Pages Router is still supported but is now the legacy approach. |
| **Decision**<br><br>Use Next.js 14+ App Router with React Server Components for all pages and layouts. Use Server Actions where appropriate. API routes remain in /api/ for mobile-readiness. |
| **Consequences**<br><br>Positive: smaller JS bundles, better Core Web Vitals, built-in streaming. Negative: steeper learning curve, some third-party libraries have compatibility issues. The performance benefits outweigh the learning cost given the product's emphasis on mobile performance. |

|     |
| --- |
| **ADR-002: MongoDB Atlas M0 over PostgreSQL**<br><br>Status: Accepted |
| **Context**<br><br>A relational database like PostgreSQL would provide stronger data integrity and richer query capabilities. However, free-tier PostgreSQL options (Supabase, Neon) have cold-start issues in serverless environments and connection pooling complexity. |
| **Decision**<br><br>Use MongoDB Atlas M0 (512MB free forever). The document model suits listing data (variable fields, embedded arrays for images and savedBy). Mongoose provides schema validation at the application level. |
| **Consequences**<br><br>Positive: no cold starts, flexible schema, free forever at M0. Negative: no joins (use populate sparingly), weaker data integrity without careful validation. Application-level validation via Zod compensates for the lack of database constraints. |

|     |
| --- |
| **ADR-003: Firebase Auth + Custom JWT over Auth.js**<br><br>Status: Accepted |
| **Context**<br><br>Auth.js (formerly NextAuth.js) is the standard choice for Next.js authentication. However, it has known issues with HTTP-only cookie handling in certain edge environments and complex role-based access control. |
| **Decision**<br><br>Use Firebase for identity management and email verification only. Issue custom JWTs via our own API route — short-lived access tokens (15m) and longer refresh tokens (7d), both stored as HTTP-only cookies. |
| **Consequences**<br><br>Positive: full control over token payload (include role, trustLevel), proven pattern from SemesterSwap, no Auth.js version-lock issues. Negative: more code to maintain, must handle token refresh manually. The control benefit justifies the extra implementation work. |

|     |
| --- |
| **ADR-004: Sell-only for V1 — no rent, exchange, or barter**<br><br>Status: Accepted |
| **Context**<br><br>A marketplace could support selling, renting, exchanging, or bartering. Each transaction type adds significant UX complexity, dispute handling requirements, and edge cases in the data model. |
| **Decision**<br><br>V1 supports sell transactions only. Rent is excluded (damage/deposit/return complexity). Exchange is excluded (coordination complexity, two-party agreement). Barter is excluded (valuation difficulty). |
| **Consequences**<br><br>Positive: dramatically simpler UX, faster build, cleaner data model, no dispute system needed. Negative: some user requests won't be fulfilled. The constraint forces focus and dramatically de-risks the V1 build. |

|     |
| --- |
| **ADR-005: Open signup — any email, not just university email**<br><br>Status: Accepted |
| **Context**<br><br>Restricting signup to @lpu.in email addresses would guarantee all users are genuine LPU students. However, many students use personal Gmail accounts and don't regularly check university email. |
| **Decision**<br><br>Accept any email address. Require Firebase email verification before posting or revealing contacts. Trust is enforced through verification and admin moderation — not email domain. |
| **Consequences**<br><br>Positive: zero onboarding friction, no API integration with university systems needed. Negative: non-students could technically sign up. In practice, there is no value in the platform for non-campus users — the listings are campus-specific. |

|     |
| --- |
| **ADR-006: Contact hidden behind email verification — not just login**<br><br>Status: Accepted |
| **Context**<br><br>Revealing seller contact to any logged-in user (verified or not) would be simpler to implement. The distinction between logged-in and verified is a two-step gate. |
| **Decision**<br><br>Seller contact (WhatsApp deep link) is only revealed to users who have verified their email address. Unverified logged-in users see a prompt to verify. Guests see a login prompt. The phone number is never displayed as text in the UI — only a server-constructed wa.me link is passed to window.open(). |
| **Consequences**<br><br>Positive: protects sellers from contact scraping by throwaway accounts, creates a higher-trust contact pool, encourages verification completion. Negative: adds one step to the buyer journey. The trust benefit to sellers outweighs the marginal friction for buyers. |

|     |
| --- |
| **ADR-007: AI moderation is silent — flagged for admin only**<br><br>Status: Accepted |
| **Context**<br><br>When AI detects a potential issue with a listing, there are two options: tell the user and ask them to fix it, or flag it silently for admin review. Telling the user creates a prompt-engineering attack surface (users learn what patterns to avoid). |
| **Decision**<br><br>All AI checks run silently after listing submission. The user always sees a normal 'under review' message. If AI flags the listing, it surfaces at the top of the admin queue with reasoning. The admin makes the final decision. |
| **Consequences**<br><br>Positive: no adversarial gaming of the AI system, admin always has final say, simpler user experience. Negative: legitimate listings may wait longer if AI flags them incorrectly. The admin confidence score display helps admins dismiss false positives quickly. |

|     |
| --- |
| **ADR-008: Soft delete over hard delete**<br><br>Status: Accepted |
| **Context**<br><br>When a listing is deleted by a seller or admin, should it be removed from the database (hard delete) or marked as deleted but retained (soft delete)? |
| **Decision**<br><br>All listing deletes use isDeleted: true. A global Mongoose query filter excludes isDeleted documents from all queries by default. Hard delete is only used during GDPR account deletion (user's own data, on explicit request). |
| **Consequences**<br><br>Positive: audit trail preserved, ability to recover accidental deletes, admin can review deleted content. Negative: database grows over time with deleted records. At campus scale, this is not a meaningful storage concern for V1. |

|     |
| --- |
| **ADR-009: WhatsApp deep link for contact close — no in-app chat, no phone display**<br><br>Status: Accepted |
| **Context**<br><br>Building an in-app chat system would take approximately 3 months for a solo developer. An alternative was to simply display the seller's phone number. Both options were evaluated. |
| **Decision**<br><br>UniDeal generates a wa.me deep link on the server and passes it directly to window.open(). The phone number is never returned to the frontend as a displayable field and never rendered as text in the DOM under any circumstance. All negotiation happens on WhatsApp — not in the app. |
| **Consequences**<br><br>Positive: 0 build cost for chat, uses a tool students already know and trust, no infrastructure cost, no message storage liability, phone number never exposed in client. Negative: no transaction history in the app, cannot track whether deals close. This is a security and product decision: displaying phone numbers creates a scraping and spam risk that the deep-link approach eliminates entirely. |

|     |
| --- |
| **ADR-010: Gemini 1.5 Flash over GPT-4 for AI quality checks**<br><br>Status: Accepted |
| **Context**<br><br>AI quality checks run on every listing submission. The AI model choice affects cost, speed, and quality. GPT-4 is more capable but has no free tier. Gemini 1.5 Flash has a 1M token/month free tier. |
| **Decision**<br><br>Use Google Gemini 1.5 Flash via @google/generative-ai SDK. The task (category mismatch detection) is well within Flash's capabilities. The 1M token/month free limit is sufficient for ~50,000 listing checks per month. |
| **Consequences**<br><br>Positive: free forever at campus scale, fast response times (Flash is optimised for low latency), simple structured JSON output. Negative: occasional inconsistency vs GPT-4. For category mismatch detection, the quality difference is negligible. |

|     |
| --- |
| **ADR-011: Upstash Redis for rate limiting over in-memory state**<br><br>Status: Accepted |
| **Context**<br><br>Rate limiting requires a shared counter store. Vercel serverless functions are stateless — in-memory counters reset between invocations. Local Redis would require a dedicated server. |
| **Decision**<br><br>Use Upstash Redis via REST API. Upstash's serverless-first design means no persistent connections are needed. The REST API works perfectly in Vercel's edge and serverless environments. |
| **Consequences**<br><br>Positive: works correctly across all serverless function instances, 10,000 req/day free, no connection pooling complexity. Negative: adds an external dependency. The correctness requirement (consistent rate limiting across instances) makes this non-negotiable. |

|     |
| --- |
| **ADR-012: Manual admin approval mode as default**<br><br>Status: Accepted |
| **Context**<br><br>Should listings go live immediately on submission (automatic mode) or require admin approval (manual mode)? At launch, there is no track record to calibrate trust. |
| **Decision**<br><br>Default to manual approval mode. SystemConfig has approvalMode: Enum\[manual, automatic\]. Super admin can toggle to automatic once trust is established. AI flags surface high-risk listings regardless of mode. |
| **Consequences**<br><br>Positive: maximum quality control at launch, prevents fake listings from going live before moderation. Negative: delays for legitimate sellers. The reputational risk of fake listings going live at launch outweighs the moderation overhead. |

|     |
| --- |
| **ADR-013: Dynamic categories managed from admin dashboard**<br><br>Status: Accepted |
| **Context**<br><br>Categories could be hardcoded in the codebase (simple) or managed from a database and admin dashboard (flexible). Hardcoded categories require a code deploy to add or modify. |
| **Decision**<br><br>Categories are stored in MongoDB as a Category collection. Admins add, hide, reorder, and create new categories from the dashboard. No code change or redeployment is needed. |
| **Consequences**<br><br>Positive: non-developer admins can manage categories, enables A/B testing of category names, categories can be hidden without deletion. Negative: slightly more complex implementation. The operational flexibility benefit far outweighs the implementation cost. |

|     |
| --- |
| **ADR-014: Fail open on AI unavailability**<br><br>Status: Accepted |
| **Context**<br><br>If the Gemini API or Cloudinary moderation API is unavailable, should the listing be blocked (fail closed) or allowed to proceed (fail open)? |
| **Decision**<br><br>Fail open: if any AI check fails or times out, the listing proceeds normally with aiVerification.checked: false. The admin moderation queue shows unchecked listings and can review them manually. |
| **Consequences**<br><br>Positive: AI failure never blocks a legitimate seller, system degrades gracefully. Negative: bad listings may slip through during outages. Manual admin moderation is the safety net — AI is an efficiency tool, not a gate. Blocking users due to third-party API issues is unacceptable. |

|     |
| --- |
| **ADR-015: Listing detail as drawer, not a standalone page**<br><br>Status: Accepted |
| **Context**<br><br>A traditional approach would route to /listing/\[slug\] as a full page. The UIUX specification defines a different pattern: a right-side drawer on desktop (width min(680px, 90vw)) and a bottom sheet on mobile, with the browse grid remaining visible and interactive behind the backdrop. |
| **Decision**<br><br>Listing detail opens as a Next.js intercepting route (using the @modal parallel route pattern). The URL updates to /listing/\[slug\] for shareability and direct linking. On direct navigation (e.g. shared link), the page renders as a standalone full-page view without the drawer chrome. |
| **Consequences**<br><br>Positive: browse context preserved, faster perceived navigation (no full page reload), URL is still shareable, direct links still work. Negative: slightly more complex Next.js routing setup using intercepting routes. The UX benefit of keeping browse context intact is significant for a discovery-first product. |

|     |
| --- |
| **ADR-016: Sell flow as modal wizard, not a dedicated page**<br><br>Status: Accepted |
| **Context**<br><br>A traditional approach would route to /dashboard/new for creating a new listing. The UIUX specification defines the sell flow as a two-step modal wizard triggered from the List Item CTA in the topbar or sidebar. |
| **Decision**<br><br>The sell/list item flow is a centred modal dialog on desktop/tablet and a bottom sheet on mobile. It does not have its own URL route. Step 1 collects title, category, condition, and price. Step 2 collects photos and description. Editing an existing listing opens the same modal pre-filled. |
| **Consequences**<br><br>Positive: no context disruption, consistent with the drawer-first UX pattern, faster perceived interaction. Negative: no direct URL to the sell form (not needed — sellers always start from browse). The /dashboard/new route in the folder structure is removed; the modal is triggered client-side only. |

|     |
| --- |
| **ADR-017: Carry SemesterSwap architecture patterns forward unchanged**<br><br>Status: Accepted |
| **Context**<br><br>The developer has previously built SemesterSwap, a related campus marketplace. Its architecture patterns were developed through sprint iterations and include working solutions for auth, soft delete, admin pipelines, and role management. |
| **Decision**<br><br>The following patterns are carried forward without modification: Firebase Auth + HTTP-only JWT flow, MongoDB connection setup, admin approval pipeline, soft delete (isDeleted), role hierarchy (user/admin/super_admin), activity audit logs, and all security fixes from SemesterSwap sprints. |
| **Consequences**<br><br>Positive: 3–4 days of Week 1 saved, patterns are proven in production, security fixes are already incorporated. Negative: may carry forward some technical debt from SemesterSwap. The time savings and proven reliability strongly outweigh any debt risk. |