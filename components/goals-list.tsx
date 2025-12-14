"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

interface GoalItem {
  id: string
  title: string
  progress: number
  xp: number
  maxXp: number
  timeRemaining?: string
  daysRemaining?: number
}

interface GoalsListProps {
  onGoalSelect?: (goalId: string) => void
}

export function GoalsList({ onGoalSelect }: GoalsListProps) {
  const [expandedSections, setExpandedSections] = useState({
    weekly: true,
    monthly: true,
    yearly: false,
  })

  const weeklyGoals: GoalItem[] = [
    {
      id: "w1",
      title: "Complete 4 focus sessions",
      progress: 75,
      xp: 750,
      maxXp: 1000,
    },
    {
      id: "w2",
      title: "Study 5 hours",
      progress: 60,
      xp: 600,
      maxXp: 1000,
    },
  ]

  const monthlyGoals: GoalItem[] = [
    {
      id: "m1",
      title: "UI/UX Case Study",
      progress: 65,
      xp: 650,
      maxXp: 1000,
      daysRemaining: 12,
    },
    {
      id: "m2",
      title: "Master React",
      progress: 72,
      xp: 720,
      maxXp: 1000,
      daysRemaining: 8,
    },
  ]

  const yearlyGoals: GoalItem[] = [
    {
      id: "y1",
      title: "Build Portfolio",
      progress: 40,
      xp: 400,
      maxXp: 1000,
    },
    {
      id: "y2",
      title: "Learn Full-Stack",
      progress: 55,
      xp: 550,
      maxXp: 1000,
    },
    {
      id: "y3",
      title: "Launch Side Project",
      progress: 30,
      xp: 300,
      maxXp: 1000,
    },
  ]

  const toggleSection = (section: "weekly" | "monthly" | "yearly") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const GoalCard = ({ goal, timeRemaining }: { goal: GoalItem; timeRemaining?: string }) => (
    <button
      onClick={() => onGoalSelect?.(goal.id)}
      className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors text-left group"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors flex-1">
          {goal.title}
        </h4>
        {timeRemaining && <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">{timeRemaining}</span>}
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
          ></div>
        </div>
        <p className="text-xs text-muted-foreground">
          {goal.xp} / {goal.maxXp} XP
        </p>
      </div>
    </button>
  )

  const SectionHeader = ({
    title,
    count,
    section,
    color,
  }: {
    title: string
    count: number
    section: "weekly" | "monthly" | "yearly"
    color: string
  }) => {
    const isExpanded = expandedSections[section]
    return (
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg mb-4 group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
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

  return (
    <div className="mt-8">
      {/* Weekly Goals */}
      <SectionHeader title="Weekly Goals" count={weeklyGoals.length} section="weekly" color="bg-blue-500/70" />
      {expandedSections.weekly && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {weeklyGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      {/* Monthly Goals */}
      <SectionHeader title="Monthly Goals" count={monthlyGoals.length} section="monthly" color="bg-purple-500/70" />
      {expandedSections.monthly && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {monthlyGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} timeRemaining={`${goal.daysRemaining} days remaining`} />
          ))}
        </div>
      )}

      {/* Yearly Goals */}
      <SectionHeader title="Yearly Goals" count={yearlyGoals.length} section="yearly" color="bg-amber-500/70" />
      {expandedSections.yearly && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {yearlyGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  )
}
