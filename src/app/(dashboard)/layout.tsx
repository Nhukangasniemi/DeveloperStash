import { Sidebar } from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/components/dashboard/SidebarProvider";
import { TopBar } from "@/components/dashboard/TopBar";
import { getSidebarCollections } from "@/lib/db/collections";
import { getItemTypesWithCounts } from "@/lib/db/items";
import { getCurrentUser } from "@/lib/db/users";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/">) {
  const user = await getCurrentUser();
  const [collections, itemTypes] = await Promise.all([
    getSidebarCollections(user.id),
    getItemTypesWithCounts(user.id),
  ]);

  return (
    <SidebarProvider>
      <div className="flex h-dvh">
        <Sidebar
          user={user}
          itemTypes={itemTypes}
          collections={collections.map(
            ({ id, name, isFavorite, itemCount, types }) => ({
              id,
              name,
              isFavorite,
              itemCount,
              color: types[0]?.type.color ?? null,
            }),
          )}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
