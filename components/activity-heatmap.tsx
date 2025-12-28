"use client"

import { useMemo } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ActivityData {
  date: string // Format: "YYYY-MM-DD"
  count: number // Number of tasks/XP earned
}

export function ActivityHeatmap({ data }: { data: ActivityData[] }) {
  // 1. CONFIG: Generate the last 365 days (approx 1 year)
  const days = useMemo(() => {
    const daysArray = []
    const today = new Date()
    // We go back 365 days
    for (let i = 364; i >= 0; i--) {
      const d = new Date()
      d.setDate(today.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]

      // Find matching data for this day
      const dayData = data.find((item) => item.date === dateStr)

      daysArray.push({
        date: dateStr,
        count: dayData ? dayData.count : 0,
        dayOfWeek: d.getDay(), // 0 = Sun, 1 = Mon...
      })
    }
    return daysArray
  }, [data])

  // 2. HELPER: Get Color based on intensity
  const getColor = (count: number) => {
    if (count === 0) return "bg-gray-800 border-gray-700/50" // Visible empty state
    if (count <= 2) return "bg-purple-900/40 border-purple-800/30" // Low
    if (count <= 5) return "bg-purple-600/60 border-purple-500/50" // Medium
    if (count <= 8) return "bg-purple-500 border-purple-400" // High
    return "bg-white border-white shadow-[0_0_10px_rgba(168,85,247,0.8)]" // GOD MODE (9+)
  }

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
      <div className="min-w-fit w-full">
        <div className="flex gap-1 justify-center md:justify-start">
          <div className="grid grid-rows-7 grid-flow-col gap-1">
            {days.map((day) => (
              <TooltipProvider key={day.date}>
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      className={`w-3 h-3 md:w-4 md:h-4 rounded-sm border ${getColor(day.count)} transition-all hover:scale-125 hover:z-10`}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 border-gray-800 text-xs">
                    <p className="font-bold text-white">{day.count} XP</p>
                    <p className="text-gray-400">{day.date}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 text-[10px] text-gray-500 font-mono justify-end px-2">
          <span>DORMANT</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-gray-800 border border-gray-700/50" />
            <div className="w-3 h-3 rounded-sm bg-purple-900/40 border border-purple-800/30" />
            <div className="w-3 h-3 rounded-sm bg-purple-600/60 border border-purple-500/50" />
            <div className="w-3 h-3 rounded-sm bg-purple-500 border border-purple-400" />
            <div className="w-3 h-3 rounded-sm bg-white border-white shadow-[0_0_10px_rgba(168,85,247,0.8)]" /> {/* 9+ */}
          </div>
          <span>GOD MODE</span>
        </div>
      </div>
    </div>
  )
}
