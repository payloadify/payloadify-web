export interface FilterResult {
  result: string[];
  error: string | null;
}

/** Post-generation regex include/exclude filter — operates on the already-capped candidate
 *  list, cheap enough to run live on every keystroke. Falls back to the unfiltered list (not
 *  an empty one) on an invalid pattern, so a user mid-typing a regex doesn't see their whole
 *  output vanish; the error string drives an inline message instead. */
export function applyPatternFilter(candidates: string[], pattern: string, mode: "include" | "exclude"): FilterResult {
  const trimmed = pattern.trim();
  if (trimmed.length === 0) return { result: candidates, error: null };

  let re: RegExp;
  try {
    re = new RegExp(trimmed, "i");
  } catch (err) {
    return { result: candidates, error: err instanceof Error ? err.message : "Invalid pattern" };
  }

  const result = candidates.filter((candidate) => (mode === "include" ? re.test(candidate) : !re.test(candidate)));
  return { result, error: null };
}
