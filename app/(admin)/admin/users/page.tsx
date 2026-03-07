'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (currentUser && currentUser.role !== 'superadmin') {
            router.replace('/admin');
        }
    }, [currentUser, router]);

    useEffect(() => {
        fetch('/api/admin/users')
            .then(r => r.json())
            .then(d => { setUsers(d.users ?? []); setLoading(false); });
    }, []);

    async function toggle(uid: string, isActive: boolean) {
        // Optimistic update
        setUsers(u => u.map(x => x.uid === uid ? { ...x, isActive: !isActive, bannedAt: !isActive ? new Date() : null } : x));

        try {
            const res = await fetch(`/api/admin/users/${uid}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: isActive ? 'ban' : 'unban' }),
            });
            if (!res.ok) throw new Error('Failed');
        } catch (e) {
            // Rollback on error
            setUsers(u => u.map(x => x.uid === uid ? { ...x, isActive, bannedAt: isActive ? null : x.bannedAt } : x));
        }
    }

    return (
        <div style={{ padding: '32px 24px' }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Users</h1>
            {loading && <p style={{ color: 'var(--ink-4)' }}>Loading…</p>}
            {!loading && users.length === 0 && <p style={{ color: 'var(--ink-4)' }}>No users found.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {users.map(u => {
                    const isSelf = u.uid === currentUser?.uid;
                    const isSuper = u.role === 'superadmin';
                    const canBan = !isSelf && !isSuper;

                    return (
                        <div key={u._id} style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                            background: 'var(--surface)', border: '1px solid var(--border-2)',
                            borderRadius: 'var(--r-md)',
                        }}>
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%', background: 'var(--ink)',
                                    display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 14,
                                }}>
                                    {u.displayName?.[0]?.toUpperCase() ?? 'U'}
                                </div>
                                <div style={{
                                    position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%',
                                    background: u.isActive ? 'var(--green)' : 'var(--red)',
                                    border: '2px solid var(--surface)'
                                }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{u.displayName} {isSelf && '(You)'}</div>
                                <div style={{ fontSize: 12, color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {u.email} · {u.role}
                                    {!u.isActive && u.bannedAt && (
                                        <span style={{ color: 'var(--red)', fontWeight: 600 }}>· Banned on {new Date(u.bannedAt).toLocaleDateString()}</span>
                                    )}
                                </div>
                            </div>
                            {!u.isActive && (
                                <span style={{
                                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                                    background: 'var(--red-bg)', color: 'var(--red)', textTransform: 'uppercase'
                                }}>Banned</span>
                            )}
                            {canBan && (
                                <button onClick={() => toggle(u.uid, u.isActive)} style={{
                                    padding: '6px 14px',
                                    border: `1.5px solid ${u.isActive ? 'var(--red)' : 'var(--green)'}`,
                                    color: u.isActive ? 'var(--red)' : 'var(--green)',
                                    background: 'transparent', borderRadius: 'var(--r)',
                                    fontWeight: 600, fontSize: 13, cursor: 'pointer',
                                }}>
                                    {u.isActive ? 'Ban' : 'Unban'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
