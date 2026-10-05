import { requireAdminSession } from '@/lib/auth-admin';
import { getAdminSettings, getAdminOverview } from '@/lib/admin/queries';
import AdminOverviewClient from './client';

export default async function AdminOverviewPage() {
  await requireAdminSession();
  const [settings, overview] = await Promise.all([
    getAdminSettings(),
    getAdminOverview()
  ]);
  
  return <AdminOverviewClient initialSettings={settings.data} initialOverview={overview.data} />;
}
