import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type AccountLayoutProps = {
  children: ReactNode;
};

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
