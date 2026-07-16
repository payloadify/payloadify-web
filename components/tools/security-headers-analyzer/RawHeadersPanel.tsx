"use client";

import { CopyButton } from "@/components/ui/CopyButton";
import { usePersistedBoolean } from "@/lib/storage/persistedBoolean";

const RAW_HEADERS_COLLAPSED_KEY = "payloadify:security-headers-analyzer:raw-headers-collapsed";

export function RawHeadersPanel({ rawHeaders }: { rawHeaders: Record<string, string> }) {
  const [collapsed, setCollapsed] = usePersistedBoolean(RAW_HEADERS_COLLAPSED_KEY, true);
  const entries = Object.entries(rawHeaders).sort(([a], [b]) => a.localeCompare(b));
  const formatted = entries.map(([key, value]) => `${key}: ${value}`).join("\n");

  return (
    <div className="rounded border border-zinc-300 p-3 dark:border-zinc-700">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
        className="flex w-full items-center justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        Raw Response Headers
        <span className="text-zinc-400">{collapsed ? "▸" : "▾"}</span>
      </button>

      {!collapsed && (
        <div className="mt-3 flex items-start gap-2">
          <pre className="flex-1 overflow-x-auto whitespace-pre-wrap rounded bg-zinc-100 px-2 py-1.5 text-xs dark:bg-zinc-900">{formatted}</pre>
          <CopyButton text={formatted} label="Copy" />
        </div>
      )}
    </div>
  );
}
