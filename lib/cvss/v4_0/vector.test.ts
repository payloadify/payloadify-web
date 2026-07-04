import { describe, expect, it } from "vitest";
import { Cvss40Metrics } from "./metrics";
import { buildCvss40Vector } from "./vector";

describe("buildCvss40Vector", () => {
  it("omits E from the vector string when it is Not Defined (X)", () => {
    const m: Cvss40Metrics = { AV: "N", AC: "L", AT: "N", PR: "N", UI: "N", VC: "H", VI: "H", VA: "H", SC: "N", SI: "N", SA: "N", E: "X" };
    expect(buildCvss40Vector(m)).toBe("CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N");
  });

  it("appends /E:<value> when the Threat metric is defined", () => {
    const m: Cvss40Metrics = { AV: "N", AC: "L", AT: "N", PR: "N", UI: "N", VC: "H", VI: "H", VA: "H", SC: "N", SI: "N", SA: "N", E: "A" };
    expect(buildCvss40Vector(m)).toBe("CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N/E:A");
  });
});
