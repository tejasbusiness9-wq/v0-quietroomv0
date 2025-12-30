"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { playSoundEffect } from "@/lib/sound-effects"
import { Button } from "@/components/ui/button"

interface PhilosophyGateProps {
  onClose: () => void
}

export function PhilosophyGate({ onClose }: PhilosophyGateProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Play entrance sound
    playSoundEffect("entrytrim")

    // Fade in animation
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-8 text-center space-y-8">
        {/* Main text */}
        <div className="space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">Quiet Room is not a to-do app.</h2>

          <div className="space-y-4 text-lg md:text-xl text-gray-300 leading-relaxed">
            <p>It doesn't reward checking boxes.</p>
            <p>It rewards showing up honestly.</p>
          </div>

          <div className="space-y-3 text-lg md:text-xl text-gray-200 pt-4">
            <p>
              <span className="text-purple-400 font-semibold">Focus</span> builds XP.
            </p>
            <p>
              <span className="text-purple-400 font-semibold">Consistency</span> builds Aura.
            </p>
            <p>
              <span className="text-purple-400 font-semibold">Aura</span> buys freedom.
            </p>
          </div>

          <p className="text-gray-400 text-lg pt-6 italic">No one is watching you. But you know the truth.</p>
        </div>

        {/* CTA Button */}
        <div className="pt-6">
          <Button
            onClick={handleClose}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-12 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
          >
            Enter Quiet Room
          </Button>
        </div>

        {/* Subtle guide text */}
        <p className="text-sm text-gray-500 pt-4">If this feels unfamiliar, the Guide is always in the top-right.</p>
      </div>
    </div>
  )
}
