"use client";

import { useMemo, useState } from "react";
import { iconButtonClasses, inputClasses, selectClasses, toggleButtonClasses } from "@/components/ui/formClasses";
import { CopyField } from "@/lib/cvss/shared/copyFormat";
import { CvssVersion, Platform } from "@/lib/cvss/shared/types";
import { CWE_ENTRIES_BY_ID } from "@/lib/cvss/references/cwe";
import { OWASP_CATEGORIES_BY_ID } from "@/lib/cvss/references/owasp";
import { VRT_CATEGORIES_BY_ID } from "@/lib/cvss/references/vrt";
import { findChainPair } from "@/lib/cvss/templates/chaining";
import { CVSS_TEMPLATES, CVSS_TEMPLATES_BY_ID } from "@/lib/cvss/templates/templates";
import { CvssMeta, EMPTY_CVSS_META } from "@/lib/cvss/templates/types";
import { SavedCvssTemplate, useSavedCvssTemplates } from "@/lib/storage/savedCvssTemplates";
import {
  CVSS31_AC_OPTIONS,
  CVSS31_AV_OPTIONS,
  CVSS31_CIA_OPTIONS,
  CVSS31_DEFAULT_METRICS,
  CVSS31_PR_OPTIONS,
  CVSS31_S_OPTIONS,
  CVSS31_UI_OPTIONS,
  Cvss31Metrics,
} from "@/lib/cvss/v3_1/metrics";
import { computeCvss31Score } from "@/lib/cvss/v3_1/score";
import { buildCvss31Vector } from "@/lib/cvss/v3_1/vector";
import {
  CVSS40_AC_OPTIONS,
  CVSS40_AT_OPTIONS,
  CVSS40_AV_OPTIONS,
  CVSS40_DEFAULT_METRICS,
  CVSS40_E_OPTIONS,
  CVSS40_IMPACT_OPTIONS,
  CVSS40_PR_OPTIONS,
  CVSS40_UI_OPTIONS,
  Cvss40Metrics,
} from "@/lib/cvss/v4_0/metrics";
import { computeCvss40Score } from "@/lib/cvss/v4_0/score";
import { buildCvss40Vector } from "@/lib/cvss/v4_0/vector";
import { ChainPicker } from "./ChainPicker";
import { CopyAllPanel } from "./CopyAllPanel";
import { OutputPanel } from "./OutputPanel";
import { PlatformVulnPicker } from "./PlatformVulnPicker";

const VERSIONS: CvssVersion[] = ["3.1", "4.0"];
const SAVED_CVSS_TEMPLATES_KEY = "payloadify:cvss-calculator:saved-templates";

function MetricRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={toggleButtonClasses(value === option.id)}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CvssCalculatorTool() {
  const [version, setVersion] = useState<CvssVersion>("3.1");
  const [platformFilter, setPlatformFilter] = useState<Platform>("web");
  const [vulnTypeId, setVulnTypeId] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [chainVulnTypeId, setChainVulnTypeId] = useState<string | null>(null);
  const [metrics31, setMetrics31] = useState<Cvss31Metrics>(CVSS31_DEFAULT_METRICS);
  const [metrics40, setMetrics40] = useState<Cvss40Metrics>(CVSS40_DEFAULT_METRICS);
  const [meta, setMeta] = useState<CvssMeta>(EMPTY_CVSS_META);
  const [saveNameInput, setSaveNameInput] = useState("");
  const [savedMenuOpen, setSavedMenuOpen] = useState(false);
  const [selectedSavedTemplateId, setSelectedSavedTemplateId] = useState<string | null>(null);

  const { templates: savedTemplates, save: saveTemplate, remove: removeTemplate, removeAll: removeAllTemplates } =
    useSavedCvssTemplates(SAVED_CVSS_TEMPLATES_KEY);

  const currentTemplate = templateId ? CVSS_TEMPLATES_BY_ID[templateId] : null;
  const templatesForVulnType = useMemo(
    () => (vulnTypeId ? CVSS_TEMPLATES.filter((t) => t.vulnTypeId === vulnTypeId && t.platforms.includes(platformFilter)) : []),
    [vulnTypeId, platformFilter],
  );

  function updateMeta(patch: Partial<CvssMeta>) {
    setMeta((prev) => ({ ...prev, ...patch }));
  }

  function selectPlatform(p: Platform) {
    setPlatformFilter(p);
    setVulnTypeId(null);
    setTemplateId(null);
    setChainVulnTypeId(null);
    setMeta(EMPTY_CVSS_META);
    setSelectedSavedTemplateId(null);
  }

  function selectVulnType(id: string | null) {
    setVulnTypeId(id);
    setTemplateId(null);
    setChainVulnTypeId(null);
    setMeta(EMPTY_CVSS_META);
    setSelectedSavedTemplateId(null);
  }

  function resetToCustom() {
    setTemplateId(null);
    setChainVulnTypeId(null);
  }

  function selectTemplate(id: string | null) {
    setSelectedSavedTemplateId(null);
    if (id === null) {
      resetToCustom();
      return;
    }
    const template = CVSS_TEMPLATES_BY_ID[id];
    setTemplateId(id);
    setChainVulnTypeId(null);
    setMetrics31(template.cvss31);
    setMetrics40(template.cvss40);
    setMeta({ rationale: "", owaspRefId: template.owaspRefId, vrtRefId: template.vrtRefId, cweId: template.cweId, references: template.references });
  }

  function selectChain(secondId: string | null) {
    if (!currentTemplate) return;
    setSelectedSavedTemplateId(null);
    if (secondId === null) {
      setChainVulnTypeId(null);
      setMetrics31(currentTemplate.cvss31);
      setMetrics40(currentTemplate.cvss40);
      setMeta({
        rationale: "",
        owaspRefId: currentTemplate.owaspRefId,
        vrtRefId: currentTemplate.vrtRefId,
        cweId: currentTemplate.cweId,
        references: currentTemplate.references,
      });
      return;
    }
    const pair = findChainPair(currentTemplate.vulnTypeId, secondId);
    if (!pair) return;
    setChainVulnTypeId(secondId);
    setMetrics31(pair.cvss31);
    setMetrics40(pair.cvss40);
    setMeta({ rationale: pair.rationale, owaspRefId: pair.owaspRefId, vrtRefId: pair.vrtRefId, cweId: pair.cweId, references: pair.references });
  }

  function loadSavedTemplate(saved: SavedCvssTemplate) {
    setPlatformFilter(saved.platformFilter);
    setVulnTypeId(saved.vulnTypeId);
    setTemplateId(null);
    setChainVulnTypeId(null);
    setMetrics31(saved.cvss31);
    setMetrics40(saved.cvss40);
    setMeta(saved.meta);
    setSelectedSavedTemplateId(saved.id);
    setSavedMenuOpen(false);
  }

  function deleteSavedTemplate(id: string) {
    removeTemplate(id);
    if (selectedSavedTemplateId === id) setSelectedSavedTemplateId(null);
  }

  function deleteAllSavedTemplates() {
    if (savedTemplates.length === 0) return;
    const confirmed = window.confirm(`Delete all ${savedTemplates.length} saved CVSS templates? This cannot be undone.`);
    if (!confirmed) return;
    removeAllTemplates();
    setSelectedSavedTemplateId(null);
  }

  function resetWorkingState() {
    setPlatformFilter("web");
    setVulnTypeId(null);
    setTemplateId(null);
    setChainVulnTypeId(null);
    setMetrics31(CVSS31_DEFAULT_METRICS);
    setMetrics40(CVSS40_DEFAULT_METRICS);
    setMeta(EMPTY_CVSS_META);
    setSelectedSavedTemplateId(null);
  }

  function setMetric31<K extends keyof Cvss31Metrics>(key: K, value: Cvss31Metrics[K]) {
    setMetrics31((prev) => ({ ...prev, [key]: value }));
    resetToCustom();
  }

  function setMetric40<K extends keyof Cvss40Metrics>(key: K, value: Cvss40Metrics[K]) {
    setMetrics40((prev) => ({ ...prev, [key]: value }));
    // Exploit Maturity (E) is an engagement-specific overlay, not a scenario property — changing
    // it doesn't kick the UI out of template/chain mode (mirrors msfvenom's LHOST/LPORT carve-out).
    if (key !== "E") resetToCustom();
  }

  const { baseScore: score31, severity: severity31 } = useMemo(() => computeCvss31Score(metrics31), [metrics31]);
  const vector31 = useMemo(() => buildCvss31Vector(metrics31), [metrics31]);
  const { baseScore: score40, severity: severity40 } = useMemo(() => computeCvss40Score(metrics40), [metrics40]);
  const vector40 = useMemo(() => buildCvss40Vector(metrics40), [metrics40]);

  const selectedSavedTemplate = selectedSavedTemplateId ? savedTemplates.find((t) => t.id === selectedSavedTemplateId) : null;
  const suggestedSaveName = selectedSavedTemplate?.name ?? currentTemplate?.label ?? "e.g. Client X — login XSS";

  function saveCurrentAsTemplate() {
    const name = saveNameInput.trim() || suggestedSaveName;
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
    saveTemplate({ id, name, platformFilter, vulnTypeId, cvss31: metrics31, cvss40: metrics40, meta });
    setSaveNameInput("");
  }

  const baseScore = version === "3.1" ? score31 : score40;
  const severity = version === "3.1" ? severity31 : severity40;
  const vector = version === "3.1" ? vector31 : vector40;

  const copyFields: CopyField[] = useMemo(() => {
    const fields: CopyField[] = [{ id: "vector", label: "Vector String", value: vector }];
    const owasp = meta.owaspRefId ? OWASP_CATEGORIES_BY_ID[meta.owaspRefId] : null;
    const vrt = meta.vrtRefId ? VRT_CATEGORIES_BY_ID[meta.vrtRefId] : null;
    const cwe = meta.cweId ? CWE_ENTRIES_BY_ID[meta.cweId] : null;
    if (owasp) fields.push({ id: "owasp", label: "OWASP Category", value: owasp.label, url: owasp.url });
    if (vrt) fields.push({ id: "vrt", label: "VRT Category", value: `VRT — ${vrt.label}${vrt.priority ? ` (${vrt.priority})` : ""}` });
    if (cwe) fields.push({ id: "cwe", label: "CWE", value: `${cwe.id}: ${cwe.label}`, url: cwe.url });
    if (meta.references.length > 0) {
      fields.push({ id: "references", label: "References", value: meta.references.map((r) => r.url).join("\n") });
    }
    return fields;
  }, [vector, meta]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        {VERSIONS.map((v) => (
          <button key={v} type="button" className={toggleButtonClasses(version === v)} onClick={() => setVersion(v)}>
            CVSS {v}
          </button>
        ))}
      </div>

      <PlatformVulnPicker
        platformFilter={platformFilter}
        onPlatformChange={selectPlatform}
        vulnTypeId={vulnTypeId}
        onVulnTypeChange={selectVulnType}
        templateId={templateId}
        onTemplateChange={selectTemplate}
        templatesForVulnType={templatesForVulnType}
      />

      {currentTemplate && <ChainPicker firstVulnTypeId={currentTemplate.vulnTypeId} chainVulnTypeId={chainVulnTypeId} onChainChange={selectChain} />}

      {version === "3.1" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricRow label="Attack Vector (AV)" options={CVSS31_AV_OPTIONS} value={metrics31.AV} onChange={(v) => setMetric31("AV", v)} />
          <MetricRow label="Attack Complexity (AC)" options={CVSS31_AC_OPTIONS} value={metrics31.AC} onChange={(v) => setMetric31("AC", v)} />
          <MetricRow label="Privileges Required (PR)" options={CVSS31_PR_OPTIONS} value={metrics31.PR} onChange={(v) => setMetric31("PR", v)} />
          <MetricRow label="User Interaction (UI)" options={CVSS31_UI_OPTIONS} value={metrics31.UI} onChange={(v) => setMetric31("UI", v)} />
          <MetricRow label="Scope (S)" options={CVSS31_S_OPTIONS} value={metrics31.S} onChange={(v) => setMetric31("S", v)} />
          <MetricRow label="Confidentiality (C)" options={CVSS31_CIA_OPTIONS} value={metrics31.C} onChange={(v) => setMetric31("C", v)} />
          <MetricRow label="Integrity (I)" options={CVSS31_CIA_OPTIONS} value={metrics31.I} onChange={(v) => setMetric31("I", v)} />
          <MetricRow label="Availability (A)" options={CVSS31_CIA_OPTIONS} value={metrics31.A} onChange={(v) => setMetric31("A", v)} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricRow label="Attack Vector (AV)" options={CVSS40_AV_OPTIONS} value={metrics40.AV} onChange={(v) => setMetric40("AV", v)} />
          <MetricRow label="Attack Complexity (AC)" options={CVSS40_AC_OPTIONS} value={metrics40.AC} onChange={(v) => setMetric40("AC", v)} />
          <MetricRow label="Attack Requirements (AT)" options={CVSS40_AT_OPTIONS} value={metrics40.AT} onChange={(v) => setMetric40("AT", v)} />
          <MetricRow label="Privileges Required (PR)" options={CVSS40_PR_OPTIONS} value={metrics40.PR} onChange={(v) => setMetric40("PR", v)} />
          <MetricRow label="User Interaction (UI)" options={CVSS40_UI_OPTIONS} value={metrics40.UI} onChange={(v) => setMetric40("UI", v)} />
          <MetricRow
            label="Vulnerable System Confidentiality (VC)"
            options={CVSS40_IMPACT_OPTIONS}
            value={metrics40.VC}
            onChange={(v) => setMetric40("VC", v)}
          />
          <MetricRow
            label="Vulnerable System Integrity (VI)"
            options={CVSS40_IMPACT_OPTIONS}
            value={metrics40.VI}
            onChange={(v) => setMetric40("VI", v)}
          />
          <MetricRow
            label="Vulnerable System Availability (VA)"
            options={CVSS40_IMPACT_OPTIONS}
            value={metrics40.VA}
            onChange={(v) => setMetric40("VA", v)}
          />
          <MetricRow
            label="Subsequent System Confidentiality (SC)"
            options={CVSS40_IMPACT_OPTIONS}
            value={metrics40.SC}
            onChange={(v) => setMetric40("SC", v)}
          />
          <MetricRow
            label="Subsequent System Integrity (SI)"
            options={CVSS40_IMPACT_OPTIONS}
            value={metrics40.SI}
            onChange={(v) => setMetric40("SI", v)}
          />
          <MetricRow
            label="Subsequent System Availability (SA)"
            options={CVSS40_IMPACT_OPTIONS}
            value={metrics40.SA}
            onChange={(v) => setMetric40("SA", v)}
          />
          <MetricRow label="Exploit Maturity (E)" options={CVSS40_E_OPTIONS} value={metrics40.E} onChange={(v) => setMetric40("E", v)} />
        </div>
      )}

      <OutputPanel baseScore={baseScore} severity={severity} vector={vector} meta={meta} onMetaChange={updateMeta} />

      <div className="flex flex-col gap-2 rounded border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[160px] flex-1">
            <label className="mb-1 block text-sm font-medium">Save this score as</label>
            <input
              type="text"
              value={saveNameInput}
              onChange={(e) => setSaveNameInput(e.target.value)}
              placeholder={suggestedSaveName}
              className={inputClasses}
            />
          </div>
          <button type="button" onClick={saveCurrentAsTemplate} className={iconButtonClasses}>
            Save This Template
          </button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Saved templates</label>
          <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">
            Saved templates are stored in your browser only. They&apos;ll persist across refreshes, but won&apos;t sync across devices or browsers.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setSavedMenuOpen((open) => !open)}
                className={`${selectClasses} min-w-[220px] text-left`}
              >
                {selectedSavedTemplate ? selectedSavedTemplate.name : "— Load a saved template —"}
                <span className="float-right text-zinc-400">▾</span>
              </button>
              {savedMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSavedMenuOpen(false)} />
                  <div className="absolute z-20 mt-1 max-h-64 w-full min-w-[280px] overflow-auto rounded border border-zinc-300 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                    {savedTemplates.length === 0 && <p className="px-3 py-2 text-sm text-zinc-400 dark:text-zinc-500">No saved templates yet.</p>}
                    {savedTemplates.map((t) => (
                      <div key={t.id} className="group flex items-center justify-between px-1 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <button type="button" onClick={() => loadSavedTemplate(t)} className="min-w-0 flex-1 truncate px-2 py-1 text-left text-sm">
                          {t.name}
                        </button>
                        <span className="hidden shrink-0 items-center gap-1 pr-1 group-hover:flex">
                          <button
                            type="button"
                            onClick={() => deleteSavedTemplate(t.id)}
                            title="Delete"
                            aria-label={`Delete ${t.name}`}
                            className="rounded px-1.5 py-0.5 text-sm text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700"
                          >
                            ✕
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button type="button" onClick={deleteAllSavedTemplates} disabled={savedTemplates.length === 0} className={iconButtonClasses}>
              Delete All
            </button>
            <button type="button" onClick={resetWorkingState} title="Clears the current working state — does not delete any saved templates" className={iconButtonClasses}>
              Reset
            </button>
          </div>
        </div>
      </div>

      <CopyAllPanel fields={copyFields} />
    </div>
  );
}
