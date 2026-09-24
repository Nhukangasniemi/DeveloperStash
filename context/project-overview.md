# DevStash — Project Overview

> One fast, searchable, AI-enhanced hub for all your dev knowledge & resources.

**Status:** Planning / pre-MVP · **Last updated:** 2026-09-21

## Table of Contents

1. [Problem & Vision](#1-problem--vision)
2. [Target Users](#2-target-users)
3. [Features](#3-features)
4. [Data Model](#4-data-model)
5. [Tech Stack](#5-tech-stack)
6. [System Architecture](#6-system-architecture)
7. [Monetization](#7-monetization)
8. [UI / UX](#8-ui--ux)
9. [Open Questions](#9-open-questions--not-yet-decided)
10. [Engineering Guardrails](#10-engineering-guardrails)

---

## 1. Problem & Vision

Developers keep their essentials scattered across too many tools:

- Code snippets in VS Code or Notion
- AI prompts buried in old chats
- Context files scattered across projects
- Useful links in browser bookmarks
- Docs in random folders
- Shell commands in `.txt` files or bash history
- Project templates in GitHub Gists

This creates constant context-switching, lost knowledge, and inconsistent workflows.

**DevStash** is a single, fast, searchable, AI-enhanced hub for all dev knowledge and resources — snippets, prompts, notes, commands, files, images, and links — organized into collections and accessible from a quick-entry drawer.

## 2. Target Users

| Persona | Core need |
|---|---|
| 🧑‍💻 **Everyday Developer** | A fast way to grab snippets, prompts, commands, and links without leaving flow |
| 🤖 **AI-first Developer** | A place to save prompts, contexts, system messages, and reusable workflows |
| 🎓 **Content Creator / Educator** | Storage for code blocks, explanations, and course notes |
| 🏗️ **Full-Stack Builder** | A library of patterns, boilerplates, and API examples |

## 3. Features

### 3.1 Items & Item Types

Every piece of saved knowledge is an **Item**. Items belong to a **type**, and types are either plain text, a URL, or a file. Users can eventually define custom types, but DevStash ships with a fixed set of **system types** that cannot be renamed or deleted:

| Type | Kind | Icon (lucide-react) | Color |
|---|---|---|---|
| `snippet` | text | `Code` | `#3b82f6` (blue) |
| `prompt` | text | `Sparkles` | `#8b5cf6` (purple) |
| `command` | text | `Terminal` | `#f97316` (orange) |
| `note` | text | `StickyNote` | `#fde047` (yellow) |
| `link` | url | `Link` | `#10b981` (emerald) |
| `file` *(Pro)* | file | `File` | `#6b7280` (gray) |
| `image` *(Pro)* | file | `Image` | `#ec4899` (pink) |

Route convention for browsing by type: `/items/[type]` (e.g. `/items/snippets`, `/items/prompts`).

Items are designed to be created and edited quickly from a slide-out **drawer**, without a full page navigation.

### 3.2 Collections

**Collections** group items of any type together, e.g.:

- *React Patterns* — snippets, notes
- *Context Files* — files
- *Python Snippets* — snippets
- *Interview Prep* — a mix of snippets and notes

An item can belong to **multiple collections** at once (a React snippet can live in both *React Patterns* and *Interview Prep*). Every item shows which collections it currently belongs to, and can be added to or removed from any of them.

### 3.3 Search

Fast, unified search across:

- Item content
- Tags
- Titles
- Item type

### 3.4 Authentication

- Email / password
- GitHub OAuth

Built on **Auth.js (NextAuth v5)**.

### 3.5 AI Features (Pro only)

- AI auto-tag suggestions
- AI summaries
- "Explain this code"
- Prompt optimizer

### 3.6 Other Features

- Favorite items and collections
- Pin items to the top
- Recently used
- Import code from a file
- Markdown editor for text-based types
- File upload for file / image types
- Export data in multiple formats
- Dark mode (default) / light mode
- Add or remove an item from multiple collections at once
- View which collections an item belongs to, from the item itself

## 4. Data Model

### 4.1 Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ ITEM : owns
    USER ||--o{ COLLECTION : owns
    USER ||--o{ ITEM_TYPE : "custom types"
    USER ||--o{ TAG : owns

    ITEM_TYPE ||--o{ ITEM : categorizes
    COLLECTION ||--o{ ITEM : contains
    ITEM ||--o{ ITEM_TAG : "linked via"
    TAG ||--o{ ITEM_TAG : "linked via"

    USER {
        string id PK
        string email
        string password
        boolean isPro
        string stripeCustomerId
        string stripeSubscriptionId
    }
    ITEM {
        string id PK
        string title
        string contentType
        string content
        string fileUrl
        string fileName
        int fileSize
        string url
        string description
        boolean isFavorite
        boolean isPinned
        string language
        string userId FK
        string typeId FK
        string collectionId FK
    }
    ITEM_TYPE {
        string id PK
        string name
        string icon
        string color
        boolean isSystem
        string userId FK
    }
    COLLECTION {
        string id PK
        string name
        string description
        boolean isFavorite
        string userId FK
    }
    ITEM_TAG {
        string itemId FK
        string tagId FK
    }
    TAG {
        string id PK
        string name
        string userId FK
    }
```

### 4.2 Prisma Schema (draft)

Not final — a starting point to formalize into real migrations. Auth models follow the standard [Auth.js Prisma adapter](https://authjs.dev/getting-started/adapters/prisma) shape so `@auth/prisma-adapter` can be dropped in as-is.

```prisma
model User {
  id                   String   @id @default(cuid())
  email                String   @unique
  password             String?
  isPro                Boolean  @default(false)
  stripeCustomerId     String?
  stripeSubscriptionId String?
  items                Item[]
  itemTypes            ItemType[]
  collections          Collection[]
  tags                 Tag[]
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}

model Item {
  id          String   @id @default(cuid())
  title       String
  contentType String   // text | file
  content     String?  // used for text types
  fileUrl     String?
  fileName    String?
  fileSize    Int?
  url         String?
  description String?
  isFavorite  Boolean  @default(false)
  isPinned    Boolean  @default(false)
  language    String?

  userId      String
  user        User @relation(fields: [userId], references: [id])

  typeId      String
  type        ItemType @relation(fields: [typeId], references: [id])

  collectionId String?
  collection   Collection? @relation(fields: [collectionId], references: [id])

  tags        ItemTag[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ItemType {
  id       String   @id @default(cuid())
  name     String
  icon     String?
  color    String?
  isSystem Boolean  @default(false)

  userId   String?
  user     User? @relation(fields: [userId], references: [id])

  items    Item[]
}

model Collection {
  id          String   @id @default(cuid())
  name        String
  description String?
  isFavorite  Boolean  @default(false)

  userId      String
  user        User @relation(fields: [userId], references: [id])

  items       Item[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Tag {
  id     String @id @default(cuid())
  name   String
  userId String
  user   User @relation(fields: [userId], references: [id])

  items  ItemTag[]
}

model ItemTag {
  itemId String
  tagId  String

  item Item @relation(fields: [itemId], references: [id])
  tag  Tag  @relation(fields: [tagId], references: [id])

  @@id([itemId, tagId])
}
```

## 5. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | [Next.js 16](https://nextjs.org/docs) / [React 19](https://react.dev) | App Router, SSR pages with dynamic components; API routes for backend needs (items, file uploads, AI calls). Single codebase/repo. |
| Language | TypeScript | End-to-end type safety |
| Database | [Neon](https://neon.tech/docs) (serverless Postgres) | Cloud-hosted Postgres |
| ORM | [Prisma 7](https://www.prisma.io/docs) | ⚠️ Always via migrations — see [§10](#10-engineering-guardrails) |
| Caching | Redis | Maybe, TBD |
| File storage | [Cloudflare R2](https://developers.cloudflare.com/r2/) | Uploads for `file` / `image` items |
| Auth | [Auth.js / NextAuth v5](https://authjs.dev) | Email/password + GitHub OAuth |
| AI | [OpenAI API](https://platform.openai.com/docs) — `gpt-5-nano` | Pro-only AI features |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/docs) + [shadcn/ui](https://ui.shadcn.com) | Dark mode default |
| Payments | [Stripe](https://stripe.com/docs) | Subscriptions (`isPro`, customer/subscription IDs on `User`) |

## 6. System Architecture

```mermaid
flowchart LR
    Client["Browser\n(Next.js App Router)"] -->|Server Components + fetch| API["API Routes\n/app/api/*"]
    API --> Prisma["Prisma ORM"]
    Prisma --> Neon[("Neon Postgres")]
    API -->|uploads / signed URLs| R2[("Cloudflare R2")]
    API -->|Pro AI features| OpenAI["OpenAI\ngpt-5-nano"]
    API --> Auth["Auth.js\n(NextAuth v5)"]
    Auth --> Neon
    API -->|checkout / webhooks| Stripe["Stripe"]
```

> The diagram shows every path through `/app/api/*`, but that is not the default.
> Server components read Prisma directly and Server Actions handle writes; API routes
> are reserved for webhooks, uploads, long-running work and external clients. See
> [state-management.md](./state-management.md) for the full frontend state strategy,
> including why TanStack Query is deferred.

## 7. Monetization

Freemium model.

| | **Free** | **Pro** — $8/mo or $72/yr |
|---|---|---|
| Items | 50 total | Unlimited |
| Collections | 3 | Unlimited |
| System types | All except `file` / `image` | All, incl. `file` / `image` |
| File & image uploads | ❌ | ✅ |
| Custom types | — | Coming later |
| Search | Basic | Basic |
| AI auto-tagging | ❌ | ✅ |
| AI code explanation | ❌ | ✅ |
| AI prompt optimizer | ❌ | ✅ |
| Data export | ❌ | ✅ (JSON / ZIP) |
| Support | — | Priority |

> During development, all users can access everything. Build the `isPro` foundation (schema fields, gating hooks) now, but don't enforce limits until closer to launch.

## 8. UI / UX

**General direction:** modern, minimal, developer-focused. Dark mode by default, light mode optional. Clean typography, generous whitespace, subtle borders/shadows. Reference points: [Notion](https://notion.so), [Linear](https://linear.app), [Raycast](https://raycast.com). Syntax highlighting on all code blocks.

## Screenshots

Refer to the screenshots below as a base for the dashboard ui. It doesn't have to be exact. Use it as a reference.
- @context/screenshots/dashboard-ui-main.png
- @context/screenshots/dashboard-ui-drawer.png
For responsive/mobile version, reference these:
- @context/screenshots/dashboard-ui-main-responsive.png
- @context/screenshots/dashboard-ui-drawer-responsive.png
- @context/screenshots/dashboard-ui-menu-responsive.png

### 8.1 Layout

- **Sidebar** (collapsible): item types with links to their items (snippets, commands, etc.), plus latest collections
- **Main area**: grid of color-coded collection cards, background-tinted by the type that makes up most of their items; items render inside collections as color-coded cards (border color = item type color)
- **Item detail**: opens in a quick-access side drawer, not a full page

### 8.2 Type Colors & Icons

See the table in [§3.1](#31-items--item-types) — reused consistently across sidebar icons, card borders/backgrounds, and badges.

### 8.3 Responsive & Micro-interactions

- Desktop-first, but fully usable on mobile — sidebar collapses into a drawer
- Smooth transitions and hover states on cards
- Toast notifications for actions (save, delete, add to collection, etc.)
- Loading skeletons while data fetches

## 9. Open Questions / Not Yet Decided

- Redis for caching — needed, or is Neon fast enough at MVP scale?
- Custom item types — data model supports them (`ItemType.userId`), but the UI/flow ships later
- Export formats — confirm exact set (JSON confirmed; ZIP for files — what else?)
- Rate limits / quota enforcement mechanics for the Free tier (hard block vs. soft warning)
- Exact shape of the AI prompt optimizer (input/output contract)

## 10. Engineering Guardrails

- **Never** use `prisma db push` or hand-edit the database schema directly. All schema changes go through **Prisma Migrate**, run in dev first, then promoted to prod.
- Data model above is a draft — expect it to shift as features are implemented; keep this doc in sync with the real `schema.prisma`.
- No global client state store, and no client-side data cache at MVP. Every piece of state belongs to one of the four buckets in [state-management.md](./state-management.md).
