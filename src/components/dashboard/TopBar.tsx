import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Dashboard top bar: search field and the new-item action.
 *
 * Display only for now — neither control is wired up. Both become interactive
 * in a later phase, at which point the search field moves to a client component.
 */
export function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b px-4">
      <div className="relative w-full max-w-md">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          placeholder="Search items, tags, types..."
          aria-label="Search items, tags, types"
          className="h-9 pr-14 pl-8"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border px-1.5 py-0.5 font-mono text-xs text-muted-foreground sm:block">
          ⌘K
        </kbd>
      </div>

      <Button size="lg" className="ml-auto">
        <Plus />
        New Item
      </Button>
    </header>
  );
}
