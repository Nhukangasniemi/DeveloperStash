# Current Feature

**Database Foundation — Neon PostgreSQL + Prisma 7**

Replace the mock data layer's backing store with a real serverless Postgres
database on Neon, accessed through Prisma 7, including the auth models NextAuth
v5 needs.

## Status

In Progress

## Goals

- Provision Neon PostgreSQL (serverless), with a development branch behind
  `DATABASE_URL` and a separate production branch
- Install and configure Prisma 7 — note the breaking changes from v6 (new
  config file, generated client output, driver adapters); read the upgrade
  guide before writing any setup code
- Write the initial `schema.prisma` from the data models in
  `project-overview.md`: `User`, `Item`, `ItemType`, `Collection`, `Tag`,
  `ItemTag`
- Model item ↔ collection as a real many-to-many (`ItemCollection` join),
  matching `MOCK_ITEM_COLLECTIONS` from phase 3 rather than the single
  `collectionId` in the draft schema
- Add the NextAuth v5 / `@auth/prisma-adapter` models: `Account`, `Session`,
  `VerificationToken`
- Add indexes on foreign keys and common query paths, and cascade deletes so
  removing a user or an item cleans up its rows
- Create a singleton Prisma client in `src/lib/` that survives dev hot reloads
- Everything through `prisma migrate dev` — never `prisma db push`, never
  hand-edited SQL against the database

## References

- Spec: `context/features/database-spec.md`
- Data models: `context/project-overview.md` §4
- Database standards: `context/coding-standards.md`
- Prisma 7 upgrade guide:
  https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
- Prisma quickstart:
  https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres

## Notes

- The schema is expected to evolve; keep `project-overview.md` §4 in sync with
  the real `schema.prisma` as it changes.
- Mock data in `src/lib/mock-data.ts` stays in place for now — swapping the
  dashboard over to real queries is a separate step, not part of this feature.
- Seeding the system `ItemType` rows (snippet, prompt, command, note, link,
  file, image) is needed before any item can be created, since `isSystem` types
  have no `userId`.

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

- **2026-09-24**: Frontend state management decided (docs only)
  - `context/state-management.md` added — four buckets, one mechanism each:
    server data (RSC + Prisma, writes via Server Actions + `revalidatePath`),
    URL state (`searchParams`), ephemeral UI (`useState` / narrow context),
    pending & optimistic (`useOptimistic` + `useActionState`)
  - No global client store; no client-side data cache at MVP
  - Item drawer will be URL-driven (`?item=<id>`), not provider state, so it is
    deep-linkable and closes with the back button
  - Server Actions are the only write path to Postgres; API routes stay limited
    to webhooks, uploads, long-running work and external clients
  - TanStack Query deliberately deferred — RSC already covers fetch/cache/dedupe,
    and a second cache would need invalidating alongside `revalidatePath` on
    every mutation. Scoped for later use in ⌘K search, infinite item lists and
    Pro AI calls only, with adoption rules written down
  - `project-overview.md` §6 gained a note that the architecture diagram's
    all-through-`/app/api/*` paths are not the default, and §10 a guardrail bullet
  - Built on branch `docs/state-management`
