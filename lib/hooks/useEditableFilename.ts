"use client";

import { useState } from "react";

// Restricts filenames to characters that are safe to drop unquoted into a shell command —
// this value gets interpolated raw into copy-pasteable resolver commands (see OutputPanel),
// so anything outside this set (spaces, quotes, ;|&$`() etc.) must never reach the field.
const UNSAFE_FILENAME_CHARS_RE = /[^A-Za-z0-9._-]/g;

export function sanitizeFilename(value: string): string {
  return value.replace(UNSAFE_FILENAME_CHARS_RE, "");
}

/** A filename that tracks a computed default (e.g. derived from a domain/keyword input) until
 *  the user types their own — once edited, their choice sticks even if the default changes
 *  afterward. State is adjusted during render rather than in a useEffect to avoid an extra
 *  cascading render (see https://react.dev/learn/you-might-not-need-an-effect). Input is
 *  sanitized to a shell-safe charset since the value is interpolated into copy-pasteable
 *  commands downstream. */
export function useEditableFilename(defaultFilename: string): [string, (value: string) => void] {
  const [state, setState] = useState({ value: defaultFilename, touched: false, lastDefault: defaultFilename });

  if (!state.touched && state.lastDefault !== defaultFilename) {
    setState({ value: defaultFilename, touched: false, lastDefault: defaultFilename });
  }

  function setFilename(value: string) {
    setState((prev) => ({ ...prev, value: sanitizeFilename(value), touched: true }));
  }

  return [state.value, setFilename];
}
