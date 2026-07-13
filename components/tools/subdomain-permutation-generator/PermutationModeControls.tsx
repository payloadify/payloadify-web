"use client";

import { checkboxLabelClasses, inputClasses } from "@/components/ui/formClasses";

export function PermutationModeControls({
  includeStandalone,
  onToggleStandalone,
  includeAffixing,
  onToggleAffixing,
  includeNumbering,
  onToggleNumbering,
  numberingMinText,
  onNumberingMinTextChange,
  numberingMaxText,
  onNumberingMaxTextChange,
  numberingZeroPadded,
  onToggleNumberingZeroPadded,
  includeWordJoining,
  onToggleWordJoining,
}: {
  includeStandalone: boolean;
  onToggleStandalone: (value: boolean) => void;
  includeAffixing: boolean;
  onToggleAffixing: (value: boolean) => void;
  includeNumbering: boolean;
  onToggleNumbering: (value: boolean) => void;
  numberingMinText: string;
  onNumberingMinTextChange: (value: string) => void;
  numberingMaxText: string;
  onNumberingMaxTextChange: (value: string) => void;
  numberingZeroPadded: boolean;
  onToggleNumberingZeroPadded: (value: boolean) => void;
  includeWordJoining: boolean;
  onToggleWordJoining: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-medium">Permutation modes</label>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className={checkboxLabelClasses}>
          <input type="checkbox" checked={includeStandalone} onChange={(e) => onToggleStandalone(e.target.checked)} />
          Standalone words (<code>api.example.com</code>)
        </label>
        <label className={checkboxLabelClasses}>
          <input type="checkbox" checked={includeAffixing} onChange={(e) => onToggleAffixing(e.target.checked)} />
          Prefix/suffix affixing (<code>dev-api.example.com</code>)
        </label>
        <label className={checkboxLabelClasses}>
          <input type="checkbox" checked={includeWordJoining} onChange={(e) => onToggleWordJoining(e.target.checked)} />
          Word-joining your own keywords (<code>api-dev.example.com</code>)
        </label>
        <label className={checkboxLabelClasses}>
          <input type="checkbox" checked={includeNumbering} onChange={(e) => onToggleNumbering(e.target.checked)} />
          Numbering (<code>app1.example.com</code>)
        </label>
      </div>

      {includeNumbering && (
        <div className="mt-1 flex flex-wrap items-center gap-3 rounded border border-zinc-200 p-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <label className="text-sm">From</label>
            <input
              type="number"
              value={numberingMinText}
              onChange={(e) => onNumberingMinTextChange(e.target.value)}
              className={`${inputClasses} w-20`}
            />
            <label className="text-sm">to</label>
            <input
              type="number"
              value={numberingMaxText}
              onChange={(e) => onNumberingMaxTextChange(e.target.value)}
              className={`${inputClasses} w-20`}
            />
          </div>
          <label className={checkboxLabelClasses}>
            <input
              type="checkbox"
              checked={numberingZeroPadded}
              onChange={(e) => onToggleNumberingZeroPadded(e.target.checked)}
            />
            Zero-padded (01, 02, …)
          </label>
        </div>
      )}
    </div>
  );
}
