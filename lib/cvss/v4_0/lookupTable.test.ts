import { describe, expect, it } from "vitest";
import { CVSS4_LOOKUP } from "./lookupTable";

describe("CVSS4_LOOKUP", () => {
  it("has exactly 270 entries, matching the official reference table", () => {
    expect(Object.keys(CVSS4_LOOKUP)).toHaveLength(270);
  });

  it("keys are all 6-digit MacroVector strings using only digits 0-2", () => {
    for (const key of Object.keys(CVSS4_LOOKUP)) {
      expect(key).toMatch(/^[0-2]{6}$/);
    }
  });

  it("values are all numbers in [0, 10]", () => {
    for (const value of Object.values(CVSS4_LOOKUP)) {
      expect(typeof value).toBe("number");
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(10);
    }
  });

  it("contains the two known boundary macrovectors", () => {
    expect(CVSS4_LOOKUP["000000"]).toBe(10);
    expect(CVSS4_LOOKUP["212221"]).toBe(0.1);
  });
});
