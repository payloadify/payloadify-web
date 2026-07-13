const INVALID_LABEL_CHARS_RE = /[^a-z0-9-]/g;
const LEADING_TRAILING_HYPHENS_RE = /^-+|-+$/g;

/** Lowercases, strips characters outside [a-z0-9-], trims leading/trailing hyphens, and
 *  truncates to the 63-char DNS label limit. Returns null when nothing valid remains. */
export function normalizeWord(raw: string): string | null {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(INVALID_LABEL_CHARS_RE, "")
    .replace(LEADING_TRAILING_HYPHENS_RE, "")
    .slice(0, 63);
  return cleaned.length > 0 ? cleaned : null;
}

/** Order-preserving de-dupe. */
export function dedupeWords(words: string[]): string[] {
  return [...new Set(words)];
}

/** Splits free text on newlines and commas, normalizes each token, drops empties, de-dupes. */
export function parseFreeTextWordList(raw: string): string[] {
  const tokens = raw
    .split(/[\n,]/)
    .map((token) => normalizeWord(token))
    .filter((token): token is string => token !== null);
  return dedupeWords(tokens);
}

/** Splits a single DNS label into constituent words on '-', '.', '_' — mimics how altdns/
 *  gotator extract reusable tokens from an already-observed subdomain name. */
export function splitLabelIntoWords(label: string): string[] {
  const tokens = label
    .split(/[-._]/)
    .map((token) => normalizeWord(token))
    .filter((token): token is string => token !== null);
  return dedupeWords(tokens);
}
