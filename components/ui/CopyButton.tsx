"use client";

import { useState } from "react";

export function CopyButton({
  text,
  label = "Copy",
  disabled = false,
  className = "",
}: {
  text: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          setCopied(false);
        }
      }}
      className={`rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:border-zinc-400 disabled:opacity-30 disabled:hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:disabled:hover:border-zinc-700 ${className}`}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
