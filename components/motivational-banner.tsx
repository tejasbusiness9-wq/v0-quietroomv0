"use client"

import { useState, useEffect } from "react"

export function MotivationalBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.3 },
    )

    const banner = document.getElementById("motivational-banner")
    if (banner) {
      observer.observe(banner)
    }

    return () => {
      if (banner) {
        observer.unobserve(banner)
      }
    }
  }, [])

  return (
    <div
      id="motivational-banner"
      className={`relative overflow-hidden rounded-3xl transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 opacity-90">
        {/* Animated blob 1 */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-400/30 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        {/* Animated blob 2 */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-pink-400/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        {/* Animated blob 3 */}
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-600/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute bottom-0 w-2 h-2 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative flex items-center justify-start p-8 md:p-12">
        <div className="flex-1 z-10 max-w-2xl">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg">
            Goals are dreams with
            <br />
            deadlines!
          </h3>
          <div className="flex flex-col gap-2 mt-6">
            <div
              className={`inline-flex items-center gap-2 transition-all duration-700 ${
                isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white/90 font-medium">Be Realistic</span>
            </div>
            <div
              className={`inline-flex items-center gap-2 transition-all duration-700 ${
                isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
              }`}
              style={{ transitionDelay: "600ms" }}
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white/90 font-medium">Stay Consistent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom shine effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
    </div>
  )
}
