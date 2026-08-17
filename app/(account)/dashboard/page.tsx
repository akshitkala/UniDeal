import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/listing/DashboardClient";

export const metadata = {
  title: "Seller Dashboard | UniDeal",
  description: "Manage your listings on UniDeal.",
};

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  
  // 1. Session check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Fetch all listings created by this user
  const { data: listings, error } = await supabase
    .from("listings")
    .select(`
      *,
      category:categories(name, slug)
    `)
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading user listings on dashboard:", error);
  }

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8">
      <div className="space-y-1">
        <h1 className="font-display text-heading sm:text-display text-text">
          Seller Dashboard
        </h1>
        <p className="font-body text-body text-text-muted">
          Manage your listings, mark them sold, or edit details.
        </p>
      </div>

      <DashboardClient initialListings={listings || []} />
    </main>
  );
}
