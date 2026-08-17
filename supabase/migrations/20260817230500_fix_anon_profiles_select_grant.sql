-- Grant select on public profiles columns to anon role to fix anonymous guest browsing joins
grant select (id, full_name, branch, year, is_admin, is_banned, created_at)
  on public.profiles to anon;
