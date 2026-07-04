export type Cvss40AttackVector = "N" | "A" | "L" | "P";
export type Cvss40AttackComplexity = "L" | "H";
export type Cvss40AttackRequirements = "N" | "P";
export type Cvss40PrivilegesRequired = "N" | "L" | "H";
export type Cvss40UserInteraction = "N" | "P" | "A";
export type Cvss40Impact = "H" | "L" | "N";
/** Exploit Maturity — X (Not Defined) is treated as "A" (Attacked, worst case) during scoring. */
export type Cvss40ExploitMaturity = "X" | "A" | "P" | "U";

export interface Cvss40Metrics {
  AV: Cvss40AttackVector;
  AC: Cvss40AttackComplexity;
  AT: Cvss40AttackRequirements;
  PR: Cvss40PrivilegesRequired;
  UI: Cvss40UserInteraction;
  VC: Cvss40Impact;
  VI: Cvss40Impact;
  VA: Cvss40Impact;
  SC: Cvss40Impact;
  SI: Cvss40Impact;
  SA: Cvss40Impact;
  E: Cvss40ExploitMaturity;
}

export interface Cvss40MetricOption<T extends string> {
  id: T;
  label: string;
}

export const CVSS40_AV_OPTIONS: Cvss40MetricOption<Cvss40AttackVector>[] = [
  { id: "N", label: "Network" },
  { id: "A", label: "Adjacent" },
  { id: "L", label: "Local" },
  { id: "P", label: "Physical" },
];

export const CVSS40_AC_OPTIONS: Cvss40MetricOption<Cvss40AttackComplexity>[] = [
  { id: "L", label: "Low" },
  { id: "H", label: "High" },
];

export const CVSS40_AT_OPTIONS: Cvss40MetricOption<Cvss40AttackRequirements>[] = [
  { id: "N", label: "None" },
  { id: "P", label: "Present" },
];

export const CVSS40_PR_OPTIONS: Cvss40MetricOption<Cvss40PrivilegesRequired>[] = [
  { id: "N", label: "None" },
  { id: "L", label: "Low" },
  { id: "H", label: "High" },
];

export const CVSS40_UI_OPTIONS: Cvss40MetricOption<Cvss40UserInteraction>[] = [
  { id: "N", label: "None" },
  { id: "P", label: "Passive" },
  { id: "A", label: "Active" },
];

/** Shared by VC/VI/VA/SC/SI/SA — all six impact metrics use the same H/L/N option set. */
export const CVSS40_IMPACT_OPTIONS: Cvss40MetricOption<Cvss40Impact>[] = [
  { id: "H", label: "High" },
  { id: "L", label: "Low" },
  { id: "N", label: "None" },
];

export const CVSS40_E_OPTIONS: Cvss40MetricOption<Cvss40ExploitMaturity>[] = [
  { id: "X", label: "Not Defined" },
  { id: "A", label: "Attacked" },
  { id: "P", label: "Proof-of-Concept" },
  { id: "U", label: "Unreported" },
];

export const CVSS40_DEFAULT_METRICS: Cvss40Metrics = {
  AV: "N",
  AC: "L",
  AT: "N",
  PR: "N",
  UI: "N",
  VC: "N",
  VI: "N",
  VA: "N",
  SC: "N",
  SI: "N",
  SA: "N",
  E: "X",
};
