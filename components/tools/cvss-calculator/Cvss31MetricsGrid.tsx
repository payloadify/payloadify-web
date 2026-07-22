"use client";

import {
  CVSS31_AC_OPTIONS,
  CVSS31_AV_OPTIONS,
  CVSS31_CIA_OPTIONS,
  CVSS31_PR_OPTIONS,
  CVSS31_S_OPTIONS,
  CVSS31_UI_OPTIONS,
  Cvss31Metrics,
} from "@payloadify/cvss-core";
import { MetricRow } from "./MetricRow";

export function Cvss31MetricsGrid({
  metrics,
  onChange,
}: {
  metrics: Cvss31Metrics;
  onChange: <K extends keyof Cvss31Metrics>(key: K, value: Cvss31Metrics[K]) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <MetricRow label="Attack Vector (AV)" options={CVSS31_AV_OPTIONS} value={metrics.AV} onChange={(v) => onChange("AV", v)} />
      <MetricRow label="Attack Complexity (AC)" options={CVSS31_AC_OPTIONS} value={metrics.AC} onChange={(v) => onChange("AC", v)} />
      <MetricRow label="Privileges Required (PR)" options={CVSS31_PR_OPTIONS} value={metrics.PR} onChange={(v) => onChange("PR", v)} />
      <MetricRow label="User Interaction (UI)" options={CVSS31_UI_OPTIONS} value={metrics.UI} onChange={(v) => onChange("UI", v)} />
      <MetricRow label="Scope (S)" options={CVSS31_S_OPTIONS} value={metrics.S} onChange={(v) => onChange("S", v)} />
      <MetricRow label="Confidentiality (C)" options={CVSS31_CIA_OPTIONS} value={metrics.C} onChange={(v) => onChange("C", v)} />
      <MetricRow label="Integrity (I)" options={CVSS31_CIA_OPTIONS} value={metrics.I} onChange={(v) => onChange("I", v)} />
      <MetricRow label="Availability (A)" options={CVSS31_CIA_OPTIONS} value={metrics.A} onChange={(v) => onChange("A", v)} />
    </div>
  );
}
