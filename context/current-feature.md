# Current Feature

Seed data — populate the dev database with a demo user, the system item
types, and five collections of realistic sample items for development and
demos.

## Status
In Progress — implemented on `feat/seed-data`, awaiting review

## Goals
- Rewrite `prisma/seed.ts` (overwriting the current types-only seed)
- **Demo user**
  - Email `demo@devstash.io`, name `Demo User`
  - Password `12345678`, hashed with `bcryptjs` at 12 rounds
  - `isPro: false`, `emailVerified` set to the current date
- **System item types** — all seven (`snippet`, `prompt`, `command`, `note`,
  `file`, `image`, `link`) with the spec's icons and colors, `isSystem: true`,
  `userId: null`
- **Collections and items**, all owned by the demo user:
  - **React Patterns** — _Reusable React patterns and hooks_
    - 3 TypeScript snippets: custom hooks (`useDebounce`, `useLocalStorage`,
      …), component patterns (context providers, compound components),
      utility functions
  - **AI Workflows** — _AI prompts and workflow automations_
    - 3 prompts: code review, documentation generation, refactoring assistance
  - **DevOps** — _Infrastructure and deployment resources_
    - 1 snippet (Docker / CI-CD config), 1 command (deployment script),
      2 links (real documentation URLs)
  - **Terminal Commands** — _Useful shell commands for everyday development_
    - 4 commands: git operations, Docker, process management, package manager
      utilities
  - **Design Resources** — _UI/UX resources and references_
    - 4 links (real URLs): CSS/Tailwind reference, component library, design
      system, icon library
- Items use the right `contentType` for their type — `TEXT` with `content`
  for snippets/prompts/commands, `URL` with `url` for links — and snippets set
  `language`
- Each item is linked to its collection through `ItemCollection`
- Seed is idempotent: `npm run db:seed` can be re-run without duplicating rows

## References
- `context/features/seed-spec.md` — the data specification
- `prisma/seed.ts` — the seed script being replaced
- `prisma/schema.prisma` — models and constraints the seed must satisfy
- `context/project-overview.md` §3.1 (system types), §4.2 (data model notes)

## Notes
- `bcryptjs` is not installed yet — add it (pinned, like the other deps)
- Keep the fixed system type ids
  (`00000000-0000-7000-8000-00000000000N`); upsert by id, since
  `@@unique([userId, name])` cannot guard NULL-owner rows
- Idempotency: upsert the user by `email` and collections by
  `(userId, name)`. `Item` has no natural unique key, so clear the demo user's
  items before recreating them (join rows cascade)
- The spec lists no tags, and no `file` / `image` items — none are seeded
- The dashboard still reads `src/lib/mock-data.ts`; wiring it to the database
  is a separate feature

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

- **2026-09-24**: Database foundation — Neon Postgres + Prisma 7 (completed)
  - Neon serverless Postgres wired up; dev branch only, production branch still
    to be created
  - Prisma pinned to **7.10.0** — npm's `latest` tag on the `prisma` CLI points
    at `8.0.0-rc.15`, while `@prisma/client`'s points at `7.10.0`, so an
    unpinned install mismatches majors. Both packages pinned with `--save-exact`
  - Prisma 7 breaking changes handled: `prisma.config.ts` replaces the
    datasource URL in the schema, env files are no longer auto-loaded (hence
    `import "dotenv/config"`), `output` is required on the generator, and a
    driver adapter is mandatory. The documented claim that v7 is ESM-only is
    wrong — the installed packages are dual CJS/ESM, so `"type": "module"` was
    *not* added
  - `@prisma/adapter-neon` over `@neondatabase/serverless`, using `PrismaNeon`
    (WebSocket pool) rather than `PrismaNeonHttp`, which cannot do interactive
    transactions
  - Two connection strings, not interchangeable: pooled `DATABASE_URL` for the
    app, unpooled `DIRECT_URL` for the CLI — migrations take advisory locks and
    cannot run through a transaction pooler. Note v7's `Datasource` type has no
    `directUrl` field, so the split lives in two separate files
  - `prisma/schema.prisma` — `User`, `Account`, `Session`, `VerificationToken`,
    `ItemType`, `Item`, `Collection`, `ItemCollection`, `Tag`, `ItemTag`, plus a
    `ContentType` enum
  - `ItemCollection` join replaces the draft's single `Item.collectionId`, since
    §3.2 needs an item in several collections; mirrors `MOCK_ITEM_COLLECTIONS`
  - `contentType` is a real Postgres enum (`TEXT` / `URL` / `FILE`) rather than
    a string, matching the union the dashboard already uses
  - Cascade deletes run from `User` down through every owned row and both join
    tables; `Item.type` is `onDelete: Restrict` so deleting a type can never
    silently delete a user's items
  - Indexes on every FK plus the dashboard's real access paths —
    `(userId, updatedAt DESC)`, `(userId, isPinned)`, `(userId, isFavorite)`
  - Database naming is `snake_case` with plural tables via `@map` / `@@map`;
    Postgres folds unquoted identifiers to lowercase, so the original
    PascalCase would have forced `"ItemType"` quoting forever in raw SQL
  - Primary keys are UUIDv7 in native `uuid` columns
    (`@default(uuid(7)) @db.Uuid`), not cuids in `text` — time-ordered so
    inserts append to the index edge instead of scattering, and 16 bytes
    against 36. All 16 FK fields need `@db.Uuid` too or Postgres rejects the
    foreign key. Verified live: ids are version 7 and sort in insertion order
  - `src/lib/prisma.ts` — singleton cached on `globalThis` outside production so
    dev hot reloads do not exhaust Neon's connection limit
  - `prisma/seed.ts` — the seven system `ItemType` rows, idempotent via upsert
    on fixed ids. `@@unique([userId, name])` cannot guard them because Postgres
    treats NULL `userId`s as distinct. Ids are a reserved UUID block
    (`00000000-0000-7000-8000-00000000000N`), since a `uuid` column rejects
    readable strings like `type_snippet`
  - Single migration `20260924095857_init`; the schema was iterated by
    regenerating init rather than stacking rename migrations, as nothing had
    been merged or deployed
  - Generated client goes to `src/generated/prisma` (gitignored, rebuilt by
    `postinstall` and `build`); `src/generated/**` ignored by eslint
  - npm scripts added: `db:generate`, `db:migrate`, `db:deploy`, `db:status`,
    `db:seed`, `db:studio`
  - `.env.example` committed via a `!.env.example` gitignore exception
  - Gotcha worth remembering: `prisma migrate dev` does **not** regenerate the
    client in v7, so a stale client fails with `TableDoesNotExist`. Run
    `npm run db:generate` after every schema change
  - `project-overview.md` §4 rewritten — ERD updated, and the duplicated draft
    schema replaced by a pointer to `schema.prisma` plus the decisions behind
    it; §5 and §10 updated. `coding-standards.md` gained a database naming
    section
  - Not done yet: no production Neon branch, no auth (every domain row needs a
    `userId`), and the dashboard still renders `src/lib/mock-data.ts` — whose
    readable type ids no longer match the seeded UUIDs
