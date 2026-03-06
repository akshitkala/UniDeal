'use client';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/auth/firebase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === "mobile";

    async function handleGoogleLogin() {
        setLoading(true);
        setError('');
        try {
            const cred = await signInWithPopup(auth, googleProvider);
            const token = await cred.user.getIdToken();

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firebaseIdToken: token }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Login failed');
            }

            const returnTo = new URLSearchParams(window.location.search).get('returnTo') || '/';
            router.push(returnTo);
        } catch (err: any) {
            if (err.code !== 'auth/popup-closed-by-user') {
                setError('Sign in failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100dvh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isMobile ? 'var(--surface)' : 'var(--bg)'
        }}>
            <div style={{
                width: isMobile ? '100%' : 'min(440px, 92vw)',
                height: isMobile ? '100%' : 'auto',
                background: 'var(--surface)',
                borderRadius: isMobile ? 0 : 'var(--r-xl)',
                boxShadow: isMobile ? 'none' : 'var(--shadow-md)',
                padding: isMobile ? '40px 24px' : '48px 40px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: isMobile ? 'center' : 'block'
            }}>

                <div style={{
                    width: isMobile ? 64 : 48,
                    height: isMobile ? 64 : 48,
                    borderRadius: isMobile ? 16 : 12,
                    background: 'var(--ink)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: isMobile ? 28 : 22,
                    margin: '0 auto 20px'
                }}>🏷</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: isMobile ? 32 : 26, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Welcome to UniDeal</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: isMobile ? 15 : 14, color: 'var(--ink-4)', marginBottom: 40, textTransform: 'uppercase', letterSpacing: '0.05em' }}>LPU Campus Marketplace</div>

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 12, padding: '13px 20px',
                        background: 'var(--surface)', border: '1.5px solid var(--border-2)',
                        borderRadius: 'var(--r)', cursor: loading ? 'not-allowed' : 'pointer',
                        fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 15, color: 'var(--ink)',
                        boxShadow: 'var(--shadow-sm)',
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    {loading ? 'Signing in…' : 'Continue with Google'}
                </button>

                {error && <div style={{ marginTop: 16, fontSize: 13, color: 'var(--red)' }}>{error}</div>}

                <div style={{ marginTop: 32, fontSize: 12, color: 'var(--ink-5)', lineHeight: 1.6 }}>
                    By signing in you agree to our Terms of Service.
                </div>
            </div>
        </div>
    );
}
