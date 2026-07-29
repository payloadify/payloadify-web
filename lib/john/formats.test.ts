import { describe, expect, it } from "vitest";
import { HASH_SIGNATURES } from "../hash/signatures";
import { JOHN_FORMATS, JOHN_FORMATS_BY_NAME } from "./formats";

describe("JOHN_FORMATS", () => {
  it("includes every distinct John format referenced by the Hash Identifier's signatures", () => {
    const expectedFormats = new Set(
      HASH_SIGNATURES.map((sig) => sig.johnFormat).filter((f): f is string => f !== null),
    );
    const actualFormats = new Set(JOHN_FORMATS.map((f) => f.format));
    expect(actualFormats).toEqual(expectedFormats);
  });

  it("is sorted alphabetically by format", () => {
    const formatNames = JOHN_FORMATS.map((f) => f.format);
    expect(formatNames).toEqual([...formatNames].sort((a, b) => a.localeCompare(b)));
  });

  it("has no duplicate format values", () => {
    const formatNames = JOHN_FORMATS.map((f) => f.format);
    expect(new Set(formatNames).size).toBe(formatNames.length);
  });

  it("exposes a working lookup by format value", () => {
    expect(JOHN_FORMATS_BY_NAME["raw-md5"]?.name).toBe("MD5");
    expect(JOHN_FORMATS_BY_NAME["nt"]?.name).toBe("NTLM");
  });

  it("dedupes formats shared by multiple signatures (e.g. Office, scrypt)", () => {
    const officeEntries = JOHN_FORMATS.filter((f) => f.format === "Office");
    expect(officeEntries.length).toBe(1);
    const scryptEntries = JOHN_FORMATS.filter((f) => f.format === "scrypt");
    expect(scryptEntries.length).toBe(1);
  });
});
