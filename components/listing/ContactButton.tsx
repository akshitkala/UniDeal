'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import ContactOverlay from './ContactOverlay';

interface ContactButtonProps {
    listing: any;
}

export function ContactButton({ listing }: ContactButtonProps) {
    const [showContact, setShowContact] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    const isOwner = user?.uid === listing.seller?.uid;

    const handleClick = () => {
        if (!user) {
            router.push(`/login?returnTo=/listings/${listing.slug}`);
            return;
        }
        setShowContact(true);
    };

    return (
        <>
            <button
                onClick={handleClick}
                disabled={isOwner}
                style={{
                    width: '100%',
                    background: isOwner ? 'var(--border)' : 'var(--ink)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--r)',
                    padding: '16px',
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: isOwner ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                }}
            >
                {isOwner ? 'Your Listing' : 'Show Contact Info'}
            </button>

            {showContact && (
                <ContactOverlay
                    slug={listing.slug}
                    onClose={() => setShowContact(false)}
                />
            )}
        </>
    );
}
