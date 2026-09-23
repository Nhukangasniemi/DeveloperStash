import { MOCK_NOW } from "@/lib/mock-data";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/**
 * "2h ago", "3d ago", "1w ago".
 *
 * Measured from MOCK_NOW rather than the real clock, so the mock timestamps
 * read the same on the server and the client — a real `Date.now()` here would
 * produce a hydration mismatch.
 */
export function formatRelativeTime(isoDate: string): string {
  const elapsed = Date.parse(MOCK_NOW) - Date.parse(isoDate);

  if (elapsed < HOUR) return `${Math.max(1, Math.floor(elapsed / MINUTE))}m ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h ago`;
  if (elapsed < WEEK) return `${Math.floor(elapsed / DAY)}d ago`;

  return `${Math.floor(elapsed / WEEK)}w ago`;
}

/** "1 item" / "18 items" */
export function formatCount(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
