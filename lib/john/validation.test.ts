import { describe, expect, it } from "vitest";
import { JohnSelection } from "./params";
import { validateSelection } from "./validation";

function baseSelection(overrides: Partial<JohnSelection> = {}): JohnSelection {
  return {
    format: "nt",
    customFormat: "",
    hashFile: "hashes.txt",
    handoffHash: "",
    crackMode: "wordlist",
    wordlist: "rockyou.txt",
    rules: "None",
    customRules: "",
    singleSection: "",
    singleSeed: "",
    incrementalMode: "",
    mask: "",
    customCharsets: ["", "", "", ""],
    minLength: "",
    maxLength: "",
    externalMode: "",
    sessionName: "",
    fork: "",
    potFile: "",
    noLog: false,
    ...overrides,
  };
}

describe("validateSelection", () => {
  it("passes for a valid wordlist selection", () => {
    expect(validateSelection(baseSelection())).toEqual({ ok: true });
  });

  it("fails when the hash file is empty", () => {
    const result = validateSelection(baseSelection({ hashFile: "  " }));
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/hash file/i);
  });

  it("fails when neither format dropdown nor custom format is set", () => {
    const result = validateSelection(baseSelection({ format: "", customFormat: "" }));
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/format/i);
  });

  it("passes when only the custom format is set", () => {
    const result = validateSelection(baseSelection({ format: "", customFormat: "raw-sha256" }));
    expect(result.ok).toBe(true);
  });

  it("fails when wordlist mode has no wordlist path", () => {
    const result = validateSelection(baseSelection({ wordlist: "" }));
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/wordlist/i);
  });

  it("passes for single crack mode with no extra fields", () => {
    const result = validateSelection(baseSelection({ crackMode: "single", wordlist: "" }));
    expect(result.ok).toBe(true);
  });

  it("passes for incremental mode with no extra fields", () => {
    const result = validateSelection(baseSelection({ crackMode: "incremental", wordlist: "" }));
    expect(result.ok).toBe(true);
  });

  it("fails when mask mode has no mask", () => {
    const result = validateSelection(baseSelection({ crackMode: "mask", wordlist: "" }));
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/mask/i);
  });

  it("fails when external mode has no mode name", () => {
    const result = validateSelection(baseSelection({ crackMode: "external", wordlist: "" }));
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/external mode/i);
  });

  it("fails when mask min length is greater than max length", () => {
    const result = validateSelection(
      baseSelection({ crackMode: "mask", wordlist: "", mask: "?d?d?d?d", minLength: "10", maxLength: "4" }),
    );
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/length/i);
  });

  it("fails when a pasted non-numeric value ends up in min/max length", () => {
    const result = validateSelection(
      baseSelection({ crackMode: "mask", wordlist: "", mask: "?d?d?d?d", minLength: "abc", maxLength: "4" }),
    );
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/number/i);
  });
});
