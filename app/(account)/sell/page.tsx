import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingForm } from "@/components/listing/ListingForm";

export const metadata = {
  title: "Sell an Item | UniDeal",
  description: "Post a physical item for sale on the campus marketplace.",
};

export default async function SellPage() {
  const supabase = await createSupabaseServerClient();

  // Fetch categories from the database for the dropdown
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("id", { ascending: true });

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-6">
      <div className="space-y-1 text-center max-w-2xl mx-auto">
        <h1 className="font-display text-heading sm:text-display text-text">
          Sell an Item
        </h1>
        <p className="font-body text-body text-text-muted">
          Your listing will be visible to all verified students on campus. Fill in the details to post.
        </p>
      </div>

      <div className="pt-4">
        <ListingForm categories={categories || []} />
      </div>
    </main>
  );
}
