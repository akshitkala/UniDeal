'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ContactButton } from './ContactButton';
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useAuth } from "@/lib/auth/AuthProvider";
import dynamic from 'next/dynamic';

const SellModal = dynamic(
    () => import('./SellModal'),
    { ssr: false }
);

interface ListingDetailDrawerProps {
    slug: string | null;
    initialData?: any;
    isOpen: boolean;
    onClose: () => void;
}

function optimizeImage(url: string, width = 400): string {
    if (!url?.includes('res.cloudinary.com')) return url;
    return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto,c_fill/`);
}

export default function ListingDetailDrawer({ slug, initialData, isOpen, onClose }: ListingDetailDrawerProps) {
    const router = useRouter();
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";
    const { user } = useAuth();

    const [fullListing, setFullListing] = useState<any>(null);
    const [isSaved, setIsSaved] = useState(initialData?.isSaved || false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // This determines what we show instantly vs what waits for fetch
    const display = fullListing ?? initialData;

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('drawer-open');
        } else {
            document.body.classList.remove('drawer-open');
        }
        return () => document.body.classList.remove('drawer-open');
    }, [isOpen]);

    useEffect(() => {
        if (!slug || !isOpen) return;

        setFullListing(null);
        fetch(`/api/listings/${slug}`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                if (data.listing) {
                    setFullListing(data.listing);
                    setIsSaved(data.listing.isSaved);
                }
            })
            .catch(() => { });
    }, [slug, isOpen]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const isOwner = user?.uid === display?.seller?.uid;
    const isAdmin = ['admin', 'superadmin'].includes(user?.role || '');

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this listing?')) return;
        try {
            const res = await fetch(`/api/listings/${display.slug}`, { method: 'DELETE' });
            if (res.ok) {
                onClose();
                window.dispatchEvent(new CustomEvent('listing-deleted', { detail: display.slug }));
            }
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            router.push(`/login?returnTo=/listings/${display.slug}`);
            return;
        }

        const previousState = isSaved;
        setIsSaved(!previousState);

        try {
            const res = await fetch(`/api/listings/${display.slug}/save`, { method: "POST" });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setIsSaved(data.saved);
        } catch (err) {
            setIsSaved(previousState);
        }
    };

    if (!slug && !isOpen) return null;

    return (
        <>
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .shimmer {
                    animation: shimmer 1.4s infinite linear;
                    background: linear-gradient(90deg, var(--bg-2) 25%, var(--bg) 50%, var(--bg-2) 75%);
                    background-size: 200% 100%;
                }
            `}</style>
            <div style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                display: "flex",
                justifyContent: isMobile ? "center" : "flex-end",
                alignItems: isMobile ? "flex-end" : "stretch",
                pointerEvents: isOpen ? 'auto' : 'none',
            }}>
                {/* Backdrop */}
                <div
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(4px)",
                        WebkitBackdropFilter: "blur(4px)", // Safari fallback
                        opacity: isOpen ? 1 : 0,
                        transition: "opacity 320ms ease-out",
                        zIndex: -1
                    }}
                />

                {/* Content Body */}
                <div style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: isMobile ? "100%" : 'min(680px, 92vw)', // Kept original width logic for responsiveness
                    height: isMobile ? "90dvh" : "100%", // Kept original height logic
                    background: "var(--surface)",
                    zIndex: 1000,
                    boxShadow: isMobile ? '0 -12px 48px rgba(0,0,0,0.14)' : '-12px 0 48px rgba(0,0,0,0.14)', // Kept original boxShadow logic
                    overflowY: "auto",
                    WebkitOverflowScrolling: "touch", // Smooth iOS scroll
                    transform: isMobile
                        ? (isOpen ? 'translateY(0)' : 'translateY(100%)')
                        : (isOpen ? 'translateX(0)' : 'translateX(100%)'),
                    transition: 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    borderTopLeftRadius: isMobile ? 24 : 0,
                    borderTopRightRadius: isMobile ? 24 : 0,
                }}>
                    {/* Header Area */}
                    <div style={{
                        position: 'sticky', top: 0,
                        background: 'var(--surface)',
                        borderBottom: '1px solid var(--border-2)',
                        display: 'flex', flexDirection: 'column',
                        zIndex: 20,
                    }}>
                        {isMobile && (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
                                <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border-2)' }} />
                            </div>
                        )}
                        <div style={{
                            padding: '14px 20px',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                            <span style={{ fontSize: 13, color: 'var(--ink-4)', fontWeight: 600 }}>
                                {display?.category?.name ?? 'Listing'}
                            </span>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <button
                                    onClick={handleSave}
                                    style={{
                                        background: 'none', border: 'none',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                        color: isSaved ? 'var(--amber)' : 'var(--ink-4)',
                                        fontSize: 14, fontWeight: 600, padding: '4px 8px', borderRadius: 'var(--r)',
                                        transition: 'background 150ms'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>bookmark</span>
                                    {!isMobile && (isSaved ? 'Saved' : 'Save')}
                                </button>
                                <button
                                    onClick={onClose}
                                    style={{
                                        background: 'none', border: 'none',
                                        cursor: 'pointer', fontSize: 20,
                                        color: 'var(--ink-3)',
                                        width: 36, height: 36,
                                        borderRadius: '50%',
                                        display: 'grid', placeItems: 'center',
                                        transition: 'background 150ms',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >✕</button>
                            </div>
                        </div>
                    </div>

                    {/* Content Area — image is now INSIDE the scroll */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: 0 }} className="no-scrollbar">
                        {/* Image scrolls with content */}
                        <div style={{ position: 'relative', width: '100%', aspectRatio: isMobile ? '4/3' : '16/9', background: '#f5f5f5' }}>
                            {display?.images?.[0] ? (
                                <img
                                    src={optimizeImage(display.images[0], 800)}
                                    alt={display.title || ''}
                                    loading="eager"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', background: 'var(--bg-2)' }} className="shimmer" />
                            )}
                        </div>

                        {/* Text content */}
                        <div style={{ padding: isMobile ? '24px 20px' : '32px 40px' }}>
                            {display?.images?.length > 1 && (
                                <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto' }} className="no-scrollbar">
                                    {display.images.map((img: string, i: number) => (
                                        <img
                                            key={i}
                                            src={optimizeImage(img, 120)}
                                            alt=""
                                            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-2)' }}
                                        />
                                    ))}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div style={{
                                    background: 'var(--amber-bg)', color: 'var(--amber)', fontSize: 12,
                                    fontWeight: 700, padding: '4px 8px', borderRadius: 4, textTransform: 'uppercase',
                                    display: 'flex', alignItems: 'center', gap: 6
                                }}>
                                    <span>{display?.category?.icon || '📦'}</span>
                                    <span>{display?.category?.name || 'General'}</span>
                                </div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)' }}>
                                    ₹{display?.price?.toLocaleString()}
                                </div>
                            </div>

                            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: isMobile ? 26 : 32, fontWeight: 700, marginBottom: 20, lineHeight: 1.2 }}>
                                {display?.title}
                            </h1>

                            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                                <div style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--border-2)', fontSize: 13, fontWeight: 600 }}>
                                    {display?.condition}
                                </div>
                                <div style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--border-2)', fontSize: 13, fontWeight: 600 }}>
                                    {display?.location}
                                </div>
                            </div>

                            {/* Seller Profile Summary */}
                            {fullListing ? (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 12, padding: 16,
                                    background: 'var(--bg-2)', borderRadius: 'var(--r-lg)', marginBottom: 28
                                }}>
                                    {fullListing.seller?.photoURL ? (
                                        <img src={fullListing.seller.photoURL} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--ink)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                                            {fullListing.seller?.displayName?.[0] || 'S'}
                                        </div>
                                    )}
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700 }}>{fullListing.seller?.displayName || 'Student'}</div>
                                        <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>Verified Seller</div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ height: 76, borderRadius: 'var(--r-lg)', marginBottom: 28 }} className="shimmer" />
                            )}

                            {fullListing ? (
                                <div style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-2)', marginBottom: 32, whiteSpace: 'pre-wrap' }}>
                                    {fullListing.description}
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                                    <div style={{ height: 16, width: '100%', borderRadius: 4 }} className="shimmer" />
                                    <div style={{ height: 16, width: '90%', borderRadius: 4 }} className="shimmer" />
                                    <div style={{ height: 16, width: '95%', borderRadius: 4 }} className="shimmer" />
                                </div>
                            )}

                            <div style={{ borderTop: '1px solid var(--border-2)', paddingTop: 24, fontSize: 12, color: 'var(--ink-4)', display: 'flex', gap: 24, paddingBottom: isMobile ? 80 : 40 }}>
                                <span>Posted {display?.createdAt ? formatDistanceToNow(new Date(display.createdAt)) : '...'} ago</span>
                            </div>
                        </div>

                        {/* Fixed CTA Footer */}
                        <div style={{
                            padding: isMobile ? '16px 20px' : '20px 40px',
                            borderTop: '1px solid var(--border-2)',
                            background: 'var(--surface)',
                            display: 'flex',
                            gap: 16,
                            paddingBottom: isMobile ? "max(16px, env(safe-area-inset-bottom))" : 20,
                            boxShadow: isMobile ? "0 -4px 20px rgba(0,0,0,0.05)" : "none"
                        }}>
                            {fullListing ? (
                                <ContactButton listing={fullListing} />
                            ) : (
                                <div style={{ height: 44, flex: 1, borderRadius: 'var(--r)', background: 'var(--bg-2)' }} className="shimmer" />
                            )}

                            {(isOwner || isAdmin) && (
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {isOwner && (
                                        <button
                                            onClick={() => setIsEditModalOpen(true)}
                                            style={{ padding: '10px 16px', borderRadius: 'var(--r)', border: '1.5px solid var(--border-2)', background: 'transparent', fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            ✏️ Edit
                                        </button>
                                    )}
                                    <button
                                        onClick={handleDelete}
                                        style={{ padding: '10px 16px', borderRadius: 'var(--r)', border: 'none', background: 'var(--red-bg)', color: 'var(--red)', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        🗑 Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isEditModalOpen && display && (
                <SellModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    mode="edit"
                    initialData={{
                        ...display,
                        ...fullListing,
                        category: display.category?._id || display.category
                    }}
                    onSuccess={(updated) => {
                        window.location.reload();
                    }}
                />
            )}
        </>
    );
}
