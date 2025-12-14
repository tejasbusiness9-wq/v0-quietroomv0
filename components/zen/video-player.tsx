"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Maximize, X, Link as LinkIcon } from "lucide-react"
import YouTube from "react-youtube"

interface VideoPlayerProps {
  onClose?: () => void
}

export const VideoPlayer = ({ onClose }: VideoPlayerProps) => {
  const [videoUrl, setVideoUrl] = useState("")
  const [videoId, setVideoId] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const handleFetchVideo = () => {
    const id = extractVideoId(videoUrl)
    if (id) {
      setVideoId(id)
    }
  }

  const toggleFullscreen = () => {
    const element = document.getElementById("video-container")
    if (!document.fullscreenElement && element) {
      element.requestFullscreen()
      setIsFullscreen(true)
    } else if (document.fullscreenElement) {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  if (!videoId) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
        <div className="flex items-center gap-2 mb-4">
          <LinkIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">YouTube Video</h3>
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Paste YouTube URL here..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="bg-background/50"
          />
          <Button onClick={handleFetchVideo} className="bg-primary hover:bg-primary/90">
            Fetch
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div
      id="video-container"
      className={`relative bg-black ${isFullscreen ? "w-screen h-screen" : "w-full aspect-video"}`}
    >
      <YouTube
        videoId={videoId}
        opts={{
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 1,
            controls: 1,
            rel: 0,
            modestbranding: 1,
          },
        }}
        className="w-full h-full"
      />
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          size="icon"
          variant="secondary"
          onClick={toggleFullscreen}
          className="bg-background/80 hover:bg-background"
        >
          <Maximize className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={() => setVideoId(null)}
          className="bg-background/80 hover:bg-background"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
