import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// Load .env.local explicitly (Prisma migrate won't reliably do this automatically)
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
