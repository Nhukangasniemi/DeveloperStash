# Current Feature

<!-- Feature name and short description -->

## Status
<!-- Not Started | In Progress | Completed -->

## Goals
<!-- Goals and requirements -->

## References
<!-- Links to spec docs and related files -->

## Notes
<!-- Any extra notes -->

## History
<!-- Keep this updated. Earliest to latest -->

- **2026-09-22**: Initial Next.js 16 + Tailwind v4 setup
  - Created with Create Next App (Next.js 16.3.5, React 19.2.8)
  - Removed default public SVGs
  - Configured Tailwind CSS v4 + PostCSS
  - Minimal layout and page scaffolding in place
  - Context files created (project-overview, coding-standards, ai-interaction)

- **2026-09-23**: Dashboard Phase 1 — Foundation (completed)
  - Mock data structure created (Item, ItemType, Collection, User, mockItemTypeCounts)
  - shadcn/ui initialized (radix base, nova preset) — `components.json`, `src/lib/utils.ts`
  - Installed `button` and `input` components
  - `/dashboard` route with nested layout: sidebar column, top bar, main area
  - `TopBar` component — search field with ⌘K hint and New Item button (display only)
  - Dark mode by default via `dark` class on `<html>`
  - Renamed font vars to `--font-sans` / `--font-mono` so Geist reaches Tailwind's theme
  - Built on branch `feat/dashboard-phase-1`

- **2026-09-23**: Dashboard Phase 2 — Sidebar (completed)
  - Installed shadcn `sheet`, `avatar`, `tooltip`, `separator`, `badge`
    (`separator` / `badge` unused so far — likely wanted in phase 3)
  - `SidebarProvider` — context holding `collapsed` (desktop) and `mobileOpen`
    (drawer) separately, so the `TopBar` trigger can reach the sidebar
  - `SidebarContent` — logo, All Items, Types, Favorites, All Collections,
    Upgrade to Pro card, user footer; shared by desktop and mobile
  - `Sidebar` — `w-64` ↔ `w-16` rail on `md+` (tooltips when collapsed),
    left-side `Sheet` drawer below `md`; collapse toggle lives in the header in
    both states
  - `SidebarTrigger` — mobile hamburger, kept separate so `TopBar` stays a
    server component
  - Collections use a folder icon (not a type-colored dot); type rows keep their
    data-driven colors, a Pro sparkle on Files / Images, and item counts
  - `src/lib/item-types.ts` — maps stored lucide icon names to components, plus
    type labels and `/items/[type]` hrefs
  - Moved the dashboard layout into a `(dashboard)` route group so `/items/*`
    and `/collections/*` render inside the sidebar; URLs unchanged
  - Placeholder pages for `/items/[type]` and `/collections/[id]` so nav links
    resolve (`notFound()` on unknown slugs); real pages land in phase 3
  - Active route highlighting via `usePathname` + `aria-current`
  - Built on branch `feat/dashboard-phase-2`

- **2026-09-23**: Dashboard Phase 3 — Main area (completed)
  - Installed shadcn `card`
  - `StatsCards` — items, collections, favorite items, favorite collections
  - Dashboard sections: recent collections, pinned items, 10 recent items
    (pinned excluded from recent so nothing appears twice)
  - `CollectionCard` — accent color and the icon row along the bottom are both
    derived from the collection's own items, most dominant type first; a
    collection with no items renders untinted, there is no default color
  - `ItemCard` — type badge, preview that varies by content type, tags,
    collection count, left border in the type color
  - `MOCK_ITEM_COLLECTIONS` — join table for the item ↔ collection
    many-to-many, mirroring `ItemCollection`; `Item` and `Collection` gained no
    fields
  - `src/lib/collections.ts` — reads across the join (`getItemsInCollection`,
    `getCollectionsForItem`, `getTypeBreakdown`, `getDominantType`); ties in the
    breakdown go to the most recently added type
  - `src/lib/format.ts` — relative times measured from `MOCK_NOW`, not the real
    clock, so server and client render the same string
  - `TypeIcon` — resolves stored lucide icon names in one place, via
    `createElement` to satisfy `react-hooks/static-components`
  - Sidebar Pro marker changed from `Sparkles` (the prompt type's own icon) to
    an amber "Pro" badge
  - Placeholder `/collections` page for the dashboard's "View all"
  - Everything in the main area is a server component; only the sidebar and its
    trigger are client
  - Built on branch `feat/dashboard-phase-3`
  - Known gap: stats count real mock records, but each collection card shows
    `itemCount` (its claimed total), which is larger than the join rows
