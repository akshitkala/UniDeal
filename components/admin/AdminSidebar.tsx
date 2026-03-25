'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';

const MODERATION_NAV = [
  { label: 'Pending Queue', href: '/admin',          icon: '📋' },
  { label: 'All Listings',  href: '/admin/listings', icon: '📦' },
  { label: 'Reports',       href: '/admin/reports',  icon: '⚑'  },
];

const SUPERADMIN_NAV = [
  { label: 'Overview',     href: '/superadmin',            icon: '📊' },
  { label: 'Users',        href: '/superadmin/users',      icon: '👥' },
  { label: 'System Config',href: '/superadmin/config',     icon: '⚙️' },
  { label: 'Activity Log', href: '/superadmin/activity',   icon: '📜' },
  { label: 'Manage Roles', href: '/superadmin/roles',      icon: '👤' },
  { label: 'Categories',   href: '/superadmin/categories', icon: '🏷️' },
];

export default function AdminSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';
  const isSuperadminPath = pathname.startsWith('/superadmin');
  const isAdminPath = pathname.startsWith('/admin');

  const isActive = (href: string) =>
    href === '/admin' || href === '/superadmin'
      ? pathname === href
      : pathname.startsWith(href);

  return (
    <aside style={{
      width: isMobile ? '100%' : 220,
      minHeight: isMobile ? 'auto' : '100vh',
      background: 'white',
      borderRight: isMobile ? 'none' : '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 0',
      flexShrink: 0,
    }}>

      {/* Back to app */}
      <div style={{ padding: '0 12px 20px' }}>
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: '#6b7280',
            textDecoration: 'none',
            padding: '8px 10px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
          }}
        >
          ← Back to App
        </Link>
      </div>

      {/* MODERATION section — show if on admin path OR (superadmin NOT on superadmin path) */}
      {(isAdminPath || (isSuperAdmin && !isSuperadminPath)) && (
        <div style={{ padding: '0 12px', marginBottom: 24 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, color: '#9ca3af',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            margin: '0 0 8px 4px',
          }}>
            Moderation
          </p>
          {MODERATION_NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: isActive(item.href) ? 600 : 400,
                color: isActive(item.href) ? '#111827' : '#374151',
                background: isActive(item.href) ? '#f3f4f6' : 'transparent',
                textDecoration: 'none',
                marginBottom: 2,
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      )}

      {/* SUPERADMIN section — show if superadmin AND (on superadmin path OR NOT on admin path) */}
      {isSuperAdmin && (isSuperadminPath || !isAdminPath) && (
        <div style={{ padding: '0 12px', marginBottom: 24 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, color: '#9ca3af',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            margin: '0 0 8px 4px',
          }}>
            Superadmin
          </p>
          {SUPERADMIN_NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: isActive(item.href) ? 600 : 400,
                color: isActive(item.href) ? '#111827' : '#374151',
                background: isActive(item.href) ? '#f3f4f6' : 'transparent',
                textDecoration: 'none',
                marginBottom: 2,
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      )}

      {/* Switch Dashboard Link for Superadmins */}
      {isSuperAdmin && (
        <div style={{ marginTop: 'auto', padding: '0 12px' }}>
          <Link
            href={isSuperadminPath ? '/admin' : '/superadmin'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              color: '#16a34a',
              background: '#f0fdf4',
              textDecoration: 'none',
              border: '1px solid #dcfce7',
            }}
          >
            {isSuperadminPath ? '⚡ Switch to Moderation' : '👑 Switch to Superadmin'}
          </Link>
        </div>
      )}
    </aside>
  );
}
