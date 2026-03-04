"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/auth/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();

            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Login failed");
            }

            router.push("/");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();

            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Google login failed");
            }

            router.push("/");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            width: "100%", maxWidth: 400, background: "var(--surface)",
            padding: 40, borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-lg)",
            animation: "fadeUp 0.4s var(--ease)"
        }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Welcome Back</h1>
                <p style={{ fontSize: 14, color: "var(--ink-4)" }}>Log in to your UniDeal account</p>
            </div>

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--ink-3)" }}>UNIVERSITY EMAIL</label>
                    <input
                        required
                        type="email"
                        placeholder="your.name@lpu.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: "100%", padding: "12px", borderRadius: "var(--r)", border: "1.5px solid var(--border-2)", outline: "none", fontSize: 14 }}
                    />
                </div>

                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)" }}>PASSWORD</label>
                        <Link href="/forgot-password" style={{ fontSize: 11, color: "var(--amber)", textDecoration: "none", fontWeight: 600 }}>Forgot?</Link>
                    </div>
                    <input
                        required
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: "100%", padding: "12px", borderRadius: "var(--r)", border: "1.5px solid var(--border-2)", outline: "none", fontSize: 14 }}
                    />
                </div>

                {error && <div style={{ color: "var(--red)", fontSize: 12, textAlign: "center" }}>⚠️ {error}</div>}

                <button
                    disabled={loading}
                    type="submit"
                    style={{
                        width: "100%", padding: "14px", borderRadius: "var(--r)", border: "none",
                        background: "var(--ink)", color: "white", fontWeight: 600, fontSize: 15, cursor: "pointer",
                        marginTop: 8
                    }}
                >
                    {loading ? "Logging in..." : "Log In"}
                </button>
            </form>

            <div style={{ position: "relative", margin: "32px 0", textAlign: "center" }}>
                <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "var(--border-2)", zIndex: 0 }} />
                <span style={{ position: "relative", zIndex: 1, background: "var(--surface)", padding: "0 12px", fontSize: 12, color: "var(--ink-4)" }}>OR CONTINUE WITH</span>
            </div>

            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                style={{
                    width: "100%", padding: "12px", borderRadius: "var(--r)", border: "1.5px solid var(--border-2)",
                    background: "var(--surface)", color: "var(--ink)", fontWeight: 600, fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10
                }}
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" width={18} height={18} alt="" />
                Google Account
            </button>

            <p style={{ textAlign: "center", marginTop: 32, fontSize: 14, color: "var(--ink-3)" }}>
                Don't have an account? <Link href="/register" style={{ color: "var(--amber)", textDecoration: "none", fontWeight: 700 }}>Register now</Link>
            </p>
        </div>
    );
}
