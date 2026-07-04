export interface CweEntry {
  id: string;
  label: string;
  url: string;
}

/** CWE entries referenced by templates.ts and chaining.ts, keyed by the CWE id string used
 *  directly on those records (e.g. "CWE-79"). Titles verified against cwe.mitre.org. */
export const CWE_ENTRIES: CweEntry[] = [
  { id: "CWE-22", label: "Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal')", url: "https://cwe.mitre.org/data/definitions/22.html" },
  { id: "CWE-78", label: "Improper Neutralization of Special Elements used in an OS Command ('OS Command Injection')", url: "https://cwe.mitre.org/data/definitions/78.html" },
  { id: "CWE-79", label: "Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')", url: "https://cwe.mitre.org/data/definitions/79.html" },
  { id: "CWE-89", label: "Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')", url: "https://cwe.mitre.org/data/definitions/89.html" },
  { id: "CWE-200", label: "Exposure of Sensitive Information to an Unauthorized Actor", url: "https://cwe.mitre.org/data/definitions/200.html" },
  { id: "CWE-209", label: "Generation of Error Message Containing Sensitive Information", url: "https://cwe.mitre.org/data/definitions/209.html" },
  { id: "CWE-284", label: "Improper Access Control", url: "https://cwe.mitre.org/data/definitions/284.html" },
  { id: "CWE-307", label: "Improper Restriction of Excessive Authentication Attempts", url: "https://cwe.mitre.org/data/definitions/307.html" },
  { id: "CWE-312", label: "Cleartext Storage of Sensitive Information", url: "https://cwe.mitre.org/data/definitions/312.html" },
  { id: "CWE-352", label: "Cross-Site Request Forgery (CSRF)", url: "https://cwe.mitre.org/data/definitions/352.html" },
  { id: "CWE-384", label: "Session Fixation", url: "https://cwe.mitre.org/data/definitions/384.html" },
  { id: "CWE-489", label: "Active Debug Code", url: "https://cwe.mitre.org/data/definitions/489.html" },
  { id: "CWE-502", label: "Deserialization of Untrusted Data", url: "https://cwe.mitre.org/data/definitions/502.html" },
  { id: "CWE-601", label: "URL Redirection to Untrusted Site ('Open Redirect')", url: "https://cwe.mitre.org/data/definitions/601.html" },
  { id: "CWE-611", label: "Improper Restriction of XML External Entity Reference", url: "https://cwe.mitre.org/data/definitions/611.html" },
  { id: "CWE-639", label: "Authorization Bypass Through User-Controlled Key", url: "https://cwe.mitre.org/data/definitions/639.html" },
  { id: "CWE-640", label: "Weak Password Recovery Mechanism for Forgotten Password", url: "https://cwe.mitre.org/data/definitions/640.html" },
  { id: "CWE-798", label: "Use of Hard-coded Credentials", url: "https://cwe.mitre.org/data/definitions/798.html" },
  { id: "CWE-918", label: "Server-Side Request Forgery (SSRF)", url: "https://cwe.mitre.org/data/definitions/918.html" },
  { id: "CWE-1392", label: "Use of Default Credentials", url: "https://cwe.mitre.org/data/definitions/1392.html" },
];

export const CWE_ENTRIES_BY_ID: Record<string, CweEntry> = Object.fromEntries(CWE_ENTRIES.map((c) => [c.id, c]));
