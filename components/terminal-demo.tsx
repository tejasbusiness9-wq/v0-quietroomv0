"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Send, ChevronRight } from "lucide-react"

const TerminalDemo: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ type: "user" | "bot"; text: string }>>([
    { type: "bot", text: "SYSTEM ONLINE. USER DETECTED." },
    { type: "bot", text: "I am Q. Your tactical operator. State your primary objective." },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isTyping) return

    const userMsg = inputValue
    setInputValue("")
    setMessages((prev) => [...prev, { type: "user", text: userMsg }])

    // Simple Logic for the demo
    setIsTyping(true)
    setTimeout(() => {
      let response = ""
      if (userMsg.toLowerCase().includes("cook") || userMsg.toLowerCase().includes("recipe")) {
        response = "ACCESS DENIED. I do not handle culinary requests. Focus on your objectives, Operative."
      } else if (userMsg.toLowerCase().includes("level") || userMsg.toLowerCase().includes("stats")) {
        response =
          "SCANNING... You are Level 5 with 3 Overdue Tasks. We cannot afford distractions. Tactical plan required."
      } else {
        response = `OBJECTIVE RECEIVED. INITIATING STRATEGY: 
1.1 Isolate high-impact variables.
1.2 Execute 60-minute Zen Cycle. 
1.3 Claim Aura rewards. 
Awaiting execution command.`
      }
      setMessages((prev) => [...prev, { type: "bot", text: response }])
      setIsTyping(false)
    }, 1000)
  }

  return (
    <div className="w-full max-w-xl mx-auto border border-primary/30 bg-black/80 rounded-lg overflow-hidden flex flex-col h-[500px] shadow-2xl shadow-primary/20">
      {/* Header */}
      <div className="bg-[#111] px-4 py-2 border-b border-primary/20 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
        </div>
        <div className="text-[10px] font-mono text-primary uppercase tracking-[0.2em]">Q-Terminal v1.0.4</div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto font-mono text-sm space-y-4 scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.type === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] ${m.type === "user" ? "text-primary" : "text-gray-300"} leading-relaxed`}>
              <span className="mr-2">{m.type === "user" ? ">" : "[Q]:"}</span>
              <span className="whitespace-pre-wrap">{m.text}</span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="text-primary animate-pulse">&gt; ,,, </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-primary/20 bg-[#0a0a0a] flex items-center space-x-3">
        <ChevronRight className="text-primary w-4 h-4 shrink-0" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="ENTER COMMAND..."
          className="bg-transparent border-none outline-none flex-1 text-primary font-mono placeholder:text-primary/30"
        />
        <button type="submit" className="text-primary hover:scale-110 transition-transform">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}

export default TerminalDemo
