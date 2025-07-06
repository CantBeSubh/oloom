"use client"

import { Spinner } from "@/components/ui/spinner"
import { getShortUrl } from "@/server/action/shorturl"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"

const ShortPage = () => {
  const router = useRouter()
  const params = useParams()
  const sVideoId = params.sVideoId as string

  const { error, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <div className="flex min-h-[88vh] items-center justify-center p-4">
        <Spinner size="large" />
      </div>
    )
  }
  return (
    <div>
      <div className="flex min-h-[88vh] items-center justify-center p-4">
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
