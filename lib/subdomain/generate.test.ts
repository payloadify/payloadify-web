import { describe, expect, it } from "vitest";
import { SubdomainGeneratorConfig } from "./config";
import { generateSubdomainCandidates, sortCandidates } from "./generate";

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

describe("generateSubdomainCandidates", () => {
  it("standalone mode emits one candidate per pool word, suffixed with the base domain", () => {
    const result = generateSubdomainCandidates(baseConfig({ keywords: ["api", "vpn"], includeStandalone: true }));
    expect(result.candidates.sort()).toEqual(["api.example.com", "vpn.example.com"]);
    expect(result.cappedAt).toBeNull();
  });

  it("numbering mode is exact when the pool has no collisions", () => {
    const result = generateSubdomainCandidates(
      baseConfig({ keywords: ["api"], includeNumbering: true, numberingMin: 1, numberingMax: 2 }),
    );
    expect(result.candidates.sort()).toEqual(["api-1.example.com", "api-2.example.com"]);
  });

  it("zero-padding only adds a candidate when it differs from the unpadded value", () => {
    const result = generateSubdomainCandidates(
      baseConfig({ keywords: ["api"], includeNumbering: true, numberingMin: 9, numberingMax: 10, numberingZeroPadded: true }),
    );
    // 9 -> "09" (distinct from "9"), 10 -> "10" (same as padded "10", so no duplicate)
    expect(result.candidates.sort()).toEqual(["api-09.example.com", "api-10.example.com", "api-9.example.com"]);
  });

  it("word-joining pairs every ordered combination of user words, excluding self-pairs", () => {
    const result = generateSubdomainCandidates(baseConfig({ keywords: ["api", "dev"], includeWordJoining: true }));
    expect(result.candidates.sort()).toEqual(["api-dev.example.com", "dev-api.example.com"]);
  });

  it("affixing excludes self-pairing between a modifier and itself", () => {
    const result = generateSubdomainCandidates(baseConfig({ useEnvTierWords: true, includeAffixing: true }));
    expect(result.candidates).not.toContain("dev-dev.example.com");
  });

  it("the '.' separator produces genuine two-level subdomain prefixes", () => {
    const result = generateSubdomainCandidates(
      baseConfig({ useEnvTierWords: true, useServiceWords: true, includeAffixing: true, separators: ["."] }),
    );
    expect(result.candidates).toContain("dev.api.example.com");
  });

  it("dedupes candidates produced by overlapping modes", () => {
    const result = generateSubdomainCandidates(
      baseConfig({ keywords: ["api", "dev"], includeStandalone: true, includeWordJoining: true }),
    );
    expect(new Set(result.candidates).size).toBe(result.candidates.length);
  });

  it("stops at the cap and reports cappedAt", () => {
    const result = generateSubdomainCandidates(
      baseConfig({ useEnvTierWords: true, useServiceWords: true, includeStandalone: true, includeAffixing: true, maxOutput: 5 }),
    );
    expect(result.candidates).toHaveLength(5);
    expect(result.cappedAt).toBe(5);
  });

  it("does not report cappedAt when under the cap", () => {
    const result = generateSubdomainCandidates(baseConfig({ keywords: ["api"], includeStandalone: true, maxOutput: 5 }));
    expect(result.cappedAt).toBeNull();
  });

  it("falls back to '-' when no separators are active", () => {
    const result = generateSubdomainCandidates(baseConfig({ keywords: ["api", "dev"], includeWordJoining: true, separators: [] }));
    expect(result.candidates.sort()).toEqual(["api-dev.example.com", "dev-api.example.com"]);
  });
});

describe("sortCandidates", () => {
  const labels = ["zzz.example.com", "a.example.com", "bb.example.com"];

  it("alpha mode sorts lexicographically", () => {
    expect(sortCandidates(labels, "alpha")).toEqual(["a.example.com", "bb.example.com", "zzz.example.com"]);
  });

  it("length mode sorts shortest first, alpha tiebreak", () => {
    expect(sortCandidates(labels, "length")).toEqual(["a.example.com", "bb.example.com", "zzz.example.com"]);
  });
});
