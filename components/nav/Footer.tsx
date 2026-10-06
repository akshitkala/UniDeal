'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Footer() {
  const { user, openAuthModal } = useAuth();

  const handleProtectedNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (!user) {
      e.preventDefault();
      openAuthModal({ tab: 'login', returnTo: path });
    }
  };

  return (
    <footer className="border-t border-border bg-white pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1 */}
          <div className="flex flex-col">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-neutral-text font-heading focus:outline-none focus:ring-2 focus:ring-primary rounded p-1 -m-1 w-fit">
              <span className="w-8 h-8 rounded-md bg-primary text-white flex items-center justify-center font-display font-extrabold text-lg">
                U
              </span>
              <span>UniDeal</span>
            </Link>
            <p className="mt-6 text-sm text-neutral-muted">
              Campus marketplace — buy and sell, simply.
            </p>
            <p className="mt-4 text-xs text-neutral-muted italic">
              © 2026 UniDeal. Not affiliated with any university.
            </p>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col">
            <h3 className="font-bold text-sm text-neutral-text tracking-wider uppercase mb-2">Explore</h3>
            <ul className="flex flex-col">
              <li>
                <Link href="/browse" className="text-sm text-neutral-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded flex items-center min-h-[44px]">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link href="/our-story" className="text-sm text-neutral-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded flex items-center min-h-[44px]">
                  About Our Story
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-sm text-neutral-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded flex items-center min-h-[44px]">
                  How it works
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col">
            <h3 className="font-bold text-sm text-neutral-text tracking-wider uppercase mb-2">Account</h3>
            <ul className="flex flex-col">
              {!user && (
                <li>
                  <button
                    type="button"
                    onClick={() => openAuthModal({ tab: 'login' })}
                    className="text-sm text-neutral-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded text-left flex items-center min-h-[44px] w-full"
                  >
                    Sign In
                  </button>
                </li>
              )}
              <li>
                <Link
                  href="/dashboard"
                  onClick={(e) => handleProtectedNavigation(e, '/dashboard')}
                  className="text-sm text-neutral-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded flex items-center min-h-[44px]"
                >
                  My Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  onClick={(e) => handleProtectedNavigation(e, '/profile')}
                  className="text-sm text-neutral-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded flex items-center min-h-[44px]"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="flex flex-col">
            <h3 className="font-bold text-sm text-neutral-text tracking-wider uppercase mb-2">Support</h3>
            <ul className="flex flex-col">
              <li>
                <Link href="/contact" className="text-sm text-neutral-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded flex items-center min-h-[44px]">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-neutral-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded flex items-center min-h-[44px]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-neutral-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded flex items-center min-h-[44px]">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-muted tracking-wider uppercase py-2">
            Handcrafted for the campus community
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-xs text-neutral-muted hover:text-primary transition-colors uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary rounded flex items-center justify-center min-h-[44px] px-2">
              Terms
            </Link>
            <Link href="/safety" className="text-xs text-neutral-muted hover:text-primary transition-colors uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary rounded flex items-center justify-center min-h-[44px] px-2">
              Safety
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
