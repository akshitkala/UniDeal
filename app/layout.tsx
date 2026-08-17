import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UniDeal",
  description: "Campus marketplace for trusted student-to-student listings.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
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
      <body className="min-h-full flex flex-col">
        <Header user={user} isAdmin={isAdmin} fullName={fullName} />
        {children}
      </body>
    </html>
  );
}

