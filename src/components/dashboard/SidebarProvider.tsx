"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface SidebarState {
  /** Desktop only: rail is narrowed to icons. */
  collapsed: boolean;
  toggleCollapsed: () => void;
  /** Mobile only: the slide-over drawer is open. */
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarState | null>(null);

/**
 * Shares sidebar open/collapsed state between the sidebar and the top bar's
 * trigger, which sit next to each other in the dashboard layout.
 */
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = useCallback(() => setCollapsed((open) => !open), []);

  return (
    <SidebarContext
      value={{ collapsed, toggleCollapsed, mobileOpen, setMobileOpen }}
    >
      {children}
    </SidebarContext>
  );
}

export function useSidebar(): SidebarState {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used inside <SidebarProvider>");
  }

  return context;
}
