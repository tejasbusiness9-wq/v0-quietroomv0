"use client"

import { getSupabaseBrowserClient } from "./client"

/**
 * Hook to get the Supabase client in React components
 * Memoized to prevent creating multiple instances
 */
export function useSupabase() {
  return getSupabaseBrowserClient()
}
