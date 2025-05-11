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
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">My Videos</h1>
      <Link href="/dashboard/videos/upload" className="text-blue-500 underline">
        Upload Video
      </Link>
      <pre>{JSON.stringify(videos, null, 2)}</pre>
    </div>
  )
}

export default VideosPage
