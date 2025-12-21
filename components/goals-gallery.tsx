"use client"

import type React from "react"

import { Plus, ImageIcon } from "lucide-react"
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

    // Convert file to base64 or blob URL for display
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

  return (
    <>
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-foreground mb-4">Vision Wall</h3>
        <p className="text-sm text-muted-foreground mb-4">Your inspiration board • Add images that motivate you</p>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {/* Add Vision Item Card */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex-shrink-0 w-48 h-48 rune-card hover:shadow-2xl hover:shadow-primary/25 cursor-pointer transition-all duration-300 flex items-center justify-center group"
          >
            <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
              <div className="w-12 h-12 rounded-lg border-2 border-primary/40 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium">Add Image</span>
            </div>
          </button>

          {/* Vision Board Items */}
          {visionItems.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-48 h-48 rune-card hover:shadow-2xl hover:shadow-primary/25 cursor-pointer transition-all duration-300 overflow-hidden"
            >
              <img
                src={item.image_url || "/placeholder.svg"}
                alt={item.title || "Vision board item"}
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {visionItems.length === 0 && !loading && (
            <div className="flex-shrink-0 w-48 h-48 border-2 border-dashed border-border rounded-xl flex items-center justify-center">
              <p className="text-sm text-muted-foreground text-center px-4">Add your first inspiration image</p>
            </div>
          )}
        </div>
      </div>

      {/* Active Goals Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Active Goals</h3>
          <Button onClick={() => setIsWizardOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {goals.map((goal) => (
            <div
              key={goal.id}
              onClick={() => onGoalSelect?.(goal.id)}
              className="flex-shrink-0 w-64 rune-card hover:shadow-2xl hover:shadow-primary/25 cursor-pointer transition-all duration-300 group"
            >
              <div className="relative h-32 overflow-hidden rounded-t-2xl">
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
              <div className="p-4">
                <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
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
            <div className="flex-shrink-0 w-64 border-2 border-dashed border-border rounded-xl p-6 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Your Quest Log is empty</p>
                <p className="text-xs text-muted-foreground">Start a new campaign</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vision Item Upload Dialog */}
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
    </>
  )
}
