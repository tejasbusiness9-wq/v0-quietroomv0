"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createTestUserBypass() {
  const cookieStore = await cookies()

  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Ignore in Server Component
          }
        },
      },
    },
  )

  const TEST_EMAIL = "testuser@gmail.com"
  const TEST_PASSWORD = "TestPassword123!"

  try {
    // Check if user exists
    const { data: existingUsers } = await adminSupabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find((u) => u.email === TEST_EMAIL)

    if (existingUser) {
      console.log("[v0] Test user exists, confirming email...")

      const { error: updateError } = await adminSupabase.auth.admin.updateUserById(existingUser.id, {
        email_confirm: true,
      })

      if (updateError) {
        console.error("[v0] Failed to confirm email:", updateError)
        throw updateError
      }

      console.log("[v0] Test user email confirmed")
    } else {
      const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: "Test User",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=testuser",
        },
      })

      if (createError) {
        console.error("[v0] Failed to create test user:", createError)
        throw createError
      }

      console.log("[v0] Test user created and email confirmed")
    }

    return { success: true }
  } catch (error: any) {
    console.error("[v0] createTestUserBypass error:", error)
    return { success: false, error: error.message }
  }
}
