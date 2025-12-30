"use client"

import { Sparkles, Zap, Trophy, Star, X } from "lucide-react"
import { useEffect, useState } from "react"
import { getLevelInfo } from "@/lib/leveling-system"
import Confetti from "react-confetti"
import { SoundEffects } from "@/lib/sound-effects"

interface LevelUpCelebrationProps {
  newLevel: number
  onClose: () => void
}

export function LevelUpCelebration({ newLevel, onClose }: LevelUpCelebrationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const levelInfo = getLevelInfo(newLevel)

  useEffect(() => {
    SoundEffects.levelUp()

    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }, [onClose])

  if (!isVisible) return null

  return (
    <>
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={200}
        gravity={0.3}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
        <div className="relative max-w-lg w-full mx-4 animate-in zoom-in-95 duration-500">
          {/* Glow effect */}
          <div className={`absolute inset-0 ${levelInfo.glow} blur-3xl opacity-50 animate-pulse`}></div>

          {/* Main card */}
          <div className="relative bg-gradient-to-b from-background to-background/95 border-2 border-primary rounded-2xl p-8 text-center">
            <button
              onClick={() => {
                setIsVisible(false)
                setTimeout(onClose, 500)
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors group"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
            </button>

            {/* Animated icons */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-4">
              <Star className="w-8 h-8 text-yellow-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <Zap className="w-8 h-8 text-primary animate-bounce" style={{ animationDelay: "150ms" }} />
              <Trophy className="w-8 h-8 text-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>

            {/* Level Up Badge */}
            <div className="mb-6 mt-4">
              <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary/20 border-2 border-primary rounded-full animate-pulse">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-primary font-bold text-lg">LEVEL UP!</span>
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
            </div>

            {/* Level Number */}
            <div className={`text-8xl font-black mb-4 ${levelInfo.color} drop-shadow-glow`}>{newLevel}</div>

            {/* Level Name */}
            <h2 className="text-3xl font-bold text-foreground mb-2">{levelInfo.name}</h2>

            {/* Tier */}
            <div className="inline-block px-4 py-1 bg-primary/10 border border-primary/30 rounded-full mb-4">
              <span className="text-sm font-semibold text-primary">
                Tier {levelInfo.tierNumber}: {levelInfo.tier}
              </span>
            </div>

            {/* Flavor Text */}
            <p className="text-lg text-muted-foreground italic mb-6">"{levelInfo.title}"</p>

            {/* Motivation */}
            <div className="p-4 bg-muted/50 border border-border rounded-lg">
              <p className="text-sm text-foreground">{levelInfo.description}</p>
            </div>

            {/* Continue Button */}
            <button
              onClick={() => {
                setIsVisible(false)
                setTimeout(onClose, 500)
              }}
              className="mt-6 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Keep Grinding
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
