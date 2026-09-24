# State Management

> How DevStash handles state on the frontend, and where the boundary sits between
> React Server Components and any client-side cache.

**Decided:** 2026-09-24 · **Applies from:** dashboard phase 4 onward

## Table of Contents

1. [Principle](#1-principle)
2. [The Four Buckets](#2-the-four-buckets)
3. [Rules That Follow](#3-rules-that-follow)
4. [TanStack Query](#4-tanstack-query)
5. [Anti-patterns](#5-anti-patterns)

---

## 1. Principle

Server components are the data layer. There is **no global client store** — no Redux,
Zustand or Jotai — and no client-side cache library at MVP.

Every piece of state belongs to exactly one of four buckets, and each bucket has
exactly one mechanism. If a new feature doesn't obviously fit a bucket, that's a
signal to revisit this doc, not to invent a fifth mechanism.

## 2. The Four Buckets

| Bucket | Examples | Mechanism |
|---|---|---|
| **Server data** | items, collections, tags, counts, the user | Server components query Prisma directly. Writes go through Server Actions, then `revalidatePath` / `revalidateTag`. |
| **URL state** | `?q=`, `?tags=`, `?sort=`, `?type=`, open drawer `?item=<id>` | `searchParams` read in the server page and passed down as props. |
| **Ephemeral UI** | sidebar collapsed, dialog/menu open, unsent form draft, hover | `useState`, or a small context when it must cross the tree — see `src/components/dashboard/SidebarProvider.tsx`. |
| **Pending / optimistic** | favorite ⭐, pin 📌, delete, add-to-collection | React 19 `useOptimistic` + `useActionState` around the Server Action. |

### Server data

A page like `/items/[type]` or `/collections/[id]` fetches with Prisma inside the
server component and renders the result. No `useEffect` fetching, no loading state in
the component — use `loading.tsx` and skeletons at the route level instead.

Today these reads go through `src/lib/mock-data.ts` and `src/lib/collections.ts`.
Replacing those helpers with Prisma queries is the phase-4 change; the components
above them should not need to change, because they already take plain data as props.

### URL state

Anything that describes *what the user is looking at* goes in the URL. That makes the
view shareable, correct under back/forward, and renderable on the server without a
hydration round-trip.

Keep it plain `searchParams` — no query-state library unless the number of
synchronized params makes it painful.

### Ephemeral UI

State that would be meaningless in a link. `SidebarProvider` is the pattern to copy:
a narrow typed context, one concern, a `useSidebar()` hook that throws when used
outside the provider. Persist `collapsed` to `localStorage` so the rail survives a
reload; read it in an effect and treat "not yet read" as the default, so SSR and the
first client render agree.

### Pending / optimistic

Toggles must feel instant. Wrap the Server Action with `useOptimistic` so the star or
pin flips immediately and rolls back on failure, and surface the failure as a toast —
see the error-handling rules in `coding-standards.md`.

## 3. Rules That Follow

- **The item drawer is URL-driven.** It opens on `?item=<id>`, not on a boolean in a
  provider. The detail content can then be server-rendered, deep-linked and closed with
  the back button — and it removes most of the pressure that would otherwise push us
  toward a global store.
- **Server Actions are the only write path to Postgres.** API routes stay reserved for
  the cases already listed in `coding-standards.md`: webhooks, uploads with progress,
  long-running work, specific status codes, and future mobile/CLI clients.
- **Validate at the action boundary** with Zod, and return the
  `{ success, data, error }` shape. Client components never talk to Prisma.
- **`'use client'` marks a leaf, not a branch.** Push it as far down as possible; a
  client wrapper can still take server-rendered `children`.

## 4. TanStack Query

**Not installed. Deliberate.**

TanStack Query is widely used with Next.js, but that popularity is concentrated in
Pages Router apps, client-heavy dashboards, and frontends talking to a separate
backend API. In an App Router app, the server component *is* the fetch layer: RSC plus
Server Actions already cover fetching, caching, request deduping and invalidation.
Adding Query app-wide gives us a second cache that has to be invalidated alongside
`revalidatePath()` on every mutation, in exchange for nothing on pages that are
server-rendered anyway.

### When we do add it

Three places genuinely want a client cache. Introduce `@tanstack/react-query` in the
phase that builds the first of them, scoped to that surface only:

1. **⌘K search** — debounced input against `/api/search`, cache keyed by query string,
   `placeholderData: keepPreviousData` so results don't flash empty between keystrokes.
2. **Infinite item lists** — `useInfiniteQuery` over cursor pagination, rather than
   hand-rolling page state and merge logic.
3. **Pro AI features** (auto-tag, explain this code, prompt optimizer) — slow and
   failure-prone, so they want retries, per-item mutation state and cancellation.

### Adoption rules, when that happens

- Create the `QueryClient` inside `useState` in a client `Providers` component —
  **never at module scope**, where a single instance on the server would leak one
  user's cache into another's request.
- Set `staleTime` to roughly 60s so server-hydrated data isn't refetched on mount.
- Where first paint matters, `prefetchQuery` in the server component and wrap the
  subtree in `HydrationBoundary` with `dehydrate(queryClient)`.
- Postgres writes stay on Server Actions. If a mutation touches data Query is holding,
  invalidate **both**: `revalidatePath()` on the server and `invalidateQueries()` on
  the client.
- Do not migrate dashboard, collection, or type pages to Query. They stay RSC.

## 5. Anti-patterns

Things that would be a regression here:

- A `useEffect` + `fetch` pair in a component to load data that a server component
  could have read directly.
- A global provider holding items or collections, mirrored from the server.
- The open-item id, search text or active filter stored in React state instead of the
  URL.
- `'use client'` on a layout or page so that one button inside it can be interactive.
- Two sources of truth for the same record, without a single place that invalidates
  both.
