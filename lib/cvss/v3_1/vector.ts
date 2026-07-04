import { Cvss31Metrics } from "./metrics";

export function buildCvss31Vector(m: Cvss31Metrics): string {
  return `CVSS:3.1/AV:${m.AV}/AC:${m.AC}/PR:${m.PR}/UI:${m.UI}/S:${m.S}/C:${m.C}/I:${m.I}/A:${m.A}`;
}
