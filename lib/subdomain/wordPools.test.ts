import { describe, expect, it } from "vitest";
import { SubdomainGeneratorConfig } from "./config";
import { resolveWordPools } from "./wordPools";

function baseConfig(overrides: Partial<SubdomainGeneratorConfig>): SubdomainGeneratorConfig {
  return {
    baseDomain: "example.com",
    keywords: [],
    seedLabels: [],
    wordlistSize: "compact",
    useEnvTierWords: false,
    useServiceWords: false,
    useRegionWords: false,
    includeStandalone: true,
    includeAffixing: true,
    includeNumbering: false,
    numberingMin: 1,
    numberingMax: 5,
    numberingZeroPadded: false,
    includeWordJoining: true,
    separators: ["-"],
    sortMode: "alpha",
    maxOutput: 10_000,
    ...overrides,
  };
}

describe("resolveWordPools", () => {
  it("modifiers and userWords are always subsets of all", () => {
    const pools = resolveWordPools(
      baseConfig({ keywords: ["acme"], seedLabels: ["api"], useEnvTierWords: true, useRegionWords: true }),
    );
    for (const w of pools.modifiers) expect(pools.all).toContain(w);
    for (const w of pools.userWords) expect(pools.all).toContain(w);
  });

  it("toggling a source off removes exactly its words", () => {
    const withEnv = resolveWordPools(baseConfig({ useEnvTierWords: true }));
    const withoutEnv = resolveWordPools(baseConfig({ useEnvTierWords: false }));
    expect(withEnv.all.length).toBeGreaterThan(withoutEnv.all.length);
    expect(withoutEnv.modifiers).toEqual([]);
  });

  it("collapses duplicate words across sources to one", () => {
    // "api" appears both as a user keyword and (once service words are on) a curated word.
    const pools = resolveWordPools(baseConfig({ keywords: ["api"], useServiceWords: true }));
    expect(pools.all.filter((w) => w === "api")).toHaveLength(1);
  });

  it("userWords contains only keywords + seedLabels, never curated words", () => {
    const pools = resolveWordPools(
      baseConfig({ keywords: ["acme"], seedLabels: ["vpn"], useEnvTierWords: true, useServiceWords: true }),
    );
    expect(pools.userWords.sort()).toEqual(["acme", "vpn"].sort());
  });

  it("modifiers is empty when env/tier and region are both disabled", () => {
    const pools = resolveWordPools(baseConfig({ useServiceWords: true }));
    expect(pools.modifiers).toEqual([]);
  });
});
