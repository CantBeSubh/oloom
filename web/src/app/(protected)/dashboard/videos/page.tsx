"use client"

import { uploadFile } from "@/server/action/minio"
import { useState } from "react"

const VideosPage = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    success?: boolean
    url?: string
    error?: string
  }>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const file = formData.get("video") as File

    if (!file) {
      setUploadStatus({ success: false, error: "Please select a video file" })
      return
    }

    try {
      setIsUploading(true)
      const result = await uploadFile(file)
      setUploadStatus(result)
    } catch (error) {
      alert("Error uploading video")
      console.error(error)
      setUploadStatus({ success: false, error: "Upload failed" })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Upload Video</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="video"
            className="block text-sm font-medium text-gray-700"
          >
            Select Video
          </label>
          <input
            type="file"
            id="video"
            name="video"
            accept="video/*"
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : "Upload Video"}
        </button>
      </form>

      {/* Status Messages */}
      {uploadStatus.success && (
        <div className="mt-4 rounded-md bg-green-50 p-4 text-green-700">
          Upload successful!
          <a
            href={uploadStatus.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 underline"
          >
            View video
          </a>
        </div>
      )}

      {uploadStatus.error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-red-700">
          {uploadStatus.error}
        </div>
      )}
    </div>
  )
}

export default VideosPage
