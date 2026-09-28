import { Sidebar } from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/components/dashboard/SidebarProvider";
import { TopBar } from "@/components/dashboard/TopBar";
import { getRecentCollections } from "@/lib/db/collections";
import { getCurrentUserId } from "@/lib/db/users";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/">) {
  const collections = await getRecentCollections(await getCurrentUserId());

  return (
    <SidebarProvider>
      <div className="flex h-dvh">
        <Sidebar
          collections={collections.map(
            ({ id, name, isFavorite, itemCount }) => ({
              id,
              name,
              isFavorite,
              itemCount,
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
