"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, ImageIcon } from "lucide-react"

interface Background {
  id: string
  name: string
  gradient?: string
  type: "gradient" | "animated"
  icon?: React.ReactNode
}

const backgrounds: Background[] = [
  {
    id: "mountain",
    name: "Mountain Retreat",
    type: "animated",
    icon: <ImageIcon className="h-4 w-4" />,
  },
  {
    id: "art-store",
    name: "Art Store",
    type: "animated",
    icon: <ImageIcon className="h-4 w-4" />,
  },
]

interface BackgroundSelectorProps {
  currentBackground: string
  onSelectBackground: (id: string) => void
}

export const BackgroundSelector = ({ currentBackground, onSelectBackground }: BackgroundSelectorProps) => {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">Environment</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">Choose your focus environment</p>
      <div className="grid grid-cols-3 gap-3">
        {backgrounds.map((bg) => (
          <Button
            key={bg.id}
            variant="outline"
            className={`h-20 p-0 overflow-hidden relative border-2 flex flex-col items-center justify-center gap-1 bg-transparent ${
              currentBackground === bg.id ? "border-primary" : "border-transparent"
            }`}
            style={{
              background: bg.type === "gradient" ? bg.gradient : "linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 100%)",
            }}
            onClick={() => onSelectBackground(bg.id)}
          >
            <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors" />
            {bg.icon && <div className="relative z-10 text-white">{bg.icon}</div>}
            <span className="relative z-10 text-xs font-semibold text-white drop-shadow-lg">{bg.name}</span>
          </Button>
        ))}
      </div>
    </Card>
  )
}
