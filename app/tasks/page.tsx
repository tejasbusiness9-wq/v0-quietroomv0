"use client"

import { Plus, Calendar, Target, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import { TaskCreationModal } from "@/components/task-creation-modal"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { XPToast } from "@/components/xp-toast"
import { LevelUpCelebration } from "@/components/level-up-celebration"

interface Task {
  id: string
  title: string
  description?: string
  priority: "low" | "medium" | "high" | "urgent"
  xp: number
  completed: boolean
  due_date?: string
  goal_id?: string
  category?: string
  status: "active" | "completed"
}

export default function TasksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showXPToast, setShowXPToast] = useState(false)
  const [xpToastData, setXpToastData] = useState({ xp: 0, message: "" })
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [newLevel, setNewLevel] = useState(0)
  const router = useRouter()

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setTasks(data)
    }
    setLoading(false)
  }

  const toggleComplete = async (id: string, currentState: boolean) => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const newState = !currentState

    // Optimistic UI update
    setTasks((prevTasks) => prevTasks.map((t) => (t.id === id ? { ...t, completed: newState } : t)))

    try {
      const { error: taskError } = await supabase
        .from("tasks")
        .update({
          completed: newState,
          completed_at: newState ? new Date().toISOString() : null,
          status: newState ? "completed" : "active",
        })
        .eq("id", id)

      if (taskError) throw taskError

      if (newState) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("total_xp, current_xp, level, xp_to_next_level")
          .eq("user_id", user.id)
          .single()

        if (profile) {
          // Show XP toast
          setXpToastData({
            xp: 10,
            message: "Task completed!",
          })
          setShowXPToast(true)
          setTimeout(() => setShowXPToast(false), 3000)

          // Check if level progress fills the bar (this is purely visual feedback)
          const xpProgress = (profile.current_xp / profile.xp_to_next_level) * 100
          console.log("[v0] XP Progress:", xpProgress, "% -", profile.current_xp, "/", profile.xp_to_next_level)
        }
      }

      // Refresh tasks from database
      fetchTasks()
    } catch (error) {
      console.error("[v0] Error in task completion:", error)
      // Revert optimistic update on error
      setTasks((prevTasks) => prevTasks.map((t) => (t.id === id ? { ...t, completed: currentState } : t)))
    }
  }

  const handleCreateTask = async (newTask: any) => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from("tasks").insert({
      user_id: user.id,
      title: newTask.name,
      description: newTask.description,
      priority: newTask.priority,
      xp: newTask.effort === "small" ? 50 : newTask.effort === "medium" ? 100 : 200,
      due_date: newTask.when === "today" ? new Date().toISOString() : null,
      goal_id: newTask.linkedGoal || null,
      category: newTask.tags?.join(",") || null,
      completed: false,
      status: "active",
    })

    if (!error) {
      fetchTasks()
    }
  }

  const handleFocusTask = (taskId: string) => {
    router.push(`/zen?taskId=${taskId}`)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const isToday = (dueDate?: string) => {
    if (!dueDate) return false
    const today = new Date().toDateString()
    return new Date(dueDate).toDateString() === today
  }

  const isThisWeek = (dueDate?: string) => {
    if (!dueDate) return false
    const today = new Date()
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const due = new Date(dueDate)
    return due > today && due <= weekFromNow
  }

  const tasksByWhen = {
    today: tasks.filter((t) => isToday(t.due_date)),
    "this-week": tasks.filter((t) => isThisWeek(t.due_date)),
    someday: tasks.filter((t) => !t.due_date && !t.completed),
  }

  const TaskCard = ({ task }: { task: Task }) => (
    <div
      className={`bg-card border border-border rounded-xl p-4 transition-all hover:border-primary/50 ${
        task.completed ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleComplete(task.id, task.completed)}
          className="w-5 h-5 mt-1 rounded border-border cursor-pointer accent-primary"
        />
        <div className="flex-1">
          <h3 className={`font-semibold text-foreground mb-2 ${task.completed ? "line-through" : ""}`}>{task.title}</h3>
          {task.description && <p className="text-sm text-muted-foreground mb-2">{task.description}</p>}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(task.priority)}`}>
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
              <span className="relative z-10">+{task.xp || 10} XP</span>
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
            onClick={() => handleFocusTask(task.id)}
            className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Zap className="w-4 h-4" />
            Focus Now
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {showXPToast && <XPToast xpAmount={xpToastData.xp} message={xpToastData.message} />}
      {showLevelUp && <LevelUpCelebration newLevel={newLevel} onClose={() => setShowLevelUp(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Tasks</h1>
          <p className="text-muted-foreground">Organize and complete your daily quests</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          New Task
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Tasks</p>
          <p className="text-3xl font-bold text-foreground">{tasks.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Today</p>
          <p className="text-3xl font-bold text-primary">{tasksByWhen.today.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">This Week</p>
          <p className="text-3xl font-bold text-accent">{tasksByWhen["this-week"].length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-400">{tasks.filter((t) => t.completed).length}</p>
        </div>
      </div>

      {/* Tasks Lists */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading tasks...</div>
      ) : (
        <div className="space-y-6">
          {/* Today */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Today
            </h2>
            <div className="space-y-3">
              {tasksByWhen.today.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="relative inline-block">
                    <Calendar className="w-16 h-16 text-muted-foreground/30 animate-bounce" />
                    <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full animate-pulse" />
                  </div>
                  <p className="text-muted-foreground">No tasks for today. Create one to get started!</p>
                </div>
              ) : (
                tasksByWhen.today.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </div>
          </div>

          {/* This Week */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              This Week
            </h2>
            <div className="space-y-3">
              {tasksByWhen["this-week"].length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No tasks for this week</p>
              ) : (
                tasksByWhen["this-week"].map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </div>
          </div>

          {/* Someday */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              Someday
            </h2>
            <div className="space-y-3">
              {tasksByWhen.someday.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No tasks for someday</p>
              ) : (
                tasksByWhen.someday.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </div>
          </div>
        </div>
      )}

      <TaskCreationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreateTask={handleCreateTask} />
    </div>
  )
}
