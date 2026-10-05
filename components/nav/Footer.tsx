import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1 */}
          <div className="flex flex-col">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-neutral-text font-heading">
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
            <h3 className="font-bold text-sm text-neutral-text tracking-wider uppercase mb-6">Explore</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-sm text-neutral-muted hover:text-primary transition-colors">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-neutral-muted hover:text-primary transition-colors">
                  About Our Story
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-neutral-muted hover:text-primary transition-colors">
                  How it works
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col">
            <h3 className="font-bold text-sm text-neutral-text tracking-wider uppercase mb-6">Account</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-sm text-neutral-muted hover:text-primary transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-sm text-neutral-muted hover:text-primary transition-colors">
                  My Dashboard
                </Link>
              </li>
              <li>
                <Link href="/account/profile" className="text-sm text-neutral-muted hover:text-primary transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="flex flex-col">
            <h3 className="font-bold text-sm text-neutral-text tracking-wider uppercase mb-6">Support</h3>
            <ul className="space-y-4">
              <li>
                <Link href="#" className="text-sm text-neutral-muted hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-neutral-muted hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-neutral-muted hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-muted tracking-wider uppercase">
            Handcrafted for the campus community
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-neutral-muted hover:text-primary transition-colors uppercase tracking-wider">
              Terms
            </Link>
            <Link href="#" className="text-xs text-neutral-muted hover:text-primary transition-colors uppercase tracking-wider">
              Safety
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
