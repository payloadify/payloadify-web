"use client";

import { CopyButton } from "@/components/ui/CopyButton";
import { iconButtonClasses, inputClasses, selectClasses } from "@/components/ui/formClasses";
import { CWE_ENTRIES, CWE_ENTRIES_BY_ID } from "@/lib/cvss/references/cwe";
import { OWASP_CATEGORIES, OWASP_CATEGORIES_BY_ID } from "@/lib/cvss/references/owasp";
import { VRT_CATEGORIES, VRT_CATEGORIES_BY_ID } from "@/lib/cvss/references/vrt";
import { CvssMeta, CvssReference } from "@/lib/cvss/templates/types";
import { VRT_AUTOFILL } from "@/lib/cvss/templates/vrtAutofill";
import { SeverityRating } from "@/lib/cvss/shared/types";
import { usePersistedBoolean } from "@/lib/storage/persistedBoolean";

const ADDITIONAL_INFO_COLLAPSED_KEY = "payloadify:cvss-calculator:additional-info-collapsed";

const SEVERITY_CLASSES: Record<SeverityRating, string> = {
  None: "text-zinc-600 dark:text-zinc-400",
  Low: "text-blue-600 dark:text-blue-400",
  Medium: "text-amber-600 dark:text-amber-400",
  High: "text-orange-600 dark:text-orange-400",
  Critical: "text-red-600 dark:text-red-400",
};

export function OutputPanel({
  baseScore,
  severity,
  vector,
  meta,
  onMetaChange,
}: {
  baseScore: number;
  severity: SeverityRating;
  vector: string;
  meta: CvssMeta;
  onMetaChange: (patch: Partial<CvssMeta>) => void;
}) {
  const owasp = meta.owaspRefId ? OWASP_CATEGORIES_BY_ID[meta.owaspRefId] : null;
  const vrt = meta.vrtRefId ? VRT_CATEGORIES_BY_ID[meta.vrtRefId] : null;
  const cwe = meta.cweId ? CWE_ENTRIES_BY_ID[meta.cweId] : null;
  const [collapsed, setCollapsed] = usePersistedBoolean(ADDITIONAL_INFO_COLLAPSED_KEY, false);

  function handleVrtChange(newVrtId: string) {
    if (!newVrtId) {
      onMetaChange({ vrtRefId: null });
      return;
    }
    const autofill = VRT_AUTOFILL[newVrtId];
    // Picking a VRT category seeds CWE + references as a starting point — the user can still
    // change or delete them individually afterward, this doesn't lock the fields.
    onMetaChange(autofill ? { vrtRefId: newVrtId, cweId: autofill.cweId, references: autofill.references } : { vrtRefId: newVrtId });
  }

  function updateReference(index: number, patch: Partial<CvssReference>) {
    onMetaChange({ references: meta.references.map((r, i) => (i === index ? { ...r, ...patch } : r)) });
  }

  function removeReference(index: number) {
    onMetaChange({ references: meta.references.filter((_, i) => i !== index) });
  }

  function addReference() {
    onMetaChange({ references: [...meta.references, { label: "", url: "" }] });
  }

  function clearAllMeta() {
    onMetaChange({ rationale: "", owaspRefId: null, vrtRefId: null, cweId: null, references: [] });
  }

  const hasAnyMeta = meta.rationale.trim() !== "" || meta.owaspRefId || meta.vrtRefId || meta.cweId || meta.references.length > 0;

  return (
    <div className="flex flex-col gap-4 rounded border border-zinc-300 p-4 dark:border-zinc-700">
      <div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-semibold tracking-tight">{baseScore.toFixed(1)}</span>
          <span className={`text-sm font-medium ${SEVERITY_CLASSES[severity]}`}>{severity}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 overflow-x-auto rounded bg-zinc-100 px-2 py-1.5 text-xs dark:bg-zinc-900">{vector}</code>
          <CopyButton text={vector} label="Copy Vector" />
        </div>
      </div>

      <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-expanded={!collapsed}
            className="flex flex-1 items-center justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Additional Info
            <span className="text-zinc-400">{collapsed ? "▸" : "▾"}</span>
          </button>
        </div>

        {!collapsed && (
          <div className="mt-3 flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-500">Rationale / notes (optional)</label>
              <textarea
                value={meta.rationale}
                onChange={(e) => onMetaChange({ rationale: e.target.value })}
                rows={2}
                placeholder="Free-text notes for this finding — not included unless you add it in Copy All."
                className={`${inputClasses} font-sans`}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-500">OWASP Category</label>
                <select
                  value={meta.owaspRefId ?? ""}
                  onChange={(e) => onMetaChange({ owaspRefId: e.target.value || null })}
                  className={`${selectClasses} w-full`}
                >
                  <option value="">— None —</option>
                  {OWASP_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              {owasp && <CopyButton text={owasp.label} label="Copy" />}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-500">VRT Category</label>
                <select value={meta.vrtRefId ?? ""} onChange={(e) => handleVrtChange(e.target.value)} className={`${selectClasses} w-full`}>
                  <option value="">— None —</option>
                  {VRT_CATEGORIES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                      {v.priority ? ` (${v.priority})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              {vrt && (
                <CopyButton text={`VRT — ${vrt.label}${vrt.priority ? ` (${vrt.priority})` : ""}`} label="Copy" />
              )}
            </div>
            {vrt?.inferred && (
              <p className="-mt-2 text-xs text-zinc-500 dark:text-zinc-500">Inferred — not a literal VRT leaf. {vrt.note}</p>
            )}

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-500">CWE</label>
                <select
                  value={meta.cweId ?? ""}
                  onChange={(e) => onMetaChange({ cweId: e.target.value || null })}
                  className={`${selectClasses} w-full`}
                >
                  <option value="">— None —</option>
                  {CWE_ENTRIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id}: {c.label}
                    </option>
                  ))}
                </select>
              </div>
              {cwe && <CopyButton text={`${cwe.id}: ${cwe.label}`} label="Copy" />}
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-500">References</label>
                {meta.references.length > 0 && <CopyButton text={meta.references.map((r) => r.url).join("\n")} label="Copy all" />}
              </div>
              <div className="flex flex-col gap-2">
                {meta.references.map((ref, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ref.label}
                      onChange={(e) => updateReference(i, { label: e.target.value })}
                      placeholder="Label, e.g. PortSwigger — XSS"
                      className={`${inputClasses} flex-1 font-sans`}
                    />
                    <input
                      type="text"
                      value={ref.url}
                      onChange={(e) => updateReference(i, { url: e.target.value })}
                      placeholder="https://..."
                      className={`${inputClasses} flex-1 font-sans`}
                    />
                    <button
                      type="button"
                      onClick={() => removeReference(i)}
                      aria-label={`Remove reference ${i + 1}`}
                      className="rounded px-1.5 py-0.5 text-sm text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addReference} className={`${iconButtonClasses} mt-2`}>
                + Add Reference
              </button>
            </div>

            {hasAnyMeta && (
              <button type="button" onClick={clearAllMeta} className={`${iconButtonClasses} self-start`}>
                Clear Additional Info
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
