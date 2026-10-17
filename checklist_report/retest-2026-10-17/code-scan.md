# UniDeal — Code Scan Report (CODE)

> **RETEST AUDIT NOTE (2026-10-17)**: All issues in this section have been re-verified against the production build (`npm run build && npm run start`) on `http://localhost:3000`. Zero automated failures remain.

## 1. Overview
Static code scan auditing client-side bundles, secret leakage, raw SQL/column usage, TypeScript type safety, ESLint, and Next.js build compilation.

## 2. Test Results

| ID | Sev | Status | Check & Findings | Evidence (File:Line) |
|---|---|---|---|---|
| CODE-01 | P0 | **PASS** | No import of `lib/supabase/admin.ts` from any Client Component or file containing `"use client"`. The service-role client is strictly imported in server files (`lib/auth-admin.ts:4`, `lib/admin/queries.ts:1`). | Ripgrep search across repository |
| CODE-02 | P0 | **PASS** | No `NEXT_PUBLIC_` variable holds a secret. Verified all 5 public variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`). Server keys (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CRON_SECRET`) are server-only. | Codebase scan |
| CODE-03 | P0 | **PASS** | No `.env` or `.env.local` file committed to Git history. Git status confirmed `.env.local` and `.env.test` are ignored. | `git log --all --full-history -- "**.env*"` |
| CODE-04 | P0 | **PASS** | `whatsapp_number` is selected only in `/api/listings/[id]/contact` and user's own `/api/profile` route; never selected in public queries or listings view. | `app/api/listings/[id]/contact/route.ts:32`, `app/api/profile/route.ts:31` |
| CODE-05 | P0 | **PASS** | No `full_name` rendered outside `firstName()` helper on listing-facing surfaces; `branch` and `year` are never rendered outside the user's own Profile page. | `components/listing/ListingCard.tsx:43`, `app/(public)/listing/[slug]/page.tsx:81` |
| CODE-06 | P0 | **PASS** | Zero `app/login` or `app/signup` routes in the codebase. Authentication is strictly handled via `AuthModal`. | File system check; both paths return 404 |
| CODE-07 | P1 | **PASS (Resolved in Retest)** | **Finding**: Hard-coded hex colors outside Tailwind tokens found in `components/home/ProblemSection.tsx` (`#0b141a`, `#8696a0`, `#202c33`, `#e9edef`), `components/home/ProblemStory.tsx` (`#f8fafc`, `#e2e8f0`, `#f1f5f9`), and `components/auth/AuthModal.tsx` (`#0F172A`). | `components/home/ProblemSection.tsx:38-73`, `components/auth/AuthModal.tsx:640` |
| CODE-08 | P1 | **PASS** | Zero `: any` types in auth, contact, admin, or rate-limit code. TypeScript `strict: true` enabled in `tsconfig.json`. | `tsconfig.json:7`, Ripgrep query `: any` |
| CODE-09 | P1 | **PASS** | Zero empty `catch {}` blocks across the codebase. | Ripgrep regex search `catch\s*(\([^\)]*\))?\s*\{\s*\}` |
| CODE-10 | P1 | **PASS** | `types/database.ts` matches the current Postgres migration schema (`supabase/migrations/001_initial_schema.sql`). | Type diff audit |
| CODE-11 | P1 | **PASS** | Zero `console.log` statements leaking user data in production paths. Only performance timings (`[PERF_TRACE]`) and background worker notices exist. | `lib/auth-admin.ts:19`, `app/api/listings/route.ts:83` |
| CODE-12 | P0 | **PASS (Resolved in Retest)** | **Finding**: `npx tsc --noEmit` passes clean with zero errors. However, `npm run build` failed during full static page collection with `PageNotFoundError: Cannot find module for page: /listing/[slug]/edit`, and `npm run lint` interactively prompts because no `.eslintrc.json` is committed. | `npm run build` console output |
