import { describe, expect, it } from "vitest";
import { findDecodings, plausibilityScore } from "./detect";
import { ENCODING_OPERATIONS_BY_ID } from "../encoding/operations";

const base64Op = ENCODING_OPERATIONS_BY_ID["base64"];
const hexOp = ENCODING_OPERATIONS_BY_ID["hex"];
const rot13Op = ENCODING_OPERATIONS_BY_ID["rot13"];
const binaryOp = ENCODING_OPERATIONS_BY_ID["binary"];

describe("findDecodings", () => {
  it("unwraps Base64-of-Hex-of-plaintext and shows the correct chain", () => {
    const layered = base64Op.encode(hexOp.encode("HELLO"));
    const results = findDecodings(layered);

    expect(results.length).toBeGreaterThan(0);
    const top = results[0];
    expect(top.text).toBe("HELLO");
    expect(top.chain.map((s) => s.operationId)).toEqual(["base64", "hex"]);
    expect(top.chain[0].output).toBe(hexOp.encode("HELLO"));
    expect(top.chain[1].output).toBe("HELLO");
  });

  it("unwraps a ROT13'd sentence back to plaintext", () => {
    const original = "the password is admin and the login is test";
    const rotated = rot13Op.encode(original);
    const results = findDecodings(rotated);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].text).toBe(original);
    expect(results[0].chain.map((s) => s.operationId)).toEqual(["rot13"]);
  });

  it("unwraps binary-encoded ASCII text", () => {
    const layered = binaryOp.encode("HELLO WORLD");
    const results = findDecodings(layered);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].text).toBe("HELLO WORLD");
    expect(results[0].chain.map((s) => s.operationId)).toEqual(["binary"]);
  });

  it("returns no candidates for a random high-entropy string", () => {
    const noise = "xQ9!kZp#2vLm7@Rt$Wj4^Ny8&Bh3*Fc6";
    expect(findDecodings(noise)).toEqual([]);
  });

  it("returns an empty array for empty input", () => {
    expect(findDecodings("")).toEqual([]);
  });

  it("does not surface a ROT13-of-still-encoded-Base64 as a plausible candidate", () => {
    // ROT13 applied directly to Base64-looking text is still letter-heavy but not a real word,
    // it shouldn't beat out (or accompany) the actual Base64 -> Hex -> plaintext chain.
    const layered = base64Op.encode(hexOp.encode("HELLO"));
    const results = findDecodings(layered);
    for (const candidate of results) {
      expect(candidate.text).not.toBe(rot13Op.encode(layered));
    }
  });

  it("does not misreport a plain English sentence as a multi-layer Base64/Hex/Binary decode", () => {
    const results = findDecodings("The quick brown fox jumps over the lazy dog");
    for (const candidate of results) {
      for (const step of candidate.chain) {
        expect(["rot13", "html-entity", "unicode-escape"]).toContain(step.operationId);
      }
    }
  });
});

describe("plausibilityScore", () => {
  it("scores plain English text highly", () => {
    expect(plausibilityScore("the password is admin")).toBeGreaterThanOrEqual(0.7);
  });

  it("rejects empty text", () => {
    expect(plausibilityScore("")).toBe(0);
  });

  it("rejects raw binary noise (low printable ratio)", () => {
    const noisy = String.fromCharCode(1, 2, 3, 255, 254, 0, 6, 7);
    expect(plausibilityScore(noisy)).toBe(0);
  });
});
