"use server"

import { db } from "@/server/db"
import { shortUrls } from "@/server/db/schema"
import { convertUuidToBase36 } from "@/utils/enoding"
import { eq } from "drizzle-orm"

export const createShortUrl = async (videoId: string) => {
  try {
    const [shortUrl] = await db
      .insert(shortUrls)
      .values({
        videoId,
        shortVideoId: convertUuidToBase36(videoId),
      })

      .returning()
    return { success: true, data: shortUrl }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to create short url" }
  }
}

export const getShortUrl = async (shortVideoId: string) => {
  try {
    const shortUrl = await db
      .select()
      .from(shortUrls)
      .where(eq(shortUrls.shortVideoId, shortVideoId))
      .get()

    if (!shortUrl) {
      return { success: false, error: "Short url not found" }
    }

    return { success: true, data: shortUrl }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to fetch short url" }
  }
}

export const deleteShortUrl = async (id: string) => {
  try {
    const [shortUrl] = await db
      .delete(shortUrls)
      .where(eq(shortUrls.id, id))
      .returning()

    if (!shortUrl) {
      return { success: false, error: "Short url not found" }
    }

    return { success: true, data: shortUrl }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to delete short url" }
  }
}

export const updateShortUrlName = async (id: string, name: string) => {
  try {
    const [shortUrl] = await db
      .update(shortUrls)
      .set({ shortVideoId: name })
      .where(eq(shortUrls.id, id))
      .returning()

    if (!shortUrl) {
      return { success: false, error: "Short url not found" }
    }

    return { success: true, data: shortUrl }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to update short url" }
  }
}
