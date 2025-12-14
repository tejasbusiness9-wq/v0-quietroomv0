"use client"

import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Volume2, Play } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface AmbientMixerProps {
  environmentId?: string
  allowedSoundIds?: string[]
  compact?: boolean
}

export function AmbientMixer({ environmentId, allowedSoundIds, compact }: AmbientMixerProps) {
  const [sounds] = useState([
    { id: "rain", name: "Rain on the skylight", artist: "Rain + White noise", duration: "30 min" },
    { id: "piano", name: "Starfield piano", artist: "Ethon + Samfelson", duration: "30 min" },
    { id: "music1", name: "Music 1", artist: "User added track", duration: "" },
    { id: "midnight", name: "Midnight orbit", artist: "Lofi + Soft synths", duration: "42 min" },
  ])

  const [volumes, setVolumes] = useState<{ [key: string]: number }>({
    rain: 50,
    piano: 50,
    music1: 50,
    midnight: 50,
  })

  const displayedSounds = allowedSoundIds ? sounds.filter((s) => allowedSoundIds.includes(s.id)) : sounds

  const handleVolumeChange = (soundId: string, value: number[]) => {
    setVolumes((prev) => ({ ...prev, [soundId]: value[0] }))
  }

  if (compact) {
    return (
      <Card className="p-4 bg-card/60 backdrop-blur-xl border-primary/20 space-y-3">
        {displayedSounds.map((sound) => (
          <div key={sound.id} className="flex items-center gap-3">
            <Button size="icon" variant="ghost" className="h-8 w-8 bg-primary/20 text-white shrink-0">
              <Play className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-medium truncate">{sound.name}</p>
              <Slider
                value={[volumes[sound.id]]}
                onValueChange={(value) => handleVolumeChange(sound.id, value)}
                max={100}
                step={1}
                className="mt-1"
              />
            </div>
            <span className="text-xs text-white/60 shrink-0">{volumes[sound.id]}%</span>
          </div>
        ))}
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-card/30 backdrop-blur-xl border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Ambient mix</h3>
        <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
          + Edit a scene
        </Button>
      </div>
      <p className="text-sm text-white/60 mb-4">Pick a soundscape for this focus mix.</p>

      <div className="space-y-4">
        {displayedSounds.map((sound) => (
          <div key={sound.id} className="p-4 rounded-lg bg-background/20 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <Button size="icon" variant="ghost" className="h-10 w-10 bg-primary/20 text-white">
                <Play className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <p className="text-sm text-white font-semibold">{sound.name}</p>
                <p className="text-xs text-white/60">
                  {sound.artist} • {sound.duration}
                </p>
              </div>
              <Volume2 className="h-4 w-4 text-white/60" />
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={[volumes[sound.id]]}
                onValueChange={(value) => handleVolumeChange(sound.id, value)}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-white/80 w-12 text-right">{volumes[sound.id]}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
