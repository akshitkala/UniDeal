'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { firstName } from '@/lib/display-name';
import type { ListingCondition } from '@/types/domain';

export interface ListingCardData {
  id: string;
  slug: string;
  title: string;
  price: number;
  negotiable: boolean;
  condition: ListingCondition;
  images: string[];
  created_at: string;
  categories?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  public_profiles?: {
    id: string;
    full_name: string;
  } | null;
}

interface ListingCardProps {
  listing: ListingCardData;
}

const conditionColors: Record<ListingCondition, string> = {
  New: 'bg-primary/10 text-primary border-primary/20',
  'Like New': 'bg-primary/10 text-primary border-primary/20',
  Good: 'bg-surface text-neutral-text border-border',
  Used: 'bg-surface text-neutral-muted border-border',
  Damaged: 'bg-danger/10 text-danger border-danger/20',
};

export default function ListingCard({ listing }: ListingCardProps) {
  const sellerFirstName = listing.public_profiles?.full_name
    ? firstName(listing.public_profiles.full_name)
    : 'Student';

  const imageUrl = listing.images?.[0] || '/placeholder-listing.png';

  return (
    <Link
      href={`/listing/${listing.slug}`}
      className="group flex flex-col bg-white rounded-lg border border-border overflow-hidden hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {/* Listing Image */}
      <div className="relative aspect-square w-full bg-surface overflow-hidden">
        {listing.images?.[0] ? (
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-muted text-xs">
            No image
          </div>
        )}

        {/* Condition Tag */}
        <div className="absolute top-2 left-2">
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
              conditionColors[listing.condition] || 'bg-surface text-neutral-muted border-border'
            }`}
          >
            {listing.condition}
          </span>
        </div>

        {/* Negotiable Tag */}
        {listing.negotiable && (
          <div className="absolute top-2 right-2">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/90 text-white shadow-xs">
              Negotiable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Price */}
          <div className="text-lg font-bold text-neutral-text font-heading leading-tight">
            ₹{listing.price.toLocaleString('en-IN')}
          </div>

          {/* Title */}
          <h3 className="text-sm font-medium text-neutral-text line-clamp-2 mt-1 leading-snug group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
        </div>

        {/* Category & Seller First Name */}
        <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-neutral-muted">
          <span className="truncate max-w-[50%]">
            {listing.categories?.name || 'General'}
          </span>
          <span className="font-medium text-neutral-text truncate">
            {sellerFirstName}
          </span>
        </div>
      </div>
    </Link>
  );
}
