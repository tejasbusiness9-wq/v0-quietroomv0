"use client"

import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useDataRefresh } from "@/contexts/data-refresh-context"

export function WeeklyXPChart() {
  const [weeklyStats, setWeeklyStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const { refreshTrigger } = useDataRefresh()

  useEffect(() => {
    fetchWeeklyXP()
    setTimeout(() => setMounted(true), 100)
  }, [refreshTrigger])

  const fetchWeeklyXP = async () => {
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
    sevenDaysAgo.setDate(today.getDate() - 6)

    const { data: activityLogRes } = await supabase
      .from("activity_log")
      .select("created_at, xp_earned")
      .eq("user_id", user.id)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true })

    const generateWeeklyChart = () => {
      const days = ["S", "M", "T", "W", "T", "F", "S"]
      const chartData = []

      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]

        const dayLogs = activityLogRes?.filter(
          (log) => new Date(log.created_at).toISOString().split("T")[0] === dateStr,
        )
        const totalXp = dayLogs?.reduce((sum, log) => sum + (log.xp_earned || 0), 0) || 0

        chartData.push({
          day: days[date.getDay()],
          xp: totalXp,
        })
      }

      return chartData
    }

    const weeklyChartData = generateWeeklyChart()
    setWeeklyStats(weeklyChartData)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-foreground mb-6">Weekly XP Activity</h3>
        <div className="h-[220px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  const chartWidth = 100 // percentage
  const chartHeight = 180
  const barWidth = 12 // percentage of available space per bar
  const spacing = 2 // percentage spacing between bars
  const maxXp = Math.max(...weeklyStats.map((d) => d.xp), 100) // Minimum scale of 100

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-8">
      <h3 className="font-semibold text-foreground mb-6">Weekly XP Activity</h3>
      <div className="relative h-[220px] w-full">
        <svg width="100%" height="100%" viewBox="0 0 700 220" className="overflow-visible">
          <defs>
            <linearGradient id="barGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>

          {weeklyStats.map((item, index) => {
            const barHeight = maxXp > 0 ? (item.xp / maxXp) * chartHeight : 0
            const x = 50 + index * 95 // Position each bar
            const y = chartHeight - barHeight + 20 // Start from bottom
            const isHovered = hoveredIndex === index

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width="50"
                  height={mounted ? barHeight : 0}
                  rx="6"
                  ry="6"
                  fill="url(#barGradient)"
                  opacity={isHovered ? 0.8 : 1}
                  style={{
                    filter: isHovered ? "brightness(1.2)" : "none",
                    transition: "all 0.3s ease, height 1s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                <text x={x + 25} y={chartHeight + 40} textAnchor="middle" fill="#94a3b8" fontSize="14">
                  {item.day}
                </text>

                {isHovered && (
                  <>
                    <rect
                      x={x - 10}
                      y={y - 40}
                      width="70"
                      height="30"
                      rx="6"
                      fill="#020617"
                      stroke="#7c3aed"
                      strokeWidth="1"
                      opacity="0.95"
                    />
                    <text x={x + 25} y={y - 20} textAnchor="middle" fill="white" fontSize="12" fontWeight="500">
                      XP: {item.xp}
                    </text>
                  </>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
