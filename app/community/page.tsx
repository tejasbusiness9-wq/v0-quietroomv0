"use client"

import { Bell, Settings, Search, Home } from "lucide-react"
import { ComingSoonBanner } from "@/components/coming-soon-banner"

export default function CommunityPage() {
  return (
    <div className="dark">
      <div className="flex h-screen bg-background text-foreground">
        {/* Sidebar */}
        <aside className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col">
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-lg">⚡</span>
              </div>
              <h1 className="text-xl font-bold text-sidebar-foreground">Questboard</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-13">Turn focus into XP</p>
          </div>

          <nav className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Main</h2>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  >
                    <Home className="w-5 h-5" />
                    <span>Dashboard</span>
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
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
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-8">
            <h2 className="text-4xl font-bold text-primary mb-2">Community</h2>
            <p className="text-muted-foreground mb-12">Join our community and connect with other players</p>
            <ComingSoonBanner />
          </div>
        </main>
      </div>
    </div>
  )
}
