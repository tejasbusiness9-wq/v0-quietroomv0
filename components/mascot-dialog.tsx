"use client"

import { useState, useEffect, useRef } from "react"

interface MascotDialogProps {
  lines?: string[]
}

export function MascotDialog({ lines = ["Great progress! 🎉", "Good to see you again! 👋"] }: MascotDialogProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [hasSpoken, setHasSpoken] = useState(false)
  const [isSleeping, setIsSleeping] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (!hasSpoken) {
      setIsTyping(true)
      setHasSpoken(true)
      setDisplayedText("")
      setCurrentLineIndex(0)
      setIsSleeping(false)

      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.loop = true
        audioRef.current.play().catch((err) => {
          console.log("[v0] Audio play error:", err)
        })
      }
    }
  }, [hasSpoken])

  useEffect(() => {
    if (!isTyping || currentLineIndex >= lines.length) {
      setIsTyping(false)
      setIsSleeping(true)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      return
    }

    const currentLine = lines[currentLineIndex]
    const typingSpeed = 50

    if (displayedText.length < currentLine.length) {
      const timer = setTimeout(() => {
        setDisplayedText(currentLine.slice(0, displayedText.length + 1))
      }, typingSpeed)
      return () => clearTimeout(timer)
    } else {
      // Move to next line after 2 seconds
      const timer = setTimeout(() => {
        setDisplayedText("")
        setCurrentLineIndex(currentLineIndex + 1)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [displayedText, currentLineIndex, isTyping, lines])

  const handleHover = () => {
    if (isSleeping) {
      setIsTyping(true)
      setIsSleeping(false)
      setDisplayedText("")
      setCurrentLineIndex(0)

      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.loop = true
        audioRef.current.play().catch((err) => {
          console.log("[v0] Audio play error on hover:", err)
        })
      }
    }
  }

  return (
    <div className="game-dialog" onMouseEnter={handleHover}>
      <audio ref={audioRef} src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Q_speaking-LCYKz5lIwyBf50tsDxRbTdMgVJRd52.mp3" preload="auto" />
      <div className="game-dialog-arrow"></div>
      <p className="text-sm font-medium text-foreground min-h-6">
        {displayedText || " "}
        {isTyping && displayedText.length < lines[currentLineIndex]?.length && <span className="animate-pulse">▊</span>}
        {isSleeping && <span className="ml-2 animate-bounce">💤</span>}
      </p>
    </div>
  )
}
