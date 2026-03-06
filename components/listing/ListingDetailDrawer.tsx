'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ContactButton } from './ContactButton';

interface ListingDetailDrawerProps {
    listing: any;
}

export default function ListingDetailDrawer({ listing }: ListingDetailDrawerProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Small delay to trigger entry animation
        setIsOpen(true);

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(() => {
            router.back();
        }, 300);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={handleClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(10, 9, 4, 0.4)',
                    zIndex: 399,
                    opacity: isOpen ? 1 : 0,
                    transition: 'opacity 320ms ease-out'
                }}
            />

            {/* Drawer */}
            <div style={{
                position: 'fixed',
                right: 0,
                top: 60,
                bottom: 0,
                width: 'min(680px, 90vw)',
                zIndex: 400,
                background: 'var(--surface)',
                boxShadow: '-12px 0 48px rgba(0,0,0,0.14)',
                transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Header/Image */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#f5f5f5' }}>
                    <Image
                        src={listing.images?.[0] || '/placeholder-listing.jpg'}
                        alt={listing.title}
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                    <button
                        onClick={handleClose}
                        style={{
                            position: 'absolute', top: 20, right: 20, width: 36, height: 36,
                            borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none',
                            cursor: 'pointer', display: 'grid', placeItems: 'center', fontWeight: 700,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div style={{
                            background: 'var(--amber-bg)', color: 'var(--amber)', fontSize: 12,
                            fontWeight: 700, padding: '4px 8px', borderRadius: 4, textTransform: 'uppercase'
                        }}>
                            {listing.category?.name || 'Uncategorized'}
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)' }}>
                            ₹{listing.price.toLocaleString()}
                        </div>
                    </div>

                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 700, marginBottom: 24, lineHeight: 1.2 }}>
                        {listing.title}
                    </h1>

                    <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
                        <div style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, fontWeight: 600 }}>
                            {listing.condition}
                        </div>
                        <div style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--border)', fontSize: 13, fontWeight: 600 }}>
                            {listing.location}
                        </div>
                    </div>

                    {/* Seller Row */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: 16,
                        background: 'var(--bg)', borderRadius: 'var(--r-lg)', marginBottom: 32
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

                    <div style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-2)', marginBottom: 40, whiteSpace: 'pre-wrap' }}>
                        {listing.description}
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, fontSize: 13, color: 'var(--ink-4)', display: 'flex', gap: 24 }}>
                        <span>Posted {formatDistanceToNow(new Date(listing.createdAt))} ago</span>
                        <span>•</span>
                        <span>{listing.views} views</span>
                    </div>
                </div>

                {/* Sticky Footer */}
                <div style={{
                    padding: '20px 40px', borderTop: '1px solid var(--border)',
                    background: 'var(--surface)', display: 'flex', gap: 16
                }}>
                    <ContactButton listing={listing} />
                </div>
            </div>

            <style jsx global>{`
        body { overflow: hidden; }
      `}</style>
        </>
    );
}
