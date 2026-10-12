'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ShieldCheck,
  EyeOff,
  MessageCircle,
  BookOpen,
  Laptop,
  Armchair,
  Shirt,
  Dumbbell,
  Package,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const CATEGORIES = [
  { name: 'Books & Notes', slug: 'books-notes', icon: BookOpen },
  { name: 'Electronics', slug: 'electronics', icon: Laptop },
  { name: 'Furniture', slug: 'furniture', icon: Armchair },
  { name: 'Clothing', slug: 'clothing', icon: Shirt },
  { name: 'Sports & Fitness', slug: 'sports-fitness', icon: Dumbbell },
  { name: 'Miscellaneous', slug: 'miscellaneous', icon: Package },
];

export default function Hero() {
  const { user, openAuthModal } = useAuth();

  const handleSellClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      openAuthModal({ tab: 'login', returnTo: '/sell' });
    }
  };

  return (
    <section className="bg-white border-b border-border py-10 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col gap-10 lg:gap-14">
        {/* Top Area: 2 Columns on Desktop, Single Column on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column Content (~55%) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* 1. Eyebrow */}
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-accent">
                CAMPUS MARKETPLACE
              </span>
              <span className="h-px w-8 bg-accent" aria-hidden="true" />
            </div>

            {/* 2. Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[56px] font-bold font-heading text-neutral-text leading-tight lg:leading-[1.1] tracking-tight">
              Buy and sell on campus,<br className="hidden lg:inline" />{' '}
              <span className="text-accent">without the group-chat chaos.</span>
            </h1>

            {/* 3. Subcopy */}
            <p className="text-base sm:text-lg text-neutral-muted font-body max-w-md mt-4 sm:mt-5 leading-relaxed">
              Find what you need, trust who you&apos;re buying from, and close the deal on WhatsApp.
            </p>

            {/* 4. CTAs side by side (stack below 400px) */}
            <div className="flex flex-col min-[400px]:flex-row gap-3 mt-6 sm:mt-8 w-full min-[400px]:w-auto">
              <Link
                href="/browse"
                className="py-2.5 px-6 bg-accent text-white rounded-full font-medium text-base hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-colors duration-200 min-h-[44px] inline-flex items-center justify-center gap-2 cursor-pointer shadow-none"
              >
                <span>Browse listings</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/sell"
                onClick={handleSellClick}
                className="py-2.5 px-6 bg-transparent text-neutral-text border border-border rounded-full font-medium text-base hover:bg-surface focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-colors duration-200 min-h-[44px] inline-flex items-center justify-center cursor-pointer"
              >
                Sell an item
              </Link>
            </div>

            {/* 5. Trust Row */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-border w-full">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border border-accent flex items-center justify-center text-accent shrink-0">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="flex flex-col text-xs leading-tight">
                  <span className="font-medium text-neutral-text">Email-verified</span>
                  <span className="text-neutral-muted">contact access</span>
                </div>
              </div>

              <div className="hidden sm:block w-px h-8 bg-border" aria-hidden="true" />

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border border-accent flex items-center justify-center text-accent shrink-0">
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="flex flex-col text-xs leading-tight">
                  <span className="font-medium text-neutral-text">Number never shown</span>
                  <span className="text-neutral-muted">link-only contact</span>
                </div>
              </div>

              <div className="hidden sm:block w-px h-8 bg-border" aria-hidden="true" />

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border border-accent flex items-center justify-center text-accent shrink-0">
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="flex flex-col text-xs leading-tight">
                  <span className="font-medium text-neutral-text">Deals close on</span>
                  <span className="text-neutral-muted">WhatsApp</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Desktop Only, >=1024px, hidden below lg) */}
          <div className="hidden lg:flex lg:col-span-5 items-center justify-center">
            <div className="relative w-full rounded-3xl bg-accent/10 border border-accent/20 p-6 sm:p-8 flex items-center justify-center overflow-hidden">
              {/* Concentric Circle Outlines */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                <div className="w-[115%] aspect-square rounded-full border border-accent/20 absolute" />
                <div className="w-[85%] aspect-square rounded-full border border-accent/20 absolute" />
              </div>

              {/* Hero Image */}
              <div className="relative z-10 w-full overflow-hidden rounded-2xl aspect-[4/5]">
                <Image
                  src="/hero-campus.webp"
                  alt="Used textbooks, a desk lamp, a calculator and headphones arranged on a desk — typical items students sell on UniDeal."
                  width={1200}
                  height={1500}
                  priority
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Category Tiles (Bottom of Hero, full width) */}
        <div className="w-full flex flex-col gap-4 sm:gap-6 pt-2">
          {/* Heading Row */}
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold font-heading text-neutral-text shrink-0">
              Browse by category
            </h3>
            <div className="flex-1 h-px bg-border hidden sm:block" aria-hidden="true" />
            <Link
              href="/browse"
              className="text-sm font-medium text-accent hover:underline shrink-0 min-h-[44px] inline-flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent rounded"
            >
              View all →
            </Link>
          </div>

          {/* 6 Category Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  href={`/browse?category=${cat.slug}`}
                  className="group bg-white border border-border rounded-2xl p-4 flex flex-col justify-between gap-3 min-h-[44px] hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent transition-colors duration-200 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-accent">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="font-medium text-sm text-neutral-text block font-body">
                      {cat.name}
                    </span>
                    <span className="text-xs text-neutral-muted group-hover:text-accent transition-colors mt-0.5 inline-block">
                      Browse →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
