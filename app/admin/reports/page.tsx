import { requireAdminSession } from '@/lib/auth-admin';
import { getPendingReports } from '@/lib/admin/queries';
import AdminReportsClient from './client';

export default async function AdminReportsPage() {
  await requireAdminSession();
  const { data } = await getPendingReports();
  
  return <AdminReportsClient initialReports={data} />;
}
