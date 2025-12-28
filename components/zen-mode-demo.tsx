"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"

const environments = [
  {
    name: "Space Station",
    videoUrl: "https://blob.v0.app/vRoCf.mp4",
  },
  {
    name: "Deep Ocean",
    videoUrl: "https://blob.v0.app/l9YXl.mp4",
  },
]

const ambientSounds = [
  { name: "Space Noise", url: "/audio/space-noise.mp3" },
  { name: "Rain", url: "/audio/rain.mp3" },
]

export function ZenModeDemo() {
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [initialMinutes] = useState(25)
  const [currentEnv, setCurrentEnv] = useState(0)
  const [currentSound, setCurrentSound] = useState(0)
  const [soundPlaying, setSoundPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const timerStartTimestamp = useRef<number | null>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3
      if (soundPlaying) {
        audioRef.current.play().catch(() => {
          setSoundPlaying(false)
        })
      } else {
        audioRef.current.pause()
      }
    }
  }, [soundPlaying, currentSound])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timerStartTimestamp.current) {
      interval = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - timerStartTimestamp.current!) / 1000)
        const remaining = initialMinutes * 60 - elapsed

        if (remaining <= 0) {
          setTimeLeft(0)
          setIsRunning(false)
        } else {
          setTimeLeft(remaining)
        }
      }, 100)
    }

    return () => clearInterval(interval)
  }, [isRunning, initialMinutes])

  const toggleTimer = () => {
    if (!isRunning) {
      timerStartTimestamp.current = Date.now()
      setIsRunning(true)
    } else {
      setIsRunning(false)
      timerStartTimestamp.current = null
      setTimeLeft(25 * 60) // Reset to 25 minutes
    }
  }

  const toggleSound = () => {
    setSoundPlaying(!soundPlaying)
  }

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = time % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  return (
    <div className="w-full">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Content - Timer */}
        <div className="flex justify-center">
          <div className="relative">
            <div
              className={`w-80 h-80 md:w-96 md:h-96 rounded-2xl border-2 shadow-2xl shadow-primary/20 flex flex-col items-center justify-center relative overflow-hidden ${
                isRunning ? "border-primary animate-snake-border" : "border-primary/30"
              }`}
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                src={environments[currentEnv].videoUrl}
              />

              <div className="absolute inset-0 bg-black/40" />

              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                <circle
                  cx="50%"
                  cy="50%"
                  r="170"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="12"
                  className="opacity-20"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="170"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 170}`}
                  strokeDashoffset={`${2 * Math.PI * 170 * (1 - timeLeft / (initialMinutes * 60))}`}
                  className="transition-all duration-1000"
                />
              </svg>

              <div className="relative z-10 text-center flex flex-col items-center justify-center">
                <div className="text-xs font-mono text-primary uppercase tracking-widest mb-6">Tactical Focus</div>

                <div className="text-7xl md:text-8xl font-bold text-white tabular-nums tracking-tight mb-8">
                  {formatTime(timeLeft)}
                </div>

                <button
                  onClick={toggleTimer}
                  className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 transition-all flex items-center justify-center group shadow-lg shadow-primary/50"
                >
                  {isRunning ? (
                    <Pause className="w-8 h-8 text-black fill-black" />
                  ) : (
                    <Play className="w-8 h-8 text-black fill-black ml-1" />
                  )}
                </button>
              </div>

              <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6 text-xs font-mono z-10">
                <div className="flex items-center gap-2">
                  <span className="text-primary">●</span>
                  <span className="text-white/80">XP FARMING: +5/min</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`${soundPlaying ? "text-primary animate-pulse" : "text-white/40"}`}>●</span>
                  <span className="text-white/80">
                    AMBIENT: {ambientSounds[currentSound].name.toUpperCase().replace(" ", "_")}
                  </span>
                </div>
              </div>
            </div>

            {/* Hidden audio element */}
            <audio ref={audioRef} loop>
              <source src={ambientSounds[currentSound].url} type="audio/mpeg" />
            </audio>
          </div>
        </div>

        {/* Right Content - Features */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              ZEN MODE:{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-primary">
                THE GRIND ENGINE
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              A high-stakes focus timer designed to force deep work. No rewards for quitters. If you give up, you get
              zero XP.
            </p>
          </div>

          <div className="space-y-6">
            {/* Feature 1 - All or Nothing */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-red-400 font-bold">!</span>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">ALL OR NOTHING</h4>
                <p className="text-muted-foreground">
                  Click 'Give Up' and lose everything. XP is only granted upon successful extraction.
                </p>
              </div>
            </div>

            {/* Feature 2 - Environments */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">2</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">ENVIRONMENTS</h4>
                <p className="text-muted-foreground mb-3">
                  Choose your focus environment to match your mission type and mental state.
                </p>
                <div className="flex gap-2">
                  {environments.map((env, index) => (
                    <Button
                      key={index}
                      onClick={() => setCurrentEnv(index)}
                      variant={currentEnv === index ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                    >
                      {env.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature 3 - Ambient Sounds */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">3</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">AMBIENT SOUNDS</h4>
                <p className="text-muted-foreground mb-3">
                  Immersive soundscapes provide real-time situational awareness on your focus drift.
                </p>
                <div className="flex gap-2">
                  {ambientSounds.map((sound, index) => (
                    <Button
                      key={index}
                      onClick={() => {
                        setCurrentSound(index)
                        if (soundPlaying) {
                          setSoundPlaying(false)
                          setTimeout(() => setSoundPlaying(true), 100)
                        }
                      }}
                      variant={currentSound === index ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                    >
                      {sound.name}
                    </Button>
                  ))}
                  <Button onClick={toggleSound} variant="outline" size="sm" className="text-xs bg-transparent">
                    {soundPlaying ? "🔊 Playing" : "🔇 Paused"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
