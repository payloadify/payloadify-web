"use client";

import { Callout } from "@/components/ui/Callout";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { Tooltip } from "@/components/ui/Tooltip";
import { selectClasses } from "@/components/ui/formClasses";
import { ArchId } from "@/lib/msfvenom/archs";
import { EncoderId, MsfvenomEncoder } from "@/lib/msfvenom/encoders";

export function EvasionOptionsPanel({
  encoderId,
  encoder,
  encoderOptions,
  onEncoderChange,
  archId,
  iterationsText,
  iterationsValid,
  onIterationsChange,
  liveRisk,
}: {
  encoderId: EncoderId;
  encoder: MsfvenomEncoder;
  encoderOptions: MsfvenomEncoder[];
  onEncoderChange: (id: EncoderId) => void;
  archId: ArchId | null;
  iterationsText: string;
  iterationsValid: boolean;
  onIterationsChange: (text: string) => void;
  liveRisk: boolean;
}) {
  return (
    <CollapsibleSection title="Evasion Options" storageKey="payloadify:msfvenom-generator:evasion-collapsed" defaultOpen={true}>
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 flex items-center text-sm font-medium">
              Encoder
              <Tooltip text={encoder.whyUseIt} />
            </label>
            <select value={encoderId} onChange={(e) => onEncoderChange(e.target.value as EncoderId)} className={`${selectClasses} w-full`}>
              {encoderOptions.map((enc) => (
                <option key={enc.id} value={enc.id}>
                  {enc.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{encoder.whyUseIt}</p>
            {archId === null && (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">This payload has no architecture, so no binary encoders apply.</p>
            )}
          </div>
          <div>
            <label className="mb-1 flex items-center text-sm font-medium">
              Iterations
              <Tooltip text="More iterations means more obfuscation, but slower generation. 2-4 is a typical sweet spot." />
            </label>
            <input
              type="number"
              min={1}
              max={encoder.maxIterations || 1}
              value={iterationsText}
              disabled={encoderId === "none"}
              onChange={(e) => onIterationsChange(e.target.value)}
              className={`${selectClasses} w-full disabled:opacity-40`}
            />
            {encoderId !== "none" && !iterationsValid && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {iterationsText.trim().length === 0
                  ? "Iterations must be at least 1."
                  : `Enter a value between 1 and ${encoder.maxIterations}.`}
              </p>
            )}
          </div>
        </div>
        {liveRisk && (
          <Callout variant="warning">
            This payload has no encoding. Antivirus may detect it. Consider adding an encoder above (x86/shikata_ga_nai is a good default
            on x86; x64/xor_dynamic for x64).
          </Callout>
        )}
      </div>
    </CollapsibleSection>
  );
}
