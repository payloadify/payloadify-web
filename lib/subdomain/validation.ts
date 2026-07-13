export const MAX_OUTPUT_DEFAULT = 10_000;
export const MAX_OUTPUT_FLOOR = 100;
// Not a browser API limit (V8 strings/arrays handle far more) — this is an empirically
// benchmarked UX ceiling. Setting a large deduped string list into the output <textarea> and
// forcing reflow dominates the cost: ~1.4s of main-thread blocking at 200k, ~3.8s at 500k,
// ~7.4s at 1M, and ~28s at 2M (measured in headless Chromium; slower/mobile hardware will be
// worse). 200k is the point past which a single click starts risking a visibly frozen tab.
export const MAX_OUTPUT_CEILING = 200_000;

export function isValidMaxOutput(value: number): boolean {
  return Number.isInteger(value) && value >= MAX_OUTPUT_FLOOR && value <= MAX_OUTPUT_CEILING;
}

export function clampMaxOutput(value: number): number {
  if (!Number.isFinite(value)) return MAX_OUTPUT_DEFAULT;
  return Math.min(MAX_OUTPUT_CEILING, Math.max(MAX_OUTPUT_FLOOR, Math.round(value)));
}

// Caps the min-max span so a user can't accidentally request e.g. 0..999999.
export const NUMBERING_RANGE_CEILING = 500;

export function isValidNumberingRange(min: number, max: number): boolean {
  return (
    Number.isInteger(min) &&
    Number.isInteger(max) &&
    min >= 0 &&
    max >= min &&
    max - min <= NUMBERING_RANGE_CEILING
  );
}

export function clampNumberingRange(min: number, max: number): { min: number; max: number } {
  const clampedMin = Number.isFinite(min) ? Math.max(0, Math.round(min)) : 0;
  const clampedMaxRaw = Number.isFinite(max) ? Math.round(max) : clampedMin;
  const clampedMax = Math.max(clampedMin, Math.min(clampedMaxRaw, clampedMin + NUMBERING_RANGE_CEILING));
  return { min: clampedMin, max: clampedMax };
}
