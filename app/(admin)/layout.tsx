import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAccessToken } from '@/lib/auth/jwt';
import Topbar from '@/components/layout/Topbar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { SellProvider } from '@/components/listing/SellProvider';
import AdminLayoutClient from '@/components/layout/AdminLayoutClient';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) redirect('/login?returnTo=/admin');

    try {
        const user = verifyAccessToken(token);
        if (user.role !== 'admin' && user.role !== 'superadmin') {
            redirect('/');
        }
    } catch {
        redirect('/login?returnTo=/admin');
    }

    return (
        <SellProvider>
            <AdminLayoutClient>
                {children}
            </AdminLayoutClient>
        </SellProvider>
    );
}
