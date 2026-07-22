import { describe, expect, it } from "vitest";
import {
  detectCvssFieldsFromReport,
  detectCvssVector,
  detectCwe,
  detectLabeledField,
  detectOwaspCategory,
  detectReferenceUrls,
} from "./detect";

describe("detectCvssVector", () => {
  it("parses a valid CVSS 3.1 vector embedded in prose", () => {
    const text = "Severity: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H (Critical)";
    const { detected, multipleFound } = detectCvssVector(text);
    expect(detected?.version).toBe("3.1");
    expect(detected?.metrics).toEqual({ AV: "N", AC: "L", PR: "N", UI: "N", S: "U", C: "H", I: "H", A: "H" });
    expect(detected?.vector).toBe("CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H");
    expect(multipleFound).toBe(false);
  });

  it("parses a valid CVSS 4.0 vector", () => {
    const text = "Vector: CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N";
    const { detected } = detectCvssVector(text);
    expect(detected?.version).toBe("4.0");
    expect(detected?.metrics).toMatchObject({ AV: "N", VC: "H" });
  });

  it("returns null and does not throw on a garbled/invalid vector", () => {
    const text = "CVSS:3.1/AV:Z/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H";
    expect(detectCvssVector(text).detected).toBeNull();
  });

  it("flags multipleFound when more than one vector-shaped string is present", () => {
    const text = [
      "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      "CVSS:3.1/AV:L/AC:H/PR:H/UI:R/S:C/C:L/I:L/A:L",
    ].join("\n");
    const { detected, multipleFound } = detectCvssVector(text);
    expect(multipleFound).toBe(true);
    // First one wins.
    expect(detected?.metrics).toMatchObject({ AV: "N" });
  });

  it("returns null on plain text with no vector at all", () => {
    expect(detectCvssVector("Just a regular finding write-up, no vector here.").detected).toBeNull();
  });
});

describe("detectCwe", () => {
  it("detects a known CWE id", () => {
    expect(detectCwe("This is CWE-79, reflected XSS.")?.id).toBe("CWE-79");
  });

  it("returns null for a CWE-shaped id that isn't in our catalogue", () => {
    expect(detectCwe("Mapped to CWE-999999 in their scanner.")).toBeNull();
  });

  it("returns null when no CWE reference is present", () => {
    expect(detectCwe("No weakness id mentioned here.")).toBeNull();
  });

  it("resolves a CWE from a cwe.mitre.org reference URL when no 'CWE-<n>' text is present", () => {
    const refs = detectReferenceUrls("https://cwe.mitre.org/data/definitions/472.html");
    expect(detectCwe("no inline CWE id here", refs)?.id).toBe("CWE-472");
  });
});

describe("detectOwaspCategory", () => {
  it("resolves a Web 2021 code to the matching internal category", () => {
    expect(detectOwaspCategory("Maps to A03:2021 in the OWASP Top 10.")?.id).toBe("web-a03-injection");
  });

  it("resolves an API Security code", () => {
    expect(detectOwaspCategory("This is API1:2023 - BOLA.")?.id).toBe("api-api1-bola");
  });

  it("resolves an LLM code", () => {
    expect(detectOwaspCategory("LLM01:2025 prompt injection risk.")?.id).toBe("llm-llm01-prompt-injection");
  });

  it("returns null when no recognizable code is present", () => {
    expect(detectOwaspCategory("Just a description with no OWASP reference.")).toBeNull();
  });

  it("resolves a name + bare short code without a year, e.g. 'Insecure Design (A4)'", () => {
    expect(detectOwaspCategory("Insecure Design (A4) - Response Manipulation")?.id).toBe("web-a04-insecure-design");
  });

  it("resolves a name + zero-padded short code, e.g. 'Insecure Design (A04)'", () => {
    expect(detectOwaspCategory("Insecure Design (A04) issue")?.id).toBe("web-a04-insecure-design");
  });

  it("resolves from an owasp.org reference URL even without the /2021/ path segment", () => {
    const refs = detectReferenceUrls("See https://owasp.org/Top10/A04_2021-Insecure_Design/ for details.");
    expect(detectOwaspCategory("no code here", refs)?.id).toBe("web-a04-insecure-design");
  });

  it("prefers an explicit A0x:20xx code over a name+shortcode match when both are present", () => {
    expect(detectOwaspCategory("A03:2021 - Injection, not Insecure Design (A4)")?.id).toBe("web-a03-injection");
  });
});

describe("detectReferenceUrls", () => {
  it("finds and dedupes URLs, stripping trailing punctuation", () => {
    const text = "See https://example.com/finding. Also https://example.com/finding and https://portswigger.net/xss.";
    const refs = detectReferenceUrls(text);
    expect(refs.map((r) => r.url)).toEqual(["https://example.com/finding", "https://portswigger.net/xss"]);
    expect(refs.every((r) => r.label === "")).toBe(true);
  });

  it("caps the number of detected references", () => {
    const urls = Array.from({ length: 30 }, (_, i) => `https://example.com/${i}`).join(" ");
    expect(detectReferenceUrls(urls).length).toBe(20);
  });

  it("returns an empty array when no URLs are present", () => {
    expect(detectReferenceUrls("no links here")).toEqual([]);
  });
});

describe("detectLabeledField", () => {
  it("captures a single-line labeled field", () => {
    expect(detectLabeledField("Title: Reflected XSS in search box\nDescription: ...", "title")).toBe(
      "Reflected XSS in search box",
    );
  });

  it("captures a multi-line labeled field until the next label", () => {
    const text = ["Description: The search endpoint reflects", "user input unescaped.", "", "Impact: An attacker can steal cookies."].join(
      "\n",
    );
    expect(detectLabeledField(text, "description")).toBe("The search endpoint reflects\nuser input unescaped.");
    expect(detectLabeledField(text, "impact")).toBe("An attacker can steal cookies.");
  });

  it("stops at the next recognized label even without a blank line between them", () => {
    const text = "Description: reflects input\nImpact: cookie theft";
    expect(detectLabeledField(text, "description")).toBe("reflects input");
  });

  it("returns null when the field's label is absent, even if other labels are present", () => {
    expect(detectLabeledField("Description: something happened", "impact")).toBeNull();
  });

  it("returns null on unlabeled free-form prose", () => {
    expect(detectLabeledField("The application is vulnerable to XSS in the search box.", "description")).toBeNull();
  });

  it("stops at a standalone vector/CWE/OWASP line even without a blank line separating them", () => {
    const text = ["Impact: Attacker can steal session cookies.", "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N", "CWE-79"].join("\n");
    expect(detectLabeledField(text, "impact")).toBe("Attacker can steal session cookies.");
  });

  it("does not stop early when a CWE is merely mentioned mid-sentence within the labeled field", () => {
    const text = "Description: This is a reflected XSS issue (see CWE-79 for background) affecting the search page.";
    expect(detectLabeledField(text, "description")).toBe("This is a reflected XSS issue (see CWE-79 for background) affecting the search page.");
  });

  it("recognizes 'Vulnerability Description:' as an alias for the description field", () => {
    const text = "Vulnerability Description: \nThe search endpoint reflects user input unescaped.\n\nImpact: cookie theft";
    expect(detectLabeledField(text, "description")).toBe("The search endpoint reflects user input unescaped.");
  });
});

describe("detectCvssFieldsFromReport", () => {
  it("aggregates every detector over a realistic mixed-confidence report excerpt", () => {
    const text = [
      "Title: Reflected XSS in search parameter",
      "Description: The /search endpoint reflects the 'q' parameter without encoding.",
      "Impact: An attacker can execute arbitrary JavaScript in a victim's browser session.",
      "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N",
      "CWE-79",
      "A03:2021 - Injection",
      "Reference: https://portswigger.net/web-security/cross-site-scripting",
    ].join("\n");

    const result = detectCvssFieldsFromReport(text);
    expect(result.title).toBe("Reflected XSS in search parameter");
    expect(result.description).toContain("reflects the 'q' parameter");
    expect(result.impact).toContain("execute arbitrary JavaScript");
    expect(result.vector.detected?.version).toBe("3.1");
    expect(result.cwe?.id).toBe("CWE-79");
    expect(result.owasp?.id).toBe("web-a03-injection");
    expect(result.references.map((r) => r.url)).toContain("https://portswigger.net/web-security/cross-site-scripting");
    expect(result.notes).toBeNull();
  });

  it("leaves every field undetected on empty input, without throwing", () => {
    const result = detectCvssFieldsFromReport("");
    expect(result.vector.detected).toBeNull();
    expect(result.cwe).toBeNull();
    expect(result.owasp).toBeNull();
    expect(result.references).toEqual([]);
    expect(result.title).toBeNull();
    expect(result.description).toBeNull();
    expect(result.impact).toBeNull();
    expect(result.notes).toBeNull();
  });

  it("falls back to the first unlabeled line as the title, stripping leading section numbering", () => {
    const text = [
      "3.1.3.\tInsecure Design (A4) - Response Manipulation Lead to Unrestricted File Upload",
      "",
      "Vulnerability Description: ",
      "Ditemukan vulnerability pada aplikasi X.",
      "",
      "Impact: ",
      "Attacker dapat memanipulasi respons server.",
      "",
      "\thttps://owasp.org/Top10/A04_2021-Insecure_Design/",
      "\thttps://cwe.mitre.org/data/definitions/472.html",
    ].join("\n");

    const result = detectCvssFieldsFromReport(text);
    expect(result.title).toBe("Insecure Design (A4) - Response Manipulation Lead to Unrestricted File Upload");
    expect(result.description).toBe("Ditemukan vulnerability pada aplikasi X.");
    expect(result.owasp?.id).toBe("web-a04-insecure-design");
    expect(result.cwe?.id).toBe("CWE-472");
  });

  it("does not use an explicit 'Title:' line's own text as a fallback candidate", () => {
    const text = "Title: Reflected XSS\nDescription: something";
    expect(detectCvssFieldsFromReport(text).title).toBe("Reflected XSS");
  });

  it("does not fall back to a title when the first non-blank line is itself a label or code line", () => {
    expect(detectCvssFieldsFromReport("Description: something happened").title).toBeNull();
    expect(detectCvssFieldsFromReport("CWE-79\nDescription: something").title).toBeNull();
  });
});
