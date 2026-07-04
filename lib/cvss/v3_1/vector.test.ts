import { describe, expect, it } from "vitest";
import { Cvss31Metrics } from "./metrics";
import { buildCvss31Vector } from "./vector";

describe("buildCvss31Vector", () => {
  it("builds a well-formed CVSS 3.1 vector string in the spec's canonical metric order", () => {
    const m: Cvss31Metrics = { AV: "N", AC: "L", PR: "N", UI: "N", S: "U", C: "H", I: "H", A: "H" };
    expect(buildCvss31Vector(m)).toBe("CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H");
  });
});
