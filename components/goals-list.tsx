"use client"

import { ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface Goal {
  id: string
  title: string
  progress: number
  xp: number
  max_xp: number
  timeline: string
  target_date?: string
  status: string
}

interface GoalsListProps {
  onGoalSelect?: (goalId: string) => void
}

export function GoalsList({ onGoalSelect }: GoalsListProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    daily: true,
    weekly: true,
    monthly: true,
    yearly: false,
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setGoals(data)
    }
    setLoading(false)
  }

  const goalsByTimeline = {
    daily: goals.filter((g) => g.timeline === "daily"),
    weekly: goals.filter((g) => g.timeline === "weekly"),
    monthly: goals.filter((g) => g.timeline === "monthly"),
    yearly: goals.filter((g) => g.timeline === "yearly"),
  }

  const toggleSection = (section: "daily" | "weekly" | "monthly" | "yearly") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const getDaysRemaining = (targetDate?: string) => {
    if (!targetDate) return undefined
    const now = new Date()
    const target = new Date(targetDate)
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  const GoalCard = ({ goal }: { goal: Goal }) => {
    const daysRemaining = getDaysRemaining(goal.target_date)

    return (
      <button
        onClick={() => onGoalSelect?.(goal.id)}
        className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors text-left group w-full"
      >
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors flex-1">
            {goal.title}
          </h4>
          {daysRemaining !== undefined && (
            <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">{daysRemaining} days left</span>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-primary font-semibold">{goal.progress}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-300"
              style={{ width: `${goal.progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {goal.xp} / {goal.max_xp} XP
          </p>
        </div>
      </button>
    )
  }

  const SectionHeader = ({
    title,
    count,
    section,
    color,
  }: {
    title: string
    count: number
    section: "daily" | "weekly" | "monthly" | "yearly"
    color: string
  }) => {
    const isExpanded = expandedSections[section]
    return (
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg mb-4 group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{count} goals</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>
    )
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading goals...</div>
  }

  return (
    <div className="mt-8">
      {/* Daily Goals */}
      {goalsByTimeline.daily.length > 0 && (
        <>
          <SectionHeader
            title="Daily Goals"
            count={goalsByTimeline.daily.length}
            section="daily"
            color="bg-green-500/70"
          />
          {expandedSections.daily && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {goalsByTimeline.daily.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Weekly Goals */}
      {goalsByTimeline.weekly.length > 0 && (
        <>
          <SectionHeader
            title="Weekly Goals"
            count={goalsByTimeline.weekly.length}
            section="weekly"
            color="bg-blue-500/70"
          />
          {expandedSections.weekly && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {goalsByTimeline.weekly.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Monthly Goals */}
      {goalsByTimeline.monthly.length > 0 && (
        <>
          <SectionHeader
            title="Monthly Goals"
            count={goalsByTimeline.monthly.length}
            section="monthly"
            color="bg-purple-500/70"
          />
          {expandedSections.monthly && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {goalsByTimeline.monthly.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Yearly Goals */}
      {goalsByTimeline.yearly.length > 0 && (
        <>
          <SectionHeader
            title="Yearly Goals"
            count={goalsByTimeline.yearly.length}
            section="yearly"
            color="bg-amber-500/70"
          />
          {expandedSections.yearly && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goalsByTimeline.yearly.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </>
      )}

      {goals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-2">Your Quest Log is empty</p>
          <p className="text-sm text-muted-foreground">Start a new campaign by creating your first goal</p>
        </div>
      )}
    </div>
  )
}
