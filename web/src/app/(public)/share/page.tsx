"use client"

import { VideoPlayer } from "@/components/view/video/player"
import { getSignedUrl } from "@/server/action/minio"
import { useSearchParams } from "next/navigation"
import React, { useEffect } from "react"

const SharePage = () => {
  const searchParams = useSearchParams()
  const videoId = searchParams.get("vid")

  const [videoUrl, setVideoUrl] = React.useState<string>("")
  const [error, setError] = React.useState<string>("")

  useEffect(() => {
    async function getData() {
      if (videoId) {
        const url = await getSignedUrl(videoId)
        setVideoUrl(url)
      }
    }
    getData().catch((err: Error) => {
      setError(err.message)
      console.error(err)
    })
  }, [videoId])

  return (
    <div className="h-[88vh] p-4">
      {videoUrl && (
        <VideoPlayer
          src={videoUrl}
          autoPlay={false}
          controls={false}
          className="h-full w-full"
        >
          Your browser does not support the video tag.
        </VideoPlayer>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}

export default SharePage
