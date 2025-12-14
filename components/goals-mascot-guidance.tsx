"use client"

import { useState, useEffect } from "react"

interface GuidanceMessage {
  context: string
  messages: string[]
}

export function GoalsMascotGuidance() {
  const [currentContext, setCurrentContext] = useState<string>("browsing")
  const [displayedMessage, setDisplayedMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const guidanceMessages: Record<string, GuidanceMessage> = {
    browsing: {
      context: "browsing",
      messages: [
        "Small steps move big mountains. 🏔️",
        "Every goal starts with a single thought. 💭",
        "Your progress matters, no matter how small. ⭐",
        "Focus on what you can control today. 🎯",
      ],
    },
    goal_creation: {
      context: "goal_creation",
      messages: [
        "This goal looks important. Want to break it into milestones? 📋",
        "Remember: Clear goals lead to clear action. 💡",
        "Make it challenging but achievable! 💪",
      ],
    },
    goal_progress: {
      context: "goal_progress",
      messages: [
        "Great progress today! Keep the momentum. 🚀",
        "You're making real progress toward your goals. 🎉",
        "Consistency is the secret sauce to success. 🔑",
      ],
    },
    milestone_complete: {
      context: "milestone_complete",
      messages: [
        "Milestone achieved! Celebrate this win! 🏆",
        "One step closer to your goal. Well done! 👏",
        "The best part? You're building momentum. 📈",
      ],
    },
  }

  useEffect(() => {
    const messages = guidanceMessages[currentContext]?.messages || guidanceMessages.browsing.messages
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]

    setDisplayedMessage("")
    setIsTyping(true)

    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex <= randomMessage.length) {
        setDisplayedMessage(randomMessage.slice(0, currentIndex))
        currentIndex++
      } else {
        setIsTyping(false)
        clearInterval(interval)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [currentContext])

  return (
    <div className="fixed bottom-8 right-8 max-w-xs z-40">
      <div className="bg-card border-2 border-primary/50 rounded-2xl p-4 shadow-2xl shadow-primary/20">
        {/* Dialog Arrow */}
        <div className="absolute -top-3 right-8 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-primary/50"></div>

        {/* Message Container */}
        <div className="relative">
          <p className="text-sm text-foreground leading-relaxed min-h-12">{displayedMessage}</p>
          {isTyping && <span className="inline-block w-1 h-4 ml-1 bg-primary animate-pulse"></span>}
        </div>

        {/* Button to trigger interaction */}
        <button
          onClick={() => {
            const contexts = Object.keys(guidanceMessages)
            const randomContext = contexts[Math.floor(Math.random() * contexts.length)]
            setCurrentContext(randomContext)
          }}
          className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
        >
          Tell me more
        </button>
      </div>
    </div>
  )
}
