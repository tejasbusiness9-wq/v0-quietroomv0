import { Dialog, DialogContent } from "@/components/ui/dialog"
import type { GoalsModalProps } from "@/types/goals" // Assuming this is where GoalsModalProps is declared

export function GoalsModal({ isOpen, onClose, onCreateGoal }: GoalsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
          <p className="text-sm font-semibold text-primary mb-1">Aura Rewards</p>
          <p className="text-xs text-muted-foreground">
            Complete this goal to earn 10 Aura per hour invested. The more time you dedicate, the more Aura you'll earn!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
