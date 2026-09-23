import { notFound } from "next/navigation";

import { MOCK_COLLECTIONS } from "@/lib/mock-data";

/**
 * Placeholder so the sidebar's collection links resolve. The real collection
 * view lands in a later phase.
 */
export default async function CollectionPage({
  params,
}: PageProps<"/collections/[id]">) {
  const { id } = await params;

  const collection = MOCK_COLLECTIONS.find(
    (candidate) => candidate.id === id,
  );

  if (!collection) notFound();

  return <h1 className="text-lg font-semibold">{collection.name}</h1>;
}
