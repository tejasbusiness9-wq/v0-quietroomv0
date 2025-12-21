"use client"

import type React from "react"
import { TrendingUp, Target, Zap, Calendar } from "lucide-react"
import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface InsightCard {
  icon: React.ReactNode
  title: string
  value: string
  description: string
  color: string
}

export function GoalsInsights() {
  const [insights, setInsights] = useState<InsightCard[]>([])
  const [weeklyStats, setWeeklyStats] = useState<any[]>([])
  const [summaryStats, setSummaryStats] = useState({
    activeGoals: 0,
    completedGoals: 0,
    xpEarned: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRealStats()
  }, [])

  const fetchRealStats = async () => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)

    const [
      activeGoalsRes,
      completedGoalsRes,
      allGoalsRes, // Fetch all goals to sum up XP
      weeklyGoalsRes,
      closestGoalRes,
      tasksThisWeekRes,
      activityLogRes,
    ] = await Promise.all([
      // Active goals count
      supabase
        .from("goals")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .eq("status", "active"),
      // Completed goals this month
      supabase
        .from("goals")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .eq("status", "completed")
        .gte("completed_at", thirtyDaysAgo.toISOString()),
      supabase.from("goals").select("xp").eq("user_id", user.id),
      // Goals with progress this week
      supabase
        .from("goals")
        .select("id, title, updated_at")
        .eq("user_id", user.id)
        .eq("status", "active")
        .gte("updated_at", sevenDaysAgo.toISOString()),
      // Closest goal to completion
      supabase
        .from("goals")
        .select("id, title, progress, xp, max_xp")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("progress", { ascending: false })
        .limit(1)
        .single(),
      // Tasks contributing to goals this week
      supabase
        .from("tasks")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .not("goal_id", "is", null)
        .gte("created_at", sevenDaysAgo.toISOString()),
      // Activity log for weekly chart
      supabase
        .from("activity_log")
        .select("created_at, xp_earned")
        .eq("user_id", user.id)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: true }),
    ])

    const totalGoalXP = allGoalsRes.data?.reduce((sum, goal) => sum + (goal.xp || 0), 0) || 0

    console.log("[v0] Total XP from all goals:", totalGoalXP)

    // Calculate stats from real data
    const activeGoalsCount = activeGoalsRes.count || 0
    const completedGoalsCount = completedGoalsRes.count || 0
    const weeklyGoalsCount = weeklyGoalsRes.data?.length || 0
    const closestGoal = closestGoalRes.data
    const tasksCount = tasksThisWeekRes.count || 0

    // Calculate streak from activity log
    const calculateStreak = () => {
      if (!activityLogRes.data || activityLogRes.data.length === 0) return 0

      const dates = activityLogRes.data.map((log) => new Date(log.created_at).toDateString())
      const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

      let streak = 0
      const currentDate = new Date()
      currentDate.setHours(0, 0, 0, 0)

      for (const dateStr of uniqueDates) {
        const logDate = new Date(dateStr)
        logDate.setHours(0, 0, 0, 0)

        const diffDays = Math.floor((currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === streak) {
          streak++
        } else {
          break
        }
      }

      return streak
    }

    const goalStreak = calculateStreak()

    // Generate weekly activity chart from real data
    const generateWeeklyChart = () => {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      const chartData = []

      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]

        const dayLogs = activityLogRes.data?.filter(
          (log) => new Date(log.created_at).toISOString().split("T")[0] === dateStr,
        )
        const totalXp = dayLogs?.reduce((sum, log) => sum + (log.xp_earned || 0), 0) || 0
        const progress = Math.min((totalXp / 200) * 100, 100) // Normalize to 100%

        chartData.push({
          day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
          progress: Math.round(progress),
          label: days[date.getDay() === 0 ? 6 : date.getDay() - 1].charAt(0),
        })
      }

      return chartData
    }

    const weeklyChartData = generateWeeklyChart()

    // Build insights
    const insightsData: InsightCard[] = [
      {
        icon: <TrendingUp className="w-5 h-5" />,
        title: "Progress This Week",
        value: weeklyGoalsCount > 0 ? `${weeklyGoalsCount} goals` : "No progress",
        description:
          weeklyGoalsCount > 0
            ? `You made progress in ${weeklyGoalsCount} goals this week`
            : "No goals updated this week",
        color: "from-blue-500/20 to-blue-600/10",
      },
      {
        icon: <Target className="w-5 h-5" />,
        title: "Closest to Finish",
        value: closestGoal ? closestGoal.title : "No active goals",
        description: closestGoal
          ? `You're ${closestGoal.progress}% complete, keep it up!`
          : "Create a goal to track progress",
        color: "from-purple-500/20 to-purple-600/10",
      },
      {
        icon: <Zap className="w-5 h-5" />,
        title: "Tasks Contributing",
        value: tasksCount > 0 ? `${tasksCount} tasks` : "No tasks",
        description:
          tasksCount > 0 ? `${tasksCount} tasks contributed to goals this week` : "No tasks linked to goals this week",
        color: "from-amber-500/20 to-amber-600/10",
      },
      {
        icon: <Calendar className="w-5 h-5" />,
        title: "Goal Streak",
        value: goalStreak > 0 ? `${goalStreak} days` : "0 days",
        description:
          goalStreak > 0 ? `You've worked on goals ${goalStreak} days straight` : "Start working on goals daily",
        color: "from-green-500/20 to-green-600/10",
      },
    ]

    setInsights(insightsData)
    setWeeklyStats(weeklyChartData)
    setSummaryStats({
      activeGoals: activeGoalsCount,
      completedGoals: completedGoalsCount,
      xpEarned: totalGoalXP, // Use sum of all goal XP instead of activity log
    })
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="mt-12 text-center py-12">
        <Zap className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
        <p className="text-muted-foreground">Loading your progress...</p>
      </div>
    )
  }

  const hasAnyData = summaryStats.activeGoals > 0 || summaryStats.completedGoals > 0 || summaryStats.xpEarned > 0

  if (!hasAnyData) {
    return (
      <div className="mt-12 space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Your Progress</h3>
          <p className="text-muted-foreground">See how you're progressing toward your goals</p>
        </div>
        <div className="rune-card p-12 text-center">
          <div className="relative inline-block mb-4">
            <TrendingUp className="w-20 h-20 text-muted-foreground/30 animate-bounce" />
            <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Progress Data Yet</h3>
          <p className="text-muted-foreground mb-4">Create goals and complete tasks to start tracking your journey!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-12 space-y-8">
      {/* Section Header */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Your Progress</h3>
        <p className="text-muted-foreground">See how you're progressing toward your goals</p>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${insight.color} border border-border rounded-lg p-4 hover:border-primary/50 transition-colors group`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-primary group-hover:scale-110 transition-transform">{insight.icon}</div>
            </div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-1">{insight.title}</h4>
            <p className="text-2xl font-bold text-foreground mb-1">{insight.value}</p>
            <p className="text-xs text-muted-foreground">{insight.description}</p>
          </div>
        ))}
      </div>

      {/* Weekly Activity Chart */}
      {weeklyStats.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-6">Weekly Goal Activity</h3>
          <div className="flex items-end justify-between gap-2 h-32">
            {weeklyStats.map((stat, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-muted rounded-t-lg overflow-hidden group relative">
                  <div
                    className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-lg transition-all hover:from-primary/90 hover:to-primary/70 cursor-pointer"
                    style={{ height: `${stat.progress}%` }}
                  />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-xs font-semibold text-primary-foreground">{stat.progress}%</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="font-semibold text-foreground">Active Goals</h4>
          </div>
          <p className="text-3xl font-bold text-foreground">{summaryStats.activeGoals}</p>
          <p className="text-xs text-muted-foreground mt-2">Goals you're working on</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h4 className="font-semibold text-foreground">Completed</h4>
          </div>
          <p className="text-3xl font-bold text-foreground">{summaryStats.completedGoals}</p>
          <p className="text-xs text-muted-foreground mt-2">Goals finished this month</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="font-semibold text-foreground">XP Earned</h4>
          </div>
          <p className="text-3xl font-bold text-foreground">{summaryStats.xpEarned.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">Total XP from goal progress</p>
        </div>
      </div>
    </div>
  )
}
