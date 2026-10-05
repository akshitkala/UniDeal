import { requireAdminSession } from '@/lib/auth-admin';
import { getPendingListings } from '@/lib/admin/queries';
import AdminPendingQueueClient from './client';

export default async function AdminPendingQueuePage() {
  await requireAdminSession();
  const { data } = await getPendingListings();
  
  return <AdminPendingQueueClient initialListings={data} />;
}
