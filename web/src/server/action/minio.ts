"use server"

import { env } from "@/env"
import { Client } from "@temporalio/client"
import * as Minio from "minio"
import { auth } from "../auth"
import { createVideo, getVideo } from "./video"

const minioClient = new Minio.Client({
  endPoint: env.MINIO_URL,
  port: parseInt(env.MINIO_PORT),
  useSSL: true,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
})

export const uploadFile = async (file: File) => {
  try {
    const temporalClient = new Client()
    const session = await auth()
    if (!session) {
      throw new Error("Not authenticated")
    }

    const userId = session.user.id
    const uniqueFilename = `${userId}/${crypto.randomUUID()}/video.${file.type.split("/")[1]}`

    const bucketName = "oloom"
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await minioClient.putObject(bucketName, uniqueFilename, buffer, file.size, {
      "Content-Type": file.type,
    })

    const response = await createVideo({
      userId: session.user.id,
      title: file.name.split(".").slice(0, -1).join("."),
      description: file.name,
      filename: uniqueFilename,
    })

    if (!response.success || !response.data) {
      throw new Error("Failed to create video")
    }

    await temporalClient.workflow.start("ProcessVideo", {
      args: [{ video_id: response.data.id, file_name: response.data.filename }],
      taskQueue: "video-task-queue",
      workflowId: `video-task-${response.data.id}`,
    })

    return `/share?vid=${response.data.id}`
  } catch (error: unknown) {
    console.error("Error uploading file:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Unknown error occurred during file upload")
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
