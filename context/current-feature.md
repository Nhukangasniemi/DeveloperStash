# Current Feature

Dashboard UI Phase 3 — Main area. The dashboard content to the right of the
sidebar: stats, collections, and items.

## Status

In Progress

## Goals

- The main area to the right
- Recent collections
- Pinned items
- 10 recent items
- 4 stats cards at the top — total items, collections, favorite items, favorite
  collections (not in the screenshot)

## References

- @context/features/dashboard-phase-3-spec.md
- @context/screenshots/dashboard-ui-main.png
- @context/screenshots/dashboard-ui-main-responsive.png
- @context/project-overview.md
- @src/lib/mock-data.ts

## Notes

- Final phase of 3 for the dashboard UI layout.
- Import mock data directly from `src/lib/mock-data.ts` until the database lands.
- The spec references `src/lib/mock-data.js`; the real file is `.ts`.
- `src/lib/item-types.ts` (phase 2) already maps icon names, labels, and hrefs —
  reuse it for the item and collection cards.
- Collection cards are tinted by their dominant item type, but nothing in the
  mock data links a collection to a type yet; that field is still needed.

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
