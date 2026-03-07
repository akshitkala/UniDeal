'use client';
import { useEffect, useState } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import Link from 'next/link';

interface Stats {
    listings: { total: number; active: number; pending: number; rejected: number; expired: number; };
    users: { total: number; banned: number; admins: number; };
    reports: { total: number; open: number; };
    activity: { listingsToday: number; usersToday: number; };
}

import { useAuth } from '@/lib/auth/AuthProvider';
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";
    const isTablet = breakpoint === "tablet";
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && currentUser?.role !== 'superadmin') {
            router.replace('/admin');
        }
    }, [user, authLoading, router]);

    if (authLoading || user?.role !== 'superadmin') {
        return <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-4)' }}>Verifying super-admin access...</div>;
    }

    const currentUser = user; // To match existing naming if used

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/super-admin/stats');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    const fetchActivity = async () => {
        try {
            const res = await fetch('/api/admin/activity?limit=5');
            const data = await res.json();
            setActivities(data.activities || []);
        } catch (error) {
            console.error("Failed to fetch activity", error);
        }
    };

    useEffect(() => {
        Promise.all([fetchStats(), fetchActivity()]).finally(() => setLoading(false));
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-4)' }}>Loading Dashboard...</div>;

    const cards = [
        { label: 'Pending Listings', value: stats?.listings.pending, icon: '⏳', color: 'var(--amber)' },
        { label: 'Active Listings', value: stats?.listings.active, icon: '✅', color: 'var(--green)' },
        { label: 'Rejected', value: stats?.listings.rejected, icon: '❌', color: 'var(--red)' },
        { label: 'Total Listings', value: stats?.listings.total, icon: '📦', color: 'var(--ink)' },
        { label: 'Total Users', value: stats?.users.total, icon: '👥', color: 'var(--ink)' },
        { label: 'Banned Users', value: stats?.users.banned, icon: '🚫', color: 'var(--red)' },
        { label: 'Open Reports', value: stats?.reports.open, icon: '⚑', color: 'var(--red)' },
        { label: 'New Today', value: stats?.activity.listingsToday, icon: '📈', color: 'var(--blue)' },
    ];

    return (
        <div className="full-height" style={{ padding: isMobile ? '24px 16px 100px' : '32px 24px' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: isMobile ? 26 : 28, fontWeight: 700, marginBottom: 24 }}>Platform Overview</h1>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
                gap: 16,
                marginBottom: 32
            }}>
                {cards.map((c, i) => (
                    <div key={i} style={{
                        background: 'var(--surface)',
                        padding: '20px 16px',
                        borderRadius: 'var(--r-md)',
                        border: '1px solid var(--border-2)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: 24, padding: 4 }}>{c.icon}</span>
                            <span style={{
                                fontFamily: 'monospace',
                                fontSize: 24,
                                fontWeight: 700,
                                color: c.color
                            }}>{c.value ?? 0}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</span>
                    </div>
                ))}
            </div>

            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 24
            }}>
                {/* Recent Activity */}
                <div style={{ flex: 1.5 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>📜</span> Recent Activity
                    </h2>
                    <div style={{
                        background: 'var(--surface)',
                        borderRadius: 'var(--r-md)',
                        border: '1px solid var(--border-2)',
                        overflow: 'hidden'
                    }}>
                        {activities.map((a, i) => (
                            <div key={i} style={{
                                padding: '12px 16px',
                                borderBottom: i === activities.length - 1 ? 'none' : '1px solid var(--border-2)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2
                            }}>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>
                                    {a.action.replace(/_/g, ' ')}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>
                                    {new Date(a.timestamp).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link href="/super-admin/activity" style={{
                        display: 'block',
                        marginTop: 12,
                        fontSize: 13,
                        color: 'var(--amber)',
                        textDecoration: 'none',
                        fontWeight: 600
                    }}>View All Activity →</Link>
                </div>

                {/* Quick Actions */}
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>⚡</span> Quick Actions
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                        {[
                            { label: 'Review Pending', href: '/admin', icon: '📋' },
                            { label: 'All Listings', href: '/admin/listings', icon: '📦' },
                            { label: 'Manage Reports', href: '/admin/reports', icon: '⚑' },
                            { label: 'Manage Roles', href: '/super-admin/users', icon: '👥' },
                        ].map((btn, i) => (
                            <Link key={i} href={btn.href} style={{
                                padding: '12px 16px',
                                background: 'var(--surface)',
                                border: '1.5px solid var(--border-2)',
                                borderRadius: 'var(--r)',
                                textDecoration: 'none',
                                color: 'var(--ink)',
                                fontSize: 14,
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                transition: 'all 0.2s ease'
                            }}>
                                <span>{btn.icon}</span> {btn.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
