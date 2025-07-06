/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import {
  MediaPlayer,
  MediaProvider,
  PlayButton,
  useMediaRemote,
  useMediaState,
  type MediaPlayerInstance,
  type MediaPlayerProps,
  type MediaProviderProps,
} from "@vidstack/react"
import {
  Gauge,
  Maximize,
  Minimize,
  Pause,
  Play,
  Redo,
  Undo,
  Volume2,
  VolumeX,
} from "lucide-react"
import * as React from "react"

interface VideoPlayerProps extends MediaPlayerProps {
  src: string
  poster?: string
  title?: string
  className?: string
  providerProps?: MediaProviderProps
}

export function VideoPlayer({
  src,
  poster,
  title,
  className,
  providerProps,
  ...props
}: VideoPlayerProps) {
  const playerRef = React.useRef<MediaPlayerInstance>(null)

  return (
    <div
      className={cn(
        "relative aspect-video w-[65%] overflow-hidden rounded-lg",
        className,
      )}
    >
      <MediaPlayer
        ref={playerRef}
        className="size-full"
        title={title}
        poster={poster}
        {...props}
      >
        <MediaProvider
          {...providerProps}
          onClick={(e) => e.stopPropagation()}
          className="size-full [&_video]:absolute [&_video]:top-1/2 [&_video]:left-1/2 [&_video]:h-full [&_video]:-translate-x-1/2 [&_video]:-translate-y-1/2 [&_video]:object-cover"
        >
          <source src={src} type="video/mp4" />
        </MediaProvider>
        <VideoControls player={playerRef} />
      </MediaPlayer>
    </div>
  )
}

function VideoControls({
  player,
}: {
  player: React.RefObject<MediaPlayerInstance | null>
}) {
  const paused = useMediaState("paused", player)
  const muted = useMediaState("muted", player)
  const volume = useMediaState("volume", player)
  const duration = useMediaState("duration", player)
  const currentTime = useMediaState("currentTime", player)
  const buffered = useMediaState("buffered", player)

  const remote = useMediaRemote()
  const [isControlsVisible, setIsControlsVisible] = React.useState(true)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1)

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

  const cyclePlaybackSpeed = () => {
    const currentIndex = speeds.indexOf(playbackSpeed)
    const nextIndex = (currentIndex + 1) % speeds.length
    const newSpeed = speeds[nextIndex]
    setPlaybackSpeed(newSpeed ?? 1)
    remote.changePlaybackRate(newSpeed ?? 1)
  }

  React.useEffect(() => {
    let timeout: NodeJS.Timeout

    const handleMouseMove = () => {
      setIsControlsVisible(true)
      clearTimeout(timeout)

      timeout = setTimeout(() => {
        if (!paused) {
          setIsControlsVisible(false)
        }
      }, 1500)
    }

    document.addEventListener("mousemove", handleMouseMove)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      clearTimeout(timeout)
    }
  }, [paused])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const bufferedPercent = React.useMemo(() => {
    if (!buffered || !duration || buffered.length === 0) return 0
    return (buffered.end(buffered.length - 1) / duration) * 100
  }, [buffered, duration])

  const toggleFullscreen = async () => {
    try {
      const playerElement = player.current?.el
      if (!playerElement) return

      if (!document?.fullscreenElement) {
        if (playerElement?.requestFullscreen) {
          await playerElement?.requestFullscreen()
          // @ts-expect-error - TypeScript doesn't know about the fullscreen API
        } else if (playerElement?.webkitRequestFullscreen) {
          // @ts-expect-error - Safari support
          await playerElement?.webkitRequestFullscreen()
        }
        setIsFullscreen(true)
      } else {
        if (document?.exitFullscreen) {
          await document?.exitFullscreen()
          // @ts-expect-error - TypeScript doesn't know about the fullscreen API
        } else if (document?.webkitExitFullscreen) {
          // @ts-expect-error - Safari support
          await document?.webkitExitFullscreen()
        }
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error("Failed to toggle fullscreen:", error)
    }
  }

  return (
    <div
      className={cn(
        "video-player-container absolute inset-0 flex flex-col justify-end transition-opacity duration-300",
        isControlsVisible ? "opacity-100" : "opacity-0",
      )}
      onMouseEnter={() => setIsControlsVisible(true)}
    >
      <PlayButton className="group absolute top-1/2 left-1/2 inline-flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md ring-sky-400 outline-none ring-inset hover:bg-white/20 data-[focus]:ring-4">
        <Play className="hidden h-12 w-12 rounded-lg bg-white p-1 group-data-[paused]:block dark:bg-black" />
        <Pause className="h-12 w-12 rounded-lg bg-white p-1 group-data-[paused]:hidden dark:bg-black" />
      </PlayButton>
      <div className="px-4 pb-1">
        <div className="relative h-1 rounded-full bg-gray-700">
          <div
            className="absolute h-full rounded-full bg-gray-500"
            style={{ width: `${bufferedPercent}%` }}
          />
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.01}
            onValueChange={(value) => remote.seek(value[0]!)}
            className="absolute inset-0 h-full"
          />
        </div>
      </div>

      <div className="flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => remote.togglePaused()}
            className="text-white hover:bg-white/20"
          >
            {paused ? (
              <Play className="h-5 w-5" />
            ) : (
              <Pause className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => remote.seek(Math.max(0, currentTime - 10))}
            className="text-white hover:bg-white/20"
          >
            <Undo className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              remote.seek(Math.min(duration || 0, currentTime + 10))
            }
            className="text-white hover:bg-white/20"
          >
            <Redo className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => remote.toggleMuted()}
              className="text-white hover:bg-white/20"
            >
              {muted || volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>

            <div className="hidden w-20 sm:block">
              <Slider
                value={[muted ? 0 : volume * 100]}
                max={100}
                step={1}
                onValueChange={(value) => {
                  remote.changeVolume(value[0]! / 100)
                  if (value[0]! > 0 && muted) {
                    remote.toggleMuted()
                  }
                }}
              />
            </div>
          </div>

          <div className="ml-2 text-xs text-white">
            {formatTime(currentTime)} / {formatTime(duration || 0)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={cyclePlaybackSpeed}>
            <div className="flex items-center gap-1">
              <Gauge className="h-5 w-5" />
              <span className="ml-1 text-xs">{playbackSpeed}x</span>
            </div>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/20"
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
