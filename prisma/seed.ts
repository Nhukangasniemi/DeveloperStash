import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Seeds a demo user, the seven system item types, and five collections of
 * sample items for development and demos. Safe to re-run.
 *
 * System type ids are a reserved block — an all-zero UUIDv7 timestamp with a
 * small counter in the node field — valid in a `uuid` column, stable across
 * every environment, and obviously synthetic. `@@unique([userId, name])`
 * cannot guard them because Postgres treats NULL userIds as distinct, so
 * upserting by id is what stops re-runs creating duplicates.
 */
const SYSTEM_ITEM_TYPES = [
  { id: "00000000-0000-7000-8000-000000000001", name: "snippet", icon: "Code", color: "#3b82f6" },
  { id: "00000000-0000-7000-8000-000000000002", name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { id: "00000000-0000-7000-8000-000000000003", name: "command", icon: "Terminal", color: "#f97316" },
  { id: "00000000-0000-7000-8000-000000000004", name: "note", icon: "StickyNote", color: "#fde047" },
  { id: "00000000-0000-7000-8000-000000000005", name: "link", icon: "Link", color: "#10b981" },
  { id: "00000000-0000-7000-8000-000000000006", name: "file", icon: "File", color: "#6b7280" },
  { id: "00000000-0000-7000-8000-000000000007", name: "image", icon: "Image", color: "#ec4899" },
] as const;

type SystemTypeName = (typeof SYSTEM_ITEM_TYPES)[number]["name"];

const TYPE_ID = Object.fromEntries(
  SYSTEM_ITEM_TYPES.map((type) => [type.name, type.id]),
) as Record<SystemTypeName, string>;

const DEMO_USER = {
  email: "demo@devstash.io",
  name: "Demo User",
  password: "12345678",
};

const BCRYPT_ROUNDS = 12;

interface SeedItem {
  title: string;
  type: "snippet" | "prompt" | "command" | "link";
  description: string;
  /** Body for text types, target URL for links. */
  body: string;
  language?: string;
  isFavorite?: boolean;
  isPinned?: boolean;
}

interface SeedCollection {
  name: string;
  description: string;
  isFavorite?: boolean;
  items: SeedItem[];
}

const COLLECTIONS: SeedCollection[] = [
  {
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    isFavorite: true,
    items: [
      {
        title: "useDebounce & useLocalStorage hooks",
        type: "snippet",
        language: "typescript",
        description: "Debounce a fast-changing value and persist state to localStorage.",
        isPinned: true,
        isFavorite: true,
        body: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : initial;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}`,
      },
      {
        title: "Context provider & compound components",
        type: "snippet",
        language: "typescript",
        description: "A typed context provider with a guarded hook, used to build a compound Tabs component.",
        body: `import { createContext, useContext, useState, type ReactNode } from "react";

interface TabsContextValue {
  active: string;
  setActive: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) throw new Error("Tabs.* must be used inside <Tabs>");
  return context;
}

export function Tabs({ defaultTab, children }: { defaultTab: string; children: ReactNode }) {
  const [active, setActive] = useState(defaultTab);
  return <TabsContext.Provider value={{ active, setActive }}>{children}</TabsContext.Provider>;
}

Tabs.Trigger = function Trigger({ id, children }: { id: string; children: ReactNode }) {
  const { active, setActive } = useTabs();
  return (
    <button aria-selected={active === id} onClick={() => setActive(id)}>
      {children}
    </button>
  );
};

Tabs.Panel = function Panel({ id, children }: { id: string; children: ReactNode }) {
  const { active } = useTabs();
  return active === id ? <div>{children}</div> : null;
};`,
      },
      {
        title: "Utility functions",
        type: "snippet",
        language: "typescript",
        description: "Small helpers that show up in every React project.",
        body: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return \`\${(bytes / 1024 ** i).toFixed(decimals)} \${units[i]}\`;
}

export function groupBy<T, K extends PropertyKey>(items: T[], key: (item: T) => K) {
  return items.reduce(
    (groups, item) => {
      (groups[key(item)] ??= []).push(item);
      return groups;
    },
    {} as Record<K, T[]>,
  );
}`,
      },
    ],
  },
  {
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    isFavorite: true,
    items: [
      {
        title: "Code review prompt",
        type: "prompt",
        description: "Structured review focused on bugs, security and maintainability.",
        isPinned: true,
        body: `You are a senior engineer reviewing a pull request.

Review the code below and report, in order of severity:
1. Bugs and logic errors, including unhandled edge cases
2. Security issues (auth checks, input validation, injection, secrets)
3. Performance problems (N+1 queries, unnecessary re-renders, blocking I/O)
4. Readability and maintainability

For each finding give the line, what is wrong, why it matters, and a concrete fix.
Skip style nits a formatter would catch. If the code is fine, say so.

\`\`\`
{{code}}
\`\`\``,
      },
      {
        title: "Documentation generator",
        type: "prompt",
        description: "Turn a module into README-style documentation.",
        body: `Write developer documentation for the following module.

Include:
- A one-paragraph overview of what it does and when to use it
- Installation or setup steps, if any
- The public API: every exported function, type and component, with parameters,
  return values and a short usage example
- Gotchas, limitations and error behaviour

Write in Markdown. Be concise; do not document private helpers.

\`\`\`
{{code}}
\`\`\``,
      },
      {
        title: "Refactoring assistant",
        type: "prompt",
        description: "Propose a safe, incremental refactor without changing behaviour.",
        isFavorite: true,
        body: `Refactor the code below to improve readability and structure without changing its behaviour.

Constraints:
- Keep the public API identical
- Prefer small, well-named functions over comments
- Remove duplication and dead code
- Do not add new dependencies

First list the problems you see, then show the refactored code, then explain
any change a reviewer might question. Call out anything that would need a test
before it is safe to merge.

\`\`\`
{{code}}
\`\`\``,
      },
    ],
  },
  {
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    items: [
      {
        title: "Next.js multi-stage Dockerfile",
        type: "snippet",
        language: "dockerfile",
        description: "Small production image using Next.js standalone output.",
        body: `FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]`,
      },
      {
        title: "Deploy with migrations",
        type: "command",
        description: "Apply pending Prisma migrations, then build and start.",
        body: `npm ci && npx prisma migrate deploy && npm run build && npm run start`,
      },
      {
        title: "Docker documentation",
        type: "link",
        description: "Official Docker docs — Dockerfile reference, Compose and more.",
        body: "https://docs.docker.com/",
      },
      {
        title: "GitHub Actions documentation",
        type: "link",
        description: "Workflow syntax, runners and CI/CD guides.",
        body: "https://docs.github.com/en/actions",
      },
    ],
  },
  {
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    items: [
      {
        title: "Undo last commit, keep changes",
        type: "command",
        description: "Move HEAD back one commit and leave the changes staged.",
        isPinned: true,
        body: `git reset --soft HEAD~1`,
      },
      {
        title: "Clean up Docker",
        type: "command",
        description: "Remove stopped containers, unused networks, images and build cache.",
        body: `docker system prune -a --volumes`,
      },
      {
        title: "Kill process on a port",
        type: "command",
        description: "Free a port held by a stray dev server.",
        body: `lsof -ti tcp:3000 | xargs kill -9`,
      },
      {
        title: "Find outdated packages",
        type: "command",
        description: "List dependencies with newer versions available.",
        body: `npm outdated`,
      },
    ],
  },
  {
    name: "Design Resources",
    description: "UI/UX resources and references",
    items: [
      {
        title: "Tailwind CSS docs",
        type: "link",
        description: "Utility class reference and v4 theme configuration.",
        isFavorite: true,
        body: "https://tailwindcss.com/docs",
      },
      {
        title: "shadcn/ui",
        type: "link",
        description: "Accessible components you copy into your project.",
        body: "https://ui.shadcn.com/",
      },
      {
        title: "Material Design 3",
        type: "link",
        description: "Google's design system — foundations, styles and components.",
        body: "https://m3.material.io/",
      },
      {
        title: "Lucide icons",
        type: "link",
        description: "The open-source icon set DevStash uses.",
        body: "https://lucide.dev/icons/",
      },
    ],
  },
];

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set — cannot seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

async function seedSystemTypes() {
  for (const { id, name, icon, color } of SYSTEM_ITEM_TYPES) {
    await prisma.itemType.upsert({
      where: { id },
      update: { name, icon, color, isSystem: true, userId: null },
      create: { id, name, icon, color, isSystem: true },
    });
  }
}

async function seedDemoUser() {
  const password = await bcrypt.hash(DEMO_USER.password, BCRYPT_ROUNDS);
  const profile = {
    name: DEMO_USER.name,
    password,
    isPro: false,
    emailVerified: new Date(),
  };

  return prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: profile,
    create: { email: DEMO_USER.email, ...profile },
  });
}

function toItemData(item: SeedItem, userId: string) {
  const isLink = item.type === "link";

  return {
    title: item.title,
    description: item.description,
    contentType: isLink ? ("URL" as const) : ("TEXT" as const),
    content: isLink ? null : item.body,
    url: isLink ? item.body : null,
    language: item.language ?? null,
    isFavorite: item.isFavorite ?? false,
    isPinned: item.isPinned ?? false,
    userId,
    typeId: TYPE_ID[item.type],
  };
}

/**
 * Items have no natural unique key to upsert on, so the demo user's items are
 * cleared and recreated; their collection and tag join rows cascade with them.
 */
async function seedCollections(userId: string) {
  await prisma.item.deleteMany({ where: { userId } });

  for (const { items, ...collection } of COLLECTIONS) {
    const fields = {
      description: collection.description,
      isFavorite: collection.isFavorite ?? false,
    };

    const { id: collectionId } = await prisma.collection.upsert({
      where: { userId_name: { userId, name: collection.name } },
      update: fields,
      create: { userId, name: collection.name, ...fields },
    });

    for (const item of items) {
      await prisma.item.create({
        data: {
          ...toItemData(item, userId),
          collections: { create: { collectionId } },
        },
      });
    }
  }
}

async function main() {
  await seedSystemTypes();
  const user = await seedDemoUser();
  await seedCollections(user.id);

  const itemCount = COLLECTIONS.reduce((sum, c) => sum + c.items.length, 0);
  console.log(
    `Seeded ${SYSTEM_ITEM_TYPES.length} system types, user ${user.email}, ` +
      `${COLLECTIONS.length} collections, ${itemCount} items.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
