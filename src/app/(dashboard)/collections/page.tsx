import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { getRecentCollections } from "@/lib/db/collections";
import { getCurrentUserId } from "@/lib/db/users";

/** Every collection. The dashboard's "View all" lands here. */
export default async function CollectionsPage() {
  const collections = await getRecentCollections(await getCurrentUserId());

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Collections</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  );
}
