"use client"

import type React from "react"

import { ChevronLeft, ChevronRight, Upload, X } from "lucide-react"
import { useState, useRef } from "react"

interface WizardStep {
  step: number
  title: string
  description: string
}

interface NewGoal {
  title: string
  category: "weekly" | "monthly" | "yearly"
  motivation: string
  milestones: string[]
  target_hours: number
  image: string
}

interface GoalCreationWizardProps {
  isOpen: boolean
  onClose: () => void
  onCreateGoal?: (goal: NewGoal) => void
}

export function GoalCreationWizard({ isOpen, onClose, onCreateGoal }: GoalCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [newGoal, setNewGoal] = useState<NewGoal>({
    title: "",
    category: "monthly",
    motivation: "",
    milestones: ["", "", ""],
    target_hours: 10,
    image: "",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const steps: WizardStep[] = [
    { step: 1, title: "What do you want to achieve?", description: "Be clear and specific" },
    { step: 2, title: "When do you want to complete it?", description: "Choose your timeline" },
    { step: 3, title: "Why does this matter?", description: "Connect emotionally" },
    { step: 4, title: "Break it into milestones", description: "Define measurable steps" },
    { step: 5, title: "How much time will this take?", description: "Set your target hours" },
    { step: 6, title: "Pick an inspiring image", description: "Make it visual" },
  ]

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      onCreateGoal?.(newGoal)
      onClose()
      resetWizard()
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        setNewGoal({ ...newGoal, image: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setNewGoal({ ...newGoal, image: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const generateGradient = () => {
    const gradients = [
      "from-purple-500 via-purple-600 to-pink-600",
      "from-blue-500 via-indigo-600 to-purple-600",
      "from-green-500 via-teal-600 to-cyan-600",
      "from-orange-500 via-red-500 to-pink-600",
      "from-indigo-500 via-purple-600 to-pink-600",
      "from-cyan-500 via-blue-600 to-indigo-600",
      "from-pink-500 via-purple-600 to-indigo-600",
      "from-emerald-500 via-green-600 to-teal-600",
    ]
    const hash = newGoal.title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return gradients[hash % gradients.length]
  }

  const resetWizard = () => {
    setCurrentStep(1)
    setNewGoal({
      title: "",
      category: "monthly",
      motivation: "",
      milestones: ["", "", ""],
      target_hours: 10,
      image: "",
    })
    setImagePreview(null)
  }

  const updateMilestone = (index: number, value: string) => {
    const updated = [...newGoal.milestones]
    updated[index] = value
    setNewGoal({ ...newGoal, milestones: updated })
  }

  const calculateEstimatedXP = (hours: number): number => {
    return hours * 60 * 5
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-card border border-border rounded-2xl max-w-2xl w-full shadow-2xl shadow-primary/20">
        {/* Progress Bar */}
        <div className="h-1 bg-muted flex">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`flex-1 transition-all ${index < currentStep ? "bg-primary" : "bg-muted"}`}
            ></div>
          ))}
        </div>

        <div className="p-8">
          {/* Step Header */}
          <div className="mb-8">
            <p className="text-sm text-muted-foreground mb-2">
              Step {currentStep} of {steps.length}
            </p>
            <h2 className="text-2xl font-bold text-foreground mb-1">{steps[currentStep - 1].title}</h2>
            <p className="text-muted-foreground">{steps[currentStep - 1].description}</p>
          </div>

          {/* Step Content */}
          <div className="mb-8 space-y-4">
            {currentStep === 1 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Build a portfolio website"
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground mb-2">Timeline</label>
                {(["weekly", "monthly", "yearly"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNewGoal({ ...newGoal, category: cat })}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      newGoal.category === cat
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 bg-muted/50"
                    }`}
                  >
                    <span className="font-semibold text-foreground capitalize">{cat} Goal</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {cat === "weekly" && "Achieve this within 7 days"}
                      {cat === "monthly" && "Achieve this within 30 days"}
                      {cat === "yearly" && "Achieve this within 365 days"}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Why does this matter to you?</label>
                <textarea
                  value={newGoal.motivation}
                  onChange={(e) => setNewGoal({ ...newGoal, motivation: e.target.value })}
                  placeholder="Write what this goal means to you..."
                  rows={4}
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground mb-2">Define 1-5 Milestones</label>
                {newGoal.milestones.slice(0, 3).map((milestone, index) => (
                  <input
                    key={index}
                    type="text"
                    value={milestone}
                    onChange={(e) => updateMilestone(index, e.target.value)}
                    placeholder={`Milestone ${index + 1}`}
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ))}
                <p className="text-xs text-muted-foreground mt-2">
                  Example: Week 1: Research, Week 2: Design, Week 3: Build
                </p>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-foreground mb-2">Target Hours</label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Light Work", hours: 5 },
                    { label: "Solid Grind", hours: 10 },
                    { label: "Hardcore", hours: 20 },
                  ].map((preset) => (
                    <button
                      key={preset.hours}
                      onClick={() => setNewGoal({ ...newGoal, target_hours: preset.hours })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        newGoal.target_hours === preset.hours
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 bg-muted/50"
                      }`}
                    >
                      <span className="font-semibold text-foreground block">{preset.label}</span>
                      <span className="text-xs text-muted-foreground block mt-1">{preset.hours} Hours</span>
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Or enter custom hours:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newGoal.target_hours}
                    onChange={(e) => setNewGoal({ ...newGoal, target_hours: Number.parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm text-foreground font-medium">
                    Estimated XP Value:{" "}
                    <span className="text-primary font-bold">
                      {calculateEstimatedXP(newGoal.target_hours).toLocaleString()}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Based on 5 XP per minute of focused work</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Tip: Be realistic! Each hour = 300 XP (60 min × 5 XP)
                </p>
              </div>
            )}

            {currentStep === 6 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Upload Goal Image (Optional)</label>
                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-foreground font-medium mb-1">Click to upload an image</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Goal preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-between">
            <button
              onClick={currentStep === 1 ? onClose : handlePrev}
              className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted/50 transition-colors font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              {currentStep === 1 ? "Cancel" : "Back"}
            </button>
            <button
              onClick={handleNext}
              disabled={(currentStep === 1 && !newGoal.title) || (currentStep === 3 && !newGoal.motivation)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === steps.length ? "Create Goal" : "Next"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
