"use client"

import { useEffect, useState } from "react"
import { Flame } from "lucide-react"

interface StreakDisplayProps {
  userId?: string
}

export function StreakDisplay({ userId }: StreakDisplayProps) {
  const [streakCount, setStreakCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStreak() {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/streak?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setStreakCount(data.streak || 0)
        }
      } catch (error) {
        console.error("Error fetching streak:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStreak()
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/30 px-4 py-2">
        <div className="h-5 w-5 animate-pulse rounded-full bg-purple-500/30" />
        <span className="text-sm font-medium text-purple-300">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/30 px-4 py-2 transition-all hover:border-purple-500/50 hover:bg-purple-950/50">
      {/* Placeholder icon */}
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
        <Flame className="h-4 w-4 text-white" />
      </div>

      {/* Streak count */}
      <span className="text-sm font-medium text-purple-200">
        {streakCount} {streakCount === 1 ? "day" : "days"}
      </span>
    </div>
  )
}
