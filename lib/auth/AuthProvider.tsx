"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from "@/lib/auth/firebase";
import { useRouter } from "next/navigation";

interface ExtendedUser extends FirebaseUser {
    role?: string;
}

interface AuthContextType {
    user: ExtendedUser | null;
    loading: boolean;
    logout: () => Promise<void>;
    setUser: (user: ExtendedUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<ExtendedUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Sync with backend session
                    const idToken = await firebaseUser.getIdToken();
                    const syncRes = await fetch("/api/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ firebaseIdToken: idToken }),
                    });

                    if (syncRes.ok) {
                        // Fetch the full profile to get role and other metadata
                        const profileRes = await fetch("/api/users/profile", {
                            credentials: 'include',
                        });
                        if (profileRes.ok) {
                            const data = await profileRes.json();
                            setUser({ ...firebaseUser, ...data.user } as ExtendedUser);
                        } else {
                            setUser(null);
                        }
                    } else {
                        setUser(null);
                    }
                } catch (err) {
                    console.error("Auth sync error:", err);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        await auth.signOut();
        setUser(null);
        window.location.replace("/");
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
