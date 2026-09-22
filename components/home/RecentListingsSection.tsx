'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { firstName } from '@/lib/display-name';
import type { ListingCardData } from '@/components/listing/ListingCard';

interface Props {
  listings: ListingCardData[];
}

const conditionColors: Record<string, string> = {
  New: 'bg-primary/10 text-primary border-primary/20',
  'Like New': 'bg-primary/10 text-primary border-primary/20',
  Good: 'bg-surface text-neutral-text border-border',
  Used: 'bg-surface text-neutral-muted border-border',
  Damaged: 'bg-danger/10 text-danger border-danger/20',
};

function AnimatedCard({ listing, index }: { listing: ListingCardData; index: number }) {
  const reduced = useReducedMotion();
  const sellerName = listing.public_profiles?.full_name
    ? firstName(listing.public_profiles.full_name)
    : 'Student';

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: reduced ? 0 : index * 0.08, ease: 'easeOut' }}
      whileHover={reduced ? {} : { y: -2 }}
    >
      <Link
        href={`/listing/${listing.slug}`}
        className="group flex flex-col bg-white rounded-lg border border-border overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {/* Image */}
        <div className="relative aspect-square w-full bg-surface overflow-hidden">
          {listing.images?.[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-muted text-xs">
              No image
            </div>
          )}
          <span
            className={`absolute top-2 left-2 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
              conditionColors[listing.condition] ?? 'bg-surface text-neutral-muted border-border'
            }`}
          >
            {listing.condition}
          </span>
          {listing.negotiable && (
            <span className="absolute top-2 right-2 text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/90 text-white">
              Negotiable
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-3.5 flex flex-col gap-2 flex-1">
          <div>
            <div className="text-lg font-bold text-neutral-text font-heading leading-tight">
              ₹{listing.price.toLocaleString('en-IN')}
            </div>
            <h3 className="text-sm font-medium text-neutral-text line-clamp-2 mt-1 leading-snug group-hover:text-primary transition-colors duration-150">
              {listing.title}
            </h3>
          </div>
          <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-neutral-muted">
            <span className="truncate max-w-[50%]">
              {listing.categories?.name ?? 'General'}
            </span>
            <span className="font-medium text-neutral-text truncate">{sellerName}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function RecentListingsSection({ listings }: Props) {
  const reduced = useReducedMotion();

  if (!listings.length) return null;

  return (
    <section className="bg-surface border-b border-border">
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Live on campus</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-text font-heading">
              Recent listings
            </h2>
          </div>
          <Link
            href="/browse"
            className="text-sm text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded shrink-0 ml-4"
          >
            See all →
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((listing, i) => (
            <AnimatedCard key={listing.id} listing={listing} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
