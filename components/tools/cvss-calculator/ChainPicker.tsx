"use client";

import { selectClasses } from "@/components/ui/formClasses";
import { VULN_TYPES } from "@/lib/cvss/templates/vulnTypes";

export function ChainPicker({
  firstVulnTypeId,
  chainVulnTypeId,
  onChainChange,
}: {
  firstVulnTypeId: string;
  chainVulnTypeId: string | null;
  onChainChange: (id: string | null) => void;
}) {
  const options = VULN_TYPES.filter((v) => v.id !== firstVulnTypeId);

  return (
    <details className="rounded border border-zinc-300 dark:border-zinc-700">
      <summary className="cursor-pointer px-3 py-2 text-sm font-medium">+ Chain with another vulnerability</summary>
      <div className="px-3 pb-3">
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Chain with</label>
        <select
          className={`${selectClasses} w-full`}
          value={chainVulnTypeId ?? ""}
          onChange={(e) => onChainChange(e.target.value === "" ? null : e.target.value)}
        >
          <option value="">None</option>
          {options.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      </div>
    </details>
  );
}
