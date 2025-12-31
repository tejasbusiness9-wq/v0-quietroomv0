"use client"

import { useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createTestUserBypass } from "../actions"
import Image from "next/image"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const TEST_EMAIL = "testuser@gmail.com"
  const TEST_PASSWORD = "TestPassword123!"

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  const handleDevBypass = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await createTestUserBypass()

      if (!result.success) {
        throw new Error(result.error || "Failed to create test user")
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      const supabase = getSupabaseBrowserClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      })

      if (signInError) throw signInError

      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to bypass authentication")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 bg-black -z-10" />

      <div className="hidden md:block absolute top-8 left-8 text-xs font-mono text-muted-foreground/60 space-y-1">
        <div>PLAYER_STABLE</div>
        <div>REPUTATION_LEVEL: MAX</div>
      </div>

      <div className="hidden md:block absolute top-8 right-8 text-xs font-mono text-muted-foreground/60 space-y-1">
        <div>SESSION:</div>
        <div>RANK:</div>
      </div>

      <div className="relative w-full max-w-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-purple-600/40 to-purple-500/40 rounded-lg blur-sm" />
        <div className="absolute inset-[1px] bg-[#1a1625]/95 backdrop-blur-xl rounded-lg" />

        <div className="relative p-8 md:p-12 space-y-6 text-center">
          <div className="space-y-3">
            <div className="flex justify-center mb-4">
              <Image
                src="/ui/new-logo.png"
                alt="Quiet Room"
                width={64}
                height={64}
                className="rounded-full md:w-20 md:h-20"
              />
            </div>

            <h1
              className="text-3xl md:text-4xl font-bold tracking-wider text-white"
              style={{ fontFamily: "monospace" }}
            >
              QUIET ROOM
            </h1>

            <div className="flex items-center justify-center gap-3 md:gap-4 text-xs md:text-sm text-purple-400">
              <div className="h-px w-12 md:w-16 bg-gradient-to-r from-transparent to-purple-400" />
              <span className="font-mono tracking-widest">INTEGRITY FIRST</span>
              <div className="h-px w-12 md:w-16 bg-gradient-to-l from-transparent to-purple-400" />
            </div>
          </div>

          <div className="space-y-3 py-4">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              A quiet system for
              <br />
              focused work.
            </h2>

            <p className="text-gray-400 text-sm md:text-base">
              A sanctum for those who work without the
              <br className="hidden sm:block" />
              need for an audience.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-12 md:h-14 bg-transparent hover:bg-purple-500/10 text-white border-2 border-purple-500/50 hover:border-purple-400 font-mono tracking-widest transition-all duration-300 text-sm md:text-base"
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 mr-2 md:mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                CONTINUE WITH GOOGLE
              </>
            )}
          </Button>

          <button
            onClick={handleDevBypass}
            disabled={isLoading}
            className="font-mono text-sm text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
          >
            BYPASS_GATE &gt;&gt;
          </button>

          <p className="text-xs font-mono text-gray-500 tracking-wider pt-2">EPHEMERAL_SESSION: NO_DATA_RETENTION</p>
        </div>
      </div>
    </div>
  )
}
