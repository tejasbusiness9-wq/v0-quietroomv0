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
  Settings,
  Search,
} from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { getLevelInfo } from "@/lib/leveling-system"

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

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase
          .from("profiles")
          .select("level, display_name, username")
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
          .select("level, display_name, username")
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

  return (
    <div className="dark">
      <audio ref={audioRef} src="/images/menu.mp3" preload="auto" />

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
          <div className="bg-background border-b border-border px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
                  placeholder="Search goals, tasks, or players..."
                  className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />

                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-2xl shadow-primary/10 max-h-96 overflow-y-auto z-50">
                    {searchLoading ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                        Searching...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">No results found</div>
                    ) : (
                      <div className="py-2">
                        {/* Tasks */}
                        {searchResults.some((r) => r.type === "task") && (
                          <div>
                            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">Tasks</div>
                            {searchResults
                              .filter((r) => r.type === "task")
                              .map((result) => (
                                <button
                                  key={result.id}
                                  onClick={() => {
                                    router.push("/tasks")
                                    setShowSearchResults(false)
                                    setSearchQuery("")
                                  }}
                                  className="w-full px-4 py-2 hover:bg-muted/50 transition-colors text-left flex items-center gap-3"
                                >
                                  <CheckSquare className="w-4 h-4 text-primary" />
                                  <div>
                                    <p className="font-medium text-foreground">{result.title}</p>
                                    {result.description && (
                                      <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                                    )}
                                  </div>
                                </button>
                              ))}
                          </div>
                        )}

                        {/* Goals */}
                        {searchResults.some((r) => r.type === "goal") && (
                          <div>
                            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">Goals</div>
                            {searchResults
                              .filter((r) => r.type === "goal")
                              .map((result) => (
                                <button
                                  key={result.id}
                                  onClick={() => {
                                    router.push("/goals")
                                    setShowSearchResults(false)
                                    setSearchQuery("")
                                  }}
                                  className="w-full px-4 py-2 hover:bg-muted/50 transition-colors text-left flex items-center gap-3"
                                >
                                  <Target className="w-4 h-4 text-primary" />
                                  <div>
                                    <p className="font-medium text-foreground">{result.title}</p>
                                    {result.description && (
                                      <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                                    )}
                                  </div>
                                </button>
                              ))}
                          </div>
                        )}

                        {/* Profiles */}
                        {searchResults.some((r) => r.type === "profile") && (
                          <div>
                            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">Users</div>
                            {searchResults
                              .filter((r) => r.type === "profile")
                              .map((result) => (
                                <button
                                  key={result.user_id}
                                  onClick={() => {
                                    router.push(`/profile/${result.user_id}`)
                                    setShowSearchResults(false)
                                    setSearchQuery("")
                                  }}
                                  className="w-full px-4 py-2 hover:bg-muted/50 transition-colors text-left flex items-center gap-3"
                                >
                                  <User className="w-4 h-4 text-primary" />
                                  <p className="font-medium text-foreground">
                                    {result.display_name || result.username}
                                  </p>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
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

          {/* Page Content */}
          {children}
        </main>
      </div>
    </div>
  )
}
