import { describe, expect, it } from "vitest";
import { findDecodings, guessNextLayer, plausibilityScore } from "./detect";
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

  it("stops at a confident plaintext match instead of grinding on to the depth cap", () => {
    // Base64(Hex(sentence)) is only 2 real layers, the search should stop once it finds the
    // sentence rather than continuing to explore past it up to maxDepth.
    const layered = base64Op.encode(hexOp.encode("the password is admin and the login is test"));
    const results = findDecodings(layered, 4);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].chain).toHaveLength(2);
  });

  it("does not present a short wrong guess (ROT13-of-Base64) as a confident decode", () => {
    // Regression test: short pure-letter decode results used to auto-score 1.0 regardless of
    // whether they were real words, so a coincidental ROT13-of-Base64 result could outrank (or
    // stand in for) the real decode. "QWJjMTIz" is Base64 for "Abc123", neither the real decode
    // (has digits, so it's not pure letters) nor the ROT13-of-Base64 wrong guess should surface.
    const results = findDecodings(base64Op.encode("Abc123"));
    expect(results).toEqual([]);
  });

  it("respects a custom maxDepth beyond the default of 4 (Advanced setting)", () => {
    // 5 real layers, unreachable within the default depth-4 cap.
    const layered = base64Op.encode(hexOp.encode(base64Op.encode(hexOp.encode(base64Op.encode("HELLO")))));
    expect(findDecodings(layered, 4)).toEqual([]);
    const deeper = findDecodings(layered, 8);
    expect(deeper.length).toBeGreaterThan(0);
    expect(deeper[0].text).toBe("HELLO");
    expect(deeper[0].chain).toHaveLength(5);
  });
});

describe("guessNextLayer", () => {
  it("ranks a real decode above a wrong guess for the same input", () => {
    const guesses = guessNextLayer(hexOp.encode("HELLO"));
    expect(guesses.length).toBeGreaterThan(0);
    expect(guesses[0].operationId).toBe("hex");
    expect(guesses[0].output).toBe("HELLO");
  });

  it("returns no-op-free guesses for random noise, letting the caller show 'nothing found'", () => {
    const guesses = guessNextLayer("xQ9!kZp#2vLm7@Rt$Wj4^Ny8&Bh3*Fc6");
    for (const guess of guesses) {
      expect(guess.output).not.toBe("xQ9!kZp#2vLm7@Rt$Wj4^Ny8&Bh3*Fc6");
    }
  });

  it("returns an empty array for empty input", () => {
    expect(guessNextLayer("")).toEqual([]);
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
