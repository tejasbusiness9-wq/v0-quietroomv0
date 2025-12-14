"use client"

import { useEffect, useRef } from "react"

export const ArtStoreEnvironment = () => {
  const bgRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = bgRef.current
    if (!el) return
    let rafId: number | null = null
    let offset = 0
    const tick = () => {
      offset += 0.015
      el.style.transform = `translate3d(${Math.sin(offset) * 5}px, ${Math.cos(offset / 2) * 3}px, 0) scale(1.05)`
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div
        ref={bgRef}
        className="absolute inset-0 bg-center bg-no-repeat bg-cover"
        style={{
          backgroundImage: "url('/environments/art_store.gif')",
          filter: "brightness(0.8) contrast(1.05)",
          transform: "translate3d(0,0,0) scale(1.05)",
        }}
      />

      {/* Warm vignette effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40" />
    </div>
  )
}
