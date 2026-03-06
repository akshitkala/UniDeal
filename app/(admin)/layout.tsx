import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAccessToken } from '@/lib/auth/jwt';
import Topbar from '@/components/layout/Topbar';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { SellProvider } from '@/components/listing/SellProvider';

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
            <div style={{
                display: 'grid',
                gridTemplateAreas: '"topbar topbar" "sidebar main"',
                gridTemplateRows: '60px 1fr',
                gridTemplateColumns: '240px 1fr',
                height: '100dvh',
                overflow: 'hidden',
            }}>
                <div style={{ gridArea: 'topbar' }}>
                    <Topbar />
                </div>
                <div style={{ gridArea: 'sidebar' }}>
                    <AdminSidebar />
                </div>
                <main style={{ gridArea: 'main', overflowY: 'auto', background: 'var(--bg)' }}>
                    {children}
                </main>
            </div>
        </SellProvider>
    );
}
