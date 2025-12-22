import { createBrowserClient as createBrowserClientSSR } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let supabaseClient: SupabaseClient | null = null

/**
 * Creates a Supabase browser client using the singleton pattern
 * @returns A configured Supabase client instance
 */
export function createBrowserClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient
  }

  supabaseClient = createBrowserClientSSR(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return supabaseClient
}
