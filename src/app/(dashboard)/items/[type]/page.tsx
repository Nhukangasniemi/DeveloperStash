import { notFound } from "next/navigation";

import { getTypeLabel } from "@/lib/item-types";
import { MOCK_ITEM_TYPES } from "@/lib/mock-data";

/**
 * Placeholder so the sidebar's type links resolve. The real listing lands with
 * the item pages; phase 2 only needs somewhere to navigate to.
 */
export default async function ItemsByTypePage({
  params,
}: PageProps<"/items/[type]">) {
  const { type } = await params;

  const itemType = MOCK_ITEM_TYPES.find(
    (candidate) => `${candidate.name}s` === type,
  );

  if (!itemType) notFound();

  return (
    <h1 className="text-lg font-semibold">{getTypeLabel(itemType.name)}</h1>
  );
}
