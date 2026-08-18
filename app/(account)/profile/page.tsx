import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProfileForm } from "./ProfileForm";

export const metadata = {
  title: "My Profile | UniDeal",
  description: "Manage your campus identity and contact info.",
};

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, branch, year, whatsapp_number, is_admin")
    .eq("id", user.id)
    .single();

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8">
      <div className="space-y-1">
        <h1 className="font-display text-heading sm:text-display text-text font-bold">
          Account &amp; Campus Profile
        </h1>
        <p className="font-body text-body text-text-muted">
          Your name, branch, and year are shown on your listings so buyers know you are a verified student.
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        <ProfileForm
          email={user.email || ""}
          initialProfile={{
            full_name: profile?.full_name || "",
            branch: profile?.branch || "",
            year: profile?.year || "",
            whatsapp_number: profile?.whatsapp_number || "",
          }}
        />
      </div>
    </main>
  );
}
