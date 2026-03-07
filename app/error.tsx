'use client';
import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div style={{
            minHeight: '100vh',
            // @ts-ignore
            minHeight: '-webkit-fill-available',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            background: 'var(--bg)',
        }}>
            <span style={{ fontSize: 64, marginBottom: 16 }}>⚠️</span>
            <h1 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 8px', color: 'var(--ink-1)' }}>
                Something went wrong
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-4)', margin: '0 0 32px', maxWidth: 280 }}>
                An unexpected error occurred. Try again or go back home.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
                <button
                    onClick={reset}
                    style={{
                        background: '#1a1a1a', color: '#fff',
                        border: 'none', borderRadius: 12,
                        padding: '12px 24px', fontWeight: 700,
                        fontSize: 14, cursor: 'pointer',
                    }}
                >
                    Try again
                </button>
                <a
                    href="/"
                    style={{
                        background: 'transparent',
                        border: '1.5px solid var(--border)',
                        borderRadius: 12, padding: '12px 24px',
                        fontWeight: 600, fontSize: 14,
                        textDecoration: 'none', color: 'var(--ink-1)',
                    }}
                >
                    Go home
                </a>
            </div>
        </div>
    );
}
