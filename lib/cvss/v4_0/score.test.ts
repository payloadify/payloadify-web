import { describe, expect, it } from "vitest";
import { Cvss40Metrics } from "./metrics";
import { computeCvss40Score } from "./score";

/** All vectors below were pulled directly from the raw HTML of FIRST.org's own published
 *  CVSS v4.0 worked examples (https://www.first.org/cvss/v4.0/examples). Only examples using
 *  solely Base metrics (+ optionally the Threat metric E) are used here, since this tool
 *  doesn't implement Environmental/Supplemental metrics; examples that included CR/IR/AR/
 *  MAV/etc. were excluded as not reproducible without that support.
 *
 *  Two vectors' naively-scraped scores (initially 9.4 and 8.6) didn't match this port's
 *  output. The page's HTML interleaves a "recap" scores table, the vector table, and a
 *  prose score paragraph per example in a way that doesn't always keep a 1:1 line-adjacency
 *  between a vector and its correct score, so a second, stronger check was used: the actual
 *  unmodified upstream reference implementation (cvss_lookup.js/cvss_score.js/max_composed.js/
 *  max_severity.js from https://github.com/FIRSTdotorg/cvss-v4-calculator, fetched directly)
 *  was run in Node against all 9 vectors below. It reproduced 7 of the 9 scraped scores
 *  exactly, and for the 2 disputed vectors it output 9.3 and 7.0 — matching this port, not
 *  the naive scrape. The expected values below use those upstream-verified numbers. */
describe("computeCvss40Score against FIRST.org's published examples", () => {
  const cases: { vector: Omit<Cvss40Metrics, "E"> & { E?: Cvss40Metrics["E"] }; expected: number }[] = [
    { vector: { AV: "L", AC: "L", AT: "P", PR: "L", UI: "N", VC: "H", VI: "H", VA: "H", SC: "N", SI: "N", SA: "N" }, expected: 7.3 },
    { vector: { AV: "N", AC: "L", AT: "N", PR: "N", UI: "A", VC: "N", VI: "N", VA: "N", SC: "L", SI: "L", SA: "N" }, expected: 5.1 },
    { vector: { AV: "N", AC: "L", AT: "N", PR: "N", UI: "N", VC: "N", VI: "N", VA: "N", SC: "L", SI: "L", SA: "N" }, expected: 6.9 },
    { vector: { AV: "L", AC: "L", AT: "N", PR: "N", UI: "N", VC: "H", VI: "H", VA: "H", SC: "H", SI: "H", SA: "H" }, expected: 9.4 },
    // Upstream-verified 9.3 (see note above) — the scraped page paired this vector with 9.4.
    { vector: { AV: "N", AC: "L", AT: "N", PR: "N", UI: "N", VC: "N", VI: "H", VA: "N", SC: "H", SI: "H", SA: "H" }, expected: 9.3 },
    { vector: { AV: "N", AC: "L", AT: "N", PR: "N", UI: "N", VC: "H", VI: "H", VA: "H", SC: "H", SI: "H", SA: "H", E: "A" }, expected: 10.0 },
    { vector: { AV: "N", AC: "H", AT: "P", PR: "N", UI: "N", VC: "H", VI: "H", VA: "H", SC: "N", SI: "N", SA: "N", E: "P" }, expected: 8.2 },
    // Upstream-verified 7.0 (see note above) — the scraped page paired this vector with 8.6.
    { vector: { AV: "P", AC: "L", AT: "N", PR: "N", UI: "N", VC: "H", VI: "H", VA: "H", SC: "N", SI: "N", SA: "N" }, expected: 7.0 },
    { vector: { AV: "A", AC: "L", AT: "N", PR: "N", UI: "N", VC: "N", VI: "L", VA: "N", SC: "H", SI: "N", SA: "H" }, expected: 6.4 },
  ];

  for (const { vector, expected } of cases) {
    const m: Cvss40Metrics = { E: "X", ...vector };
    it(`scores CVSS:4.0/AV:${m.AV}/AC:${m.AC}/AT:${m.AT}/PR:${m.PR}/UI:${m.UI}/VC:${m.VC}/VI:${m.VI}/VA:${m.VA}/SC:${m.SC}/SI:${m.SI}/SA:${m.SA}${m.E !== "X" ? `/E:${m.E}` : ""} as ${expected}`, () => {
      expect(computeCvss40Score(m).baseScore).toBe(expected);
    });
  }
});

describe("computeCvss40Score edge cases", () => {
  it("scores an all-None impact vector as 0.0 None regardless of exploitability metrics", () => {
    const m: Cvss40Metrics = { AV: "N", AC: "L", AT: "N", PR: "N", UI: "N", VC: "N", VI: "N", VA: "N", SC: "N", SI: "N", SA: "N", E: "X" };
    const result = computeCvss40Score(m);
    expect(result.baseScore).toBe(0);
    expect(result.severity).toBe("None");
  });

  it("treats E:X (Not Defined) identically to explicit E:A (worst case)", () => {
    const base: Cvss40Metrics = { AV: "N", AC: "L", AT: "N", PR: "N", UI: "N", VC: "H", VI: "H", VA: "H", SC: "N", SI: "N", SA: "N", E: "X" };
    const explicitA: Cvss40Metrics = { ...base, E: "A" };
    expect(computeCvss40Score(base).baseScore).toBe(computeCvss40Score(explicitA).baseScore);
  });

  it("never returns a score outside [0, 10]", () => {
    const m: Cvss40Metrics = { AV: "N", AC: "L", AT: "N", PR: "N", UI: "N", VC: "H", VI: "H", VA: "H", SC: "H", SI: "H", SA: "H", E: "A" };
    const result = computeCvss40Score(m);
    expect(result.baseScore).toBeGreaterThanOrEqual(0);
    expect(result.baseScore).toBeLessThanOrEqual(10);
  });
});
