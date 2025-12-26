"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, Loader2, Menu, X, Calendar } from "lucide-react"
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

interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export default function TalkToQPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const supabase = getSupabaseBrowserClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      // Sidebar now stays in its current state during resize
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        loadSessions(user.id)
      }
    })
  }, [supabase])

  const loadSessions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(7)

      if (error) throw error
      setSessions(data || [])

      // Set active session to today's session or most recent
      const today = new Date().toISOString().split("T")[0]
      const todaySession = data?.find((s) => s.created_at.split("T")[0] === today)
      if (todaySession) {
        setActiveSessionId(todaySession.id)
        loadMessages(todaySession.id)
      }
    } catch (error) {
      console.error("[v0] Error loading sessions:", error)
    }
  }

  const loadMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })

      if (error) throw error

      const loadedMessages: Message[] = (data || []).map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
      }))

      setMessages(loadedMessages)
    } catch (error) {
      console.error("[v0] Error loading messages:", error)
    }
  }

  const getOrCreateTodaySession = async (userId: string): Promise<string> => {
    const today = new Date().toISOString().split("T")[0]

    // Check if today's session exists
    const existingSession = sessions.find((s) => s.created_at.split("T")[0] === today)
    if (existingSession) {
      return existingSession.id
    }

    // Create new session for today
    const sessionTitle = `Strategy ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`

    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: userId,
        title: sessionTitle,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Reload sessions to include the new one
    await loadSessions(userId)

    return data.id
  }

  const handleSessionClick = async (sessionId: string) => {
    if (sessionId === activeSessionId) return

    setIsLoadingSession(true)
    setActiveSessionId(sessionId)
    await loadMessages(sessionId)
    setIsLoadingSession(false)
    setIsSidebarOpen(false) // Close sidebar on mobile after selection
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefilledQuery = localStorage.getItem("q_prefilled_query")
      if (prefilledQuery) {
        setInput(prefilledQuery)
        localStorage.removeItem("q_prefilled_query")

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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading || !user) return

    let sessionId = activeSessionId
    if (!sessionId) {
      sessionId = await getOrCreateTodaySession(user.id)
      setActiveSessionId(sessionId)
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    await supabase.from("chat_messages").insert({
      session_id: sessionId,
      user_id: user.id,
      role: "user",
      content: userMessage.content,
    })

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

        setMessages((prev) => prev.map((m) => (m.id === assistantMessageId ? { ...m, content: fullContent } : m)))
      }

      if (!fullContent) {
        throw new Error("No content received from Q")
      }

      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        user_id: user.id,
        role: "assistant",
        content: fullContent,
      })

      await supabase.from("chat_sessions").update({ updated_at: new Date().toISOString() }).eq("id", sessionId)
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

  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "You"

  return (
    <div className="flex h-full relative">
      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-card border-r border-border transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-primary">TACTICAL LOG</h2>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days of strategies</p>
          </div>

          {/* Sessions List */}
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSessionClick(session.id)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    session.id === activeSessionId
                      ? "bg-primary/10 border-2 border-primary shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                      : "bg-muted/50 border-2 border-transparent hover:bg-muted hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{session.title}</p>
                      <p className="text-xs text-muted-foreground">{formatSessionDate(session.created_at)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setIsSidebarOpen(false)} />}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        <div className="flex items-center gap-3 p-4 border-b border-border bg-background">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">Talk to Q</h1>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div ref={scrollRef} className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
              {isLoadingSession ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading Strategy...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Talk to Q</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Ask me anything about academics, productivity, business, or mindset. I'll give you real advice,
                      not just motivation.
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
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-4">
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
      </div>
    </div>
  )
}
