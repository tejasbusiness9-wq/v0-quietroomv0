"use client"

import { useEffect, useState } from "react"
import { Trophy, Crown, Medal, Zap, TrendingUp } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { getLevelInfo } from "@/lib/leveling-system"

interface LeaderboardEntry {
  id: string
  user_id: string
  username: string
  display_name: string
  level: number
  total_xp: number
  avatar_url: string | null
  user_class: string
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    setLoading(true)
    const supabase = getSupabaseBrowserClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setCurrentUserId(user?.id || null)

    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_id, username, display_name, level, total_xp, avatar_url, user_class")
      .order("total_xp", { ascending: false })
      .limit(100)

    console.log("[v0] Leaderboard query result:", { data, error, count: data?.length })

    if (error) {
      console.error("[v0] Error fetching leaderboard:", error)
    } else {
      setLeaderboard(data || [])
    }
    setLoading(false)
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="relative flex items-center justify-center w-12 h-12">
          <Crown className="w-8 h-8 text-primary animate-pulse drop-shadow-[0_0_15px_rgba(147,51,234,0.8)]" />
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
        </div>
      )
    } else if (rank === 2) {
      return <Medal className="w-8 h-8 text-gray-300" />
    } else if (rank === 3) {
      return <Medal className="w-8 h-8 text-amber-600" />
    } else {
      return <span className="text-muted-foreground font-bold text-lg">#{rank}</span>
    }
  }

  const getCardStyle = (rank: number, isCurrentUser: boolean) => {
    if (rank === 1) {
      return `
        relative overflow-hidden
        bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5
        border-2 border-primary/60
        shadow-[0_0_30px_rgba(147,51,234,0.4)]
        hover:shadow-[0_0_50px_rgba(147,51,234,0.6)]
        scale-105
        animate-glow
      `
    } else if (isCurrentUser) {
      return "bg-primary/10 border-2 border-primary hover:border-primary/80"
    }
    return "bg-card border border-border hover:border-primary/30"
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Trophy className="w-16 h-16 text-primary animate-bounce mb-4" />
        <p className="text-muted-foreground">Loading leaderboard...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-10 h-10 text-violet-400" />
          <h2 className="text-4xl font-bold text-primary">Leaderboard</h2>
        </div>
        <p className="text-muted-foreground">Top players ranked by total XP earned</p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <Trophy className="w-20 h-20 text-muted-foreground/30 mx-auto" />
          <div>
            <h4 className="text-xl font-semibold text-foreground mb-2">No players yet</h4>
            <p className="text-muted-foreground">Be the first to climb the ranks!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => {
            const rank = index + 1
            const isCurrentUser = entry.user_id === currentUserId

            return (
              <div
                key={entry.id}
                className={`
                  rounded-xl p-5 transition-all duration-300
                  hover:scale-[1.02]
                  ${getCardStyle(rank, isCurrentUser)}
                `}
              >
                {rank === 1 && (
                  <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-shimmer" />
                  </div>
                )}

                <div className="flex items-center gap-4 relative z-10">
                  <div className="flex-shrink-0">{getRankBadge(rank)}</div>

                  <div className="flex-shrink-0">
                    <div
                      className={`w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-2xl font-bold ${
                        rank === 1 ? "ring-4 ring-primary/50" : ""
                      }`}
                    >
                      {entry.avatar_url ? (
                        <img
                          src={entry.avatar_url || "/placeholder.svg"}
                          alt={entry.display_name}
                          className="w-full h-full rounded-full"
                        />
                      ) : (
                        <span>{entry.display_name?.charAt(0) || "?"}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-foreground truncate">
                        {entry.display_name || entry.username || "Anonymous"}
                      </h3>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full font-semibold">
                          You
                        </span>
                      )}
                      {rank === 1 && (
                        <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full font-semibold">
                          Champion
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{getLevelInfo(entry.level).name}</p>
                  </div>

                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="font-bold text-xl text-foreground">{entry.total_xp.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Total XP</p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="font-bold text-xl text-foreground">{entry.level}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Level</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
