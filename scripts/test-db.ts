/**
 * Database smoke test.
 *
 * Run with `npm run db:test`. Checks that the app's real runtime path works:
 * the pooled Neon connection, the generated client, the schema, the seeded
 * system types, and the constraints the schema relies on.
 *
 * Safe to re-run. Read-only checks run directly; anything that writes runs
 * inside a transaction that is always rolled back, so the database is left
 * exactly as it was found.
 *
 * This is a smoke test, not a unit test suite — it answers "is the database
 * wired up correctly", not "is the business logic right".
 */
import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "../src/generated/prisma/client";

const EXPECTED_TABLES = [
  "accounts",
  "collections",
  "item_collections",
  "item_tags",
  "item_types",
  "items",
  "sessions",
  "tags",
  "users",
  "verification_tokens",
];

const SYSTEM_TYPE_NAMES = [
  "snippet",
  "prompt",
  "command",
  "note",
  "link",
  "file",
  "image",
];

/** Thrown to roll the write checks back; never escapes `main`. */
class Rollback extends Error {}

const results: { name: string; ok: boolean; detail: string }[] = [];

function check(name: string, ok: boolean, detail = "") {
  results.push({ name, ok, detail });
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env first.");
  process.exit(1);
}

const prisma = new PrismaClient({
  // Logging is off because one check deliberately violates a foreign key to
  // prove `Restrict` works; Prisma would print that expected failure as an
  // error. Real failures are reported by the catch blocks below.
  adapter: new PrismaNeon({ connectionString }),
  log: [],
});

/** Connection, schema shape, and naming conventions. */
async function readOnlyChecks() {
  const host = new URL(connectionString!).hostname;
  check("pooled DATABASE_URL", host.includes("-pooler"), host);

  const [{ now }] = await prisma.$queryRaw<{ now: Date }[]>`SELECT now() AS now`;
  check("connection", now instanceof Date, now?.toISOString() ?? "");

  const tables = await prisma.$queryRaw<{ t: string }[]>`
    SELECT table_name::text AS t FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name <> '_prisma_migrations'
    ORDER BY table_name`;
  const found = tables.map((r) => r.t);
  const missing = EXPECTED_TABLES.filter((t) => !found.includes(t));
  check("tables present", missing.length === 0, missing.length ? `missing ${missing.join(", ")}` : `${found.length} tables`);

  const quoted = await prisma.$queryRaw<{ t: string; c: string }[]>`
    SELECT table_name::text AS t, column_name::text AS c
    FROM information_schema.columns
    WHERE table_schema = 'public' AND (table_name ~ '[A-Z]' OR column_name ~ '[A-Z]')`;
  check("snake_case identifiers", quoted.length === 0, quoted.length ? JSON.stringify(quoted) : "no quoting needed");

  const nonUuid = await prisma.$queryRaw<{ t: string; c: string; u: string }[]>`
    SELECT table_name::text AS t, column_name::text AS c, udt_name::text AS u
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name <> '_prisma_migrations'
      AND column_name IN ('id','user_id','type_id','item_id','collection_id','tag_id')
      AND udt_name <> 'uuid'`;
  check("uuid keys", nonUuid.length === 0, nonUuid.length ? JSON.stringify(nonUuid) : "all key columns are uuid");

  const types = await prisma.itemType.findMany({ where: { isSystem: true } });
  const names = types.map((t) => t.name).sort();
  const expected = [...SYSTEM_TYPE_NAMES].sort();
  check("system item types seeded", JSON.stringify(names) === JSON.stringify(expected), `${types.length}/7: ${names.join(", ")}`);
  check("system types have no owner", types.every((t) => t.userId === null), "userId null");
}

/** Writes, relations and constraints — rolled back at the end. */
async function writeChecks() {
  try {
    await prisma.$transaction(async (tx) => {
      const type = await tx.itemType.findFirstOrThrow({ where: { name: "snippet" } });

      const user = await tx.user.create({
        data: { email: `db-test-${Date.now()}@devstash.local`, name: "DB Test" },
      });
      check("uuid v7 generated", user.id[14] === "7", user.id);

      const collection = await tx.collection.create({
        data: { name: "Smoke Test", userId: user.id },
      });
      const tag = await tx.tag.create({ data: { name: "smoke", userId: user.id } });

      const item = await tx.item.create({
        data: {
          title: "probe",
          contentType: "URL",
          url: "https://example.com",
          userId: user.id,
          typeId: type.id,
          collections: { create: { collectionId: collection.id } },
          tags: { create: { tagId: tag.id } },
        },
        include: { collections: true, tags: true, type: true },
      });
      check("enum round-trip", item.contentType === "URL", item.contentType);
      check("many-to-many joins", item.collections.length === 1 && item.tags.length === 1, "1 collection, 1 tag");
      check("relation loads type", item.type.name === "snippet", item.type.name);

      // An item type still in use must not be deletable.
      //
      // This must stay the LAST check in the transaction: the failed statement
      // aborts the Postgres transaction, so anything queried after it would
      // fail with "current transaction is aborted" rather than its own result.
      const restricted = await tx.itemType
        .delete({ where: { id: type.id } })
        .then(() => false)
        .catch(() => true);
      check("Restrict blocks in-use type delete", restricted, "delete rejected");

      throw new Rollback();
    });
  } catch (error) {
    if (!(error instanceof Rollback)) throw error;
  }
}

/** Confirms the rollback actually took effect. */
async function rollbackCheck() {
  const leftovers = await prisma.user.count({
    where: { email: { startsWith: "db-test-" } },
  });
  check("transaction rolled back", leftovers === 0, `${leftovers} test rows left behind`);
}

async function main() {
  await readOnlyChecks();
  await writeChecks();
  await rollbackCheck();

  for (const { name, ok, detail } of results) {
    console.log(`${ok ? "PASS" : "FAIL"}  ${name.padEnd(34)} ${detail}`);
  }

  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  if (failed > 0) process.exit(1);
}

main()
  .catch((error) => {
    console.error("\nDatabase test failed to run:");
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
