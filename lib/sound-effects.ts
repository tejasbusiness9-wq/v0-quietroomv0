export const playSound = (soundFile: string, volume = 0.5) => {
  try {
    const audio = new Audio(soundFile)
    audio.volume = volume
    audio.play().catch((error) => {
      console.log("[v0] Sound play failed (user interaction required):", error)
    })
  } catch (error) {
    console.error("[v0] Error playing sound:", error)
  }
}

export const playSoundEffect = (soundName: string, volume = 0.5) => {
  const soundMap: Record<string, string> = {
    zentimeup: "/sounds/zentimeup.mp3",
    xpgain: "/sounds/xpgain.mp3",
    levelup: "/sounds/levelup.mp3",
    entrytrim: "/sounds/entrytrim.mp3",
  }

  const soundFile = soundMap[soundName]
  if (soundFile) {
    playSound(soundFile, volume)
  }
}

export const SoundEffects = {
  timerComplete: () => playSound("/sounds/zentimeup.mp3", 0.6),
  xpGain: () => playSound("/sounds/xpgain.mp3", 0.5),
  levelUp: () => playSound("/sounds/levelup.mp3", 0.7),
  entry: () => playSound("/sounds/entrytrim.mp3", 0.6),
}
