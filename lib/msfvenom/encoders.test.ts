import { describe, expect, it } from "vitest";
import { MSFVENOM_ENCODERS, MSFVENOM_ENCODERS_BY_ID, NONE_ENCODER, encodersForArch } from "./encoders";

describe("MSFVENOM_ENCODERS", () => {
  it("has unique ids and includes the none sentinel", () => {
    const ids = MSFVENOM_ENCODERS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("none");
    expect(MSFVENOM_ENCODERS_BY_ID.none).toBe(NONE_ENCODER);
  });

  it("gives the none encoder maxIterations of 0 and every real encoder a positive maxIterations", () => {
    expect(NONE_ENCODER.maxIterations).toBe(0);
    for (const e of MSFVENOM_ENCODERS) {
      if (e.id !== "none") expect(e.maxIterations).toBeGreaterThan(0);
    }
  });

  it("every encoder is reachable via MSFVENOM_ENCODERS_BY_ID", () => {
    for (const e of MSFVENOM_ENCODERS) {
      expect(MSFVENOM_ENCODERS_BY_ID[e.id]).toBe(e);
    }
  });

  it("every non-none encoder id is namespaced by the architecture it encodes (matches msfvenom -l encoders)", () => {
    for (const e of MSFVENOM_ENCODERS) {
      if (e.id === "none") continue;
      expect(e.id.startsWith("x86/") || e.id.startsWith("x64/")).toBe(true);
      expect(e.compatibleArchs).not.toBeNull();
    }
  });
});

describe("encodersForArch", () => {
  it("always includes the none sentinel, for any arch or null", () => {
    expect(encodersForArch("x86").map((e) => e.id)).toContain("none");
    expect(encodersForArch("x64").map((e) => e.id)).toContain("none");
    expect(encodersForArch(null).map((e) => e.id)).toContain("none");
  });

  it("offers x86 encoders only for x86", () => {
    const ids = encodersForArch("x86").map((e) => e.id);
    expect(ids).toContain("x86/shikata_ga_nai");
    expect(ids).toContain("x86/fnstenv_mov");
    expect(ids).toContain("x86/jmp_call_additive");
    expect(ids).toContain("x86/alpha_mixed");
    expect(ids).toContain("x86/alpha_upper");
    expect(ids).toContain("x86/add_sub");
    expect(ids).toContain("x86/bloxor");
    expect(ids).toContain("x86/avoid_underscore_tolower");
    expect(ids).toContain("x86/avoid_utf8_tolower");
    expect(ids).not.toContain("x64/xor_dynamic");
  });

  it("offers x64 encoders only for x64/x86_64", () => {
    for (const arch of ["x64", "x86_64"] as const) {
      const ids = encodersForArch(arch).map((e) => e.id);
      expect(ids).toContain("x64/xor_dynamic");
      expect(ids).toContain("x64/xor");
      expect(ids).toContain("x64/xor_context");
      expect(ids).toContain("x64/zutto_dekiru");
      expect(ids).not.toContain("x86/shikata_ga_nai");
    }
  });

  it("offers only 'none' for archs with no dedicated encoder (e.g. ARM) and for archless payloads", () => {
    expect(encodersForArch("armle").map((e) => e.id)).toEqual(["none"]);
    expect(encodersForArch(null).map((e) => e.id)).toEqual(["none"]);
  });
});
