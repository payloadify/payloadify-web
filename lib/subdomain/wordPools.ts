import { SubdomainGeneratorConfig } from "./config";
import { dedupeWords } from "./words";
import { getEnvTierWords, getRegionWords, getServiceWords } from "./wordlists";

export interface ResolvedWordPools {
  all: string[];
  modifiers: string[];
  userWords: string[];
}

/** The single source of truth for which words are in play, shared by both the count estimator
 *  and the real generator so they can never drift apart. */
export function resolveWordPools(config: SubdomainGeneratorConfig): ResolvedWordPools {
  const env = config.useEnvTierWords ? getEnvTierWords(config.wordlistSize) : [];
  const service = config.useServiceWords ? getServiceWords(config.wordlistSize) : [];
  const region = config.useRegionWords ? getRegionWords(config.wordlistSize) : [];

  const userWords = dedupeWords([...config.keywords, ...config.seedLabels]);
  const modifiers = dedupeWords([...env, ...region]);
  const all = dedupeWords([...userWords, ...service, ...modifiers]);

  return { all, modifiers, userWords };
}
