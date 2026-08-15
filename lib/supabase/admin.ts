import "server-only";

import { createClient } from "@supabase/supabase-js";

function getRequiredServerEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function createSupabaseAdminClient() {
  return createClient(
    getRequiredServerEnv(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "NEXT_PUBLIC_SUPABASE_URL",
    ),
    getRequiredServerEnv(
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      "SUPABASE_SERVICE_ROLE_KEY",
    ),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

