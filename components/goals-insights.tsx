"use client"

import type React from "react"

import { TrendingUp, Target, Zap, Calendar } from "lucide-react"

interface InsightCard {
  icon: React.ReactNode
  title: string
  value: string
  description: string
  color: string
}

export function GoalsInsights() {
  const insights: InsightCard[] = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Progress This Week",
      value: "3 goals",
      description: "You made progress in 3 goals this week",
      color: "from-blue-500/20 to-blue-600/10",
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Closest to Finish",
      value: "Master React",
      description: "You're 72% complete, keep it up!",
      color: "from-purple-500/20 to-purple-600/10",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Tasks Contributing",
      value: "5 tasks",
      description: "5 tasks contributed to goals today",
      color: "from-amber-500/20 to-amber-600/10",
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Goal Streak",
      value: "7 days",
      description: "You've worked on goals 7 days straight",
      color: "from-green-500/20 to-green-600/10",
    },
  ]

  const weeklyStats = [
    { day: "Mon", progress: 25, label: "M" },
    { day: "Tue", progress: 45, label: "T" },
    { day: "Wed", progress: 60, label: "W" },
    { day: "Thu", progress: 40, label: "T" },
    { day: "Fri", progress: 75, label: "F" },
    { day: "Sat", progress: 55, label: "S" },
    { day: "Sun", progress: 80, label: "S" },
  ]

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

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="font-semibold text-foreground">Active Goals</h4>
          </div>
          <p className="text-3xl font-bold text-foreground">5</p>
          <p className="text-xs text-muted-foreground mt-2">Goals you're working on</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h4 className="font-semibold text-foreground">Completed</h4>
          </div>
          <p className="text-3xl font-bold text-foreground">2</p>
          <p className="text-xs text-muted-foreground mt-2">Goals finished this month</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="font-semibold text-foreground">XP Earned</h4>
          </div>
          <p className="text-3xl font-bold text-foreground">3,450</p>
          <p className="text-xs text-muted-foreground mt-2">Total XP from goal progress</p>
        </div>
      </div>
    </div>
  )
}
