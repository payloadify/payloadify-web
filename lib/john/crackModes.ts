export type CrackModeId = "wordlist" | "single" | "incremental" | "mask" | "external";

export interface CrackMode {
  id: CrackModeId;
  name: string;
  description: string;
}

/** John's cracking modes, sourced from doc/MODES + doc/OPTIONS. Unlike Hashcat's numeric
 *  attack-mode scheme, these don't map 1:1 onto anything — each is its own flag family. */
export const CRACK_MODES: CrackMode[] = [
  {
    id: "wordlist",
    name: "Wordlist",
    description: "Try each word in a wordlist as-is, optionally mutated by a rules file (--wordlist=FILE).",
  },
  {
    id: "single",
    name: "Single crack",
    description: "Try candidates derived from the login/GECOS fields in the hash file itself (--single).",
  },
  {
    id: "incremental",
    name: "Incremental",
    description: "Brute-force every combination in a character-set mode, from run/john.conf (--incremental[=MODE]).",
  },
  {
    id: "mask",
    name: "Mask",
    description: "Try every combination matching a character mask, e.g. ?u?l?l?l?l?d?d?d (--mask=PATTERN).",
  },
  {
    id: "external",
    name: "External",
    description: "Run a user-defined cracking mode written in John's own C-like language (--external=MODE).",
  },
];

export const CRACK_MODES_BY_ID: Record<CrackModeId, CrackMode> = Object.fromEntries(
  CRACK_MODES.map((m) => [m.id, m]),
) as Record<CrackModeId, CrackMode>;

/** [List.Rules:*] section names confirmed present in John jumbo's run/john.conf, offered as the
 *  --rules= dropdown for Wordlist mode. "None" (the literal section name) intentionally omits
 *  the flag entirely at build time — see lib/john/generate.ts. */
export const RULE_SETS: string[] = [
  "None",
  "Drop",
  "JumboSingle",
  "Single",
  "Extra",
  "Wordlist",
  "Policy",
  "NT",
  "ShiftToggle",
  "Multiword",
  "PhrasePreprocess",
  "Phrase",
  "PhraseCaseOne",
  "PhraseWrap",
  "Split",
  "OldOffice",
  "o1",
  "o2",
  "o",
  "i1",
  "i2",
  "i",
  "oi",
  "T9",
  "best64",
  "d3ad0ne",
  "dive",
  "InsidePro",
  "T0XlC",
  "rockyou-30000",
  "specific",
  "hashcat",
  "passphrase-rule1",
  "passphrase-rule2",
  "OneRuleToRuleThemAll",
  "OneRuleToRuleThemStill",
  "Loopback",
  "Single-Extra",
  "Jumbo",
  "All",
];

/** [Incremental:*] section names confirmed present in John jumbo's run/john.conf, offered as the
 *  --incremental= dropdown. */
export const INCREMENTAL_MODES: string[] = [
  "Custom",
  "UTF8",
  "Latin1",
  "ASCII",
  "LM_ASCII",
  "LanMan",
  "Alnumspace",
  "Alnum",
  "Alpha",
  "LowerNum",
  "UpperNum",
  "LowerSpace",
  "Lower",
  "Upper",
  "Digits",
];
