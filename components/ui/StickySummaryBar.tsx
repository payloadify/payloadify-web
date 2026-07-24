"use client";

import { ReactNode } from "react";

/** Bottom-anchored bar that appears once the tool's primary output section has scrolled out of
 *  view, keeping the generated result and its copy action reachable without scrolling back up.
 *  `visible` is driven by the same IntersectionObserver instance as the page's `SectionNav`
 *  (see `useSectionTracking`). Long tool pages only. */
export function StickySummaryBar({
  content,
  actions,
  visible,
}: {
  content: ReactNode;
  actions: ReactNode;
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-300 bg-[var(--background)] px-4 py-3 dark:border-zinc-700">
      <div className="min-w-0 flex-1 truncate text-sm">{content}</div>
      <div className="flex shrink-0 gap-2">{actions}</div>
    </div>
  );
}
