import { notFound } from "next/navigation";

import { getCollectionName } from "@/lib/db/collections";
import { getCurrentUserId } from "@/lib/db/users";

/**
 * Placeholder so collection card links resolve. The real collection view
 * lands in a later phase.
 */
export default async function CollectionPage({
  params,
}: PageProps<"/collections/[id]">) {
  const { id } = await params;

  const name = await getCollectionName(await getCurrentUserId(), id);

  if (!name) notFound();

  return <h1 className="text-lg font-semibold">{name}</h1>;
}
