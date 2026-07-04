import { describe, expect, it } from "vitest";
import { OWASP_CATEGORIES } from "./owasp";

describe("OWASP_CATEGORIES", () => {
  it("has unique ids", () => {
    const ids = OWASP_CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every entry has a well-formed https:// owasp.org URL", () => {
    for (const c of OWASP_CATEGORIES) {
      expect(() => new URL(c.url), c.id).not.toThrow();
      expect(c.url.startsWith("https://owasp.org/"), c.id).toBe(true);
    }
  });
});
