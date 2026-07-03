import { describe, expect, it } from "vitest";
import { MSFVENOM_FORMATS, MSFVENOM_FORMATS_BY_ID } from "./formats";

describe("MSFVENOM_FORMATS", () => {
  it("has unique ids", () => {
    const ids = MSFVENOM_FORMATS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every format is reachable via MSFVENOM_FORMATS_BY_ID", () => {
    for (const f of MSFVENOM_FORMATS) {
      expect(MSFVENOM_FORMATS_BY_ID[f.id]).toBe(f);
    }
  });

  it("marks exactly the stdout-dump formats as not producing a file", () => {
    const noFile = new Set([
      "raw", "hex", "c", "csharp", "java", "vba", "vbapplication", "vbscript", "powershell", "base32", "base64", "js_be", "js_le",
      "psh-cmd",
    ]);
    for (const f of MSFVENOM_FORMATS) {
      expect(f.producesFile).toBe(!noFile.has(f.id));
    }
  });

  it("gives every non-producesFile format an empty extension", () => {
    for (const f of MSFVENOM_FORMATS) {
      if (!f.producesFile) expect(f.extension).toBe("");
    }
  });

  it("excludes ids that aren't real msfvenom -f values (arch-suffixed elf/macho variants, apk/dex, cab/scr/jsp/php, veil, bare hta)", () => {
    const invalidIds = ["elf32", "elf64", "macho32", "macho64", "apk", "dex", "cab", "scr", "jsp", "php", "veil", "hta"];
    for (const id of invalidIds) {
      expect(MSFVENOM_FORMATS_BY_ID[id]).toBeUndefined();
    }
  });

  it("uses the real hta-psh format id instead of the non-existent bare 'hta'", () => {
    expect(MSFVENOM_FORMATS_BY_ID["hta-psh"]).toBeDefined();
  });

  it("includes the formats confirmed by a second, search-backed reference doc", () => {
    const confirmed = [
      "exe-only", "exe-service", "exe-small", "elf-so", "msi-nouac", "jar", "psh", "psh-cmd", "psh-net",
      "bash", "sh", "vbapplication", "vbscript", "powershell", "base32", "base64", "js_be", "js_le",
    ];
    for (const id of confirmed) {
      expect(MSFVENOM_FORMATS_BY_ID[id], `expected format ${id} to be defined`).toBeDefined();
    }
  });
});
