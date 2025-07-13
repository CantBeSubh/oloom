import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import { env } from "@/env"
import * as schema from "./schema"

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  client: Pool | undefined
}

export const client =
  globalForDb.client ??
  new Pool({
    host: env.PG_HOST,
    port: parseInt(env.PG_PORT),
    user: env.PG_USER,
    password: env.PG_PASSWORD,
    database: env.PG_DATABASE,
    ssl: false,
  })

if (env.NODE_ENV !== "production") globalForDb.client = client

export const db = drizzle(client, { schema })
