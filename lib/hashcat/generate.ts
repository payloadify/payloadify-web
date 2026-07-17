import { ATTACK_MODES_BY_ID } from "./attackModes";
import { HashcatSelection } from "./params";

/** Wraps hash *values* (never file paths) in single quotes — many hash formats contain shell
 *  metacharacters hashcat needs verbatim but bash does not (bcrypt/crypt hashes start with `$`,
 *  which bash treats as variable expansion unless quoted). This is the single most common
 *  copy-paste footgun with hashcat one-liners, so the builder protects against it by default. */
function quoteTargetValue(target: HashcatSelection["target"]): string {
  const trimmed = target.value.trim();
  return target.kind === "value" ? `'${trimmed}'` : trimmed;
}

/** Pure, deterministic command builder — flag order:
 *  hashcat -m <mode> -a <attack> [-r rule]... [-1/-2/-3/-4 charset]... [--increment ...]
 *  [-w] [-O] [--force] [--potfile-disable] [--username] [--session] [-o --outfile-format]
 *  <target> [wordlist|wordlist2|mask positional args, in the attack mode's own order] */
export function buildCommand(sel: HashcatSelection): string {
  const parts: string[] = ["hashcat", "-m", String(sel.mode), "-a", sel.attackMode];

  for (const rule of sel.rules) {
    const trimmed = rule.trim();
    if (trimmed.length > 0) parts.push("-r", trimmed);
  }

  if (sel.attackMode === "3") {
    if (sel.charset1.trim()) parts.push("-1", sel.charset1.trim());
    if (sel.charset2.trim()) parts.push("-2", sel.charset2.trim());
    if (sel.charset3.trim()) parts.push("-3", sel.charset3.trim());
    if (sel.charset4.trim()) parts.push("-4", sel.charset4.trim());
    if (sel.incrementEnabled) {
      parts.push("--increment");
      if (sel.incrementMin !== null) parts.push("--increment-min", String(sel.incrementMin));
      if (sel.incrementMax !== null) parts.push("--increment-max", String(sel.incrementMax));
    }
  }

  if (sel.workload) parts.push("-w", String(sel.workload));
  if (sel.optimizedKernel) parts.push("-O");
  if (sel.force) parts.push("--force");
  if (sel.potfileDisable) parts.push("--potfile-disable");
  if (sel.usernameMode) parts.push("--username");
  if (sel.sessionName.trim()) parts.push("--session", sel.sessionName.trim());
  if (sel.outfile.trim()) {
    parts.push("-o", sel.outfile.trim());
    if (sel.outfileFormat.trim()) parts.push("--outfile-format", sel.outfileFormat.trim());
  }

  parts.push(quoteTargetValue(sel.target));

  const attackMode = ATTACK_MODES_BY_ID[sel.attackMode];
  for (const field of attackMode.fields) {
    if (field === "wordlist") parts.push(sel.wordlist.trim());
    if (field === "wordlist2") parts.push(sel.wordlist2.trim());
    if (field === "mask") parts.push(sel.mask.trim());
  }

  return parts.join(" ");
}

/** Companion command to view already-cracked results for this hash/file without re-running
 *  the attack — mirrors MSFVenom's "matching listener command" usage-guide pattern. */
export function buildShowCommand(sel: HashcatSelection): string {
  return ["hashcat", "-m", String(sel.mode), quoteTargetValue(sel.target), "--show"].join(" ");
}

/** Companion command to benchmark raw cracking speed for this mode on the user's own hardware. */
export function buildBenchmarkCommand(mode: number): string {
  return `hashcat -b -m ${mode}`;
}
