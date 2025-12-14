"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Volume2, Settings, Mic, Upload, X, Check, Scissors } from "lucide-react"

interface MascotWithDockProps {
  dialogLines?: string[]
}

export function MascotWithDock({ dialogLines = ["Be Realistic 🎯", "Stay Consistent 💪"] }: MascotWithDockProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null)
  const [uploadedAudio, setUploadedAudio] = useState<string | null>(null)
  const [customAudio, setCustomAudio] = useState<string | null>(null)
  const [audioTrimStart, setAudioTrimStart] = useState(0)
  const [audioTrimEnd, setAudioTrimEnd] = useState(100)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [isSleeping, setIsSleeping] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const speakingAudioRef = useRef<HTMLAudioElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isTyping || currentLineIndex >= dialogLines.length) {
      setIsTyping(false)
      setIsSleeping(true)
      if (speakingAudioRef.current) {
        speakingAudioRef.current.pause()
        speakingAudioRef.current.currentTime = 0
      }
      return
    }

    const currentLine = dialogLines[currentLineIndex]
    const typingSpeed = 50

    if (displayedText.length < currentLine.length) {
      const timer = setTimeout(() => {
        setDisplayedText(currentLine.slice(0, displayedText.length + 1))
      }, typingSpeed)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        setDisplayedText("")
        setCurrentLineIndex(currentLineIndex + 1)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [displayedText, currentLineIndex, isTyping, dialogLines])

  const handleMascotHover = () => {
    if (!isHovered) {
      setIsHovered(true)
      setIsTyping(true)
      setIsSleeping(false)
      setDisplayedText("")
      setCurrentLineIndex(0)

      if (speakingAudioRef.current) {
        speakingAudioRef.current.currentTime = 0
        speakingAudioRef.current.loop = false
        speakingAudioRef.current.play().catch((err) => {
          console.log("[v0] Speaking audio error:", err)
        })
      }
    } else if (isSleeping) {
      setIsTyping(true)
      setIsSleeping(false)
      setDisplayedText("")
      setCurrentLineIndex(0)

      if (speakingAudioRef.current) {
        speakingAudioRef.current.currentTime = 0
        speakingAudioRef.current.loop = false
        speakingAudioRef.current.play().catch((err) => {
          console.log("[v0] Speaking audio error:", err)
        })
      }
    }
  }

  const playAudio = () => {
    const audioToPlay = customAudio || "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/default_voice_note-jyzT85VzxlXSqQeNiRDK0kX3SkdUTo.mp3" // placeholder for default audio
    if (audioRef.current) {
      audioRef.current.src = audioToPlay
      audioRef.current.play().catch((err) => {
        console.error("Audio play error:", err)
      })
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const audioUrl = URL.createObjectURL(audioBlob)
        setRecordedAudio(audioUrl)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error("[v0] Microphone access error:", err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const audioUrl = URL.createObjectURL(file)
      setUploadedAudio(audioUrl)
      setRecordedAudio(null)
    }
  }

  const handleAddVoice = () => {
    const audioToSave = recordedAudio || uploadedAudio
    if (audioToSave) {
      setCustomAudio(audioToSave)
      setIsSettingsOpen(false)
      setRecordedAudio(null)
      setUploadedAudio(null)
      setAudioTrimStart(0)
      setAudioTrimEnd(100)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <>
      <audio ref={audioRef} />
      <audio ref={speakingAudioRef} src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/speaking_start-GYS43U8vGBw3Yx1N8DXoZ1DIY48kfx.mp3" preload="auto" />

      <div className="relative flex flex-col items-center">
        {isHovered && isTyping && (
          <div className="game-dialog mb-2">
            <div className="game-dialog-arrow"></div>
            <p className="text-sm font-medium text-foreground min-h-6">
              {displayedText || " "}
              {isTyping && displayedText.length < dialogLines[currentLineIndex]?.length && (
                <span className="animate-pulse">▊</span>
              )}
              {isSleeping && <span className="ml-2 animate-bounce">💤</span>}
            </p>
          </div>
        )}

        <div className="relative mb-2" onMouseEnter={handleMascotHover}>
          <img src="/images/q-mascot1.png" alt="Q Mascot" className="w-32 h-32 object-contain" />
        </div>

        <div className="mascot-dock">
          <button onClick={playAudio} className="dock-button" aria-label="Play audio" title="Play voice note">
            <Volume2 className="w-4 h-4" />
          </button>
          <div className="h-6 w-px bg-primary/20"></div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="dock-button"
            aria-label="Mascot settings"
            title="Voice settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border-2 border-primary/50 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-primary/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Voice Settings</h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Record Voice Note
                </h4>
                <div className="flex items-center gap-3">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                      isRecording
                        ? "bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse"
                        : "bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30"
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                    {isRecording ? `Recording... ${formatTime(recordingTime)}` : "Start Recording"}
                  </button>
                </div>
                {recordedAudio && (
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Recording ready</span>
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                    <audio src={recordedAudio} controls className="w-full" />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Upload Audio File
                </h4>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary/20 text-primary border border-primary/50 rounded-lg font-semibold hover:bg-primary/30 transition-all"
                >
                  <Upload className="w-5 h-5" />
                  Choose File
                </button>
                <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                {uploadedAudio && (
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">File uploaded</span>
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                    <audio src={uploadedAudio} controls className="w-full" />
                  </div>
                )}
              </div>

              {(recordedAudio || uploadedAudio) && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Trim Audio</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-12">Start</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={audioTrimStart}
                        onChange={(e) => setAudioTrimStart(Number(e.target.value))}
                        className="flex-1 accent-primary"
                      />
                      <span className="text-xs text-foreground w-12 text-right">{audioTrimStart}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-12">End</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={audioTrimEnd}
                        onChange={(e) => setAudioTrimEnd(Number(e.target.value))}
                        className="flex-1 accent-primary"
                      />
                      <span className="text-xs text-foreground w-12 text-right">{audioTrimEnd}%</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleAddVoice}
                disabled={!recordedAudio && !uploadedAudio}
                className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Add Voice
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
