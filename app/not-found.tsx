import Link from 'next/link';

export default function NotFound() {
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
            <span style={{ fontSize: 64, marginBottom: 16 }}>🔍</span>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 8px', color: 'var(--ink-1)' }}>
                Page not found
            </h1>
            <p style={{ fontSize: 15, color: 'var(--ink-4)', margin: '0 0 32px', maxWidth: 280 }}>
                This page doesn't exist or was removed.
            </p>
            <Link
                href="/"
                style={{
                    background: '#1a1a1a', color: '#fff',
                    textDecoration: 'none', borderRadius: 12,
                    padding: '14px 28px', fontWeight: 700, fontSize: 15,
                }}
            >
                Back to UniDeal
            </Link>
        </div>
    );
}
