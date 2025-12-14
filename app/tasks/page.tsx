"use client"

import { Plus, Calendar, Tag, Target } from "lucide-react"
import { useState } from "react"
import { TaskCreationModal } from "@/components/task-creation-modal"

interface Task {
  id: string
  name: string
  when: "today" | "this-week" | "someday"
  priority: "low" | "medium" | "high"
  effort: "small" | "medium" | "large"
  completed: boolean
  description?: string
  linkedGoal?: string
  tags?: string[]
}

export default function TasksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      name: "Complete project proposal",
      when: "today",
      priority: "high",
      effort: "large",
      completed: false,
      tags: ["work", "urgent"],
    },
    {
      id: "2",
      name: "Review code for feature X",
      when: "this-week",
      priority: "medium",
      effort: "medium",
      completed: false,
      linkedGoal: "ui-ux-case-study",
    },
    {
      id: "3",
      name: "Update documentation",
      when: "someday",
      priority: "low",
      effort: "small",
      completed: false,
    },
  ])

  const handleCreateTask = (newTask: any) => {
    const task: Task = {
      id: Date.now().toString(),
      name: newTask.name,
      when: newTask.when,
      priority: newTask.priority,
      effort: newTask.effort,
      completed: false,
      description: newTask.description,
      linkedGoal: newTask.linkedGoal || undefined,
      tags: newTask.tags.length > 0 ? newTask.tags : undefined,
    }
    setTasks([...tasks, task])
  }

  const toggleComplete = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const tasksByWhen = {
    today: tasks.filter((t) => t.when === "today"),
    "this-week": tasks.filter((t) => t.when === "this-week"),
    someday: tasks.filter((t) => t.when === "someday"),
  }

  return (
    <div className="space-y-8">
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
      <div className="space-y-6">
        {/* Today */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Today
          </h2>
          <div className="space-y-3">
            {tasksByWhen.today.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No tasks for today</p>
            ) : (
              tasksByWhen.today.map((task) => (
                <div
                  key={task.id}
                  className={`bg-card border border-border rounded-xl p-4 transition-all hover:border-primary/50 ${
                    task.completed ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleComplete(task.id)}
                      className="w-5 h-5 mt-1 rounded border-border cursor-pointer accent-primary"
                    />
                    <div className="flex-1">
                      <h3 className={`font-semibold text-foreground mb-2 ${task.completed ? "line-through" : ""}`}>
                        {task.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                        <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                          {task.effort} effort
                        </span>
                        {task.linkedGoal && (
                          <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-full flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Linked to goal
                          </span>
                        )}
                        {task.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-accent/20 text-accent rounded-full flex items-center gap-1"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
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
              tasksByWhen["this-week"].map((task) => (
                <div
                  key={task.id}
                  className={`bg-card border border-border rounded-xl p-4 transition-all hover:border-primary/50 ${
                    task.completed ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleComplete(task.id)}
                      className="w-5 h-5 mt-1 rounded border-border cursor-pointer accent-primary"
                    />
                    <div className="flex-1">
                      <h3 className={`font-semibold text-foreground mb-2 ${task.completed ? "line-through" : ""}`}>
                        {task.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                        <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                          {task.effort} effort
                        </span>
                        {task.linkedGoal && (
                          <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-full flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Linked to goal
                          </span>
                        )}
                        {task.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-accent/20 text-accent rounded-full flex items-center gap-1"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
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
              tasksByWhen.someday.map((task) => (
                <div
                  key={task.id}
                  className={`bg-card border border-border rounded-xl p-4 transition-all hover:border-primary/50 ${
                    task.completed ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleComplete(task.id)}
                      className="w-5 h-5 mt-1 rounded border-border cursor-pointer accent-primary"
                    />
                    <div className="flex-1">
                      <h3 className={`font-semibold text-foreground mb-2 ${task.completed ? "line-through" : ""}`}>
                        {task.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                        <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                          {task.effort} effort
                        </span>
                        {task.linkedGoal && (
                          <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-full flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Linked to goal
                          </span>
                        )}
                        {task.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-accent/20 text-accent rounded-full flex items-center gap-1"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <TaskCreationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreateTask={handleCreateTask} />
    </div>
  )
}
