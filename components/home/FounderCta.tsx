'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function FounderCta() {
  const { user, openAuthModal } = useAuth();

  const handleSellClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      openAuthModal({ tab: 'login', returnTo: '/sell' });
    }
  };

  return (
    <section className="bg-white border-t border-border py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        
        {/* Part 1: Founder Note (narrow single column max-w-xl, left-aligned, no photo/avatar) */}
        <div className="max-w-xl text-left space-y-3 pb-10 md:pb-14">
          <p className="text-base text-neutral-text/90 leading-relaxed">
            I started UniDeal because I kept watching good stuff get buried in campus WhatsApp groups. It&apos;s free to use, built by a student, and still being shaped by the people who use it.
          </p>
          <div className="pt-1">
            <span className="text-xs text-neutral-muted block font-medium">
              Akshit, founder
            </span>
            <Link
              href="/our-story"
              className="text-xs text-primary font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded mt-1.5 min-h-[44px] inline-flex items-center"
            >
              Read the full story →
            </Link>
          </div>
        </div>

        {/* Hairline Divider */}
        <div className="w-full h-px bg-border mb-10 md:mb-14" aria-hidden="true" />

        {/* Part 2: Final CTA (centered) */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text font-heading leading-tight">
            Ready to find something, or clear out your room?
          </h2>
          <p className="text-base text-neutral-muted">
            Free to use. Built by a student, for students.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/browse"
              className="py-2.5 px-6 bg-primary text-white rounded-md font-semibold text-base hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 min-h-[44px] flex items-center justify-center"
            >
              Browse Listings
            </Link>
            <Link
              href="/sell"
              onClick={handleSellClick}
              className="py-2.5 px-6 bg-white text-neutral-text border border-border rounded-md font-semibold text-base hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 min-h-[44px] flex items-center justify-center"
            >
              Sell an Item
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
