import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import HeroSection from '@/components/home/HeroSection';
import ProblemSection from '@/components/home/ProblemSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import RecentListingsSection from '@/components/home/RecentListingsSection';
import CTASection from '@/components/home/CTASection';
import type { ListingCardData } from '@/components/listing/ListingCard';

export const metadata: Metadata = {
  title: 'UniDeal — Campus Marketplace',
  description:
    'Buy and sell physical items with verified students on your university campus. No buried WhatsApp messages.',
};

export default async function HomePage() {
  // Fetch 8 most recent approved listings for the preview grid (server-side, no API round-trip)
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
      .limit(8);

    if (data) recentListings = data as unknown as ListingCardData[];
  } catch {
    // Non-critical — page renders fine without listings
  }

  return (
    <main className="flex-1 flex flex-col">
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      {recentListings.length > 0 && <RecentListingsSection listings={recentListings} />}
      <CTASection />
    </main>
  );
}
