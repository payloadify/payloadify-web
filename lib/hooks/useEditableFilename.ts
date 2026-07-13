"use client";

import { useState } from "react";

/** A filename that tracks a computed default (e.g. derived from a domain/keyword input) until
 *  the user types their own — once edited, their choice sticks even if the default changes
 *  afterward. State is adjusted during render rather than in a useEffect to avoid an extra
 *  cascading render (see https://react.dev/learn/you-might-not-need-an-effect). */
export function useEditableFilename(defaultFilename: string): [string, (value: string) => void] {
  const [state, setState] = useState({ value: defaultFilename, touched: false, lastDefault: defaultFilename });

  if (!state.touched && state.lastDefault !== defaultFilename) {
    setState({ value: defaultFilename, touched: false, lastDefault: defaultFilename });
  }

  function setFilename(value: string) {
    setState((prev) => ({ ...prev, value, touched: true }));
  }

  return [state.value, setFilename];
}
