"use client"

import { getVideos } from "@/server/action/video"
import type { videos as videoTable } from "@/server/db/schema"
import Link from "next/link"
import { useEffect, useState } from "react"

type VideoType = typeof videoTable.$inferSelect

const VideosPage = () => {
  const [videos, setVideos] = useState<VideoType[]>([])

  useEffect(() => {
    async function getData() {
      const result = await getVideos()
      if (result.success) {
        setVideos(result.data!)
      } else {
        console.error(result.error)
      }
    }
    getData().catch(console.error)
  }, [])

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Videos</h1>
        <Link
          href="/dashboard/videos/upload"
          className="rounded-md bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
        >
          Upload Video
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <div key={video.id} className="rounded-lg border p-4 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">{video.title}</h3>
            <p className="mb-4 text-sm text-gray-600">{video.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {new Date(video.createdAt ?? 0).toLocaleDateString()}
              </span>
              <Link
                href={`/share?vid=${video.id}`}
                className="text-blue-500 transition hover:text-blue-600"
              >
                Share
              </Link>
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

export default VideosPage
