import { createBrowserClient } from "@supabase/ssr";
import type { Database } from '@/types/database.types'

const isBuildTime = typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build';

export function createClient() {
  if (isBuildTime) {
    // Return a minimal mock that satisfies the expected interface
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
      }),
    } as any;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  return createBrowserClient<Database>(url, key);
}