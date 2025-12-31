"use client"
import { useState, useRef, memo, useEffect } from "react"
import { StatsSection } from "@/components/stats-section"
import { ComingSoonBanner } from "@/components/coming-soon-banner"
import { GoalsGallery } from "@/components/goals-gallery"
import { GoalsList } from "@/components/goals-list"
import { GoalDetailDrawer } from "@/components/goal-detail-drawer"
import { GoalsInsights } from "@/components/goals-insights"
import { MotivationalBanner } from "@/components/motivational-banner"
import ZenModePage from "@/components/zen-mode-page"
import TasksPage from "@/app/tasks/page"
import ProfilePage from "@/app/profile/page"
import TalkToQPage from "@/app/talk-to-q/page"
import LeaderboardPage from "../leaderboard/page"
import RewardsPage from "@/app/rewards/page"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { XpToast } from "@/components/xp-toast"
import { LevelUpCelebration } from "@/components/level-up-celebration"
import { getLevelInfo } from "@/lib/leveling-system"
import { Menu } from "lucide-react"
import {
  Target,
  CheckSquare,
  Trophy,
  Zap,
  User,
  Gift,
  MessageSquare,
  Users,
  LogOut,
  Calendar,
  X,
  Timer,
  Bug,
  HelpCircle,
} from "lucide-react"
import { WeeklyXPChart } from "@/components/weekly-xp-chart"
import { useDataRefresh } from "@/contexts/data-refresh-context" // Import data refresh context
import { StatPolygon } from "@/components/stat-polygon"
import { ActivityHeatmap } from "@/components/activity-heatmap"
import { StreakDisplay } from "@/components/streak-display" // Import StreakDisplay component
import { SoundEffects } from "@/lib/sound-effects" // Added sound effects import
import { PhilosophyGate } from "@/components/philosophy-gate"

type PageType =
  | "dashboard"
  | "goals"
  | "tasks"
  | "leaderboard"
  | "zen-mode"
  | "talk-to-q"
  | "community"
  | "profile"
  | "rewards"

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

export default function DashboardPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const { refreshTrigger, triggerRefresh } = useDataRefresh() // Use refresh trigger to refetch data

  const [showPhilosophyGate, setShowPhilosophyGate] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/")
      } else {
        setUser(user)
        setIsLoadingUser(false)

        const { data: profile } = await supabase
          .from("profiles")
          .select("has_seen_philosophy_gate")
          .eq("user_id", user.id)
          .maybeSingle()

        if (profile && !profile.has_seen_philosophy_gate) {
          setShowPhilosophyGate(true)
        }
      }
    }
    checkAuth()
  }, [router, supabase])

  const handleClosePhilosophyGate = async () => {
    if (user) {
      await supabase.from("profiles").update({ has_seen_philosophy_gate: true }).eq("user_id", user.id)
    }
    setShowPhilosophyGate(false)
  }

  const [tasks, setTasks] = useState<any[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [zenModeTaskId, setZenModeTaskId] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement>(null)
  const [xpToastData, setXpToastData] = useState({ xp: 0, message: "" })
  const [showXPToast, setShowXPToast] = useState(false)
  const [newLevel, setNewLevel] = useState<number | null>(null)
  const [showLevelUp, setShowLevelUp] = useState(false)

  const [profileData, setProfileData] = useState<any>(null)
  const [profileStats, setProfileStats] = useState<any>(null)
  const [polygonStats, setPolygonStats] = useState({
    focus: 0,
    consistency: 0,
    volume: 0,
    wealth: 0,
    level: 1,
  })
  const [activityData, setActivityData] = useState<{ date: string; count: number }[]>([])
  const [streak, setStreak] = useState<number | null>(null) // State for streak

  const [selectedTask, setSelectedTask] = useState<any | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [guideActiveTab, setGuideActiveTab] = useState("overview")

  const fetchTodaysTasks = async (userId: string) => {
    setLoadingTasks(true)
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .gte("due_date", today)
      .lte("due_date", today + "T23:59:59")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setTasks(data)
    }
    setLoadingTasks(false)
  }

  const setTodaysTasks = setTasks // Alias for optimistic UI update

  useEffect(() => {
    fetchProfileData()
    // Fetch polygon stats and activity data on refresh trigger
    fetchPolygonStats()
    fetchActivityData()
  }, [refreshTrigger]) // Add refreshTrigger dependency

  const fetchProfileData = async () => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: profileData } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle()

    if (profileData) {
      setProfileData(profileData)
    }

    const { data: goalsData } = await supabase
      .from("goals")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "completed")

    const { data: tasksData } = await supabase.from("tasks").select("id").eq("user_id", user.id).eq("completed", true)

    const { data: streakData } = await supabase
      .from("streaks")
      .select("current_streak")
      .eq("user_id", user.id)
      .maybeSingle()

    setStreak(streakData?.current_streak || null) // Update streak state

    setProfileStats({
      goalsCompleted: goalsData?.length || 0,
      tasksFinished: tasksData?.length || 0,
      currentStreak: streakData?.current_streak || 0,
      totalXP: profileData?.total_xp || 0,
    })
  }

  const fetchPolygonStats = async () => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // Fetch profile data
    const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle()

    // Fetch streak data
    const { data: streak } = await supabase
      .from("streaks")
      .select("current_streak")
      .eq("user_id", user.id)
      .maybeSingle()

    // Fetch completed tasks count
    const { count: completedTasksCount } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", true)

    setPolygonStats({
      focus: profile?.zen_minutes || 0,
      consistency: streak?.current_streak || 0,
      volume: completedTasksCount || 0,
      wealth: profile?.aura || 0,
      level: profile?.level || 1,
    })
  }

  const fetchActivityData = async () => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // Fetch completed tasks from last 365 days with their completion date and XP
    const oneYearAgo = new Date()
    oneYearAgo.setDate(oneYearAgo.getDate() - 365)

    const { data: completedTasks } = await supabase
      .from("tasks")
      .select("completed_at, xp")
      .eq("user_id", user.id)
      .eq("completed", true)
      .gte("completed_at", oneYearAgo.toISOString())
      .order("completed_at", { ascending: false })

    if (completedTasks) {
      // Group by date and sum XP
      const activityMap = new Map<string, number>()

      completedTasks.forEach((task) => {
        if (task.completed_at) {
          const date = new Date(task.completed_at).toISOString().split("T")[0]
          const currentXP = activityMap.get(date) || 0
          activityMap.set(date, currentXP + (task.xp || 0))
        }
      })

      const activityArray = Array.from(activityMap.entries()).map(([date, count]) => ({
        date,
        count,
      }))

      setActivityData(activityArray)
    }
  }

  useEffect(() => {
    const initTasks = async () => {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await fetchTodaysTasks(user.id)
      }
    }
    initTasks()
  }, [refreshTrigger]) // Add refreshTrigger dependency

  const handleCreateTask = async (newTask: any) => {
    if (!user) return

    let dueDate = null
    if (newTask.when === "today") {
      dueDate = new Date().toISOString()
    } else if (newTask.when === "this-week") {
      const threeDaysFromNow = new Date()
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
      dueDate = threeDaysFromNow.toISOString()
    }

    const { error } = await supabase.from("tasks").insert({
      user_id: user.id,
      title: newTask.name,
      description: newTask.description,
      priority: newTask.priority,
      xp: 3,
      due_date: dueDate,
      goal_id: newTask.linkedGoal || null,
      category: newTask.tags?.join(",") || null,
      completed: false,
      status: "active",
    })

    if (!error) {
      fetchTodaysTasks(user.id)
    }
  }

  const toggleComplete = async (id: string, currentState: boolean) => {
    if (!user) return

    const newState = !currentState

    if (newState) {
      setTodaysTasks((prevTasks) => prevTasks.filter((t) => t.id !== id))
    }

    const { error } = await supabase
      .from("tasks")
      .update({
        completed: newState,
        completed_at: newState ? new Date().toISOString() : null,
        status: newState ? "completed" : "active",
      })
      .eq("id", id)

    if (!error && newState) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_xp, current_xp, level, xp_to_next_level")
        .eq("user_id", user.id)
        .maybeSingle()

      if (profile) {
        SoundEffects.xpGain()

        setXpToastData({
          xp: 3,
          message: "Task completed!",
        })
        setShowXPToast(true)
        setTimeout(() => setShowXPToast(false), 3000)

        console.log("[v0] Task completed - Profile XP:", profile.current_xp, "/", profile.xp_to_next_level)
      }

      fetchTodaysTasks(user.id)
    } else if (error) {
      fetchTodaysTasks(user.id)
    }

    await fetchProfileData()
    // Trigger refresh for polygon stats and activity data as well
    triggerRefresh() // Trigger global refresh after task completion
    fetchPolygonStats()
    fetchActivityData()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const [currentPage, setCurrentPage] = useState<PageType>("dashboard")
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [isGoalDetailOpen, setIsGoalDetailOpen] = useState(false)
  const goalDetails: Record<string, any> = {}

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <>
            <div className="mb-8 flex items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <img src="/ui/mascot.png" alt="Quiet Room Mascot" className="w-24 h-24 object-contain" />
                  <div>
                    <h2 className="text-4xl font-bold text-primary mb-2">Welcome Back!</h2>
                    <p className="text-muted-foreground">Complete tasks to earn XP and level up</p>
                  </div>
                </div>
              </div>
            </div>

            <StatsSection />
            <WeeklyXPChart />

            <div className="space-y-6">
              {/* Ability Hexagon */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-xs font-bold text-gray-400 tracking-widest mb-4">ABILITY HEXAGON</h3>
                <StatPolygon stats={polygonStats} />

                {/* Stats Grid Below Polygon */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 font-mono tracking-wider mb-1">ZEN MINUTES</p>
                    <p className="text-lg font-bold text-blue-400">{polygonStats.focus}m</p>
                  </div>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 font-mono tracking-wider mb-1">STREAK</p>
                    <p className="text-lg font-bold text-orange-400">{polygonStats.consistency} Days</p>
                  </div>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 font-mono tracking-wider mb-1">WEALTH</p>
                    <p className="text-lg font-bold text-yellow-400">{polygonStats.wealth} Aura</p>
                  </div>
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 font-mono tracking-wider mb-1">CLEARED</p>
                    <p className="text-lg font-bold text-pink-400">{polygonStats.volume} Tasks</p>
                  </div>
                </div>
              </div>

              {/* Activity Heatmap */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-xs font-bold text-gray-400 tracking-widest mb-4">ACTIVITY HEATMAP</h3>
                <ActivityHeatmap data={activityData} />
              </div>
            </div>
          </>
        )
      case "goals":
        return (
          <>
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-primary mb-2">Your Goals</h2>
              <p className="text-muted-foreground">Track your progress toward meaningful achievements</p>
            </div>
            <GoalsGallery onGoalSelect={handleGoalSelect} />
            <GoalsList onGoalSelect={handleGoalSelect} />
            <GoalsInsights />
            <div className="mt-12 mb-8">
              <MotivationalBanner />
            </div>
            <GoalDetailDrawer
              goal={selectedGoalId ? goalDetails[selectedGoalId] : null}
              isOpen={isGoalDetailOpen}
              onClose={() => setIsGoalDetailOpen(false)}
            />
          </>
        )
      case "tasks":
        return (
          <TasksPage
            onNavigateToZen={(taskId) => {
              setZenModeTaskId(taskId)
              setCurrentPage("zen-mode")
            }}
            onTaskSelect={(task) => setSelectedTask(task)}
          />
        )
      case "zen-mode":
        return <ZenModePage taskId={zenModeTaskId} onNavigateToQ={() => setCurrentPage("talk-to-q")} />
      case "talk-to-q":
        return <TalkToQPage />
      case "leaderboard":
        return <LeaderboardPage />
      case "community":
        return <ComingSoonBanner />
      case "profile":
        return <ProfilePage profileData={profileData} profileStats={profileStats} />
      case "rewards":
        return <RewardsPage />
      default:
        return (
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-primary mb-2 capitalize">{currentPage}</h2>
            <p className="text-muted-foreground">This page is coming soon...</p>
          </div>
        )
    }
  }

  const handlePageChange = (page: PageType) => {
    setCurrentPage(page)
    audioRef.current?.play().catch(() => {})
  }

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoalId(goalId)
    setIsGoalDetailOpen(true)
  }

  const handleFocusTask = (taskId: string) => {
    setZenModeTaskId(taskId)
    setCurrentPage("zen-mode")
  }

  const userLevel = profileData?.level || 18
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Player"
  const userClass = getLevelInfo(userLevel).name

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Zap },
    { id: "goals", label: "Goals", icon: Target },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "zen-mode", label: "Zen Mode", icon: Timer },
  ] as const

  const communityItems = [
    { id: "talk-to-q", label: "Talk to Q", icon: MessageSquare },
    { id: "community", label: "Community", icon: Users },
  ] as const

  const userItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "rewards", label: "Rewards", icon: Gift },
  ] as const

  useEffect(() => {
    if (user && currentPage === "dashboard") {
      fetchTodaysTasks(user.id)
    }
  }, [user, currentPage])

  if (isLoadingUser) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dark">
      <audio ref={audioRef} src="/images/menu.mp3" preload="auto" />

      {showPhilosophyGate && <PhilosophyGate onClose={handleClosePhilosophyGate} />}

      <div className="flex h-screen bg-background text-foreground">
        <aside className="hidden md:flex w-56 bg-sidebar border-r border-sidebar-border flex-col">
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                <img src="/ui/new-logo.png" alt="Quiet Room" className="w-8 h-8 object-contain" />
              </div>
              <h1 className="text-lg font-bold text-sidebar-foreground">
                Quiet Room{" "}
                <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-medium">
                  Beta
                </span>
              </h1>
            </div>
            <p className="text-xs text-muted-foreground ml-10">Turn focus into XP</p>
          </div>
          <nav className="flex-1 overflow-y-auto">
            <div className="p-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Main</h2>
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    isActive={currentPage === item.id}
                    onClick={() => handlePageChange(item.id as PageType)}
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
                    isActive={currentPage === item.id}
                    onClick={() => handlePageChange(item.id as PageType)}
                  />
                ))}
              </ul>
            </div>
            <div className="p-3 mt-auto border-t border-sidebar-border">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">You</h2>
              <ul className="space-y-1">
                {userItems.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    isActive={currentPage === item.id}
                    onClick={() => handlePageChange(item.id as PageType)}
                  />
                ))}
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

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <aside
              className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img src="/ui/new-logo.png" alt="Quiet Room" className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-sidebar-foreground">Quiet Room</h1>
                    <p className="text-xs text-muted-foreground">Turn focus into XP</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto">
                <div className="p-3">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                    Main
                  </h2>
                  <ul className="space-y-1">
                    {navItems.map((item) => (
                      <NavItem
                        key={item.id}
                        item={item}
                        isActive={currentPage === item.id}
                        onClick={() => {
                          handlePageChange(item.id as PageType)
                          setIsMobileMenuOpen(false)
                        }}
                      />
                    ))}
                  </ul>
                </div>
                <div className="p-3 border-t border-sidebar-border">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                    Social
                  </h2>
                  <ul className="space-y-1">
                    {communityItems.map((item) => (
                      <NavItem
                        key={item.id}
                        item={item}
                        isActive={currentPage === item.id}
                        onClick={() => {
                          handlePageChange(item.id as PageType)
                          setIsMobileMenuOpen(false)
                        }}
                      />
                    ))}
                  </ul>
                </div>
                <div className="p-3 mt-auto border-t border-sidebar-border">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                    You
                  </h2>
                  <ul className="space-y-1">
                    {userItems.map((item) => (
                      <NavItem
                        key={item.id}
                        item={item}
                        isActive={currentPage === item.id}
                        onClick={() => {
                          handlePageChange(item.id as PageType)
                          setIsMobileMenuOpen(false)
                        }}
                      />
                    ))}
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
          </div>
        )}

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="fixed inset-0 bg-background pointer-events-none -z-10" />
          <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 border-b border-border bg-card">
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {user && <StreakDisplay userId={user.id} />}
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => window.open("https://wa.me/917219287449", "_blank")}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm text-muted-foreground hover:text-foreground"
                aria-label="Bug/Feedback"
              >
                <Bug className="w-4 h-4" />
                <span>Bug/Feedback</span>
              </button>
              <button
                onClick={() => setShowGuideModal(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm text-muted-foreground hover:text-foreground"
                aria-label="Guide"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Guide</span>
              </button>
              <button
                onClick={() => window.open("https://wa.me/917219287449", "_blank")}
                className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label="Bug/Feedback"
              >
                <Bug className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                onClick={() => setShowGuideModal(true)}
                className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label="Guide"
              >
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
              </button>
              <div className="hidden md:flex items-center gap-3 ml-4 pl-4 border-l border-border">
                <div className="text-right">
                  <p className="font-semibold text-foreground text-sm">{userName}</p>
                  <p className="text-xs text-muted-foreground">
                    Level {userLevel} • {userClass}
                  </p>
                </div>
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url || "/placeholder.svg"}
                    alt={userName}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground">
                    {userLevel}
                  </div>
                )}
              </div>
              <div className="md:hidden">
                {user?.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url || "/placeholder.svg"}
                    alt={userName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm">
                    {userLevel}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-8">{renderContent()}</div>
        </main>
        {showXPToast && <XpToast xpAmount={xpToastData.xp} message={xpToastData.message} />}
        {showLevelUp && <LevelUpCelebration level={newLevel} />}

        {showGuideModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl shadow-primary/20 flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
              <div>
                <h2 className="text-2xl font-bold text-foreground">How Quiet Room Works</h2>
                <p className="text-sm text-muted-foreground mt-1">A system for focus, honesty, and earned freedom.</p>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Close guide"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/20 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-primary/80 [&::-webkit-scrollbar-thumb]:transition-colors">
              {/* Section 1 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary font-bold text-sm border border-primary/40">
                    1
                  </span>
                  What Quiet Room Is (and is not)
                </h3>
                <p className="text-foreground leading-relaxed">Quiet Room is not a to-do app.</p>
                <ul className="space-y-2 text-muted-foreground ml-6">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>It doesn't reward activity.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>It rewards honest focus.</span>
                  </li>
                </ul>
                <p className="text-muted-foreground italic">Checking boxes gives almost nothing</p>
                <p className="text-foreground font-semibold">Time spent focused gives everything</p>
                <p className="text-sm text-muted-foreground/80 pt-2">Read this once. Then act.</p>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary font-bold text-sm border border-primary/40">
                    2
                  </span>
                  The Core Loop (this is the heart)
                </h3>
                <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-3">
                  <p className="text-foreground font-bold text-center">Focus → XP → Aura → Freedom</p>
                </div>
                <div className="space-y-2 ml-4">
                  <div>
                    <p className="text-foreground font-semibold">Focus builds XP</p>
                    <p className="text-muted-foreground text-sm">XP grows only when you stay in Zen Mode.</p>
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">Consistency builds Aura</p>
                    <p className="text-muted-foreground text-sm">Aura represents integrity, not effort.</p>
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">Aura buys freedom</p>
                    <p className="text-muted-foreground text-sm">Rest, fun, indulgence — guilt-free.</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic pt-2">
                  If you understand this, you understand the system.
                </p>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary font-bold text-sm border border-primary/40">
                    3
                  </span>
                  Tasks: Anchors, not rewards
                </h3>
                <p className="text-muted-foreground">Tasks exist to direct focus</p>
                <p className="text-muted-foreground">Tasks give very little XP</p>
                <p className="text-foreground">Real progress happens when a task leads to a focus session</p>
                <div className="bg-muted/50 border border-border rounded-lg px-4 py-3 space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Example:</p>
                  <p className="text-foreground text-sm">"Study DSA" → Start Zen → 25 minutes → XP + Goal progress</p>
                </div>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary font-bold text-sm border border-primary/40">
                    4
                  </span>
                  Goals: Direction, not pressure
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Goals give meaning to effort</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Tasks can be linked to goals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Focus sessions move goal progress forward</span>
                  </li>
                </ul>
                <p className="text-sm text-foreground italic">Progress is measured in time invested, not perfection.</p>
              </section>

              {/* Section 5 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary font-bold text-sm border border-primary/40">
                    5
                  </span>
                  Zen Mode: Where growth happens
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>XP is earned per minute in Zen Mode</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Full XP only if you complete the session</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Giving up still earns partial XP</span>
                  </li>
                </ul>
                <div className="pl-4 border-l-2 border-primary/50 space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Why?</p>
                  <p className="text-foreground text-sm">Effort matters.</p>
                  <p className="text-foreground text-sm font-semibold">Commitment matters more.</p>
                </div>
              </section>

              {/* Section 6 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary font-bold text-sm border border-primary/40">
                    6
                  </span>
                  Honesty & Failure
                </h3>
                <p className="text-muted-foreground">At the end of a session, Quiet Room asks only one thing:</p>
                <p className="text-foreground font-semibold text-center italic">Did you show up honestly?</p>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>No one is watching you</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>There is no punishment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Reflection matters more than streaks</span>
                  </li>
                </ul>
                <p className="text-foreground text-sm">Failure is logged, not judged.</p>
              </section>

              {/* Section 7 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary font-bold text-sm border border-primary/40">
                    7
                  </span>
                  Aura & Rewards
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Aura is earned slowly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Aura is spent intentionally</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Aura buys permission — not cosmetics</span>
                  </li>
                </ul>
                <p className="text-foreground text-sm italic pt-2">You don't grind Aura.</p>
                <p className="text-foreground text-sm font-semibold">You deserve it.</p>
              </section>

              {/* Section 8 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 text-primary font-bold text-sm border border-primary/40">
                    8
                  </span>
                  Leaderboards (optional motivation)
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Rankings are based on XP</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>XP comes from focus, not spam</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Daily Aura rewards are based on rank</span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground italic">Compete only if it helps you.</p>
                <p className="text-sm text-foreground">Quiet Room works without competition.</p>
              </section>

              {/* Closing */}
              <section className="pt-4 pb-2 border-t border-border">
                <p className="text-foreground font-semibold text-center text-lg">
                  You don't need to master Quiet Room.
                </p>
                <p className="text-primary text-center text-xl font-bold mt-2">Just start one focus session.</p>
              </section>
            </div>
          </div>
        </div>
      )}
      </div>
      {selectedTask && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={selectedTask.completed}
                  onChange={() => {
                    toggleComplete(selectedTask.id, selectedTask.completed)
                    setSelectedTask(null)
                  }}
                  className="w-6 h-6 mt-1 rounded border-border cursor-pointer accent-primary flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h2
                    className={`text-2xl font-bold text-foreground mb-2 break-all ${
                      selectedTask.completed ? "line-through" : ""
                    }`}
                  >
                    {selectedTask.title}
                  </h2>
                  {selectedTask.description && (
                    <p className="text-muted-foreground leading-relaxed mb-4 break-words whitespace-pre-wrap">
                      {selectedTask.description}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="ml-4 p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <div
                  className={`px-4 py-2 text-sm font-semibold rounded-full border ${
                    selectedTask.priority === "high" || selectedTask.priority === "urgent"
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : selectedTask.priority === "medium"
                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        : "bg-green-500/20 text-green-400 border-green-500/30"
                  }`}
                >
                  Priority: {selectedTask.priority}
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-white rounded-full shadow-lg flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="font-bold">+{selectedTask.xp || 3} XP</span>
                </div>
                {selectedTask.category && (
                  <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full font-semibold flex items-center gap-2 border border-emerald-500/30">
                    <Zap className="w-4 h-4" />#{selectedTask.category}
                  </div>
                )}
              </div>

              {selectedTask.due_date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Due: {new Date(selectedTask.due_date).toLocaleDateString()}
                </div>
              )}

              {selectedTask.goal_id && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-semibold">Linked to a goal</span>
                </div>
              )}

              {!selectedTask.completed && (
                <button
                  onClick={() => {
                    handleFocusTask(selectedTask.id)
                    setSelectedTask(null)
                  }}
                  className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Zap className="w-5 h-5" />
                  Start Focus Session
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
