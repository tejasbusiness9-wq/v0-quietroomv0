"use client"

import { useEffect, useState } from "react"
import { useDataRefresh } from "@/contexts/data-refresh-context"

interface StreakCounterProps {
  userId: string
}

export function StreakCounter({ userId }: StreakCounterProps) {
  const [streak, setStreak] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const { refreshTrigger } = useDataRefresh()

  useEffect(() => {
    if (!userId || userId === "") {
      setLoading(false)
      return
    }

    async function fetchStreak() {
      try {
        const { createBrowserClient } = await import("@supabase/ssr")
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        const { data, error } = await supabase
          .from("streaks")
          .select("current_streak, last_activity_date")
          .eq("user_id", userId)
          .single()

        if (error) {
          setStreak(0)
        } else {
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          if (data?.last_activity_date) {
            const lastDate = new Date(data.last_activity_date)
            lastDate.setHours(0, 0, 0, 0)

            const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

            if (diffDays > 1) {
              setStreak(0)
            } else {
              setStreak(data?.current_streak || 0)
            }
          } else {
            setStreak(data?.current_streak || 0)
          }
        }
      } catch (error) {
        console.error("Error loading streak data:", error)
        setStreak(0)
      } finally {
        setLoading(false)
      }
    }

    fetchStreak()
  }, [userId, refreshTrigger])

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-950/30 rounded-full border border-purple-500/30 hover:bg-purple-900/50 hover:border-purple-400 transition-all cursor-pointer group">
      <div className="relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
  {/* OPTIONAL: Glow behind the flame */}
  <div className="absolute inset-0 bg-orange-500/40 blur-lg rounded-full animate-pulse" />

  <video
    src="/images/Flameanimation.webm"
    autoPlay
    loop
    muted
    defaultMuted
    playsInline
    // 1. Scale and Position
    className="w-[150%] h-[150%] object-cover -mt-1" 
    style={{
      // 2. BLEND MODE: Hides the black background
      mixBlendMode: "screen",
      
      // 3. THE MASK: Forces the video into a circle shape (Webkit is for Chrome/Safari)
      maskImage: "radial-gradient(circle, black 60%, transparent 70%)",
      WebkitMaskImage: "radial-gradient(circle, black 60%, transparent 70%)"
    }}
  />
</div>
      <div className="flex items-center gap-1">
        <span className="text-sm md:text-base font-bold text-orange-100">{streak}</span>
        <span className="hidden md:inline text-xs text-orange-200/80">day{streak !== 1 ? "s" : ""}</span>
      </div>
    </div>
  )
}
