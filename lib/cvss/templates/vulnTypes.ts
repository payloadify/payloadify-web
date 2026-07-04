import { Platform } from "../shared/types";

export interface VulnType {
  id: string;
  label: string;
  platforms: Platform[];
}

/** ~14 vulnerability-type families for v1, drawn from OWASP Top 10 (2021) / API Top 10 (2023)
 *  so the OWASP-category mapping (see references/owasp.ts) has clean, real coverage. Each
 *  family gets 2-5 scenario templates in templates.ts varying by platform/impact context. */
export const VULN_TYPES: VulnType[] = [
  { id: "xss", label: "Cross-Site Scripting (XSS)", platforms: ["web", "api", "mobile"] },
  { id: "sqli", label: "SQL Injection", platforms: ["web", "api"] },
  { id: "idor", label: "Insecure Direct Object Reference (IDOR)", platforms: ["web", "api", "mobile"] },
  { id: "broken-access-control", label: "Broken Access Control / Privilege Escalation", platforms: ["web", "api"] },
  { id: "ssrf", label: "Server-Side Request Forgery (SSRF)", platforms: ["web", "api"] },
  { id: "csrf", label: "Cross-Site Request Forgery (CSRF)", platforms: ["web"] },
  {
    id: "sensitive-data-exposure",
    label: "Sensitive Data Exposure / Cryptographic Failures",
    platforms: ["web", "api", "mobile", "desktop-windows", "desktop-mac", "desktop-linux"],
  },
  { id: "open-redirect", label: "Open Redirect", platforms: ["web", "api"] },
  {
    id: "security-misconfiguration",
    label: "Security Misconfiguration",
    platforms: ["web", "api", "desktop-windows", "desktop-linux"],
  },
  { id: "insecure-deserialization", label: "Insecure Deserialization", platforms: ["web", "api", "desktop-windows", "desktop-linux"] },
  { id: "xxe", label: "XML External Entity (XXE) Injection", platforms: ["web", "api"] },
  {
    id: "path-traversal",
    label: "Path Traversal / Local File Inclusion",
    platforms: ["web", "api", "desktop-windows", "desktop-mac", "desktop-linux"],
  },
  { id: "broken-authentication", label: "Broken Authentication / Session Management", platforms: ["web", "api", "mobile"] },
  {
    id: "command-injection",
    label: "OS Command Injection",
    platforms: ["web", "api", "desktop-windows", "desktop-mac", "desktop-linux"],
  },
];

export const VULN_TYPES_BY_ID: Record<string, VulnType> = Object.fromEntries(VULN_TYPES.map((v) => [v.id, v]));
