**UniDeal**

**System Design & Architecture**

| **Field** | **Value** |
| --- | --- |
| Version | 1.1 |
| --- | --- |
| Date | February 2026 |
| --- | --- |
| Architecture | Serverless · Edge-first · Free Tier |
| --- | --- |
| Pattern | Next.js App Router with Server Components + Intercepting Routes |
| --- | --- |
| Author | Solo Developer |
| --- | --- |

# 1\. High-Level Architecture

UniDeal is a serverless, edge-deployed web application. All compute runs on Vercel's serverless functions and edge network. There are no dedicated servers, no containers to manage, and no infrastructure cost at the scale of a campus launch.

┌─────────────────────────────────────────────────────────┐ │ VERCEL EDGE NETWORK │ │ │ │ ┌──────────────────┐ ┌───────────────────────────┐ │ │ │ Next.js App │ │ Next.js API Routes │ │ │ │ (RSC + CSR) │──▶│ /api/listings │ │ │ │ App Router │ │ /api/auth │ │ │ │ + @modal slot │ │ /api/admin │ │ │ └──────────────────┘ └─────────────┬─────────────┘ │ └────────────────────────────────────── │ ───────────────┘ │ ┌──────────┬──────────┬────────┴──────┐ │ │ │ │ ┌────▼───┐ ┌───▼────┐ ┌──▼─────┐ ┌──────▼──┐ │MongoDB │ │Firebase│ │Cloudina│ │ Upstash │ │ Atlas │ │ Auth │ │ ry │ │ Redis │ └────────┘ └────────┘ └────────┘ └─────────┘ │ ┌───────────┴────────────┐ │ Background Jobs │ │ (fire-and-forget) │ │ Gemini AI Check │ │ Listing Expiry │ └────────────────────────┘

# 2\. Authentication Architecture

## 2.1 Dual-Token Strategy

UniDeal uses Firebase for identity management but issues its own JWT tokens for session management. This separation gives full control over session duration, revocation, and role enforcement without depending on Firebase for every request.

Client Next.js API Firebase │ │ │ │── login(email,pw) ▶│ │ │ │── verifyIdToken ───▶│ │ │◀── decoded user ────│ │ │ │ │ │ \[lookup MongoDB\] │ │ │ \[issue JWT+Refresh\]│ │◀── Set-Cookie ─────│ │ │ access_token │ │ │ (httpOnly, 15m) │ │ │ refresh_token │ │ │ (httpOnly, 7d) │ │

## 2.2 Token Lifecycle

| **Token** | **TTL** | **Storage** | **Notes** |
| --- | --- | --- | --- |
| Access JWT | 15 minutes | HTTP-only cookie | Short TTL limits exposure window |
| --- | --- | --- | --- |
| Refresh JWT | 7 days | HTTP-only cookie | Silent refresh before expiry |
| --- | --- | --- | --- |
| Firebase ID Token | 1 hour | Memory only | Never stored — only used at login |
| --- | --- | --- | --- |

## 2.3 Middleware Chain

Request │ ▼ \[auth\] Verify JWT, attach req.user. Reject 401 if invalid. │ ▼ \[verified\] Check req.user.emailVerified. Reject 403 if not verified. │ (Only on: POST /listings, GET /listings/\[slug\]/contact) ▼ \[ownership\] Check listing.seller === req.user.uid. Reject 403. │ (Only on: PATCH, DELETE /listings/\[slug\]) ▼ \[rateLimit\] Check Upstash Redis counter. Reject 429 if over limit. │ ▼ Route Handler

# 3\. Core Data Flows

## 3.1 Create Listing Flow

Client API Route Background │ │ │ │── POST /listings ──▶│ │ │ (FormData) │ │ │ │── Upload images ──────▶ Cloudinary │ │◀── Cloudinary URLs ────│ │ │ │ │ │── Create listing ─────▶ MongoDB │ │ {status: pending} │ │ │ {aiFlagged: false} │ │ │◀── listing.\_id ────────│ │ │ │ │◀── 201 {slug} ──────│ │ │ │ │ │ │── fire-and-forget ────▶│ │ │ │── Gemini check │ │ │── Cloudinary mod │ │ │── Keyword filter │ │ │ │ │ │── Update listing │ │ │ aiVerification{}

## 3.2 Contact Reveal Flow

CRITICAL: The /contact endpoint constructs the wa.me deep link entirely on the server using sellerPhone (select: false). The response contains { waLink } only — no phone number field. The client passes waLink directly to window.open() without rendering it in the DOM.

Client API Route Upstash Redis │ │ │ │── POST /contact ───▶│ │ │ Cookie: JWT │ │ │ │── \[auth middleware\] │ │ │── \[verified middleware\]│ │ │ │ │ │── INCR contact:{uid} ─▶│ │ │ EXPIRE 86400 (1 day) │ │ │◀── current count ──────│ │ │ │ │ │ if count > 50: │ │◀── 429 Rate Limited─│ │ │ │ │ │ │ if count <= 50: │ │ │ Fetch User │ │ │ (+sellerPhone select) │ │ │ Build wa.me URL │ │ │ server-side only │ │ │── Log ContactReveal │ │◀── 200 { waLink } ──│ (waLink only, no phone│ │ │ in response) │ │ window.open(waLink)│ │ │ \[phone never in DOM│ │

## 3.3 Admin Moderation Flow

Admin API Route MongoDB │ │ │ │── GET /admin/listings▶│ │ │ │── Query listings: │ │ │ status: pending │ │ │ sort: aiFlagged desc,│ │ │ createdAt asc │ │◀── \[{listing,aiV}\]──│ │ │ │ │ │── PATCH /admin │ │ │ {action: approve} ▶│ │ │ │── Update status │ │ │── logAction(APPROVED) │ │◀── 200 OK ──────────│ │

# 4\. UX Architecture — Drawer & Modal Patterns

The UIUX specification defines two overlay patterns that affect the Next.js routing architecture.

## 4.1 Listing Detail — Intercepting Route (Drawer)

When a user clicks a listing card from the browse page, Next.js intercepts the navigation to /listing/\[slug\] and renders the listing inside a right-side drawer (@modal parallel route slot). The browse grid remains visible behind the backdrop. The URL updates to /listing/\[slug\] for shareability. Direct navigation (e.g. a shared link) bypasses interception and renders /listing/\[slug\] as a standalone full-page view.

app/(main)/ ├── @modal/ │ └── listing/\[slug\]/ │ └── page.tsx ← Renders as drawer (intercepted) ├── listing/\[slug\]/ │ └── page.tsx ← Renders as full page (direct link) └── page.tsx ← Browse / homepage

## 4.2 Sell / List Item — Client-Side Modal

The sell flow is a client-side modal wizard with no dedicated route. It is triggered by the List Item CTA in the topbar or sidebar. There is no /dashboard/new route. The modal is managed via React state (useState) in a layout component that persists across navigation.

# 5\. Database Design

## 5.1 MongoDB Atlas M0 — Capacity Planning

| **Collection** | **Est. Avg Doc Size** | **At 500K docs** | **Notes** |
| --- | --- | --- | --- |
| Listings | ~3KB | ~1.5GB | Limit: 512MB → ~170K listings |
| --- | --- | --- | --- |
| Users | ~1KB | ~100MB | Well within limits at campus scale |
| --- | --- | --- | --- |
| AdminActivity | ~500B | ~50MB | Log rotation strategy needed at scale |
| --- | --- | --- | --- |
| Reports | ~800B | ~20MB | Negligible — closed reports can be archived |
| --- | --- | --- | --- |
| Categories | ~200B | < 1MB | Static-ish — 6 to ~50 entries ever |
| --- | --- | --- | --- |

At campus scale (LPU: ~30K students), realistic capacity is ~5,000 active listings at any time. Well within M0 limits. Upgrade to M2 (~$9/month) triggers only if active listings exceed ~150K.

## 5.2 Indexes

| **Collection** | **Index** | **Purpose** |
| --- | --- | --- |
| Listing | { status: 1, createdAt: -1 } | Browse approved listings sorted by newest |
| --- | --- | --- |
| Listing | { category: 1, status: 1 } | Category page filtering |
| --- | --- | --- |
| Listing | { seller: 1 } | Dashboard: my listings |
| --- | --- | --- |
| Listing | { slug: 1 } unique | Listing detail page lookup |
| --- | --- | --- |
| Listing | { aiFlagged: 1, status: 1 } | Admin queue: flagged first |
| --- | --- | --- |
| Listing | { expiresAt: 1 } | TTL index — auto-expire documents |
| --- | --- | --- |
| Listing | Text index: title + description | Full-text search |
| --- | --- | --- |
| User | { uid: 1 } unique | Firebase UID lookup |
| --- | --- | --- |
| AdminActivity | { timestamp: -1 } | Audit log sorted by newest |
| --- | --- | --- |

## 5.3 Soft Delete Pattern

// Global query filter applied to all listing queries: Listing.find({ isDeleted: false, ...userQuery }) // Soft delete: await Listing.findByIdAndUpdate(id, { isDeleted: true }) // Hard delete only on GDPR account deletion: await Listing.updateMany({ seller: uid }, { isDeleted: true, $unset: { sellerPhone: '', sellerEmail: '' } })

# 6\. Caching Strategy

## 6.1 Next.js Server Component Caching

| **Route** | **Cache Strategy** | **Reasoning** |
| --- | --- | --- |
| Homepage / Browse | ISR — revalidate: 60s | Categories and recent listings change slowly |
| --- | --- | --- |
| Category pages | ISR — revalidate: 60s | Listing counts update frequently but not real-time |
| --- | --- | --- |
| Listing detail (standalone) | ISR — revalidate: 30s | Status changes (approved→sold) should propagate quickly |
| --- | --- | --- |
| Search results | No cache — dynamic | User-specific queries, must be fresh |
| --- | --- | --- |
| Dashboard | No cache — dynamic | User-specific, real-time accuracy required |
| --- | --- | --- |
| Admin queue | No cache — dynamic | Moderation decisions need real-time state |
| --- | --- | --- |

## 6.2 Upstash Redis — Rate Limit Store Only

- Redis is used exclusively for rate limiting — not general caching
- Keys follow pattern: ratelimit:{endpoint}:{identifier}
- All keys have TTL equal to the rate limit window (auto-expiry)
- Upstash REST API used — no persistent connection needed (serverless-safe)

# 7\. Image Upload & Moderation Pipeline

Client Next.js API Cloudinary │ │ │ │── FormData ───▶│ │ │ (images\[\]) │── validate magic │ │ │ bytes, 5MB/file, │ │ │ 15MB total │ │ │ │ │ │── upload stream ────▶│ │ │ folder: listings/ │ │ │ quality: auto │ │ │ moderation: aws_rek│ │ │ │ │ │◀── { public_id, url, │ │ │ moderation_status} │ │ │ │ │ if rejected: │ │ │ aiFlagged: true │ │◀── listing ────│ │ │ created │ │

- Cloudinary free tier: 25GB storage + 25GB bandwidth/month
- ListingCard thumbnail: w_400,h_400,c_fill,q_auto,f_auto
- Detail image full-size: w_900,c_limit,q_auto,f_auto

# 8\. AI Quality Check Architecture

## 8.1 Three-Layer Parallel Check

Listing saved (status: pending) │ ▼ Promise.allSettled(\[ checkCategoryMismatch(listing), // Gemini 1.5 Flash checkImages(listing.images), // Cloudinary result (already done) checkSpamKeywords(listing), // Rule-based — synchronous \]) │ ▼ Aggregate results: { checked: true, flagged: boolean, flags: \['category_mismatch' | 'inappropriate_image' | 'spam_keywords'\], confidence: 0.0–1.0, reason: 'string for admin display', checkedAt: Date, } │ ▼ Listing.findByIdAndUpdate(id, { aiVerification: result, aiFlagged: result.confidence > 0.8 }) // If AI unavailable: fail open — listing proceeds normally

## 8.2 Gemini Prompt Design

System: 'You are a listing moderation assistant. Return JSON only.' User: \`Check this listing: Title: {title} Description: {description} Listed Category: {category} Does the listing match its category? Return: { flagged: bool, confidence: 0-1, reason: string }\`

# 9\. Deployment Architecture

## 9.1 Vercel Configuration

- Git push to main branch triggers automatic deployment
- Environment variables set in Vercel dashboard — never committed to repo
- Vercel Edge Network handles DDoS protection and global CDN for static assets
- Serverless functions auto-scale — no cold start issues at campus scale
- Preview deployments on every pull request — useful for solo testing before merge

## 9.2 Vercel Cron Jobs

| **Job** | **Schedule** | **Purpose** |
| --- | --- | --- |
| Listing Expiry | 0 2 \* \* \* (2am daily) | Set isExpired: true on listings past expiresAt. Send seller notification. |
| --- | --- | --- |
| Data Backup | 0 3 \* \* 0 (3am Sunday) | Export MongoDB collections to JSON, commit to private GitHub repo. |
| --- | --- | --- |
| AI Queue Retry | \*/30 \* \* \* \* (every 30m) | Retry AI checks that failed due to service unavailability. |
| --- | --- | --- |

## 9.3 Pre-Launch Setup Sequence

| **Step** | **Service** | **Action** |
| --- | --- | --- |
| 1   | MongoDB Atlas | Create M0 cluster, get connection string, whitelist 0.0.0.0/0 for Vercel |
| --- | --- | --- |
| 2   | Firebase | Create project, enable Email/Password auth, download Admin SDK service account |
| --- | --- | --- |
| 3   | Cloudinary | Create account, get cloud name + API key + secret, enable moderation add-on |
| --- | --- | --- |
| 4   | Resend | Create account, verify domain (or use resend.dev for MVP), get API key |
| --- | --- | --- |
| 5   | Upstash | Create Redis database, get REST URL + token |
| --- | --- | --- |
| 6   | Sentry | Create Next.js project, run npx @sentry/wizard@latest -i nextjs |
| --- | --- | --- |
| 7   | Google AI | Get Gemini API key from Google AI Studio (free, no billing required) |
| --- | --- | --- |
| 8   | Vercel | Connect GitHub repo, add all 17 env vars, deploy, run seed scripts |
| --- | --- | --- |

# 10\. Scalability & Upgrade Path

## 10.1 Free Tier Limits & Upgrade Triggers

| **Service** | **Free Limit** | **Upgrade Trigger** | **Next Tier Cost** |
| --- | --- | --- | --- |
| MongoDB Atlas | 512MB storage | \> 150K active listings | M2: ~$9/month |
| --- | --- | --- | --- |
| Firebase Auth | 10K users/month | \> 8K new users/month | Spark → Blaze: pay-per-use |
| --- | --- | --- | --- |
| Cloudinary | 25GB + 25GB BW | \> 20GB uploads/month | Plus: $89/month |
| --- | --- | --- | --- |
| Resend | 3K emails/month | \> 2.5K emails/month | Pro: $20/month |
| --- | --- | --- | --- |
| Upstash | 10K req/day | \> 8K req/day | Pay-as-you-go |
| --- | --- | --- | --- |
| Vercel | 100GB BW/month | Sustained high traffic | Pro: $20/month |
| --- | --- | --- | --- |

## 10.2 Multi-Campus Expansion

UniDeal's architecture supports multi-campus expansion without structural changes. The data model includes location fields on both User and Listing. Campus filtering can be added as a query parameter overlay — no schema migration required.

- Phase 1: Subdomain routing (lpu.unideal.in, dtu.unideal.in) — same codebase
- Phase 2: Campus field on listings — enable cross-campus search toggle
- Phase 3: Separate MongoDB databases per campus — data isolation for compliance

# 11\. Observability & Monitoring

## 11.1 Sentry Integration

- All uncaught exceptions in API routes and server components are captured
- Custom Sentry.captureException() calls on AI check failures and Cloudinary errors
- Performance monitoring tracks API route P95 response times
- Sentry dashboard alert: any error rate > 5% in a 5-minute window

## 11.2 Admin Activity Audit Log

All critical platform events are recorded in MongoDB AdminActivity with actor identity, target, action type, metadata, and masked IP address. The super_admin audit log page provides searchable, paginated access to this log.

| **Category** | **Logged Actions** |
| --- | --- |
| Auth | USER_REGISTERED, USER_LOGIN, USER_DELETED_ACCOUNT |
| --- | --- |
| Listings | LISTING_CREATED, APPROVED, REJECTED, DELETED, REPORTED, AI_FLAG_LISTING |
| --- | --- |
| Admin | USER_BANNED, USER_UNBANNED, ROLE_CHANGED, CATEGORY_CREATED, CATEGORY_DELETED |
| --- | --- |
| System | APPROVAL_MODE_CHANGED, MAINTENANCE_TOGGLED, BACKUP_COMPLETED, BACKUP_FAILED |
| --- | --- |