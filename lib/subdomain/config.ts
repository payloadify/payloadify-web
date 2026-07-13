export type SeparatorId = "-" | "." | "_" | "";
export type WordlistSize = "compact" | "extended";
export type SortMode = "alpha" | "length";

export interface SubdomainGeneratorConfig {
  baseDomain: string;
  keywords: string[];
  seedLabels: string[];

  wordlistSize: WordlistSize;
  useEnvTierWords: boolean;
  useServiceWords: boolean;
  useRegionWords: boolean;

  includeStandalone: boolean;
  includeAffixing: boolean;
  includeNumbering: boolean;
  numberingMin: number;
  numberingMax: number;
  numberingZeroPadded: boolean;
  includeWordJoining: boolean;

  separators: SeparatorId[];

  sortMode: SortMode;
  maxOutput: number;
}

/** Non-domain-dependent defaults — shared by the component's initial state and tests, so the
 *  "type a domain, get a useful list immediately" defaults in the spec live in one place. */
export const DEFAULT_CONFIG_FLAGS = {
  wordlistSize: "compact" as WordlistSize,
  useEnvTierWords: true,
  useServiceWords: true,
  useRegionWords: false,

  includeStandalone: true,
  includeAffixing: true,
  includeNumbering: false,
  numberingMin: 1,
  numberingMax: 5,
  numberingZeroPadded: false,
  includeWordJoining: true,

  separators: ["-", "."] as SeparatorId[],

  sortMode: "alpha" as SortMode,
  maxOutput: 10_000,
};
