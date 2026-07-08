import { Cvss40Metrics } from "./metrics";

/**
 * Ported from macroVector() in the official CVSS v4.0 reference implementation:
 * https://github.com/FIRSTdotorg/cvss-v4-calculator/blob/main/cvss_score.js
 * Copyright FIRST, Red Hat, and contributors — SPDX-License-Identifier: BSD-2-Clause
 *
 * The official algorithm resolves each metric through a helper (`m()`) that substitutes
 * "Not Defined" (X) values before deriving the six equivalence classes:
 *   - E:X defaults to "A" (Attacked — worst case).
 *   - CR:X, IR:X, AR:X (Environmental Requirements) all default to "H" (High).
 *   - MSI:X, MSA:X (Modified Subsequent Integrity/Availability) fall through to the plain
 *     SI/SA values unless explicitly set to "S" (Safety).
 * This tool doesn't expose Environmental metrics in the UI (see project plan), so CR/IR/AR
 * are always "H" and MSI/MSA are never "S" here — but the resolution logic below is kept
 * explicit (not simplified away) so it stays auditable against the upstream source and so
 * a future Environmental-metrics UI addition only has to wire in real values, not rewrite
 * this module.
 */

/** E:X (Not Defined) is scored as the worst case, E:A (Attacked). */
function resolveE(m: Cvss40Metrics): "A" | "P" | "U" {
  return m.E === "X" ? "A" : m.E;
}

/** CR/IR/AR (Environmental Requirements) are not exposed in this tool's UI — always "Not
 *  Defined", which the official algorithm resolves to "H" (High). */
const CR_RESOLVED = "H";
const IR_RESOLVED = "H";
const AR_RESOLVED = "H";

/** MSI/MSA (Modified Subsequent Integrity/Availability) are not exposed in this tool's UI —
 *  always "Not Defined", which never equals "S" (Safety), so they never force EQ4 to 0. */
const MSI_IS_SAFETY = false;
const MSA_IS_SAFETY = false;

/** EQ1: attack surface (Attack Vector, Privileges Required, User Interaction). */
export function computeEQ1(m: Cvss40Metrics): 0 | 1 | 2 {
  const { AV, PR, UI } = m;
  if (AV === "N" && PR === "N" && UI === "N") return 0;
  if ((AV === "N" || PR === "N" || UI === "N") && !(AV === "N" && PR === "N" && UI === "N") && AV !== "P") return 1;
  return 2;
}

/** EQ2: complexity of reaching the vulnerable component (Attack Complexity, Attack Requirements). */
export function computeEQ2(m: Cvss40Metrics): 0 | 1 {
  return m.AC === "L" && m.AT === "N" ? 0 : 1;
}

/** EQ3: Vulnerable System impact (Confidentiality/Integrity/Availability). */
export function computeEQ3(m: Cvss40Metrics): 0 | 1 | 2 {
  const { VC, VI, VA } = m;
  if (VC === "H" && VI === "H") return 0;
  if (!(VC === "H" && VI === "H") && (VC === "H" || VI === "H" || VA === "H")) return 1;
  return 2;
}

/** EQ4: Subsequent System impact (Confidentiality/Integrity/Availability), gated by whether
 *  a Safety impact was declared via the (unexposed) Modified Subsequent Integrity/Availability
 *  metrics. */
export function computeEQ4(m: Cvss40Metrics): 0 | 1 | 2 {
  if (MSI_IS_SAFETY || MSA_IS_SAFETY) return 0;
  const { SC, SI, SA } = m;
  return SC === "H" || SI === "H" || SA === "H" ? 1 : 2;
}

/** EQ5: Exploit Maturity (Threat metric). */
export function computeEQ5(m: Cvss40Metrics): 0 | 1 | 2 {
  const e = resolveE(m);
  if (e === "A") return 0;
  if (e === "P") return 1;
  return 2;
}

/** EQ6: whether a High Vulnerable-System impact metric aligns with a High (unexposed)
 *  Environmental Requirement — since CR/IR/AR always resolve to "H" here, this reduces to
 *  "any of VC/VI/VA is High", which is the conservative (no environmental override) default. */
export function computeEQ6(m: Cvss40Metrics): 0 | 1 {
  const { VC, VI, VA } = m;
  const aligned = (CR_RESOLVED === "H" && VC === "H") || (IR_RESOLVED === "H" && VI === "H") || (AR_RESOLVED === "H" && VA === "H");
  return aligned ? 0 : 1;
}

/** Concatenates EQ1-EQ6 into the 6-digit MacroVector key used by CVSS4_LOOKUP. */
export function computeMacroVector(m: Cvss40Metrics): string {
  return `${computeEQ1(m)}${computeEQ2(m)}${computeEQ3(m)}${computeEQ4(m)}${computeEQ5(m)}${computeEQ6(m)}`;
}
