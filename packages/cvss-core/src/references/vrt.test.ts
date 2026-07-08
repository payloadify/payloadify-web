import { describe, expect, it } from "vitest";
import { VRT_CATEGORIES } from "./vrt";

describe("VRT_CATEGORIES", () => {
  it("has unique ids", () => {
    const ids = VRT_CATEGORIES.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every entry has a non-empty label", () => {
    for (const v of VRT_CATEGORIES) {
      expect(v.label.length, v.id).toBeGreaterThan(0);
    }
  });

  it("inferred entries carry an explanatory note", () => {
    for (const v of VRT_CATEGORIES) {
      if (v.inferred) {
        expect(v.note, v.id).toBeTruthy();
      }
    }
  });
});
