/** localStorage-backed persistence for client-side rate-limit history (generation timestamps),
 *  shared by the payload generator tools (XSS, SQLi, ...). */

export function loadHistory(key: string): number[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "number") : [];
  } catch {
    return [];
  }
}

export function saveHistory(key: string, history: number[]) {
  try {
    localStorage.setItem(key, JSON.stringify(history));
  } catch {
    // localStorage unavailable (e.g. private browsing quota) — rate limiting just falls
    // back to in-memory only for this tab session, which is an acceptable degradation.
  }
}
