import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let supabaseClient: SupabaseClient | null = null

if (typeof window !== "undefined") {
  console.log("[v0] Creating Supabase client singleton at module initialization")
  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    throw new Error("getSupabaseBrowserClient should only be called on the client side")
  }

  if (!supabaseClient) {
    throw new Error("Supabase client not initialized")
  }

  console.log("[v0] getSupabaseBrowserClient() called - returning existing singleton")
  return supabaseClient
}

export const supabase = supabaseClient
