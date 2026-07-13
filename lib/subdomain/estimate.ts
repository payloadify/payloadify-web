import { SubdomainGeneratorConfig } from "./config";
import { resolveWordPools } from "./wordPools";

export interface CandidateEstimate {
  /** Upper-bound count, computed without enumerating — modes can coincidentally produce the
   *  same label, so the real (deduplicated) output is always <= this. UI copy must say
   *  "up to ~N candidates," never an exact count. */
  approxTotal: number;
  exceedsCap: boolean;
  breakdown: {
    standalone: number;
    affixing: number;
    numbering: number;
    wordJoining: number;
  };
}

/** Closed-form upper-bound count per permutation mode — see lib/subdomain/generate.ts for the
 *  actual (deduplicated, capped) enumeration these formulas mirror. Kept in a separate
 *  function, rather than folded into generate.ts, so the live UI count never has to enumerate
 *  a potentially enormous candidate space just to report its size. */
export function estimateCandidateCount(config: SubdomainGeneratorConfig): CandidateEstimate {
  const { all, modifiers, userWords } = resolveWordPools(config);
  const wordCount = all.length;
  const modifierCount = modifiers.length;
  const userWordCount = userWords.length;
  const separatorCount = Math.max(config.separators.length, 1);
  const numberingRangeSize = config.includeNumbering ? Math.max(0, config.numberingMax - config.numberingMin + 1) : 0;
  const numberingVariantsPerValue = config.numberingZeroPadded ? 2 : 1;

  const standalone = config.includeStandalone ? wordCount : 0;
  // (wordCount - 1) excludes self-pairing, since every modifier word is also in `all`.
  const affixing = config.includeAffixing ? 2 * modifierCount * Math.max(wordCount - 1, 0) * separatorCount : 0;
  const numbering = config.includeNumbering
    ? wordCount * numberingRangeSize * numberingVariantsPerValue * separatorCount
    : 0;
  const wordJoining = config.includeWordJoining ? separatorCount * userWordCount * Math.max(userWordCount - 1, 0) : 0;

  const approxTotal = standalone + affixing + numbering + wordJoining;

  return {
    approxTotal,
    exceedsCap: approxTotal > config.maxOutput,
    breakdown: { standalone, affixing, numbering, wordJoining },
  };
}
