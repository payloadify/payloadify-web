"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_MAX_DEPTH,
  DecodeStep,
  MAX_ADVANCED_DEPTH,
  NextLayerGuess,
  findDecodings,
  guessNextLayer,
} from "@/lib/magic-decoder/detect";
import { serializeStepsForUrl } from "@/lib/encoding/chain";
import { Callout } from "@/components/ui/Callout";
import { CopyButton } from "@/components/ui/CopyButton";
import { RunsLocallyNote } from "@/components/ui/RunsLocallyNote";
import { checkboxLabelClasses, inputClasses, primaryButtonClasses, secondaryButtonClasses } from "@/components/ui/formClasses";

type ManualState = { steps: DecodeStep[]; pending: NextLayerGuess[] | null };

export function MagicDecoderTool() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const handoffInputParam = searchParams.get("input");

  const [input, setInput] = useState(() => handoffInputParam ?? "");
  const [autoDecode, setAutoDecode] = useState(false);
  // The input text last actually decoded in manual mode. Seeded from the handoff param so a
  // "Try Magic Decode" link still shows a result immediately on arrival regardless of the
  // checkbox state, without needing an extra click.
  const [decodedInput, setDecodedInput] = useState<string | null>(() => handoffInputParam ?? null);

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [customDepth, setCustomDepth] = useState(DEFAULT_MAX_DEPTH);
  const maxDepth = advancedOpen ? customDepth : DEFAULT_MAX_DEPTH;

  // Manual "decode one more layer" state per displayed candidate (keyed by its index in the
  // candidates array). Reset whenever the decoded source or depth changes, a fresh auto-decode
  // means the previous manual extensions no longer apply to whatever's now shown. Reset happens
  // during render (React's documented pattern for state keyed off a changing input) rather than
  // in an effect, so it doesn't trigger an extra cascading render.
  const [manualByCandidate, setManualByCandidate] = useState<Record<number, ManualState>>({});
  const [manualResetKey, setManualResetKey] = useState<string | null>(null);

  useEffect(() => {
    if (handoffInputParam === null) return;
    router.replace(pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only
  }, []);

  const awaitingManualDecode = !autoDecode && decodedInput !== input;
  const source = autoDecode ? input : decodedInput;
  const candidates = useMemo(() => {
    return findDecodings(source ?? "", maxDepth);
  }, [source, maxDepth]);

  const currentResetKey = `${source ?? ""}::${maxDepth}`;
  if (manualResetKey !== currentResetKey) {
    setManualResetKey(currentResetKey);
    setManualByCandidate({});
  }

  function getManualState(index: number): ManualState {
    return manualByCandidate[index] ?? { steps: [], pending: null };
  }

  // Manual continuation when auto-decode found zero confident candidates (hit the depth cap
  // without ever crossing the plaintext threshold), keyed separately from per-candidate state
  // since there's no candidate chain to attach it to.
  const rootManual = getManualState(-1);

  function requestNextLayer(index: number, currentText: string) {
    const guesses = guessNextLayer(currentText);
    setManualByCandidate((prev) => ({
      ...prev,
      [index]: { steps: getManualState(index).steps, pending: guesses },
    }));
  }

  function applyGuess(index: number, guess: NextLayerGuess) {
    const state = getManualState(index);
    setManualByCandidate((prev) => ({
      ...prev,
      [index]: {
        steps: [...state.steps, { operationId: guess.operationId, operationName: guess.operationName, output: guess.output }],
        pending: null,
      },
    }));
  }

  function cancelPending(index: number) {
    setManualByCandidate((prev) => ({ ...prev, [index]: { steps: getManualState(index).steps, pending: null } }));
  }

  function renderManualControls(index: number, currentText: string) {
    const manual = getManualState(index);
    if (manual.pending === null) {
      return (
        <button type="button" onClick={() => requestNextLayer(index, currentText)} className={secondaryButtonClasses}>
          Decode one more layer
        </button>
      );
    }
    if (manual.pending.length === 0) {
      return (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          No further decodings detected, this looks like the final result.
        </p>
      );
    }
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Guessed encodings for the next layer, pick one to apply it:
        </p>
        {manual.pending.map((guess) => (
          <div
            key={guess.operationId}
            className="flex flex-wrap items-center justify-between gap-2 rounded border border-zinc-200 p-2 dark:border-zinc-800"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium">{guess.operationName}</p>
              <code className="block truncate text-xs text-zinc-500 dark:text-zinc-400">{guess.output}</code>
            </div>
            <button type="button" onClick={() => applyGuess(index, guess)} className={secondaryButtonClasses}>
              Use this
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => cancelPending(index)}
          className="self-start text-xs text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="mb-1 block text-sm font-medium">Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          spellCheck={false}
          placeholder="Paste an obfuscated string (Base64, Hex, URL-encoded, HTML entities, ROT13, or Binary, layered up to 4 deep)"
          className={inputClasses}
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <label className={checkboxLabelClasses}>
            <input
              type="checkbox"
              checked={autoDecode}
              onChange={(e) => setAutoDecode(e.target.checked)}
            />
            Auto decode
          </label>
          {!autoDecode && (
            <button
              type="button"
              onClick={() => setDecodedInput(input)}
              disabled={input.trim() === ""}
              className={primaryButtonClasses}
            >
              Decode
            </button>
          )}
        </div>
        <RunsLocallyNote />

        <details
          className="mt-3 rounded border border-zinc-200 dark:border-zinc-800"
          open={advancedOpen}
          onToggle={(e) => setAdvancedOpen(e.currentTarget.open)}
        >
          <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Advanced: custom auto-decode depth
          </summary>
          <div className="flex flex-col gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
            <label className="flex items-center gap-2 text-sm">
              Auto-decode depth
              <input
                type="number"
                min={DEFAULT_MAX_DEPTH}
                max={MAX_ADVANCED_DEPTH}
                value={customDepth}
                onChange={(e) => {
                  const parsed = Number(e.target.value);
                  if (Number.isNaN(parsed)) return;
                  const clamped = Math.min(MAX_ADVANCED_DEPTH, Math.max(DEFAULT_MAX_DEPTH, Math.round(parsed)));
                  setCustomDepth(clamped);
                }}
                className="w-20 rounded border border-zinc-300 bg-white p-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <span className="text-zinc-500 dark:text-zinc-400">(default {DEFAULT_MAX_DEPTH}, max {MAX_ADVANCED_DEPTH})</span>
            </label>
            <Callout variant="warning">
              Higher depth may produce false results on short or random-looking input. Only raise
              this if you know the input has more than {DEFAULT_MAX_DEPTH} layers of encoding.
            </Callout>
          </div>
        </details>
      </div>

      {input.trim() === "" ? (
        <Callout variant="info">Paste a string above to try to auto-detect and unwrap it.</Callout>
      ) : awaitingManualDecode ? (
        <Callout variant="info">Click Decode to check this input for encoded layers.</Callout>
      ) : candidates.length === 0 ? (
        <Callout variant="warning">No confident plaintext decoding found within {maxDepth} layers.</Callout>
      ) : (
        <div className="flex flex-col gap-4">
          {candidates.length > 1 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Multiple possible decodings found. None is picked as definitively correct, review
              each chain below.
            </p>
          )}
          {candidates.map((candidate, index) => {
            const manual = getManualState(index);
            const fullChain = [...candidate.chain, ...manual.steps];
            const currentText = fullChain[fullChain.length - 1].output;

            return (
              <div key={index} className="rounded border border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 p-2 dark:border-zinc-800">
                  <span className="text-sm font-medium">
                    {fullChain.map((step) => step.operationName).join(" → ")}
                    {" → "}Plaintext
                  </span>
                  <Link
                    href={`/payload-decoder?input=${encodeURIComponent(input)}&chain=${encodeURIComponent(
                      serializeStepsForUrl(
                        fullChain.map((step, i) => ({ id: i + 1, operationId: step.operationId })),
                      ),
                    )}`}
                    className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500"
                  >
                    Open in Payload Encoder/Decoder
                  </Link>
                </div>
                <div className="flex flex-col gap-2 p-3">
                  {fullChain.map((step, stepIndex) => {
                    const isFinal = stepIndex === fullChain.length - 1;
                    const isManual = stepIndex >= candidate.chain.length;
                    return (
                      <div key={stepIndex}>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          {isFinal ? `After ${step.operationName} (final)` : `After ${step.operationName}`}
                          {isManual && " (manual)"}
                        </p>
                        <div className="flex items-start justify-between gap-2">
                          <code
                            className={`break-all whitespace-pre-wrap text-xs ${
                              isFinal
                                ? "font-semibold text-zinc-900 dark:text-zinc-100"
                                : "text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            {step.output}
                          </code>
                          <CopyButton text={step.output} />
                        </div>
                      </div>
                    );
                  })}

                  <div className="mt-1 border-t border-zinc-200 pt-2 dark:border-zinc-800">
                    {renderManualControls(index, currentText)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {input.trim() !== "" && !awaitingManualDecode && candidates.length === 0 && (
        <div className="rounded border border-zinc-200 dark:border-zinc-800">
          <div className="border-b border-zinc-200 p-2 text-sm font-medium dark:border-zinc-800">
            Manual decode
          </div>
          <div className="flex flex-col gap-2 p-3">
            {rootManual.steps.length > 0 && (
              <div className="flex flex-col gap-2">
                {rootManual.steps.map((step, stepIndex) => {
                  const isFinal = stepIndex === rootManual.steps.length - 1;
                  return (
                    <div key={stepIndex}>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        After {step.operationName} (manual)
                      </p>
                      <div className="flex items-start justify-between gap-2">
                        <code
                          className={`break-all whitespace-pre-wrap text-xs ${
                            isFinal
                              ? "font-semibold text-zinc-900 dark:text-zinc-100"
                              : "text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          {step.output}
                        </code>
                        <CopyButton text={step.output} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {rootManual.steps.length === 0 && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Auto-decode did not find a confident result within {maxDepth} layers. Step through
                layers manually below.
              </p>
            )}
            {renderManualControls(
              -1,
              rootManual.steps.length > 0 ? rootManual.steps[rootManual.steps.length - 1].output : source ?? "",
            )}
          </div>
        </div>
      )}
    </div>
  );
}
