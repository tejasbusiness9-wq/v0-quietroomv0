"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import Image from "next/image"

interface StreakBadgeProps {
  userId: string
}

export function StreakBadge({ userId }: StreakBadgeProps) {
  const [streak, setStreak] = useState<number>(0)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const fetchStreak = async () => {
      const { data } = await supabase.from("streaks").select("current_streak").eq("user_id", userId).maybeSingle()

      if (data) {
        setStreak(data.current_streak || 0)
      }
    }

    fetchStreak()
  }, [userId, supabase])

  return (
    <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-900/20 border border-purple-500/30 animate-streak-border overflow-visible">
      {/* Flame icon container with fixed size */}
      <div className="relative w-6 h-6 flex-shrink-0 flex items-center justify-center overflow-visible">
        <Image
          src="/images/flame-icon.png"
          alt="Streak flame"
          width={64}
          height={64}
          className="absolute w-16 h-16 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain animate-flame-float drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]"
        />
      </div>

      {/* Streak count */}
      <span className="text-sm font-semibold text-purple-200">
        {streak} {streak === 1 ? "day" : "days"}
      </span>
    </div>
  )
}
