"use client"

import { Clock, Star, Zap } from "lucide-react"
import { MascotDialog } from "./mascot-dialog"

export function StatsSection() {
  return (
    <div className="mb-8 flex items-stretch gap-8">
      <div className="flex-1 grid grid-cols-3 gap-6">
        {/* Active Tasks */}
        <div className="rune-card p-6 flex flex-col justify-between min-h-48">
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-3 font-medium">Active Tasks</p>
              <p className="text-4xl font-bold text-foreground">4</p>
            </div>
            <div className="rune-icon">
              <Clock className="w-7 h-7 text-primary" />
            </div>
          </div>
          <div className="mt-auto pt-4 flex items-end justify-center">
            <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-28 h-16">
              <circle cx="100" cy="55" r="30" fill="none" stroke="hsl(290, 100%, 50%)" strokeWidth="2" opacity="0.4" />
              <circle
                cx="100"
                cy="55"
                r="20"
                fill="none"
                stroke="hsl(290, 100%, 50%)"
                strokeWidth="1.5"
                opacity="0.3"
              />
              <path
                d="M 85 55 L 95 65 L 115 45"
                stroke="hsl(290, 100%, 50%)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />
              <rect x="50" y="25" width="18" height="12" rx="2" fill="hsl(290, 100%, 50%)" opacity="0.5" />
              <rect x="132" y="30" width="18" height="10" rx="2" fill="hsl(290, 100%, 50%)" opacity="0.4" />
            </svg>
          </div>
        </div>

        {/* Completed Today */}
        <div className="rune-card p-6 flex flex-col justify-between min-h-48">
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-3 font-medium">Completed Today</p>
              <p className="text-4xl font-bold text-foreground">1</p>
            </div>
            <div className="rune-icon">
              <Star className="w-7 h-7 text-primary" />
            </div>
          </div>
          <div className="mt-auto pt-4 flex items-end justify-center">
            <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-28 h-16">
              <path
                d="M 50 70 L 60 40 L 75 55 L 100 30 L 125 55 L 140 40 L 150 70"
                fill="none"
                stroke="hsl(290, 100%, 50%)"
                strokeWidth="2.5"
                opacity="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line x1="50" y1="70" x2="150" y2="70" stroke="hsl(290, 100%, 50%)" strokeWidth="2" opacity="0.7" />
              <circle cx="60" cy="40" r="3.5" fill="hsl(290, 100%, 50%)" opacity="0.9" />
              <circle cx="100" cy="30" r="3.5" fill="hsl(290, 100%, 50%)" opacity="1" />
              <circle cx="140" cy="40" r="3.5" fill="hsl(290, 100%, 50%)" opacity="0.9" />
            </svg>
          </div>
        </div>

        {/* XP Earned Today */}
        <div className="rune-card p-6 flex flex-col justify-between min-h-48">
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-3 font-medium">XP Earned Today</p>
              <p className="text-4xl font-bold text-foreground">10</p>
            </div>
            <div className="rune-icon">
              <Zap className="w-7 h-7 text-yellow-500" />
            </div>
          </div>
          <div className="mt-auto pt-4 flex items-end justify-center">
            <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" className="w-28 h-16">
              <path d="M 100 35 L 115 65 L 100 75 L 85 65 Z" fill="hsl(290, 100%, 50%)" opacity="0.8" />
              <circle
                cx="100"
                cy="55"
                r="18"
                fill="none"
                stroke="hsl(290, 100%, 50%)"
                strokeWidth="1.5"
                opacity="0.6"
              />
              <line x1="100" y1="35" x2="100" y2="15" stroke="hsl(290, 100%, 50%)" strokeWidth="1.5" opacity="0.5" />
              <line x1="125" y1="55" x2="145" y2="55" stroke="hsl(290, 100%, 50%)" strokeWidth="1.5" opacity="0.5" />
              <line x1="75" y1="55" x2="55" y2="55" stroke="hsl(290, 100%, 50%)" strokeWidth="1.5" opacity="0.5" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div onMouseEnter={() => {}} className="w-full">
          <MascotDialog />
        </div>

        {/* Mascot Image */}
        <div className="mascot-container">
          <img src="/images/q-mascot1.png" alt="Q Mascot" className="mascot-image" />
        </div>
      </div>
    </div>
  )
}
