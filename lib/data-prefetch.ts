import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { dataCache } from "./data-cache"

export async function prefetchDashboardData(userId: string) {
  const supabase = getSupabaseBrowserClient()

  try {
    // Parallel fetch all dashboard data
    const [profileResult, goalsResult, tasksResult, streakResult, todayTasksResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("goals").select("id").eq("user_id", userId).eq("status", "completed"),
      supabase.from("tasks").select("id").eq("user_id", userId).eq("completed", true),
      supabase.from("streaks").select("current_streak").eq("user_id", userId).maybeSingle(),
      supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .gte("due_date", new Date().toISOString().split("T")[0])
        .lte("due_date", new Date().toISOString().split("T")[0] + "T23:59:59")
        .order("created_at", { ascending: false }),
    ])

    // Cache all results
    if (profileResult.data) {
      dataCache.set(`profile:${userId}`, profileResult.data)
    }

    dataCache.set(`stats:${userId}`, {
      goalsCompleted: goalsResult.data?.length || 0,
      tasksFinished: tasksResult.data?.length || 0,
      currentStreak: streakResult.data?.current_streak || 0,
      totalXP: profileResult.data?.total_xp || 0,
    })

    if (todayTasksResult.data) {
      dataCache.set(`tasks:today:${userId}`, todayTasksResult.data)
    }

    console.log("[v0] Dashboard data prefetched and cached")
  } catch (error) {
    console.error("[v0] Error prefetching dashboard data:", error)
  }
}

export async function prefetchLeaderboardData() {
  const supabase = getSupabaseBrowserClient()

  try {
    const { data, error } = await supabase.rpc("get_leaderboard_with_aura", {})

    if (!error && data) {
      dataCache.set("leaderboard", data, 60000) // Cache for 1 minute
      console.log("[v0] Leaderboard data prefetched and cached")
    }
  } catch (error) {
    console.error("[v0] Error prefetching leaderboard:", error)
  }
}

export async function prefetchGoalsData(userId: string) {
  const supabase = getSupabaseBrowserClient()

  try {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (!error && data) {
      dataCache.set(`goals:${userId}`, data)
      console.log("[v0] Goals data prefetched and cached")
    }
  } catch (error) {
    console.error("[v0] Error prefetching goals:", error)
  }
}
