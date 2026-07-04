import { Platform } from "../shared/types";
import { Cvss31Metrics } from "../v3_1/metrics";
import { Cvss40Metrics } from "../v4_0/metrics";

export interface CvssReference {
  label: string;
  url: string;
}

/** The "Additional Info" block (OWASP/VRT/CWE/references/rationale) — always user-editable in
 *  the calculator UI. Templates/chains/saved-templates just prefill it; every field is nullable
 *  or empty because a fully custom, no-template session starts with none of it chosen. */
export interface CvssMeta {
  rationale: string;
  owaspRefId: string | null;
  vrtRefId: string | null;
  cweId: string | null;
  references: CvssReference[];
}

export const EMPTY_CVSS_META: CvssMeta = { rationale: "", owaspRefId: null, vrtRefId: null, cweId: null, references: [] };

export interface CvssTemplate {
  id: string;
  vulnTypeId: string;
  label: string;
  platforms: Platform[];
  description: string;
  cvss31: Cvss31Metrics;
  cvss40: Cvss40Metrics;
  /** null for desktop-platform templates — OWASP Top 10 has no desktop edition. */
  owaspRefId: string | null;
  vrtRefId: string;
  cweId: string;
  references: CvssReference[];
}

/** A hand-authored combined CVSS vector for chaining two vulnerability-type families
 *  together (e.g. XSS chained with Sensitive Data Exposure). Unordered — lookup checks
 *  both (vulnTypeIdA, vulnTypeIdB) orders. Every unique pair of VulnType ids has an entry
 *  (see chaining.test.ts's full-coverage assertion), so there is no runtime "no override"
 *  fallback case. */
export interface ChainPair {
  vulnTypeIdA: string;
  vulnTypeIdB: string;
  label: string;
  cvss31: Cvss31Metrics;
  cvss40: Cvss40Metrics;
  rationale: string;
  owaspRefId: string | null;
  vrtRefId: string;
  cweId: string;
  references: CvssReference[];
}
