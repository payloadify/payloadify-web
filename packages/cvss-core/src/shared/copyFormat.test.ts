import { describe, expect, it } from "vitest";
import { formatList } from "./copyFormat";

const FIELDS = [
  { id: "vector", label: "Vector", value: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" },
  { id: "owasp", label: "OWASP", value: "A03:2021 – Injection" },
  { id: "cwe", label: "CWE", value: "CWE-89" },
];

describe("formatList", () => {
  it("joins with newline only, no style prefix, for 'none'", () => {
    expect(formatList(FIELDS, ["vector", "owasp", "cwe"], { kind: "none" })).toBe(
      "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H\nA03:2021 – Injection\nCWE-89",
    );
  });

  it("prefixes each line with '- ' for 'bullets'", () => {
    const result = formatList(FIELDS, ["vector", "owasp", "cwe"], { kind: "bullets" });
    expect(result.split("\n")).toEqual(["- CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H", "- A03:2021 – Injection", "- CWE-89"]);
  });

  it("numbers each line 1-indexed for 'numbers'", () => {
    const result = formatList(FIELDS, ["vector", "owasp", "cwe"], { kind: "numbers" });
    expect(result.split("\n")).toEqual(["1. CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H", "2. A03:2021 – Injection", "3. CWE-89"]);
  });

  it("uses the user-supplied prefix verbatim for 'custom'", () => {
    const result = formatList(FIELDS, ["vector", "owasp", "cwe"], { kind: "custom", prefix: "-> " });
    expect(result.split("\n")).toEqual(["-> CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H", "-> A03:2021 – Injection", "-> CWE-89"]);
  });

  it("respects a custom order and appends unlisted fields afterward", () => {
    const result = formatList(FIELDS, ["cwe", "vector"], { kind: "none" });
    expect(result.split("\n")).toEqual(["CWE-89", "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H", "A03:2021 – Injection"]);
  });

  it("handles an empty fields array", () => {
    expect(formatList([], [], { kind: "none" })).toBe("");
  });

  it("handles a single field", () => {
    expect(formatList([FIELDS[0]], ["vector"], { kind: "bullets" })).toBe("- CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H");
  });
});
