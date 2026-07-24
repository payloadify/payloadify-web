"use client";

import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { CopyButton } from "@/components/ui/CopyButton";

export interface ToolReference {
  id: string;
  label: string;
  url: string;
  source?: string;
}

/** Collapsible "References" block reused across tools — each shows a title, an external link,
 *  and a copy button, with the collapsed/expanded state persisted per storageKey. */
export function ReferencesPanel({ references, storageKey }: { references: ToolReference[]; storageKey: string }) {
  return (
    <CollapsibleSection title="References" storageKey={storageKey} defaultOpen={false}>
      <ul className="flex flex-col gap-1.5">
        {references.map((ref) => (
          <li key={ref.id} className="flex items-center justify-between gap-2 text-sm">
            <a
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-zinc-700 underline hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              {ref.label}
              {ref.source && <span className="text-xs text-zinc-500 dark:text-zinc-400"> ({ref.source})</span>}
            </a>
            <CopyButton text={ref.url} />
          </li>
        ))}
      </ul>
    </CollapsibleSection>
  );
}
