"use client"

import { Mail, User, Calendar, Trophy, Target, Zap, Star } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { getLevelInfo, calculateXPForLevel } from "@/lib/leveling-system"

interface ProfileData {
  level: number
  total_xp: number
  current_xp: number
  username: string | null
  display_name: string | null
  bio: string | null
}

export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [stats, setStats] = useState({
    goalsCompleted: 0,
    tasksFinished: 0,
    currentStreak: 0,
    totalXP: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    setUser(user)

    // Fetch profile
    const { data: profileData } = await supabase.from("profiles").select("*").eq("user_id", user.id).single()

    if (profileData) {
      setProfile(profileData)
    }

    // Fetch stats
    const { data: goalsData } = await supabase
      .from("goals")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "completed")

    const { data: tasksData } = await supabase.from("tasks").select("id").eq("user_id", user.id).eq("completed", true)

    const { data: streakData } = await supabase.from("streaks").select("current_streak").eq("user_id", user.id).single()

    setStats({
      goalsCompleted: goalsData?.length || 0,
      tasksFinished: tasksData?.length || 0,
      currentStreak: streakData?.current_streak || 0,
      totalXP: profileData?.total_xp || 0,
    })

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    )
  }

  const level = profile?.level || 1
  const totalXP = profile?.total_xp || 0
  const currentXP = profile?.current_xp || 0
  const xpForNextLevel = calculateXPForLevel(level)
  const xpProgress = (currentXP / xpForNextLevel) * 100

  const levelInfo = getLevelInfo(level)

  const userData = {
    name:
      profile?.display_name ||
      profile?.username ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "Player",
    email: user?.email || "",
    photoUrl: user?.user_metadata?.avatar_url || "/user-profile-illustration.png",
    joinDate: user?.created_at
      ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : "Recently",
  }

  const displayStats = [
    { label: "Goals Completed", value: stats.goalsCompleted.toString(), icon: Target, color: "text-emerald-400" },
    { label: "Tasks Finished", value: stats.tasksFinished.toString(), icon: Trophy, color: "text-purple-400" },
    {
      label: "Current Streak",
      value: `${stats.currentStreak} days`,
      icon: Zap,
      color: "text-orange-400",
    },
    { label: "Total XP Earned", value: totalXP.toLocaleString(), icon: Star, color: "text-yellow-400" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-primary mb-2">Profile</h2>
        <p className="text-muted-foreground">Your Questboard journey and achievements</p>
      </div>

      {/* Profile Card */}
      <Card className="rune-card p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Photo */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-primary/30 overflow-hidden bg-primary/10">
                <img
                  src={userData.photoUrl || "/placeholder.svg"}
                  alt={userData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center font-bold text-primary-foreground text-lg border-4 border-background ${levelInfo.glow}`}
              >
                {level}
              </div>
            </div>
            <div className="mt-4 text-center">
              <div
                className={`px-4 py-1 bg-primary/20 border border-primary/40 rounded-full text-sm font-semibold ${levelInfo.color}`}
              >
                {levelInfo.name}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Tier {levelInfo.tierNumber}: {levelInfo.tier}
              </p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-6">
            {/* Name (Read-only) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <div className="px-4 py-3 bg-muted/50 border border-border rounded-lg text-foreground">
                {userData.name}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {user?.app_metadata?.provider === "google" ? "Synced from Google Account" : "From your account"}
              </p>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <div className="px-4 py-3 bg-muted/50 border border-border rounded-lg text-foreground">
                {userData.email}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {user?.app_metadata?.provider === "google" ? "Synced from Google Account" : "From your account"}
              </p>
            </div>

            {/* Join Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <Calendar className="w-4 h-4" />
                Member Since
              </label>
              <div className="px-4 py-3 bg-muted/50 border border-border rounded-lg text-foreground">
                {userData.joinDate}
              </div>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Progress to Level {level + 1}</span>
            <span className="text-sm font-semibold text-primary">
              {currentXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
            </span>
          </div>
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 italic">"{levelInfo.title}"</p>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((stat, index) => (
          <Card key={index} className="rune-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={`rune-icon ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
