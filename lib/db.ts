// lib/db.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/**
 * Prisma 7+ (no datasource url in schema.prisma):
 * - DATABASE_URL lives in .env(.local) + prisma.config.ts
 * - PrismaClient uses a driver adapter for direct Postgres connections.
 */

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function makeClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is missing. Add it to .env.local (and Vercel env vars)."
    );
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Neon typically works with sslmode=require in the URL.
    // If you hit SSL errors, uncomment this:
    // ssl: { rejectUnauthorized: false },
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
