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

/** Default auto-recursion depth. Deliberately not raised, see CLAUDE.md Magic Decoder scope
 *  notes: 4 layers covers the overwhelming majority of real cases, going deeper by default
 *  increases both false-positive risk and combinatorial search cost. */
export const DEFAULT_MAX_DEPTH = 4;
/** Ceiling for the opt-in "Advanced" custom depth setting. Combined with MAX_EXPLORED_NODES
 *  below, this keeps worst-case search bounded even at max depth. */
export const MAX_ADVANCED_DEPTH = 12;

const MAX_EXPLORED_NODES = 4000;
const SCORE_THRESHOLD = 0.7;
/** A node scoring at or above this already looks like confident plaintext, stop expanding
 *  that branch further rather than grinding to the depth cap on a result we already trust. */
const STOP_THRESHOLD = 0.85;
/** If decoding a step makes the text look LESS plaintext-like than it already did, that's a
 *  signal the guess was wrong, don't take that step (and don't explore past it). */
const REGRESSION_MARGIN = 0.05;

type Node = { text: string; chain: DecodeStep[]; visited: Set<string> };

/** BFS every applicable decode branch up to maxDepth. Two pruning rules keep this "smarter
 *  stopping" rather than blind grinding:
 *  - a branch that already looks like confident plaintext (score >= STOP_THRESHOLD) is not
 *    expanded further
 *  - a candidate step that makes the text look LESS plaintext-like than its parent is dropped
 *    entirely rather than explored or presented
 *  Both rules only apply from the second layer onward, the raw original input is always tried
 *  for a first decode regardless of how it scores (that's the whole point of the tool). */
export function findDecodings(input: string, maxDepth: number = DEFAULT_MAX_DEPTH): Candidate[] {
  if (input.length === 0) return [];

  const reachedNodes: Node[] = [];
  const queue: Node[] = [{ text: input, chain: [], visited: new Set([input]) }];
  let explored = 0;

  while (queue.length > 0 && explored < MAX_EXPLORED_NODES) {
    const node = queue.shift()!;
    explored++;
    if (node.chain.length > 0) reachedNodes.push(node);
    if (node.chain.length >= maxDepth) continue;

    const parentScore = node.chain.length > 0 ? plausibilityScore(node.text) : 0;
    if (node.chain.length > 0 && parentScore >= STOP_THRESHOLD) continue;

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

      if (node.chain.length > 0 && plausibilityScore(output) + REGRESSION_MARGIN < parentScore) continue;

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

export type NextLayerGuess = {
  operationId: EncodingOperationId;
  operationName: string;
  output: string;
  score: number;
};

/** Tries every candidate operation once against `text` and returns the distinct, non-no-op
 *  results ranked best-first by plausibility score. Used by the manual "Decode one more layer"
 *  step-forward control, one step at a time and always showing which encoding was applied. */
export function guessNextLayer(text: string): NextLayerGuess[] {
  if (text.length === 0) return [];

  const guesses: NextLayerGuess[] = [];
  for (const operationId of CANDIDATE_OPERATION_IDS) {
    const operation = ENCODING_OPERATIONS_BY_ID[operationId];
    let output: string;
    try {
      output = operation.decode(text, { charset: "utf-8" });
    } catch {
      continue;
    }
    if (output === text) continue;
    guesses.push({ operationId, operationName: operation.name, output, score: plausibilityScore(output) });
  }

  return guesses.sort((a, b) => b.score - a.score);
}

/** Short built-in word list purely as a tie-breaker signal, not real NLP — this matters
 *  specifically for ROT13, since a ROT13'd string and its un-rotated form are both "printable
 *  ASCII letters," so alpha ratio alone can't distinguish the two. */
const COMMON_WORDS = [
  "the", "and", "is", "was", "for", "you", "are", "this", "that", "with", "have",
  "admin", "password", "http", "https", "www", "com", "user", "login", "secret",
  "key", "token", "flag", "hello", "world", "welcome", "test",
];
const COMMON_WORD_SET = new Set(COMMON_WORDS);

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

/** Fraction of letter-tokens that are recognizable dictionary words, a density check rather
 *  than a raw hit count, so one lucky match in a long string doesn't dominate the score. */
function dictionaryWordDensity(text: string): number {
  const words = text.toLowerCase().match(/[a-z]+/g);
  if (!words || words.length === 0) return 0;
  const hits = words.filter((word) => COMMON_WORD_SET.has(word)).length;
  return hits / words.length;
}

function isValidJson(text: string): boolean {
  if (!/^[[{]/.test(text)) return false;
  try {
    const parsed = JSON.parse(text);
    return typeof parsed === "object" && parsed !== null;
  } catch {
    return false;
  }
}

function looksLikeXmlOrHtml(text: string): boolean {
  if (!/^<[a-zA-Z!?]/.test(text) || !text.endsWith(">")) return false;
  const openTags = text.match(/<[a-zA-Z][a-zA-Z0-9]*(\s[^<>]*)?>/g)?.length ?? 0;
  const closeTags = text.match(/<\/[a-zA-Z][a-zA-Z0-9]*>/g)?.length ?? 0;
  const selfClosing = text.match(/<[a-zA-Z][a-zA-Z0-9]*(\s[^<>]*)?\/>/g)?.length ?? 0;
  return openTags > 0 && (closeTags > 0 || selfClosing > 0);
}

function isValidUrl(text: string): boolean {
  if (!/^https?:\/\//i.test(text)) return false;
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
}

function isValidEmail(text: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim());
}

/** Recognizable structure (valid JSON/XML/HTML/URL/email) is a strong plaintext signal even
 *  when the text has little or no whitespace, e.g. minified JSON or a bare URL. */
function structureBonus(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  if (isValidJson(trimmed) || looksLikeXmlOrHtml(trimmed) || isValidUrl(trimmed) || isValidEmail(trimmed)) {
    return 0.4;
  }
  return 0;
}

/** Printability is a hard gate (catches raw binary noise / non-UTF8 garbage from a wrong
 *  decode); everything above that is a light English-likeness heuristic, not real NLP. */
export function plausibilityScore(text: string): number {
  if (text.length === 0) return 0;
  if (printableRatio(text) < 0.85) return 0;

  const structure = structureBonus(text);
  if (structure > 0) return Math.min(0.75 + structure, 1);

  const wordBonus = Math.min(dictionaryWordDensity(text) * 0.6, 0.3);
  // A run of letters with no whitespace and no recognizable word is exactly what a still-encoded
  // layer (e.g. Base64, or that same Base64 text run through ROT13) looks like — alpha ratio
  // alone can't tell that apart from real English, since ROT13 preserves which characters are
  // letters. Gate on it rather than let ratio alone pass it through. This previously only kicked
  // in above 8 characters, which let short wrong guesses (e.g. an 8-char ROT13-of-Base64 result)
  // auto-score 1.0 and outrank the actual correct decode, apply it from 4 characters up instead;
  // below that a token is too short for the dictionary check to mean anything either way.
  if (text.length >= 4 && !/\s/.test(text) && wordBonus === 0) return 0;

  return Math.min(alphaSpaceRatio(text) + wordBonus, 1);
}
