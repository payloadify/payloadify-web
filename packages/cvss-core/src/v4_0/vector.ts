import { Cvss40Metrics } from "./metrics";

/** Base metrics are always included; the Threat metric (E) is only appended when it's not
 *  "Not Defined" (X) — matching the CVSS v4.0 spec's convention of omitting Not Defined
 *  metrics from the vector string representation. */
export function buildCvss40Vector(m: Cvss40Metrics): string {
  const base = `CVSS:4.0/AV:${m.AV}/AC:${m.AC}/AT:${m.AT}/PR:${m.PR}/UI:${m.UI}/VC:${m.VC}/VI:${m.VI}/VA:${m.VA}/SC:${m.SC}/SI:${m.SI}/SA:${m.SA}`;
  return m.E === "X" ? base : `${base}/E:${m.E}`;
}
