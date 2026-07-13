"use client";

import { SeparatorId } from "@/lib/subdomain/config";
import { toggleButtonClasses } from "@/components/ui/formClasses";

const SEPARATOR_OPTIONS: { id: SeparatorId; label: string }[] = [
  { id: "-", label: "-" },
  { id: ".", label: "." },
  { id: "_", label: "_" },
  { id: "", label: "none" },
];

export function SeparatorControls({
  separators,
  onToggle,
}: {
  separators: SeparatorId[];
  onToggle: (sep: SeparatorId) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium">Separators</label>
      <div className="flex flex-wrap gap-1">
        {SEPARATOR_OPTIONS.map((opt) => {
          const active = separators.includes(opt.id);
          const isLastActive = active && separators.length === 1;
          return (
            <button
              key={opt.id || "none"}
              type="button"
              disabled={isLastActive}
              onClick={() => onToggle(opt.id)}
              className={`${toggleButtonClasses(active)} disabled:cursor-not-allowed disabled:opacity-60`}
              title={isLastActive ? "At least one separator must stay active" : undefined}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
