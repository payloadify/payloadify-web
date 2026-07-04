import { severityRating } from "../shared/severityRating";
import { SeverityRating } from "../shared/types";
import { Cvss31Metrics } from "./metrics";

/** Numeric metric weights from the CVSS v3.1 specification, Section 7 (Base Metrics equations). */
const AV_WEIGHT: Record<Cvss31Metrics["AV"], number> = { N: 0.85, A: 0.62, L: 0.55, P: 0.2 };
const AC_WEIGHT: Record<Cvss31Metrics["AC"], number> = { L: 0.77, H: 0.44 };
const UI_WEIGHT: Record<Cvss31Metrics["UI"], number> = { N: 0.85, R: 0.62 };
const CIA_WEIGHT: Record<Cvss31Metrics["C"], number> = { N: 0, L: 0.22, H: 0.56 };

/** Privileges Required weight depends on Scope — this is the most common mistake in hand-rolled
 *  CVSS 3.1 implementations. PR:N is 0.85 regardless of scope; PR:L and PR:H both increase when
 *  Scope is Changed, reflecting that gaining privileges is "worth more" when it can affect a
 *  different security authority. */
const PR_WEIGHT: Record<Cvss31Metrics["S"], Record<Cvss31Metrics["PR"], number>> = {
  U: { N: 0.85, L: 0.62, H: 0.27 },
  C: { N: 0.85, L: 0.68, H: 0.5 },
};

/** FIRST.org's exact integer-arithmetic Roundup algorithm (spec Appendix A). Deliberately does
 *  NOT use `Math.ceil(x * 10) / 10` — plain floating-point rounding can misfire on values like
 *  4.0000000000000001 that arise naturally from the formula's floating point arithmetic, which
 *  would silently produce a score 0.1 too high. */
export function roundUp(input: number): number {
  const intInput = Math.round(input * 100000);
  if (intInput % 10000 === 0) {
    return intInput / 100000;
  }
  return (Math.floor(intInput / 10000) + 1) / 10;
}

export function impactSubScoreBase(m: Cvss31Metrics): number {
  const c = 1 - CIA_WEIGHT[m.C];
  const i = 1 - CIA_WEIGHT[m.I];
  const a = 1 - CIA_WEIGHT[m.A];
  return 1 - c * i * a;
}

export function impact(m: Cvss31Metrics): number {
  const iscBase = impactSubScoreBase(m);
  if (m.S === "U") {
    return 6.42 * iscBase;
  }
  return 7.52 * (iscBase - 0.029) - 3.25 * Math.pow(iscBase - 0.02, 15);
}

export function exploitability(m: Cvss31Metrics): number {
  return 8.22 * AV_WEIGHT[m.AV] * AC_WEIGHT[m.AC] * PR_WEIGHT[m.S][m.PR] * UI_WEIGHT[m.UI];
}

export interface Cvss31Score {
  baseScore: number;
  severity: SeverityRating;
}

export function computeCvss31Score(m: Cvss31Metrics): Cvss31Score {
  const impactScore = impact(m);
  if (impactScore <= 0) {
    return { baseScore: 0, severity: severityRating(0) };
  }

  const exploitabilityScore = exploitability(m);
  const baseScore =
    m.S === "U"
      ? roundUp(Math.min(impactScore + exploitabilityScore, 10))
      : roundUp(Math.min(1.08 * (impactScore + exploitabilityScore), 10));

  return { baseScore, severity: severityRating(baseScore) };
}
