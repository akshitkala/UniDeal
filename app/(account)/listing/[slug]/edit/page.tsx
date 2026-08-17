import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingForm } from "@/components/listing/ListingForm";

type EditListingPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const metadata = {
  title: "Edit Listing | UniDeal",
  description: "Edit your listing details on UniDeal.",
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  // 1. Session check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Fetch the listing
  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !listing) {
    notFound();
  }

  // 3. Ownership check
  if (listing.seller_id !== user.id) {
    redirect("/dashboard");
  }

  // 4. Fetch categories for the form
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("id", { ascending: true });

  const initialData = {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    price: Number(listing.price),
    negotiable: listing.negotiable,
    category_id: listing.category_id,
    condition: listing.condition,
    images: listing.images,
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8">
      <div className="space-y-1 text-center sm:text-left">
        <h1 className="font-display text-heading sm:text-display text-text">
          Edit Listing
        </h1>
        <p className="font-body text-body text-text-muted">
          Update the price, condition, description, or pictures of your item.
        </p>
      </div>

      <ListingForm categories={categories || []} initialData={initialData} />
    </main>
  );
}
