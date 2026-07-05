export interface OwaspCategory {
  id: string;
  label: string;
  url: string;
}

/**
 * OWASP Top 10 (2021), API Security Top 10 (2023), and Mobile Top 10 (2024) categories
 * referenced by templates.ts and chaining.ts. Every entry was verified directly against
 * owasp.org during authoring — see the research notes below for cross-cutting caveats.
 *
 * - XSS, SQL Injection, and OS Command Injection all collapsed into the single "A03:2021 –
 *   Injection" category in the 2021 revision (previously separate/more granular).
 * - CSRF and Path Traversal have no standalone OWASP Top 10 category at all — both are just
 *   CWEs bucketed under A01:2021 on OWASP's own mapped-CWE list, not distinct entries.
 * - Platform drives which family is shown: a template's owaspRefId should point at the most
 *   specific catalogue that actually covers its platform — Web Top 10 for web findings, API
 *   Security Top 10 for API findings, Mobile Top 10 for findings that are genuinely mobile-app-
 *   specific (client-side storage, WebView/binary issues, on-device auth). A vulnerability found
 *   via a mobile app but that actually lives in its backend API (e.g. missing rate-limiting on
 *   the login endpoint) should still cite the API category, not a Mobile one — the platform the
 *   bug was *found on* isn't always the platform the fix belongs to.
 * - Where a vuln type has a confirmed *exact* API Top 10 2023 analogue (BOLA, Broken
 *   Authentication, BOPLA, Broken Function Level Authorization, SSRF, Security
 *   Misconfiguration), that more specific category is used instead of the general web one.
 *   Some families (SQLi, XSS, OS command injection, XXE, insecure deserialization, path
 *   traversal, open redirect) have no API-specific analogue at all — the 2023 API Top 10
 *   dropped its 2019 "Injection" category on the assumption the main OWASP Top 10 already
 *   covers it — so those keep the Web category even when the platform is "api".
 */
export const OWASP_CATEGORIES: OwaspCategory[] = [
  { id: "web-a01-broken-access-control", label: "A01:2021 – Broken Access Control", url: "https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/" },
  { id: "web-a02-crypto-failures", label: "A02:2021 – Cryptographic Failures", url: "https://owasp.org/Top10/2021/A02_2021-Cryptographic_Failures/" },
  { id: "web-a03-injection", label: "A03:2021 – Injection", url: "https://owasp.org/Top10/2021/A03_2021-Injection/" },
  { id: "web-a04-insecure-design", label: "A04:2021 – Insecure Design", url: "https://owasp.org/Top10/2021/A04_2021-Insecure_Design/" },
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
    id: "api-api2-broken-authentication",
    label: "API2:2023 – Broken Authentication",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa2-broken-authentication/",
  },
  {
    id: "api-api3-bopla",
    label: "API3:2023 – Broken Object Property Level Authorization",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/",
  },
  {
    id: "api-api5-bfla",
    label: "API5:2023 – Broken Function Level Authorization",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa5-broken-function-level-authorization/",
  },
  {
    id: "api-api7-ssrf",
    label: "API7:2023 – Server Side Request Forgery",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa7-server-side-request-forgery/",
  },
  {
    id: "api-api8-security-misconfiguration",
    label: "API8:2023 – Security Misconfiguration",
    url: "https://owasp.org/API-Security/editions/2023/en/0xa8-security-misconfiguration/",
  },
  {
    id: "mobile-m3-insecure-auth",
    label: "M3:2024 – Insecure Authentication/Authorization",
    url: "https://owasp.org/www-project-mobile-top-10/2023-risks/m3-insecure-authentication-authorization.html",
  },
  {
    id: "mobile-m4-input-output-validation",
    label: "M4:2024 – Insufficient Input/Output Validation",
    url: "https://owasp.org/www-project-mobile-top-10/2023-risks/m4-insufficient-input-output-validation.html",
  },
  {
    id: "mobile-m9-insecure-data-storage",
    label: "M9:2024 – Insecure Data Storage",
    url: "https://owasp.org/www-project-mobile-top-10/2023-risks/m9-insecure-data-storage.html",
  },
];

export const OWASP_CATEGORIES_BY_ID: Record<string, OwaspCategory> = Object.fromEntries(OWASP_CATEGORIES.map((c) => [c.id, c]));
