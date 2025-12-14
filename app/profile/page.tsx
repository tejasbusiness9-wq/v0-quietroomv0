"use client"

import { Mail, User, Calendar, Trophy, Target, Zap, Award, Star, Shield } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [supabase])

  const userData = {
    name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Player",
    email: user?.email || "",
    photoUrl: user?.user_metadata?.avatar_url || "/user-profile-illustration.png",
    joinDate: user?.created_at
      ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : "Recently",
    level: 18,
    class: "Arcane Builder",
    totalXP: 12450,
    nextLevelXP: 15000,
  }

  const stats = [
    { label: "Goals Completed", value: "12", icon: Target, color: "text-emerald-400" },
    { label: "Tasks Finished", value: "87", icon: Trophy, color: "text-purple-400" },
    { label: "Current Streak", value: "18 days", icon: Zap, color: "text-orange-400" },
    { label: "Total XP Earned", value: "12,450", icon: Star, color: "text-yellow-400" },
  ]

  const achievements = [
    {
      title: "Early Adopter",
      description: "Joined Questboard in the first month",
      icon: Shield,
      unlocked: true,
    },
    {
      title: "Streak Master",
      description: "Maintained a 7-day streak",
      icon: Zap,
      unlocked: true,
    },
    {
      title: "Goal Crusher",
      description: "Complete 10 goals",
      icon: Target,
      unlocked: true,
    },
    {
      title: "Level 20",
      description: "Reach level 20",
      icon: Award,
      unlocked: false,
    },
  ]

  const xpProgress = (userData.totalXP / userData.nextLevelXP) * 100

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
              <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-lg border-4 border-background">
                {userData.level}
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="px-4 py-1 bg-primary/20 border border-primary/40 rounded-full text-sm font-semibold text-primary">
                {userData.class}
              </div>
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
            <span className="text-sm font-medium text-muted-foreground">Progress to Level {userData.level + 1}</span>
            <span className="text-sm font-semibold text-primary">
              {userData.totalXP.toLocaleString()} / {userData.nextLevelXP.toLocaleString()} XP
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
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
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

      {/* Achievements */}
      <Card className="rune-card p-8">
        <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-primary" />
          Achievements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-all ${
                achievement.unlocked ? "bg-primary/10 border-primary/40" : "bg-muted/30 border-border opacity-60"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    achievement.unlocked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <achievement.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  {achievement.unlocked && (
                    <span className="inline-block mt-2 text-xs font-semibold text-emerald-400">Unlocked!</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Sign Out Button */}
      <div className="flex justify-center pt-4">
        <button className="px-6 py-3 bg-destructive/10 text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/20 transition-colors font-semibold">
          Sign Out
        </button>
      </div>
    </div>
  )
}
