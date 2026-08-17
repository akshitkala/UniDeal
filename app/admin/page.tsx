import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminDashboardClient } from "@/components/listing/AdminDashboardClient";

export const metadata = {
  title: "Admin Moderation Dashboard | UniDeal",
  description: "Moderation queue, user management, and global configuration settings.",
};

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();

  // 1. Session check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 2. Admin role check
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_admin) {
    redirect("/"); // Immediate redirect if not admin
  }

  // 3. Fetch current settings
  const { data: settings } = await supabase
    .from("admin_settings")
    .select("approval_mode")
    .eq("id", 1)
    .single();

  // 4. Fetch pending listings
  const { data: pendingListings } = await supabase
    .from("listings")
    .select(`
      *,
      category:categories(name, slug),
      seller:public_profiles!listings_seller_id_fkey(id, full_name, branch, year)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // 5. Fetch pending reports
  const { data: pendingReports } = await supabase
    .from("reports")
    .select(`
      *,
      listing:listings(id, title, slug),
      reporter:public_profiles!reports_reporter_id_fkey(id, full_name, branch, year)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // 6. Fetch profiles for user management
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8">
      <div className="space-y-1">
        <h1 className="font-display text-heading sm:text-display text-text">
          Admin Moderation
        </h1>
        <p className="font-body text-body text-text-muted">
          Manage listings, resolve flags, moderate users, and configure settings.
        </p>
      </div>

      <AdminDashboardClient
        initialSettings={settings || { approval_mode: "auto" }}
        initialPendingListings={pendingListings || []}
        initialPendingReports={pendingReports || []}
        initialProfiles={profiles || []}
        currentUserId={user.id}
      />
    </main>
  );
}
