"use client"

import { useEffect, useRef } from "react"

export const MountainEnvironment = () => {
  const bgRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = bgRef.current
    if (!el) return
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      el.style.transform = `translate3d(${x * 6}px, ${y * 3}px, 0) scale(1.05)`
    }

    window.addEventListener("mousemove", handleMove)
    return () => window.removeEventListener("mousemove", handleMove)
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div
        ref={bgRef}
        className="absolute inset-0 bg-center bg-no-repeat bg-cover"
        style={{
          backgroundImage: "url('/environments/mountain.gif')",
          filter: "brightness(0.75) saturate(1.1)",
          transform: "translate3d(0,0,0) scale(1.05)",
          transition: "transform 300ms ease-out",
        }}
      />

      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
    </div>
  )
}
