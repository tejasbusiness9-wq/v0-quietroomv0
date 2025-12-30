"use client"

import { Plus, Calendar, Target, Zap, X, MoreVertical, Edit2, Trash2, AlertTriangle, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { TaskCreationModal } from "@/components/task-creation-modal"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { XPToast } from "@/components/xp-toast"
import { LevelUpCelebration } from "@/components/level-up-celebration"
import { useDataRefresh } from "@/contexts/data-refresh-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { playSound } from "@/lib/sound-effects"

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

export default function TasksPage({ onNavigateToZen }: { onNavigateToZen?: (taskId: string) => void }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const [showTaskMenu, setShowTaskMenu] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showXPToast, setShowXPToast] = useState(false)
  const [xpToastData, setXpToastData] = useState({ xp: 0, message: "" })
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [newLevel, setNewLevel] = useState(0)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const { refreshTrigger, triggerRefresh } = useDataRefresh()
  const [activeTab, setActiveTab] = useState<"active" | "overdue">("active")
  const [timeRemaining, setTimeRemaining] = useState<string>("")

  useEffect(() => {
    fetchTasks()
    checkAndResetStreakForOverdueTasks()

    const supabase = getSupabaseBrowserClient()
    const channel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          // Refetch tasks when any task is updated
          fetchTasks()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refreshTrigger])

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

    if (newState) {
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== id))
      playSound("xpgain")
    } else {
      // If uncompleting (shouldn't happen often), just toggle
      setTasks((prevTasks) => prevTasks.map((t) => (t.id === id ? { ...t, completed: newState } : t)))
    }

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
          .maybeSingle()

        if (profile) {
          setXpToastData({
            xp: 3,
            message: "Task completed!",
          })
          setShowXPToast(true)
          setTimeout(() => setShowXPToast(false), 3000)
        }
      }

      // Refresh tasks from database to sync
      await fetchTasks()
      triggerRefresh()
    } catch (error) {
      console.error("Error in task completion:", error)
      await fetchTasks()
    }
  }

  const handleCreateTask = async (newTask: any) => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    let dueDate = null
    const now = new Date()

    if (newTask.when === "today") {
      // For tasks created today, deadline is 11:59:59 PM today
      const endOfToday = new Date(now)
      endOfToday.setHours(23, 59, 59, 999)
      dueDate = endOfToday.toISOString()
    } else if (newTask.when === "this-week") {
      // Smart logic: If today is Sunday, "This Week" means NEXT Sunday (7 days away)
      // If today is Mon-Sat, "This Week" means the upcoming Sunday
      const today = new Date(now)
      const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, ... 6 = Saturday

      const daysUntilSunday = currentDay === 0 ? 7 : 7 - currentDay

      const endOfWeek = new Date(today)
      endOfWeek.setDate(today.getDate() + daysUntilSunday)
      endOfWeek.setHours(23, 59, 59, 999)
      dueDate = endOfWeek.toISOString()
    }
    // For "someday", dueDate remains null

    const { error } = await supabase.from("tasks").insert({
      user_id: user.id,
      title: newTask.name,
      description: newTask.description,
      priority: newTask.priority,
      xp: 3,
      due_date: dueDate,
      goal_id: newTask.linkedGoal || null,
      category: newTask.tags?.join(",") || null,
      completed: false,
      status: "active",
    })

    if (!error) {
      fetchTasks()
      triggerRefresh() // Trigger global refresh after task creation
    }
  }

  const handleFocusTask = (taskId: string) => {
    if (onNavigateToZen) {
      onNavigateToZen(taskId)
    }
  }

  const deleteTask = async (id: string) => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from("tasks").delete().eq("id", id)

    if (!error) {
      fetchTasks()
      setSelectedTask(null)
      setShowTaskMenu(null)
      triggerRefresh() // Trigger global refresh after task deletion
    }
  }

  const handleEditTask = async (updatedTask: any) => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !taskToEdit) return

    let dueDate = taskToEdit.due_date
    const now = new Date()

    if (updatedTask.when === "today") {
      const endOfToday = new Date(now)
      endOfToday.setHours(23, 59, 59, 999)
      dueDate = endOfToday.toISOString()
    } else if (updatedTask.when === "this-week") {
      const endOfWeek = new Date(now)
      const dayOfWeek = endOfWeek.getDay()
      const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek

      endOfWeek.setDate(now.getDate() + daysUntilSunday)
      endOfWeek.setHours(23, 59, 59, 999)
      dueDate = endOfWeek.toISOString()
    } else if (updatedTask.when === "someday") {
      dueDate = null
    }

    const { error } = await supabase
      .from("tasks")
      .update({
        title: updatedTask.name,
        description: updatedTask.description,
        priority: updatedTask.priority,
        due_date: dueDate,
        goal_id: updatedTask.linkedGoal || null,
        category: updatedTask.tags?.join(",") || null,
      })
      .eq("id", taskToEdit.id)

    if (!error) {
      fetchTasks()
      setIsEditModalOpen(false)
      setTaskToEdit(null)
      setShowTaskMenu(null)
      triggerRefresh() // Trigger global refresh after task editing
    }
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
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0) // Start of tomorrow

    const nextSunday = new Date(today)
    const daysUntilSunday = today.getDay() === 0 ? 7 : 7 - today.getDay()
    nextSunday.setDate(today.getDate() + daysUntilSunday)
    nextSunday.setHours(23, 59, 59, 999) // End of next Sunday

    const due = new Date(dueDate)
    return due >= tomorrow && due <= nextSunday
  }

  const checkAndResetStreakForOverdueTasks = async () => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const now = new Date()
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    const timeSinceMidnight = now.getTime() - midnight.getTime()

    // Only check if we're within 5 minutes of midnight (to avoid multiple resets)
    if (timeSinceMidnight < 5 * 60 * 1000) {
      const { data: overdueTasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed", false)
        .lt("due_date", midnight.toISOString())

      if (overdueTasks && overdueTasks.length > 0) {
        // Reset streak to 0
        await supabase
          .from("streaks")
          .update({
            current_streak: 0,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)

        console.log("Streak reset due to overdue tasks at midnight")
      }
    }
  }

  const isOverdue = (dueDate?: string, completed?: boolean) => {
    if (!dueDate || completed) return false
    return new Date(dueDate) < new Date()
  }

  const tasksByCategory = {
    overdue: tasks.filter((t) => isOverdue(t.due_date, t.completed)),
    today: tasks.filter((t) => !isOverdue(t.due_date, t.completed) && isToday(t.due_date)),
    "this-week": tasks.filter((t) => !isOverdue(t.due_date, t.completed) && isThisWeek(t.due_date)),
    someday: tasks.filter((t) => !isOverdue(t.due_date, t.completed) && !t.due_date && !t.completed),
  }

  const activeTasks = [...tasksByCategory.today, ...tasksByCategory["this-week"], ...tasksByCategory.someday]
  const overdueTasks = tasksByCategory.overdue

  const TaskCard = ({ task, showOverdueWarning }: { task: Task; showOverdueWarning?: boolean }) => (
    <div
      className={`bg-card border ${showOverdueWarning ? "border-red-500/50" : "border-border"} rounded-xl p-4 transition-all hover:border-primary/50 cursor-pointer ${
        task.completed ? "opacity-50" : ""
      } relative`}
      onClick={() => setSelectedTask(task)}
    >
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={(e) => {
            e.stopPropagation()
            toggleComplete(task.id, task.completed)
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-5 h-5 mt-1 rounded border-border cursor-pointer accent-primary"
        />
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-foreground mb-2 ${task.completed ? "line-through" : ""}`}>
            {truncateText(task.title, 30)}
          </h3>
          {task.description && (
            <p className="text-sm text-muted-foreground mb-2">{truncateText(task.description, 30)}</p>
          )}
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
              <span className="relative z-10">+{task.xp || 3} XP</span>
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
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleFocusTask(task.id)
              }}
              className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Zap className="w-5 h-5" />
              Start Focus Session
            </button>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowTaskMenu(showTaskMenu === task.id ? null : task.id)
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </button>
              {showTaskMenu === task.id && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-xl z-10 min-w-[150px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setTaskToEdit(task)
                      setIsEditModalOpen(true)
                      setShowTaskMenu(null)
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-foreground"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm("Are you sure you want to delete this task?")) {
                        deleteTask(task.id)
                      }
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const truncateText = (text: string, limit = 30) => {
    if (text.length <= limit) return text
    return text.substring(0, limit) + "..."
  }

  useEffect(() => {
    if (!selectedTask?.due_date) return

    const updateTimer = () => {
      const now = new Date().getTime()
      const deadline = new Date(selectedTask.due_date!).getTime()
      const distance = deadline - now

      if (distance < 0) {
        setTimeRemaining("Overdue")
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [selectedTask?.due_date])

  return (
    <div className="space-y-6 md:space-y-8">
      {showXPToast && <XPToast xpAmount={xpToastData.xp} message={xpToastData.message} />}
      {showLevelUp && <LevelUpCelebration newLevel={newLevel} onClose={() => setShowLevelUp(false)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Tasks</h1>
          <p className="text-sm md:text-base text-muted-foreground">Organize and complete your daily quests</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-sm md:text-base"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          New Task
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-card border border-border rounded-xl p-3 md:p-4">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Active Tasks</p>
          <p className="text-2xl md:text-3xl font-bold text-foreground">{activeTasks.length}</p>
        </div>
        <div className="bg-card border border-red-500/30 rounded-xl p-3 md:p-4">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Overdue</p>
          <p className="text-2xl md:text-3xl font-bold text-red-400">{overdueTasks.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 md:p-4">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Today</p>
          <p className="text-2xl md:text-3xl font-bold text-primary">{tasksByCategory.today.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 md:p-4">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">This Week</p>
          <p className="text-2xl md:text-3xl font-bold text-accent">{tasksByCategory["this-week"].length}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "active" | "overdue")} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Active ({activeTasks.length})
          </TabsTrigger>
          <TabsTrigger value="overdue" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Overdue ({overdueTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground text-sm md:text-base">Loading tasks...</div>
          ) : (
            <div className="space-y-6">
              {/* Today */}
              <div>
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  Today
                </h2>
                <div className="space-y-3">
                  {tasksByCategory.today.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="relative inline-block">
                        <Calendar className="w-16 h-16 text-muted-foreground/30 animate-bounce" />
                        <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full animate-pulse" />
                      </div>
                      <p className="text-muted-foreground">No tasks for today. Create one to get started!</p>
                    </div>
                  ) : (
                    tasksByCategory.today.map((task) => <TaskCard key={task.id} task={task} />)
                  )}
                </div>
              </div>

              {/* This Week */}
              <div>
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                  This Week
                </h2>
                <div className="space-y-3">
                  {tasksByCategory["this-week"].length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No tasks for this week</p>
                  ) : (
                    tasksByCategory["this-week"].map((task) => <TaskCard key={task.id} task={task} />)
                  )}
                </div>
              </div>

              {/* Someday */}
              <div>
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                  Someday
                </h2>
                <div className="space-y-3">
                  {tasksByCategory.someday.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No tasks for someday</p>
                  ) : (
                    tasksByCategory.someday.map((task) => <TaskCard key={task.id} task={task} />)
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground text-sm md:text-base">Loading tasks...</div>
          ) : overdueTasks.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="relative inline-block">
                <Calendar className="w-16 h-16 text-green-500/30" />
                <div className="absolute inset-0 bg-green-500/10 blur-xl rounded-full animate-pulse" />
              </div>
              <p className="text-muted-foreground text-lg font-semibold">All caught up!</p>
              <p className="text-sm text-muted-foreground">No overdue tasks. Keep up the great work!</p>
            </div>
          ) : (
            <div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-400 mb-1">Streak Warning!</h3>
                      <p className="text-sm text-muted-foreground">
                        You have {overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""}. Complete them
                        to maintain your streak. At midnight, overdue tasks will reset your streak to 0.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {overdueTasks.map((task) => (
                  <TaskCard key={task.id} task={task} showOverdueWarning />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={selectedTask.completed}
                  onChange={() => {
                    toggleComplete(selectedTask.id, selectedTask.completed)
                    setSelectedTask(null)
                  }}
                  className="w-6 h-6 mt-1 rounded border-border cursor-pointer accent-primary flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h2
                    className={`text-2xl md:text-3xl font-bold text-foreground mb-2 break-all ${selectedTask.completed ? "line-through" : ""}`}
                  >
                    {selectedTask.title}
                  </h2>
                  {selectedTask.description && (
                    <p className="text-muted-foreground leading-relaxed mb-4 break-words whitespace-pre-wrap">
                      {selectedTask.description}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="ml-4 p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <div
                  className={`px-4 py-2 text-sm md:text-base font-semibold rounded-full border ${getPriorityColor(selectedTask.priority)}`}
                >
                  Priority: {selectedTask.priority}
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-white rounded-full shadow-lg flex items-center gap-2">
                  <Zap className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="font-bold md:text-lg">+{selectedTask.xp || 3} XP</span>
                </div>
                {selectedTask.category && (
                  <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full font-semibold flex items-center gap-1 border border-emerald-500/30">
                    <Zap className="w-4 h-4 md:w-5 md:h-5" />#{selectedTask.category}
                  </div>
                )}
              </div>

              {selectedTask.due_date && (
                <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                  Due: {new Date(selectedTask.due_date).toLocaleDateString()}
                </div>
              )}

              {selectedTask.due_date && !selectedTask.completed && (
                <div
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
                    timeRemaining === "Overdue"
                      ? "bg-red-500/10 border-red-500/30 text-red-400"
                      : "bg-primary/10 border-primary/30 text-primary"
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  <div className="flex flex-col">
                    <span className="text-xs opacity-70">Time Remaining</span>
                    <span className="font-bold text-lg">{timeRemaining}</span>
                  </div>
                </div>
              )}

              {selectedTask.goal_id && (
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg">
                  <Target className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  <span className="text-sm md:text-base text-primary font-semibold">Linked to a goal</span>
                </div>
              )}

              {!selectedTask.completed && (
                <button
                  onClick={() => {
                    handleFocusTask(selectedTask.id)
                    setSelectedTask(null)
                  }}
                  className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Zap className="w-5 h-5 md:w-6 md:h-6" />
                  Start Focus Session
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <TaskCreationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreateTask={handleCreateTask} />
      {taskToEdit && (
        <TaskCreationModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setTaskToEdit(null)
          }}
          onCreateTask={handleEditTask}
          initialData={{
            name: taskToEdit.title,
            description: taskToEdit.description || "",
            priority: taskToEdit.priority,
            tags: taskToEdit.category?.split(",").filter(Boolean) || [],
            linkedGoal: taskToEdit.goal_id || "",
            when: taskToEdit.due_date
              ? isToday(taskToEdit.due_date)
                ? "today"
                : isThisWeek(taskToEdit.due_date)
                  ? "this-week"
                  : "someday"
              : "someday",
          }}
          mode="edit"
        />
      )}
    </div>
  )
}
