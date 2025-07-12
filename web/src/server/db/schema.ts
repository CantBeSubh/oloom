import { relations } from "drizzle-orm"
import {
  index,
  integer,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import { type AdapterAccount } from "next-auth/adapters"

export const createTable = pgTableCreator((name) => `web_${name}`)

// --- NEXTAUTH ---
export const users = createTable("user", () => ({
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }).defaultNow(),
  image: varchar("image", { length: 255 }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}))

export const accounts = createTable(
  "account",
  () => ({
    userId: uuid("userId")
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
    refresh_token_expires_in: integer("refresh_token_expires_in"),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
)

export const sessions = createTable(
  "session",
  () => ({
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  }),
  (t) => [index("session_userId_idx").on(t.userId)],
)

export const verificationTokens = createTable(
  "verification_token",
  () => ({
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
)

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

// --- MAIN TABLES ---
export const videos = createTable("video", () => ({
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  filename: varchar("filename", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
}))

export const shortUrls = createTable("short_url", () => ({
  id: uuid("id").primaryKey().defaultRandom(),
  videoId: uuid("videoId")
    .notNull()
    .unique()
    .references(() => videos.id, { onDelete: "cascade" }),
  shortVideoId: varchar("shortVideoId", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow(),
}))

// --- RELATIONS ---
export const videosRelations = relations(videos, ({ one }) => ({
  user: one(users, { fields: [videos.userId], references: [users.id] }),
}))

export const shortUrlsRelations = relations(shortUrls, ({ one }) => ({
  video: one(videos, { fields: [shortUrls.videoId], references: [videos.id] }),
}))
