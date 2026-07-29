"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AuthorizedUseNotice } from "@/components/ui/AuthorizedUseNotice";
import { Callout } from "@/components/ui/Callout";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { CommandBlock, InlineCommandRow } from "@/components/ui/CommandBlock";
import { CopyButton } from "@/components/ui/CopyButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { checkboxLabelClasses, inputClasses, primaryButtonClasses, secondaryButtonClasses, selectClasses, toggleButtonClasses } from "@/components/ui/formClasses";
import { CrackModeId, CRACK_MODES, CRACK_MODES_BY_ID, INCREMENTAL_MODES, RULE_SETS } from "@/lib/john/crackModes";
import { JOHN_FORMATS } from "@/lib/john/formats";
import { buildBenchmarkCommand, buildCommand, buildRestoreCommand, buildShowCommand } from "@/lib/john/generate";
import { JohnSelection } from "@/lib/john/params";
import { validateSelection } from "@/lib/john/validation";
import { useRateLimitedGeneration } from "@/lib/hooks/useRateLimitedGeneration";

const HISTORY_KEY = "payloadify:john-generator:history";

const MASK_CHEAT_SHEET =
  "?l = lowercase a-z\n?u = uppercase A-Z\n?d = digit 0-9\n?s = symbol (space/punctuation)\n?a = all of the above\n?b = 0x00-0xff\n?h = lowercase hex\n?H = uppercase hex\n-1..-4 = your own custom classes below\n?w = wordlist word (hybrid mask+wordlist)\n?W = wordlist word, case-inverted\n\nExample: ?u?l?l?l?l?l?d?d?d matches Password123-style patterns.";

export function JohnGeneratorTool() {
  // Matches HashcatGeneratorTool's handoff pattern: useSearchParams (not a raw window.location
  // read) is what's actually populated correctly on a client-side <Link> transition.
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const handoffFormatParam = searchParams.get("format");
  const handoffHashParam = searchParams.get("hash");

  const handoffFormatIsKnown =
    handoffFormatParam != null && JOHN_FORMATS.some((f) => f.format === handoffFormatParam);
  const [formatSelect, setFormatSelect] = useState<string>(() =>
    handoffFormatIsKnown ? handoffFormatParam! : (JOHN_FORMATS[0]?.format ?? ""),
  );
  const [customFormat, setCustomFormat] = useState(() => (handoffFormatIsKnown ? "" : (handoffFormatParam ?? "")));
  // John takes a hash *file*, not a hash value, so a handed-off hash can't pre-fill an input the
  // way Hashcat's target value does — instead the generated command writes it to a file itself,
  // see the handoffHash wiring into buildCommand below.
  const [handoffHash] = useState<string | null>(handoffHashParam);

  const [hashFile, setHashFile] = useState(() => (handoffHashParam ? "hashes.txt" : ""));
  const [crackMode, setCrackMode] = useState<CrackModeId>("wordlist");
  const [wordlist, setWordlist] = useState("/usr/share/wordlists/rockyou.txt");
  const [rules, setRules] = useState("None");
  const [customRules, setCustomRules] = useState("");
  const [singleSection, setSingleSection] = useState("");
  const [singleSeed, setSingleSeed] = useState("");
  const [incrementalMode, setIncrementalMode] = useState("");
  const [mask, setMask] = useState("?u?l?l?l?l?l?d?d?d");
  const [charset1, setCharset1] = useState("");
  const [charset2, setCharset2] = useState("");
  const [charset3, setCharset3] = useState("");
  const [charset4, setCharset4] = useState("");
  const [minLength, setMinLength] = useState("");
  const [maxLength, setMaxLength] = useState("");
  const [externalMode, setExternalMode] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [fork, setFork] = useState("");
  const [potFile, setPotFile] = useState("");
  const [noLog, setNoLog] = useState(false);

  const [generatedSelection, setGeneratedSelection] = useState<JohnSelection | null>(null);
  const { blockedMsg, setBlockedMsg, checkAndClear, recordGeneration } = useRateLimitedGeneration(HISTORY_KEY);

  // Scrubs ?format=&hash= from the address bar after the lazy useState initializers above have
  // already applied it, same as Hashcat's tool does.
  useEffect(() => {
    if (handoffFormatParam === null && handoffHashParam === null) return;
    router.replace(pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only
  }, []);

  const liveSelection: JohnSelection = {
    format: formatSelect,
    customFormat,
    hashFile,
    handoffHash: handoffHash ?? "",
    crackMode,
    wordlist,
    rules,
    customRules,
    singleSection,
    singleSeed,
    incrementalMode,
    mask,
    customCharsets: [charset1, charset2, charset3, charset4],
    minLength,
    maxLength,
    externalMode,
    sessionName,
    fork,
    potFile,
    noLog,
  };

  const validation = validateSelection(liveSelection);
  const canGenerateNow = validation.ok;
  const crackModeDef = CRACK_MODES_BY_ID[crackMode];

  function generate() {
    if (!canGenerateNow) return;
    const check = checkAndClear();
    if (!check.allowed) return;
    setGeneratedSelection(liveSelection);
    recordGeneration(check.now);
  }

  function resetAll() {
    setFormatSelect(JOHN_FORMATS[0]?.format ?? "");
    setCustomFormat("");
    setHashFile("");
    setCrackMode("wordlist");
    setWordlist("/usr/share/wordlists/rockyou.txt");
    setRules("None");
    setCustomRules("");
    setSingleSection("");
    setSingleSeed("");
    setIncrementalMode("");
    setMask("?u?l?l?l?l?l?d?d?d");
    setCharset1("");
    setCharset2("");
    setCharset3("");
    setCharset4("");
    setMinLength("");
    setMaxLength("");
    setExternalMode("");
    setSessionName("");
    setFork("");
    setPotFile("");
    setNoLog(false);
    setGeneratedSelection(null);
    setBlockedMsg(null);
  }

  const generatedCommand = useMemo(() => (generatedSelection ? buildCommand(generatedSelection) : null), [generatedSelection]);
  const generatedShowCommand = useMemo(
    () => (generatedSelection ? buildShowCommand(generatedSelection) : null),
    [generatedSelection],
  );
  const generatedBenchmarkCommand = useMemo(
    () => (generatedSelection ? buildBenchmarkCommand(generatedSelection) : null),
    [generatedSelection],
  );
  const generatedRestoreCommand = useMemo(
    () => (generatedSelection && generatedSelection.sessionName.trim() ? buildRestoreCommand(generatedSelection.sessionName) : null),
    [generatedSelection],
  );

  return (
    <div className="flex flex-col gap-6">
      <AuthorizedUseNotice />

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Not sure what type of hash you have?{" "}
        <Link href="/hash-identifier" className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100">
          Detect Hash →
        </Link>
      </p>

      {handoffHash && (
        <Callout variant="info">
          Hash from Hash Identifier: <code className="break-all">{handoffHash}</code>. John only accepts a hash{" "}
          <strong>file</strong>, not a raw value, so the generated command below writes this hash to{" "}
          <code>{hashFile || "hashes.txt"}</code> for you before running John. Change the path if you want it saved
          somewhere else.
        </Callout>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 flex items-center text-sm font-medium">
            John format
            <Tooltip text="The --format value. Coming from the Hash Identifier pre-fills this automatically. Otherwise pick from common types below, or type any format name." />
          </label>
          <select
            value={formatSelect}
            onChange={(e) => {
              setFormatSelect(e.target.value);
              setCustomFormat("");
            }}
            className={`${selectClasses} w-full`}
          >
            {JOHN_FORMATS.map((f) => (
              <option key={f.format} value={f.format}>
                {f.format}: {f.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 flex items-center text-sm font-medium">
            Or custom format
            <Tooltip text="Overrides the dropdown above. Use this for a format not in the list. See john --list=formats for the full format list." />
          </label>
          <input
            type="text"
            value={customFormat}
            onChange={(e) => setCustomFormat(e.target.value)}
            placeholder="e.g. raw-sha3-256"
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 flex items-center text-sm font-medium">
          Hash file path
          <Tooltip text="John never accepts a bare hash value on the command line, only a file path. This tool never reads your filesystem: enter the path you'll actually use on your own machine." />
        </label>
        <input
          type="text"
          value={hashFile}
          onChange={(e) => setHashFile(e.target.value)}
          placeholder="hashes.txt"
          className={inputClasses}
        />
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {handoffHash ? (
            <>
              The generated command creates this file for you. For multiple hashes, save them yourself first, one
              per line, optionally as <code>user:hash</code>.
            </>
          ) : (
            <>
              Save your hash(es) to this file first, one per line. Use <code>user:hash</code> format if you have
              usernames too.
            </>
          )}
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Crack mode</label>
        <div className="flex flex-wrap gap-1">
          {CRACK_MODES.map((m) => (
            <button key={m.id} type="button" onClick={() => setCrackMode(m.id)} className={toggleButtonClasses(crackMode === m.id)}>
              {m.name}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{crackModeDef.description}</p>
      </div>

      {crackMode === "wordlist" && (
        <div>
          <label className="mb-1 block text-sm font-medium">Wordlist path</label>
          <input
            type="text"
            value={wordlist}
            onChange={(e) => setWordlist(e.target.value)}
            placeholder="/usr/share/wordlists/rockyou.txt"
            className={inputClasses}
          />

          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 flex items-center text-sm font-medium">
                Rules
                <Tooltip text="Applies a mangling ruleset to each wordlist entry. Pick a named set from run/john.conf, or override with a custom rule below." />
              </label>
              <select value={rules} onChange={(e) => setRules(e.target.value)} className={`${selectClasses} w-full`}>
                {RULE_SETS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 flex items-center text-sm font-medium">
                Or custom rule
                <Tooltip text="Overrides the dropdown above with inline rule syntax, e.g. :se3 sep. See doc/RULES for syntax." />
              </label>
              <input
                type="text"
                value={customRules}
                onChange={(e) => setCustomRules(e.target.value)}
                placeholder=":se3 sep"
                className={`${inputClasses} font-mono`}
              />
            </div>
          </div>
        </div>
      )}

      {crackMode === "single" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 flex items-center text-sm font-medium">
              Section or rule override
              <Tooltip text="Optional. Overrides the default [List.Rules:Single] section, e.g. Single:MyRule, or an inline :rule." />
            </label>
            <input
              type="text"
              value={singleSection}
              onChange={(e) => setSingleSection(e.target.value)}
              placeholder="(default)"
              className={`${inputClasses} font-mono`}
            />
          </div>
          <div>
            <label className="mb-1 flex items-center text-sm font-medium">
              Single seed
              <Tooltip text="Optional --single-seed value: extra words to seed single-crack mode's candidate generation with." />
            </label>
            <input
              type="text"
              value={singleSeed}
              onChange={(e) => setSingleSeed(e.target.value)}
              placeholder="(none)"
              className={inputClasses}
            />
          </div>
        </div>
      )}

      {crackMode === "incremental" && (
        <div>
          <label className="mb-1 flex items-center text-sm font-medium">
            Incremental mode
            <Tooltip text="Character-set mode from run/john.conf's [Incremental:*] sections. Leave as default to use John's built-in default mode." />
          </label>
          <select value={incrementalMode} onChange={(e) => setIncrementalMode(e.target.value)} className={`${selectClasses} w-full`}>
            <option value="">(default)</option>
            {INCREMENTAL_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )}

      {crackMode === "mask" && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 flex items-center text-sm font-medium">
              Mask
              <Tooltip text={MASK_CHEAT_SHEET} />
            </label>
            <input
              type="text"
              value={mask}
              onChange={(e) => setMask(e.target.value)}
              placeholder="?u?l?l?l?l?l?d?d?d"
              className={`${inputClasses} font-mono`}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Custom charset 1 (-1)</label>
              <input type="text" value={charset1} onChange={(e) => setCharset1(e.target.value)} placeholder="?l?u" className={`${inputClasses} font-mono`} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Custom charset 2 (-2)</label>
              <input type="text" value={charset2} onChange={(e) => setCharset2(e.target.value)} placeholder="?d?s" className={`${inputClasses} font-mono`} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Custom charset 3 (-3)</label>
              <input type="text" value={charset3} onChange={(e) => setCharset3(e.target.value)} className={`${inputClasses} font-mono`} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Custom charset 4 (-4)</label>
              <input type="text" value={charset4} onChange={(e) => setCharset4(e.target.value)} className={`${inputClasses} font-mono`} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Min length (--min-length)</label>
              <input type="number" min={0} value={minLength} onChange={(e) => setMinLength(e.target.value)} className={`${selectClasses} w-full`} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Max length (--max-length)</label>
              <input type="number" min={0} value={maxLength} onChange={(e) => setMaxLength(e.target.value)} className={`${selectClasses} w-full`} />
            </div>
          </div>
        </div>
      )}

      {crackMode === "external" && (
        <div>
          <label className="mb-1 flex items-center text-sm font-medium">
            External mode name
            <Tooltip text="Name of a [List.External:MODE] section in john.conf defining a user-authored cracking mode in John's own C-like language. Free text: nothing to enumerate here." />
          </label>
          <input
            type="text"
            value={externalMode}
            onChange={(e) => setExternalMode(e.target.value)}
            placeholder="e.g. Filter_Digits"
            className={inputClasses}
          />
        </div>
      )}

      <CollapsibleSection title="Advanced Options" storageKey="payloadify:john-generator:advanced-collapsed" defaultOpen={false}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Session name (--session)</label>
            <input type="text" value={sessionName} onChange={(e) => setSessionName(e.target.value)} placeholder="job1" className={inputClasses} />
          </div>
          <div>
            <label className="mb-1 flex items-center text-sm font-medium">
              Fork processes (--fork)
              <Tooltip text="Splits the workload across N local processes for faster CPU cracking on multi-core hardware." />
            </label>
            <input type="number" min={0} value={fork} onChange={(e) => setFork(e.target.value)} placeholder="4" className={`${selectClasses} w-full`} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Pot file (--pot)</label>
          <input type="text" value={potFile} onChange={(e) => setPotFile(e.target.value)} placeholder="custom.pot" className={inputClasses} />
        </div>
        <label className={checkboxLabelClasses}>
          <input type="checkbox" checked={noLog} onChange={(e) => setNoLog(e.target.checked)} />
          --no-log
          <Tooltip text="Disables writing john.log, useful when running against sensitive hash files you don't want details of logged to disk." />
        </label>
      </CollapsibleSection>

      <div className="flex flex-wrap gap-2 border-t border-zinc-200 pt-2 dark:border-zinc-800">
        <button type="button" onClick={generate} disabled={!canGenerateNow} className={primaryButtonClasses}>
          Generate Command
        </button>
        <button type="button" onClick={resetAll} className={secondaryButtonClasses}>
          Reset
        </button>
      </div>

      {!canGenerateNow && validation.message && hashFile.length + wordlist.length + mask.length + externalMode.length > 0 && (
        <Callout variant="warning">{validation.message}</Callout>
      )}

      {blockedMsg && <Callout variant="danger">{blockedMsg}</Callout>}

      {!generatedCommand && !blockedMsg && <Callout variant="info">Pick your options above, then click Generate Command.</Callout>}

      {generatedSelection && generatedCommand && (
        <div className="flex flex-col gap-4">
          <CommandBlock label="Command" command={generatedCommand} actions={<CopyButton text={generatedCommand} label="Copy Command" />} />

          <CollapsibleSection title="Companion commands" storageKey="payloadify:john-generator:companion-commands-collapsed" defaultOpen={true}>
            <InlineCommandRow label="Show already-cracked passwords (no re-run)" command={generatedShowCommand ?? ""} />
            {generatedRestoreCommand && <InlineCommandRow label="Restore an interrupted session" command={generatedRestoreCommand} />}
            <InlineCommandRow label="Benchmark this format on your hardware" command={generatedBenchmarkCommand ?? ""} />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Already-cracked hashes are looked up from John&apos;s potfile. <code>--show</code> reads it without spending any CPU time.
            </p>
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}
