"use client";

import { Menu } from "lucide-react";

import { useSidebar } from "@/components/dashboard/SidebarProvider";
import { Button } from "@/components/ui/button";

/**
 * Opens the mobile sidebar drawer. Hidden on desktop, where the rail is always
 * on screen and collapses instead.
 */
export function SidebarTrigger() {
  const { setMobileOpen } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Open navigation"
      className="md:hidden"
      onClick={() => setMobileOpen(true)}
    >
      <Menu />
    </Button>
  );
}
