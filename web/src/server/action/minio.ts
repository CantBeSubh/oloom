"use server"

import * as Minio from "minio"
import { auth } from "../auth"
import { createVideo, getVideo } from "./video"
// import { env } from '@/env'

const minioClient = new Minio.Client({
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
})

export const uploadFile = async (file: File) => {
  const session = await auth()
  if (!session) {
    throw new Error("Not authenticated")
  }
  try {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate unique filename to avoid collisions
    const timestamp = Date.now()
    const uniqueFilename = `${timestamp}-${file.name}`

    // Define bucket name - make sure this bucket exists in your MinIO setup
    const bucketName = "oloom"

    // Upload file to MinIO
    await minioClient.putObject(bucketName, uniqueFilename, buffer, file.size, {
      "Content-Type": file.type,
    })

    // Generate URL for the uploaded file

    const presignedUrl = await minioClient.presignedGetObject(
      bucketName,
      uniqueFilename,
      1000,
    )

    await createVideo({
      userId: session.user.id,
      title: file.name,
      description: file.name,
      filename: uniqueFilename,
    })

    return {
      success: true,
      url: presignedUrl,
      filename: uniqueFilename,
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    return {
      success: false,
      error: "Failed to upload file",
    }
  }
}

export const getSignedUrl = async (videoId: string, expiresIn = 1000) => {
  try {
    const video = await getVideo(videoId)
    if (video.error) {
      throw new Error(video.error)
    }
    if (!video.data) {
      throw new Error("Video not found")
    }

    const bucketName = "oloom"
    const fileName = video.data.filename

    const presignedUrl = await minioClient.presignedGetObject(
      bucketName,
      fileName,
      expiresIn,
    )

    return presignedUrl
  } catch (error) {
    console.error(error)
    throw new Error(
      `Failed to get signed url: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}
