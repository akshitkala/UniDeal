"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import type { User } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type TopNavProps = {
  user: User | null;
  isAdmin: boolean;
  fullName: string;
};

export function TopNav({ user, isAdmin, fullName }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const supabase = createSupabaseBrowserClient();

  const handleSignOut = () => {
    startTransition(async () => {
      try {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
      } catch (error) {
        console.error("Sign out error:", error);
      }
    });
  };

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Main Nav */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-display text-heading font-bold text-primary transition-colors hover:text-primary-hover"
          >
            UniDeal
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/browse"
              className={`font-body text-body font-medium transition-colors ${
                isActive("/browse") ? "text-primary font-semibold" : "text-text-muted hover:text-text"
              }`}
            >
              Browse
            </Link>
            <Link
              href="/sell"
              className={`font-body text-body font-medium transition-colors ${
                isActive("/sell") ? "text-primary font-semibold" : "text-text-muted hover:text-text"
              }`}
            >
              Sell
            </Link>
            {user ? (
              <Link
                href="/dashboard"
                className={`font-body text-body font-medium transition-colors ${
                  isActive("/dashboard") ? "text-primary font-semibold" : "text-text-muted hover:text-text"
                }`}
              >
                Dashboard
              </Link>
            ) : null}
            {isAdmin ? (
              <Link
                href="/admin"
                className={`font-body text-body font-medium transition-colors ${
                  isActive("/admin") ? "text-primary font-semibold" : "text-text-muted hover:text-text"
                }`}
              >
                Admin
              </Link>
            ) : null}
          </nav>
        </div>

        {/* User / Auth Info */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="hidden sm:inline font-body text-caption text-text-muted hover:text-text transition-colors"
              >
                Welcome, <span className="font-semibold text-text">{fullName || "Student"}</span>
              </Link>
              <button
                type="button"
                disabled={isPending}
                onClick={handleSignOut}
                className="font-body text-caption font-semibold px-3 py-1.5 border rounded-md border-border text-text hover:bg-surface hover:text-primary transition-all duration-200"
              >
                {isPending ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="font-body text-caption font-semibold text-text-muted hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="font-body text-caption font-semibold px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-hover transition-all duration-200 shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
