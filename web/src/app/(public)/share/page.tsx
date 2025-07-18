"use client"

import { Spinner } from "@/components/ui/spinner"
import { getSignedUrl } from "@/server/action/minio"
import { getVideo } from "@/server/action/video"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"

const SharePage = () => {
  const searchParams = useSearchParams()
  const videoId = searchParams.get("vid")

  const {
    data: video,
    error: videoError,
    isLoading: videoLoading,
  } = useQuery({
    queryKey: ["videos", videoId],
    queryFn: () => getVideo(videoId!),
    enabled: !!videoId,
  })

  const {
    data,
    error: urlError,
    isLoading: urlLoading,
  } = useQuery({
    queryKey: ["videoUrl", videoId],
    queryFn: () => getSignedUrl(videoId!),
    enabled: !!videoId,
    staleTime: 3600 * 1000,
  })

  const error = videoError?.message ?? urlError?.message
  const isLoading = videoLoading || urlLoading

  if (isLoading) {
    return (
      <div className="flex h-[88vh] items-center justify-center p-4">
        <Spinner size="large" />
      </div>
    )
  }

  return (
    <div className="h-[88vh] p-4">
      <div className="mb-4 flex items-center justify-center">
        {data?.videoUrl && (
          // TODO: fix captions
          // <VideoPlayer
          //   src={data.videoUrl}
          //   autoPlay={false}
          //   controls={false}
          //   subtitleUrl={data?.subtitleUrl ?? undefined}
          // >
          //   Your browser does not support the video tag.
          // </VideoPlayer>
          <video
            controls
            crossOrigin="anonymous"
            className="aspect-video w-[75%] overflow-hidden rounded-lg"
          >
            <source src={data.videoUrl} type="video/mp4" />
            {data?.subtitleUrl && (
              <track kind="captions" src={data?.subtitleUrl} srcLang="en" />
            )}
          </video>
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
