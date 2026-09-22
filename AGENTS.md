# AGENTS.md

UniDeal — campus buy/sell marketplace. Single Next.js 14 (App Router) package + Supabase, deployed on Vercel. Launched 2026-09-21; open issues are the tickets in `report.md` (QA-01…QA-09).

## Commands
- `npm run dev` / `npm run build` — dev server / production build.
- `npx tsc --noEmit` then `npm run build` — the real verification gate; both must pass clean. There is **no ESLint config** in the repo, so `npm run lint` interactively prompts to create one — don't commit a config unless asked. No CI exists (`.github/` absent); verification is local.
- Exit-gate integration suites: `node --env-file=.env.local scripts/test_phaseN_exit_gate.js` (N = 1…4). Each is standalone — no dev server needed (they hit Supabase directly), but they run against the **live** Supabase project with the service-role key and create/modify real users and listings. Run one at a time.
  - These scripts read `process.env` only — without `--env-file` they exit with "Missing Supabase environment variables".
- `node scripts/seed_admin_and_listings.js` — seeds admin + dummy listings (parses `.env.local` itself).

## Environment
- 8 vars documented in `.env.example`; real values in `.env.local` (gitignored) and mirrored on Vercel.
- Server-only, never `NEXT_PUBLIC_`-prefixed: `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CRON_SECRET`.
- Vercel cron pings `/api/cron/keepalive` daily 03:00 UTC; the route requires a `CRON_SECRET` header.

## Architecture (non-obvious)
- Path alias `@/*` → repo root (tsconfig `paths`).
- Route groups: `app/(public)`, `app/(auth)`, `app/(account)`, `app/admin`, `app/api`. `app/auth/callback/route.ts` is the Supabase email-link callback. Root `middleware.ts` refreshes the Supabase session on every matched request.
- Three Supabase clients in `lib/supabase/`: `client.ts` (browser), `server.ts` (server, anon), `admin.ts` (service-role — server-only with a client-import guard; only imported under `app/api/**` and `lib/auth-admin.ts`).
- Schema lives in one migration: `supabase/migrations/001_initial_schema.sql`. `types/database.ts` is the generated type surface — keep it in sync with schema changes.
- Auth is the `AuthModal` component only; there are **no `/login` or `/signup` routes** (rules §4: adding one is a regression).
- Design tokens are locked to `documents/design (2).md` via `tailwind.config.ts` + `app/globals.css`: accent `#16A34A`, Outfit headings / Work Sans body. Use the semantic Tailwind classes; don't invent colors.

## Security invariants (documents/rules_v1.1.md §3 — non-negotiable)
- RLS in the migration is the real boundary; API route checks are secondary. Column secrecy uses REVOKE/GRANT or the `public_profiles` view.
- `profiles.whatsapp_number` is REVOKE'd from anon+authenticated: a client-side `select('whatsapp_number')` silently returns `null` (open bug: `report.md` QA-02). Read it only server-side via the service-role client.
- The phone number never crosses to the browser — only a server-built `wa.me` link from `POST /api/listings/[id]/contact`.
- Admin actions (ban/promote/approve/reject/resolve) always re-check `is_admin` server-side via `requireAdminSession()` (`lib/auth-admin.ts`).
- Every listing-facing surface uses `firstName()`; never render `full_name`/branch/year outside the seller's own Profile page.

## Spec documents (`documents/`)
- Authoritative: `UniDeal_PRD_v2.1.md`, `UniDeal_TRD_v1.1.md`, `rules_v1.1.md` (§3 security, §4 scope — read the do-not-build list before adding features), `appflow.md`, `architecture_v1.1.md`, `design (2).md`, `roadmap (3).md`.
- Prose elsewhere says "design.md" / "roadmap.md" — the real filenames are the parenthesized ones above.
- `progress.md` = chronological work log, append after code changes. `report.md` = current QA findings.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## ponytail

You are a lazy senior developer. Lazy means efficient, not careless. The best code is the code never written.
Before writing any code, stop at the first rung that holds:
1. Does this need to be built at all? (YAGNI)
2. Does it already exist in this codebase? Reuse the helper, util, or pattern that's already here, don't re-write it.
3. Does the standard library already do this? Use it.
4. Does a native platform feature cover it? Use it.
5. Does an already-installed dependency solve it? Use it.
6. Can this be one line? Make it one line.
7. Only then: write the minimum code that works.
The ladder runs after you understand the problem, not instead of it: read the task and the code it touches, trace the real flow end to end, then climb.
Bug fix = root cause, not symptom: a report names a symptom. Grep every caller of the function you touch and fix the shared function once — one guard there is a smaller diff than one per caller, and patching only the path the ticket names leaves a sibling caller still broken.
Rules:
- No abstractions that weren't explicitly requested.
- No new dependency if it can be avoided.
- No boilerplate nobody asked for.
- Deletion over addition. Boring over clever. Fewest files possible.
- Shortest working diff wins, but only once you understand the problem. The smallest change in the wrong place isn't lazy, it's a second bug.
- Question complex requests: "Do you actually need X, or does Y cover it?"
- Pick the edge-case-correct option when two stdlib approaches are the same size, lazy means less code, not the flimsier algorithm.
- Mark deliberate simplifications that cut a real corner with a known ceiling (global lock, O(n²) scan, naive heuristic) with a `ponytail:` comment naming the ceiling and upgrade path.
Not lazy about: understanding the problem (read it fully and trace the real flow before picking a rung, a small diff you don't understand is just laziness dressed up as efficiency), input validation at trust boundaries, error handling that prevents data loss, security, accessibility, the calibration real hardware needs (the platform is never the spec ideal, a clock drifts, a sensor reads off), anything explicitly requested. Lazy code without its check is unfinished: non-trivial logic leaves ONE runnable check behind, the smallest thing that fails if the logic breaks (an assert-based demo/self-check or one small test file; no frameworks, no fixtures). Trivial one-liners need no test.

### ponytail + UniDeal security override
Per `documents/roadmap (3).md` §Cross-phase reminders: if ponytail suggests simplifying anything inside Phase 1 (schema/RLS/auth), Phase 3 (contact-reveal logic/rate-limit checks), or Phase 4 (admin actions, ban/promote/approve/reject/resolve logic), surface the suggestion to the user rather than applying it — even if it means a shorter diff. Security and scope boundaries (`documents/rules_v1.1.md` §3 and §4) take priority over the lazy ladder for those sections.

## Git Commit & Push & Workflow Rule
- **Push with every commit**: Immediately run `git push origin main` after creating any git commit.
- **Progress & Memory**: Always update `progress.md` and run `graphify update .` after code modifications.
- **Autonomous Progress**: Proceed through roadmap phases continuously, pausing only when crucial user input or explicit decision approval is required.
