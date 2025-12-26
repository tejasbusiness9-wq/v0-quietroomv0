// The Path of Silence - 100 Level System

export interface LevelInfo {
  level: number
  name: string
  title: string
  tier: string
  tierNumber: number
  description: string
  color: string
  glow: string
}

export const LEVEL_DATA: Record<number, LevelInfo> = {
  // Tier 1: The Noise (Levels 1-9) -> ✅ GOOD
  1: {
    level: 1,
    name: "The Tourist",
    title: "You are just passing through. Don't touch anything.",
    tier: "The Noise",
    tierNumber: 1,
    description: "You are easily distracted. Q does not respect you yet.",
    color: "text-gray-400",
    glow: "shadow-gray-400/50",
  },
  5: {
    level: 5,
    name: "Daydreamer",
    title: "You check your phone every 4 minutes. Pathetic.",
    tier: "The Noise",
    tierNumber: 1,
    description: "Still easily distracted, but showing small signs of discipline.",
    color: "text-gray-300",
    glow: "shadow-gray-300/50",
  },
  9: {
    level: 9,
    name: "Glitch",
    title: "You are an error in the system, but you are trying.",
    tier: "The Noise",
    tierNumber: 1,
    description: "The system recognizes your effort.",
    color: "text-blue-400",
    glow: "shadow-blue-400/50",
  },

  // Tier 2: The Awakening (Levels 10-24) -> ✅ GOOD
  10: {
    level: 10,
    name: "Noise Walker",
    title: "You can walk through the noise without flinching.",
    tier: "The Awakening",
    tierNumber: 2,
    description: "Fighting back against dopamine addiction.",
    color: "text-cyan-400",
    glow: "shadow-cyan-400/50",
  },
  15: {
    level: 15,
    name: "Echo",
    title: "Your actions are starting to matter.",
    tier: "The Awakening",
    tierNumber: 2,
    description: "Your work creates ripples in the system.",
    color: "text-cyan-300",
    glow: "shadow-cyan-300/50",
  },
  20: {
    level: 20,
    name: "Acolyte",
    title: "You have kneeled at the altar of hard work.",
    tier: "The Awakening",
    tierNumber: 2,
    description: "True discipline begins here.",
    color: "text-emerald-400",
    glow: "shadow-emerald-400/50",
  },

  // Tier 3: The Grind (Levels 25-49) -> ✅ GOOD
  25: {
    level: 25,
    name: "Ronin",
    title: "A masterless warrior. You need no motivation.",
    tier: "The Grind",
    tierNumber: 3,
    description: "You are consistent. You are dangerous.",
    color: "text-amber-400",
    glow: "shadow-amber-400/50",
  },
  35: {
    level: 35,
    name: "Silencer",
    title: "You execute tasks with zero sound.",
    tier: "The Grind",
    tierNumber: 3,
    description: "Silent execution. Maximum results.",
    color: "text-amber-300",
    glow: "shadow-amber-300/50",
  },
  45: {
    level: 45,
    name: "Deep Diver",
    title: "The pressure of the deep does not crush you.",
    tier: "The Grind",
    tierNumber: 3,
    description: "You thrive under pressure.",
    color: "text-orange-400",
    glow: "shadow-orange-400/50",
  },

  // Tier 4: The Mastery (Levels 50-74) -> 🛠️ TWEAKED
  50: {
    level: 50,
    name: "The Architect",
    title: "You do not predict the future. You build it.",
    tier: "The Mastery",
    tierNumber: 4,
    description: "Top 1%. You build while others sleep.",
    color: "text-purple-400",
    glow: "shadow-purple-400/50",
  },
  60: {
    level: 60,
    name: "Phantom Operator", // Changed from "Shadow Operator"
    title: "Move in silence. Strike with precision.",
    tier: "The Mastery",
    tierNumber: 4,
    description: "Invisible efficiency.",
    color: "text-purple-300",
    glow: "shadow-purple-300/50",
  },
  70: {
    level: 70,
    name: "Void Walker",
    title: "Time means nothing to you anymore.",
    tier: "The Mastery",
    tierNumber: 4,
    description: "You have transcended time itself.",
    color: "text-violet-400",
    glow: "shadow-violet-400/50",
  },

  // Tier 5: The Legend (Levels 75-99) -> ✅ GOOD
  75: {
    level: 75,
    name: "Chronos",
    title: "You have conquered the clock.",
    tier: "The Legend",
    tierNumber: 5,
    description: "Frighteningly productive. People think you are a bot.",
    color: "text-pink-400",
    glow: "shadow-pink-400/50",
  },
  90: {
    level: 90,
    name: "The Oracle",
    title: "You see the finished product before you start.",
    tier: "The Legend",
    tierNumber: 5,
    description: "Pure vision. Pure execution.",
    color: "text-rose-400",
    glow: "shadow-rose-400/50",
  },
  99: {
    level: 99,
    name: "Ascendant",
    title: "One step away from Godhood.",
    tier: "The Legend",
    tierNumber: 5,
    description: "The final test awaits.",
    color: "text-red-400",
    glow: "shadow-red-400/50",
  },

  // Tier 6: The Endgame (Level 100) -> 👑 NEW & UNIQUE
  100: {
    level: 100,
    name: "Sovereign of Silence", // Unique to Quiet Room, still badass
    title: "The System no longer guides you. It serves you.",
    tier: "The Impossible Rank",
    tierNumber: 6,
    description: "You have transcended the need for motivation. You are the storm.",
    color: "text-white",
    glow: "shadow-white/80",
  },
}

export function getLevelInfo(level: number): LevelInfo {
  // Find the closest defined level
  const definedLevel = Object.keys(LEVEL_DATA)
    .map(Number)
    .sort((a, b) => Math.abs(level - a) - Math.abs(level - b))[0]

  const baseInfo = LEVEL_DATA[definedLevel]

  // Determine tier based on level ranges
  let tier = "The Noise"
  let tierNumber = 1
  let color = "text-gray-400"
  let glow = "shadow-gray-400/50"

  if (level >= 1 && level <= 9) {
    tier = "The Noise"
    tierNumber = 1
    color = "text-gray-400"
    glow = "shadow-gray-400/50"
  } else if (level >= 10 && level <= 24) {
    tier = "The Awakening"
    tierNumber = 2
    color = "text-cyan-400"
    glow = "shadow-cyan-400/50"
  } else if (level >= 25 && level <= 49) {
    tier = "The Grind"
    tierNumber = 3
    color = "text-amber-400"
    glow = "shadow-amber-400/50"
  } else if (level >= 50 && level <= 74) {
    tier = "The Mastery"
    tierNumber = 4
    color = "text-purple-400"
    glow = "shadow-purple-400/50"
  } else if (level >= 75 && level <= 99) {
    tier = "The Legend"
    tierNumber = 5
    color = "text-pink-400"
    glow = "shadow-pink-400/50"
  } else if (level >= 100) {
    tier = "The Impossible Rank"
    tierNumber = 6
    color = "text-white"
    glow = "shadow-white/80"
  }

  return {
    level,
    name: baseInfo.name,
    title: baseInfo.title,
    tier,
    tierNumber,
    description: baseInfo.description,
    color,
    glow,
  }
}

// Old formula: 100 + level * 50 (too linear)
// New formula: 100 + (level^2 * 3) (creates "Wall" effect)
export function calculateXPForLevel(level: number): number {
  // Level 1 needs: 103 XP (Easy - 1 hour focus)
  // Level 10 needs: 400 XP (Medium - 1 day focus)
  // Level 50 needs: 7,600 XP (Hard - 2 weeks of focus)
  // Level 99 needs: 29,500 XP (Insane - 2 months of focus)

  return Math.floor(100 + Math.pow(level, 2) * 3)
}

export function getLevelFromXP(totalXP: number): number {
  let level = 1
  let xpNeededForNext = calculateXPForLevel(level)

  // Loop until we don't have enough XP to pass the next level
  while (totalXP >= xpNeededForNext && level < 100) {
    totalXP -= xpNeededForNext // Subtract the XP used to pass this level
    level++
    xpNeededForNext = calculateXPForLevel(level)
  }

  return level
}

export function getLevelProgress(totalXP: number): {
  currentLevelXP: number
  xpForNextLevel: number
  percentage: number
} {
  let level = 1
  let xpCounter = totalXP
  let xpNeeded = calculateXPForLevel(level)

  while (xpCounter >= xpNeeded && level < 100) {
    xpCounter -= xpNeeded
    level++
    xpNeeded = calculateXPForLevel(level)
  }

  // If level 100, they are maxed out
  if (level >= 100) {
    return {
      currentLevelXP: xpNeeded,
      xpForNextLevel: xpNeeded,
      percentage: 100,
    }
  }

  // xpCounter is the "leftover" XP into the current level
  const percentage = Math.min(100, Math.max(0, (xpCounter / xpNeeded) * 100))

  return {
    currentLevelXP: Math.floor(xpCounter),
    xpForNextLevel: xpNeeded,
    percentage: Math.floor(percentage),
  }
}
