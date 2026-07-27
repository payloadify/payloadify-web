import { JohnSelection } from "./params";

/** Single-quotes an arbitrary value for safe inclusion in a bash command line, escaping any
 *  embedded single quotes with the standard '\'' technique. Same rationale/technique as
 *  lib/hashcat/generate.ts's quoteShellArg — duplicated here rather than shared so lib/john stays
 *  fully independent, matching how lib/hashcat is independent of everything else. */
function quoteShellArg(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function effectiveFormat(sel: JohnSelection): string {
  return sel.customFormat.trim() !== "" ? sel.customFormat.trim() : sel.format;
}

/** Pushes `flag=value` as a single quoted token, or nothing if value is blank. */
function pushFlagValue(parts: string[], flag: string, value: string): void {
  const trimmed = value.trim();
  if (trimmed.length === 0) return;
  parts.push(`${flag}=${quoteShellArg(trimmed)}`);
}

/** Pure, deterministic command builder — flag order:
 *  john --format=<fmt> [crack-mode flag + its fields] [--session=] [--fork=] [--pot=] [--no-log]
 *  <hashFile>
 *  Every free-text value is quoted via quoteShellArg, same discipline as the Hashcat builder.
 *  The hash file path is left unquoted, matching how Hashcat's builder treats a target of kind
 *  "file" — John never accepts a bare hash value as a positional argument, only a file path. */
export function buildCommand(sel: JohnSelection): string {
  const parts: string[] = ["john"];
  pushFlagValue(parts, "--format", effectiveFormat(sel));

  switch (sel.crackMode) {
    case "wordlist": {
      pushFlagValue(parts, "--wordlist", sel.wordlist);
      const customRules = sel.customRules.trim();
      if (customRules.length > 0) {
        parts.push(`--rules=${quoteShellArg(customRules)}`);
      } else if (sel.rules.trim().length > 0 && sel.rules !== "None") {
        parts.push(`--rules=${quoteShellArg(sel.rules)}`);
      }
      break;
    }
    case "single": {
      const section = sel.singleSection.trim();
      parts.push(section.length > 0 ? `--single=${quoteShellArg(section)}` : "--single");
      pushFlagValue(parts, "--single-seed", sel.singleSeed);
      break;
    }
    case "incremental": {
      const mode = sel.incrementalMode.trim();
      parts.push(mode.length > 0 ? `--incremental=${quoteShellArg(mode)}` : "--incremental");
      break;
    }
    case "mask": {
      pushFlagValue(parts, "--mask", sel.mask);
      sel.customCharsets.forEach((charset, i) => pushFlagValue(parts, `-${i + 1}`, charset));
      pushFlagValue(parts, "--min-length", sel.minLength);
      pushFlagValue(parts, "--max-length", sel.maxLength);
      break;
    }
    case "external": {
      pushFlagValue(parts, "--external", sel.externalMode);
      break;
    }
  }

  pushFlagValue(parts, "--session", sel.sessionName);
  pushFlagValue(parts, "--fork", sel.fork);
  pushFlagValue(parts, "--pot", sel.potFile);
  if (sel.noLog) parts.push("--no-log");

  parts.push(sel.hashFile.trim());

  return parts.join(" ");
}

/** Companion command to view already-cracked results for this hash file without re-running the
 *  attack — same purpose as Hashcat's buildShowCommand. */
export function buildShowCommand(sel: JohnSelection): string {
  const parts: string[] = ["john"];
  pushFlagValue(parts, "--format", effectiveFormat(sel));
  parts.push("--show", sel.hashFile.trim());
  return parts.join(" ");
}

/** Companion command to resume an interrupted session. Only meaningful once a session name has
 *  been set — the caller (JohnGeneratorTool) only renders this when sessionName is non-empty. */
export function buildRestoreCommand(sessionName: string): string {
  return `john --restore=${quoteShellArg(sessionName.trim())}`;
}

/** Companion command to benchmark raw cracking speed for this format on the user's own hardware. */
export function buildBenchmarkCommand(sel: JohnSelection): string {
  const parts: string[] = ["john"];
  pushFlagValue(parts, "--format", effectiveFormat(sel));
  parts.push("--test");
  return parts.join(" ");
}
