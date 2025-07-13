import { env } from "@/env"
import { type Config } from "drizzle-kit"

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: env.PG_HOST,
    port: parseInt(env.PG_PORT),
    user: env.PG_USER,
    password: env.PG_PASSWORD,
    database: env.PG_DATABASE,
    ssl: false,
  },
  tablesFilter: ["web_*"],
} satisfies Config
