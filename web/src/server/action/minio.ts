"use server"

import * as Minio from "minio"
import { auth } from "../auth"
import { createVideo, getVideo } from "./video"
// import { env } from '@/env'

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_IP!,
  port: parseInt(process.env.MINIO_PORT!),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
})

export const uploadFile = async (file: File) => {
  try {
    const session = await auth()
    if (!session) {
      throw new Error("Not authenticated")
    }

    // TODO: generate subtitle (.srt) file
    const userId = session.user.id
    const uniqueFilename = `${userId}/${crypto.randomUUID()}/video.${file.type.split("/")[1]}`

    const bucketName = "oloom"
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await minioClient.putObject(bucketName, uniqueFilename, buffer, file.size, {
      "Content-Type": file.type,
    })

    // Generate URL for the uploaded file

    const response = await createVideo({
      userId: session.user.id,
      title: file.name.split(".").slice(0, -1).join("."),
      description: file.name,
      filename: uniqueFilename,
    })

    if (!response.success || !response.data) {
      throw new Error("Failed to create video")
    }

    return `/share?vid=${response.data.id}`
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

export const getSignedUrl = async (videoId: string, expiresIn = 3600) => {
  try {
    const video = await getVideo(videoId)
    if (!video) {
      throw new Error("Video not found")
    }

    const bucketName = "oloom"
    const fileName = video.filename

    const presignedUrl = await minioClient.presignedGetObject(
      bucketName,
      fileName,
      expiresIn,
    )

    const ObjectName = fileName.split("/")
    ObjectName.pop()
    const subtitleUrl = ObjectName.join("/") + "/transcript.vtt"
    let subtitlePresignedUrl = null
    try {
      const exists = await minioClient.statObject(bucketName, subtitleUrl)
      if (exists) {
        subtitlePresignedUrl = await minioClient.presignedGetObject(
          bucketName,
          subtitleUrl,
          expiresIn,
        )
      }
    } catch (error) {
      // Object doesn't exist, leave subtitleContent as null
      console.error(error)
    }

    return {
      videoUrl: presignedUrl,
      subtitleUrl: subtitlePresignedUrl,
    }
  } catch (error) {
    console.error(error)
    throw new Error(
      `Failed to get signed url: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

export const removeFile = async (filename: string) => {
  try {
    const bucketName = "oloom"
    const objectNameArr = filename.split("/")
    objectNameArr.pop()
    const objectName = objectNameArr.join("/")
    await minioClient.removeObject(bucketName, objectName)
    return true
  } catch (error) {
    console.error(error)
    throw new Error(
      `Failed to remove file: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}
