import Link from "next/link";
import { Star } from "lucide-react";

import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { Card } from "@/components/ui/card";
import { getTypeBreakdown } from "@/lib/collections";
import { formatCount, formatRelativeTime } from "@/lib/format";
import { getTypeLabel } from "@/lib/item-types";
import type { Collection } from "@/lib/mock-data";
import type { TypeShare } from "@/lib/collections";

/** One type present in the collection, sized down to sit in a row. */
function TypeShareIcon({ type, count }: TypeShare) {
  const description = `${formatCount(count, "item")} · ${getTypeLabel(type.name)}`;

  return (
    <span
      title={description}
      className="flex size-6 items-center justify-center rounded-md"
      style={{ backgroundColor: `${type.color}1f`, color: type.color }}
    >
      <TypeIcon iconName={type.icon} className="size-3.5" />
      <span className="sr-only">{description}</span>
    </span>
  );
}

/**
 * A collection in the dashboard grid.
 *
 * The accent comes from the type that dominates the collection's items, and the
 * row of icons along the bottom shows every type it holds, most dominant first.
 * A collection with no items has neither — it renders untinted rather than
 * falling back to a default color.
 */
export function CollectionCard({ collection }: { collection: Collection }) {
  const breakdown = getTypeBreakdown(collection.id);
  const accent = breakdown[0]?.type.color;

  return (
    <Card className="group gap-0 overflow-hidden p-0 transition-colors hover:border-ring">
      <Link
        href={`/collections/${collection.id}`}
        className="flex h-full flex-col gap-3 border-b-2 border-transparent p-4"
        /* Accent hex comes from the data, so it can't be a Tailwind class. */
        style={accent ? { borderBottomColor: accent } : undefined}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium">{collection.name}</h3>
          {collection.isFavorite && (
            <Star
              aria-label="Favorite"
              className="size-4 shrink-0 fill-yellow-400 text-yellow-400"
            />
          )}
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {collection.description}
        </p>

        <div className="mt-auto space-y-3 pt-2">
          {breakdown.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {breakdown.map(({ type, count }) => (
                <TypeShareIcon key={type.id} type={type} count={count} />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatCount(collection.itemCount, "item")}</span>
            <span>{formatRelativeTime(collection.updatedAt)}</span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
