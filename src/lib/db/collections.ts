/**
 * Collection reads for the dashboard, straight from Postgres.
 *
 * Every query is scoped to one owner. The type breakdown is computed here, not
 * in the components, so a card only ever renders what it is handed.
 */

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export interface CollectionTypeShare {
  type: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
  count: number;
}

export interface CollectionSummary {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  updatedAt: Date;
  /** Types the collection holds, most dominant first. Empty when it has no items. */
  types: CollectionTypeShare[];
}

export interface CollectionStats {
  total: number;
  favorites: number;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SIDEBAR_RECENT_LIMIT = 5;

const SUMMARY_SELECT = {
  id: true,
  name: true,
  description: true,
  isFavorite: true,
  updatedAt: true,
  items: {
    select: {
      addedAt: true,
      item: {
        select: {
          type: { select: { id: true, name: true, icon: true, color: true } },
        },
      },
    },
  },
} satisfies Prisma.CollectionSelect;

type CollectionRow = Prisma.CollectionGetPayload<{
  select: typeof SUMMARY_SELECT;
}>;

/**
 * Tallies a collection's items by type, most dominant first. Ties go to the
 * type added most recently, so the order follows what the collection is
 * becoming.
 */
function getTypeBreakdown(
  items: CollectionRow["items"],
): CollectionTypeShare[] {
  const tally = new Map<
    string,
    CollectionTypeShare & { lastAddedAt: number }
  >();

  for (const { addedAt, item } of items) {
    const current = tally.get(item.type.id);

    tally.set(item.type.id, {
      type: item.type,
      count: (current?.count ?? 0) + 1,
      lastAddedAt: Math.max(current?.lastAddedAt ?? 0, addedAt.getTime()),
    });
  }

  return [...tally.values()]
    .sort((a, b) => b.count - a.count || b.lastAddedAt - a.lastAddedAt)
    .map(({ type, count }) => ({ type, count }));
}

function toSummary({ items, ...collection }: CollectionRow): CollectionSummary {
  return {
    ...collection,
    itemCount: items.length,
    types: getTypeBreakdown(items),
  };
}

/** Most recently updated collections first; all of them when no limit is given. */
export async function getRecentCollections(
  userId: string,
  limit?: number,
): Promise<CollectionSummary[]> {
  const rows = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: SUMMARY_SELECT,
  });

  return rows.map(toSummary);
}

/**
 * What the sidebar lists: the most recent collections plus every favourite,
 * most recently updated first. Two bounded reads instead of loading every
 * collection and its join rows.
 */
export async function getSidebarCollections(
  userId: string,
): Promise<CollectionSummary[]> {
  const [recent, favorites] = await Promise.all([
    getRecentCollections(userId, SIDEBAR_RECENT_LIMIT),
    prisma.collection
      .findMany({
        where: { userId, isFavorite: true },
        orderBy: { updatedAt: "desc" },
        select: SUMMARY_SELECT,
      })
      .then((rows) => rows.map(toSummary)),
  ]);

  const byId = new Map(
    [...recent, ...favorites].map((collection) => [collection.id, collection]),
  );

  return [...byId.values()].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  );
}

export async function getCollectionStats(
  userId: string,
): Promise<CollectionStats> {
  const [total, favorites] = await Promise.all([
    prisma.collection.count({ where: { userId } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ]);

  return { total, favorites };
}

/**
 * The collection's name, or null when it doesn't exist or isn't the user's.
 * Non-uuid ids return null too, rather than letting Postgres reject the cast.
 */
export async function getCollectionName(
  userId: string,
  collectionId: string,
): Promise<string | null> {
  if (!UUID_PATTERN.test(collectionId)) return null;

  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    select: { name: true },
  });

  return collection?.name ?? null;
}
