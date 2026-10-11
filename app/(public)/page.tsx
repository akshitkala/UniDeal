import type { Metadata } from 'next';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import Hero from '@/components/home/Hero';
import FreshOnCampus from '@/components/home/FreshOnCampus';
import ProblemStory from '@/components/home/ProblemStory';
import HowItWorks from '@/components/home/HowItWorks';
import SafeByDesign from '@/components/home/SafeByDesign';
import FounderCta from '@/components/home/FounderCta';
import ListingGridSkeleton from '@/components/skeletons/ListingGridSkeleton';
import Skeleton from '@/components/ui/Skeleton';
import type { ListingCardData } from '@/components/listing/ListingCard';

export const metadata: Metadata = {
  title: 'UniDeal — Campus Marketplace',
  description:
    'Buy and sell physical items with verified students on your university campus. No buried WhatsApp messages.',
};

function RecentListingsSkeleton() {
  return (
    <section aria-hidden="true" className="bg-surface border-b border-border py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-6 md:mb-10">
          <div>
            <Skeleton className="h-3 w-28 mb-2" />
            <Skeleton className="h-8 w-44 sm:w-56" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
        <ListingGridSkeleton count={16} />
      </div>
    </section>
  );
}

async function RecentListingsFetcher() {
  let recentListings: ListingCardData[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('listings')
      .select(`
        id, slug, title, price, negotiable, condition, images, created_at,
        categories(id, name, slug),
        public_profiles!inner(id, full_name)
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(16);

    if (data) recentListings = data as unknown as ListingCardData[];
  } catch {
    // Non-critical — page renders fine without listings
  }

  if (recentListings.length === 0) return null;

  return <FreshOnCampus listings={recentListings} />;
}

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col">
      <Hero />
      <Suspense fallback={<RecentListingsSkeleton />}>
        <RecentListingsFetcher />
      </Suspense>
      <ProblemStory />
      <HowItWorks />
      <SafeByDesign />
      <FounderCta />
    </main>
  );
}

