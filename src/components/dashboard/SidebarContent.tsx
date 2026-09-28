"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ChevronDown,
  Folder,
  Layers,
  Plus,
  Settings,
  Star,
  type LucideIcon,
} from "lucide-react";

import {
  getTypeHref,
  getTypeIcon,
  getTypeLabel,
  isProType,
} from "@/lib/item-types";
import type { CollectionSummary } from "@/lib/db/collections";
import {
  MOCK_ITEM_TYPES,
  MOCK_USER,
  mockItemTypeCounts,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const TOTAL_ITEMS = Object.values(mockItemTypeCounts).reduce(
  (sum, count) => sum + count,
  0,
);

/** What the sidebar needs of a collection; the full summary stays on the server. */
export type SidebarCollection = Pick<
  CollectionSummary,
  "id" | "name" | "isFavorite" | "itemCount"
>;

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  count?: number;
  /** Hex from the item type; only types are color-coded. */
  iconColor?: string;
  showProBadge?: boolean;
  showFavoriteStar?: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  count,
  iconColor,
  showProBadge = false,
  showFavoriteStar = false,
  collapsed,
  onNavigate,
}: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  const link = (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive &&
          "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      {/* Type colors come from the data (and will be user-defined for custom
          types), so they can't be Tailwind classes. */}
      <Icon className="size-4 shrink-0" style={iconColor ? { color: iconColor } : undefined} />

      {!collapsed && (
        <>
          <span className="truncate">{label}</span>
          <span className="ml-auto flex shrink-0 items-center gap-1.5">
            {showProBadge && (
              <Badge className="border-transparent bg-amber-400/15 px-1.5 py-0 text-[10px] font-semibold text-amber-400">
                Pro
              </Badge>
            )}
            {showFavoriteStar && (
              <Star
                aria-label="Favorite"
                className="size-3.5 fill-yellow-400 text-yellow-400"
              />
            )}
            {count !== undefined && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {count}
              </span>
            )}
          </span>
        </>
      )}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

interface SectionHeaderProps {
  label: string;
  open: boolean;
  onToggle: () => void;
  action?: React.ReactNode;
}

function SectionHeader({ label, open, onToggle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center pr-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex flex-1 items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium tracking-wider text-muted-foreground uppercase transition-colors hover:text-foreground"
      >
        <ChevronDown
          aria-hidden="true"
          className={cn("size-3.5 transition-transform", !open && "-rotate-90")}
        />
        {label}
      </button>
      {action}
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 pt-3 pb-1 text-[11px] font-medium tracking-wider text-muted-foreground/80 uppercase">
      {children}
    </p>
  );
}

interface SidebarContentProps {
  /** Most recently updated first, matching the dashboard's collection grid. */
  collections: SidebarCollection[];
  /** Icon-only rail. Desktop only — the mobile drawer is always expanded. */
  collapsed?: boolean;
  /** Closes the mobile drawer once a link is followed. */
  onNavigate?: () => void;
  /**
   * The desktop collapse toggle. Sits next to the logo when expanded and moves
   * to the top of the nav when collapsed, where the header has no room for it.
   */
  headerAction?: React.ReactNode;
}

/**
 * The sidebar's navigation, shared by the desktop rail and the mobile drawer
 * so the two can't drift apart.
 */
export function SidebarContent({
  collections,
  collapsed = false,
  onNavigate,
  headerAction,
}: SidebarContentProps) {
  const [typesOpen, setTypesOpen] = useState(true);
  const [collectionsOpen, setCollectionsOpen] = useState(true);

  const favoriteCollections = collections.filter(
    (collection) => collection.isFavorite,
  );

  const initials = MOCK_USER.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* The toggle always lives in the header. Collapsed, the rail is too
          narrow for the logo beside it, so the toggle takes the row over. */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border px-4",
          collapsed && "justify-center px-0",
        )}
      >
        {!collapsed && (
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="flex items-center gap-2 font-semibold"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Boxes className="size-4" />
            </span>
            <span>DevStash</span>
          </Link>
        )}
        {headerAction}
      </div>

      <nav
        aria-label="Main"
        className={cn(
          "min-h-0 flex-1 space-y-1 overflow-y-auto p-2",
          collapsed && "px-2",
        )}
      >
        <SidebarLink
          href="/dashboard"
          icon={Layers}
          label="All Items"
          count={TOTAL_ITEMS}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />

        <div className="pt-2">
          {!collapsed && (
            <SectionHeader
              label="Types"
              open={typesOpen}
              onToggle={() => setTypesOpen((open) => !open)}
            />
          )}

          {(collapsed || typesOpen) && (
            <div className="space-y-0.5">
              {MOCK_ITEM_TYPES.map((type) => (
                <SidebarLink
                  key={type.id}
                  href={getTypeHref(type.name)}
                  icon={getTypeIcon(type.icon)}
                  iconColor={type.color}
                  label={getTypeLabel(type.name)}
                  count={mockItemTypeCounts[type.id] ?? 0}
                  showProBadge={isProType(type.name) && !MOCK_USER.isPro}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          )}
        </div>

        <div className="pt-2">
          {!collapsed && (
            <SectionHeader
              label="Collections"
              open={collectionsOpen}
              onToggle={() => setCollectionsOpen((open) => !open)}
              action={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="New collection"
                >
                  <Plus />
                </Button>
              }
            />
          )}

          {(collapsed || collectionsOpen) && (
            <div className="space-y-0.5">
              {!collapsed && <GroupLabel>Favorites</GroupLabel>}
              {favoriteCollections.map((collection) => (
                <SidebarLink
                  key={`favorite-${collection.id}`}
                  href={`/collections/${collection.id}`}
                  icon={Folder}
                  label={collection.name}
                  count={collection.itemCount}
                  showFavoriteStar
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}

              {!collapsed && (
                <>
                  <GroupLabel>All collections</GroupLabel>
                  {collections.map((collection) => (
                    <SidebarLink
                      key={collection.id}
                      href={`/collections/${collection.id}`}
                      icon={Folder}
                      label={collection.name}
                      count={collection.itemCount}
                      showFavoriteStar={collection.isFavorite}
                      collapsed={collapsed}
                      onNavigate={onNavigate}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {!MOCK_USER.isPro && !collapsed && (
        <div className="shrink-0 p-2">
          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium">Upgrade to Pro</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Unlimited items, file uploads, and AI features.
            </p>
            <Button size="sm" className="mt-3 w-full">
              Go Pro
            </Button>
          </div>
        </div>
      )}

      <div
        className={cn(
          "flex h-14 shrink-0 items-center gap-2 border-t border-sidebar-border px-3",
          collapsed && "justify-center px-0",
        )}
      >
        <Avatar className="size-8">
          {MOCK_USER.image && (
            <AvatarImage src={MOCK_USER.image} alt={MOCK_USER.name} />
          )}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <span className="truncate text-sm font-medium">
              {MOCK_USER.name}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Settings"
              className="ml-auto"
            >
              <Settings />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
