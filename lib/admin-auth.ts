import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function verifyAdminRequest() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      errorResponse: NextResponse.json(
        { error: { message: "You must be signed in to perform this action." } },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !profile.is_admin) {
    return {
      errorResponse: NextResponse.json(
        { error: { message: "You are not authorized to access this resource." } },
        { status: 403 }
      ),
    };
  }

  return { user, supabase };
}
