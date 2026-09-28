/**
 * Item reads for the dashboard, straight from Postgres.
 *
 * Every query is scoped to one owner. The payload column differs by content
 * type, so it is resolved to a single preview string here and the card only
 * ever renders what it is handed.
 */

import type { ContentType, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export interface ItemSummary {
  id: string;
  title: string;
  contentType: ContentType;
  /** Text body, URL, or file name depending on `contentType`; null when empty. */
  preview: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  updatedAt: Date;
  type: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
  tags: string[];
  collectionCount: number;
}

export interface ItemTypeCount {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  /** The user's items of this type. */
  count: number;
}

export interface ItemStats {
  total: number;
  favorites: number;
}

const SUMMARY_SELECT = {
  id: true,
  title: true,
  contentType: true,
  content: true,
  url: true,
  fileUrl: true,
  fileName: true,
  isFavorite: true,
  isPinned: true,
  updatedAt: true,
  type: { select: { id: true, name: true, icon: true, color: true } },
  tags: {
    select: { tag: { select: { name: true } } },
    orderBy: { tag: { name: "asc" } },
  },
  _count: { select: { collections: true } },
} satisfies Prisma.ItemSelect;

type ItemRow = Prisma.ItemGetPayload<{ select: typeof SUMMARY_SELECT }>;

function getPreview(item: ItemRow): string | null {
  switch (item.contentType) {
    case "URL":
      return item.url;
    case "FILE":
      return item.fileName ?? item.fileUrl?.split("/").pop() ?? null;
    default:
      return item.content;
  }
}

function toSummary(item: ItemRow): ItemSummary {
  return {
    id: item.id,
    title: item.title,
    contentType: item.contentType,
    preview: getPreview(item),
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    updatedAt: item.updatedAt,
    type: item.type,
    tags: item.tags.map(({ tag }) => tag.name),
    collectionCount: item._count.collections,
  };
}

/** Every pinned item, most recently updated first. */
export async function getPinnedItems(userId: string): Promise<ItemSummary[]> {
  const rows = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    select: SUMMARY_SELECT,
  });

  return rows.map(toSummary);
}

/**
 * Most recently updated first; all of them when no limit is given. Pinned
 * items are shown on their own, so they're left out of the recent list.
 */
export async function getRecentItems(
  userId: string,
  limit?: number,
): Promise<ItemSummary[]> {
  const rows = await prisma.item.findMany({
    where: { userId, isPinned: false },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: SUMMARY_SELECT,
  });

  return rows.map(toSummary);
}

/**
 * System types plus the user's own custom types, each with how many of the
 * user's items it holds. System ids come from a reserved low block, so sorting
 * by id keeps them in seed order with custom types after.
 */
export async function getItemTypesWithCounts(
  userId: string,
): Promise<ItemTypeCount[]> {
  const rows = await prisma.itemType.findMany({
    where: { OR: [{ isSystem: true }, { userId }] },
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
      _count: { select: { items: { where: { userId } } } },
    },
  });

  return rows.map(({ _count, ...type }) => ({ ...type, count: _count.items }));
}

export async function getItemStats(userId: string): Promise<ItemStats> {
  const [total, favorites] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
  ]);

  return { total, favorites };
}
