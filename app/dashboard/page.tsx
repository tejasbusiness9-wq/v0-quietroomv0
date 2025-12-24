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
import { TaskCreationModal } from "@/components/task-creation-modal"
import { XpToast } from "@/components/xp-toast"
import { LevelUpCelebration } from "@/components/level-up-celebration"
import { getLevelInfo } from "@/lib/leveling-system"
import {
  Settings,
  Search,
  Target,
  CheckSquare,
  Trophy,
  Zap,
  User,
  Gift,
  MessageSquare,
  Users,
  LogOut,
  Plus,
  Calendar,
  X,
  Timer,
} from "lucide-react"

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

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/")
      } else {
        setIsLoadingUser(false)
      }
    }
    checkAuth()
  }, [router, supabase])

  const [tasks, setTasks] = useState<any[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [zenModeTaskId, setZenModeTaskId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [xpToastData, setXpToastData] = useState({ xp: 0, message: "" })
  const [showXPToast, setShowXPToast] = useState(false)
  const [newLevel, setNewLevel] = useState<number | null>(null)
  const [showLevelUp, setShowLevelUp] = useState(false)

  const [profileData, setProfileData] = useState<any>(null)
  const [profileStats, setProfileStats] = useState<any>(null)
  const [selectedTask, setSelectedTask] = useState<any | null>(null)

  useEffect(() => {
    fetchProfileData()
  }, [])

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

    setProfileStats({
      goalsCompleted: goalsData?.length || 0,
      tasksFinished: tasksData?.length || 0,
      currentStreak: streakData?.current_streak || 0,
      totalXP: profileData?.total_xp || 0,
    })
  }

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    timeoutId = setTimeout(() => {
      if (isLoadingUser) {
        console.error("[v0] Auth initialization timeout - forcing load")
        setIsLoadingUser(false)
      }
    }, 5000)

    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error("[v0] Auth error:", error)
      }

      setUser(user)
      setIsLoadingUser(false)
      clearTimeout(timeoutId)

      if (user) {
        fetchTodaysTasks(user.id)
      }
    }

    fetchUser().catch((error) => {
      console.error("[v0] Auth fetch failed:", error)
      setIsLoadingUser(false)
      clearTimeout(timeoutId)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchTodaysTasks(session.user.id)
      }
    })

    return () => {
      subscription.unsubscribe()
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [supabase])

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

  const toggleTaskComplete = async (taskId: string, currentState: boolean) => {
    if (!user) return

    const newState = !currentState

    const { error } = await supabase
      .from("tasks")
      .update({
        completed: newState,
        completed_at: newState ? new Date().toISOString() : null,
        status: newState ? "completed" : "active",
      })
      .eq("id", taskId)

    if (!error && newState) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_xp, current_xp, level, xp_to_next_level")
        .eq("user_id", user.id)
        .maybeSingle()

      if (profile) {
        setXpToastData({
          xp: 3,
          message: "Task completed!",
        })
        setShowXPToast(true)
        setTimeout(() => setShowXPToast(false), 3000)

        console.log("[v0] Task completed - Profile XP:", profile.current_xp, "/", profile.xp_to_next_level)
      }

      fetchTodaysTasks(user.id)
    }

    await fetchProfileData()
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
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-foreground">Today's Quests</h3>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  <Plus className="w-5 h-5" /> New Task
                </button>
              </div>
              {loadingTasks ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Zap className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
                  <p>Loading your quests...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="relative inline-block">
                    <Calendar className="w-20 h-20 text-muted-foreground/30 animate-bounce" />
                    <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-foreground mb-2">No quests for today</h4>
                    <p className="text-muted-foreground mb-4">Create your first task and start earning XP!</p>
                    <button
                      onClick={() => setIsTaskModalOpen(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105 font-semibold"
                    >
                      <Plus className="w-5 h-5" />
                      Create Your First Quest
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`bg-card border border-border rounded-xl p-4 transition-all hover:border-primary/50 cursor-pointer ${
                        task.completed ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={(e) => {
                              e.stopPropagation()
                              toggleTaskComplete(task.id, task.completed)
                            }}
                            className="w-5 h-5 mt-1 rounded border-border cursor-pointer accent-primary flex-shrink-0"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-semibold text-foreground mb-2 break-words ${
                              task.completed ? "line-through" : ""
                            }`}
                          >
                            {task.title.length > 30 ? `${task.title.slice(0, 30)}...` : task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-2 break-words">
                              {task.description.length > 30 ? `${task.description.slice(0, 30)}...` : task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                                task.priority === "high" || task.priority === "urgent"
                                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                                  : task.priority === "medium"
                                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                    : "bg-green-500/20 text-green-400 border-green-500/30"
                              }`}
                            >
                              {task.priority}
                            </span>
                            <span className="relative px-3 py-1.5 text-sm font-bold bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-white rounded-full shadow-lg shadow-yellow-500/50 flex items-center gap-1 overflow-hidden">
                              <span
                                className="absolute inset-0 rounded-full border-2 border-transparent animate-snake-border"
                                style={{
                                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
                                  backgroundSize: "200% 100%",
                                }}
                              ></span>
                              <Zap className="w-4 h-4 relative z-10" />
                              <span className="relative z-10">+{task.xp || 3} XP</span>
                            </span>
                            {task.category && (
                              <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-full font-semibold flex items-center gap-1 border border-emerald-500/30 shadow-sm">
                                <Zap className="w-3 h-3" />#{task.category}
                              </span>
                            )}
                            {task.goal_id && (
                              <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-full flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                Linked to goal
                              </span>
                            )}
                          </div>
                        </div>
                        {!task.completed && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setZenModeTaskId(task.id)
                              setCurrentPage("zen-mode")
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                          >
                            <Zap className="w-4 h-4" />
                            Focus Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <TaskCreationModal
              isOpen={isTaskModalOpen}
              onClose={() => setIsTaskModalOpen(false)}
              onCreateTask={handleCreateTask}
            />
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

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (query.trim().length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    if (!user) {
      setIsSearching(false)
      return
    }

    try {
      const [tasksRes, goalsRes, profilesRes] = await Promise.all([
        supabase
          .from("tasks")
          .select("id, title, description, priority")
          .eq("user_id", user.id)
          .ilike("title", `%${query}%`)
          .limit(5),
        supabase
          .from("goals")
          .select("id, title, description, category")
          .eq("user_id", user.id)
          .ilike("title", `%${query}%`)
          .limit(5),
        supabase
          .from("profiles")
          .select("id, username, display_name, level")
          .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
          .limit(5),
      ])

      const results = [
        ...(tasksRes.data || []).map((t) => ({ ...t, type: "task" })),
        ...(goalsRes.data || []).map((g) => ({ ...g, type: "goal" })),
        ...(profilesRes.data || []).map((p) => ({ ...p, type: "profile" })),
      ]

      setSearchResults(results)
    } catch (error) {
      console.error("[v0] Search error:", error)
    } finally {
      setIsSearching(false)
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

      <div className="flex h-screen bg-background text-foreground">
        <aside className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col">
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                <img src="/ui/logo.png" alt="Quiet Room" className="w-8 h-8 object-contain" />
              </div>
              <h1 className="text-lg font-bold text-sidebar-foreground">Quiet Room</h1>
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
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-background border-b border-border px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search goals, tasks, or players..."
                  className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {searchQuery && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-3 hover:bg-muted/50 cursor-pointer border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          {result.type === "task" && <CheckSquare className="w-4 h-4 text-primary" />}
                          {result.type === "goal" && <Target className="w-4 h-4 text-accent" />}
                          {result.type === "profile" && <User className="w-4 h-4 text-muted-foreground" />}
                          <div className="flex-1">
                            <p className="font-semibold text-sm">
                              {result.title || result.username || result.display_name}
                            </p>
                            {result.description && (
                              <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground capitalize">{result.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border">
                <div className="text-right">
                  <p className="font-semibold text-foreground">{userName}</p>
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
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-8 py-8">{renderContent()}</div>
        </main>
        {showXPToast && <XpToast xp={xpToastData.xp} message={xpToastData.message} />}
        {showLevelUp && <LevelUpCelebration level={newLevel} />}
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
                    toggleTaskComplete(selectedTask.id, selectedTask.completed)
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
