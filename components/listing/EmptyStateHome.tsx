'use client';

import { useSell } from "./SellProvider";
import { useRouter } from "next/navigation";

interface EmptyStateHomeProps {
    type: 'no-listings' | 'no-results';
}

export default function EmptyStateHome({ type }: EmptyStateHomeProps) {
    const { openSellModal } = (useSell() || {}) as any;
    const router = useRouter();

    if (type === 'no-listings') {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '64px 24px',
                textAlign: 'center',
            }}>
                <span style={{ fontSize: 48, marginBottom: 16 }}>🏪</span>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px', color: 'var(--ink-1)' }}>
                    No listings yet
                </h2>
                <p style={{ fontSize: 14, color: 'var(--ink-4)', margin: '0 0 24px', maxWidth: 260 }}>
                    Be the first to list something on UniDeal
                </p>
                <button
                    onClick={openSellModal}
                    style={{
                        background: '#1a1a1a', color: '#fff',
                        border: 'none', borderRadius: 12,
                        padding: '12px 24px', fontWeight: 700,
                        fontSize: 14, cursor: 'pointer',
                    }}
                >
                    + List an Item
                </button>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '64px 24px',
            textAlign: 'center',
        }}>
            <span style={{ fontSize: 48, marginBottom: 16 }}>🔍</span>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>
                No results found
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ink-4)', margin: '0 0 24px', maxWidth: 260 }}>
                Try a different search or clear your filters
            </p>
            <button
                onClick={() => router.push('/')}
                style={{
                    background: 'transparent',
                    border: '1.5px solid var(--border)',
                    borderRadius: 12, padding: '10px 20px',
                    fontWeight: 600, fontSize: 14, cursor: 'pointer',
                    color: 'var(--ink-1)'
                }}
            >
                Clear filters
            </button>
        </div>
    );
}
