import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton browser client to prevent multiple instances and auth listeners
let browserClient: SupabaseClient | undefined

export function createClient() {
  // Create a singleton client for browser-side operations
  // This prevents multiple auth state listeners and session conflicts
  // Note: createBrowserClient handles SSR gracefully, so we don't need to throw on server-side
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: 'pkce',
        },
        cookieEncoding: 'raw',
      }
    )
  }

  return browserClient
}
