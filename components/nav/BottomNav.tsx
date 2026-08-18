"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";

type BottomNavProps = {
  user: User | null;
  isAdmin: boolean;
};

export function BottomNav({ user, isAdmin }: BottomNavProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border shadow-lg"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-16 px-1 max-w-md mx-auto">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center w-full h-full py-1 text-center transition-colors ${
            isActive("/") && pathname === "/" ? "text-primary font-semibold" : "text-text-muted hover:text-text"
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 00-1 1m-6 0h6" />
          </svg>
          <span className="font-body text-[11px]">Home</span>
        </Link>

        {/* Browse */}
        <Link
          href="/browse"
          className={`flex flex-col items-center justify-center w-full h-full py-1 text-center transition-colors ${
            isActive("/browse") ? "text-primary font-semibold" : "text-text-muted hover:text-text"
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="font-body text-[11px]">Browse</span>
        </Link>

        {/* Sell CTA (Prominent) */}
        <Link
          href="/sell"
          className="flex flex-col items-center justify-center w-full h-full py-1 text-center group"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white shadow-sm group-hover:bg-primary-hover transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="font-body text-[10px] font-semibold text-primary mt-0.5">Sell</span>
        </Link>

        {/* Dashboard */}
        <Link
          href={user ? "/dashboard" : "/login?returnTo=/dashboard"}
          className={`flex flex-col items-center justify-center w-full h-full py-1 text-center transition-colors ${
            isActive("/dashboard") ? "text-primary font-semibold" : "text-text-muted hover:text-text"
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="font-body text-[11px]">Dashboard</span>
        </Link>

        {/* Profile / Account or Admin */}
        <Link
          href={user ? (isAdmin ? "/admin" : "/profile") : "/login"}
          className={`flex flex-col items-center justify-center w-full h-full py-1 text-center transition-colors ${
            isActive("/profile") || isActive("/admin") ? "text-primary font-semibold" : "text-text-muted hover:text-text"
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="font-body text-[11px]">{user ? (isAdmin ? "Admin" : "Profile") : "Sign In"}</span>
        </Link>
      </div>
    </nav>
  );
}
