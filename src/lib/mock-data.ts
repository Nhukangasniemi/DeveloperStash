/**
 * Mock data for the dashboard UI.
 *
 * Single source of truth until the database lands. Shapes mirror the draft
 * Prisma schema in `context/project-overview.md` closely enough that swapping
 * in real queries later is mostly a matter of deleting this file.
 *
 * Timestamps are anchored to MOCK_NOW so relative labels ("2h ago") stay stable.
 */

/** How to read an item's `content`: prose/code, a URL, or a stored file. */
export type ContentType = "TEXT" | "URL" | "FILE";

export interface ItemType {
  id: string;
  /** lowercase: "snippet" | "prompt" | "command" | "note" | "link" | "file" | "image" */
  name: string;
  /** lucide-react icon name */
  icon: string;
  /** hex */
  color: string;
  isSystem: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  /** Total items in the collection, including ones not in MOCK_ITEMS */
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  title: string;
  contentType: ContentType;
  /** Text body, URL, or file path depending on `contentType` */
  content: string;
  isFavorite: boolean;
  isPinned: boolean;
  /** Syntax highlighting hint for code blocks; null when not code */
  language: string | null;
  itemTypeId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isPro: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Reference point the timestamps below are offset from. */
export const MOCK_NOW = "2026-09-22T12:00:00.000Z";

export const MOCK_USER: User = {
  id: "user_1",
  name: "Maya Chen",
  email: "maya@devstash.dev",
  image: null,
  isPro: false,
  createdAt: "2026-03-04T09:12:00.000Z",
  updatedAt: "2026-09-22T10:00:00.000Z",
};

export const MOCK_ITEM_TYPES: ItemType[] = [
  {
    id: "type_snippet",
    name: "snippet",
    icon: "Code",
    color: "#3b82f6",
    isSystem: true,
  },
  {
    id: "type_prompt",
    name: "prompt",
    icon: "Sparkles",
    color: "#8b5cf6",
    isSystem: true,
  },
  {
    id: "type_command",
    name: "command",
    icon: "Terminal",
    color: "#f97316",
    isSystem: true,
  },
  {
    id: "type_note",
    name: "note",
    icon: "StickyNote",
    color: "#fde047",
    isSystem: true,
  },
  {
    id: "type_link",
    name: "link",
    icon: "Link",
    color: "#10b981",
    isSystem: true,
  },
  {
    id: "type_file",
    name: "file",
    icon: "File",
    color: "#6b7280",
    isSystem: true,
  },
  {
    id: "type_image",
    name: "image",
    icon: "Image",
    color: "#ec4899",
    isSystem: true,
  },
];

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: "col_react_patterns",
    name: "React Patterns",
    description: "Reusable hooks, components, and rendering tricks.",
    isFavorite: true,
    itemCount: 18,
    createdAt: "2026-03-10T14:00:00.000Z",
    updatedAt: "2026-09-22T10:00:00.000Z",
  },
  {
    id: "col_prototype_prompts",
    name: "Prototype Prompts",
    description: "System messages and prompts for shipping fast.",
    isFavorite: true,
    itemCount: 24,
    createdAt: "2026-04-02T11:30:00.000Z",
    updatedAt: "2026-09-22T07:00:00.000Z",
  },
  {
    id: "col_shell_devops",
    name: "Shell & DevOps",
    description: "Commands I always forget under pressure.",
    isFavorite: false,
    itemCount: 12,
    createdAt: "2026-04-18T08:45:00.000Z",
    updatedAt: "2026-09-21T12:00:00.000Z",
  },
  {
    id: "col_interview_prep",
    name: "Interview Prep",
    description: "Algorithms, notes, and talking points.",
    isFavorite: false,
    itemCount: 9,
    createdAt: "2026-05-06T19:20:00.000Z",
    updatedAt: "2026-09-20T12:00:00.000Z",
  },
  {
    id: "col_reading_list",
    name: "Reading List",
    description: "Articles, docs, and references to revisit.",
    isFavorite: false,
    itemCount: 31,
    createdAt: "2026-05-21T07:05:00.000Z",
    updatedAt: "2026-09-19T12:00:00.000Z",
  },
  {
    id: "col_context_files",
    name: "Context Files",
    description: "Project context and system files for agents.",
    isFavorite: false,
    itemCount: 7,
    createdAt: "2026-06-14T16:40:00.000Z",
    updatedAt: "2026-09-18T12:00:00.000Z",
  },
  {
    id: "col_design_refs",
    name: "Design Refs",
    description: "Screenshots and inspiration to steal from.",
    isFavorite: false,
    itemCount: 15,
    createdAt: "2026-07-01T10:15:00.000Z",
    updatedAt: "2026-09-16T12:00:00.000Z",
  },
  {
    id: "col_python_snippets",
    name: "Python Snippets",
    description: "Data wrangling and scripting one-liners.",
    isFavorite: false,
    itemCount: 21,
    createdAt: "2026-07-23T13:55:00.000Z",
    updatedAt: "2026-09-15T12:00:00.000Z",
  },
];

export const MOCK_ITEMS: Item[] = [
  {
    id: "item_use_debounce",
    title: "useDebounce hook",
    contentType: "TEXT",
    content: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}`,
    isFavorite: true,
    isPinned: true,
    language: "typescript",
    itemTypeId: "type_snippet",
    tags: ["react", "hooks", "performance"],
    createdAt: "2026-06-02T15:30:00.000Z",
    updatedAt: "2026-09-22T10:00:00.000Z",
  },
  {
    id: "item_refactor_rsc",
    title: "Refactor to server component",
    contentType: "TEXT",
    content: `You are a senior Next.js engineer. Convert the component below into a
React Server Component.

Rules:
- Keep "use client" only where interactivity genuinely requires it.
- Move data fetching into the server component.
- Extract interactive leaves into small client components.
- Explain each boundary you introduce in one line.`,
    isFavorite: false,
    isPinned: true,
    language: null,
    itemTypeId: "type_prompt",
    tags: ["nextjs", "rsc", "ai"],
    createdAt: "2026-06-19T09:10:00.000Z",
    updatedAt: "2026-09-22T08:00:00.000Z",
  },
  {
    id: "item_kill_port",
    title: "Kill process on port",
    contentType: "TEXT",
    content: "lsof -ti:3000 | xargs kill -9",
    isFavorite: true,
    isPinned: false,
    language: "bash",
    itemTypeId: "type_command",
    tags: ["shell", "ports"],
    createdAt: "2026-04-25T12:05:00.000Z",
    updatedAt: "2026-09-21T12:00:00.000Z",
  },
  {
    id: "item_system_design_checklist",
    title: "System design checklist",
    contentType: "TEXT",
    content: `1. Clarify requirements & constraints
2. Estimate scale (QPS, storage)
3. API design
4. Data model
5. High-level architecture
6. Bottlenecks & scaling
7. Trade-offs recap`,
    isFavorite: false,
    isPinned: false,
    language: "markdown",
    itemTypeId: "type_note",
    tags: ["interview", "system-design"],
    createdAt: "2026-05-11T18:00:00.000Z",
    updatedAt: "2026-09-20T12:00:00.000Z",
  },
  {
    id: "item_tailwind_upgrade",
    title: "Tailwind v4 upgrade guide",
    contentType: "URL",
    content: "https://tailwindcss.com/docs/upgrade-guide",
    isFavorite: false,
    isPinned: false,
    language: null,
    itemTypeId: "type_link",
    tags: ["tailwind", "css", "docs"],
    createdAt: "2026-05-28T10:25:00.000Z",
    updatedAt: "2026-09-19T12:00:00.000Z",
  },
  {
    id: "item_agent_context",
    title: "agent-context.md",
    contentType: "FILE",
    content: "/uploads/agent-context.md",
    isFavorite: false,
    isPinned: false,
    language: null,
    itemTypeId: "type_file",
    tags: ["context", "agents"],
    createdAt: "2026-06-20T08:30:00.000Z",
    updatedAt: "2026-09-18T12:00:00.000Z",
  },
  {
    id: "item_dashboard_inspiration",
    title: "Dashboard inspiration",
    contentType: "FILE",
    content: "/uploads/dashboard-inspiration.png",
    isFavorite: true,
    isPinned: false,
    language: null,
    itemTypeId: "type_image",
    tags: ["ui", "inspiration"],
    createdAt: "2026-07-05T17:45:00.000Z",
    updatedAt: "2026-09-17T12:00:00.000Z",
  },
  {
    id: "item_optimistic_update",
    title: "Optimistic update pattern",
    contentType: "TEXT",
    content: `const [optimisticItems, addOptimisticItem] = useOptimistic(
  items,
  (state: Item[], pending: Item) => [pending, ...state],
);

async function create(formData: FormData) {
  addOptimisticItem({ ...draft, id: "pending" });
  await createItem(formData);
}`,
    isFavorite: false,
    isPinned: false,
    language: "typescript",
    itemTypeId: "type_snippet",
    tags: ["react", "forms", "ux"],
    createdAt: "2026-07-12T11:20:00.000Z",
    updatedAt: "2026-09-17T09:00:00.000Z",
  },
  {
    id: "item_explain_regex",
    title: "Explain this regex",
    contentType: "TEXT",
    content: `Explain the regular expression below in plain English.

Break it into named parts, say what each part matches, then give three
strings that match and three that look like they should but don't.`,
    isFavorite: false,
    isPinned: false,
    language: null,
    itemTypeId: "type_prompt",
    tags: ["regex", "ai"],
    createdAt: "2026-07-30T14:50:00.000Z",
    updatedAt: "2026-09-16T12:00:00.000Z",
  },
  {
    id: "item_docker_prune",
    title: "Prune docker system",
    contentType: "TEXT",
    content: "docker system prune -af --volumes",
    isFavorite: false,
    isPinned: false,
    language: "bash",
    itemTypeId: "type_command",
    tags: ["docker", "cleanup"],
    createdAt: "2026-08-08T16:05:00.000Z",
    updatedAt: "2026-09-15T12:00:00.000Z",
  },
  {
    id: "item_release_checklist",
    title: "Release checklist",
    contentType: "TEXT",
    content: `- [ ] Migrations applied (prisma migrate status)
- [ ] Env vars set in prod
- [ ] Stripe webhook pointed at the new URL
- [ ] Smoke test: sign in, create item, upload file
- [ ] Rollback plan written down`,
    isFavorite: false,
    isPinned: false,
    language: "markdown",
    itemTypeId: "type_note",
    tags: ["deploy", "process"],
    createdAt: "2026-08-19T09:40:00.000Z",
    updatedAt: "2026-09-14T12:00:00.000Z",
  },
  {
    id: "item_react19_notes",
    title: "React 19 release notes",
    contentType: "URL",
    content: "https://react.dev/blog/2024/12/05/react-19",
    isFavorite: false,
    isPinned: false,
    language: null,
    itemTypeId: "type_link",
    tags: ["react", "docs"],
    createdAt: "2026-09-01T07:15:00.000Z",
    updatedAt: "2026-09-13T12:00:00.000Z",
  },
];

/**
 * Item count per type, for the sidebar badges. Stored rather than derived from
 * MOCK_ITEMS so the UI has no relation-walking to do; keep in sync by hand.
 */
export const mockItemTypeCounts: Record<string, number> = {
  type_snippet: 2,
  type_prompt: 2,
  type_command: 2,
  type_note: 2,
  type_link: 2,
  type_file: 1,
  type_image: 1,
};
