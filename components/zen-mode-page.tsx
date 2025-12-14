"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, RotateCcw, Maximize2, Clock } from "lucide-react"
import { MountainEnvironment } from "@/components/zen/environments/mountain-environment"
import { ArtStoreEnvironment } from "@/components/zen/environments/art-store-environment"

export default function ZenModePage() {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedEnvironment, setSelectedEnvironment] = useState<"mountain" | "art-store" | null>(null)

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsRunning(false)
          } else {
            setMinutes(minutes - 1)
            setSeconds(59)
          }
        } else {
          setSeconds(seconds - 1)
        }
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, minutes, seconds])

  const handleStart = () => {
    console.log("[v0] Start focus clicked")
    setIsRunning(true)
  }

  const handlePause = () => {
    console.log("[v0] Pause focus clicked")
    setIsRunning(false)
  }

  const handleReset = () => {
    console.log("[v0] Reset timer clicked")
    setIsRunning(false)
    setMinutes(25)
    setSeconds(0)
  }

  const handleFullscreen = () => {
    console.log("[v0] Fullscreen clicked")
    setIsFullscreen(!isFullscreen)
  }

  const handleTimerPreset = (mins: number) => {
    console.log("[v0] Timer preset clicked:", mins)
    setMinutes(mins)
    setSeconds(0)
    setIsRunning(false)
  }

  const formatTime = (mins: number, secs: number) => {
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const renderEnvironment = () => {
    if (selectedEnvironment === "mountain") {
      return <MountainEnvironment />
    }
    if (selectedEnvironment === "art-store") {
      return <ArtStoreEnvironment />
    }
    return null
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ zIndex: 0, pointerEvents: "none" }}>
          {renderEnvironment()}
        </div>
        {!selectedEnvironment && (
          <div
            className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900"
            style={{ zIndex: 0, pointerEvents: "none" }}
          />
        )}

        <button
          onClick={handleFullscreen}
          className="absolute top-8 right-8 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          style={{ zIndex: 10 }}
        >
          <Maximize2 className="w-6 h-6 text-white" />
        </button>

        <div className="text-center" style={{ zIndex: 10 }}>
          <div className="text-9xl font-bold text-white mb-8">{formatTime(minutes, seconds)}</div>

          <div className="flex gap-4 justify-center">
            {!isRunning ? (
              <Button onClick={handleStart} size="lg" className="px-8 py-6 text-lg">
                <Play className="w-6 h-6 mr-2" />
                Start focus
              </Button>
            ) : (
              <Button onClick={handlePause} size="lg" variant="secondary" className="px-8 py-6 text-lg">
                <Pause className="w-6 h-6 mr-2" />
                Pause
              </Button>
            )}
            <Button onClick={handleReset} size="lg" variant="outline" className="px-8 py-6 text-lg bg-transparent">
              <RotateCcw className="w-6 h-6 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-primary mb-2">Zen Mode</h2>
        <p className="text-muted-foreground">Drop into distraction-free focus and route XP to your goals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer Card */}
        <Card className="lg:col-span-2 p-8 relative overflow-hidden">
          <div className="absolute inset-0" style={{ zIndex: 0, pointerEvents: "none" }}>
            {renderEnvironment()}
          </div>
          {!selectedEnvironment && (
            <div
              className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-purple-800/20 to-indigo-900/20"
              style={{ zIndex: 0, pointerEvents: "none" }}
            />
          )}

          <div className="relative" style={{ zIndex: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Current focus session</h3>
                <p className="text-sm text-muted-foreground">Set your timer, route XP to a goal, and press start.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTimerPreset(25)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Clock className="w-5 h-5" />
                </button>
                <button onClick={handleFullscreen} className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <Maximize2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSelectedEnvironment("mountain")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedEnvironment === "mountain"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                Mountain
              </button>
              <button
                onClick={() => setSelectedEnvironment("art-store")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedEnvironment === "art-store"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                Art Store
              </button>
              <button
                onClick={() => setSelectedEnvironment(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedEnvironment === null ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                }`}
              >
                Default
              </button>
            </div>

            {/* Timer Display */}
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative w-80 h-80 flex items-center justify-center">
                {/* Circular progress ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="160"
                    cy="160"
                    r="140"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                    className="opacity-20"
                  />
                  <circle
                    cx="160"
                    cy="160"
                    r="140"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 140}`}
                    strokeDashoffset={`${2 * Math.PI * 140 * (1 - (minutes * 60 + seconds) / (25 * 60))}`}
                    className="transition-all duration-1000"
                  />
                </svg>

                {/* Timer text */}
                <div className="text-center">
                  <div className="text-7xl font-bold text-foreground">{formatTime(minutes, seconds)}</div>
                  <p className="text-sm text-muted-foreground mt-4">Next focus block • Break: 5</p>
                  <p className="text-xs text-muted-foreground">Cycle 1 of 4</p>
                </div>
              </div>

              {/* Control buttons */}
              <div className="flex gap-4 mt-8">
                {!isRunning ? (
                  <Button onClick={handleStart} size="lg" className="px-8">
                    <Play className="w-5 h-5 mr-2" />
                    Start focus
                  </Button>
                ) : (
                  <Button onClick={handlePause} size="lg" variant="secondary" className="px-8">
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </Button>
                )}
                <Button onClick={handleReset} size="lg" variant="outline" className="px-8 bg-transparent">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Timer presets */}
            <div className="flex gap-2 justify-center mt-6">
              <button
                onClick={() => handleTimerPreset(15)}
                className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                15 min
              </button>
              <button
                onClick={() => handleTimerPreset(25)}
                className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                25 min
              </button>
              <button
                onClick={() => handleTimerPreset(45)}
                className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                45 min
              </button>
              <button
                onClick={() => handleTimerPreset(60)}
                className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
              >
                60 min
              </button>
            </div>

            {/* Session info */}
            <div className="grid grid-cols-2 gap-6 mt-8 pt-8 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Routing XP to</p>
                <p className="font-semibold text-foreground">Writing • Deep work</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Session streak</p>
                <p className="font-semibold text-foreground">18 days • 2x XP active</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Background sound</p>
                <p className="font-semibold text-foreground">Lofi nebula mix</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Session volume</p>
                <p className="font-semibold text-foreground">72%</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Side panels */}
        <div className="space-y-6">
          {/* Focus snapshot */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Focus arc snapshot</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
                18
              </div>
              <div>
                <p className="font-semibold text-foreground">Alex Nightwalker</p>
                <p className="text-xs text-muted-foreground">Arc: Nebula Draft • Season 4</p>
                <p className="text-xs text-muted-foreground">Current streak: 18 days</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm font-semibold text-foreground">Today from focus: +520 XP</p>
            </div>
          </Card>

          {/* Session stats */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Session stats</h3>
              <span className="text-sm text-muted-foreground">Today</span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Focus blocks</span>
                  <span className="font-semibold text-foreground">3</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Deep work time</span>
                  <span className="font-semibold text-foreground">75 min</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">XP from focus</span>
                  <span className="font-semibold text-primary">+380</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Breaks taken</span>
                  <span className="font-semibold text-foreground">3</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
