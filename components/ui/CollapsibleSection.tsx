"use client";

import { ReactNode } from "react";
import { usePersistedBoolean } from "@/lib/storage/persistedBoolean";

/** Shared disclosure pattern, replacing the two patterns that used to coexist (native
 *  `<details>`, and this component's own predecessor in ReferencesPanel.tsx): a button+chevron
 *  header with `aria-expanded`, collapsed/expanded state persisted per `storageKey`. The persisted
 *  value is "collapsed" (not "open") so existing keys already storing that semantic (e.g.
 *  ReferencesPanel's) carry their persisted preference over unchanged. */
export function CollapsibleSection({
  title,
  storageKey,
  defaultOpen = false,
  badge,
  children,
}: {
  title: string;
  storageKey: string;
  defaultOpen?: boolean;
  badge?: ReactNode;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = usePersistedBoolean(storageKey, !defaultOpen);

  return (
    <div className="flex flex-col gap-2 rounded border border-zinc-300 p-3 dark:border-zinc-700">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
        className="flex w-full items-center justify-between text-sm font-medium text-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-300 dark:focus-visible:outline-zinc-400"
      >
        <span className="flex items-center gap-2">
          {title}
          {badge}
        </span>
        <span className="text-zinc-400">{collapsed ? "▸" : "▾"}</span>
      </button>

      {!collapsed && <div className="flex flex-col gap-2">{children}</div>}
    </div>
  );
}
