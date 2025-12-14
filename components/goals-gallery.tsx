"use client"

import { Plus } from "lucide-react"
import { useState } from "react"
import { GoalCreationWizard } from "@/components/goal-creation-wizard"

interface Goal {
  id: string
  title: string
  image: string
  progress: number
  category: "monthly" | "yearly"
  xp: number
  maxXp: number
}

interface GoalsGalleryProps {
  onGoalSelect?: (goalId: string) => void
}

export function GoalsGallery({ onGoalSelect }: GoalsGalleryProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  const getGoalBackground = (goal: Goal) => {
    if (goal.image) {
      return (
        <img
          src={goal.image || "/placeholder.svg"}
          alt={goal.title}
          className="w-full h-full object-cover opacity-80"
        />
      )
    }
    const colors = [
      "from-purple-500 to-pink-500",
      "from-blue-500 to-cyan-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-purple-500",
    ]
    const hash = goal.title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const gradient = colors[hash % colors.length]
    return <div className={`w-full h-full bg-gradient-to-br ${gradient}`}></div>
  }

  const handleCreateGoal = (newGoal: any) => {
    const goal: Goal = {
      id: `g${goals.length + 1}`,
      title: newGoal.title,
      image: newGoal.image,
      progress: 0,
      category: newGoal.category === "weekly" ? "monthly" : newGoal.category,
      xp: 0,
      maxXp: newGoal.difficulty === "easy" ? 500 : newGoal.difficulty === "medium" ? 1000 : 1500,
    }
    setGoals([...goals, goal])
  }

  return (
    <>
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-foreground mb-4">Your Vision Board</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {goals.map((goal) => (
            <div
              key={goal.id}
              onClick={() => onGoalSelect?.(goal.id)}
              className="flex-shrink-0 w-48 rune-card hover:shadow-2xl hover:shadow-primary/25 cursor-pointer transition-all duration-300 group"
            >
              <div className="relative h-32 overflow-hidden rounded-t-2xl">
                {getGoalBackground(goal)}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"></div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {goal.title}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{goal.category === "monthly" ? "Monthly" : "Yearly"}</span>
                    <span className="text-primary font-semibold">{goal.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {goal.xp} / {goal.maxXp} XP
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Add Goal Card */}
          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex-shrink-0 w-48 rune-card hover:shadow-2xl hover:shadow-primary/25 cursor-pointer transition-all duration-300 flex items-center justify-center min-h-56 group"
          >
            <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
              <div className="w-12 h-12 rounded-lg border-2 border-primary/40 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Add Goal</span>
            </div>
          </button>
        </div>
      </div>

      <GoalCreationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreateGoal={handleCreateGoal}
      />
    </>
  )
}
