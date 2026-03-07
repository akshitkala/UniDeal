'use client';
import { useEffect, useState } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

interface Category {
    _id: string;
    name: string;
    slug: string;
    icon: string;
    order: number;
}

export default function SuperAdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [form, setForm] = useState({ name: '', slug: '', icon: '', order: 0 });
    const [saving, setSaving] = useState(false);

    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";

    async function load() {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data.categories || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    function openEdit(cat: Category) {
        setEditingCategory(cat);
        setForm({
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            order: cat.order
        });
        setIsModalOpen(true);
    }

    function openAdd() {
        setEditingCategory(null);
        setForm({ name: '', slug: '', icon: '', order: categories.length + 1 });
        setIsModalOpen(true);
    }

    const handleNameChange = (name: string) => {
        const slug = name.toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        setForm(prev => ({
            ...prev,
            name,
            slug: editingCategory ? prev.slug : slug
        }));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        try {
            const url = editingCategory
                ? `/api/super-admin/categories/${editingCategory._id}`
                : '/api/super-admin/categories';

            const res = await fetch(url, {
                method: editingCategory ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
                credentials: 'include'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save');
            }

            setIsModalOpen(false);
            await load();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(cat: Category) {
        if (!confirm(
            `Delete "${cat.name}"?\n\nAny listings in this category will be automatically moved to "Other".`
        )) return;

        const res = await fetch(`/api/super-admin/categories/${cat._id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        const data = await res.json();

        if (!res.ok) {
            alert(data.error);
            return;
        }

        if (data.movedListings > 0) {
            alert(data.message);
        }

        await load();
    }

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

    return (
        <div style={{ padding: isMobile ? '24px 16px' : '32px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, margin: 0 }}>Manage Categories</h1>
                <button
                    onClick={openAdd}
                    style={{
                        padding: '10px 18px',
                        background: '#1a1a1a',
                        color: '#fff',
                        borderRadius: 'var(--r)',
                        border: 'none',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer'
                    }}
                >
                    + Add Category
                </button>
            </div>

            <div style={{
                background: 'var(--surface)',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-2)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)'
            }}>
                {categories.map((cat, i) => (
                    <div key={cat._id} style={{
                        padding: '16px 20px',
                        borderBottom: i === categories.length - 1 ? 'none' : '1px solid var(--border-2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 24 }}>{cat.icon}</span>
                            <div>
                                <div style={{ fontWeight: 600 }}>{cat.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>/{cat.slug}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <span style={{ fontSize: 13, color: 'var(--ink-4)', fontWeight: 500, marginRight: 10 }}>Ord: {cat.order}</span>

                            <button
                                onClick={() => openEdit(cat)}
                                style={{
                                    padding: '7px 14px',
                                    border: '1.5px solid var(--border-2)',
                                    borderRadius: 8,
                                    background: 'transparent',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    color: 'var(--ink-2)',
                                }}
                            >
                                ✎ Edit
                            </button>

                            {cat.slug !== 'other' && (
                                <button
                                    onClick={() => handleDelete(cat)}
                                    style={{
                                        padding: '7px 14px',
                                        border: '1.5px solid #fca5a5',
                                        borderRadius: 8,
                                        background: 'transparent',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        color: '#dc2626',
                                    }}
                                >
                                    🗑 Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 20, zIndex: 1000
                }}>
                    <div style={{
                        background: '#fff', width: '100%', maxWidth: 400,
                        borderRadius: 20, padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                    }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
                            {editingCategory ? 'Edit Category' : 'Add Category'}
                        </h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-4)', display: 'block', marginBottom: 6 }}>NAME</label>
                                <input
                                    type="text" required
                                    value={form.name}
                                    onChange={e => handleNameChange(e.target.value)}
                                    placeholder="e.g. Electronics"
                                    style={{
                                        width: '100%', padding: '12px 14px',
                                        border: '1.5px solid var(--border-2)', borderRadius: 10,
                                        fontSize: 14, outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-4)', display: 'block', marginBottom: 6 }}>SLUG</label>
                                <input
                                    type="text" required
                                    value={form.slug}
                                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                                    disabled={editingCategory?.slug === 'other'}
                                    style={{
                                        width: '100%', padding: '12px 14px',
                                        border: '1.5px solid var(--border-2)', borderRadius: 10,
                                        fontSize: 14, outline: 'none',
                                        background: editingCategory?.slug === 'other' ? 'var(--bg-2)' : 'transparent'
                                    }}
                                />
                                {editingCategory?.slug === 'other' && (
                                    <p style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 4 }}>The "other" slug is reserved.</p>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-4)', display: 'block', marginBottom: 6 }}>ICON</label>
                                    <input
                                        type="text" required
                                        value={form.icon}
                                        onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                                        placeholder="e.g. 💻"
                                        style={{
                                            width: '100%', padding: '12px 14px',
                                            border: '1.5px solid var(--border-2)', borderRadius: 10,
                                            fontSize: 14, outline: 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-4)', display: 'block', marginBottom: 6 }}>ORDER</label>
                                    <input
                                        type="number" required
                                        value={form.order}
                                        onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) }))}
                                        style={{
                                            width: '100%', padding: '12px 14px',
                                            border: '1.5px solid var(--border-2)', borderRadius: 10,
                                            fontSize: 14, outline: 'none'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{
                                        flex: 1, padding: 14, borderRadius: 12,
                                        border: '1.5px solid var(--border-2)', background: 'transparent',
                                        fontWeight: 700, cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        flex: 1.5, padding: 14, borderRadius: 12,
                                        border: 'none', background: '#1a1a1a', color: '#fff',
                                        fontWeight: 700, cursor: 'pointer',
                                        opacity: saving ? 0.7 : 1
                                    }}
                                >
                                    {saving ? 'Saving...' : 'Save Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
