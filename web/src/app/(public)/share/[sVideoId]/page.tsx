"use client"

import { getShortUrl } from "@/server/action/shorturl"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"

const ShortPage = () => {
  const router = useRouter()
  const params = useParams()
  const sVideoId = params.sVideoId as string

  const { error } = useQuery({
    queryKey: ["shortUrl", sVideoId],
    queryFn: async () => {
      const shortUrl = await getShortUrl(sVideoId)
      router.push(`/share?vid=${shortUrl.videoId}`)
      return true
    },
    enabled: !!sVideoId,
    retry: 1,
    refetchOnMount: true,
  })

  return (
    <div>
      <div className="flex min-h-screen items-center justify-center p-4">
        {error ? (
          <p className="text-red-500">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  )
}

export default ShortPage
