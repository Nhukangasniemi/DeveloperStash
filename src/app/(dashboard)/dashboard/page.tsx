import Link from "next/link";

import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { StatsCards } from "@/components/dashboard/StatsCards";
import {
  getCollectionStats,
  getRecentCollections,
} from "@/lib/db/collections";
import {
  getItemStats,
  getPinnedItems,
  getRecentItems,
} from "@/lib/db/items";
import { getCurrentUserId } from "@/lib/db/users";
import { formatCount } from "@/lib/format";

const RECENT_COLLECTION_LIMIT = 6;

function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  const [
    recentCollections,
    collectionStats,
    pinnedItems,
    recentItems,
    itemStats,
  ] = await Promise.all([
    getRecentCollections(userId, RECENT_COLLECTION_LIMIT),
    getCollectionStats(userId),
    getPinnedItems(userId),
    // No limit until the /items pages exist — this is the only full list.
    getRecentItems(userId),
    getItemStats(userId),
  ]);

  return (
    <div className="space-y-8">
      <StatsCards items={itemStats} collections={collectionStats} />

      <section className="space-y-4">
        <SectionHeading
          title="Collections"
          subtitle={formatCount(collectionStats.total, "collection")}
          action={
            <Link
              href="/collections"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              View all
            </Link>
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {recentCollections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading
          title="All Items"
          subtitle={formatCount(itemStats.total, "item")}
        />

        {pinnedItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Pinned
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {pinnedItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Recent
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
