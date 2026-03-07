'use client';
import { useEffect, useState } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useRouter } from 'next/navigation';

export default function SuperAdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser, loading: authLoading } = useAuth();
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && (!currentUser || currentUser.role !== 'superadmin')) {
            router.replace('/login?returnTo=/super-admin/users');
        }
    }, [currentUser, authLoading, router]);

    useEffect(() => {
        if (currentUser?.role === 'superadmin') {
            fetch('/api/admin/users')
                .then(r => r.json())
                .then(d => { setUsers(d.users ?? []); setLoading(false); });
        }
    }, [currentUser]);

    if (authLoading || currentUser?.role !== 'superadmin') {
        return (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-4)', minHeight: '100dvh' }}>
                <div className="spinner"></div>
                <p style={{ marginTop: 12 }}>Verifying super-admin access...</p>
            </div>
        );
    }

    async function changeRole(uid: string, role: string) {
        await fetch(`/api/super-admin/users/${uid}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role }),
        });
        setUsers(u => u.map(x => x.uid === uid ? { ...x, role } : x));
    }

    async function toggleBan(uid: string, isActive: boolean) {
        setUsers(u => u.map(x => x.uid === uid ? { ...x, isActive: !isActive, bannedAt: !isActive ? new Date() : null } : x));
        try {
            const res = await fetch(`/api/super-admin/users/${uid}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: isActive ? 'ban' : 'unban' }),
            });
            if (!res.ok) throw new Error('Failed');
        } catch (e) {
            setUsers(u => u.map(x => x.uid === uid ? { ...x, isActive, bannedAt: isActive ? null : x.bannedAt } : x));
        }
    }

    return (
        <div style={{
            padding: isMobile ? '24px 16px 100px' : '32px 24px',
            minHeight: "100dvh"
        }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: isMobile ? 26 : 28, fontWeight: 700, marginBottom: 8 }}>Manage Roles</h1>
            <p style={{ color: 'var(--ink-4)', marginBottom: 24, fontSize: 13 }}>
                Promote or demote users. Changes take effect on next login.
            </p>
            {loading && (
                <div style={{ padding: 40, textAlign: "center", color: "var(--ink-4)" }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: 12 }}>Loading users...</p>
                </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {users.map(u => {
                    const isSelf = u.uid === currentUser?.uid;
                    const canMod = !isSelf;

                    return (
                        <div key={u._id} style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            alignItems: isMobile ? 'stretch' : 'center',
                            gap: 16,
                            padding: isMobile ? 16 : '12px 20px',
                            background: 'var(--surface)',
                            border: '1px solid var(--border-2)',
                            borderRadius: 'var(--r-md)',
                            opacity: u.isActive ? 1 : 0.8
                        }}>
                            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--ink)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                                        {u.displayName?.[0]?.toUpperCase() ?? 'U'}
                                    </div>
                                    <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: '50%', background: u.isActive ? 'var(--green)' : 'var(--red)', border: '2px solid var(--surface)' }} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{u.displayName} {isSelf && '(You)'}</div>
                                    <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{u.email}</div>
                                </div>
                            </div>
                            <div style={{
                                borderTop: isMobile ? '1px solid var(--border-2)' : 'none',
                                paddingTop: isMobile ? 12 : 0,
                                display: 'flex',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                gap: 12
                            }}>
                                <select
                                    disabled={!canMod}
                                    value={u.role}
                                    onChange={e => changeRole(u.uid, e.target.value)}
                                    style={{
                                        padding: '6px 10px', borderRadius: 'var(--r)',
                                        border: '1.5px solid var(--border-2)',
                                        fontFamily: 'var(--font-sans)', fontSize: 12,
                                        background: 'var(--surface)', cursor: canMod ? 'pointer' : 'default',
                                        fontWeight: 600, color: 'var(--ink-2)'
                                    }}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">Super Admin</option>
                                </select>

                                {canMod && (
                                    <button onClick={() => toggleBan(u.uid, u.isActive)} style={{
                                        padding: '6px 12px',
                                        border: `1.5px solid ${u.isActive ? 'var(--red)' : 'var(--green)'}`,
                                        color: u.isActive ? 'var(--red)' : 'var(--green)',
                                        background: 'transparent', borderRadius: 'var(--r)',
                                        fontWeight: 700, fontSize: 11, cursor: 'pointer',
                                        textTransform: 'uppercase', letterSpacing: '0.05em'
                                    }}>
                                        {u.isActive ? 'Ban' : 'Unban'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
