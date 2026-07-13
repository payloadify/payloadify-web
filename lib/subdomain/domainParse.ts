import { dedupeWords, normalizeWord, splitLabelIntoWords } from "./words";

export interface ParsedDomain {
  registrableDomain: string;
  seedLabel: string | null;
  valid: boolean;
  error?: string;
}

// Common multi-part public-suffix TLDs. Not a full Public Suffix List implementation —
// anything not on this list falls back to "last two labels = registrable domain," which is
// correct for the overwhelming majority of real-world inputs (.com/.net/.org/.io/etc.).
const MULTI_PART_TLDS = new Set([
  "co.uk",
  "org.uk",
  "gov.uk",
  "ac.uk",
  "co.jp",
  "co.kr",
  "co.nz",
  "co.za",
  "co.in",
  "com.au",
  "net.au",
  "org.au",
  "com.br",
  "com.mx",
  "com.sg",
  "com.hk",
  "com.tw",
  "com.cn",
]);

const HOSTNAME_LABEL_RE = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/;
const IPV4_RE = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

function stripSchemeAndPath(raw: string): string {
  const withoutScheme = raw.trim().replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
  return withoutScheme.split(/[/?#]/)[0].replace(/:\d+$/, "");
}

/** Strips scheme/path/query/port/trailing dot, lowercases, validates the remainder is
 *  hostname-shaped, and splits it into a registrable domain plus an optional seed label taken
 *  from the single label immediately left of the registrable domain. A leading "www" label is
 *  dropped entirely (never kept as a seed word). */
export function parseBaseDomainInput(raw: string): ParsedDomain {
  const hostPart = stripSchemeAndPath(raw).replace(/\.$/, "").toLowerCase();

  if (hostPart.length === 0) {
    return { registrableDomain: "", seedLabel: null, valid: false, error: "Enter a domain." };
  }

  if (IPV4_RE.test(hostPart) || hostPart.includes(":")) {
    return { registrableDomain: "", seedLabel: null, valid: false, error: "Enter a domain, not an IP address." };
  }

  const rawLabels = hostPart.split(".");
  if (rawLabels.length < 2 || !rawLabels.every((label) => HOSTNAME_LABEL_RE.test(label))) {
    return { registrableDomain: "", seedLabel: null, valid: false, error: "Enter a valid domain (e.g. example.com)." };
  }

  const labels = rawLabels[0] === "www" ? rawLabels.slice(1) : rawLabels;
  if (labels.length < 2) {
    return { registrableDomain: "", seedLabel: null, valid: false, error: "Enter a valid domain (e.g. example.com)." };
  }

  const lastTwo = labels.slice(-2).join(".");
  const lastThree = labels.length >= 3 ? labels.slice(-3).join(".") : null;
  const suffixLabelCount = lastThree && MULTI_PART_TLDS.has(labels.slice(-2).join(".")) ? 3 : 2;

  const registrableDomain = suffixLabelCount === 3 && lastThree ? lastThree : lastTwo;
  const remaining = labels.slice(0, labels.length - suffixLabelCount);
  const seedLabel = remaining.length > 0 ? normalizeWord(remaining[remaining.length - 1]) : null;

  return { registrableDomain, seedLabel, valid: true };
}

/** For the "seed from known subdomains" textarea: splits on newlines/commas, strips scheme/
 *  trailing dot/lowercases each entry, strips the registrable-domain suffix if present, then
 *  extracts reusable word tokens from what's left. */
export function extractSeedWordsFromKnownSubdomains(raw: string, registrableDomain: string): string[] {
  const entries = raw
    .split(/[\n,]/)
    .map((entry) => stripSchemeAndPath(entry).replace(/\.$/, "").trim().toLowerCase())
    .filter((entry) => entry.length > 0);

  const suffix = `.${registrableDomain}`;
  const words = entries.flatMap((entry) => {
    const withoutSuffix = registrableDomain.length > 0 && entry.endsWith(suffix) ? entry.slice(0, -suffix.length) : entry;
    return splitLabelIntoWords(withoutSuffix);
  });

  return dedupeWords(words);
}
