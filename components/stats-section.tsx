"use client"

import { Star, Zap, TrendingUp, Timer, Trophy } from "lucide-react"
import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export function StatsSection() {
  const [stats, setStats] = useState({
    focusTimeToday: 0,
    completedToday: 0,
    xpEarnedToday: 0,
    activeGoals: 0,
    leaderboardRank: null as number | null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const today = new Date().toISOString().split("T")[0]

    const [completedRes, goalsRes, dailyXpRes, zenSessionsRes, userStatsRes] = await Promise.all([
      supabase
        .from("tasks")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .eq("completed", true)
        .gte("completed_at", today),
      supabase.from("goals").select("id", { count: "exact" }).eq("user_id", user.id).eq("status", "active"),
      supabase
        .from("activity_log")
        .select("xp_earned")
        .eq("user_id", user.id)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`),
      supabase
        .from("zen_sessions")
        .select("duration_minutes")
        .eq("user_id", user.id)
        .gte("started_at", `${today}T00:00:00`)
        .lte("started_at", `${today}T23:59:59`),
      supabase.from("user_stats").select("total_xp, user_id").order("total_xp", { ascending: false }),
    ])

    const dailyXp = dailyXpRes.data?.reduce((sum, log) => sum + (log.xp_earned || 0), 0) || 0

    const totalFocusMinutes =
      zenSessionsRes.data?.reduce((sum, session) => sum + (session.duration_minutes || 0), 0) || 0

    let userRank = null
    if (userStatsRes.data) {
      const rankIndex = userStatsRes.data.findIndex((stat) => stat.user_id === user.id)
      if (rankIndex !== -1) {
        userRank = rankIndex + 1
      }
    }

    setStats({
      focusTimeToday: totalFocusMinutes,
      completedToday: completedRes.count || 0,
      xpEarnedToday: dailyXp,
      activeGoals: goalsRes.count || 0,
      leaderboardRank: userRank,
    })
    setLoading(false)
  }

  const formatFocusTime = (minutes: number) => {
    if (minutes === 0) return "0m"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  const formatRank = (rank: number | null) => {
    if (rank === null) return "—"
    return `#${rank}`
  }

  if (loading) {
    return (
      <div className="mb-8 flex items-center justify-center py-12">
        <Zap className="w-8 h-8 text-primary animate-pulse" />
      </div>
    )
  }

  const hasData = stats.focusTimeToday > 0 || stats.completedToday > 0 || stats.xpEarnedToday > 0

  if (!hasData) {
    return (
      <div className="mb-8">
        <div className="rune-card p-8 text-center">
          <div className="relative inline-block mb-4">
            <TrendingUp className="w-16 h-16 text-muted-foreground/30 animate-bounce" />
            <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Stats Yet</h3>
          <p className="text-muted-foreground">Create tasks and goals to start tracking your progress!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 md:mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {/* Focus Time Today */}
      <div className="rune-card p-4 md:p-6 flex flex-col justify-between min-h-40 md:min-h-48">
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-xs md:text-sm mb-2 md:mb-3 font-medium">Focus Time Today</p>
            <p className="text-3xl md:text-4xl font-bold text-foreground">{formatFocusTime(stats.focusTimeToday)}</p>
          </div>
          <div className="rune-icon">
            <Timer className="w-6 h-6 md:w-7 md:h-7 text-primary" />
          </div>
        </div>
        <div className="mt-auto pt-3 md:pt-4 flex items-end justify-center">
          <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-24 h-14 md:w-28 md:h-16">
            <circle cx="100" cy="55" r="30" fill="none" stroke="hsl(290, 100%, 50%)" strokeWidth="2" opacity="0.4" />
            <circle cx="100" cy="55" r="20" fill="none" stroke="hsl(290, 100%, 50%)" strokeWidth="1.5" opacity="0.3" />
            <path
              d="M 100 40 L 100 55 L 115 60"
              stroke="hsl(290, 100%, 50%)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          </svg>
        </div>
      </div>

      {/* Completed Today */}
      <div className="rune-card p-4 md:p-6 flex flex-col justify-between min-h-40 md:min-h-48">
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-xs md:text-sm mb-2 md:mb-3 font-medium">Completed Today</p>
            <p className="text-3xl md:text-4xl font-bold text-foreground">{stats.completedToday}</p>
          </div>
          <div className="rune-icon">
            <Star className="w-6 h-6 md:w-7 md:h-7 text-primary" />
          </div>
        </div>
        <div className="mt-auto pt-3 md:pt-4 flex items-end justify-center">
          <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-24 h-14 md:w-28 md:h-16">
            <path
              d="M 50 70 L 60 40 L 75 55 L 100 30 L 125 55 L 140 40 L 150 70"
              fill="none"
              stroke="hsl(290, 100%, 50%)"
              strokeWidth="2.5"
              opacity="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="100" cy="30" r="3.5" fill="hsl(290, 100%, 50%)" opacity="1" />
          </svg>
        </div>
      </div>

      {/* XP Earned Today */}
      <div className="rune-card p-4 md:p-6 flex flex-col justify-between min-h-40 md:min-h-48">
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-xs md:text-sm mb-2 md:mb-3 font-medium">XP Earned Today</p>
            <p className="text-3xl md:text-4xl font-bold text-foreground">{stats.xpEarnedToday}</p>
          </div>
          <div className="rune-icon">
            <Zap className="w-6 h-6 md:w-7 md:h-7 text-yellow-500" />
          </div>
        </div>
        <div className="mt-auto pt-3 md:pt-4 flex items-end justify-center">
          <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-24 h-14 md:w-28 md:h-16">
            <path d="M 100 35 L 115 65 L 100 75 L 85 65 Z" fill="hsl(290, 100%, 50%)" opacity="0.8" />
            <circle cx="100" cy="55" r="18" fill="none" stroke="hsl(290, 100%, 50%)" strokeWidth="1.5" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* Leaderboard Rank */}
      <div className="rune-card p-4 md:p-6 flex flex-col justify-between min-h-40 md:min-h-48">
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-xs md:text-sm mb-2 md:mb-3 font-medium">Leaderboard Rank</p>
            <p className="text-3xl md:text-4xl font-bold text-foreground">{formatRank(stats.leaderboardRank)}</p>
          </div>
          <div className="rune-icon">
            <Trophy className="w-6 h-6 md:w-7 md:h-7 text-yellow-500" />
          </div>
        </div>
        <div className="mt-auto pt-3 md:pt-4 flex items-end justify-center">
          <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-24 h-14 md:w-28 md:h-16">
            <path
              d="M 100 30 L 110 60 L 140 65 L 115 85 L 120 115 L 100 100 L 80 115 L 85 85 L 60 65 L 90 60 Z"
              fill="hsl(290, 100%, 50%)"
              opacity="0.7"
              transform="scale(0.5) translate(100, 20)"
            />
            <circle cx="100" cy="55" r="25" fill="none" stroke="hsl(290, 100%, 50%)" strokeWidth="2" opacity="0.4" />
          </svg>
        </div>
      </div>
    </div>
  )
}
