import { createAdminClient } from '@/lib/supabase/admin';

export async function getAdminSettings() {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('admin_settings')
    .select('id, approval_mode')
    .eq('id', 1)
    .single();
  return { data, error };
}

export async function getAdminOverview() {
  const adminClient = createAdminClient();
  const [pending, reports, users] = await Promise.all([
    adminClient.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    adminClient.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    adminClient.from('profiles').select('id', { count: 'exact', head: true }),
  ]);
  
  if (pending.error || reports.error || users.error) {
    return { error: pending.error || reports.error || users.error, data: null };
  }
  
  return {
    data: {
      pending_listings: pending.count ?? 0,
      open_reports: reports.count ?? 0,
      total_users: users.count ?? 0,
    },
    error: null,
  };
}

export async function getPendingListings() {
  const adminClient = createAdminClient();
  const { data: listings, error } = await adminClient
    .from('listings')
    .select(`
      id,
      slug,
      title,
      description,
      price,
      negotiable,
      condition,
      images,
      status,
      created_at,
      categories!inner(id, name, slug),
      public_profiles!inner(id, full_name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  return { data: listings || [], error };
}

export async function getPendingReports() {
  const adminClient = createAdminClient();
  const { data: reports, error } = await adminClient
    .from('reports')
    .select(`
      id,
      reason,
      status,
      created_at,
      listings!inner(id, title, slug, price, status, images),
      public_profiles!reports_reporter_id_fkey(id, full_name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  return { data: reports || [], error };
}

export async function getUsers() {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('profiles') // The API route uses public_profiles but the DB is just profiles. Wait!
    // The previous users page fetched from 'public_profiles' view. We can use adminClient on 'profiles'.
    .select('id, full_name, branch, year, is_admin, is_banned, created_at')
    .order('created_at', { ascending: false });
  return { data: data || [], error };
}
