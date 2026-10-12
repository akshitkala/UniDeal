'use client';

import React from 'react';
import Link from 'next/link';
import ListingCard from '@/components/listing/ListingCard';
import type { ListingCardData } from '@/components/listing/ListingCard';
import { LISTING_GRID_CLASSES } from '@/components/skeletons/ListingGridSkeleton';

interface Props {
  listings: ListingCardData[];
}

const CATEGORIES = [
  { name: 'Books & Notes', slug: 'books-notes' },
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Furniture', slug: 'furniture' },
  { name: 'Clothing', slug: 'clothing' },
  { name: 'Sports & Fitness', slug: 'sports-fitness' },
  { name: 'Miscellaneous', slug: 'miscellaneous' },
];

export default function FreshOnCampus({ listings }: Props) {
  return (
    <section className="bg-surface border-b border-border py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        
        {/* Heading row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 md:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text font-heading leading-tight">
              Fresh on campus
            </h2>
            <p className="text-sm text-neutral-muted mt-1">
              Just listed by students on campus.
            </p>
          </div>
          <Link
            href="/browse"
            className="text-sm text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded shrink-0 self-start sm:self-end min-h-[44px] flex items-center"
          >
            See all →
          </Link>
        </div>

        {/* Category chips row: wraps on mobile, no horizontal scrolling */}
        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/browse?category=${cat.slug}`}
              className="px-3.5 py-1.5 rounded-full border border-border bg-white text-xs font-medium text-neutral-text hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors duration-200 min-h-[36px] flex items-center"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Listings grid or empty state */}
        {listings.length === 0 ? (
          <div className="border border-border rounded-lg p-8 sm:p-12 text-center bg-white flex flex-col items-center justify-center gap-4">
            <p className="text-neutral-muted text-base">
              No listings yet. Be the first to list something.
            </p>
            <Link
              href="/sell"
              className="py-2.5 px-6 bg-primary text-white rounded-md font-semibold text-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 min-h-[44px] inline-flex items-center justify-center"
            >
              Sell an Item
            </Link>
          </div>
        ) : (
          <div className={LISTING_GRID_CLASSES}>
            {listings.slice(0, 12).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
