"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import {
  SidebarContent,
  type SidebarCollection,
} from "@/components/dashboard/SidebarContent";
import { useSidebar } from "@/components/dashboard/SidebarProvider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ItemTypeCount } from "@/lib/db/items";
import type { CurrentUser } from "@/lib/db/users";
import { cn } from "@/lib/utils";

/**
 * Dashboard sidebar.
 *
 * Desktop (md+): a rail that collapses from full width to icons only.
 * Mobile: always a slide-over drawer, opened from the top bar.
 */
export function Sidebar({
  user,
  itemTypes,
  collections,
}: {
  user: CurrentUser;
  itemTypes: ItemTypeCount[];
  collections: SidebarCollection[];
}) {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } =
    useSidebar();

  const collapseToggle = (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleCollapsed}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className={cn(!collapsed && "ml-auto")}
    >
      {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
    </Button>
  );

  return (
    <>
      <TooltipProvider>
        <aside
          className={cn(
            "hidden shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:block",
            collapsed ? "w-16" : "w-64",
          )}
        >
          <SidebarContent
            user={user}
            itemTypes={itemTypes}
            collections={collections}
            collapsed={collapsed}
            headerAction={collapseToggle}
          />
        </aside>
      </TooltipProvider>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-72 gap-0 bg-sidebar p-0 text-sidebar-foreground md:hidden"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Browse item types and collections.
          </SheetDescription>
          <SidebarContent
            user={user}
            itemTypes={itemTypes}
            collections={collections}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
