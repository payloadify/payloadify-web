import { describe, expect, it } from "vitest";
import { SubdomainGeneratorConfig } from "./config";
import { estimateCandidateCount } from "./estimate";
import { generateSubdomainCandidates } from "./generate";

function baseConfig(overrides: Partial<SubdomainGeneratorConfig>): SubdomainGeneratorConfig {
  return {
    baseDomain: "example.com",
    keywords: [],
    seedLabels: [],
    wordlistSize: "compact",
    useEnvTierWords: false,
    useServiceWords: false,
    useRegionWords: false,
    includeStandalone: false,
    includeAffixing: false,
    includeNumbering: false,
    numberingMin: 1,
    numberingMax: 5,
    numberingZeroPadded: false,
    includeWordJoining: false,
    separators: ["-"],
    sortMode: "alpha",
    maxOutput: 10_000,
    ...overrides,
  };
}

describe("estimateCandidateCount", () => {
  it("standalone is exact: one candidate per pool word", () => {
    const config = baseConfig({ keywords: ["api", "dev", "vpn"], includeStandalone: true });
    const estimate = estimateCandidateCount(config);
    expect(estimate.breakdown.standalone).toBe(3);
    expect(estimate.approxTotal).toBe(generateSubdomainCandidates(config).candidates.length);
  });

  it("numbering is exact when the pool has no collisions", () => {
    const config = baseConfig({ keywords: ["api"], includeNumbering: true, numberingMin: 1, numberingMax: 5 });
    const estimate = estimateCandidateCount(config);
    expect(estimate.breakdown.numbering).toBe(5);
    expect(estimate.approxTotal).toBe(generateSubdomainCandidates(config).candidates.length);
  });

  it("word-joining is exact for a small collision-free pool", () => {
    const config = baseConfig({ keywords: ["api", "dev", "admin"], includeWordJoining: true });
    const estimate = estimateCandidateCount(config);
    // 3 user words, ordered pairs excluding self = 3*2 = 6
    expect(estimate.breakdown.wordJoining).toBe(6);
    expect(estimate.approxTotal).toBe(generateSubdomainCandidates(config).candidates.length);
  });

  it("affixing formula matches the documented worked example", () => {
    // compact env (12) + compact service (15) = 27 words, 12 of them modifiers, 2 separators.
    const config = baseConfig({
      useEnvTierWords: true,
      useServiceWords: true,
      includeStandalone: true,
      includeAffixing: true,
      separators: ["-", "."],
    });
    const estimate = estimateCandidateCount(config);
    expect(estimate.breakdown.standalone).toBe(27);
    expect(estimate.breakdown.affixing).toBe(2 * 12 * 26 * 2);
    expect(estimate.approxTotal).toBe(1275);
  });

  it("is always an upper bound on the real (deduplicated) output", () => {
    const config = baseConfig({
      keywords: ["api", "dev", "admin"],
      useEnvTierWords: true,
      useServiceWords: true,
      useRegionWords: true,
      includeStandalone: true,
      includeAffixing: true,
      includeNumbering: true,
      includeWordJoining: true,
      separators: ["-", ".", "_"],
      maxOutput: 1_000_000,
    });
    const estimate = estimateCandidateCount(config);
    const actual = generateSubdomainCandidates(config).candidates.length;
    expect(estimate.approxTotal).toBeGreaterThanOrEqual(actual);
  });

  it("flags exceedsCap when the estimate exceeds maxOutput", () => {
    const config = baseConfig({ useEnvTierWords: true, useServiceWords: true, useRegionWords: true, includeAffixing: true, maxOutput: 100 });
    expect(estimateCandidateCount(config).exceedsCap).toBe(true);
  });

  it("does not flag exceedsCap when comfortably under the cap", () => {
    const config = baseConfig({ keywords: ["api"], includeStandalone: true, maxOutput: 100 });
    expect(estimateCandidateCount(config).exceedsCap).toBe(false);
  });

  it("returns zero for every mode that is disabled", () => {
    const estimate = estimateCandidateCount(baseConfig({ keywords: ["api", "dev"] }));
    expect(estimate.approxTotal).toBe(0);
    expect(estimate.breakdown).toEqual({ standalone: 0, affixing: 0, numbering: 0, wordJoining: 0 });
  });
});
