"use client"

import { getVideos } from "@/server/action/video"
import { useQuery } from "@tanstack/react-query"
import { columns } from "./columns"
import { DataTable } from "./data-table"

const VideoList = () => {
  const { data: videos, error } = useQuery({
    queryKey: ["videos"],
    queryFn: () => getVideos(),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  if (error) {
    return (
      <div className="mx-auto w-full p-6 text-red-500">
        {error instanceof Error ? error.message : "An error occurred"}
      </div>
    )
  }

  return (
    <div className="mx-auto w-full p-6">
      <DataTable columns={columns} data={videos ?? []} />
    </div>
  )
}

export default VideoList
