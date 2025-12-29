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

  console.log("[v0] StreakCounter rendering with userId:", userId, "streak:", streak, "loading:", loading)

  useEffect(() => {
    if (!userId || userId === "") {
      console.log("[v0] No valid userId provided to StreakCounter")
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
          console.error("[v0] Error fetching streak:", error.message)
          setStreak(0)
        } else {
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          if (data?.last_activity_date) {
            const lastDate = new Date(data.last_activity_date)
            lastDate.setHours(0, 0, 0, 0)

            const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

            if (diffDays > 1) {
              console.log("[v0] Streak reset due to inactivity")
              setStreak(0)
            } else {
              console.log("[v0] Setting streak to:", data?.current_streak)
              setStreak(data?.current_streak || 0)
            }
          } else {
            console.log("[v0] No last_activity_date, using current_streak:", data?.current_streak)
            setStreak(data?.current_streak || 0)
          }
        }
      } catch (error) {
        console.error("[v0] Error loading streak data:", error)
        setStreak(0)
      } finally {
        setLoading(false)
      }
    }

    fetchStreak()
  }, [userId, refreshTrigger])

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-950/30 rounded-full border border-purple-500/30 hover:bg-purple-900/50 hover:border-purple-400 transition-all cursor-pointer group">
      <div className="relative w-full h-full flex items-end justify-center">
          {/* Inner Glow / Core */}
          <div className="absolute w-4 h-6 bg-cyan-400 rounded-full blur-[2px] opacity-80 animate-pulse translate-y-1"></div>
          
          {/* Main Flame Body */}
          <svg 
            viewBox="0 0 100 120" 
            className="w-full h-full drop-shadow-[0_0_12px_rgba(168,85,247,0.9)]"
          >
            <defs>
              <linearGradient id="flameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#A855F7" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#7E22CE" />
                <stop offset="100%" stopColor="#2E1065" />
              </linearGradient>
            </defs>
            
            {/* Outer Flame */}
            <path 
              className="flame-layer-1"
              fill="url(#flameGradient)"
              d="M50 0C50 0 85 40 85 75C85 110 50 120 50 120C50 120 15 110 15 75C15 40 50 0 50 0Z"
            >
              <animate 
                attributeName="d" 
                dur="1.5s" 
                repeatCount="indefinite"
                values="
                  M50 0C50 0 85 40 85 75C85 110 50 120 50 120C50 120 15 110 15 75C15 40 50 0 50 0Z;
                  M50 5C50 5 80 45 80 75C80 105 50 115 50 115C50 115 20 105 20 75C20 45 50 5 50 5Z;
                  M50 0C50 0 85 40 85 75C85 110 50 120 50 120C50 120 15 110 15 75C15 40 50 0 50 0Z"
              />
            </path>

            {/* Core Flicker */}
            <path 
              fill="#22D3EE"
              opacity="0.6"
              d="M50 40C50 40 70 65 70 85C70 105 50 110 50 110C50 110 30 105 30 85C30 65 50 40 50 40Z"
            >
              <animate 
                attributeName="opacity" 
                dur="0.8s" 
                repeatCount="indefinite"
                values="0.4; 0.8; 0.4"
              />
              <animateTransform 
                attributeName="transform"
                type="scale"
                dur="0.5s"
                repeatCount="indefinite"
                values="1; 1.05; 1"
                additive="sum"
              />
            </path>
          </svg>
        </div>
      <div className="flex items-center gap-1">
        <span className="text-sm md:text-base font-bold text-white">{loading ? "—" : streak}</span>
        <span className="text-xs text-white/70">day{streak !== 1 ? "s" : ""}</span>
      </div>
    </div>
  )
}
