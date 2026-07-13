import { describe, expect, it } from "vitest";
import {
  clampMaxOutput,
  clampNumberingRange,
  isValidMaxOutput,
  isValidNumberingRange,
  MAX_OUTPUT_CEILING,
  MAX_OUTPUT_DEFAULT,
  MAX_OUTPUT_FLOOR,
  NUMBERING_RANGE_CEILING,
} from "./validation";

describe("max output", () => {
  it("validates within [floor, ceiling]", () => {
    expect(isValidMaxOutput(MAX_OUTPUT_DEFAULT)).toBe(true);
    expect(isValidMaxOutput(MAX_OUTPUT_FLOOR - 1)).toBe(false);
    expect(isValidMaxOutput(MAX_OUTPUT_CEILING + 1)).toBe(false);
    expect(isValidMaxOutput(1.5)).toBe(false);
  });

  it("clamps out-of-range and non-finite values", () => {
    expect(clampMaxOutput(1)).toBe(MAX_OUTPUT_FLOOR);
    expect(clampMaxOutput(MAX_OUTPUT_CEILING + 1_000_000)).toBe(MAX_OUTPUT_CEILING);
    expect(clampMaxOutput(NaN)).toBe(MAX_OUTPUT_DEFAULT);
  });
});

describe("numbering range", () => {
  it("validates ordered, non-negative, bounded ranges", () => {
    expect(isValidNumberingRange(1, 5)).toBe(true);
    expect(isValidNumberingRange(5, 1)).toBe(false);
    expect(isValidNumberingRange(-1, 5)).toBe(false);
    expect(isValidNumberingRange(0, NUMBERING_RANGE_CEILING + 1)).toBe(false);
  });

  it("clamps an inverted or oversized range", () => {
    expect(clampNumberingRange(5, 1)).toEqual({ min: 5, max: 5 });
    expect(clampNumberingRange(0, NUMBERING_RANGE_CEILING + 100)).toEqual({ min: 0, max: NUMBERING_RANGE_CEILING });
  });

  it("floors a negative min at 0", () => {
    expect(clampNumberingRange(-10, 5)).toEqual({ min: 0, max: 5 });
  });
});
