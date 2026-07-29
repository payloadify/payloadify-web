import { ENCODING_OPERATIONS_BY_ID, EncodingOperationId } from "../encoding/operations";

/** unicode-escape isn't in CLAUDE.md's literal Base64/Hex/URL/HTML-entity/ROT13/binary list, but
 *  it's already a fully-implemented operation in the shared engine, so trying it costs nothing. */
export const CANDIDATE_OPERATION_IDS: EncodingOperationId[] = [
  "base64",
  "hex",
  "url",
  "html-entity",
  "unicode-escape",
  "rot13",
  "binary",
];

export type DecodeStep = { operationId: EncodingOperationId; operationName: string; output: string };
export type Candidate = { chain: DecodeStep[]; text: string; score: number };

const MAX_EXPLORED_NODES = 2000;
const SCORE_THRESHOLD = 0.7;

type Node = { text: string; chain: DecodeStep[]; visited: Set<string> };

/** BFS every applicable decode branch up to maxDepth, regardless of whether an intermediate
 *  node looks like plaintext yet — an interior layer (e.g. hex-of-base64) won't look like
 *  English, and that's expected; only the final ranking (via plausibilityScore) filters those out. */
export function findDecodings(input: string, maxDepth = 4): Candidate[] {
  if (input.length === 0) return [];

  const reachedNodes: Node[] = [];
  const queue: Node[] = [{ text: input, chain: [], visited: new Set([input]) }];
  let explored = 0;

  while (queue.length > 0 && explored < MAX_EXPLORED_NODES) {
    const node = queue.shift()!;
    explored++;
    if (node.chain.length > 0) reachedNodes.push(node);
    if (node.chain.length >= maxDepth) continue;

    for (const operationId of CANDIDATE_OPERATION_IDS) {
      const operation = ENCODING_OPERATIONS_BY_ID[operationId];
      let output: string;
      try {
        output = operation.decode(node.text, { charset: "utf-8" });
      } catch {
        continue;
      }
      // Skip no-op decodes (e.g. URL-decode on text with no %) and cycles (e.g. ROT13 applied
      // twice returning the original) so the same branch can't loop or spuriously appear.
      if (output === node.text || node.visited.has(output)) continue;

      const visited = new Set(node.visited);
      visited.add(output);
      queue.push({
        text: output,
        chain: [...node.chain, { operationId, operationName: operation.name, output }],
        visited,
      });
    }
  }

  const scored = reachedNodes
    .map((node) => ({ chain: node.chain, text: node.text, score: plausibilityScore(node.text) }))
    .filter((candidate) => candidate.score >= SCORE_THRESHOLD);

  // Dedupe identical text outputs, keeping the shortest chain that reaches them.
  const byText = new Map<string, Candidate>();
  for (const candidate of scored) {
    const existing = byText.get(candidate.text);
    if (!existing || candidate.chain.length < existing.chain.length) byText.set(candidate.text, candidate);
  }

  return Array.from(byText.values())
    .sort((a, b) => b.score - a.score || a.chain.length - b.chain.length)
    .slice(0, 3);
}

/** Short built-in word list purely as a tie-breaker signal, not real NLP — this matters
 *  specifically for ROT13, since a ROT13'd string and its un-rotated form are both "printable
 *  ASCII letters," so alpha ratio alone can't distinguish the two. */
const COMMON_WORDS = [
  "the", "and", "is", "was", "for", "you", "are", "this", "that", "with", "have",
  "admin", "password", "http", "https", "www", "com", "user", "login", "secret",
  "key", "token", "flag", "hello", "world", "welcome", "test",
];

function printableRatio(text: string): number {
  let printable = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if ((code >= 0x20 && code <= 0x7e) || code === 0x09 || code === 0x0a || code === 0x0d) printable++;
  }
  return printable / text.length;
}

function alphaSpaceRatio(text: string): number {
  let count = 0;
  for (const ch of text) {
    if (/[a-zA-Z\s]/.test(ch)) count++;
  }
  return count / text.length;
}

function commonWordBonus(text: string): number {
  const lower = text.toLowerCase();
  let hits = 0;
  for (const word of COMMON_WORDS) {
    if (new RegExp(`\\b${word}\\b`).test(lower)) hits++;
  }
  return Math.min(hits * 0.08, 0.3);
}

/** Printability is a hard gate (catches raw binary noise / non-UTF8 garbage from a wrong
 *  decode); everything above that is a light English-likeness heuristic, not real NLP. */
export function plausibilityScore(text: string): number {
  if (text.length === 0) return 0;
  if (printableRatio(text) < 0.85) return 0;

  const wordBonus = commonWordBonus(text);
  // A longer run of letters/digits with no whitespace and no recognizable word is exactly what
  // a still-encoded layer (e.g. Base64, or that same Base64 text run through ROT13) looks like —
  // alpha ratio alone can't tell that apart from real English, since ROT13 preserves which
  // characters are letters. Gate on it rather than let ratio alone pass it through.
  if (text.length > 8 && !/\s/.test(text) && wordBonus === 0) return 0;

  return Math.min(alphaSpaceRatio(text) + wordBonus, 1);
}
