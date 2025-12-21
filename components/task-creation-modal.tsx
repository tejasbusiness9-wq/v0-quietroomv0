"use client"

import type React from "react"

import { X, ChevronDown, ChevronUp } from "lucide-react"
import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface NewTask {
  name: string
  when: "today" | "this-week" | "someday"
  description: string
  priority: "low" | "medium" | "high"
  effort: "small" | "medium" | "large"
  linkedGoal: string
  tags: string[]
}

interface TaskCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateTask?: (task: NewTask) => void
}

export function TaskCreationModal({ isOpen, onClose, onCreateTask }: TaskCreationModalProps) {
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [newTask, setNewTask] = useState<NewTask>({
    name: "",
    when: "today",
    description: "",
    priority: "medium",
    effort: "medium",
    linkedGoal: "",
    tags: [],
  })
  const [tagInput, setTagInput] = useState("")
  const [goals, setGoals] = useState<any[]>([])
  const [loadingGoals, setLoadingGoals] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchGoals()
    }
  }, [isOpen])

  const fetchGoals = async () => {
    setLoadingGoals(true)
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoadingGoals(false)
      return
    }

    const { data, error } = await supabase
      .from("goals")
      .select("id, title, category")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setGoals(data)
    }
    setLoadingGoals(false)
  }

  const handleCreateTask = () => {
    if (!newTask.name.trim()) return
    onCreateTask?.(newTask)
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setNewTask({
      name: "",
      when: "today",
      description: "",
      priority: "medium",
      effort: "medium",
      linkedGoal: "",
      tags: [],
    })
    setShowMoreOptions(false)
    setTagInput("")
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !newTask.tags.includes(tagInput.trim())) {
      setNewTask({ ...newTask, tags: [...newTask.tags, tagInput.trim()] })
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setNewTask({ ...newTask, tags: newTask.tags.filter((t) => t !== tag) })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      handleAddTag()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full shadow-2xl shadow-primary/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">Create Task</h2>
          <button
            onClick={() => {
              resetForm()
              onClose()
            }}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Task name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              placeholder="Enter your task..."
              className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* When to do it */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">When to do it?</label>
            <div className="flex gap-3">
              {(["today", "this-week", "someday"] as const).map((when) => (
                <button
                  key={when}
                  onClick={() => setNewTask({ ...newTask, when })}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all font-medium ${
                    newTask.when === when
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-foreground"
                  }`}
                >
                  {when === "today" && "Today"}
                  {when === "this-week" && "This Week"}
                  {when === "someday" && "Someday"}
                </button>
              ))}
            </div>
          </div>

          {/* More Options Toggle */}
          <button
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {showMoreOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            More options
          </button>

          {/* Expandable More Options */}
          {showMoreOptions && (
            <div className="space-y-5 pt-2 border-t border-border animate-in slide-in-from-top-2">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Add details about this task..."
                  rows={3}
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Priority</label>
                <div className="flex gap-3">
                  {(["low", "medium", "high"] as const).map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setNewTask({ ...newTask, priority })}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all font-medium capitalize ${
                        newTask.priority === priority
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 text-foreground"
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link to Goal */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Link to goal</label>
                <select
                  value={newTask.linkedGoal}
                  onChange={(e) => setNewTask({ ...newTask, linkedGoal: e.target.value })}
                  disabled={loadingGoals}
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  <option value="">None</option>
                  {loadingGoals ? (
                    <option disabled>Loading goals...</option>
                  ) : goals.length === 0 ? (
                    <option disabled>No goals yet. Create one first!</option>
                  ) : (
                    goals.map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.title}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag..."
                    className="flex-1 px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                {newTask.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                    {newTask.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-gradient-to-r from-primary/20 to-accent/20 text-primary rounded-full text-sm font-semibold flex items-center gap-2 border border-primary/30 shadow-md hover:shadow-lg transition-all"
                      >
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-primary/70 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <button
            onClick={handleCreateTask}
            disabled={!newTask.name.trim()}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  )
}
