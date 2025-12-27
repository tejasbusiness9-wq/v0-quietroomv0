"use client"

import { useEffect, useState } from "react"
import { Trophy, Crown, Medal, Zap, TrendingUp } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { getLevelInfo } from "@/lib/leveling-system"
import { dataCache } from "@/lib/data-cache"
import { prefetchDashboardData, prefetchGoalsData } from "@/lib/data-prefetch"

interface LeaderboardEntry {
  id: string
  user_id: string
  username: string
  display_name: string
  level: number
  total_xp: number
  avatar_url: string | null
  user_class: string
  rank: number
  can_claim_aura: boolean
  claimable_aura: number
  last_aura_claim_at: string | null
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    const prefetchOtherPages = async () => {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        // Prefetch dashboard and goals in background
        setTimeout(() => {
          prefetchDashboardData(user.id)
          prefetchGoalsData(user.id)
        }, 1000)
      }
    }
    prefetchOtherPages()
  }, [])

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    // Check cache first
    const cached = dataCache.get("leaderboard")
    if (cached) {
      console.log("[v0] Using cached leaderboard data")
      setLeaderboard(cached)
      setLoading(false)

      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
      return
    }

    setLoading(true)
    const supabase = getSupabaseBrowserClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    setCurrentUserId(user?.id || null)

    const { data, error } = await supabase.rpc("get_leaderboard_with_aura", {})

    console.log("[v0] Leaderboard query result:", { data, error, count: data?.length })

    if (error) {
      console.error("[v0] Error fetching leaderboard:", error)
      // Fallback to basic query if RPC doesn't exist yet
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, level, total_xp, avatar_url, user_class, aura, last_aura_claim_at")
        .order("total_xp", { ascending: false })
        .limit(100)

      if (fallbackError) {
        console.error("[v0] Fallback query error:", fallbackError)
      } else {
        // Calculate ranks and eligibility client-side
        const enrichedData = (fallbackData || []).map((entry, index) => {
          const rank = index + 1
          const canClaim =
            !entry.last_aura_claim_at || new Date(entry.last_aura_claim_at).getTime() < Date.now() - 24 * 60 * 60 * 1000

          let claimableAura = 0
          if (rank >= 1 && rank <= 10) claimableAura = 100
          else if (rank >= 11 && rank <= 50) claimableAura = 50
          else if (rank >= 51 && rank <= 100) claimableAura = 20

          return {
            ...entry,
            rank,
            can_claim_aura: canClaim,
            claimable_aura: claimableAura,
          }
        })
        setLeaderboard(enrichedData)
        dataCache.set("leaderboard", enrichedData, 60000)
      }
    } else {
      setLeaderboard(data || [])
      dataCache.set("leaderboard", data || [], 60000)
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

  const handleClaimAura = async (entry: LeaderboardEntry) => {
    if (!entry.can_claim_aura || claiming) return

    setClaiming(true)
    const supabase = getSupabaseBrowserClient()

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          aura: entry.claimable_aura,
          last_aura_claim_at: new Date().toISOString(),
        })
        .eq("user_id", entry.user_id)

      if (updateError) throw updateError

      await fetchLeaderboard()

      alert(`Claimed ${entry.claimable_aura} Aura! Come back in 24 hours.`)
    } catch (error) {
      console.error("[v0] Error claiming aura:", error)
      alert("Failed to claim Aura. Please try again.")
    } finally {
      setClaiming(false)
    }
  }

  const getTimeUntilNextClaim = (lastClaimAt: string | null) => {
    if (!lastClaimAt) return null

    const lastClaim = new Date(lastClaimAt)
    const nextClaim = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000)
    const now = new Date()

    if (now >= nextClaim) return null

    const diff = nextClaim.getTime() - now.getTime()
    const hours = Math.floor(diff / (60 * 60 * 1000))
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))

    return `${hours}h ${minutes}m`
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Trophy className="w-16 h-16 text-primary animate-bounce mb-4" />
        <p className="text-muted-foreground">Loading leaderboard...</p>
      </div>
    )
  }

  const currentUserEntry = leaderboard.find((entry) => entry.user_id === currentUserId)
  const timeUntilClaim = currentUserEntry ? getTimeUntilNextClaim(currentUserEntry.last_aura_claim_at) : null

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-10 h-10 text-violet-400" />
              <h2 className="text-4xl font-bold text-primary">Leaderboard</h2>
            </div>
            <p className="text-muted-foreground">Top players ranked by total XP earned</p>
          </div>

          {currentUserEntry && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-primary/10 border-2 border-primary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">{getRankBadge(currentUserEntry.rank)}</div>
                <div>
                  <p className="text-xs text-muted-foreground">Your Rank</p>
                  <p className="text-lg font-bold text-foreground">#{currentUserEntry.rank}</p>
                </div>
              </div>

              {currentUserEntry.claimable_aura > 0 && (
                <div className="flex-shrink-0">
                  {currentUserEntry.can_claim_aura ? (
                    <button
                      onClick={() => handleClaimAura(currentUserEntry)}
                      disabled={claiming}
                      className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      <img src="/images/aura.png" alt="Aura" className="w-4 h-4" />
                      <span>Claim {currentUserEntry.claimable_aura}</span>
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-muted border border-border rounded-lg whitespace-nowrap">
                      <p className="text-xs text-muted-foreground">Next claim in</p>
                      <p className="text-sm font-semibold text-foreground">{timeUntilClaim}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
          <p className="text-sm text-primary font-semibold mb-1">Daily Aura Rewards</p>
          <p className="text-xs text-muted-foreground">
            Rank 1-10: 100 Aura • Rank 11-50: 50 Aura • Rank 51-100: 20 Aura
          </p>
          <p className="text-xs text-muted-foreground mt-1">Claim once every 24 hours based on your rank</p>
        </div>
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
          {leaderboard.map((entry) => {
            const isCurrentUser = entry.user_id === currentUserId

            return (
              <div
                key={entry.user_id}
                className={`
                  rounded-xl p-5 transition-all duration-300
                  hover:scale-[1.02]
                  ${getCardStyle(entry.rank, isCurrentUser)}
                `}
              >
                {entry.rank === 1 && (
                  <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-shimmer" />
                  </div>
                )}

                <div className="flex items-center gap-4 relative z-10">
                  <div className="flex-shrink-0">{getRankBadge(entry.rank)}</div>

                  <div className="flex-shrink-0">
                    {entry.avatar_url ? (
                      <img
                        src={entry.avatar_url || "/placeholder.svg"}
                        alt={entry.display_name}
                        className="w-14 h-14 rounded-full"
                      />
                    ) : (
                      <div
                        className={`w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-2xl font-bold ${
                          entry.rank === 1 ? "ring-4 ring-primary/50" : ""
                        }`}
                      >
                        <span>{entry.display_name?.charAt(0) || "?"}</span>
                      </div>
                    )}
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
                      {entry.rank === 1 && (
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
