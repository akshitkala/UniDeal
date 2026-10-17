import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth-admin';
import AdminShell from '@/components/admin/AdminShell';

/**
 * Server-side is_admin guard for ALL /admin routes.
 * Re-checks profiles.is_admin via the shared service-role verification
 * and serves the custom 404 page via notFound() for guests and non-admin users.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin } = await requireAdminSession();
  if (!isAdmin) notFound();

  return <AdminShell>{children}</AdminShell>;
}
