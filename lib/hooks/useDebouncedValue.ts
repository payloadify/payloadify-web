import { useEffect, useState } from "react";

/** Delays updating the returned value until `value` has stopped changing for `delayMs` —
 *  used so fast typing doesn't trigger an expensive recompute on every keystroke. */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
