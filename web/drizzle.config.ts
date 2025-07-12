import { type Config } from "drizzle-kit"

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.PG_HOST!,
    port: parseInt(process.env.PG_PORT!),
    user: process.env.PG_USER!,
    password: process.env.PG_PASSWORD!,
    database: process.env.PG_DATABASE!,
    ssl: false,
  },
  tablesFilter: ["web_*"],
} satisfies Config
