"use client";

import { useState } from "react";

const DEFAULT_MAX_CHARS = 500;

/** Trims long text neatly behind a "Show more" toggle instead of dumping the full string into the
 *  page. `text` passed to a sibling CopyButton should stay the untrimmed original, this component
 *  only affects what's rendered on screen. */
export function ExpandableText({
  text,
  className = "",
  maxChars = DEFAULT_MAX_CHARS,
}: {
  text: string;
  className?: string;
  maxChars?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > maxChars;
  const shown = !isLong || expanded ? text : text.slice(0, maxChars) + "…";

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <code className={className}>{shown}</code>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="self-start text-xs text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          {expanded ? "Show less" : `Show more (${text.length.toLocaleString()} characters)`}
        </button>
      )}
    </div>
  );
}
