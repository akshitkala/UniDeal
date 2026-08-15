create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  branch text,
  year text,
  whatsapp_number text,
  is_admin boolean not null default false,
  is_banned boolean not null default false,
  promoted_by uuid references public.profiles(id),
  promoted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_is_admin on public.profiles(is_admin);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Student'));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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
  ('Miscellaneous', 'miscellaneous');

create type public.listing_condition as enum ('New', 'Like New', 'Good', 'Used', 'Damaged');
create type public.listing_status as enum ('approved', 'pending', 'rejected', 'sold', 'expired');

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

create type public.report_status as enum ('pending', 'resolved_removed', 'resolved_dismissed');

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

create table public.contact_reveals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index idx_contact_reveals_user_date on public.contact_reveals(user_id, created_at);

create table public.admin_settings (
  id int primary key default 1,
  approval_mode text not null default 'auto' check (approval_mode in ('auto', 'manual', 'ai')),
  constraint single_row check (id = 1)
);

insert into public.admin_settings (id, approval_mode) values (1, 'auto');

create or replace view public.public_profiles as
  select id, full_name, branch, year, is_admin, is_banned, promoted_by, promoted_at, created_at, updated_at
  from public.profiles;

create or replace function public.increment_listing_views(listing_id uuid)
returns void as $$
begin
  update public.listings
  set views = views + 1
  where id = listing_id;
end;
$$ language plpgsql security definer set search_path = public;
