import { Platform } from "../shared/types";

/** Groups the 27 vuln-type families into 5 broad buckets for dropdown <optgroup> rendering.
 *  Order here is display order, alphabetical by label so the dropdown reads A-Z. */
export interface VulnCategory {
  id: string;
  label: string;
}

export const VULN_CATEGORIES: VulnCategory[] = [
  { id: "access-control", label: "Access Control & Authentication" },
  { id: "ai-llm", label: "AI / LLM Application Security" },
  { id: "client-input", label: "Client-Side & Input Manipulation" },
  { id: "data-config", label: "Data Exposure & Configuration" },
  { id: "injection", label: "Injection & Request Forgery" },
];

export interface VulnType {
  id: string;
  label: string;
  platforms: Platform[];
  categoryId: string;
}

/** ~17 vulnerability-type families for v1, drawn from OWASP Top 10 (2021) / API Top 10 (2023)
 *  so the OWASP-category mapping (see references/owasp.ts) has clean, real coverage, plus 10
 *  more added later for the "llm"-platform families below, drawn 1:1 from the OWASP Top 10 for
 *  LLM Applications (2025). Each family gets 1-5 scenario templates in templates.ts varying by
 *  platform/impact context. */
export const VULN_TYPES: VulnType[] = [
  { id: "xss", label: "Cross-Site Scripting (XSS)", platforms: ["web", "api", "mobile"], categoryId: "injection" },
  { id: "sqli", label: "SQL Injection", platforms: ["web", "api"], categoryId: "injection" },
  { id: "xxe", label: "XML External Entity (XXE) Injection", platforms: ["web", "api"], categoryId: "injection" },
  {
    id: "command-injection",
    label: "OS Command Injection",
    platforms: ["web", "api", "desktop-windows", "desktop-mac", "desktop-linux"],
    categoryId: "injection",
  },
  { id: "ssrf", label: "Server-Side Request Forgery (SSRF)", platforms: ["web", "api"], categoryId: "injection" },
  {
    id: "insecure-deserialization",
    label: "Insecure Deserialization",
    platforms: ["web", "api", "desktop-windows", "desktop-linux"],
    categoryId: "injection",
  },

  { id: "idor", label: "Insecure Direct Object Reference (IDOR)", platforms: ["web", "api", "mobile"], categoryId: "access-control" },
  {
    id: "broken-access-control",
    label: "Broken Access Control / Privilege Escalation",
    platforms: ["web", "api"],
    categoryId: "access-control",
  },
  {
    id: "broken-authentication",
    label: "Broken Authentication / Session Management",
    platforms: ["web", "api", "mobile"],
    categoryId: "access-control",
  },
  { id: "csrf", label: "Cross-Site Request Forgery (CSRF)", platforms: ["web"], categoryId: "access-control" },
  { id: "race-condition", label: "Race Condition (TOCTOU)", platforms: ["web", "api"], categoryId: "access-control" },

  {
    id: "sensitive-data-exposure",
    label: "Sensitive Data Exposure / Cryptographic Failures",
    platforms: ["web", "api", "mobile", "desktop-windows", "desktop-mac", "desktop-linux"],
    categoryId: "data-config",
  },
  {
    id: "security-misconfiguration",
    label: "Security Misconfiguration",
    platforms: ["web", "api", "desktop-windows", "desktop-linux"],
    categoryId: "data-config",
  },
  {
    id: "vulnerable-components",
    label: "Using Components with Known Vulnerabilities",
    platforms: ["web", "api", "desktop-windows", "desktop-mac", "desktop-linux"],
    categoryId: "data-config",
  },

  { id: "open-redirect", label: "Open Redirect", platforms: ["web", "api"], categoryId: "client-input" },
  {
    id: "path-traversal",
    label: "Path Traversal / Local File Inclusion",
    platforms: ["web", "api", "desktop-windows", "desktop-mac", "desktop-linux"],
    categoryId: "client-input",
  },
  { id: "parameter-tampering", label: "Parameter Tampering", platforms: ["web", "api", "mobile"], categoryId: "client-input" },

  // ---- AI / LLM Application Security, from the OWASP Top 10 for LLM Applications (2025) (see
  // references/owasp.ts's "llm" group) ----
  { id: "llm01-prompt-injection", label: "LLM01: Prompt Injection", platforms: ["llm"], categoryId: "ai-llm" },
  { id: "llm02-sensitive-information-disclosure", label: "LLM02: Sensitive Information Disclosure", platforms: ["llm"], categoryId: "ai-llm" },
  { id: "llm03-supply-chain", label: "LLM03: Supply Chain", platforms: ["llm"], categoryId: "ai-llm" },
  { id: "llm04-data-model-poisoning", label: "LLM04: Data and Model Poisoning", platforms: ["llm"], categoryId: "ai-llm" },
  { id: "llm05-improper-output-handling", label: "LLM05: Improper Output Handling", platforms: ["llm"], categoryId: "ai-llm" },
  { id: "llm06-excessive-agency", label: "LLM06: Excessive Agency", platforms: ["llm"], categoryId: "ai-llm" },
  { id: "llm07-system-prompt-leakage", label: "LLM07: System Prompt Leakage", platforms: ["llm"], categoryId: "ai-llm" },
  { id: "llm08-vector-embedding-weaknesses", label: "LLM08: Vector and Embedding Weaknesses", platforms: ["llm"], categoryId: "ai-llm" },
  { id: "llm09-misinformation", label: "LLM09: Misinformation", platforms: ["llm"], categoryId: "ai-llm" },
  { id: "llm10-unbounded-consumption", label: "LLM10: Unbounded Consumption", platforms: ["llm"], categoryId: "ai-llm" },
];

export const VULN_TYPES_BY_ID: Record<string, VulnType> = Object.fromEntries(VULN_TYPES.map((v) => [v.id, v]));
