"use client"

import { Zap, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

interface XPToastProps {
  xpAmount: number
  message?: string
  onClose?: () => void
}

export function XPToast({ xpAmount, message, onClose }: XPToastProps) {
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
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5">
      <div className="relative overflow-hidden rounded-lg border-2 border-primary bg-primary/10 backdrop-blur-sm p-4 min-w-[300px] shadow-lg shadow-primary/50">
        {/* Animated border effect */}
        <div className="absolute inset-0 rounded-lg">
          <div className="absolute inset-0 border-snake opacity-50"></div>
        </div>

        <div className="relative flex items-center gap-3">
          {/* XP Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary blur-md animate-pulse"></div>
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 border-2 border-primary">
              <Zap className="w-6 h-6 text-primary fill-primary animate-bounce" />
            </div>
          </div>

          {/* XP Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">+{xpAmount} XP</span>
              <TrendingUp className="w-5 h-5 text-primary animate-pulse" />
            </div>
            {message && <p className="text-sm text-muted-foreground mt-1">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export { XPToast as XpToast }
