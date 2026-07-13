import { describe, expect, it } from "vitest";
import { applyPatternFilter } from "./filter";

const candidates = ["api.example.com", "dev-api.example.com", "vpn.example.com", "staging.example.com"];

describe("applyPatternFilter", () => {
  it("returns the unfiltered list when the pattern is empty", () => {
    expect(applyPatternFilter(candidates, "", "include")).toEqual({ result: candidates, error: null });
  });

  it("include mode keeps only matches", () => {
    const { result, error } = applyPatternFilter(candidates, "^api", "include");
    expect(error).toBeNull();
    expect(result).toEqual(["api.example.com"]);
  });

  it("exclude mode drops matches", () => {
    const { result, error } = applyPatternFilter(candidates, "api", "exclude");
    expect(error).toBeNull();
    expect(result).toEqual(["vpn.example.com", "staging.example.com"]);
  });

  it("is case-insensitive", () => {
    const { result } = applyPatternFilter(candidates, "^API", "include");
    expect(result).toEqual(["api.example.com"]);
  });

  it("falls back to the unfiltered list and reports an error on an invalid pattern", () => {
    const { result, error } = applyPatternFilter(candidates, "dev-(", "include");
    expect(result).toEqual(candidates);
    expect(error).not.toBeNull();
  });
});
