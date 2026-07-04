import { describe, expect, it } from "vitest";
import { CWE_ENTRIES_BY_ID } from "../references/cwe";
import { OWASP_CATEGORIES_BY_ID } from "../references/owasp";
import { VRT_CATEGORIES } from "../references/vrt";
import { VRT_AUTOFILL } from "./vrtAutofill";

describe("VRT_AUTOFILL", () => {
  it("has exactly one entry per VRT category id — every VRT pick must have an autofill suggestion", () => {
    for (const vrt of VRT_CATEGORIES) {
      expect(VRT_AUTOFILL[vrt.id], `missing autofill entry for VRT id "${vrt.id}"`).toBeDefined();
    }
    expect(Object.keys(VRT_AUTOFILL).sort()).toEqual(VRT_CATEGORIES.map((v) => v.id).sort());
  });

  it("every cweId and non-null owaspRefId resolves to a real entry", () => {
    for (const [vrtId, entry] of Object.entries(VRT_AUTOFILL)) {
      expect(CWE_ENTRIES_BY_ID[entry.cweId], `"${vrtId}" references unknown CWE "${entry.cweId}"`).toBeDefined();
      if (entry.owaspRefId) {
        expect(OWASP_CATEGORIES_BY_ID[entry.owaspRefId], `"${vrtId}" references unknown OWASP id "${entry.owaspRefId}"`).toBeDefined();
      }
    }
  });

  it("every entry has at least one reference with a valid https URL", () => {
    for (const [vrtId, entry] of Object.entries(VRT_AUTOFILL)) {
      expect(entry.references.length, `"${vrtId}" has no references`).toBeGreaterThan(0);
      for (const ref of entry.references) {
        expect(ref.url.startsWith("https://"), `"${vrtId}" reference "${ref.label}" is not https`).toBe(true);
      }
    }
  });
});
