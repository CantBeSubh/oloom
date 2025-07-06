"use client"

import { VideoPlayer } from "@/components/view/video/player"
import { getSignedUrl } from "@/server/action/minio"
import { getVideo } from "@/server/action/video"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"

const SharePage = () => {
  const searchParams = useSearchParams()
  const videoId = searchParams.get("vid")

  const { data: video, error: videoError } = useQuery({
    queryKey: ["videos", videoId],
    queryFn: () => getVideo(videoId!),
    enabled: !!videoId,
  })

  const { data: videoUrl, error: urlError } = useQuery({
    queryKey: ["videoUrl", videoId],
    queryFn: () => getSignedUrl(videoId!),
    enabled: !!videoId,
    staleTime: 3600 * 1000,
  })

  const error = videoError?.message ?? urlError?.message

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
