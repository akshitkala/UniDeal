"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/auth/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Optional: Add university email validation here
        // if (!email.endsWith(".lpu.in")) { ... }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            const idToken = await userCredential.user.getIdToken();

            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Registration failed on server");
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
                <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Create Account</h1>
                <p style={{ fontSize: 14, color: "var(--ink-4)" }}>Join the campus marketplace</p>
            </div>

            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--ink-3)" }}>FULL NAME</label>
                    <input
                        required
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ width: "100%", padding: "12px", borderRadius: "var(--r)", border: "1.5px solid var(--border-2)", outline: "none", fontSize: 14 }}
                    />
                </div>

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
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--ink-3)" }}>PASSWORD</label>
                    <input
                        required
                        type="password"
                        placeholder="Min. 8 characters"
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
                    {loading ? "Creating Account..." : "Register"}
                </button>
            </form>

            <p style={{ textAlign: "center", marginTop: 32, fontSize: 14, color: "var(--ink-3)" }}>
                Already have an account? <Link href="/login" style={{ color: "var(--amber)", textDecoration: "none", fontWeight: 700 }}>Log in</Link>
            </p>
        </div>
    );
}
