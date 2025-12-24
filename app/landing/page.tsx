"use client"

import { Button } from "@/components/ui/button"
import { Zap, Target, MessageSquare, Trophy, Timer, Star, CheckCircle2, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header / Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">Quiet Room</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection("features")} className="text-gray-300 hover:text-white transition">
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-gray-300 hover:text-white transition"
            >
              How It Works
            </button>
            <button onClick={() => scrollToSection("rewards")} className="text-gray-300 hover:text-white transition">
              Rewards
            </button>
          </nav>

          <Button
            onClick={() => router.push("/auth/signup")}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600"
          >
            Enter the Game
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/30 border border-purple-500/30 text-sm">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300">Turn Productivity Into An Epic Adventure</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Level Up Your Life,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                One Quest at a Time
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Transform your daily tasks into an immersive game. Earn XP, unlock rewards, compete on leaderboards, and
              achieve your goals while having fun.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button
                onClick={() => router.push("/auth/signup")}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 h-14 px-8 text-lg"
              >
                <Target className="w-5 h-5 mr-2" />
                Start Your Journey
              </Button>
              <Button
                onClick={() => scrollToSection("features")}
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg border-purple-500/30 hover:bg-purple-900/20"
              >
                Explore Features
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20">
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/20 rounded-2xl p-8 text-center">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                10K+
              </div>
              <div className="text-gray-400">Active Players</div>
            </div>
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/20 rounded-2xl p-8 text-center">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                1M+
              </div>
              <div className="text-gray-400">Tasks Completed</div>
            </div>
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/20 rounded-2xl p-8 text-center">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                500K+
              </div>
              <div className="text-gray-400">Hours Focused</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gradient-to-b from-transparent to-black">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/30 border border-purple-500/30 text-sm mb-6">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300">Game Mechanics</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Epic Features That Make
              <br />
              Work Feel Like Play
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Every feature is designed to keep you engaged, motivated, and progressing toward your goals.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-20">
            {/* Zen Mode Feature */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 border border-orange-500/20 rounded-3xl p-2 aspect-video">
                  <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center">
                    <span className="text-gray-500 text-sm">[Zen Mode Screenshot Placeholder]</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6 order-1 md:order-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center">
                  <Timer className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold">Zen Mode</h3>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Enter deep focus with beautiful backgrounds and ambient sounds. Earn 5 XP per minute and 1 Aura per 5
                  minutes. Complete sessions to maximize rewards!
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-purple-300">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Customizable timer (15-60 min)</span>
                  </li>
                  <li className="flex items-center gap-3 text-purple-300">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Beautiful animated backgrounds</span>
                  </li>
                  <li className="flex items-center gap-3 text-purple-300">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Ambient soundscapes</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Quest System Feature */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold">Quest System</h3>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Complete tasks to earn XP. Regular tasks give 3 XP, but link them to goals for bonus rewards and track
                  your progress across multiple quests.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-purple-300">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Create unlimited tasks</span>
                  </li>
                  <li className="flex items-center gap-3 text-purple-300">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Link tasks to goals</span>
                  </li>
                  <li className="flex items-center gap-3 text-purple-300">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Track daily progress</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/20 rounded-3xl p-2 aspect-video">
                <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center">
                  <span className="text-gray-500 text-sm">[Task Dashboard Screenshot Placeholder]</span>
                </div>
              </div>
            </div>

            {/* Vision & Goals Feature */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/20 rounded-3xl p-2 aspect-video">
                  <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center">
                    <span className="text-gray-500 text-sm">[Goals Dashboard Screenshot Placeholder]</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6 order-1 md:order-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold">Vision & Goals</h3>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Create meaningful goals with our 5-step wizard. Add your vision wall for inspiration, set clear
                  deadlines, and track progress with beautiful stats.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-purple-300">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Personal vision wall</span>
                  </li>
                  <li className="flex items-center gap-3 text-purple-300">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>5-step goal creation wizard</span>
                  </li>
                  <li className="flex items-center gap-3 text-purple-300">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Progress tracking & streaks</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Global Leaderboard Feature */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-600 to-yellow-700 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold">Global Leaderboard</h3>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Compete with players worldwide. Climb the ranks to earn daily Aura rewards. Top 10 get 100 Aura, ranks
                  11-50 get 50 Aura, and 51-100 get 20 Aura daily!
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-purple-300">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Ranked by total XP earned</span>
                  </li>
                  <li className="flex items-center gap-3 text-purple-300">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Daily Aura rewards</span>
                  </li>
                  <li className="flex items-center gap-3 text-purple-300">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Player titles & badges</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border border-yellow-500/20 rounded-3xl p-2 aspect-video">
                <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center">
                  <span className="text-gray-500 text-sm">[Leaderboard Screenshot Placeholder]</span>
                </div>
              </div>
            </div>

            {/* Rewards Store Feature */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-gradient-to-br from-pink-900/40 to-pink-800/20 border border-pink-500/20 rounded-3xl p-2 aspect-video">
                  <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center">
                    <span className="text-gray-500 text-sm">[Rewards Store Screenshot Placeholder]</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6 order-1 md:order-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-600 to-pink-700 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold">Rewards Store</h3>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Spend your hard-earned Aura on real rewards! Buy new backgrounds, ambient sounds, and even real-life
                  permissions like gaming time or cheat meals.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-purple-300">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Unlock premium backgrounds</span>
                  </li>
                  <li className="flex items-center gap-3 text-purple-300">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>New ambient soundscapes</span>
                  </li>
                  <li className="flex items-center gap-3 text-purple-300">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Real-life permission rewards</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Q AI Companion Feature */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold">Q: Your AI Companion</h3>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Meet Q, your gamified AI assistant. Ask questions, get advice in gaming slang, and let Q create tasks
                  and goals for you with agent capabilities.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-purple-300">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Gamified conversational AI</span>
                  </li>
                  <li className="flex items-center gap-3 text-purple-300">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Auto-create tasks & goals</span>
                  </li>
                  <li className="flex items-center gap-3 text-purple-300">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>24/7 productivity coaching</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/20 rounded-3xl p-2 aspect-video">
                <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center">
                  <span className="text-gray-500 text-sm">[Q Chat Screenshot Placeholder]</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-gradient-to-b from-black to-purple-900/10">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/30 border border-purple-500/30 text-sm mb-6">
              <Star className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300">Simple Yet Powerful</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Your Path to Victory</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Follow these simple steps to start your productivity journey
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/20 rounded-2xl p-8 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-2xl font-bold">
                  1
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-900/50 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold">Enter the Game</h3>
                <p className="text-gray-400">
                  Create your account and customize your player profile. Choose your path and set up your first goals.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/20 rounded-2xl p-8 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-2xl font-bold">
                  2
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-900/50 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold">Create Quests</h3>
                <p className="text-gray-400">
                  Break down your goals into daily tasks. Each completed quest earns you XP and brings you closer to
                  leveling up.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/20 rounded-2xl p-8 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-2xl font-bold">
                  3
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-900/50 flex items-center justify-center">
                  <Timer className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold">Focus & Grind</h3>
                <p className="text-gray-400">
                  Use Zen Mode for deep work sessions. Earn 5 XP per minute and accumulate Aura to spend in the rewards
                  store.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/20 rounded-2xl p-8 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-2xl font-bold">
                  4
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-900/50 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold">Level Up & Win</h3>
                <p className="text-gray-400">
                  Climb the leaderboard, unlock achievements, and spend Aura on rewards. Level up to get 50 Aura bonus!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section
        id="rewards"
        className="py-32 px-6 bg-gradient-to-b from-purple-900/10 to-black relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-pink-600/10 pointer-events-none" />

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold mb-8">
            Ready to Transform
            <br />
            Your Productivity?
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join thousands of players who are turning their daily grind into epic achievements. Start your journey
            today!
          </p>
          <Button
            onClick={() => router.push("/auth/signup")}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 h-16 px-12 text-xl"
          >
            <Zap className="w-6 h-6 mr-2" />
            Start Your Adventure
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          <p>&copy; 2025 Quiet Room. Turn your grind into an epic adventure.</p>
        </div>
      </footer>
    </div>
  )
}
