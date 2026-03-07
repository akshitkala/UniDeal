'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';

interface NavItemProps {
    href: string;
    icon: string;
    label: string;
}

function NavItem({ href, icon, label }: NavItemProps) {
    const pathname = usePathname();
    const active = pathname === href;
    return (
        <Link href={href} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 16px', borderRadius: 'var(--r)', margin: '2px 8px',
            background: active ? 'var(--bg-2)' : 'transparent',
            fontWeight: active ? 700 : 400, fontSize: 14,
            color: 'var(--ink-2)', textDecoration: 'none',
        }}>
            <span>{icon}</span>{label}
        </Link>
    );
}

function SectionLabel({ label }: { label: string }) {
    return (
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-4)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '16px 16px 6px' }}>
            {label}
        </div>
    );
}

export default function AdminSidebar() {
    const { user } = useAuth();
    const isSuperadmin = user?.role === 'superadmin';

    return (
        <aside style={{
            gridArea: 'sidebar', background: 'var(--surface)',
            borderRight: '1px solid var(--border-2)', overflowY: 'auto', paddingTop: 12,
            width: 240, height: '100%',
        }}>
            <SectionLabel label="MODERATION" />
            <NavItem href="/admin" icon="📋" label="Pending Queue" />
            <NavItem href="/admin/listings" icon="📦" label="All Listings" />
            <NavItem href="/admin/reports" icon="⚑" label="Reports" />
            <NavItem href="/admin/users" icon="👥" label="Users" />

            {isSuperadmin && (
                <>
                    <div style={{ height: 1, background: 'var(--border-2)', margin: '8px 16px' }} />
                    <SectionLabel label="SUPERADMIN" />
                    <NavItem href="/super-admin/config" icon="⚙" label="System Config" />
                    <NavItem href="/super-admin/activity" icon="📜" label="Activity Log" />
                    <NavItem href="/super-admin/users" icon="👤" label="Manage Roles" />
                </>
            )}
        </aside>
    );
}
