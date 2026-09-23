/**
 * Reads across the item ↔ collection join.
 *
 * These are the queries the database will eventually run; keeping them in one
 * place means the components never walk the join themselves.
 */

import {
  MOCK_COLLECTIONS,
  MOCK_ITEM_COLLECTIONS,
  MOCK_ITEM_TYPES,
  MOCK_ITEMS,
  type Collection,
  type Item,
  type ItemType,
} from "@/lib/mock-data";

const ITEMS_BY_ID = new Map(MOCK_ITEMS.map((item) => [item.id, item]));
const COLLECTIONS_BY_ID = new Map(
  MOCK_COLLECTIONS.map((collection) => [collection.id, collection]),
);
const TYPES_BY_ID = new Map(MOCK_ITEM_TYPES.map((type) => [type.id, type]));

export function getItemsInCollection(collectionId: string): Item[] {
  return MOCK_ITEM_COLLECTIONS.filter(
    (row) => row.collectionId === collectionId,
  )
    .map((row) => ITEMS_BY_ID.get(row.itemId))
    .filter((item): item is Item => item !== undefined);
}

export function getCollectionsForItem(itemId: string): Collection[] {
  return MOCK_ITEM_COLLECTIONS.filter((row) => row.itemId === itemId)
    .map((row) => COLLECTIONS_BY_ID.get(row.collectionId))
    .filter((collection): collection is Collection => collection !== undefined);
}

export interface TypeShare {
  type: ItemType;
  count: number;
}

/**
 * Which types a collection holds, most dominant first.
 *
 * Ties go to whichever type was added most recently, so the order follows what
 * the collection is becoming. A collection holding no items returns an empty
 * list — there is no default type to fall back on.
 */
export function getTypeBreakdown(collectionId: string): TypeShare[] {
  const tally = new Map<string, { count: number; lastAddedAt: number }>();

  for (const row of MOCK_ITEM_COLLECTIONS) {
    if (row.collectionId !== collectionId) continue;

    const item = ITEMS_BY_ID.get(row.itemId);
    if (!item) continue;

    const current = tally.get(item.itemTypeId) ?? { count: 0, lastAddedAt: 0 };

    tally.set(item.itemTypeId, {
      count: current.count + 1,
      lastAddedAt: Math.max(current.lastAddedAt, Date.parse(row.addedAt)),
    });
  }

  return [...tally.entries()]
    .sort(
      ([, a], [, b]) => b.count - a.count || b.lastAddedAt - a.lastAddedAt,
    )
    .map(([typeId, stats]) => ({
      type: TYPES_BY_ID.get(typeId),
      count: stats.count,
    }))
    .filter((share): share is TypeShare => share.type !== undefined);
}

/**
 * The type that makes up most of a collection, which gives the collection its
 * color. Null when the collection holds no items, so it renders untinted
 * rather than picking a default color.
 */
export function getDominantType(collectionId: string): ItemType | null {
  return getTypeBreakdown(collectionId)[0]?.type ?? null;
}
