import { createBrowserClient } from "@supabase/ssr";

function getRequiredPublicEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    getRequiredPublicEnv(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      "NEXT_PUBLIC_SUPABASE_URL",
    ),
    getRequiredPublicEnv(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ),
  );
}

