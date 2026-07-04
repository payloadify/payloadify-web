export interface OwaspCategory {
  id: string;
  label: string;
  url: string;
}

/**
 * OWASP Top 10 (2021) and API Security Top 10 (2023) categories referenced by templates.ts
 * and chaining.ts. Every entry was verified directly against owasp.org during authoring —
 * see the research notes below for cross-cutting caveats.
 *
 * - XSS, SQL Injection, and OS Command Injection all collapsed into the single "A03:2021 –
 *   Injection" category in the 2021 revision (previously separate/more granular).
 * - CSRF and Path Traversal have no standalone OWASP Top 10 category at all — both are just
 *   CWEs bucketed under A01:2021 on OWASP's own mapped-CWE list, not distinct entries.
 * - Where a vuln type has a confirmed *exact* API Top 10 2023 analogue (BOLA, BOPLA), that
 *   more specific category is used instead of the general web one.
 */
export const OWASP_CATEGORIES: OwaspCategory[] = [
  { id: "web-a01-broken-access-control", label: "A01:2021 – Broken Access Control", url: "https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/" },
  { id: "web-a02-crypto-failures", label: "A02:2021 – Cryptographic Failures", url: "https://owasp.org/Top10/2021/A02_2021-Cryptographic_Failures/" },
  { id: "web-a03-injection", label: "A03:2021 – Injection", url: "https://owasp.org/Top10/2021/A03_2021-Injection/" },
  {
    id: "web-a05-security-misconfiguration",
    label: "A05:2021 – Security Misconfiguration",
    url: "https://owasp.org/Top10/2021/A05_2021-Security_Misconfiguration/",
  },
  {
    id: "web-a07-auth-failures",
    label: "A07:2021 – Identification and Authentication Failures",
    url: "https://owasp.org/Top10/2021/A07_2021-Identification_and_Authentication_Failures/",
  },
  {
    id: "web-a08-software-data-integrity",
    label: "A08:2021 – Software and Data Integrity Failures",
    url: "https://owasp.org/Top10/2021/A08_2021-Software_and_Data_Integrity_Failures/",
  },
  {
    id: "web-a10-ssrf",
    label: "A10:2021 – Server-Side Request Forgery (SSRF)",
    url: "https://owasp.org/Top10/2021/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/",
  },
  {
    id: "api-api1-bola",
    label: "API1:2023 – Broken Object Level Authorization",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/",
  },
  {
    id: "api-api3-bopla",
    label: "API3:2023 – Broken Object Property Level Authorization",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/",
  },
];

export const OWASP_CATEGORIES_BY_ID: Record<string, OwaspCategory> = Object.fromEntries(OWASP_CATEGORIES.map((c) => [c.id, c]));
