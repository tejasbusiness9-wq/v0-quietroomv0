"use client"

import { useEffect, useState } from "react"

interface StreakCounterProps {
  userId: string
}

export function StreakCounter({ userId }: StreakCounterProps) {
  const [streak, setStreak] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStreak() {
      try {
        const { createBrowserClient } = await import("@supabase/ssr")
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        const { data, error } = await supabase.from("streaks").select("current_streak").eq("user_id", userId).single()

        if (error) {
          console.error("[v0] Error fetching streak:", error)
          setStreak(0)
        } else {
          setStreak(data?.current_streak || 0)
        }
      } catch (error) {
        console.error("[v0] Error loading streak data:", error)
        setStreak(0)
      } finally {
        setLoading(false)
      }
    }

    fetchStreak()
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full border border-orange-500/30">
        <div className="w-6 h-6 md:w-8 md:h-8 bg-orange-500/50 rounded-full animate-pulse" />
        <span className="text-sm md:text-base font-bold text-orange-100">—</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-950/30 rounded-full border border-purple-500/30 hover:bg-purple-900/50 hover:border-purple-400 transition-all cursor-pointer group">
      <video
        src="/images/streakflame.webm"
        autoPlay
        loop
        muted
        playsInline
        className="w-10 h-10 md:w-14 md:h-14 object-cover -my-3"
      />
      <div className="flex items-center gap-1">
        <span className="text-sm md:text-base font-bold text-orange-100">{streak}</span>
        <span className="hidden md:inline text-xs text-orange-200/80">day{streak !== 1 ? "s" : ""}</span>
      </div>
    </div>
  )
}
