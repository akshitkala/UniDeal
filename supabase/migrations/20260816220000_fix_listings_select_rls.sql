-- Drop old listings select public policy
drop policy if exists "listings_select_public" on public.listings;

-- Re-create listings select public policy using public_profiles view
-- This allows anonymous/guest (anon) role to read listings from non-banned sellers
create policy "listings_select_public" on public.listings
  for select using (
    status = 'approved'
    and exists (
      select 1
      from public.public_profiles p
      where p.id = seller_id and p.is_banned = false
    )
  );
