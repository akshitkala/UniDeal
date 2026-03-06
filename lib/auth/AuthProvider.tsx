"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/auth/firebase";
import { useRouter } from "next/navigation";

interface ExtendedUser extends FirebaseUser {
    role?: string;
}

interface AuthContextType {
    user: ExtendedUser | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<ExtendedUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const idToken = await firebaseUser.getIdToken();
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ firebaseIdToken: idToken }),
                });
                // Read role from login response so client components can use it
                if (res.ok) {
                    const data = await res.json();
                    (firebaseUser as ExtendedUser).role = data.user?.role ?? data.role;
                }
                setUser(firebaseUser as ExtendedUser);
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
        // Use window.location only after full signout so Next.js router state is clean
        window.location.replace("/");
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
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
