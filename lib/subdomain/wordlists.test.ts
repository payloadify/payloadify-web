import { describe, expect, it } from "vitest";
import {
  ENV_TIER_WORDS_COMPACT,
  ENV_TIER_WORDS_EXTENDED,
  getEnvTierWords,
  getRegionWords,
  getServiceWords,
  REGION_WORDS_COMPACT,
  REGION_WORDS_EXTENDED,
  SERVICE_WORDS_COMPACT,
  SERVICE_WORDS_EXTENDED,
} from "./wordlists";

const LABEL_CHAR_RE = /^[a-z0-9-]+$/;

const LISTS: Record<string, readonly string[]> = {
  ENV_TIER_WORDS_COMPACT,
  ENV_TIER_WORDS_EXTENDED,
  SERVICE_WORDS_COMPACT,
  SERVICE_WORDS_EXTENDED,
  REGION_WORDS_COMPACT,
  REGION_WORDS_EXTENDED,
};

describe.each(Object.entries(LISTS))("%s", (_name, list) => {
  it("has no duplicate entries", () => {
    expect(new Set(list).size).toBe(list.length);
  });

  it("only contains DNS-label-safe, lowercase characters", () => {
    for (const word of list) {
      expect(word).toMatch(LABEL_CHAR_RE);
    }
  });
});

describe("extended lists are strict supersets of compact lists", () => {
  it("env/tier", () => {
    expect(ENV_TIER_WORDS_COMPACT.every((w) => ENV_TIER_WORDS_EXTENDED.includes(w))).toBe(true);
    expect(ENV_TIER_WORDS_EXTENDED.length).toBeGreaterThan(ENV_TIER_WORDS_COMPACT.length);
  });

  it("service", () => {
    expect(SERVICE_WORDS_COMPACT.every((w) => SERVICE_WORDS_EXTENDED.includes(w))).toBe(true);
    expect(SERVICE_WORDS_EXTENDED.length).toBeGreaterThan(SERVICE_WORDS_COMPACT.length);
  });

  it("region", () => {
    expect(REGION_WORDS_COMPACT.every((w) => REGION_WORDS_EXTENDED.includes(w))).toBe(true);
    expect(REGION_WORDS_EXTENDED.length).toBeGreaterThan(REGION_WORDS_COMPACT.length);
  });
});

describe("accessors", () => {
  it("select compact vs extended correctly", () => {
    expect(getEnvTierWords("compact")).toBe(ENV_TIER_WORDS_COMPACT);
    expect(getEnvTierWords("extended")).toBe(ENV_TIER_WORDS_EXTENDED);
    expect(getServiceWords("compact")).toBe(SERVICE_WORDS_COMPACT);
    expect(getRegionWords("extended")).toBe(REGION_WORDS_EXTENDED);
  });
});
