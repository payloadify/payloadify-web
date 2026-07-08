import { describe, expect, it } from "vitest";
import { CWE_ENTRIES_BY_ID } from "../references/cwe";
import { OWASP_CATEGORIES_BY_ID, OWASP_WEB_2025_CWE_MAP, owaspGroupOf } from "../references/owasp";
import { VRT_CATEGORIES_BY_ID } from "../references/vrt";
import { computeCvss31Score } from "../v3_1/score";
import { computeCvss40Score } from "../v4_0/score";
import { CHAIN_MATRIX, findChainPair } from "./chaining";
import { VULN_TYPES } from "./vulnTypes";

describe("CHAIN_MATRIX completeness", () => {
  it("has exactly one entry for every unique unordered pair of VulnType ids", () => {
    const ids = VULN_TYPES.map((v) => v.id);
    const expectedPairCount = (ids.length * (ids.length - 1)) / 2;
    expect(CHAIN_MATRIX).toHaveLength(expectedPairCount);

    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        expect(findChainPair(ids[i], ids[j]), `missing chain pair for ${ids[i]} + ${ids[j]}`).toBeDefined();
      }
    }
  });

  it("has no duplicate pairs", () => {
    const seen = new Set<string>();
    for (const pair of CHAIN_MATRIX) {
      const key = [pair.vulnTypeIdA, pair.vulnTypeIdB].sort().join("|");
      expect(seen.has(key), `duplicate chain pair for ${key}`).toBe(false);
      seen.add(key);
    }
  });

  it("has no self-pairs", () => {
    for (const pair of CHAIN_MATRIX) {
      expect(pair.vulnTypeIdA).not.toBe(pair.vulnTypeIdB);
    }
  });
});

describe("findChainPair", () => {
  it("resolves a pair regardless of argument order", () => {
    const forward = findChainPair("xss", "sqli");
    const backward = findChainPair("sqli", "xss");
    expect(forward).toBeDefined();
    expect(forward).toBe(backward);
  });

  it("returns undefined for a self-pair", () => {
    expect(findChainPair("xss", "xss")).toBeUndefined();
  });
});

describe("CHAIN_MATRIX structural integrity", () => {
  it("every entry's CVSS 4.0 metrics have E: X", () => {
    for (const pair of CHAIN_MATRIX) {
      expect(pair.cvss40.E, `${pair.vulnTypeIdA}+${pair.vulnTypeIdB}`).toBe("X");
    }
  });

  it("every entry has a well-formed CWE id", () => {
    for (const pair of CHAIN_MATRIX) {
      expect(pair.cweId, `${pair.vulnTypeIdA}+${pair.vulnTypeIdB}`).toMatch(/^CWE-\d+$/);
    }
  });

  it("every entry scores without throwing, in both CVSS versions", () => {
    for (const pair of CHAIN_MATRIX) {
      expect(() => computeCvss31Score(pair.cvss31), `${pair.vulnTypeIdA}+${pair.vulnTypeIdB}`).not.toThrow();
      expect(() => computeCvss40Score(pair.cvss40), `${pair.vulnTypeIdA}+${pair.vulnTypeIdB}`).not.toThrow();
    }
  });

  it("every non-null owaspRefId resolves to a real OWASP_CATEGORIES entry", () => {
    for (const pair of CHAIN_MATRIX) {
      if (pair.owaspRefId !== null) {
        expect(OWASP_CATEGORIES_BY_ID[pair.owaspRefId], `${pair.vulnTypeIdA}+${pair.vulnTypeIdB}`).toBeDefined();
      }
    }
  });

  it("every vrtRefId resolves to a real VRT_CATEGORIES entry", () => {
    for (const pair of CHAIN_MATRIX) {
      expect(VRT_CATEGORIES_BY_ID[pair.vrtRefId], `${pair.vulnTypeIdA}+${pair.vulnTypeIdB}`).toBeDefined();
    }
  });

  it("every entry with a 2021 Web owaspRefId has a verified OWASP Top 10:2025 mapping for its CWE", () => {
    for (const pair of CHAIN_MATRIX) {
      if (pair.owaspRefId !== null && owaspGroupOf(pair.owaspRefId) === "web-2021") {
        expect(
          OWASP_WEB_2025_CWE_MAP[pair.cweId],
          `${pair.vulnTypeIdA}+${pair.vulnTypeIdB}'s CWE "${pair.cweId}" has no OWASP_WEB_2025_CWE_MAP entry`,
        ).toBeDefined();
      }
    }
  });

  it("every cweId resolves to a real CWE_ENTRIES entry", () => {
    for (const pair of CHAIN_MATRIX) {
      expect(CWE_ENTRIES_BY_ID[pair.cweId], `${pair.vulnTypeIdA}+${pair.vulnTypeIdB}`).toBeDefined();
    }
  });

  it("every entry has well-formed https:// reference URLs", () => {
    for (const pair of CHAIN_MATRIX) {
      expect(pair.references.length, `${pair.vulnTypeIdA}+${pair.vulnTypeIdB}`).toBeGreaterThan(0);
      for (const ref of pair.references) {
        expect(() => new URL(ref.url), `${pair.vulnTypeIdA}+${pair.vulnTypeIdB}: ${ref.url}`).not.toThrow();
        expect(ref.url.startsWith("https://"), `${pair.vulnTypeIdA}+${pair.vulnTypeIdB}: ${ref.url}`).toBe(true);
      }
    }
  });
});
