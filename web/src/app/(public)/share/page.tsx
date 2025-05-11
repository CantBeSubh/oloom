"use client"

import { VideoPlayer } from "@/components/view/video/player"
import { getSignedUrl } from "@/server/action/minio"
import { getVideo } from "@/server/action/video"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

type VideoType = Awaited<ReturnType<typeof getVideo>>["data"]

const SharePage = () => {
  const searchParams = useSearchParams()
  const videoId = searchParams.get("vid")

  const [video, setVideo] = useState<VideoType | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    async function getData() {
      if (videoId) {
        const url = await getSignedUrl(videoId)
        setVideoUrl(url)
        const video = await getVideo(videoId)
        if (video.success && video.data) {
          setVideo(video.data)
        }
      }
    }
    getData().catch((err: Error) => {
      setError(err.message)
      console.error(err)
    })
  }, [videoId])

  return (
    <div className="h-[88vh] p-4">
      <div className="mb-4 flex items-center justify-center">
        {videoUrl && (
          <VideoPlayer src={videoUrl} autoPlay={false} controls={false}>
            Your browser does not support the video tag.
          </VideoPlayer>
        )}
      </div>
      {video && (
        <div>
          <h1 className="text-2xl font-bold">{video.title}</h1>
          <p className="text-sm">{video.description}</p>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}

export default SharePage
