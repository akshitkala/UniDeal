-- ==============================================================================
-- UniDeal Initial Database Schema & RLS Policies
-- Single source of truth: UniDeal TRD v1.1 (§2 & §3)
-- ==============================================================================

-- 1. ENUMS
-- ------------------------------------------------------------------------------
create type public.listing_condition as enum ('New', 'Like New', 'Good', 'Used', 'Damaged');
create type public.listing_status as enum ('approved', 'pending', 'rejected', 'sold', 'expired');
create type public.report_status as enum ('pending', 'resolved_removed', 'resolved_dismissed');

-- 2. TABLES
-- ------------------------------------------------------------------------------

-- 2.1 profiles
-- Extends auth.users with app-specific fields.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  branch text,
  year text,
  whatsapp_number text, -- stored as E.164 (+919876543210), NEVER exposed to clients
  is_admin boolean not null default false,
  is_banned boolean not null default false,
  promoted_by uuid references public.profiles(id),
  promoted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_is_admin on public.profiles(is_admin);

-- 2.2 categories
create table public.categories (
  id serial primary key,
  name text not null unique,
  slug text not null unique
);

insert into public.categories (name, slug) values
  ('Books & Notes', 'books-notes'),
  ('Electronics', 'electronics'),
  ('Furniture', 'furniture'),
  ('Clothing', 'clothing'),
  ('Sports & Fitness', 'sports-fitness'),
  ('Miscellaneous', 'miscellaneous')
on conflict (name) do nothing;

-- 2.3 listings
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  negotiable boolean not null default false,
  category_id int not null references public.categories(id),
  condition public.listing_condition not null,
  images text[] not null check (array_length(images, 1) between 1 and 4),
  status public.listing_status not null default 'approved',
  rejection_reason text,
  views int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sold_at timestamptz
);

create index idx_listings_status on public.listings(status);
create index idx_listings_category on public.listings(category_id);
create index idx_listings_seller on public.listings(seller_id);
create index idx_listings_created on public.listings(created_at desc);

-- 2.4 reports
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  status public.report_status not null default 'pending',
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (listing_id, reporter_id)
);

create index idx_reports_status on public.reports(status);

-- 2.5 contact_reveals
create table public.contact_reveals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index idx_contact_reveals_user_date on public.contact_reveals(user_id, created_at);

-- 2.6 admin_settings
create table public.admin_settings (
  id int primary key default 1,
  approval_mode text not null default 'auto' check (approval_mode in ('auto', 'manual', 'ai')),
  constraint single_row check (id = 1)
);

insert into public.admin_settings (id, approval_mode) values (1, 'auto')
on conflict (id) do nothing;

-- 3. FUNCTIONS & TRIGGERS
-- ------------------------------------------------------------------------------

-- 3.1 Auto-create profile on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Student'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3.2 increment_listing_views (security definer to allow guest/public views counting)
create or replace function public.increment_listing_views(listing_id uuid)
returns void as $$
begin
  update public.listings set views = views + 1 where id = listing_id;
end;
$$ language plpgsql security definer;

grant execute on function public.increment_listing_views(uuid) to anon, authenticated;

-- 4. VIEWS & COLUMN-LEVEL LOCKDOWN
-- ------------------------------------------------------------------------------

-- Public-readable view for guests and buyers: deliberately omits whatsapp_number
create or replace view public.public_profiles as
  select id, full_name, branch, year, is_admin, is_banned, promoted_by, promoted_at, created_at, updated_at
  from public.profiles;

alter view public.public_profiles set (security_invoker = false);
grant select on public.public_profiles to anon, authenticated;

-- Column-level lockdown on profiles table:
-- Strip direct select on whatsapp_number from both anon and authenticated roles.
-- Only the service-role client (server-side in contact reveal route) can access it.
revoke select on public.profiles from anon, authenticated;
grant select (id, full_name, branch, year, is_admin, is_banned, promoted_by, promoted_at, created_at, updated_at)
  on public.profiles to authenticated;

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.listings enable row level security;
alter table public.reports enable row level security;
alter table public.contact_reveals enable row level security;
alter table public.admin_settings enable row level security;

-- 5.1 profiles policies
create policy "profiles_select_all" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and is_admin = (select is_admin from public.profiles where id = auth.uid())
    and is_banned = (select is_banned from public.profiles where id = auth.uid())
  );

create policy "profiles_admin_update_any" on public.profiles
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- 5.2 categories policies
create policy "categories_select_all" on public.categories
  for select using (true);

-- 5.3 listings policies
create policy "listings_select_public" on public.listings
  for select using (
    status = 'approved'
    and exists (select 1 from public.profiles p where p.id = seller_id and p.is_banned = false)
  );

create policy "listings_select_own" on public.listings
  for select using (auth.uid() = seller_id);

create policy "listings_select_admin" on public.listings
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "listings_insert_own" on public.listings
  for insert with check (
    auth.uid() = seller_id
    and exists (
      select 1 from public.profiles p
      join auth.users u on u.id = p.id
      where p.id = auth.uid() and p.is_banned = false and u.email_confirmed_at is not null
    )
  );

create policy "listings_update_own" on public.listings
  for update using (auth.uid() = seller_id);

create policy "listings_update_admin" on public.listings
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "listings_delete_own" on public.listings
  for delete using (auth.uid() = seller_id);

create policy "listings_delete_admin" on public.listings
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- 5.4 reports policies
create policy "reports_insert_own" on public.reports
  for insert with check (auth.uid() = reporter_id);

create policy "reports_select_own" on public.reports
  for select using (auth.uid() = reporter_id);

create policy "reports_select_admin" on public.reports
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "reports_update_admin" on public.reports
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- 5.5 contact_reveals policies
create policy "reveals_insert_own" on public.contact_reveals
  for insert with check (auth.uid() = user_id);

create policy "reveals_select_own" on public.contact_reveals
  for select using (auth.uid() = user_id);

create policy "reveals_select_admin" on public.contact_reveals
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- 5.6 admin_settings policies
create policy "settings_select_admin" on public.admin_settings
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );

create policy "settings_update_admin" on public.admin_settings
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
  );
