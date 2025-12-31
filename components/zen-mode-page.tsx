"use client"
import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Play, Volume2, XCircle, CheckCircle2, AlertCircle, Timer, Target, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Bird, Waves, CloudRain, Flame, Snowflake } from "lucide-react"
import { AuraToast } from "@/components/aura-toast"
import { XPToast } from "@/components/xp-toast"
import { LevelUpCelebration } from "@/components/level-up-celebration"
import { Textarea } from "@/components/ui/textarea"
import { SoundEffects } from "@/lib/sound-effects"

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
  onNavigateToQ?: () => void
}

// Define a dummy setProfile function for now, assuming it will be provided by a context or hook.
// In a real application, this would likely be replaced by a context provider or similar.
const setProfile = (profileData: any) => {
  console.log("setProfile called with:", profileData)
}

export default function ZenModePage({ onNavigate, taskId, goalName, goalId, onNavigateToQ }: ZenModePageProps) {
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
  const [timerStartTimestamp, setTimerStartTimestamp] = useState<number | null>(null)
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
  const [selectedSound, setSelectedSound] = useState<string>("none")
  const portalRoot = document.getElementById("portal-root")
  const [isMounted, setIsMounted] = useState(false)
  const [mediaTab, setMediaTab] = useState<"static" | "animated" | "sounds">("animated")
  const [showAuraToast, setShowAuraToast] = useState(false)
  const [auraToastData, setAuraToastData] = useState({ aura: 0, message: "" })
  const [showDebriefModal, setShowDebriefModal] = useState(false)
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false)
  const [diagnosisText, setDiagnosisText] = useState("")
  const [sessionData, setSessionData] = useState<{
    goalTitle?: string
    taskTitle?: string
    minutes: number
    sessionId: string
  } | null>(null)

  const [honorConfirmed, setHonorConfirmed] = useState(false)
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false)
  const [showQuickStartModal, setShowQuickStartModal] = useState(true) // Added state for QuickStartModal

  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const requestWakeLock = async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen")
        console.log("[v0] Screen Wake Lock active")
      }
    } catch (err: any) {
      console.error(`[v0] Wake Lock error: ${err.name}, ${err.message}`)
    }
  }

  const releaseWakeLock = () => {
    if (wakeLockRef.current !== null) {
      wakeLockRef.current.release().then(() => {
        wakeLockRef.current = null
        console.log("[v0] Screen Wake Lock released")
      })
    }
  }

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && isRunning && isFullscreen) {
        await requestWakeLock()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      releaseWakeLock()
    }
  }, [isRunning, isFullscreen])

  const startTimer = async (minutes: number) => {
    setInitialMinutes(minutes)
    setTimeLeft(minutes * 60)
    setTimerStartTimestamp(Date.now())
    setIsRunning(true)
    setIsFullscreen(true)
    setShowQuickStartModal(false)

    await requestWakeLock()

    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

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

  const handleGiveUp = () => {
    setShowGiveUpConfirm(true)
  }

  const confirmGiveUp = () => {
    console.log("[v0] Give up confirmed")
    setIsFullscreen(false)
    setIsRunning(false)
    setShowGiveUpConfirm(false)
    setSessionData(null)

    releaseWakeLock()

    // Reset timer without any rewards
    toast({
      title: "Session Ended",
      description: "No rewards earned. Try again when ready.",
      variant: "destructive",
    })
  }

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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // Get default environments
    const { data: systemEnvs, error: systemError } = await supabase
      .from("system_environments")
      .select("*")
      .order("created_at", { ascending: true })

    const { data: inventory } = await supabase
      .from("inventory")
      .select("item_type, is_used")
      .eq("user_id", user.id)
      .eq("is_used", true)

    const purchasedItemIds = inventory?.map((inv) => inv.item_type) || []

    const { data: purchasedEnvs } = await supabase
      .from("rewards_items")
      .select("*")
      .eq("category", "system")
      .in("id", purchasedItemIds)

    if (systemError) {
      console.error("Error fetching environments:", systemError)
      return
    }

    const mappedSystemEnvs =
      systemEnvs?.map((env) => ({
        id: env.id,
        name: env.name,
        description: env.description || "",
        background_value: env.background_url,
        file_type: env.file_type,
        media_type: env.media_type,
      })) || []

    const mappedPurchasedEnvs =
      purchasedEnvs?.map((env) => {
        const fileExtension = env.media_url?.split(".").pop()?.toLowerCase() || ""
        const isAnimated = ["gif", "mp4", "webm"].includes(fileExtension)
        const isStatic = ["png", "jpg", "jpeg"].includes(fileExtension)

        return {
          id: env.id,
          name: env.name,
          description: env.description || "",
          background_value: env.media_url || "",
          file_type: fileExtension,
          media_type: isAnimated ? "animated" : isStatic ? "static" : "animated",
        }
      }) || []

    const allEnvironments = [...mappedSystemEnvs, ...mappedPurchasedEnvs]
    setEnvironments(allEnvironments)
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

    if (isRunning && timerStartTimestamp) {
      interval = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - timerStartTimestamp) / 1000)
        const remaining = initialMinutes * 60 - elapsed

        if (remaining <= 0) {
          setTimeLeft(0)
        } else {
          setTimeLeft(remaining)
        }
      }, 100) // Check every 100ms for smoother updates
    }

    return () => clearInterval(interval)
  }, [isRunning, timerStartTimestamp, initialMinutes])

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handleTimerComplete()
    }
  }, [timeLeft, isRunning])

  const handleTimerComplete = async () => {
    SoundEffects.timerComplete()

    setIsRunning(false)
    setIsFullscreen(false)

    releaseWakeLock()

    if (!sessionId) {
      return
    }

    const supabase = getSupabaseBrowserClient()

    let goalTitle = undefined
    let taskTitle = undefined

    if (selectedGoal !== "none") {
      const { data: goal } = await supabase.from("goals").select("title").eq("id", selectedGoal).maybeSingle()
      goalTitle = goal?.title
    }

    if (selectedTask !== "none") {
      const { data: task } = await supabase.from("tasks").select("title").eq("id", selectedTask).maybeSingle()
      taskTitle = task?.title
    }

    setSessionData({
      goalTitle,
      taskTitle,
      minutes: initialMinutes,
      sessionId,
    })

    setShowDebriefModal(true)
  }

  const handleSuccessClaim = async () => {
    if (!sessionData) return

    setShowDebriefModal(false)

    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const taskCompletionXP = selectedTask !== "none" ? 3 : 0
    const timerXP = Math.floor(sessionData.minutes * 5)
    const xpEarned = timerXP + taskCompletionXP
    const auraEarned = Math.floor(sessionData.minutes / 5)

    console.log("[v0] Zen session completed:")
    console.log("[v0] Minutes:", sessionData.minutes)
    console.log("[v0] Timer XP:", timerXP)
    console.log("[v0] Task completion XP:", taskCompletionXP)
    console.log("[v0] Total XP earned:", xpEarned)
    console.log("[v0] Aura calculation: Math.floor(" + sessionData.minutes + " / 5) =", auraEarned)

    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("total_xp, current_xp, level, xp_to_next_level, aura, zen_minutes")
      .eq("user_id", user.id)
      .maybeSingle()

    if (currentProfile) {
      const currentAura = Number(currentProfile.aura) || 0
      const currentTotalXP = Number(currentProfile.total_xp) || 0
      const currentCurrentXP = Number(currentProfile.current_xp) || 0
      const currentLevel = Number(currentProfile.level) || 1
      const currentXPToNextLevel = Number(currentProfile.xp_to_next_level) || 150
      const currentZenMinutes = Number(currentProfile.zen_minutes) || 0
      const newZenMinutes = currentZenMinutes + sessionData.minutes

      const newTotalXP = currentTotalXP + xpEarned
      let newCurrentXP = currentCurrentXP + xpEarned
      let newLevel = currentLevel
      let newXPToNextLevel = currentXPToNextLevel
      let levelsGained = 0

      while (newCurrentXP >= newXPToNextLevel) {
        newLevel++
        levelsGained++
        newCurrentXP -= newXPToNextLevel
        newXPToNextLevel = Math.floor(150 * Math.pow(1.15, newLevel - 1))
      }

      const levelUpAura = levelsGained * 50
      const totalAuraGained = auraEarned + levelUpAura
      const newAura = currentAura + totalAuraGained

      console.log("[v0] Aura update debug:")
      console.log("[v0] Current aura:", currentAura, typeof currentAura)
      console.log("[v0] Total aura gained:", totalAuraGained, typeof totalAuraGained)
      console.log("[v0] New aura:", newAura, typeof newAura)

      const updatedProfile = {
        total_xp: newTotalXP,
        current_xp: newCurrentXP,
        level: newLevel,
        xp_to_next_level: newXPToNextLevel,
        aura: newAura,
        zen_minutes: newZenMinutes,
        updated_at: new Date().toISOString(),
      }

      await supabase.from("profiles").update(updatedProfile).eq("user_id", user.id)

      await supabase
        .from("zen_sessions")
        .update({
          completed: true,
          ended_at: new Date().toISOString(),
          xp_earned: xpEarned,
        })
        .eq("id", sessionData.sessionId)

      await supabase.from("activity_log").insert({
        user_id: user.id,
        activity_type: "zen_session",
        related_id: sessionData.sessionId,
        xp_earned: xpEarned,
        metadata: {
          minutes: sessionData.minutes,
          aura_earned: auraEarned,
        },
      })

      if (levelsGained > 0) {
        const levelUpPromises = []
        for (let i = 0; i < levelsGained; i++) {
          levelUpPromises.push(
            supabase.from("activity_log").insert({
              user_id: user.id,
              activity_type: "level_up",
              xp_earned: 0,
              metadata: {
                new_level: currentProfile.level + i + 1,
                aura_earned: 50,
              },
            }),
          )
        }
        await Promise.all(levelUpPromises)
      }

      if (selectedTask !== "none") {
        await supabase.from("tasks").update({ completed: true }).eq("id", selectedTask)
      }

      if (selectedTask !== "none") {
        await supabase
          .from("tasks")
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
            status: "completed",
          })
          .eq("id", selectedTask)
      }

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
        SoundEffects.xpGain()

        setProfile(updatedProfile) // This line was the source of the error
        setNewLevel(newLevel)
        setShowLevelUp(true)
      }
    }

    setSessionData(null)
    setHonorConfirmed(false) // Reset honor confirmation
  }

  const handleFailureClaim = async () => {
    if (!sessionData) return

    setShowDebriefModal(false)

    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const xpEarned = Math.floor(sessionData.minutes * 5 * 0.5) // 50% pity XP

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
      const newAura = currentProfile.aura + levelUpAura // No session aura, only level-up aura

      const updatedProfile = {
        total_xp: newTotalXP,
        current_xp: newCurrentXP,
        level: newLevel,
        xp_to_next_level: newXPToNextLevel,
        aura: newAura,
        updated_at: new Date().toISOString(),
      }

      await supabase.from("profiles").update(updatedProfile).eq("user_id", user.id)

      await supabase
        .from("zen_sessions")
        .update({
          completed: false, // Mark as not successfully completed
          ended_at: new Date().toISOString(),
          xp_earned: xpEarned,
        })
        .eq("id", sessionData.sessionId)

      await supabase.from("activity_log").insert({
        user_id: user.id,
        activity_type: "zen_session",
        related_id: sessionData.sessionId,
        xp_earned: xpEarned,
        metadata: {
          minutes: sessionData.minutes,
          pity_xp: true,
          aura_earned: 0,
        },
      })

      if (levelsGained > 0) {
        const levelUpPromises = []
        for (let i = 0; i < levelsGained; i++) {
          levelUpPromises.push(
            supabase.from("activity_log").insert({
              user_id: user.id,
              activity_type: "level_up",
              xp_earned: 0,
              metadata: {
                new_level: currentProfile.level + i + 1,
                aura_earned: 50,
              },
            }),
          )
        }
        await Promise.all(levelUpPromises)
      }

      setXpToastData({
        xp: xpEarned,
        message: "Pity XP (50%) earned",
      })
      setShowXPToast(true)
      setTimeout(() => setShowXPToast(false), 3000)

      setTimeout(() => {
        setShowDiagnosisModal(true)
      }, 2000)

      if (newLevel > currentProfile.level) {
        SoundEffects.xpGain()

        setProfile(updatedProfile) // This line was the source of the error
        setNewLevel(newLevel)
        setShowLevelUp(true)
      }
    }

    setSessionData(null)
    setHonorConfirmed(false) // Reset honor confirmation
  }

  const handleSendDiagnosis = () => {
    if (!diagnosisText.trim()) return

    setShowDiagnosisModal(false)

    if (onNavigateToQ) {
      if (typeof window !== "undefined") {
        localStorage.setItem("q_prefilled_query", diagnosisText)
      }
      onNavigateToQ()
    }

    setDiagnosisText("")
    setSessionData(null)
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
    setTimerStartTimestamp(Date.now()) // Set the start time for accurate calculation

    await requestWakeLock()

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs md:text-sm text-muted-foreground">
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
                    <label className="text-xs md:text-sm text-muted-foreground">Select task:</label>
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
                          {env.file_type === "mp4" || env.file_type === "webm" ? (
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
                        <div className="p-3">
                          <h4 className="font-medium text-sm mb-1 text-foreground">{env.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">{env.description}</p>
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
            {activeEnvironment?.file_type === "mp4" || activeEnvironment?.file_type === "webm" ? (
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

      {showDebriefModal && sessionData && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20 border-2 border-purple-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-purple-500/20">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2 border-b border-purple-500/20 pb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center ring-2 ring-purple-500/40">
                  <Target className="w-10 h-10 text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">Be honest to yourself</h2>
                <p className="text-gray-400">Take a moment to reflect on your session.</p>
              </div>

              {/* Session Context Card */}
              <div className="space-y-3 p-5 bg-black/40 border border-purple-500/20 rounded-xl backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <Timer className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-400">Session Time</p>
                    <p className="text-2xl font-bold text-purple-400">{sessionData.minutes} minutes</p>
                  </div>
                </div>

                {sessionData.goalTitle && (
                  <div className="flex items-start gap-3 pt-3 border-t border-purple-500/10">
                    <div className="px-2 py-1 bg-purple-500/20 rounded text-xs font-semibold text-purple-300 shrink-0">
                      GOAL
                    </div>
                    <p className="text-sm text-white break-all flex-1">{sessionData.goalTitle}</p>
                  </div>
                )}

                {sessionData.taskTitle && (
                  <div className="flex items-start gap-3 pt-3 border-t border-purple-500/10">
                    <div className="px-2 py-1 bg-blue-500/20 rounded text-xs font-semibold text-blue-300 shrink-0">
                      TASK
                    </div>
                    <p className="text-sm text-white break-all flex-1">{sessionData.taskTitle}</p>
                  </div>
                )}
              </div>

              {/* Psychological Honor Check */}
              <div className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-xl space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-purple-400 mt-1 shrink-0" />
                  <blockquote className="text-sm italic text-gray-300 leading-relaxed">
                    "Be honest. No one is watching, but you know the truth. Did you actually put in the work, or are you
                    just chasing a number?"
                  </blockquote>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={honorConfirmed}
                    onChange={(e) => setHonorConfirmed(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-2 border-purple-500/50 bg-black/40 checked:bg-purple-500 checked:border-purple-500 focus:ring-2 focus:ring-purple-500/50 cursor-pointer transition-all"
                  />
                  <span className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
                    I confirm: I didn't fake this. This progress is real.
                  </span>
                </label>
              </div>

              {/* Rewards Preview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <h3 className="font-semibold text-green-400 mb-2 text-sm">Success Rewards</h3>
                  <ul className="text-xs space-y-1 text-gray-400">
                    <li>⚡ {Math.floor(sessionData.minutes * 5)} XP</li>
                    <li>💎 {Math.floor(sessionData.minutes / 5)} Aura</li>
                    {sessionData.taskTitle && <li>✅ Task completed</li>}
                  </ul>
                </div>

                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                  <h3 className="font-semibold text-orange-400 mb-2 text-sm">Failure</h3>
                  <ul className="text-xs space-y-1 text-gray-400">
                    <li>⚡ {Math.floor(sessionData.minutes * 5 * 0.5)} XP (50%)</li>
                    <li>💎 0 Aura</li>
                    <li>❌ No completion</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <Button
                  onClick={handleFailureClaim}
                  variant="outline"
                  className="flex-1 border-orange-500/50 hover:bg-orange-500/20 bg-black/40 text-orange-300 hover:text-orange-200 h-14"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <div className="font-semibold">Click Failed</div>
                    <div className="text-xs opacity-70">Pity XP (50%) & 0 Aura</div>
                  </div>
                </Button>
                <Button
                  onClick={handleSuccessClaim}
                  disabled={!honorConfirmed}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed h-14 shadow-lg shadow-purple-500/20"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <div className="font-semibold">Click Success</div>
                    <div className="text-xs opacity-90">Full rewards + Mark done</div>
                  </div>
                </Button>
              </div>

              {!honorConfirmed && (
                <p className="text-xs text-center text-purple-400/60 animate-pulse">
                  ↑ Confirm your integrity to claim success
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {showDiagnosisModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-background border-2 border-orange-500/50 rounded-2xl max-w-lg w-full p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold">What went wrong?</h2>
              <p className="text-muted-foreground">Let Q help you understand and overcome this obstacle</p>
            </div>

            <Textarea
              value={diagnosisText}
              onChange={(e) => setDiagnosisText(e.target.value)}
              placeholder="E.g., I got distracted by social media, felt overwhelmed, didn't understand the task..."
              className="min-h-[120px] resize-none"
              maxLength={500}
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Be specific about what blocked you</span>
              <span>{diagnosisText.length}/500</span>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowDiagnosisModal(false)
                  setDiagnosisText("")
                  setSessionData(null)
                }}
                variant="outline"
                className="flex-1"
              >
                Skip
              </Button>
              <Button
                onClick={handleSendDiagnosis}
                disabled={!diagnosisText.trim()}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Talk to Q
              </Button>
            </div>
          </div>
        </div>
      )}

      {showGiveUpConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100000] flex items-center justify-center p-4">
          <div className="bg-background border-2 border-red-500/50 rounded-2xl max-w-md w-full p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-red-500">Giving Up?</h2>
              <p className="text-muted-foreground">You will not get any XP & Aura if you quit now.</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowGiveUpConfirm(false)}
                variant="outline"
                className="flex-1 border-purple-500/50 hover:bg-purple-500/10"
              >
                Keep Going
              </Button>
              <Button onClick={confirmGiveUp} className="flex-1 bg-red-600 hover:bg-red-700">
                Yes, Give Up
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
