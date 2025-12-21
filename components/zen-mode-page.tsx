"use client"
import { useState, useEffect } from "react"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { XpToast } from "@/components/xp-toast"
import { LevelUpCelebration } from "@/components/level-up-celebration"
import { MountainEnvironment } from "@/components/zen/environments/mountain-environment"
import { ArtStoreEnvironment } from "@/components/zen/environments/art-store-environment"
import { useToast } from "@/components/ui/use-toast" // Import useToast

interface Goal {
  id: string
  title: string
}

interface Task {
  id: string
  title: string
  goal_id: string | null
}

interface ZenModePageProps {
  taskId?: string | null
}

export default function ZenModePage({ taskId }: ZenModePageProps) {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedEnvironment, setSelectedEnvironment] = useState<"mountain" | "art-store" | null>(null)
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedGoal, setSelectedGoal] = useState<string | "none">("none") // Updated to non-empty string
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [initialMinutes, setInitialMinutes] = useState(25)
  const [targetTask, setTargetTask] = useState<Task | null>(null)
  const [showXPToast, setShowXPToast] = useState(false)
  const [xpToastData, setXpToastData] = useState({ xp: 0, message: "" })
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [newLevel, setNewLevel] = useState(0)
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60)
  const [showXPPreview, setShowXPPreview] = useState(false)
  const [xpPreviewAmount, setXpPreviewAmount] = useState(0)
  const { toast } = useToast()

  const environments = [
    { id: "mountain", name: "Mountain" },
    { id: "art-store", name: "Art Store" },
    { id: null, name: "Default" },
  ]

  useEffect(() => {
    fetchGoals()
    if (taskId) {
      loadTask(taskId)
    }
  }, [taskId])

  const loadTask = async (taskId: string) => {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.from("tasks").select("id, title, goal_id").eq("id", taskId).single()

    if (data && !error) {
      setTargetTask(data)
      if (data.goal_id) {
        setSelectedGoal(data.goal_id)
      }
    }
  }

  const fetchGoals = async () => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("goals")
      .select("id, title")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setGoals(data)
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning])

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      console.log("[v0] Timer hit 0:00, triggering completion...")
      handleTimerComplete()
    }
  }, [timeLeft, isRunning])

  const handleTimerComplete = async () => {
    console.log("[v0] Timer completed, processing XP...")
    setIsRunning(false)

    // Exit fullscreen
    if (isFullscreen) {
      setIsFullscreen(false)
    }

    if (!sessionId) {
      console.log("[v0] No session ID, skipping XP award")
      return
    }

    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const xpEarned = Math.floor(initialMinutes * 5)
    console.log("[v0] XP earned:", xpEarned, "for", initialMinutes, "minutes")

    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("total_xp, current_xp, level, xp_to_next_level")
      .eq("user_id", user.id)
      .single()

    if (currentProfile) {
      const newTotalXP = currentProfile.total_xp + xpEarned
      let newCurrentXP = currentProfile.current_xp + xpEarned
      let newLevel = currentProfile.level
      let newXPToNextLevel = currentProfile.xp_to_next_level

      // Check for level up
      while (newCurrentXP >= newXPToNextLevel) {
        newLevel += 1
        newCurrentXP -= newXPToNextLevel
        newXPToNextLevel = Math.floor(150 * Math.pow(1.15, newLevel - 1))
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          total_xp: newTotalXP,
          current_xp: newCurrentXP,
          level: newLevel,
          xp_to_next_level: newXPToNextLevel,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      if (profileError) {
        console.error("[v0] Error updating profile:", profileError)
      }

      await supabase
        .from("zen_sessions")
        .update({
          completed: true,
          ended_at: new Date().toISOString(),
          xp_earned: xpEarned,
        })
        .eq("id", sessionId)

      if (selectedGoal !== "none") {
        const { data: goal } = await supabase
          .from("goals")
          .select("xp, max_xp, progress, title")
          .eq("id", selectedGoal)
          .single()

        if (goal) {
          const newGoalXp = (goal.xp || 0) + xpEarned
          const newProgress = Math.min(100, Math.floor((newGoalXp / goal.max_xp) * 100))

          await supabase
            .from("goals")
            .update({
              xp: newGoalXp,
              progress: newProgress,
            })
            .eq("id", selectedGoal)

          console.log("[v0] Updated goal XP:", newGoalXp, "for goal:", selectedGoal)

          setXpToastData({
            xp: xpEarned,
            message: `Progress toward "${goal.title}"`,
          })
          setShowXPToast(true)
          setTimeout(() => setShowXPToast(false), 3000)
        }
      } else {
        setXpToastData({
          xp: xpEarned,
          message: "Zen session completed!",
        })
        setShowXPToast(true)
        setTimeout(() => setShowXPToast(false), 3000)
      }

      if (newLevel > currentProfile.level) {
        console.log("[v0] User leveled up to level", newLevel)
        setTimeout(() => {
          setNewLevel(newLevel)
          setShowLevelUp(true)
        }, 3500)
      }
    }

    // Mark task as completed if linked
    if (targetTask) {
      await supabase
        .from("tasks")
        .update({
          status: "completed",
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", targetTask.id)
    }

    // Reset for next session
    setSessionId(null)
    setTargetTask(null)
  }

  const handleGiveUp = async () => {
    if (!confirm("Are you sure you want to give up? No XP will be earned.")) return

    setIsRunning(false)
    setIsFullscreen(false)

    // Reset timer to default
    setMinutes(25)
    setSeconds(0)
    setInitialMinutes(25)
    setTimeLeft(25 * 60)

    // Delete incomplete session
    if (sessionId) {
      const supabase = getSupabaseBrowserClient()
      await supabase.from("zen_sessions").delete().eq("id", sessionId)
      setSessionId(null)
      setSessionStartTime(null)
    }

    toast({
      title: "Session Forfeited",
      description: "Timer reset. Try again when ready.",
      variant: "destructive",
    })
  }

  const handleReset = async () => {
    if (sessionId && !isRunning) {
      const supabase = getSupabaseBrowserClient()
      await supabase.from("zen_sessions").delete().eq("id", sessionId)
    }

    setIsRunning(false)
    setMinutes(25)
    setSeconds(0)
    setSessionId(null)
    setSessionStartTime(null)
    setTimeLeft(25 * 60)
  }

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = time % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const renderEnvironment = () => {
    if (selectedEnvironment === "mountain") {
      return <MountainEnvironment />
    }
    if (selectedEnvironment === "art-store") {
      return <ArtStoreEnvironment />
    }
    return null
  }

  const startFocus = async () => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // Enter fullscreen mode
    setIsFullscreen(true)
    setIsRunning(true)

    // Create session in database
    const { data: session, error } = await supabase
      .from("zen_sessions")
      .insert({
        user_id: user.id,
        duration_minutes: initialMinutes,
        task_id: targetTask?.id || null,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating zen session:", error)
      return
    }

    setSessionId(session.id)
    setSessionStartTime(Date.now())
  }

  return (
    <>
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900 flex items-center justify-center">
          <div className="w-full max-w-4xl px-8">
            <div className="flex flex-col items-center justify-center space-y-8">
              {/* Large timer display */}
              <div className="relative w-96 h-96 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="192"
                    cy="192"
                    r="170"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="12"
                    className="opacity-20"
                  />
                  <circle
                    cx="192"
                    cy="192"
                    r="170"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 170}`}
                    strokeDashoffset={`${2 * Math.PI * 170 * (1 - timeLeft / (initialMinutes * 60))}`}
                    className="transition-all duration-1000"
                  />
                </svg>

                <div className="text-center">
                  <div className="text-9xl font-bold text-foreground tabular-nums">{formatTime(timeLeft)}</div>
                  {selectedGoal !== "none" && goals.find((g) => g.id === selectedGoal) && (
                    <p className="text-lg text-muted-foreground mt-6">
                      → {goals.find((g) => g.id === selectedGoal)?.title}
                    </p>
                  )}
                </div>
              </div>

              {/* XP indicator */}
              <div className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-full">
                <span className="text-3xl">⚡</span>
                <span className="text-xl font-bold text-yellow-400">Earning {Math.floor(initialMinutes * 5)} XP</span>
              </div>

              {/* Give up button */}
              <Button
                onClick={handleGiveUp}
                variant="outline"
                size="lg"
                className="text-lg px-10 py-6 mt-8 border-red-500/50 hover:bg-red-500/10 hover:border-red-500 text-red-400 hover:text-red-300 bg-transparent"
              >
                Give Up
              </Button>
            </div>
          </div>
        </div>
      )}

      {!isFullscreen && (
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Zen Mode</h2>
            <p className="text-muted-foreground">Drop into distraction-free focus and route XP to your goals.</p>
          </div>

          <Card className="p-8 bg-gradient-to-br from-purple-950/40 via-indigo-950/30 to-purple-900/40 border-purple-500/20">
            <div className="space-y-6">
              {/* Goal Selection */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Route XP to goal: <span className="text-xs">(Personal XP Only)</span>
                </label>
                <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                  <SelectTrigger className="bg-background/50 border-purple-500/30">
                    <SelectValue placeholder="Select a goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Goal (Personal XP Only)</SelectItem>
                    {goals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Environment Selection */}
              <div className="flex gap-2">
                {environments.map((env) => (
                  <Button
                    key={env.id}
                    variant={selectedEnvironment === env.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedEnvironment(env.id)}
                    className="flex-1"
                  >
                    {env.name}
                  </Button>
                ))}
              </div>

              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-8xl font-bold text-foreground mb-6 tabular-nums">{formatTime(timeLeft)}</div>

                {/* XP Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full mb-8">
                  <span className="text-amber-400">⚡</span>
                  <span className="font-semibold text-amber-300">+{Math.floor(initialMinutes * 5)} XP</span>
                </div>

                {!isRunning ? (
                  <Button size="lg" onClick={startFocus} className="bg-purple-600 hover:bg-purple-700 text-white px-8">
                    <Play className="w-5 h-5 mr-2" />
                    Start focus
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleGiveUp}
                    className="px-8 border-red-500/50 hover:bg-red-500/10 hover:border-red-500 text-red-400 hover:text-red-300 bg-transparent"
                  >
                    Give Up
                  </Button>
                )}
              </div>

              {/* Timer presets */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { minutes: 15, xp: 75 },
                  { minutes: 25, xp: 125 },
                  { minutes: 45, xp: 225 },
                  { minutes: 60, xp: 300 },
                ].map(({ minutes, xp }) => (
                  <Button
                    key={minutes}
                    variant="outline"
                    onClick={() => {
                      setInitialMinutes(minutes)
                      setTimeLeft(minutes * 60)
                      setShowXPPreview(true)
                      setXpPreviewAmount(xp)
                      setTimeout(() => setShowXPPreview(false), 2000)
                    }}
                    className="flex flex-col items-center gap-1 h-auto py-3 border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/10"
                  >
                    <span className="font-semibold text-foreground">{minutes} min</span>
                    <span className="text-xs text-amber-400">{xp} XP</span>
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Toasts and Celebrations */}
      {showXPToast && <XpToast xp={xpToastData.xp} message={xpToastData.message} />}
      {showLevelUp && <LevelUpCelebration level={newLevel} onClose={() => setShowLevelUp(false)} />}
    </>
  )
}
