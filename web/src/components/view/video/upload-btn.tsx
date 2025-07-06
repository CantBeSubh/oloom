/* eslint-disable @typescript-eslint/no-misused-promises */
"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadFile } from "@/server/action/minio"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"

const UploadButton = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const {
    mutate: uploadFileMutation,
    isPending: isUploading,
    error,
    data: url,
    isSuccess,
    isError,
  } = useMutation({
    mutationFn: (file: File) => uploadFile(file),
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ["videos"] })
        .catch((err) => console.error(err))
    },
    mutationKey: ["upload"],
  })

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length !== 1) {
        alert("Please select only one file")
        return
      }
      const file = acceptedFiles[0]
      if (!file) {
        alert("Please select valid files")
        return
      }
      uploadFileMutation(file)
    },
    [uploadFileMutation],
  )

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
        "flex size-full cursor-pointer flex-col items-center justify-center rounded-lg border p-4 text-center transition-colors",
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

      {isUploading && (
        <div className="mt-4 rounded-md bg-blue-50 p-4 text-blue-700">
          Uploading...
        </div>
      )}

      {isError && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-red-700">
          {error.message ?? "An error occurred while uploading"}
        </div>
      )}

      {isSuccess && (
        <div className="mt-4 rounded-md bg-green-50 p-4 text-green-700">
          Upload successful!
          <Button
            variant="link"
            onClick={(e) => {
              e.stopPropagation()
              router.push(url)
            }}
            className="ml-2 underline dark:text-black"
          >
            View video
          </Button>
        </div>
      )}
    </div>
  )
}

export default UploadButton
