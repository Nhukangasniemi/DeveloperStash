import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { MOCK_COLLECTIONS } from "@/lib/mock-data";

/** Every collection. The dashboard's "View all" lands here. */
export default function CollectionsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Collections</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {MOCK_COLLECTIONS.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  );
}
