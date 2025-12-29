import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase.from("streaks").select("current_streak").eq("user_id", userId).single()

    if (error) {
      console.error("[v0] Error fetching streak:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ streak: data?.current_streak ?? 0 })
  } catch (error: any) {
    console.error("[v0] Streak API error:", error)
    return NextResponse.json({ error: "Failed to fetch streak" }, { status: 500 })
  }
}
