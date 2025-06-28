"use client"

import { createShortUrl } from "@/server/action/shorturl"
import { getVideos } from "@/server/action/video"
import { useEffect, useState } from "react"
import { columns, type VideoType } from "./columns"
import { DataTable } from "./data-table"

// This needs to be accessible by the columns
export const handleShare = async (videoId: string) => {
  const result = await createShortUrl(videoId)
  if (result.success) {
    console.log(result.data)
    alert("Short url created successfully")
  } else {
    console.error(result.error)
    alert("Error creating short url")
  }
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

  return (
    <div className="mx-auto w-full p-6">
      <DataTable columns={columns} data={videos} />
    </div>
  )
}

export default VideoList
