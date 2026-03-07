'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ContactButton } from './ContactButton';
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useAuth } from "@/lib/auth/AuthProvider";
import SellModal from './SellModal';

interface ListingDetailDrawerProps {
    listing: any;
}

export default function ListingDetailDrawer({ listing }: ListingDetailDrawerProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";

    useEffect(() => {
        setIsOpen(true);
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const { user } = useAuth();
    const [isSaved, setIsSaved] = useState(listing.isSaved || false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const isOwner = user?.uid === listing.seller?.uid;
    const isAdmin = ['admin', 'superadmin'].includes(user?.role || '');

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(() => {
            router.back();
        }, 320);
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this listing?')) return;
        try {
            const res = await fetch(`/api/listings/${listing.slug}`, { method: 'DELETE' });
            if (res.ok) {
                handleClose();
                window.dispatchEvent(new CustomEvent('listing-deleted', { detail: listing.slug }));
            }
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            router.push("/login");
            return;
        }

        const previousState = isSaved;
        setIsSaved(!previousState);

        try {
            const res = await fetch(`/api/listings/${listing.slug}/save`, { method: "POST" });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setIsSaved(data.saved);
        } catch (err) {
            setIsSaved(previousState);
        }
    };

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            justifyContent: isMobile ? "center" : "flex-end",
            alignItems: isMobile ? "flex-end" : "stretch",
        }}>
            {/* Backdrop */}
            <div
                onClick={handleClose}
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)",
                    opacity: isOpen ? 1 : 0,
                    transition: "opacity 320ms ease-out",
                    zIndex: -1
                }}
            />

            {/* Content Body */}
            <div style={{
                position: 'relative',
                width: isMobile ? "100%" : 'min(680px, 92vw)',
                height: isMobile ? "90dvh" : "100%",
                background: 'var(--surface)',
                boxShadow: isMobile ? '0 -12px 48px rgba(0,0,0,0.14)' : '-12px 0 48px rgba(0,0,0,0.14)',
                transform: isMobile
                    ? (isOpen ? 'translateY(0)' : 'translateY(100%)')
                    : (isOpen ? 'translateX(0)' : 'translateX(100%)'),
                transition: 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderTopLeftRadius: isMobile ? 24 : 0,
                borderTopRightRadius: isMobile ? 24 : 0,
            }}>
                {/* Floating action buttons — always accessible */}
                <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 10, zIndex: 20 }}>
                    <button
                        onClick={handleSave}
                        style={{
                            width: 36, height: 36,
                            borderRadius: '50%', background: 'rgba(255,255,255,0.93)', border: 'none',
                            cursor: 'pointer', display: 'grid', placeItems: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            transition: 'all 180ms'
                        }}
                        aria-label={isSaved ? 'Remove from saved' : 'Save listing'}
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{
                                fontSize: 20,
                                color: isSaved ? '#d97706' : '#6b7280',
                                fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0",
                                transition: 'all 180ms'
                            }}
                        >bookmark</span>
                    </button>
                    <button
                        onClick={handleClose}
                        style={{
                            width: 36, height: 36,
                            borderRadius: '50%', background: 'rgba(255,255,255,0.93)', border: 'none',
                            cursor: 'pointer', display: 'grid', placeItems: 'center', fontWeight: 700,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: 16,
                        }}
                    >
                        ✕
                    </button>
                </div>

                {isMobile && (
                    <div style={{
                        position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
                        width: 36, height: 4, background: 'rgba(0,0,0,0.15)', borderRadius: 2, zIndex: 21
                    }} />
                )}

                {/* Content Area — image is now INSIDE the scroll */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 0 }} className="no-scrollbar">
                    {/* Image scrolls with content */}
                    <div style={{ position: 'relative', width: '100%', aspectRatio: isMobile ? '4/3' : '16/9', background: '#f5f5f5' }}>
                        <Image
                            src={listing.images?.[0] || '/placeholder-listing.jpg'}
                            alt={listing.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            priority
                        />
                    </div>

                    {/* Text content */}
                    <div style={{ padding: isMobile ? '24px 20px' : '32px 40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div style={{
                                background: 'var(--amber-bg)', color: 'var(--amber)', fontSize: 12,
                                fontWeight: 700, padding: '4px 8px', borderRadius: 4, textTransform: 'uppercase',
                                display: 'flex', alignItems: 'center', gap: 6
                            }}>
                                <span>{listing.category?.icon || '📦'}</span>
                                <span>{listing.category?.name || 'General'}</span>
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)' }}>
                                ₹{listing.price.toLocaleString()}
                            </div>
                        </div>

                        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: isMobile ? 26 : 32, fontWeight: 700, marginBottom: 20, lineHeight: 1.2 }}>
                            {listing.title}
                        </h1>

                        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                            <div style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--border-2)', fontSize: 13, fontWeight: 600 }}>
                                {listing.condition}
                            </div>
                            <div style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--border-2)', fontSize: 13, fontWeight: 600 }}>
                                {listing.location}
                            </div>
                        </div>

                        {/* Seller Profile Summary */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: 16,
                            background: 'var(--bg-2)', borderRadius: 'var(--r-lg)', marginBottom: 28
                        }}>
                            {listing.seller?.photoURL ? (
                                <img src={listing.seller.photoURL} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--ink)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                                    {listing.seller?.displayName?.[0] || 'S'}
                                </div>
                            )}
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700 }}>{listing.seller?.displayName || 'Student'}</div>
                                <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>Verified Seller</div>
                            </div>
                        </div>

                        <div style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-2)', marginBottom: 32, whiteSpace: 'pre-wrap' }}>
                            {listing.description}
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-2)', paddingTop: 24, fontSize: 12, color: 'var(--ink-4)', display: 'flex', gap: 24, paddingBottom: isMobile ? 80 : 40 }}>
                            <span>Posted {formatDistanceToNow(new Date(listing.createdAt))} ago</span>
                            <span>•</span>
                            <span>{listing.views} views</span>
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
                        <ContactButton listing={listing} />

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

            {isEditModalOpen && (
                <SellModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    mode="edit"
                    initialData={{
                        ...listing,
                        category: listing.category?._id || listing.category
                    }}
                    onSuccess={(updated) => {
                        // In a real app we'd trigger a state update in the parent
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}
