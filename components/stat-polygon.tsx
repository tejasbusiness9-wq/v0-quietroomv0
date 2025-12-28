"use client"

import { useMemo } from "react"

interface StatPolygonProps {
  stats: {
    focus: number // Zen Minutes (Target: 300m/week)
    consistency: number // Streak Days (Target: 30 days)
    volume: number // Tasks Completed (Target: 50 tasks)
    wealth: number // Aura Earned (Target: 2000)
    level: number // User Level (Target: 10)
  }
}

export function StatPolygon({ stats }: StatPolygonProps) {
  // 1. CONFIG: Set the "Max" values for a perfect 100% score
  // Adjust these to make the game harder/easier
  const MAX_VALS = {
    focus: 300, // 5 hours of focus = 100%
    consistency: 14, // 2 week streak = 100%
    volume: 30, // 30 tasks total = 100%
    wealth: 1000, // 1000 Aura = 100%
    level: 5, // Level 5 = 100%
  }

  // 2. Normalize Data (Convert to 0-100 range)
  const normalized = useMemo(() => {
    const clamp = (val: number, max: number) => Math.min(Math.max((val / max) * 100, 10), 100)
    return {
      focus: clamp(stats.focus, MAX_VALS.focus),
      consistency: clamp(stats.consistency, MAX_VALS.consistency),
      volume: clamp(stats.volume, MAX_VALS.volume),
      wealth: clamp(stats.wealth, MAX_VALS.wealth),
      level: clamp(stats.level, MAX_VALS.level),
    }
  }, [stats])

  // 3. Helper to calculate polygon points
  const getPoint = (value: number, index: number, total: number, radius: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2
    const x = Math.cos(angle) * (radius * (value / 100)) + 100
    const y = Math.sin(angle) * (radius * (value / 100)) + 100
    return `${x},${y}`
  }

  // Generate the 5 points for the shape
  const points = [
    getPoint(normalized.focus, 0, 5, 80),
    getPoint(normalized.consistency, 1, 5, 80),
    getPoint(normalized.volume, 2, 5, 80),
    getPoint(normalized.wealth, 3, 5, 80),
    getPoint(normalized.level, 4, 5, 80),
  ].join(" ")

  // Generate the background Pentagon (The "Max" border)
  const fullPoints = [100, 100, 100, 100, 100].map((_, i) => getPoint(100, i, 5, 80)).join(" ")
  const midPoints = [60, 60, 60, 60, 60].map((_, i) => getPoint(60, i, 5, 80)).join(" ")

  return (
    <div className="relative w-full max-w-[300px] aspect-square mx-auto flex items-center justify-center select-none">
      {/* BACKGROUND GRID */}
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
        {/* Outer Ring */}
        <polygon points={fullPoints} fill="none" stroke="#374151" strokeWidth="1" className="opacity-30" />
        {/* Inner Ring */}
        <polygon points={midPoints} fill="none" stroke="#374151" strokeWidth="1" className="opacity-20" />
        {/* Center Lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="100"
            y1="100"
            x2={getPoint(100, i, 5, 80).split(",")[0]}
            y2={getPoint(100, i, 5, 80).split(",")[1]}
            stroke="#374151"
            strokeWidth="1"
            className="opacity-20"
          />
        ))}

        {/* THE DATA SHAPE (The cool part) */}
        <polygon
          points={points}
          fill="rgba(168, 85, 247, 0.2)" // Purple-500 with opacity
          stroke="#A855F7" // Purple-500
          strokeWidth="2"
          className="filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-all duration-1000 ease-out animate-in zoom-in-90"
        />

        {/* DOTS AT CORNERS */}
        {[normalized.focus, normalized.consistency, normalized.volume, normalized.wealth, normalized.level].map(
          (val, i) => {
            const [x, y] = getPoint(val, i, 5, 80).split(",")
            return <circle key={i} cx={x} cy={y} r="3" fill="#FFF" />
          },
        )}
      </svg>

      {/* LABELS */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-400 tracking-widest bg-black/50 px-2 rounded backdrop-blur-sm">
        FOCUS
      </div>
      <div className="absolute top-[35%] right-0 translate-x-2 text-[10px] font-bold text-orange-400 tracking-widest">
        STRK
      </div>
      <div className="absolute bottom-[20%] right-2 translate-y-2 text-[10px] font-bold text-red-400 tracking-widest">
        TASK
      </div>
      <div className="absolute bottom-[20%] left-2 translate-y-2 text-[10px] font-bold text-yellow-400 tracking-widest">
        AURA
      </div>
      <div className="absolute top-[35%] left-0 -translate-x-3 text-[10px] font-bold text-green-400 tracking-widest">
        LVL
      </div>
    </div>
  )
}
