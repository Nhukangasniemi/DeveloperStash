import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma CLI configuration (Prisma 7).
 *
 * In v7 the datasource URL moved out of `schema.prisma` and env files are no
 * longer loaded automatically — hence the `dotenv/config` import above.
 *
 * The CLI uses DIRECT_URL (an unpooled Neon connection). Migrations open long
 * sessions and issue advisory locks, which a PgBouncer-style pooler breaks.
 * The app itself uses the pooled DATABASE_URL — see `src/lib/prisma.ts`.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
