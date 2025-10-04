/**
 * Supabase Client for Client Components
 * Supports Realtime subscriptions with acknowledgement
 * Based on HELP_GPT/realtime_and_automation.md
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
