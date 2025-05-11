"use client"

import { Button } from "@/components/ui/button"
import { createShortUrl } from "@/server/action/shorturl"
import { getVideos } from "@/server/action/video"
import type { shortUrls, videos as videoTable } from "@/server/db/schema"
import { Clipboard, ShareIcon } from "lucide-react"
import { useEffect, useState } from "react"

type VideoType = {
  video: typeof videoTable.$inferSelect
  short_url: typeof shortUrls.$inferSelect | null
}

const VideoList = () => {
  const [videos, setVideos] = useState<VideoType[]>([])

  useEffect(() => {
    async function getData() {
      const result = await getVideos()
      if (result.success && result.data) {
        setVideos(result.data)
      } else {
        console.error(result.error)
      }
    }
    getData().catch(console.error)
  }, [])

  const handleShare = async (videoId: string) => {
    const result = await createShortUrl(videoId)
    if (result.success) {
      console.log(result.data)
      alert("Short url created successfully")
    } else {
      console.error(result.error)
      alert("Error creating short url")
    }
  }

  return (
    <div className="mx-auto h-full w-full p-6">
      <div className="flex h-full w-full flex-wrap gap-4">
        {videos.map(({ video, short_url }) => (
          <div
            key={video.id}
            className="flex h-40 w-64 flex-col items-start justify-between gap-2 rounded-lg border p-4"
          >
            <div className="w-full">
              <h3 className="mb-2 truncate text-lg font-semibold">
                {video.title}
              </h3>
              <p className="mb-4 truncate text-sm text-gray-600">
                {video.description}
              </p>
            </div>

            <div className="flex w-full items-center justify-between">
              <span className="text-sm text-gray-500">
                {new Date(video.createdAt ?? 0).toLocaleDateString()}
              </span>
              {short_url ? (
                <Button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      window.location.origin +
                        `/share/${short_url.shortVideoId}`,
                    )
                  }
                  // href={`/share/${short_url.shortVideoId}`}
                >
                  <Clipboard className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => handleShare(video.id)}>
                  <ShareIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <p className="mt-8 text-center text-gray-500">
          No videos uploaded yet.
        </p>
      )}
    </div>
  )
}

export default VideoList
