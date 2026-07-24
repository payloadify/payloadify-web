import { ReactNode } from "react";
import { Callout } from "@/components/ui/Callout";

/** Canonical trust-signal copy, consolidating the ~7 near-duplicate strings that used to be
 *  hand-typed per tool. `children`, if given, appends tool-specific detail after the canonical
 *  sentence rather than replacing it (e.g. the Subdomain Permutation Generator's "never queries
 *  DNS" note, which is specific to that tool and worth keeping). */
export function RunsLocallyNote({
  variant = "inline",
  children,
}: {
  variant?: "inline" | "callout";
  children?: ReactNode;
}) {
  const text = "Computed entirely in your browser. Nothing here is sent to a server.";

  if (variant === "callout") {
    return (
      <Callout variant="info">
        {text}
        {children && <> {children}</>}
      </Callout>
    );
  }

  return (
    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
      {text}
      {children && <> {children}</>}
    </p>
  );
}
