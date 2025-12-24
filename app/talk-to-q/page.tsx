"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function TalkToQPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const supabase = getSupabaseBrowserClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefilledQuery = localStorage.getItem("q_prefilled_query")
      if (prefilledQuery) {
        setInput(prefilledQuery)
        localStorage.removeItem("q_prefilled_query")

        // Auto-submit the query after a short delay
        setTimeout(() => {
          const form = document.querySelector("form")
          if (form) {
            form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
          }
        }, 500)
      }
    }
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [supabase])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
    }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.details || errorData.error || "Failed to get response")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body")
      }

      let fullContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullContent += chunk

        // Update the message content in real-time
        setMessages((prev) => prev.map((m) => (m.id === assistantMessageId ? { ...m, content: fullContent } : m)))
      }

      if (!fullContent) {
        throw new Error("No content received from Q")
      }
    } catch (error) {
      console.error("[v0] Chat error:", error)

      let errorMessage = "Sorry, I encountered an error. Please try again."

      if (error instanceof Error) {
        if (error.message.includes("quota")) {
          errorMessage = "⚠️ API quota exceeded. Please check your Gemini API key or try again later."
        } else if (error.message.includes("API key")) {
          errorMessage = "⚠️ API key error. Please verify your Gemini API key is valid."
        } else {
          errorMessage = `Error: ${error.message}`
        }
      }

      setMessages((prev) => prev.map((m) => (m.id === assistantMessageId ? { ...m, content: errorMessage } : m)))
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "You"

  return (
    <>
      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="max-w-4xl mx-auto px-8 py-8 space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Talk to Q</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Ask me anything about academics, productivity, business, or mindset. I'll give you real advice, not
                    just motivation.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center pt-4">
                  {[
                    "How do I improve my CGPA?",
                    "Help me start a business",
                    "I'm procrastinating too much",
                    "How to build discipline?",
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(suggestion)}
                      className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm transition-colors border border-border"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="w-10 h-10 border-2 border-primary/30">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold">
                        Q
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-card border border-border text-card-foreground"
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="w-10 h-10 border-2 border-muted">
                      {user?.user_metadata?.avatar_url ? (
                        <AvatarImage src={user.user_metadata.avatar_url || "/placeholder.svg"} alt={userName} />
                      ) : (
                        <AvatarFallback className="bg-muted text-foreground font-semibold">
                          {userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-4 justify-start">
                <Avatar className="w-10 h-10 border-2 border-primary/30">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold">
                    Q
                  </AvatarFallback>
                </Avatar>
                <div className="bg-card border border-border rounded-2xl px-5 py-3">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background">
        <div className="max-w-4xl mx-auto px-8 py-4">
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <div className="flex-1">
              <Textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message here..."
                className="min-h-[60px] max-h-32 resize-none bg-muted text-foreground placeholder:text-muted-foreground border-border focus-visible:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e as any)
                  }
                }}
              />
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-[60px] w-[60px] rounded-xl shrink-0"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-3">Q can make mistakes, so double-check it</p>
        </div>
      </div>
    </>
  )
}
