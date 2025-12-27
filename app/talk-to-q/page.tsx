"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Loader2, Menu, X, Calendar, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import ReactMarkdown from "react-markdown"

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
  const [userProfile, setUserProfile] = useState<any>(null)
  const supabase = getSupabaseBrowserClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(false)

  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = "en-US"

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput((prev) => prev + " " + transcript)
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      recognitionInstance.onerror = (event: any) => {
        console.error("[v0] Speech recognition error:", event.error)
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [])

  const toggleListening = () => {
    if (!recognition) return

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

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
        loadUserProfile(user.id)
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

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, username")
        .eq("user_id", userId)
        .single()

      if (error) throw error
      setUserProfile(data)
    } catch (error) {
      console.error("[v0] Error loading user profile:", error)
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

    setSessions((prev) => [data, ...prev])

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
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [messages, isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading || !user) return

    let sessionId = activeSessionId
    if (!sessionId) {
      sessionId = await getOrCreateTodaySession(user.id)
      setActiveSessionId(sessionId)
    }

    const userMessageId = `user-${Date.now()}`
    const userMessage: Message = {
      id: userMessageId,
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

    const assistantMessageId = `assistant-${Date.now()}`
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
    }

    setMessages((prev) => [...prev, assistantMessage])

    try {
      const [profileData, statsData, goalsData, tasksData, streakData] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("user_stats").select("*").eq("user_id", user.id).single(),
        supabase.from("goals").select("*").eq("user_id", user.id).eq("status", "in_progress").limit(5),
        supabase.from("tasks").select("*").eq("user_id", user.id).eq("completed", false).limit(5),
        supabase.from("streaks").select("*").eq("user_id", user.id).single(),
      ])

      const profile = profileData.data
      const stats = statsData.data
      const goals = goalsData.data || []
      const tasks = tasksData.data || []
      const streak = streakData.data

      const userData = {
        name: profile?.display_name || profile?.username || user.email?.split("@")[0] || "Operator",
        level: profile?.level || 1,
        xp: profile?.current_xp || 0,
        aura: profile?.aura || 0,
        streak: streak?.current_streak || 0,
        longestStreak: streak?.longest_streak || 0,
        userClass: profile?.user_class || "Beginner",
        tasksCompleted: stats?.tasks_completed || 0,
        goalsCompleted: stats?.goals_completed || 0,
        zenMinutes: stats?.total_zen_minutes || 0,
        goals: goals.map((g) => ({
          title: g.title,
          progress: g.progress || 0,
        })),
        tasks: tasks.map((t) => ({
          title: t.title,
        })),
      }

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
          userData,
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

        setMessages((prev) => {
          const newMessages = [...prev]
          const msgIndex = newMessages.findIndex((m) => m.id === assistantMessageId)
          if (msgIndex !== -1) {
            newMessages[msgIndex] = { ...newMessages[msgIndex], content: fullContent }
          }
          return newMessages
        })

        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
          }
        }, 50)
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
          errorMessage = "⚠️ API quota exceeded. Please check your API key or try again later."
        } else if (error.message.includes("API key")) {
          errorMessage = "⚠️ API key error. Please verify your API key is valid."
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

  const userDisplayName = userProfile?.display_name || userProfile?.username || user?.email?.split("@")[0] || "You"
  const userInitial = userDisplayName[0]?.toUpperCase() || "U"

  return (
    <div className="flex h-full relative">
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-3 border-b border-border">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-primary">TACTICAL LOG</h2>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </div>

          {/* Sessions List */}
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-2">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSessionClick(session.id)}
                  className={`w-full p-2.5 rounded-lg text-left transition-all ${
                    session.id === activeSessionId
                      ? "bg-primary/10 border-2 border-primary shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                      : "bg-muted/50 border-2 border-transparent hover:bg-muted hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Calendar className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{session.title}</p>
                      <p className="text-[10px] text-muted-foreground">{formatSessionDate(session.created_at)}</p>
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
        <div className="flex items-center gap-3 p-3 border-b border-border bg-background">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-base font-bold">Talk to Q</h1>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div ref={scrollRef} className="max-w-4xl mx-auto px-4 md:px-8 py-4 space-y-4">
              {isLoadingSession ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Loading Strategy...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <img src="/images/qmascot.png" alt="Q" className="w-16 h-16" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Welcome back, Operator</h2>
                  <p className="text-muted-foreground mb-6">Q is ready to help you strategize.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <img src="/images/qmascot.png" alt="Q" className="w-6 h-6" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                            ul: ({ children }) => <ul className="mb-2 last:mb-0 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="mb-2 last:mb-0 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>,
                            code: ({ children }) => (
                              <code className="bg-background/50 px-1 py-0.5 rounded text-sm">{children}</code>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="text-primary-foreground text-xs font-bold">{userInitial}</span>
                      </div>
                    )}
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <img src="/images/qmascot.png" alt="Q" className="w-6 h-6" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Q is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="border-t border-border bg-background p-3">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Type your message here..."
              className="min-h-[48px] max-h-[120px] resize-none"
              disabled={isLoading}
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={toggleListening}
              className="shrink-0 h-12 w-12 bg-transparent"
              disabled={isLoading}
            >
              <Mic className={`w-5 h-5 ${isListening ? "text-red-500 animate-pulse" : ""}`} />
            </Button>
            <Button type="submit" size="icon" className="shrink-0 h-12 w-12" disabled={isLoading || !input.trim()}>
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-2">Q can make mistakes, so double-check it</p>
        </div>
      </div>
    </div>
  )
}
