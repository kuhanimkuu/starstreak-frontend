import { useCallback, useRef, useState } from "react";
import { TURNSTILE_SITE_KEY } from "./turnstile";

// Turnstile token for Supabase Auth (sign-up, sign-in, password reset).
// Supabase checks it when CAPTCHA protection is on (Authentication > Attack
// Protection); until then it's ignored. Render
//   <Turnstile key={captcha.captchaKey} onToken={captcha.onToken} />
// then `await captcha.getToken()` before the auth call and `captcha.used()`
// after it: a token works once, so used() shows a fresh check.
export function useCaptcha() {
  const [attempt, setAttempt] = useState(0);
  const token = useRef("");
  const waiting = useRef([]);

  const onToken = useCallback((t) => {
    token.current = t || "";
    if (t) waiting.current.splice(0).forEach((resolve) => resolve(t));
  }, []);

  /** The token, waiting up to `ms` for the check; undefined if it never came (the server decides). */
  const getToken = useCallback((ms = 8000) => {
    if (!TURNSTILE_SITE_KEY) return Promise.resolve(undefined);
    if (token.current) return Promise.resolve(token.current);
    return new Promise((resolve) => {
      waiting.current.push(resolve);
      setTimeout(() => resolve(undefined), ms);
    });
  }, []);

  const used = useCallback(() => {
    token.current = "";
    setAttempt((a) => a + 1);
  }, []);

  return { captchaKey: attempt, onToken, getToken, used };
}

/** Supabase's error when the check was missing, used or failed. */
export function isCaptchaError(err) {
  return /captcha/i.test(err?.message || "");
}

export const CAPTCHA_ERROR = "The security check didn't go through. Wait for it to finish, then try again.";
