import { describe, expect, it } from "vitest";
import { CRACK_MODES, CRACK_MODES_BY_ID, INCREMENTAL_MODES, RULE_SETS } from "./crackModes";

describe("CRACK_MODES", () => {
  it("has exactly the five documented crack modes", () => {
    expect(CRACK_MODES.map((m) => m.id)).toEqual(["wordlist", "single", "incremental", "mask", "external"]);
  });

  it("exposes a working lookup by id", () => {
    expect(CRACK_MODES_BY_ID.wordlist.name).toBe("Wordlist");
    expect(CRACK_MODES_BY_ID.mask.name).toBe("Mask");
  });
});

describe("RULE_SETS", () => {
  it("includes None as an option with no duplicates", () => {
    expect(RULE_SETS).toContain("None");
    expect(new Set(RULE_SETS).size).toBe(RULE_SETS.length);
  });
});

describe("INCREMENTAL_MODES", () => {
  it("includes the documented default incremental modes with no duplicates", () => {
    expect(INCREMENTAL_MODES).toContain("Alnum");
    expect(INCREMENTAL_MODES).toContain("ASCII");
    expect(new Set(INCREMENTAL_MODES).size).toBe(INCREMENTAL_MODES.length);
  });
});
