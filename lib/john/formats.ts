import { HASH_SIGNATURES } from "../hash/signatures";

export type JohnFormat = {
  format: string;
  name: string;
};

/** Derived from the Hash Identifier's own signature database rather than a separate hardcoded
 *  list — a hash type added there (with a johnFormat entry) automatically appears here too, so
 *  the identifier and this builder can never drift out of sync. Dedupes defensively since several
 *  signatures share the same John format (e.g. Office 2007/2010/2013 all use "Office", Cisco
 *  Type 9 shares "scrypt" with plain scrypt). */
function buildFormatsList(): JohnFormat[] {
  const byFormat = new Map<string, string>();
  for (const signature of HASH_SIGNATURES) {
    if (!signature.johnFormat) continue;
    if (!byFormat.has(signature.johnFormat)) byFormat.set(signature.johnFormat, signature.name);
  }
  return Array.from(byFormat, ([format, name]) => ({ format, name })).sort((a, b) =>
    a.format.localeCompare(b.format),
  );
}

export const JOHN_FORMATS: JohnFormat[] = buildFormatsList();

export const JOHN_FORMATS_BY_NAME: Record<string, JohnFormat> = Object.fromEntries(
  JOHN_FORMATS.map((f) => [f.format, f]),
);
