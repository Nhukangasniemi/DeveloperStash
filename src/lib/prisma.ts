import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "@/generated/prisma/client";

/**
 * Shared Prisma client.
 *
 * Prisma 7 requires a driver adapter — there is no built-in connection layer
 * any more. `PrismaNeon` talks to Neon over a WebSocket pool, which supports
 * interactive transactions (`PrismaNeonHttp` does not).
 *
 * DATABASE_URL must be the POOLED Neon string. Migrations use the unpooled
 * DIRECT_URL instead — see `prisma.config.ts`.
 *
 * Neon's driver picks up the global `WebSocket`, which exists on Node 22+. On
 * an older runtime you would need to set `neonConfig.webSocketConstructor`.
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and fill in your Neon connection strings.",
  );
}

function createPrismaClient() {
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });
}

// Next.js dev server re-evaluates modules on every hot reload. Without a
// global cache each reload would open a new pool and exhaust Neon's limit.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
