# UniDeal — Backend Audit Report (Phase 1)
Generated: 2026-03-06 14:51 IST

## Summary
- Backend files checked: 41
- Missing files: 20
- Security checks passed: 27
- Security checks failed: 6
- TypeScript errors: 0
- Env vars filled: 11 / 17

---

## 1. File Existence

### EXISTS
- `lib/db/connect.ts`
- `lib/db/models.ts`
- `lib/auth/firebase.ts`
- `lib/auth/firebaseAdmin.ts`
- `lib/auth/jwt.ts`
- `lib/cloudinary.ts`
- `lib/ai/moderation.ts` *(note: named `moderation.ts`, not `checkListing.ts`)*
- `models/User.ts`
- `models/Listing.ts`
- `models/Category.ts`
- `models/AdminActivity.ts`
- `models/SystemConfig.ts`
- `models/Report.ts`
- `middleware/auth.ts` *(contains requireAuth, requireVerified, requireAdmin, requireSuperadmin, requireOwnership — all in one file)*
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/refresh/route.ts`
- `app/api/listings/route.ts`
- `app/api/listings/[slug]/route.ts`
- `app/api/listings/[slug]/contact/route.ts`
- `app/api/listings/[slug]/save/route.ts`
- `app/api/listings/upload/route.ts`
- `app/api/categories/route.ts`
- `app/api/reports/route.ts` *(note: public report submission; named differently from spec)*
- `app/api/admin/moderation/route.ts` *(admin report review — named differently from spec)*
- `app/api/admin/moderation/[id]/route.ts` *(admin report action — named differently from spec)*
- `app/api/super-admin/config/route.ts`
- `app/api/user/listings/route.ts`
- `seed/categories.ts`
- `seed/systemConfig.ts`

### MISSING
- `lib/rateLimit.ts`
- `lib/logAction.ts`
- `lib/resend.ts`
- `lib/ai/checkListing.ts` *(closest equivalent: `lib/ai/moderation.ts`)*
- `middleware/verified.ts` *(consolidated into `middleware/auth.ts`)*
- `middleware/ownership.ts` *(consolidated into `middleware/auth.ts`)*
- `middleware/admin.ts` *(consolidated into `middleware/auth.ts`)*
- `app/api/listings/[slug]/report/route.ts` *(functionality lives in `app/api/reports/route.ts`)*
- `app/api/users/profile/route.ts`
- `app/api/admin/listings/route.ts` *(closest equivalent: `app/api/admin/moderation/route.ts`)*
- `app/api/admin/listings/[id]/route.ts` *(closest equivalent: `app/api/admin/moderation/[id]/route.ts`)*
- `app/api/admin/users/[uid]/route.ts`
- `app/api/admin/reports/[id]/route.ts`
- `app/api/super-admin/users/[uid]/route.ts`
- `app/api/super-admin/activity/route.ts`
- `app/api/cron/expire-listings/route.ts`
- `app/api/cron/ai-retry/route.ts`
- `vercel.json`

---

## 2. File-by-File Code Audit

### PASS

**models/User.ts**
- ✅ Has `uid`, `email`, `emailVerified`, `displayName`, `photoURL` fields
- ✅ Has `role` field with enum `user/admin/superadmin` and default `user`
- ✅ Has `isActive` field default `true`
- ✅ Has `phone` field
- ✅ Has `whatsappNumber` field
- ✅ Has `savedListings` array of ObjectId refs
- ✅ Has timestamps

**models/Listing.ts**
- ✅ Has `sellerPhone` with `select: false`
- ✅ Has `sellerEmail` with `select: false`
- ✅ Has `status` enum `pending/approved/rejected/sold` default `pending`
- ✅ Has `isDeleted` field default `false`
- ✅ Has `slug` field unique
- ✅ Has `expiresAt` field
- ✅ Has `aiFlagged` field
- ✅ Has `aiVerification` object
- ✅ Has pre-save hook generating slug and expiresAt
- ✅ Has pre-find and pre-findOne middleware filtering `isDeleted: false`

**models/Category.ts**
- ✅ Has `name`, `slug`, `icon`, `isActive`, `order` fields

**models/AdminActivity.ts**
- ✅ Has `actor`, `action`, `target`, `targetModel`, `ipAddress`, `metadata` fields

**models/SystemConfig.ts**
- ✅ Has `_id: "global"` string type
- ✅ Has `approvalMode` enum `manual/automatic/ai-gated` default `automatic`
- ✅ Has `maintenanceMode` default `false`
- ✅ Has `allowNewListings` default `true`

**models/Report.ts**
- ✅ Has `listing`, `reporter`, `reason`, `status` fields
- ⚠️ Uses `reporter` field instead of `reportedBy` (minor naming discrepancy)

**middleware/auth.ts**
- ✅ Reads `access_token` cookie
- ✅ Calls `verifyAccessToken`
- ✅ Returns 401 if missing or invalid
- ✅ `requireVerified` checks `emailVerified`, returns 403 if false
- ✅ `requireOwnership` checks `uid === sellerUid` OR role is admin/superadmin, returns 403 if neither
- ✅ `requireAdmin` allows both `admin` AND `superadmin`
- ✅ `requireSuperadmin` allows ONLY `superadmin`

**lib/db/connect.ts**
- ✅ Uses `bufferCommands: false`
- ✅ Does NOT use deprecated `useNewUrlParser` or `useUnifiedTopology`
- ✅ Imports `@/lib/db/models` at the top

**lib/db/models.ts**
- ✅ Imports all 6 models to register them with Mongoose

**lib/auth/jwt.ts**
- ✅ Has `TokenPayload` interface with `uid`, `email`, `emailVerified`, `role`
- ✅ Has `signAccessToken`, `signRefreshToken`, `verifyAccessToken`, `verifyRefreshToken`

**lib/auth/firebaseAdmin.ts**
- ✅ Initializes admin SDK with `clientEmail`, `privateKey`, `projectId`
- ✅ Uses `.replace(/\\n/g, '\n')` on private key

**lib/cloudinary.ts**
- ✅ Configures cloudinary with `cloud_name`, `api_key`, `api_secret`, `secure: true`

**lib/ai/moderation.ts** (*check as equivalent of checkListing.ts*)
- ✅ Gemini Layer 1 check present
- ✅ Wrapped in try/catch
- ✅ Returns `{ flagged: false }` on missing API key (fail-open)
- ⚠️ On AI error, returns `{ flagged: false, shouldAutoApprove: false }` — routes to pending, not fully fail-open

**app/api/auth/login/route.ts**
- ✅ Reads `firebaseIdToken` from body
- ✅ Verifies with `admin.auth().verifyIdToken()`
- ✅ Finds or creates User document
- ✅ Checks `user.isActive` — returns 403 if false
- ✅ Sets `access_token` cookie: httpOnly, sameSite strict, maxAge 900 (15min)
- ✅ Sets `refresh_token` cookie: httpOnly, sameSite strict, maxAge 604800 (7d)
- ✅ All new users get `emailVerified: true` (Google-only login)

**app/api/auth/logout/route.ts**
- ✅ Clears both cookies by setting maxAge 0

**app/api/auth/refresh/route.ts**
- ✅ Reads `refresh_token` cookie
- ✅ Issues new `access_token` with correct settings

**app/api/listings/route.ts**
- ✅ Imports `@/models/User` and `@/models/Category`
- ✅ GET filters `status: approved` and `isExpired: false`
- ✅ GET supports `category`, `condition`, `sort`, `search` params
- ✅ POST calls `requireAuth` then `requireVerified`
- ✅ POST checks `SystemConfig.allowNewListings`
- ✅ POST handles all three `approvalMode` values
- ✅ POST sets `sellerEmail` from `user.email`

**app/api/listings/[slug]/route.ts**
- ✅ Imports `@/models/User` and `@/models/Category`
- ✅ GET increments `views`
- ✅ PATCH calls `requireAuth` and `requireOwnership`
- ✅ DELETE sets `isDeleted: true` — no hard delete

**app/api/listings/[slug]/contact/route.ts**
- ✅ Calls `requireAuth` and `requireVerified`
- ✅ Rate limited (20 per 24h via Upstash)
- ✅ Fetches seller with `.select('+phone +whatsappNumber')`
- ✅ Returns ONLY `{ waLink }` — no phone digits exposed

**app/api/listings/upload/route.ts**
- ✅ Uses `request.formData()` — no multer
- ✅ Validates file types (jpeg/png/webp)
- ✅ Validates per-file size (5MB max)
- ✅ Validates count (1-6 files)
- ✅ Validates total size (15MB max)
- ✅ Uploads to Cloudinary folder `listings`

**app/api/listings/[slug]/save/route.ts**
- ✅ Calls `requireAuth`
- ✅ Toggles in both `user.savedListings` and `listing.savedBy`
- ✅ Uses `Promise.all` for both updates
- ✅ Returns `{ saved: boolean }`

**app/api/categories/route.ts**
- ✅ Returns categories sorted by order

**app/api/super-admin/config/route.ts**
- ✅ Calls `requireSuperadmin`
- ✅ Updates SystemConfig `_id: "global"` with upsert
- ✅ Logs action to AdminActivity

**seed/categories.ts**
- ✅ Upserts 7 categories (Electronics, Books, Furniture, Clothing, Sports, Vehicles, Other)

**seed/systemConfig.ts**
- ✅ Upserts SystemConfig with `approvalMode: automatic`

### FAIL

- **`app/api/listings/[slug]/route.ts`** — GET does not explicitly prevent selection of `sellerPhone`/`sellerEmail`. While they have `select: false`, the route should still be audited for accidental `.select('+sellerEmail')` usage. None found, but no explicit guard.
- **`app/api/categories/route.ts`** — Does NOT filter `isActive: true`. Returns ALL categories including soft-disabled ones.
- **`app/api/user/listings/route.ts`** — Queries `sellerUid: user.uid` but the Listing model has no `sellerUid` field — the field is `seller` (ObjectId ref). This query will return **zero results** for every user.
- **`app/api/reports/route.ts`** — Does NOT call `requireVerified`. Any authenticated-but-unverified user can submit reports. No rate limiting either.
- **`app/api/super-admin/config/route.ts`** — AdminActivity.create uses wrong schema fields: `admin`, `details`, `ip` instead of the correct `actor`, `actorType`, `metadata`, `ipAddress`. These writes will silently fail schema validation.
- **`lib/auth/jwt.ts`** — `secure` cookie flag is only set for `process.env.NODE_ENV === 'production'`. In development this means cookies are sent over HTTP — acceptable dev-only, but worth noting.

---

## 3. Environment Variables

### FILLED
- `MONGODB_URI`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `JWT_SECRET`
- `REFRESH_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `GEMINI_API_KEY`

### EMPTY
- `RESEND_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `SENTRY_DSN`
- `CRON_SECRET`

---

## 4. TypeScript Errors

No errors found. `npx tsc --noEmit` exited with code 0.

---

## 5. Priority Fix List

### CRITICAL
1. **Wrong Listing field in user listings query** — `app/api/user/listings/route.ts` — Change `sellerUid: user.uid` to `seller: user._id` (requires fetching User from DB first) or use a `sellerUid` denormalized field consistently. As-is, dashboard shows zero listings for all users.
2. **AdminActivity written with wrong field names** — `app/api/super-admin/config/route.ts` — Fields `admin`, `details`, `ip` do not exist in the AdminActivity schema. Correct to `actor`, `actorType`, `action`, `metadata`, `ipAddress`. All audit logs for config changes are silently lost.
3. **Missing `app/api/users/profile/route.ts`** — Users have no way to update their profile (displayName, phone, whatsappNumber). The contact flow depends on `whatsappNumber` being set.
4. **Missing `app/api/cron/expire-listings/route.ts`** — Listings will never be marked expired. `isExpired` will stay `false` forever, polluting the browse feed with stale listings.
5. **Missing `app/api/admin/listings/route.ts` (pending review queue)** — Admins have no native API to review pending listings. The moderation route only handles reports, not new listing approvals.

### HIGH
1. **`categories/route.ts` returns inactive categories** — Add `{ isActive: true }` filter to the GET query. Disabled categories appear in the UI.
2. **`reports/route.ts` missing `requireVerified`** — Unverified users can spam reports. Add `requireVerified` check after `requireAuth`.
3. **No rate limiting on `reports/route.ts`** — `lib/rateLimit.ts` doesn't exist; `UPSTASH_REDIS_REST_URL` is empty. Contact route uses Upstash directly but that key is missing too. Rate limits for both contact and report routes will silently not work in production.
4. **Missing `app/api/super-admin/users/[uid]/route.ts`** — No way to promote/demote user roles via super-admin.
5. **Missing `app/api/admin/users/[uid]/route.ts`** — No way to ban/unban users via API.
6. **Missing `vercel.json`** — Cron jobs have no schedule configuration. Required for `expire-listings` to run on Vercel.

### MEDIUM
1. **`lib/rateLimit.ts` missing** — Both contact and report routes depend on Upstash for rate limiting. Without this and without Upstash credentials, all rate limiting is silently bypassed.
2. **`lib/logAction.ts` missing** — No centralized audit log helper. Individual routes manually create AdminActivity with inconsistent field usage (see super-admin/config issue above).
3. **`lib/resend.ts` missing** — No email infrastructure. Rejection emails and expiry notifications cannot be sent.
4. **`app/api/super-admin/activity/route.ts` missing** — No activity log viewer for super-admins.
5. **`app/api/cron/ai-retry/route.ts` missing** — AI-flagged listings stuck in `flagged` status have no retry mechanism.
6. **AI moderation fail mode** — On error `moderateListing` returns `shouldAutoApprove: false`, routing to pending. This is acceptable but differs from spec which states "fail-open". If Gemini is down, all new listings require manual review.
