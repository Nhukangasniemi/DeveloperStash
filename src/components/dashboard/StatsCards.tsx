import { FolderHeart, Folders, Layers, Star } from "lucide-react";

import { Card } from "@/components/ui/card";
import { MOCK_COLLECTIONS, MOCK_ITEMS } from "@/lib/mock-data";

const STATS = [
  {
    label: "Items",
    value: MOCK_ITEMS.length,
    icon: Layers,
  },
  {
    label: "Collections",
    value: MOCK_COLLECTIONS.length,
    icon: Folders,
  },
  {
    label: "Favorite items",
    value: MOCK_ITEMS.filter((item) => item.isFavorite).length,
    icon: Star,
  },
  {
    label: "Favorite collections",
    value: MOCK_COLLECTIONS.filter((collection) => collection.isFavorite).length,
    icon: FolderHeart,
  },
];

/** Four totals across the top of the dashboard. */
export function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {STATS.map(({ label, value, icon: Icon }) => (
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
