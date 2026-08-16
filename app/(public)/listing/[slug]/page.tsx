import { notFound } from "next/navigation";
import Link from "next/link";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { ContactSellerButton } from "@/components/listing/ContactSellerButton";

type ListingPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ListingPageProps) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("title")
    .eq("slug", slug)
    .single();

  if (!listing) return { title: "Listing Not Found" };

  return {
    title: `${listing.title} | UniDeal`,
    description: `View details for ${listing.title} on UniDeal.`,
  };
}

export default async function ListingDetailPage({ params }: ListingPageProps) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  // 1. Fetch listing details
  const { data: listing, error } = await supabase
    .from("listings")
    .select(`
      *,
      seller:public_profiles!listings_seller_id_fkey (
        id,
        full_name,
        branch,
        year
      ),
      category:categories!listings_category_id_fkey (
        name
      )
    `)
    .eq("slug", slug)
    .single();

  if (error || !listing) {
    notFound();
  }

  // 2. Increment views (fail-open background task)
  supabase.rpc("increment_listing_views", { listing_id: listing.id })
    .then(({ error: rpcError }) => {
      if (rpcError) {
        console.error("Failed to increment views:", rpcError);
      }
    });

  // 3. Determine initial state for ContactSellerButton
  let initialState: "guest" | "unverified" | "ready" | "rate-limited" | "no-contact-available" = "guest";
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    if (!user.email_confirmed_at) {
      initialState = "unverified";
    } else {
      // Check if user is banned
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("is_banned")
        .eq("id", user.id)
        .single();
        
      if (userProfile?.is_banned) {
        initialState = "guest"; // Banned users cannot contact sellers, fallback safely
      } else {
        // Check rate limit: count contact_reveals in last 24h
        // eslint-disable-next-line react-hooks/purity
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count } = await supabase
          .from("contact_reveals")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gt("created_at", oneDayAgo);
          
        if (count !== null && count >= 50) {
          initialState = "rate-limited";
        } else {
          // Check if seller has a WhatsApp number (uses admin client server-side to bypass column privileges)
          const adminSupabase = createSupabaseAdminClient();
          const { data: sellerProfile } = await adminSupabase
            .from("profiles")
            .select("whatsapp_number")
            .eq("id", listing.seller_id)
            .single();
            
          if (!sellerProfile?.whatsapp_number) {
            initialState = "no-contact-available";
          } else {
            initialState = "ready";
          }
        }
      }
    }
  }

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(listing.price));

  const mainImage = listing.images[0] || "/placeholder-listing.png";

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 font-body text-body text-text-muted hover:text-primary transition-colors"
        >
          ← Back to browse
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left Column - Image gallery */}
        <section className="space-y-4">
          <div className="aspect-square w-full rounded-lg overflow-hidden border border-border bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainImage}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Thumbnails if multiple images exist */}
          {listing.images.length > 1 ? (
            <div className="grid grid-cols-4 gap-4">
              {listing.images.map((url: string, index: number) => (
                <div
                  key={index}
                  className="aspect-square rounded-md overflow-hidden border border-border bg-surface cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${listing.title} thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </section>

        {/* Right Column - Product details and actions */}
        <section className="flex flex-col space-y-6">
          {/* Price, Condition, Category Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-display text-display text-accent">
                {formattedPrice}
              </span>
              {listing.negotiable ? (
                <Badge variant="accent">
                  Negotiable
                </Badge>
              ) : null}
            </div>

            <h1 className="font-display text-heading sm:text-[32px] text-text font-bold leading-tight">
              {listing.title}
            </h1>

            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="default">
                {listing.category?.name || "Other"}
              </Badge>
              <Badge variant="primary">
                Condition: {listing.condition}
              </Badge>
            </div>
          </div>

          {/* Seller Trust & Action Block */}
          <div className="rounded-lg border border-border bg-surface p-5 space-y-4 shadow-sm">
            <div className="space-y-1">
              <span className="font-body text-caption uppercase tracking-[0.08em] text-text-muted">
                Student Seller
              </span>
              <h3 className="font-display text-heading text-text font-semibold">
                {listing.seller?.full_name || "Anonymous Student"}
              </h3>
              {listing.seller?.branch || listing.seller?.year ? (
                <p className="font-body text-body text-text-muted">
                  {listing.seller.branch}
                  {listing.seller.branch && listing.seller.year ? " • " : ""}
                  {listing.seller.year ? `${listing.seller.year} Year` : ""}
                </p>
              ) : null}
            </div>

            <hr className="border-border" />

            {/* Contact CTA Block */}
            <ContactSellerButton
              listingId={listing.id}
              initialState={initialState}
              listingSlug={listing.slug}
            />
          </div>

          {/* Description */}
          <div className="space-y-2 pt-4 border-t">
            <h3 className="font-display text-heading text-text font-semibold">
              Description
            </h3>
            <p className="font-body text-body text-text-muted whitespace-pre-wrap leading-relaxed">
              {listing.description}
            </p>
          </div>

          {/* Metadata: Views & Date */}
          <div className="flex items-center gap-4 text-caption font-body text-text-muted pt-4 border-t">
            <span>Views: {listing.views}</span>
            <span>•</span>
            <span>
              Posted: {new Date(listing.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
