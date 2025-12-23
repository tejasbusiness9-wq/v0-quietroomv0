"use client"
import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Play, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Bird, Waves, CloudRain, Flame, Snowflake } from "lucide-react"
import { AuraToast } from "@/components/aura-toast"
import { XPToast } from "@/components/xp-toast"
import { LevelUpCelebration } from "@/components/level-up-celebration"

interface Goal {
  id: string
  title: string
}

interface Task {
  id: string
  title: string
  goal_id: string | null
}

interface Environment {
  id: string
  name: string
  description: string
  background_value: string
  file_type: string
  media_type: string
}

interface Sound {
  id: string
  name: string
  description: string
  icon_name: string
  file_url: string
}

interface ZenModePageProps {
  onNavigate?: () => void
  taskId?: string | null
  goalName?: string
  goalId?: string | null
}

export default function ZenModePage({ onNavigate, taskId, goalName, goalId }: ZenModePageProps) {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedGoal, setSelectedGoal] = useState<string | "none">("none")
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<string | "none">("none")
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
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [sounds, setSounds] = useState<Sound[]>([])
  const [selectedEnvironment, setSelectedEnvironment] = useState<string | null>(null)
  const [activeEnvironment, setActiveEnvironment] = useState<Environment | null>(null)
  const [playingSounds, setPlayingSounds] = useState<Set<string>>(new Set())
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map())
  const [soundVolumes, setSoundVolumes] = useState<Map<string, number>>(new Map())
  const { toast } = useToast()
  const [selectedSound, setSelectedSound] = useState<string | null>(null)
  const portalRoot = document.getElementById("portal-root")
  const [isMounted, setIsMounted] = useState(false)
  const [mediaTab, setMediaTab] = useState<"static" | "animated" | "sounds">("animated")
  const [showAuraToast, setShowAuraToast] = useState(false)
  const [auraToastData, setAuraToastData] = useState({ aura: 0, message: "" })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    fetchGoals()
    fetchTasks()
    fetchEnvironments()
    fetchSounds()
    if (taskId) {
      loadTask(taskId)
    }
  }, [taskId])

  const fetchTasks = async () => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("tasks")
      .select("id, title, goal_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setTasks(data)
    }
  }

  const loadTask = async (taskId: string) => {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.from("tasks").select("id, title, goal_id").eq("id", taskId).maybeSingle()

    if (data && !error) {
      setTargetTask(data)
      setSelectedTask(data.id)
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

  const fetchEnvironments = async () => {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from("system_environments")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching environments:", error)
      return
    }

    const mappedData = data.map((env) => ({
      id: env.id,
      name: env.name,
      background_value: env.background_url,
      file_type: env.file_type,
      media_type: env.media_type,
    }))
    setEnvironments(mappedData)
  }

  useEffect(() => {
    fetchEnvironments()
  }, [])

  const fetchSounds = async () => {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from("system_sounds")
      .select("id, name, description, icon_name, audio_url")
      .order("created_at", { ascending: true })

    if (!error && data) {
      const mappedData = data.map((sound) => ({
        ...sound,
        icon: sound.icon_name, // Map icon_name to icon
        file_url: sound.audio_url,
      }))
      setSounds(mappedData)
    } else {
      console.log("[v0] Error fetching sounds:", error)
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
      handleTimerComplete()
    }
  }, [timeLeft, isRunning])

  const handleTimerComplete = async () => {
    setIsRunning(false)
    setIsFullscreen(false)

    if (!sessionId) {
      return
    }

    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const xpEarned = Math.floor(initialMinutes * 5)
    const auraEarned = Math.floor(initialMinutes / 5)

    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("total_xp, current_xp, level, xp_to_next_level, aura")
      .eq("user_id", user.id)
      .maybeSingle()

    if (currentProfile) {
      const newTotalXP = currentProfile.total_xp + xpEarned
      let newCurrentXP = currentProfile.current_xp + xpEarned
      let newLevel = currentProfile.level
      let newXPToNextLevel = currentProfile.xp_to_next_level
      let levelsGained = 0

      while (newCurrentXP >= newXPToNextLevel) {
        newLevel += 1
        levelsGained += 1
        newCurrentXP -= newXPToNextLevel
        newXPToNextLevel = Math.floor(150 * Math.pow(1.15, newLevel - 1))
      }

      const levelUpAura = levelsGained * 50
      const totalAuraGained = auraEarned + levelUpAura
      const newAura = currentProfile.aura + totalAuraGained

      await supabase
        .from("profiles")
        .update({
          total_xp: newTotalXP,
          current_xp: newCurrentXP,
          level: newLevel,
          xp_to_next_level: newXPToNextLevel,
          aura: newAura,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

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
          .maybeSingle()

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

      if (totalAuraGained > 0) {
        setTimeout(() => {
          const messages = []
          if (auraEarned > 0) messages.push(`${auraEarned} from session`)
          if (levelUpAura > 0) messages.push(`${levelUpAura} from level up`)

          setAuraToastData({
            aura: totalAuraGained,
            message: messages.join(" + "),
          })
          setShowAuraToast(true)
          setTimeout(() => setShowAuraToast(false), 3000)
        }, 1000)
      }

      if (newLevel > currentProfile.level) {
        setTimeout(() => {
          setNewLevel(newLevel)
          setShowLevelUp(true)
        }, 3500)
      }
    }

    if (selectedTask !== "none") {
      await supabase
        .from("tasks")
        .update({
          status: "completed",
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", selectedTask)
    }

    setSessionId(null)
    setTargetTask(null)
  }

  const handleGiveUp = async () => {
    if (!confirm("Are you sure you want to give up? No XP will be earned.")) return

    setIsRunning(false)
    setIsFullscreen(false)
    setMinutes(25)
    setSeconds(0)
    setInitialMinutes(25)
    setTimeLeft(25 * 60)

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

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = time % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const startFocus = async () => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    setIsFullscreen(true)
    setIsRunning(true)

    const { data: session, error } = await supabase
      .from("zen_sessions")
      .insert({
        user_id: user.id,
        duration_minutes: initialMinutes,
        task_id: selectedTask !== "none" ? selectedTask : null,
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

  const handleEnvironmentClick = (env: Environment) => {
    if (selectedEnvironment === env.id) {
      setSelectedEnvironment(null)
      setActiveEnvironment(null)
    } else {
      setSelectedEnvironment(env.id)
      setActiveEnvironment(env)
    }
  }

  const handleSoundClick = async (sound: Sound) => {
    const isPlaying = playingSounds.has(sound.id)

    if (isPlaying) {
      const audio = audioRefs.current.get(sound.id)
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      setPlayingSounds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(sound.id)
        return newSet
      })
    } else {
      let audio = audioRefs.current.get(sound.id)

      // Create audio if it doesn't exist
      if (!audio) {
        audio = new Audio(sound.file_url)
        audio.loop = true
        const volumePercent = soundVolumes.get(sound.id) ?? 50
        audio.volume = volumePercent / 100
        audioRefs.current.set(sound.id, audio)

        if (!soundVolumes.has(sound.id)) {
          setSoundVolumes((prev) => new Map(prev).set(sound.id, 50))
        }
      }

      try {
        // Reset audio if it was previously playing
        if (!audio.paused) {
          audio.pause()
          audio.currentTime = 0
        }

        // Load and play - let browser handle loading
        audio.load()
        const playPromise = audio.play()

        if (playPromise !== undefined) {
          await playPromise
          setPlayingSounds((prev) => new Set(prev).add(sound.id))
          console.log("[v0] Audio playing successfully:", sound.name)
        }
      } catch (error: any) {
        console.log("[v0] Audio play error:", error.message)

        // Only show toast for actual autoplay restrictions
        if (error.name === "NotAllowedError") {
          toast({
            title: "Audio blocked",
            description: "Browser blocked autoplay. Click again to play.",
            variant: "destructive",
          })
        } else {
          // For other errors, just log and don't update state
          console.error("[v0] Audio error details:", error)
        }
      }
    }
  }

  const handleVolumeChange = (soundId: string, volumePercent: number) => {
    const audio = audioRefs.current.get(soundId)
    if (audio) {
      audio.volume = volumePercent / 100
    }
    setSoundVolumes((prev) => new Map(prev).set(soundId, volumePercent))
  }

  useEffect(() => {
    return () => {
      audioRefs.current.forEach((audio) => {
        audio.pause()
        audio.currentTime = 0
      })
    }
  }, [])

  const filteredEnvironments = environments.filter((env) => env.media_type === mediaTab)

  return (
    <>
      {showXPToast && <XPToast xpAmount={xpToastData.xp} message={xpToastData.message} />}
      {showAuraToast && <AuraToast auraAmount={auraToastData.aura} message={auraToastData.message} />}
      {showLevelUp && <LevelUpCelebration newLevel={newLevel} onClose={() => setShowLevelUp(false)} />}

      {!isFullscreen && (
        <div className="min-h-screen p-8 bg-background">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Zen Mode</h2>
              <p className="text-muted-foreground">Drop into distraction-free focus and route XP to your goals.</p>
            </div>

            <Card
              className={`relative p-8 border-purple-500/20 overflow-hidden ${
                activeEnvironment ? "bg-black/40 backdrop-blur-md border-white/20" : "bg-card"
              }`}
              style={
                activeEnvironment?.background_value && activeEnvironment?.file_type !== "mp4"
                  ? {
                      backgroundImage: `url(${activeEnvironment.background_value})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              {activeEnvironment?.file_type === "mp4" && (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  src={activeEnvironment.background_value || "/placeholder.svg"}
                />
              )}
              {activeEnvironment && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />}

              <div className="relative z-10 space-y-6">
                <div className="grid grid-cols-2 gap-4">
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

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Select task:</label>
                    <Select value={selectedTask} onValueChange={setSelectedTask}>
                      <SelectTrigger className="bg-background/50 border-purple-500/30">
                        <SelectValue placeholder="Select a task" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Task</SelectItem>
                        {tasks.map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-8xl font-bold text-foreground mb-6 tabular-nums">{formatTime(timeLeft)}</div>

                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full mb-8">
                    <span className="text-amber-400">⚡</span>
                    <span className="font-semibold text-amber-300">+{Math.floor(initialMinutes * 5)} XP</span>
                  </div>

                  {!isRunning ? (
                    <Button
                      size="lg"
                      onClick={startFocus}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                    >
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

            <Card className="p-6 border-purple-500/20">
              <div className="flex gap-2 mb-6 border-b border-border/50">
                <button
                  onClick={() => setMediaTab("static")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    mediaTab === "static"
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Static
                </button>
                <button
                  onClick={() => setMediaTab("animated")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    mediaTab === "animated"
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Animated
                </button>
                <button
                  onClick={() => setMediaTab("sounds")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    mediaTab === "sounds"
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sounds
                </button>
              </div>

              {mediaTab === "static" || mediaTab === "animated" ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-foreground">
                    {mediaTab === "static" ? "Static Backgrounds" : "Animated Backgrounds"}
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {filteredEnvironments.map((env) => (
                      <Card
                        key={env.id}
                        className={`cursor-pointer transition-all hover:border-purple-500/50 overflow-hidden ${
                          selectedEnvironment === env.id
                            ? "border-purple-500 ring-2 ring-purple-500/20"
                            : "border-border/50"
                        }`}
                        onClick={() => handleEnvironmentClick(env)}
                      >
                        <div className="aspect-video relative overflow-hidden bg-muted">
                          {env.file_type === "mp4" ? (
                            <video
                              src={env.background_value}
                              className="w-full h-full object-cover"
                              autoPlay
                              loop
                              muted
                              playsInline
                              onError={() => {
                                console.log("[v0] Failed to load video:", env.background_value)
                              }}
                            />
                          ) : env.background_value ? (
                            <img
                              src={env.background_value || "/placeholder.svg"}
                              alt={env.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.log("[v0] Failed to load image:", env.background_value)
                                e.currentTarget.src = "/placeholder.svg?height=100&width=150"
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              No preview
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-medium text-foreground text-center truncate">{env.name}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Ambient Sounds</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {sounds.map((sound) => (
                      <Card
                        key={sound.id}
                        className={`cursor-pointer transition-all hover:border-purple-500/50 ${
                          playingSounds.has(sound.id)
                            ? "border-purple-500 ring-2 ring-purple-500/20 bg-purple-500/5"
                            : "border-border/50"
                        }`}
                        onClick={() => handleSoundClick(sound)}
                      >
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-center h-16">
                            {sound.icon === "bird" && <Bird className="w-10 h-10 text-primary" />}
                            {sound.icon === "waves" && <Waves className="w-10 h-10 text-primary" />}
                            {sound.icon === "cloud-rain" && <CloudRain className="w-10 h-10 text-primary" />}
                            {sound.icon === "flame" && <Flame className="w-10 h-10 text-primary" />}
                            {sound.icon === "snowflake" && <Snowflake className="w-10 h-10 text-primary" />}
                          </div>
                          <p className="text-xs font-medium text-foreground text-center">{sound.name}</p>
                          {playingSounds.has(sound.id) && (
                            <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <Volume2 className="w-3 h-3" />
                                <span>{soundVolumes.get(sound.id) || 50}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={soundVolumes.get(sound.id) || 50}
                                onChange={(e) => handleVolumeChange(sound.id, Number.parseInt(e.target.value))}
                                className="volume-slider w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {isFullscreen &&
        isMounted &&
        createPortal(
          <div className="fixed inset-0 z-[99999] bg-black flex items-center justify-center">
            {activeEnvironment?.file_type === "mp4" ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                src={activeEnvironment.background_value}
              />
            ) : activeEnvironment?.background_value ? (
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${activeEnvironment.background_value})` }}
              />
            ) : null}

            {activeEnvironment && <div className="absolute inset-0 bg-black/40" />}

            <div className="relative z-10 w-full max-w-4xl px-8">
              <div className="flex flex-col items-center justify-center space-y-8">
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
                    <div className="text-9xl font-bold text-white tabular-nums">{formatTime(timeLeft)}</div>
                    {selectedGoal !== "none" && goals.find((g) => g.id === selectedGoal) && (
                      <p className="text-lg text-muted-foreground mt-6">
                        → {goals.find((g) => g.id === selectedGoal)?.title}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-full">
                  <span className="text-3xl">⚡</span>
                  <span className="text-xl font-bold text-yellow-400">Earning {Math.floor(initialMinutes * 5)} XP</span>
                </div>

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
          </div>,
          document.body,
        )}
    </>
  )
}
