/**
 * Defensive error stringifier — prevents the "[object Object]" toast.
 *
 * The naive idiom `err instanceof Error ? err.message : String(err)` produces
 * a literal "[object Object]" string when `err` is a plain object that doesn't
 * subclass Error. Supabase's PostgrestError is exactly this — a plain
 * `{ message, details, hint, code }` object, NOT an Error instance — which is
 * why /account/referrals shipped showing "Something went wrong [object Object]"
 * when the referrals tables didn't exist (BUG-3).
 *
 * This helper unwraps the most common shapes we encounter:
 *   1. Real Error  → .message
 *   2. PostgrestError-like → .message, fallback .details, fallback `code=…`
 *   3. Plain string → as-is
 *   4. Anything else → JSON.stringify (so you at least see structure, not
 *      "[object Object]")
 *
 * Always pair with `console.error(prefix, err)` so the original object is
 * still inspectable in the logs. The string returned by this helper is what
 * we render in toasts / API JSON responses.
 */
export function stringifyUnknownError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    if (typeof e.message === "string" && e.message) return e.message;
    if (typeof e.details === "string" && e.details) return e.details;
    if (typeof e.hint === "string" && e.hint) return e.hint;
    if (typeof e.code === "string" && e.code) return `code=${e.code}`;
    try {
      // Drop circular refs and depth-bound; we just want a glance, not full
      // serialization. JSON.stringify with replacer is fine for our shapes.
      const json = JSON.stringify(err);
      if (json && json !== "{}") return json;
    } catch {
      // fall through
    }
  }
  return String(err);
}
