"use client"

import { X, CheckCircle2, Lightbulb } from "lucide-react"
import { useState } from "react"

interface Milestone {
  id: string
  title: string
  completed: boolean
  xp: number
}

interface LinkedTask {
  id: string
  title: string
  category: string
  completed: boolean
}

interface GoalDetail {
  id: string
  title: string
  description: string
  image: string
  motivation: string
  milestones: Milestone[]
  linkedTasks: LinkedTask[]
  progress: number
  xp: number
  maxXp: number
  timeline: "weekly" | "monthly" | "yearly"
}

interface GoalDetailDrawerProps {
  goal: GoalDetail | null
  isOpen: boolean
  onClose: () => void
}

export function GoalDetailDrawer({ goal, isOpen, onClose }: GoalDetailDrawerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(goal?.milestones || [])

  if (!isOpen || !goal) return null

  const toggleMilestone = (id: string) => {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m)))
  }

  const completedMilestones = milestones.filter((m) => m.completed).length

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-primary/20">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="sticky top-4 right-4 z-10 p-2 hover:bg-muted rounded-lg transition-colors float-right"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Goal Banner */}
        <div className="relative h-48 overflow-hidden rounded-t-2xl">
          <img
            src={goal.image || "/placeholder.svg"}
            alt={goal.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/80"></div>
          <h2 className="absolute bottom-4 left-4 text-3xl font-bold text-foreground">{goal.title}</h2>
        </div>

        <div className="p-8 space-y-8">
          {/* Description */}
          <div>
            <p className="text-foreground text-base leading-relaxed">{goal.description}</p>
          </div>

          {/* Motivation Section */}
          <div className="bg-muted/50 border border-primary/20 rounded-lg p-4 flex gap-3">
            <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground mb-1">Why This Matters</h4>
              <p className="text-muted-foreground text-sm italic">{goal.motivation}</p>
            </div>
          </div>

          {/* Progress Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-foreground">Overall Progress</h3>
              <span className="text-lg font-bold text-primary">{goal.progress}%</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-300"
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {goal.xp} / {goal.maxXp} XP
            </p>
          </div>

          {/* Milestones Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              Milestones ({completedMilestones} / {milestones.length})
            </h3>
            <div className="space-y-2">
              {milestones.map((milestone) => (
                <button
                  key={milestone.id}
                  onClick={() => toggleMilestone(milestone.id)}
                  className="w-full flex items-center gap-3 p-3 bg-muted/50 hover:bg-muted/80 rounded-lg transition-colors group text-left"
                >
                  <CheckCircle2
                    className={`w-5 h-5 flex-shrink-0 transition-all ${
                      milestone.completed ? "text-primary fill-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`flex-1 transition-colors ${
                      milestone.completed
                        ? "text-muted-foreground line-through"
                        : "text-foreground group-hover:text-primary"
                    }`}
                  >
                    {milestone.title}
                  </span>
                  <span className="text-xs font-semibold text-primary">+{milestone.xp} XP</span>
                </button>
              ))}
            </div>
          </div>

          {/* Linked Tasks */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Linked Tasks ({goal.linkedTasks.length})</h3>
            <div className="space-y-2">
              {goal.linkedTasks.length > 0 ? (
                goal.linkedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <input type="checkbox" defaultChecked={task.completed} className="w-4 h-4 accent-primary" />
                    <span className={task.completed ? "text-muted-foreground line-through" : "text-foreground"}>
                      {task.title}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">{task.category}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No linked tasks yet</p>
              )}
            </div>
            <button className="w-full mt-4 px-4 py-2 border border-primary/50 text-primary rounded-lg hover:bg-primary/10 transition-colors font-medium text-sm">
              + Add Task to This Goal
            </button>
          </div>

          {/* Timeline Info */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Timeline</span>
            <span className="capitalize font-semibold text-foreground">{goal.timeline} Goal</span>
          </div>
        </div>
      </div>
    </div>
  )
}
