"use client";

import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { selectClasses } from "@/components/ui/formClasses";
import { VULN_CATEGORIES, VULN_TYPES } from "@payloadify/cvss-core";

export function ChainPicker({
  firstVulnTypeId,
  chainVulnTypeId,
  onChainChange,
}: {
  firstVulnTypeId: string;
  chainVulnTypeId: string | null;
  onChainChange: (id: string | null) => void;
}) {
  const optionsByCategory = VULN_CATEGORIES.map((category) => ({
    category,
    types: VULN_TYPES.filter((v) => v.categoryId === category.id && v.id !== firstVulnTypeId).sort((a, b) => a.label.localeCompare(b.label)),
  })).filter((group) => group.types.length > 0);

  return (
    <CollapsibleSection
      title="Chain with another vulnerability"
      storageKey="payloadify:cvss-calculator:chain-picker-collapsed"
      defaultOpen={false}
    >
      <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Chain with</label>
      <select
        className={`${selectClasses} w-full`}
        value={chainVulnTypeId ?? ""}
        onChange={(e) => onChainChange(e.target.value === "" ? null : e.target.value)}
      >
        <option value="">None</option>
        {optionsByCategory.map(({ category, types }) => (
          <optgroup key={category.id} label={category.label}>
            {types.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </CollapsibleSection>
  );
}
