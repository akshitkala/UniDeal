import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TopNav } from "@/components/nav/TopNav";
import { BottomNav } from "@/components/nav/BottomNav";

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UniDeal | Campus Marketplace",
  description: "Campus marketplace for trusted student-to-student listings.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  let fullName = "";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, is_admin")
      .eq("id", user.id)
      .single();
    if (profile) {
      isAdmin = profile.is_admin;
      fullName = profile.full_name;
    }
  }

  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col pb-16 md:pb-0 bg-background text-text">
        <TopNav user={user} isAdmin={isAdmin} fullName={fullName} />
        <div className="flex-1 flex flex-col">{children}</div>
        <BottomNav user={user} isAdmin={isAdmin} />
      </body>
    </html>
  );
}


