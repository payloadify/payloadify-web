import { JohnSelection } from "./params";

export interface JohnValidation {
  ok: boolean;
  message?: string;
}

/** Checks only what's required to assemble a syntactically complete command — e.g. it doesn't
 *  validate mask syntax or that the hash file path actually exists, since this tool never
 *  touches the user's filesystem and can't know what's actually there. */
export function validateSelection(sel: JohnSelection): JohnValidation {
  const format = sel.customFormat.trim() !== "" ? sel.customFormat.trim() : sel.format;
  if (format.trim().length === 0) return { ok: false, message: "Enter or select a John format." };

  if (sel.hashFile.trim().length === 0) {
    return { ok: false, message: "Enter a hash file path." };
  }

  if (sel.crackMode === "wordlist" && sel.wordlist.trim().length === 0) {
    return { ok: false, message: "Enter a wordlist path." };
  }

  if (sel.crackMode === "mask" && sel.mask.trim().length === 0) {
    return { ok: false, message: "Enter a mask." };
  }

  if (sel.crackMode === "external" && sel.externalMode.trim().length === 0) {
    return { ok: false, message: "Enter an external mode name." };
  }

  if (sel.crackMode === "mask" && sel.minLength.trim() !== "" && sel.maxLength.trim() !== "") {
    const min = Number(sel.minLength);
    const max = Number(sel.maxLength);
    if (min > max) return { ok: false, message: "Min length cannot be greater than max length." };
  }

  return { ok: true };
}
