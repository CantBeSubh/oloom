"use client"

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
    <div className="flex min-h-screen items-center justify-center p-4">
      {videoUrl && (
        <video
          controls
          className="max-h-[80vh] max-w-full rounded-lg shadow-lg"
          autoPlay={false}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}

export default SharePage
