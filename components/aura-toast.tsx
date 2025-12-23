"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

interface AuraToastProps {
  auraAmount: number
  message?: string
  onClose?: () => void
}

export function AuraToast({ auraAmount, message, onClose }: AuraToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-5">
      <div className="relative overflow-hidden rounded-lg border-2 border-purple-500 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm p-4 min-w-[300px] shadow-lg shadow-purple-500/50">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent animate-shimmer"></div>

        <div className="relative flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500 blur-md animate-pulse"></div>
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 border-2 border-purple-500">
              <img src="/images/aura.png" alt="Aura" className="w-6 h-6 animate-bounce" />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                +{auraAmount} Aura
              </span>
              <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
            {message && <p className="text-sm text-purple-300 mt-1">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
