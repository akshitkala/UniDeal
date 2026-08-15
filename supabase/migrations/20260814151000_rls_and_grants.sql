alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.reports enable row level security;
alter table public.contact_reveals enable row level security;
alter table public.admin_settings enable row level security;
alter table public.categories enable row level security;

create policy "profiles_select_all" on public.profiles
  for select using (auth.role() = 'authenticated');

revoke select on public.profiles from anon, authenticated;
grant select (id, full_name, branch, year, is_admin, is_banned, promoted_by, promoted_at, created_at, updated_at)
  on public.profiles to authenticated;

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and is_admin = (select is_admin from public.profiles where id = auth.uid())
    and is_banned = (select is_banned from public.profiles where id = auth.uid())
  );

create policy "profiles_admin_update_any" on public.profiles
  for update using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

alter view public.public_profiles set (security_invoker = false);
grant select on public.public_profiles to anon, authenticated;

create policy "categories_select_all" on public.categories
  for select using (true);

create policy "listings_select_public" on public.listings
  for select using (
    status = 'approved'
    and exists (
      select 1
      from public.profiles p
      where p.id = seller_id and p.is_banned = false
    )
  );

create policy "listings_select_own" on public.listings
  for select using (auth.uid() = seller_id);

create policy "listings_select_admin" on public.listings
  for select using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

create policy "listings_insert_own" on public.listings
  for insert with check (
    auth.uid() = seller_id
    and exists (
      select 1
      from public.profiles p
      join auth.users u on u.id = p.id
      where p.id = auth.uid()
        and p.is_banned = false
        and u.email_confirmed_at is not null
    )
  );

create policy "listings_update_own" on public.listings
  for update using (auth.uid() = seller_id);

create policy "listings_update_admin" on public.listings
  for update using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

create policy "listings_delete_own" on public.listings
  for delete using (auth.uid() = seller_id);

create policy "listings_delete_admin" on public.listings
  for delete using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

create policy "reports_insert_own" on public.reports
  for insert with check (auth.uid() = reporter_id);

create policy "reports_select_own" on public.reports
  for select using (auth.uid() = reporter_id);

create policy "reports_select_admin" on public.reports
  for select using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

create policy "reports_update_admin" on public.reports
  for update using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

create policy "reveals_insert_own" on public.contact_reveals
  for insert with check (auth.uid() = user_id);

create policy "reveals_select_own" on public.contact_reveals
  for select using (auth.uid() = user_id);

create policy "reveals_select_admin" on public.contact_reveals
  for select using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

create policy "settings_select_admin" on public.admin_settings
  for select using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

create policy "settings_update_admin" on public.admin_settings
  for update using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

revoke all on function public.increment_listing_views(uuid) from public;
grant execute on function public.increment_listing_views(uuid) to anon, authenticated;
