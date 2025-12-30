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

export const SoundEffects = {
  timerComplete: () => playSound("/sounds/zentimeup.mp3", 0.6),
  xpGain: () => playSound("/sounds/xpgain.mp3", 0.5),
  levelUp: () => playSound("/sounds/levelup.mp3", 0.7),
}
