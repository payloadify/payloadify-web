import type { CrackModeId } from "./crackModes";

export type JohnTargetKind = "value" | "file";

export interface JohnSelection {
  format: string;
  /** Overrides the format dropdown. Same pattern as Hashcat's customModeText. */
  customFormat: string;
  /** Mirrors Hashcat's target value/file toggle. John never accepts a bare hash value on the
   *  command line though, only a file path, so "value" mode doesn't change the positional arg —
   *  it just makes buildCommand (lib/john/generate.ts) prepend an `echo ... > hashFile` step that
   *  writes targetValue into hashFile before running John, instead of requiring the user to
   *  already have a hash file on disk. */
  targetKind: JohnTargetKind;
  /** Raw hash value, used only when targetKind is "value". Pre-filled from a Hash Identifier
   *  handoff but freely editable/clearable like Hashcat's target field. */
  targetValue: string;
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
