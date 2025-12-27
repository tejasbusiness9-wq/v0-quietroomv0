"use client"

import { ChevronDown, X, Calendar, Zap, Target, MoreVertical, Edit2, Trash2, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { GoalCreationWizard } from "@/components/goal-creation-wizard"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface Goal {
  id: string
  title: string
  progress: number
  xp: number
  max_xp: number
  timeline: string
  target_date?: string
  status: string
  target_hours?: number
  description?: string
  motivation?: string
  image_url?: string
}

interface GoalsListProps {
  onGoalSelect?: (goalId: string) => void
}

export function GoalsList({ onGoalSelect }: GoalsListProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    daily: true,
    weekly: true,
    monthly: true,
    yearly: false,
  })
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [showGoalMenu, setShowGoalMenu] = useState<string | null>(null)
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null)
  const [isEditWizardOpen, setIsEditWizardOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"active" | "overdue">("active")

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setGoals(data)
    }
    setLoading(false)
  }

  const isGoalOverdue = (goal: Goal) => {
    if (!goal.target_date || goal.status === "completed") return false
    const now = new Date()
    const target = new Date(goal.target_date)
    return target < now
  }

  const activeGoals = goals.filter((g) => !isGoalOverdue(g))
  const overdueGoals = goals.filter((g) => isGoalOverdue(g))

  const activeGoalsByTimeline = {
    daily: activeGoals.filter((g) => g.timeline === "daily"),
    weekly: activeGoals.filter((g) => g.timeline === "weekly"),
    monthly: activeGoals.filter((g) => g.timeline === "monthly"),
    yearly: activeGoals.filter((g) => g.timeline === "yearly"),
  }

  const overdueGoalsByTimeline = {
    daily: overdueGoals.filter((g) => g.timeline === "daily"),
    weekly: overdueGoals.filter((g) => g.timeline === "weekly"),
    monthly: overdueGoals.filter((g) => g.timeline === "monthly"),
    yearly: overdueGoals.filter((g) => g.timeline === "yearly"),
  }

  const toggleSection = (section: "daily" | "weekly" | "monthly" | "yearly") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const deleteGoal = async (id: string) => {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("goals").delete().eq("id", id)

    if (!error) {
      fetchGoals()
      setShowGoalMenu(null)
      setSelectedGoal(null)
    }
  }

  const handleEditGoal = async (updatedGoal: any) => {
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

  const getDaysRemaining = (targetDate?: string) => {
    if (!targetDate) return undefined
    const now = new Date()
    const target = new Date(targetDate)
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  const truncateText = (text: string, limit = 30) => {
    if (text.length <= limit) return text
    return text.substring(0, limit) + "..."
  }

  const GoalCard = ({ goal, showOverdueWarning }: { goal: Goal; showOverdueWarning?: boolean }) => {
    const daysRemaining = getDaysRemaining(goal.target_date)
    const estimatedHours = goal.target_hours || Math.ceil(goal.max_xp / 300)
    const estimatedAura = estimatedHours * 10

    return (
      <div className="relative">
        <button
          onClick={() => setSelectedGoal(goal)}
          className={`bg-card border ${showOverdueWarning ? "border-red-500/50" : "border-border"} rounded-lg p-4 hover:border-primary/50 transition-colors text-left group w-full`}
        >
          {showOverdueWarning && (
            <div className="absolute top-2 right-2 bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-red-500/30 z-10">
              <AlertTriangle className="w-3 h-3" />
              OVERDUE
            </div>
          )}
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors flex-1">
              {truncateText(goal.title, 30)}
            </h4>
            <div className="flex items-center gap-2">
              {daysRemaining !== undefined && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">{daysRemaining} days left</span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowGoalMenu(showGoalMenu === goal.id ? null : goal.id)
                }}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary font-semibold">{goal.progress}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-300"
                style={{ width: `${goal.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {goal.xp} / {goal.max_xp} XP
              </p>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full">
                <img src="/images/aura.jpg" alt="Aura" className="w-3 h-3 rounded-full" />
                <span className="text-xs font-semibold text-purple-400">~{estimatedAura}</span>
              </div>
            </div>
          </div>
        </button>

        {showGoalMenu === goal.id && (
          <div className="absolute right-2 top-12 bg-card border border-border rounded-lg shadow-xl z-10 min-w-[150px]">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setGoalToEdit(goal)
                setIsEditWizardOpen(true)
                setShowGoalMenu(null)
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-foreground rounded-t-lg"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm("Are you sure you want to delete this goal?")) {
                  deleteGoal(goal.id)
                }
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-red-500 rounded-b-lg"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    )
  }

  const SectionHeader = ({
    title,
    count,
    section,
    color,
  }: {
    title: string
    count: number
    section: "daily" | "weekly" | "monthly" | "yearly"
    color: string
  }) => {
    const isExpanded = expandedSections[section]
    return (
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg mb-4 group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{count} goals</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>
    )
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading goals...</div>
  }

  return (
    <div className="mt-8">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "active" | "overdue")} className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Active ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="overdue" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Overdue ({overdueGoals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6 mt-6">
          {activeGoalsByTimeline.daily.length > 0 && (
            <>
              <SectionHeader
                title="Daily Goals"
                count={activeGoalsByTimeline.daily.length}
                section="daily"
                color="bg-green-500/70"
              />
              {expandedSections.daily && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {activeGoalsByTimeline.daily.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeGoalsByTimeline.weekly.length > 0 && (
            <>
              <SectionHeader
                title="Weekly Goals"
                count={activeGoalsByTimeline.weekly.length}
                section="weekly"
                color="bg-blue-500/70"
              />
              {expandedSections.weekly && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {activeGoalsByTimeline.weekly.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeGoalsByTimeline.monthly.length > 0 && (
            <>
              <SectionHeader
                title="Monthly Goals"
                count={activeGoalsByTimeline.monthly.length}
                section="monthly"
                color="bg-purple-500/70"
              />
              {expandedSections.monthly && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {activeGoalsByTimeline.monthly.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeGoalsByTimeline.yearly.length > 0 && (
            <>
              <SectionHeader
                title="Yearly Goals"
                count={activeGoalsByTimeline.yearly.length}
                section="yearly"
                color="bg-amber-500/70"
              />
              {expandedSections.yearly && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeGoalsByTimeline.yearly.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeGoals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-2">Your Quest Log is empty</p>
              <p className="text-sm text-muted-foreground">Start a new campaign by creating your first goal</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-6 mt-6">
          {overdueGoals.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="relative inline-block">
                <Target className="w-16 h-16 text-green-500/30" />
                <div className="absolute inset-0 bg-green-500/10 blur-xl rounded-full animate-pulse" />
              </div>
              <p className="text-muted-foreground text-lg font-semibold">All goals on track!</p>
              <p className="text-sm text-muted-foreground">No overdue goals. Keep pushing forward!</p>
            </div>
          ) : (
            <>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-400 mb-1">Overdue Goals</h3>
                    <p className="text-sm text-muted-foreground">
                      You have {overdueGoals.length} overdue goal{overdueGoals.length > 1 ? "s" : ""}. Complete them to
                      maintain your momentum and avoid streak resets.
                    </p>
                  </div>
                </div>
              </div>

              {overdueGoalsByTimeline.daily.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    Daily Goals
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {overdueGoalsByTimeline.daily.map((goal) => (
                      <GoalCard key={goal.id} goal={goal} showOverdueWarning />
                    ))}
                  </div>
                </div>
              )}

              {overdueGoalsByTimeline.weekly.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    Weekly Goals
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {overdueGoalsByTimeline.weekly.map((goal) => (
                      <GoalCard key={goal.id} goal={goal} showOverdueWarning />
                    ))}
                  </div>
                </div>
              )}

              {overdueGoalsByTimeline.monthly.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    Monthly Goals
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {overdueGoalsByTimeline.monthly.map((goal) => (
                      <GoalCard key={goal.id} goal={goal} showOverdueWarning />
                    ))}
                  </div>
                </div>
              )}

              {overdueGoalsByTimeline.yearly.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    Yearly Goals
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {overdueGoalsByTimeline.yearly.map((goal) => (
                      <GoalCard key={goal.id} goal={goal} showOverdueWarning />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {selectedGoal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedGoal(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1 pr-4">
                <h2 className="text-2xl font-bold text-foreground mb-2 break-all">{selectedGoal.title}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-6">
              {selectedGoal.description && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">Description</h3>
                  <p className="text-sm text-muted-foreground break-words whitespace-pre-wrap">
                    {selectedGoal.description}
                  </p>
                </div>
              )}

              {selectedGoal.motivation && (
                <div className="space-y-2 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/30">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-400" />
                    Why does this matter?
                  </h3>
                  <p className="text-sm text-muted-foreground break-words whitespace-pre-wrap">
                    {selectedGoal.motivation}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-2xl font-bold text-primary">{selectedGoal.progress}%</span>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">XP Reward</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{selectedGoal.max_xp} XP</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <img src="/images/aura.jpg" alt="Aura" className="w-4 h-4 rounded-full" />
                    <span className="text-xs text-muted-foreground">Aura Reward</span>
                  </div>
                  <p className="text-xl font-bold text-purple-400">
                    ~{(selectedGoal.target_hours || Math.ceil(selectedGoal.max_xp / 300)) * 10}
                  </p>
                </div>
              </div>

              {selectedGoal.target_date && (
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Target Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedGoal.target_date).toLocaleDateString()}
                      <span className="ml-2">({getDaysRemaining(selectedGoal.target_date)} days remaining)</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
    </div>
  )
}
