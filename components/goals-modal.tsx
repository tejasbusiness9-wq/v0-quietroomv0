"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { useState } from "react"
import type { GoalsModalProps } from "@/types/goals"

export function GoalsModal({ isOpen, onClose, onCreateGoal }: GoalsModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const handleCreate = () => {
    if (title.length > 0 && description.length > 0) {
      onCreateGoal?.({ title, description })
      setTitle("")
      setDescription("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Create Goal</h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Goal Title <span className="text-red-400">*</span>
              <span className={`ml-2 text-xs ${title.length > 60 ? "text-red-400" : "text-muted-foreground"}`}>
                ({title.length}/60)
              </span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to achieve?"
              maxLength={60}
              className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Why does this matter to you? <span className="text-red-400">*</span>
              <span className={`ml-2 text-xs ${description.length > 300 ? "text-red-400" : "text-muted-foreground"}`}>
                ({description.length}/300)
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe why this goal is important to you and what achieving it means..."
              rows={5}
              maxLength={300}
              className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-sm font-semibold text-primary mb-1">Aura Rewards</p>
            <p className="text-xs text-muted-foreground">
              Complete this goal to earn 10 Aura per hour invested. The more time you dedicate, the more Aura you'll
              earn!
            </p>
          </div>

          <button
            onClick={handleCreate}
            disabled={!title.trim() || title.length > 60 || !description.trim() || description.length > 300}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Goal
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
