-- ============================================================
-- Migration: 20260818010000_public_listings_view.sql
--
-- PURPOSE:
--   Replace the PostgREST foreign-key-embedding pattern
--   (listings JOIN profiles via FK) that forced anon to have
--   direct SELECT on the base profiles table, with a pre-joined
--   Postgres view that joins listings with public_profiles only.
--
--   This keeps anon's access on the base profiles table at
--   genuinely zero, consistent with TRD §3.1 / architecture.md.
--
-- REVERSAL OF ERRONEOUS GRANT:
--   The preceding migration 20260817230500_fix_anon_profiles_select_grant.sql
--   granted anon SELECT on specific profiles columns as a workaround.
--   That grant is revoked here. The view approach is the correct fix.
-- ============================================================

-- Step 1: Revoke the erroneous column-level grant added in the
-- previous migration. Anon must have zero direct access to the
-- base profiles table.
revoke select on public.profiles from anon;

-- Step 2: Create public_listings view — joins approved listings
-- with the already-anon-accessible public_profiles view.
-- security_invoker = false means it always runs as the view owner
-- (postgres/service role), so anon never touches the base tables.
create or replace view public.public_listings
  with (security_invoker = false)
as
  select
    l.id,
    l.slug,
    l.seller_id,
    l.title,
    l.description,
    l.price,
    l.negotiable,
    l.category_id,
    l.condition,
    l.images,
    l.status,
    l.rejection_reason,
    l.views,
    l.created_at,
    l.updated_at,
    l.sold_at,
    -- Seller fields (from public_profiles, never base profiles)
    pp.full_name       as seller_full_name,
    pp.branch          as seller_branch,
    pp.year            as seller_year,
    pp.is_banned       as seller_is_banned
  from public.listings l
  join public.public_profiles pp on pp.id = l.seller_id
  -- Only expose approved listings where the seller is not banned.
  -- This bakes the visibility rule into the view itself.
  where l.status = 'approved'
    and pp.is_banned = false;

-- Step 3: Grant SELECT on the new view to anon and authenticated.
-- Anon gets read access through the view only; zero grant on the
-- underlying profiles or listings base tables is added here.
grant select on public.public_listings to anon, authenticated;
