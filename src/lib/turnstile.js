// Shared by the Turnstile widget and the forms that use it.

/** Cloudflare Turnstile site key; the widget shows only when it's set. */
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

/** Turns an edge-function error into the message it carries. */
export async function functionError(error, fallback) {
  try {
    const body = await error?.context?.json?.();
    if (body?.error) return body.error;
  } catch { /* not JSON */ }
  return fallback;
}
