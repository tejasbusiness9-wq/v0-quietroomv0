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
  Bell,
  Settings,
  Search,
} from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

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
  const router = useRouter()
  const pathname = usePathname()
  const supabase = getSupabaseBrowserClient()
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
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

  const handleNavigation = (path: string) => {
    router.push(path)
    audioRef.current?.play().catch(() => {})
  }

  const userLevel = 18
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Player"
  const userClass = "Arcane Builder"

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/" },
    { id: "goals", label: "Goals", icon: Target, path: "/" },
    { id: "tasks", label: "Tasks", icon: CheckSquare, path: "/" },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy, path: "/" },
    { id: "zen-mode", label: "Zen Mode", icon: Zap, path: "/" },
  ]

  const communityItems = [
    { id: "talk-to-q", label: "Talk to Q", icon: MessageSquare, path: "/talk-to-q" },
    { id: "community", label: "Community", icon: Users, path: "/" },
  ]

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
              <button className="p-2 hover:bg-muted rounded-lg transition-colors" onClick={() => handleNavigation("/")}>
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

          {/* Page Content */}
          {children}
        </main>
      </div>
    </div>
  )
}
