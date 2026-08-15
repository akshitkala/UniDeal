import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = {
  title: "Browse Listings | UniDeal",
  description: "Find items listed by students on your campus.",
};

export default async function BrowsePage() {
  const supabase = await createSupabaseServerClient();

  // Fetch approved listings from non-banned sellers
  const { data: listings, error } = await supabase
    .from("listings")
    .select(`
      *,
      seller:public_profiles!listings_seller_id_fkey (
        id,
        full_name,
        branch,
        year
      )
    `)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading listings in BrowsePage:", error);
  }

  const emptyState = (
    <EmptyState
      title="No listings yet"
      description="Be the first to list something for sale on campus!"
      className="mt-8"
    />
  );

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8">
      <div className="space-y-1">
        <h1 className="font-display text-heading sm:text-display text-text">
          Browse Marketplace
        </h1>
        <p className="font-body text-body text-text-muted max-w-2xl">
          Discover books, electronics, furniture, clothing, and other campus essentials.
        </p>
      </div>

      <div className="pt-4">
        <ListingGrid listings={listings || []} emptyState={emptyState} />
      </div>
    </main>
  );
}
