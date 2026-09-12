# UniDeal — Project Progress Log

## 2026-09-12 — Repository history reset
- Preserved the local document relocation and project tooling in commit `adaba06ca55e31490bbc2804e622bd69f254ad0e`.
- Replaced the abandoned, unrelated `origin/main` history with local `main` using `git push --force-with-lease origin main`.
- Confirmed `origin/main` now points to `adaba06ca55e31490bbc2804e622bd69f254ad0e`.
- The prior remote contained an incompatible OAuth-based implementation and is intentionally not part of this project history.

## 2026-09-11 — Phase 1: Project Scaffold + Supabase Schema
- Initialized Next.js 14+ App Router project structure matching TRD §4 / architecture.md §3:
  - Route groups: `(public)`, `(auth)`, `(account)`, and top-level `admin/`.
  - Configured locked design tokens from `design.md` in `tailwind.config.ts` (primary `#1C8A56`, contact `#15803D`, accent `#C97A2B`, surface `#F7F6F3`, border `#E5E3DD`, danger `#C0392B`, Sora headings, Inter body).
  - TypeScript strict mode enabled globally with path aliases (`@/*`).
- Created complete SQL schema migration `supabase/migrations/001_initial_schema.sql`:
  - 3 enums: `listing_condition`, `listing_status`, `report_status`.
  - 6 tables: `profiles`, `categories` (with 6 seed rows), `listings`, `reports`, `contact_reveals`, `admin_settings` (seeded single row `id=1, approval_mode='auto'`).
  - Performance indexes on all status, category, seller, date, and admin columns.
  - `handle_new_user` trigger on `auth.users` for automatic profile creation.
  - `increment_listing_views` security definer Postgres function.
  - Column-level lockdown: `whatsapp_number` revoked from anon and authenticated roles.
  - `public_profiles` view created for guest/buyer display without `whatsapp_number`.
  - RLS enabled and all 16 policies applied exactly per TRD §3 across all 6 tables.
- Generated `types/database.ts` representing all tables, views, enums, and functions.
- Implemented core library infrastructure:
  - `lib/supabase/client.ts` (browser client via `@supabase/ssr`)
  - `lib/supabase/server.ts` (server client via `@supabase/ssr` with typed cookies)
  - `lib/supabase/admin.ts` (service-role client with client-import guard)
  - `lib/display-name.ts` (`firstName()` standard utility)
  - `lib/slug.ts` (`{title}-{nanoid(5)}` slug generation)
  - `lib/rate-limit.ts` (50 reveals / 24h rolling count check)
  - `lib/cloudinary.ts` (upload constants and URL helpers)
  - `lib/whatsapp.ts` (`wa.me` deep link builder)
  - `lib/resend.ts` (server-only Resend client helper)
  - `lib/validation/listing.ts` & `lib/validation/contact.ts` (shared Zod schemas)
- Configured `.env.local` and `.env.example` with all TRD §7 environment variables.
- Configured `vercel.json` for the daily keepalive cron job.
- Verified TypeScript compilation (`tsc --noEmit`) with zero errors.
- Initial git commit created.
