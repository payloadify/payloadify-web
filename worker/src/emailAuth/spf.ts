import { queryDns, stripDnsTxtQuotes, type DnsRecordType } from "../dns/doh";

const RR_TYPE_TXT = 16;

/** RFC 7208 §4.6.4 — mechanisms that cost a DNS lookup against the 10-lookup budget. `ip4`/`ip6`
 *  are free (no lookup); `all` is a qualifier target, not a lookup. */
const LOOKUP_MECHANISMS = new Set(["a", "mx", "ptr", "include", "exists", "redirect"]);

/** How many `include:`/`redirect=` levels to recurse into when tallying the lookup count. Per the
 *  accepted project decision: depth-limited recursion (2 levels total — the top-level record plus
 *  one level of includes) rather than a shallow top-level-only count, with an explicit disclaimer
 *  past that depth instead of silently under-counting. */
const LOOKUP_COUNT_RECURSION_DEPTH = 1;

export type SpfQualifier = "+" | "-" | "~" | "?";

export interface SpfMechanism {
  qualifier: SpfQualifier;
  mechanism: string;
  value?: string;
  raw: string;
}

export interface SpfResult {
  domain: string;
  found: boolean;
  records: string[];
  record: string | null;
  multipleRecords: boolean;
  mechanisms: SpfMechanism[];
  allQualifier: SpfQualifier | null;
  deprecatedPtrUsed: boolean;
  lookupCount: number;
  lookupCountExceeded: boolean;
  /** True if lookup counting hit LOOKUP_COUNT_RECURSION_DEPTH and stopped recursing into a
   *  further nested include/redirect chain — the count above is a floor, not exact, in that case. */
  lookupCountTruncated: boolean;
}

export type DnsQueryFn = (name: string, type: DnsRecordType) => Promise<{ type: number; data: string }[]>;

function isSpfRecord(text: string): boolean {
  return /^v=spf1(\s|$)/i.test(text.trim());
}

async function fetchSpfTexts(domain: string, queryFn: DnsQueryFn): Promise<string[]> {
  const answers = await queryFn(domain, "TXT");
  return answers
    .filter((a) => a.type === RR_TYPE_TXT)
    .map((a) => stripDnsTxtQuotes(a.data))
    .filter(isSpfRecord);
}

/** Tokenizes everything after the leading `v=spf1` tag into qualifier + mechanism + value triples.
 *  Handles both `:`-delimited mechanisms (`include:example.com`, `ip4:1.2.3.4`) and `=`-delimited
 *  modifiers (`redirect=example.com`, `exp=explain.example.com`). */
export function parseSpfMechanisms(record: string): SpfMechanism[] {
  const tokens = record.trim().split(/\s+/).slice(1);
  const mechanisms: SpfMechanism[] = [];
  for (const token of tokens) {
    if (!token) continue;
    const qualifierMatch = token.match(/^([+\-~?])/);
    const qualifier = (qualifierMatch ? qualifierMatch[1] : "+") as SpfQualifier;
    const rest = qualifierMatch ? token.slice(1) : token;
    const delimIndex = rest.search(/[:=]/);
    const mechanism = (delimIndex === -1 ? rest : rest.slice(0, delimIndex)).toLowerCase();
    const value = delimIndex === -1 ? undefined : rest.slice(delimIndex + 1);
    mechanisms.push({ qualifier, mechanism, value, raw: token });
  }
  return mechanisms;
}

async function countSpfLookups(
  mechanisms: SpfMechanism[],
  queryFn: DnsQueryFn,
  depthRemaining: number,
): Promise<{ count: number; truncated: boolean }> {
  let count = 0;
  let truncated = false;

  for (const m of mechanisms) {
    if (!LOOKUP_MECHANISMS.has(m.mechanism)) continue;
    count += 1;

    if ((m.mechanism === "include" || m.mechanism === "redirect") && m.value) {
      if (depthRemaining <= 0) {
        truncated = true;
        continue;
      }
      const nestedTexts = await fetchSpfTexts(m.value, queryFn);
      if (nestedTexts.length === 1) {
        const nestedMechanisms = parseSpfMechanisms(nestedTexts[0]);
        const nested = await countSpfLookups(nestedMechanisms, queryFn, depthRemaining - 1);
        count += nested.count;
        if (nested.truncated) truncated = true;
      }
    }
  }

  return { count, truncated };
}

export async function checkSpf(domain: string, queryFn: DnsQueryFn = queryDns): Promise<SpfResult> {
  const records = await fetchSpfTexts(domain, queryFn);
  const multipleRecords = records.length > 1;
  const record = records.length === 1 ? records[0] : null;

  if (!record) {
    return {
      domain,
      found: records.length > 0,
      records,
      record: null,
      multipleRecords,
      mechanisms: [],
      allQualifier: null,
      deprecatedPtrUsed: false,
      lookupCount: 0,
      lookupCountExceeded: false,
      lookupCountTruncated: false,
    };
  }

  const mechanisms = parseSpfMechanisms(record);
  const allMechanism = mechanisms.find((m) => m.mechanism === "all");
  const { count, truncated } = await countSpfLookups(mechanisms, queryFn, LOOKUP_COUNT_RECURSION_DEPTH);

  return {
    domain,
    found: true,
    records,
    record,
    multipleRecords,
    mechanisms,
    allQualifier: allMechanism?.qualifier ?? null,
    deprecatedPtrUsed: mechanisms.some((m) => m.mechanism === "ptr"),
    lookupCount: count,
    lookupCountExceeded: count > 10,
    lookupCountTruncated: truncated,
  };
}
