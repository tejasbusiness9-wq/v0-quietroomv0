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
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-900/20 border border-purple-500/30">
      {/* Flame icon container with animation */}
      <div className="relative w-5 h-5 md:w-12 md:h-12 flex items-center justify-center">
        <Image
          src="/images/flame-icon.png"
          alt="Streak flame"
          width={24}
          height={24}
          className="w-full h-full object-contain"
          
        />
      </div>

      {/* Streak count */}
      <span className="text-sm font-semibold text-purple-200">
        {streak} {streak === 1 ? "day" : "days"}
      </span>
    </div>
  )
}
