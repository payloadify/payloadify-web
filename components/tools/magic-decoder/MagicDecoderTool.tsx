"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { findDecodings } from "@/lib/magic-decoder/detect";
import { serializeStepsForUrl } from "@/lib/encoding/chain";
import { Callout } from "@/components/ui/Callout";
import { CopyButton } from "@/components/ui/CopyButton";
import { RunsLocallyNote } from "@/components/ui/RunsLocallyNote";
import { inputClasses } from "@/components/ui/formClasses";

export function MagicDecoderTool() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const handoffInputParam = searchParams.get("input");

  const [input, setInput] = useState(() => handoffInputParam ?? "");

  useEffect(() => {
    if (handoffInputParam === null) return;
    router.replace(pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only
  }, []);

  const candidates = useMemo(() => findDecodings(input), [input]);

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
        <RunsLocallyNote />
      </div>

      {input.trim() === "" ? (
        <Callout variant="info">Paste a string above to try to auto-detect and unwrap it.</Callout>
      ) : candidates.length === 0 ? (
        <Callout variant="warning">No confident plaintext decoding found within 4 layers.</Callout>
      ) : (
        <div className="flex flex-col gap-4">
          {candidates.length > 1 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Multiple possible decodings found. None is picked as definitively correct, review
              each chain below.
            </p>
          )}
          {candidates.map((candidate, index) => (
            <div key={index} className="rounded border border-zinc-200 dark:border-zinc-800">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 p-2 dark:border-zinc-800">
                <span className="text-sm font-medium">
                  {candidate.chain.map((step) => step.operationName).join(" → ")}
                  {" → "}Plaintext
                </span>
                <Link
                  href={`/payload-decoder?input=${encodeURIComponent(input)}&chain=${encodeURIComponent(
                    serializeStepsForUrl(
                      candidate.chain.map((step, i) => ({ id: i + 1, operationId: step.operationId })),
                    ),
                  )}`}
                  className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500"
                >
                  Open in Payload Encoder/Decoder
                </Link>
              </div>
              <div className="flex flex-col gap-2 p-3">
                {candidate.chain.map((step, stepIndex) => {
                  const isFinal = stepIndex === candidate.chain.length - 1;
                  return (
                    <div key={stepIndex}>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        {isFinal ? `After ${step.operationName} (final)` : `After ${step.operationName}`}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
