**UniDeal**

**Technical Requirements Document**

| **Field** | **Value** |
| --- | --- |
| Version | 1.1 |
| --- | --- |
| Date | February 2026 |
| --- | --- |
| Stack | Next.js 14 · TypeScript · MongoDB · Firebase |
| --- | --- |
| Deployment | Vercel (free tier) |
| --- | --- |
| Author | Solo Developer |
| --- | --- |
| Budget | ₹0 / month |
| --- | --- |

# 1\. Technology Stack

## 1.1 Core Services

| **Layer** | **Service** | **Free Limit** | **Notes** |
| --- | --- | --- | --- |
| Framework | Next.js 14+ App Router | —   | TypeScript, server components, intercepting routes for drawer UX |
| --- | --- | --- | --- |
| Database | MongoDB Atlas M0 | 512MB storage | ~500K listings capacity |
| --- | --- | --- | --- |
| Auth | Firebase + HTTP-only JWT | 10,000 users/month | Carried from SemesterSwap |
| --- | --- | --- | --- |
| Images | Cloudinary | 25GB storage + BW | Compressed on upload, 5MB max per image |
| --- | --- | --- | --- |
| Email | Resend | 3,000 emails/month | DKIM/SPF/DMARC verified |
| --- | --- | --- | --- |
| Rate Limiting | Upstash Redis | 10,000 req/day | Tiered by endpoint type |
| --- | --- | --- | --- |
| Error Tracking | Sentry | Free hobby plan | Real-time alerts |
| --- | --- | --- | --- |
| Deployment | Vercel | 100GB BW/month | Zero config, Next.js native |
| --- | --- | --- | --- |
| UI  | Tailwind + shadcn/ui | —   | Production-grade components |
| --- | --- | --- | --- |
| AI — Text | Gemini 1.5 Flash | 1M tokens/month | Category mismatch detection |
| --- | --- | --- | --- |
| AI — Images | Cloudinary Moderation | 500/month | Inappropriate image detection |
| --- | --- | --- | --- |
| Spam Detection | Rule-based keywords | Free forever | No API needed |
| --- | --- | --- | --- |

Every service runs on its free tier — total monthly cost: ₹0. Only potential future cost: custom domain (~₹800/year) — skipped for V1.

# 2\. Data Models

Six models. Everything the app needs, nothing it doesn't.

## 2.1 User

{ uid, email, emailVerified, displayName, photoURL role: Enum\[user, admin, super_admin\] isActive: Boolean // false = banned trustLevel: Enum\[new, trusted, flagged\] phone, bio, location // optional profile fields totalListings, activeListings savedListings: \[ObjectId\] createdAt, updatedAt }

## 2.2 Listing

{ title, description, price, negotiable category: ObjectId (ref: Category) condition: Enum\[new, like-new, good, used, damaged\] images: \[String\] // Cloudinary URLs, min 1 max 6 seller: ObjectId sellerPhone: String (select: false) // never returned to frontend sellerEmail: String (select: false) // never returned to frontend location status: Enum\[pending, approved, rejected, sold\] isDeleted, rejectionReason aiFlagged: Boolean aiVerification: { checked, flagged, flags\[\], confidence, reason, checkedAt } slug: String (unique, nanoid suffix) views, savedBy: \[ObjectId\] expiresAt: Date // createdAt + 60 days isExpired: Boolean createdAt, updatedAt }

CRITICAL: sellerPhone and sellerEmail have Mongoose select: false. These fields are never included in any public API response. The /contact endpoint uses these fields server-side only to construct a wa.me deep link, which is the only value returned to the client.

## 2.3 Category

{ name, slug (auto-generated), icon (emoji) isActive: Boolean, order: Number createdBy: ObjectId, createdAt }

## 2.4 AdminActivity

{ actor: ObjectId (nullable), actorType: Enum\[user, system, deleted_user\] target: ObjectId (refPath: targetModel) targetModel: Enum\[User, Listing, Category, System\] action: String, metadata: Object ipAddress: String // masked in UI, real in DB timestamp: Date }

## 2.5 SystemConfig (Singleton)

{ \_id: 'global' // fixed ID — enforces singleton approvalMode: Enum\[manual, automatic\] maintenanceMode: Boolean allowNewListings: Boolean updatedBy: ObjectId, updatedAt: Date }

## 2.6 Report

{ listing: ObjectId, reportedBy: ObjectId reason: Enum\[fake_listing, wrong_price, inappropriate, already_sold, spam, other\] description: String, status: Enum\[pending, reviewed, dismissed\] reviewedBy: ObjectId, createdAt: Date }

# 3\. API Endpoints

## 3.1 Auth

| **Method** | **Endpoint** | **Description** |
| --- | --- | --- |
| POST | /api/auth/login | Firebase token → HTTP-only JWT issued |
| --- | --- | --- |
| POST | /api/auth/logout | Clear JWT and refresh cookies |
| --- | --- | --- |
| POST | /api/auth/refresh | Silent token refresh from refresh token |
| --- | --- | --- |

## 3.2 Listings

| **Method** | **Endpoint** | **Description** |
| --- | --- | --- |
| GET | /api/listings | Browse with filters (category, condition, price, search) |
| --- | --- | --- |
| POST | /api/listings | Create listing — requires verified auth |
| --- | --- | --- |
| GET | /api/listings/\[slug\] | Single listing detail — increments views |
| --- | --- | --- |
| PATCH | /api/listings/\[slug\] | Edit listing — seller only, ownership middleware |
| --- | --- | --- |
| DELETE | /api/listings/\[slug\] | Soft delete — seller or admin |
| --- | --- | --- |
| POST | /api/listings/\[slug\]/contact | Reveal contact — verified user, rate limited 50/day. Returns { waLink } only — no phone field. |
| --- | --- | --- |
| POST | /api/listings/\[slug\]/save | Toggle save/unsave — verified user |
| --- | --- | --- |
| POST | /api/listings/\[slug\]/report | Report listing — verified user, 10/day limit |
| --- | --- | --- |

## 3.3 Admin

| **Method** | **Endpoint** | **Description** |
| --- | --- | --- |
| GET | /api/admin/listings | All pending listings, AI-flagged first |
| --- | --- | --- |
| PATCH | /api/admin/listings/\[id\] | Approve or reject with reason |
| --- | --- | --- |
| GET | /api/admin/reports | All pending reports |
| --- | --- | --- |
| PATCH | /api/admin/reports/\[id\] | Mark report reviewed or dismissed |
| --- | --- | --- |
| GET | /api/admin/users | User list with filters |
| --- | --- | --- |
| PATCH | /api/admin/users/\[uid\] | Ban/unban user |
| --- | --- | --- |
| GET | /api/super-admin/activity | Full audit log |
| --- | --- | --- |
| PATCH | /api/super-admin/config | Toggle approval mode, maintenance mode |
| --- | --- | --- |

# 4\. Security Architecture

## 4.1 Rate Limit Tiers

| **Endpoint** | **Limit** | **Window** | **Reason** |
| --- | --- | --- | --- |
| Login / Register | 10 requests | Per hour | Brute force protection |
| --- | --- | --- | --- |
| Post listing | 5 requests | Per day | Prevent spam listings |
| --- | --- | --- | --- |
| Contact reveal | 50 requests | Per day | Core contact protection |
| --- | --- | --- | --- |
| Report listing | 10 requests | Per day | Prevent report bombing |
| --- | --- | --- | --- |
| Admin actions | 20 requests | Per minute | Prevent log poisoning |
| --- | --- | --- | --- |
| Browse / Search | Unlimited | —   | Vercel edge handles DDoS |
| --- | --- | --- | --- |

## 4.2 Security Layers

| **Layer** | **Implementation** |
| --- | --- |
| Rate Limiting | Upstash Redis — tiered by endpoint sensitivity |
| --- | --- |
| Contact Security | sellerPhone/Email: Mongoose select: false. /contact endpoint returns { waLink } only. Phone number never in any API response, never rendered in DOM. |
| --- | --- |
| Email Auth | Resend — DKIM/SPF/DMARC verified |
| --- | --- |
| Account Deletion | Full cascade: Firebase + MongoDB + anonymise audit logs |
| --- | --- |
| File Upload | 3-layer: frontend + Next.js config + Cloudinary hard limit |
| --- | --- |
| File Type | Magic byte validation — extension spoofing rejected |
| --- | --- |
| File Size | 5MB per image, 15MB total per listing submission |
| --- | --- |
| DDoS | Vercel edge network (free) + Next.js middleware filters |
| --- | --- |
| Security Headers | X-Frame-Options, X-Content-Type, CSP via next.config.ts |
| --- | --- |
| AI Moderation | Silent — flagged for admin only, user never sees result |
| --- | --- |

## 4.3 GDPR-Correct Account Deletion

- Soft delete all listings, scrub sellerPhone and sellerEmail from them
- Remove user from all savedBy arrays
- Anonymise AdminActivity entries — preserve logs, remove identity
- Delete their Report documents
- Delete Firebase account via Admin SDK
- Delete MongoDB User document and clear all session cookies

# 5\. Authentication Flow

## 5.1 JWT Architecture

- Firebase handles identity and email verification only
- On login: Firebase ID token → Next.js API route → verified server-side → HTTP-only JWT issued
- Access token: short TTL (15 minutes) — stored in HTTP-only cookie
- Refresh token: longer TTL (7 days) — stored in separate HTTP-only cookie
- All protected routes check JWT via middleware before reaching handlers
- Token refresh happens silently on the client — user never sees re-auth prompt

## 5.2 Middleware Stack

- auth middleware: verify JWT, attach user to request
- verified middleware: check emailVerified flag — required for posting and contact reveal
- ownership middleware: check listing.seller === req.user.uid
- reason middleware: require rejectionReason on admin reject actions

# 6\. AI Quality Checks

## 6.1 Three-Layer Check

| **Check** | **Tool** | **What It Catches** |
| --- | --- | --- |
| Category mismatch | Gemini 1.5 Flash | Book listed under Electronics etc. |
| --- | --- | --- |
| Inappropriate images | Cloudinary Moderation | Explicit or offensive photos |
| --- | --- | --- |
| Spam patterns | Rule-based keywords | Placeholder text, fake listings |
| --- | --- | --- |

## 6.2 Silent Flow

- User submits listing → saved with status: pending → user sees normal 'under review' message
- Background job fires 3 checks in parallel (fire-and-forget, non-blocking)
- Results written silently to listing.aiVerification
- If confidence > 0.8 → listing.aiFlagged = true → floats to top of admin moderation queue
- Admin sees reason + confidence score (colour-coded risk bar) → approves or rejects
- If AI unavailable → listing proceeds normally — fail open, never block the user

# 7\. Project Folder Structure

unideal/ ├── app/ │ ├── (auth)/ login, register, verify-email │ ├── (main)/ Homepage/browse, search │ │ ├── @modal/ Intercepting route for listing detail drawer │ │ │ └── listing/\[slug\]/ │ │ ├── listing/\[slug\]/ Standalone detail page (direct links) │ │ ├── category/\[slug\]/ │ │ ├── profile/\[uid\]/ │ │ └── dashboard/ My listings, saved │ ├── admin/ Stats, listings queue, reports, users │ ├── super-admin/ Dashboard, categories, users, activity │ └── api/ │ ├── auth/ login, logout, refresh │ ├── listings/ \[slug\]/contact (returns {waLink} only), save, report │ ├── categories/ │ ├── admin/ listings, reports, users │ └── super-admin/ users, categories, config, activity ├── components/ │ ├── ui/ shadcn components │ ├── layout/ Navbar, Footer, Sidebar │ ├── listing/ ListingCard, ContactButton, ListingDetailDrawer, │ │ ListingDetailPage, SellModal │ ├── search/ SearchBar, FilterPanel │ ├── auth/ LoginForm, RegisterForm, VerifyEmailBanner │ └── admin/ StatsCard, ModerationCard, ActivityTable ├── lib/ │ ├── db/connect.ts │ ├── auth/ firebase.ts, firebaseAdmin.ts, jwt.ts │ ├── ai/checkListing.ts │ └── cloudinary, resend, redis, rateLimit, generateSlug, logAction ├── models/ User, Listing, Category, AdminActivity, SystemConfig, Report ├── middleware/ auth, ownership, reason, verified ├── hooks/ useAuth, useListings, useSaved ├── types/ user, listing, category, api ├── middleware.ts Next.js route protection ├── next.config.ts Security headers └── seed/ categories.ts, superAdmin.ts

# 8\. Build Order — 6 Week Plan

| **Week** | **Focus** | **Deliverables** | **Done When** |
| --- | --- | --- | --- |
| Week 1 | Foundation | Project setup, all models, Firebase auth, JWT, seed scripts | Auth works end to end |
| --- | --- | --- | --- |
| Week 2 | Core Listings | Create listing + Cloudinary, homepage, listing detail drawer, category page | Post and browse works |
| --- | --- | --- | --- |
| Week 3 | User Features | Contact button (3 states, waLink only), save/wishlist, sell modal wizard, dashboard | Full seller workflow done |
| --- | --- | --- | --- |
| Week 4 | Trust & Safety | Report listing, email gate, search + filters, listing expiry | Safe to open publicly |
| --- | --- | --- | --- |
| Week 5 | Admin | Moderation queue with AI flags, reports review, super admin, audit logs | Admin can moderate |
| --- | --- | --- | --- |
| Week 6 | Launch | Sentry, SEO, mobile audit, Vercel deploy, seed production data | Live at vercel.app |
| --- | --- | --- | --- |

# 9\. Environment Variables (17 Total)

| **Variable** | **Service** | **Purpose** |
| --- | --- | --- |
| MONGODB_URI | MongoDB Atlas | Database connection string |
| --- | --- | --- |
| NEXT_PUBLIC_FIREBASE_API_KEY | Firebase | Client-side Firebase init |
| --- | --- | --- |
| NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN | Firebase | Client-side Firebase init |
| --- | --- | --- |
| NEXT_PUBLIC_FIREBASE_PROJECT_ID | Firebase | Client-side Firebase init |
| --- | --- | --- |
| FIREBASE_ADMIN_CLIENT_EMAIL | Firebase Admin | Server-side token verification |
| --- | --- | --- |
| FIREBASE_ADMIN_PRIVATE_KEY | Firebase Admin | Server-side token verification |
| --- | --- | --- |
| JWT_SECRET | Auth | Sign access tokens |
| --- | --- | --- |
| REFRESH_SECRET | Auth | Sign refresh tokens |
| --- | --- | --- |
| CLOUDINARY_CLOUD_NAME | Cloudinary | Image upload + moderation |
| --- | --- | --- |
| CLOUDINARY_API_KEY | Cloudinary | Image upload + moderation |
| --- | --- | --- |
| CLOUDINARY_API_SECRET | Cloudinary | Image upload + moderation |
| --- | --- | --- |
| RESEND_API_KEY | Resend | Transactional email sending |
| --- | --- | --- |
| UPSTASH_REDIS_REST_URL | Upstash | Rate limiting store |
| --- | --- | --- |
| UPSTASH_REDIS_REST_TOKEN | Upstash | Rate limiting store |
| --- | --- | --- |
| GEMINI_API_KEY | Google AI | AI category mismatch detection |
| --- | --- | --- |
| SENTRY_DSN | Sentry | Error tracking and alerting |
| --- | --- | --- |
| CRON_SECRET | Vercel Cron | Authenticate scheduled backup jobs |
| --- | --- | --- |