import { createElement } from "react";

import { getTypeIcon } from "@/lib/item-types";

/**
 * Renders the lucide icon an item type stores by name.
 *
 * `createElement` rather than `<Icon />`: the lookup returns one of a fixed set
 * of components, but assigning it to a capitalized local inside render trips
 * react-hooks/static-components, which can't tell a stable lookup from a
 * component defined on the fly.
 */
export function TypeIcon({
  iconName,
  className,
}: {
  iconName: string;
  className?: string;
}) {
  return createElement(getTypeIcon(iconName), { className });
}
