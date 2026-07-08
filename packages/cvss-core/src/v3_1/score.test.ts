import { describe, expect, it } from "vitest";
import { Cvss31Metrics } from "./metrics";
import { computeCvss31Score, roundUp } from "./score";

describe("roundUp", () => {
  // Exact examples from the CVSS v3.1 specification, Appendix A ("Floating Point Rounding").
  it("rounds 4.02 up to 4.1", () => {
    expect(roundUp(4.02)).toBe(4.1);
  });

  it("leaves an exact tenth (4.00) at 4.0, not 4.1", () => {
    expect(roundUp(4.0)).toBe(4.0);
  });

  it("does not round a floating-point artifact just above an exact tenth up a full 0.1", () => {
    // 4.0000000000000001 is indistinguishable from 4.0 in IEEE754 double precision, but a naive
    // `Math.ceil(x * 10) / 10` on the raw sum could still misfire on nearby artifacts (e.g.
    // 4.000000001) — the integer-arithmetic algorithm must treat this as 4.0.
    expect(roundUp(4.000000001)).toBe(4.0);
  });
});

describe("computeCvss31Score", () => {
  // CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H — a canonical, widely-published 9.8 (Critical)
  // vector (e.g. matches many real-world "unauthenticated RCE" CVE base scores). Hand-verified
  // against the spec formula: ISCBase=0.914816, Impact=5.87311872, Exploitability≈3.887043,
  // sum≈9.760, roundUp→9.8.
  it("scores AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H as 9.8 Critical", () => {
    const m: Cvss31Metrics = { AV: "N", AC: "L", PR: "N", UI: "N", S: "U", C: "H", I: "H", A: "H" };
    const result = computeCvss31Score(m);
    expect(result.baseScore).toBe(9.8);
    expect(result.severity).toBe("Critical");
  });

  // CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H — the published CVE-2021-44228 (Log4Shell)
  // vector, publicly documented as scoring 10.0. Exercises the Scope:Changed branch of both
  // impact() and the final base-score formula (the 1.08 multiplier).
  it("scores AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H as 10.0 Critical", () => {
    const m: Cvss31Metrics = { AV: "N", AC: "L", PR: "N", UI: "N", S: "C", C: "H", I: "H", A: "H" };
    const result = computeCvss31Score(m);
    expect(result.baseScore).toBe(10.0);
    expect(result.severity).toBe("Critical");
  });

  // CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:N/A:N — hand-computed per the spec formula
  // (ISCBase=0.22, Impact=1.4124, Exploitability≈2.8352424, sum≈4.2476, roundUp→4.3) to exercise
  // the Scope:Unchanged branch with mixed C/I/A values and UI:Required.
  it("scores AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:N/A:N as 4.3 Medium", () => {
    const m: Cvss31Metrics = { AV: "N", AC: "L", PR: "N", UI: "R", S: "U", C: "L", I: "N", A: "N" };
    const result = computeCvss31Score(m);
    expect(result.baseScore).toBe(4.3);
    expect(result.severity).toBe("Medium");
  });

  it("scores an all-None impact vector as 0.0 None regardless of exploitability", () => {
    const m: Cvss31Metrics = { AV: "N", AC: "L", PR: "N", UI: "N", S: "U", C: "N", I: "N", A: "N" };
    const result = computeCvss31Score(m);
    expect(result.baseScore).toBe(0);
    expect(result.severity).toBe("None");
  });

  it("caps the Scope:Changed base score at 10.0 even when 1.08x would exceed it", () => {
    const m: Cvss31Metrics = { AV: "N", AC: "L", PR: "N", UI: "N", S: "C", C: "H", I: "H", A: "H" };
    const result = computeCvss31Score(m);
    expect(result.baseScore).toBeLessThanOrEqual(10);
  });
});
