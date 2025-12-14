"use client"

import { useState } from "react"

export function ComingSoonBanner() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="relative w-full max-w-2xl">
      {/* Animated glow background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 animate-pulse"></div>

      {/* Main banner */}
      <div
        className="relative bg-gradient-to-br from-card via-card to-primary/5 border-2 border-primary/30 rounded-2xl p-8 overflow-hidden transition-all duration-300 cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        {/* Particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/60 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${3 + i * 0.5}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Top label */}
          <div className="inline-block mb-4">
            <div className="px-3 py-1 bg-primary/20 border border-primary/50 rounded-full">
              <span className="text-xs font-semibold text-primary tracking-widest uppercase">Coming Soon</span>
            </div>
          </div>

          {/* Title with glow effect */}
          <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-300 to-primary mb-3 transition-all duration-300 group-hover:scale-105 origin-left">
            Community Hub
          </h3>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-6 max-w-md">
            Connect with fellow adventurers, share achievements, and collaborate on epic quests together.
          </p>

          {/* Animated underline */}
          <div className="relative h-1 bg-gradient-to-r from-primary via-purple-500 to-transparent rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-transparent transition-all duration-1000 ${
                isHovered ? "w-full" : "w-0"
              }`}
            ></div>
          </div>

          {/* Action button */}
          <div className="mt-8">
            <button
              className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/50"
              disabled
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>Notify Me</span>
                <span className="text-lg">🔔</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        {/* Border animation on hover */}
        <div
          className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `conic-gradient(from 0deg, var(--primary, #a855f7), transparent 50%, var(--primary, #a855f7))`,
            backgroundSize: "200% 200%",
            animation: isHovered ? "spin 3s linear infinite" : "none",
          }}
        ></div>
      </div>
    </div>
  )
}
