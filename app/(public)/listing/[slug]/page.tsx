import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { firstName } from '@/lib/display-name';
import { ArrowLeft, ShieldCheck, Eye } from 'lucide-react';
import type { ListingCondition } from '@/types/domain';
import ListingDetailClient from './ListingDetailClient';
import ContactSellerButton from '@/components/listing/ContactSellerButton';

interface ListingDetailPageProps {
  params: {
    slug: string;
  };
}

interface ListingDetailRow {
  id: string;
  slug: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  negotiable: boolean;
  condition: ListingCondition;
  images: string[];
  status: string;
  views: number;
  created_at: string;
  categories: { id: number; name: string; slug: string } | null;
  public_profiles: { id: string; full_name: string; is_banned: boolean } | null;
}

const conditionBadges: Record<ListingCondition, string> = {
  New: 'bg-primary/10 text-primary border-primary/20',
  'Like New': 'bg-primary/10 text-primary border-primary/20',
  Good: 'bg-surface text-neutral-text border-border',
  Used: 'bg-surface text-neutral-muted border-border',
  Damaged: 'bg-danger/10 text-danger border-danger/20',
};

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { slug } = params;
  const supabase = await createServerClient();

  // 1. Direct Supabase query joining public_profiles (TRD §5.4)
  // Cast via unknown: Supabase's type-inference breaks for view-joined queries (view ≠ table in Database['Views'])
  const { data: rawListing, error } = await supabase
    .from('listings')
    .select(`
      id,
      slug,
      seller_id,
      title,
      description,
      price,
      negotiable,
      condition,
      images,
      status,
      views,
      created_at,
      categories!inner(id, name, slug),
      public_profiles!inner(id, full_name, is_banned)
    `)
    .eq('slug', slug)
    .eq('public_profiles.is_banned', false)
    .single();

  const listing = rawListing as unknown as ListingDetailRow | null;

  if (error || !listing) {
    notFound();
  }

  // 2. Increment listing views in background (fire-and-forget, rules.md §7.4)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase.rpc('increment_listing_views', { listing_id: listing.id } as any).then();

  // 3. Extract seller first name strictly via firstName() (TRD §2.1a)
  const sellerFirstName = firstName(listing.public_profiles?.full_name || 'Student');

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back to Browse */}
      <div className="mb-6">
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery (md:col-span-7) */}
        <div className="md:col-span-7 space-y-3">
          <ListingDetailClient
            images={listing.images}
            title={listing.title}
          />
        </div>

        {/* Right Column: Listing Details & Actions (md:col-span-5) */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-border space-y-4">
            {/* Category & Date */}
            <div className="flex items-center justify-between text-xs text-neutral-muted">
              <span className="font-semibold text-primary uppercase tracking-wider">
                {listing.categories?.name}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{listing.views + 1} views</span>
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-text font-heading leading-snug">
              {listing.title}
            </h1>

            {/* Price & Badges */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl font-extrabold text-neutral-text font-heading">
                ₹{listing.price.toLocaleString('en-IN')}
              </span>
              {listing.negotiable && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                  Negotiable
                </span>
              )}
            </div>

            {/* Condition Badge */}
            <div className="flex items-center gap-2 pt-1 border-t border-border">
              <span className="text-xs text-neutral-muted">Condition:</span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  conditionBadges[listing.condition as ListingCondition] || 'bg-surface text-neutral-muted border-border'
                }`}
              >
                {listing.condition}
              </span>
            </div>

            {/* Seller Trust Box */}
            <div className="p-3.5 rounded-md bg-surface border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                {sellerFirstName[0]?.toUpperCase() || 'S'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-neutral-text truncate">
                  Listed by {sellerFirstName}
                </div>
                <div className="text-xs text-neutral-muted flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Verified Student Seller</span>
                </div>
              </div>
            </div>

            {/* Contact Seller — TRD §5.5 */}
            <div className="pt-2">
              <ContactSellerButton
                listingId={listing.id}
                listingTitle={listing.title}
                sellerId={listing.seller_id}
              />
              <p className="text-[11px] text-neutral-muted text-center mt-2">
                Opens directly in WhatsApp with a pre-filled message. Your deal closes on campus.
              </p>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-white p-6 rounded-lg border border-border space-y-2">
            <h2 className="text-sm font-bold text-neutral-text uppercase tracking-wider font-heading">
              About This Item
            </h2>
            <div className="text-sm text-neutral-text leading-relaxed whitespace-pre-line">
              {listing.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
