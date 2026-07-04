import { SeverityRating } from "./types";

/** Rating bands are identical for CVSS 3.1 and 4.0 per the FIRST.org specification. */
export function severityRating(score: number): SeverityRating {
  if (score <= 0) return "None";
  if (score < 4.0) return "Low";
  if (score < 7.0) return "Medium";
  if (score < 9.0) return "High";
  return "Critical";
}
