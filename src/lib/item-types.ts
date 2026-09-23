/**
 * Presentation helpers for item types.
 *
 * `ItemType.icon` is stored as a lucide icon *name* (a string) so the database
 * can hold it. The UI needs the component, so the mapping lives here — one
 * place for the sidebar, cards, and badges to share.
 */

import {
  Code,
  File,
  Image,
  Link as LinkIcon,
  Sparkles,
  StickyNote,
  Terminal,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link: LinkIcon,
  File,
  Image,
};

/** Types gated behind Pro — see the monetization table in the project overview. */
const PRO_TYPE_NAMES = new Set(["file", "image"]);

/** Falls back to `File` so an unknown icon name renders something sane. */
export function getTypeIcon(iconName: string): LucideIcon {
  return ICONS[iconName] ?? File;
}

/** "snippet" → "Snippets". Every system type pluralizes regularly. */
export function getTypeLabel(name: string): string {
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}s`;
}

/** "snippet" → "/items/snippets" */
export function getTypeHref(name: string): string {
  return `/items/${name}s`;
}

export function isProType(name: string): boolean {
  return PRO_TYPE_NAMES.has(name);
}
