"use client"

import type React from "react"

import { Plus, ImageIcon, MoreVertical, Edit2, Trash2, X, Target, Zap } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { GoalCreationWizard } from "@/components/goal-creation-wizard"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface VisionBoardItem {
  id: string
  image_url: string
  title?: string
  upload_type?: string
}

interface Goal {
  id: string
  title: string
  image_url: string
  progress: number
  timeline: string
  xp: number
  max_xp: number
  target_hours: number
  motivation: string
}

interface NewGoal {
  title: string
  category: string
  motivation: string
  image: string
  target_hours: number
}

interface GoalsGalleryProps {
  onGoalSelect?: (goalId: string) => void
}

export function GoalsGallery({ onGoalSelect }: GoalsGalleryProps) {
  const [visionItems, setVisionItems] = useState<VisionBoardItem[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [imageTitle, setImageTitle] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showGoalMenu, setShowGoalMenu] = useState<string | null>(null)
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null)
  const [isEditWizardOpen, setIsEditWizardOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCreateGoal = async (goal: NewGoal) => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const calculated_max_xp = goal.target_hours * 60 * 5

    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      title: goal.title,
      timeline: goal.category,
      motivation: goal.motivation,
      image_url: goal.image,
      target_hours: goal.target_hours,
      max_xp: calculated_max_xp,
      xp: 0,
      progress: 0,
      status: "active",
    })

    if (!error) {
      fetchGoals()
      setIsWizardOpen(false)
    }
  }

  useEffect(() => {
    fetchVisionItems()
    fetchGoals()
  }, [])

  const fetchVisionItems = async () => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("vision_board_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setVisionItems(data)
    }
    setLoading(false)
  }

  const fetchGoals = async () => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setGoals(data)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setUploading(false)
      return
    }

    const reader = new FileReader()
    reader.onload = async (event) => {
      const imageUrl = event.target?.result as string

      const { error } = await supabase.from("vision_board_items").insert({
        user_id: user.id,
        image_url: imageUrl,
        title: imageTitle || file.name,
        upload_type: "file",
      })

      if (!error) {
        fetchVisionItems()
        setImageTitle("")
        setIsUploadOpen(false)
      }
      setUploading(false)
    }

    reader.readAsDataURL(file)
  }

  const deleteVisionItem = async (id: string) => {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("vision_board_items").delete().eq("id", id)

    if (!error) {
      fetchVisionItems()
    }
  }

  const deleteGoal = async (id: string) => {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("goals").delete().eq("id", id)

    if (!error) {
      fetchGoals()
      setShowGoalMenu(null)
    }
  }

  const handleEditGoal = async (updatedGoal: NewGoal) => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !goalToEdit) return

    const calculated_max_xp = updatedGoal.target_hours * 60 * 5

    const { error } = await supabase
      .from("goals")
      .update({
        title: updatedGoal.title,
        timeline: updatedGoal.category,
        motivation: updatedGoal.motivation,
        image_url: updatedGoal.image,
        target_hours: updatedGoal.target_hours,
        max_xp: calculated_max_xp,
      })
      .eq("id", goalToEdit.id)

    if (!error) {
      fetchGoals()
      setIsEditWizardOpen(false)
      setGoalToEdit(null)
      setShowGoalMenu(null)
    }
  }

  return (
    <>
      <div className="mb-8 md:mb-12">
        <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">Vision Wall</h3>
        <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
          Your inspiration board • Add images that motivate you
        </p>

        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-background/20 hover:scrollbar-thumb-purple-500">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex-shrink-0 w-40 h-40 md:w-48 md:h-48 rune-card hover:shadow-2xl hover:shadow-primary/25 cursor-pointer transition-all duration-300 flex items-center justify-center group"
          >
            <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 border-primary/40 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Plus className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className="text-xs md:text-sm font-medium">Add Image</span>
            </div>
          </button>

          {visionItems.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-40 h-40 md:w-48 md:h-48 rune-card hover:shadow-2xl hover:shadow-primary/25 cursor-pointer transition-all duration-300 overflow-hidden relative group"
            >
              <img
                src={item.image_url || "/placeholder.svg"}
                alt={item.title || "Vision board item"}
                className="w-full h-full object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm("Delete this image from your vision wall?")) {
                    deleteVisionItem(item.id)
                  }
                }}
                className="absolute top-2 right-2 w-7 h-7 md:w-8 md:h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          ))}

          {visionItems.length === 0 && !loading && (
            <div className="flex-shrink-0 w-40 h-40 md:w-48 md:h-48 border-2 border-dashed border-border rounded-xl flex items-center justify-center">
              <p className="text-xs md:text-sm text-muted-foreground text-center px-4">
                Add your first inspiration image
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8 md:mb-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-foreground">Active Goals</h3>
          <Button onClick={() => setIsWizardOpen(true)} size="sm" className="text-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>

        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-background/20 hover:scrollbar-thumb-purple-500">
          {goals.map((goal) => (
            <div
              key={goal.id}
              onClick={() => setSelectedGoal(goal)}
              className="flex-shrink-0 w-56 md:w-64 rune-card hover:shadow-2xl hover:shadow-primary/25 cursor-pointer transition-all duration-300 group relative"
            >
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowGoalMenu(showGoalMenu === goal.id ? null : goal.id)
                  }}
                  className="p-1.5 md:p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors backdrop-blur-sm"
                >
                  <MoreVertical className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </button>
                {showGoalMenu === goal.id && (
                  <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-xl min-w-[140px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setGoalToEdit(goal)
                        setIsEditWizardOpen(true)
                        setShowGoalMenu(null)
                      }}
                      className="w-full px-3 md:px-4 py-2 text-left text-xs md:text-sm hover:bg-muted flex items-center gap-2 text-foreground rounded-t-lg"
                    >
                      <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm("Are you sure you want to delete this goal?")) {
                          deleteGoal(goal.id)
                        }
                      }}
                      className="w-full px-3 md:px-4 py-2 text-left text-xs md:text-sm hover:bg-muted flex items-center gap-2 text-red-500 rounded-b-lg"
                    >
                      <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <div className="relative h-28 md:h-32 overflow-hidden rounded-t-2xl">
                {goal.image_url ? (
                  <img
                    src={goal.image_url || "/placeholder.svg"}
                    alt={goal.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
              </div>
              <div className="p-3 md:p-4">
                <h4 className="font-semibold text-sm md:text-base text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {goal.title}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground capitalize">{goal.timeline}</span>
                    <span className="text-primary font-semibold">{goal.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {goal.xp} / {goal.max_xp} XP
                  </p>
                </div>
              </div>
            </div>
          ))}

          {goals.length === 0 && !loading && (
            <div className="flex-shrink-0 w-56 md:w-64 border-2 border-dashed border-border rounded-xl p-4 md:p-6 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs md:text-sm text-muted-foreground mb-2">Your Quest Log is empty</p>
                <p className="text-xs text-muted-foreground">Start a new campaign</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vision Board Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Upload Image File</label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full px-4 py-8 border-2 border-dashed border-border rounded-lg hover:border-primary/50 transition-colors flex flex-col items-center gap-2 disabled:opacity-50"
              >
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {uploading ? "Uploading..." : "Click to select an image"}
                </span>
                <span className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</span>
              </button>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Title (optional)</label>
              <input
                type="text"
                placeholder="My inspiration"
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <GoalCreationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreateGoal={handleCreateGoal}
      />

      {goalToEdit && (
        <GoalCreationWizard
          isOpen={isEditWizardOpen}
          onClose={() => {
            setIsEditWizardOpen(false)
            setGoalToEdit(null)
          }}
          onCreateGoal={handleEditGoal}
          initialData={{
            title: goalToEdit.title,
            category: goalToEdit.timeline,
            motivation: goalToEdit.motivation,
            image: goalToEdit.image_url,
            target_hours: goalToEdit.target_hours,
          }}
          mode="edit"
        />
      )}

      {selectedGoal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedGoal(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 md:p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4 md:mb-6">
              <div className="flex-1 pr-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 break-all">{selectedGoal.title}</h2>
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      selectedGoal.timeline === "daily"
                        ? "bg-green-500"
                        : selectedGoal.timeline === "weekly"
                          ? "bg-blue-500"
                          : selectedGoal.timeline === "monthly"
                            ? "bg-purple-500"
                            : "bg-amber-500"
                    }`}
                  />
                  <span className="capitalize">{selectedGoal.timeline} Goal</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedGoal(null)}
                className="ml-4 p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4 md:space-y-6">
              {selectedGoal.motivation && (
                <div className="space-y-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-3 md:p-4 border border-purple-500/30">
                  <h3 className="text-xs md:text-sm font-semibold text-foreground flex items-center gap-2">
                    <Target className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
                    Why does this matter?
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground break-words whitespace-pre-wrap">
                    {selectedGoal.motivation}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm text-muted-foreground">Progress</span>
                  <span className="text-xl md:text-2xl font-bold text-primary">{selectedGoal.progress}%</span>
                </div>
                <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary/60 rounded-full transition-all duration-300 shadow-lg"
                    style={{ width: `${selectedGoal.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{selectedGoal.xp} XP earned</span>
                  <span className="text-muted-foreground">{selectedGoal.max_xp} XP total</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-muted/50 rounded-lg p-3 md:p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">XP Reward</span>
                  </div>
                  <p className="text-lg md:text-xl font-bold text-foreground">{selectedGoal.max_xp} XP</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-3 md:p-4 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <img src="/images/aura.jpg" alt="Aura" className="w-3 h-3 md:w-4 md:h-4 rounded-full" />
                    <span className="text-xs text-muted-foreground">Aura Reward</span>
                  </div>
                  <p className="text-lg md:text-xl font-bold text-purple-400">
                    ~{(selectedGoal.target_hours || Math.ceil(selectedGoal.max_xp / 300)) * 10}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
