import { CvssReference } from "./types";

export interface VrtAutofillEntry {
  owaspRefId: string | null;
  cweId: string;
  references: CvssReference[];
}

/** Suggested OWASP category + CWE + references to autofill when the user manually picks a VRT
 *  category in the Additional Info editor (custom/no-template mode) — a starting point only,
 *  the user can change or delete any of it afterward. Values mirror the canonical per-vuln-type
 *  defaults already used by templates.ts/chaining.ts (the two XSS VRT sub-variants and the
 *  single SQLi VRT id all resolve to their shared parent family's defaults).
 *
 *  This is best-effort, not exhaustive: VRT_CATEGORIES now covers the full official Bugcrowd
 *  taxonomy (~440 entries), and only the ids below (mostly the pre-existing hand-authored set)
 *  have a verified CWE/OWASP/reference mapping. Picking a VRT category with no entry here just
 *  leaves CWE/OWASP/references blank for the user to fill in manually. */
export const VRT_AUTOFILL: Record<string, VrtAutofillEntry> = {
  "xss-reflected": {
    owaspRefId: "web-a03-injection",
    cweId: "CWE-79",
    references: [
      { label: "PortSwigger: Cross-site scripting", url: "https://portswigger.net/web-security/cross-site-scripting" },
      { label: "OWASP Cheat Sheet: XSS Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
    ],
  },
  "xss-stored": {
    owaspRefId: "web-a03-injection",
    cweId: "CWE-79",
    references: [
      { label: "PortSwigger: Cross-site scripting", url: "https://portswigger.net/web-security/cross-site-scripting" },
      { label: "OWASP Cheat Sheet: XSS Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
    ],
  },
  "sqli-generic": {
    owaspRefId: "web-a03-injection",
    cweId: "CWE-89",
    references: [
      { label: "PortSwigger: SQL injection", url: "https://portswigger.net/web-security/sql-injection" },
      { label: "OWASP Cheat Sheet: SQL Injection Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html" },
    ],
  },
  idor: {
    owaspRefId: "web-a01-broken-access-control",
    cweId: "CWE-639",
    references: [
      { label: "PortSwigger: Insecure direct object references (IDOR)", url: "https://portswigger.net/web-security/access-control/idor" },
      { label: "PortSwigger: Top 10 API vulnerabilities", url: "https://portswigger.net/web-security/api-testing/top-10-api-vulnerabilities" },
    ],
  },
  "broken-access-control": {
    owaspRefId: "web-a01-broken-access-control",
    cweId: "CWE-284",
    references: [
      { label: "PortSwigger: Access control vulnerabilities", url: "https://portswigger.net/web-security/access-control" },
      { label: "OWASP Top 10 2021: A01 Broken Access Control", url: "https://owasp.org/Top10/2021/A01_2021-Broken_Access_Control/" },
    ],
  },
  ssrf: {
    owaspRefId: "web-a10-ssrf",
    cweId: "CWE-918",
    references: [
      { label: "PortSwigger: Server-side request forgery (SSRF)", url: "https://portswigger.net/web-security/ssrf" },
      { label: "OWASP Cheat Sheet: SSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  csrf: {
    owaspRefId: "web-a01-broken-access-control",
    cweId: "CWE-352",
    references: [
      { label: "PortSwigger: Cross-site request forgery (CSRF)", url: "https://portswigger.net/web-security/csrf" },
      { label: "OWASP Cheat Sheet: CSRF Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html" },
    ],
  },
  "sensitive-data-exposure": {
    owaspRefId: "web-a02-crypto-failures",
    cweId: "CWE-200",
    references: [
      { label: "PortSwigger: Information disclosure", url: "https://portswigger.net/web-security/information-disclosure" },
      { label: "OWASP Top 10 2021: A02 Cryptographic Failures", url: "https://owasp.org/Top10/2021/A02_2021-Cryptographic_Failures/" },
    ],
  },
  "open-redirect": {
    owaspRefId: "web-a01-broken-access-control",
    cweId: "CWE-601",
    references: [
      { label: "PortSwigger: Open redirection", url: "https://portswigger.net/kb/issues/00500100_open-redirection-reflected" },
      { label: "OWASP Cheat Sheet: Unvalidated Redirects and Forwards", url: "https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html" },
    ],
  },
  "security-misconfiguration": {
    owaspRefId: "web-a05-security-misconfiguration",
    cweId: "CWE-1392",
    references: [
      { label: "PortSwigger: Testing for security misconfiguration", url: "https://portswigger.net/support/using-burp-to-test-for-security-misconfiguration-issues" },
      { label: "OWASP Top 10 2021: A05 Security Misconfiguration", url: "https://owasp.org/Top10/2021/A05_2021-Security_Misconfiguration/" },
    ],
  },
  "insecure-deserialization": {
    owaspRefId: "web-a08-software-data-integrity",
    cweId: "CWE-502",
    references: [
      { label: "PortSwigger: Insecure deserialization", url: "https://portswigger.net/web-security/deserialization" },
      { label: "OWASP Cheat Sheet: Deserialization", url: "https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html" },
    ],
  },
  xxe: {
    owaspRefId: "web-a05-security-misconfiguration",
    cweId: "CWE-611",
    references: [
      { label: "PortSwigger: XML external entity (XXE) injection", url: "https://portswigger.net/web-security/xxe" },
      { label: "OWASP Cheat Sheet: XXE Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html" },
    ],
  },
  "path-traversal": {
    owaspRefId: "web-a01-broken-access-control",
    cweId: "CWE-22",
    references: [
      { label: "PortSwigger: Directory/path traversal", url: "https://portswigger.net/web-security/file-path-traversal" },
      { label: "OWASP: Path Traversal", url: "https://owasp.org/www-community/attacks/Path_Traversal" },
    ],
  },
  "broken-authentication": {
    owaspRefId: "web-a07-auth-failures",
    cweId: "CWE-640",
    references: [
      { label: "PortSwigger: Authentication vulnerabilities", url: "https://portswigger.net/web-security/authentication" },
      { label: "OWASP Cheat Sheet: Session Management", url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html" },
    ],
  },
  "command-injection": {
    owaspRefId: "web-a03-injection",
    cweId: "CWE-78",
    references: [
      { label: "PortSwigger: OS command injection", url: "https://portswigger.net/web-security/os-command-injection" },
      { label: "OWASP Cheat Sheet: OS Command Injection Defense", url: "https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html" },
    ],
  },
  "parameter-tampering": {
    owaspRefId: "web-a04-insecure-design",
    cweId: "CWE-472",
    references: [
      { label: "PortSwigger: Business logic vulnerabilities", url: "https://portswigger.net/web-security/logic-flaws" },
      { label: "OWASP Top 10 2021: A04 Insecure Design", url: "https://owasp.org/Top10/2021/A04_2021-Insecure_Design/" },
    ],
  },
  "ai-application-security-prompt-injection-system-prompt-leakage": {
    owaspRefId: "llm-llm01-prompt-injection",
    cweId: "CWE-1427",
    references: [
      { label: "OWASP Gen AI Security Project: LLM01:2025 Prompt Injection", url: "https://genai.owasp.org/llmrisk/llm01-prompt-injection/" },
      { label: "PortSwigger: Web LLM attacks", url: "https://portswigger.net/web-security/llm-attacks" },
    ],
  },
  "ai-application-security-sensitive-information-disclosure-cross-tenant-pii-leakage-exposure": {
    owaspRefId: "llm-llm02-sensitive-information-disclosure",
    cweId: "CWE-200",
    references: [
      { label: "OWASP Gen AI Security Project: LLM02:2025 Sensitive Information Disclosure", url: "https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/" },
      { label: "PortSwigger: Web LLM attacks", url: "https://portswigger.net/web-security/llm-attacks" },
    ],
  },
  "ai-application-security-training-data-poisoning-backdoor-injection-bias-manipulation": {
    owaspRefId: "llm-llm04-data-model-poisoning",
    cweId: "CWE-1039",
    references: [
      { label: "OWASP Gen AI Security Project: LLM04:2025 Data and Model Poisoning", url: "https://genai.owasp.org/llmrisk/llm042025-data-and-model-poisoning/" },
      { label: "CWE-1039: Inadequate Detection or Handling of Adversarial Input Perturbations", url: "https://cwe.mitre.org/data/definitions/1039.html" },
    ],
  },
  "ai-application-security-improper-output-handling-cross-site-scripting-xss": {
    owaspRefId: "llm-llm05-improper-output-handling",
    cweId: "CWE-1426",
    references: [
      { label: "OWASP Gen AI Security Project: LLM05:2025 Improper Output Handling", url: "https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/" },
      { label: "PortSwigger: Web LLM attacks", url: "https://portswigger.net/web-security/llm-attacks" },
    ],
  },
  "ai-application-security-remote-code-execution-sandboxed-container-code-execution": {
    owaspRefId: "llm-llm06-excessive-agency",
    cweId: "CWE-269",
    references: [
      { label: "OWASP Gen AI Security Project: LLM06:2025 Excessive Agency", url: "https://genai.owasp.org/llmrisk/llm062025-excessive-agency/" },
      { label: "PortSwigger: Web LLM attacks", url: "https://portswigger.net/web-security/llm-attacks" },
    ],
  },
  "ai-application-security-vector-and-embedding-weaknesses-embedding-exfiltration-model-extraction": {
    owaspRefId: "llm-llm08-vector-embedding-weaknesses",
    cweId: "CWE-863",
    references: [
      { label: "OWASP Gen AI Security Project: LLM08:2025 Vector and Embedding Weaknesses", url: "https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/" },
      { label: "OWASP Cheat Sheet: LLM Prompt Injection Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html" },
    ],
  },
  "ai-application-security-ai-safety-misinformation-wrong-factual-data": {
    owaspRefId: "llm-llm09-misinformation",
    cweId: "CWE-1426",
    references: [
      { label: "OWASP Gen AI Security Project: LLM09:2025 Misinformation", url: "https://genai.owasp.org/llmrisk/llm092025-misinformation/" },
      { label: "CWE-1426: Improper Validation of Generative AI Output", url: "https://cwe.mitre.org/data/definitions/1426.html" },
    ],
  },
  "ai-application-security-denial-of-service-dos-application-wide": {
    owaspRefId: "llm-llm10-unbounded-consumption",
    cweId: "CWE-400",
    references: [
      { label: "OWASP Gen AI Security Project: LLM10:2025 Unbounded Consumption", url: "https://genai.owasp.org/llmrisk/llm102025-unbounded-consumption/" },
      { label: "OWASP Cheat Sheet: Denial of Service", url: "https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html" },
    ],
  },
};
