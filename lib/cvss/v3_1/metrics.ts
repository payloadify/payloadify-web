export type Cvss31AttackVector = "N" | "A" | "L" | "P";
export type Cvss31AttackComplexity = "L" | "H";
export type Cvss31PrivilegesRequired = "N" | "L" | "H";
export type Cvss31UserInteraction = "N" | "R";
export type Cvss31Scope = "U" | "C";
export type Cvss31Impact = "N" | "L" | "H";

export interface Cvss31Metrics {
  AV: Cvss31AttackVector;
  AC: Cvss31AttackComplexity;
  PR: Cvss31PrivilegesRequired;
  UI: Cvss31UserInteraction;
  S: Cvss31Scope;
  C: Cvss31Impact;
  I: Cvss31Impact;
  A: Cvss31Impact;
}

export interface Cvss31MetricOption<T extends string> {
  id: T;
  label: string;
}

export const CVSS31_AV_OPTIONS: Cvss31MetricOption<Cvss31AttackVector>[] = [
  { id: "N", label: "Network" },
  { id: "A", label: "Adjacent" },
  { id: "L", label: "Local" },
  { id: "P", label: "Physical" },
];

export const CVSS31_AC_OPTIONS: Cvss31MetricOption<Cvss31AttackComplexity>[] = [
  { id: "L", label: "Low" },
  { id: "H", label: "High" },
];

export const CVSS31_PR_OPTIONS: Cvss31MetricOption<Cvss31PrivilegesRequired>[] = [
  { id: "N", label: "None" },
  { id: "L", label: "Low" },
  { id: "H", label: "High" },
];

export const CVSS31_UI_OPTIONS: Cvss31MetricOption<Cvss31UserInteraction>[] = [
  { id: "N", label: "None" },
  { id: "R", label: "Required" },
];

export const CVSS31_S_OPTIONS: Cvss31MetricOption<Cvss31Scope>[] = [
  { id: "U", label: "Unchanged" },
  { id: "C", label: "Changed" },
];

export const CVSS31_CIA_OPTIONS: Cvss31MetricOption<Cvss31Impact>[] = [
  { id: "N", label: "None" },
  { id: "L", label: "Low" },
  { id: "H", label: "High" },
];

export const CVSS31_DEFAULT_METRICS: Cvss31Metrics = {
  AV: "N",
  AC: "L",
  PR: "N",
  UI: "N",
  S: "U",
  C: "N",
  I: "N",
  A: "N",
};
