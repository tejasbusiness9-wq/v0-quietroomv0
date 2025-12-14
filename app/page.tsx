"use client"

import {
  Bell,
  Settings,
  Search,
  Home,
  Target,
  CheckSquare,
  Trophy,
  Zap,
  User,
  Gift,
  Flame,
  MessageSquare,
  Users,
  LogOut,
} from "lucide-react"
import { useState, useRef, lazy, Suspense, memo, useEffect } from "react"
import { StatsSection } from "@/components/stats-section"
import { ComingSoonBanner } from "@/components/coming-soon-banner"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const GoalsGallery = lazy(() => import("@/components/goals-gallery").then((m) => ({ default: m.GoalsGallery })))
const GoalsList = lazy(() => import("@/components/goals-list").then((m) => ({ default: m.GoalsList })))
const GoalDetailDrawer = lazy(() =>
  import("@/components/goal-detail-drawer").then((m) => ({ default: m.GoalDetailDrawer })),
)
const GoalsInsights = lazy(() => import("@/components/goals-insights").then((m) => ({ default: m.GoalsInsights })))
const MotivationalBanner = lazy(() =>
  import("@/components/motivational-banner").then((m) => ({ default: m.MotivationalBanner })),
)
const MascotWithDock = lazy(() => import("@/components/mascot-with-dock").then((m) => ({ default: m.MascotWithDock })))
const ZenModePage = lazy(() => import("@/components/zen-mode-page").then((m) => ({ default: m.default })))
const TasksPage = lazy(() => import("@/app/tasks/page"))
const ProfilePage = lazy(() => import("@/app/profile/page"))

type PageType = "dashboard" | "goals" | "tasks" | "leaderboard" | "zen-mode" | "talk-to-q" | "community" | "profile"

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

export default function Page() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setIsLoadingUser(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const [currentPage, setCurrentPage] = useState<PageType>("dashboard")
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [isGoalDetailOpen, setIsGoalDetailOpen] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handlePageChange = (page: PageType) => {
    if (page === "talk-to-q") {
      router.push("/talk-to-q")
      return
    }
    setCurrentPage(page)
    audioRef.current?.play().catch(() => {})
  }

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoalId(goalId)
    setIsGoalDetailOpen(true)
  }

  const [tasks] = useState([
    {
      id: 1,
      title: "Complete project proposal",
      priority: "high",
      category: "Work",
      streak: 3,
      xp: 50,
      completed: false,
    },
    {
      id: 2,
      title: "Review code for feature X",
      priority: "medium",
      category: "Development",
      streak: 0,
      xp: 30,
      completed: false,
    },
  ])

  const userLevel = 18
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Player"
  const userClass = "Arcane Builder"

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "goals", label: "Goals", icon: Target },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "zen-mode", label: "Zen Mode", icon: Zap },
  ] as const

  const communityItems = [
    { id: "talk-to-q", label: "Talk to Q", icon: MessageSquare },
    { id: "community", label: "Community", icon: Users },
  ] as const

  const goalDetails: Record<string, any> = {
    m1: {
      id: "m1",
      title: "UI/UX Case Study",
      description: "Create a comprehensive case study showcasing your UI/UX design process for a real-world project.",
      image: "/design-portfolio-case-study.jpg",
      motivation: "Building a strong portfolio piece will help me land better design opportunities.",
      milestones: [
        { id: "ms1", title: "Research and planning", completed: true, xp: 100 },
        { id: "ms2", title: "Wireframes and sketches", completed: true, xp: 150 },
        { id: "ms3", title: "High-fidelity designs", completed: false, xp: 200 },
        { id: "ms4", title: "Write case study", completed: false, xp: 200 },
      ],
      linkedTasks: [
        { id: "t1", title: "Create user personas", category: "Design", completed: true },
        { id: "t2", title: "Build prototype", category: "Design", completed: false },
      ],
      progress: 65,
      xp: 650,
      maxXp: 1000,
      timeline: "monthly",
    },
  }

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <>
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-primary mb-2">Task Dashboard</h2>
              <p className="text-muted-foreground">Complete tasks to earn XP and level up</p>
            </div>
            <StatsSection />
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-foreground">Today's Quests</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                  <span>+</span> New Task
                </button>
              </div>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <input type="checkbox" className="w-5 h-5 rounded border-border cursor-pointer accent-primary" />
                      <div>
                        <h4 className="font-semibold text-foreground">{task.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              task.priority === "high"
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="text-xs text-muted-foreground">{task.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {task.streak > 0 && (
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-400" />
                          <span className="text-sm text-orange-400 font-semibold">{task.streak} day streak</span>
                        </div>
                      )}
                      <span className="text-lg font-bold text-primary">+{task.xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )
      case "goals":
        return (
          <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
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
          </Suspense>
        )
      case "tasks":
        return (
          <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
            <TasksPage />
          </Suspense>
        )
      case "zen-mode":
        return (
          <Suspense fallback={<div className="text-center py-12">Loading Zen Mode...</div>}>
            <ZenModePage />
          </Suspense>
        )
      case "community":
        return <ComingSoonBanner />
      case "profile":
        return (
          <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
            <ProfilePage />
          </Suspense>
        )
      default:
        return (
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-primary mb-2 capitalize">{currentPage}</h2>
            <p className="text-muted-foreground">This page is coming soon...</p>
          </div>
        )
    }
  }

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
      <audio ref={audioRef} src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/menu-l7V13Z8R8pyT6h06SrSmc79hFaau71.mp3" preload="auto" />

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
                <li>
                  <button
                    onClick={() => handlePageChange("profile")}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentPage === "profile"
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
          <div className="bg-background border-b border-border px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Home className="w-5 h-5" />
              </button>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search goals, tasks, or players..."
                  className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
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

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto px-8 py-8">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}
