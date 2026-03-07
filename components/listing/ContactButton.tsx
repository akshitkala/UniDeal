'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import Link from 'next/link';

type ButtonState = 'locked' | 'ready' | 'loading' | 'opening' | 'no_number' | 'rate_limited';

interface ContactButtonProps {
    listing: any;
}

export function ContactButton({ listing }: ContactButtonProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [state, setState] = useState<ButtonState>(listing?.seller ? 'ready' : 'locked');
    const [subText, setSubText] = useState('');

    if (!user) {
        return (
            <Link
                href={`/login?returnTo=/listings/${listing.slug}`}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '14px',
                    background: '#1a1a1a',
                    color: '#fff',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 15,
                    textDecoration: 'none',
                    textAlign: 'center',
                }}
            >
                Sign in to Contact
            </Link>
        );
    }

    async function handleClick() {
        if (state === 'locked') {
            router.push('/login?returnTo=/listings/' + listing.slug);
            return;
        }
        if (state !== 'ready') return;

        setState('loading');
        try {
            const res = await fetch(`/api/listings/${listing.slug}/contact`, { method: 'POST' });
            const data = await res.json();

            if (res.status === 429) {
                setState('rate_limited');
                setSubText('You can contact 20 sellers per day. Try again tomorrow.');
                return;
            }
            if (res.status === 400 && data.error === 'no_number') {
                setState('no_number');
                setSubText("The seller hasn't added a WhatsApp number yet.");
                return;
            }
            if (!res.ok) {
                setState('ready');
                return;
            }

            // waLink is NEVER stored in state — used immediately and discarded
            setState('opening');
            window.open(data.waLink, '_blank');
            setTimeout(() => setState('ready'), 800);

        } catch {
            setState('ready');
        }
    }

    const isOwner = false; // Owner check handled by not showing Contact on own listings

    const config: Record<ButtonState, { label: string; bg: string; disabled: boolean }> = {
        locked: { label: 'Sign in to Contact Seller', bg: 'var(--ink-5)', disabled: false },
        ready: { label: '📱 Contact Seller', bg: 'var(--ink)', disabled: false },
        loading: { label: '···', bg: 'var(--ink)', disabled: true },
        opening: { label: 'Opening WhatsApp…', bg: 'var(--ink)', disabled: true },
        no_number: { label: 'Contact Unavailable', bg: 'var(--ink-5)', disabled: true },
        rate_limited: { label: 'Daily limit reached', bg: 'var(--ink-5)', disabled: true },
    };

    const { label, bg, disabled } = config[state];

    return (
        <div style={{ width: '100%' }}>
            <button
                onClick={handleClick}
                disabled={disabled}
                style={{
                    width: '100%', padding: '13px',
                    background: bg, color: '#fff',
                    border: 'none', borderRadius: 'var(--r)',
                    fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                }}
            >
                {label}
            </button>
            {subText && (
                <p style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-4)', textAlign: 'center' }}>
                    {subText}
                </p>
            )}
        </div>
    );
}
