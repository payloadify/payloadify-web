"use client";

import { selectClasses, toggleButtonClasses } from "@/components/ui/formClasses";
import { CvssTemplate } from "@/lib/cvss/templates/types";
import { VULN_TYPES } from "@/lib/cvss/templates/vulnTypes";
import { PLATFORMS } from "@/lib/cvss/shared/types";
import { Platform } from "@/lib/cvss/shared/types";

export function PlatformVulnPicker({
  platformFilter,
  onPlatformChange,
  vulnTypeId,
  onVulnTypeChange,
  templateId,
  onTemplateChange,
  templatesForVulnType,
}: {
  platformFilter: Platform;
  onPlatformChange: (p: Platform) => void;
  vulnTypeId: string | null;
  onVulnTypeChange: (id: string | null) => void;
  templateId: string | null;
  onTemplateChange: (id: string | null) => void;
  templatesForVulnType: CvssTemplate[];
}) {
  const vulnTypesForPlatform = VULN_TYPES.filter((v) => v.platforms.includes(platformFilter));

  return (
    <div className="flex flex-col gap-3 rounded border border-zinc-300 p-4 dark:border-zinc-700">
      <div>
        <div className="mb-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">Platform</div>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={toggleButtonClasses(platformFilter === p.id)}
              onClick={() => onPlatformChange(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Vulnerability type</label>
          <select
            className={`${selectClasses} w-full`}
            value={vulnTypeId ?? ""}
            onChange={(e) => onVulnTypeChange(e.target.value === "" ? null : e.target.value)}
          >
            <option value="">Any / Custom</option>
            {vulnTypesForPlatform.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Scenario template</label>
          <select
            className={`${selectClasses} w-full`}
            value={templateId ?? ""}
            onChange={(e) => onTemplateChange(e.target.value === "" ? null : e.target.value)}
            disabled={templatesForVulnType.length === 0}
          >
            <option value="">Custom</option>
            {templatesForVulnType.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
