"use client"

import { useState, useEffect } from "react"
import { playSoundEffect } from "@/lib/sound-effects"

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
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm transition-opacity duration-300 p-6 md:p-8 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative w-full max-w-xl bg-[#0a0a1a] border-2 border-purple-500/50 rounded-lg p-6 md:p-8 shadow-2xl shadow-purple-500/20">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-purple-400 text-sm md:text-base tracking-[0.3em] font-mono mb-2">CORE_PHILOSOPHY</h3>
          <div className="h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
        </div>

        {/* Main Content */}
        <div className="space-y-5">
          {/* Main statement */}
          <div>
            <h2 className="text-white text-2xl md:text-3xl font-bold mb-2">Quiet Room is not a to-do app.</h2>
            <p className="text-gray-300 text-base md:text-lg mb-3">It doesn't reward checking boxes.</p>
            <p className="text-purple-400 text-lg md:text-xl font-medium">It rewards showing up honestly.</p>
          </div>

          {/* Bullet points */}
          <div className="space-y-2.5 text-sm md:text-base">
            <div className="flex items-start gap-3">
              <span className="text-purple-500 text-lg">■</span>
              <p className="text-gray-300">
                FOCUS BUILDS <span className="text-white font-semibold">XP</span>.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-500 text-lg">■</span>
              <p className="text-gray-300">
                CONSISTENCY BUILDS <span className="text-white font-semibold">AURA</span>.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-500 text-lg">■</span>
              <p className="text-gray-300">
                AURA BUYS <span className="text-white font-semibold">FREEDOM</span>.
              </p>
            </div>
          </div>

          {/* Quote */}
          <p className="text-gray-400 italic text-base md:text-lg pt-1">
            "No one is watching you. But you know the truth."
          </p>

          {/* CTA Button */}
          <div className="pt-4">
            <button
              onClick={handleClose}
              className="w-full px-8 py-3.5 bg-transparent border-2 border-purple-500 text-white text-base md:text-lg font-mono tracking-wider hover:bg-purple-500/10 transition-all duration-300"
            >
              ENTER QUIET ROOM
            </button>
          </div>

          {/* Footer text */}
          <p className="text-gray-500 text-xs md:text-sm text-center pt-3 font-mono">
            IF THIS FEELS UNFAMILIAR, THE <span className="text-purple-400">GUIDE</span> IS ALWAYS IN THE TOP-RIGHT.
          </p>
        </div>
      </div>
    </div>
  )
}
