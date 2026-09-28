import { Pin, Star } from "lucide-react";

import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ItemSummary } from "@/lib/db/items";
import { formatCount, formatRelativeTime } from "@/lib/format";

/** Code and prose get a monospace block; links and files read as a single line. */
function ItemPreview({ item }: { item: ItemSummary }) {
  if (!item.preview) return null;

  if (item.contentType === "URL") {
    return (
      <p className="truncate text-xs text-muted-foreground">{item.preview}</p>
    );
  }

  if (item.contentType === "FILE") {
    return (
      <p className="truncate font-mono text-xs text-muted-foreground">
        {item.preview}
      </p>
    );
  }

  return (
    <pre className="max-h-24 overflow-hidden rounded-md bg-muted/50 p-2.5 font-mono text-xs leading-relaxed text-muted-foreground">
      {item.preview}
    </pre>
  );
}

export function ItemCard({ item }: { item: ItemSummary }) {
  const { type } = item;
  const accent = type.color;

  return (
    <Card
      className="gap-3 border-l-2 p-4 transition-colors hover:border-ring"
      /* Type hex comes from the data, so it can't be a Tailwind class. */
      style={accent ? { borderLeftColor: accent } : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className="flex size-6 items-center justify-center rounded-md"
            style={
              accent
                ? { backgroundColor: `${accent}1f`, color: accent }
                : undefined
            }
          >
            {type.icon && (
              <TypeIcon iconName={type.icon} className="size-3.5" />
            )}
          </span>
          <span className="capitalize">{type.name}</span>
        </span>

        <span className="flex items-center gap-1.5">
          {item.isPinned && (
            <Pin
              aria-label="Pinned"
              className="size-3.5 text-muted-foreground"
            />
          )}
          {item.isFavorite && (
            <Star
              aria-label="Favorite"
              className="size-3.5 fill-yellow-400 text-yellow-400"
            />
          )}
        </span>
      </div>

      <h3 className="font-medium">{item.title}</h3>

      <ItemPreview item={item} />

      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between pt-1 text-xs text-muted-foreground">
        <span>{formatCount(item.collectionCount, "collection")}</span>
        <span>{formatRelativeTime(item.updatedAt)}</span>
      </div>
    </Card>
  );
}
