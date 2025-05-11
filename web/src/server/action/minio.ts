"use server"

import * as Minio from "minio"
// import { env } from '@/env'

const minioClient = new Minio.Client({
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
})

export const uploadFile = async (file: File) => {
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
