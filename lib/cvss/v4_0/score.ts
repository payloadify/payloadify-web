import { severityRating } from "../shared/severityRating";
import { SeverityRating } from "../shared/types";
import {
  computeEQ1,
  computeEQ2,
  computeEQ3,
  computeEQ4,
  computeEQ5,
  computeEQ6,
  computeMacroVector,
} from "./equivalenceClasses";
import { CVSS4_LOOKUP } from "./lookupTable";
import { Cvss40Metrics } from "./metrics";

/**
 * Ported from max_composed.js in the official CVSS v4.0 reference implementation:
 * https://github.com/FIRSTdotorg/cvss-v4-calculator/blob/main/max_composed.js
 * Copyright FIRST, Red Hat, and contributors — SPDX-License-Identifier: BSD-2-Clause
 *
 * For each equivalence class value, the representative "highest severity" vector
 * fragment(s) within that class — used to measure how far a scored vector is from the
 * top of its MacroVector's severity range.
 */
const MAX_COMPOSED = {
  eq1: {
    0: ["AV:N/PR:N/UI:N/"],
    1: ["AV:A/PR:N/UI:N/", "AV:N/PR:L/UI:N/", "AV:N/PR:N/UI:P/"],
    2: ["AV:P/PR:N/UI:N/", "AV:A/PR:L/UI:P/"],
  } as Record<number, string[]>,
  eq2: {
    0: ["AC:L/AT:N/"],
    1: ["AC:H/AT:N/", "AC:L/AT:P/"],
  } as Record<number, string[]>,
  eq3: {
    0: { 0: ["VC:H/VI:H/VA:H/CR:H/IR:H/AR:H/"], 1: ["VC:H/VI:H/VA:L/CR:M/IR:M/AR:H/", "VC:H/VI:H/VA:H/CR:M/IR:M/AR:M/"] },
    1: {
      0: ["VC:L/VI:H/VA:H/CR:H/IR:H/AR:H/", "VC:H/VI:L/VA:H/CR:H/IR:H/AR:H/"],
      1: [
        "VC:L/VI:H/VA:L/CR:H/IR:M/AR:H/",
        "VC:L/VI:H/VA:H/CR:H/IR:M/AR:M/",
        "VC:H/VI:L/VA:H/CR:M/IR:H/AR:M/",
        "VC:H/VI:L/VA:L/CR:M/IR:H/AR:H/",
        "VC:L/VI:L/VA:H/CR:H/IR:H/AR:M/",
      ],
    },
    2: { 1: ["VC:L/VI:L/VA:L/CR:H/IR:H/AR:H/"] },
  } as Record<number, Record<number, string[]>>,
  eq4: {
    0: ["SC:H/SI:S/SA:S/"],
    1: ["SC:H/SI:H/SA:H/"],
    2: ["SC:L/SI:L/SA:L/"],
  } as Record<number, string[]>,
  eq5: {
    0: ["E:A/"],
    1: ["E:P/"],
    2: ["E:U/"],
  } as Record<number, string[]>,
};

/**
 * Ported from max_severity.js in the official CVSS v4.0 reference implementation:
 * https://github.com/FIRSTdotorg/cvss-v4-calculator/blob/main/max_severity.js
 * Copyright FIRST, Red Hat, and contributors — SPDX-License-Identifier: BSD-2-Clause
 *
 * Maximal scoring difference (in units of 0.1) available within each equivalence class.
 */
const MAX_SEVERITY = {
  eq1: { 0: 1, 1: 4, 2: 5 } as Record<number, number>,
  eq2: { 0: 1, 1: 2 } as Record<number, number>,
  eq3eq6: {
    0: { 0: 7, 1: 6 },
    1: { 0: 8, 1: 8 },
    2: { 1: 10 },
  } as Record<number, Record<number, number>>,
  eq4: { 0: 6, 1: 5, 2: 4 } as Record<number, number>,
  eq5: { 0: 1, 1: 1, 2: 1 } as Record<number, number>,
};

const AV_LEVELS: Record<string, number> = { N: 0.0, A: 0.1, L: 0.2, P: 0.3 };
const PR_LEVELS: Record<string, number> = { N: 0.0, L: 0.1, H: 0.2 };
const UI_LEVELS: Record<string, number> = { N: 0.0, P: 0.1, A: 0.2 };
const AC_LEVELS: Record<string, number> = { L: 0.0, H: 0.1 };
const AT_LEVELS: Record<string, number> = { N: 0.0, P: 0.1 };
const VC_LEVELS: Record<string, number> = { H: 0.0, L: 0.1, N: 0.2 };
const VI_LEVELS: Record<string, number> = { H: 0.0, L: 0.1, N: 0.2 };
const VA_LEVELS: Record<string, number> = { H: 0.0, L: 0.1, N: 0.2 };
const SC_LEVELS: Record<string, number> = { H: 0.1, L: 0.2, N: 0.3 };
const SI_LEVELS: Record<string, number> = { S: 0.0, H: 0.1, L: 0.2, N: 0.3 };
const SA_LEVELS: Record<string, number> = { S: 0.0, H: 0.1, L: 0.2, N: 0.3 };
const CR_LEVELS: Record<string, number> = { H: 0.0, M: 0.1, L: 0.2 };
const IR_LEVELS: Record<string, number> = { H: 0.0, M: 0.1, L: 0.2 };
const AR_LEVELS: Record<string, number> = { H: 0.0, M: 0.1, L: 0.2 };

/** CR/IR/AR are not exposed in this tool's UI — always resolved to "H" (see equivalenceClasses.ts). */
const CR_RESOLVED = "H";
const IR_RESOLVED = "H";
const AR_RESOLVED = "H";

/** Extracts a metric's value out of a maxComposed representative fragment like "AV:N/PR:N/UI:N/". */
function extractValueMetric(metric: string, fragment: string): string {
  const from = fragment.indexOf(metric) + metric.length + 1;
  const rest = fragment.slice(from);
  const slashIndex = rest.indexOf("/");
  return slashIndex > 0 ? rest.slice(0, slashIndex) : rest;
}

function getEQMaxes(macroVector: string, eq: 1 | 2 | 4 | 5): string[] {
  return MAX_COMPOSED[`eq${eq}` as "eq1" | "eq2" | "eq4" | "eq5"][Number(macroVector[eq - 1])];
}

export interface Cvss40Score {
  baseScore: number;
  severity: SeverityRating;
}

export function computeCvss40Score(m: Cvss40Metrics): Cvss40Score {
  // Exception for no impact on the system at all (shortcut) — mirrors the official
  // algorithm's early-return for an all-None impact vector.
  if (m.VC === "N" && m.VI === "N" && m.VA === "N" && m.SC === "N" && m.SI === "N" && m.SA === "N") {
    return { baseScore: 0, severity: severityRating(0) };
  }

  const macroVector = computeMacroVector(m);
  const value = CVSS4_LOOKUP[macroVector];

  const eq1 = computeEQ1(m);
  const eq2 = computeEQ2(m);
  const eq3 = computeEQ3(m);
  const eq4 = computeEQ4(m);
  const eq5 = computeEQ5(m);
  const eq6 = computeEQ6(m);

  const eq1NextLowerMacro = `${eq1 + 1}${eq2}${eq3}${eq4}${eq5}${eq6}`;
  const eq2NextLowerMacro = `${eq1}${eq2 + 1}${eq3}${eq4}${eq5}${eq6}`;

  let eq3eq6NextLowerMacro: string | undefined;
  let eq3eq6NextLowerMacroLeft: string | undefined;
  let eq3eq6NextLowerMacroRight: string | undefined;
  if (eq3 === 1 && eq6 === 1) {
    eq3eq6NextLowerMacro = `${eq1}${eq2}${eq3 + 1}${eq4}${eq5}${eq6}`;
  } else if (eq3 === 0 && eq6 === 1) {
    eq3eq6NextLowerMacro = `${eq1}${eq2}${eq3 + 1}${eq4}${eq5}${eq6}`;
  } else if (eq3 === 1 && eq6 === 0) {
    eq3eq6NextLowerMacro = `${eq1}${eq2}${eq3}${eq4}${eq5}${eq6 + 1}`;
  } else if (eq3 === 0 && eq6 === 0) {
    eq3eq6NextLowerMacroLeft = `${eq1}${eq2}${eq3}${eq4}${eq5}${eq6 + 1}`;
    eq3eq6NextLowerMacroRight = `${eq1}${eq2}${eq3 + 1}${eq4}${eq5}${eq6}`;
  } else {
    eq3eq6NextLowerMacro = `${eq1}${eq2}${eq3 + 1}${eq4}${eq5}${eq6 + 1}`;
  }

  const eq4NextLowerMacro = `${eq1}${eq2}${eq3}${eq4 + 1}${eq5}${eq6}`;
  const eq5NextLowerMacro = `${eq1}${eq2}${eq3}${eq4}${eq5 + 1}${eq6}`;

  const scoreEq1NextLowerMacro = CVSS4_LOOKUP[eq1NextLowerMacro];
  const scoreEq2NextLowerMacro = CVSS4_LOOKUP[eq2NextLowerMacro];

  let scoreEq3eq6NextLowerMacro: number | undefined;
  if (eq3 === 0 && eq6 === 0) {
    const left = CVSS4_LOOKUP[eq3eq6NextLowerMacroLeft!];
    const right = CVSS4_LOOKUP[eq3eq6NextLowerMacroRight!];
    scoreEq3eq6NextLowerMacro = (left ?? -Infinity) > (right ?? -Infinity) ? left : right;
  } else {
    scoreEq3eq6NextLowerMacro = CVSS4_LOOKUP[eq3eq6NextLowerMacro!];
  }

  const scoreEq4NextLowerMacro = CVSS4_LOOKUP[eq4NextLowerMacro];
  const scoreEq5NextLowerMacro = CVSS4_LOOKUP[eq5NextLowerMacro];

  const eq1Maxes = getEQMaxes(macroVector, 1);
  const eq2Maxes = getEQMaxes(macroVector, 2);
  const eq3Eq6Maxes = MAX_COMPOSED.eq3[Number(macroVector[2])][Number(macroVector[5])];
  const eq4Maxes = getEQMaxes(macroVector, 4);
  const eq5Maxes = getEQMaxes(macroVector, 5);

  const maxVectors: string[] = [];
  for (const eq1Max of eq1Maxes) {
    for (const eq2Max of eq2Maxes) {
      for (const eq3Eq6Max of eq3Eq6Maxes) {
        for (const eq4Max of eq4Maxes) {
          for (const eq5Max of eq5Maxes) {
            maxVectors.push(eq1Max + eq2Max + eq3Eq6Max + eq4Max + eq5Max);
          }
        }
      }
    }
  }

  let severityDistanceAV = 0;
  let severityDistancePR = 0;
  let severityDistanceUI = 0;
  let severityDistanceAC = 0;
  let severityDistanceAT = 0;
  let severityDistanceVC = 0;
  let severityDistanceVI = 0;
  let severityDistanceVA = 0;
  let severityDistanceSC = 0;
  let severityDistanceSI = 0;
  let severityDistanceSA = 0;
  let severityDistanceCR = 0;
  let severityDistanceIR = 0;
  let severityDistanceAR = 0;

  for (const maxVector of maxVectors) {
    severityDistanceAV = AV_LEVELS[m.AV] - AV_LEVELS[extractValueMetric("AV", maxVector)];
    severityDistancePR = PR_LEVELS[m.PR] - PR_LEVELS[extractValueMetric("PR", maxVector)];
    severityDistanceUI = UI_LEVELS[m.UI] - UI_LEVELS[extractValueMetric("UI", maxVector)];
    severityDistanceAC = AC_LEVELS[m.AC] - AC_LEVELS[extractValueMetric("AC", maxVector)];
    severityDistanceAT = AT_LEVELS[m.AT] - AT_LEVELS[extractValueMetric("AT", maxVector)];
    severityDistanceVC = VC_LEVELS[m.VC] - VC_LEVELS[extractValueMetric("VC", maxVector)];
    severityDistanceVI = VI_LEVELS[m.VI] - VI_LEVELS[extractValueMetric("VI", maxVector)];
    severityDistanceVA = VA_LEVELS[m.VA] - VA_LEVELS[extractValueMetric("VA", maxVector)];
    severityDistanceSC = SC_LEVELS[m.SC] - SC_LEVELS[extractValueMetric("SC", maxVector)];
    severityDistanceSI = SI_LEVELS[m.SI] - SI_LEVELS[extractValueMetric("SI", maxVector)];
    severityDistanceSA = SA_LEVELS[m.SA] - SA_LEVELS[extractValueMetric("SA", maxVector)];
    severityDistanceCR = CR_LEVELS[CR_RESOLVED] - CR_LEVELS[extractValueMetric("CR", maxVector)];
    severityDistanceIR = IR_LEVELS[IR_RESOLVED] - IR_LEVELS[extractValueMetric("IR", maxVector)];
    severityDistanceAR = AR_LEVELS[AR_RESOLVED] - AR_LEVELS[extractValueMetric("AR", maxVector)];

    const anyNegative = [
      severityDistanceAV,
      severityDistancePR,
      severityDistanceUI,
      severityDistanceAC,
      severityDistanceAT,
      severityDistanceVC,
      severityDistanceVI,
      severityDistanceVA,
      severityDistanceSC,
      severityDistanceSI,
      severityDistanceSA,
      severityDistanceCR,
      severityDistanceIR,
      severityDistanceAR,
    ].some((d) => d < 0);
    if (anyNegative) continue;
    break;
  }

  const currentSeverityDistanceEq1 = severityDistanceAV + severityDistancePR + severityDistanceUI;
  const currentSeverityDistanceEq2 = severityDistanceAC + severityDistanceAT;
  const currentSeverityDistanceEq3Eq6 =
    severityDistanceVC + severityDistanceVI + severityDistanceVA + severityDistanceCR + severityDistanceIR + severityDistanceAR;
  const currentSeverityDistanceEq4 = severityDistanceSC + severityDistanceSI + severityDistanceSA;

  const step = 0.1;

  const availableDistanceEq1 = value - scoreEq1NextLowerMacro;
  const availableDistanceEq2 = value - scoreEq2NextLowerMacro;
  const availableDistanceEq3Eq6 = value - scoreEq3eq6NextLowerMacro!;
  const availableDistanceEq4 = value - scoreEq4NextLowerMacro;
  const availableDistanceEq5 = value - scoreEq5NextLowerMacro;

  let nExistingLower = 0;
  let normalizedSeverityEq1 = 0;
  let normalizedSeverityEq2 = 0;
  let normalizedSeverityEq3Eq6 = 0;
  let normalizedSeverityEq4 = 0;
  let normalizedSeverityEq5 = 0;

  const maxSeverityEq1 = MAX_SEVERITY.eq1[eq1] * step;
  const maxSeverityEq2 = MAX_SEVERITY.eq2[eq2] * step;
  const maxSeverityEq3Eq6 = MAX_SEVERITY.eq3eq6[eq3][eq6] * step;
  const maxSeverityEq4 = MAX_SEVERITY.eq4[eq4] * step;

  if (!Number.isNaN(availableDistanceEq1)) {
    nExistingLower += 1;
    normalizedSeverityEq1 = availableDistanceEq1 * (currentSeverityDistanceEq1 / maxSeverityEq1);
  }
  if (!Number.isNaN(availableDistanceEq2)) {
    nExistingLower += 1;
    normalizedSeverityEq2 = availableDistanceEq2 * (currentSeverityDistanceEq2 / maxSeverityEq2);
  }
  if (!Number.isNaN(availableDistanceEq3Eq6)) {
    nExistingLower += 1;
    normalizedSeverityEq3Eq6 = availableDistanceEq3Eq6 * (currentSeverityDistanceEq3Eq6 / maxSeverityEq3Eq6);
  }
  if (!Number.isNaN(availableDistanceEq4)) {
    nExistingLower += 1;
    normalizedSeverityEq4 = availableDistanceEq4 * (currentSeverityDistanceEq4 / maxSeverityEq4);
  }
  if (!Number.isNaN(availableDistanceEq5)) {
    // EQ5's percentage-to-next-severity is always 0 per the official algorithm — Exploit
    // Maturity has no "distance within the class", only presence/absence of a lower macro.
    nExistingLower += 1;
    normalizedSeverityEq5 = availableDistanceEq5 * 0;
  }

  const meanDistance =
    nExistingLower === 0
      ? 0
      : (normalizedSeverityEq1 + normalizedSeverityEq2 + normalizedSeverityEq3Eq6 + normalizedSeverityEq4 + normalizedSeverityEq5) /
        nExistingLower;

  let finalValue = value - meanDistance;
  if (finalValue < 0) finalValue = 0;
  if (finalValue > 10) finalValue = 10;
  const baseScore = Math.round(finalValue * 10) / 10;

  return { baseScore, severity: severityRating(baseScore) };
}
