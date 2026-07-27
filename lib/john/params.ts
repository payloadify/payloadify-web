import type { CrackModeId } from "./crackModes";

export interface JohnSelection {
  format: string;
  /** Overrides the format dropdown. Same pattern as Hashcat's customModeText. */
  customFormat: string;
  /** John never accepts a bare hash value on the command line, only a file path — see
   *  lib/john/generate.ts for why this differs from Hashcat's value/file toggle. */
  hashFile: string;
  crackMode: CrackModeId;
  wordlist: string;
  /** Dropdown value from RULE_SETS, "None" to omit --rules= entirely. */
  rules: string;
  /** Free-text override for inline :rule syntax, takes precedence over the dropdown. */
  customRules: string;
  singleSection: string;
  singleSeed: string;
  incrementalMode: string;
  mask: string;
  /** -1.. -4 custom mask character classes. */
  customCharsets: [string, string, string, string];
  minLength: string;
  maxLength: string;
  externalMode: string;
  // Advanced Options
  sessionName: string;
  fork: string;
  potFile: string;
  noLog: boolean;
}
