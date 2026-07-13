import { SeparatorId, SubdomainGeneratorConfig } from "./config";
import { resolveWordPools, ResolvedWordPools } from "./wordPools";

export interface GenerationResult {
  candidates: string[];
  cappedAt: number | null;
}

function padTwoDigits(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function* standaloneCandidates(pools: ResolvedWordPools): Generator<string> {
  yield* pools.all;
}

function* affixingCandidates(pools: ResolvedWordPools, seps: readonly SeparatorId[]): Generator<string> {
  for (const m of pools.modifiers) {
    for (const t of pools.all) {
      if (m === t) continue;
      for (const sep of seps) {
        yield `${m}${sep}${t}`;
        yield `${t}${sep}${m}`;
      }
    }
  }
}

function* numberingCandidates(
  pools: ResolvedWordPools,
  seps: readonly SeparatorId[],
  min: number,
  max: number,
  zeroPadded: boolean,
): Generator<string> {
  for (const t of pools.all) {
    for (let n = min; n <= max; n++) {
      for (const sep of seps) {
        yield `${t}${sep}${n}`;
        if (zeroPadded) {
          const padded = padTwoDigits(n);
          if (padded !== String(n)) yield `${t}${sep}${padded}`;
        }
      }
    }
  }
}

function* wordJoiningCandidates(pools: ResolvedWordPools, seps: readonly SeparatorId[]): Generator<string> {
  for (const a of pools.userWords) {
    for (const b of pools.userWords) {
      if (a === b) continue;
      for (const sep of seps) {
        yield `${a}${sep}${b}`;
      }
    }
  }
}

export function sortCandidates(labels: string[], mode: SubdomainGeneratorConfig["sortMode"]): string[] {
  const copy = [...labels];
  if (mode === "length") {
    copy.sort((a, b) => a.length - b.length || a.localeCompare(b));
  } else {
    copy.sort((a, b) => a.localeCompare(b));
  }
  return copy;
}

/** Deduplicated, capped enumeration. Modes run cheapest/most-recognizable first (standalone ->
 *  affixing -> numbering -> word-joining), each as a lazy generator, so a cap-truncated list
 *  still favors the most useful candidates over an arbitrary tail slice, and no work happens
 *  past the cap. Dedupe happens at the bare-label level (before the base domain suffix is
 *  appended), both for correctness and to avoid re-concatenating the domain on every check. */
export function generateSubdomainCandidates(config: SubdomainGeneratorConfig): GenerationResult {
  const pools = resolveWordPools(config);
  const seps = config.separators.length > 0 ? config.separators : (["-"] as const);
  const cap = Math.max(1, config.maxOutput);

  const modeGenerators: Generator<string>[] = [];
  if (config.includeStandalone) modeGenerators.push(standaloneCandidates(pools));
  if (config.includeAffixing) modeGenerators.push(affixingCandidates(pools, seps));
  if (config.includeNumbering) {
    modeGenerators.push(numberingCandidates(pools, seps, config.numberingMin, config.numberingMax, config.numberingZeroPadded));
  }
  if (config.includeWordJoining) modeGenerators.push(wordJoiningCandidates(pools, seps));

  const labels = new Set<string>();
  let capped = false;

  for (const generator of modeGenerators) {
    if (capped) break;
    for (const label of generator) {
      if (labels.size >= cap) {
        capped = true;
        break;
      }
      labels.add(label);
    }
  }

  const result = [...labels].map((label) => `${label}.${config.baseDomain}`);
  return {
    candidates: sortCandidates(result, config.sortMode),
    cappedAt: labels.size >= cap ? cap : null,
  };
}
