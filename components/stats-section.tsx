"use client"

import { Clock, Star, Zap, TrendingUp } from "lucide-react"
import { MascotDialog } from "./mascot-dialog"
import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export function StatsSection() {
  const [stats, setStats] = useState({
    activeTasks: 0,
    completedToday: 0,
    xpEarnedToday: 0,
    activeGoals: 0,
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

    const [tasksRes, completedRes, goalsRes, dailyXpRes] = await Promise.all([
      supabase.from("tasks").select("id", { count: "exact" }).eq("user_id", user.id).eq("status", "active"),
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
    ])

    // Sum up XP earned today from activity log
    const dailyXp = dailyXpRes.data?.reduce((sum, log) => sum + (log.xp_earned || 0), 0) || 0

    setStats({
      activeTasks: tasksRes.count || 0,
      completedToday: completedRes.count || 0,
      xpEarnedToday: dailyXp,
      activeGoals: goalsRes.count || 0,
    })
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="mb-8 flex items-center justify-center py-12">
        <Zap className="w-8 h-8 text-primary animate-pulse" />
      </div>
    )
  }

  const hasData = stats.activeTasks > 0 || stats.completedToday > 0 || stats.xpEarnedToday > 0

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
    <div className="mb-8 flex items-stretch gap-8">
      <div className="flex-1 grid grid-cols-3 gap-6">
        {/* Active Tasks */}
        <div className="rune-card p-6 flex flex-col justify-between min-h-48">
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-3 font-medium">Active Tasks</p>
              <p className="text-4xl font-bold text-foreground">{stats.activeTasks}</p>
            </div>
            <div className="rune-icon">
              <Clock className="w-7 h-7 text-primary" />
            </div>
          </div>
          <div className="mt-auto pt-4 flex items-end justify-center">
            <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-28 h-16">
              <circle cx="100" cy="55" r="30" fill="none" stroke="hsl(290, 100%, 50%)" strokeWidth="2" opacity="0.4" />
              <circle
                cx="100"
                cy="55"
                r="20"
                fill="none"
                stroke="hsl(290, 100%, 50%)"
                strokeWidth="1.5"
                opacity="0.3"
              />
              <path
                d="M 85 55 L 95 65 L 115 45"
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
        <div className="rune-card p-6 flex flex-col justify-between min-h-48">
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-3 font-medium">Completed Today</p>
              <p className="text-4xl font-bold text-foreground">{stats.completedToday}</p>
            </div>
            <div className="rune-icon">
              <Star className="w-7 h-7 text-primary" />
            </div>
          </div>
          <div className="mt-auto pt-4 flex items-end justify-center">
            <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-28 h-16">
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
        <div className="rune-card p-6 flex flex-col justify-between min-h-48">
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-3 font-medium">XP Earned Today</p>
              <p className="text-4xl font-bold text-foreground">{stats.xpEarnedToday}</p>
            </div>
            <div className="rune-icon">
              <Zap className="w-7 h-7 text-yellow-500" />
            </div>
          </div>
          <div className="mt-auto pt-4 flex items-end justify-center">
            <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-28 h-16">
              <path d="M 100 35 L 115 65 L 100 75 L 85 65 Z" fill="hsl(290, 100%, 50%)" opacity="0.8" />
              <circle
                cx="100"
                cy="55"
                r="18"
                fill="none"
                stroke="hsl(290, 100%, 50%)"
                strokeWidth="1.5"
                opacity="0.6"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div onMouseEnter={() => {}} className="w-full">
          <MascotDialog />
        </div>

        {/* Mascot Image */}
        <div className="mascot-container">
          <img src="/images/q-mascot1.png" alt="Q Mascot" className="mascot-image" />
        </div>
      </div>
    </div>
  )
}
