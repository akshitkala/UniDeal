import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Server-only Supabase client initialized with the SUPABASE_SERVICE_ROLE_KEY.
 * 
 * SECURITY NON-NEGOTIABLES (rules.md §3):
 * 1. This file must NEVER be imported into a Client Component.
 * 2. Used exclusively in server-side operations requiring elevated permissions,
 *    such as POST /api/listings/[id]/contact to read whatsapp_number, and admin actions.
 * 3. Never expose this client instance or the raw service-role key to the browser.
 */

if (typeof window !== 'undefined') {
  throw new Error('CRITICAL SECURITY ERROR: lib/supabase/admin.ts imported in a client environment.');
}

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
