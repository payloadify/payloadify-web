import { describe, expect, it } from "vitest";
import { CWE_ENTRIES } from "./cwe";

describe("CWE_ENTRIES", () => {
  it("has unique ids matching /^CWE-\\d+$/", () => {
    const ids = CWE_ENTRIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^CWE-\d+$/);
    }
  });

  it("every entry's url matches its id", () => {
    for (const c of CWE_ENTRIES) {
      const num = c.id.replace("CWE-", "");
      expect(c.url).toBe(`https://cwe.mitre.org/data/definitions/${num}.html`);
    }
  });
});
