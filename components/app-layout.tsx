"use client"

import type React from "react"
import { memo, useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Home,
  Target,
  CheckSquare,
  Trophy,
  Zap,
  User,
  Gift,
  MessageSquare,
  Users,
  LogOut,
  Bug,
  HelpCircle,
} from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { getLevelInfo } from "@/lib/leveling-system"
import { Button } from "@/components/ui/button"

const NavItem = memo(({ item, isActive, onClick }: any) => {
  const Icon = item.icon
  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 relative overflow-hidden group ${
          isActive ? "nav-item-active" : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
        }`}
      >
        {isActive && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-lg"></div>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/0 via-primary to-primary/0"></div>
          </>
        )}
        <Icon className="w-5 h-5 flex-shrink-0 relative z-10" />
        <span className="text-sm font-medium relative z-10">{item.label}</span>
      </button>
    </li>
  )
})

NavItem.displayName = "NavItem"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<{
    level: number
    display_name: string | null
    username: string | null
    current_streak: number | null
  } | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = getSupabaseBrowserClient()
  const audioRef = useRef<HTMLAudioElement>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const [showGuideModal, setShowGuideModal] = useState(false)
  const [activeGuideTab, setActiveGuideTab] = useState("Overview")

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase
          .from("profiles")
          .select("level, display_name, username, current_streak")
          .eq("user_id", user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              setProfile(data)
            }
          })
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .from("profiles")
          .select("level, display_name, username, current_streak")
          .eq("user_id", session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data) {
              setProfile(data)
            }
          })
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery)
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleSearch = async (query: string) => {
    if (!user) return

    setSearchLoading(true)
    const supabase = getSupabaseBrowserClient()

    // Search tasks
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, title, description")
      .eq("user_id", user.id)
      .ilike("title", `%${query}%`)
      .limit(5)

    // Search goals
    const { data: goals } = await supabase
      .from("goals")
      .select("id, title, description")
      .eq("user_id", user.id)
      .ilike("title", `%${query}%`)
      .limit(5)

    // Search profiles (other users)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, username")
      .or(`display_name.ilike.%${query}%,username.ilike.%${query}%`)
      .limit(5)

    setSearchResults([
      ...(tasks || []).map((t: any) => ({ ...t, type: "task" })),
      ...(goals || []).map((g: any) => ({ ...g, type: "goal" })),
      ...(profiles || []).map((p: any) => ({ ...p, type: "profile" })),
    ])
    setShowSearchResults(true)
    setSearchLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    audioRef.current?.play().catch(() => {})
  }

  const userLevel = profile?.level || 1
  const userName =
    profile?.display_name ||
    profile?.username ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Player"
  const userClass = getLevelInfo(userLevel).name
  const currentStreak = profile?.current_streak || 0

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/" },
    { id: "goals", label: "Goals", icon: Target, path: "/goals" },
    { id: "tasks", label: "Tasks", icon: CheckSquare, path: "/tasks" },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
    { id: "zen-mode", label: "Zen Mode", icon: Zap, path: "/zen-mode" },
  ]

  const communityItems = [
    { id: "talk-to-q", label: "Talk to Q", icon: MessageSquare, path: "/talk-to-q" },
    { id: "community", label: "Community", icon: Users, path: "/community" },
  ]

  const guideTabs = ["Overview", "Goals", "Tasks", "Zen", "Q AI", "XP", "Aura System", "Leaderboard"]

  const guideContent: Record<string, { title: string; description: string; features: string[] }> = {
    Overview: {
      title: "Welcome to Quiet Room",
      description:
        "Your personal productivity companion that gamifies focus and goal achievement. Transform your daily tasks into an RPG-like experience.",
      features: [
        "Level up by completing tasks and maintaining focus streaks",
        "Earn XP and Aura to unlock rewards",
        "Compete with friends on the leaderboard",
        "Chat with Q, your AI productivity coach",
      ],
    },
    Goals: {
      title: "Goals System",
      description:
        "Set and track your long-term objectives with weekly, monthly, and yearly goals. Stay aligned with your vision.",
      features: [
        "Create goals with specific timelines (weekly, monthly, yearly)",
        "Track progress with visual indicators",
        "Break down big goals into actionable milestones",
        "Earn bonus XP when you complete goals on time",
      ],
    },
    Tasks: {
      title: "Tasks Management",
      description:
        "Organize your daily work with smart task tracking. Every completed task brings you closer to your goals.",
      features: [
        "Create tasks with due dates and priorities",
        "Active and Overdue task views",
        "Streak resets if overdue tasks exist at midnight",
        "Earn XP for each completed task",
      ],
    },
    Zen: {
      title: "Zen Mode",
      description:
        "Enter deep focus sessions with our distraction-free Zen Mode. Lock in, eliminate noise, and maximize productivity.",
      features: [
        "Fullscreen focus timer with ambient backgrounds",
        "Earn 2x XP during Zen Mode sessions",
        "Choose from pre-set durations or custom times",
        "Give up penalty: Lose XP and Aura if you quit early",
      ],
    },
    "Q AI": {
      title: "Talk to Q",
      description:
        "Your personal AI productivity coach. Q provides guidance, motivation, and accountability to help you crush your goals.",
      features: [
        "Get personalized advice on productivity challenges",
        "Discuss goals, tasks, and strategies",
        "Receive motivational support when you need it",
        "AI-powered insights based on your progress",
      ],
    },
    XP: {
      title: "XP System",
      description:
        "Gain experience points by completing tasks, achieving goals, and maintaining focus streaks. Level up to unlock new ranks.",
      features: [
        "Earn XP: Tasks (+10), Goals (+50), Zen Mode (2x multiplier)",
        "Level progression unlocks new class titles",
        "Track daily, weekly, and monthly XP gains",
        "Your XP reflects your productivity consistency",
      ],
    },
    "Aura System": {
      title: "Aura Currency",
      description:
        "Aura is your in-app currency earned through consistent productivity. Spend it on rewards and custom permissions.",
      features: [
        "Earn Aura by completing tasks and goals",
        "Spend on Bounty rewards (breaks, treats, activities)",
        "Purchase Wildcard Permissions for custom rewards",
        "Aura incentivizes sustainable productivity habits",
      ],
    },
    Leaderboard: {
      title: "Leaderboard",
      description: "Compete with other Quiet Room users and see where you rank. Friendly competition fuels motivation.",
      features: [
        "Daily, weekly, and monthly leaderboards",
        "See top performers in your region or globally",
        "Track your rank and progress over time",
        "Celebrate wins and learn from the best",
      ],
    },
  }

  return (
    <div className="dark">
      <audio ref={audioRef} src="/images/menu.mp3" preload="auto" />

      {showGuideModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl shadow-primary/20 flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Quiet Room Guide</h2>
                  <p className="text-sm text-muted-foreground">Learn how to master your productivity</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 px-6 py-4 border-b border-border overflow-x-auto">
              {guideTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveGuideTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeGuideTab === tab
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Video Placeholder */}
                <div className="bg-muted/50 rounded-xl overflow-hidden border border-border aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="text-muted-foreground font-medium">Video Tutorial Coming Soon</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">20-30 second overview of {activeGuideTab}</p>
                  </div>
                </div>

                {/* Info Content */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">{guideContent[activeGuideTab]?.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{guideContent[activeGuideTab]?.description}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                      Key Features
                    </h4>
                    <ul className="space-y-2">
                      {guideContent[activeGuideTab]?.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span className="text-foreground leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen bg-background text-foreground">
        {/* Sidebar */}
        <aside className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col">
          {/* Questboard Header */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold text-sidebar-foreground">Questboard</h1>
            </div>
            <p className="text-xs text-muted-foreground ml-10">Turn focus into XP</p>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 overflow-y-auto">
            <div className="p-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Main</h2>
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    isActive={pathname === item.path && item.id === "dashboard"}
                    onClick={() => handleNavigation(item.path)}
                  />
                ))}
              </ul>
            </div>

            <div className="p-3 border-t border-sidebar-border">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Social</h2>
              <ul className="space-y-1">
                {communityItems.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    isActive={pathname === item.path}
                    onClick={() => handleNavigation(item.path)}
                  />
                ))}
              </ul>
            </div>

            <div className="p-3 mt-auto border-t border-sidebar-border">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">You</h2>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => handleNavigation("/profile")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      pathname === "/profile"
                        ? "nav-item-active"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <User className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Profile</span>
                  </button>
                </li>
                <li>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                    <Gift className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Rewards</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="bg-background border-b border-border px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Streak Badge with Video */}
              <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-6 h-6 md:w-7 md:h-7"
                  style={{ objectFit: "contain" }}
                >
                  <source src="/images/streakflame.webm" type="video/webm" />
                  <span className="text-2xl">🔥</span>
                </video>
                <span className="text-sm font-bold text-foreground">{currentStreak || 0} days</span>
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Bug/Feedback Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  window.open("https://wa.me/917219287449", "_blank")
                }}
                className="text-foreground hover:text-primary hover:bg-primary/10 gap-1.5 md:gap-2 border border-border/50 hover:border-primary/30 transition-all"
              >
                <Bug className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Bug/Feedback</span>
              </Button>

              {/* Guide Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowGuideModal(true)
                }}
                className="text-foreground hover:text-primary hover:bg-primary/10 gap-1.5 md:gap-2 border border-border/50 hover:border-primary/30 transition-all"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Guide</span>
              </Button>

              {/* Profile Section */}
              <div className="flex items-center gap-2 md:gap-3 ml-2 pl-2 md:pl-4 border-l border-border">
                <div className="text-right hidden md:block">
                  <p className="font-semibold text-foreground text-sm">{userName}</p>
                  <p className="text-xs text-muted-foreground">
                    Level {userLevel} • {userClass}
                  </p>
                </div>
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url || "/placeholder.svg"}
                    alt={userName}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-primary/20"
                  />
                ) : (
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm">
                    {userName?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Page Content */}
          {children}
        </main>
      </div>
    </div>
  )
}
