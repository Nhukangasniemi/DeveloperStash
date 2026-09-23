import Link from "next/link";

import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { formatCount } from "@/lib/format";
import { MOCK_COLLECTIONS, MOCK_ITEMS } from "@/lib/mock-data";

const RECENT_ITEM_LIMIT = 10;

const byRecency = <T extends { updatedAt: string }>(a: T, b: T) =>
  Date.parse(b.updatedAt) - Date.parse(a.updatedAt);

const RECENT_COLLECTIONS = [...MOCK_COLLECTIONS].sort(byRecency);

const PINNED_ITEMS = MOCK_ITEMS.filter((item) => item.isPinned).sort(byRecency);

/** Pinned items are already shown above, so they're left out of the recent list. */
const RECENT_ITEMS = MOCK_ITEMS.filter((item) => !item.isPinned)
  .sort(byRecency)
  .slice(0, RECENT_ITEM_LIMIT);

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

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <StatsCards />

      <section className="space-y-4">
        <SectionHeading
          title="Collections"
          subtitle={formatCount(RECENT_COLLECTIONS.length, "collection")}
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
          {RECENT_COLLECTIONS.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading
          title="All Items"
          subtitle={formatCount(MOCK_ITEMS.length, "item")}
        />

        {PINNED_ITEMS.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              Pinned
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {PINNED_ITEMS.map((item) => (
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
            {RECENT_ITEMS.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
