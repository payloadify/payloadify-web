"use client";

import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { Tooltip } from "@/components/ui/Tooltip";
import { inputClasses, selectClasses } from "@/components/ui/formClasses";
import { MsfvenomPayload } from "@/lib/msfvenom/payloads";
import { ExitfuncId } from "@/lib/msfvenom/params";

const EXITFUNC_OPTIONS: { id: ExitfuncId; label: string; whyUseIt: string }[] = [
  { id: "thread", label: "thread (default, stealthy)", whyUseIt: "Exits via thread; the host process stays running, which is less noisy than killing it outright." },
  { id: "process", label: "process (kills the process)", whyUseIt: "Kills the entire host process on exit. Obvious and noisy, but simple." },
  { id: "seh", label: "seh (legacy)", whyUseIt: "Exits via SEH, an older, less commonly used exit technique." },
];

export function AdvancedOptionsPanel({
  payload,
  onToggleStaging,
  exitfunc,
  onExitfuncChange,
  filename,
  needsFilename,
  filenameValid,
  onFilenameChange,
  extraOptions,
  onExtraOptionsChange,
}: {
  payload: MsfvenomPayload;
  onToggleStaging: () => void;
  exitfunc: ExitfuncId | null;
  onExitfuncChange: (id: ExitfuncId) => void;
  filename: string;
  needsFilename: boolean;
  filenameValid: boolean;
  onFilenameChange: (text: string) => void;
  extraOptions: string;
  onExtraOptionsChange: (text: string) => void;
}) {
  return (
    <CollapsibleSection title="Advanced Options" storageKey="payloadify:msfvenom-generator:advanced-collapsed" defaultOpen={false}>
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 flex items-center text-sm font-medium">
              Staging
              <Tooltip text="Staged payloads are a small initial dropper that downloads the rest on connection. Stageless payloads embed everything in one file." />
            </label>
            {payload.stagingSiblingId ? (
              <button type="button" onClick={onToggleStaging} className={`${selectClasses} w-full text-left`}>
                {payload.staging === "staged" ? "Staged (click to switch to stageless)" : "Stageless (click to switch to staged)"}
              </button>
            ) : (
              <input value={payload.staging === "staged" ? "Staged" : "Stageless"} disabled className={`${selectClasses} w-full opacity-50`} />
            )}
          </div>
          <div>
            <label className="mb-1 flex items-center text-sm font-medium">
              EXITFUNC
              <Tooltip text="Windows-only. Controls how the payload's process exits when the session ends." />
            </label>
            <select
              value={exitfunc ?? ""}
              onChange={(e) => onExitfuncChange(e.target.value as ExitfuncId)}
              disabled={!payload.supportsExitfunc}
              className={`${selectClasses} w-full disabled:opacity-40`}
            >
              {EXITFUNC_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Filename</label>
          <input
            type="text"
            value={filename}
            disabled={!needsFilename}
            onChange={(e) => onFilenameChange(e.target.value)}
            className={`${inputClasses} disabled:opacity-40`}
          />
          {needsFilename && filename.length > 0 && !filenameValid && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              Filename can only contain letters, numbers, dots, hyphens, and underscores.
            </p>
          )}
          {!needsFilename && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">This format prints to the console; no -o filename is generated.</p>
          )}
        </div>

        <div>
          <label className="mb-1 flex items-center text-sm font-medium">
            Extra payload options
            <Tooltip text="Free text, appended verbatim before -o. E.g. AutoLoadingUser=true, or -B '\x00\x0a\x0d' to exclude bad characters." />
          </label>
          <input
            type="text"
            value={extraOptions}
            onChange={(e) => onExtraOptionsChange(e.target.value)}
            placeholder="AutoLoadingUser=true"
            className={inputClasses}
          />
        </div>
      </div>
    </CollapsibleSection>
  );
}
