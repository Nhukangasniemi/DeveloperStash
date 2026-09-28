import { FolderHeart, Folders, Layers, Star } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { CollectionStats } from "@/lib/db/collections";
import type { ItemStats } from "@/lib/db/items";

interface StatsCardsProps {
  items: ItemStats;
  collections: CollectionStats;
}

/** Four totals across the top of the dashboard. */
export function StatsCards({ items, collections }: StatsCardsProps) {
  const stats = [
    {
      label: "Items",
      value: items.total,
      icon: Layers,
    },
    {
      label: "Collections",
      value: collections.total,
      icon: Folders,
    },
    {
      label: "Favorite items",
      value: items.favorites,
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
