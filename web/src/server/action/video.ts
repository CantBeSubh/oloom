"use server"

import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { shortUrls, videos as videoTable } from "@/server/db/schema"
import { eq } from "drizzle-orm"
type Video = typeof videoTable.$inferInsert

export const createVideo = async (data: Video) => {
  try {
    const [video] = await db.insert(videoTable).values(data).returning()
    return { success: true, data: video }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to create video" }
  }
}

export const getVideos = async (limit = 10, offset = 0) => {
  const session = await auth()
  if (!session) {
    return { success: false, error: "Not authenticated" }
  }
  try {
    const videos = await db
      .select()
      .from(videoTable)
      .where(eq(videoTable.userId, session.user.id))
      .limit(limit)
      .offset(offset)
      .leftJoin(shortUrls, () => eq(shortUrls.videoId, videoTable.id))

    return { success: true, data: videos }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to fetch videos" }
  }
}

export const getVideo = async (id: string) => {
  try {
    const video = await db
      .select()
      .from(videoTable)
      .where(eq(videoTable.id, id))
      .get()

    if (!video) {
      return { success: false, error: "Video not found" }
    }

    return { success: true, data: video }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to fetch video" }
  }
}

export const updateVideo = async (id: string, data: Partial<Video>) => {
  try {
    const [video] = await db
      .update(videoTable)
      .set(data)
      .where(eq(videoTable.id, id))
      .returning()

    if (!video) {
      return { success: false, error: "Video not found" }
    }

    return { success: true, data: video }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to update video" }
  }
}

export const deleteVideo = async (id: string) => {
  try {
    const [video] = await db
      .delete(videoTable)
      .where(eq(videoTable.id, id))
      .returning()

    if (!video) {
      return { success: false, error: "Video not found" }
    }

    return { success: true, data: video }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to delete video" }
  }
}
