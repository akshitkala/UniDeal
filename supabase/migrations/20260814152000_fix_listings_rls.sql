-- Create security definer function to check email confirmation
-- This allows checking email confirmation status without granting SELECT on auth.users to public roles
create or replace function public.is_email_confirmed()
returns boolean as $$
begin
  return exists (
    select 1
    from auth.users
    where auth.users.id = auth.uid()
      and auth.users.email_confirmed_at is not null
  );
end;
$$ language plpgsql security definer set search_path = '';

-- Revoke default execute on the function and grant to public roles
revoke all on function public.is_email_confirmed() from public;
grant execute on function public.is_email_confirmed() to authenticated;

-- Drop the old listing insert policy
drop policy if exists "listings_insert_own" on public.listings;

-- Recreate listing insert policy using the helper function
create policy "listings_insert_own" on public.listings
  for insert with check (
    auth.uid() = seller_id
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.is_banned = false
    )
    and public.is_email_confirmed() = true
  );
