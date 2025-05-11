"use client"

import { getShortUrl } from "@/server/action/shorturl"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const ShortPage = () => {
  const params = useParams()
  const sVideoId = params.sVideoId as string
  const [error, setError] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    async function getData() {
      if (sVideoId) {
        const result = await getShortUrl(sVideoId)
        if (result.success && result.data) {
          router.push(`/share?vid=${result.data.videoId}`)
        } else {
          console.error("Error fetching short URL:", result.error)
          setError(result.error!)
        }
      } else {
        console.log("No video ID provided")
      }
    }
    getData().catch((error) => {
      console.error("Unhandled error in getData:", error)
    })
  }, [sVideoId])

  return (
    <div>
      <div className="flex min-h-screen items-center justify-center p-4">
        {error ? <p className="text-red-500">{error}</p> : <p>Loading...</p>}
      </div>
    </div>
  )
}

export default ShortPage
