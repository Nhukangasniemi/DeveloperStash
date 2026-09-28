import { FolderHeart, Folders, Layers, Star } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { CollectionStats } from "@/lib/db/collections";
import { MOCK_ITEMS } from "@/lib/mock-data";

/**
 * Four totals across the top of the dashboard.
 *
 * Collection totals come from the database; item totals still count mock data
 * until the items section is wired up.
 */
export function StatsCards({ collections }: { collections: CollectionStats }) {
  const stats = [
    {
      label: "Items",
      value: MOCK_ITEMS.length,
      icon: Layers,
    },
    {
      label: "Collections",
      value: collections.total,
      icon: Folders,
    },
    {
      label: "Favorite items",
      value: MOCK_ITEMS.filter((item) => item.isFavorite).length,
      icon: Star,
    },
    {
      label: "Favorite collections",
      value: collections.favorites,
      icon: FolderHeart,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="gap-0 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{label}</p>
            <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
        </Card>
      ))}
    </div>
  );
}
