"use client";

import { inputClasses } from "@/components/ui/formClasses";

/** Editable filename field, meant to sit next to a CopyButton/DownloadButton pair — pair with
 *  the useEditableFilename hook so the value tracks a computed default until the user edits it. */
export function FilenameInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Filename for download"
      className={`${inputClasses} w-48 text-xs`}
    />
  );
}
