import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Seeds the seven system item types.
 *
 * Primary keys are `uuid` columns, so these cannot be readable strings like
 * "type_snippet". They use a reserved block instead — an all-zero UUIDv7
 * timestamp with a small counter in the node field — which is valid, stable
 * across every environment, and obviously synthetic at a glance.
 *
 * Fixed ids are what make this idempotent: `@@unique([userId, name])` cannot
 * guard system types, because Postgres treats NULL userIds as distinct, so
 * upserting by id is what stops re-runs creating duplicates.
 *
 * `src/lib/mock-data.ts` still uses the old readable ids; that mock data is
 * frontend-only and gets deleted when the dashboard moves to real queries.
 */
const SYSTEM_ITEM_TYPES = [
  {
    id: "00000000-0000-7000-8000-000000000001",
    name: "snippet",
    icon: "Code",
    color: "#3b82f6",
  },
  {
    id: "00000000-0000-7000-8000-000000000002",
    name: "prompt",
    icon: "Sparkles",
    color: "#8b5cf6",
  },
  {
    id: "00000000-0000-7000-8000-000000000003",
    name: "command",
    icon: "Terminal",
    color: "#f97316",
  },
  {
    id: "00000000-0000-7000-8000-000000000004",
    name: "note",
    icon: "StickyNote",
    color: "#fde047",
  },
  {
    id: "00000000-0000-7000-8000-000000000005",
    name: "link",
    icon: "Link",
    color: "#10b981",
  },
  {
    id: "00000000-0000-7000-8000-000000000006",
    name: "file",
    icon: "File",
    color: "#6b7280",
  },
  {
    id: "00000000-0000-7000-8000-000000000007",
    name: "image",
    icon: "Image",
    color: "#ec4899",
  },
] as const;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set — cannot seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

async function main() {
  for (const type of SYSTEM_ITEM_TYPES) {
    await prisma.itemType.upsert({
      where: { id: type.id },
      update: {
        name: type.name,
        icon: type.icon,
        color: type.color,
        isSystem: true,
        userId: null,
      },
      create: {
        id: type.id,
        name: type.name,
        icon: type.icon,
        color: type.color,
        isSystem: true,
      },
    });
  }

  console.log(`Seeded ${SYSTEM_ITEM_TYPES.length} system item types.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
