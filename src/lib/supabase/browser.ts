import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../env';
import type { Database } from '@/integrations/supabase/types';

let _client: SupabaseClient<Database> | null = null;

export function createBrowserSupabaseClient() {
  if (_client) return _client;
  
  _client = createClient<Database>(env.url, env.anon, {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'sb-insilico-auth-v1',
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  
  return _client;
}

// Export the singleton client for use throughout the app
export const supabase = createBrowserSupabaseClient();