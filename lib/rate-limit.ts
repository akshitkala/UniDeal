import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export const MAX_CONTACT_REVEALS_PER_DAY = 50;

/**
 * Checks whether a user has exceeded the daily contact reveals rate limit (50/24h).
 * TRD §5.5
 */
export async function checkContactRevealRateLimit(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ allowed: boolean; currentCount: number }> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from('contact_reveals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gt('created_at', oneDayAgo);

  if (error) {
    throw new Error(`Failed to check contact reveals rate limit: ${error.message}`);
  }

  const currentCount = count ?? 0;
  return {
    allowed: currentCount < MAX_CONTACT_REVEALS_PER_DAY,
    currentCount,
  };
}
