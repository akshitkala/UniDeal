import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "UniDeal | Campus Marketplace",
  description: "Campus marketplace for trusted student-to-student listings.",
};

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  // Fetch newest approved listings for homepage preview
  const { data: rawListings } = await supabase
    .from("public_listings")
    .select(`
      id, slug, seller_id, title, description, price, negotiable,
      category_id, condition, images, status, views, created_at, updated_at,
      seller_full_name, seller_branch, seller_year
    `)
    .order("created_at", { ascending: false })
    .limit(4);

  const sampleListings = rawListings?.map((l) => ({
    ...l,
    seller: {
      id: l.seller_id,
      full_name: l.seller_full_name,
      branch: l.seller_branch,
      year: l.seller_year,
    },
  })) ?? [];

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-14 space-y-16">
      {/* 1. Hero Section */}
      <section className="text-center md:text-left space-y-6 pt-4 pb-4 max-w-3xl">
        <div className="inline-block px-3 py-1 rounded-full bg-surface border border-border text-caption font-semibold text-primary">
          Campus Noticeboard & Marketplace
        </div>
        <h1 className="font-display text-display text-text font-bold leading-tight">
          Campus buying and selling built on verified student trust.
        </h1>
        <p className="font-body text-body text-text-muted max-w-2xl leading-relaxed">
          Skip buried WhatsApp chats. Browse structured listings, verify seller identity, and deal safely on campus.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link href="/browse" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              Browse Listings
            </Button>
          </Link>
          <Link href="/sell" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Sell an Item
            </Button>
          </Link>
        </div>
      </section>

      {/* 2. Problem / Story Section */}
      <section className="rounded-xl border border-border bg-surface p-6 sm:p-10 space-y-6">
        <div className="space-y-2">
          <span className="font-body text-caption font-semibold uppercase tracking-wider text-text-muted">
            The Campus Marketplace Problem
          </span>
          <h2 className="font-display text-heading text-text font-semibold">
            Why WhatsApp groups break campus trade
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 bg-white p-5 rounded-lg border border-border">
            <h3 className="font-display text-body font-semibold text-danger">
              1. Listings Get Buried
            </h3>
            <p className="font-body text-caption text-text-muted">
              Chat streams swallow items in hours. Important details like price and condition disappear in endless message scrolling.
            </p>
          </div>
          <div className="space-y-2 bg-white p-5 rounded-lg border border-border">
            <h3 className="font-display text-body font-semibold text-accent">
              2. Unknown Seller Identity
            </h3>
            <p className="font-body text-caption text-text-muted">
              Random phone numbers offer zero verification. You can&apos;t confirm if someone is actually a student on your campus.
            </p>
          </div>
          <div className="space-y-2 bg-white p-5 rounded-lg border border-border">
            <h3 className="font-display text-body font-semibold text-primary">
              3. The UniDeal Fix
            </h3>
            <p className="font-body text-caption text-text-muted">
              Searchable catalog, transparent condition ratings, and verified student branch &amp; year metadata on every card.
            </p>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="space-y-8">
        <div className="text-center sm:text-left space-y-2">
          <h2 className="font-display text-heading text-text font-semibold">
            How UniDeal Works
          </h2>
          <p className="font-body text-body text-text-muted">
            Three simple steps to buy or sell anything on campus.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-display font-bold flex items-center justify-center">
              1
            </div>
            <h3 className="font-display text-body font-semibold text-text">
              Post an item
            </h3>
            <p className="font-body text-caption text-text-muted">
              List books, electronics, or dorm gear in under 2 minutes with photos, condition, and price.
            </p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-display font-bold flex items-center justify-center">
              2
            </div>
            <h3 className="font-display text-body font-semibold text-text">
              Check seller credibility
            </h3>
            <p className="font-body text-caption text-text-muted">
              Buyers search structured categories and inspect seller branch, year, and item details.
            </p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-display font-bold flex items-center justify-center">
              3
            </div>
            <h3 className="font-display text-body font-semibold text-text">
              Connect on WhatsApp
            </h3>
            <p className="font-body text-caption text-text-muted">
              Verified students reveal direct WhatsApp links for seamless, private campus handoffs.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Sample Listings Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-heading text-text font-semibold">
              Recent Campus Listings
            </h2>
            <p className="font-body text-caption text-text-muted">
              Fresh items listed by students on campus
            </p>
          </div>
          <Link href="/browse" className="font-body text-caption font-semibold text-primary hover:underline">
            View all →
          </Link>
        </div>
        <ListingGrid
          listings={sampleListings}
          emptyState={
            <div className="text-center py-10 bg-surface rounded-lg border border-border space-y-3">
              <p className="font-body text-body font-medium text-text">No active listings yet</p>
              <p className="font-body text-caption text-text-muted">Be the first student to post an item!</p>
              <Link href="/sell">
                <Button variant="secondary" size="sm">Post a Listing</Button>
              </Link>
            </div>
          }
        />
      </section>

      {/* 5. Sell CTA Strip */}
      <section className="rounded-xl bg-primary text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="font-display text-heading font-bold text-white">
            Have textbooks, tech, or dorm gear to sell?
          </h2>
          <p className="font-body text-body text-white/90">
            Reach verified students across campus without getting swallowed in chat groups.
          </p>
        </div>
        <Link href="/sell" className="w-full md:w-auto flex-shrink-0">
          <Button variant="secondary" size="lg" className="w-full md:w-auto bg-white text-primary hover:bg-surface border-none font-semibold">
            Post a Listing
          </Button>
        </Link>
      </section>
    </main>
  );
}
