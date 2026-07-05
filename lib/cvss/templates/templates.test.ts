import { describe, expect, it } from "vitest";
import { CWE_ENTRIES_BY_ID } from "../references/cwe";
import { OWASP_CATEGORIES_BY_ID, OWASP_WEB_2025_CWE_MAP, owaspGroupOf } from "../references/owasp";
import { VRT_CATEGORIES_BY_ID } from "../references/vrt";
import { computeCvss31Score } from "../v3_1/score";
import { computeCvss40Score } from "../v4_0/score";
import { CVSS_TEMPLATES } from "./templates";
import { VULN_TYPES_BY_ID } from "./vulnTypes";

describe("CVSS_TEMPLATES structural integrity", () => {
  it("has unique ids", () => {
    const ids = CVSS_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every template's vulnTypeId resolves to a real VulnType", () => {
    for (const t of CVSS_TEMPLATES) {
      expect(VULN_TYPES_BY_ID[t.vulnTypeId], `${t.id} has unknown vulnTypeId "${t.vulnTypeId}"`).toBeDefined();
    }
  });

  it("every template's platforms are non-empty and a subset of its VulnType's platforms", () => {
    for (const t of CVSS_TEMPLATES) {
      expect(t.platforms.length, `${t.id} has no platforms`).toBeGreaterThan(0);
      const vulnType = VULN_TYPES_BY_ID[t.vulnTypeId];
      for (const p of t.platforms) {
        expect(vulnType.platforms, `${t.id}'s platform "${p}" is not in vulnType "${t.vulnTypeId}"'s platforms`).toContain(p);
      }
    }
  });

  it("every template has a well-formed CWE id", () => {
    for (const t of CVSS_TEMPLATES) {
      expect(t.cweId, t.id).toMatch(/^CWE-\d+$/);
    }
  });

  it("every template's CVSS 4.0 metrics have E: X (Exploit Maturity is engagement-specific, not template-specific)", () => {
    for (const t of CVSS_TEMPLATES) {
      expect(t.cvss40.E, t.id).toBe("X");
    }
  });

  it("every template scores without throwing, in both CVSS versions", () => {
    for (const t of CVSS_TEMPLATES) {
      expect(() => computeCvss31Score(t.cvss31), t.id).not.toThrow();
      expect(() => computeCvss40Score(t.cvss40), t.id).not.toThrow();
    }
  });

  it("desktop-only templates omit an OWASP category (no desktop edition of OWASP Top 10)", () => {
    for (const t of CVSS_TEMPLATES) {
      const isDesktopOnly = t.platforms.every((p) => p.startsWith("desktop-"));
      if (isDesktopOnly) {
        expect(t.owaspRefId, t.id).toBeNull();
      }
    }
  });

  it("every non-null owaspRefId resolves to a real OWASP_CATEGORIES entry", () => {
    for (const t of CVSS_TEMPLATES) {
      if (t.owaspRefId !== null) {
        expect(OWASP_CATEGORIES_BY_ID[t.owaspRefId], `${t.id} has unknown owaspRefId "${t.owaspRefId}"`).toBeDefined();
      }
    }
  });

  it("every template with a 2021 Web owaspRefId has a verified OWASP Top 10:2025 mapping for its CWE", () => {
    for (const t of CVSS_TEMPLATES) {
      if (t.owaspRefId !== null && owaspGroupOf(t.owaspRefId) === "web-2021") {
        expect(OWASP_WEB_2025_CWE_MAP[t.cweId], `${t.id}'s CWE "${t.cweId}" has no OWASP_WEB_2025_CWE_MAP entry`).toBeDefined();
      }
    }
  });

  it("every vrtRefId resolves to a real VRT_CATEGORIES entry", () => {
    for (const t of CVSS_TEMPLATES) {
      expect(VRT_CATEGORIES_BY_ID[t.vrtRefId], `${t.id} has unknown vrtRefId "${t.vrtRefId}"`).toBeDefined();
    }
  });

  it("every cweId resolves to a real CWE_ENTRIES entry", () => {
    for (const t of CVSS_TEMPLATES) {
      expect(CWE_ENTRIES_BY_ID[t.cweId], `${t.id} has unknown cweId "${t.cweId}"`).toBeDefined();
    }
  });

  it("every template has 1-4 well-formed https:// reference URLs", () => {
    for (const t of CVSS_TEMPLATES) {
      expect(t.references.length, t.id).toBeGreaterThan(0);
      expect(t.references.length, t.id).toBeLessThanOrEqual(4);
      for (const ref of t.references) {
        expect(() => new URL(ref.url), `${t.id}: ${ref.url}`).not.toThrow();
        expect(ref.url.startsWith("https://"), `${t.id}: ${ref.url}`).toBe(true);
      }
    }
  });
});
