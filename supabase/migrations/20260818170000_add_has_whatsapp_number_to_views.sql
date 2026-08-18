-- ============================================================
-- Migration: 20260818170000_add_has_whatsapp_number_to_views.sql
--
-- PURPOSE:
--   Add `has_whatsapp_number` boolean to `public_profiles` and
--   `seller_has_whatsapp_number` boolean to `public_listings`.
--
--   This allows guest and user-facing pages (such as the listing
--   detail page) to proactively determine if contact is available
--   without ever exposing or bypassing RLS on the raw phone number.
-- ============================================================

-- Step 1: Update public_profiles view to include has_whatsapp_number
create or replace view public.public_profiles as
  select
    id,
    full_name,
    branch,
    year,
    (whatsapp_number is not null and whatsapp_number != '') as has_whatsapp_number,
    is_admin,
    is_banned,
    promoted_by,
    promoted_at,
    created_at,
    updated_at
  from public.profiles;

grant select on public.public_profiles to anon, authenticated;

-- Step 2: Update public_listings view to include seller_has_whatsapp_number
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
    pp.full_name           as seller_full_name,
    pp.branch              as seller_branch,
    pp.year                as seller_year,
    pp.is_banned           as seller_is_banned,
    pp.has_whatsapp_number as seller_has_whatsapp_number
  from public.listings l
  join public.public_profiles pp on pp.id = l.seller_id
  where l.status = 'approved'
    and pp.is_banned = false;

grant select on public.public_listings to anon, authenticated;
