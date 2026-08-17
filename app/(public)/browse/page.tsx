import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingGrid } from "@/components/listing/ListingGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { BrowseFilters } from "@/components/filters/BrowseFilters";

export const metadata = {
  title: "Browse Listings | UniDeal",
  description: "Find items listed by students on your campus.",
};

type BrowsePageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    condition?: string;
    sort?: string;
  }>;
};

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const { search, category, condition, sort } = await searchParams;
  const supabase = await createSupabaseServerClient();

  // 1. Fetch categories for the filter component dropdown
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("id", { ascending: true });

  // 2. Build the listing search query.
  // Uses the public_listings view which pre-joins with public_profiles (not the
  // base profiles table), so anon never needs direct SELECT on profiles.
  // The view already filters to status='approved' AND seller is not banned.
  let query = supabase
    .from("public_listings")
    .select(`
      id, slug, seller_id, title, description, price, negotiable,
      category_id, condition, images, status, views, created_at, updated_at,
      seller_full_name, seller_branch, seller_year
    `);

  // Apply filters if present
  if (category) {
    const matchedCategory = categories?.find((c) => c.slug === category);
    if (matchedCategory) {
      query = query.eq("category_id", matchedCategory.id);
    } else {
      // Query a non-existent ID so it returns an empty grid for invalid slugs
      query = query.eq("category_id", -1);
    }
  }
  if (condition) {
    query = query.eq("condition", condition);
  }
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Apply sorting options
  if (sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    // Default to Newest
    query = query.order("created_at", { ascending: false });
  }

  const { data: rawListings, error } = await query;

  if (error) {
    console.error("Error loading listings in BrowsePage:", error);
  }

  // Reshape flat view columns into the seller object ListingGrid expects
  const listings = rawListings?.map((l) => ({
    ...l,
    seller: {
      id: l.seller_id,
      full_name: l.seller_full_name,
      branch: l.seller_branch,
      year: l.seller_year,
    },
  })) ?? null;

  const emptyState = (
    <EmptyState
      title="No listings yet"
      description="No items match your criteria. Try adjusting your search keywords or filters!"
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

      <div className="space-y-6">
        <BrowseFilters categories={categories || []} />
        
        <div className="pt-2">
          <ListingGrid listings={listings || []} emptyState={emptyState} />
        </div>
      </div>
    </main>
  );
}
