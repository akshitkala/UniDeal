import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth-admin';
import AdminShell from '@/components/admin/AdminShell';

/**
 * QA-01: server-side is_admin guard for ALL /admin routes.
 * Re-checks profiles.is_admin via the shared service-role verification
 * (rules.md §3.6) and redirects non-admins / signed-out users to home
 * before any admin UI is rendered.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin } = await requireAdminSession();
  if (!isAdmin) redirect('/');

  return <AdminShell>{children}</AdminShell>;
}
