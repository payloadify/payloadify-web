"use client";

import {
  CVSS40_AC_OPTIONS,
  CVSS40_AT_OPTIONS,
  CVSS40_AV_OPTIONS,
  CVSS40_E_OPTIONS,
  CVSS40_IMPACT_OPTIONS,
  CVSS40_PR_OPTIONS,
  CVSS40_UI_OPTIONS,
  Cvss40Metrics,
} from "@payloadify/cvss-core";
import { MetricRow } from "./MetricRow";

export function Cvss40MetricsGrid({
  metrics,
  onChange,
}: {
  metrics: Cvss40Metrics;
  onChange: <K extends keyof Cvss40Metrics>(key: K, value: Cvss40Metrics[K]) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <MetricRow label="Attack Vector (AV)" options={CVSS40_AV_OPTIONS} value={metrics.AV} onChange={(v) => onChange("AV", v)} />
      <MetricRow label="Attack Complexity (AC)" options={CVSS40_AC_OPTIONS} value={metrics.AC} onChange={(v) => onChange("AC", v)} />
      <MetricRow label="Attack Requirements (AT)" options={CVSS40_AT_OPTIONS} value={metrics.AT} onChange={(v) => onChange("AT", v)} />
      <MetricRow label="Privileges Required (PR)" options={CVSS40_PR_OPTIONS} value={metrics.PR} onChange={(v) => onChange("PR", v)} />
      <MetricRow label="User Interaction (UI)" options={CVSS40_UI_OPTIONS} value={metrics.UI} onChange={(v) => onChange("UI", v)} />
      <MetricRow
        label="Vulnerable System Confidentiality (VC)"
        options={CVSS40_IMPACT_OPTIONS}
        value={metrics.VC}
        onChange={(v) => onChange("VC", v)}
      />
      <MetricRow
        label="Vulnerable System Integrity (VI)"
        options={CVSS40_IMPACT_OPTIONS}
        value={metrics.VI}
        onChange={(v) => onChange("VI", v)}
      />
      <MetricRow
        label="Vulnerable System Availability (VA)"
        options={CVSS40_IMPACT_OPTIONS}
        value={metrics.VA}
        onChange={(v) => onChange("VA", v)}
      />
      <MetricRow
        label="Subsequent System Confidentiality (SC)"
        options={CVSS40_IMPACT_OPTIONS}
        value={metrics.SC}
        onChange={(v) => onChange("SC", v)}
      />
      <MetricRow
        label="Subsequent System Integrity (SI)"
        options={CVSS40_IMPACT_OPTIONS}
        value={metrics.SI}
        onChange={(v) => onChange("SI", v)}
      />
      <MetricRow
        label="Subsequent System Availability (SA)"
        options={CVSS40_IMPACT_OPTIONS}
        value={metrics.SA}
        onChange={(v) => onChange("SA", v)}
      />
      <MetricRow label="Exploit Maturity (E)" options={CVSS40_E_OPTIONS} value={metrics.E} onChange={(v) => onChange("E", v)} />
    </div>
  );
}
