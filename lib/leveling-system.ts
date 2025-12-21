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
  // Tier 1: The Noise (Levels 1-9)
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

  // Tier 2: The Awakening (Levels 10-24)
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

  // Tier 3: The Grind (Levels 25-49)
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

  // Tier 4: The Mastery (Levels 50-74)
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
    name: "Shadow Operator",
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

  // Tier 5: The Legend (Levels 75-99)
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

  // Tier 6: The Impossible Rank (Level 100)
  100: {
    level: 100,
    name: "The Quiet One",
    title: "You have completed the game. You no longer need this app. You are free.",
    tier: "The Impossible Rank",
    tierNumber: 6,
    description: "Transcendence achieved.",
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

export function calculateXPForLevel(level: number): number {
  // Progressive XP curve: Base 100 + (level * 50)
  return 100 + level * 50
}

export function getLevelFromXP(totalXP: number): number {
  let level = 1
  let cumulativeXP = 0

  while (level < 100) {
    const xpNeeded = calculateXPForLevel(level)
    cumulativeXP += xpNeeded
    if (cumulativeXP > totalXP) break
    level++
  }

  return level
}
