"use client"

import {
  Zap,
  Target,
  Timer,
  Trophy,
  Gift,
  MessageSquare,
  Play,
  CheckCircle2,
  TrendingUp,
  Star,
  Crown,
  Flame,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Quiet Room</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              How It Works
            </a>
            <a href="#rewards" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Rewards
            </a>
            <Link
              href="/auth/signup"
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-bold hover:shadow-lg hover:shadow-primary/50 transition-all hover:scale-105"
            >
              Enter the Game
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-8">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Turn Productivity Into An Epic Adventure</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-balance">
            Level Up Your Life,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-primary">
              One Quest at a Time
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto text-balance">
            Transform your daily tasks into an immersive game. Earn XP, unlock rewards, compete on leaderboards, and
            achieve your goals while having fun.
          </p>

          <div className="flex items-center justify-center gap-4 mb-16">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-primary/50 transition-all hover:scale-105 flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start Your Journey
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-card border-2 border-border text-foreground rounded-xl font-bold text-lg hover:border-primary/50 transition-all flex items-center gap-2"
            >
              Explore Features
              <Zap className="w-5 h-5" />
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6">
              <Zap className="w-8 h-8 text-primary mb-3 mx-auto" />
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 mb-2">
                50M+
              </div>
              <div className="text-sm text-muted-foreground">Total XP Earned</div>
            </div>
            <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6">
              <Flame className="w-8 h-8 text-orange-500 mb-3 mx-auto" />
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 mb-2">
                125
              </div>
              <div className="text-sm text-muted-foreground">Avg Daily Streak</div>
            </div>
            <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6">
              <Crown className="w-8 h-8 text-yellow-500 mb-3 mx-auto" />
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 mb-2">
                10K+
              </div>
              <div className="text-sm text-muted-foreground">Active Players</div>
            </div>
            <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6">
              <Star className="w-8 h-8 text-primary mb-3 mx-auto" />
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 mb-2">
                95%
              </div>
              <div className="text-sm text-muted-foreground">Goal Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Game Mechanics</span>
            </div>
            <h2 className="text-5xl font-bold mb-4">Epic Features That Make Work Feel Like Play</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every feature is designed to keep you engaged, motivated, and progressing toward your goals.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Zen Mode Feature */}
            <Card className="bg-card border border-border rounded-3xl p-8 hover:border-primary/50 transition-all">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <Image
                    src="/zen-meditation-timer-interface.jpg"
                    alt="Zen Mode Timer"
                    width={300}
                    height={200}
                    className="rounded-2xl border border-border"
                  />
                </div>
                <div>
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mb-4">
                    <Timer className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Zen Mode</h3>
                  <p className="text-muted-foreground mb-4">
                    Enter deep focus with beautiful backgrounds and ambient sounds. Earn 5 XP per minute and 1 Aura per
                    5 minutes. Complete sessions to maximize rewards!
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Customizable timer (15-60 min)</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Beautiful animated backgrounds</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Ambient soundscapes</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Quest System Feature */}
            <Card className="bg-card border border-border rounded-3xl p-8 hover:border-primary/50 transition-all">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <Image
                    src="/task-dashboard-with-quest-cards.jpg"
                    alt="Quest System"
                    width={300}
                    height={200}
                    className="rounded-2xl border border-border"
                  />
                </div>
                <div>
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Quest System</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete tasks to earn XP. Regular tasks give 3 XP, but link them to goals for bonus rewards and
                    track your progress across multiple quests.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Create unlimited tasks</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Link tasks to goals</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Track daily progress</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Vision & Goals Feature */}
            <Card className="bg-card border border-border rounded-3xl p-8 hover:border-primary/50 transition-all">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <Image
                    src="/goal-tracking-dashboard.jpg"
                    alt="Vision & Goals"
                    width={300}
                    height={200}
                    className="rounded-2xl border border-border"
                  />
                </div>
                <div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Vision & Goals</h3>
                  <p className="text-muted-foreground mb-4">
                    Create meaningful goals with our 5-step wizard. Add your vision wall for inspiration, set clear
                    deadlines, and track progress with beautiful stats.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Personal vision wall</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>5-step goal creation wizard</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Progress tracking & streaks</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Global Leaderboard Feature */}
            <Card className="bg-card border border-border rounded-3xl p-8 hover:border-primary/50 transition-all">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <Image
                    src="/leaderboard-rankings-interface.png"
                    alt="Global Leaderboard"
                    width={300}
                    height={200}
                    className="rounded-2xl border border-border"
                  />
                </div>
                <div>
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center mb-4">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Global Leaderboard</h3>
                  <p className="text-muted-foreground mb-4">
                    Compete with players worldwide. Climb the ranks to earn daily Aura rewards. Top 10 get 100 Aura,
                    ranks 11-50 get 50 Aura, and 51-100 get 20 Aura daily!
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Ranked by total XP earned</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Daily Aura rewards</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Player titles & badges</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Rewards Store Feature */}
            <Card className="bg-card border border-border rounded-3xl p-8 hover:border-primary/50 transition-all">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <Image
                    src="/rewards-store-items.jpg"
                    alt="Rewards Store"
                    width={300}
                    height={200}
                    className="rounded-2xl border border-border"
                  />
                </div>
                <div>
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-4">
                    <Gift className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Rewards Store</h3>
                  <p className="text-muted-foreground mb-4">
                    Spend your hard-earned Aura on real rewards! Buy new backgrounds, ambient sounds, and even real-life
                    permissions like gaming time or cheat meals.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Unlock premium backgrounds</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>New ambient soundscapes</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Real-life permission rewards</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Q AI Companion Feature */}
            <Card className="bg-card border border-border rounded-3xl p-8 hover:border-primary/50 transition-all">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <Image
                    src="/ai-chat-interface.png"
                    alt="Q AI Companion"
                    width={300}
                    height={200}
                    className="rounded-2xl border border-border"
                  />
                </div>
                <div>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Q, Your AI Companion</h3>
                  <p className="text-muted-foreground mb-4">
                    Meet Q, your gamified AI assistant. Ask questions, get advice in gaming slang, and let Q create
                    tasks and goals for you with agent capabilities.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Gamified conversational AI</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Auto-create tasks & goals</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>24/7 productivity coaching</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Simple Yet Powerful</span>
            </div>
            <h2 className="text-5xl font-bold mb-4">Your Path to Victory</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Follow these simple steps to start your productivity journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Play className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Enter the Game</h3>
              <p className="text-muted-foreground text-center text-sm">
                Create your account and customize your player profile. Choose your path and set up your first goals.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Create Quests</h3>
              <p className="text-muted-foreground text-center text-sm">
                Break down your goals into daily tasks. Each completed quest earns you XP and brings you closer to
                leveling up.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Timer className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Focus & Grind</h3>
              <p className="text-muted-foreground text-center text-sm">
                Use Zen Mode for deep work sessions. Earn 5 XP per minute and accumulate Aura to spend in the rewards
                store.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl font-bold text-white">4</span>
              </div>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Trophy className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Level Up & Win</h3>
              <p className="text-muted-foreground text-center text-sm">
                Climb the leaderboard, unlock achievements, and spend Aura on rewards. Level up to get 50 Aura bonus!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section id="rewards" className="py-20 px-6 bg-card/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Get Rewarded</span>
            </div>
            <h2 className="text-5xl font-bold mb-4">The Grind Never Stops</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join thousands of players turning their daily grind into epic achievements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 mb-2">
                10K+
              </div>
              <div className="text-muted-foreground">Active Players</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 mb-2">
                1M+
              </div>
              <div className="text-muted-foreground">Tasks Completed</div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Timer className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 mb-2">
                500K+
              </div>
              <div className="text-muted-foreground">Hours Focused</div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl font-bold text-xl hover:shadow-2xl hover:shadow-primary/50 transition-all hover:scale-105"
            >
              <Play className="w-6 h-6" />
              Start Your Journey Now
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline font-semibold">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Quiet Room</span>
          </div>
          <p className="text-muted-foreground mb-6">Turn your productivity into an epic adventure</p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Zap className="w-4 h-4 text-primary" />
            <span>by Emergent</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
