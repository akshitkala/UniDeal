import { requireAdminSession } from '@/lib/auth-admin';
import { getUsers } from '@/lib/admin/queries';
import AdminUsersClient from './client';

export default async function AdminUsersPage() {
  await requireAdminSession();
  const { data } = await getUsers();
  
  return <AdminUsersClient initialUsers={data} />;
}
