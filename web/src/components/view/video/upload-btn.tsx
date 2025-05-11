/* eslint-disable @typescript-eslint/no-misused-promises */
"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadFile } from "@/server/action/minio"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"

const UploadButton = () => {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    success?: boolean
    url?: string
    error?: string
  }>({})

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length !== 1) {
      alert("Please select valid files")
      return
    }
    const file = acceptedFiles[0]
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
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [],
    },
    multiple: false,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex size-full cursor-pointer items-center justify-center rounded-lg border p-4 text-center transition-colors",
        isDragActive && "border-dashed",
      )}
    >
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="mb-6 text-2xl font-bold">Upload Video</h1>

        <input {...getInputProps()} />
        {isDragActive ? (
          <div>
            <p className="text-gray-600">Drop you video here...</p>
            <p className="mt-2 text-sm text-gray-500">
              Only video files are accepted
            </p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600">
              Drag and drop a video here, or click to select
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Only video files are accepted
            </p>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {uploadStatus.success && (
        <div className="mt-4 rounded-md bg-green-50 p-4 text-green-700">
          Upload successful!
          <Button
            variant="link"
            onClick={() => {
              router.push(uploadStatus.url!)
            }}
            className="ml-2 underline"
          >
            View video
          </Button>
        </div>
      )}

      {uploadStatus.error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-red-700">
          {uploadStatus.error}
        </div>
      )}

      {isUploading && (
        <div className="mt-4 rounded-md bg-blue-50 p-4 text-blue-700">
          Uploading...
        </div>
      )}
    </div>
  )
}

export default UploadButton
