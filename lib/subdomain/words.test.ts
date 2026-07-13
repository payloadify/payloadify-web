import { describe, expect, it } from "vitest";
import { dedupeWords, normalizeWord, parseFreeTextWordList, splitLabelIntoWords } from "./words";

describe("normalizeWord", () => {
  it("lowercases and strips invalid characters", () => {
    expect(normalizeWord("  DEV_Server! ")).toBe("devserver");
  });

  it("trims leading/trailing hyphens", () => {
    expect(normalizeWord("-api-")).toBe("api");
  });

  it("truncates to 63 characters", () => {
    const long = "a".repeat(80);
    expect(normalizeWord(long)).toBe("a".repeat(63));
  });

  it("returns null when nothing valid remains", () => {
    expect(normalizeWord("!!!")).toBeNull();
    expect(normalizeWord("   ")).toBeNull();
    expect(normalizeWord("---")).toBeNull();
  });
});

describe("dedupeWords", () => {
  it("removes duplicates while preserving first-seen order", () => {
    expect(dedupeWords(["api", "dev", "api", "prod", "dev"])).toEqual(["api", "dev", "prod"]);
  });
});

describe("parseFreeTextWordList", () => {
  it("splits on newlines and commas", () => {
    expect(parseFreeTextWordList("api, dev\nprod, api")).toEqual(["api", "dev", "prod"]);
  });

  it("drops empty/invalid tokens", () => {
    expect(parseFreeTextWordList("api,,  ,!!!\ndev")).toEqual(["api", "dev"]);
  });

  it("returns an empty array for empty input", () => {
    expect(parseFreeTextWordList("")).toEqual([]);
  });
});

describe("splitLabelIntoWords", () => {
  it("splits on hyphen, dot, and underscore", () => {
    expect(splitLabelIntoWords("api-dev.internal_v2")).toEqual(["api", "dev", "internal", "v2"]);
  });

  it("dedupes tokens within a label", () => {
    expect(splitLabelIntoWords("dev-dev-api")).toEqual(["dev", "api"]);
  });

  it("returns an empty array for a label with no valid tokens", () => {
    expect(splitLabelIntoWords("---")).toEqual([]);
  });
});
